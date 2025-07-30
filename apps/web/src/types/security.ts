// 安全和风控相关类型定义

// 风险等级
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 风控规则类型
export enum RiskRuleType {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  TRANSACTION = 'transaction',
  BEHAVIOR = 'behavior',
  DEVICE = 'device',
  LOCATION = 'location'
}

// 风控动作
export enum RiskAction {
  ALLOW = 'allow',
  CHALLENGE = 'challenge',
  BLOCK = 'block',
  REVIEW = 'review',
  NOTIFY = 'notify'
}

// 安全事件类型
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  PERMISSION_DENIED = 'permission_denied',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation'
}

// 风控规则
export interface RiskRule {
  id: string
  name: string
  description: string
  type: RiskRuleType
  enabled: boolean
  priority: number
  conditions: RiskCondition[]
  action: RiskAction
  threshold: number
  timeWindow: number // 时间窗口（分钟）
  cooldown: number // 冷却时间（分钟）
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// 风控条件
export interface RiskCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex'
  value: any
  weight: number // 权重
}

// 风控评估结果
export interface RiskAssessment {
  id: string
  userId?: string
  sessionId?: string
  type: RiskRuleType
  riskLevel: RiskLevel
  riskScore: number
  triggeredRules: TriggeredRule[]
  action: RiskAction
  reason: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  deviceFingerprint?: string
  createdAt: Date
}

// 触发的规则
export interface TriggeredRule {
  ruleId: string
  ruleName: string
  score: number
  weight: number
  conditions: TriggeredCondition[]
}

// 触发的条件
export interface TriggeredCondition {
  field: string
  operator: string
  expected: any
  actual: any
  matched: boolean
}

// 设备指纹
export interface DeviceFingerprint {
  id: string
  userId?: string
  fingerprint: string
  components: {
    userAgent: string
    screen: {
      width: number
      height: number
      colorDepth: number
    }
    timezone: string
    language: string
    platform: string
    plugins: string[]
    fonts: string[]
    canvas: string
    webgl: string
    audio: string
  }
  riskScore: number
  firstSeen: Date
  lastSeen: Date
  seenCount: number
  trusted: boolean
  blocked: boolean
}

// IP 信息
export interface IPInfo {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  organization: string
  asn: string
  proxy: boolean
  vpn: boolean
  tor: boolean
  hosting: boolean
  riskScore: number
  reputation: 'good' | 'neutral' | 'bad'
  firstSeen: Date
  lastSeen: Date
  seenCount: number
  blocked: boolean
  whitelisted: boolean
}

// 行为分析
export interface BehaviorAnalysis {
  userId: string
  sessionId: string
  actions: UserAction[]
  patterns: BehaviorPattern[]
  anomalies: BehaviorAnomaly[]
  riskScore: number
  startTime: Date
  endTime: Date
}

// 用户行为
export interface UserAction {
  id: string
  type: string
  timestamp: Date
  duration: number
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
}

// 行为模式
export interface BehaviorPattern {
  type: string
  frequency: number
  avgDuration: number
  timeDistribution: number[]
  confidence: number
}

// 行为异常
export interface BehaviorAnomaly {
  type: string
  description: string
  severity: RiskLevel
  confidence: number
  timestamp: Date
  metadata: Record<string, any>
}

// 验证码配置
export interface CaptchaConfig {
  enabled: boolean
  provider: 'recaptcha' | 'hcaptcha' | 'turnstile'
  siteKey: string
  secretKey: string
  threshold: number
  actions: string[]
}

// 验证码验证请求
export interface CaptchaVerifyRequest {
  token: string
  action?: string
  remoteip?: string
}

// 验证码验证响应
export interface CaptchaVerifyResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  error_codes?: string[]
}

// 安全配置
export interface SecurityConfig {
  // 密码策略
  password: {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    forbiddenPasswords: string[]
    maxAge: number // 天数
    historyCount: number // 记住多少个历史密码
  }
  
  // 登录安全
  login: {
    maxAttempts: number
    lockoutDuration: number // 分钟
    sessionTimeout: number // 分钟
    requireCaptcha: boolean
    captchaThreshold: number
    allowedIpRanges?: string[]
    blockedIpRanges?: string[]
  }
  
  // 两步验证
  twoFactor: {
    required: boolean
    methods: ('sms' | 'email' | 'authenticator')[]
    backupCodesCount: number
    codeLength: number
    codeExpiry: number // 分钟
  }
  
  // 风控设置
  riskControl: {
    enabled: boolean
    defaultAction: RiskAction
    scoreThresholds: {
      low: number
      medium: number
      high: number
      critical: number
    }
    rules: RiskRule[]
  }
  
  // 数据保护
  dataProtection: {
    encryptionKey: string
    hashRounds: number
    tokenExpiry: number
    refreshTokenExpiry: number
    dataRetention: number // 天数
    anonymizeAfter: number // 天数
  }
}

// 安全事件
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  userId?: string
  sessionId?: string
  description: string
  riskLevel: RiskLevel
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  metadata: Record<string, any>
  timestamp: Date
}

// 安全审计日志
export interface SecurityAuditLog {
  id: string
  userId?: string
  sessionId?: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'blocked'
  riskLevel: RiskLevel
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  metadata: Record<string, any>
  timestamp: Date
}

// 威胁情报
export interface ThreatIntelligence {
  id: string
  type: 'ip' | 'domain' | 'email' | 'phone' | 'fingerprint'
  value: string
  category: 'malware' | 'phishing' | 'spam' | 'fraud' | 'abuse'
  severity: RiskLevel
  confidence: number
  source: string
  description: string
  firstSeen: Date
  lastSeen: Date
  expiresAt?: Date
  active: boolean
}

// 安全报告
export interface SecurityReport {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'incident'
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalEvents: number
    riskEvents: number
    blockedAttempts: number
    successfulLogins: number
    failedLogins: number
    newUsers: number
    suspiciousActivities: number
  }
  topRisks: {
    type: string
    count: number
    percentage: number
  }[]
  recommendations: string[]
  generatedAt: Date
  generatedBy: string
}

// 地理位置信息
export interface GeoLocation {
  country: string
  region: string
  city: string
  latitude?: number
  longitude?: number
  timezone: string
  accuracy?: number
}

// 导出所有类型
export type {
  RiskLevel,
  RiskRuleType,
  RiskAction,
  RiskRule,
  RiskCondition,
  RiskAssessment,
  TriggeredRule,
  TriggeredCondition,
  DeviceFingerprint,
  IPInfo,
  BehaviorAnalysis,
  UserAction,
  BehaviorPattern,
  BehaviorAnomaly,
  CaptchaConfig,
  CaptchaVerifyRequest,
  CaptchaVerifyResponse,
  SecurityConfig,
  SecurityEvent,
  SecurityAuditLog,
  ThreatIntelligence,
  SecurityReport,
  GeoLocation
}

// 注意：SecurityEventType 是 enum，已经在声明时自动导出
