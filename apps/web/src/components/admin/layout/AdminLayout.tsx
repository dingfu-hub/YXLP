'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'
import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumb from './Breadcrumb'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isLoading } = useAdmin()
  const pathname = usePathname()
  const router = useRouter()



  // 未登录重定向到登录页 - 将useEffect放在条件渲染之前
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [user, isLoading, router, pathname])

  // 如果是登录页面，不显示布局
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // 加载中显示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果未登录，显示加载状态而不是null
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到登录页...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 顶部导航 - sticky定位 */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* 主内容区域 - 为sticky header预留空间 */}
      <div className="lg:pl-64">
        {/* 页面内容 */}
        {pathname.includes('/admin/dashboard') || pathname === '/admin' ? (
          // 仪表板页面：完全无间距
          <div className="px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        ) : (
          // 其他页面：正常布局
          <main className="p-4 lg:p-6">
            {/* 面包屑导航 */}
            <div className="mb-6">
              <Breadcrumb />
            </div>

            {/* 页面内容 */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
