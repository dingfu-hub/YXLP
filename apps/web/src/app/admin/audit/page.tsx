'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AuditLog {
  id: string
  userId?: string
  sessionId?: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'blocked'
  riskLevel: string
  ipAddress: string
  userAgent: string
  location?: any
  metadata: any
  timestamp: string
  user?: {
    username: string
    email: string
    displayName: string
  }
}

interface SecurityEvent {
  id: string
  userId: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  userAgent: string
  location?: any
  metadata: any
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  createdAt: string
  user?: {
    username: string
    email: string
    displayName: string
  }
}

interface AuditStats {
  overview: {
    totalLogs: number
    successfulActions: number
    failedActions: number
    blockedActions: number
    totalEvents: number
    unresolvedEvents: number
    criticalEvents: number
    highSeverityEvents: number
  }
  trends: {
    topActions: Array<{ action: string; count: number }>
    topUsers: Array<{ userId: string; count: number }>
    topIPs: Array<{ ip: string; count: number }>
  }
  security: {
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    recentCriticalEvents: SecurityEvent[]
  }
}

export default function AdminAuditPage() {
  const { user: currentUser, token } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())

  // 筛选状态
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userId: '',
    action: '',
    resource: '',
    result: '',
    severity: '',
    resolved: '',
    page: 1,
    limit: 20
  })

  // 加载审计统计
  const loadStats = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: filters.startDate,
          endDate: filters.endDate
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        console.error('Failed to load stats:', result.message)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // 加载审计日志
  const loadAuditLogs = async () => {
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'severity' && key !== 'resolved') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/audit?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setAuditLogs(result.data.logs)
      } else {
        console.error('Failed to load audit logs:', result.message)
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
  }

  // 加载安全事件
  const loadSecurityEvents = async () => {
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'action' && key !== 'resource' && key !== 'result') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/security-events?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setSecurityEvents(result.data.events)
      } else {
        console.error('Failed to load security events:', result.message)
      }
    } catch (error) {
      console.error('Error loading security events:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        loadStats(),
        activeTab === 'logs' && loadAuditLogs(),
        activeTab === 'events' && loadSecurityEvents()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [token, filters, activeTab])

  // 处理筛选变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  // 处理事件选择
  const handleEventSelect = (eventId: string, selected: boolean) => {
    const newSelected = new Set(selectedEvents)
    if (selected) {
      newSelected.add(eventId)
    } else {
      newSelected.delete(eventId)
    }
    setSelectedEvents(newSelected)
  }

  // 批量解决事件
  const handleBatchResolve = async () => {
    if (selectedEvents.size === 0) return

    const resolution = prompt('请输入解决方案描述：')
    if (!resolution) return

    try {
      const response = await fetch('/api/admin/security-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'resolve',
          eventIds: Array.from(selectedEvents),
          resolution
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadSecurityEvents()
        setSelectedEvents(new Set())
        alert('事件已批量解决')
      } else {
        alert(`批量解决失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Batch resolve error:', error)
      alert('批量解决失败')
    }
  }

  // 获取风险等级样式
  const getRiskLevelBadge = (level: string) => {
    const styles = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    }
    return styles[level as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // 获取严重程度样式
  const getSeverityBadge = (severity: string) => {
    const styles = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    }
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // 获取结果样式
  const getResultBadge = (result: string) => {
    const styles = {
      'success': 'bg-green-100 text-green-800',
      'failure': 'bg-red-100 text-red-800',
      'blocked': 'bg-orange-100 text-orange-800'
    }
    return styles[result as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录管理后台</p>
          <a href="/admin/login" className="mt-2 text-blue-600 hover:text-blue-500">
            前往登录
          </a>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: '概览', icon: '📊' },
    { id: 'logs', name: '审计日志', icon: '📝' },
    { id: 'events', name: '安全事件', icon: '🚨' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">安全审计</h1>
              <p className="mt-1 text-sm text-gray-500">
                监控系统安全状态和用户活动
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">时间范围:</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">至</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && stats && (
                  <div className="space-y-6">
                    {/* 统计卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.overview.totalLogs}</div>
                        <div className="text-sm text-blue-600">总审计日志</div>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.overview.successfulActions}</div>
                        <div className="text-sm text-green-600">成功操作</div>
                      </div>
                      <div className="bg-red-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.overview.failedActions}</div>
                        <div className="text-sm text-red-600">失败操作</div>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.overview.blockedActions}</div>
                        <div className="text-sm text-orange-600">阻止操作</div>
                      </div>
                    </div>

                    {/* 安全事件统计 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.overview.totalEvents}</div>
                        <div className="text-sm text-purple-600">安全事件</div>
                      </div>
                      <div className="bg-yellow-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.overview.unresolvedEvents}</div>
                        <div className="text-sm text-yellow-600">未解决事件</div>
                      </div>
                      <div className="bg-red-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.overview.criticalEvents}</div>
                        <div className="text-sm text-red-600">严重事件</div>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.overview.highSeverityEvents}</div>
                        <div className="text-sm text-orange-600">高危事件</div>
                      </div>
                    </div>

                    {/* 趋势分析 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">热门操作</h3>
                        <div className="space-y-2">
                          {stats.trends.topActions.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm text-gray-600">{item.action}</span>
                              <span className="text-sm font-medium">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">活跃用户</h3>
                        <div className="space-y-2">
                          {stats.trends.topUsers.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm text-gray-600">{item.userId}</span>
                              <span className="text-sm font-medium">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">热门IP</h3>
                        <div className="space-y-2">
                          {stats.trends.topIPs.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm text-gray-600">{item.ip}</span>
                              <span className="text-sm font-medium">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 最近的严重事件 */}
                    {stats.security.recentCriticalEvents.length > 0 && (
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">最近的严重安全事件</h3>
                        <div className="space-y-3">
                          {stats.security.recentCriticalEvents.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{event.description}</div>
                                <div className="text-xs text-gray-500">
                                  {event.user?.displayName || event.user?.username} • {new Date(event.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(event.severity)}`}>
                                {event.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {/* 筛选器 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="用户ID"
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="操作"
                        value={filters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="资源"
                        value={filters.resource}
                        onChange={(e) => handleFilterChange('resource', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={filters.result}
                        onChange={(e) => handleFilterChange('result', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">所有结果</option>
                        <option value="success">成功</option>
                        <option value="failure">失败</option>
                        <option value="blocked">阻止</option>
                      </select>
                    </div>

                    {/* 审计日志表格 */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">资源</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">结果</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">风险等级</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {log.user ? (
                                  <div>
                                    <div>{log.user.displayName || log.user.username}</div>
                                    <div className="text-xs text-gray-500">{log.user.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">未知用户</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{log.resource}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultBadge(log.result)}`}>
                                  {log.result}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelBadge(log.riskLevel)}`}>
                                  {log.riskLevel}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{log.ipAddress}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="space-y-6">
                    {/* 筛选器和批量操作 */}
                    <div className="flex justify-between items-center">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                          value={filters.severity}
                          onChange={(e) => handleFilterChange('severity', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">所有严重程度</option>
                          <option value="low">低</option>
                          <option value="medium">中</option>
                          <option value="high">高</option>
                          <option value="critical">严重</option>
                        </select>
                        <select
                          value={filters.resolved}
                          onChange={(e) => handleFilterChange('resolved', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">所有状态</option>
                          <option value="false">未解决</option>
                          <option value="true">已解决</option>
                        </select>
                        <input
                          type="text"
                          placeholder="用户ID"
                          value={filters.userId}
                          onChange={(e) => handleFilterChange('userId', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      {selectedEvents.size > 0 && (
                        <button
                          onClick={handleBatchResolve}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          批量解决 ({selectedEvents.size})
                        </button>
                      )}
                    </div>

                    {/* 安全事件表格 */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEvents(new Set(securityEvents.map(event => event.id)))
                                  } else {
                                    setSelectedEvents(new Set())
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">事件</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">严重程度</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {securityEvents.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedEvents.has(event.id)}
                                  onChange={(e) => handleEventSelect(event.id, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(event.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {event.user ? (
                                  <div>
                                    <div>{event.user.displayName || event.user.username}</div>
                                    <div className="text-xs text-gray-500">{event.user.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">未知用户</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div>{event.description}</div>
                                <div className="text-xs text-gray-500">{event.type}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(event.severity)}`}>
                                  {event.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  event.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {event.resolved ? '已解决' : '未解决'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{event.ipAddress}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
