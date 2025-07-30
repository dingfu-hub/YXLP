// 用户注册API

import { NextRequest, NextResponse } from 'next/server'
import { RegisterRequest, AuthResponse } from '@/types/auth'
import { User, UserRole, UserStatus } from '@/types/user'
import { userOperations } from '@/data/users'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { generateTokenPair } from '@/lib/auth/jwt'
import { createSessionId } from '@/lib/auth/jwt'
import { detectUserPreferences } from '@/lib/i18n/utils'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    
    // 验证必填字段
    const requiredFields = ['email', 'username', 'password', 'confirmPassword', 'firstName', 'lastName']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`,
          error: 'VALIDATION_ERROR'
        } as AuthResponse, { status: 400 })
      }
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL'
      } as AuthResponse, { status: 400 })
    }

    // 验证用户名格式
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(body.username)) {
      return NextResponse.json({
        success: false,
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
        error: 'INVALID_USERNAME'
      } as AuthResponse, { status: 400 })
    }

    // 验证密码
    if (body.password !== body.confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Passwords do not match',
        error: 'PASSWORD_MISMATCH'
      } as AuthResponse, { status: 400 })
    }

    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Password does not meet requirements',
        error: 'WEAK_PASSWORD',
        data: {
          errors: passwordValidation.errors,
          suggestions: passwordValidation.suggestions
        }
      } as AuthResponse, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = userOperations.getUserByEmail(body.email)
    if (existingUserByEmail) {
      return NextResponse.json({
        success: false,
        message: 'Email already exists',
        error: 'EMAIL_EXISTS'
      } as AuthResponse, { status: 409 })
    }

    // 检查用户名是否已存在
    const existingUserByUsername = userOperations.getUserByUsername(body.username)
    if (existingUserByUsername) {
      return NextResponse.json({
        success: false,
        message: 'Username already exists',
        error: 'USERNAME_EXISTS'
      } as AuthResponse, { status: 409 })
    }

    // 检查手机号是否已存在（如果提供）
    if (body.phone) {
      const existingUserByPhone = userOperations.getUserByPhone(body.phone)
      if (existingUserByPhone) {
        return NextResponse.json({
          success: false,
          message: 'Phone number already exists',
          error: 'PHONE_EXISTS'
        } as AuthResponse, { status: 409 })
      }
    }

    // 验证角色权限
    if (body.role && body.role !== UserRole.END_USER) {
      // 只有超级管理员可以创建其他角色的用户
      // 这里应该检查当前用户的权限
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to create this role',
        error: 'INSUFFICIENT_PERMISSIONS'
      } as AuthResponse, { status: 403 })
    }

    // 验证条款同意
    if (!body.acceptTerms || !body.acceptPrivacy) {
      return NextResponse.json({
        success: false,
        message: 'Must accept terms and privacy policy',
        error: 'TERMS_NOT_ACCEPTED'
      } as AuthResponse, { status: 400 })
    }

    // 哈希密码
    const passwordHash = await hashPassword(body.password)

    // 检测用户偏好
    const userPreferences = detectUserPreferences()

    // 创建用户
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: body.email.toLowerCase(),
      emailVerified: false,
      phone: body.phone,
      phoneVerified: false,
      username: body.username.toLowerCase(),
      passwordHash,
      profile: {
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: `${body.firstName} ${body.lastName}`,
        addresses: []
      },
      role: body.role || UserRole.END_USER,
      permissions: [], // 将在创建后设置
      preferences: {
        language: userPreferences.locale,
        timezone: userPreferences.timezone,
        currency: userPreferences.currency,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        theme: 'light',
        notifications: {
          email: {
            marketing: body.marketingConsent || false,
            orderUpdates: true,
            securityAlerts: true,
            systemNotifications: false
          },
          sms: {
            orderUpdates: true,
            securityAlerts: true,
            marketingPromotions: body.marketingConsent || false
          },
          push: {
            orderUpdates: true,
            chatMessages: false,
            promotions: body.marketingConsent || false
          }
        },
        privacy: {
          profileVisibility: 'private',
          showOnlineStatus: false,
          allowSearchByEmail: false,
          allowSearchByPhone: false,
          dataProcessingConsent: true,
          marketingConsent: body.marketingConsent || false,
          analyticsConsent: true
        }
      },
      security: {
        twoFactorEnabled: false,
        trustedDevices: [],
        loginNotifications: true,
        sessionTimeout: 120, // 2 hours for end users
        passwordLastChanged: new Date()
      },
      status: UserStatus.PENDING_VERIFICATION,
      loginCount: 0,
      failedLoginAttempts: 0,
      dealerId: body.dealerId,
      metadata: {
        source: 'registration',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        registrationConsent: {
          terms: body.acceptTerms,
          privacy: body.acceptPrivacy,
          marketing: body.marketingConsent || false,
          timestamp: new Date()
        }
      }
    }

    // 保存用户
    const createdUser = userOperations.createUser(newUser)

    // 设置用户权限
    const { getEffectivePermissions } = await import('@/lib/auth/jwt')
    createdUser.permissions = getEffectivePermissions(createdUser.role)
    userOperations.updateUser(createdUser.id, { permissions: createdUser.permissions })

    // 生成会话和令牌
    const sessionId = createSessionId()
    const authUser = {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      displayName: createdUser.profile.displayName,
      avatar: createdUser.profile.avatar,
      role: createdUser.role,
      permissions: createdUser.permissions,
      status: createdUser.status,
      emailVerified: createdUser.emailVerified,
      phoneVerified: createdUser.phoneVerified,
      twoFactorEnabled: createdUser.security.twoFactorEnabled,
      dealerId: createdUser.dealerId,
      preferences: {
        language: createdUser.preferences.language,
        timezone: createdUser.preferences.timezone,
        currency: createdUser.preferences.currency,
        theme: createdUser.preferences.theme
      }
    }

    const tokens = generateTokenPair(authUser, sessionId)

    // 这里应该发送验证邮件
    console.log(`Verification email should be sent to: ${createdUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: authUser,
        ...tokens
      }
    } as AuthResponse, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    } as AuthResponse, { status: 500 })
  }
}

// 获取注册配置
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      availableRoles: [UserRole.END_USER], // 普通注册只能选择终端用户
      supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
      supportedCurrencies: ['USD', 'CNY', 'JPY', 'KRW'],
      termsVersion: '1.0',
      privacyVersion: '1.0'
    }
  })
}
