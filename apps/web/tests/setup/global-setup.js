/**
 * Jest全局设置
 * 在所有测试开始前执行的设置
 */

const { execSync } = require('child_process')
const path = require('path')

module.exports = async () => {
  console.log('🚀 开始全局测试设置...')

  // 设置测试环境变量
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
  
  // 禁用外部服务
  process.env.DISABLE_SCHEDULER = 'true'
  process.env.DISABLE_EXTERNAL_CRAWLING = 'true'
  process.env.DISABLE_AI_PROCESSING = 'true'
  
  // 设置测试数据库
  process.env.DATABASE_URL = 'sqlite::memory:'
  process.env.TEST_DATABASE = 'true'

  try {
    // 创建测试目录
    const testDirs = [
      'test-results',
      'coverage',
      'logs/test'
    ]

    testDirs.forEach(dir => {
      try {
        execSync(`mkdir -p ${dir}`, { stdio: 'ignore' })
      } catch (error) {
        // Directory might already exist, ignore error
      }
    })

    // 初始化测试数据库（如果需要）
    console.log('📊 初始化测试数据库...')
    
    // 这里可以添加数据库初始化逻辑
    // 例如：运行迁移、插入测试数据等
    
    console.log('✅ 全局测试设置完成')

  } catch (error) {
    console.error('❌ 全局测试设置失败:', error)
    process.exit(1)
  }
}
