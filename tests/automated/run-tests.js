#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error(chalk.red('❌ 需要Node.js 16或更高版本'));
  console.error(chalk.yellow(`当前版本: ${nodeVersion}`));
  process.exit(1);
}

console.log(chalk.blue('🚀 智能新闻管理系统 - 自动化测试套件'));
console.log(chalk.gray('=' * 60));

async function checkDependencies() {
  console.log(chalk.yellow('📦 检查依赖包...'));
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.red('❌ package.json 不存在'));
    console.log(chalk.yellow('正在初始化项目...'));
    
    // 运行npm install
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      npm.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ 依赖包安装完成'));
          resolve();
        } else {
          console.log(chalk.red('❌ 依赖包安装失败'));
          reject(new Error('npm install failed'));
        }
      });
    });
  } else {
    console.log(chalk.green('✅ 依赖包检查完成'));
  }
}

async function checkTestEnvironment() {
  console.log(chalk.yellow('🔍 检查测试环境...'));
  
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log(chalk.green('✅ 测试环境可访问'));
      return true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(chalk.red('❌ 测试环境不可访问'));
    console.log(chalk.yellow(`请确保应用程序正在运行在 ${baseUrl}`));
    console.log(chalk.gray('提示: 在apps/web目录下运行 npm run dev'));
    return false;
  }
}

async function runTests() {
  console.log(chalk.blue('🧪 开始执行测试...'));
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('npx', ['ts-node', 'src/test-runner.ts'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ 测试执行完成'));
        resolve();
      } else {
        console.log(chalk.red('\n❌ 测试执行失败'));
        reject(new Error(`Test runner exited with code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(chalk.red('❌ 启动测试失败:'), error.message);
      reject(error);
    });
  });
}

async function generateSummary() {
  console.log(chalk.blue('📊 生成测试摘要...'));
  
  const reportsDir = path.join(__dirname, 'reports');
  
  if (!await fs.pathExists(reportsDir)) {
    console.log(chalk.yellow('⚠️  没有找到测试报告'));
    return;
  }
  
  const files = await fs.readdir(reportsDir);
  const summaryFiles = files.filter(f => f.startsWith('test-summary-'));
  
  if (summaryFiles.length === 0) {
    console.log(chalk.yellow('⚠️  没有找到测试摘要文件'));
    return;
  }
  
  // 获取最新的摘要文件
  const latestSummary = summaryFiles.sort().reverse()[0];
  const summaryPath = path.join(reportsDir, latestSummary);
  
  try {
    const summary = await fs.readJson(summaryPath);
    
    console.log(chalk.blue('\n📈 测试结果摘要:'));
    console.log(chalk.gray('=' * 40));
    console.log(`总测试数: ${summary.summary.totalTests}`);
    console.log(chalk.green(`通过: ${summary.summary.totalPassed}`));
    console.log(chalk.red(`失败: ${summary.summary.totalFailed}`));
    console.log(chalk.yellow(`跳过: ${summary.summary.totalSkipped}`));
    console.log(`通过率: ${summary.summary.passRate}`);
    
    if (summary.failedTests && summary.failedTests.length > 0) {
      console.log(chalk.red('\n❌ 失败的测试:'));
      summary.failedTests.slice(0, 5).forEach(test => {
        console.log(chalk.red(`  - ${test}`));
      });
      
      if (summary.failedTests.length > 5) {
        console.log(chalk.gray(`  ... 还有 ${summary.failedTests.length - 5} 个失败的测试`));
      }
    }
    
    console.log(chalk.blue(`\n📄 详细报告: ${summaryPath}`));
    
    // 检查是否有bug报告
    const bugFiles = files.filter(f => f.startsWith('bug-report-'));
    if (bugFiles.length > 0) {
      const latestBugReport = bugFiles.sort().reverse()[0];
      console.log(chalk.yellow(`🐛 Bug报告: ${path.join(reportsDir, latestBugReport)}`));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ 读取测试摘要失败:'), error.message);
  }
}

async function main() {
  try {
    // 检查依赖
    await checkDependencies();
    
    // 检查测试环境
    const envReady = await checkTestEnvironment();
    if (!envReady) {
      console.log(chalk.yellow('\n💡 启动应用程序的步骤:'));
      console.log(chalk.gray('1. cd apps/web'));
      console.log(chalk.gray('2. npm install'));
      console.log(chalk.gray('3. npm run dev'));
      console.log(chalk.gray('4. 等待应用启动后重新运行测试'));
      process.exit(1);
    }
    
    // 运行测试
    await runTests();
    
    // 生成摘要
    await generateSummary();
    
    console.log(chalk.green('\n🎉 自动化测试流程完成！'));
    
  } catch (error) {
    console.error(chalk.red('\n💥 执行失败:'), error.message);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法: node run-tests.js [选项]

选项:
  --help, -h     显示帮助信息
  --env-check    仅检查环境，不运行测试
  --summary      仅显示最新的测试摘要

环境变量:
  TEST_BASE_URL  测试环境基础URL (默认: http://localhost:3000)
  TEST_API_URL   测试API URL (默认: http://localhost:3000/api)
  TEST_TIMEOUT   测试超时时间 (默认: 30000ms)

示例:
  node run-tests.js                    # 运行完整测试
  node run-tests.js --env-check        # 仅检查环境
  node run-tests.js --summary          # 显示测试摘要
  TEST_BASE_URL=http://localhost:3001 node run-tests.js  # 使用自定义URL
`);
  process.exit(0);
}

if (args.includes('--env-check')) {
  checkTestEnvironment().then(ready => {
    process.exit(ready ? 0 : 1);
  });
} else if (args.includes('--summary')) {
  generateSummary().then(() => {
    process.exit(0);
  });
} else {
  main();
}

// 优雅退出处理
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⏹️  测试被用户中断'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⏹️  测试被系统终止'));
  process.exit(0);
});
