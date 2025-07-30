// 管理员拒绝评论API
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 模拟评论数据 - 实际项目中应该从数据库获取
let comments: any[] = [
  {
    id: '1',
    newsId: '1753560316774',
    author: '张三',
    email: 'zhangsan@example.com',
    content: '这篇文章写得很好，对服装行业的分析很到位！',
    parentId: undefined,
    status: 'approved',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    newsId: '1753560316774',
    author: '李四',
    email: 'lisi@example.com',
    content: '同意楼上的观点，现在服装行业确实面临很多挑战。',
    parentId: '1',
    status: 'approved',
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z')
  },
  {
    id: '3',
    newsId: '1753560316774',
    author: '王五',
    email: 'wangwu@example.com',
    content: '希望能看到更多关于可持续时尚的内容。',
    parentId: undefined,
    status: 'pending',
    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z')
  }
]

// 拒绝评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未提供认证信息' },
        { status: 401 }
      )
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json(
        { error: '无效的认证格式' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的令牌' },
        { status: 401 }
      )
    }

    const admin = findAdminById(payload.userId)
    if (!admin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    if (!admin.permissions.includes('comments:moderate')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 查找评论
    const comment = comments.find(c => c.id === params.id)
    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }

    // 更新评论状态
    comment.status = 'rejected'
    comment.updatedAt = new Date()

    return NextResponse.json({
      success: true,
      message: '评论已拒绝',
      data: comment
    })

  } catch (error) {
    console.error('拒绝评论失败:', error)
    return NextResponse.json(
      { error: '拒绝评论失败' },
      { status: 500 }
    )
  }
}
