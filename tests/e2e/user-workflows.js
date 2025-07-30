/**
 * 端到端用户流程测试
 * 使用Playwright进行自动化浏览器测试
 * 注意：需要安装 npm install --save-dev playwright
 */

// 由于Playwright需要额外安装，我们创建一个基于DOM操作的简化版本
// 实际生产环境建议使用Playwright或Cypress

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  browsers: ['chrome', 'firefox', 'safari', 'edge']
}

// 测试结果收集器
class E2ETestResults {
  constructor() {
    this.results = []
    this.passed = 0
    this.failed = 0
    this.startTime = Date.now()
  }

  addResult(testName, passed, message = '', screenshot = null) {
    const result = {
      testName,
      passed,
      message,
      screenshot,
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
      details: this.results
    }
  }
}

// 简化的浏览器自动化工具（基于fetch和DOM检查）
class SimpleBrowserTester {
  constructor() {
    this.results = new E2ETestResults()
  }

  // 检查页面是否可访问
  async checkPageAccessibility(url, expectedTitle = null) {
    try {
      console.log(`检查页面: ${url}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      console.log(`响应状态: ${response.status}`)

      if (response.status !== 200) {
        return {
          accessible: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const html = await response.text()
      console.log(`HTML长度: ${html.length}`)

      // 基本检查
      const hasHtml = html.includes('<html') || html.includes('<!DOCTYPE html>')
      const hasTitle = expectedTitle ? html.includes(expectedTitle) : html.includes('<title>')
      const hasBody = html.includes('<body')
      // 更精确的错误检查，避免误判
      const noErrors = !html.includes('404 Not Found') &&
                      !html.includes('500 Internal Server Error') &&
                      !html.includes('Application error') &&
                      !html.includes('Runtime Error')

      console.log(`检查结果: hasHtml=${hasHtml}, hasTitle=${hasTitle}, hasBody=${hasBody}, noErrors=${noErrors}`)
      console.log(`HTML片段: ${html.substring(0, 200)}`)

      return {
        accessible: hasHtml && hasBody && noErrors,
        hasTitle,
        status: response.status,
        html: html.substring(0, 500) // 只保留前500字符用于调试
      }
    } catch (error) {
      console.log(`请求失败: ${error.message}`)
      return {
        accessible: false,
        error: error.message
      }
    }
  }

  // 检查页面性能
  async checkPagePerformance(url) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url)
      const loadTime = Date.now() - startTime
      
      return {
        loadTime,
        status: response.status,
        size: response.headers.get('content-length') || 0
      }
    } catch (error) {
      return {
        loadTime: Date.now() - startTime,
        error: error.message
      }
    }
  }

  // 检查响应式设计（通过User-Agent模拟）
  async checkResponsiveDesign(url) {
    const userAgents = {
      desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      tablet: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    }

    const results = {}

    for (const [device, userAgent] of Object.entries(userAgents)) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': userAgent
          }
        })
        
        const html = await response.text()
        
        results[device] = {
          status: response.status,
          hasViewportMeta: html.includes('viewport'),
          hasResponsiveCSS: html.includes('media') || html.includes('responsive'),
          accessible: response.status === 200
        }
      } catch (error) {
        results[device] = {
          error: error.message,
          accessible: false
        }
      }
    }

    return results
  }

  // 测试用户浏览流程
  async testUserBrowsingFlow() {
    console.log('\n👤 测试用户浏览流程...')

    // 1. 访问首页
    const homeCheck = await this.checkPageAccessibility(`${BASE_URL}/`)
    this.results.addResult(
      '访问首页',
      homeCheck.accessible,
      homeCheck.error || '首页无法访问'
    )

    // 2. 访问新闻列表页
    const newsListCheck = await this.checkPageAccessibility(`${BASE_URL}/news`, '新闻')
    this.results.addResult(
      '访问新闻列表页',
      newsListCheck.accessible,
      newsListCheck.error || '新闻列表页无法访问'
    )

    // 3. 检查新闻列表页性能
    const newsListPerf = await this.checkPagePerformance(`${BASE_URL}/news`)
    this.results.addResult(
      '新闻列表页加载时间 < 3000ms',
      newsListPerf.loadTime < 3000,
      `加载时间: ${newsListPerf.loadTime}ms`
    )

    // 4. 测试新闻详情页（假设有ID为1的文章）
    const newsDetailCheck = await this.checkPageAccessibility(`${BASE_URL}/news/1`)
    this.results.addResult(
      '访问新闻详情页',
      newsDetailCheck.accessible,
      newsDetailCheck.error || '新闻详情页无法访问'
    )

    // 5. 检查新闻详情页是否包含源文章链接
    if (newsDetailCheck.accessible) {
      const hasSourceLink = newsDetailCheck.html.includes('查看原文') || 
                           newsDetailCheck.html.includes('sourceUrl')
      this.results.addResult(
        '新闻详情页包含源文章链接',
        hasSourceLink,
        '未找到源文章链接按钮'
      )
    }

    // 6. 测试响应式设计
    const responsiveResults = await this.checkResponsiveDesign(`${BASE_URL}/news`)
    
    Object.entries(responsiveResults).forEach(([device, result]) => {
      this.results.addResult(
        `${device}设备兼容性`,
        result.accessible && result.hasViewportMeta,
        result.error || '设备兼容性问题'
      )
    })
  }

  // 测试管理员工作流程
  async testAdminWorkflow() {
    console.log('\n🔐 测试管理员工作流程...')

    // 1. 访问管理员登录页
    const loginCheck = await this.checkPageAccessibility(`${BASE_URL}/admin/login`, '登录')
    this.results.addResult(
      '访问管理员登录页',
      loginCheck.accessible,
      loginCheck.error || '登录页无法访问'
    )

    // 2. 访问新闻管理页（需要认证，可能会重定向）
    const newsManageCheck = await this.checkPageAccessibility(`${BASE_URL}/admin/news`)
    this.results.addResult(
      '访问新闻管理页',
      newsManageCheck.status === 200 || newsManageCheck.status === 302,
      `状态码: ${newsManageCheck.status}`
    )

    // 3. 检查新闻管理页是否包含语言切换功能
    if (newsManageCheck.accessible) {
      const hasLanguageSelector = newsManageCheck.html.includes('显示语言') || 
                                 newsManageCheck.html.includes('LanguageSelector')
      this.results.addResult(
        '新闻管理页包含语言切换功能',
        hasLanguageSelector,
        '未找到语言切换组件'
      )
    }

    // 4. 访问新闻采集页
    const collectCheck = await this.checkPageAccessibility(`${BASE_URL}/admin/news/collect`)
    this.results.addResult(
      '访问新闻采集页',
      collectCheck.status === 200 || collectCheck.status === 302,
      `状态码: ${collectCheck.status}`
    )

    // 5. 检查采集页是否包含进度显示
    if (collectCheck.accessible) {
      const hasProgressBar = collectCheck.html.includes('进度') || 
                            collectCheck.html.includes('progress')
      this.results.addResult(
        '采集页包含进度显示',
        hasProgressBar,
        '未找到进度显示组件'
      )
    }
  }

  // 测试多语言功能
  async testMultiLanguageSupport() {
    console.log('\n🌐 测试多语言功能...')

    const languages = ['zh', 'en', 'ja', 'ko']
    
    for (const lang of languages) {
      // 测试带语言参数的页面访问
      const langCheck = await this.checkPageAccessibility(`${BASE_URL}/news?lang=${lang}`)
      this.results.addResult(
        `${lang.toUpperCase()}语言页面访问`,
        langCheck.accessible,
        langCheck.error || `${lang}语言页面无法访问`
      )
    }
  }

  // 测试搜索功能
  async testSearchFunctionality() {
    console.log('\n🔍 测试搜索功能...')

    const searchQueries = ['服装', '市场', 'fashion', 'business']
    
    for (const query of searchQueries) {
      const searchUrl = `${BASE_URL}/news?search=${encodeURIComponent(query)}`
      const searchCheck = await this.checkPageAccessibility(searchUrl)
      
      this.results.addResult(
        `搜索功能 - "${query}"`,
        searchCheck.accessible,
        searchCheck.error || `搜索"${query}"失败`
      )
    }
  }

  // 测试页面性能
  async testPagePerformance() {
    console.log('\n⚡ 测试页面性能...')

    const pages = [
      { url: `${BASE_URL}`, name: '首页', maxTime: 2000 },
      { url: `${BASE_URL}/news`, name: '新闻列表', maxTime: 3000 },
      { url: `${BASE_URL}/news/1`, name: '新闻详情', maxTime: 2000 },
      { url: `${BASE_URL}/admin/login`, name: '管理员登录', maxTime: 2000 }
    ]

    for (const page of pages) {
      const perf = await this.checkPagePerformance(page.url)
      
      this.results.addResult(
        `${page.name}加载时间 < ${page.maxTime}ms`,
        perf.loadTime < page.maxTime,
        `实际加载时间: ${perf.loadTime}ms`
      )
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始端到端用户流程测试...')
    console.log(`📍 测试服务器: ${BASE_URL}`)

    await this.testUserBrowsingFlow()
    await this.testAdminWorkflow()
    await this.testMultiLanguageSupport()
    await this.testSearchFunctionality()
    await this.testPagePerformance()

    return this.generateReport()
  }

  // 生成测试报告
  generateReport() {
    const report = this.results.generateReport()
    
    console.log('\n📊 端到端测试报告')
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
  const tester = new SimpleBrowserTester()
  
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
      path.join(reportDir, 'e2e-test-report.json'),
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n📄 测试报告已保存到: test-results/e2e-test-report.json')
    
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

module.exports = { SimpleBrowserTester, TEST_CONFIG }
