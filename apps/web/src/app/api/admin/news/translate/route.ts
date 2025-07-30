// 新闻翻译API
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getNewsById } from '@/data/news'

// 翻译新闻内容
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

    const admin = findAdminById(payload.userId)
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { newsId, fromLanguage = 'en', toLanguage = 'zh' } = body

    if (!newsId) {
      return NextResponse.json(
        { error: '缺少新闻ID' },
        { status: 400 }
      )
    }

    // 获取新闻内容
    const news = getNewsById(newsId)
    if (!news) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    // 获取源语言内容 - 兼容字符串和多语言对象格式
    let sourceTitle = ''
    let sourceContent = ''
    let sourceSummary = ''

    if (typeof news.title === 'string') {
      sourceTitle = news.title
    } else if (typeof news.title === 'object' && news.title) {
      sourceTitle = news.title[fromLanguage] || news.title.zh || ''
    }

    if (typeof news.content === 'string') {
      sourceContent = news.content
    } else if (typeof news.content === 'object' && news.content) {
      sourceContent = news.content[fromLanguage] || news.content.zh || ''
    }

    if (typeof news.summary === 'string') {
      sourceSummary = news.summary
    } else if (typeof news.summary === 'object' && news.summary) {
      sourceSummary = news.summary[fromLanguage] || news.summary.zh || ''
    }

    if (!sourceTitle && !sourceContent) {
      return NextResponse.json(
        { error: `没有找到${fromLanguage}语言的内容` },
        { status: 400 }
      )
    }

    // 执行翻译
    const translatedTitle = await translateText(sourceTitle, fromLanguage, toLanguage)
    const translatedContent = await translateText(sourceContent, fromLanguage, toLanguage)
    const translatedSummary = await translateText(sourceSummary, fromLanguage, toLanguage)

    return NextResponse.json({
      success: true,
      data: {
        newsId,
        fromLanguage,
        toLanguage,
        original: {
          title: sourceTitle,
          content: sourceContent,
          summary: sourceSummary
        },
        translated: {
          title: translatedTitle,
          content: translatedContent,
          summary: translatedSummary
        },
        translatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('翻译新闻失败:', error)
    return NextResponse.json(
      { error: '翻译失败' },
      { status: 500 }
    )
  }
}

// 批量翻译新闻
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsIds, fromLanguage = 'en', toLanguage = 'zh' } = body

    if (!newsIds || newsIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要翻译的新闻' },
        { status: 400 }
      )
    }

    const results = []
    
    for (const newsId of newsIds) {
      try {
        const news = getNewsById(newsId)
        if (!news) continue

        // 获取源语言内容 - 兼容字符串和多语言对象格式
        let sourceTitle = ''
        let sourceContent = ''
        let sourceSummary = ''

        if (typeof news.title === 'string') {
          sourceTitle = news.title
        } else if (typeof news.title === 'object' && news.title) {
          sourceTitle = news.title[fromLanguage] || news.title.zh || ''
        }

        if (typeof news.content === 'string') {
          sourceContent = news.content
        } else if (typeof news.content === 'object' && news.content) {
          sourceContent = news.content[fromLanguage] || news.content.zh || ''
        }

        if (typeof news.summary === 'string') {
          sourceSummary = news.summary
        } else if (typeof news.summary === 'object' && news.summary) {
          sourceSummary = news.summary[fromLanguage] || news.summary.zh || ''
        }

        const translatedTitle = await translateText(sourceTitle, fromLanguage, toLanguage)
        const translatedContent = await translateText(sourceContent, fromLanguage, toLanguage)
        const translatedSummary = await translateText(sourceSummary, fromLanguage, toLanguage)

        results.push({
          newsId,
          success: true,
          translated: {
            title: translatedTitle,
            content: translatedContent,
            summary: translatedSummary
          }
        })
      } catch (error) {
        results.push({
          newsId,
          success: false,
          error: error instanceof Error ? error.message : '翻译失败'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: newsIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    })

  } catch (error) {
    console.error('批量翻译失败:', error)
    return NextResponse.json(
      { error: '批量翻译失败' },
      { status: 500 }
    )
  }
}

