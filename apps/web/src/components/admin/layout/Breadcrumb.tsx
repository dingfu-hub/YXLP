'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb() {
  const pathname = usePathname()

  // 路径映射
  const pathMap: Record<string, string> = {
    '/admin': '仪表板',
    '/admin/dashboard': '数据仪表板',
    '/admin/products': '商品管理',
    '/admin/products/create': '添加商品',
    '/admin/products/categories': '分类管理',
    '/admin/orders': '订单管理',
    '/admin/users': '用户管理',
    '/admin/news': '新闻管理',
    '/admin/news/create': '发布新闻',
    '/admin/analytics': '数据分析',
    '/admin/analytics/sales': '销售分析',
    '/admin/analytics/users': '用户分析',
    '/admin/settings': '系统设置',
    '/admin/settings/profile': '个人资料',
    '/admin/settings/security': '安全设置'
  }

  // 生成面包屑项目
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // 顶级页面不需要显示首页链接
    const topLevelPages = ['/admin', '/admin/dashboard']
    const isTopLevel = topLevelPages.includes(pathname)

    // 如果不是顶级页面，添加首页链接
    if (!isTopLevel) {
      breadcrumbs.push({
        label: '首页',
        href: '/admin'
      })
    }

    // 构建路径
    let currentPath = ''
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`

      // 跳过 admin 根路径
      if (currentPath === '/admin') continue

      const label = pathMap[currentPath]
      if (label) {
        breadcrumbs.push({
          label,
          href: i === pathSegments.length - 1 ? undefined : currentPath
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // 顶级页面不显示面包屑
  const topLevelPages = ['/admin', '/admin/dashboard']
  if (topLevelPages.includes(pathname)) {
    return null
  }

  // 如果只有首页，不显示面包屑
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="w-4 h-4 mx-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
