/**
 * 带认证的新闻采集测试脚本
 * 模拟完整的登录和采集流程
 */

const baseUrl = 'http://localhost:3003'

// 测试配置
const testConfig = {
  timeout: 30000,
  crawlTimeout: 180000, // 3分钟采集超时
  pollInterval: 2000,   // 2秒轮询间隔
}

// 全局变量
let authToken = null
let testResults = {
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
    progress: '🔄'
  }[type] || '📝'
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

// HTTP请求工具
async function makeRequest(url, options = {}) {
  const startTime = Date.now()
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // 添加认证token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    
    const response = await fetch(url, {
      timeout: testConfig.timeout,
      ...options,
      headers
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

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 测试1: 管理员登录
async function testAdminLogin() {
  const loginData = {
    username: 'admin',
    password: 'Admin123!'
  }
  
  const response = await makeRequest(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    body: JSON.stringify(loginData)
  })
  
  if (response.status !== 200) {
    throw new Error(`登录失败，状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`登录失败: ${response.data.error || '未知错误'}`)
  }
  
  // 保存认证token
  authToken = response.data.token
  log('管理员登录成功，获取到认证token')
}

// 测试2: 获取RSS源列表
async function testGetRSSSources() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/sources`)
  
  if (response.status !== 200) {
    throw new Error(`获取RSS源失败，状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`获取RSS源失败: ${response.data.error}`)
  }
  
  const sources = response.data.data
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('RSS源列表为空')
  }
  
  log(`成功获取 ${sources.length} 个RSS源`)
  return sources
}

// 测试3: 启动小规模采集测试
async function testStartSmallCrawl() {
  // 获取前3个活跃的RSS源
  const sources = await testGetRSSSources()
  const activeSources = sources.filter(s => s.isActive).slice(0, 3)
  
  if (activeSources.length === 0) {
    throw new Error('没有可用的活跃RSS源')
  }
  
  const crawlConfig = {
    sources: activeSources.map(s => s.id),
    aiProcess: false,        // 不启用AI处理以加快测试
    languages: ['zh'],       // 只处理中文
    maxArticles: 3,          // 每个源最多3篇文章
    testMode: true           // 测试模式
  }
  
  log(`准备启动采集测试，源数量: ${activeSources.length}`)
  
  const response = await makeRequest(`${baseUrl}/api/admin/news/crawl`, {
    method: 'POST',
    body: JSON.stringify(crawlConfig)
  })
  
  if (response.status !== 200) {
    throw new Error(`启动采集失败，状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`启动采集失败: ${response.data.error}`)
  }
  
  log('采集任务启动成功')
  return response.data
}

// 测试4: 监控采集进度
async function testMonitorCrawlProgress() {
  log('开始监控采集进度...', 'progress')
  
  const startTime = Date.now()
  let lastStatus = ''
  
  while (Date.now() - startTime < testConfig.crawlTimeout) {
    const response = await makeRequest(`${baseUrl}/api/admin/news/crawl/progress`)
    
    if (response.status !== 200) {
      throw new Error(`获取采集进度失败，状态码: ${response.status}`)
    }
    
    const progress = response.data.progress
    
    if (progress.status !== lastStatus) {
      log(`采集状态变更: ${lastStatus} -> ${progress.status}`, 'progress')
      lastStatus = progress.status
    }
    
    // 显示详细进度
    if (progress.status === 'crawling' || progress.status === 'processing') {
      log(`进度: ${progress.completedSources}/${progress.totalSources} 源, ` +
          `${progress.articlesFound} 篇文章发现, ${progress.articlesProcessed} 篇已处理`, 'progress')
    }
    
    // 检查是否完成
    if (progress.status === 'completed') {
      log(`采集完成！总共处理 ${progress.articlesProcessed} 篇文章`, 'success')
      return progress
    }
    
    // 检查是否失败
    if (progress.status === 'failed') {
      throw new Error(`采集失败: ${progress.error}`)
    }
    
    // 等待下次轮询
    await sleep(testConfig.pollInterval)
  }
  
  throw new Error('采集超时')
}

// 测试5: 验证采集结果
async function testVerifyCrawlResults() {
  const response = await makeRequest(`${baseUrl}/api/admin/news?limit=10&sortBy=createdAt&sortOrder=desc`)
  
  if (response.status !== 200) {
    throw new Error(`获取新闻列表失败，状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`获取新闻列表失败: ${response.data.error}`)
  }
  
  const articles = response.data.data
  if (!Array.isArray(articles)) {
    throw new Error('新闻列表格式错误')
  }
  
  // 检查是否有新采集的文章（最近5分钟内）
  const recentArticles = articles.filter(article => {
    const createdAt = new Date(article.createdAt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return createdAt > fiveMinutesAgo
  })
  
  if (recentArticles.length === 0) {
    log('警告: 没有发现最近采集的文章', 'warning')
  } else {
    log(`发现 ${recentArticles.length} 篇最近采集的文章`, 'success')
  }
  
  log(`当前新闻总数: ${articles.length}`)
}

// 主测试函数
async function runAllTests() {
  log('🚀 开始新闻模块完整采集测试')
  log(`测试目标: ${baseUrl}`)
  
  try {
    // 运行所有测试
    await runTest('管理员登录测试', testAdminLogin)
    await runTest('获取RSS源列表测试', testGetRSSSources)
    await runTest('启动小规模采集测试', testStartSmallCrawl)
    await runTest('监控采集进度测试', testMonitorCrawlProgress)
    await runTest('验证采集结果测试', testVerifyCrawlResults)
    
  } catch (error) {
    log(`测试执行出错: ${error.message}`, 'error')
  }
  
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
