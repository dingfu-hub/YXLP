'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProductsPageProps {
  params: {
    locale: string
  }
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const router = useRouter()

  useEffect(() => {
    // 重定向到根级别的产品页面，保持现有功能
    router.replace('/products')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Products...</h1>
        <p className="text-gray-600">正在跳转到产品页面...</p>
      </div>
    </div>
  )
}
