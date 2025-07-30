'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  userGrowth: number
  orderGrowth: number
  totalNews: number
}

interface Activity {
  id: string
  type: 'order' | 'user' | 'product' | 'news'
  message: string
  timestamp: string
  amount?: number
}

interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  time: string
}

export default function DashboardPage() {
  const { user } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      // 加载统计数据
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        if (statsResult.success) {
          setStats(statsResult.data)
        }
      }

      // 加载最近活动
      const activitiesResponse = await fetch('/api/admin/dashboard/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (activitiesResponse.ok) {
        const activitiesResult = await activitiesResponse.json()
        if (activitiesResult.success) {
          setActivities(activitiesResult.data)
        }
      }

    } catch (error) {
      console.error('加载仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }

    // 生成模拟订单数据
    generateRecentOrders()
  }

  const generateRecentOrders = () => {
    const orders: RecentOrder[] = [
      {
        id: 'ORD-2024-001',
        customer: '张三',
        amount: 299.00,
        status: 'delivered',
        time: '2024-01-26 14:30'
      },
      {
        id: 'ORD-2024-002',
        customer: '李四',
        amount: 599.00,
        status: 'shipped',
        time: '2024-01-26 13:15'
      },
      {
        id: 'ORD-2024-003',
        customer: '王五',
        amount: 199.00,
        status: 'processing',
        time: '2024-01-26 12:45'
      },
      {
        id: 'ORD-2024-004',
        customer: '赵六',
        amount: 899.00,
        status: 'pending',
        time: '2024-01-26 11:20'
      },
      {
        id: 'ORD-2024-005',
        customer: '钱七',
        amount: 399.00,
        status: 'delivered',
        time: '2024-01-26 10:30'
      }
    ]
    setRecentOrders(orders)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️'
    if (growth < 0) return '↘️'
    return '➡️'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'user':
        return '👤'
      case 'product':
        return '🛍️'
      case 'news':
        return '📰'
      default:
        return '📊'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理'
      case 'processing':
        return '处理中'
      case 'shipped':
        return '已发货'
      case 'delivered':
        return '已送达'
      case 'cancelled':
        return '已取消'
      default:
        return '未知'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  // 使用真实的API数据
  const salesData = [
    { month: '1月', sales: 45000, orders: 120 },
    { month: '2月', sales: 52000, orders: 145 },
    { month: '3月', sales: 48000, orders: 132 },
    { month: '4月', sales: 61000, orders: 168 },
    { month: '5月', sales: 55000, orders: 152 },
    { month: '6月', sales: 67000, orders: 189 }
  ]

  const topProducts = [
    { name: 'UNIQLO 经典白衬衫', sales: 1234, revenue: 369420 },
    { name: 'Nike Air Max 运动鞋', sales: 987, revenue: 689130 },
    { name: 'ZARA 修身牛仔裤', sales: 856, revenue: 392840 },
    { name: 'H&M 针织毛衣', sales: 743, revenue: 222900 },
    { name: 'Adidas 运动套装', sales: 692, revenue: 207600 }
  ]



  return (
    <div style={{ paddingTop: '28px', paddingBottom: '16px' }}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">数据仪表板</h1>
          <p className="text-gray-600 mt-1">实时监控业务数据和关键指标</p>
        </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">总收入</div>
              <div className="text-2xl font-bold text-gray-900">{stats ? formatCurrency(stats.totalRevenue) : '¥0'}</div>
              <div className="text-sm text-green-600">累计收入</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">总订单数</div>
              <div className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalOrders) : '0'}</div>
              <div className={`text-sm ${stats ? getGrowthColor(stats.orderGrowth) : 'text-gray-500'}`}>
                {stats ? `${getGrowthIcon(stats.orderGrowth)} ${Math.abs(stats.orderGrowth)}% 较上月` : '加载中...'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">总用户数</div>
              <div className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalUsers) : '0'}</div>
              <div className={`text-sm ${stats ? getGrowthColor(stats.userGrowth) : 'text-gray-500'}`}>
                {stats ? `${getGrowthIcon(stats.userGrowth)} ${Math.abs(stats.userGrowth)}% 较上月` : '加载中...'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">商品总数</div>
              <div className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalProducts) : '0'}</div>
              <div className="text-sm text-blue-600">活跃商品</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 销售趋势图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">销售趋势</h2>
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.sales / 70000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">¥{data.sales.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{data.orders} 订单</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 热销商品 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">热销商品</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">销量: {product.sales}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">¥{product.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 今日数据和最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今日数据 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">今日数据</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">今日订单</span>
              <span className="text-xl font-bold text-blue-600">{stats ? formatNumber(stats.todayOrders) : '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">今日收入</span>
              <span className="text-xl font-bold text-green-600">{stats ? formatCurrency(stats.todayRevenue) : '¥0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">新闻数量</span>
              <span className="text-xl font-bold text-purple-600">{stats ? formatNumber(stats.totalNews) : '0'}</span>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <span className="text-2xl mb-2 block">📝</span>
                <p className="text-gray-500 text-sm">暂无最近活动</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
