/**
 * 安全性与性能测试脚本
 * 验证系统安全性和性能基准达标
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// 测试配置
const TEST_CONFIG = {
  performanceThresholds: {
    apiResponseTime: 500,    // API响应时间阈值 (ms)
    pageLoadTime: 3000,      // 页面加载时间阈值 (ms)
    concurrentUsers: 10      // 并发用户数
  },
  securityTests: {
    sqlInjectionPayloads: [
      "'; DROP TABLE news; --",
      "' OR '1'='1",
      "'; SELECT * FROM users; --",
      "' UNION SELECT * FROM admin_users --",
      "1' AND (SELECT COUNT(*) FROM information_schema.tables)>0 --"
    ],
    xssPayloads: [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '"><script>alert(document.cookie)</script>'
    ],
    pathTraversalPayloads: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ]
  }
}

// 测试结果收集器
class SecurityPerformanceResults {
  constructor() {
    this.results = []
    this.passed = 0
    this.failed = 0
    this.startTime = Date.now()
    this.performanceMetrics = {}
  }

  addResult(testName, passed, message = '', metrics = null) {
    const result = {
      testName,
      passed,
      message,
      metrics,
      timestamp: new Date().toISOString()
    }
    
    this.results.push(result)
    
    if (passed) {
      this.passed++
      console.log(`✅ ${testName}`)
    } else {
      this.failed++
      console.log(`❌ ${testName}: ${message}`)
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime
    const total = this.passed + this.failed
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(2) : 0

    return {
      summary: {
        total,
        passed: this.passed,
        failed: this.failed,
        passRate: `${passRate}%`,
        totalTime: `${totalTime}ms`
      },
      performanceMetrics: this.performanceMetrics,
      details: this.results
    }
  }
}

// 安全性与性能测试器
class SecurityPerformanceTester {
  constructor() {
    this.results = new SecurityPerformanceResults()
  }

  // 执行HTTP请求并测量性能
  async makeRequest(url, options = {}) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options
      })
      
      const responseTime = Date.now() - startTime
      const data = await response.text()
      
      return {
        status: response.status,
        data,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        success: true
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        status: 0,
        error: error.message,
        responseTime,
        success: false
      }
    }
  }

  // SQL注入测试
  async testSQLInjection() {
    console.log('\n🛡️ 测试SQL注入防护...')

    for (const payload of TEST_CONFIG.securityTests.sqlInjectionPayloads) {
      // 测试搜索参数
      const searchUrl = `${BASE_URL}/api/news?search=${encodeURIComponent(payload)}`
      const response = await this.makeRequest(searchUrl)
      
      const isSafe = response.status !== 500 && 
                    !response.data.includes('SQL') && 
                    !response.data.includes('mysql') && 
                    !response.data.includes('database') &&
                    !response.data.includes('syntax error')
      
      this.results.addResult(
        `SQL注入防护 - 搜索参数`,
        isSafe,
        isSafe ? '防护正常' : `可能存在SQL注入漏洞: ${payload}`,
        { payload, status: response.status, responseTime: response.responseTime }
      )

      // 测试分类参数
      const categoryUrl = `${BASE_URL}/api/news?category=${encodeURIComponent(payload)}`
      const categoryResponse = await this.makeRequest(categoryUrl)
      
      const categoryIsSafe = categoryResponse.status !== 500 && 
                            !categoryResponse.data.includes('SQL') && 
                            !categoryResponse.data.includes('mysql')
      
      this.results.addResult(
        `SQL注入防护 - 分类参数`,
        categoryIsSafe,
        categoryIsSafe ? '防护正常' : `可能存在SQL注入漏洞: ${payload}`,
        { payload, status: categoryResponse.status, responseTime: categoryResponse.responseTime }
      )
    }
  }

  // XSS攻击测试
  async testXSSProtection() {
    console.log('\n🛡️ 测试XSS防护...')

    for (const payload of TEST_CONFIG.securityTests.xssPayloads) {
      // 测试搜索参数中的XSS
      const searchUrl = `${BASE_URL}/api/news?search=${encodeURIComponent(payload)}`
      const response = await this.makeRequest(searchUrl)
      
      const isSafe = !response.data.includes('<script>') && 
                    !response.data.includes('javascript:') && 
                    !response.data.includes('onerror=') &&
                    !response.data.includes('onload=')
      
      this.results.addResult(
        `XSS防护 - 搜索参数`,
        isSafe,
        isSafe ? '防护正常' : `可能存在XSS漏洞: ${payload}`,
        { payload, status: response.status, responseTime: response.responseTime }
      )

      // 测试页面渲染中的XSS
      const pageUrl = `${BASE_URL}/news?search=${encodeURIComponent(payload)}`
      const pageResponse = await this.makeRequest(pageUrl)
      
      const pageIsSafe = !pageResponse.data.includes(payload) || 
                        pageResponse.data.includes('&lt;script&gt;') || 
                        pageResponse.data.includes('&amp;lt;script&amp;gt;')
      
      this.results.addResult(
        `XSS防护 - 页面渲染`,
        pageIsSafe,
        pageIsSafe ? '防护正常' : `可能存在XSS漏洞: ${payload}`,
        { payload, status: pageResponse.status, responseTime: pageResponse.responseTime }
      )
    }
  }

  // 路径遍历测试
  async testPathTraversal() {
    console.log('\n🛡️ 测试路径遍历防护...')

    for (const payload of TEST_CONFIG.securityTests.pathTraversalPayloads) {
      // 测试文件访问
      const fileUrl = `${BASE_URL}/api/news/${payload}`
      const response = await this.makeRequest(fileUrl)
      
      const isSafe = response.status !== 200 || 
                    (!response.data.includes('root:') && 
                     !response.data.includes('[boot loader]') &&
                     !response.data.includes('# hosts file'))
      
      this.results.addResult(
        `路径遍历防护`,
        isSafe,
        isSafe ? '防护正常' : `可能存在路径遍历漏洞: ${payload}`,
        { payload, status: response.status, responseTime: response.responseTime }
      )
    }
  }

  // 认证授权测试
  async testAuthenticationAuthorization() {
    console.log('\n🔐 测试认证授权...')

    // 测试未认证访问管理员API
    const adminApiUrl = `${BASE_URL}/api/admin/news`
    const unauthResponse = await this.makeRequest(adminApiUrl)
    
    this.results.addResult(
      '管理员API未认证访问控制',
      unauthResponse.status === 401,
      unauthResponse.status === 401 ? '正确拒绝未认证访问' : `状态码: ${unauthResponse.status}`,
      { expectedStatus: 401, actualStatus: unauthResponse.status }
    )

    // 测试无效token访问
    const invalidTokenResponse = await this.makeRequest(adminApiUrl, {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
        'Cookie': 'admin_token=invalid-token-12345'
      }
    })
    
    this.results.addResult(
      '无效token访问控制',
      invalidTokenResponse.status === 401,
      invalidTokenResponse.status === 401 ? '正确拒绝无效token' : `状态码: ${invalidTokenResponse.status}`,
      { expectedStatus: 401, actualStatus: invalidTokenResponse.status }
    )

    // 测试管理员页面访问控制
    const adminPageUrl = `${BASE_URL}/admin/news`
    const adminPageResponse = await this.makeRequest(adminPageUrl)
    
    // 管理员页面应该返回200（显示登录表单）或302（重定向到登录）
    this.results.addResult(
      '管理员页面访问控制',
      adminPageResponse.status === 200 || adminPageResponse.status === 302,
      `状态码: ${adminPageResponse.status}`,
      { status: adminPageResponse.status }
    )
  }

  // API性能测试
  async testAPIPerformance() {
    console.log('\n⚡ 测试API性能...')

    const apiEndpoints = [
      { url: '/api/news', name: '新闻列表API', threshold: TEST_CONFIG.performanceThresholds.apiResponseTime },
      { url: '/api/news?limit=50', name: '大量数据API', threshold: TEST_CONFIG.performanceThresholds.apiResponseTime * 2 },
      { url: '/api/news?search=服装', name: '搜索API', threshold: TEST_CONFIG.performanceThresholds.apiResponseTime },
      { url: '/api/news?category=business', name: '分类API', threshold: TEST_CONFIG.performanceThresholds.apiResponseTime }
    ]

    for (const endpoint of apiEndpoints) {
      const response = await this.makeRequest(`${BASE_URL}${endpoint.url}`)
      
      this.results.addResult(
        `${endpoint.name}响应时间`,
        response.responseTime < endpoint.threshold,
        `${response.responseTime}ms (阈值: ${endpoint.threshold}ms)`,
        { responseTime: response.responseTime, threshold: endpoint.threshold }
      )

      // 记录性能指标
      if (!this.results.performanceMetrics.apiResponseTimes) {
        this.results.performanceMetrics.apiResponseTimes = {}
      }
      this.results.performanceMetrics.apiResponseTimes[endpoint.name] = response.responseTime
    }
  }

  // 页面加载性能测试
  async testPageLoadPerformance() {
    console.log('\n⚡ 测试页面加载性能...')

    const pages = [
      { url: '/', name: '首页', threshold: TEST_CONFIG.performanceThresholds.pageLoadTime },
      { url: '/news', name: '新闻列表页', threshold: TEST_CONFIG.performanceThresholds.pageLoadTime },
      { url: '/admin/login', name: '管理员登录页', threshold: TEST_CONFIG.performanceThresholds.pageLoadTime }
    ]

    for (const page of pages) {
      const response = await this.makeRequest(`${BASE_URL}${page.url}`)
      
      this.results.addResult(
        `${page.name}加载时间`,
        response.responseTime < page.threshold,
        `${response.responseTime}ms (阈值: ${page.threshold}ms)`,
        { responseTime: response.responseTime, threshold: page.threshold }
      )

      // 记录性能指标
      if (!this.results.performanceMetrics.pageLoadTimes) {
        this.results.performanceMetrics.pageLoadTimes = {}
      }
      this.results.performanceMetrics.pageLoadTimes[page.name] = response.responseTime
    }
  }

  // 并发性能测试
  async testConcurrentPerformance() {
    console.log('\n⚡ 测试并发性能...')

    const concurrentRequests = TEST_CONFIG.performanceThresholds.concurrentUsers
    const testUrl = `${BASE_URL}/api/news`

    console.log(`发起${concurrentRequests}个并发请求...`)
    
    const startTime = Date.now()
    const promises = []
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(this.makeRequest(testUrl))
    }

    try {
      const results = await Promise.all(promises)
      const totalTime = Date.now() - startTime
      
      const successfulRequests = results.filter(r => r.success && r.status === 200).length
      const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      const maxResponseTime = Math.max(...results.map(r => r.responseTime))

      this.results.addResult(
        '并发请求成功率',
        successfulRequests === concurrentRequests,
        `${successfulRequests}/${concurrentRequests} 个请求成功`,
        { successfulRequests, totalRequests: concurrentRequests, successRate: (successfulRequests / concurrentRequests * 100).toFixed(2) + '%' }
      )

      this.results.addResult(
        '并发请求平均响应时间',
        averageResponseTime < TEST_CONFIG.performanceThresholds.apiResponseTime * 2,
        `平均: ${averageResponseTime.toFixed(2)}ms, 最大: ${maxResponseTime}ms`,
        { averageResponseTime, maxResponseTime, threshold: TEST_CONFIG.performanceThresholds.apiResponseTime * 2 }
      )

      // 记录并发性能指标
      this.results.performanceMetrics.concurrentPerformance = {
        concurrentUsers: concurrentRequests,
        totalTime,
        successfulRequests,
        averageResponseTime,
        maxResponseTime
      }

    } catch (error) {
      this.results.addResult(
        '并发请求测试',
        false,
        `并发测试失败: ${error.message}`
      )
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始安全性与性能测试...')
    console.log(`📍 测试服务器: ${BASE_URL}`)

    await this.testSQLInjection()
    await this.testXSSProtection()
    await this.testPathTraversal()
    await this.testAuthenticationAuthorization()
    await this.testAPIPerformance()
    await this.testPageLoadPerformance()
    await this.testConcurrentPerformance()

    return this.generateReport()
  }

  // 生成测试报告
  generateReport() {
    const report = this.results.generateReport()
    
    console.log('\n📊 安全性与性能测试报告')
    console.log('=' * 50)
    console.log(`总测试数: ${report.summary.total}`)
    console.log(`通过: ${report.summary.passed}`)
    console.log(`失败: ${report.summary.failed}`)
    console.log(`通过率: ${report.summary.passRate}`)
    console.log(`总耗时: ${report.summary.totalTime}`)
    
    // 显示性能指标
    if (report.performanceMetrics.apiResponseTimes) {
      console.log('\n⚡ API性能指标:')
      Object.entries(report.performanceMetrics.apiResponseTimes).forEach(([name, time]) => {
        console.log(`- ${name}: ${time}ms`)
      })
    }

    if (report.performanceMetrics.pageLoadTimes) {
      console.log('\n📄 页面加载性能:')
      Object.entries(report.performanceMetrics.pageLoadTimes).forEach(([name, time]) => {
        console.log(`- ${name}: ${time}ms`)
      })
    }

    if (report.performanceMetrics.concurrentPerformance) {
      const perf = report.performanceMetrics.concurrentPerformance
      console.log('\n🔄 并发性能指标:')
      console.log(`- 并发用户数: ${perf.concurrentUsers}`)
      console.log(`- 成功请求数: ${perf.successfulRequests}`)
      console.log(`- 平均响应时间: ${perf.averageResponseTime.toFixed(2)}ms`)
      console.log(`- 最大响应时间: ${perf.maxResponseTime}ms`)
    }
    
    if (report.summary.failed > 0) {
      console.log('\n❌ 失败的测试:')
      report.details
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.testName}: ${r.message}`))
    }
    
    return report
  }
}

// 主函数
async function main() {
  const tester = new SecurityPerformanceTester()
  
  try {
    const report = await tester.runAllTests()
    
    // 保存测试报告
    const fs = require('fs')
    const path = require('path')
    
    const reportDir = path.join(process.cwd(), 'test-results')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(reportDir, 'security-performance-report.json'),
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n📄 测试报告已保存到: test-results/security-performance-report.json')
    
    // 根据测试结果设置退出码
    process.exit(report.summary.failed > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { SecurityPerformanceTester, TEST_CONFIG }
