// 密码安全工具

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// 密码配置
const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  saltRounds: 12,
  maxAge: 90, // 密码最大使用天数
  historyCount: 5, // 记住多少个历史密码
  commonPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'superman', 'michael',
    'football', 'baseball', 'liverpool', 'jordan', 'princess'
  ]
}

// 密码强度等级
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  FAIR = 2,
  GOOD = 3,
  STRONG = 4,
  VERY_STRONG = 5
}

// 密码验证结果
export interface PasswordValidationResult {
  isValid: boolean
  strength: PasswordStrength
  score: number
  errors: string[]
  suggestions: string[]
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(PASSWORD_CONFIG.saltRounds)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error('Failed to hash password')
  }
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// 验证密码强度
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // 长度检查
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`密码长度至少需要 ${PASSWORD_CONFIG.minLength} 个字符`)
    suggestions.push('增加密码长度')
  } else if (password.length >= PASSWORD_CONFIG.minLength) {
    score += 1
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    errors.push(`密码长度不能超过 ${PASSWORD_CONFIG.maxLength} 个字符`)
  }

  // 大写字母检查
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母')
    suggestions.push('添加大写字母')
  } else if (/[A-Z]/.test(password)) {
    score += 1
  }

  // 小写字母检查
  if (PASSWORD_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母')
    suggestions.push('添加小写字母')
  } else if (/[a-z]/.test(password)) {
    score += 1
  }

  // 数字检查
  if (PASSWORD_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字')
    suggestions.push('添加数字')
  } else if (/\d/.test(password)) {
    score += 1
  }

  // 特殊字符检查
  if (PASSWORD_CONFIG.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符')
    suggestions.push('添加特殊字符 (!@#$%^&* 等)')
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  }

  // 常见密码检查
  if (PASSWORD_CONFIG.commonPasswords.includes(password.toLowerCase())) {
    errors.push('不能使用常见密码')
    suggestions.push('使用更独特的密码')
    score = Math.max(0, score - 2)
  }

  // 重复字符检查
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('避免连续重复字符')
    score = Math.max(0, score - 1)
  }

  // 顺序字符检查
  if (hasSequentialChars(password)) {
    suggestions.push('避免使用顺序字符 (如 123, abc)')
    score = Math.max(0, score - 1)
  }

  // 长度加分
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // 字符种类加分
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ].filter(Boolean).length

  if (charTypes >= 3) score += 1
  if (charTypes === 4) score += 1

  // 确定强度等级
  let strength: PasswordStrength
  if (score <= 1) strength = PasswordStrength.VERY_WEAK
  else if (score <= 2) strength = PasswordStrength.WEAK
  else if (score <= 3) strength = PasswordStrength.FAIR
  else if (score <= 4) strength = PasswordStrength.GOOD
  else if (score <= 5) strength = PasswordStrength.STRONG
  else strength = PasswordStrength.VERY_STRONG

  return {
    isValid: errors.length === 0,
    strength,
    score: Math.min(score, 6),
    errors,
    suggestions
  }
}

// 检查是否有顺序字符
function hasSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ]

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const subseq = sequence.substring(i, i + 3)
      if (password.includes(subseq)) {
        return true
      }
    }
  }

  return false
}

// 生成安全密码
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + symbols
  let password = ''

  // 确保至少包含每种类型的字符
  password += getRandomChar(lowercase)
  password += getRandomChar(uppercase)
  password += getRandomChar(numbers)
  password += getRandomChar(symbols)

  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars)
  }

  // 打乱字符顺序
  return shuffleString(password)
}

// 获取随机字符
function getRandomChar(chars: string): string {
  return chars[crypto.randomInt(0, chars.length)]
}

// 打乱字符串
function shuffleString(str: string): string {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

// 检查密码是否过期
export function isPasswordExpired(lastChanged: Date): boolean {
  const now = new Date()
  const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceChange > PASSWORD_CONFIG.maxAge
}

// 检查密码历史
export function isPasswordInHistory(password: string, passwordHistory: string[]): Promise<boolean> {
  return Promise.all(
    passwordHistory.map(hash => verifyPassword(password, hash))
  ).then(results => results.some(match => match))
}

// 生成密码重置令牌
export function generatePasswordResetToken(): {
  token: string
  hash: string
  expiresAt: Date
} {
  const token = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

  return { token, hash, expiresAt }
}

// 验证密码重置令牌
export function verifyPasswordResetToken(token: string, hash: string): boolean {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash))
}

// 密码强度描述
export function getPasswordStrengthDescription(strength: PasswordStrength): string {
  const descriptions = {
    [PasswordStrength.VERY_WEAK]: '非常弱',
    [PasswordStrength.WEAK]: '弱',
    [PasswordStrength.FAIR]: '一般',
    [PasswordStrength.GOOD]: '良好',
    [PasswordStrength.STRONG]: '强',
    [PasswordStrength.VERY_STRONG]: '非常强'
  }
  return descriptions[strength]
}

// 密码强度颜色
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  const colors = {
    [PasswordStrength.VERY_WEAK]: '#ff4444',
    [PasswordStrength.WEAK]: '#ff8800',
    [PasswordStrength.FAIR]: '#ffbb33',
    [PasswordStrength.GOOD]: '#00C851',
    [PasswordStrength.STRONG]: '#007E33',
    [PasswordStrength.VERY_STRONG]: '#004d00'
  }
  return colors[strength]
}

// 估算密码破解时间
export function estimateCrackTime(password: string): string {
  const charsetSize = getCharsetSize(password)
  const combinations = Math.pow(charsetSize, password.length)
  
  // 假设每秒可以尝试 1 billion 次
  const attemptsPerSecond = 1e9
  const secondsToCrack = combinations / (2 * attemptsPerSecond) // 平均需要尝试一半的组合
  
  if (secondsToCrack < 60) return '几秒钟'
  if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} 分钟`
  if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} 小时`
  if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} 天`
  if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} 年`
  return '数百万年'
}

// 获取字符集大小
function getCharsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/\d/.test(password)) size += 10
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) size += 32
  return size
}

// 导出配置
export const passwordConfig = PASSWORD_CONFIG
