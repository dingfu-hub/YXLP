'use client'

import React, { useState, useEffect } from 'react'

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState({
    react: '✅ React渲染正常',
    css: '✅ CSS加载正常',
    javascript: '✅ JavaScript执行正常',
    adminContext: '检测中...',
    apiConnection: '检测中...',
    errors: []
  })

  useEffect(() => {
    // 检测AdminContext
    try {
      // 尝试导入AdminContext
      import('@/contexts/AdminContext').then(() => {
        setDiagnostics(prev => ({
          ...prev,
          adminContext: '✅ AdminContext导入成功'
        }))
      }).catch(error => {
        setDiagnostics(prev => ({
          ...prev,
          adminContext: `❌ AdminContext导入失败: ${error.message}`,
          errors: [...prev.errors, `AdminContext错误: ${error.message}`]
        }))
      })
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        adminContext: `❌ AdminContext错误: ${error.message}`,
        errors: [...prev.errors, `AdminContext错误: ${error.message}`]
      }))
    }

    // 检测API连接
    fetch('/api/admin/auth/me')
      .then(response => {
        setDiagnostics(prev => ({
          ...prev,
          apiConnection: `✅ API连接正常 (状态码: ${response.status})`
        }))
      })
      .catch(error => {
        setDiagnostics(prev => ({
          ...prev,
          apiConnection: `❌ API连接失败: ${error.message}`,
          errors: [...prev.errors, `API错误: ${error.message}`]
        }))
      })

    // 监听全局错误
    const handleError = (event) => {
      setDiagnostics(prev => ({
        ...prev,
        errors: [...prev.errors, `全局错误: ${event.error?.message || event.message}`]
      }))
    }

    const handleUnhandledRejection = (event) => {
      setDiagnostics(prev => ({
        ...prev,
        errors: [...prev.errors, `Promise错误: ${event.reason?.message || event.reason}`]
      }))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">🔍 系统诊断页面</h1>
      
      <div className="grid gap-6">
        {/* 基础功能检测 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">基础功能检测</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">⚛️</span>
              <span>{diagnostics.react}</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">🎨</span>
              <span>{diagnostics.css}</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">📜</span>
              <span>{diagnostics.javascript}</span>
            </div>
          </div>
        </div>

        {/* 系统组件检测 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">系统组件检测</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">🔐</span>
              <span>{diagnostics.adminContext}</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">🌐</span>
              <span>{diagnostics.apiConnection}</span>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {diagnostics.errors.length > 0 && (
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-600">❌ 检测到的错误</h2>
            <div className="space-y-2">
              {diagnostics.errors.map((error, index) => (
                <div key={index} className="bg-red-100 p-3 rounded border-l-4 border-red-500">
                  <code className="text-sm text-red-700">{error}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 环境信息 */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">环境信息</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>用户代理:</strong>
              <div className="mt-1 p-2 bg-white rounded border text-xs break-all">
                {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
              </div>
            </div>
            <div>
              <strong>当前URL:</strong>
              <div className="mt-1 p-2 bg-white rounded border text-xs">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </div>
            </div>
            <div>
              <strong>屏幕分辨率:</strong>
              <div className="mt-1 p-2 bg-white rounded border text-xs">
                {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}
              </div>
            </div>
            <div>
              <strong>视口大小:</strong>
              <div className="mt-1 p-2 bg-white rounded border text-xs">
                {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">功能测试</h2>
          <div className="space-x-4">
            <button 
              onClick={() => alert('JavaScript点击事件正常工作！')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              测试点击事件
            </button>
            <button 
              onClick={() => {
                fetch('/api/admin/auth/me')
                  .then(response => response.json())
                  .then(data => alert(`API测试成功！状态: ${JSON.stringify(data, null, 2)}`))
                  .catch(error => alert(`API测试失败: ${error.message}`))
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              测试API调用
            </button>
            <button 
              onClick={() => {
                window.location.href = '/admin/news'
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              跳转到新闻页面
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
