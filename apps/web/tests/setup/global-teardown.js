/**
 * Jest全局清理
 * 在所有测试结束后执行的清理工作
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async () => {
  console.log('🧹 开始全局测试清理...')

  try {
    // 清理临时文件
    const tempDirs = [
      'logs/test',
      '.next/cache/test'
    ]

    tempDirs.forEach(dir => {
      try {
        if (fs.existsSync(dir)) {
          execSync(`rm -rf ${dir}`, { stdio: 'ignore' })
        }
      } catch (error) {
        console.warn(`警告: 无法清理目录 ${dir}:`, error.message)
      }
    })

    // 清理测试数据库连接
    console.log('🗄️ 清理测试数据库连接...')
    
    // 这里可以添加数据库清理逻辑
    // 例如：关闭连接、清理测试数据等

    // 生成测试报告摘要
    console.log('📊 生成测试报告摘要...')
    
    const summaryPath = path.join(process.cwd(), 'test-results', 'summary.txt')
    const summary = `
测试执行完成时间: ${new Date().toISOString()}
测试环境: ${process.env.NODE_ENV}
Node.js版本: ${process.version}
测试结果详情请查看: test-results/report.html
覆盖率报告请查看: coverage/lcov-report/index.html
    `.trim()

    try {
      fs.writeFileSync(summaryPath, summary)
    } catch (error) {
      console.warn('警告: 无法写入测试摘要文件:', error.message)
    }

    console.log('✅ 全局测试清理完成')

  } catch (error) {
    console.error('❌ 全局测试清理失败:', error)
    // 不要因为清理失败而导致测试失败
  }
}
