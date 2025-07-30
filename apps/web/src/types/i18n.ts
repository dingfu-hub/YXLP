// 国际化相关类型定义

// 支持的语言代码
export type SupportedLocale = 
  | 'zh-CN'  // 简体中文
  | 'zh-TW'  // 繁体中文
  | 'en-US'  // 美式英语
  | 'en-GB'  // 英式英语
  | 'ja-JP'  // 日语
  | 'fr-FR'  // 法语
  | 'de-DE'  // 德语
  | 'es-ES'  // 西班牙语
  | 'vi-VN'  // 越南语
  | 'ms-MY'  // 马来语
  | 'th-TH'  // 泰语
  | 'ko-KR'  // 韩语

// 语言信息
export interface LanguageInfo {
  code: SupportedLocale
  name: string
  nativeName: string
  flag: string
  rtl: boolean
  enabled: boolean
  completeness: number // 翻译完成度百分比
}

// 支持的货币
export type SupportedCurrency = 
  | 'USD'  // 美元
  | 'EUR'  // 欧元
  | 'CNY'  // 人民币
  | 'JPY'  // 日元
  | 'GBP'  // 英镑
  | 'KRW'  // 韩元
  | 'VND'  // 越南盾
  | 'MYR'  // 马来西亚林吉特
  | 'THB'  // 泰铢
  | 'SGD'  // 新加坡元

// 货币信息
export interface CurrencyInfo {
  code: SupportedCurrency
  name: string
  symbol: string
  decimals: number
  rate: number // 相对于基准货币的汇率
  enabled: boolean
  lastUpdated: Date
}

// 时区信息
export interface TimezoneInfo {
  id: string
  name: string
  offset: string
  offsetMinutes: number
  abbreviation: string
  region: string
  country: string
}

// 地区信息
export interface RegionInfo {
  code: string
  name: string
  currency: SupportedCurrency
  timezone: string
  languages: SupportedLocale[]
  dateFormat: string
  timeFormat: '12h' | '24h'
  numberFormat: {
    decimal: string
    thousands: string
    grouping: number[]
  }
  phoneFormat: string
  addressFormat: string[]
  taxRate?: number
  shippingZone?: string
}

// 翻译资源结构
export interface TranslationResource {
  // 通用
  common: {
    yes: string
    no: string
    ok: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    remove: string
    search: string
    filter: string
    sort: string
    loading: string
    error: string
    success: string
    warning: string
    info: string
    required: string
    optional: string
    back: string
    next: string
    previous: string
    submit: string
    reset: string
    clear: string
    close: string
    open: string
    view: string
    download: string
    upload: string
    copy: string
    share: string
    print: string
    export: string
    import: string
  }
  
  // 认证相关
  auth: {
    login: string
    logout: string
    register: string
    forgotPassword: string
    resetPassword: string
    changePassword: string
    email: string
    password: string
    confirmPassword: string
    username: string
    firstName: string
    lastName: string
    phone: string
    rememberMe: string
    loginSuccess: string
    loginFailed: string
    registerSuccess: string
    registerFailed: string
    passwordResetSent: string
    passwordResetSuccess: string
    invalidCredentials: string
    accountLocked: string
    emailNotVerified: string
    twoFactorRequired: string
    twoFactorCode: string
    verifyEmail: string
    verifyPhone: string
    resendCode: string
  }
  
  // 用户相关
  user: {
    profile: string
    settings: string
    preferences: string
    security: string
    notifications: string
    privacy: string
    account: string
    personalInfo: string
    contactInfo: string
    address: string
    billing: string
    shipping: string
    avatar: string
    displayName: string
    bio: string
    website: string
    company: string
    jobTitle: string
    dateOfBirth: string
    gender: string
    language: string
    timezone: string
    currency: string
    theme: string
    emailNotifications: string
    smsNotifications: string
    pushNotifications: string
    marketingEmails: string
    securityAlerts: string
    orderUpdates: string
  }
  
