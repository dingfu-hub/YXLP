/**
 * 测试导航栏二级菜单功能
 */

const BASE_URL = 'http://localhost:3002';

async function testNavigation() {
  console.log('🧪 开始测试导航栏二级菜单功能...');
  
  try {
    // 1. 测试登录页面
    console.log('\n1. 测试登录页面访问...');
    const loginResponse = await fetch(`${BASE_URL}/admin/login`);
    console.log(`登录页面状态: ${loginResponse.status}`);
    
    // 2. 执行登录
    console.log('\n2. 执行管理员登录...');
    const loginData = {
      username: 'admin',
      password: 'Admin123!'
    };
    
    const authResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    if (authResponse.ok) {
      const authResult = await authResponse.json();
      console.log('✅ 登录成功');
      
      // 获取cookie
      const cookies = authResponse.headers.get('set-cookie');
      console.log('Cookie获取:', cookies ? '成功' : '失败');
      
      // 3. 测试管理后台页面
      console.log('\n3. 测试管理后台页面访问...');
      const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      console.log(`管理后台状态: ${dashboardResponse.status}`);
      
      // 4. 测试二级菜单页面
      console.log('\n4. 测试二级菜单页面访问...');
      const menuPages = [
        '/admin/news',
        '/admin/news/sources',
        '/admin/news/collect'
      ];
      
      for (const page of menuPages) {
        try {
          const pageResponse = await fetch(`${BASE_URL}${page}`, {
            headers: {
              'Cookie': cookies || ''
            }
          });
          console.log(`${page}: ${pageResponse.status === 200 ? '✅' : '❌'} (${pageResponse.status})`);
        } catch (error) {
          console.log(`${page}: ❌ 错误 - ${error.message}`);
        }
      }
      
      // 5. 测试API端点
      console.log('\n5. 测试相关API端点...');
      const apiEndpoints = [
        '/api/admin/auth/me',
        '/api/admin/news',
        '/api/admin/news/sources'
      ];
      
      for (const endpoint of apiEndpoints) {
        try {
          const apiResponse = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
              'Cookie': cookies || ''
            }
          });
          console.log(`${endpoint}: ${apiResponse.status === 200 ? '✅' : '❌'} (${apiResponse.status})`);
        } catch (error) {
          console.log(`${endpoint}: ❌ 错误 - ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ 登录失败:', authResponse.status);
      const errorText = await authResponse.text();
      console.log('错误详情:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
  
  console.log('\n🏁 导航栏测试完成');
}

// 运行测试
testNavigation();
