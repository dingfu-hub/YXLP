#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.blue('🚀 快速测试执行器'));
console.log(chalk.gray('=' * 40));

// 简化的测试配置
const testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000/api',
  timeout: 30000
};

// 简化的API客户端
class SimpleApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async request(method, url, data = null) {
    const fullUrl = `${this.baseUrl}${url}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (this.token) {
      options.headers.Authorization = `Bearer ${this.token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const startTime = Date.now();
      const response = await fetch(fullUrl, options);
      const duration = Date.now() - startTime;
      
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      return {
        success: response.ok,
        status: response.status,
        data: responseData,
        duration
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message,
        duration: 0
      };
    }
  }

  async login(username, password) {
    const response = await this.request('POST', '/api/admin/auth/login', {
      username,
      password
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
    }

    return response;
  }

  async logout() {
    const response = await this.request('POST', '/api/admin/auth/logout');
    this.token = null;
    return response;
  }

  async getUsers() {
    return this.request('GET', '/api/admin/users');
  }

  async healthCheck() {
    return this.request('GET', '/api/health');
  }
}

// 测试结果记录器
class TestLogger {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(testId, title, status, duration, error = null) {
    const result = {
      testId,
      title,
      status,
      duration,
      error,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);

    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    const statusColor = status === 'PASS' ? chalk.green : status === 'FAIL' ? chalk.red : chalk.yellow;
    
    console.log(`${statusIcon} ${testId}: ${statusColor(title)} (${duration}ms)`);
    if (error) {
      console.log(chalk.red(`   Error: ${error}`));
    }
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const totalDuration = Date.now() - this.startTime;

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : '0',
      totalDuration
    };
  }

  printSummary() {
    const summary = this.getSummary();
    
    console.log(chalk.blue('\n📊 测试结果汇总:'));
    console.log(chalk.gray('=' * 30));
    console.log(`总测试数: ${summary.total}`);
    console.log(chalk.green(`通过: ${summary.passed}`));
    console.log(chalk.red(`失败: ${summary.failed}`));
    console.log(chalk.yellow(`跳过: ${summary.skipped}`));
    console.log(`通过率: ${summary.passRate}%`);
    console.log(`总耗时: ${summary.totalDuration}ms`);

    return summary;
  }
}

