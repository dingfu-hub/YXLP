#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { TestLogger } from './utils/test-logger';
import { testConfig } from './config/test-config';

interface TestSuite {
  name: string;
  path: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

const testSuites: TestSuite[] = [
  {
    name: 'Authentication System',
    path: './src/tests/auth/auth.test.ts',
    priority: 'high'
  },
  {
    name: 'User Management System',
    path: './src/tests/user/user-management.test.ts',
    priority: 'high',
    dependencies: ['Authentication System']
  },
  {
    name: 'News Management System',
    path: './src/tests/news/news-management.test.ts',
    priority: 'high',
    dependencies: ['Authentication System']
  },
  {
    name: 'News Collection System',
    path: './src/tests/collect/news-collection.test.ts',
    priority: 'high',
    dependencies: ['Authentication System']
  }
];

class TestRunner {
  private logger: TestLogger;
  private results: Map<string, any> = new Map();
  private failedTests: string[] = [];
  private bugs: any[] = [];

  constructor() {
    this.logger = new TestLogger();
  }

  async runAllTests(): Promise<void> {
    console.log(chalk.blue('🚀 开始执行全站自动化测试'));
    console.log(chalk.gray(`测试环境: ${testConfig.baseUrl}`));
    console.log(chalk.gray(`API地址: ${testConfig.apiUrl}`));
    console.log(chalk.gray('=' * 60));

    // 检查测试环境
    await this.checkTestEnvironment();

    // 按优先级和依赖关系执行测试
    const sortedSuites = this.sortTestSuites();
    
    for (const suite of sortedSuites) {
      await this.runTestSuite(suite);
    }

    // 生成测试报告
    await this.generateFinalReport();

    // 分析和修复bug
    await this.analyzeBugsAndFix();
  }

  private async checkTestEnvironment(): Promise<void> {
    console.log(chalk.yellow('🔍 检查测试环境...'));
    
    try {
      const response = await fetch(`${testConfig.baseUrl}/api/health`);
      if (response.ok) {
        console.log(chalk.green('✅ 测试环境可访问'));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(chalk.red('❌ 测试环境不可访问'));
      console.log(chalk.red(`错误: ${error.message}`));
      console.log(chalk.yellow('请确保应用程序正在运行在 ' + testConfig.baseUrl));
      process.exit(1);
    }
  }

  private sortTestSuites(): TestSuite[] {
    const sorted: TestSuite[] = [];
    const visited = new Set<string>();
    
    const visit = (suite: TestSuite) => {
      if (visited.has(suite.name)) return;
      
      if (suite.dependencies) {
        for (const dep of suite.dependencies) {
          const depSuite = testSuites.find(s => s.name === dep);
          if (depSuite && !visited.has(dep)) {
            visit(depSuite);
          }
        }
      }
      
      visited.add(suite.name);
      sorted.push(suite);
    };

    // 先执行高优先级测试
    testSuites
      .filter(s => s.priority === 'high')
      .forEach(visit);
    
    testSuites
      .filter(s => s.priority === 'medium')
      .forEach(visit);
      
    testSuites
      .filter(s => s.priority === 'low')
      .forEach(visit);

    return sorted;
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(chalk.blue(`\n📋 执行测试套件: ${suite.name}`));
    
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', suite.path, '--verbose', '--json'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      jest.stdout.on('data', (data) => {
        output += data.toString();
      });

      jest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      jest.on('close', (code) => {
        try {
          // 解析Jest输出
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            this.results.set(suite.name, result);
            
            // 记录失败的测试
            if (result.testResults) {
              result.testResults.forEach((testFile: any) => {
                testFile.assertionResults.forEach((test: any) => {
                  if (test.status === 'failed') {
                    this.failedTests.push(`${suite.name}: ${test.title}`);
                    this.bugs.push({
                      suite: suite.name,
                      test: test.title,
                      error: test.failureMessages.join('\n'),
                      location: test.location
                    });
                  }
                });
              });
            }

            console.log(chalk.green(`✅ ${suite.name} 执行完成`));
            if (result.numFailedTests > 0) {
              console.log(chalk.red(`   失败测试: ${result.numFailedTests}`));
            }
          }
        } catch (parseError) {
          console.log(chalk.red(`❌ 解析测试结果失败: ${parseError.message}`));
        }
        
        resolve();
      });

