// 多因素认证 (MFA) 系统

import crypto from 'crypto'
import { authenticator } from 'otplib'

// MFA 配置
const MFA_CONFIG = {
  codeLength: 6,
  codeExpiry: 300, // 5分钟
  maxAttempts: 3,
  lockoutDuration: 900, // 15分钟
  backupCodesCount: 10,
  issuer: 'YXLP Platform'
}

// 验证码存储（生产环境应使用Redis）
const verificationCodes = new Map<string, {
  code: string
  method: 'sms' | 'email' | 'authenticator'
  userId: string
  expiresAt: Date
  attempts: number
  createdAt: Date
}>()

// 用户MFA状态存储
const userMFAStatus = new Map<string, {
  enabled: boolean
  method: 'sms' | 'email' | 'authenticator'
  secret?: string
  backupCodes?: string[]
  phone?: string
  email?: string
  lastUsed?: Date
}>()

// 生成随机验证码
export function generateVerificationCode(length: number = MFA_CONFIG.codeLength): string {
  const digits = '0123456789'
  let code = ''
  
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  
  return code
}

// 生成备用代码
export function generateBackupCodes(count: number = MFA_CONFIG.backupCodesCount): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  
  return codes
}

// 生成TOTP密钥
export function generateTOTPSecret(userId: string, email: string): {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
} {
  const secret = authenticator.generateSecret()
  const service = MFA_CONFIG.issuer
  const account = email
  
  const qrCodeUrl = authenticator.keyuri(account, service, secret)
  
  return {
    secret,
    qrCodeUrl,
    manualEntryKey: secret
  }
}

// 验证TOTP代码
export function verifyTOTPCode(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return false
  }
}

// 发送短信验证码
export async function sendSMSCode(phone: string, userId: string): Promise<boolean> {
  try {
    const code = generateVerificationCode()
    const codeId = `sms_${userId}_${Date.now()}`
    
    // 存储验证码
    verificationCodes.set(codeId, {
      code,
      method: 'sms',
      userId,
      expiresAt: new Date(Date.now() + MFA_CONFIG.codeExpiry * 1000),
      attempts: 0,
      createdAt: new Date()
    })
    
    // 这里应该调用短信服务API发送验证码
    console.log(`SMS Code for ${phone}: ${code}`)
    
    // 模拟发送成功
    return true
  } catch (error) {
    console.error('Failed to send SMS code:', error)
    return false
  }
}

// 发送邮件验证码
export async function sendEmailCode(email: string, userId: string): Promise<boolean> {
  try {
    const code = generateVerificationCode()
    const codeId = `email_${userId}_${Date.now()}`
    
    // 存储验证码
    verificationCodes.set(codeId, {
      code,
      method: 'email',
      userId,
      expiresAt: new Date(Date.now() + MFA_CONFIG.codeExpiry * 1000),
      attempts: 0,
      createdAt: new Date()
    })
    
    // 这里应该调用邮件服务API发送验证码
    console.log(`Email Code for ${email}: ${code}`)
    
    // 模拟发送成功
    return true
  } catch (error) {
    console.error('Failed to send email code:', error)
    return false
  }
}

// 验证验证码
export function verifyCode(
  userId: string,
  code: string,
  method: 'sms' | 'email' | 'authenticator'
): { success: boolean; error?: string } {
  // 查找用户的验证码
  const userCodes = Array.from(verificationCodes.entries()).filter(
    ([_, data]) => data.userId === userId && data.method === method
  )
  
  if (userCodes.length === 0) {
    return { success: false, error: 'No verification code found' }
  }
  
  // 获取最新的验证码
  const [codeId, codeData] = userCodes[userCodes.length - 1]
  
  // 检查是否过期
  if (codeData.expiresAt < new Date()) {
    verificationCodes.delete(codeId)
    return { success: false, error: 'Verification code expired' }
  }
  
  // 检查尝试次数
  if (codeData.attempts >= MFA_CONFIG.maxAttempts) {
    verificationCodes.delete(codeId)
    return { success: false, error: 'Too many attempts' }
  }
  
  // 验证代码
  let isValid = false
  
  if (method === 'authenticator') {
    const userMFA = userMFAStatus.get(userId)
    if (userMFA?.secret) {
      isValid = verifyTOTPCode(userMFA.secret, code)
    }
  } else {
    isValid = codeData.code === code
  }
  
  // 更新尝试次数
  codeData.attempts++
  
  if (isValid) {
    verificationCodes.delete(codeId)
    
    // 更新最后使用时间
    const userMFA = userMFAStatus.get(userId)
    if (userMFA) {
      userMFA.lastUsed = new Date()
    }
    
    return { success: true }
  } else {
    return { success: false, error: 'Invalid verification code' }
  }
}

