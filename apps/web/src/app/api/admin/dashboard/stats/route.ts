import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import users from '@/data/users'
import { getAllProducts } from '@/data/products'
import { getAllNews } from '@/data/news'

export async function GET(request: NextRequest) {
  try {
    console.log('=== 仪表板统计API ===')
    console.log('开始仪表板认证')
    
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value
    console.log('Cookie token:', token ? '存在' : '不存在')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const payload = await verifyToken(token)
    console.log('Token验证结果:', payload ? '有效' : '无效')
    
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    const currentUser = findAdminById(payload.userId)
    console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    console.log('认证成功，用户:', currentUser.displayName, '角色:', currentUser.role)

    // 获取统计数据
    const allUsers = users
    const allProducts = getAllProducts()
    const allNews = getAllNews()

    // 模拟订单和收入数据
    const totalOrders = Math.floor(Math.random() * 5000) + 1000
    const totalRevenue = Math.floor(Math.random() * 1000000) + 500000
    const todayOrders = Math.floor(Math.random() * 50) + 10
    const todayRevenue = Math.floor(Math.random() * 50000) + 10000

    // 计算增长率（模拟数据）
    const userGrowth = Math.floor(Math.random() * 20) - 10 // -10% 到 +10%
    const orderGrowth = Math.floor(Math.random() * 30) - 15 // -15% 到 +15%

    const stats = {
      totalUsers: allUsers.length,
      totalProducts: allProducts.length,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      userGrowth,
      orderGrowth,
      totalNews: allNews.length
    }

    console.log('统计数据:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取仪表板统计失败:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
