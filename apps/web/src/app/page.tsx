'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 检测用户语言偏好
    const savedLanguage = document.cookie
      .split('; ')
      .find(row => row.startsWith('preferred-language='))
      ?.split('=')[1]

    // 检测浏览器语言
    const browserLanguage = navigator.language.split('-')[0]
    const supportedLocales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']

    // 确定目标语言
    let targetLanguage = 'zh' // 默认中文
    if (savedLanguage && supportedLocales.includes(savedLanguage)) {
      targetLanguage = savedLanguage
    } else if (supportedLocales.includes(browserLanguage)) {
      targetLanguage = browserLanguage
    }

    // 重定向到对应语言的首页
    router.replace(`/${targetLanguage}`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">正在跳转到您的语言版本...</p>
      </div>
    </div>
  )
}