// 验证备用代码
export function verifyBackupCode(userId: string, code: string): boolean {
  const userMFA = userMFAStatus.get(userId)
  
  if (!userMFA?.backupCodes) {
    return false
  }
  
  const codeIndex = userMFA.backupCodes.indexOf(code.toUpperCase())
  
  if (codeIndex !== -1) {
    // 移除已使用的备用代码
    userMFA.backupCodes.splice(codeIndex, 1)
    userMFA.lastUsed = new Date()
    return true
  }
  
  return false
}

// 启用MFA
export function enableMFA(
  userId: string,
  method: 'sms' | 'email' | 'authenticator',
  options: {
    secret?: string
    phone?: string
    email?: string
  }
): { success: boolean; backupCodes?: string[]; error?: string } {
  try {
    const backupCodes = generateBackupCodes()
    
    userMFAStatus.set(userId, {
      enabled: true,
      method,
      secret: options.secret,
      phone: options.phone,
      email: options.email,
      backupCodes
    })
    
    return { success: true, backupCodes }
  } catch (error) {
    return { success: false, error: 'Failed to enable MFA' }
  }
}

// 禁用MFA
export function disableMFA(userId: string): boolean {
  const userMFA = userMFAStatus.get(userId)
  
  if (userMFA) {
    userMFA.enabled = false
    userMFA.secret = undefined
    userMFA.backupCodes = undefined
    return true
  }
  
  return false
}

// 检查用户是否启用了MFA
export function isMFAEnabled(userId: string): boolean {
  const userMFA = userMFAStatus.get(userId)
  return userMFA?.enabled || false
}

// 获取用户MFA设置
export function getUserMFASettings(userId: string) {
  const userMFA = userMFAStatus.get(userId)
  
  if (!userMFA) {
    return null
  }
  
  return {
    enabled: userMFA.enabled,
    method: userMFA.method,
    hasBackupCodes: (userMFA.backupCodes?.length || 0) > 0,
    backupCodesCount: userMFA.backupCodes?.length || 0,
    lastUsed: userMFA.lastUsed
  }
}

// 重新生成备用代码
export function regenerateBackupCodes(userId: string): string[] | null {
  const userMFA = userMFAStatus.get(userId)
  
  if (!userMFA?.enabled) {
    return null
  }
  
  const newBackupCodes = generateBackupCodes()
  userMFA.backupCodes = newBackupCodes
  
  return newBackupCodes
}

// 清理过期的验证码
export function cleanupExpiredCodes(): void {
  const now = new Date()
  
  for (const [codeId, codeData] of verificationCodes.entries()) {
    if (codeData.expiresAt < now) {
      verificationCodes.delete(codeId)
    }
  }
}

// MFA挑战生成
export function createMFAChallenge(userId: string, method: 'sms' | 'email' | 'authenticator') {
  const challengeId = `mfa_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    challengeId,
    method,
    expiresAt: new Date(Date.now() + MFA_CONFIG.codeExpiry * 1000)
  }
}

// 验证MFA挑战
export async function verifyMFAChallenge(
  challengeId: string,
  userId: string,
  code: string,
  method: 'sms' | 'email' | 'authenticator'
): Promise<{ success: boolean; error?: string }> {
  // 验证挑战是否有效
  if (!challengeId.startsWith(`mfa_${userId}_`)) {
    return { success: false, error: 'Invalid challenge' }
  }
  
  // 验证代码
  const result = verifyCode(userId, code, method)
  
  if (result.success) {
    // 记录成功的MFA验证
    console.log(`MFA verification successful for user ${userId}`)
  }
  
  return result
}

// 获取MFA统计信息
export function getMFAStats() {
  const totalUsers = userMFAStatus.size
  const enabledUsers = Array.from(userMFAStatus.values()).filter(mfa => mfa.enabled).length
  const methodStats = {
    sms: 0,
    email: 0,
    authenticator: 0
  }
  
  for (const mfa of userMFAStatus.values()) {
    if (mfa.enabled && mfa.method) {
      methodStats[mfa.method]++
    }
  }
  
  return {
    totalUsers,
    enabledUsers,
    enabledPercentage: totalUsers > 0 ? (enabledUsers / totalUsers) * 100 : 0,
    methodStats
  }
}

// 导出配置
export const mfaConfig = MFA_CONFIG
