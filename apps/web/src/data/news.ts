// 新闻数据管理
import { NewsArticle, NewsSource, AIProcessConfig, CrawlJob, AIProcessJob, NewsCategory, NewsStatus, SourceType, SupportedLanguage, MultiLanguageContent } from '@/types/news'
import { createMultiLanguageContent } from '@/lib/i18n'

// 模拟新闻源数据
let newsSources: NewsSource[] = [
  {
    id: 'source_1',
    name: '科技日报RSS',
    type: 'rss',
    url: 'https://tech-daily.com/rss',
    category: 'technology',
    isActive: true,
    crawlInterval: 60,
    rssConfig: {
      titleSelector: 'title',
      contentSelector: 'description',
      linkSelector: 'link',
      imageSelector: 'enclosure'
    },
    lastCrawledAt: new Date('2024-01-15T08:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 'source_2',
    name: '财经网爬虫',
    type: 'web_scraping',
    url: 'https://finance-news.com',
    category: 'business',
    isActive: true,
    crawlInterval: 120,
    scrapingConfig: {
      titleSelector: 'h1.article-title',
      contentSelector: '.article-content',
      summarySelector: '.article-summary',
      imageSelector: '.featured-image img',
      authorSelector: '.author-name',
      dateSelector: '.publish-date'
    },
    lastCrawledAt: new Date('2024-01-15T07:30:00Z'),
    createdAt: new Date('2024-01-05T00:00:00Z'),
    updatedAt: new Date('2024-01-15T07:30:00Z')
  },
  {
    id: 'source_3',
    name: '体育新闻API',
    type: 'api',
    url: 'https://sports-api.com/v1/news',
    category: 'sports',
    isActive: false,
    crawlInterval: 180,
    apiConfig: {
      endpoint: 'https://sports-api.com/v1/news',
      headers: {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      },
      params: {
        category: 'sports',
        limit: '50'
      },
      responseMapping: {
        title: 'title',
        content: 'content',
        summary: 'summary',
        image: 'image',
        author: 'author',
        publishedAt: 'publishedAt'
      }
    },
    lastCrawledAt: new Date('2024-01-10T12:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-10T12:00:00Z')
  }
]

// 使用全局变量来避免Next.js热重载导致的数据丢失
declare global {
  var __newsArticles: NewsArticle[] | undefined
}

// 服装行业新闻数据 - 生产环境数据
let newsArticles: NewsArticle[] = globalThis.__newsArticles || [
  {
    id: '1',
    title: createMultiLanguageContent('服装行业最新趋势分析', 'zh'),
    content: createMultiLanguageContent('随着消费者需求的变化，服装行业正在经历重大转型。本文深入分析了当前服装行业的发展趋势和市场变化。', 'zh'),
    summary: createMultiLanguageContent('分析当前服装行业的发展趋势和市场变化', 'zh'),
    slug: 'fashion-industry-trends-analysis',
    category: 'business',
    status: 'published',
    author: '行业分析师',
    sourceUrl: 'https://www.xinhuanet.com/fortune/2024-01/15/c_1129987654.htm',
    sourceName: '新华网财经',
    sourceType: 'rss',
    featuredImage: 'https://example.com/images/fashion-trends.jpg',
    aiProcessed: false,
    aiProcessStatus: 'pending',
    viewCount: 156,
    likeCount: 12,
    shareCount: 8,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    title: createMultiLanguageContent('内衣市场调研报告', 'zh'),
    content: createMultiLanguageContent('内衣市场在过去一年中呈现出强劲的增长势头。本报告详细分析了内衣市场的发展现状和未来前景。', 'zh'),
    summary: createMultiLanguageContent('详细分析内衣市场的发展现状和未来前景', 'zh'),
    slug: 'underwear-market-research-report',
    category: 'underwear',
    status: 'published',
    author: '市场研究员',
    sourceUrl: 'https://www.chinatextile.org.cn/news/2024-01/14/content_123456.html',
    sourceName: '中国纺织网',
    sourceType: 'rss',
    featuredImage: 'https://example.com/images/underwear-market.jpg',
    aiProcessed: false,
    aiProcessStatus: 'pending',
    viewCount: 89,
    likeCount: 5,
    shareCount: 3,
    publishedAt: new Date('2024-01-14T14:30:00Z'),
    createdAt: new Date('2024-01-14T13:30:00Z'),
    updatedAt: new Date('2024-01-14T14:30:00Z')
  },
  {
    id: '3',
    title: createMultiLanguageContent('纺织品出口贸易新政策', 'zh'),
    content: createMultiLanguageContent('政府发布了新的纺织品出口贸易政策，将对行业产生重大影响。本文解读了新政策的主要内容和影响。', 'zh'),
    summary: createMultiLanguageContent('解读新的纺织品出口贸易政策及其影响', 'zh'),
    slug: 'textile-export-trade-new-policy',
    category: 'business',
    status: 'draft',
    author: '政策分析师',
    sourceUrl: 'https://www.mofcom.gov.cn/article/news/2024/01/16/20240116789123.shtml',
    sourceName: '商务部网站',
    sourceType: 'rss',
    featuredImage: 'https://example.com/images/textile-export.jpg',
    aiProcessed: false,
    aiProcessStatus: 'pending',
    viewCount: 0,
    likeCount: 0,
    shareCount: 0,
    createdAt: new Date('2024-01-16T08:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  }
]

// 确保全局变量同步
if (!globalThis.__newsArticles) {
  globalThis.__newsArticles = newsArticles
}

// 更新现有的新闻来源配置
// 服装内衣行业TO B新闻源配置
newsSources = [
  {
    id: '1',
    name: 'Global Textile News - China Trade',
    type: 'rss',
    url: 'https://www.globaltextilenews.com/china-trade/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 120, // 120分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['textile', 'apparel', 'manufacturing', 'export', 'trade', 'supplier', 'B2B', 'wholesale'],
      minContentLength: 150,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '2',
    name: 'Apparel News - Industry Reports',
    type: 'rss',
    url: 'https://www.apparelnews.net/industry/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 90, // 90分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['apparel', 'manufacturing', 'industry', 'business', 'supply chain', 'production', 'sourcing'],
      minContentLength: 120,
      minQualityScore: 70
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '3',
    name: 'Underwear News Daily - B2B',
    type: 'rss',
    url: 'https://www.underwearnews.com/b2b/rss',
    category: 'underwear',
    isActive: true,
    crawlInterval: 180, // 180分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['underwear', 'lingerie', 'intimate', 'apparel', 'manufacturing', 'wholesale', 'distributor'],
      minContentLength: 100,
      minQualityScore: 70
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '4',
    name: 'Textile World - B2B News',
    type: 'rss',
    url: 'https://www.textileworld.com/b2b/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 150, // 150分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['textile', 'manufacturing', 'industry', 'B2B', 'supplier', 'fabric', 'production', 'technology'],
      minContentLength: 140,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '5',
    name: 'Apparel Sourcing Magazine',
    type: 'rss',
    url: 'https://www.apparelsourcing.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 120, // 120分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['sourcing', 'manufacturing', 'supplier', 'apparel', 'production', 'trade', 'export', 'wholesale'],
      minContentLength: 130,
      minQualityScore: 70
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '6',
    name: 'Intimate Apparel Trade News',
    type: 'rss',
    url: 'https://www.intimateappareltrade.com/rss',
    category: 'underwear',
    isActive: true,
    crawlInterval: 180, // 180分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['intimate', 'apparel', 'underwear', 'lingerie', 'trade', 'wholesale', 'distributor', 'B2B'],
      minContentLength: 120,
      minQualityScore: 65
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '7',
    name: 'European Textile Network',
    type: 'rss',
    url: 'https://www.europeantextile.com/b2b/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 200, // 200分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['textile', 'European', 'manufacturing', 'export', 'trade', 'supplier', 'B2B'],
      minContentLength: 150,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '8',
    name: 'Asian Apparel Trade Journal',
    type: 'rss',
    url: 'https://www.asianappareltrade.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 180, // 180分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Asian', 'apparel', 'trade', 'manufacturing', 'export', 'China', 'supplier', 'wholesale'],
      minContentLength: 140,
      minQualityScore: 70
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '9',
    name: 'Global Underwear Industry Report',
    type: 'rss',
    url: 'https://www.globalunderwearindustry.com/rss',
    category: 'underwear',
    isActive: true,
    crawlInterval: 240, // 240分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['underwear', 'industry', 'global', 'market', 'analysis', 'B2B', 'distributor', 'wholesale'],
      minContentLength: 160,
      minQualityScore: 80
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '10',
    name: 'US Textile Manufacturers Association',
    type: 'rss',
    url: 'https://www.ustextile.org/news/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 300, // 300分钟
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['textile', 'manufacturing', 'US', 'industry', 'trade', 'policy', 'B2B'],
      minContentLength: 180,
      minQualityScore: 85
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '11',
    name: 'China Textile Information Center',
    type: 'rss',
    url: 'https://www.ctei.cn/rss/b2b',
    category: 'business',
    isActive: true,
    crawlInterval: 120,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['textile', 'China', 'export', 'manufacturing', 'B2B', 'trade', 'supplier'],
      minContentLength: 150,
      minQualityScore: 80
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '12',
    name: 'Bangladesh Garment News',
    type: 'rss',
    url: 'https://www.bangladeshgarmentnews.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 180,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['garment', 'Bangladesh', 'manufacturing', 'export', 'RMG', 'textile'],
      minContentLength: 140,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '13',
    name: 'Vietnam Textile & Apparel Association',
    type: 'rss',
    url: 'https://www.vitas.com.vn/news/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 200,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Vietnam', 'textile', 'apparel', 'export', 'manufacturing', 'VITAS'],
      minContentLength: 160,
      minQualityScore: 78
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '14',
    name: 'India Textile Journal',
    type: 'rss',
    url: 'https://www.indiantextilejournal.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 150,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['India', 'textile', 'cotton', 'manufacturing', 'export', 'B2B'],
      minContentLength: 170,
      minQualityScore: 82
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '15',
    name: 'Turkish Textile News',
    type: 'rss',
    url: 'https://www.turkishtextilenews.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 240,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Turkey', 'textile', 'apparel', 'export', 'manufacturing', 'Istanbul'],
      minContentLength: 150,
      minQualityScore: 76
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '16',
    name: 'Mexico Apparel Industry News',
    type: 'rss',
    url: 'https://www.mexicoapparelnews.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 300,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Mexico', 'apparel', 'maquiladora', 'NAFTA', 'textile', 'manufacturing'],
      minContentLength: 140,
      minQualityScore: 74
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '17',
    name: 'Brazilian Textile Association',
    type: 'rss',
    url: 'https://www.abit.org.br/news/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 360,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Brazil', 'textile', 'cotton', 'export', 'ABIT', 'manufacturing'],
      minContentLength: 160,
      minQualityScore: 77
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '18',
    name: 'Egyptian Cotton Gazette',
    type: 'rss',
    url: 'https://www.egyptiancottongazette.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 480,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Egypt', 'cotton', 'textile', 'export', 'manufacturing', 'quality'],
      minContentLength: 150,
      minQualityScore: 79
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '19',
    name: 'Pakistan Textile Today',
    type: 'rss',
    url: 'https://www.textiletoday.com.pk/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 200,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Pakistan', 'textile', 'cotton', 'export', 'manufacturing', 'Karachi'],
      minContentLength: 140,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    id: '20',
    name: 'Morocco Textile Export News',
    type: 'rss',
    url: 'https://www.moroccotextileexport.com/rss',
    category: 'business',
    isActive: true,
    crawlInterval: 360,
    lastCrawledAt: new Date('2024-01-16T08:00:00Z'),
    filters: {
      keywords: ['Morocco', 'textile', 'export', 'EU', 'manufacturing', 'Casablanca'],
      minContentLength: 130,
      minQualityScore: 73
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },

  // 新增高质量数据源
  {
    id: '21',
    name: 'Textile World Magazine',
    type: 'rss',
    url: 'https://www.textileworld.com/feed/',
    category: 'business',
    isActive: true,
    crawlInterval: 240, // 4小时
    lastCrawledAt: undefined,
    filters: {
      keywords: ['textile', 'magazine', 'industry', 'technology', 'innovation', 'manufacturing', 'fiber', 'fabric'],
      minContentLength: 200,
      minQualityScore: 85
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },

  {
    id: '22',
    name: 'Apparel Magazine',
    type: 'rss',
    url: 'https://www.apparelmag.com/feed',
    category: 'fashion',
    isActive: true,
    crawlInterval: 240, // 4小时
    lastCrawledAt: undefined,
    filters: {
      keywords: ['apparel', 'manufacturing', 'retail', 'fashion', 'clothing', 'production', 'supply chain', 'design'],
      minContentLength: 180,
      minQualityScore: 80
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },

  {
    id: '23',
    name: 'Sourcing Journal',
    type: 'rss',
    url: 'https://sourcingjournal.com/feed/',
    category: 'business',
    isActive: true,
    crawlInterval: 180, // 3小时
    lastCrawledAt: undefined,
    filters: {
      keywords: ['sourcing', 'supply-chain', 'manufacturing', 'trade', 'procurement', 'vendor', 'supplier', 'logistics'],
      minContentLength: 250,
      minQualityScore: 90
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },

  {
    id: '24',
    name: 'Just Style',
    type: 'rss',
    url: 'https://www.just-style.com/feed/',
    category: 'business',
    isActive: true,
    crawlInterval: 240, // 4小时
    lastCrawledAt: undefined,
    filters: {
      keywords: ['fashion', 'business', 'intelligence', 'global', 'market', 'analysis', 'trends', 'retail'],
      minContentLength: 220,
      minQualityScore: 88
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  },

  {
    id: '25',
    name: 'Fibre2Fashion',
    type: 'rss',
    url: 'https://www.fibre2fashion.com/rss/news.xml',
    category: 'business',
    isActive: true,
    crawlInterval: 120, // 2小时
    lastCrawledAt: undefined,
    filters: {
      keywords: ['textile', 'fashion', 'b2b', 'trade', 'fiber', 'yarn', 'fabric', 'machinery'],
      minContentLength: 150,
      minQualityScore: 75
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T08:00:00Z')
  }
]

// AI处理配置
let aiConfigs: AIProcessConfig[] = [
  {
    id: '1',
    name: '默认AI润色配置',
    isDefault: true,
    provider: 'openai',
    model: 'gpt-4',
    options: {
      rewriteTitle: true,
      rewriteContent: true,
      generateSummary: true,
      generateKeywords: true,
      improveReadability: true
    },
    prompts: {
      titleRewrite: '请将以下新闻标题改写得更加吸引人，保持原意但更具可读性：',
      contentRewrite: '请润色以下新闻内容，提高可读性和专业性，保持事实准确：',
      summaryGeneration: '请为以下新闻内容生成一个简洁的摘要（不超过100字）：',
      keywordExtraction: '请从以下新闻内容中提取5-8个关键词：'
    },
    limits: {
      maxTitleLength: 100,
      maxSummaryLength: 200,
      maxKeywords: 8
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
]

// 采集任务记录
let crawlJobs: CrawlJob[] = []

// AI处理任务记录
let aiJobs: AIProcessJob[] = []

// 新闻CRUD操作
export function getAllNews(): NewsArticle[] {
  return newsArticles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getNewsById(id: string): NewsArticle | undefined {
  return newsArticles.find(article => article.id === id)
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find(article => article.slug === slug)
}

export function getNewsByCategory(category: NewsCategory): NewsArticle[] {
  return newsArticles.filter(article => article.category === category)
}

export function getNewsByStatus(status: NewsStatus): NewsArticle[] {
  return newsArticles.filter(article => article.status === status)
}

export function getPublishedNews(): NewsArticle[] {
  return newsArticles.filter(article => article.status === 'published')
    .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
}

// 搜索新闻（支持多语言）
export function searchNews(query: string, language?: SupportedLanguage): NewsArticle[] {
  const lowercaseQuery = query.toLowerCase()
  return newsArticles.filter(article => {
    // 搜索多语言标题
    const titleMatch = Object.values(article.title).some(title =>
      title && title.toLowerCase().includes(lowercaseQuery)
    )

    // 搜索多语言内容
    const contentMatch = Object.values(article.content).some(content =>
      content && content.toLowerCase().includes(lowercaseQuery)
    )

    // 搜索多语言摘要
    const summaryMatch = Object.values(article.summary).some(summary =>
      summary && summary.toLowerCase().includes(lowercaseQuery)
    )

    // 搜索关键词
    const keywordMatch = article.keywords?.some(keyword =>
      keyword.toLowerCase().includes(lowercaseQuery)
    )

    return titleMatch || contentMatch || summaryMatch || keywordMatch
  })
}

export function createNews(newsData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'shareCount'>): NewsArticle {
  const newArticle: NewsArticle = {
    ...newsData,
    id: Date.now().toString(),
    viewCount: 0,
    likeCount: 0,
    shareCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  newsArticles.push(newArticle)

  // 同步到全局变量
  globalThis.__newsArticles = newsArticles

  return newArticle
}

export function updateNews(id: string, updates: Partial<NewsArticle>): NewsArticle | null {
  const index = newsArticles.findIndex(article => article.id === id)
  if (index === -1) return null

  newsArticles[index] = {
    ...newsArticles[index],
    ...updates,
    updatedAt: new Date()
  }

  return newsArticles[index]
}

// 批量更新新闻状态
export function batchUpdateNewsStatus(status: NewsStatus): number {
  let updatedCount = 0
  newsArticles.forEach(article => {
    if (article.status !== status) {
      article.status = status
      article.updatedAt = new Date()
      updatedCount++
    }
  })

  // 同步到全局变量
  globalThis.__newsArticles = newsArticles

  return updatedCount
}

export function deleteNews(id: string): boolean {
  const index = newsArticles.findIndex(article => article.id === id)
  if (index === -1) return false

  newsArticles.splice(index, 1)
  return true
}
// 新闻来源管理
export function getAllSources(): NewsSource[] {
  return newsSources
}

export function getSourceById(id: string): NewsSource | undefined {
  return newsSources.find(source => source.id === id)
}

// 真实的RSS源数据
const realSources: NewsSource[] = [
    // 中文源 - 中国
    {
      id: 'cn_001', name: '新华网财经', type: 'rss', url: 'http://www.xinhuanet.com/fortune/news_fortune.xml',
      category: 'business', language: 'zh', country: 'CN', region: 'Asia', isActive: true, crawlInterval: 60,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['经济', '财经', '贸易', '制造', '纺织', '服装'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'cn_002', name: '人民网经济', type: 'rss', url: 'http://finance.people.com.cn/rss/finance.xml',
      category: 'business', language: 'zh', country: 'CN', region: 'Asia', isActive: true, crawlInterval: 90,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['经济', '财经', '贸易', '制造', '纺织', '服装'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 中文源 - 台湾
    {
      id: 'tw_001', name: '中央社', type: 'rss', url: 'https://www.cna.com.tw/rss/aipl.xml',
      category: 'business', language: 'zh', country: 'TW', region: 'Asia', isActive: true, crawlInterval: 90,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['經濟', '財經', '貿易', '製造', '紡織', '服裝'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 中文源 - 香港
    {
      id: 'hk_001', name: '香港01', type: 'rss', url: 'https://www.hk01.com/rss/01%E8%A7%80%E9%BB%9E',
      category: 'business', language: 'zh', country: 'HK', region: 'Asia', isActive: true, crawlInterval: 120,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['經濟', '財經', '貿易', '製造', '紡織', '服裝'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 英文源 - 美国
    {
      id: 'us_001', name: 'Reuters Business', type: 'rss', url: 'https://feeds.reuters.com/reuters/businessNews',
      category: 'business', language: 'en', country: 'US', region: 'Americas', isActive: true, crawlInterval: 60,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['business', 'trade', 'manufacturing', 'textile', 'apparel', 'fashion'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'us_002', name: 'CNN Business', type: 'rss', url: 'http://rss.cnn.com/rss/money_latest.rss',
      category: 'business', language: 'en', country: 'US', region: 'Americas', isActive: true, crawlInterval: 90,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['business', 'trade', 'manufacturing', 'textile', 'apparel', 'fashion'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 英文源 - 英国
    {
      id: 'gb_001', name: 'BBC Business', type: 'rss', url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
      category: 'business', language: 'en', country: 'GB', region: 'Europe', isActive: true, crawlInterval: 60,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['business', 'trade', 'manufacturing', 'textile', 'apparel', 'fashion'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'gb_002', name: 'The Guardian Business', type: 'rss', url: 'https://www.theguardian.com/uk/business/rss',
      category: 'business', language: 'en', country: 'GB', region: 'Europe', isActive: true, crawlInterval: 90,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['business', 'trade', 'manufacturing', 'textile', 'apparel', 'fashion'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 英文源 - 澳大利亚
    {
      id: 'au_001', name: 'ABC News Australia', type: 'rss', url: 'https://www.abc.net.au/news/feed/51120/rss.xml',
      category: 'business', language: 'en', country: 'AU', region: 'Oceania', isActive: true, crawlInterval: 90,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['business', 'trade', 'manufacturing', 'textile', 'apparel', 'fashion'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 日文源 - 日本
    {
      id: 'jp_001', name: 'NHK News', type: 'rss', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',
      category: 'business', language: 'ja', country: 'JP', region: 'Asia', isActive: true, crawlInterval: 60,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['経済', 'ビジネス', '貿易', '製造', '繊維', 'アパレル'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // 韩文源 - 韩国
    {
      id: 'kr_001', name: 'Yonhap News', type: 'rss', url: 'https://www.yna.co.kr/rss/news.xml',
      category: 'business', language: 'ko', country: 'KR', region: 'Asia', isActive: true, crawlInterval: 60,
      rssConfig: { titleSelector: 'title', contentSelector: 'description', linkSelector: 'link', imageSelector: 'enclosure' },
      filters: { keywords: ['경제', '비즈니스', '무역', '제조', '섬유', '의류'], minContentLength: 100, minQualityScore: 25 },
      createdAt: new Date(), updatedAt: new Date(), lastCrawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
]

// 使用真实的RSS源数据替换模拟数据
newsSources = realSources

export function getActiveSources(): NewsSource[] {
  return newsSources.filter(source => source.isActive)
}

// AI配置管理
export function getAllAIConfigs(): AIProcessConfig[] {
  return aiConfigs
}

export function getDefaultAIConfig(): AIProcessConfig | undefined {
  return aiConfigs.find(config => config.isDefault)
}

export function getAIConfigById(id: string): AIProcessConfig | undefined {
  return aiConfigs.find(config => config.id === id)
}
// 统计函数
export function getNewsStats() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const totalArticles = newsArticles.length
  const publishedArticles = newsArticles.filter(a => a.status === 'published').length
  const draftArticles = newsArticles.filter(a => a.status === 'draft').length
  const todayArticles = newsArticles.filter(a => a.createdAt >= today).length
  const weeklyArticles = newsArticles.filter(a => a.createdAt >= weekAgo).length
  const monthlyArticles = newsArticles.filter(a => a.createdAt >= monthAgo).length

  // 分类统计
  const categoryStats = newsArticles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1
    return acc
  }, {} as Record<NewsCategory, number>)

  const topCategories = Object.entries(categoryStats)
    .map(([category, count]) => ({ category: category as NewsCategory, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    todayArticles,
    weeklyArticles,
    monthlyArticles,
    topCategories,
    recentActivity: [] // 可以根据需要实现
  }
}

// 公共页面兼容性导出
// 新闻分类配置（兼容旧版本）
export const newsCategories = [
  { id: 'all', name: '全部资讯' },
  { id: 'technology', name: '科技' },
  { id: 'business', name: '商业' },
  { id: 'sports', name: '体育' },
  { id: 'entertainment', name: '娱乐' },
  { id: 'health', name: '健康' },
  { id: 'science', name: '科学' },
  { id: 'politics', name: '政治' },
  { id: 'world', name: '国际' },
  { id: 'local', name: '本地' },
  { id: 'other', name: '其他' }
]

// 转换新闻数据格式以兼容公共页面
function convertToPublicFormat(article: NewsArticle) {
  return {
    id: parseInt(article.id),
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    author: article.author || '未知作者',
    publishDate: article.publishedAt ? article.publishedAt.toISOString().split('T')[0] : article.createdAt.toISOString().split('T')[0],
    readCount: article.viewCount,
    image: article.featuredImage || '/api/placeholder/600/400',
    tags: article.keywords || [],
    featured: article.status === 'published' && article.viewCount > 500 // 简单的推荐逻辑
  }
}

// 导出兼容格式的新闻数据
export const allNewsArticles = getPublishedNews().map(convertToPublicFormat)

// ==================== 新闻源管理函数 ====================

// 获取所有新闻源
export function getAllNewsSources(): NewsSource[] {
  return [...newsSources]
}

// 创建新闻源
export function createNewsSource(sourceData: Omit<NewsSource, 'id' | 'createdAt' | 'updatedAt' | 'lastCrawled' | 'articlesCount'>): NewsSource {
  const newSource: NewsSource = {
    ...sourceData,
    id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    lastCrawledAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  newsSources.push(newSource)
  return newSource
}

// 更新新闻源
export function updateNewsSource(id: string, updateData: Partial<NewsSource>): NewsSource | null {
  const index = newsSources.findIndex(source => source.id === id)
  if (index === -1) return null

  newsSources[index] = {
    ...newsSources[index],
    ...updateData,
    updatedAt: new Date()
  }

  return newsSources[index]
}

// 删除新闻源
export function deleteNewsSource(id: string): boolean {
  const index = newsSources.findIndex(source => source.id === id)
  if (index === -1) return false

  newsSources.splice(index, 1)
  return true
}

// 获取活跃的新闻源
export function getActiveNewsSources(): NewsSource[] {
  return newsSources.filter(source => source.isActive)
}

// 根据类型获取新闻源
export function getSourcesByType(type: SourceType): NewsSource[] {
  return newsSources.filter(source => source.type === type)
}

// 根据分类获取新闻源
export function getSourcesByCategory(category: NewsCategory): NewsSource[] {
  return newsSources.filter(source => source.category === category)
}

// 更新新闻源的爬取统计
export function updateSourceCrawlStats(id: string, articlesFound: number): boolean {
  const source = getSourceById(id)
  if (!source) return false

  return updateNewsSource(id, {
    lastCrawledAt: new Date()
  }) !== null
}

// ==================== AI配置管理函数 ====================
// AI配置函数已在上面定义，这里不再重复
