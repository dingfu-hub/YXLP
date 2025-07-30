'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { NewsArticle } from '@/types/news'

interface NewsListPageProps {
  locale: string
  page?: number
  category?: string
  search?: string
}

// 多语言内容
const CONTENT: Record<string, any> = {
  zh: {
    title: '新闻资讯',
    subtitle: '最新的时尚和服装行业动态',
    loading: '加载中...',
    noNews: '暂无新闻',
    readMore: '阅读更多',
    search: '搜索新闻...',
    allCategories: '所有分类'
  },
  en: {
    title: 'News',
    subtitle: 'Latest fashion and clothing industry updates',
    loading: 'Loading...',
    noNews: 'No news available',
    readMore: 'Read More',
    search: 'Search news...',
    allCategories: 'All Categories'
  },
  ja: {
    title: 'ニュース',
    subtitle: '最新のファッションと衣料品業界の動向',
    loading: '読み込み中...',
    noNews: 'ニュースがありません',
    readMore: '続きを読む',
    search: 'ニュースを検索...',
    allCategories: 'すべてのカテゴリ'
  },
  ko: {
    title: '뉴스',
    subtitle: '최신 패션 및 의류 업계 동향',
    loading: '로딩 중...',
    noNews: '뉴스가 없습니다',
    readMore: '더 읽기',
    search: '뉴스 검색...',
    allCategories: '모든 카테고리'
  },
  es: {
    title: 'Noticias',
    subtitle: 'Últimas actualizaciones de la industria de la moda y la ropa',
    loading: 'Cargando...',
    noNews: 'No hay noticias disponibles',
    readMore: 'Leer Más',
    search: 'Buscar noticias...',
    allCategories: 'Todas las Categorías'
  },
  fr: {
    title: 'Actualités',
    subtitle: 'Dernières mises à jour de l\'industrie de la mode et du vêtement',
    loading: 'Chargement...',
    noNews: 'Aucune actualité disponible',
    readMore: 'Lire Plus',
    search: 'Rechercher des actualités...',
    allCategories: 'Toutes les Catégories'
  },
  de: {
    title: 'Nachrichten',
    subtitle: 'Neueste Updates aus der Mode- und Bekleidungsindustrie',
    loading: 'Laden...',
    noNews: 'Keine Nachrichten verfügbar',
    readMore: 'Mehr Lesen',
    search: 'Nachrichten suchen...',
    allCategories: 'Alle Kategorien'
  },
  it: {
    title: 'Notizie',
    subtitle: 'Ultimi aggiornamenti dell\'industria della moda e dell\'abbigliamento',
    loading: 'Caricamento...',
    noNews: 'Nessuna notizia disponibile',
    readMore: 'Leggi di Più',
    search: 'Cerca notizie...',
    allCategories: 'Tutte le Categorie'
  },
  pt: {
    title: 'Notícias',
    subtitle: 'Últimas atualizações da indústria da moda e vestuário',
    loading: 'Carregando...',
    noNews: 'Nenhuma notícia disponível',
    readMore: 'Ler Mais',
    search: 'Pesquisar notícias...',
    allCategories: 'Todas as Categorias'
  },
  ru: {
    title: 'Новости',
    subtitle: 'Последние обновления индустрии моды и одежды',
    loading: 'Загрузка...',
    noNews: 'Новостей нет',
    readMore: 'Читать Далее',
    search: 'Поиск новостей...',
    allCategories: 'Все Категории'
  }
}

export default function NewsListPage({ locale, page = 1, category, search }: NewsListPageProps) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const content = CONTENT[locale] || CONTENT.en

  useEffect(() => {
    fetchNews()
  }, [locale, page, category, search])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        locale,
        page: page.toString(),
        limit: '12'
      })
      
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const response = await fetch(`/api/news?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      setNews(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const getLocalizedContent = (content: any, field: string) => {
    if (!content || !content[field]) return ''
    return content[field][locale] || content[field].zh || content[field].en || ''
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-2xl font-bold text-blue-600">
                YXLP
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl text-blue-100">{content.subtitle}</p>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{content.loading}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">{content.noNews}</p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article) => {
                const title = getLocalizedContent(article, 'title')
                const summary = getLocalizedContent(article, 'summary')
                
                return (
                  <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {article.featuredImage && (
                      <img
                        src={article.featuredImage}
                        alt={title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="text-sm text-gray-500 mb-2">
                        {formatDate(article.createdAt)}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {title}
                      </h2>
                      <p className="text-gray-600 mb-4" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {summary}
                      </p>
                      <Link
                        href={`/${locale}/news/${article.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {content.readMore}
                        <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
