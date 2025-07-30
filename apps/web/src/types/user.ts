// 用户管理相关类型定义

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BANNED = 'banned'
}

// 用户角色枚举
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin'
}

// 认证方式枚举
export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  PHONE_SMS = 'phone_sms',
  OAUTH_GOOGLE = 'oauth_google',
  OAUTH_FACEBOOK = 'oauth_facebook',
  OAUTH_WECHAT = 'oauth_wechat'
}

// 用户个人资料
export interface UserProfile {
  firstName: string
  lastName: string
  displayName?: string
  avatar?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  bio?: string
  website?: string
  company?: string
  jobTitle?: string
  // 地址信息
  addresses: Address[]
  // 实名认证信息（针对经销商）
  verification?: VerificationInfo
}

// 地址信息
export interface Address {
  id: string
  type: 'billing' | 'shipping' | 'business'
  isDefault: boolean
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// 实名认证信息
export interface VerificationInfo {
  status: 'pending' | 'verified' | 'rejected'
  businessLicense?: string
  taxId?: string
  legalRepresentative?: string
  businessAddress?: Address
  documents: VerificationDocument[]
  verifiedAt?: Date
  verifiedBy?: string
  rejectionReason?: string
}

// 认证文档
export interface VerificationDocument {
  id: string
  type: 'business_license' | 'tax_certificate' | 'id_card' | 'passport'
  url: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: Date
}

// 用户偏好设置
export interface UserPreferences {
  language: string
  timezone: string
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  privacy: PrivacySettings
}

// 通知设置
export interface NotificationSettings {
  email: {
    marketing: boolean
    orderUpdates: boolean
    securityAlerts: boolean
    systemNotifications: boolean
  }
  sms: {
    orderUpdates: boolean
    securityAlerts: boolean
    marketingPromotions: boolean
  }
  push: {
    orderUpdates: boolean
    chatMessages: boolean
    promotions: boolean
  }
}

// 隐私设置
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts_only'
  showOnlineStatus: boolean
  allowSearchByEmail: boolean
  allowSearchByPhone: boolean
  dataProcessingConsent: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
}

// 安全设置
export interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod?: 'sms' | 'email' | 'authenticator'
  backupCodes?: string[]
  trustedDevices: TrustedDevice[]
  loginNotifications: boolean
  sessionTimeout: number // 分钟
  passwordLastChanged: Date
  securityQuestions?: SecurityQuestion[]
}

// 可信设备
export interface TrustedDevice {
  id: string
  name: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  ipAddress: string
  location?: string
  lastUsed: Date
  addedAt: Date
}

// 安全问题
export interface SecurityQuestion {
  id: string
  question: string
  answerHash: string // 加密存储
}

// 用户主实体
export interface User {
  id: string
  email: string
  emailVerified: boolean
  phone?: string
  phoneVerified: boolean
  username: string
  passwordHash: string
  profile: UserProfile
  role: UserRole
  permissions: string[]
  preferences: UserPreferences
  security: SecuritySettings
  status: UserStatus
  lastLoginAt?: Date
  lastActiveAt?: Date
  loginCount: number
  failedLoginAttempts: number
  lockedUntil?: Date
  // 经销商相关
  dealerId?: string
  dealerRole?: string
  // 元数据
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

// 用户创建请求
export interface CreateUserRequest {
  email?: string // 邮箱现在是可选的，管理员账户会自动生成
  phone?: string
  username: string
  password: string
  profile: Partial<UserProfile>
  role: UserRole
  preferences?: Partial<UserPreferences>
  dealerId?: string
}

// 用户更新请求
export interface UpdateUserRequest {
  profile?: Partial<UserProfile>
  preferences?: Partial<UserPreferences>
  security?: Partial<SecuritySettings>
  status?: UserStatus
}

// 用户查询参数
export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  dealerId?: string
  sortBy?: 'createdAt' | 'lastLoginAt' | 'username' | 'email'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

// 用户列表响应
export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 用户统计信息
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByRole: Record<UserRole, number>
  usersByStatus: Record<UserStatus, number>
  verificationPending: number
}

// 公共用户信息（不包含敏感数据）
export interface PublicUser {
  id: string
  username: string
  displayName?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  lastActiveAt?: Date
  createdAt: Date
}

// 用户会话信息
export interface UserSession {
  userId: string
  sessionId: string
  deviceInfo: {
    userAgent: string
    ip: string
    location?: string
  }
  createdAt: Date
  expiresAt: Date
  lastActiveAt: Date
}

// 导出所有类型
export type {
  User,
  UserProfile,
  Address,
  VerificationInfo,
  VerificationDocument,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  SecuritySettings,
  TrustedDevice,
  SecurityQuestion,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserListResponse,
  UserStats,
  PublicUser,
  UserSession
}
