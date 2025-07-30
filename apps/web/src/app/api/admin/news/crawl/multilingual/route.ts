import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { SupportedLanguage, CrawlProgressDetail } from '@/types/news'
import { generateProductionRSSSources, ProductionRSSSource } from '@/data/production-rss-sources'
import { getSEOKeywords, generateSEOTitle, generateSEODescription } from '@/data/seo-keywords'
import { DatabaseManager } from '@/lib/database'
import { Worker } from 'worker_threads'
import path from 'path'

// 全局进度存储和WebSocket连接管理
let multilingualProgress: { [key: string]: CrawlProgressDetail } = {}
let isMultilingualCrawling = false
let currentJobId: string | null = null
let dbManager: DatabaseManager | null = null

// WebSocket连接存储 (用于实时进度推送)
const wsConnections = new Set<any>()

// 初始化数据库管理器
function getDBManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager()
  }
  return dbManager
}

// 启动多语种采集
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json({ error: '无效的认证格式' }, { status: 401 })
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json({ error: '令牌已失效' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const admin = findAdminById(decoded.userId)
    if (!admin) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 401 })
    }

    const body = await request.json()
    const {
      articlesPerLanguage = 5,
      enablePolishing = true,
      enableSEO = true,
      targetLanguages = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'nl', 'tr']
    } = body

    if (isMultilingualCrawling) {
      return NextResponse.json(
        { error: '多语种采集正在进行中，请等待完成' },
        { status: 400 }
      )
    }

    // 初始化进度
    multilingualProgress = {}
    targetLanguages.forEach((language: SupportedLanguage) => {
      multilingualProgress[language] = {
        language,
        country: '',
        status: 'pending',
        articlesFound: 0,
        articlesProcessed: 0,
        articlesPolished: 0,
        startTime: new Date()
      }
    })

    isMultilingualCrawling = true

    // 启动异步多语种采集
    startMultilingualCrawling(targetLanguages, articlesPerLanguage, enablePolishing, enableSEO)

    return NextResponse.json({
      success: true,
      message: `已启动 ${targetLanguages.length} 种语言的采集任务`,
      data: {
        targetLanguages,
        articlesPerLanguage,
        enablePolishing,
        enableSEO
      }
    })

  } catch (error) {
    console.error('启动多语种采集失败:', error)
    return NextResponse.json(
      { error: '启动多语种采集失败' },
      { status: 500 }
    )
  }
}

// 异步多语种采集函数 - 使用Worker多线程
async function startMultilingualCrawling(
  targetLanguages: SupportedLanguage[],
  articlesPerLanguage: number,
  enablePolishing: boolean,
  enableSEO: boolean
) {
  try {
    const db = getDBManager()
    const allSources = generateProductionRSSSources()

    // 为每种语言创建Worker
    const workers: Worker[] = []
    const workerPromises: Promise<void>[] = []

    for (const language of targetLanguages) {
      // 获取该语言的RSS源（按优先级排序）
      const languageSources = allSources
        .filter(s => s.language === language && s.is_active)
        .sort((a, b) => b.priority - a.priority || b.quality_score - a.quality_score)

      // 创建Worker
      const worker = new Worker(path.join(process.cwd(), 'src/workers/crawl-worker.ts'), {
        workerData: {
          language,
          sources: languageSources,
          articlesPerLanguage,
          enablePolishing,
          enableSEO,
          jobId: currentJobId
        }
      })

      workers.push(worker)

      // 监听Worker消息
      const workerPromise = new Promise<void>((resolve, reject) => {
        worker.on('message', (message) => {
          if (message.type === 'progress') {
            // 更新进度
            updateLanguageProgress(message.language, message)

            // 广播到WebSocket客户端
            broadcastProgressUpdate(message)
          } else if (message.type === 'completed') {
            // 保存采集结果到数据库
            saveArticlesToDatabase(message.articles)
            resolve()
          }
        })

        worker.on('error', (error) => {
          console.error(`Worker ${language} 错误:`, error)
          updateLanguageProgress(language, {
            status: 'failed',
            error: error.message
          })
          reject(error)
        })

        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`Worker ${language} 异常退出，代码: ${code}`)
          }
        })
      })

      workerPromises.push(workerPromise)
    }

    // 等待所有Worker完成
    await Promise.allSettled(workerPromises)

    // 检查是否所有语言都完成了
    const allCompleted = Object.values(multilingualProgress).every(p =>
      p.status === 'completed' || p.status === 'failed'
    )

    if (allCompleted) {
      console.log('多语种采集全部完成，设置全局状态为完成')
    }

    // 清理Worker
    workers.forEach(worker => worker.terminate())

    isMultilingualCrawling = false
    console.log('所有语言采集任务完成')

  } catch (error) {
    console.error('多语种采集过程中出错:', error)
    isMultilingualCrawling = false
  }
}

