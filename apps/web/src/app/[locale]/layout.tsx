import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

// 支持的语言列表
const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']

interface LocaleLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // 验证语言代码是否支持
  if (!SUPPORTED_LOCALES.includes(params.locale)) {
    notFound()
  }

  return (
    <html lang={params.locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

// 生成静态参数
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }))
}
