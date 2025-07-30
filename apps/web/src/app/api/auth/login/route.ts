// 用户登录API

import { NextRequest, NextResponse } from 'next/server'
import { LoginRequest, AuthResponse } from '@/types/auth'
import { UserStatus } from '@/types/user'
import { userOperations } from '@/data/users'
import { verifyPassword } from '@/lib/auth/password'
import { generateTokenPair, createSessionId } from '@/lib/auth/jwt'
import { isMFAEnabled, sendSMSCode, sendEmailCode, createMFAChallenge } from '@/lib/auth/mfa'

// 登录尝试跟踪（生产环境应使用Redis）
const loginAttempts = new Map<string, {
  count: number
  lastAttempt: Date
  lockedUntil?: Date
}>()

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15分钟

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // 验证必填字段
    if (!body.identifier || !body.password) {
      return NextResponse.json({
        success: false,
        message: 'Email/username and password are required',
        error: 'MISSING_CREDENTIALS'
      } as AuthResponse, { status: 400 })
    }

    // 检查IP锁定
    const ipAttempts = loginAttempts.get(clientIP)
    if (ipAttempts?.lockedUntil && ipAttempts.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((ipAttempts.lockedUntil.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        error: 'IP_LOCKED'
      } as AuthResponse, { status: 429 })
    }

    // 查找用户
    const user = userOperations.getUserByEmail(body.identifier) || 
                 userOperations.getUserByUsername(body.identifier)

    if (!user) {
      // 记录失败尝试
      recordFailedAttempt(clientIP)
      
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      } as AuthResponse, { status: 401 })
    }

    // 检查用户状态
    if (user.status === UserStatus.BANNED) {
      return NextResponse.json({
        success: false,
        message: 'Account has been banned',
        error: 'ACCOUNT_BANNED'
      } as AuthResponse, { status: 403 })
    }

    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json({
        success: false,
        message: 'Account has been suspended',
        error: 'ACCOUNT_SUSPENDED'
      } as AuthResponse, { status: 403 })
    }

    // 检查用户锁定
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json({
        success: false,
        message: `Account is locked. Try again in ${remainingTime} minutes.`,
        error: 'ACCOUNT_LOCKED'
      } as AuthResponse, { status: 423 })
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(body.password, user.passwordHash)
    
    if (!isPasswordValid) {
      // 增加失败尝试次数
      const newFailedAttempts = user.failedLoginAttempts + 1
      let updateData: any = {
        failedLoginAttempts: newFailedAttempts
      }

      // 如果达到最大尝试次数，锁定账户
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
      }

      userOperations.updateUser(user.id, updateData)
      recordFailedAttempt(clientIP)

      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      } as AuthResponse, { status: 401 })
    }

    // 检查邮箱验证
    if (!user.emailVerified && user.status === UserStatus.PENDING_VERIFICATION) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email address before logging in',
        error: 'EMAIL_NOT_VERIFIED',
        data: {
          userId: user.id,
          email: user.email
        }
      } as AuthResponse, { status: 403 })
    }

    // 检查是否需要MFA
    const mfaEnabled = isMFAEnabled(user.id)
    if (mfaEnabled) {
      // 创建MFA挑战
      const mfaChallenge = createMFAChallenge(user.id, user.security.twoFactorMethod || 'email')
      
      // 发送验证码
      if (user.security.twoFactorMethod === 'sms' && user.phone) {
        await sendSMSCode(user.phone, user.id)
      } else if (user.security.twoFactorMethod === 'email') {
        await sendEmailCode(user.email, user.id)
      }

      return NextResponse.json({
        success: false,
        message: 'Two-factor authentication required',
        error: 'MFA_REQUIRED',
        data: {
          challengeId: mfaChallenge.challengeId,
          method: mfaChallenge.method,
          maskedContact: user.security.twoFactorMethod === 'sms' 
            ? maskPhone(user.phone || '') 
            : maskEmail(user.email)
        }
      } as AuthResponse, { status: 200 })
    }

    // 登录成功，清除失败尝试
    clearFailedAttempts(clientIP)
    
    // 更新用户登录信息
    const now = new Date()
    userOperations.updateUser(user.id, {
      lastLoginAt: now,
      lastActiveAt: now,
      loginCount: user.loginCount + 1,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      status: user.status === UserStatus.PENDING_VERIFICATION ? UserStatus.ACTIVE : user.status
    })

    // 生成会话和令牌
    const sessionId = createSessionId()
    const authUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.profile.displayName,
      avatar: user.profile.avatar,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.security.twoFactorEnabled,
      dealerId: user.dealerId,
      preferences: {
        language: user.preferences.language,
        timezone: user.preferences.timezone,
        currency: user.preferences.currency,
        theme: user.preferences.theme
      },
      lastLoginAt: now
    }

    const tokens = generateTokenPair(authUser, sessionId)

    // 记录登录日志
    console.log(`User ${user.username} logged in from ${clientIP}`)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: authUser,
        ...tokens
      }
    } as AuthResponse, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    } as AuthResponse, { status: 500 })
  }
}

// 记录失败尝试
function recordFailedAttempt(ip: string) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date() }
  attempts.count++
  attempts.lastAttempt = new Date()

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
  }

  loginAttempts.set(ip, attempts)
}

// 清除失败尝试
function clearFailedAttempts(ip: string) {
  loginAttempts.delete(ip)
}

// 掩码邮箱
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return email
  
  const maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
  return `${maskedLocal}@${domain}`
}

// 掩码手机号
function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone
  
  const start = phone.substring(0, 3)
  const end = phone.substring(phone.length - 2)
  const middle = '*'.repeat(phone.length - 5)
  
  return `${start}${middle}${end}`
}

// 获取登录配置
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      lockoutDuration: LOCKOUT_DURATION / 1000 / 60, // 分钟
      mfaEnabled: true,
      socialLoginEnabled: false,
      rememberMeEnabled: true,
      passwordResetEnabled: true
    }
  })
}
