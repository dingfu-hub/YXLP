/**
 * 调试页面错误内容
 */

const BASE_URL = 'http://localhost:3002';

async function debugPageErrors() {
  console.log('🔍 调试页面错误内容...\n');
  
  try {
    // 1. 登录
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });
    
    const cookies = loginResponse.headers.get('set-cookie') || '';
    
    // 2. 获取新闻页面内容并分析错误
    console.log('获取新闻页面内容...');
    const newsResponse = await fetch(`${BASE_URL}/admin/news`, {
      headers: { 'Cookie': cookies }
    });
    
    const html = await newsResponse.text();
    
    console.log('页面状态码:', newsResponse.status);
    console.log('页面内容长度:', html.length);
    console.log('\n页面内容分析:');
    console.log('='.repeat(80));
    
    // 检查是否包含错误信息
    if (html.includes('Error')) {
      console.log('❌ 发现Error关键字');
      
      // 提取错误信息
      const errorMatches = html.match(/Error[^<]*[^>]*>/g);
      if (errorMatches) {
        console.log('错误信息:');
        errorMatches.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }
    
    // 检查是否包含React错误
    if (html.includes('Application error')) {
      console.log('❌ 发现React应用错误');
    }
    
    // 检查是否包含404错误
    if (html.includes('404') || html.includes('Not Found')) {
      console.log('❌ 发现404错误');
    }
    
    // 检查是否包含"出现了一些问题"
    if (html.includes('出现了一些问题')) {
      console.log('❌ 发现中文错误提示');
    }
    
    // 提取页面标题
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      console.log('页面标题:', titleMatch[1]);
    }
    
    // 检查页面主要内容
    console.log('\n页面内容摘要:');
    console.log('-'.repeat(40));
    
    // 提取前500个字符作为内容摘要
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(bodyContent.substring(0, 500) + (bodyContent.length > 500 ? '...' : ''));
    }
    
    // 检查是否包含特定的错误页面内容
    console.log('\n错误类型分析:');
    console.log('-'.repeat(40));
    
    if (html.includes('出现了一些问题')) {
      console.log('✓ 这是Next.js的错误页面');
      
      // 尝试提取具体错误信息
      const errorDetailMatch = html.match(/页面遇到了意外错误[^<]*([^>]*)/);
      if (errorDetailMatch) {
        console.log('错误详情:', errorDetailMatch[1]);
      }
    }
    
    if (html.includes('Internal Server Error')) {
      console.log('✓ 这是500内部服务器错误');
    }
    
    if (html.includes('This page could not be found')) {
      console.log('✓ 这是404页面未找到错误');
    }
    
    // 检查JavaScript错误
    console.log('\nJavaScript错误检查:');
    console.log('-'.repeat(40));
    
    const scriptErrors = [
      'ReferenceError',
      'TypeError',
      'SyntaxError',
      'Cannot read property',
      'Cannot read properties',
      'is not defined',
      'hooks',
      'Rendered more hooks'
    ];
    
    scriptErrors.forEach(errorType => {
      if (html.includes(errorType)) {
        console.log(`❌ 发现 ${errorType} 错误`);
        
        // 尝试提取错误上下文
        const regex = new RegExp(`${errorType}[^<]*`, 'g');
        const matches = html.match(regex);
        if (matches) {
          matches.forEach(match => {
            console.log(`   ${match}`);
          });
        }
      }
    });
    
    // 保存完整的HTML内容到文件以便进一步分析
    const fs = require('fs');
    fs.writeFileSync('debug-page-content.html', html);
    console.log('\n✓ 完整页面内容已保存到 debug-page-content.html');
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  }
}

// 运行调试
debugPageErrors();
