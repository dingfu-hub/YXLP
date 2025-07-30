/**
 * 检查当前用户的权限
 */

const BASE_URL = 'http://localhost:3002';

async function checkUserPermissions() {
  console.log('🔍 检查用户权限...\n');
  
  try {
    // 1. 登录
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });
    
    const cookies = loginResponse.headers.get('set-cookie') || '';
    console.log('✅ 登录成功');
    
    // 2. 获取用户信息
    const meResponse = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { 'Cookie': cookies }
    });
    
    if (meResponse.ok) {
      const response = await meResponse.json();
      const userInfo = response.data; // 修正：从data字段获取用户信息
      console.log('👤 用户信息:');
      console.log('  用户名:', userInfo.username);
      console.log('  角色:', userInfo.role);
      console.log('  权限数量:', userInfo.permissions ? userInfo.permissions.length : 0);
      
      if (userInfo.permissions) {
        console.log('\n🔑 用户权限列表:');
        userInfo.permissions.forEach((permission, index) => {
          console.log(`  ${index + 1}. ${permission}`);
        });
        
        // 检查新闻相关权限
        console.log('\n📰 新闻相关权限检查:');
        const newsPermissions = [
          'news:view',
          'news:create',
          'news:update',
          'news:delete'
        ];

        newsPermissions.forEach(permission => {
          const hasPermission = userInfo.permissions.includes(permission);
          console.log(`  ${permission}: ${hasPermission ? '✅ 有' : '❌ 无'}`);
        });
        
        // 分析菜单过滤问题
        console.log('\n🔍 菜单过滤分析:');
        console.log('新闻管理父菜单需要权限: news:view');
        console.log('新闻管理子菜单需要权限: news:create, news:update等');

        const hasNewsView = userInfo.permissions.includes('news:view');
        const hasNewsCreate = userInfo.permissions.includes('news:create');
        
        if (!hasNewsView && hasNewsCreate) {
          console.log('❌ 问题发现: 用户有子菜单权限但没有父菜单权限');
          console.log('   这会导致整个新闻管理菜单被隐藏');
        } else if (hasNewsView) {
          console.log('✅ 用户有父菜单权限，菜单应该显示');
        } else {
          console.log('❌ 用户没有任何新闻相关权限');
        }
        
      } else {
        console.log('❌ 用户信息中没有权限数据');
      }
      
    } else {
      console.log('❌ 获取用户信息失败:', meResponse.status);
    }
    
  } catch (error) {
    console.error('❌ 检查权限时出错:', error.message);
  }
}

// 运行检查
checkUserPermissions();
