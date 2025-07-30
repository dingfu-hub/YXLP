// 新闻采集任务调度器
import { NewsCrawlerManager } from './news-crawler'
import { AINewsProcessor } from './ai-processor'
import { getActiveSources, getDefaultAIConfig, getNewsByStatus } from '@/data/news'

// 任务调度器类
export class NewsScheduler {
  private crawler = new NewsCrawlerManager()
  private aiProcessor = new AINewsProcessor()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  // 启动调度器
  start() {
    if (this.isRunning) {
      console.log('新闻调度器已在运行')
      return
    }

    this.isRunning = true
    console.log('启动新闻调度器')

    // 启动采集任务调度
    this.startCrawlScheduler()
    
    // 启动AI处理任务调度
    this.startAIProcessScheduler()
    
    // 启动清理任务调度
    this.startCleanupScheduler()
  }

  // 停止调度器
  stop() {
    if (!this.isRunning) {
      console.log('新闻调度器未在运行')
      return
    }

    this.isRunning = false
    console.log('停止新闻调度器')

    // 清除所有定时器
    this.intervals.forEach((interval, key) => {
      clearInterval(interval)
      console.log(`清除定时器: ${key}`)
    })
    this.intervals.clear()
  }

  // 启动采集任务调度
  private startCrawlScheduler() {
    // 每5分钟检查一次采集任务
    const crawlInterval = setInterval(async () => {
      try {
        await this.checkAndExecuteCrawlTasks()
      } catch (error) {
        console.error('采集任务调度错误:', error)
      }
    }, 5 * 60 * 1000) // 5分钟

    this.intervals.set('crawl', crawlInterval)
    console.log('采集任务调度器已启动 (每5分钟检查一次)')

    // 立即执行一次检查
    this.checkAndExecuteCrawlTasks().catch(error => {
      console.error('初始采集任务检查错误:', error)
    })
  }

  // 启动AI处理任务调度
  private startAIProcessScheduler() {
    // 每10分钟检查一次AI处理任务
    const aiInterval = setInterval(async () => {
      try {
        await this.checkAndExecuteAITasks()
      } catch (error) {
        console.error('AI处理任务调度错误:', error)
      }
    }, 10 * 60 * 1000) // 10分钟

    this.intervals.set('ai', aiInterval)
    console.log('AI处理任务调度器已启动 (每10分钟检查一次)')

    // 延迟2分钟后执行第一次检查，避免与采集任务冲突
    setTimeout(() => {
      this.checkAndExecuteAITasks().catch(error => {
        console.error('初始AI处理任务检查错误:', error)
      })
    }, 2 * 60 * 1000)
  }

  // 启动清理任务调度
  private startCleanupScheduler() {
    // 每小时执行一次清理任务
    const cleanupInterval = setInterval(async () => {
      try {
        await this.executeCleanupTasks()
      } catch (error) {
        console.error('清理任务调度错误:', error)
      }
    }, 60 * 60 * 1000) // 1小时

    this.intervals.set('cleanup', cleanupInterval)
    console.log('清理任务调度器已启动 (每小时执行一次)')
  }

  // 检查并执行采集任务
  private async checkAndExecuteCrawlTasks() {
    console.log('检查采集任务...')
    
    const sources = getActiveSources()
    const now = new Date()

    for (const source of sources) {
      try {
        // 检查是否需要采集
        const shouldCrawl = this.shouldExecuteCrawl(source, now)
        
        if (shouldCrawl) {
          console.log(`开始采集源: ${source.name}`)
          const job = await this.crawler.crawlSource(source)
          console.log(`采集完成: ${source.name}, 成功: ${job.totalSuccess}, 失败: ${job.totalFailed}`)
          
          // 更新最后采集时间
          source.lastCrawledAt = now
        }
      } catch (error) {
        console.error(`采集源失败 [${source.name}]:`, error)
      }
    }
  }

