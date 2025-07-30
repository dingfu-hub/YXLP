// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  DISTRIBUTOR = 'distributor', // 经销商
  CUSTOMER = 'customer', // 终端用户
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// 用户基础信息
export interface User {
  id: string
  email: string
  username?: string
  role: UserRole
  status: UserStatus
  profile: UserProfile
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// 用户档案信息
export interface UserProfile {
  firstName: string
  lastName: string
  displayName?: string
  avatar?: string
  phone?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  language: string
  timezone: string
  country: string
  address?: Address
  company?: CompanyInfo
}

// 公司信息（经销商用）
export interface CompanyInfo {
  name: string
  registrationNumber?: string
  taxId?: string
  industry?: string
  website?: string
  description?: string
  address: Address
  contactPerson: {
    name: string
    title: string
    email: string
    phone: string
  }
}

// 地址信息
export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault?: boolean
}

// 用户偏好设置
export interface UserPreferences {
  language: string
  currency: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
}

// 通知设置
export interface NotificationSettings {
  email: {
    marketing: boolean
    orderUpdates: boolean
    newsletter: boolean
    security: boolean
  }
  sms: {
    orderUpdates: boolean
    security: boolean
  }
  push: {
    orderUpdates: boolean
    marketing: boolean
  }
}

// 隐私设置
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts'
  dataSharing: boolean
  analytics: boolean
}

// 用户创建 DTO
export interface CreateUserDto {
  email: string
  password: string
  role: UserRole
  profile: Partial<UserProfile>
}

// 用户更新 DTO
export interface UpdateUserDto {
  profile?: Partial<UserProfile>
  preferences?: Partial<UserPreferences>
  status?: UserStatus
}

// 用户查询参数
export interface UserQueryParams {
  role?: UserRole
  status?: UserStatus
  country?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
