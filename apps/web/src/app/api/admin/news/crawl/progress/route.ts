// 采集进度API
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 进度文件路径
const PROGRESS_FILE = path.join(process.cwd(), 'data', 'crawl-progress.json')

// 采集进度接口
interface CrawlProgress {
  totalSources: number
  completedSources: number
  currentSource: string
  articlesFound: number
  articlesProcessed: number
  articlesPolished: number
  status: 'idle' | 'crawling' | 'polishing' | 'completed' | 'failed'
  error: string
  startTime: Date | null
  endTime: Date | null
  sessionId?: string // 会话ID，用于区分不同的采集任务
  processedSources?: string[] // 已处理的源ID列表
  // 各地区/语言的详细进度
  languageProgress?: CrawlProgressDetail[]
  // 断点续传相关
  canResume?: boolean
  articlesPerLanguage?: number // 每个语种采集的文章数量
}

// 各地区/语言采集进度详情
interface CrawlProgressDetail {
  language: string
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

// 默认进度状态
const defaultProgress: CrawlProgress = {
  totalSources: 0,
  completedSources: 0,
  currentSource: '',
  articlesFound: 0,
  articlesProcessed: 0,
  articlesPolished: 0,
  status: 'idle',
  error: '',
  startTime: null,
  endTime: null,
  processedSources: [],
  languageProgress: [],
  canResume: false,
  articlesPerLanguage: 50
}

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = path.dirname(PROGRESS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 读取进度文件
function readProgressFile(): CrawlProgress {
  try {
    ensureDataDir()
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8')
      const progress = JSON.parse(data)
      // 转换日期字符串为Date对象
      if (progress.startTime) progress.startTime = new Date(progress.startTime)
      if (progress.endTime) progress.endTime = new Date(progress.endTime)
      return { ...defaultProgress, ...progress }
    }
  } catch (error) {
    console.error('读取采集进度文件失败:', error)
  }
  return { ...defaultProgress }
}

// 写入进度文件
function writeProgressFile(progress: CrawlProgress) {
  try {
    ensureDataDir()
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
  } catch (error) {
    console.error('写入采集进度文件失败:', error)
  }
}

// 全局采集进度状态（从文件加载）
let globalCrawlProgress = readProgressFile()

// 更新采集进度
export function updateCrawlProgress(update: Partial<CrawlProgress>) {
  globalCrawlProgress = { ...globalCrawlProgress, ...update }
  writeProgressFile(globalCrawlProgress)
}

// 重置采集进度
export function resetCrawlProgress() {
  globalCrawlProgress = {
    ...defaultProgress,
    processedSources: [], // 明确清空已处理源列表
    sessionId: undefined, // 清空会话ID
    languageProgress: [] // 清空语言进度
  }
  writeProgressFile(globalCrawlProgress)
  console.log('🔄 采集进度已重置，清空所有缓存数据')
}

// 初始化各地区/语言的进度
export function initializeLanguageProgress(targetLanguages: string[], articlesPerLanguage: number = 50) {
  const languageCountryMap = {
    'zh': ['中国', '台湾', '香港'],
    'en': ['美国', '英国', '澳大利亚'],
    'ja': ['日本'],
    'ko': ['韩国'],
    'es': ['西班牙', '墨西哥'],
    'fr': ['法国'],
    'de': ['德国'],
    'it': ['意大利'],
    'pt': ['葡萄牙', '巴西'],
    'ru': ['俄罗斯'],
    'th': ['泰国'],
    'vi': ['越南'],
    'id': ['印度尼西亚']
  }

  const languageProgress: CrawlProgressDetail[] = []

  targetLanguages.forEach(language => {
    const countries = languageCountryMap[language as keyof typeof languageCountryMap] || [language]
    countries.forEach(country => {
      languageProgress.push({
        language,
        country,
        status: 'pending',
        articlesFound: 0,
        articlesProcessed: 0,
        articlesPolished: 0
      })
    })
  })

  return languageProgress
}

// 开始新的采集会话
export function startCrawlSession(sourceIds: string[], targetLanguages: string[] = [], articlesPerLanguage: number = 50) {
  const sessionId = Date.now().toString()
  globalCrawlProgress = {
    ...defaultProgress,
    sessionId,
    startTime: new Date(),
    status: 'crawling',
    processedSources: [],
    languageProgress: initializeLanguageProgress(targetLanguages, articlesPerLanguage),
    canResume: true,
    articlesPerLanguage
  }
  writeProgressFile(globalCrawlProgress)
  return sessionId
}

// 更新特定地区/语言的进度
export function updateLanguageProgress(language: string, country: string, update: Partial<CrawlProgressDetail>) {
  if (!globalCrawlProgress.languageProgress) {
    globalCrawlProgress.languageProgress = []
  }

  const index = globalCrawlProgress.languageProgress.findIndex(
    p => p.language === language && p.country === country
  )

  if (index >= 0) {
    globalCrawlProgress.languageProgress[index] = {
      ...globalCrawlProgress.languageProgress[index],
      ...update
    }
  } else {
    // 如果不存在，创建新的进度记录
    globalCrawlProgress.languageProgress.push({
      language,
      country,
      status: 'pending',
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0,
      ...update
    })
  }

  writeProgressFile(globalCrawlProgress)
}

// 检查源是否已处理（基于当前会话）
export function isSourceProcessed(sourceId: string, currentSessionId?: string): boolean {
  // 如果没有当前会话ID，或者全局进度中的会话ID与当前不同，则认为未处理
  if (!currentSessionId || globalCrawlProgress.sessionId !== currentSessionId) {
    return false
  }
  return globalCrawlProgress.processedSources?.includes(sourceId) || false
}

// 标记源为已处理
export function markSourceProcessed(sourceId: string) {
  if (!globalCrawlProgress.processedSources) {
    globalCrawlProgress.processedSources = []
  }
  if (!globalCrawlProgress.processedSources.includes(sourceId)) {
    globalCrawlProgress.processedSources.push(sourceId)
    writeProgressFile(globalCrawlProgress)
  }
}

// 获取采集进度
export async function GET(request: NextRequest) {
  try {
    // 计算进度百分比
    const crawlProgress = globalCrawlProgress.totalSources > 0 
      ? (globalCrawlProgress.completedSources / globalCrawlProgress.totalSources) * 50 
      : 0
    
    const polishProgress = globalCrawlProgress.articlesProcessed > 0 
      ? (globalCrawlProgress.articlesPolished / globalCrawlProgress.articlesProcessed) * 50 
      : 0
    
    const totalProgress = crawlProgress + polishProgress
    
    // 计算耗时
    let duration = 0
    if (globalCrawlProgress.startTime) {
      const endTime = globalCrawlProgress.endTime || new Date()
      duration = Math.floor((endTime.getTime() - globalCrawlProgress.startTime.getTime()) / 1000)
    }

    return NextResponse.json({
      success: true,
      progress: {
        ...globalCrawlProgress,
        totalProgress: Math.min(totalProgress, 100),
        crawlProgress,
        polishProgress,
        duration,
        estimatedTimeRemaining: calculateEstimatedTime(globalCrawlProgress)
      }
    })

  } catch (error) {
    console.error('获取采集进度失败:', error)
    return NextResponse.json(
      { error: '获取采集进度失败' },
      { status: 500 }
    )
  }
}

// 计算预估剩余时间
function calculateEstimatedTime(progress: typeof globalCrawlProgress): number {
  if (!progress.startTime || progress.status === 'idle' || progress.status === 'completed') {
    return 0
  }

  const elapsed = Date.now() - progress.startTime.getTime()
  const totalTasks = progress.totalSources + progress.articlesProcessed
  const completedTasks = progress.completedSources + progress.articlesPolished
  
  if (completedTasks === 0) return 0
  
  const averageTimePerTask = elapsed / completedTasks
  const remainingTasks = totalTasks - completedTasks
  
  return Math.floor((remainingTasks * averageTimePerTask) / 1000)
}

// 手动设置采集进度（用于测试）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'start':
        globalCrawlProgress = {
          ...globalCrawlProgress,
          ...data,
          status: 'crawling',
          startTime: new Date(),
          endTime: null
        }
        break
        
      case 'update':
        globalCrawlProgress = { ...globalCrawlProgress, ...data }
        break
        
      case 'complete':
        globalCrawlProgress = {
          ...globalCrawlProgress,
          status: 'completed',
          endTime: new Date()
        }
        break
        
      case 'error':
        globalCrawlProgress = {
          ...globalCrawlProgress,
          status: 'failed',
          error: data.error || '采集失败',
          endTime: new Date()
        }
        break
        
      case 'reset':
        resetCrawlProgress()
        break
        
      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      progress: globalCrawlProgress
    })

  } catch (error) {
    console.error('设置采集进度失败:', error)
    return NextResponse.json(
      { error: '设置采集进度失败' },
      { status: 500 }
    )
  }
}

// 获取当前采集进度
export function getCurrentCrawlProgress(): CrawlProgress {
  return readProgressFile()
}

// 导出进度更新函数供其他模块使用
export { globalCrawlProgress }
