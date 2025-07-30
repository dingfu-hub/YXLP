// 定时采集配置管理
import { ScheduledCrawlConfig, AIModel, SupportedLanguage } from '@/types/news'

// 模拟定时采集配置数据
let scheduledCrawlConfigs: ScheduledCrawlConfig[] = [
  {
    id: 'schedule_1',
    name: '每日时尚新闻采集',
    isActive: true,
    cronExpression: '0 8 * * *', // 每天早上8点
    sources: ['source_1', 'source_2', 'source_3'],
    aiModel: 'deepseek',
    targetLanguages: ['zh', 'en'],
    qualityThreshold: 70,
    maxArticlesPerSource: 20,
    onlyTodayNews: true,
    lastRunAt: new Date('2024-01-15T08:00:00Z'),
    nextRunAt: new Date('2024-01-16T08:00:00Z'),
    totalRuns: 15,
    successfulRuns: 14,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 'schedule_2',
    name: '内衣行业周报采集',
    isActive: true,
    cronExpression: '0 10 * * 1', // 每周一上午10点
    sources: ['source_4', 'source_5'],
    aiModel: 'doubao',
    targetLanguages: ['zh', 'en', 'ja'],
    qualityThreshold: 80,
    maxArticlesPerSource: 10,
    onlyTodayNews: false,
    lastRunAt: new Date('2024-01-08T10:00:00Z'),
    nextRunAt: new Date('2024-01-15T10:00:00Z'),
    totalRuns: 3,
    successfulRuns: 3,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-08T10:00:00Z')
  }
]

// 预设的采集策略模板
export const CRAWL_STRATEGY_TEMPLATES = {
  daily_fashion: {
    name: '每日时尚资讯',
    cronExpression: '0 8 * * *',
    description: '每天早上8点采集最新时尚资讯',
    qualityThreshold: 70,
    maxArticlesPerSource: 20,
    onlyTodayNews: true,
    targetLanguages: ['zh', 'en'] as SupportedLanguage[]
  },
  weekly_industry: {
    name: '周度行业报告',
    cronExpression: '0 10 * * 1',
    description: '每周一上午10点采集行业深度报告',
    qualityThreshold: 80,
    maxArticlesPerSource: 10,
    onlyTodayNews: false,
    targetLanguages: ['zh', 'en', 'ja'] as SupportedLanguage[]
  },
  hourly_breaking: {
    name: '实时突发新闻',
    cronExpression: '0 * * * *',
    description: '每小时采集突发新闻和重要资讯',
    qualityThreshold: 85,
    maxArticlesPerSource: 5,
    onlyTodayNews: true,
    targetLanguages: ['zh', 'en'] as SupportedLanguage[]
  },
  twice_daily: {
    name: '早晚双采集',
    cronExpression: '0 8,20 * * *',
    description: '每天早上8点和晚上8点采集',
    qualityThreshold: 75,
    maxArticlesPerSource: 15,
    onlyTodayNews: true,
    targetLanguages: ['zh', 'en', 'ko'] as SupportedLanguage[]
  }
}

// 基于大数据经验的最优采集策略建议
export const OPTIMAL_CRAWL_STRATEGIES = {
  fashion_retail: {
    name: '时尚零售优化策略',
    description: '基于时尚零售行业特点优化的采集策略',
    recommendations: [
      '工作日早上8-9点是时尚新闻发布高峰期',
      '周五下午和周末适合采集趋势分析类文章',
      '质量阈值建议设置在75-80之间，平衡质量和数量',
      '建议同时采集中英日韩四种语言，覆盖主要市场',
      '每个源每次采集15-25篇文章最为合适'
    ],
    optimalSettings: {
      cronExpression: '0 8 * * 1-5',
      qualityThreshold: 78,
      maxArticlesPerSource: 20,
      targetLanguages: ['zh', 'en', 'ja', 'ko'] as SupportedLanguage[]
    }
  },
  underwear_b2b: {
    name: '内衣B2B专业策略',
    description: '针对内衣行业B2B市场的专业采集策略',
    recommendations: [
      '内衣行业新闻更新频率较低，建议每日一次采集',
      '重点关注贸易、技术创新、市场分析类内容',
      '质量阈值可适当提高到80-85，确保专业性',
      '建议采集中英文内容，兼顾国内外市场',
      '每个源采集10-15篇精选文章即可'
    ],
    optimalSettings: {
      cronExpression: '0 9 * * *',
      qualityThreshold: 82,
      maxArticlesPerSource: 12,
      targetLanguages: ['zh', 'en'] as SupportedLanguage[]
    }
  },
  global_trends: {
    name: '全球趋势监控策略',
    description: '监控全球时尚趋势的综合采集策略',
    recommendations: [
      '全球时尚趋势需要多时区覆盖，建议一天三次采集',
      '重点采集欧美亚三大时尚中心的资讯',
      '质量阈值适中，保证趋势信息的及时性',
      '多语言采集，确保全球视野',
      '每个源采集量可以适当增加'
    ],
    optimalSettings: {
      cronExpression: '0 6,14,22 * * *',
      qualityThreshold: 72,
      maxArticlesPerSource: 25,
      targetLanguages: ['zh', 'en', 'fr', 'it', 'ja'] as SupportedLanguage[]
    }
  }
}

