/**
 * 系统全面测试脚本
 * 测试所有主要功能是否正常工作
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

// 测试API端点
async function testAPI(url, expectedStatus = 200, description = '') {
  try {
    // 使用有效的管理员token
    const validToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhZG1pbl8wMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwicGVybWlzc2lvbnMiOlsidXNlcjp2aWV3IiwidXNlcjpjcmVhdGUiLCJ1c2VyOnVwZGF0ZSIsInVzZXI6ZGVsZXRlIiwicHJvZHVjdDp2aWV3IiwicHJvZHVjdDpjcmVhdGUiLCJwcm9kdWN0OnVwZGF0ZSIsInByb2R1Y3Q6ZGVsZXRlIiwib3JkZXI6dmlldyIsIm9yZGVyOmNyZWF0ZSIsIm9yZGVyOnVwZGF0ZSIsIm9yZGVyOmRlbGV0ZSIsIm5ld3M6dmlldyIsIm5ld3M6Y3JlYXRlIiwibmV3czp1cGRhdGUiLCJuZXdzOmRlbGV0ZSIsImFuYWx5dGljczp2aWV3Iiwic3lzdGVtOm1hbmFnZSJdLCJpYXQiOjE3NTM2Mjk2MjQsImV4cCI6MTc1NDIzNDQyNH0.lvWulUSb5y-I1MVT6passG4BtxW8VSvP6n4PTm-Liqk'

    const response = await fetch(url, {
      headers: {
        'Cookie': `admin_token=${validToken}`
      }
    })

    const passed = response.status === expectedStatus
    recordTest(
      `API测试: ${description || url}`,
      passed,
      passed ? '' : `期望状态码 ${expectedStatus}，实际 ${response.status}`
    )

    return response
  } catch (error) {
    recordTest(
      `API测试: ${description || url}`,
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
    `文件测试: ${description || filePath}`,
    exists,
    exists ? '' : '文件不存在'
  )
  return exists
}

// 测试JSON文件格式
function testJSONFile(filePath, description = '') {
  try {
    if (!fs.existsSync(filePath)) {
      recordTest(`JSON测试: ${description || filePath}`, false, '文件不存在')
      return false
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    JSON.parse(content)
    recordTest(`JSON测试: ${description || filePath}`, true)
    return true
  } catch (error) {
    recordTest(
      `JSON测试: ${description || filePath}`,
      false,
      `JSON格式错误: ${error.message}`
    )
    return false
  }
}

// 主测试函数
async function runSystemTests() {
  console.log('🚀 开始系统全面测试...\n')
  
  const baseUrl = 'http://localhost:3003'
  const dataDir = path.join(__dirname, '../apps/web/data')
  
  // 1. 测试关键文件存在性
  console.log('📁 测试关键文件...')
  testFileExists(path.join(__dirname, '../apps/web/src/app/admin/news/page.tsx'), '新闻管理页面')
  testFileExists(path.join(__dirname, '../apps/web/src/app/admin/news/sources/page.tsx'), 'RSS源管理页面')
  testFileExists(path.join(__dirname, '../apps/web/src/components/admin/layout/Sidebar.tsx'), '侧边栏组件')
  testFileExists(path.join(__dirname, '../apps/web/src/lib/news-crawler.ts'), '新闻采集器')
  testFileExists(path.join(__dirname, '../apps/web/src/data/news.ts'), '新闻数据管理')
  
  // 2. 测试数据文件
  console.log('\n📄 测试数据文件...')
  testJSONFile(path.join(dataDir, 'crawl-progress.json'), '采集进度文件')
  testJSONFile(path.join(dataDir, 'ai-config.json'), 'AI配置文件')
  
  // 3. 测试API端点
  console.log('\n🌐 测试API端点...')
  await testAPI(`${baseUrl}/api/admin/news`, 200, '新闻列表API')
  await testAPI(`${baseUrl}/api/admin/news/sources`, 200, 'RSS源管理API')
  await testAPI(`${baseUrl}/api/admin/news/crawl/progress`, 200, '采集进度API')
  
  // 4. 测试页面可访问性
  console.log('\n🖥️  测试页面可访问性...')
  await testAPI(`${baseUrl}/admin`, 200, '管理后台首页')
  await testAPI(`${baseUrl}/admin/news`, 200, '新闻管理页面')
  await testAPI(`${baseUrl}/admin/news/sources`, 200, 'RSS源管理页面')
  
  // 5. 测试数据结构
  console.log('\n🔍 测试数据结构...')
  try {
    const validToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhZG1pbl8wMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwicGVybWlzc2lvbnMiOlsidXNlcjp2aWV3IiwidXNlcjpjcmVhdGUiLCJ1c2VyOnVwZGF0ZSIsInVzZXI6ZGVsZXRlIiwicHJvZHVjdDp2aWV3IiwicHJvZHVjdDpjcmVhdGUiLCJwcm9kdWN0OnVwZGF0ZSIsInByb2R1Y3Q6ZGVsZXRlIiwib3JkZXI6dmlldyIsIm9yZGVyOmNyZWF0ZSIsIm9yZGVyOnVwZGF0ZSIsIm9yZGVyOmRlbGV0ZSIsIm5ld3M6dmlldyIsIm5ld3M6Y3JlYXRlIiwibmV3czp1cGRhdGUiLCJuZXdzOmRlbGV0ZSIsImFuYWx5dGljczp2aWV3Iiwic3lzdGVtOm1hbmFnZSJdLCJpYXQiOjE3NTM2Mjk2MjQsImV4cCI6MTc1NDIzNDQyNH0.lvWulUSb5y-I1MVT6passG4BtxW8VSvP6n4PTm-Liqk'
    const newsResponse = await fetch(`${baseUrl}/api/admin/news`, {
      headers: { 'Cookie': `admin_token=${validToken}` }
    })
    
    if (newsResponse.ok) {
      const newsData = await newsResponse.json()
      const hasValidStructure = newsData.success && Array.isArray(newsData.data)
      recordTest(
        '新闻数据结构测试',
        hasValidStructure,
        hasValidStructure ? '' : '数据结构不正确'
      )
      
      // 检查新闻文章结构
      if (newsData.data.length > 0) {
        const article = newsData.data[0]
        const hasMultiLanguageTitle = typeof article.title === 'object' && article.title.zh
        recordTest(
          '多语言标题结构测试',
          hasMultiLanguageTitle,
          hasMultiLanguageTitle ? '' : '标题不是多语言对象'
        )
      }
    }
  } catch (error) {
    recordTest('数据结构测试', false, `测试失败: ${error.message}`)
  }
  
  // 6. 测试RSS源数据
  console.log('\n📡 测试RSS源数据...')
  try {
    const validToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhZG1pbl8wMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwicGVybWlzc2lvbnMiOlsidXNlcjp2aWV3IiwidXNlcjpjcmVhdGUiLCJ1c2VyOnVwZGF0ZSIsInVzZXI6ZGVsZXRlIiwicHJvZHVjdDp2aWV3IiwicHJvZHVjdDpjcmVhdGUiLCJwcm9kdWN0OnVwZGF0ZSIsInByb2R1Y3Q6ZGVsZXRlIiwib3JkZXI6dmlldyIsIm9yZGVyOmNyZWF0ZSIsIm9yZGVyOnVwZGF0ZSIsIm9yZGVyOmRlbGV0ZSIsIm5ld3M6dmlldyIsIm5ld3M6Y3JlYXRlIiwibmV3czp1cGRhdGUiLCJuZXdzOmRlbGV0ZSIsImFuYWx5dGljczp2aWV3Iiwic3lzdGVtOm1hbmFnZSJdLCJpYXQiOjE3NTM2Mjk2MjQsImV4cCI6MTc1NDIzNDQyNH0.lvWulUSb5y-I1MVT6passG4BtxW8VSvP6n4PTm-Liqk'
    const sourcesResponse = await fetch(`${baseUrl}/api/admin/news/sources`, {
      headers: { 'Cookie': `admin_token=${validToken}` }
    })
    
    if (sourcesResponse.ok) {
      const sourcesData = await sourcesResponse.json()
      const hasValidSources = sourcesData.success && Array.isArray(sourcesData.data) && sourcesData.data.length > 0
      recordTest(
        'RSS源数据测试',
        hasValidSources,
        hasValidSources ? `找到 ${sourcesData.data.length} 个RSS源` : '没有找到RSS源数据'
      )
      
      // 检查源的语言和国家字段
      if (sourcesData.data.length > 0) {
        const source = sourcesData.data[0]
        const hasLanguageCountry = source.language && source.country
        recordTest(
          'RSS源语言国家字段测试',
          hasLanguageCountry,
          hasLanguageCountry ? '' : '缺少language或country字段'
        )
      }
    }
  } catch (error) {
    recordTest('RSS源数据测试', false, `测试失败: ${error.message}`)
  }
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:')
  console.log(`✅ 通过: ${testResults.passed}`)
  console.log(`❌ 失败: ${testResults.failed}`)
  console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
  
  // 保存详细测试报告
  const reportPath = path.join(__dirname, '../test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  console.log(`\n📋 详细测试报告已保存到: ${reportPath}`)
  
  // 返回测试是否全部通过
  return testResults.failed === 0
}

// 如果直接运行此脚本
if (require.main === module) {
  runSystemTests()
    .then(allPassed => {
      console.log(allPassed ? '\n🎉 所有测试通过！' : '\n⚠️  部分测试失败，请检查上述错误')
      process.exit(allPassed ? 0 : 1)
    })
    .catch(error => {
      console.error('\n💥 测试运行失败:', error)
      process.exit(1)
    })
}

module.exports = { runSystemTests }
