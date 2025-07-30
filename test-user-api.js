// 用户管理API测试脚本

const baseUrl = 'http://localhost:3001'

// 检查fetch是否可用
if (typeof fetch === 'undefined') {
  console.log('需要安装node-fetch或使用Node.js 18+')
  process.exit(1)
}

// 测试用户注册
async function testRegister() {
  console.log('测试用户注册...')
  
  const registerData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    firstName: '测试',
    lastName: '用户',
    acceptTerms: true,
    acceptPrivacy: true
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    })

    const result = await response.json()
    console.log('注册结果:', result)
    
    if (result.success) {
      console.log('✅ 用户注册成功')
      return result.data
    } else {
      console.log('❌ 用户注册失败:', result.message)
      return null
    }
  } catch (error) {
    console.error('❌ 注册请求失败:', error.message)
    return null
  }
}

// 测试用户登录
async function testLogin() {
  console.log('\n测试用户登录...')
  
  const loginData = {
    identifier: 'testuser',
    password: 'TestPass123!'
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    const result = await response.json()
    console.log('登录结果:', result)
    
    if (result.success) {
      console.log('✅ 用户登录成功')
      return result.data
    } else {
      console.log('❌ 用户登录失败:', result.message)
      return null
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message)
    return null
  }
}

// 测试获取用户列表
async function testGetUsers(token) {
  console.log('\n测试获取用户列表...')
  
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    console.log('用户列表结果:', result)
    
    if (result.success) {
      console.log('✅ 获取用户列表成功')
      console.log(`找到 ${result.data.total} 个用户`)
      return result.data
    } else {
      console.log('❌ 获取用户列表失败:', result.message)
      return null
    }
  } catch (error) {
    console.error('❌ 获取用户列表请求失败:', error.message)
    return null
  }
}

// 测试注册配置
async function testRegisterConfig() {
  console.log('测试注册配置...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'GET'
    })

    const result = await response.json()
    console.log('注册配置:', result)
    
    if (result.success) {
      console.log('✅ 获取注册配置成功')
      return result.data
    } else {
      console.log('❌ 获取注册配置失败')
      return null
    }
  } catch (error) {
    console.error('❌ 获取注册配置失败:', error.message)
    return null
  }
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始用户管理API测试\n')
  
  // 1. 测试注册配置
  await testRegisterConfig()
  
  // 2. 测试用户注册
  const registerResult = await testRegister()
  
  // 3. 测试用户登录
  const loginResult = await testLogin()
  
  // 4. 如果登录成功，测试获取用户列表
  if (loginResult && loginResult.accessToken) {
    await testGetUsers(loginResult.accessToken)
  }
  
  console.log('\n🏁 测试完成')
}

// 运行测试
runTests().catch(console.error)
