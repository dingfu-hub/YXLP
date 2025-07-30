#!/usr/bin/env node

/**
 * 质量保证测试运行脚本
 * 一键执行所有QA测试并生成综合报告
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// 测试配置
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3002',
  timeout: 300000, // 5分钟超时
  reportDir: 'test-results',
  tests: [
    {
      name: 'API接口验证',
      script: '../../tests/api/api-validation.js',
      reportFile: 'api-test-report.json'
    },
    {
      name: '端到端用户流程测试',
      script: '../../tests/e2e/user-workflows.js',
      reportFile: 'e2e-test-report.json'
    },
    {
      name: '数据质量验证',
      script: '../../tests/data/data-quality-validation.js',
      reportFile: 'data-quality-report.json'
    },
    {
      name: '安全性与性能测试',
      script: '../../tests/security/security-performance-test.js',
      reportFile: 'security-performance-report.json'
    }
  ]
}

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 测试结果收集器
class QATestRunner {
  constructor() {
    this.results = []
    this.startTime = Date.now()
    this.setupReportDirectory()
  }

  setupReportDirectory() {
    if (!fs.existsSync(TEST_CONFIG.reportDir)) {
      fs.mkdirSync(TEST_CONFIG.reportDir, { recursive: true })
    }
  }

  async runTest(test) {
    colorLog('cyan', `\n🚀 开始执行: ${test.name}`)
    colorLog('blue', `📄 脚本: ${test.script}`)

    return new Promise((resolve) => {
      const startTime = Date.now()
      const child = spawn('node', [test.script], {
        stdio: 'pipe',
        cwd: process.cwd()
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        const output = data.toString()
        stdout += output
        // 实时显示输出
        process.stdout.write(output)
      })

      child.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output
        process.stderr.write(output)
      })

      child.on('close', (code) => {
        const duration = Date.now() - startTime
        const success = code === 0

        if (success) {
          colorLog('green', `✅ ${test.name} 完成 (${duration}ms)`)
        } else {
          colorLog('red', `❌ ${test.name} 失败 (${duration}ms)`)
        }

        // 尝试读取测试报告
        let report = null
        const reportPath = path.join(TEST_CONFIG.reportDir, test.reportFile)
        
        try {
          if (fs.existsSync(reportPath)) {
            report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
          }
        } catch (error) {
          colorLog('yellow', `⚠️ 无法读取测试报告: ${error.message}`)
        }

        resolve({
          name: test.name,
          script: test.script,
          success,
          exitCode: code,
          duration,
          stdout,
          stderr,
          report
        })
      })

      // 设置超时
      setTimeout(() => {
        child.kill('SIGTERM')
        colorLog('red', `⏰ ${test.name} 超时，已终止`)
        resolve({
          name: test.name,
          script: test.script,
          success: false,
          exitCode: -1,
          duration: TEST_CONFIG.timeout,
          stdout,
          stderr,
          error: 'Test timeout'
        })
      }, TEST_CONFIG.timeout)
    })
  }

  async runAllTests() {
    colorLog('bright', '🎯 开始执行质量保证测试套件')
    colorLog('blue', `📍 测试服务器: ${TEST_CONFIG.baseUrl}`)
    colorLog('blue', `📊 测试项目数: ${TEST_CONFIG.tests.length}`)

    // 检查服务器是否可访问
    try {
      const response = await fetch(TEST_CONFIG.baseUrl)
      if (response.status !== 200) {
        throw new Error(`服务器响应状态: ${response.status}`)
      }
      colorLog('green', '✅ 测试服务器连接正常')
    } catch (error) {
      colorLog('red', `❌ 无法连接到测试服务器: ${error.message}`)
      colorLog('yellow', '请确保开发服务器正在运行 (npm run dev)')
      process.exit(1)
    }

    // 依次执行所有测试
    for (const test of TEST_CONFIG.tests) {
      const result = await this.runTest(test)
      this.results.push(result)
    }

    return this.generateSummaryReport()
  }

  generateSummaryReport() {
    const totalTime = Date.now() - this.startTime
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0

    // 汇总各个测试的详细结果
    const detailedResults = {}
    let totalTestCases = 0
    let totalPassedCases = 0

    this.results.forEach(result => {
      if (result.report && result.report.summary) {
        const summary = result.report.summary
        detailedResults[result.name] = {
          total: summary.total || 0,
          passed: summary.passed || 0,
          failed: summary.failed || 0,
          passRate: summary.passRate || '0%',
          duration: result.duration
        }
        totalTestCases += summary.total || 0
        totalPassedCases += summary.passed || 0
      } else {
        detailedResults[result.name] = {
          total: 1,
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          passRate: result.success ? '100%' : '0%',
          duration: result.duration
        }
        totalTestCases += 1
        totalPassedCases += result.success ? 1 : 0
      }
    })

    const overallPassRate = totalTestCases > 0 ? ((totalPassedCases / totalTestCases) * 100).toFixed(2) : 0

    const summaryReport = {
      timestamp: new Date().toISOString(),
      testSuite: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: `${passRate}%`,
        totalTime: `${totalTime}ms`
      },
      testCases: {
        total: totalTestCases,
        passed: totalPassedCases,
        failed: totalTestCases - totalPassedCases,
        passRate: `${overallPassRate}%`
      },
      detailedResults,
      results: this.results,
      config: {
        baseUrl: TEST_CONFIG.baseUrl,
        timeout: TEST_CONFIG.timeout
      }
    }

    // 保存综合报告
    const summaryPath = path.join(TEST_CONFIG.reportDir, 'qa-summary-report.json')
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2))

    // 显示测试结果摘要
    this.displaySummary(summaryReport)

    return summaryReport
  }

  displaySummary(report) {
    colorLog('bright', '\n📊 质量保证测试总结报告')
    console.log('=' * 60)

    // 测试套件摘要
    colorLog('cyan', '\n🎯 测试套件摘要:')
    console.log(`  总测试套件数: ${report.testSuite.total}`)
    console.log(`  通过套件数: ${report.testSuite.passed}`)
    console.log(`  失败套件数: ${report.testSuite.failed}`)
    console.log(`  套件通过率: ${report.testSuite.passRate}`)
    console.log(`  总执行时间: ${report.testSuite.totalTime}`)

    // 测试用例摘要
    colorLog('cyan', '\n📋 测试用例摘要:')
    console.log(`  总测试用例数: ${report.testCases.total}`)
    console.log(`  通过用例数: ${report.testCases.passed}`)
    console.log(`  失败用例数: ${report.testCases.failed}`)
    console.log(`  用例通过率: ${report.testCases.passRate}`)

    // 详细结果
    colorLog('cyan', '\n📈 各测试套件详情:')
    Object.entries(report.detailedResults).forEach(([name, result]) => {
      const status = result.failed === 0 ? '✅' : '❌'
      const duration = `${result.duration}ms`
      console.log(`  ${status} ${name}: ${result.passed}/${result.total} (${result.passRate}) - ${duration}`)
    })

    // 失败的测试
    const failedTests = this.results.filter(r => !r.success)
    if (failedTests.length > 0) {
      colorLog('red', '\n❌ 失败的测试套件:')
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: 退出码 ${test.exitCode}`)
        if (test.error) {
          console.log(`    错误: ${test.error}`)
        }
      })
    }

    // 生成建议
    colorLog('cyan', '\n💡 建议:')
    if (report.testCases.failed === 0) {
      colorLog('green', '  🎉 所有测试通过！系统已准备好部署到生产环境。')
    } else if (report.testCases.failed <= 5) {
      colorLog('yellow', '  ⚠️ 存在少量失败测试，建议修复后再部署。')
    } else {
      colorLog('red', '  🚨 存在较多失败测试，需要重点关注和修复。')
    }

    colorLog('blue', `\n📄 详细报告已保存到: ${TEST_CONFIG.reportDir}/qa-summary-report.json`)
    colorLog('blue', `📄 最终QA报告: docs/qa/final-qa-report.md`)
  }
}

// 主函数
async function main() {
  const runner = new QATestRunner()
  
  try {
    const report = await runner.runAllTests()
    
    // 根据测试结果设置退出码
    const hasFailures = report.testCases.failed > 0
    process.exit(hasFailures ? 1 : 0)
    
  } catch (error) {
    colorLog('red', `❌ 测试执行失败: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { QATestRunner, TEST_CONFIG }
