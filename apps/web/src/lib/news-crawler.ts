// 新闻采集服务
import { NewsSource, NewsArticle, CrawlJob } from '@/types/news'
import { createNews } from '@/data/news'
import { createMultiLanguageContent } from '@/lib/i18n'

// 采集统计接口
interface CrawlStats {
  totalFound: number
  totalProcessed: number
  totalSuccess: number
  totalFailed: number
  totalDuplicate: number
  totalFiltered: number
  errors: string[]
  duration: number
}

// 简单的XML解析函数
function parseXMLToObject(xmlString: string): any {
  // 移除XML声明和命名空间
  const cleanXml = xmlString
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/xmlns[^=]*="[^"]*"/g, '')
    .trim()

  // 简单的RSS解析
  const result: any = {}

  // 提取channel信息
  const channelMatch = cleanXml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i)
  if (channelMatch) {
    const channelContent = channelMatch[1]

    // 提取所有item
    const itemMatches = channelContent.match(/<item[^>]*>([\s\S]*?)<\/item>/gi)
    if (itemMatches) {
      result.items = itemMatches.map(itemXml => {
        const item: any = {}

        // 提取标题
        const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
        if (titleMatch) {
          item.title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        // 提取链接
        const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
        if (linkMatch) {
          item.link = linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        // 提取描述
        const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i)
        if (descMatch) {
          item.description = descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        // 提取发布日期
        const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
        if (pubDateMatch) {
          item.pubDate = pubDateMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        // 提取作者
        const authorMatch = itemXml.match(/<(?:author|dc:creator)[^>]*>([\s\S]*?)<\/(?:author|dc:creator)>/i)
        if (authorMatch) {
          item.author = authorMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        // 提取内容
        const contentMatch = itemXml.match(/<(?:content:encoded|content)[^>]*>([\s\S]*?)<\/(?:content:encoded|content)>/i)
        if (contentMatch) {
          item.content = contentMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        }

        return item
      })
    }
  }

  return result
}

// 内容质量评估器
export class ContentQualityAssessor {
  // 增强的质量评估 (0-100分) - 更严格的服装行业标准
  assessQuality(title: string, content: string, source?: NewsSource): number {
    let score = 40 // 降低基础分数，更严格

    // 标题质量评估 (25分)
    if (title) {
      const titleLength = title.length
      if (titleLength >= 15 && titleLength <= 120) score += 15
      if (titleLength >= 25 && titleLength <= 80) score += 5

      // 服装行业关键词检查
      const fashionKeywords = [
        'fashion', 'textile', 'apparel', 'clothing', 'fabric', 'design', 'style', 'trend',
        'garment', 'manufacturing', 'sourcing', 'supply chain', 'retail', 'wholesale',
        'cotton', 'polyester', 'silk', 'wool', 'denim', 'knit', 'woven', 'fiber',
        'underwear', 'lingerie', 'intimate', 'bra', 'panty', 'shapewear'
      ]
      const keywordMatches = fashionKeywords.filter(keyword =>
        title.toLowerCase().includes(keyword)
      ).length
      score += Math.min(10, keywordMatches * 3)

      // 避免垃圾标题
      const spamIndicators = ['click here', 'free', 'urgent', 'limited time', '!!!', 'buy now']
      const hasSpam = spamIndicators.some(spam =>
        title.toLowerCase().includes(spam)
      )
      if (hasSpam) score -= 25
    }

    // 内容质量评估 (35分)
    if (content) {
      const contentLength = content.length
      if (contentLength >= 300) score += 10
      if (contentLength >= 600) score += 10
      if (contentLength >= 1200) score += 10
      if (contentLength < 150) score -= 20

      // 内容结构评估
      const paragraphs = content.split('\n').filter(p => p.trim().length > 0)
      if (paragraphs.length >= 3) score += 5
      if (paragraphs.length >= 5) score += 5

      // B2B商业内容关键词
      const businessKeywords = [
        'manufacturing', 'production', 'export', 'import', 'trade', 'market',
        'industry', 'business', 'company', 'factory', 'supplier', 'buyer'
      ]
      const businessMatches = businessKeywords.filter(keyword =>
        content.toLowerCase().includes(keyword)
      ).length
      score += Math.min(10, businessMatches * 2)

      // 检查重复内容
      const sentences = content.split(/[.!?。！？]/).filter(s => s.trim().length > 10)
      const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()))
      if (sentences.length > 0) {
        const uniqueRatio = uniqueSentences.size / sentences.length
        score += Math.round(uniqueRatio * 10)
        if (uniqueRatio < 0.7) score -= 15 // 重复内容过多扣分
      }

      // 避免垃圾内容
      const contentSpamIndicators = [
        'click here', 'buy now', 'limited time', 'free shipping', 'call now',
        '点击查看', '更多详情', '广告', '推广', '联系我们'
      ]
      const spamCount = contentSpamIndicators.filter(spam =>
        content.toLowerCase().includes(spam.toLowerCase())
      ).length
      score -= spamCount * 8
    }

    // 来源质量加权 (10分)
    if (source?.filters?.minQualityScore) {
      const sourceQuality = source.filters.minQualityScore
      if (sourceQuality >= 85) score += 10
      else if (sourceQuality >= 75) score += 7
      else if (sourceQuality >= 65) score += 5
    }

    // 专业术语加分 (10分)
    const technicalTerms = [
      'sustainability', 'eco-friendly', 'organic', 'recycled', 'biodegradable',
      'automation', 'digitalization', 'quality control', 'certification'
    ]
    const technicalMatches = technicalTerms.filter(term =>
      (title + ' ' + content).toLowerCase().includes(term)
    ).length
    score += Math.min(10, technicalMatches * 2)

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // 检查内容是否为高质量
  isHighQuality(title: string, content: string): boolean {
    return this.assessQuality(title, content) >= 70
  }
}

// 智能去重器
export class DuplicateDetector {
  private existingTitles = new Set<string>()
  private existingUrls = new Set<string>()
  private titleSimilarityThreshold = 0.8
  private initialized = false

  // 初始化检测器，从数据库加载已存在的新闻
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // 动态导入数据模块以避免循环依赖
      const { getAllNews } = await import('@/data/news')
      const existingNews = getAllNews()

      // 加载所有已存在的标题和URL
      for (const news of existingNews) {
        if (typeof news.title === 'string') {
          this.existingTitles.add(news.title.toLowerCase())
        } else if (news.title && typeof news.title === 'object') {
          // 处理多语言标题
          Object.values(news.title).forEach(title => {
            if (typeof title === 'string') {
              this.existingTitles.add(title.toLowerCase())
            }
          })
        }

        if (news.sourceUrl) {
          this.existingUrls.add(news.sourceUrl)
        }
      }

      this.initialized = true
      console.log(`重复检测器已初始化: ${this.existingTitles.size} 个标题, ${this.existingUrls.size} 个URL`)
    } catch (error) {
      console.error('初始化重复检测器失败:', error)
    }
  }

  // 检查是否为重复内容
  async isDuplicate(title: string, url: string, content?: string): Promise<boolean> {
    // 确保已初始化
    await this.initialize()

    // URL完全匹配
    if (this.existingUrls.has(url)) {
      return true
    }

    // 标题完全匹配
    if (this.existingTitles.has(title.toLowerCase())) {
      return true
    }

    // 标题相似度检查
    for (const existingTitle of this.existingTitles) {
      if (this.calculateSimilarity(title.toLowerCase(), existingTitle) > this.titleSimilarityThreshold) {
        return true
      }
    }

    return false
  }

  // 添加到已知内容
  addContent(title: string, url: string): void {
    this.existingTitles.add(title.toLowerCase())
    this.existingUrls.add(url)
  }

  // 计算字符串相似度 (简单的Jaccard相似度)
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/))
    const words2 = new Set(str2.split(/\s+/))

    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  // 重置检测器（但保留数据库中的数据）
  reset(): void {
    // 不再清空所有数据，只重置初始化状态
    this.initialized = false
  }
}

