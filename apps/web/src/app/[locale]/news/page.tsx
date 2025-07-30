import { Metadata } from 'next'
import NewsListPage from '@/components/news/NewsListPage'

interface LocaleNewsPageProps {
  params: {
    locale: string
  }
  searchParams: {
    page?: string
    category?: string
    search?: string
  }
}

// 语言名称映射
const LANGUAGE_NAMES: Record<string, string> = {
  zh: '新闻资讯',
  en: 'News',
  ja: 'ニュース',
  ko: '뉴스',
  es: 'Noticias',
  fr: 'Actualités',
  de: 'Nachrichten',
  it: 'Notizie',
  pt: 'Notícias',
  ru: 'Новости'
}

export async function generateMetadata({ params }: LocaleNewsPageProps): Promise<Metadata> {
  const newsTitle = LANGUAGE_NAMES[params.locale] || 'News'

  return {
    title: `${newsTitle} - YXLP`,
    description: `Latest fashion and clothing industry news in ${params.locale}`,
    alternates: {
      languages: {
        'zh': '/zh/news',
        'en': '/en/news',
        'ja': '/ja/news',
        'ko': '/ko/news',
        'es': '/es/news',
        'fr': '/fr/news',
        'de': '/de/news',
        'it': '/it/news',
        'pt': '/pt/news',
        'ru': '/ru/news'
      }
    }
  }
}

export default function LocaleNewsPage({ params, searchParams }: LocaleNewsPageProps) {
  return (
    <NewsListPage 
      locale={params.locale}
      page={searchParams.page ? parseInt(searchParams.page) : 1}
      category={searchParams.category}
      search={searchParams.search}
    />
  )
}