  // 检查并执行AI处理任务
  private async checkAndExecuteAITasks() {
    console.log('检查AI处理任务...')
    
    try {
      // 获取待处理的文章（状态为draft且未经AI处理）
      const draftArticles = getNewsByStatus('draft')
      const pendingArticles = draftArticles.filter(article => 
        !article.aiProcessed && article.aiProcessStatus === 'pending'
      )

      if (pendingArticles.length === 0) {
        console.log('没有待处理的文章')
        return
      }

      console.log(`发现 ${pendingArticles.length} 篇待处理文章`)

      // 获取默认AI配置
      const aiConfig = getDefaultAIConfig()
      if (!aiConfig) {
        console.log('未找到默认AI配置，跳过AI处理')
        return
      }

      // 批量处理文章（每次最多处理5篇）
      const batchSize = 5
      const articlesToProcess = pendingArticles.slice(0, batchSize)
      const articleIds = articlesToProcess.map(a => a.id)

      console.log(`开始AI处理 ${articleIds.length} 篇文章`)
      const jobs = await this.aiProcessor.batchProcessArticles(articleIds, aiConfig)
      
      const successCount = jobs.filter(job => job.status === 'completed').length
      const failCount = jobs.filter(job => job.status === 'failed').length
      
      console.log(`AI处理完成: 成功 ${successCount}, 失败 ${failCount}`)

    } catch (error) {
      console.error('AI处理任务执行错误:', error)
    }
  }

  // 执行清理任务
  private async executeCleanupTasks() {
    console.log('执行清理任务...')
    
    try {
      // 清理过期的JWT黑名单token
      const { cleanupBlacklist } = await import('./jwt')
      await cleanupBlacklist()
      console.log('JWT黑名单清理完成')

      // 这里可以添加其他清理任务
      // 例如：清理过期的临时文件、日志文件等
      
    } catch (error) {
      console.error('清理任务执行错误:', error)
    }
  }

  // 判断是否应该执行采集
  private shouldExecuteCrawl(source: any, now: Date): boolean {
    if (!source.lastCrawledAt) {
      return true // 从未采集过
    }

    const lastCrawlTime = new Date(source.lastCrawledAt)
    const intervalMs = source.crawlInterval * 60 * 1000 // 转换为毫秒
    const nextCrawlTime = new Date(lastCrawlTime.getTime() + intervalMs)

    return now >= nextCrawlTime
  }

  // 手动触发采集任务
  async triggerCrawl(sourceId?: string) {
    console.log('手动触发采集任务', sourceId ? `源ID: ${sourceId}` : '所有源')
    
    try {
      if (sourceId) {
        const { getSourceById } = await import('@/data/news')
        const source = getSourceById(sourceId)
        if (!source) {
          throw new Error('采集源不存在')
        }
        return await this.crawler.crawlSource(source)
      } else {
        return await this.crawler.crawlAllActiveSources()
      }
    } catch (error) {
      console.error('手动采集任务失败:', error)
      throw error
    }
  }

  // 手动触发AI处理任务
  async triggerAIProcess(articleIds: string[]) {
    console.log('手动触发AI处理任务', `文章数: ${articleIds.length}`)
    
    try {
      const aiConfig = getDefaultAIConfig()
      if (!aiConfig) {
        throw new Error('未找到默认AI配置')
      }

      return await this.aiProcessor.batchProcessArticles(articleIds, aiConfig)
    } catch (error) {
      console.error('手动AI处理任务失败:', error)
      throw error
    }
  }

  // 获取调度器状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: Array.from(this.intervals.keys()),
      startTime: this.isRunning ? new Date() : null
    }
  }
}

// 全局调度器实例
let globalScheduler: NewsScheduler | null = null

// 获取全局调度器实例
export function getNewsScheduler(): NewsScheduler {
  if (!globalScheduler) {
    globalScheduler = new NewsScheduler()
  }
  return globalScheduler
}

// 启动调度器
export function startNewsScheduler() {
  const scheduler = getNewsScheduler()
  scheduler.start()
  return scheduler
}

// 停止调度器
export function stopNewsScheduler() {
  if (globalScheduler) {
    globalScheduler.stop()
  }
}