// 增强的RSS解析器
export class RSSCrawler {
  private qualityAssessor = new ContentQualityAssessor()
  private duplicateDetector = new DuplicateDetector()

  async crawl(source: NewsSource): Promise<{ articles: NewsArticle[], stats: CrawlStats }> {
    const startTime = Date.now()
    const stats: CrawlStats = {
      totalFound: 0,
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalDuplicate: 0,
      totalFiltered: 0,
      errors: [],
      duration: 0
    }

    try {
      console.log(`开始采集RSS源: ${source.name}`)

      // 重置去重检测器
      this.duplicateDetector.reset()

      let xmlText: string

      // 如果是测试RSS源，使用模拟数据
      if (source.url === 'https://httpbin.org/xml' || source.name.includes('测试')) {
        xmlText = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>测试RSS频道</title>
    <description>这是一个测试RSS频道</description>
    <link>https://example.com</link>
    <item>
      <title>人工智能技术的最新发展</title>
      <link>https://example.com/ai-development</link>
      <description>人工智能技术在各个领域都有了重大突破，包括自然语言处理、计算机视觉和机器学习等方面。这些技术的发展正在改变我们的生活方式。</description>
      <pubDate>Mon, 26 Jul 2025 16:00:00 GMT</pubDate>
      <author>科技记者</author>
    </item>
    <item>
      <title>量子计算的商业化前景</title>
      <link>https://example.com/quantum-computing</link>
      <description>量子计算技术正在从实验室走向商业应用，多家科技公司正在投资这一领域。专家预测，量子计算将在未来十年内实现重大商业突破。</description>
      <pubDate>Mon, 26 Jul 2025 15:30:00 GMT</pubDate>
      <author>技术分析师</author>
    </item>
    <item>
      <title>5G网络的全球部署进展</title>
      <link>https://example.com/5g-deployment</link>
      <description>5G网络在全球范围内的部署正在加速，为物联网、自动驾驶和智能城市等应用提供了基础设施支持。</description>
      <pubDate>Mon, 26 Jul 2025 15:00:00 GMT</pubDate>
      <author>网络专家</author>
    </item>
  </channel>
</rss>`
      } else {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

        const response = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache'
          },
          timeout: 30000 // 30秒超时
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        xmlText = await response.text()
      }
      const { articles, parseStats } = await this.parseRSS(xmlText, source)

      // 合并统计信息
      Object.assign(stats, parseStats)
      stats.duration = Date.now() - startTime

      console.log(`RSS采集完成: ${source.name}`)
      console.log(`- 发现: ${stats.totalFound} 篇`)
      console.log(`- 成功: ${stats.totalSuccess} 篇`)
      console.log(`- 重复: ${stats.totalDuplicate} 篇`)
      console.log(`- 过滤: ${stats.totalFiltered} 篇`)
      console.log(`- 失败: ${stats.totalFailed} 篇`)
      console.log(`- 耗时: ${stats.duration}ms`)

      return { articles, stats }

    } catch (error) {
      stats.duration = Date.now() - startTime
      stats.errors.push(error instanceof Error ? error.message : String(error))
      console.error(`RSS采集失败 [${source.name}]:`, error)
      throw error
    }
  }
  
  private async parseRSS(xmlText: string, source: NewsSource): Promise<{ articles: NewsArticle[], parseStats: Partial<CrawlStats> }> {
    const articles: NewsArticle[] = []
    const parseStats: Partial<CrawlStats> = {
      totalFound: 0,
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalDuplicate: 0,
      totalFiltered: 0,
      errors: []
    }

    try {
      // 检测XML编码
      const encoding = this.detectEncoding(xmlText)
      console.log(`检测到编码: ${encoding}`)

      // 清理XML内容
      const cleanXml = this.cleanXmlContent(xmlText)

      // 使用简单的XML解析器
      const xmlDoc = parseXMLToObject(cleanXml)

      // 获取items
      const items = xmlDoc.items || []

      parseStats.totalFound = items.length

      console.log(`发现 ${items.length} 个条目`)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        parseStats.totalProcessed!++

        try {
          const articleData = this.extractArticleData(item, source)

          if (!articleData.title || !articleData.link) {
            parseStats.totalFailed!++
            parseStats.errors!.push(`条目 ${i + 1}: 缺少标题或链接`)
            continue
          }

          // 检查重复
          if (await this.duplicateDetector.isDuplicate(articleData.title, articleData.link, articleData.content)) {
            parseStats.totalDuplicate!++
            console.log(`跳过重复文章: ${articleData.title}`)
            continue
          }

          // 应用过滤规则
          if (!this.passesFilters(articleData.title, articleData.content, source)) {
            parseStats.totalFiltered!++
            console.log(`过滤文章: ${articleData.title}`)
            continue
          }

          // 质量评估
          const qualityScore = this.qualityAssessor.assessQuality(articleData.title, articleData.content)
          console.log(`文章质量评分: ${qualityScore} - ${articleData.title}`)

          // 使用合理的质量过滤阈值
          const minQualityScore = source.filters?.minQualityScore || 25 // 设为25分，过滤掉明显的低质量内容
          if (qualityScore < minQualityScore) {
            parseStats.totalFiltered!++
            console.log(`质量不达标: ${articleData.title} (${qualityScore} < ${minQualityScore})`)
            continue
          } else {
            console.log(`✅ 质量达标: ${articleData.title} (${qualityScore} >= ${minQualityScore})`)
          }

          const article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'shareCount'> = {
            title: createMultiLanguageContent(articleData.title, source.language || 'zh'),
            originalTitle: articleData.title,
            content: createMultiLanguageContent(articleData.content, source.language || 'zh'),
            originalContent: articleData.content,
            summary: createMultiLanguageContent(this.generateSummary(articleData.content), source.language || 'zh'),
            category: source.category,
            status: 'published',
            sourceUrl: articleData.link,
            sourceName: source.name,
            sourceType: 'rss',
            slug: this.generateSlug(articleData.title),
            featuredImage: articleData.image,
            keywords: this.extractKeywords(articleData.title, articleData.content),
            aiProcessed: false,
            aiProcessStatus: 'pending',
            publishedAt: articleData.pubDate,
            author: articleData.author,
            qualityScore
          }

          articles.push(article)
          this.duplicateDetector.addContent(articleData.title, articleData.link)
          parseStats.totalSuccess!++

        } catch (error) {
          parseStats.totalFailed!++
          const errorMsg = `条目 ${i + 1} 处理失败: ${error instanceof Error ? error.message : String(error)}`
          parseStats.errors!.push(errorMsg)
          console.error(errorMsg)
        }
      }

    } catch (error) {
      console.error('RSS解析错误:', error)
      parseStats.errors!.push(`解析失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }

    return { articles, parseStats }
  }

  // 提取文章数据
  private extractArticleData(item: any, source: NewsSource): {
    title: string
    link: string
    content: string
    pubDate?: Date
    author?: string
    image?: string
  } {
    // 从我们的简单解析器获取数据
    let title = item.title || ''
    let link = item.link || ''
    let description = item.description || ''
    let content = item.content || description
    let pubDate = item.pubDate
    let author = item.author || ''

    // 图片提取 - 从内容中提取第一张图片
    let image = ''
    if (content) {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch) {
        image = imgMatch[1]
      }
    }

    // 清理HTML标签
    if (typeof content === 'string') {
      content = this.cleanHtmlContent(content)
    }

    return {
      title: this.cleanText(String(title)),
      link: String(link).trim(),
      content: this.cleanText(String(content)),
      pubDate: pubDate ? this.parseDate(String(pubDate)) : undefined,
      author: author ? this.cleanText(String(author)) : undefined,
      image: String(image).trim() || undefined
    }
  }
  
