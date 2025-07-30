'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { newsCategories } from '@/data/news'

interface NewsArticle {
  id: number
  title: string
  summary: string
  content: string
  category: string
  author: string
  publishDate: string
  readCount: number
  image: string
  tags: string[]
  featured: boolean
  sourceUrl?: string
  sourceName?: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/news/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('新闻不存在')
          }
          throw new Error('获取新闻失败')
        }

        const result = await response.json()
        setArticle(result.data)

        // 获取相关文章（同分类的其他文章）
        try {
          const relatedResponse = await fetch(`/api/news?category=${result.data.category}&limit=4`)
          if (relatedResponse.ok) {
            const relatedResult = await relatedResponse.json()
            // 过滤掉当前文章
            const filtered = relatedResult.data.articles.filter((a: NewsArticle) => a.id !== result.data.id)
            setRelatedArticles(filtered.slice(0, 2)) // 只显示2篇相关文章
          }
        } catch (relatedError) {
          console.error('获取相关文章失败:', relatedError)
          // 相关文章获取失败不影响主要内容显示
        }

      } catch (error) {
        console.error('获取新闻详情错误:', error)
        setError(error instanceof Error ? error.message : '获取新闻失败')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/news" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← 返回新闻列表
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">页面不存在</h1>
            <p className="text-gray-600 mb-8">{error || '请求的新闻不存在'}</p>
            <Link
              href="/news"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回新闻列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">YXLP</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">产品中心</Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900">产品分类</Link>
              <Link href="/news" className="text-blue-600 font-medium">新闻资讯</Link>
              <Link href="/distributors" className="text-gray-600 hover:text-gray-900">合作伙伴</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">登录</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">注册</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">首页</Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/news" className="text-gray-500 hover:text-gray-700">新闻资讯</Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900">
                  {newsCategories.find(cat => cat.id === article.category)?.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* 文章内容 */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 文章头图 */}
          <div className="h-64 md:h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">文章配图</span>
          </div>

          <div className="p-8">
            {/* 文章元信息 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {newsCategories.find(cat => cat.id === article.category)?.name}
                </span>
                <span className="text-gray-500 text-sm">{formatDate(article.publishDate)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>作者：{article.author}</span>
                <span>{article.readCount.toLocaleString()} 阅读</span>
              </div>
            </div>

            {/* 文章标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* 文章摘要 */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{article.summary}</p>
            </div>

            {/* 文章正文 */}
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 源文章链接 */}
            {article.sourceUrl && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">来源：</span>
                    <span className="text-gray-500 text-sm">{article.sourceName || '未知来源'}</span>
                  </div>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    查看原文
                  </a>
                </div>
              </div>
            )}

            {/* 标签 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">标签：</span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* 相关文章 */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map(relatedArticle => (
                <Link key={relatedArticle.id} href={`/news/${relatedArticle.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">文章配图</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedArticle.summary}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(relatedArticle.publishDate)}</span>
                        <span>{relatedArticle.readCount.toLocaleString()} 阅读</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 返回按钮 */}
        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← 返回新闻列表
          </Link>
        </div>
      </div>
    </div>
  )
}
