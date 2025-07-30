import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getSourceById } from '@/data/news'
import { NewsCrawlerManager } from '@/lib/news-crawler'
import {
  updateCrawlProgress,
  resetCrawlProgress,
  startCrawlSession,
  isSourceProcessed,
  markSourceProcessed,
  updateLanguageProgress
} from './progress/route'

// 获取当前采集进度
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

    // 返回当前采集进度
    const { getCurrentCrawlProgress } = await import('./progress/route')
    const progress = getCurrentCrawlProgress()

    return NextResponse.json({
      success: true,
      data: progress
    })

  } catch (error) {
    console.error('获取采集进度失败:', error)
    return NextResponse.json(
      { error: '获取采集进度失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:create')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      sourceId,
      immediate = false,
      aiModel = 'deepseek',
      targetLanguages = ['zh', 'en'],
      articlesPerLanguage = 50,
      onlyTodayNews = true
    } = body



    // 重置采集进度
    resetCrawlProgress()

    const crawler = new NewsCrawlerManager()

    if (sourceId) {
      // 采集指定来源
      const source = getSourceById(sourceId)
      if (!source) {
        return NextResponse.json(
          { error: '新闻来源不存在' },
          { status: 404 }
        )
      }

      if (!source.isActive) {
        return NextResponse.json(
          { error: '新闻来源已禁用' },
          { status: 400 }
        )
      }

      // 启动单源采集（异步）
      startSingleSourceCrawl(source, aiModel, targetLanguages, onlyTodayNews, articlesPerLanguage)

      return NextResponse.json(
        {
          message: '新闻采集已启动',
          data: { sourceId, status: 'started' }
        },
        { status: 200 }
      )
    } else {
      // 检查是否有正在进行的采集任务
      const { getActiveSources } = await import('@/data/news')
      const sources = getActiveSources()
      const sourceIds = sources.map(s => s.id)

      // 启动全源采集（异步）
      startAllSourcesCrawl(crawler, aiModel, targetLanguages, onlyTodayNews, sourceIds, articlesPerLanguage)

      return NextResponse.json(
        {
          message: '批量新闻采集已启动',
          data: { status: 'started' }
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('新闻采集错误:', error)
    updateCrawlProgress({
      status: 'failed',
      error: error instanceof Error ? error.message : '采集失败'
    })
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 异步单源采集函数
async function startSingleSourceCrawl(
  source: any,
  aiModel: string,
  targetLanguages: string[],
  onlyTodayNews: boolean,
  articlesPerLanguage: number = 50
) {
  try {
    updateCrawlProgress({
      totalSources: 1,
      completedSources: 0,
      currentSource: source.name,
      status: 'crawling'
    })

    const crawler = new NewsCrawlerManager()
    const job = await crawler.crawlSource(source)

    updateCrawlProgress({
      completedSources: 1,
      articlesFound: job.articlesFound || 0,
      articlesProcessed: job.articlesProcessed || 0,
      status: 'polishing'
    })

    // 模拟AI润色过程
    await simulateAIPolishing(job.articlesProcessed || 0, targetLanguages)

    updateCrawlProgress({
      status: 'completed'
    })

  } catch (error) {
    console.error('单源采集失败:', error)
    updateCrawlProgress({
      status: 'failed',
      error: error instanceof Error ? error.message : '采集失败'
    })
  }
}

// 按语言/地区分组源
function groupSourcesByLanguage(sources: any[], targetLanguages: string[]) {
  const sourcesByLanguage: { [key: string]: any[] } = {}

  // 语言到地区的映射
  const languageCountryMap: { [key: string]: string[] } = {
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

  // 为每个目标语言创建分组
  targetLanguages.forEach(language => {
    const countries = languageCountryMap[language] || [language]
    countries.forEach(country => {
      const key = `${language}-${country}`
      sourcesByLanguage[key] = []
    })
  })

  // 将源分配到各个语言/地区组 - 根据源的实际语言和地区匹配
  sources.forEach(source => {
    // 根据源的语言和地区属性进行正确匹配
    if (source.language && source.country) {
      // 地区名称映射
      const countryNameMap: { [key: string]: string } = {
        'CN': '中国', 'TW': '台湾', 'HK': '香港',
        'US': '美国', 'GB': '英国', 'AU': '澳大利亚',
        'JP': '日本', 'KR': '韩国',
        'ES': '西班牙', 'MX': '墨西哥',
        'FR': '法国', 'DE': '德国', 'IT': '意大利',
        'PT': '葡萄牙', 'BR': '巴西',
        'RU': '俄罗斯', 'TH': '泰国', 'VN': '越南', 'ID': '印度尼西亚'
      }

      const countryName = countryNameMap[source.country] || source.country
      const key = `${source.language}-${countryName}`

      // 只有当目标语言包含该语言时才添加
      if (targetLanguages.includes(source.language)) {
        // 如果分组不存在，创建它
        if (!sourcesByLanguage[key]) {
          sourcesByLanguage[key] = []
        }
        sourcesByLanguage[key].push(source)
        console.log(`添加RSS源到分组 [${key}]: ${source.name}`)
      }
    }
  })

  return sourcesByLanguage
}

// 异步全源采集函数
async function startAllSourcesCrawl(
  crawler: NewsCrawlerManager,
  aiModel: string,
  targetLanguages: string[],
  onlyTodayNews: boolean,
  sourceIds: string[],
  articlesPerLanguage: number = 50
) {
  try {
    const { getActiveSources } = await import('@/data/news')
    const sources = getActiveSources()

    // 重置之前的采集状态
    resetCrawlProgress()

    // 开始新的采集会话
    const sessionId = startCrawlSession(sourceIds, targetLanguages, articlesPerLanguage)

    console.log(`🚀 开始新的采集会话: ${sessionId}，目标语言: ${targetLanguages.join(', ')}，每语言采集: ${articlesPerLanguage}篇`)

    // 新会话中所有源都需要重新处理
    const filteredSources = sources.filter(source => sourceIds.length === 0 || sourceIds.includes(source.id))
    const unprocessedSources = filteredSources // 新会话中所有源都是未处理的

    updateCrawlProgress({
      totalSources: sources.length,
      completedSources: sources.length - unprocessedSources.length,
      status: 'crawling'
    })

    console.log(`新会话采集: 总共${sources.length}个源，需要处理${unprocessedSources.length}个源`)

    // 按语言/地区分组处理源
    const sourcesByLanguage = groupSourcesByLanguage(unprocessedSources, targetLanguages)

    // 初始化各地区进度显示
    initializeLanguageProgress(sourcesByLanguage)

    // 启动异步采集任务，立即返回响应
    startAsyncCrawlProcess(sourcesByLanguage, sources, crawler, aiModel, targetLanguages, onlyTodayNews, articlesPerLanguage)

    return NextResponse.json({
      success: true,
      message: '采集任务已启动，请查看进度页面',
      totalSources: Object.values(sourcesByLanguage).flat().length
    })
  } catch (error) {
    console.error('启动采集失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 初始化各地区进度显示
function initializeLanguageProgress(sourcesByLanguage: Record<string, any[]>) {
  console.log(`📊 RSS源分布情况:`)
  Object.entries(sourcesByLanguage).forEach(([languageKey, languageSources]) => {
    const [language, country] = languageKey.split('-')
    if (languageSources.length > 0) {
      console.log(`- ${languageKey}: ${languageSources.length} 个RSS源`)
      updateLanguageProgress(language, country, {
        status: 'crawling',
        currentSource: '准备开始',
        articlesFound: 0,
        articlesProcessed: 0,
        articlesPolished: 0
      })
    } else {
      console.log(`- ${languageKey}: 无RSS源，跳过显示`)
    }
  })
}

// 异步采集处理函数 - 重构版本
async function startAsyncCrawlProcess(
  sourcesByLanguage: Record<string, any[]>,
  allSources: any[], // 传入完整的源列表用于计算总数
  crawler: NewsCrawlerManager,
  aiModel: string,
  targetLanguages: string[],
  onlyTodayNews: boolean,
  articlesPerLanguage: number
) {
  try {
    // 真正的并行采集 - 所有地区同时开始
    const crawlPromises = Object.entries(sourcesByLanguage)
      .filter(([languageKey, languageSources]) => languageSources.length > 0)
      .map(async ([languageKey, languageSources]) => {
        const [language, country] = languageKey.split('-')

        // 更新该语言/地区状态为采集中
        updateLanguageProgress(language, country, {
          status: 'crawling',
          currentSource: `开始采集 ${languageSources.length} 个源`
        })

        let languageArticlesFound = 0
        let languageArticlesProcessed = 0
        const languageArticlesData: any[] = []

        for (let i = 0; i < languageSources.length; i++) {
        const source = languageSources[i]

        // 更新当前采集源
        updateLanguageProgress(language, country, {
          currentSource: source.name
        })

        try {
          console.log(`[${language}-${country}] 开始采集源: ${source.name}`)
          const job = await crawler.crawlSource(source)
          const sourceArticlesFound = job.totalFound || 0
          const sourceArticlesProcessed = job.totalProcessed || 0

          console.log(`🔍 [${language}-${country}] 采集源结果:`)
          console.log(`- job.totalFound: ${job.totalFound}`)
          console.log(`- job.totalSuccess: ${job.totalSuccess}`)
          console.log(`- job.articlesData?.length: ${job.articlesData?.length || 0}`)

          languageArticlesFound += sourceArticlesFound
          languageArticlesProcessed += sourceArticlesProcessed

          // 收集文章数据，限制每个语言/地区的文章数量
          if (job.articlesData && job.articlesData.length > 0) {
            const remainingSlots = articlesPerLanguage - languageArticlesData.length
            const articlesToAdd = job.articlesData.slice(0, remainingSlots)
            languageArticlesData.push(...articlesToAdd)
            console.log(`✅ [${language}-${country}] 添加了 ${articlesToAdd.length} 篇文章，当前总数: ${languageArticlesData.length}`)
          } else {
            console.log(`❌ [${language}-${country}] job.articlesData 为空或未定义`)
          }

          // 标记源为已处理
          markSourceProcessed(source.id)

          // 更新该语言/地区的进度 - 使用实际收集到的文章数量
          updateLanguageProgress(language, country, {
            articlesFound: Math.min(languageArticlesFound, articlesPerLanguage), // 显示实际需要的数量
            articlesProcessed: languageArticlesData.length // 使用实际收集的文章数量
          })

          console.log(`[${language}-${country}] 完成采集源: ${source.name}，获得${job.articlesData?.length || 0}篇文章`)

          // 如果该语言/地区已达到目标文章数，停止采集
          if (languageArticlesData.length >= articlesPerLanguage) {
            console.log(`✅ [${language}-${country}] 已达到目标文章数 ${articlesPerLanguage}，停止采集`)
            break
          }
        } catch (sourceError) {
          console.error(`[${language}-${country}] 采集源 ${source.name} 失败:`, sourceError)
          updateLanguageProgress(language, country, {
            error: `采集源 ${source.name} 失败: ${sourceError instanceof Error ? sourceError.message : '未知错误'}`
          })
        }
      }

      // 标记该语言/地区采集完成 - 区分达到目标和源不足的情况
      const reachedTarget = languageArticlesData.length >= articlesPerLanguage
      const noMoreSources = languageArticlesData.length > 0 && languageArticlesData.length < articlesPerLanguage

      let status = 'completed'
      let statusMessage = ''

      if (reachedTarget) {
        statusMessage = `已达到目标 ${articlesPerLanguage} 篇`
      } else if (noMoreSources) {
        statusMessage = `源不足，仅采集到 ${languageArticlesData.length} 篇`
        status = 'completed' // 虽然未达目标，但已无更多源，标记为完成
      } else if (languageArticlesData.length === 0) {
        statusMessage = '无可用文章'
      }

      updateLanguageProgress(language, country, {
        status: status as any,
        articlesFound: languageArticlesFound, // 显示实际发现的数量
        articlesProcessed: languageArticlesData.length,
        statusMessage: statusMessage
      })

      console.log(`[${language}-${country}] 采集完成: RSS发现${languageArticlesFound}篇，目标${articlesPerLanguage}篇，实际收集${languageArticlesData.length}篇`)

      return languageArticlesData
    })

    // 等待所有语言/地区的采集完成
    const allLanguageResults = await Promise.all(crawlPromises)

    // 合并所有文章数据
    const allArticlesData: any[] = []
    let totalArticlesFound = 0
    let totalArticlesProcessed = 0

    allLanguageResults.forEach((languageArticles, index) => {
      console.log(`语言组${index}: 收集到${languageArticles.length}篇文章`)
      allArticlesData.push(...languageArticles)
      totalArticlesFound += languageArticles.length
      totalArticlesProcessed += languageArticles.length
    })

    console.log(`总计: 收集到${allArticlesData.length}篇文章，准备进行AI处理`)

    updateCrawlProgress({
      articlesFound: totalArticlesFound,
      articlesProcessed: totalArticlesProcessed
    })

    // 使用传入的源总数
    updateCrawlProgress({
      completedSources: allSources.length,
      status: 'polishing'
    })

    // 第二阶段：AI润色和多语言生成
    await processArticlesWithAI(allArticlesData, aiModel, targetLanguages, articlesPerLanguage)

    updateCrawlProgress({
      status: 'completed'
    })

  } catch (error) {
    console.error('异步采集过程失败:', error)
    updateCrawlProgress({
      status: 'failed',
      error: error instanceof Error ? error.message : '采集过程失败',
      endTime: new Date()
    })

    // 更新所有地区状态为失败
    Object.entries(sourcesByLanguage).forEach(([languageKey, languageSources]) => {
      if (languageSources.length > 0) {
        const [language, country] = languageKey.split('-')
        updateLanguageProgress(language, country, {
          status: 'failed',
          error: '采集过程失败'
        })
      }
    })

    console.log('🚨 采集失败，任务已中断')
  }
}

// AI处理文章：润色和多语言生成
async function processArticlesWithAI(articlesData: any[], aiModel: string, targetLanguages: string[], articlesPerLanguage: number) {
  const { createNews } = await import('@/data/news')
  const { polishNewsContent } = await import('@/lib/ai-polish')
  const { SUPPORTED_LANGUAGES } = await import('@/lib/i18n')

  // 语言到地区的映射
  const languageCountryMap: { [key: string]: string[] } = {
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

  // 按语言/地区分组文章 - 只为有文章的地区创建组
  const articlesByLanguage: { [key: string]: any[] } = {}

  // 根据文章的来源地区进行分组，而不是预先创建所有目标地区
  articlesData.forEach((article) => {
    // 假设文章有 sourceLanguage 和 sourceCountry 属性，如果没有则使用默认值
    const language = article.sourceLanguage || 'zh'
    const country = article.sourceCountry || '中国'
    const key = `${language}-${country}`

    if (!articlesByLanguage[key]) {
      articlesByLanguage[key] = []
    }

    if (articlesByLanguage[key].length < articlesPerLanguage) {
      articlesByLanguage[key].push(article)
    }
  })

  console.log(`📊 文章分组结果:`)
  Object.entries(articlesByLanguage).forEach(([key, articles]) => {
    console.log(`- ${key}: ${articles.length} 篇文章`)
  })

  // 处理每个语言/地区的文章
  for (const [languageKey, articles] of Object.entries(articlesByLanguage)) {
    const [language, country] = languageKey.split('-')

    // 如果没有文章，直接标记为完成，不进行AI处理
    if (articles.length === 0) {
      updateLanguageProgress(language, country, {
        status: 'completed',
        articlesPolished: 0
      })
      console.log(`[${language}-${country}] 没有文章需要AI处理，跳过`)
      continue
    }

    // 更新状态为润色中
    updateLanguageProgress(language, country, {
      status: 'polishing'
    })

    let polishedCount = 0

    for (const articleData of articles) {
      try {
        // 1. 先进行AI润色和多语言生成
        const polishResult = await polishNewsContent(
          articleData.title,
          articleData.content,
          articleData.summary || '',
          aiModel as any,
          [language] as any[]
        )

        // 2. 创建包含多语言内容的文章对象
        const newsArticle = {
          ...articleData,
          // 多语言内容 - 提取对应语言的文本
          title: polishResult.polishedContent.title[language] || articleData.title,
          content: polishResult.polishedContent.content[language] || articleData.content,
          summary: polishResult.polishedContent.summary[language] || articleData.summary,

          // 保存原始内容
          originalTitle: articleData.title,
          originalContent: articleData.content,
          originalSummary: articleData.summary,
          originalLanguage: 'zh', // 大多数采集源是中文

          // AI处理标记
          aiProcessed: true,
          aiProcessStatus: 'completed' as const,
          aiProcessedAt: new Date(),
          aiModel: aiModel as any,
          polishedLanguages: [language] as any[]
        }

        // 3. 保存到数据库
        await createNews(newsArticle)
        polishedCount++
        console.log(`[${language}-${country}] 保存文章成功: ${newsArticle.title}`)

        // 更新该语言/地区的润色进度
        updateLanguageProgress(language, country, {
          articlesPolished: polishedCount
        })

      } catch (error) {
        console.error('AI处理文章失败:', error)
        // 如果AI处理失败，保存原始文章
        try {
          await createNews({
            ...articleData,
            aiProcessed: false,
            aiProcessStatus: 'failed' as const
          })
          console.log(`[${language}-${country}] 保存原始文章: ${articleData.title}`)
        } catch (saveError) {
          console.error('保存原始文章失败:', saveError)
        }
      }
    }

    // 标记该语言/地区润色完成
    updateLanguageProgress(language, country, {
      status: 'completed',
      articlesPolished: polishedCount
    })

    console.log(`[${language}-${country}] AI处理完成: 处理了${polishedCount}篇文章`)
  }
}



// 处理 OPTIONS 请求 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
