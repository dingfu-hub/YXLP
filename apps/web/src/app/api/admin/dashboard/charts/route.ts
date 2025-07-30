import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

export async function GET(request: NextRequest) {
  try {
    console.log('=== 仪表板图表API ===')
    
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    const currentUser = findAdminById(payload.userId)
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 生成模拟图表数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const currentMonth = new Date().getMonth()
    const last6Months = []
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      last6Months.push(months[monthIndex])
    }

    // 销售数据
    const salesData = last6Months.map(() => Math.floor(Math.random() * 100000) + 50000)
    const salesChart = {
      labels: last6Months,
      datasets: [{
        label: '销售额',
        data: salesData,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    }

    // 用户增长数据
    const userGrowthData = last6Months.map((_, index) => {
      const baseUsers = 1000 + index * 200
      return baseUsers + Math.floor(Math.random() * 500)
    })
    const userChart = {
      labels: last6Months,
      datasets: [{
        label: '用户数量',
        data: userGrowthData,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }]
    }

    // 订单数据
    const orderData = last6Months.map(() => Math.floor(Math.random() * 500) + 100)
    const orderChart = {
      labels: last6Months,
      datasets: [{
        label: '订单数量',
        data: orderData,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2
      }]
    }

    const charts = {
      sales: salesChart,
      users: userChart,
      orders: orderChart
    }

    console.log('图表数据生成成功')

    return NextResponse.json({
      success: true,
      data: charts
    })

  } catch (error) {
    console.error('获取图表数据失败:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
