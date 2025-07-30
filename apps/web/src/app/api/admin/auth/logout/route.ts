import { NextRequest, NextResponse } from 'next/server'
import { blacklistToken, parseAuthHeader } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // 从 Cookie 或 Authorization header 获取 token
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (token) {
      // 将 token 加入黑名单
      blacklistToken(token)
      console.log('Admin logout: token blacklisted')
    }

    // 创建响应
    const response = NextResponse.json(
      {
        success: true,
        message: '登出成功'
      },
      { status: 200 }
    )

    // 清除 Cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/admin'
    })

    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误'
      },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
