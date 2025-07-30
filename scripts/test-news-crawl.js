/**
 * 新闻采集功能测试脚本
 * 测试新闻采集的完整流程
 */

const baseUrl = 'http://localhost:3003'

// 测试配置
const testConfig = {
  timeout: 30000,
  maxRetries: 3,
  crawlTimeout: 120000, // 2分钟采集超时
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
    warning: '⚠️'
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

// 测试函数
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

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 测试1: 检查采集进度API
async function testCrawlProgressAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/crawl/progress`)
  
  if (response.status !== 200) {
    throw new Error(`采集进度API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error('采集进度API返回失败状态')
  }
  
  const progress = response.data.progress
  if (!progress || typeof progress.status !== 'string') {
    throw new Error('采集进度数据格式错误')
  }
  
  log(`当前采集状态: ${progress.status}`)
}

// 测试2: 检查WebSocket API
async function testWebSocketAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/crawl/ws`)
  
  if (response.status !== 200) {
    throw new Error(`WebSocket API返回状态码: ${response.status}`)
  }
  
  log('WebSocket API响应正常')
}

// 测试3: 模拟启动采集
async function testStartCrawl() {
  // 注意：这里只测试API响应，不实际启动采集
  const crawlConfig = {
    sources: ['1', '2'], // 测试前两个源
    aiProcess: false,    // 不启用AI处理以加快测试
    languages: ['zh'],   // 只处理中文
    maxArticles: 5       // 限制文章数量
  }
  
  const response = await makeRequest(`${baseUrl}/api/admin/news/crawl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(crawlConfig)
  })
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('采集API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`采集API返回意外状态码: ${response.status}`)
  }
}

// 测试4: 检查新闻列表API
async function testNewsListAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news`)
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('新闻列表API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`新闻列表API返回状态码: ${response.status}`)
  }
}

// 测试5: 检查AI处理API
async function testAIProcessAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/polish`)
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('AI处理API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`AI处理API返回状态码: ${response.status}`)
  }
}

// 测试6: 页面可访问性测试
async function testPageAccessibility() {
  const pages = [
    '/admin/news',
    '/admin/news/sources', 
    '/admin/news/collect',
    '/admin/news/polish'
  ]
  
  for (const page of pages) {
    const response = await makeRequest(`${baseUrl}${page}`)
    
    if (response.status !== 200) {
      throw new Error(`页面 ${page} 返回状态码: ${response.status}`)
    }
    
    log(`页面 ${page} 访问正常`)
  }
}

// 测试7: 性能测试
async function testPerformance() {
  const testUrls = [
    `${baseUrl}/api/admin/news/crawl/progress`,
    `${baseUrl}/api/admin/news/crawl/ws`,
    `${baseUrl}/admin/news`
  ]
  
  for (const url of testUrls) {
    const response = await makeRequest(url)
    
    if (response.responseTime > 5000) {
      log(`警告: ${url} 响应时间过长: ${response.responseTime}ms`, 'warning')
    } else {
      log(`${url} 响应时间: ${response.responseTime}ms`)
    }
  }
}

// 主测试函数
async function runAllTests() {
  log('🚀 开始新闻模块采集功能测试')
  log(`测试目标: ${baseUrl}`)
  
  // 运行所有测试
  await runTest('采集进度API测试', testCrawlProgressAPI)
  await runTest('WebSocket API测试', testWebSocketAPI)
  await runTest('启动采集API测试', testStartCrawl)
  await runTest('新闻列表API测试', testNewsListAPI)
  await runTest('AI处理API测试', testAIProcessAPI)
  await runTest('页面可访问性测试', testPageAccessibility)
  await runTest('性能测试', testPerformance)
  
  // 输出测试结果
  log('\n📊 测试结果汇总:')
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
  log(`\n🎯 测试成功率: ${successRate}%`)
  
  if (testResults.failed === 0) {
    log('🎉 所有测试通过！', 'success')
  } else {
    log('⚠️ 部分测试失败，请检查错误信息', 'warning')
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log(`测试运行失败: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  testConfig,
  makeRequest
}
