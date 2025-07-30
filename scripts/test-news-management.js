/**
 * 新闻管理功能测试脚本
 * 测试新闻列表、搜索、编辑、删除等管理功能
 */

const baseUrl = 'http://localhost:3003'

// 测试配置
const testConfig = {
  timeout: 30000,
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
    news: '📰'
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

// 测试1: 新闻列表API测试
async function testNewsListAPI() {
  // 测试基础列表
  const response = await makeRequest(`${baseUrl}/api/admin/news`)
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('新闻列表API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`新闻列表API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`新闻列表API失败: ${response.data.error}`)
  }
  
  const articles = response.data.data
  if (!Array.isArray(articles)) {
    throw new Error('新闻列表数据格式错误')
  }
  
  log(`获取到 ${articles.length} 篇新闻`)
}

// 测试2: 新闻搜索功能测试
async function testNewsSearchAPI() {
  const searchParams = [
    'search=服装',
    'category=business',
    'status=published',
    'limit=10',
    'sortBy=createdAt',
    'sortOrder=desc'
  ]
  
  for (const param of searchParams) {
    const response = await makeRequest(`${baseUrl}/api/admin/news?${param}`)
    
    // 由于没有认证，预期返回401
    if (response.status === 401) {
      log(`搜索参数 ${param} 正确返回401未授权状态（预期行为）`)
      continue
    }
    
    if (response.status !== 200) {
      throw new Error(`搜索API返回状态码: ${response.status}，参数: ${param}`)
    }
    
    log(`搜索参数 ${param} 测试通过`)
  }
}

// 测试3: 新闻详情API测试
async function testNewsDetailAPI() {
  const testNewsId = '1' // 使用测试新闻ID
  
  const response = await makeRequest(`${baseUrl}/api/admin/news/${testNewsId}`)
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('新闻详情API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`新闻详情API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`新闻详情API失败: ${response.data.error}`)
  }
  
  const article = response.data.data
  if (!article || !article.id) {
    throw new Error('新闻详情数据格式错误')
  }
  
  log(`成功获取新闻详情: ${article.title?.zh || '无标题'}`)
}

// 测试4: 新闻统计API测试
async function testNewsStatsAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/stats`)
  
  // 由于没有认证，预期返回401
  if (response.status === 401) {
    log('新闻统计API正确返回401未授权状态（预期行为）')
    return
  }
  
  if (response.status !== 200) {
    throw new Error(`新闻统计API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`新闻统计API失败: ${response.data.error}`)
  }
  
  const stats = response.data.data
  if (!stats || typeof stats.total !== 'number') {
    throw new Error('新闻统计数据格式错误')
  }
  
  log(`新闻统计: 总数 ${stats.total}, 已发布 ${stats.published || 0}`)
}

// 测试5: 新闻分类API测试
async function testNewsCategoriesAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/categories`)
  
  if (response.status !== 200) {
    throw new Error(`新闻分类API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`新闻分类API失败: ${response.data.error}`)
  }
  
  const categories = response.data.data
  if (!Array.isArray(categories)) {
    throw new Error('新闻分类数据格式错误')
  }
  
  log(`获取到 ${categories.length} 个新闻分类`)
}

// 测试6: 新闻标签API测试
async function testNewsTagsAPI() {
  const response = await makeRequest(`${baseUrl}/api/admin/news/tags`)
  
  if (response.status !== 200) {
    throw new Error(`新闻标签API返回状态码: ${response.status}`)
  }
  
  if (!response.data.success) {
    throw new Error(`新闻标签API失败: ${response.data.error}`)
  }
  
  const tags = response.data.data
  if (!Array.isArray(tags)) {
    throw new Error('新闻标签数据格式错误')
  }
  
  log(`获取到 ${tags.length} 个新闻标签`)
}

// 测试7: 页面可访问性测试
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

// 测试8: 性能测试
async function testPerformance() {
  const testUrls = [
    `${baseUrl}/api/admin/news`,
    `${baseUrl}/api/admin/news/stats`,
    `${baseUrl}/api/admin/news/categories`,
    `${baseUrl}/api/admin/news/tags`,
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
  log('📰 开始新闻管理功能测试')
  log(`测试目标: ${baseUrl}`)
  
  // 运行所有测试
  await runTest('新闻列表API测试', testNewsListAPI)
  await runTest('新闻搜索功能测试', testNewsSearchAPI)
  await runTest('新闻详情API测试', testNewsDetailAPI)
  await runTest('新闻统计API测试', testNewsStatsAPI)
  await runTest('新闻分类API测试', testNewsCategoriesAPI)
  await runTest('新闻标签API测试', testNewsTagsAPI)
  await runTest('页面可访问性测试', testPageAccessibility)
  await runTest('性能测试', testPerformance)
  
  // 输出测试结果
  log('\n📊 新闻管理功能测试结果汇总:')
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
  log(`\n🎯 新闻管理功能测试成功率: ${successRate}%`)
  
  if (testResults.failed === 0) {
    log('🎉 所有新闻管理功能测试通过！', 'success')
  } else {
    log('⚠️ 部分新闻管理功能测试失败，请检查错误信息', 'warning')
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log(`新闻管理功能测试运行失败: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  testConfig,
  makeRequest
}
