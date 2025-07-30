import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 模拟AI配置数据
const aiConfigs = [
  {
    id: 'config_1',
    name: '标准新闻润色',
    description: '适用于一般新闻内容的标准润色配置',
    prompts: {
      title: '请优化这个新闻标题，使其更吸引人且准确，保持在30字以内：',
      content: '请润色这篇新闻内容，保持事实准确性的同时提高可读性，使语言更流畅自然：',
      summary: '请为这篇新闻生成一个简洁的摘要，控制在100字以内，突出核心要点：'
    },
    settings: {
      temperature: 0.7,
      maxTokens: 2000,
      model: 'gpt-3.5-turbo'
    },
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'config_2',
    name: '科技新闻专用',
    description: '专门针对科技类新闻的润色配置，突出技术特点',
    prompts: {
      title: '请优化这个科技新闻标题，突出技术创新点和影响力：',
      content: '请润色这篇科技新闻，保持技术准确性，使用通俗易懂的语言解释专业概念：',
      summary: '请生成科技新闻摘要，突出技术突破、应用场景和市场影响：'
    },
    settings: {
      temperature: 0.6,
      maxTokens: 2500,
      model: 'gpt-4'
    },
    isDefault: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'config_3',
    name: '财经新闻专用',
    description: '专门针对财经类新闻的润色配置，注重数据准确性',
    prompts: {
      title: '请优化这个财经新闻标题，突出市场影响和投资价值：',
      content: '请润色这篇财经新闻，确保数据准确，分析逻辑清晰，语言专业但易懂：',
      summary: '请生成财经新闻摘要，突出关键数据、市场趋势和投资机会：'
    },
    settings: {
      temperature: 0.5,
      maxTokens: 2000,
      model: 'gpt-4'
    },
    isDefault: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:read')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: aiConfigs
    })

  } catch (error) {
    console.error('获取AI配置列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:create')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { name, description, prompts, settings, isDefault } = body

    // 验证必填字段
    if (!name || !description || !prompts || !settings) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证prompts结构
    if (!prompts.title || !prompts.content || !prompts.summary) {
      return NextResponse.json(
        { error: '提示词配置不完整' },
        { status: 400 }
      )
    }

    // 验证settings结构
    if (!settings.temperature || !settings.maxTokens || !settings.model) {
      return NextResponse.json(
        { error: '模型设置不完整' },
        { status: 400 }
      )
    }

    // 如果设置为默认配置，取消其他默认配置
    if (isDefault) {
      aiConfigs.forEach(config => {
        config.isDefault = false
      })
    }

    // 创建新配置
    const newConfig = {
      id: `config_${Date.now()}`,
      name,
      description,
      prompts,
      settings,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    aiConfigs.push(newConfig)

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: 'AI配置创建成功'
    })

  } catch (error) {
    console.error('创建AI配置错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: '缺少配置ID' },
        { status: 400 }
      )
    }

    // 查找配置
    const configIndex = aiConfigs.findIndex(config => config.id === id)
    
    if (configIndex === -1) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      )
    }

    // 如果设置为默认配置，取消其他默认配置
    if (updateData.isDefault) {
      aiConfigs.forEach(config => {
        if (config.id !== id) {
          config.isDefault = false
        }
      })
    }

    // 更新配置
    aiConfigs[configIndex] = {
      ...aiConfigs[configIndex],
      ...updateData,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: aiConfigs[configIndex],
      message: 'AI配置更新成功'
    })

  } catch (error) {
    console.error('更新AI配置错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
