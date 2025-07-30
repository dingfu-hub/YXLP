import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 模拟批量处理任务存储
let batchJobs: Array<{
  id: string
  articleIds: string[]
  configId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalArticles: number
  processedArticles: number
  successCount: number
  failedCount: number
  startedAt: Date
  completedAt?: Date
  error?: string
}> = []

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
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { articleIds, configId, customPrompts, settings } = body

    // 验证必填字段
    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: '缺少文章ID列表' },
        { status: 400 }
      )
    }

    if (!configId) {
      return NextResponse.json(
        { error: '缺少AI配置ID' },
        { status: 400 }
      )
    }

    // 创建批量处理任务
    const batchJob = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      articleIds,
      configId,
      status: 'pending' as const,
      progress: 0,
      totalArticles: articleIds.length,
      processedArticles: 0,
      successCount: 0,
      failedCount: 0,
      startedAt: new Date()
    }

    batchJobs.push(batchJob)

    // 模拟异步批量处理
    setTimeout(() => {
      const job = batchJobs.find(j => j.id === batchJob.id)
      if (job) {
        job.status = 'running'
        
        // 模拟逐个处理文章
        const processInterval = setInterval(() => {
          const currentJob = batchJobs.find(j => j.id === batchJob.id)
          if (currentJob && currentJob.status === 'running') {
            // 模拟处理一篇文章
            if (currentJob.processedArticles < currentJob.totalArticles) {
              currentJob.processedArticles++
              
              // 模拟成功/失败概率
              if (Math.random() > 0.1) { // 90% 成功率
                currentJob.successCount++
              } else {
                currentJob.failedCount++
              }
              
              currentJob.progress = Math.round((currentJob.processedArticles / currentJob.totalArticles) * 100)
            }
            
            // 检查是否完成
            if (currentJob.processedArticles >= currentJob.totalArticles) {
              currentJob.status = 'completed'
              currentJob.completedAt = new Date()
              clearInterval(processInterval)
            }
          } else {
            clearInterval(processInterval)
          }
        }, 1500) // 每1.5秒处理一篇文章
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      data: {
        jobId: batchJob.id,
        jobsCreated: 1,
        totalArticles: articleIds.length
      },
      message: '批量AI处理任务已启动'
    })

  } catch (error) {
    console.error('创建批量AI处理任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

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
    let filteredJobs = batchJobs
    
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
    console.error('获取批量处理任务列表错误:', error)
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
    const jobIndex = batchJobs.findIndex(job => job.id === jobId)
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    const job = batchJobs[jobIndex]
    
    // 只能删除已完成或失败的任务
    if (job.status === 'running' || job.status === 'pending') {
      return NextResponse.json(
        { error: '无法删除正在运行的任务' },
        { status: 400 }
      )
    }

    batchJobs.splice(jobIndex, 1)

    return NextResponse.json({
      success: true,
      message: '批量处理任务删除成功'
    })

  } catch (error) {
    console.error('删除批量处理任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
