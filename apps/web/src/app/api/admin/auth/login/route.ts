import { NextRequest, NextResponse } from 'next/server'
import { findAdminByUsername, validateAdminPassword, updateLastLoginTime, generateTokenPayload } from '@/data/admin-users'
import { generateToken, createCookieOptions } from '@/lib/jwt'
import { LoginRequest, LoginResponse } from '@/types/admin'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: !username ? '请输入用户名' : '请输入密码'
        },
        { status: 400 }
      )
    }

    // 查找管理员用户
    const user = findAdminByUsername(username)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户名或密码错误'
        },
        { status: 401 }
      )
    }

    // 验证密码
    const isPasswordValid = validateAdminPassword(username, password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: '用户名或密码错误'
        },
        { status: 401 }
      )
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: '账户已被禁用，请联系管理员'
        },
        { status: 403 }
      )
    }

    // 生成 JWT Token
    const tokenPayload = generateTokenPayload(user)
    const token = await generateToken(tokenPayload)

    // 更新最后登录时间
    updateLastLoginTime(user.id)

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7天后过期

    // 创建响应数据
    const responseData: LoginResponse = {
      user,
      token,
      expiresAt
    }

    // 创建响应
    const response = NextResponse.json(
      {
        success: true,
        message: '登录成功',
        data: responseData,
        token: token  // 为了兼容测试，同时在顶层提供token
      },
      { status: 200 }
    )

    // 设置 HTTP-only Cookie
    const cookieOptions = createCookieOptions(process.env.NODE_ENV === 'production')
    response.cookies.set('admin_token', token, cookieOptions)

    // 记录登录日志
    console.log(`Admin login: ${user.email} (${user.name}) at ${new Date().toISOString()}`)

    return response

  } catch (error) {
    console.error('Admin login error:', error)
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
