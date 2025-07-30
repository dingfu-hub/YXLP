/**
 * API接口验证脚本
 * 使用原生fetch API进行接口测试，无需额外依赖
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// 测试配置
const TEST_CONFIG = {
  timeout: 5000,
  maxResponseTime: 2000,
  retries: 3
}

// 测试数据
const TEST_DATA = {
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  validArticle: {
    title: '测试新闻标题',
    content: '这是一篇测试新闻的内容',
    summary: '测试新闻摘要',
    category: 'business',
    status: 'draft',
    author: 'Test Author'
  }
}

// 测试结果收集器
class TestResults {
  constructor() {
    this.results = []
    this.passed = 0
    this.failed = 0
    this.startTime = Date.now()
  }

  addResult(testName, passed, message = '', responseTime = 0) {
    const result = {
      testName,
      passed,
      message,
      responseTime,
      timestamp: new Date().toISOString()
    }
    
    this.results.push(result)
    
    if (passed) {
      this.passed++
      console.log(`✅ ${testName} (${responseTime}ms)`)
    } else {
      this.failed++
      console.log(`❌ ${testName}: ${message}`)
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime
    const total = this.passed + this.failed
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(2) : 0

    const report = {
      summary: {
        total,
        passed: this.passed,
        failed: this.failed,
        passRate: `${passRate}%`,
        totalTime: `${totalTime}ms`
      },
      details: this.results
    }

    return report
  }
}

// HTTP请求工具
async function makeRequest(url, options = {}) {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      timeout: TEST_CONFIG.timeout,
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

// 获取管理员token
async function getAdminToken() {
  const response = await makeRequest(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(TEST_DATA.adminCredentials)
  })

  if (response.status === 200 && response.data.data?.token) {
    return response.data.data.token
  }
  
  throw new Error('无法获取管理员token')
}

// 测试套件
class APITestSuite {
  constructor() {
    this.results = new TestResults()
    this.adminToken = null
  }

  async setup() {
    console.log('🚀 开始API接口验证...')
    console.log(`📍 测试服务器: ${BASE_URL}`)
    
    try {
      this.adminToken = await getAdminToken()
      console.log('🔑 管理员认证成功')
    } catch (error) {
      console.log('⚠️ 管理员认证失败，将跳过需要认证的测试')
    }
  }

  // 创建认证请求头
  getAuthHeaders() {
    return this.adminToken ? {
      'Authorization': `Bearer ${this.adminToken}`,
      'Cookie': `admin_token=${this.adminToken}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  }

  // 测试公共新闻API
  async testPublicNewsAPI() {
    console.log('\n📰 测试公共新闻API...')

    // 测试获取新闻列表
    const listResponse = await makeRequest(`${BASE_URL}/api/news`)
    this.results.addResult(
      '获取公共新闻列表',
      listResponse.status === 200 && Array.isArray(listResponse.data?.data?.articles),
      listResponse.error || '状态码不正确或数据格式错误',
      listResponse.responseTime
    )

    // 测试分页
    const pageResponse = await makeRequest(`${BASE_URL}/api/news?page=1&limit=5`)
    this.results.addResult(
      '新闻列表分页功能',
      pageResponse.status === 200 && pageResponse.data?.data?.articles?.length <= 5,
      pageResponse.error || '分页功能异常',
      pageResponse.responseTime
    )

    // 测试分类过滤
    const categoryResponse = await makeRequest(`${BASE_URL}/api/news?category=business`)
    this.results.addResult(
      '新闻分类过滤',
      categoryResponse.status === 200,
      categoryResponse.error || '分类过滤功能异常',
      categoryResponse.responseTime
    )

    // 测试响应时间
    this.results.addResult(
      '公共API响应时间 < 1000ms',
      listResponse.responseTime < 1000,
      `响应时间: ${listResponse.responseTime}ms`,
      listResponse.responseTime
    )

    // 测试新闻详情（如果有文章的话）
    if (listResponse.data?.data?.articles?.length > 0) {
      const articleId = listResponse.data.data.articles[0].id
      const detailResponse = await makeRequest(`${BASE_URL}/api/news/${articleId}`)
      
      this.results.addResult(
        '获取新闻详情',
        detailResponse.status === 200 && detailResponse.data?.data?.id === articleId,
        detailResponse.error || '新闻详情获取失败',
        detailResponse.responseTime
      )

      // 验证源文章链接字段
      const hasSourceUrl = detailResponse.data?.data?.sourceUrl
      const hasSourceName = detailResponse.data?.data?.sourceName
      this.results.addResult(
        '新闻详情包含源文章信息',
        hasSourceUrl && hasSourceName,
        '缺少sourceUrl或sourceName字段',
        0
      )
    }
  }

  // 测试管理员新闻API
  async testAdminNewsAPI() {
    if (!this.adminToken) {
      console.log('\n⚠️ 跳过管理员API测试（无认证token）')
      return
    }

    console.log('\n🔐 测试管理员新闻API...')

    // 测试获取管理员新闻列表
    const listResponse = await makeRequest(`${BASE_URL}/api/admin/news`, {
      headers: this.getAuthHeaders()
    })
    
    this.results.addResult(
      '获取管理员新闻列表',
      listResponse.status === 200 && listResponse.data?.data?.articles,
      listResponse.error || '管理员新闻列表获取失败',
      listResponse.responseTime
    )

    // 测试语言参数
    const languageResponse = await makeRequest(`${BASE_URL}/api/admin/news?language=zh`, {
      headers: this.getAuthHeaders()
    })
    
    this.results.addResult(
      '语言切换功能',
      languageResponse.status === 200 && languageResponse.data?.data?.currentLanguage === 'zh',
      languageResponse.error || '语言切换功能异常',
      languageResponse.responseTime
    )

    // 测试搜索功能
    const searchResponse = await makeRequest(`${BASE_URL}/api/admin/news?search=测试`, {
      headers: this.getAuthHeaders()
    })
    
    this.results.addResult(
      '新闻搜索功能',
      searchResponse.status === 200,
      searchResponse.error || '搜索功能异常',
      searchResponse.responseTime
    )

    // 测试创建新闻
    const createResponse = await makeRequest(`${BASE_URL}/api/admin/news`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...TEST_DATA.validArticle,
        title: `API测试文章 ${Date.now()}`
      })
    })
    
    this.results.addResult(
      '创建新闻文章',
      createResponse.status === 201 && createResponse.data?.data?.id,
      createResponse.error || '新闻创建失败',
      createResponse.responseTime
    )

    // 测试未认证访问
    const unauthResponse = await makeRequest(`${BASE_URL}/api/admin/news`)
    this.results.addResult(
      '拒绝未认证访问',
      unauthResponse.status === 401,
      '应该拒绝未认证访问',
      unauthResponse.responseTime
    )
  }

  // 测试采集API
  async testCrawlAPI() {
    if (!this.adminToken) {
      console.log('\n⚠️ 跳过采集API测试（无认证token）')
      return
    }

    console.log('\n🕷️ 测试新闻采集API...')

    // 测试获取采集状态
    const statusResponse = await makeRequest(`${BASE_URL}/api/admin/news/crawl`, {
      headers: this.getAuthHeaders()
    })
    
    this.results.addResult(
      '获取采集状态',
      statusResponse.status === 200 && statusResponse.data?.data,
      statusResponse.error || '采集状态获取失败',
      statusResponse.responseTime
    )

    // 测试多语言采集状态
    const multilingualResponse = await makeRequest(`${BASE_URL}/api/admin/news/crawl/multilingual`, {
      headers: this.getAuthHeaders()
    })
    
    this.results.addResult(
      '多语言采集状态',
      multilingualResponse.status === 200,
      multilingualResponse.error || '多语言采集状态获取失败',
      multilingualResponse.responseTime
    )
  }

  // 测试安全性
  async testSecurity() {
    console.log('\n🔒 测试安全性...')

    // 测试SQL注入防护
    const sqlInjectionPayload = "'; DROP TABLE news; --"
    const sqlResponse = await makeRequest(
      `${BASE_URL}/api/news?search=${encodeURIComponent(sqlInjectionPayload)}`
    )
    
    this.results.addResult(
      'SQL注入防护',
      sqlResponse.status !== 500 && !sqlResponse.error?.includes('SQL'),
      '可能存在SQL注入漏洞',
      sqlResponse.responseTime
    )

    // 测试XSS防护
    const xssPayload = '<script>alert("xss")</script>'
    const xssResponse = await makeRequest(
      `${BASE_URL}/api/news?search=${encodeURIComponent(xssPayload)}`
    )
    
    this.results.addResult(
      'XSS防护',
      xssResponse.status === 200 && !xssResponse.data?.toString().includes('<script>'),
      '可能存在XSS漏洞',
      xssResponse.responseTime
    )
  }

  // 运行所有测试
  async runAllTests() {
    await this.setup()
    
    await this.testPublicNewsAPI()
    await this.testAdminNewsAPI()
    await this.testCrawlAPI()
    await this.testSecurity()
    
    return this.generateReport()
  }

  // 生成测试报告
  generateReport() {
    const report = this.results.generateReport()
    
    console.log('\n📊 测试报告')
    console.log('=' * 50)
    console.log(`总测试数: ${report.summary.total}`)
    console.log(`通过: ${report.summary.passed}`)
    console.log(`失败: ${report.summary.failed}`)
    console.log(`通过率: ${report.summary.passRate}`)
    console.log(`总耗时: ${report.summary.totalTime}`)
    
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
  const testSuite = new APITestSuite()
  
  try {
    const report = await testSuite.runAllTests()
    
    // 保存测试报告
    const fs = require('fs')
    const path = require('path')
    
    const reportDir = path.join(process.cwd(), 'test-results')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(reportDir, 'api-test-report.json'),
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n📄 测试报告已保存到: test-results/api-test-report.json')
    
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

module.exports = { APITestSuite, TEST_CONFIG, TEST_DATA }
