// 定时采集管理API
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 模拟定时任务数据存储
let scheduleRules: any[] = [
  {
    id: '1',
    name: '每日服装新闻采集',
    description: '每天上午9点自动采集最新的服装行业新闻',
    cronExpression: '0 9 * * *',
    isActive: true,
    aiModel: 'deepseek',
    targetLanguages: ['zh', 'en', 'ja'],
    sourceIds: ['1', '2', '3'],
    lastRun: new Date('2024-01-16T09:00:00Z'),
    nextRun: new Date('2024-01-17T09:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-16T09:00:00Z')
  },
  {
    id: '2',
    name: '内衣行业快讯',
    description: '每6小时采集内衣行业的最新动态',
    cronExpression: '0 */6 * * *',
    isActive: false,
    aiModel: 'gpt-4',
    targetLanguages: ['zh', 'en'],
    sourceIds: ['4', '5'],
    lastRun: new Date('2024-01-16T06:00:00Z'),
    nextRun: new Date('2024-01-16T12:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T18:00:00Z')
  }
]

// 获取所有定时任务
export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      data: scheduleRules
    })

  } catch (error) {
    console.error('获取定时任务失败:', error)
    return NextResponse.json(
      { error: '获取定时任务失败' },
      { status: 500 }
    )
  }
}

// 创建定时任务
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      description,
      cronExpression,
      aiModel = 'deepseek',
      targetLanguages = ['zh', 'en'],
      sourceIds = []
    } = body

    // 验证必填字段
    if (!name || !cronExpression) {
      return NextResponse.json(
        { error: '任务名称和执行时间为必填字段' },
        { status: 400 }
      )
    }

    // 验证cron表达式
    if (!isValidCronExpression(cronExpression)) {
      return NextResponse.json(
        { error: '无效的cron表达式' },
        { status: 400 }
      )
    }

    // 创建新的定时任务
    const newSchedule = {
      id: Date.now().toString(),
      name,
      description: description || '',
      cronExpression,
      isActive: true,
      aiModel,
      targetLanguages,
      sourceIds,
      lastRun: undefined,
      nextRun: calculateNextRun(cronExpression),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    scheduleRules.push(newSchedule)

    return NextResponse.json({
      success: true,
      message: '定时任务创建成功',
      data: newSchedule
    })

  } catch (error) {
    console.error('创建定时任务失败:', error)
    return NextResponse.json(
      { error: '创建定时任务失败' },
      { status: 500 }
    )
  }
}

// 验证cron表达式
function isValidCronExpression(cron: string): boolean {
  // 简单的cron表达式验证
  const parts = cron.split(' ')
  if (parts.length !== 5) return false
  
  // 这里可以添加更详细的验证逻辑
  return true
}

// 计算下次执行时间
function calculateNextRun(cronExpression: string): Date {
  // 简化的下次执行时间计算
  // 实际项目中应该使用专业的cron解析库
  const now = new Date()
  
  switch (cronExpression) {
    case '0 * * * *': // 每小时
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '0 9 * * *': // 每天9点
      const tomorrow9am = new Date(now)
      tomorrow9am.setDate(tomorrow9am.getDate() + 1)
      tomorrow9am.setHours(9, 0, 0, 0)
      return tomorrow9am
    case '0 18 * * *': // 每天18点
      const today6pm = new Date(now)
      today6pm.setHours(18, 0, 0, 0)
      if (today6pm <= now) {
        today6pm.setDate(today6pm.getDate() + 1)
      }
      return today6pm
    case '0 */6 * * *': // 每6小时
      return new Date(now.getTime() + 6 * 60 * 60 * 1000)
    case '0 */12 * * *': // 每12小时
      return new Date(now.getTime() + 12 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 60 * 60 * 1000) // 默认1小时后
  }
}

// 批量操作定时任务
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, scheduleIds } = body

    if (!action || !scheduleIds || scheduleIds.length === 0) {
      return NextResponse.json(
        { error: '缺少操作类型或任务ID' },
        { status: 400 }
      )
    }

    let updatedCount = 0

    switch (action) {
      case 'enable':
        scheduleRules.forEach(rule => {
          if (scheduleIds.includes(rule.id)) {
            rule.isActive = true
            rule.updatedAt = new Date()
            updatedCount++
          }
        })
        break
        
      case 'disable':
        scheduleRules.forEach(rule => {
          if (scheduleIds.includes(rule.id)) {
            rule.isActive = false
            rule.updatedAt = new Date()
            updatedCount++
          }
        })
        break
        
      case 'delete':
        scheduleRules = scheduleRules.filter(rule => !scheduleIds.includes(rule.id))
        updatedCount = scheduleIds.length
        break
        
      default:
        return NextResponse.json(
          { error: '无效的操作类型' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `成功${action === 'enable' ? '启用' : action === 'disable' ? '禁用' : '删除'}了 ${updatedCount} 个任务`,
      data: { updatedCount }
    })

  } catch (error) {
    console.error('批量操作失败:', error)
    return NextResponse.json(
      { error: '批量操作失败' },
      { status: 500 }
    )
  }
}
