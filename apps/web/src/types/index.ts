// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  DISTRIBUTOR = 'distributor', // 经销商
  CUSTOMER = 'customer', // 终端用户
  SALES = 'sales', // 销售
  SUPPORT = 'support', // 客服
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

// 用户偏好设置
export interface UserPreferences {
  language: string
  timezone: string
  currency: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
  theme: 'light' | 'dark' | 'auto'
}

// 地址信息
export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault?: boolean
}

// 公司信息
export interface CompanyInfo {
  name: string
  registrationNumber?: string
  industry?: string
  website?: string
  description?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  yearEstablished?: number
}

// 通知偏好
export interface NotificationPreferences {
  email: {
    marketing: boolean
    orders: boolean
    security: boolean
    newsletter: boolean
  }
  sms: {
    orders: boolean
    security: boolean
  }
  push: {
    orders: boolean
    marketing: boolean
    reminders: boolean
  }
}

// 隐私设置
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showPhone: boolean
  allowDataCollection: boolean
  allowMarketing: boolean
}

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

// 通用API响应
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  search?: string
  filters?: Record<string, any>
}

// 产品相关类型
export interface Product {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  sku: string
  price: number
  compareAtPrice?: number
  images: ProductImage[]
  variants: ProductVariant[]
  categories: string[]
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
}

export interface ProductVariant {
  id: string
  name: Record<string, string>
  sku: string
  price: number
  compareAtPrice?: number
  attributes: Record<string, any>
  inventoryQuantity: number
  isActive: boolean
  isDefault: boolean
}

// 订单相关类型
export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: Product
  variant: ProductVariant
}

// 购物车相关类型
export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  appliedCoupons: Coupon[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: Product
  variant: ProductVariant
  customization?: Record<string, any>
}

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  amount: number
  description?: string
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
}

// 文件上传类型
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  createdAt: Date
}

// 多语言内容类型
export type MultiLanguageContent = Record<string, string>

// 常用的实用类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
