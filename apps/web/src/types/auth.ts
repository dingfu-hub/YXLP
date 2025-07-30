// 认证和授权相关类型定义

import { UserRole, UserStatus } from './user'

// JWT Token 载荷
export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: UserRole
  permissions: string[]
  dealerId?: string
  sessionId: string
  iat: number
  exp: number
  iss: string
  aud: string
}

// 认证响应
export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: AuthUser
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: 'Bearer'
  }
  error?: string
}

// 认证用户信息
export interface AuthUser {
  id: string
  email: string
  username: string
  displayName?: string
  avatar?: string
  role: UserRole
  permissions: string[]
  status: UserStatus
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  dealerId?: string
  preferences: {
    language: string
    timezone: string
    currency: string
    theme: string
  }
  lastLoginAt?: Date
}

// 登录请求
export interface LoginRequest {
  identifier: string // email 或 username
  password: string
  rememberMe?: boolean
  deviceInfo?: DeviceInfo
  captcha?: string
}

// 注册请求
export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  dealerId?: string
  acceptTerms: boolean
  acceptPrivacy: boolean
  marketingConsent?: boolean
  deviceInfo?: DeviceInfo
  captcha?: string
}

// 设备信息
export interface DeviceInfo {
  userAgent: string
  platform: string
  browser: string
  version: string
  mobile: boolean
  ipAddress?: string
  location?: GeoLocation
  fingerprint?: string
}

// 地理位置
export interface GeoLocation {
  country: string
  region: string
  city: string
  latitude?: number
  longitude?: number
  timezone: string
}

// 密码重置请求
export interface PasswordResetRequest {
  email: string
  captcha?: string
}

// 密码重置确认
export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

// 密码修改请求
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 两步验证设置
export interface TwoFactorSetupRequest {
  method: 'sms' | 'email' | 'authenticator'
  phone?: string
  email?: string
}

// 两步验证验证
export interface TwoFactorVerifyRequest {
  userId: string
  code: string
  method: 'sms' | 'email' | 'authenticator'
  rememberDevice?: boolean
}

// 邮箱验证请求
export interface EmailVerificationRequest {
  email: string
}

// 邮箱验证确认
export interface EmailVerificationConfirm {
  token: string
}

// 手机验证请求
export interface PhoneVerificationRequest {
  phone: string
}

// 手机验证确认
export interface PhoneVerificationConfirm {
  phone: string
  code: string
}

// 权限定义
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  conditions?: PermissionCondition[]
}

// 权限条件
export interface PermissionCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains'
  value: any
}

// 角色定义
export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  level: number
  permissions: Permission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 会话信息
export interface Session {
  id: string
  userId: string
  accessToken: string
  refreshToken: string
  deviceInfo: DeviceInfo
  ipAddress: string
  location?: GeoLocation
  createdAt: Date
  expiresAt: Date
  lastActiveAt: Date
  isActive: boolean
}

// 登录历史
export interface LoginHistory {
  id: string
  userId: string
  success: boolean
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  failureReason?: string
  createdAt: Date
}

// 安全事件
export interface SecurityEvent {
  id: string
  userId: string
  type: SecurityEventType
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  metadata: Record<string, any>
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
}

// 安全事件类型
export enum SecurityEventType {
  SUSPICIOUS_LOGIN = 'suspicious_login',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  ACCOUNT_LOCKED = 'account_locked',
  UNUSUAL_ACTIVITY = 'unusual_activity',
  DATA_EXPORT = 'data_export',
  PERMISSION_ESCALATION = 'permission_escalation'
}

// 访问控制上下文
export interface AccessContext {
  user: AuthUser
  session: Session
  permissions: Permission[]
  ipAddress: string
  userAgent: string
  timestamp: Date
}

// 权限检查请求
export interface PermissionCheckRequest {
  userId: string
  resource: string
  action: string
  context?: Record<string, any>
}

// 权限检查响应
export interface PermissionCheckResponse {
  allowed: boolean
  reason?: string
  conditions?: PermissionCondition[]
}

// Token 刷新请求
export interface RefreshTokenRequest {
  refreshToken: string
  deviceInfo?: DeviceInfo
}

// 登出请求
export interface LogoutRequest {
  refreshToken?: string
  allDevices?: boolean
}

// 社交登录请求
export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'wechat' | 'github'
  code: string
  state?: string
  redirectUri: string
  deviceInfo?: DeviceInfo
}

// 社交登录配置
export interface SocialLoginConfig {
  google: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  facebook: {
    appId: string
    appSecret: string
    redirectUri: string
  }
  wechat: {
    appId: string
    appSecret: string
    redirectUri: string
  }
}

// 认证配置
export interface AuthConfig {
  jwt: {
    secret: string
    accessTokenExpiry: string
    refreshTokenExpiry: string
    issuer: string
    audience: string
  }
  password: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number // 密码最大使用天数
  }
  security: {
    maxFailedAttempts: number
    lockoutDuration: number // 分钟
    sessionTimeout: number // 分钟
    requireTwoFactor: boolean
    allowedIpRanges?: string[]
  }
  social: SocialLoginConfig
}

// 导出所有类型
export type {
  JWTPayload,
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  DeviceInfo,
  GeoLocation,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  Permission,
  PermissionCondition,
  Role,
  Session,
  LoginHistory,
  SecurityEvent,
  AccessContext,
  PermissionCheckRequest,
  PermissionCheckResponse,
  RefreshTokenRequest,
  LogoutRequest,
  SocialLoginRequest,
  SocialLoginConfig,
  AuthConfig
}