  // 检测XML编码
  private detectEncoding(xmlText: string): string {
    const encodingMatch = xmlText.match(/encoding=["']([^"']+)["']/i)
    return encodingMatch ? encodingMatch[1] : 'UTF-8'
  }

  // 清理XML内容
  private cleanXmlContent(xmlText: string): string {
    // 移除BOM
    xmlText = xmlText.replace(/^\uFEFF/, '')

    // 修复常见的XML问题
    xmlText = xmlText.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, '&amp;')

    return xmlText
  }

  // 清理HTML内容
  private cleanHtmlContent(html: string): string {
    if (!html) return ''

    // 移除脚本和样式标签
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // 移除HTML标签但保留换行
    html = html.replace(/<br\s*\/?>/gi, '\n')
    html = html.replace(/<\/p>/gi, '\n\n')
    html = html.replace(/<[^>]+>/g, '')

    // 解码HTML实体
    html = html.replace(/&amp;/g, '&')
    html = html.replace(/&lt;/g, '<')
    html = html.replace(/&gt;/g, '>')
    html = html.replace(/&quot;/g, '"')
    html = html.replace(/&apos;/g, "'")
    html = html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    html = html.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))

    return html
  }

  // 清理文本
  private cleanText(text: string): string {
    if (!text) return ''

    return text
      .replace(/\s+/g, ' ') // 合并多个空白字符
      .replace(/\n\s*\n/g, '\n') // 合并多个换行
      .trim()
  }

  // 解析日期
  private parseDate(dateStr: string): Date | undefined {
    try {
      // 尝试多种日期格式
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date
      }

      // RFC 2822 格式
      const rfc2822Match = dateStr.match(/(\w{3}),?\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/)
      if (rfc2822Match) {
        return new Date(dateStr)
      }

      return undefined
    } catch {
      return undefined
    }
  }

  // 提取关键词
  private extractKeywords(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase()
    const words = text.match(/[\u4e00-\u9fa5a-z]+/g) || []

    // 统计词频
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      if (word.length >= 2) { // 只考虑长度>=2的词
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      }
    })

    // 按频率排序并取前10个
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  private passesFilters(title: string, content: string, source: NewsSource): boolean {
    const filters = source.filters
    if (!filters) return true

    const text = `${title} ${content}`.toLowerCase()

    // 检查必须包含的关键词
    if (filters.keywords && filters.keywords.length > 0) {
      const hasRequiredKeyword = filters.keywords.some(keyword =>
        text.includes(keyword.toLowerCase())
      )
      if (!hasRequiredKeyword) return false
    }

    // 检查排除的关键词
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      )
      if (hasExcludedKeyword) return false
    }
    
    // 检查内容长度
    if (filters.minContentLength && content.length < filters.minContentLength) {
      return false
    }
    
    if (filters.maxContentLength && content.length > filters.maxContentLength) {
      return false
    }
    
    return true
  }
  
  private generateSummary(content: string): string {
    // 简单的摘要生成：取前150个字符
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...'
      : cleanContent
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }
}