// 核心测试用例
async function runCoreTests() {
  const client = new SimpleApiClient(testConfig.baseUrl);
  const logger = new TestLogger();

  console.log(chalk.yellow('🔍 开始执行核心测试用例...'));

  // 测试1: 健康检查
  try {
    const startTime = Date.now();
    const response = await client.healthCheck();
    const duration = Date.now() - startTime;

    if (response.success && response.status === 200) {
      logger.log('HEALTH-001', '系统健康检查', 'PASS', duration);
    } else {
      logger.log('HEALTH-001', '系统健康检查', 'FAIL', duration, `HTTP ${response.status}`);
    }
  } catch (error) {
    logger.log('HEALTH-001', '系统健康检查', 'FAIL', 0, error.message);
  }

  // 测试2: 管理员正常登录
  try {
    const startTime = Date.now();
    const response = await client.login('admin', 'Admin123!');
    const duration = Date.now() - startTime;

    if (response.success && response.data?.token) {
      logger.log('AUTH-001', '管理员正常登录', 'PASS', duration);
    } else {
      logger.log('AUTH-001', '管理员正常登录', 'FAIL', duration, response.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    logger.log('AUTH-001', '管理员正常登录', 'FAIL', 0, error.message);
  }

  // 测试3: 错误用户名登录
  try {
    const startTime = Date.now();
    const response = await client.login('nonexistent', 'anypassword');
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 401) {
      logger.log('AUTH-002', '用户名不存在', 'PASS', duration);
    } else {
      logger.log('AUTH-002', '用户名不存在', 'FAIL', duration, '应该返回401错误');
    }
  } catch (error) {
    logger.log('AUTH-002', '用户名不存在', 'FAIL', 0, error.message);
  }

  // 测试4: 错误密码登录
  try {
    const startTime = Date.now();
    const response = await client.login('admin', 'wrongpassword');
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 401) {
      logger.log('AUTH-003', '密码错误', 'PASS', duration);
    } else {
      logger.log('AUTH-003', '密码错误', 'FAIL', duration, '应该返回401错误');
    }
  } catch (error) {
    logger.log('AUTH-003', '密码错误', 'FAIL', 0, error.message);
  }

  // 测试5: 空用户名登录
  try {
    const startTime = Date.now();
    const response = await client.login('', 'anypassword');
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 400) {
      logger.log('AUTH-004', '空用户名', 'PASS', duration);
    } else {
      logger.log('AUTH-004', '空用户名', 'FAIL', duration, '应该返回400错误');
    }
  } catch (error) {
    logger.log('AUTH-004', '空用户名', 'FAIL', 0, error.message);
  }

  // 测试6: 空密码登录
  try {
    const startTime = Date.now();
    const response = await client.login('admin', '');
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 400) {
      logger.log('AUTH-005', '空密码', 'PASS', duration);
    } else {
      logger.log('AUTH-005', '空密码', 'FAIL', duration, '应该返回400错误');
    }
  } catch (error) {
    logger.log('AUTH-005', '空密码', 'FAIL', 0, error.message);
  }

  // 测试7: 获取用户列表（需要先登录）
  try {
    await client.login('admin', 'Admin123!'); // 确保已登录
    const startTime = Date.now();
    const response = await client.getUsers();
    const duration = Date.now() - startTime;

    // 检查嵌套的数据结构
    const users = response.data?.data?.users || response.data?.users;

    if (response.success && users && Array.isArray(users)) {
      logger.log('USER-001', '查看用户列表', 'PASS', duration);
    } else {
      logger.log('USER-001', '查看用户列表', 'FAIL', duration,
        `Expected users array, got: ${typeof users} with ${users?.length || 0} items`);
    }
  } catch (error) {
    logger.log('USER-001', '查看用户列表', 'FAIL', 0, error.message);
  }

  // 测试8: 未授权访问
  try {
    client.token = null; // 清除token
    const startTime = Date.now();
    const response = await client.getUsers();
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 401) {
      logger.log('AUTH-019', '未登录访问保护页面', 'PASS', duration);
    } else {
      logger.log('AUTH-019', '未登录访问保护页面', 'FAIL', duration, '应该返回401错误');
    }
  } catch (error) {
    logger.log('AUTH-019', '未登录访问保护页面', 'FAIL', 0, error.message);
  }

  // 测试9: 无效Token访问
  try {
    client.token = 'invalid-token-12345';
    const startTime = Date.now();
    const response = await client.getUsers();
    const duration = Date.now() - startTime;

    if (!response.success && response.status === 401) {
      logger.log('AUTH-020', '无效Token访问', 'PASS', duration);
    } else {
      logger.log('AUTH-020', '无效Token访问', 'FAIL', duration, '应该返回401错误');
    }
  } catch (error) {
    logger.log('AUTH-020', '无效Token访问', 'FAIL', 0, error.message);
  }

  // 测试10: 正常登出
  try {
    await client.login('admin', 'Admin123!'); // 重新登录
    const startTime = Date.now();
    const response = await client.logout();
    const duration = Date.now() - startTime;

    if (response.success) {
      logger.log('AUTH-016', '正常登出', 'PASS', duration);
    } else {
      logger.log('AUTH-016', '正常登出', 'FAIL', duration, response.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    logger.log('AUTH-016', '正常登出', 'FAIL', 0, error.message);
  }

  return logger;
}

// 主执行函数
async function main() {
  console.log(chalk.blue(`测试环境: ${testConfig.baseUrl}`));
  console.log(chalk.blue(`API地址: ${testConfig.apiUrl}`));
  console.log('');

  try {
    const logger = await runCoreTests();
    const summary = logger.printSummary();

    // 保存简单报告
    const report = {
      timestamp: new Date().toISOString(),
      environment: testConfig,
      summary,
      results: logger.results
    };

    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `quick-test-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(chalk.blue(`\n📄 测试报告已保存: ${reportFile}`));

    if (summary.failed > 0) {
      console.log(chalk.red('\n❌ 存在测试失败，请检查上述错误信息'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n🎉 所有测试通过！'));
    }

  } catch (error) {
    console.error(chalk.red('\n💥 测试执行失败:'), error.message);
    process.exit(1);
  }
}

// 检查环境
async function checkEnvironment() {
  console.log(chalk.yellow('🔍 检查测试环境...'));
  
  try {
    const response = await fetch(`${testConfig.baseUrl}/api/health`);
    if (response.ok) {
      console.log(chalk.green('✅ 测试环境可访问'));
      return true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(chalk.red('❌ 测试环境不可访问'));
    console.log(chalk.yellow(`请确保应用程序正在运行在 ${testConfig.baseUrl}`));
    return false;
  }
}

// 执行
checkEnvironment().then(ready => {
  if (ready) {
    main();
  } else {
    process.exit(1);
  }
});
