import { Metadata } from 'next'
import HomePage from '@/components/HomePage'

interface LocalePageProps {
  params: {
    locale: string
  }
}

// 语言名称映射
const LANGUAGE_NAMES: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский'
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const languageName = LANGUAGE_NAMES[params.locale] || params.locale

  return {
    title: `YXLP - Premium Clothing Export Platform (${languageName})`,
    description: `Leading B2B and B2C platform for premium clothing exports. Available in ${languageName}.`,
    alternates: {
      languages: {
        'zh': '/zh',
        'en': '/en',
        'ja': '/ja',
        'ko': '/ko',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'it': '/it',
        'pt': '/pt',
        'ru': '/ru'
      }
    }
  }
}

export default function LocalePage({ params }: LocalePageProps) {
  return <HomePage locale={params.locale} />
}
