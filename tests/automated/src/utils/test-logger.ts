import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface TestResult {
  testId: string;
  title: string;
  module: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  duration: number;
  error?: string;
  screenshot?: string;
  timestamp: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  results: TestResult[];
}

export class TestLogger {
  private suites: Map<string, TestSuite> = new Map();
  private currentSuite: string | null = null;
  private outputDir: string;

  constructor(outputDir: string = './reports') {
    this.outputDir = outputDir;
    fs.ensureDirSync(this.outputDir);
  }

  startSuite(name: string): void {
    const suite: TestSuite = {
      name,
      startTime: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      results: []
    };
    
    this.suites.set(name, suite);
    this.currentSuite = name;
    
    console.log(chalk.blue(`\n🚀 Starting test suite: ${name}`));
    console.log(chalk.gray(`Started at: ${suite.startTime}`));
  }

  endSuite(name: string): void {
    const suite = this.suites.get(name);
    if (!suite) return;

    suite.endTime = new Date().toISOString();
    suite.duration = new Date(suite.endTime).getTime() - new Date(suite.startTime).getTime();

    console.log(chalk.blue(`\n✅ Completed test suite: ${name}`));
    console.log(chalk.gray(`Duration: ${suite.duration}ms`));
    console.log(chalk.green(`Passed: ${suite.passed}`));
    console.log(chalk.red(`Failed: ${suite.failed}`));
    console.log(chalk.yellow(`Skipped: ${suite.skipped}`));
    console.log(chalk.magenta(`Errors: ${suite.errors}`));

    this.currentSuite = null;
  }

  logResult(result: TestResult): void {
    if (!this.currentSuite) {
      throw new Error('No active test suite. Call startSuite() first.');
    }

    const suite = this.suites.get(this.currentSuite)!;
    suite.results.push(result);
    suite.totalTests++;

    switch (result.status) {
      case 'PASS':
        suite.passed++;
        console.log(chalk.green(`✅ ${result.testId}: ${result.title} (${result.duration}ms)`));
        break;
      case 'FAIL':
        suite.failed++;
        console.log(chalk.red(`❌ ${result.testId}: ${result.title} (${result.duration}ms)`));
        if (result.error) {
          console.log(chalk.red(`   Error: ${result.error}`));
        }
        break;
      case 'SKIP':
        suite.skipped++;
        console.log(chalk.yellow(`⏭️  ${result.testId}: ${result.title} (skipped)`));
        break;
      case 'ERROR':
        suite.errors++;
        console.log(chalk.magenta(`💥 ${result.testId}: ${result.title} (error)`));
        if (result.error) {
          console.log(chalk.magenta(`   Error: ${result.error}`));
        }
        break;
    }
  }

  async generateReport(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      suites: Array.from(this.suites.values())
    };

    await fs.writeJson(
      path.join(this.outputDir, `test-report-${timestamp}.json`),
      jsonReport,
      { spaces: 2 }
    );

    // Generate HTML report
    await this.generateHtmlReport(jsonReport, timestamp);

    // Generate JUnit XML report
    await this.generateJunitReport(jsonReport, timestamp);

    console.log(chalk.blue(`\n📊 Test reports generated in: ${this.outputDir}`));
  }

  private getSummary() {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalDuration = 0;

    for (const suite of this.suites.values()) {
      totalTests += suite.totalTests;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalSkipped += suite.skipped;
      totalErrors += suite.errors;
      totalDuration += suite.duration || 0;
    }

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalErrors,
      totalDuration,
      passRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) : '0'
    };
  }

  private async generateHtmlReport(report: any, timestamp: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自动化测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .skip { color: #ffc107; }
        .error { color: #6f42c1; }
        .suite { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #007bff; color: white; padding: 15px; }
        .test-result { padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .test-result:last-child { border-bottom: none; }
        .test-result.pass { background-color: #d4edda; }
        .test-result.fail { background-color: #f8d7da; }
        .test-result.skip { background-color: #fff3cd; }
        .test-result.error { background-color: #e2d9f3; }
        .test-id { font-weight: bold; }
        .test-title { flex: 1; margin: 0 15px; }
        .test-duration { color: #666; font-size: 0.9em; }
        .error-message { color: #721c24; font-size: 0.9em; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>智能新闻管理系统 - 自动化测试报告</h1>
            <p>生成时间: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>总测试数</h3>
                <div class="number">${report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>通过</h3>
                <div class="number pass">${report.summary.totalPassed}</div>
            </div>
            <div class="summary-card">
                <h3>失败</h3>
                <div class="number fail">${report.summary.totalFailed}</div>
            </div>
            <div class="summary-card">
                <h3>跳过</h3>
                <div class="number skip">${report.summary.totalSkipped}</div>
            </div>
            <div class="summary-card">
                <h3>错误</h3>
                <div class="number error">${report.summary.totalErrors}</div>
            </div>
            <div class="summary-card">
                <h3>通过率</h3>
                <div class="number">${report.summary.passRate}%</div>
            </div>
        </div>

        ${report.suites.map((suite: any) => `
        <div class="suite">
            <div class="suite-header">
                <h2>${suite.name}</h2>
                <p>执行时间: ${suite.duration}ms | 通过: ${suite.passed} | 失败: ${suite.failed} | 跳过: ${suite.skipped} | 错误: ${suite.errors}</p>
            </div>
            ${suite.results.map((result: any) => `
            <div class="test-result ${result.status.toLowerCase()}">
                <span class="test-id">${result.testId}</span>
                <span class="test-title">${result.title}</span>
                <span class="test-duration">${result.duration}ms</span>
                ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
            </div>
            `).join('')}
        </div>
        `).join('')}
    </div>
</body>
</html>`;

    await fs.writeFile(
      path.join(this.outputDir, `test-report-${timestamp}.html`),
      html
    );
  }

  private async generateJunitReport(report: any, timestamp: string): Promise<void> {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="智能新闻管理系统测试" tests="${report.summary.totalTests}" failures="${report.summary.totalFailed}" errors="${report.summary.totalErrors}" time="${report.summary.totalDuration / 1000}">
${report.suites.map((suite: any) => `
  <testsuite name="${suite.name}" tests="${suite.totalTests}" failures="${suite.failed}" errors="${suite.errors}" time="${(suite.duration || 0) / 1000}">
${suite.results.map((result: any) => `
    <testcase classname="${result.module}" name="${result.title}" time="${result.duration / 1000}">
${result.status === 'FAIL' ? `      <failure message="${result.error || 'Test failed'}">${result.error || 'Test failed'}</failure>` : ''}
${result.status === 'ERROR' ? `      <error message="${result.error || 'Test error'}">${result.error || 'Test error'}</error>` : ''}
${result.status === 'SKIP' ? `      <skipped/>` : ''}
    </testcase>`).join('')}
  </testsuite>`).join('')}
</testsuites>`;

    await fs.writeFile(
      path.join(this.outputDir, `test-report-${timestamp}.xml`),
      xml
    );
  }
}
