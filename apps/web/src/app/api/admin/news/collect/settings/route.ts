import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 默认采集设置
const defaultSettings = {
  globalMaxArticles: 50,
  globalMinQuality: 60,
  enableDuplicateDetection: true,
  crawlInterval: 60,
  enableAutoPublish: false,
  enableAIProcessing: true,
  retryAttempts: 3,
  timeout: 30000
}

// 存储设置的简单内存存储（生产环境应使用数据库）
let crawlSettings = { ...defaultSettings }

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

// GET - 获取采集设置
export async function GET(request: NextRequest) {
  try {
    console.log('=== 获取采集设置API请求开始 ===')
    
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

    console.log('获取采集设置成功')
    return NextResponse.json(
      {
        message: '获取采集设置成功',
        data: {
          settings: crawlSettings
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取采集设置错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST - 更新采集设置
export async function POST(request: NextRequest) {
  try {
    console.log('=== 更新采集设置API请求开始 ===')
    
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
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { error: '缺少设置数据' },
        { status: 400 }
      )
    }

    // 验证设置数据
    const validatedSettings = {
      globalMaxArticles: Math.max(1, Math.min(200, settings.globalMaxArticles || defaultSettings.globalMaxArticles)),
      globalMinQuality: Math.max(0, Math.min(100, settings.globalMinQuality || defaultSettings.globalMinQuality)),
      enableDuplicateDetection: Boolean(settings.enableDuplicateDetection),
      crawlInterval: Math.max(5, Math.min(1440, settings.crawlInterval || defaultSettings.crawlInterval)),
      enableAutoPublish: Boolean(settings.enableAutoPublish),
      enableAIProcessing: Boolean(settings.enableAIProcessing),
      retryAttempts: Math.max(0, Math.min(10, settings.retryAttempts || defaultSettings.retryAttempts)),
      timeout: Math.max(5000, Math.min(120000, settings.timeout || defaultSettings.timeout))
    }

    // 更新设置
    crawlSettings = validatedSettings

    console.log('采集设置更新成功:', validatedSettings)
    return NextResponse.json(
      {
        message: '采集设置更新成功',
        data: {
          settings: crawlSettings
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('更新采集设置错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取当前设置的导出函数
export function getCrawlSettings() {
  return { ...crawlSettings }
}

// 重置设置为默认值
export function resetCrawlSettings() {
  crawlSettings = { ...defaultSettings }
  return crawlSettings
}
