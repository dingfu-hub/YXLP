import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getNewsScheduler, startNewsScheduler, stopNewsScheduler } from '@/lib/news-scheduler'

// 获取调度器状态
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

    const scheduler = getNewsScheduler()
    const status = scheduler.getStatus()

    return NextResponse.json(
      {
        message: '获取调度器状态成功',
        data: status
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取调度器状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 控制调度器
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
    const { action, sourceId, articleIds } = body

    const scheduler = getNewsScheduler()

    switch (action) {
      case 'start':
        scheduler.start()
        return NextResponse.json(
          { message: '调度器已启动' },
          { status: 200 }
        )

      case 'stop':
        scheduler.stop()
        return NextResponse.json(
          { message: '调度器已停止' },
          { status: 200 }
        )

      case 'trigger_crawl':
        const crawlResult = await scheduler.triggerCrawl(sourceId)
        return NextResponse.json(
          {
            message: '采集任务已触发',
            data: crawlResult
          },
          { status: 200 }
        )

      case 'trigger_ai':
        if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
          return NextResponse.json(
            { error: '请提供要处理的文章ID列表' },
            { status: 400 }
          )
        }

        const aiResult = await scheduler.triggerAIProcess(articleIds)
        return NextResponse.json(
          {
            message: 'AI处理任务已触发',
            data: aiResult
          },
          { status: 200 }
        )

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('调度器操作错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
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
