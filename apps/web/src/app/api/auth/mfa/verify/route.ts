// MFA验证API

import { NextRequest, NextResponse } from 'next/server'
import { TwoFactorVerifyRequest, AuthResponse } from '@/types/auth'
import { userOperations } from '@/data/users'
import { verifyMFAChallenge, verifyBackupCode } from '@/lib/auth/mfa'
import { generateTokenPair, createSessionId } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body: TwoFactorVerifyRequest = await request.json()

    // 验证必填字段
    if (!body.userId || !body.code || !body.method) {
      return NextResponse.json({
        success: false,
        message: 'User ID, code, and method are required',
        error: 'MISSING_FIELDS'
      } as AuthResponse, { status: 400 })
    }

    // 查找用户
    const user = userOperations.getUserById(body.userId)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      } as AuthResponse, { status: 404 })
    }

    let verificationResult: { success: boolean; error?: string }

    // 检查是否是备用代码
    if (body.code.length === 8 && /^[A-F0-9]+$/.test(body.code.toUpperCase())) {
      verificationResult = {
        success: verifyBackupCode(body.userId, body.code)
      }
      if (!verificationResult.success) {
        verificationResult.error = 'Invalid backup code'
      }
    } else {
      // 验证MFA代码
      verificationResult = await verifyMFAChallenge(
        `mfa_${body.userId}_challenge`,
        body.userId,
        body.code,
        body.method
      )
    }

    if (!verificationResult.success) {
      return NextResponse.json({
        success: false,
        message: verificationResult.error || 'Invalid verification code',
        error: 'INVALID_CODE'
      } as AuthResponse, { status: 401 })
    }

    // MFA验证成功，更新用户信息
    const now = new Date()
    userOperations.updateUser(user.id, {
      lastLoginAt: now,
      lastActiveAt: now,
      loginCount: user.loginCount + 1,
      failedLoginAttempts: 0
    })

    // 如果选择记住设备，添加到可信设备列表
    if (body.rememberDevice) {
      const deviceInfo = {
        id: `device_${Date.now()}`,
        name: 'Unknown Device', // 可以从User-Agent解析
        deviceType: 'desktop' as const,
        browser: 'Unknown',
        os: 'Unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        lastUsed: now,
        addedAt: now
      }

      const updatedTrustedDevices = [...user.security.trustedDevices, deviceInfo]
      userOperations.updateUser(user.id, {
        security: {
          ...user.security,
          trustedDevices: updatedTrustedDevices
        }
      })
    }

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

    // 记录成功的MFA验证
    console.log(`MFA verification successful for user ${user.username}`)

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication successful',
      data: {
        user: authUser,
        ...tokens
      }
    } as AuthResponse, { status: 200 })

  } catch (error) {
    console.error('MFA verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    } as AuthResponse, { status: 500 })
  }
}

// 重新发送MFA代码
export async function PUT(request: NextRequest) {
  try {
    const { userId, method } = await request.json()

    if (!userId || !method) {
      return NextResponse.json({
        success: false,
        message: 'User ID and method are required',
        error: 'MISSING_FIELDS'
      }, { status: 400 })
    }

    // 查找用户
    const user = userOperations.getUserById(userId)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 发送新的验证码
    let sent = false
    if (method === 'sms' && user.phone) {
      const { sendSMSCode } = await import('@/lib/auth/mfa')
      sent = await sendSMSCode(user.phone, user.id)
    } else if (method === 'email') {
      const { sendEmailCode } = await import('@/lib/auth/mfa')
      sent = await sendEmailCode(user.email, user.id)
    }

    if (!sent) {
      return NextResponse.json({
        success: false,
        message: 'Failed to send verification code',
        error: 'SEND_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('MFA resend error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
