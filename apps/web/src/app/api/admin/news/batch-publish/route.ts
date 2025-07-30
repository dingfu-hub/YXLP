import { NextRequest, NextResponse } from 'next/server'
import { batchUpdateNewsStatus } from '@/data/news'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

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

    if (!user.isActive) {
      return { success: false, error: 'User account is disabled' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// 批量发布草稿文章
export async function POST(request: NextRequest) {
  try {
    // 管理员认证
    const authResult = await authenticateAdmin(request)
    if (!authResult.success) {
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

    // 批量更新所有文章状态为已发布
    const updatedCount = batchUpdateNewsStatus('published')

    return NextResponse.json(
      {
        message: '批量发布成功',
        data: {
          updatedCount
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('批量发布文章错误:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
