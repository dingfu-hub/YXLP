'use client'

import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'

export default function NewsTestPage() {
  const { user } = useAdmin()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/news', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('API响应:', result)
        setData(result)
        
      } catch (error) {
        console.error('获取数据错误:', error)
        setError(error instanceof Error ? error.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (!user) {
    return <div className="p-6">请先登录</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">新闻API测试</h1>
      
      {loading && (
        <div className="text-blue-600">加载中...</div>
      )}
      
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">
          错误: {error}
        </div>
      )}
      
      {data && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-bold mb-2">API响应数据:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