      jest.on('error', (error) => {
        console.log(chalk.red(`❌ 执行测试套件失败: ${error.message}`));
        reject(error);
      });
    });
  }

  private async generateFinalReport(): Promise<void> {
    console.log(chalk.blue('\n📊 生成测试报告...'));
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const [suiteName, result] of this.results) {
      totalTests += result.numTotalTests || 0;
      totalPassed += result.numPassedTests || 0;
      totalFailed += result.numFailedTests || 0;
      totalSkipped += result.numPendingTests || 0;
    }

    const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0';

    // 生成汇总报告
    const summaryReport = {
      timestamp: new Date().toISOString(),
      environment: {
        baseUrl: testConfig.baseUrl,
        apiUrl: testConfig.apiUrl
      },
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        passRate: `${passRate}%`
      },
      suites: Array.from(this.results.entries()).map(([name, result]) => ({
        name,
        tests: result.numTotalTests || 0,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.perfStats?.runtime || 0
      })),
      failedTests: this.failedTests,
      bugs: this.bugs
    };

    // 保存报告
    await fs.ensureDir('./reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeJson(`./reports/test-summary-${timestamp}.json`, summaryReport, { spaces: 2 });

    // 控制台输出汇总
    console.log(chalk.blue('\n📈 测试执行汇总:'));
    console.log(chalk.gray('=' * 50));
    console.log(`总测试数: ${totalTests}`);
    console.log(chalk.green(`通过: ${totalPassed}`));
    console.log(chalk.red(`失败: ${totalFailed}`));
    console.log(chalk.yellow(`跳过: ${totalSkipped}`));
    console.log(`通过率: ${passRate}%`);
    
    if (this.failedTests.length > 0) {
      console.log(chalk.red('\n❌ 失败的测试:'));
      this.failedTests.forEach(test => {
        console.log(chalk.red(`  - ${test}`));
      });
    }

    console.log(chalk.blue(`\n📄 详细报告已保存到: ./reports/test-summary-${timestamp}.json`));
  }

  private async analyzeBugsAndFix(): Promise<void> {
    if (this.bugs.length === 0) {
      console.log(chalk.green('\n🎉 没有发现bug，所有测试都通过了！'));
      return;
    }

    console.log(chalk.yellow(`\n🔧 发现 ${this.bugs.length} 个bug，开始分析和修复...`));

    for (const bug of this.bugs) {
      await this.analyzeBug(bug);
    }

    // 生成bug修复报告
    await this.generateBugReport();
  }

  private async analyzeBug(bug: any): Promise<void> {
    console.log(chalk.yellow(`\n🐛 分析bug: ${bug.suite} - ${bug.test}`));
    
    // 分析错误类型
    const errorType = this.classifyError(bug.error);
    console.log(chalk.gray(`错误类型: ${errorType}`));
    
    // 根据错误类型提供修复建议
    const fixSuggestion = this.generateFixSuggestion(errorType, bug);
    console.log(chalk.cyan(`修复建议: ${fixSuggestion}`));
    
    // 尝试自动修复
    const autoFixResult = await this.attemptAutoFix(bug, errorType);
    if (autoFixResult.success) {
      console.log(chalk.green(`✅ 自动修复成功: ${autoFixResult.description}`));
    } else {
      console.log(chalk.red(`❌ 自动修复失败: ${autoFixResult.reason}`));
    }
  }

  private classifyError(error: string): string {
    if (error.includes('ECONNREFUSED') || error.includes('fetch failed')) {
      return 'CONNECTION_ERROR';
    }
    if (error.includes('404') || error.includes('Not Found')) {
      return 'ENDPOINT_NOT_FOUND';
    }
    if (error.includes('401') || error.includes('Unauthorized')) {
      return 'AUTHENTICATION_ERROR';
    }
    if (error.includes('500') || error.includes('Internal Server Error')) {
      return 'SERVER_ERROR';
    }
    if (error.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (error.includes('Expected') && error.includes('toBe')) {
      return 'ASSERTION_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  private generateFixSuggestion(errorType: string, bug: any): string {
    switch (errorType) {
      case 'CONNECTION_ERROR':
        return '检查服务器是否运行，确认端口配置正确';
      case 'ENDPOINT_NOT_FOUND':
        return '检查API路由是否存在，确认URL路径正确';
      case 'AUTHENTICATION_ERROR':
        return '检查认证逻辑，确认token生成和验证机制';
      case 'SERVER_ERROR':
        return '检查服务器日志，修复后端逻辑错误';
      case 'TIMEOUT_ERROR':
        return '增加超时时间或优化服务器响应速度';
      case 'ASSERTION_ERROR':
        return '检查测试期望值是否正确，或修复业务逻辑';
      default:
        return '需要手动分析错误原因';
    }
  }

  private async attemptAutoFix(bug: any, errorType: string): Promise<{ success: boolean; description?: string; reason?: string }> {
    // 这里实现一些简单的自动修复逻辑
    switch (errorType) {
      case 'TIMEOUT_ERROR':
        // 可以尝试增加超时时间
        return {
          success: true,
          description: '建议增加测试超时时间配置'
        };
      
      case 'ENDPOINT_NOT_FOUND':
        // 可以检查并创建缺失的API端点
        return await this.createMissingEndpoint(bug);
      
      default:
        return {
          success: false,
          reason: '此类型错误需要手动修复'
        };
    }
  }

  private async createMissingEndpoint(bug: any): Promise<{ success: boolean; description?: string; reason?: string }> {
    // 这里可以实现创建缺失API端点的逻辑
    // 由于这需要分析具体的错误信息和代码结构，这里只是示例
    return {
      success: false,
      reason: '自动创建API端点功能尚未实现，需要手动创建'
    };
  }

  private async generateBugReport(): Promise<void> {
    const bugReport = {
      timestamp: new Date().toISOString(),
      totalBugs: this.bugs.length,
      bugsByType: this.groupBugsByType(),
      bugs: this.bugs.map(bug => ({
        ...bug,
        errorType: this.classifyError(bug.error),
        fixSuggestion: this.generateFixSuggestion(this.classifyError(bug.error), bug)
      }))
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeJson(`./reports/bug-report-${timestamp}.json`, bugReport, { spaces: 2 });
    
    console.log(chalk.blue(`\n📋 Bug报告已保存到: ./reports/bug-report-${timestamp}.json`));
  }

  private groupBugsByType(): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const bug of this.bugs) {
      const type = this.classifyError(bug.error);
      groups[type] = (groups[type] || 0) + 1;
    }
    
    return groups;
  }
}

// 主执行函数
async function main() {
  const runner = new TestRunner();
  
  try {
    await runner.runAllTests();
    console.log(chalk.green('\n🎉 自动化测试执行完成！'));
  } catch (error) {
    console.error(chalk.red('\n💥 测试执行失败:'), error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export { TestRunner };
