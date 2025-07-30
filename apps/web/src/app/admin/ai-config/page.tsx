'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface AIConfig {
  id: string
  model: 'deepseek' | 'doubao'
  name: string
  description: string
  apiUrl: string
  apiKey: string
  modelId?: string
  maxTokens: number
  temperature: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function AIConfigPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // 加载配置
  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin/ai-config')
      const result = await response.json()
      
      if (result.success) {
        setConfigs(result.data)
      } else {
        toast.error('加载AI配置失败')
      }
    } catch (error) {
      console.error('加载AI配置失败:', error)
      toast.error('加载AI配置失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新配置
  const updateConfig = async (model: string, updates: Partial<AIConfig>) => {
    try {
      const response = await fetch('/api/admin/ai-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, ...updates })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('配置更新成功')
        await loadConfigs()
        setEditingConfig(null)
      } else {
        toast.error(result.message || '配置更新失败')
      }
    } catch (error) {
      console.error('更新配置失败:', error)
      toast.error('更新配置失败')
    }
  }

  // 测试连接
  const testConnection = async (model: string) => {
    setTestingConnection(prev => ({ ...prev, [model]: true }))
    setTestResults(prev => ({ ...prev, [model]: null }))

    try {
      const response = await fetch('/api/admin/ai-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model })
      })

      const result = await response.json()
      setTestResults(prev => ({ ...prev, [model]: result }))

      if (result.success) {
        const details = result.details
        let successMessage = `${model} 连接测试成功`
        if (details?.responseTime) {
          successMessage += ` (${details.responseTime}ms)`
        }
        toast.success(successMessage)
      } else {
        toast.error(`${model} 连接测试失败: ${result.message}`)
      }
    } catch (error) {
      console.error('测试连接失败:', error)
      const errorResult = {
        success: false,
        message: '网络请求失败',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, [model]: errorResult }))
      toast.error('测试连接失败')
    } finally {
      setTestingConnection(prev => ({ ...prev, [model]: false }))
    }
  }

  // 批量测试所有配置
  const testAllConnections = async () => {
    const enabledConfigs = configs.filter(config => config.enabled && config.apiKey)

    if (enabledConfigs.length === 0) {
      toast.error('没有启用且配置了API密钥的模型')
      return
    }

    toast.loading(`正在测试 ${enabledConfigs.length} 个模型的连接...`)

    for (const config of enabledConfigs) {
      await testConnection(config.model)
      // 添加延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    toast.dismiss()
    toast.success('批量测试完成')
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI模型配置</h1>
            <p className="text-gray-600">管理AI润色服务的模型配置和API密钥</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={testAllConnections}
              disabled={configs.filter(c => c.enabled && c.apiKey).length === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>批量测试</span>
            </button>
            <button
              onClick={loadConfigs}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {configs.map((config) => (
          <div key={config.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-900">{config.name}</h3>
                    {/* 连接状态指示器 */}
                    {testResults[config.model] && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        testResults[config.model].success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResults[config.model].success ? '✅ 已连接' : '❌ 连接失败'}
                      </span>
                    )}
                    {config.enabled && config.apiKey && !testResults[config.model] && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠️ 未测试
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{config.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig(config.model, { enabled: e.target.checked })}
                    className="mr-2"
                  />
                  启用
                </label>
                <button
                  onClick={() => setEditingConfig(config)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  配置
                </button>
                <button
                  onClick={() => testConnection(config.model)}
                  disabled={!config.apiKey || testingConnection[config.model]}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {testingConnection[config.model] ? '测试中...' : '测试连接'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">API地址:</span>
                <div className="text-gray-600 break-all">{config.apiUrl}</div>
              </div>
              <div>
                <span className="font-medium">API密钥:</span>
                <div className="text-gray-600">{config.apiKey || '未配置'}</div>
              </div>
              <div>
                <span className="font-medium">最大Token:</span>
                <div className="text-gray-600">{config.maxTokens}</div>
              </div>
              <div>
                <span className="font-medium">温度:</span>
                <div className="text-gray-600">{config.temperature}</div>
              </div>
            </div>

            {/* 测试结果显示 */}
            {testResults[config.model] && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                testResults[config.model].success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  testResults[config.model].success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResults[config.model].success ? '✅ 连接成功' : '❌ 连接失败'}
                </div>

                <div className={`mt-1 ${
                  testResults[config.model].success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResults[config.model].message}
                </div>

                {testResults[config.model].details && (
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <div>模型: {testResults[config.model].details.model}</div>
                    <div>响应时间: {testResults[config.model].details.responseTime}ms</div>
                    {testResults[config.model].details.tokensUsed && (
                      <div>消耗Token: {testResults[config.model].details.tokensUsed}</div>
                    )}
                    {testResults[config.model].details.testResponse && (
                      <div>测试响应: {testResults[config.model].details.testResponse}</div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  测试时间: {new Date(testResults[config.model].timestamp).toLocaleString()}
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              最后更新: {new Date(config.updatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* 编辑配置弹窗 */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">配置 {editingConfig.name}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const updates = {
                apiUrl: formData.get('apiUrl') as string,
                apiKey: formData.get('apiKey') as string,
                modelId: formData.get('modelId') as string,
                maxTokens: parseInt(formData.get('maxTokens') as string),
                temperature: parseFloat(formData.get('temperature') as string)
              }
              updateConfig(editingConfig.model, updates)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">API地址</label>
                  <input
                    name="apiUrl"
                    type="url"
                    defaultValue={editingConfig.apiUrl}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">API密钥</label>
                  <input
                    name="apiKey"
                    type="password"
                    placeholder="输入新的API密钥"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {editingConfig.model === 'doubao' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">模型ID</label>
                    <input
                      name="modelId"
                      type="text"
                      defaultValue={editingConfig.modelId}
                      placeholder="ep-xxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">最大Token</label>
                  <input
                    name="maxTokens"
                    type="number"
                    defaultValue={editingConfig.maxTokens}
                    min="100"
                    max="8000"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">温度</label>
                  <input
                    name="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    defaultValue={editingConfig.temperature}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
