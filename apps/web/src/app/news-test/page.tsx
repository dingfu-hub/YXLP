'use client'

import React, { useState, useEffect } from 'react'

export default function NewsTestPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 模拟获取新闻数据
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟新闻数据
        const mockArticles = [
          {
            id: '1',
            title: '测试新闻标题1',
            summary: '这是一篇测试新闻的摘要内容...',
            status: 'published',
            createdAt: new Date().toISOString()
          },
          {
            id: '2', 
            title: '测试新闻标题2',
            summary: '这是另一篇测试新闻的摘要内容...',
            status: 'draft',
            createdAt: new Date().toISOString()
          }
        ]
        
        setArticles(mockArticles)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>📰 新闻管理测试页面</h1>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <p>🔄 加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>📰 新闻管理测试页面</h1>
        <div style={{ background: '#fee', padding: '20px', borderRadius: '8px', border: '1px solid #fcc' }}>
          <p>❌ 错误: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>📰 新闻管理测试页面</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>测试状态</h2>
        <p>✅ React组件正常</p>
        <p>✅ useState Hook正常</p>
        <p>✅ useEffect Hook正常</p>
        <p>✅ 异步数据加载正常</p>
        <p>✅ 不依赖AdminContext</p>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>新闻列表 ({articles.length} 篇)</h2>
        
        {articles.map(article => (
          <div 
            key={article.id}
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '15px', 
              marginBottom: '10px',
              background: '#fafafa'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {article.title}
            </h3>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
              {article.summary}
            </p>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <span style={{ 
                background: article.status === 'published' ? '#28a745' : '#ffc107',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                marginRight: '10px'
              }}>
                {article.status === 'published' ? '已发布' : '草稿'}
              </span>
              <span>创建时间: {new Date(article.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>对比测试</h2>
        <p>如果这个页面能正常显示，但原新闻页面不能，说明问题在于：</p>
        <ul>
          <li><strong>AdminContext组件</strong> - 可能在初始化时卡住</li>
          <li><strong>Tailwind CSS</strong> - 样式加载问题</li>
          <li><strong>复杂的业务逻辑</strong> - 某个组件有错误</li>
        </ul>
        
        <div style={{ marginTop: '20px' }}>
          <a 
            href="/admin/news" 
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            访问原新闻页面
          </a>
          <a 
            href="/admin/diagnostic" 
            style={{ 
              background: '#28a745', 
              color: 'white', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '4px'
            }}
          >
            诊断页面
          </a>
        </div>
      </div>
    </div>
  )
}
