// 多线程RSS采集Worker
// 每个Worker负责一种语言的采集和润色

import { parentPort, workerData } from 'worker_threads'
import { ProductionRSSSource } from '@/data/production-rss-sources'
import { getSEOKeywords, generateSEOTitle, generateSEODescription } from '@/data/seo-keywords'

interface WorkerData {
  language: string
  sources: ProductionRSSSource[]
  articlesPerLanguage: number
  enablePolishing: boolean
  enableSEO: boolean
  jobId: string
}

interface ProgressUpdate {
  type: 'progress'
  language: string
  status: 'pending' | 'crawling' | 'polishing' | 'completed' | 'failed'
  currentSource?: string
  currentArticleTitle?: string
  articlesFound: number
  articlesProcessed: number
  articlesPolished: number
  polishStage?: string
  error?: string
}

interface ArticleData {
  id: string
  title: string
  content: string
  summary: string
  sourceUrl: string
  sourceId: string
  language: string
  category: string
  featuredImage?: string
  author?: string
}

// 模拟RSS解析器
async function parseRSSFeed(source: ProductionRSSSource): Promise<ArticleData[]> {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // 模拟RSS解析结果
  const articleCount = Math.floor(Math.random() * 8) + 2 // 2-9篇文章
  const articles: ArticleData[] = []
  
  for (let i = 0; i < articleCount; i++) {
    const articleId = `${source.id}_${Date.now()}_${i}`
    
    // 根据语言生成模拟内容
    const { title, content, summary } = generateMockContent(source.language, source.category, i)
    
    articles.push({
      id: articleId,
      title,
      content,
      summary,
      sourceUrl: `${source.url}/article/${articleId}`,
      sourceId: source.id,
      language: source.language,
      category: source.category,
      featuredImage: `https://example.com/images/${articleId}.jpg`,
      author: `${source.name} Editor`
    })
  }
  
  return articles
}

// 生成模拟内容
function generateMockContent(language: string, category: string, index: number): { title: string, content: string, summary: string } {
  const templates = {
    zh: {
      titles: [
        '2024年内衣行业发展新趋势分析',
        '全球纺织品贸易市场最新动态',
        '可持续发展在服装制造业的应用',
        '智能制造技术推动内衣产业升级',
        '中国内衣出口贸易政策解读',
        '新材料技术在贴身衣物中的创新应用',
        '内衣品牌数字化转型策略研究',
        '绿色环保面料成为行业新宠'
      ],
      content: '随着全球消费者对舒适性和可持续性需求的不断提升，内衣行业正在经历前所未有的变革。本文深入分析了当前市场趋势，探讨了新技术、新材料在产品开发中的应用，以及品牌如何通过创新来满足消费者日益增长的需求。从供应链优化到数字化营销，行业参与者需要在多个维度上进行战略调整。',
      summary: '分析内衣行业最新发展趋势，探讨技术创新和市场变化对行业的影响。'
    },
    en: {
      titles: [
        '2024 Underwear Industry Trends and Market Analysis',
        'Global Textile Trade: Latest Market Developments',
        'Sustainable Manufacturing in Apparel Industry',
        'Smart Technology Driving Intimate Apparel Innovation',
        'China Underwear Export Policy Updates',
        'Advanced Materials in Intimate Wear Applications',
        'Digital Transformation Strategies for Lingerie Brands',
        'Eco-Friendly Fabrics Leading Industry Change'
      ],
      content: 'The global intimate apparel industry is experiencing unprecedented transformation driven by evolving consumer preferences for comfort, sustainability, and innovation. This comprehensive analysis examines current market trends, technological advancements in materials and manufacturing, and strategic approaches brands are adopting to meet changing consumer demands. From supply chain optimization to digital marketing strategies, industry stakeholders must adapt across multiple dimensions.',
      summary: 'Comprehensive analysis of intimate apparel industry trends, examining technological innovation and market evolution.'
    },
    ja: {
      titles: [
        '2024年下着業界のトレンドと市場分析',
        'グローバル繊維貿易の最新動向',
        'アパレル業界における持続可能な製造',
        'スマート技術がインナーウェア革新を推進',
        '中国下着輸出政策の最新情報',
        'インナーウェアにおける先進材料の応用',
        'ランジェリーブランドのデジタル変革戦略',
        '環境配慮型生地が業界変化をリード'
      ],
      content: '世界のインナーウェア業界は、快適性、持続可能性、革新性に対する消費者の嗜好の変化により、前例のない変革を経験しています。この包括的な分析では、現在の市場トレンド、材料と製造における技術的進歩、そして変化する消費者需要に応えるためにブランドが採用している戦略的アプローチを検証します。',
      summary: 'インナーウェア業界のトレンドを包括的に分析し、技術革新と市場の進化を検証。'
    }
  }
  
  const langTemplates = templates[language as keyof typeof templates] || templates.en
  const title = langTemplates.titles[index % langTemplates.titles.length]
  const content = langTemplates.content
  const summary = langTemplates.summary
  
  return { title, content, summary }
}