// 定时采集配置CRUD操作
export function getAllScheduledCrawlConfigs(): ScheduledCrawlConfig[] {
  return scheduledCrawlConfigs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export function getScheduledCrawlConfigById(id: string): ScheduledCrawlConfig | null {
  return scheduledCrawlConfigs.find(config => config.id === id) || null
}

export function getActiveScheduledCrawlConfigs(): ScheduledCrawlConfig[] {
  return scheduledCrawlConfigs.filter(config => config.isActive)
}

export function createScheduledCrawlConfig(
  configData: Omit<ScheduledCrawlConfig, 'id' | 'totalRuns' | 'successfulRuns' | 'createdAt' | 'updatedAt'>
): ScheduledCrawlConfig {
  const newConfig: ScheduledCrawlConfig = {
    ...configData,
    id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    totalRuns: 0,
    successfulRuns: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // 计算下次运行时间
  newConfig.nextRunAt = calculateNextRunTime(newConfig.cronExpression)
  
  scheduledCrawlConfigs.push(newConfig)
  return newConfig
}

export function updateScheduledCrawlConfig(
  id: string, 
  updates: Partial<Omit<ScheduledCrawlConfig, 'id' | 'createdAt'>>
): ScheduledCrawlConfig | null {
  const configIndex = scheduledCrawlConfigs.findIndex(config => config.id === id)
  if (configIndex === -1) return null
  
  scheduledCrawlConfigs[configIndex] = {
    ...scheduledCrawlConfigs[configIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  // 如果更新了cron表达式，重新计算下次运行时间
  if (updates.cronExpression) {
    scheduledCrawlConfigs[configIndex].nextRunAt = calculateNextRunTime(updates.cronExpression)
  }
  
  return scheduledCrawlConfigs[configIndex]
}

export function deleteScheduledCrawlConfig(id: string): boolean {
  const configIndex = scheduledCrawlConfigs.findIndex(config => config.id === id)
  if (configIndex === -1) return false
  
  scheduledCrawlConfigs.splice(configIndex, 1)
  return true
}

// 记录采集执行结果
export function recordCrawlExecution(id: string, success: boolean): boolean {
  const configIndex = scheduledCrawlConfigs.findIndex(config => config.id === id)
  if (configIndex === -1) return false
  
  const config = scheduledCrawlConfigs[configIndex]
  scheduledCrawlConfigs[configIndex] = {
    ...config,
    lastRunAt: new Date(),
    nextRunAt: calculateNextRunTime(config.cronExpression),
    totalRuns: config.totalRuns + 1,
    successfulRuns: success ? config.successfulRuns + 1 : config.successfulRuns,
    updatedAt: new Date()
  }
  
  return true
}

// 计算下次运行时间（简化版cron解析）
function calculateNextRunTime(cronExpression: string): Date {
  // 这里是简化的cron解析，实际项目中建议使用专业的cron库
  const now = new Date()
  const nextRun = new Date(now)
  
  // 简单处理几种常见的cron表达式
  if (cronExpression === '0 8 * * *') {
    // 每天早上8点
    nextRun.setHours(8, 0, 0, 0)
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
  } else if (cronExpression === '0 * * * *') {
    // 每小时
    nextRun.setMinutes(0, 0, 0)
    nextRun.setHours(nextRun.getHours() + 1)
  } else if (cronExpression === '0 10 * * 1') {
    // 每周一上午10点
    nextRun.setHours(10, 0, 0, 0)
    const daysUntilMonday = (1 + 7 - nextRun.getDay()) % 7
    if (daysUntilMonday === 0 && nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 7)
    } else {
      nextRun.setDate(nextRun.getDate() + daysUntilMonday)
    }
  } else {
    // 默认1小时后
    nextRun.setHours(nextRun.getHours() + 1)
  }
  
  return nextRun
}

// 验证cron表达式
export function validateCronExpression(cronExpression: string): boolean {
  // 简化的cron表达式验证
  const parts = cronExpression.split(' ')
  return parts.length === 5
}

// 获取采集统计信息
export function getCrawlStats() {
  const totalConfigs = scheduledCrawlConfigs.length
  const activeConfigs = scheduledCrawlConfigs.filter(config => config.isActive).length
  const totalRuns = scheduledCrawlConfigs.reduce((sum, config) => sum + config.totalRuns, 0)
  const successfulRuns = scheduledCrawlConfigs.reduce((sum, config) => sum + config.successfulRuns, 0)
  const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0
  
  return {
    totalConfigs,
    activeConfigs,
    inactiveConfigs: totalConfigs - activeConfigs,
    totalRuns,
    successfulRuns,
    failedRuns: totalRuns - successfulRuns,
    successRate: Math.round(successRate * 100) / 100
  }
}

// 获取即将执行的任务
export function getUpcomingCrawlTasks(hours: number = 24): ScheduledCrawlConfig[] {
  const now = new Date()
  const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000)
  
  return scheduledCrawlConfigs
    .filter(config => 
      config.isActive && 
      config.nextRunAt && 
      config.nextRunAt >= now && 
      config.nextRunAt <= cutoff
    )
    .sort((a, b) => a.nextRunAt!.getTime() - b.nextRunAt!.getTime())
}

// 批量操作
export function batchUpdateScheduledCrawlConfigs(
  configIds: string[], 
  updates: Partial<Pick<ScheduledCrawlConfig, 'isActive' | 'qualityThreshold' | 'maxArticlesPerSource'>>
): number {
  let updatedCount = 0
  
  configIds.forEach(id => {
    if (updateScheduledCrawlConfig(id, updates)) {
      updatedCount++
    }
  })
  
  return updatedCount
}
