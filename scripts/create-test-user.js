/**
 * 创建测试用户脚本
 * 用于在API数据库中创建测试用户账户
 */

const axios = require('axios');

// API服务器配置
const API_BASE_URL = 'http://localhost:3333';

// 测试用户数据
const testUsers = [
  {
    email: 'admin@yxlp.com',
    password: 'Admin123!',
    confirmPassword: 'Admin123!',
    role: 'admin',
    firstName: '管理员',
    lastName: '测试',
    username: 'admin',
    phone: '+86-13800138000',
    country: 'CN',
    language: 'zh',
    acceptTerms: true,
    company: {
      name: 'YXLP测试公司',
      description: '系统管理公司'
    }
  },
  {
    email: 'user@yxlp.com',
    password: 'User123!',
    confirmPassword: 'User123!',
    role: 'customer',
    firstName: '普通用户',
    lastName: '测试',
    username: 'testuser',
    phone: '+86-13800138001',
    country: 'CN',
    language: 'zh',
    acceptTerms: true,
    company: {
      name: '测试客户公司',
      description: '测试客户公司'
    }
  },
  {
    email: 'distributor@yxlp.com',
    password: 'Dist123!',
    confirmPassword: 'Dist123!',
    role: 'distributor',
    firstName: '经销商',
    lastName: '测试',
    username: 'distributor',
    phone: '+86-13800138002',
    country: 'CN',
    language: 'zh',
    acceptTerms: true,
    company: {
      name: '测试经销商公司',
      description: '测试经销商公司'
    }
  }
];

// 创建用户函数
async function createUser(userData) {
  try {
    console.log(`🔄 正在创建用户: ${userData.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log(`✅ 用户创建成功: ${userData.email}`);
    console.log(`   - 响应数据:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ 用户创建失败: ${userData.email}`);
      console.log(`   - 状态码: ${error.response.status}`);
      console.log(`   - 响应数据:`, JSON.stringify(error.response.data, null, 2));

      // 如果是用户已存在的错误，不算失败
      if (error.response.status === 409) {
        console.log(`ℹ️  用户 ${userData.email} 已存在，跳过创建`);
        return { skipped: true };
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`❌ 无法连接到API服务器: ${API_BASE_URL}`);
      console.log('   请确保API服务器正在运行');
    } else {
      console.log(`❌ 网络错误: ${error.message}`);
    }
    return null;
  }
}

// 测试登录函数
async function testLogin(email, password) {
  try {
    console.log(`🔄 测试登录: ${email}`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log(`✅ 登录测试成功: ${email}`);
    console.log(`   - 响应数据:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ 登录测试失败: ${email}`);
      console.log(`   - 状态码: ${error.response.status}`);
      console.log(`   - 响应数据:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`❌ 登录测试网络错误: ${error.message}`);
    }
    return null;
  }
}

// 检查API服务器状态
async function checkApiServer() {
  try {
    console.log('🔄 检查API服务器状态...');
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    
    if (response.status === 200) {
      console.log('✅ API服务器运行正常');
      return true;
    } else {
      console.log(`❌ API服务器状态异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 无法连接到API服务器');
      console.log('   请确保API服务器正在 http://localhost:3333 运行');
    } else {
      console.log(`❌ API服务器检查失败: ${error.message}`);
    }
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始创建测试用户...');
  console.log(`📡 API服务器地址: ${API_BASE_URL}`);
  console.log('');
  
  // 检查API服务器
  const serverOk = await checkApiServer();
  if (!serverOk) {
    console.log('');
    console.log('❌ 无法连接到API服务器，请先启动API服务器：');
    console.log('   cd apps/api && npm run dev');
    process.exit(1);
  }
  
  console.log('');
  
  // 创建用户
  let successCount = 0;
  let skipCount = 0;
  
  for (const userData of testUsers) {
    const result = await createUser(userData);
    if (result) {
      if (result.skipped) {
        skipCount++;
      } else {
        successCount++;
      }
    }
    console.log(''); // 空行分隔
  }
  
  console.log('📊 创建结果统计:');
  console.log(`   ✅ 成功创建: ${successCount} 个用户`);
  console.log(`   ⏭️  跳过创建: ${skipCount} 个用户`);
  console.log(`   ❌ 创建失败: ${testUsers.length - successCount - skipCount} 个用户`);
  console.log('');
  
  // 测试登录
  if (successCount > 0 || skipCount > 0) {
    console.log('🔐 开始测试登录功能...');
    console.log('');
    
    for (const userData of testUsers) {
      await testLogin(userData.email, userData.password);
      console.log(''); // 空行分隔
    }
  }
  
  console.log('✨ 测试用户创建完成！');
  console.log('');
  console.log('📝 测试账户信息:');
  testUsers.forEach(user => {
    console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 脚本执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = { createUser, testLogin, checkApiServer };
