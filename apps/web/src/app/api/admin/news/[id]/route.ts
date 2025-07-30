import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getNewsById, updateNews, deleteNews } from '@/data/news'
import { UpdateNewsRequest } from '@/types/news'

// 获取单个新闻详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const article = getNewsById(params.id)
    if (!article) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: '获取新闻详情成功',
        data: article
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

// 更新新闻
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const article = getNewsById(params.id)
    if (!article) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    const body: Partial<UpdateNewsRequest> = await request.json()
    const updates: any = {}

    // 处理多语言内容
    const {
      title,
      content,
      summary,
      multiLanguageContent,
      aiProcessed,
      aiModel,
      polishedLanguages
    } = body

    // 处理多语言标题
    if (title !== undefined || multiLanguageContent?.title) {
      if (multiLanguageContent?.title) {
        updates.title = multiLanguageContent.title
      } else if (typeof title === 'string') {
        updates.title = { ...article.title, zh: title }
      } else {
        updates.title = title
      }

      // 重新生成slug（使用中文标题）
      const titleForSlug = updates.title.zh || Object.values(updates.title)[0] || ''
      updates.slug = titleForSlug
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
    }

    // 处理多语言内容
    if (content !== undefined || multiLanguageContent?.content) {
      if (multiLanguageContent?.content) {
        updates.content = multiLanguageContent.content
      } else if (typeof content === 'string') {
        updates.content = { ...article.content, zh: content }
      } else {
        updates.content = content
      }
    }

    // 处理多语言摘要
    if (summary !== undefined || multiLanguageContent?.summary) {
      if (multiLanguageContent?.summary) {
        updates.summary = multiLanguageContent.summary
      } else if (typeof summary === 'string') {
        updates.summary = { ...article.summary, zh: summary }
      } else {
        updates.summary = summary
      }
    }

    // 处理其他字段
    if (body.category !== undefined) updates.category = body.category
    if (body.status !== undefined) {
      updates.status = body.status
      // 如果状态改为已发布且没有发布时间，设置发布时间
      if (body.status === 'published' && !article.publishedAt) {
        updates.publishedAt = new Date()
      }
    }
    if (body.sourceUrl !== undefined) updates.sourceUrl = body.sourceUrl
    if (body.sourceName !== undefined) updates.sourceName = body.sourceName
    if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage
    if (aiProcessed !== undefined) updates.aiProcessed = aiProcessed
    if (aiModel !== undefined) updates.aiModel = aiModel
    if (polishedLanguages !== undefined) updates.polishedLanguages = polishedLanguages
    if (body.keywords !== undefined) updates.keywords = body.keywords
    if (body.publishedAt !== undefined) {
      updates.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    }

    const updatedArticle = updateNews(params.id, updates)
    if (!updatedArticle) {
      return NextResponse.json(
        { error: '更新新闻失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: '新闻更新成功',
        data: updatedArticle
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('更新新闻错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除新闻
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!user.permissions.includes('news:delete')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const article = getNewsById(params.id)
    if (!article) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    const success = deleteNews(params.id)
    if (!success) {
      return NextResponse.json(
        { error: '删除新闻失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: '新闻删除成功'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('删除新闻错误:', error)
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
