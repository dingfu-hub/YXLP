import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import {
  getAllSources,
  getSourceById,
  createNewsSource as createSource,
  updateNewsSource as updateSource,
  deleteNewsSource as deleteSource,
  getActiveSources
} from '@/data/news'
import { NewsSource } from '@/types/news'

// 获取所有RSS源
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

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const language = searchParams.get('language')
    const country = searchParams.get('country')
    const search = searchParams.get('search')

    // 获取源数据
    let sources = activeOnly ? getActiveSources() : getAllSources()

    // 应用过滤器
    if (category) {
      sources = sources.filter(source => source.category === category)
    }
    if (type) {
      sources = sources.filter(source => source.type === type)
    }
    if (language) {
      sources = sources.filter(source => source.language === language)
    }
    if (country) {
      sources = sources.filter(source => source.country === country)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      sources = sources.filter(source =>
        source.name.toLowerCase().includes(searchLower) ||
        source.url.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: sources,
      total: sources.length
    })

  } catch (error) {
    console.error('获取RSS源失败:', error)
    return NextResponse.json(
      { error: '获取RSS源失败' },
      { status: 500 }
    )
  }
}

// 创建新的RSS源
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
      name,
      type,
      url,
      category,
      language,
      country,
      crawlInterval,
      rssConfig,
      scrapingConfig,
      apiConfig
    } = body

    // 验证必填字段
    if (!name || !type || !url || !category) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 创建新源
    const newSource: Omit<NewsSource, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      type,
      url,
      category,
      language: language || 'zh',
      country: country || 'CN',
      isActive: true,
      crawlInterval: crawlInterval || 60,
      rssConfig: type === 'rss' ? rssConfig : undefined,
      scrapingConfig: type === 'web_scraping' ? scrapingConfig : undefined,
      apiConfig: type === 'api' ? apiConfig : undefined,
      lastCrawledAt: null
    }

    const createdSource = createSource(newSource)

    return NextResponse.json({
      success: true,
      data: createdSource,
      message: 'RSS源创建成功'
    })

  } catch (error) {
    console.error('创建RSS源失败:', error)
    return NextResponse.json(
      { error: '创建RSS源失败' },
      { status: 500 }
    )
  }
}

// 更新RSS源
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: '缺少源ID' },
        { status: 400 }
      )
    }

    // 检查源是否存在
    const existingSource = getSourceById(id)
    if (!existingSource) {
      return NextResponse.json(
        { error: 'RSS源不存在' },
        { status: 404 }
      )
    }

    // 更新源
    const updatedSource = updateSource(id, updateData)

    return NextResponse.json({
      success: true,
      data: updatedSource,
      message: 'RSS源更新成功'
    })

  } catch (error) {
    console.error('更新RSS源失败:', error)
    return NextResponse.json(
      { error: '更新RSS源失败' },
      { status: 500 }
    )
  }
}

// 删除RSS源
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少源ID' },
        { status: 400 }
      )
    }

    // 检查源是否存在
    const existingSource = getSourceById(id)
    if (!existingSource) {
      return NextResponse.json(
        { error: 'RSS源不存在' },
        { status: 404 }
      )
    }

    // 删除源
    const success = deleteSource(id)
    if (!success) {
      return NextResponse.json(
        { error: '删除RSS源失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'RSS源删除成功'
    })

  } catch (error) {
    console.error('删除RSS源失败:', error)
    return NextResponse.json(
      { error: '删除RSS源失败' },
      { status: 500 }
    )
  }
}
