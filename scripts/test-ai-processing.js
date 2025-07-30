/**
 * AI处理功能测试脚本
 * 测试AI润色、翻译、质量评估等功能
 */

const baseUrl = 'http://localhost:3003'

// 测试配置
const testConfig = {
  timeout: 30000,
  aiProcessTimeout: 60000, // AI处理超时时间
}

// 测试结果记录
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
}

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    ai: '🤖'
  }[type] || '📝'
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

// HTTP请求工具
async function makeRequest(url, options = {}) {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      timeout: testConfig.timeout,
      ...options
    })
    
    const responseTime = Date.now() - startTime
    const data = await response.json().catch(() => ({}))
    
    return {
      status: response.status,
      data,
      responseTime,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 0,
      error: error.message,
      responseTime
    }
  }
}

// 测试函数包装器
async function runTest(testName, testFn) {
  testResults.total++
  log(`开始测试: ${testName}`)
  
  try {
    await testFn()
    testResults.passed++
    log(`测试通过: ${testName}`, 'success')
  } catch (error) {
    testResults.failed++
    testResults.errors.push({ test: testName, error: error.message })
    log(`测试失败: ${testName} - ${error.message}`, 'error')
  }
}

// 测试1: AI配置API测试
async function testAIConfigAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/ai-config`)
  
  if (response.status !== 200) {
    throw new Error(`AI配置API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error('AI配置API返回失败状态')
  }
  
  const configs = response.data.data
  if (!Array.isArray(configs)) {
    throw new Error('AI配置数据格式错误')
  }
  
  log(`获取到 ${configs.length} 个AI配置`)
}

// 测试2: AI连接测试
async function testAIConnection() {
  const models = ['deepseek', 'doubao']
  
  for (const model of models) {
    const response = await makeRequest(`${baseUrl}/api/admin/ai-config/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model })
    })
    
    if (response.status !== 200) {
      log(`${model} 连接测试返回状态码: ${response.status}`, 'warning')
      continue
    }
    
    const result = response.data
    if (result.success) {
      log(`${model} 连接测试成功，响应时间: ${result.details?.responseTime}ms`, 'ai')
    } else {
      log(`${model} 连接测试失败: ${result.message}`, 'warning')
    }
  }
}

// 测试3: AI润色API测试
async function testAIPolishAPI() {
  const testData = {
    title: '测试新闻标题',
    content: '这是一篇测试新闻的内容，用于验证AI润色功能是否正常工作。',
    summary: '测试新闻摘要',
    aiModel: 'deepseek',
    targetLanguages: ['zh', 'en']
  }
  
  const response = await makeRequest(`${baseUrl}/api/admin/news/ai-polish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  })
  
  if (response.status !== 200) {
    throw new Error(`AI润色API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`AI润色失败: ${response.data.error}`)
  }
  
  const result = response.data.data
  if (!result.title || !result.content || !result.summary) {
    throw new Error('AI润色结果数据不完整')
  }
  
  log(`AI润色成功，处理语言: ${result.targetLanguages.join(', ')}`, 'ai')
}

// 测试4: 翻译API测试
async function testTranslationAPI() {
  // 获取支持的翻译语言
  const langResponse = await makeRequest(`${baseUrl}/api/admin/news/translate`)
  
  if (langResponse.status !== 200) {
    throw new Error(`获取翻译语言API返回状态码: ${langResponse.status}`)
  }
  
  const languages = langResponse.data.data?.supportedLanguages
  if (!languages || languages.length === 0) {
    throw new Error('没有获取到支持的翻译语言')
  }
  
  log(`支持 ${languages.length} 种翻译语言`)
  
  // 测试翻译功能
  const translateData = {
    newsId: 'test_news_1',
    fromLanguage: 'zh',
    toLanguage: 'en',
    content: {
      title: '测试标题',
      content: '测试内容',
      summary: '测试摘要'
    }
  }
  
  const translateResponse = await makeRequest(`${baseUrl}/api/admin/news/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(translateData)
  })
  
  if (translateResponse.status !== 200) {
    throw new Error(`翻译API返回状态码: ${translateResponse.status}`)
  }
  
  if (!translateResponse.data.success) {
    throw new Error(`翻译失败: ${translateResponse.data.error}`)
  }
  
  log('翻译功能测试成功', 'ai')
}