  // 商品相关
  product: {
    products: string
    product: string
    category: string
    categories: string
    brand: string
    price: string
    originalPrice: string
    discount: string
    stock: string
    inStock: string
    outOfStock: string
    addToCart: string
    buyNow: string
    wishlist: string
    compare: string
    reviews: string
    rating: string
    description: string
    specifications: string
    features: string
    images: string
    videos: string
    variants: string
    size: string
    color: string
    material: string
    weight: string
    dimensions: string
  }
  
  // 订单相关
  order: {
    orders: string
    order: string
    orderNumber: string
    orderDate: string
    orderStatus: string
    orderTotal: string
    orderItems: string
    shipping: string
    billing: string
    payment: string
    paymentMethod: string
    paymentStatus: string
    shippingAddress: string
    billingAddress: string
    trackingNumber: string
    estimatedDelivery: string
    orderHistory: string
    orderDetails: string
    cancelOrder: string
    returnOrder: string
    refund: string
  }
  
  // 错误消息
  errors: {
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    invalidEmail: string
    invalidPhone: string
    invalidPassword: string
    passwordMismatch: string
    userNotFound: string
    emailExists: string
    usernameExists: string
    phoneExists: string
    networkError: string
    serverError: string
    unauthorized: string
    forbidden: string
    notFound: string
    validationFailed: string
    uploadFailed: string
    fileTooLarge: string
    invalidFileType: string
  }
  
  // 成功消息
  success: {
    saved: string
    updated: string
    deleted: string
    created: string
    sent: string
    uploaded: string
    downloaded: string
    copied: string
    shared: string
    verified: string
    activated: string
    deactivated: string
    approved: string
    rejected: string
    completed: string
    cancelled: string
  }
}

// 国际化配置
export interface I18nConfig {
  defaultLocale: SupportedLocale
  locales: SupportedLocale[]
  fallbackLocale: SupportedLocale
  interpolation: {
    escapeValue: boolean
    format?: (value: any, format: string, lng: string) => string
  }
  detection: {
    order: string[]
    caches: string[]
    cookieMinutes: number
  }
  backend: {
    loadPath: string
    addPath: string
    allowMultiLoading: boolean
  }
}

// 本地化上下文
export interface LocalizationContext {
  locale: SupportedLocale
  currency: SupportedCurrency
  timezone: string
  region: RegionInfo
  dateFormat: string
  timeFormat: '12h' | '24h'
  numberFormat: Intl.NumberFormatOptions
  rtl: boolean
}

// 翻译函数类型
export type TranslationFunction = (
  key: string,
  options?: {
    defaultValue?: string
    count?: number
    context?: string
    replace?: Record<string, any>
    lng?: SupportedLocale
  }
) => string

// 格式化函数类型
export interface FormatFunctions {
  formatDate: (date: Date, format?: string) => string
  formatTime: (date: Date, format?: string) => string
  formatDateTime: (date: Date, format?: string) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: SupportedCurrency) => string
  formatPercent: (value: number, decimals?: number) => string
  formatFileSize: (bytes: number) => string
  formatRelativeTime: (date: Date) => string
}

// 国际化钩子返回类型
export interface UseI18nReturn {
  t: TranslationFunction
  locale: SupportedLocale
  locales: SupportedLocale[]
  setLocale: (locale: SupportedLocale) => void
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  timezone: string
  setTimezone: (timezone: string) => void
  format: FormatFunctions
  isRTL: boolean
  isLoading: boolean
  error?: string
}

// 翻译键路径类型（用于类型安全）
export type TranslationKey = 
  | `common.${keyof TranslationResource['common']}`
  | `auth.${keyof TranslationResource['auth']}`
  | `user.${keyof TranslationResource['user']}`
  | `product.${keyof TranslationResource['product']}`
  | `order.${keyof TranslationResource['order']}`
  | `errors.${keyof TranslationResource['errors']}`
  | `success.${keyof TranslationResource['success']}`

// 导出所有类型
export type {
  SupportedLocale,
  LanguageInfo,
  SupportedCurrency,
  CurrencyInfo,
  TimezoneInfo,
  RegionInfo,
  TranslationResource,
  I18nConfig,
  LocalizationContext,
  TranslationFunction,
  FormatFunctions,
  UseI18nReturn,
  TranslationKey
}