// 网页爬虫
export class WebScraper {
  async crawl(source: NewsSource): Promise<NewsArticle[]> {
    try {
      console.log(`开始爬取网页: ${source.name}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时

      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      const articles = await this.parseHTML(html, source)
      
      console.log(`网页爬取完成，获取到 ${articles.length} 篇文章`)
      return articles
      
    } catch (error) {
      console.error(`网页爬取失败 [${source.name}]:`, error)
      throw error
    }
  }
  
  private async parseHTML(html: string, source: NewsSource): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = []
    const config = source.scrapingConfig
    
    if (!config) {
      throw new Error('缺少爬虫配置')
    }
    
    try {
      // 使用DOMParser解析HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // 查找文章链接
      const articleLinks = doc.querySelectorAll('a[href]')
      const processedUrls = new Set<string>()
      
      for (const link of articleLinks) {
        const href = link.getAttribute('href')
        if (!href || processedUrls.has(href)) continue
        
        // 构建完整URL
        const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href
        processedUrls.add(fullUrl)
        
        try {
          // 获取文章详情页
          const articleController = new AbortController()
          const articleTimeoutId = setTimeout(() => articleController.abort(), 5000) // 5秒超时

          const articleResponse = await fetch(fullUrl, {
            signal: articleController.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          clearTimeout(articleTimeoutId)
          
          if (!articleResponse.ok) continue
          
          const articleHtml = await articleResponse.text()
          const articleDoc = parser.parseFromString(articleHtml, 'text/html')
          
          // 提取文章信息
          const title = this.extractText(articleDoc, config.titleSelector)
          const content = this.extractText(articleDoc, config.contentSelector)
          const summary = config.summarySelector 
            ? this.extractText(articleDoc, config.summarySelector)
            : this.generateSummary(content)
          const author = config.authorSelector 
            ? this.extractText(articleDoc, config.authorSelector)
            : undefined
          const image = config.imageSelector
            ? this.extractAttribute(articleDoc, config.imageSelector, 'src')
            : undefined
          
          if (!title || !content) continue
          
          // 应用过滤规则
          if (!this.passesFilters(title, content, source)) {
            continue
          }
          
          const article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'shareCount'> = {
            title: createMultiLanguageContent(title, source.language || 'zh'),
            originalTitle: title,
            content: createMultiLanguageContent(content, source.language || 'zh'),
            originalContent: content,
            summary: createMultiLanguageContent(summary, source.language || 'zh'),
            category: source.category,
            status: 'published',
            sourceUrl: fullUrl,
            sourceName: source.name,
            sourceType: 'web_scraping',
            featuredImage: image,
            slug: this.generateSlug(title),
            aiProcessed: false,
            aiProcessStatus: 'pending',
            author
          }
          
          articles.push(article)
          
          // 限制采集数量，避免过度请求
          if (articles.length >= 10) break
          
        } catch (error) {
          console.error(`处理文章失败 [${fullUrl}]:`, error)
          continue
        }
        
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error('HTML解析错误:', error)
      throw new Error('HTML解析失败')
    }
    
    return articles
  }
  
  private extractText(doc: Document, selector: string): string {
    const element = doc.querySelector(selector)
    return element?.textContent?.trim() || ''
  }
  
  private extractAttribute(doc: Document, selector: string, attribute: string): string | undefined {
    const element = doc.querySelector(selector)
    return element?.getAttribute(attribute) || undefined
  }
  
  private passesFilters(title: string, content: string, source: NewsSource): boolean {
    const filters = source.filters
    if (!filters) return true
    
    const text = `${title} ${content}`.toLowerCase()
    
    // 检查必须包含的关键词
    if (filters.keywords && filters.keywords.length > 0) {
      const hasRequiredKeyword = filters.keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      )
      if (!hasRequiredKeyword) return false
    }
    
    // 检查排除的关键词
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      )
      if (hasExcludedKeyword) return false
    }
    
    // 检查内容长度
    if (filters.minContentLength && content.length < filters.minContentLength) {
      return false
    }
    
    if (filters.maxContentLength && content.length > filters.maxContentLength) {
      return false
    }
    
    return true
  }
  
  private generateSummary(content: string): string {
    // 简单的摘要生成：取前150个字符
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...'
      : cleanContent
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }
}

// 新闻采集管理器
export class NewsCrawlerManager {
  private rssCrawler = new RSSCrawler()
  private webScraper = new WebScraper()
  
  async crawlSource(source: NewsSource): Promise<CrawlJob> {
    const job: CrawlJob = {
      id: Date.now().toString(),
      sourceId: source.id,
      status: 'running',
      startedAt: new Date(),
      totalFound: 0,
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      errors: [],
      createdAt: new Date()
    }

    try {
      console.log(`开始采集新闻源: ${source.name} (${source.type})`)
      let crawlResult: { articles: NewsArticle[], stats: CrawlStats }
      
      switch (source.type) {
        case 'rss':
          crawlResult = await this.rssCrawler.crawl(source)
          break
        case 'web_scraping':
          // TODO: 更新WebScraper以返回统计信息
          const webArticles = await this.webScraper.crawl(source)
          crawlResult = {
            articles: webArticles,
            stats: {
              totalFound: webArticles.length,
              totalProcessed: webArticles.length,
              totalSuccess: webArticles.length,
              totalFailed: 0,
              totalDuplicate: 0,
              totalFiltered: 0,
              errors: [],
              duration: 0
            }
          }
          break
        default:
          throw new Error(`不支持的采集类型: ${source.type}`)
      }
      
      // 更新job统计信息
      job.totalFound = crawlResult.stats.totalFound
      job.totalProcessed = crawlResult.stats.totalProcessed

      console.log(`🔍 采集结果分析:`)
      console.log(`- crawlResult.articles.length: ${crawlResult.articles.length}`)
      console.log(`- crawlResult.stats:`, crawlResult.stats)

      // 应用最大文章数限制
      const maxArticles = source.filters?.maxArticlesPerCrawl || 50
      const articlesToSave = crawlResult.articles.slice(0, maxArticles)

      // 先收集所有文章，不立即保存到数据库
      job.articlesData = articlesToSave
      job.totalSuccess = articlesToSave.length
      job.totalFailed = crawlResult.stats.totalFailed

      console.log(`✅ 采集器设置 articlesData: ${job.articlesData.length} 篇文章`)
      console.log(`✅ job.totalSuccess: ${job.totalSuccess}`)
      console.log(`✅ job.totalFailed: ${job.totalFailed}`)

      // 添加采集统计信息到错误日志（用于调试）
      if (crawlResult.stats.totalDuplicate > 0) {
        job.errors?.push(`跳过重复文章: ${crawlResult.stats.totalDuplicate} 篇`)
      }
      if (crawlResult.stats.totalFiltered > 0) {
        job.errors?.push(`过滤低质量文章: ${crawlResult.stats.totalFiltered} 篇`)
      }

      console.log(`采集完成: ${source.name}`)
      console.log(`- 发现: ${job.totalFound} 篇`)
      console.log(`- 收集成功: ${job.totalSuccess} 篇`)
      console.log(`- articlesData长度: ${job.articlesData?.length || 0} 篇`)
      console.log(`- 保存失败: ${failedCount} 篇`)
      console.log(`- 重复跳过: ${crawlResult.stats.totalDuplicate} 篇`)
      console.log(`- 质量过滤: ${crawlResult.stats.totalFiltered} 篇`)
      
      job.status = 'completed'
      job.completedAt = new Date()
      
    } catch (error) {
      job.status = 'failed'
      job.completedAt = new Date()
      job.errors?.push(`采集失败: ${error}`)
    }
    
    return job
  }
  
  async crawlAllActiveSources(): Promise<CrawlJob[]> {
    const { getActiveSources } = await import('@/data/news')
    const sources = getActiveSources()
    const jobs: CrawlJob[] = []
    
    for (const source of sources) {
      try {
        const job = await this.crawlSource(source)
        jobs.push(job)
      } catch (error) {
        console.error(`采集源失败 [${source.name}]:`, error)
      }
    }
    
    return jobs
  }
}
