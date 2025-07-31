'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { NewsArticle } from '@/types/news'
import { getLocalizedContent } from '@/lib/i18n'
import Header from '@/components/layout/Header'

interface NewsListPageProps {
  locale: string
  page?: number
  category?: string
  search?: string
}

export default function NewsListPage({ locale, page = 1, category, search }: NewsListPageProps) {
  const { t } = useTranslation()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)

        // 尝试从API获取新闻
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          language: locale
        })

        if (category) params.append('category', category)
        if (search) params.append('search', search)

        const response = await fetch(`/api/news?${params}`)
        
        if (!response.ok) {
          // 如果API失败，使用本地数据作为后备
          console.warn('新闻API获取失败，使用本地数据')
          const { getAllNews } = await import('@/data/news')
          let localNews = getAllNews()

          // 应用过滤器
          if (category && category !== 'all') {
            localNews = localNews.filter(article => article.category === category)
          }
          if (search?.trim()) {
            const searchLower = search.toLowerCase()
            localNews = localNews.filter(article => {
              const title = getLocalizedContent(article.title, locale)
              const content = getLocalizedContent(article.content, locale)
              return title.toLowerCase().includes(searchLower) || 
                     content.toLowerCase().includes(searchLower)
            })
          }

          // 分页
          const startIndex = (page - 1) * 12
          const endIndex = startIndex + 12
          const paginatedNews = localNews.slice(startIndex, endIndex)

          setArticles(paginatedNews)
          setTotalPages(Math.ceil(localNews.length / 12))
          return
        }

        const result = await response.json()
        const data = result.data || result
        setArticles(data.articles || [])
        setTotalPages(data.totalPages || 1)

      } catch (error) {
        console.error('获取新闻列表错误:', error)
        setError('获取新闻列表失败')
        // 即使出错也尝试加载本地数据
        try {
          const { getAllNews } = await import('@/data/news')
          const localNews = getAllNews()
          setArticles(localNews.slice(0, 12))
          setTotalPages(Math.ceil(localNews.length / 12))
        } catch (fallbackError) {
          console.error('加载本地数据也失败:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [locale, page, category, search])

  const categories = [
    { id: 'all', name: t('news.categories.all', { defaultValue: '全部' }) },
    { id: 'fashion', name: t('news.categories.fashion', { defaultValue: '时尚' }) },
    { id: 'textile', name: t('news.categories.textile', { defaultValue: '纺织' }) },
    { id: 'apparel', name: t('news.categories.apparel', { defaultValue: '服装' }) },
    { id: 'manufacturing', name: t('news.categories.manufacturing', { defaultValue: '制造' }) },
    { id: 'export', name: t('news.categories.export', { defaultValue: '出口' }) }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('news.title', { defaultValue: '新闻资讯' })}
          </h1>
          <p className="text-gray-600">
            {t('news.subtitle', { defaultValue: '了解最新的服装行业动态和产品资讯' })}
          </p>
        </div>

        {/* 左右布局 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧分类筛选 */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{t('news.categories.title', { defaultValue: '新闻分类' })}</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${locale}/news${cat.id !== 'all' ? `?category=${cat.id}` : ''}`}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      (category === cat.id || (!category && cat.id === 'all'))
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧新闻内容 */}
          <div className="flex-1">



            {/* 新闻列表 */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">{t('common.loading', { defaultValue: '加载中...' })}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('news.noArticles', { defaultValue: '暂无新闻' })}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {(article.featuredImage || article.image) && (
                      <div className="aspect-video relative">
                        <Image
                          src={article.featuredImage || article.image}
                          alt={getLocalizedContent(article.title, locale)}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {t(`news.categories.${article.category}`, { defaultValue: article.category })}
                        </span>
                        <span className="ml-auto">
                          {new Date(article.publishedAt || article.publishDate || article.createdAt || Date.now()).toLocaleDateString(locale)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {getLocalizedContent(article.title, locale)}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {getLocalizedContent(article.summary || article.content, locale)}
                      </p>
                      <Link
                        href={`/${locale}/news/${article.slug || article.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {t('news.readMore', { defaultValue: '阅读更多' })} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/${locale}/news?page=${pageNum}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                      className={`px-3 py-2 rounded text-sm ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
