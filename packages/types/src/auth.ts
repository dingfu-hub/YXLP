import { UserRole } from './user'

// 登录请求
export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

// 注册请求
export interface RegisterDto {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  firstName: string
  lastName: string
  country: string
  language: string
  acceptTerms: boolean
  company?: {
    name: string
    registrationNumber?: string
    industry?: string
  }
}

// 认证响应
export interface AuthResponse {
  user: {
    id: string
    email: string
    role: UserRole
    profile: {
      firstName: string
      lastName: string
      displayName?: string
      avatar?: string
      language: string
      country: string
    }
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

// JWT 载荷
export interface JwtPayload {
  sub: string // user id
  email: string
  role: UserRole
  iat: number
  exp: number
}

// 刷新令牌请求
export interface RefreshTokenDto {
  refreshToken: string
}

// 忘记密码请求
export interface ForgotPasswordDto {
  email: string
}

// 重置密码请求
export interface ResetPasswordDto {
  token: string
  password: string
  confirmPassword: string
}

// 修改密码请求
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// OAuth 提供商
export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
}

// OAuth 登录请求
export interface OAuthLoginDto {
  provider: OAuthProvider
  code: string
  redirectUri: string
}

// 权限定义
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

// 角色权限映射
export interface RolePermissions {
  [UserRole.ADMIN]: Permission[]
  [UserRole.DISTRIBUTOR]: Permission[]
  [UserRole.CUSTOMER]: Permission[]
}

// 会话信息
export interface Session {
  id: string
  userId: string
  deviceInfo: {
    userAgent: string
    ip: string
    location?: string
  }
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
}

// 多因素认证
export interface MfaSetupDto {
  method: 'totp' | 'sms' | 'email'
  phoneNumber?: string
}

export interface MfaVerifyDto {
  code: string
  method: 'totp' | 'sms' | 'email'
}

// 安全日志
export interface SecurityLog {
  id: string
  userId: string
  action: string
  resource?: string
  ip: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
  createdAt: Date
}
