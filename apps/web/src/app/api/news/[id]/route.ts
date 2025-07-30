import { NextRequest, NextResponse } from 'next/server'
import { getNewsById, updateNews } from '@/data/news'

// 获取单个新闻详情 - 公共API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = getNewsById(params.id)
    
    if (!article) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    // 只返回已发布的新闻
    if (article.status !== 'published') {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    updateNews(params.id, {
      viewCount: article.viewCount + 1
    })

    // 转换为公共格式
    const publicArticle = {
      id: parseInt(article.id),
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      author: article.author || '未知作者',
      publishDate: article.publishedAt 
        ? article.publishedAt.toISOString().split('T')[0] 
        : article.createdAt.toISOString().split('T')[0],
      readCount: article.viewCount + 1, // 返回更新后的浏览量
      image: article.featuredImage || '/api/placeholder/600/400',
      tags: article.keywords || [],
      featured: article.viewCount > 500,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName
    }

    return NextResponse.json(
      {
        message: '获取新闻详情成功',
        data: publicArticle
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取新闻详情错误:', error)
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
