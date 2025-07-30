// AI新闻处理服务
import { NewsArticle, AIProcessConfig, AIProcessJob } from '@/types/news'
import { updateNews } from '@/data/news'

// AI服务提供商接口
interface AIProvider {
  processText(prompt: string, text: string): Promise<string>
}

// OpenAI服务实现
class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor(apiKey: string, model: string = 'gpt-4', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl
  }

  async processText(prompt: string, text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的新闻编辑，擅长改写和润色新闻内容。'
            },
            {
              role: 'user',
              content: `${prompt}\n\n${text}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''

    } catch (error) {
      console.error('OpenAI处理错误:', error)
      throw error
    }
  }
}

// Claude服务实现（模拟）
class ClaudeProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey
    this.model = model
  }

  async processText(prompt: string, text: string): Promise<string> {
    // 这里应该实现真实的Claude API调用
    // 目前返回模拟处理结果
    console.log('使用Claude处理文本:', prompt.substring(0, 50) + '...')
    
    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的文本处理模拟
    if (prompt.includes('标题')) {
      return `【AI优化】${text}`
    } else if (prompt.includes('摘要')) {
      return `${text.substring(0, 100)}...（AI生成摘要）`
    } else if (prompt.includes('关键词')) {
      return 'AI, 技术, 新闻, 科技, 创新'
    } else {
      return `${text}\n\n（本文已通过AI润色优化）`
    }
  }
}

// 本地AI服务实现（模拟）
class LocalAIProvider implements AIProvider {
  async processText(prompt: string, text: string): Promise<string> {
    console.log('使用本地AI处理文本:', prompt.substring(0, 50) + '...')
    
    // 模拟本地AI处理
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 简单的规则处理
    if (prompt.includes('标题')) {
      return text.length > 50 ? text.substring(0, 50) + '...' : text
    } else if (prompt.includes('摘要')) {
      const sentences = text.split('。').filter(s => s.trim().length > 0)
      return sentences.slice(0, 2).join('。') + '。'
    } else if (prompt.includes('关键词')) {
      // 简单的关键词提取
      const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
      return words.slice(0, 5).join(', ')
    } else {
      return text
    }
  }
}

// AI处理器主类
export class AINewsProcessor {
  private providers: Map<string, AIProvider> = new Map()

  constructor() {
    // 初始化AI服务提供商
    this.initializeProviders()
  }

  private initializeProviders() {
    // 注册OpenAI提供商
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(
        process.env.OPENAI_API_KEY,
        'gpt-4',
        process.env.OPENAI_BASE_URL
      ))
    }

    // 注册Claude提供商
    if (process.env.CLAUDE_API_KEY) {
      this.providers.set('claude', new ClaudeProvider(process.env.CLAUDE_API_KEY))
    }

    // 注册本地AI提供商（总是可用）
    this.providers.set('local', new LocalAIProvider())
  }

  async processArticle(articleId: string, config: AIProcessConfig): Promise<AIProcessJob> {
    const job: AIProcessJob = {
      id: Date.now().toString(),
      articleId,
      configId: config.id,
      status: 'processing',
      startedAt: new Date(),
      createdAt: new Date()
    }

    try {
      // 获取文章数据
      const { getNewsById } = await import('@/data/news')
      const article = getNewsById(articleId)
      
      if (!article) {
        throw new Error('文章不存在')
      }

      // 获取AI提供商
      const provider = this.providers.get(config.provider)
      if (!provider) {
        throw new Error(`不支持的AI提供商: ${config.provider}`)
      }

      const result: any = {}

      // 处理标题重写
      if (config.options.rewriteTitle && config.prompts.titleRewrite) {
        try {
          const newTitle = await provider.processText(
            config.prompts.titleRewrite,
            article.originalTitle || article.title
          )
          if (newTitle && newTitle.length <= config.limits.maxTitleLength) {
            result.title = newTitle.trim()
          }
        } catch (error) {
          console.error('标题重写失败:', error)
        }
      }

      // 处理内容重写
      if (config.options.rewriteContent && config.prompts.contentRewrite) {
        try {
          const newContent = await provider.processText(
            config.prompts.contentRewrite,
            article.originalContent || article.content
          )
          if (newContent) {
            result.content = newContent.trim()
          }
        } catch (error) {
          console.error('内容重写失败:', error)
        }
      }

      // 生成摘要
      if (config.options.generateSummary && config.prompts.summaryGeneration) {
        try {
          const summary = await provider.processText(
            config.prompts.summaryGeneration,
            article.originalContent || article.content
          )
          if (summary && summary.length <= config.limits.maxSummaryLength) {
            result.summary = summary.trim()
          }
        } catch (error) {
          console.error('摘要生成失败:', error)
        }
      }

      // 提取关键词
      if (config.options.generateKeywords && config.prompts.keywordExtraction) {
        try {
          const keywordsText = await provider.processText(
            config.prompts.keywordExtraction,
            article.originalContent || article.content
          )
          if (keywordsText) {
            const keywords = keywordsText
              .split(/[,，、]/)
              .map(k => k.trim())
              .filter(k => k.length > 0)
              .slice(0, config.limits.maxKeywords)
            result.keywords = keywords
          }
        } catch (error) {
          console.error('关键词提取失败:', error)
        }
      }

      // 更新文章
      const updateData: any = {
        aiProcessed: true,
        aiProcessStatus: 'completed',
        aiProcessedAt: new Date()
      }

      if (result.title) updateData.title = result.title
      if (result.content) updateData.content = result.content
      if (result.summary) updateData.summary = result.summary
      if (result.keywords) updateData.keywords = result.keywords

      updateNews(articleId, updateData)

      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result

    } catch (error) {
      job.status = 'failed'
      job.completedAt = new Date()
      job.error = error instanceof Error ? error.message : '处理失败'
    }

    return job
  }

  async batchProcessArticles(articleIds: string[], config: AIProcessConfig): Promise<AIProcessJob[]> {
    const jobs: AIProcessJob[] = []

    for (const articleId of articleIds) {
      try {
        const job = await this.processArticle(articleId, config)
        jobs.push(job)
        
        // 添加延迟，避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`处理文章失败 [${articleId}]:`, error)
        
        const failedJob: AIProcessJob = {
          id: Date.now().toString(),
          articleId,
          configId: config.id,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          error: error instanceof Error ? error.message : '处理失败',
          createdAt: new Date()
        }
        
        jobs.push(failedJob)
      }
    }

    return jobs
  }

  // 获取可用的AI提供商列表
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  // 测试AI提供商连接
  async testProvider(providerName: string): Promise<boolean> {
    const provider = this.providers.get(providerName)
    if (!provider) return false

    try {
      const result = await provider.processText(
        '请简单回复"测试成功"',
        '这是一个连接测试'
      )
      return result.includes('测试') || result.includes('成功') || result.length > 0
    } catch (error) {
      console.error(`测试AI提供商失败 [${providerName}]:`, error)
      return false
    }
  }
}
