import { promises as fs } from 'fs'
import path from 'path'

// AI配置接口
export interface AIConfig {
  id: string
  model: 'deepseek' | 'doubao'
  name: string
  description: string
  apiUrl: string
  apiKey: string
  modelId?: string // 豆包需要的模型ID
  maxTokens: number
  temperature: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// 默认配置
const DEFAULT_AI_CONFIGS: Omit<AIConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    model: 'deepseek',
    name: 'DeepSeek',
    description: '深度求索 - 高质量中文处理',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: '',
    maxTokens: 4000,
    temperature: 0.7,
    enabled: false
  },
  {
    model: 'doubao',
    name: '豆包',
    description: '字节跳动豆包 - 多语言优化',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: '',
    modelId: '',
    maxTokens: 4000,
    temperature: 0.7,
    enabled: false
  }
]

// 数据文件路径
const AI_CONFIG_FILE = path.join(process.cwd(), 'data', 'ai-config.json')

// 确保数据目录存在
async function ensureDataDir() {
  const dataDir = path.dirname(AI_CONFIG_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// 读取配置
export async function getAIConfigs(): Promise<AIConfig[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(AI_CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // 文件不存在时创建默认配置
    const configs = DEFAULT_AI_CONFIGS.map(config => ({
      ...config,
      id: `${config.model}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    await saveAIConfigs(configs)
    return configs
  }
}

// 保存配置
export async function saveAIConfigs(configs: AIConfig[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(AI_CONFIG_FILE, JSON.stringify(configs, null, 2))
}

// 获取单个配置
export async function getAIConfig(model: 'deepseek' | 'doubao'): Promise<AIConfig | null> {
  const configs = await getAIConfigs()
  return configs.find(config => config.model === model) || null
}

// 更新配置
export async function updateAIConfig(model: 'deepseek' | 'doubao', updates: Partial<AIConfig>): Promise<AIConfig> {
  const configs = await getAIConfigs()
  const index = configs.findIndex(config => config.model === model)
  
  if (index === -1) {
    throw new Error(`AI配置不存在: ${model}`)
  }
  
  configs[index] = {
    ...configs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  await saveAIConfigs(configs)
  return configs[index]
}

// 获取启用的配置
export async function getEnabledAIConfigs(): Promise<AIConfig[]> {
  const configs = await getAIConfigs()
  return configs.filter(config => config.enabled && config.apiKey)
}

// 测试API连接
export async function testAIConnection(config: AIConfig): Promise<{
  success: boolean;
  message: string;
  details?: {
    responseTime: number;
    model: string;
    tokensUsed?: number;
    testResponse?: string;
  }
}> {
  const startTime = Date.now()

  try {
    // 验证必要参数
    if (!config.apiKey) {
      return {
        success: false,
        message: 'API密钥未配置'
      }
    }

    if (config.model === 'doubao' && !config.modelId) {
      return {
        success: false,
        message: '豆包模型需要配置模型ID'
      }
    }

    // 构建测试请求
    const testPrompt = '请简单回复"连接测试成功"'
    const requestBody = config.model === 'deepseek'
      ? {
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: testPrompt
          }],
          max_tokens: 20,
          temperature: 0.1,
          stream: false
        }
      : {
          model: config.modelId,
          messages: [{
            role: 'user',
            content: testPrompt
          }],
          max_tokens: 20,
          temperature: 0.1,
          stream: false
        }

    console.log(`测试${config.model}连接:`, {
      url: config.apiUrl,
      model: config.model === 'deepseek' ? 'deepseek-chat' : config.modelId,
      hasApiKey: !!config.apiKey
    })

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'YXLP-News-System/1.0'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30秒超时
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error.code) {
            errorMessage = `错误代码: ${errorData.error.code}`
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (parseError) {
        // 如果无法解析错误响应，使用原始错误信息
        const errorText = await response.text()
        if (errorText) {
          errorMessage += ` - ${errorText.substring(0, 200)}`
        }
      }

      // 根据状态码提供更友好的错误信息
      switch (response.status) {
        case 401:
          errorMessage = 'API密钥无效或已过期'
          break
        case 403:
          errorMessage = 'API密钥权限不足'
          break
        case 404:
          errorMessage = 'API端点不存在，请检查API地址'
          break
        case 429:
          errorMessage = 'API调用频率超限，请稍后重试'
          break
        case 500:
          errorMessage = 'AI服务内部错误'
          break
        case 502:
        case 503:
        case 504:
          errorMessage = 'AI服务暂时不可用'
          break
      }

      return {
        success: false,
        message: errorMessage,
        details: {
          responseTime,
          model: config.model === 'deepseek' ? 'deepseek-chat' : config.modelId || 'unknown'
        }
      }
    }

    // 解析成功响应
    const data = await response.json()
    const testResponse = data.choices?.[0]?.message?.content?.trim()
    const tokensUsed = data.usage?.total_tokens

    if (!testResponse) {
      return {
        success: false,
        message: '收到响应但内容为空，请检查模型配置',
        details: {
          responseTime,
          model: config.model === 'deepseek' ? 'deepseek-chat' : config.modelId || 'unknown'
        }
      }
    }

    return {
      success: true,
      message: `连接成功 (${responseTime}ms)`,
      details: {
        responseTime,
        model: config.model === 'deepseek' ? 'deepseek-chat' : config.modelId || 'unknown',
        tokensUsed,
        testResponse
      }
    }

  } catch (error) {
    const responseTime = Date.now() - startTime
    let errorMessage = '连接失败'

    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = '连接超时 (30秒)，请检查网络或API服务状态'
    } else if (error.message.includes('fetch failed')) {
      errorMessage = '网络连接失败，请检查API地址和网络连接'
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'DNS解析失败，请检查API地址是否正确'
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = '连接被拒绝，请检查API服务是否正常运行'
    } else {
      errorMessage = `连接错误: ${error.message}`
    }

    console.error(`${config.model} API连接测试失败:`, error)

    return {
      success: false,
      message: errorMessage,
      details: {
        responseTime,
        model: config.model === 'deepseek' ? 'deepseek-chat' : config.modelId || 'unknown'
      }
    }
  }
}
