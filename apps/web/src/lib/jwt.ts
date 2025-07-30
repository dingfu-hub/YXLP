// JWT 工具函数
import { SignJWT, jwtVerify } from 'jose'
import { AdminUser, Permission, UserRole } from '@/types/admin'

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'yxlp_jwt_secret_key_2024'
)

// Token 有效期 (7天)
const TOKEN_EXPIRY = '7d'

// JWT Payload 接口
export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
  permissions: Permission[]
  iat?: number
  exp?: number
}

// 生成 JWT Token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
  
  return token
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// 从 Token 中提取用户信息
export async function getUserFromToken(token: string): Promise<Omit<AdminUser, 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'isActive'> | null> {
  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId,
    username: payload.username,
    name: '', // 需要从数据库获取
    role: payload.role,
    permissions: payload.permissions,
    avatar: undefined
  }
}

// 检查 Token 是否即将过期 (1小时内)
export function isTokenExpiringSoon(payload: JWTPayload): boolean {
  if (!payload.exp) return true
  
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = payload.exp - now
  const oneHour = 60 * 60
  
  return timeUntilExpiry < oneHour
}

// 刷新 Token
export async function refreshToken(oldToken: string): Promise<string | null> {
  const payload = await verifyToken(oldToken)
  if (!payload) {
    return null
  }

  // 生成新的 Token
  const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    permissions: payload.permissions
  }

  return await generateToken(newPayload)
}

// 创建安全的 Cookie 选项
export function createCookieOptions(secure: boolean = false) {
  return {
    httpOnly: true,
    secure: secure, // 生产环境应该为 true
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60, // 7天
    path: '/' // 修改为根路径，确保所有页面都能访问
  }
}

// 解析 Authorization header
export function parseAuthHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

// 生成随机字符串 (用于 CSRF token 等)
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// 哈希密码 (简单实现，生产环境应使用 bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'yxlp_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// 生成会话ID
export function generateSessionId(): string {
  return generateRandomString(64)
}

// Token 黑名单 (简单内存实现，生产环境应使用 Redis)
const tokenBlacklist = new Set<string>()

// 将 Token 加入黑名单
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token)
}

// 检查 Token 是否在黑名单中
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

// 清理过期的黑名单 Token (定期调用)
export async function cleanupBlacklist(): Promise<void> {
  const tokensToRemove: string[] = []

  for (const token of tokenBlacklist) {
    const payload = await verifyToken(token)
    if (!payload) {
      tokensToRemove.push(token)
    }
  }

  tokensToRemove.forEach(token => tokenBlacklist.delete(token))
}

// 清空黑名单 (仅用于测试)
export function clearTokenBlacklist(): void {
  tokenBlacklist.clear()
}
