import { NextRequest, NextResponse } from 'next/server'
import { getAIConfigs, updateAIConfig, testAIConnection } from '@/lib/db/ai-config'

// 获取AI配置列表
export async function GET() {
  try {
    const configs = await getAIConfigs()
    
    // 隐藏API密钥的敏感信息
    const safeConfigs = configs.map(config => ({
      ...config,
      apiKey: config.apiKey ? '***已配置***' : ''
    }))
    
    return NextResponse.json({
      success: true,
      data: safeConfigs
    })
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取AI配置失败'
    }, { status: 500 })
  }
}

// 更新AI配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, ...updates } = body
    
    if (!model || !['deepseek', 'doubao'].includes(model)) {
      return NextResponse.json({
        success: false,
        message: '无效的AI模型'
      }, { status: 400 })
    }
    
    const updatedConfig = await updateAIConfig(model, updates)
    
    // 隐藏API密钥
    const safeConfig = {
      ...updatedConfig,
      apiKey: updatedConfig.apiKey ? '***已配置***' : ''
    }
    
    return NextResponse.json({
      success: true,
      data: safeConfig,
      message: 'AI配置更新成功'
    })
  } catch (error) {
    console.error('更新AI配置失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '更新AI配置失败'
    }, { status: 500 })
  }
}
