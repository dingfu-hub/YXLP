// 测试认证API
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

export async function GET(request: NextRequest) {
  try {
    console.log('=== 测试认证API ===')
    
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
      return NextResponse.json({
        success: false,
        message: 'No token found',
        debug: {
          cookies: Object.fromEntries(request.cookies.entries()),
          headers: Object.fromEntries(request.headers.entries())
        }
      }, { status: 401 })
    }

    // 验证 token
    const payload = await verifyToken(token)
    console.log('Token验证结果:', payload ? '有效' : '无效')
    
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
        debug: { tokenExists: true, tokenValid: false }
      }, { status: 401 })
    }

    console.log('Token payload:', payload)

    // 查找管理员用户
    const currentUser = findAdminById(payload.userId)
    console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'Admin user not found',
        debug: { payload, userFound: false }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        role: currentUser.role
      },
      debug: {
        tokenSource: token === request.cookies.get('admin_token')?.value ? 'cookie' : 'header',
        payload
      }
    })

  } catch (error) {
    console.error('测试认证API错误:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
