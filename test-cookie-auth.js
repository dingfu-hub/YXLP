/**
 * 测试Cookie认证流程
 */

const BASE_URL = 'http://localhost:3002';

async function testCookieAuth() {
  console.log('🔍 测试Cookie认证流程...\n');
  
  try {
    // 1. 执行登录并获取cookie
    console.log('1. 执行登录...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin123!'
      })
    });
    
    console.log('登录响应状态:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`登录失败: ${loginResponse.status} - ${errorText}`);
    }
    
    const loginResult = await loginResponse.json();
    console.log('登录结果:', loginResult);
    
    // 获取Set-Cookie头
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie头:', setCookieHeader);
    
    if (!setCookieHeader) {
      throw new Error('登录响应中没有Set-Cookie头');
    }
    
    // 解析cookie
    const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
    const adminTokenCookie = cookies.find(cookie => cookie.startsWith('admin_token='));
    
    if (!adminTokenCookie) {
      throw new Error('没有找到admin_token cookie');
    }
    
    console.log('Admin Token Cookie:', adminTokenCookie);
    console.log('✅ 登录成功，获取到cookie\n');
    
    // 2. 使用cookie测试/api/admin/auth/me
    console.log('2. 测试用户信息API...');
    const meResponse = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': adminTokenCookie
      }
    });
    
    console.log('用户信息API状态:', meResponse.status);
    
    if (meResponse.ok) {
      const meResult = await meResponse.json();
      console.log('用户信息:', meResult);
      console.log('✅ 用户信息API正常\n');
    } else {
      const errorText = await meResponse.text();
      console.log('❌ 用户信息API失败:', errorText);
      throw new Error(`用户信息API失败: ${meResponse.status}`);
    }
    
    // 3. 使用cookie访问管理页面
    console.log('3. 测试管理页面访问...');
    const newsPageResponse = await fetch(`${BASE_URL}/admin/news`, {
      headers: {
        'Cookie': adminTokenCookie
      }
    });
    
    console.log('新闻页面状态:', newsPageResponse.status);
    
    if (newsPageResponse.ok) {
      const html = await newsPageResponse.text();
      
      // 检查页面内容
      const isRedirecting = html.includes('正在跳转到登录页');
      const hasError = html.includes('Error') || html.includes('404');
      const hasContent = html.includes('新闻管理') || html.includes('news');
      
      console.log('页面分析:');
      console.log('  - 是否重定向到登录页:', isRedirecting ? '是' : '否');
      console.log('  - 是否包含错误:', hasError ? '是' : '否');
      console.log('  - 是否包含预期内容:', hasContent ? '是' : '否');
      console.log('  - 页面内容长度:', html.length);
      
      if (isRedirecting) {
        console.log('❌ 页面仍然重定向到登录页，说明cookie认证失败');
        
        // 保存页面内容以便分析
        const fs = require('fs');
        fs.writeFileSync('failed-page-content.html', html);
        console.log('页面内容已保存到 failed-page-content.html');
        
      } else if (hasContent) {
        console.log('✅ 页面加载成功，包含预期内容');
      } else {
        console.log('⚠️  页面加载但内容异常');
      }
      
    } else {
      console.log('❌ 管理页面访问失败:', newsPageResponse.status);
    }
    
    // 4. 测试其他二级菜单页面
    console.log('\n4. 测试其他二级菜单页面...');
    const testPages = [
      '/admin/news/sources',
      '/admin/news/collect'
    ];
    
    for (const page of testPages) {
      try {
        const response = await fetch(`${BASE_URL}${page}`, {
          headers: {
            'Cookie': adminTokenCookie
          }
        });
        
        const html = await response.text();
        const isRedirecting = html.includes('正在跳转到登录页');
        
        console.log(`${page}: ${response.status} ${isRedirecting ? '(重定向)' : '(正常)'}`);
        
      } catch (error) {
        console.log(`${page}: 错误 - ${error.message}`);
      }
    }
    
    console.log('\n🏁 Cookie认证测试完成');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testCookieAuth();
