import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getAllNewsSources, getSourceById } from '@/data/news'
import { NewsCrawlerManager } from '@/lib/news-crawler'

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

// POST - 开始新闻采集
export async function POST(request: NextRequest) {
  try {
    console.log('=== 新闻采集API请求开始 ===')
    
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
    if (!user.permissions.includes('news:create')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { sourceIds, options = {} } = body

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要采集的新闻源' },
        { status: 400 }
      )
    }

    // 验证新闻源是否存在
    const sources = []
    for (const sourceId of sourceIds) {
      const source = getSourceById(sourceId)
      if (!source) {
        return NextResponse.json(
          { error: `新闻源不存在: ${sourceId}` },
          { status: 400 }
        )
      }
      if (!source.isActive) {
        return NextResponse.json(
          { error: `新闻源已禁用: ${source.name}` },
          { status: 400 }
        )
      }
      sources.push(source)
    }

    // 创建采集管理器
    const crawlerManager = new NewsCrawlerManager()
    
    // 开始采集
    console.log(`开始采集 ${sources.length} 个新闻源`)
    const jobs = []
    
    for (const source of sources) {
      try {
        console.log(`启动采集任务: ${source.name}`)
        const job = await crawlerManager.crawlSource(source)
        jobs.push(job)
        console.log(`采集任务完成: ${source.name}, 状态: ${job.status}`)
      } catch (error) {
        console.error(`采集任务失败: ${source.name}`, error)
        jobs.push({
          id: Date.now().toString(),
          sourceId: source.id,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          totalFound: 0,
          totalProcessed: 0,
          totalSuccess: 0,
          totalFailed: 1,
          errors: [error instanceof Error ? error.message : String(error)],
          createdAt: new Date()
        })
      }
    }

    // 统计结果
    const summary = {
      totalJobs: jobs.length,
      successfulJobs: jobs.filter(job => job.status === 'completed').length,
      failedJobs: jobs.filter(job => job.status === 'failed').length,
      totalArticlesFound: jobs.reduce((sum, job) => sum + job.totalFound, 0),
      totalArticlesProcessed: jobs.reduce((sum, job) => sum + job.totalProcessed, 0),
      totalArticlesSuccess: jobs.reduce((sum, job) => sum + job.totalSuccess, 0),
      totalArticlesFailed: jobs.reduce((sum, job) => sum + job.totalFailed, 0)
    }

    console.log('采集任务汇总:', summary)
    
    return NextResponse.json(
      {
        message: '新闻采集完成',
        data: {
          summary,
          jobs
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('新闻采集错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET - 获取采集状态和历史
export async function GET(request: NextRequest) {
  try {
    console.log('=== 获取采集状态API请求开始 ===')
    
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

    // 获取新闻源列表
    const sources = getAllNewsSources()
    
    // 模拟采集状态（实际应用中应该从数据库获取）
    const status = {
      isRunning: false,
      lastRunAt: new Date(Date.now() - 3600000), // 1小时前
      nextRunAt: new Date(Date.now() + 3600000), // 1小时后
      totalSources: sources.length,
      activeSources: sources.filter(s => s.isActive).length,
      recentJobs: [] // 这里应该从数据库获取最近的采集任务
    }

    console.log('获取采集状态成功')
    return NextResponse.json(
      {
        message: '获取采集状态成功',
        data: {
          status,
          sources: sources.map(source => ({
            id: source.id,
            name: source.name,
            type: source.type,
            isActive: source.isActive,
            lastCrawlAt: source.lastCrawlAt,
            crawlInterval: source.crawlInterval
          }))
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取采集状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
