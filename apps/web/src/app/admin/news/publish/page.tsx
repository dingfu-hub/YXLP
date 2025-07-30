'use client'

import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'

interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  category: string
  status: string
  featuredImage?: string
  slug: string
  metaDescription?: string
  keywords?: string[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface PublishSettings {
  scheduleType: 'immediate' | 'scheduled' | 'draft'
  scheduledTime?: Date
  platforms: {
    website: boolean
    wechat: boolean
    weibo: boolean
    toutiao: boolean
  }
  seoOptimization: boolean
  generateSocialPosts: boolean
  notifySubscribers: boolean
}

export default function NewsPublishPage() {
  const { user } = useAdmin()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  
  const [publishSettings, setPublishSettings] = useState<PublishSettings>({
    scheduleType: 'immediate',
    platforms: {
      website: true,
      wechat: false,
      weibo: false,
      toutiao: false
    },
    seoOptimization: true,
    generateSocialPosts: false,
    notifySubscribers: true
  })

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'draft',
    aiProcessed: 'all'
  })

  useEffect(() => {
    loadArticles()
  }, [filters])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '50',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.aiProcessed !== 'all') params.append('aiProcessed', filters.aiProcessed)

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        setArticles(result.data?.articles || [])
      }
    } catch (error) {
      console.error('加载文章失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (selectedArticles.size === 0) {
      alert('请选择要发布的文章')
      return
    }

    setPublishing(true)
    try {
      const response = await fetch('/api/admin/news/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          articleIds: Array.from(selectedArticles),
          settings: publishSettings
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`成功发布 ${result.data.published} 篇文章`)
        setSelectedArticles(new Set())
        setShowPublishModal(false)
        loadArticles()
      } else {
        const error = await response.json()
        alert(`发布失败: ${error.message}`)
      }
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败')
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedulePublish = async () => {
    if (selectedArticles.size === 0) {
      alert('请选择要定时发布的文章')
      return
    }

    if (!publishSettings.scheduledTime) {
      alert('请选择发布时间')
      return
    }

    setPublishing(true)
    try {
      const response = await fetch('/api/admin/news/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          articleIds: Array.from(selectedArticles),
          settings: publishSettings
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`成功安排 ${result.data.scheduled} 篇文章定时发布`)
        setSelectedArticles(new Set())
        setShowPublishModal(false)
        loadArticles()
      } else {
        const error = await response.json()
        alert(`定时发布设置失败: ${error.message}`)
      }
    } catch (error) {
      console.error('定时发布设置失败:', error)
      alert('定时发布设置失败')
    } finally {
      setPublishing(false)
    }
  }

  const toggleArticleSelection = (articleId: string) => {
    const newSelection = new Set(selectedArticles)
    if (newSelection.has(articleId)) {
      newSelection.delete(articleId)
    } else {
      newSelection.add(articleId)
    }
    setSelectedArticles(newSelection)
  }

  const selectAllArticles = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set())
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布'
      case 'draft': return '草稿'
      case 'archived': return '已归档'
      case 'processing': return '处理中'
      default: return '未知'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新闻发布中心</h1>
            <p className="mt-1 text-sm text-gray-500">
              管理新闻发布流程，支持定时发布和多平台同步
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={selectedArticles.size === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              发布选中 ({selectedArticles.size})
            </button>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">筛选条件</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">全部分类</option>
                <option value="technology">科技</option>
                <option value="business">商业</option>
                <option value="sports">体育</option>
                <option value="entertainment">娱乐</option>
                <option value="health">健康</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI处理状态
              </label>
              <select
                value={filters.aiProcessed}
                onChange={(e) => setFilters(prev => ({ ...prev, aiProcessed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">全部</option>
                <option value="true">已处理</option>
                <option value="false">未处理</option>
              </select>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                文章列表 ({articles.length})
              </h3>
              <button
                onClick={selectAllArticles}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedArticles.size === articles.length ? '取消全选' : '全选'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedArticles.size === articles.length && articles.length > 0}
                      onChange={selectAllArticles}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedArticles.has(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {article.summary || '暂无摘要'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(article.status)}`}>
                        {getStatusText(article.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">预览</button>
                      <button className="text-green-600 hover:text-green-900 mr-3">编辑</button>
                      {article.status === 'published' && (
                        <button className="text-red-600 hover:text-red-900">撤回</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 发布设置弹窗 */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  发布设置 ({selectedArticles.size} 篇文章)
                </h3>

                <div className="space-y-4">
                  {/* 发布类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发布类型
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="immediate"
                          checked={publishSettings.scheduleType === 'immediate'}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            scheduleType: e.target.value as any
                          }))}
                          className="mr-2"
                        />
                        立即发布
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="scheduled"
                          checked={publishSettings.scheduleType === 'scheduled'}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            scheduleType: e.target.value as any
                          }))}
                          className="mr-2"
                        />
                        定时发布
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="draft"
                          checked={publishSettings.scheduleType === 'draft'}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            scheduleType: e.target.value as any
                          }))}
                          className="mr-2"
                        />
                        保存为草稿
                      </label>
                    </div>
                  </div>

                  {/* 定时发布时间 */}
                  {publishSettings.scheduleType === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        发布时间
                      </label>
                      <input
                        type="datetime-local"
                        value={publishSettings.scheduledTime ?
                          new Date(publishSettings.scheduledTime.getTime() - publishSettings.scheduledTime.getTimezoneOffset() * 60000)
                            .toISOString().slice(0, 16) : ''
                        }
                        onChange={(e) => setPublishSettings(prev => ({
                          ...prev,
                          scheduledTime: e.target.value ? new Date(e.target.value) : undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}

                  {/* 发布平台 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发布平台
                    </label>
                    <div className="space-y-2">
                      {Object.entries(publishSettings.platforms).map(([platform, enabled]) => (
                        <label key={platform} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setPublishSettings(prev => ({
                              ...prev,
                              platforms: {
                                ...prev.platforms,
                                [platform]: e.target.checked
                              }
                            }))}
                            className="mr-2 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {platform === 'website' && '官网'}
                            {platform === 'wechat' && '微信公众号'}
                            {platform === 'weibo' && '微博'}
                            {platform === 'toutiao' && '今日头条'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 其他选项 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      其他选项
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={publishSettings.seoOptimization}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            seoOptimization: e.target.checked
                          }))}
                          className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">SEO优化</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={publishSettings.generateSocialPosts}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            generateSocialPosts: e.target.checked
                          }))}
                          className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">生成社交媒体文案</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={publishSettings.notifySubscribers}
                          onChange={(e) => setPublishSettings(prev => ({
                            ...prev,
                            notifySubscribers: e.target.checked
                          }))}
                          className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">通知订阅者</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    取消
                  </button>
                  <button
                    onClick={publishSettings.scheduleType === 'scheduled' ? handleSchedulePublish : handlePublish}
                    disabled={publishing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {publishing ? '处理中...' :
                      publishSettings.scheduleType === 'scheduled' ? '设置定时发布' :
                      publishSettings.scheduleType === 'draft' ? '保存草稿' : '立即发布'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