// AI润色处理
async function polishArticle(article: ArticleData, enableSEO: boolean): Promise<ArticleData> {
  const polishStages = [
    '分析原文结构...',
    '优化标题表达...',
    '润色内容语言...',
    '生成SEO描述...',
    '最终质量检查...'
  ]
  
  for (let i = 0; i < polishStages.length; i++) {
    // 发送润色进度更新
    parentPort?.postMessage({
      type: 'progress',
      language: article.language,
      polishStage: polishStages[i]
    })
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
  }
  
  // 应用SEO优化
  let polishedTitle = article.title
  let polishedContent = article.content
  let polishedSummary = article.summary
  
  if (enableSEO) {
    const searchEngine = article.language === 'zh' ? 'baidu' : 'google'
    polishedTitle = generateSEOTitle(article.title, article.language, searchEngine)
    polishedSummary = generateSEODescription(article.content, article.language, searchEngine)
    
    // 内容SEO优化
    const seoKeywords = getSEOKeywords(article.language, searchEngine)
    if (seoKeywords.length > 0) {
      const primaryKeyword = seoKeywords[0].keyword
      if (!polishedContent.includes(primaryKeyword)) {
        polishedContent = `${polishedContent}\n\n关键词相关：${primaryKeyword}在当前市场环境下具有重要意义。`
      }
    }
  }
  
  return {
    ...article,
    title: polishedTitle,
    content: polishedContent,
    summary: polishedSummary
  }
}

// 检查文章是否已存在
function checkArticleExists(sourceUrl: string): boolean {
  // 这里应该查询数据库，暂时用简单的内存检查
  // 在实际实现中，需要连接数据库进行查询
  return false
}

// 主要的采集处理函数
async function processCrawling() {
  const { language, sources, articlesPerLanguage, enablePolishing, enableSEO, jobId } = workerData as WorkerData
  
  try {
    // 发送开始状态
    parentPort?.postMessage({
      type: 'progress',
      language,
      status: 'crawling',
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0
    })
    
    let totalArticlesFound = 0
    let totalArticlesProcessed = 0
    let totalArticlesPolished = 0
    const processedArticles: ArticleData[] = []
    
    // 按优先级排序源
    const sortedSources = sources
      .filter(s => s.is_active)
      .sort((a, b) => b.priority - a.priority || b.quality_score - a.quality_score)
    
    // 采集阶段
    for (const source of sortedSources) {
      if (totalArticlesProcessed >= articlesPerLanguage) break
      
      try {
        // 更新当前处理的源
        parentPort?.postMessage({
          type: 'progress',
          language,
          status: 'crawling',
          currentSource: source.name,
          articlesFound: totalArticlesFound,
          articlesProcessed: totalArticlesProcessed,
          articlesPolished: totalArticlesPolished
        })
        
        // 解析RSS源
        const articles = await parseRSSFeed(source)
        totalArticlesFound += articles.length
        
        // 处理文章（去重、筛选）
        for (const article of articles) {
          if (totalArticlesProcessed >= articlesPerLanguage) break
          
          // 检查是否已存在
          if (checkArticleExists(article.sourceUrl)) {
            continue // 跳过已存在的文章
          }
          
          // 更新当前处理的文章
          parentPort?.postMessage({
            type: 'progress',
            language,
            status: 'crawling',
            currentSource: source.name,
            currentArticleTitle: article.title,
            articlesFound: totalArticlesFound,
            articlesProcessed: totalArticlesProcessed + 1,
            articlesPolished: totalArticlesPolished
          })
          
          processedArticles.push(article)
          totalArticlesProcessed++
          
          // 模拟处理时间
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
      } catch (error) {
        console.error(`处理源 ${source.name} 失败:`, error)
        // 继续处理下一个源
      }
    }
    
    // 润色阶段
    if (enablePolishing && processedArticles.length > 0) {
      parentPort?.postMessage({
        type: 'progress',
        language,
        status: 'polishing',
        articlesFound: totalArticlesFound,
        articlesProcessed: totalArticlesProcessed,
        articlesPolished: 0
      })
      
      for (let i = 0; i < processedArticles.length; i++) {
        const article = processedArticles[i]
        
        parentPort?.postMessage({
          type: 'progress',
          language,
          status: 'polishing',
          currentArticleTitle: article.title,
          articlesFound: totalArticlesFound,
          articlesProcessed: totalArticlesProcessed,
          articlesPolished: i,
          polishStage: '开始润色处理...'
        })
        
        // 执行润色
        const polishedArticle = await polishArticle(article, enableSEO)
        processedArticles[i] = polishedArticle
        totalArticlesPolished++
        
        parentPort?.postMessage({
          type: 'progress',
          language,
          status: 'polishing',
          articlesFound: totalArticlesFound,
          articlesProcessed: totalArticlesProcessed,
          articlesPolished: totalArticlesPolished
        })
      }
    }
    
    // 完成
    parentPort?.postMessage({
      type: 'progress',
      language,
      status: 'completed',
      articlesFound: totalArticlesFound,
      articlesProcessed: totalArticlesProcessed,
      articlesPolished: totalArticlesPolished
    })
    
    // 返回处理结果
    parentPort?.postMessage({
      type: 'completed',
      language,
      articles: processedArticles
    })
    
  } catch (error) {
    parentPort?.postMessage({
      type: 'progress',
      language,
      status: 'failed',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

// 启动处理
if (parentPort) {
  processCrawling()
}
