import { NextRequest, NextResponse } from 'next/server'

// 支持的语言列表
const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']
const DEFAULT_LOCALE = 'zh'

// 不需要语言前缀的路径
const EXCLUDED_PATHS = [
  '/api',
  '/admin',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]

/**
 * 从Accept-Language头部检测用户首选语言
 */
function detectLanguageFromHeader(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE

  // 解析Accept-Language头部
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0].toLowerCase(), // 只取主语言代码
        quality: parseFloat(q)
      }
    })
    .sort((a, b) => b.quality - a.quality) // 按质量排序

  // 找到第一个支持的语言
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang.code)) {
      return lang.code
    }
  }

  return DEFAULT_LOCALE
}

/**
 * 从Cookie获取用户保存的语言偏好
 */
function getLanguageFromCookie(request: NextRequest): string | null {
  const cookieLanguage = request.cookies.get('preferred-language')?.value
  if (cookieLanguage && SUPPORTED_LOCALES.includes(cookieLanguage)) {
    return cookieLanguage
  }
  return null
}

/**
 * 检查路径是否需要语言处理
 */
function shouldProcessPath(pathname: string): boolean {
  return !EXCLUDED_PATHS.some(path => pathname.startsWith(path))
}

/**
 * 获取当前路径的语言代码
 */
function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment
  }
  
  return null
}

/**
 * 构建带语言前缀的URL
 */
function buildLocalizedUrl(request: NextRequest, locale: string, pathname?: string): URL {
  const url = new URL(request.url)
  const targetPath = pathname || url.pathname
  
  // 移除现有的语言前缀
  const pathWithoutLocale = targetPath.replace(/^\/[a-z]{2}(\/|$)/, '/')
  
  // 添加新的语言前缀
  url.pathname = `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
  
  return url
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过不需要处理的路径
  if (!shouldProcessPath(pathname)) {
    return NextResponse.next()
  }

  // 对于现有路由，只设置语言Cookie，不重定向
  const cookieLanguage = getLanguageFromCookie(request)
  const browserLanguage = detectLanguageFromHeader(request.headers.get('accept-language'))

  const response = NextResponse.next()

  // 如果没有语言Cookie，设置默认语言
  if (!cookieLanguage) {
    const targetLanguage = browserLanguage
    response.cookies.set('preferred-language', targetLanguage, {
      maxAge: 60 * 60 * 24 * 365, // 1年
      httpOnly: false,
      sameSite: 'lax'
    })
  }

  return response
}

// 配置中间件匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin routes (管理后台保持中文)
     * - 静态资源
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|.*\\.).*)',
  ],
}
