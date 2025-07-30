'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DistributorsPageProps {
  params: {
    locale: string
  }
}

export default function DistributorsPage({ params }: DistributorsPageProps) {
  const router = useRouter()

  useEffect(() => {
    // 重定向到根级别的合作伙伴页面，保持现有功能
    router.replace('/distributors')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Partners...</h1>
        <p className="text-gray-600">正在跳转到合作伙伴页面...</p>
      </div>
    </div>
  )
}