// 测试5: AI处理状态API测试
async function testAIProcessStatusAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/ai-process`)
  
  if (response.status !== 200) {
    throw new Error(`AI处理状态API返回状态码: ${response.status}`)
  }
  
  if (!response.data.message) {
    throw new Error('AI处理状态API响应格式错误')
  }
  
  const data = response.data.data
  if (!data.availableProviders || !data.providerStatus) {
    throw new Error('AI处理状态数据不完整')
  }
  
  log(`可用AI提供商: ${data.availableProviders.length} 个`)
}

// 测试6: 多语言新闻API测试
async function testMultilingualNewsAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/multilingual`)
  
  if (response.status !== 200) {
    throw new Error(`多语言新闻API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`多语言新闻API失败: ${response.data.error}`)
  }
  
  const articles = response.data.data
  if (!Array.isArray(articles)) {
    throw new Error('多语言新闻数据格式错误')
  }
  
  log(`获取到 ${articles.length} 篇多语言新闻`)
}

// 测试7: AI配置管理测试
async function testAIConfigManagement() {
  // 测试更新AI配置
  const updateData = {
    model: 'deepseek',
    enabled: true,
    maxTokens: 4000,
    temperature: 0.7
  }
  
  const response = await makeRequest(`${baseUrl}/api/admin/ai-config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  })
  
  if (response.status !== 200) {
    throw new Error(`更新AI配置返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`更新AI配置失败: ${response.data.message}`)
  }
  
  log('AI配置管理测试成功')
}

// 测试8: 性能测试
async function testAIPerformance() {
  const testUrls = [
    `${baseUrl}/api/admin/ai-config`,
    `${baseUrl}/api/admin/news/ai-process`,
    `${baseUrl}/api/admin/news/multilingual`,
    `${baseUrl}/api/admin/news/translate`
  ]
  
  for (const url of testUrls) {
    const response = await makeRequest(url)
    
    if (response.responseTime > 10000) {
      log(`警告: ${url} 响应时间过长: ${response.responseTime}ms`, 'warning')
    } else {
      log(`${url} 响应时间: ${response.responseTime}ms`)
    }
  }
}

// 主测试函数
async function runAllTests() {
  log('🤖 开始AI处理功能测试')
  log(`测试目标: ${baseUrl}`)
  
  // 运行所有测试
  await runTest('AI配置API测试', testAIConfigAPI)
  await runTest('AI连接测试', testAIConnection)
  await runTest('AI润色API测试', testAIPolishAPI)
  await runTest('翻译API测试', testTranslationAPI)
  await runTest('AI处理状态API测试', testAIProcessStatusAPI)
  await runTest('多语言新闻API测试', testMultilingualNewsAPI)
  await runTest('AI配置管理测试', testAIConfigManagement)
  await runTest('AI性能测试', testAIPerformance)
  
  // 输出测试结果
  log('\n📊 AI功能测试结果汇总:')
  log(`总测试数: ${testResults.total}`)
  log(`通过: ${testResults.passed}`, 'success')
  log(`失败: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success')
  
  if (testResults.errors.length > 0) {
    log('\n❌ 失败的测试:')
    testResults.errors.forEach(({ test, error }) => {
      log(`  - ${test}: ${error}`, 'error')
    })
  }
  
  const successRate = (testResults.passed / testResults.total * 100).toFixed(1)
  log(`\n🎯 AI功能测试成功率: ${successRate}%`)
  
  if (testResults.failed === 0) {
    log('🎉 所有AI功能测试通过！', 'success')
  } else {
    log('⚠️ 部分AI功能测试失败，请检查错误信息', 'warning')
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log(`AI功能测试运行失败: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  testConfig,
  makeRequest
}
