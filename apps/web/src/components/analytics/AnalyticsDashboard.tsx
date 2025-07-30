'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
} from 'lucide-react'

interface DashboardMetrics {
  totalEvents: number
  uniqueUsers: number
  uniqueSessions: number
  pageViews: number
  purchases: number
  revenue: number
}

interface ChartData {
  name: string
  value: number
  date?: string
  revenue?: number
  orders?: number
  visitors?: number
}

interface TopItem {
  name: string
  value: number
  percentage?: number
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [topPages, setTopPages] = useState<TopItem[]>([])
  const [topProducts, setTopProducts] = useState<TopItem[]>([])
  const [realtimeVisitors, setRealtimeVisitors] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
    fetchRealtimeData()
    
    // Set up real-time updates
    const interval = setInterval(fetchRealtimeData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      const [dashboardResponse, revenueResponse, pagesResponse, productsResponse] = await Promise.all([
        fetch(`/api/analytics/dashboard?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/analytics/revenue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            groupBy: 'day',
          }),
        }),
        fetch(`/api/analytics/popular/pages?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=5`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch(`/api/analytics/popular/products?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=5`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ])

      const dashboardData = await dashboardResponse.json()
      const revenueData = await revenueResponse.json()
      const pagesData = await pagesResponse.json()
      const productsData = await productsResponse.json()

      setMetrics(dashboardData.metrics)
      setChartData(revenueData.data || [])
      setTopPages(pagesData.events || [])
      setTopProducts(productsData.events || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch('/api/analytics/realtime/visitors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      const data = await response.json()
      setRealtimeVisitors(data.activeVisitors || 0)
    } catch (error) {
      console.error('Error fetching realtime data:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your website performance and user behavior</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Real-time visitors */}
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              {realtimeVisitors} active now
            </span>
          </div>
          
          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.totalEvents)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(5.2)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(5.2)}`}>
                +5.2% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.uniqueUsers)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(12.5)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(12.5)}`}>
                +12.5% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.pageViews)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(8.1)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(8.1)}`}>
                +8.1% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.revenue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(15.3)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(15.3)}`}>
                +15.3% from last period
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {page.name || 'Unknown Page'}
                    </p>
                    <p className="text-xs text-gray-500">{page.value} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(page.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {product.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500">{product.value} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(product.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-full h-16 bg-blue-500 rounded-t-lg flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="bg-blue-50 p-4 rounded-b-lg">
              <p className="text-2xl font-bold text-blue-600">10,000</p>
              <p className="text-sm text-gray-600">Visitors</p>
              <p className="text-xs text-gray-500">100%</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-green-500 rounded-t-lg flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div className="bg-green-50 p-4 rounded-b-lg">
              <p className="text-2xl font-bold text-green-600">3,500</p>
              <p className="text-sm text-gray-600">Product Views</p>
              <p className="text-xs text-gray-500">35%</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-yellow-500 rounded-t-lg flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="bg-yellow-50 p-4 rounded-b-lg">
              <p className="text-2xl font-bold text-yellow-600">850</p>
              <p className="text-sm text-gray-600">Add to Cart</p>
              <p className="text-xs text-gray-500">8.5%</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-purple-500 rounded-t-lg flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="bg-purple-50 p-4 rounded-b-lg">
              <p className="text-2xl font-bold text-purple-600">320</p>
              <p className="text-sm text-gray-600">Purchases</p>
              <p className="text-xs text-gray-500">3.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
