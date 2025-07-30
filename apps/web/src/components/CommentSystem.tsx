'use client'

import React, { useState, useEffect } from 'react'

interface Comment {
  id: string
  newsId: string
  author: string
  email: string
  content: string
  parentId?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  replies?: Comment[]
}

interface CommentSystemProps {
  newsId: string
  isAdmin?: boolean
}

const CommentSystem: React.FC<CommentSystemProps> = ({ newsId, isAdmin = false }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: '',
    parentId: ''
  })

  useEffect(() => {
    fetchComments()
  }, [newsId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?newsId=${newsId}`)
      if (response.ok) {
        const result = await response.json()
        setComments(result.data || [])
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.author || !formData.content) {
      alert('请填写姓名和评论内容')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId,
          author: formData.author,
          email: formData.email,
          content: formData.content,
          parentId: formData.parentId || undefined
        })
      })

      if (response.ok) {
        alert('评论提交成功，等待审核')
        setFormData({ author: '', email: '', content: '', parentId: '' })
        setReplyingTo(null)
        fetchComments()
      } else {
        const error = await response.json()
        alert(error.error || '提交失败')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      alert('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (commentId: string, author: string) => {
    setReplyingTo(commentId)
    setFormData(prev => ({ 
      ...prev, 
      parentId: commentId,
      content: `@${author} `
    }))
  }

  const handleApprove = async (commentId: string) => {
    if (!isAdmin) return
    
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('审核评论失败:', error)
    }
  }

  const handleReject = async (commentId: string) => {
    if (!isAdmin) return
    
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/reject`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('拒绝评论失败:', error)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleString('zh-CN')
  }

  const renderComment = (comment: Comment, level = 0) => {
    const isApproved = comment.status === 'approved'
    const isPending = comment.status === 'pending'
    
    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
        <div className={`bg-white rounded-lg p-4 shadow-sm border ${
          isPending ? 'border-yellow-200 bg-yellow-50' : 
          isApproved ? 'border-gray-200' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-sm text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isPending && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  待审核
                </span>
              )}
              {comment.status === 'rejected' && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  已拒绝
                </span>
              )}
              {isAdmin && isPending && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => handleReject(comment.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    拒绝
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-gray-700 mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>
          
          {(isApproved || isAdmin) && (
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => handleReply(comment.id, comment.author)}
                className="text-blue-600 hover:text-blue-800"
              >
                回复
              </button>
            </div>
          )}
        </div>
        
        {/* 渲染回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const approvedComments = comments.filter(c => c.status === 'approved' || isAdmin)

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        评论 ({approvedComments.length})
      </h3>
      
      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">
          {replyingTo ? '回复评论' : '发表评论'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 (可选)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入您的邮箱"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            评论内容 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入您的评论..."
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
          
          {replyingTo && (
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null)
                setFormData(prev => ({ ...prev, parentId: '', content: '' }))
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消回复
            </button>
          )}
        </div>
      </form>
      
      {/* 评论列表 */}
      <div className="space-y-4">
        {approvedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无评论，快来发表第一条评论吧！
          </div>
        ) : (
          approvedComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}

export default CommentSystem
