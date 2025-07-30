// JWT 认证工具

import jwt from 'jsonwebtoken'
import { JWTPayload, AuthUser } from '@/types/auth'
import { UserRole } from '@/types/user'

// JWT 配置
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: process.env.JWT_ISSUER || 'yxlp.com',
  audience: process.env.JWT_AUDIENCE || 'yxlp-users'
}

// 生成访问令牌
export function generateAccessToken(user: AuthUser, sessionId: string): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    dealerId: user.dealerId,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(JWT_CONFIG.accessTokenExpiry),
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience
  }

  return jwt.sign(payload, JWT_CONFIG.secret, {
    algorithm: 'HS256'
  })
}

// 生成刷新令牌
export function generateRefreshToken(userId: string, sessionId: string): string {
  const payload = {
    userId,
    sessionId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(JWT_CONFIG.refreshTokenExpiry),
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience
  }

  return jwt.sign(payload, JWT_CONFIG.secret, {
    algorithm: 'HS256'
  })
}

// 验证访问令牌
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }) as JWTPayload

    // 检查令牌是否过期
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// 验证刷新令牌
export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }) as any

    if (decoded.type !== 'refresh' || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return {
      userId: decoded.userId,
      sessionId: decoded.sessionId
    }
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

// 解析过期时间字符串
function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1)
  const value = parseInt(expiry.slice(0, -1))

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 60 * 60 * 24
    default: return 900 // 默认15分钟
  }
}

// 从请求头中提取令牌
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 检查令牌是否即将过期（5分钟内）
export function isTokenExpiringSoon(payload: JWTPayload): boolean {
  const fiveMinutesFromNow = Math.floor(Date.now() / 1000) + 300
  return payload.exp < fiveMinutesFromNow
}

// 生成令牌对
export function generateTokenPair(user: AuthUser, sessionId: string) {
  const accessToken = generateAccessToken(user, sessionId)
  const refreshToken = generateRefreshToken(user.id, sessionId)
  
  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiry(JWT_CONFIG.accessTokenExpiry),
    tokenType: 'Bearer' as const
  }
}

// 令牌黑名单管理（简单内存实现，生产环境应使用Redis）
const tokenBlacklist = new Set<string>()

// 将令牌加入黑名单
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token)
}

// 检查令牌是否在黑名单中
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

// 清理过期的黑名单令牌
export function cleanupBlacklist(): void {
  // 这里应该实现清理逻辑，移除已过期的令牌
  // 在生产环境中，这通常由Redis的TTL自动处理
}

// 创建会话ID
export function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 验证用户权限
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // 超级管理员拥有所有权限
  if (userPermissions.includes('*') || userPermissions.includes('admin:*')) {
    return true
  }

  // 检查具体权限
  if (userPermissions.includes(requiredPermission)) {
    return true
  }

  // 检查通配符权限
  const [resource, action] = requiredPermission.split(':')
  const wildcardPermission = `${resource}:*`
  
  return userPermissions.includes(wildcardPermission)
}

// 验证用户角色
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

// 检查用户是否有访问资源的权限
export function canAccessResource(
  userRole: UserRole,
  userPermissions: string[],
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
  const permission = `${resource}:${action}`
  
  // 检查基本权限
  if (!hasPermission(userPermissions, permission)) {
    return false
  }

  // 检查上下文相关的权限
  if (context) {
    // 经销商只能访问自己的数据
    if (userRole === UserRole.DEALER_ADMIN || userRole === UserRole.DEALER_STAFF) {
      if (context.dealerId && context.userDealerId !== context.dealerId) {
        return false
      }
    }

    // 员工只能访问有限的数据
    if (userRole === UserRole.DEALER_STAFF) {
      const restrictedActions = ['delete', 'admin', 'config']
      if (restrictedActions.includes(action)) {
        return false
      }
    }
  }

  return true
}

// 获取用户的有效权限列表
export function getEffectivePermissions(role: UserRole): string[] {
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: [
      '*' // 超级管理员拥有所有权限
    ],
    [UserRole.ADMIN]: [
      // 用户管理权限
      'users:read', 'users:write',
      'admin:users:read', 'admin:users:write', 'admin:users:manage_status',
      'admin:users:export',
      // 产品管理权限
      'products:read', 'products:write',
      // 订单管理权限
      'orders:read', 'orders:write',
      // 新闻管理权限
      'news:read', 'news:write',
      // 分析权限
      'analytics:read', 'admin:analytics:read',
      // 个人资料权限
      'profile:read', 'profile:write'
    ]
  }

  return rolePermissions[role] || []
}

// 令牌刷新逻辑
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
} | null> {
  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) {
    return null
  }

  // 这里应该从数据库获取用户信息
  // 为了演示，我们使用模拟数据
  const user: AuthUser = {
    id: decoded.userId,
    email: 'user@example.com',
    username: 'user',
    role: UserRole.ADMIN,
    permissions: getEffectivePermissions(UserRole.ADMIN),
    status: 'active' as any,
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    preferences: {
      language: 'en-US',
      timezone: 'UTC',
      currency: 'USD',
      theme: 'light'
    }
  }

  const accessToken = generateAccessToken(user, decoded.sessionId)
  
  return {
    accessToken,
    expiresIn: parseExpiry(JWT_CONFIG.accessTokenExpiry)
  }
}

// 导出配置（用于测试）
export const jwtConfig = JWT_CONFIG
