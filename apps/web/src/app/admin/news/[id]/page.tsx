'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Eye, Calendar, User, Tag, ExternalLink } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import { getLocalizedContent } from '@/lib/i18n'
import CommentSystem from '@/components/CommentSystem'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/admin/news/${params.id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('文章不存在')
          } else {
            setError('获取文章失败')
          }
          return
        }

        const data = await response.json()
        setArticle(data.data)
      } catch (err) {
        setError('网络错误')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id, router])

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/news/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        router.push('/admin/news')
      } else {
        alert('删除失败')
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'published': { label: '已发布', className: 'bg-green-100 text-green-800' },
      'draft': { label: '草稿', className: 'bg-gray-100 text-gray-800' },
      'archived': { label: '已归档', className: 'bg-yellow-100 text-yellow-800' },
      'processing': { label: '处理中', className: 'bg-red-100 text-red-800' }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      'technology': '科技',
      'business': '商业',
      'fashion': '时尚',
      'underwear': '内衣',
      'sports': '体育',
      'entertainment': '娱乐',
      'health': '健康',
      'science': '科学'
    }
    return categoryMap[category as keyof typeof categoryMap] || category
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <button
              onClick={() => router.push('/admin/news')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回新闻列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">文章不存在</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/admin/news')}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </button>

        <div className="flex gap-2">
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看原文
            </a>
          )}
          <button
            onClick={() => router.push(`/admin/news/${params.id}/edit`)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </button>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{getLocalizedContent(article.title)}</h1>
              {article.originalTitle && article.originalTitle !== getLocalizedContent(article.title) && (
                <div className="text-sm text-gray-600 mb-4">
                  原标题: {article.originalTitle}
                </div>
              )}
            </div>
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={getLocalizedContent(article.title)}
                className="w-32 h-24 object-cover rounded ml-4"
              />
            )}
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleString('zh-CN')}
            </div>
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </div>
            )}
            {article.sourceName && (
              <div className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                {article.sourceName}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewCount} 次浏览
            </div>
          </div>

          {/* 状态和分类 */}
          <div className="flex gap-2 mb-6">
            {getStatusBadge(article.status)}
            <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <Tag className="w-3 h-3 mr-1" />
              {getCategoryBadge(article.category)}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* 摘要 */}
          {article.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">摘要</h3>
              <p className="text-gray-700">{getLocalizedContent(article.summary)}</p>
            </div>
          )}

          <hr className="my-6" />

          {/* 正文内容 */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{
              __html: getLocalizedContent(article.content).replace(/\n/g, '<br>')
            }} />
          </div>

          {/* 关键词 */}
          {article.keywords && article.keywords.length > 0 && (
            <>
              <hr className="my-6" />
              <div>
                <h3 className="font-semibold mb-2">关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{keyword}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI处理信息 */}
          {article.aiProcessed && (
            <>
              <hr className="my-6" />
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 border border-gray-300 rounded text-xs">AI已处理</span>
                  <span>处理状态: {article.aiProcessStatus}</span>
                </div>
                {article.aiProcessedAt && (
                  <div>处理时间: {new Date(article.aiProcessedAt).toLocaleString('zh-CN')}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 评论系统 */}
      <div className="mt-8">
        <CommentSystem newsId={params.id as string} isAdmin={true} />
      </div>
    </div>
  )
}
