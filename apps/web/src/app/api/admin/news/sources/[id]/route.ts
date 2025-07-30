import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { 
  getSourceById, 
  updateNewsSource,
  deleteNewsSource 
} from '@/data/news'

// 管理员认证函数
async function authenticateAdmin(request: NextRequest) {
  try {
    // 从Cookie或Authorization header获取token
    const cookieToken = request.cookies.get('admin_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = parseAuthHeader(authHeader)
    
    const token = headerToken || cookieToken
    
    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    // 检查token是否在黑名单中
    if (isTokenBlacklisted(token)) {
      return { success: false, error: 'Token has been revoked' }
    }

    // 验证token
    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // 查找管理员用户
    const user = findAdminById(payload.userId)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, user, payload }
  } catch (error) {
    console.error('Admin authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// GET - 获取单个新闻源详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== 获取新闻源详情API请求开始 ===')
    
    // 管理员认证
    const authResult = await authenticateAdmin(request)
    if (!authResult.success) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { user } = authResult

    // 检查权限
    if (!user.permissions.includes('news:view')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const source = getSourceById(params.id)
    if (!source) {
      return NextResponse.json(
        { error: '新闻源不存在' },
        { status: 404 }
      )
    }

    console.log('获取新闻源详情成功:', source.id)
    return NextResponse.json(
      {
        message: '获取新闻源详情成功',
        data: source
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取新闻源详情错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PUT - 更新单个新闻源
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== 更新新闻源API请求开始 ===')
    
    // 管理员认证
    const authResult = await authenticateAdmin(request)
    if (!authResult.success) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { user } = authResult

    // 检查权限
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 检查新闻源是否存在
    const existingSource = getSourceById(params.id)
    if (!existingSource) {
      return NextResponse.json(
        { error: '新闻源不存在' },
        { status: 404 }
      )
    }

    // 解析请求体
    const body = await request.json()
    
    // 验证URL格式（如果提供了URL）
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json(
          { error: 'URL格式无效' },
          { status: 400 }
        )
      }
    }

    // 更新新闻源
    const updatedSource = updateNewsSource(params.id, body)
    if (!updatedSource) {
      return NextResponse.json(
        { error: '更新新闻源失败' },
        { status: 500 }
      )
    }

    console.log('新闻源更新成功:', updatedSource.id)
    return NextResponse.json(
      {
        message: '新闻源更新成功',
        data: updatedSource
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('更新新闻源错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除单个新闻源
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== 删除新闻源API请求开始 ===')
    
    // 管理员认证
    const authResult = await authenticateAdmin(request)
    if (!authResult.success) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { user } = authResult

    // 检查权限
    if (!user.permissions.includes('news:delete')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 检查新闻源是否存在
    const existingSource = getSourceById(params.id)
    if (!existingSource) {
      return NextResponse.json(
        { error: '新闻源不存在' },
        { status: 404 }
      )
    }

    // 删除新闻源
    const success = deleteNewsSource(params.id)
    if (!success) {
      return NextResponse.json(
        { error: '删除新闻源失败' },
        { status: 500 }
      )
    }

    console.log('新闻源删除成功:', params.id)
    return NextResponse.json(
      {
        message: '新闻源删除成功'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('删除新闻源错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
