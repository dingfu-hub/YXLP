/**
 * 完整的导航栏二级菜单交互测试
 * 模拟真实用户点击行为
 */

const BASE_URL = 'http://localhost:3002';

async function simulateUserInteraction() {
  console.log('🔍 开始完整的导航栏二级菜单测试...\n');
  
  let cookies = '';
  
  try {
    // 1. 登录获取认证
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
    
    if (!loginResponse.ok) {
      throw new Error(`登录失败: ${loginResponse.status}`);
    }
    
    cookies = loginResponse.headers.get('set-cookie') || '';
    console.log('✅ 登录成功\n');
    
    // 2. 访问管理后台主页，检查页面是否包含导航栏
    console.log('2. 检查管理后台主页...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Cookie': cookies }
    });
    
    if (!dashboardResponse.ok) {
      throw new Error(`管理后台访问失败: ${dashboardResponse.status}`);
    }
    
    const dashboardHtml = await dashboardResponse.text();
    console.log('✅ 管理后台页面加载成功');
    
    // 检查是否包含导航栏相关元素
    const hasNavigation = dashboardHtml.includes('新闻管理') || 
                         dashboardHtml.includes('news') ||
                         dashboardHtml.includes('sidebar');
    console.log(`导航栏元素检测: ${hasNavigation ? '✅ 发现' : '❌ 未发现'}\n`);
    
    // 3. 测试每个二级菜单页面的访问
    console.log('3. 测试二级菜单页面访问...');
    const menuItems = [
      { name: '新闻列表', path: '/admin/news' },
      { name: 'RSS源管理', path: '/admin/news/sources' },
      { name: '新闻采集', path: '/admin/news/collect' },
      { name: '定时采集', path: '/admin/news/schedule' },
      { name: 'AI润色', path: '/admin/news/polish' },
      { name: '发布中心', path: '/admin/news/publish' },
      { name: '手动发布', path: '/admin/news/create' }
    ];
    
    const results = [];
    
    for (const item of menuItems) {
      try {
        console.log(`  测试: ${item.name} (${item.path})`);
        
        const response = await fetch(`${BASE_URL}${item.path}`, {
          headers: { 'Cookie': cookies }
        });
        
        const status = response.status;
        const html = await response.text();
        
        // 检查页面内容
        const hasError = html.includes('Error') || 
                        html.includes('404') || 
                        html.includes('Not Found') ||
                        html.includes('出现了一些问题');
        
        const hasContent = html.includes('<html') && html.length > 1000;
        
        results.push({
          name: item.name,
          path: item.path,
          status: status,
          success: status === 200 && !hasError && hasContent,
          hasError: hasError,
          contentLength: html.length
        });
        
        console.log(`    状态: ${status}, 内容长度: ${html.length}, 错误: ${hasError ? '是' : '否'}`);
        
      } catch (error) {
        results.push({
          name: item.name,
          path: item.path,
          status: 'ERROR',
          success: false,
          error: error.message
        });
        console.log(`    ❌ 错误: ${error.message}`);
      }
    }
    
    console.log('\n4. 测试结果汇总:');
    console.log('='.repeat(60));
    
    let successCount = 0;
    let totalCount = results.length;
    
    results.forEach(result => {
      const status = result.success ? '✅ 成功' : '❌ 失败';
      console.log(`${result.name.padEnd(12)} ${result.path.padEnd(25)} ${status}`);
      
      if (result.error) {
        console.log(`    错误详情: ${result.error}`);
      } else if (!result.success && result.status === 200) {
        console.log(`    问题: 页面可访问但内容异常 (长度: ${result.contentLength}, 有错误: ${result.hasError})`);
      } else if (result.status !== 200) {
        console.log(`    问题: HTTP状态码 ${result.status}`);
      }
      
      if (result.success) successCount++;
    });
    
    console.log('='.repeat(60));
    console.log(`总计: ${successCount}/${totalCount} 个菜单项可正常访问`);
    
    // 5. 检查JavaScript控制台错误（通过页面内容分析）
    console.log('\n5. 检查页面JavaScript错误...');
    
    const newsPageResponse = await fetch(`${BASE_URL}/admin/news`, {
      headers: { 'Cookie': cookies }
    });
    
    const newsPageHtml = await newsPageResponse.text();
    
    // 检查是否有React错误或hooks错误
    const hasReactError = newsPageHtml.includes('Error: ') ||
                         newsPageHtml.includes('hooks') ||
                         newsPageHtml.includes('Rendered more hooks') ||
                         newsPageHtml.includes('Application error');
    
    console.log(`React/Hooks错误检测: ${hasReactError ? '❌ 发现错误' : '✅ 无错误'}`);
    
    if (hasReactError) {
      // 尝试提取错误信息
      const errorMatch = newsPageHtml.match(/Error: ([^<]+)/);
      if (errorMatch) {
        console.log(`错误详情: ${errorMatch[1]}`);
      }
    }
    
    // 6. 最终结论
    console.log('\n🏁 测试完成');
    console.log('='.repeat(60));
    
    if (successCount === totalCount && !hasReactError) {
      console.log('🎉 所有测试通过！导航栏二级菜单功能正常');
    } else {
      console.log('⚠️  存在问题需要修复:');
      if (successCount < totalCount) {
        console.log(`   - ${totalCount - successCount} 个菜单项无法正常访问`);
      }
      if (hasReactError) {
        console.log('   - 页面存在JavaScript/React错误');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现严重错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
simulateUserInteraction();
