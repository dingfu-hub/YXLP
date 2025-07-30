'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { NewsCategory, NewsStatus, NewsArticle } from '@/types/news'
import { getLocalizedContent } from '@/lib/i18n'

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'fashion' as NewsCategory,
    status: 'draft' as NewsStatus,
    keywords: '',
    author: '',
    featuredImage: '',
    sourceUrl: '',
    sourceName: ''
  })

  // 翻译相关状态
  const [showTranslation, setShowTranslation] = useState(false)
  const [translatedContent, setTranslatedContent] = useState({
    title: '',
    content: '',
    summary: ''
  })
  const [isTranslating, setIsTranslating] = useState(false)

  const categories: { value: NewsCategory; label: string }[] = [
    { value: 'fashion', label: '时尚' },
    { value: 'underwear', label: '内衣' },
    { value: 'business', label: '商业' },
    { value: 'technology', label: '科技' },
    { value: 'other', label: '其他' }
  ]

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/admin/news/${params.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('获取新闻失败')
        }

        const result = await response.json()
        const news: NewsArticle = result.data

        // 检测是否为外语内容
        const localizedTitle = getLocalizedContent(news.title)
        const isChineseContent = localizedTitle && /[\u4e00-\u9fff]/.test(localizedTitle)

        setFormData({
          title: getLocalizedContent(news.title) || '',
          content: getLocalizedContent(news.content) || '',
          summary: getLocalizedContent(news.summary) || '',
          category: news.category || 'fashion',
          status: news.status || 'draft',
          keywords: news.keywords?.join(', ') || '',
          author: news.author || '',
          featuredImage: news.featuredImage || '',
          sourceUrl: news.sourceUrl || '',
          sourceName: news.sourceName || ''
        })

        // 如果是外语内容，自动显示翻译按钮
        if (!isChineseContent && localizedTitle) {
          setShowTranslation(true)
        }
      } catch (error) {
        console.error('获取新闻错误:', error)
        alert('获取新闻失败')
        router.push('/admin/news')
      } finally {
        setInitialLoading(false)
      }
    }

    if (params.id) {
      fetchNews()
    }
  }, [params.id, router])

  // 翻译内容
  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const response = await fetch('/api/admin/news/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newsId: params.id,
          fromLanguage: 'en', // 假设是英文
          toLanguage: 'zh'
        })
      })

      if (!response.ok) {
        throw new Error('翻译失败')
      }

      const result = await response.json()
      setTranslatedContent({
        title: result.data.translated.title,
        content: result.data.translated.content,
        summary: result.data.translated.summary
      })
    } catch (error) {
      console.error('翻译失败:', error)
      alert('翻译失败')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新失败')
      }

      alert('新闻更新成功！')
      router.push('/admin/news')
    } catch (error) {
      console.error('更新新闻错误:', error)
      alert(error instanceof Error ? error.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">编辑新闻</h1>
            <div className="flex items-center space-x-4">
              {showTranslation && (
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {isTranslating ? '翻译中...' : '查看中文翻译'}
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                返回
              </button>
            </div>
          </div>

          {/* 翻译结果显示 */}
          {translatedContent.title && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-3">中文翻译参考</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">标题翻译</label>
                  <p className="text-blue-800 bg-white p-2 rounded border">{translatedContent.title}</p>
                </div>
                {translatedContent.summary && (
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">摘要翻译</label>
                    <p className="text-blue-800 bg-white p-2 rounded border">{translatedContent.summary}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">内容翻译</label>
                  <div className="text-blue-800 bg-white p-2 rounded border max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {translatedContent.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                摘要 *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻摘要"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻内容"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态 *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入关键词，用逗号分隔"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入作者姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特色图片URL
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入图片URL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  源文章链接
                </label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入源文章URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  来源名称
                </label>
                <input
                  type="text"
                  name="sourceName"
                  value={formData.sourceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入来源名称"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '更新中...' : '更新新闻'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
