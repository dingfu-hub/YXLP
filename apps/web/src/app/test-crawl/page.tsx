'use client'

import React, { useState, useEffect } from 'react'
import CrawlProgressModal from '@/components/CrawlProgressModal'

export default function TestCrawlPage() {
  const [showModal, setShowModal] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // 检查当前采集状态
  useEffect(() => {
    const checkCrawlStatus = async () => {
      try {
        const response = await fetch('/api/admin/news/crawl/progress')
        if (response.ok) {
          const data = await response.json()
          if (data.isActive) {
            // 如果有正在进行的采集，直接显示进度
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('检查采集状态失败:', error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkCrawlStatus()
  }, [])

  const handleStartCrawl = async (config: any) => {
    console.log('开始采集，配置:', config)
    
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
        throw new Error('采集启动失败')
      }

      const result = await response.json()
      console.log('采集启动成功:', result)

    } catch (error) {
      console.error('采集启动错误:', error)
      alert(error instanceof Error ? error.message : '采集启动失败')
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查采集状态中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">新闻采集测试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">测试功能</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. 采集配置增强</h3>
              <p className="text-gray-600 text-sm mb-3">
                ✅ 添加了单次采集数量设置<br/>
                ✅ 支持目标语言选择<br/>
                ✅ 改进了配置界面
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. 各地区/语言进度反馈</h3>
              <p className="text-gray-600 text-sm mb-3">
                ✅ 显示各地区采集进度<br/>
                ✅ 实时更新状态<br/>
                ✅ 详细的错误信息
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. 断点续传功能</h3>
              <p className="text-gray-600 text-sm mb-3">
                ✅ 检查现有采集进度<br/>
                ✅ 自动恢复采集状态<br/>
                ✅ 刷新页面后状态保持
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            测试采集功能
          </button>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">修复的问题</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">问题1: 缺少各地区进度反馈</h3>
              <p className="text-green-700 text-sm">
                ✅ 已修复：现在显示每个地区/语言的详细采集进度，包括状态、文章数量等
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">问题2: 刷新页面后状态丢失</h3>
              <p className="text-green-700 text-sm">
                ✅ 已修复：页面刷新后会自动检查现有采集进度，如有正在进行的任务会直接显示进度页面
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">问题3: 断点续传功能未完成</h3>
              <p className="text-green-700 text-sm">
                ✅ 已修复：添加了会话ID和进度持久化，支持断点续传功能
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">问题4: 缺少单次采集数量设置</h3>
              <p className="text-green-700 text-sm">
                ✅ 已修复：在采集配置页面添加了单次采集数量设置，支持10-200篇文章/语种
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CrawlProgressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStart={handleStartCrawl}
      />
    </div>
  )
}
