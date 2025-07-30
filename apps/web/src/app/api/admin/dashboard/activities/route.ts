import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

interface Activity {
  id: string
  type: 'order' | 'user' | 'product' | 'news'
  message: string
  timestamp: string
  amount?: number
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== 仪表板活动API ===')
    
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

    // 生成模拟活动数据
    const activities: Activity[] = [
      {
        id: '1',
        type: 'order',
        message: '新订单 #12345 - 用户张三购买了UNIQLO经典白衬衫',
        timestamp: '2分钟前',
        amount: 299
      },
      {
        id: '2',
        type: 'user',
        message: '新用户注册 - 李四完成了账户注册',
        timestamp: '15分钟前'
      },
      {
        id: '3',
        type: 'product',
        message: '商品上架 - Nike Air Max 运动鞋已成功上架',
        timestamp: '30分钟前'
      },
      {
        id: '4',
        type: 'order',
        message: '订单完成 #12344 - 王五的订单已发货',
        timestamp: '45分钟前',
        amount: 459
      },
      {
        id: '5',
        type: 'news',
        message: '新闻发布 - 2024春季时尚趋势报告已发布',
        timestamp: '1小时前'
      },
      {
        id: '6',
        type: 'order',
        message: '订单退款 #12343 - 赵六申请退款已处理',
        timestamp: '1小时30分钟前',
        amount: 199
      },
      {
        id: '7',
        type: 'user',
        message: '用户升级 - 钱七成为VIP会员',
        timestamp: '2小时前'
      },
      {
        id: '8',
        type: 'product',
        message: '库存预警 - ZARA修身牛仔裤库存不足',
        timestamp: '2小时30分钟前'
      },
      {
        id: '9',
        type: 'order',
        message: '大额订单 #12342 - 孙八购买了多件商品',
        timestamp: '3小时前',
        amount: 1299
      },
      {
        id: '10',
        type: 'news',
        message: '内容更新 - 夏季穿搭指南已更新',
        timestamp: '4小时前'
      }
    ]

    console.log('活动数据生成成功，共', activities.length, '条记录')

    return NextResponse.json({
      success: true,
      data: activities
    })

  } catch (error) {
    console.error('获取活动数据失败:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