// 更新语言进度
function updateLanguageProgress(language: string, updates: any) {
  if (!multilingualProgress[language]) {
    multilingualProgress[language] = {
      language: language as SupportedLanguage,
      country: '',
      status: 'pending',
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0
    }
  }

  Object.assign(multilingualProgress[language], updates, {
    updatedAt: new Date()
  })

  // 保存到数据库
  const db = getDBManager()
  try {
    db.updateCrawlProgress(`${currentJobId}_${language}`, updates)
  } catch (error) {
    console.error('更新数据库进度失败:', error)
  }
}

// 广播进度更新
function broadcastProgressUpdate(progressData: any) {
  // 这里应该调用WebSocket广播函数
  // 由于架构限制，我们使用HTTP推送方式
  try {
    fetch('http://localhost:3000/api/admin/news/crawl/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData)
    }).catch(error => {
      console.error('广播进度失败:', error)
    })
  } catch (error) {
    console.error('广播进度失败:', error)
  }
}

// 保存文章到数据库
function saveArticlesToDatabase(articles: any[]) {
  const db = getDBManager()

  try {
    articles.forEach(article => {
      db.insertArticle({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        source_url: article.sourceUrl,
        source_id: article.sourceId,
        language: article.language,
        category: article.category,
        status: 'published',
        featured_image: article.featuredImage,
        author: article.author
      })
    })

    console.log(`保存了 ${articles.length} 篇文章到数据库`)
  } catch (error) {
    console.error('保存文章到数据库失败:', error)
  }
}

// 单个语言采集函数
async function crawlLanguage(
  language: SupportedLanguage,
  articlesPerLanguage: number,
  enablePolishing: boolean,
  enableSEO: boolean
) {
  try {
    // 更新状态为采集中
    multilingualProgress[language].status = 'crawling'
    multilingualProgress[language].currentSource = `开始采集 ${language.toUpperCase()} 语言新闻`

    // 获取该语言的RSS源
    const sources = getRSSSourcesByLanguage(language)
    const activeSources = sources.filter(s => s.isActive).slice(0, 10) // 限制最多10个源

    let totalArticlesFound = 0
    let totalArticlesProcessed = 0

    // 从每个源采集文章
    for (const source of activeSources) {
      if (totalArticlesProcessed >= articlesPerLanguage) break

      try {
        multilingualProgress[language].currentSource = source.name

        // 模拟采集过程
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

        // 模拟找到的文章数量
        const articlesFound = Math.floor(Math.random() * 5) + 1
        totalArticlesFound += articlesFound

        // 模拟处理文章
        const articlesToProcess = Math.min(articlesFound, articlesPerLanguage - totalArticlesProcessed)
        totalArticlesProcessed += articlesToProcess

        multilingualProgress[language].articlesFound = totalArticlesFound
        multilingualProgress[language].articlesProcessed = totalArticlesProcessed

      } catch (error) {
        console.error(`采集源 ${source.name} 失败:`, error)
      }
    }

    // 如果启用润色，开始润色过程
    if (enablePolishing && totalArticlesProcessed > 0) {
      multilingualProgress[language].status = 'polishing'
      multilingualProgress[language].currentSource = `润色 ${language.toUpperCase()} 语言文章`

      // 模拟润色过程
      for (let i = 0; i < totalArticlesProcessed; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

        multilingualProgress[language].articlesPolished = i + 1
        multilingualProgress[language].currentSource =
          `润色第 ${i + 1}/${totalArticlesProcessed} 篇 ${language.toUpperCase()} 文章`
      }
    } else {
      // 如果不启用润色，直接设置润色数量等于处理数量
      multilingualProgress[language].articlesPolished = totalArticlesProcessed
    }

    // 完成 - 确保采集和润色数量都达到目标
    if (multilingualProgress[language].articlesProcessed >= articlesPerLanguage ||
        (multilingualProgress[language].articlesProcessed > 0 && multilingualProgress[language].articlesProcessed === multilingualProgress[language].articlesPolished)) {
      multilingualProgress[language].status = 'completed'
      multilingualProgress[language].endTime = new Date()
      multilingualProgress[language].currentSource = `${language.toUpperCase()} 语言采集完成`
      console.log(`✅ ${language.toUpperCase()} 语言采集完成: 采集${multilingualProgress[language].articlesProcessed}篇, 润色${multilingualProgress[language].articlesPolished}篇`)
    }

  } catch (error) {
    console.error(`语言 ${language} 采集失败:`, error)
    multilingualProgress[language].status = 'failed'
    multilingualProgress[language].error = error instanceof Error ? error.message : '未知错误'
  }
}

// 获取多语种采集进度
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json({ error: '无效的认证格式' }, { status: 401 })
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json({ error: '令牌已失效' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const admin = findAdminById(decoded.userId)
    if (!admin) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: Object.values(multilingualProgress),
      isRunning: isMultilingualCrawling
    })

  } catch (error) {
    console.error('获取多语种采集进度失败:', error)
    return NextResponse.json(
      { error: '获取进度失败' },
      { status: 500 }
    )
  }
}
