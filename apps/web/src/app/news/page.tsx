'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { allNewsArticles, newsCategories } from '@/data/news'

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 12

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 筛选新闻
  const filteredNews = useMemo(() => {
    if (!allNewsArticles || allNewsArticles.length === 0) {
      return []
    }
    if (selectedCategory === 'all') {
      return allNewsArticles
    }
    return allNewsArticles.filter(article => article.category === selectedCategory)
  }, [selectedCategory])

  // 分页
  const totalPages = Math.ceil((filteredNews?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNews = filteredNews?.slice(startIndex, startIndex + itemsPerPage) || []

  // 推荐文章
  const featuredNews = allNewsArticles?.filter(article => article.featured)?.slice(0, 3) || []

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果没有新闻数据，显示空状态
  if (!allNewsArticles || allNewsArticles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">新闻资讯</h1>
            <p className="mt-2 text-gray-600">了解最新的行业动态和资讯</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500">暂无新闻内容</p>
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

      {/* 主要内容区域 - 左右布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 左侧边栏 */}
          <div className="w-80 flex-shrink-0">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">时尚资讯</h1>
              <p className="text-gray-600">掌握最新时尚趋势，获取专业搭配建议</p>
            </div>

            {/* 分类导航 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">资讯分类</h2>
              <nav className="space-y-2">
                {newsCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                    <span className="float-right text-sm opacity-75">
                      {allNewsArticles?.filter(a => category.id === 'all' || a.category === category.id).length || 0}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 推荐阅读 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐阅读</h2>
              <div className="space-y-4">
                {featuredNews.slice(0, 3).map(article => (
                  <Link key={article.id} href={`/news/${article.id}`} className="group block">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`https://images.unsplash.com/photo-${1500000000000 + article.id}?w=100&h=100&fit=crop&auto=format&q=80`}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyOEgyOFYzNkgyOFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {article.title}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>{formatDate(article.publishDate)}</span>
                          <span className="mx-1">•</span>
                          <span>{article.readCount} 阅读</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 热门标签 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">热门标签</h2>
              <div className="flex flex-wrap gap-2">
                {['时尚搭配', '潮流趋势', '品牌推荐', '穿搭技巧', '季节搭配', '配饰选择'].map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧主内容区 */}
          <div className="flex-1 min-w-0">
            {/* 当前分类信息 */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {newsCategories.find(cat => cat.id === selectedCategory)?.name || '全部资讯'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  共找到 {filteredNews?.length || 0} 篇文章
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">排序：</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>最新发布</option>
                  <option>最多阅读</option>
                  <option>最多评论</option>
                </select>
              </div>
            </div>

            {/* 新闻列表 */}
            {paginatedNews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">该分类下暂无新闻内容</p>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedNews.map((article, index) => (
                  <Link key={article.id} href={`/news/${article.id}`} className="group block">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                      <div className="flex gap-6">
                        {/* 文章图片 */}
                        <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-${1500000000000 + article.id}?w=300&h=200&fit=crop&auto=format&q=80`}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgODVIMTI1VjExNUgxMjVWODVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                            }}
                          />
                        </div>

                        {/* 文章内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {newsCategories.find(cat => cat.id === article.category)?.name}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(article.publishDate)}</span>
                            <span className="text-xs text-gray-500">by {article.author}</span>
                          </div>

                          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {article.title}
                          </h3>

                          <p className="text-gray-600 mb-4 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {article.summary}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {article.readCount.toLocaleString()}
                              </span>
                              {index === 0 && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                  热门
                                </span>
                              )}
                              {article.featured && (
                                <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                                  推荐
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && paginatedNews.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    上一页
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
