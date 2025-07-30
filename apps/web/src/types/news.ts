// 新闻相关类型定义

// 新闻状态
export type NewsStatus = 'draft' | 'published' | 'archived' | 'processing'

// 新闻分类
export type NewsCategory =
  | 'technology'
  | 'business'
  | 'sports'
  | 'entertainment'
  | 'health'
  | 'science'
  | 'education'
  | 'fashion'
  | 'underwear'
  | 'politics'
  | 'world'
  | 'local'
  | 'other'

// 采集来源类型
export type SourceType = 'rss' | 'web_scraping' | 'api' | 'manual'

// AI处理状态
export type AIProcessStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 支持的语言
export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'vi' | 'th' | 'id'

// AI模型类型
export type AIModel = 'deepseek' | 'doubao'

// 多语言内容
export interface MultiLanguageContent {
  zh: string // 中文（默认）
  en?: string // 英文
  ja?: string // 日文
  ko?: string // 韩文
  es?: string // 西班牙文
  fr?: string // 法文
  de?: string // 德文
  it?: string // 意大利文
  pt?: string // 葡萄牙文
  ru?: string // 俄文
}

// AI润色进度
export interface AIPolishProgress {
  total: number
  completed: number
  current?: string // 当前处理的语言
  status: 'idle' | 'processing' | 'completed' | 'failed'
  error?: string
}

// 采集进度
export interface CrawlProgress {
  totalSources: number
  completedSources: number
  currentSource?: string
  articlesFound: number
  articlesProcessed: number
  articlesPolished: number
  status: 'idle' | 'crawling' | 'polishing' | 'completed' | 'failed'
  error?: string
}

// 新闻实体
export interface NewsArticle {
  id: string

  // 多语言内容
  title: MultiLanguageContent
  content: MultiLanguageContent
  summary: MultiLanguageContent

  // 原始内容（采集时的原始语言）
  originalTitle?: string
  originalContent?: string
  originalSummary?: string
  originalLanguage?: SupportedLanguage

  // 基本信息
  category: NewsCategory
  status: NewsStatus

  // 来源信息
  sourceUrl?: string
  sourceName?: string
  sourceType: SourceType
  sourceCountry?: string // 来源国家

  // 媒体文件
  featuredImage?: string
  images?: string[]

  // SEO相关
  slug: string
  metaDescription?: MultiLanguageContent
  keywords?: string[]

  // AI处理信息
  aiProcessed: boolean
  aiProcessStatus: AIProcessStatus
  aiProcessedAt?: Date
  aiModel?: AIModel
  aiPrompt?: string
  polishedLanguages?: SupportedLanguage[] // 已润色的语言

  // 发布信息
  publishedAt?: Date
  author?: string

  // 统计信息
  viewCount: number
  likeCount: number
  shareCount: number

  // 质量评分
  qualityScore?: number // 0-100

  // 地区相关
  targetRegions?: string[] // 目标地区
  isGlobal?: boolean // 是否全球新闻

  // 时间戳
  createdAt: Date
  updatedAt: Date
}

// 用户类型
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 评论实体
export interface Comment {
  id: string
  newsId: string
  userId: string
  parentId?: string // 父评论ID，用于回复
  content: string
  isDeleted: boolean
  deletedAt?: Date
  deletedBy?: string // 删除者ID（管理员）

  // 统计信息
  likeCount: number
  replyCount: number

  // 时间戳
  createdAt: Date
  updatedAt: Date

  // 关联数据（查询时填充）
  user?: User
  replies?: Comment[]
  parentComment?: Comment
}

// 定时采集配置
export interface ScheduledCrawlConfig {
  id: string
  name: string
  isActive: boolean
  cronExpression: string // cron表达式
  sources: string[] // 采集源ID列表
  aiModel: AIModel
  targetLanguages: SupportedLanguage[]
  qualityThreshold: number // 质量阈值
  maxArticlesPerSource: number
  onlyTodayNews: boolean // 只采集当天新闻

  // 统计信息
  lastRunAt?: Date
  nextRunAt?: Date
  totalRuns: number
  successfulRuns: number

  createdAt: Date
  updatedAt: Date
}

// 新闻采集配置
export interface NewsSource {
  id: string
  name: string
  type: SourceType
  url: string
  category: NewsCategory
  isActive: boolean

  // 语言和地区信息
  language: SupportedLanguage
  country: string // 国家代码，如 'US', 'CN', 'JP'
  region?: string // 地区，如 'Asia', 'Europe', 'Americas'
  
  // RSS特定配置
  rssConfig?: {
    titleSelector?: string
    contentSelector?: string
    linkSelector?: string
    imageSelector?: string
  }
  
