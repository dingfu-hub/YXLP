'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CategoriesPageProps {
  params: {
    locale: string
  }
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const router = useRouter()

  useEffect(() => {
    // 重定向到根级别的分类页面，保持现有功能
    router.replace('/categories')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Categories...</h1>
        <p className="text-gray-600">正在跳转到分类页面...</p>
      </div>
    </div>
  )
}
