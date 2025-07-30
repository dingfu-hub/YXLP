// 多语言新闻管理API
import { NextRequest, NextResponse } from 'next/server'
import { NewsArticle, MultiLanguageContent, SupportedLanguage } from '@/types/news'
import { createMultiLanguageContent, getLocalizedContent } from '@/lib/i18n'

// 创建多语言新闻
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      summary,
      category,
      status,
      keywords,
      author,
      featuredImage,
      sourceType,
      aiProcessed,
      aiModel,
      polishedLanguages
    } = body

    // 验证必填字段
    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: '标题、内容和摘要为必填字段' },
        { status: 400 }
      )
    }

    // 创建新闻文章
    const newArticle: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'shareCount'> = {
      title: title as MultiLanguageContent,
      content: content as MultiLanguageContent,
      summary: summary as MultiLanguageContent,
      category: category || 'business',
      status: status || 'draft',
      sourceType: sourceType || 'manual',
      slug: generateSlug(getLocalizedContent(title, 'zh')),
      keywords: keywords || [],
      author: author || '',
      featuredImage: featuredImage || '',
      aiProcessed: aiProcessed || false,
      aiModel: aiModel,
      polishedLanguages: polishedLanguages || ['zh'],
      viewCount: 0,
      likeCount: 0,
      shareCount: 0
    }

    // 这里应该保存到数据库
    // 暂时返回模拟响应
    const savedArticle = {
      ...newArticle,
      id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: savedArticle
    })

  } catch (error) {
    console.error('创建多语言新闻失败:', error)
    return NextResponse.json(
      { error: '创建新闻失败' },
      { status: 500 }
    )
  }
}

// 获取多语言新闻列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') as SupportedLanguage || 'zh'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // 这里应该从数据库获取数据
    // 暂时返回模拟数据
    const mockArticles: NewsArticle[] = []

    // 过滤和分页逻辑
    let filteredArticles = mockArticles

    if (category) {
      filteredArticles = filteredArticles.filter(article => article.category === category)
    }

    if (status) {
      filteredArticles = filteredArticles.filter(article => article.status === status)
    }

    const total = filteredArticles.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    // 转换为指定语言的响应
    const localizedArticles = paginatedArticles.map(article => ({
      ...article,
      title: getLocalizedContent(article.title, language),
      content: getLocalizedContent(article.content, language),
      summary: getLocalizedContent(article.summary, language),
      // 保留原始多语言数据供管理员使用
      _multilingual: {
        title: article.title,
        content: article.content,
        summary: article.summary
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        articles: localizedArticles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        language
      }
    })

  } catch (error) {
    console.error('获取多语言新闻失败:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}

// 翻译新闻内容
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsId, targetLanguage, content } = body

    if (!newsId || !targetLanguage || !content) {
      return NextResponse.json(
        { error: '新闻ID、目标语言和内容为必填字段' },
        { status: 400 }
      )
    }

    // 这里应该更新数据库中的多语言内容
    // 暂时返回模拟响应
    const updatedContent = {
      [targetLanguage]: content
    }

    return NextResponse.json({
      success: true,
      data: {
        newsId,
        targetLanguage,
        updatedContent
      }
    })

  } catch (error) {
    console.error('翻译新闻内容失败:', error)
    return NextResponse.json(
      { error: '翻译失败' },
      { status: 500 }
    )
  }
}

// 生成URL slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
    .substring(0, 50) // 限制长度
}

// 验证语言代码
function isValidLanguage(language: string): language is SupportedLanguage {
  const supportedLanguages: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']
  return supportedLanguages.includes(language as SupportedLanguage)
}

// 获取新闻的所有可用语言
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')

    if (!newsId) {
      return NextResponse.json(
        { error: '新闻ID为必填字段' },
        { status: 400 }
      )
    }

    // 这里应该从数据库获取新闻的多语言数据
    // 暂时返回模拟数据
    const mockMultilingualData = {
      title: {
        zh: '示例中文标题',
        en: 'Sample English Title',
        ja: 'サンプル日本語タイトル'
      },
      content: {
        zh: '示例中文内容...',
        en: 'Sample English content...',
        ja: 'サンプル日本語コンテンツ...'
      },
      summary: {
        zh: '示例中文摘要',
        en: 'Sample English summary',
        ja: 'サンプル日本語要約'
      }
    }

    // 获取可用语言列表
    const availableLanguages = Object.keys(mockMultilingualData.title) as SupportedLanguage[]

    return NextResponse.json({
      success: true,
      data: {
        newsId,
        availableLanguages,
        content: mockMultilingualData
      }
    })

  } catch (error) {
    console.error('获取多语言数据失败:', error)
    return NextResponse.json(
      { error: '获取多语言数据失败' },
      { status: 500 }
    )
  }
}
