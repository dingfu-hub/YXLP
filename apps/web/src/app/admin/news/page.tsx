'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { NewsArticle, NewsStatus, SupportedLanguage } from '@/types/news'
import CrawlProgressModal from '@/components/CrawlProgressModal'
import LanguageSelector from '@/components/LanguageSelector'
import { SUPPORTED_LANGUAGES, getLocalizedContent } from '@/lib/i18n'



// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
  { value: 'processing', label: '处理中' }
]

export default function NewsListPage() {
  const { user } = useAdmin()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 筛选和分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // 批量操作
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [showBatchActions, setShowBatchActions] = useState(false)

  // 语言选择状态 - 移到这里，确保在fetchNews之前定义
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('zh')

  // 获取新闻列表
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        language: selectedLanguage // 添加语言参数
      })


      if (status !== 'all') params.append('status', status)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        // 如果API失败，使用本地数据作为后备
        console.warn('新闻API获取失败，使用本地数据')
        const { getAllNews } = await import('@/data/news')
        let localNews = getAllNews()

        // 应用过滤器
        if (status !== 'all') {
          localNews = localNews.filter(article => article.status === status)
        }
        if (search.trim()) {
          const searchLower = search.toLowerCase()
          localNews = localNews.filter(article => {
            const title = typeof article.title === 'string' ? article.title : article.title[selectedLanguage] || article.title.zh || ''
            const content = typeof article.content === 'string' ? article.content : article.content[selectedLanguage] || article.content.zh || ''
            return title.toLowerCase().includes(searchLower) || content.toLowerCase().includes(searchLower)
          })
        }

        // 分页
        const startIndex = (currentPage - 1) * 20
        const endIndex = startIndex + 20
        const paginatedNews = localNews.slice(startIndex, endIndex)

        setArticles(paginatedNews)
        setTotal(localNews.length)
        setTotalPages(Math.ceil(localNews.length / 20))
        return
      }

      const result = await response.json()
      console.log('API响应:', result)
      setArticles(result.data?.articles || [])
      setTotal(result.data?.total || 0)
      setTotalPages(result.data?.totalPages || 1)

    } catch (error) {
      console.error('获取新闻列表错误:', error)
      // 使用本地数据作为最终后备
      try {
        const { getAllNews } = await import('@/data/news')
        const localNews = getAllNews()
        setArticles(localNews.slice(0, 20))
        setTotal(localNews.length)
        setTotalPages(Math.ceil(localNews.length / 20))
      } catch (fallbackError) {
        console.error('加载本地新闻数据也失败:', fallbackError)
        setError(error instanceof Error ? error.message : '获取新闻列表失败')
      }
    } finally {
      setLoading(false)
    }
  }, [currentPage, status, search, sortBy, sortOrder, selectedLanguage])

  // 删除新闻
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇新闻吗？')) return
    
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('删除新闻失败')
      }
      
      // 重新获取列表
      fetchNews()
      
    } catch (error) {
      console.error('删除新闻错误:', error)
      alert(error instanceof Error ? error.message : '删除新闻失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedArticles.size === 0) return

    const selectedCount = selectedArticles.size
    if (!confirm(`确定要删除选中的 ${selectedCount} 篇新闻吗？此操作不可撤销。`)) return

    try {
      const promises = Array.from(selectedArticles).map(async (id) => {
        const response = await fetch(`/api/admin/news/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!response.ok) {
          throw new Error(`删除新闻 ${id} 失败`)
        }
        return response
      })

      await Promise.all(promises)

      // 清空选择状态
      setSelectedArticles(new Set())
      setShowBatchActions(false)

      // 刷新列表
      await fetchNews()

      // 显示成功消息
      alert(`成功删除 ${selectedCount} 篇新闻`)

    } catch (error) {
      console.error('批量删除错误:', error)
      alert(`批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 启动AI处理
  const handleAIProcess = async (articleId: string) => {
    try {
      const response = await fetch('/api/admin/news/ai-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ articleId })
      })
      
      if (!response.ok) {
        throw new Error('AI处理失败')
      }
      
      alert('AI处理已启动')
      fetchNews()
      
    } catch (error) {
      console.error('AI处理错误:', error)
      alert(error instanceof Error ? error.message : 'AI处理失败')
    }
  }

  // 采集进度模态框状态
  const [showCrawlModal, setShowCrawlModal] = useState(false)

  // 翻译模态框状态
  const [translationModal, setTranslationModal] = useState<{
    isOpen: boolean
    newsId: string
    title: string
    content: string
    summary?: string
    isTranslating?: boolean
  }>({
    isOpen: false,
    newsId: '',
    title: '',
    content: '',
    summary: '',
    isTranslating: false
  })

  // 启动采集
  const handleCrawl = () => {
    setShowCrawlModal(true)
  }

  // 开始采集
  const handleStartCrawl = async (config: any) => {
    try {
      const response = await fetch('/api/admin/news/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error('新闻采集失败')
      }

      // 采集成功后刷新新闻列表
      setTimeout(() => {
        fetchNews()
      }, 2000)

    } catch (error) {
      console.error('新闻采集错误:', error)
      alert(error instanceof Error ? error.message : '新闻采集失败')
    }
  }

  // 中文翻译功能
  const handleTranslateToChineseModal = async (newsId: string) => {
    try {
      // 先显示模态框，显示正在翻译
      setTranslationModal({
        isOpen: true,
        newsId,
        title: '正在翻译标题...',
        content: '正在翻译内容...',
        isTranslating: true
      })

      // 调用翻译API
      const response = await fetch('/api/admin/news/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newsId,
          fromLanguage: selectedLanguage,
          toLanguage: 'zh'
        })
      })

      if (!response.ok) {
        throw new Error('翻译失败')
      }

      const result = await response.json()

      // 更新翻译结果
      setTranslationModal(prev => ({
        ...prev,
        title: result.data.translated.title,
        content: result.data.translated.content,
        summary: result.data.translated.summary,
        isTranslating: false
      }))

    } catch (error) {
      console.error('翻译失败:', error)
      setTranslationModal(prev => ({
        ...prev,
        title: '翻译失败',
        content: '翻译失败，请稍后重试',
        isTranslating: false
      }))
    }
  }

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchNews()
  }

  // 处理选择
  const handleSelectArticle = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedArticles(newSelected)
    setShowBatchActions(newSelected.size > 0)
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked && articles) {
      setSelectedArticles(new Set(articles.map(a => a.id)))
      setShowBatchActions(true)
    } else {
      setSelectedArticles(new Set())
      setShowBatchActions(false)
    }
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 获取状态标签样式
  const getStatusBadge = (status: NewsStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800'
    }
    
    const labels = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档',
      processing: '处理中'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }



  useEffect(() => {
    if (user) {
      fetchNews()
    }
  }, [user, fetchNews])

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新闻管理</h1>
            <p className="text-gray-600 mt-1">管理新闻文章，支持采集、AI润色等功能</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">显示语言:</span>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              size="sm"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCrawl}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            启动采集
          </button>
          <a
            href="/admin/news/create"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            创建新闻
          </a>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题、内容或关键词..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">创建时间 ↓</option>
              <option value="createdAt-asc">创建时间 ↑</option>
              <option value="publishedAt-desc">发布时间 ↓</option>
              <option value="publishedAt-asc">发布时间 ↑</option>
              <option value="viewCount-desc">浏览量 ↓</option>
              <option value="title-asc">标题 A-Z</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 批量操作栏 */}
      {showBatchActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              已选择 {selectedArticles.size} 篇文章
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBatchDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                批量删除
              </button>
              <button
                onClick={() => {
                  setSelectedArticles(new Set())
                  setShowBatchActions(false)
                }}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新闻列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchNews}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              重试
            </button>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>暂无新闻数据</p>
          </div>
        ) : (
          <>
            {/* 表格头部 */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={articles && selectedArticles.size === articles.length && articles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  全选当前页 ({articles?.length || 0} 篇文章)
                </span>
              </div>
            </div>

            {/* 文章列表 */}
            <div className="divide-y divide-gray-200">
              {articles && articles.map((article) => (
                <div key={article.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={(e) => handleSelectArticle(article.id, e.target.checked)}
                      className="mt-1"
                    />
                    
                    {article.featuredImage && (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <a
                              href={`/admin/news/${article.id}`}
                              className="hover:text-blue-600"
                            >
                              {(article as any).displayTitle ||
                               (typeof article.title === 'string'
                                ? article.title
                                : getLocalizedContent(article.title, selectedLanguage))
                              }
                            </a>
                          </h3>

                          <p className="text-gray-600 text-sm mb-2 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {(article as any).displaySummary ||
                             (typeof article.summary === 'string'
                              ? article.summary
                              : getLocalizedContent(article.summary, selectedLanguage))
                            }
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{article.author || '未知作者'}</span>
                            <span>•</span>
                            <span>{formatDate(article.createdAt)}</span>
                            {article.publishedAt && (
                              <>
                                <span>•</span>
                                <span>发布于 {formatDate(article.publishedAt)}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {getStatusBadge(article.status)}
                            
                            {article.aiProcessed && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                AI已处理
                              </span>
                            )}
                            
                            {article.sourceType !== 'manual' && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {article.sourceType === 'rss' ? 'RSS采集' : '网页采集'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-sm text-gray-500">
                            {article.viewCount} 浏览
                          </span>
                          
                          <div className="flex space-x-1">
                            <a
                              href={`/admin/news/${article.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </a>

                            {/* 显示翻译按钮 - 总是显示，让用户可以查看中文翻译 */}
                            <button
                              onClick={() => handleTranslateToChineseModal(article.id)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                              title="查看中文翻译"
                            >
                              中文翻译
                            </button>

                            {!article.aiProcessed && (
                              <button
                                onClick={() => handleAIProcess(article.id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                AI润色
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(article.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, total)} 条，共 {total} 条
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    
                    <span className="px-3 py-1 text-sm">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 采集进度模态框 */}
      <CrawlProgressModal
        isOpen={showCrawlModal}
        onClose={() => setShowCrawlModal(false)}
        onStart={handleStartCrawl}
      />

      {/* 中文翻译模态框 */}
      {translationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">中文翻译</h2>
              <button
                onClick={() => setTranslationModal({ isOpen: false, newsId: '', title: '', content: '', summary: '', isTranslating: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {translationModal.isTranslating && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">正在翻译中...</span>
                </div>
              )}

              {!translationModal.isTranslating && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题翻译</label>
                    <div className="p-3 bg-gray-50 border rounded-md">
                      {translationModal.title}
                    </div>
                  </div>

                  {translationModal.summary && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">摘要翻译</label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        {translationModal.summary}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容翻译</label>
                    <div className="p-3 bg-gray-50 border rounded-md max-h-96 overflow-y-auto">
                      <div className="whitespace-pre-wrap">{translationModal.content}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setTranslationModal({ isOpen: false, newsId: '', title: '', content: '', summary: '', isTranslating: false })}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
