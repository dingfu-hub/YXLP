'use client'

import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { NewsSource, SupportedLanguage, CrawlProgressDetail } from '@/types/news'
import { getSupportedLanguagesWithCountries } from '@/data/global-rss-sources'

interface CrawlJob {
  id: string
  sourceIds: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  results?: {
    total: number
    success: number
    failed: number
    duplicates: number
  }
}

export default function NewsCollectPage() {
  const { user } = useAdmin()
  const [sources, setSources] = useState<NewsSource[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectProgress, setCollectProgress] = useState<{
    current: number
    total: number
    currentSource: string
  }>({ current: 0, total: 0, currentSource: '' })
  const [recentJobs, setRecentJobs] = useState<CrawlJob[]>([])

  // 新增：多语种采集配置
  const [articlesPerLanguage, setArticlesPerLanguage] = useState(5)
  const [enablePolishing, setEnablePolishing] = useState(true)
  const [enableSEO, setEnableSEO] = useState(true)
  const [languageProgress, setLanguageProgress] = useState<CrawlProgressDetail[]>([])

  // 获取支持的语言
  const languageGroups = getSupportedLanguagesWithCountries()

  // WebSocket连接管理
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // 获取新闻源列表和建立WebSocket连接
  useEffect(() => {
    fetchSources()
    fetchRecentJobs()
    checkCrawlProgress() // 检查是否有正在进行的采集任务
    initWebSocketConnection() // 建立实时连接

    return () => {
      // 清理WebSocket连接
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [])

  // 初始化WebSocket连接
  const initWebSocketConnection = async () => {
    try {
      setConnectionStatus('connecting')

      // 首先启动WebSocket服务器
      await fetch('/api/admin/news/crawl/ws', { method: 'GET' })

      // 建立WebSocket连接
      const ws = new WebSocket('ws://localhost:8080')

      ws.onopen = () => {
        console.log('WebSocket连接已建立')
        setConnectionStatus('connected')
        setWsConnection(ws)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'progress_update') {
            // 更新实时进度
            updateRealTimeProgress(message.data)
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        setConnectionStatus('disconnected')
        setWsConnection(null)

        // 如果正在采集，尝试重连
        if (isCollecting) {
          setTimeout(initWebSocketConnection, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
        setConnectionStatus('disconnected')
      }

    } catch (error) {
      console.error('初始化WebSocket连接失败:', error)
      setConnectionStatus('disconnected')
    }
  }

  // 更新实时进度
  const updateRealTimeProgress = (progressData: any) => {
    setLanguageProgress(prev => {
      const updated = [...prev]
      const index = updated.findIndex(p => p.language === progressData.language)

      if (index >= 0) {
        updated[index] = { ...updated[index], ...progressData }
      } else {
        updated.push(progressData)
      }

      return updated
    })
  }

  // 检查当前采集进度（用于断点续传）
  const checkCrawlProgress = async () => {
    try {
      const response = await fetch('/api/admin/news/crawl', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        const progress = result.data

        if (progress.status === 'crawling' || progress.status === 'polishing') {
          setIsCollecting(true)
          setCollectProgress({
            current: progress.completedSources,
            total: progress.totalSources,
            currentSource: progress.currentSource
          })

          // 启动进度轮询
          startProgressPolling()
        }
      }
    } catch (error) {
      console.error('检查采集进度失败:', error)
    }
  }

  // 启动进度轮询
  const startProgressPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/news/crawl', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          const progress = result.data

          setCollectProgress({
            current: progress.completedSources,
            total: progress.totalSources,
            currentSource: progress.currentSource
          })

          if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'idle') {
            setIsCollecting(false)
            clearInterval(interval)
            fetchRecentJobs() // 刷新任务列表
          }
        }
      } catch (error) {
        console.error('轮询采集进度失败:', error)
        clearInterval(interval)
      }
    }, 2000) // 每2秒轮询一次
  }

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/admin/news/sources', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSources(data.data || [])
        // 默认选择所有活跃的源
        const activeSources = data.data?.filter((s: NewsSource) => s.isActive).map((s: NewsSource) => s.id) || []
        setSelectedSources(activeSources)
      }
    } catch (error) {
      console.error('获取新闻源失败:', error)
    }
  }

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch('/api/admin/news/crawl/jobs', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRecentJobs(data.data || [])
      }
    } catch (error) {
      console.error('获取采集任务失败:', error)
    }
  }

  // 开始多语种采集
  const handleStartCollect = async () => {
    setIsCollecting(true)

    // 初始化语言进度
    const initialProgress: CrawlProgressDetail[] = languageGroups.map(group => ({
      language: group.language,
      country: group.countries[0]?.countryCode || '',
      status: 'pending',
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0,
      startTime: new Date()
    }))
    setLanguageProgress(initialProgress)

    try {
      const response = await fetch('/api/admin/news/crawl/multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          articlesPerLanguage,
          enablePolishing,
          enableSEO,
          targetLanguages: languageGroups.map(g => g.language)
        })
      })

      if (!response.ok) {
        throw new Error('多语种采集请求失败')
      }

      const result = await response.json()

      // 启动多语种进度轮询
      startMultilingualProgressPolling()

    } catch (error) {
      console.error('多语种采集错误:', error)
      alert(error instanceof Error ? error.message : '多语种采集失败')
      setIsCollecting(false)
    }
  }

  // 多语种进度轮询
  const startMultilingualProgressPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/news/crawl/multilingual/progress', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          const progressDetails: CrawlProgressDetail[] = result.data

          setLanguageProgress(progressDetails)

          // 检查是否所有语言都完成了
          const allCompleted = progressDetails.every(p =>
            p.status === 'completed' || p.status === 'failed'
          )

          if (allCompleted) {
            setIsCollecting(false)
            clearInterval(interval)
            fetchRecentJobs() // 刷新任务列表

            const successCount = progressDetails.filter(p => p.status === 'completed').length
            const failedCount = progressDetails.filter(p => p.status === 'failed').length

            alert(`多语种采集完成！成功: ${successCount} 种语言，失败: ${failedCount} 种语言`)
          }
        }
      } catch (error) {
        console.error('轮询多语种采集进度失败:', error)
        clearInterval(interval)
      }
    }, 3000) // 每3秒轮询一次
  }

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const handleSelectAll = () => {
    const activeSources = sources.filter(s => s.isActive).map(s => s.id)
    setSelectedSources(activeSources)
  }

  const handleSelectNone = () => {
    setSelectedSources([])
  }

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新闻采集中心</h1>
          <p className="text-gray-600 mt-2">从配置的新闻源自动采集最新内容，支持RSS、网页爬虫和API接口</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              智能去重
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              质量过滤
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              断点续传
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              自动润色
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：采集配置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 采集配置 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">采集配置</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每语种采集数量
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={articlesPerLanguage}
                    onChange={(e) => setArticlesPerLanguage(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    每个语种采集的文章数量
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enablePolishing}
                      onChange={(e) => setEnablePolishing(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用AI润色</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enableSEO}
                      onChange={(e) => setEnableSEO(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">SEO优化</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">支持的语言</h3>
                    <p className="text-sm text-gray-500">
                      将对以下 {languageGroups.length} 种语言同时进行采集
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        实时连接: {
                          connectionStatus === 'connected' ? '已连接' :
                          connectionStatus === 'connecting' ? '连接中' :
                          '未连接'
                        }
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartCollect}
                    disabled={isCollecting || connectionStatus !== 'connected'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {isCollecting ? '采集中...' : '开始采集'}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {languageGroups.map(group => (
                    <div key={group.language} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-900">
                        {group.language.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({group.countries.length})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 实时进度显示 */}
            {isCollecting && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">采集进度</h2>

                <div className="space-y-4">
                  {languageGroups.map(group => {
                    const progress = languageProgress.find(p => p.language === group.language)

                    // 修复进度计算逻辑
                    let progressPercent = 0
                    let statusText = '等待中'
                    let statusColor = 'bg-gray-100 text-gray-800'

                    if (progress) {
                      // 根据状态计算进度百分比
                      if (progress.status === 'completed') {
                        progressPercent = 100
                        statusText = '已完成'
                        statusColor = 'bg-green-100 text-green-800'
                      } else if (progress.status === 'failed') {
                        progressPercent = 0
                        statusText = '失败'
                        statusColor = 'bg-red-100 text-red-800'
                      } else if (progress.status === 'polishing') {
                        // 润色阶段：采集完成(50%) + 润色进度(0-50%)
                        const polishProgress = Math.min(progress.articlesPolished / articlesPerLanguage, 1)
                        progressPercent = 50 + (polishProgress * 50)
                        statusText = '润色中'
                        statusColor = 'bg-blue-100 text-blue-800'
                      } else if (progress.status === 'crawling') {
                        // 采集阶段：0-50%
                        const crawlProgress = Math.min(progress.articlesProcessed / articlesPerLanguage, 1)
                        progressPercent = crawlProgress * 50
                        statusText = '采集中'
                        statusColor = 'bg-yellow-100 text-yellow-800'
                      } else if (progress.status === 'pending') {
                        progressPercent = 0
                        statusText = '等待中'
                        statusColor = 'bg-gray-100 text-gray-800'
                      }
                    }

                    return (
                      <div key={group.language} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">
                              {group.language.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {progress ? `${progress.articlesProcessed}/${articlesPerLanguage} 采集 | ${progress.articlesPolished}/${articlesPerLanguage} 润色` : `0/${articlesPerLanguage} 采集 | 0/${articlesPerLanguage} 润色`}
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress?.status === 'completed' ? 'bg-green-600' :
                              progress?.status === 'failed' ? 'bg-red-600' :
                              progress?.status === 'polishing' ? 'bg-blue-600' :
                              'bg-yellow-600'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                          ></div>
                        </div>

                        {progress?.currentSource && (
                          <div className="mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">当前源:</span>
                              <span>{progress.currentSource}</span>
                            </div>
                          </div>
                        )}

                        {progress?.currentArticleTitle && (
                          <div className="mt-1 text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">处理文章:</span>
                              <span className="truncate max-w-xs">{progress.currentArticleTitle}</span>
                            </div>
                          </div>
                        )}

                        {progress?.polishStage && progress.status === 'polishing' && (
                          <div className="mt-1 text-xs text-blue-600">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                              <span>{progress.polishStage}</span>
                            </div>
                          </div>
                        )}

                        {progress?.error && (
                          <div className="mt-2 text-xs text-red-600">
                            <div className="flex items-center space-x-2">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>错误: {progress.error}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 新闻源选择（简化版） */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">RSS源状态</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    全选
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    清空
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map(source => (
                  <div
                    key={source.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSources.includes(source.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!source.isActive ? 'opacity-50' : ''}`}
                    onClick={() => source.isActive && handleSourceToggle(source.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.id)}
                          onChange={() => source.isActive && handleSourceToggle(source.id)}
                          disabled={!source.isActive}
                          className="mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{source.name}</h3>
                          <p className="text-sm text-gray-500">{source.description}</p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              source.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {source.isActive ? '活跃' : '停用'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {source.type === 'rss' ? 'RSS' : '网页爬取'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 采集控制 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    已选择 {selectedSources.length} 个新闻源
                  </div>
                  <button
                    onClick={handleStartCollect}
                    disabled={isCollecting || selectedSources.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isCollecting ? '采集中...' : '开始采集'}
                  </button>
                </div>

                {/* 采集进度 */}
                {isCollecting && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">采集进度</span>
                      <span className="text-sm text-blue-700">
                        {collectProgress.current} / {collectProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(collectProgress.current / collectProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    {collectProgress.currentSource && (
                      <p className="text-sm text-blue-700 mt-2">
                        正在采集: {collectProgress.currentSource}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：最近任务 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">最近任务</h2>
              
              <div className="space-y-4">
                {recentJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无采集任务</p>
                ) : (
                  recentJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status === 'completed' ? '已完成' :
                           job.status === 'running' ? '运行中' :
                           job.status === 'failed' ? '失败' : '等待中'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {job.startTime && new Date(job.startTime).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        采集源数量: {job.sourceIds.length}
                      </p>
                      
                      {job.results && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>总计: {job.results.total}</div>
                          <div>成功: {job.results.success}</div>
                          <div>失败: {job.results.failed}</div>
                          <div>重复: {job.results.duplicates}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