// 翻译文本函数
async function translateText(text: string, fromLang: string, toLang: string): Promise<string> {
  if (!text || text.trim() === '') {
    return ''
  }

  // 如果源语言和目标语言相同，直接返回原文
  if (fromLang === toLang) {
    return text
  }

  // 模拟翻译延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 这里应该调用真实的翻译API（如Google Translate、百度翻译等）
  // 现在返回模拟的翻译结果
  const languageNames = {
    zh: '中文',
    en: '英文',
    ja: '日文',
    ko: '韩文',
    es: '西班牙文',
    fr: '法文',
    de: '德文',
    it: '意大利文',
    pt: '葡萄牙文',
    ru: '俄文'
  }

  const fromLangName = languageNames[fromLang as keyof typeof languageNames] || fromLang
  const toLangName = languageNames[toLang as keyof typeof languageNames] || toLang

  // 如果是翻译成中文，提供更好的模拟翻译
  if (toLang === 'zh') {
    // 简单的关键词替换来模拟翻译
    let translated = text
      .replace(/fashion/gi, '时尚')
      .replace(/clothing/gi, '服装')
      .replace(/apparel/gi, '服饰')
      .replace(/textile/gi, '纺织')
      .replace(/industry/gi, '行业')
      .replace(/business/gi, '商业')
      .replace(/market/gi, '市场')
      .replace(/company/gi, '公司')
      .replace(/brand/gi, '品牌')
      .replace(/design/gi, '设计')
      .replace(/manufacturing/gi, '制造')
      .replace(/export/gi, '出口')
      .replace(/import/gi, '进口')
      .replace(/trade/gi, '贸易')
      .replace(/global/gi, '全球')
      .replace(/international/gi, '国际')
      .replace(/quality/gi, '质量')
      .replace(/production/gi, '生产')
      .replace(/supply chain/gi, '供应链')
      .replace(/sustainability/gi, '可持续性')

    return `【${fromLangName}→${toLangName}翻译】${translated}`
  }

  return `【${fromLangName}→${toLangName}翻译】${text}`
}

// 获取支持的翻译语言对
export async function GET(request: NextRequest) {
  try {
    const supportedLanguages = [
      { code: 'zh', name: '中文', chineseName: '中文' },
      { code: 'en', name: 'English', chineseName: '英文' },
      { code: 'ja', name: '日本語', chineseName: '日文' },
      { code: 'ko', name: '한국어', chineseName: '韩文' },
      { code: 'es', name: 'Español', chineseName: '西班牙文' },
      { code: 'fr', name: 'Français', chineseName: '法文' },
      { code: 'de', name: 'Deutsch', chineseName: '德文' },
      { code: 'it', name: 'Italiano', chineseName: '意大利文' },
      { code: 'pt', name: 'Português', chineseName: '葡萄牙文' },
      { code: 'ru', name: 'Русский', chineseName: '俄文' }
    ]

    return NextResponse.json({
      success: true,
      data: {
        supportedLanguages,
        defaultPairs: [
          { from: 'en', to: 'zh', name: '英文→中文' },
          { from: 'ja', to: 'zh', name: '日文→中文' },
          { from: 'ko', to: 'zh', name: '韩文→中文' },
          { from: 'es', to: 'zh', name: '西班牙文→中文' },
          { from: 'fr', to: 'zh', name: '法文→中文' },
          { from: 'de', to: 'zh', name: '德文→中文' },
          { from: 'it', to: 'zh', name: '意大利文→中文' },
          { from: 'pt', to: 'zh', name: '葡萄牙文→中文' },
          { from: 'ru', to: 'zh', name: '俄文→中文' }
        ]
      }
    })

  } catch (error) {
    console.error('获取翻译语言失败:', error)
    return NextResponse.json(
      { error: '获取翻译语言失败' },
      { status: 500 }
    )
  }
}
