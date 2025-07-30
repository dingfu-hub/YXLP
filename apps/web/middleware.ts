import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, isTokenBlacklisted } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否为后台路由
  if (pathname.startsWith('/admin')) {
    // 登录页面允许访问
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // 获取 token
    const token = request.cookies.get('admin_token')?.value

    // 如果没有 token，重定向到登录页
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // 检查 token 是否在黑名单中
    if (isTokenBlacklisted(token)) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }

    // 验证 token
    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }

    // Token 有效，继续处理请求
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
