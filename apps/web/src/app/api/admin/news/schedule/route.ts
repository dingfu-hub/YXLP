import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getNewsById, updateNews } from '@/data/news'

// 模拟定时任务存储
let scheduledTasks: Array<{
  id: string
  articleId: string
  articleTitle: string
  scheduledTime: Date
  settings: any
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
  executedAt?: Date
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
    const { articleIds, settings } = body

    // 验证必填字段
    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: '缺少文章ID列表' },
        { status: 400 }
      )
    }

    if (!settings || !settings.scheduledTime) {
      return NextResponse.json(
        { error: '缺少定时发布时间' },
        { status: 400 }
      )
    }

    const scheduledTime = new Date(settings.scheduledTime)
    
    // 验证发布时间
    if (scheduledTime <= new Date()) {
      return NextResponse.json(
        { error: '发布时间必须是未来时间' },
        { status: 400 }
      )
    }

    let scheduledCount = 0
    let failedCount = 0
    const results = []

    // 为每篇文章创建定时任务
    for (const articleId of articleIds) {
      try {
        const article = getNewsById(articleId)
        
        if (!article) {
          results.push({
            articleId,
            success: false,
            error: '文章不存在'
          })
          failedCount++
          continue
        }

        // 创建定时任务
        const task = {
          id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          articleId,
          articleTitle: article.title,
          scheduledTime,
          settings,
          status: 'pending' as const,
          createdAt: new Date()
        }

        scheduledTasks.push(task)

        // 更新文章状态为已安排
        const updateData = {
          status: 'scheduled',
          scheduledAt: scheduledTime,
          updatedAt: new Date()
        }

        const updatedArticle = updateNews(articleId, updateData)
        
        if (updatedArticle) {
          results.push({
            articleId,
            success: true,
            taskId: task.id,
            scheduledTime
          })
          scheduledCount++

          // 设置定时器执行发布
          const delay = scheduledTime.getTime() - Date.now()
          setTimeout(() => {
            executeScheduledTask(task.id)
          }, delay)
        } else {
          results.push({
            articleId,
            success: false,
            error: '更新文章状态失败'
          })
          failedCount++
          
          // 移除创建的任务
          const taskIndex = scheduledTasks.findIndex(t => t.id === task.id)
          if (taskIndex !== -1) {
            scheduledTasks.splice(taskIndex, 1)
          }
        }

      } catch (error) {
        console.error(`处理文章 ${articleId} 定时任务时出错:`, error)
        results.push({
          articleId,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scheduled: scheduledCount,
        failed: failedCount,
        total: articleIds.length,
        results
      },
      message: `成功安排 ${scheduledCount} 篇文章定时发布，失败 ${failedCount} 篇`
    })

  } catch (error) {
    console.error('创建定时发布任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取定时任务列表
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
    const limit = parseInt(searchParams.get('limit') || '50')

    // 筛选任务
    let filteredTasks = scheduledTasks
    
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    // 按计划时间排序
    filteredTasks.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())

    // 限制返回数量
    if (limit > 0) {
      filteredTasks = filteredTasks.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length
    })

  } catch (error) {
    console.error('获取定时任务列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 取消定时任务
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
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 获取要取消的任务ID
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      )
    }

    // 查找任务
    const taskIndex = scheduledTasks.findIndex(task => task.id === taskId)
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    const task = scheduledTasks[taskIndex]
    
    // 只能取消待执行的任务
    if (task.status !== 'pending') {
      return NextResponse.json(
        { error: '只能取消待执行的任务' },
        { status: 400 }
      )
    }

    // 更新任务状态
    task.status = 'cancelled'

    // 更新文章状态回到草稿
    const updateData = {
      status: 'draft',
      scheduledAt: undefined,
      updatedAt: new Date()
    }

    updateNews(task.articleId, updateData)

    return NextResponse.json({
      success: true,
      message: '定时任务已取消'
    })

  } catch (error) {
    console.error('取消定时任务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 执行定时任务的函数
async function executeScheduledTask(taskId: string) {
  try {
    const task = scheduledTasks.find(t => t.id === taskId)
    
    if (!task || task.status !== 'pending') {
      return
    }

    const article = getNewsById(task.articleId)
    
    if (!article) {
      task.status = 'failed'
      task.error = '文章不存在'
      task.executedAt = new Date()
      return
    }

    // 执行发布
    const updateData = {
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date()
    }

    const updatedArticle = updateNews(task.articleId, updateData)
    
    if (updatedArticle) {
      task.status = 'completed'
      task.executedAt = new Date()
      console.log(`定时任务 ${taskId} 执行成功，文章 "${article.title}" 已发布`)
    } else {
      task.status = 'failed'
      task.error = '发布失败'
      task.executedAt = new Date()
    }

  } catch (error) {
    console.error(`执行定时任务 ${taskId} 时出错:`, error)
    const task = scheduledTasks.find(t => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : '未知错误'
      task.executedAt = new Date()
    }
  }
}
