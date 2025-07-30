/**
 * 全面系统测试脚本
 * 测试所有页面和功能的可访问性
 */

const fs = require('fs')
const path = require('path')

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
}

// 记录测试结果
function recordTest(name, passed, message = '') {
  testResults.tests.push({
    name,
    passed,
    message,
    timestamp: new Date().toISOString()
  })
  
  if (passed) {
    testResults.passed++
    console.log(`✅ ${name}`)
  } else {
    testResults.failed++
    console.log(`❌ ${name}: ${message}`)
  }
}

// 测试页面可访问性
async function testPageAccess(url, description = '') {
  try {
    const response = await fetch(url)
    const passed = response.status === 200
    recordTest(
      `页面访问: ${description || url}`,
      passed,
      passed ? '' : `状态码: ${response.status}`
    )
    return response
  } catch (error) {
    recordTest(
      `页面访问: ${description || url}`,
      false,
      `请求失败: ${error.message}`
    )
    return null
  }
}

// 测试文件存在性
function testFileExists(filePath, description = '') {
  const exists = fs.existsSync(filePath)
  recordTest(
    `文件存在: ${description || filePath}`,
    exists,
    exists ? '' : '文件不存在'
  )
  return exists
}

// 主测试函数
async function runComprehensiveTests() {
  console.log('🚀 开始全面系统测试...\n')
  
  const baseUrl = 'http://localhost:3003'
  const webDir = path.join(__dirname, '../apps/web')
  
  // 1. 测试核心文件存在性
  console.log('📁 测试核心文件存在性...')
  testFileExists(path.join(webDir, 'src/app/admin/page.tsx'), '管理后台首页')
  testFileExists(path.join(webDir, 'src/app/admin/news/page.tsx'), '新闻管理页面')
  testFileExists(path.join(webDir, 'src/app/admin/news/sources/page.tsx'), 'RSS源管理页面')
  testFileExists(path.join(webDir, 'src/app/admin/news/collect/page.tsx'), '新闻采集页面')
  testFileExists(path.join(webDir, 'src/app/admin/news/polish/page.tsx'), 'AI润色页面')
  testFileExists(path.join(webDir, 'src/app/admin/products/page.tsx'), '商品管理页面')
  testFileExists(path.join(webDir, 'src/app/admin/users/page.tsx'), '用户管理页面')
  testFileExists(path.join(webDir, 'src/components/admin/layout/Sidebar.tsx'), '侧边栏组件')
  testFileExists(path.join(webDir, 'src/lib/news-crawler.ts'), '新闻采集器')
  testFileExists(path.join(webDir, 'src/data/news.ts'), '新闻数据管理')
  
  // 2. 测试API路由文件
  console.log('\n🔌 测试API路由文件...')
  testFileExists(path.join(webDir, 'src/app/api/admin/news/route.ts'), '新闻API')
  testFileExists(path.join(webDir, 'src/app/api/admin/news/sources/route.ts'), 'RSS源API')
  testFileExists(path.join(webDir, 'src/app/api/admin/news/crawl/progress/route.ts'), '采集进度API')
  testFileExists(path.join(webDir, 'src/app/api/admin/auth/login/route.ts'), '登录API')
  testFileExists(path.join(webDir, 'src/app/api/admin/auth/me/route.ts'), '用户信息API')
  
  // 3. 测试数据文件
  console.log('\n📄 测试数据文件...')
  const dataDir = path.join(webDir, 'data')
  if (fs.existsSync(dataDir)) {
    const dataFiles = fs.readdirSync(dataDir)
    dataFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          JSON.parse(content)
          recordTest(`JSON文件: ${file}`, true)
        } catch (error) {
          recordTest(`JSON文件: ${file}`, false, `JSON格式错误: ${error.message}`)
        }
      }
    })
  }
  
  // 4. 测试页面可访问性
  console.log('\n🖥️  测试页面可访问性...')
  await testPageAccess(`${baseUrl}/admin`, '管理后台首页')
  await testPageAccess(`${baseUrl}/admin/news`, '新闻管理页面')
  await testPageAccess(`${baseUrl}/admin/news/sources`, 'RSS源管理页面')
  await testPageAccess(`${baseUrl}/admin/news/collect`, '新闻采集页面')
  await testPageAccess(`${baseUrl}/admin/news/polish`, 'AI润色页面')
  await testPageAccess(`${baseUrl}/admin/products`, '商品管理页面')
  await testPageAccess(`${baseUrl}/admin/users`, '用户管理页面')
  
  // 5. 测试API端点（不需要认证的）
  console.log('\n🌐 测试公开API端点...')
  await testPageAccess(`${baseUrl}/api/admin/news/crawl/progress`, '采集进度API')
  
  // 6. 测试组件导入
  console.log('\n🧩 测试关键组件...')
  try {
    // 这里我们只能测试文件是否存在，无法在Node.js中导入React组件
    const componentFiles = [
      'src/components/admin/layout/Sidebar.tsx',
      'src/components/admin/layout/Header.tsx',
      'src/components/admin/layout/AdminLayout.tsx',
      'src/components/CrawlProgressModal.tsx',
      'src/components/LanguageSelector.tsx'
    ]
    
    componentFiles.forEach(file => {
      testFileExists(path.join(webDir, file), `组件文件: ${path.basename(file)}`)
    })
  } catch (error) {
    recordTest('组件测试', false, `组件测试失败: ${error.message}`)
  }
  
  // 7. 测试配置文件
  console.log('\n⚙️  测试配置文件...')
  testFileExists(path.join(webDir, 'package.json'), 'package.json')
  testFileExists(path.join(webDir, 'next.config.js'), 'Next.js配置')
  testFileExists(path.join(webDir, 'tailwind.config.js'), 'Tailwind配置')
  testFileExists(path.join(webDir, 'tsconfig.json'), 'TypeScript配置')
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:')
  console.log(`✅ 通过: ${testResults.passed}`)
  console.log(`❌ 失败: ${testResults.failed}`)
  console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
  
  // 保存详细测试报告
  const reportPath = path.join(__dirname, '../comprehensive-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  console.log(`\n📋 详细测试报告已保存到: ${reportPath}`)
  
  // 生成测试总结
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: testResults.passed + testResults.failed,
    passed: testResults.passed,
    failed: testResults.failed,
    successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1),
    categories: {
      files: testResults.tests.filter(t => t.name.includes('文件存在') || t.name.includes('JSON文件')).length,
      pages: testResults.tests.filter(t => t.name.includes('页面访问')).length,
      apis: testResults.tests.filter(t => t.name.includes('API')).length,
      components: testResults.tests.filter(t => t.name.includes('组件')).length
    }
  }
  
  console.log('\n📈 测试分类统计:')
  console.log(`📁 文件测试: ${summary.categories.files}`)
  console.log(`🖥️  页面测试: ${summary.categories.pages}`)
  console.log(`🌐 API测试: ${summary.categories.apis}`)
  console.log(`🧩 组件测试: ${summary.categories.components}`)
  
  // 返回测试是否全部通过
  return testResults.failed === 0
}

// 如果直接运行此脚本
if (require.main === module) {
  runComprehensiveTests()
    .then(allPassed => {
      console.log(allPassed ? '\n🎉 所有测试通过！系统运行正常' : '\n⚠️  部分测试失败，请检查上述错误')
      process.exit(allPassed ? 0 : 1)
    })
    .catch(error => {
      console.error('\n💥 测试运行失败:', error)
      process.exit(1)
    })
}

module.exports = { runComprehensiveTests }
