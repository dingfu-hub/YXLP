'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
    revenueGrowth: number
    orderGrowth: number
    customerGrowth: number
    aovGrowth: number
  }
  salesChart: {
    date: string
    revenue: number
    orders: number
  }[]
  topProducts: {
    id: string
    name: string
    sales: number
    revenue: number
    growth: number
  }[]
  topCategories: {
    name: string
    sales: number
    revenue: number
    percentage: number
  }[]
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    customerRetentionRate: number
    averageLifetimeValue: number
  }
}

export default function AnalyticsPage() {
  const { t } = useTranslation({ forceLanguage: 'zh' })
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    // 模拟数据分析数据
    const mockData: AnalyticsData = {
      overview: {
        totalRevenue: 125680.50,
        totalOrders: 342,
        totalCustomers: 189,
        averageOrderValue: 367.54,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        customerGrowth: 15.2,
        aovGrowth: 3.8
      },
      salesChart: [
        { date: '2024-01-01', revenue: 4200, orders: 12 },
        { date: '2024-01-02', revenue: 3800, orders: 10 },
        { date: '2024-01-03', revenue: 5100, orders: 15 },
        { date: '2024-01-04', revenue: 4600, orders: 13 },
        { date: '2024-01-05', revenue: 5800, orders: 18 },
        { date: '2024-01-06', revenue: 6200, orders: 20 },
        { date: '2024-01-07', revenue: 5500, orders: 16 }
      ],
      topProducts: [
        { id: 'P001', name: '时尚休闲T恤', sales: 45, revenue: 4005.00, growth: 15.2 },
        { id: 'P002', name: '商务衬衫', sales: 38, revenue: 6042.00, growth: 8.7 },
        { id: 'P003', name: '牛仔裤', sales: 32, revenue: 6368.00, growth: -2.1 },
        { id: 'P004', name: '运动鞋', sales: 28, revenue: 8372.00, growth: 22.3 },
        { id: 'P005', name: '连衣裙', sales: 25, revenue: 4975.00, growth: 5.8 }
      ],
      topCategories: [
        { name: '服装', sales: 156, revenue: 28450.00, percentage: 42.5 },
        { name: '鞋类', sales: 89, revenue: 18920.00, percentage: 28.3 },
        { name: '配饰', sales: 67, revenue: 12340.00, percentage: 18.4 },
        { name: '包包', sales: 45, revenue: 8970.00, percentage: 10.8 }
      ],
      customerMetrics: {
        newCustomers: 67,
        returningCustomers: 122,
        customerRetentionRate: 64.5,
        averageLifetimeValue: 1245.80
      }
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [dateRange])

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <span className={`inline-flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6">
      {/* 页面标题和时间选择器 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="text-gray-600 mt-1">查看销售数据、客户分析和业务趋势</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
            <option value="1y">最近1年</option>
          </select>
        </div>
      </div>

      {/* 概览指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总收入</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {formatGrowth(data.overview.revenueGrowth)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总订单数</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalOrders.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {formatGrowth(data.overview.orderGrowth)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总客户数</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {formatGrowth(data.overview.customerGrowth)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均订单价值</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.averageOrderValue)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {formatGrowth(data.overview.aovGrowth)}
          </div>
        </div>
      </div>

      {/* 销售趋势图 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">销售趋势</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.salesChart.map((item, index) => {
            const maxRevenue = Math.max(...data.salesChart.map(d => d.revenue))
            const height = (item.revenue / maxRevenue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 rounded-t relative group cursor-pointer">
                  <div 
                    className="bg-blue-500 rounded-t transition-all duration-300 group-hover:bg-blue-600"
                    style={{ height: `${height * 2}px` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 热销商品和分类统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 热销商品 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">热销商品</h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">销量: {product.sales}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                  <div className="text-xs">{formatGrowth(product.growth)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分类统计 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">分类统计</h3>
          <div className="space-y-4">
            {data.topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>销量: {category.sales}</span>
                  <span>{formatCurrency(category.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 客户指标 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">客户指标</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{data.customerMetrics.newCustomers}</p>
            <p className="text-sm text-gray-600">新客户</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.customerMetrics.returningCustomers}</p>
            <p className="text-sm text-gray-600">回头客</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{data.customerMetrics.customerRetentionRate}%</p>
            <p className="text-sm text-gray-600">客户留存率</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(data.customerMetrics.averageLifetimeValue)}</p>
            <p className="text-sm text-gray-600">平均生命周期价值</p>
          </div>
        </div>
      </div>
    </div>
  )
}
