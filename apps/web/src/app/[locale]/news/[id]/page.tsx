import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NewsDetailPage from '@/components/news/NewsDetailPage'

interface LocaleNewsDetailPageProps {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: LocaleNewsDetailPageProps): Promise<Metadata> {
  try {
    // 获取新闻详情用于生成元数据
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/news/${params.id}?locale=${params.locale}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return {
        title: 'News Not Found - YXLP',
        description: 'The requested news article could not be found.'
      }
    }

    const { data: news } = await response.json()
    
    // 获取对应语言的内容
    const title = news.title[params.locale] || news.title.zh || news.title.en || 'News Article'
    const summary = news.summary[params.locale] || news.summary.zh || news.summary.en || ''

    return {
      title: `${title} - YXLP`,
      description: summary,
      alternates: {
        languages: {
          'zh': `/zh/news/${params.id}`,
          'en': `/en/news/${params.id}`,
          'ja': `/ja/news/${params.id}`,
          'ko': `/ko/news/${params.id}`,
          'es': `/es/news/${params.id}`,
          'fr': `/fr/news/${params.id}`,
          'de': `/de/news/${params.id}`,
          'it': `/it/news/${params.id}`,
          'pt': `/pt/news/${params.id}`,
          'ru': `/ru/news/${params.id}`
        }
      },
      openGraph: {
        title,
        description: summary,
        type: 'article',
        locale: params.locale,
        images: news.featuredImage ? [news.featuredImage] : undefined
      }
    }
  } catch (error) {
    return {
      title: 'News - YXLP',
      description: 'Fashion and clothing industry news'
    }
  }
}

export default async function LocaleNewsDetailPage({ params }: LocaleNewsDetailPageProps) {
  try {
    // 获取新闻详情
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/news/${params.id}?locale=${params.locale}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      notFound()
    }

    const { data: news } = await response.json()

    // 检查是否有对应语言的内容
    const hasContent = news.title[params.locale] || news.content[params.locale]
    
    if (!hasContent) {
      // 如果没有对应语言的内容，可以显示"翻译中"或重定向到中文版本
      notFound()
    }

    return <NewsDetailPage news={news} locale={params.locale} />
  } catch (error) {
    console.error('Error fetching news:', error)
    notFound()
  }
}
