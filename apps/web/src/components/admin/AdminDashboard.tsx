'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Activity,
  Server,
  Database,
  Mail,
  Search,
} from 'lucide-react'

interface DashboardMetrics {
  orders: {
    today: number
    yesterday: number
    week: number
    change: number
  }
  revenue: {
    today: number
    week: number
    change: number
  }
  users: {
    active: number
  }
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    database: { status: string; responseTime: number }
    redis: { status: string; responseTime: number }
    elasticsearch: { status: string; responseTime: number }
    email: { status: string; responseTime: number }
  }
  metrics: {
    uptime: number
    memory: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    cpu: {
      user: number
      system: number
    }
  }
}

interface RecentOrder {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  total: number
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchSystemHealth()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchSystemHealth()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await response.json()
      if (data.metrics) {
        setMetrics(data.metrics)
      }
      if (data.recentActivity?.orders) {
        setRecentOrders(data.recentActivity.orders)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/health?includeDetails=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Error fetching system health:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health?.status || 'unknown')}`}>
            {health?.status || 'Unknown'}
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.orders.today}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(metrics.orders.change)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(metrics.orders.change)}`}>
                {Math.abs(metrics.orders.change).toFixed(1)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs yesterday</span>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.revenue.today)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(metrics.revenue.change)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(metrics.revenue.change)}`}>
                {Math.abs(metrics.revenue.change).toFixed(1)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs avg daily</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.users.active}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
          </div>

          {/* Weekly Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Orders</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.orders.week}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        {health && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Services Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.services.database.status)}`}>
                      {health.services.database.status}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {health.services.database.responseTime}ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">Redis</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.services.redis.status)}`}>
                      {health.services.redis.status}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {health.services.redis.responseTime}ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">Elasticsearch</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.services.elasticsearch.status)}`}>
                      {health.services.elasticsearch.status}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {health.services.elasticsearch.responseTime}ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">Email Service</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.services.email.status)}`}>
                      {health.services.email.status}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {health.services.email.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* System Metrics */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">System Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium">{formatUptime(health.metrics.uptime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className="font-medium">{formatBytes(health.metrics.memory.heapUsed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Memory</span>
                    <span className="font-medium">{formatBytes(health.metrics.memory.heapTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Products</span>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingBag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Orders</span>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">System Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
