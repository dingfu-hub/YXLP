import { NextRequest, NextResponse } from 'next/server'
import { getPublishedNews, getNewsByCategory } from '@/data/news'
import { NewsCategory, SupportedLanguage } from '@/types/news'
import { getLocalizedContent } from '@/lib/i18n'

// 公共新闻API - 不需要认证
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as NewsCategory | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const locale = searchParams.get('locale') as SupportedLanguage || 'zh'

    // 获取已发布的新闻
    let articles = getPublishedNews()

    // 按分类筛选
    if (category && category !== 'all') {
      articles = articles.filter(article => article.category === category)
    }

    // 过滤有对应语言内容的新闻
    articles = articles.filter(article => {
      const title = getLocalizedContent(article.title, locale)
      const content = getLocalizedContent(article.content, locale)
      return title && content // 确保有对应语言的标题和内容
    })

    // 搜索功能
    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter(article => {
        const title = getLocalizedContent(article.title, locale)
        const summary = getLocalizedContent(article.summary, locale)
        const content = getLocalizedContent(article.content, locale)

        return title.toLowerCase().includes(searchLower) ||
               summary.toLowerCase().includes(searchLower) ||
               content.toLowerCase().includes(searchLower) ||
               article.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
      })
    }

    // 分页
    const total = articles.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articles.slice(startIndex, endIndex)

    // 转换为公共格式
    const publicArticles = paginatedArticles.map(article => ({
      id: parseInt(article.id),
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      author: article.author || '未知作者',
      publishDate: article.publishedAt 
        ? article.publishedAt.toISOString().split('T')[0] 
        : article.createdAt.toISOString().split('T')[0],
      readCount: article.viewCount,
      image: article.featuredImage || '/api/placeholder/600/400',
      tags: article.keywords || [],
      featured: article.viewCount > 500
    }))

    return NextResponse.json(
      {
        message: '获取新闻列表成功',
        data: {
          articles: publicArticles,
          total,
          page,
          limit,
          totalPages
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取公共新闻列表错误:', error)
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
