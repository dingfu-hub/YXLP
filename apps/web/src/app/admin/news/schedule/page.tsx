'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'

interface ScheduleRule {
  id: string
  name: string
  description: string
  cronExpression: string
  isActive: boolean
  aiModel: string
  sourceIds: string[]
  lastRun?: Date
  nextRun?: Date
  createdAt: Date
  updatedAt: Date
}

const SchedulePage = () => {
  const router = useRouter()
  const { user } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<ScheduleRule[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRule | null>(null)

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cronExpression: '0 9 * * *', // 默认每天9点
    aiModel: 'deepseek',
    sourceIds: [] as string[]
  })

  // 预设的定时规则
  const cronPresets = [
    { label: '每小时', value: '0 * * * *', description: '每小时执行一次' },
    { label: '每天9点', value: '0 9 * * *', description: '每天上午9点执行' },
    { label: '每天18点', value: '0 18 * * *', description: '每天下午6点执行' },
    { label: '每周一9点', value: '0 9 * * 1', description: '每周一上午9点执行' },
    { label: '工作日9点', value: '0 9 * * 1-5', description: '周一到周五上午9点执行' },
    { label: '每6小时', value: '0 */6 * * *', description: '每6小时执行一次' },
    { label: '每12小时', value: '0 */12 * * *', description: '每12小时执行一次' }
  ]

  // AI模型选项
  const aiModels = [
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'doubao', label: '豆包' }
  ]



  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
      return
    }
    fetchSchedules()
  }, [user, router])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/news/schedule-crawl', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setSchedules(result.data || [])
      }
    } catch (error) {
      console.error('获取定时任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSchedule
        ? `/api/admin/news/schedule-crawl/${editingSchedule.id}`
        : '/api/admin/news/schedule-crawl'
      
      const method = editingSchedule ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingSchedule ? '定时任务更新成功' : '定时任务创建成功')
        setShowCreateModal(false)
        setEditingSchedule(null)
        resetForm()
        fetchSchedules()
      } else {
        const error = await response.json()
        alert(error.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cronExpression: '0 9 * * *',
      aiModel: 'deepseek',
      sourceIds: []
    })
  }

  const handleEdit = (schedule: ScheduleRule) => {
    setEditingSchedule(schedule)
    setFormData({
      name: schedule.name,
      description: schedule.description,
      cronExpression: schedule.cronExpression,
      aiModel: schedule.aiModel,
      sourceIds: schedule.sourceIds
    })
    setShowCreateModal(true)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/news/schedule/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchSchedules()
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('切换状态失败:', error)
      alert('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个定时任务吗？')) return

    try {
      const response = await fetch(`/api/admin/news/schedule/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('删除成功')
        fetchSchedules()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  const formatCronDescription = (cron: string) => {
    const preset = cronPresets.find(p => p.value === cron)
    return preset ? preset.description : cron
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '未设置'
    const d = new Date(date)
    return d.toLocaleString('zh-CN')
  }

  if (loading) {
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
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">定时采集管理</h1>
                <p className="text-gray-600 mt-1">配置和管理自动新闻采集任务</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  创建定时任务
                </button>
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  返回
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⏰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无定时任务</h3>
                <p className="text-gray-600 mb-4">创建您的第一个自动采集任务</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  创建定时任务
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{schedule.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            schedule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.isActive ? '运行中' : '已暂停'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{schedule.description}</p>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>执行规则: {formatCronDescription(schedule.cronExpression)}</span>
                          <span>AI模型: {schedule.aiModel}</span>
                          <span>多语言: 自动生成全部语言</span>
                          <span>上次运行: {formatDate(schedule.lastRun)}</span>
                          <span>下次运行: {formatDate(schedule.nextRun)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(schedule.id, schedule.isActive)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            schedule.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {schedule.isActive ? '暂停' : '启用'}
                        </button>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建/编辑模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSchedule ? '编辑定时任务' : '创建定时任务'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingSchedule(null)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：每日服装新闻采集"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述这个定时任务的用途"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">执行时间</label>
                <select
                  value={formData.cronExpression}
                  onChange={(e) => setFormData(prev => ({ ...prev, cronExpression: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cronPresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label} - {preset.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI模型</label>
                <select
                  value={formData.aiModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiModel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {aiModels.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>系统将自动为所有采集的新闻生成多语言版本，无需手动配置</span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingSchedule(null)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSchedule ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchedulePage
