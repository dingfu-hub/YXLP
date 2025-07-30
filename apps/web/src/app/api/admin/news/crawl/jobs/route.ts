import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 模拟爬取任务数据存储
let crawlJobs: Array<{
  id: string
  sourceId: string
  sourceName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  articlesFound: number
  articlesProcessed: number
  startedAt: Date
  completedAt?: Date
  error?: string
}> = []

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
    if (!user.permissions.includes('news:read')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 筛选任务
    let filteredJobs = crawlJobs
    
    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status)
    }

    // 按开始时间倒序排列
    filteredJobs.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

    // 限制返回数量
    if (limit > 0) {
      filteredJobs = filteredJobs.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      data: filteredJobs,
      total: filteredJobs.length
    })

  } catch (error) {
    console.error('获取爬取任务列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

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

    // 解析请求体
    const body = await request.json()
    const { sourceId, sourceName } = body

    if (!sourceId || !sourceName) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 创建新的爬取任务
    const newJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      sourceName,
      status: 'pending' as const,
      progress: 0,
      articlesFound: 0,
      articlesProcessed: 0,
      startedAt: new Date()
    }

    crawlJobs.push(newJob)

    // 模拟异步处理
    setTimeout(() => {
      const job = crawlJobs.find(j => j.id === newJob.id)
      if (job) {
        job.status = 'running'
        job.progress = 10
        
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          const currentJob = crawlJobs.find(j => j.id === newJob.id)
          if (currentJob && currentJob.status === 'running') {
            currentJob.progress = Math.min(100, currentJob.progress + Math.random() * 20)
            currentJob.articlesFound = Math.floor(currentJob.progress / 10) * 3
            currentJob.articlesProcessed = Math.floor(currentJob.articlesFound * 0.8)
            
            if (currentJob.progress >= 100) {
              currentJob.status = 'completed'
              currentJob.completedAt = new Date()
              clearInterval(progressInterval)
            }
          } else {
            clearInterval(progressInterval)
          }
        }, 2000)
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      data: newJob,
      message: '爬取任务创建成功'
    })

  } catch (error) {
    console.error('创建爬取任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

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

    // 获取要删除的任务ID
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')

    if (!jobId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      )
    }

    // 查找并删除任务
    const jobIndex = crawlJobs.findIndex(job => job.id === jobId)
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    const job = crawlJobs[jobIndex]
    
    // 只能删除已完成或失败的任务
    if (job.status === 'running' || job.status === 'pending') {
      return NextResponse.json(
        { error: '无法删除正在运行的任务' },
        { status: 400 }
      )
    }

    crawlJobs.splice(jobIndex, 1)

    return NextResponse.json({
      success: true,
      message: '任务删除成功'
    })

  } catch (error) {
    console.error('删除爬取任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
