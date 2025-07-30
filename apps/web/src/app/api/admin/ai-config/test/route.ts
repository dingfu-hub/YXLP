import { NextRequest, NextResponse } from 'next/server'
import { getAIConfig, testAIConnection } from '@/lib/db/ai-config'

// 测试AI连接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model } = body

    if (!model || !['deepseek', 'doubao'].includes(model)) {
      return NextResponse.json({
        success: false,
        message: '无效的AI模型',
        error: 'INVALID_MODEL'
      }, { status: 400 })
    }

    const config = await getAIConfig(model)
    if (!config) {
      return NextResponse.json({
        success: false,
        message: 'AI配置不存在',
        error: 'CONFIG_NOT_FOUND'
      }, { status: 404 })
    }

    console.log(`开始测试${model}连接...`)
    const result = await testAIConnection(config)

    // 记录测试结果
    if (result.success) {
      console.log(`${model}连接测试成功:`, {
        responseTime: result.details?.responseTime,
        model: result.details?.model,
        tokensUsed: result.details?.tokensUsed
      })
    } else {
      console.error(`${model}连接测试失败:`, result.message)
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('测试AI连接失败:', error)
    return NextResponse.json({
      success: false,
      message: '测试连接时发生内部错误',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
