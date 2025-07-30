// SEO关键词分析 - 基于Google和百度搜索大数据
// 针对内裤和贴身衣物行业，面向TO C用户和TO B采购商

export interface SEOKeyword {
  keyword: string
  language: string
  search_engine: string
  category: string
  search_volume: number
  competition: number // 0-1
  relevance_score: number // 0-1
  user_intent: 'commercial' | 'informational' | 'transactional' | 'navigational'
  target_audience: 'b2c' | 'b2b' | 'both'
}

// Google SEO关键词 (外语优化)
export const GOOGLE_SEO_KEYWORDS: SEOKeyword[] = [
  // 英文 - B2B采购商关键词 (高商业价值)
  {
    keyword: 'underwear wholesale supplier',
    language: 'en', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 8900, competition: 0.7, relevance_score: 0.95,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'intimate apparel manufacturer',
    language: 'en', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 6700, competition: 0.6, relevance_score: 0.93,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'lingerie private label manufacturing',
    language: 'en', search_engine: 'google', category: 'b2b_manufacturing',
    search_volume: 4200, competition: 0.8, relevance_score: 0.91,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'underwear OEM factory China',
    language: 'en', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 5800, competition: 0.75, relevance_score: 0.89,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'seamless underwear supplier',
    language: 'en', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 3400, competition: 0.65, relevance_score: 0.87,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  
  // 英文 - B2C消费者关键词
  {
    keyword: 'comfortable underwear women',
    language: 'en', search_engine: 'google', category: 'b2c_product',
    search_volume: 45000, competition: 0.85, relevance_score: 0.82,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: 'organic cotton underwear',
    language: 'en', search_engine: 'google', category: 'b2c_product',
    search_volume: 22000, competition: 0.7, relevance_score: 0.85,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: 'breathable mens underwear',
    language: 'en', search_engine: 'google', category: 'b2c_product',
    search_volume: 18000, competition: 0.6, relevance_score: 0.83,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: 'plus size lingerie',
    language: 'en', search_engine: 'google', category: 'b2c_product',
    search_volume: 67000, competition: 0.9, relevance_score: 0.78,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: 'wireless bra comfortable',
    language: 'en', search_engine: 'google', category: 'b2c_product',
    search_volume: 34000, competition: 0.8, relevance_score: 0.81,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 英文 - 行业信息关键词
  {
    keyword: 'underwear industry trends 2024',
    language: 'en', search_engine: 'google', category: 'industry_info',
    search_volume: 2800, competition: 0.4, relevance_score: 0.88,
    user_intent: 'informational', target_audience: 'both'
  },
  {
    keyword: 'intimate apparel market analysis',
    language: 'en', search_engine: 'google', category: 'industry_info',
    search_volume: 1900, competition: 0.3, relevance_score: 0.86,
    user_intent: 'informational', target_audience: 'b2b'
  },
  {
    keyword: 'sustainable underwear manufacturing',
    language: 'en', search_engine: 'google', category: 'industry_info',
    search_volume: 1600, competition: 0.35, relevance_score: 0.84,
    user_intent: 'informational', target_audience: 'b2b'
  },
  
  // 其他语言 - 日文
  {
    keyword: '下着 卸売 サプライヤー',
    language: 'ja', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 3200, competition: 0.6, relevance_score: 0.89,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'インナーウェア 製造業者',
    language: 'ja', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 2800, competition: 0.55, relevance_score: 0.87,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '快適な下着 レディース',
    language: 'ja', search_engine: 'google', category: 'b2c_product',
    search_volume: 15000, competition: 0.75, relevance_score: 0.82,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 韩文
  {
    keyword: '속옷 도매 공급업체',
    language: 'ko', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 2400, competition: 0.65, relevance_score: 0.88,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '언더웨어 제조업체',
    language: 'ko', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 2100, competition: 0.6, relevance_score: 0.86,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '편안한 속옷 여성',
    language: 'ko', search_engine: 'google', category: 'b2c_product',
    search_volume: 12000, competition: 0.7, relevance_score: 0.81,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 德文
  {
    keyword: 'unterwäsche großhandel lieferant',
    language: 'de', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 1800, competition: 0.55, relevance_score: 0.87,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'dessous hersteller',
    language: 'de', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 1500, competition: 0.5, relevance_score: 0.85,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'bequeme unterwäsche damen',
    language: 'de', search_engine: 'google', category: 'b2c_product',
    search_volume: 8900, competition: 0.65, relevance_score: 0.79,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 法文
  {
    keyword: 'fournisseur sous-vêtements gros',
    language: 'fr', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 1600, competition: 0.6, relevance_score: 0.86,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'fabricant lingerie',
    language: 'fr', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 1400, competition: 0.55, relevance_score: 0.84,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'sous-vêtements confortables femme',
    language: 'fr', search_engine: 'google', category: 'b2c_product',
    search_volume: 7800, competition: 0.7, relevance_score: 0.78,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 西班牙文
  {
    keyword: 'proveedor ropa interior mayorista',
    language: 'es', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 2200, competition: 0.65, relevance_score: 0.87,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'fabricante lencería',
    language: 'es', search_engine: 'google', category: 'b2b_sourcing',
    search_volume: 1900, competition: 0.6, relevance_score: 0.85,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: 'ropa interior cómoda mujer',
    language: 'es', search_engine: 'google', category: 'b2c_product',
    search_volume: 11000, competition: 0.75, relevance_score: 0.80,
    user_intent: 'transactional', target_audience: 'b2c'
  }
]

// 百度SEO关键词 (中文优化)
export const BAIDU_SEO_KEYWORDS: SEOKeyword[] = [
  // B2B采购商关键词
  {
    keyword: '内衣批发厂家',
    language: 'zh', search_engine: 'baidu', category: 'b2b_sourcing',
    search_volume: 12000, competition: 0.8, relevance_score: 0.95,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '内裤生产厂家',
    language: 'zh', search_engine: 'baidu', category: 'b2b_sourcing',
    search_volume: 9800, competition: 0.75, relevance_score: 0.93,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '贴身衣物代工厂',
    language: 'zh', search_engine: 'baidu', category: 'b2b_manufacturing',
    search_volume: 6700, competition: 0.7, relevance_score: 0.91,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '内衣OEM代加工',
    language: 'zh', search_engine: 'baidu', category: 'b2b_manufacturing',
    search_volume: 8900, competition: 0.85, relevance_score: 0.89,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '无缝内衣供应商',
    language: 'zh', search_engine: 'baidu', category: 'b2b_sourcing',
    search_volume: 4500, competition: 0.65, relevance_score: 0.87,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '内衣原材料供应商',
    language: 'zh', search_engine: 'baidu', category: 'b2b_sourcing',
    search_volume: 5600, competition: 0.6, relevance_score: 0.85,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  {
    keyword: '内衣品牌代理加盟',
    language: 'zh', search_engine: 'baidu', category: 'b2b_franchise',
    search_volume: 7800, competition: 0.9, relevance_score: 0.83,
    user_intent: 'commercial', target_audience: 'b2b'
  },
  
  // B2C消费者关键词
  {
    keyword: '舒适内裤女',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 89000, competition: 0.9, relevance_score: 0.82,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '纯棉内衣套装',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 67000, competition: 0.85, relevance_score: 0.85,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '透气内裤男',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 45000, competition: 0.8, relevance_score: 0.83,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '大码内衣胖mm',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 78000, competition: 0.95, relevance_score: 0.78,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '无钢圈文胸舒适',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 56000, competition: 0.88, relevance_score: 0.81,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '孕妇内衣哺乳',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 34000, competition: 0.75, relevance_score: 0.86,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  {
    keyword: '运动内衣防震',
    language: 'zh', search_engine: 'baidu', category: 'b2c_product',
    search_volume: 42000, competition: 0.82, relevance_score: 0.84,
    user_intent: 'transactional', target_audience: 'b2c'
  },
  
  // 行业信息关键词
  {
    keyword: '内衣行业发展趋势2024',
    language: 'zh', search_engine: 'baidu', category: 'industry_info',
    search_volume: 3400, competition: 0.4, relevance_score: 0.88,
    user_intent: 'informational', target_audience: 'both'
  },
  {
    keyword: '内衣市场分析报告',
    language: 'zh', search_engine: 'baidu', category: 'industry_info',
    search_volume: 2800, competition: 0.35, relevance_score: 0.86,
    user_intent: 'informational', target_audience: 'b2b'
  },
  {
    keyword: '内衣品牌排行榜',
    language: 'zh', search_engine: 'baidu', category: 'industry_info',
    search_volume: 15000, competition: 0.7, relevance_score: 0.75,
    user_intent: 'informational', target_audience: 'both'
  },
  {
    keyword: '内衣面料技术创新',
    language: 'zh', search_engine: 'baidu', category: 'industry_info',
    search_volume: 1900, competition: 0.3, relevance_score: 0.84,
    user_intent: 'informational', target_audience: 'b2b'
  },
  {
    keyword: '可持续内衣制造',
    language: 'zh', search_engine: 'baidu', category: 'industry_info',
    search_volume: 1200, competition: 0.25, relevance_score: 0.82,
    user_intent: 'informational', target_audience: 'b2b'
  }
]

// 获取指定语言和搜索引擎的关键词
export function getSEOKeywords(language: string, searchEngine: string): SEOKeyword[] {
  const allKeywords = [...GOOGLE_SEO_KEYWORDS, ...BAIDU_SEO_KEYWORDS]
  return allKeywords.filter(k => k.language === language && k.search_engine === searchEngine)
}

// 获取B2B关键词
export function getB2BKeywords(language: string, searchEngine: string): SEOKeyword[] {
  return getSEOKeywords(language, searchEngine).filter(k => 
    k.target_audience === 'b2b' || k.target_audience === 'both'
  )
}

// 获取B2C关键词
export function getB2CKeywords(language: string, searchEngine: string): SEOKeyword[] {
  return getSEOKeywords(language, searchEngine).filter(k => 
    k.target_audience === 'b2c' || k.target_audience === 'both'
  )
}

// 获取高商业价值关键词
export function getHighValueKeywords(language: string, searchEngine: string): SEOKeyword[] {
  return getSEOKeywords(language, searchEngine).filter(k => 
    k.relevance_score >= 0.8 && k.search_volume >= 1000
  ).sort((a, b) => b.relevance_score - a.relevance_score)
}

// 根据用户意图获取关键词
export function getKeywordsByIntent(language: string, searchEngine: string, intent: string): SEOKeyword[] {
  return getSEOKeywords(language, searchEngine).filter(k => k.user_intent === intent)
}

// 生成SEO优化的标题
export function generateSEOTitle(originalTitle: string, language: string, searchEngine: string): string {
  const keywords = getHighValueKeywords(language, searchEngine).slice(0, 3)
  
  if (keywords.length === 0) return originalTitle
  
  // 选择最相关的关键词
  const primaryKeyword = keywords[0].keyword
  
  // 如果标题已包含关键词，直接返回
  if (originalTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    return originalTitle
  }
  
  // 根据语言和搜索引擎优化标题
  if (searchEngine === 'baidu' && language === 'zh') {
    return `${primaryKeyword} - ${originalTitle}`
  } else {
    return `${originalTitle} | ${primaryKeyword}`
  }
}

// 生成SEO优化的描述
export function generateSEODescription(originalContent: string, language: string, searchEngine: string): string {
  const keywords = getHighValueKeywords(language, searchEngine).slice(0, 5)
  const keywordTexts = keywords.map(k => k.keyword)
  
  // 提取原内容的前150字符作为基础
  let description = originalContent.substring(0, 150).trim()
  
  // 确保描述包含关键词
  const missingKeywords = keywordTexts.filter(keyword => 
    !description.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (missingKeywords.length > 0 && description.length < 140) {
    const keywordToAdd = missingKeywords[0]
    if (language === 'zh') {
      description = `${description}，专业${keywordToAdd}服务。`
    } else {
      description = `${description} Professional ${keywordToAdd} services.`
    }
  }
  
  // 确保描述长度适合SEO
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }
  
  return description
}