  // 网页爬虫配置
  scrapingConfig?: {
    titleSelector: string
    contentSelector: string
    summarySelector?: string
    imageSelector?: string
    authorSelector?: string
    dateSelector?: string
    excludeSelectors?: string[] // 要排除的元素选择器
  }
  
  // API配置
  apiConfig?: {
    endpoint: string
    headers?: Record<string, string>
    params?: Record<string, any>
    responseMapping: {
      title: string
      content: string
      summary?: string
      image?: string
      author?: string
      publishedAt?: string
    }
  }
  
  // 采集频率（分钟）
  crawlInterval: number
  lastCrawledAt?: Date
  
  // 过滤规则
  filters?: {
    keywords?: string[] // 必须包含的关键词
    excludeKeywords?: string[] // 排除的关键词
    minContentLength?: number
    maxContentLength?: number
    minQualityScore?: number // 最小质量评分 (0-100)
    maxArticlesPerCrawl?: number // 每次采集最大文章数
    enableDuplicateDetection?: boolean // 启用去重检测
    contentLanguage?: string // 内容语言 (zh, en, etc.)
  }
  
  createdAt: Date
  updatedAt: Date
}

// 采集配置
export interface CrawlConfig {
  articlesPerLanguage: number // 每个语种采集的文章数量
  enablePolishing: boolean // 是否启用润色
  enableSEO: boolean // 是否启用SEO优化
  targetLanguages: SupportedLanguage[] // 目标语言
  polishingPrompts?: {
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
  }
}

// 采集进度详情
export interface CrawlProgressDetail {
  language: SupportedLanguage
  country: string
  status: 'pending' | 'crawling' | 'polishing' | 'completed' | 'failed'
  articlesFound: number
  articlesProcessed: number
  articlesPolished: number
  currentSource?: string
  error?: string
  startTime?: Date
  endTime?: Date
}

// 全球国家和语言映射
export interface CountryLanguageMapping {
  country: string
  countryCode: string
  language: SupportedLanguage
  region: string
  flag: string
}

// AI润色配置
export interface AIProcessConfig {
  id: string
  name: string
  isDefault: boolean
  
  // AI服务配置
  provider: 'openai' | 'claude' | 'gemini' | 'local'
  model: string
  apiKey?: string
  baseUrl?: string
  
  // 处理选项
  options: {
    rewriteTitle: boolean
    rewriteContent: boolean
    generateSummary: boolean
    generateKeywords: boolean
    improveReadability: boolean
    translateToLanguage?: string
  }
  
  // 提示词模板
  prompts: {
    titleRewrite?: string
    contentRewrite?: string
    summaryGeneration?: string
    keywordExtraction?: string
  }
  
  // 处理限制
  limits: {
    maxTitleLength: number
    maxSummaryLength: number
    maxKeywords: number
  }
  
  createdAt: Date
  updatedAt: Date
}

// 采集任务
export interface CrawlJob {
  id: string
  sourceId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: Date
  completedAt?: Date

  // 结果统计
  totalFound: number
  totalProcessed: number
  totalSuccess: number
  totalFailed: number

  // 采集的文章数据（未保存到数据库）
  articlesData?: NewsArticle[]

  // 错误信息
  errors?: string[]

  createdAt: Date
}

// AI处理任务
export interface AIProcessJob {
  id: string
  articleId: string
  configId: string
  status: AIProcessStatus
  startedAt?: Date
  completedAt?: Date
  
  // 处理结果
  result?: {
    title?: string
    content?: string
    summary?: string
    keywords?: string[]
  }
  
  // 错误信息
  error?: string
  
  createdAt: Date
}

// API请求/响应类型
export interface NewsListRequest {
  page?: number
  limit?: number
  category?: NewsCategory
  status?: NewsStatus
  search?: string
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface NewsListResponse {
  articles: NewsArticle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateNewsRequest {
  title: string
  content: string
  summary?: string
  category: NewsCategory
  status?: NewsStatus
  sourceUrl?: string
  sourceName?: string
  featuredImage?: string
  keywords?: string[]
  publishedAt?: Date
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
  id: string
}

export interface CrawlSourceRequest {
  sourceId: string
  immediate?: boolean // 是否立即执行
}

export interface AIProcessRequest {
  articleId: string
  configId?: string // 使用指定配置，不传则使用默认配置
  options?: {
    rewriteTitle?: boolean
    rewriteContent?: boolean
    generateSummary?: boolean
    generateKeywords?: boolean
  }
}

// 统计数据类型
export interface NewsStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  todayArticles: number
  weeklyArticles: number
  monthlyArticles: number
  topCategories: Array<{
    category: NewsCategory
    count: number
  }>
  recentActivity: Array<{
    date: string
    published: number
    drafted: number
  }>
}
