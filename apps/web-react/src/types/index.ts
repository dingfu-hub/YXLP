// 核心类型定义

// 多语言内容类型
export interface MultiLanguageContent {
  zh: string;
  en: string;
  ja?: string;
  ko?: string;
  es?: string;
  fr?: string;
  de?: string;
  it?: string;
  pt?: string;
  ru?: string;
}

// 支持的语言类型
export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru';

// 语言信息
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// 新闻状态
export type NewsStatus = 'draft' | 'published' | 'archived';

// 新闻类别
export type NewsCategory = 'industry' | 'technology' | 'business' | 'fashion' | 'manufacturing';

// 新闻文章类型
export interface NewsArticle {
  id: string;
  title: MultiLanguageContent;
  content: MultiLanguageContent;
  summary: MultiLanguageContent;
  status: NewsStatus;
  category: NewsCategory;
  author: string;
  sourceUrl?: string;
  sourceType: 'rss' | 'manual' | 'crawl';
  aiProcessed: boolean;
  aiModel?: string;
  polishedLanguages: SupportedLanguage[];
  qualityScore?: number;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户角色
export type UserRole = 'admin' | 'editor' | 'user' | 'distributor' | 'guest';

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 评论状态
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

// 评论类型
export interface Comment {
  id: string;
  newsId: string;
  userId: string;
  parentId?: string;
  content: string;
  status: CommentStatus;
  isDeleted: boolean;
  likes: number;
  reports: number;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'displayName' | 'avatar'>;
  replies?: Comment[];
}

// RSS源类型
export interface RSSSource {
  id: string;
  name: string;
  url: string;
  language: SupportedLanguage;
  country: string;
  category: NewsCategory;
  isActive: boolean;
  qualityScore: number;
  lastCrawledAt?: string;
  totalArticles: number;
  successRate: number;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// AI模型类型
export type AIModel = 'deepseek' | 'doubao' | 'gpt-4' | 'claude' | 'gemini';

// AI润色配置
export interface AIPolishConfig {
  model: AIModel;
  targetLanguages: SupportedLanguage[];
  temperature?: number;
  maxTokens?: number;
  customPrompt?: string;
}

// AI润色任务状态
export type AIPolishStatus = 'pending' | 'processing' | 'completed' | 'failed';

// AI润色任务
export interface AIPolishTask {
  id: string;
  newsId: string;
  config: AIPolishConfig;
  status: AIPolishStatus;
  progress: number;
  currentLanguage?: SupportedLanguage;
  result?: Partial<MultiLanguageContent>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// 采集任务状态
export type CrawlStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 采集任务
export interface CrawlTask {
  id: string;
  sourceIds: string[];
  config: {
    aiModel: AIModel;
    targetLanguages: SupportedLanguage[];
    qualityThreshold: number;
    maxArticlesPerSource: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  status: CrawlStatus;
  progress: {
    totalSources: number;
    completedSources: number;
    totalArticles: number;
    successfulArticles: number;
    failedArticles: number;
    currentSource?: string;
  };
  results: {
    articlesCreated: number;
    articlesSkipped: number;
    errors: string[];
  };
  startedAt: string;
  completedAt?: string;
}

// 定时任务规则
export interface ScheduleRule {
  id: string;
  name: string;
  description?: string;
  cronExpression: string;
  isActive: boolean;
  sourceIds: string[];
  config: CrawlTask['config'];
  lastRunAt?: string;
  nextRunAt?: string;
  totalRuns: number;
  successfulRuns: number;
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 搜索参数
export interface SearchParams {
  query?: string;
  category?: NewsCategory;
  status?: NewsStatus;
  language?: SupportedLanguage;
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 统计数据
export interface Statistics {
  news: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    todayCreated: number;
  };
  users: {
    total: number;
    active: number;
    todayRegistered: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
    todayCreated: number;
  };
  crawl: {
    totalSources: number;
    activeSources: number;
    lastCrawlAt?: string;
    todayArticles: number;
  };
}

// 系统设置
export interface SystemSettings {
  site: {
    name: string;
    description: string;
    logo?: string;
    favicon?: string;
    defaultLanguage: SupportedLanguage;
    supportedLanguages: SupportedLanguage[];
  };
  ai: {
    defaultModel: AIModel;
    apiKeys: Partial<Record<AIModel, string>>;
    defaultPrompts: Record<string, string>;
  };
  crawl: {
    defaultQualityThreshold: number;
    maxArticlesPerSource: number;
    crawlInterval: number;
    enableAutoPolish: boolean;
  };
  comments: {
    enableComments: boolean;
    requireApproval: boolean;
    enableGuestComments: boolean;
    maxNestingLevel: number;
  };
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知消息
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  createdAt: string;
}

// 表单验证错误
export interface FormErrors {
  [key: string]: string | string[] | FormErrors;
}

// 加载状态
export interface LoadingState {
  [key: string]: boolean;
}

// 错误状态
export interface ErrorState {
  [key: string]: string | null;
}

// ==================== 电商相关类型定义 ====================

// 产品相关类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  materials: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  weight: number;
  dimensions: ProductDimensions;
  createdAt: string;
  updatedAt: string;
}

export interface ProductColor {
  name: string;
  code: string;
  image?: string;
}

export interface ProductSize {
  name: string;
  measurements?: {
    chest?: number;
    waist?: number;
    length?: number;
  };
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  subcategories: string[];
  productCount: number;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 客户相关类型
export interface Customer extends User {
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  country: string;
  address?: Address;
  isVerified: boolean;
  preferences: CustomerPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// 订单相关类型
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

// 搜索和过滤类型
export interface ProductSearchFilters {
  category?: string;
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  inStock?: boolean;
  rating?: number;
  tags?: string[];
}

// 购物车类型
export interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}
