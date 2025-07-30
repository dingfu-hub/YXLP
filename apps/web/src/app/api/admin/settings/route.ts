import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 简化的管理员认证函数
async function authenticateAdmin(request: NextRequest) {
  console.log('开始系统设置认证')
  
  // 从 Cookie 或 Authorization header 获取 token
  let token = request.cookies.get('admin_token')?.value
  console.log('Cookie token:', token ? '存在' : '不存在')

  if (!token) {
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    token = parseAuthHeader(authHeader)
    console.log('Parsed token from header:', token ? '存在' : '不存在')
  }

  if (!token) {
    console.log('未找到token')
    return { error: 'Authentication required', status: 401 }
  }

  // 检查 token 是否在黑名单中
  if (isTokenBlacklisted(token)) {
    console.log('Token在黑名单中')
    return { error: 'Token has been revoked', status: 401 }
  }

  // 验证 token
  const payload = await verifyToken(token)
  console.log('Token验证结果:', payload ? '有效' : '无效')
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  console.log('Token payload:', payload)

  // 查找管理员用户
  const currentUser = findAdminById(payload.userId)
  console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
  if (!currentUser) {
    return { error: 'Admin user not found', status: 404 }
  }

  console.log('管理员用户角色:', currentUser.role)

  // 检查用户是否激活
  if (!currentUser.isActive) {
    console.log('用户未激活')
    return { error: 'Account has been disabled', status: 403 }
  }

  // 检查权限 - 只有超级管理员可以修改系统设置
  if (currentUser.role !== 'super_admin') {
    console.log('权限不足，当前角色:', currentUser.role)
    return { error: 'Only super admin can access system settings', status: 403 }
  }

  console.log('认证成功，用户:', currentUser.name, '角色:', currentUser.role)
  return { user: currentUser, payload }
}

// 默认系统设置
const defaultSettings = {
  siteName: 'YXLP 服装平台',
  siteDescription: '专业的服装批发零售平台',
  siteUrl: 'https://yxlp.com',
  adminEmail: 'admin@yxlp.com',
  maintenanceMode: false,
  allowRegistration: true,
  emailVerificationRequired: true,
  maxFileUploadSize: 10,
  supportedLanguages: ['zh-CN', 'en-US'],
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  currency: 'CNY',
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpSecure: true
}

// 模拟设置存储（实际应用中应使用数据库）
let systemSettings = { ...defaultSettings }

// 获取系统设置
export async function GET(request: NextRequest) {
  try {
    console.log('=== 获取系统设置API ===')
    
    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('认证成功，返回系统设置')

    return NextResponse.json({
      success: true,
      data: systemSettings
    })

  } catch (error) {
    console.error('获取系统设置错误:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 更新系统设置
export async function PUT(request: NextRequest) {
  try {
    console.log('=== 更新系统设置API ===')
    
    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('认证成功，开始更新设置')
    const { user: currentUser } = authResult

    const body = await request.json()
    console.log('接收到的设置数据:', body)

    // 验证必填字段
    if (!body.siteName || !body.adminEmail) {
      return NextResponse.json({
        success: false,
        message: '网站名称和管理员邮箱为必填字段',
        error: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.adminEmail)) {
      return NextResponse.json({
        success: false,
        message: '管理员邮箱格式不正确',
        error: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 验证文件上传大小
    if (body.maxFileUploadSize && (body.maxFileUploadSize < 1 || body.maxFileUploadSize > 100)) {
      return NextResponse.json({
        success: false,
        message: '文件上传大小必须在1-100MB之间',
        error: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 更新设置
    systemSettings = {
      ...systemSettings,
      ...body,
      updatedAt: new Date(),
      updatedBy: currentUser.id
    }

    console.log('设置更新成功')

    return NextResponse.json({
      success: true,
      message: '系统设置更新成功',
      data: systemSettings
    })

  } catch (error) {
    console.error('更新系统设置错误:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 重置系统设置
export async function DELETE(request: NextRequest) {
  try {
    console.log('=== 重置系统设置API ===')
    
    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('认证成功，重置设置为默认值')
    const { user: currentUser } = authResult

    // 重置为默认设置
    systemSettings = {
      ...defaultSettings,
      updatedAt: new Date(),
      updatedBy: currentUser.id
    }

    console.log('设置重置成功')

    return NextResponse.json({
      success: true,
      message: '系统设置已重置为默认值',
      data: systemSettings
    })

  } catch (error) {
    console.error('重置系统设置错误:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
