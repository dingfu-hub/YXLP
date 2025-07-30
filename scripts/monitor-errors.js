/**
 * 错误监控脚本 - 检查系统中的常见错误
 */

const fs = require('fs')
const path = require('path')

// 检查文件是否存在
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? '存在' : '缺失'}`)
  return exists
}

// 检查API端点
async function checkAPI(url, description) {
  try {
    const response = await fetch(url)
    const status = response.status
    console.log(`${status === 200 ? '✅' : '⚠️'} ${description}: ${status}`)
    return status === 200
  } catch (error) {
    console.log(`❌ ${description}: 请求失败 - ${error.message}`)
    return false
  }
}

// 主监控函数
async function monitorErrors() {
  console.log('🔍 开始错误监控...\n')
  
  const baseUrl = 'http://localhost:3003'
  const webDir = path.join(__dirname, '../apps/web')
  
  // 1. 检查关键文件
  console.log('📁 检查关键文件:')
  checkFileExists(path.join(webDir, 'public/favicon.svg'), 'Favicon')
  checkFileExists(path.join(webDir, 'public/site.webmanifest'), 'Web Manifest')
  checkFileExists(path.join(webDir, 'src/app/api/admin/news/sources/route.ts'), 'RSS源API')
  checkFileExists(path.join(webDir, 'src/app/api/admin/news/crawl/ws/route.ts'), 'WebSocket API')
  
  console.log('\n🌐 检查API端点:')
  await checkAPI(`${baseUrl}/api/admin/news/crawl/progress`, '采集进度API')
  await checkAPI(`${baseUrl}/api/admin/news/crawl/ws`, 'WebSocket API')
  await checkAPI(`${baseUrl}/site.webmanifest`, 'Web Manifest')
  await checkAPI(`${baseUrl}/favicon.svg`, 'Favicon')
  
  console.log('\n📄 检查页面可访问性:')
  await checkAPI(`${baseUrl}/admin`, '管理后台首页')
  await checkAPI(`${baseUrl}/admin/news`, '新闻管理')
  await checkAPI(`${baseUrl}/admin/news/sources`, 'RSS源管理')
  await checkAPI(`${baseUrl}/admin/news/collect`, '新闻采集')
  await checkAPI(`${baseUrl}/admin/news/polish`, 'AI润色')
  
  // 2. 检查常见错误模式
  console.log('\n🔍 检查代码中的常见错误模式:')
  
  // 检查WebSocket导入错误
  const wsFile = path.join(webDir, 'src/app/api/admin/news/crawl/ws/route.ts')
  if (fs.existsSync(wsFile)) {
    const wsContent = fs.readFileSync(wsFile, 'utf8')
    const hasWebSocketImport = wsContent.includes('import { WebSocketServer }')
    console.log(`${hasWebSocketImport ? '⚠️' : '✅'} WebSocket导入: ${hasWebSocketImport ? '存在问题导入' : '已修复'}`)
  }
  
  // 检查JWT密钥
  const jwtFile = path.join(webDir, 'src/lib/jwt.ts')
  if (fs.existsSync(jwtFile)) {
    const jwtContent = fs.readFileSync(jwtFile, 'utf8')
    const hasJwtSecret = jwtContent.includes('yxlp_jwt_secret_key_2024')
    console.log(`${hasJwtSecret ? '✅' : '❌'} JWT密钥: ${hasJwtSecret ? '配置正确' : '配置错误'}`)
  }
  
  // 检查RSS源导入
  const rssFile = path.join(webDir, 'src/app/api/admin/news/sources/route.ts')
  if (fs.existsSync(rssFile)) {
    const rssContent = fs.readFileSync(rssFile, 'utf8')
    const hasCorrectImport = rssContent.includes('createNewsSource as createSource')
    console.log(`${hasCorrectImport ? '✅' : '❌'} RSS源导入: ${hasCorrectImport ? '导入正确' : '导入错误'}`)
  }
  
  console.log('\n📊 监控完成')
}

// 如果直接运行此脚本
if (require.main === module) {
  monitorErrors()
    .then(() => {
      console.log('\n✨ 错误监控完成')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 监控失败:', error)
      process.exit(1)
    })
}

module.exports = { monitorErrors }
