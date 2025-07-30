// 实时进度推送API - 使用HTTP轮询替代WebSocket
import { NextRequest, NextResponse } from 'next/server'

// 存储最新的进度数据
let latestProgress: any = null

// 广播进度更新（保存到内存）
export function broadcastProgress(progressData: any) {
  latestProgress = {
    ...progressData,
    timestamp: new Date().toISOString()
  }
  console.log('进度更新已保存:', latestProgress)
}

// HTTP端点用于获取最新进度
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '进度服务运行中',
    data: latestProgress,
    timestamp: new Date().toISOString()
  })
}

// 手动触发进度更新（用于测试）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    broadcastProgress(body)
    
    return NextResponse.json({
      success: true,
      message: '进度更新已保存',
      data: latestProgress
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '更新失败'
    }, { status: 500 })
  }
}
