import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import {
  getAllNews,
  getNewsByCategory,
  getNewsByStatus,
  searchNews,
  createNews,
  getNewsStats
} from '@/data/news'
import { NewsListRequest, CreateNewsRequest, SupportedLanguage } from '@/types/news'
import { getLocalizedContent } from '@/lib/i18n'

// 获取新闻列表
export async function GET(request: NextRequest) {
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
    if (!user.permissions.includes('news:view')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const language = searchParams.get('language') || 'zh' // 添加语言参数
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 获取新闻数据
    let articles = getAllNews()

    // 应用过滤条件
    if (category && category !== 'all') {
      articles = articles.filter(article => article.category === category)
    }

    if (status && status !== 'all') {
      articles = articles.filter(article => article.status === status)
    }

    if (search) {
      const searchResults = searchNews(search, language as any)
      const searchIds = new Set(searchResults.map(a => a.id))
      articles = articles.filter(article => searchIds.has(article.id))
    }

    // 排序
    articles.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'publishedAt':
          aValue = a.publishedAt?.getTime() || 0
          bValue = b.publishedAt?.getTime() || 0
          break
        case 'viewCount':
          aValue = a.viewCount
          bValue = b.viewCount
          break
        default:
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // 分页
    const total = articles.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articles.slice(startIndex, endIndex)

    // 根据选择的语言处理文章内容显示
    const processedArticles = paginatedArticles.map(article => ({
      ...article,
      // 为前端显示添加本地化内容字段
      displayTitle: getLocalizedContent(article.title, language as SupportedLanguage),
      displayContent: getLocalizedContent(article.content, language as SupportedLanguage),
      displaySummary: getLocalizedContent(article.summary, language as SupportedLanguage),
      currentLanguage: language
    }))

    return NextResponse.json(
      {
        message: '获取新闻列表成功',
        data: {
          articles: processedArticles,
          total,
          page,
          limit,
          totalPages,
          currentLanguage: language
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取新闻列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建新闻
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

    const body: CreateNewsRequest = await request.json()
    const {
      title,
      content,
      summary,
      category,
      status = 'draft',
      sourceUrl,
      sourceName,
      featuredImage,
      keywords,
      publishedAt,
      multiLanguageContent,
      aiProcessed = false,
      aiModel,
      polishedLanguages
    } = body

    // 验证必填字段
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '标题、内容和分类为必填字段' },
        { status: 400 }
      )
    }

    // 生成slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    // 处理多语言内容
    let finalTitle, finalContent, finalSummary

    if (multiLanguageContent) {
      // 如果有多语言内容，使用多语言版本
      finalTitle = multiLanguageContent.title || { zh: title }
      finalContent = multiLanguageContent.content || { zh: content }
      finalSummary = multiLanguageContent.summary || { zh: summary || content.substring(0, 150) + '...' }
    } else {
      // 否则创建单语言版本
      finalTitle = { zh: title }
      finalContent = { zh: content }
      finalSummary = { zh: summary || content.substring(0, 150) + '...' }
    }

    // 创建新闻数据
    const newsData = {
      title: finalTitle,
      content: finalContent,
      summary: finalSummary,
      category,
      status,
      sourceUrl,
      sourceName,
      sourceType: 'manual' as const,
      featuredImage,
      slug,
      keywords,
      aiProcessed: aiProcessed || false,
      aiProcessStatus: aiProcessed ? 'completed' : 'pending' as const,
      aiModel: aiModel || undefined,
      polishedLanguages: polishedLanguages || ['zh'],
      publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : undefined),
      author: user.name
    }

    const newArticle = createNews(newsData)

    return NextResponse.json(
      {
        message: '新闻创建成功',
        data: newArticle
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('创建新闻错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
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
