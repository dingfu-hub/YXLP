/**
 * 测试JWT token生成和验证
 */

const { SignJWT, jwtVerify } = require('jose')

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode('yxlp_jwt_secret_key_2024')

async function testJWT() {
  try {
    console.log('🔐 开始JWT测试...\n')
    
    // 1. 生成token
    const payload = {
      userId: '1',
      username: 'superadmin',
      role: 'super_admin',
      permissions: [
        'product:view', 'product:create', 'product:update', 'product:delete',
        'order:view', 'order:update', 'order:delete',
        'user:view', 'user:update', 'user:delete',
        'news:view', 'news:create', 'news:update', 'news:delete',
        'analytics:view', 'analytics:export',
        'system:settings', 'user:management'
      ]
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    console.log('✅ Token生成成功:')
    console.log(token)
    console.log()
    
    // 2. 验证token
    const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET)
    console.log('✅ Token验证成功:')
    console.log(JSON.stringify(verifiedPayload, null, 2))
    console.log()
    
    // 3. 测试过期token
    const expiredToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('-1h') // 过期1小时
      .sign(JWT_SECRET)
    
    try {
      await jwtVerify(expiredToken, JWT_SECRET)
      console.log('❌ 过期token验证应该失败')
    } catch (error) {
      console.log('✅ 过期token正确被拒绝:', error.code)
    }
    
    console.log('\n🎉 JWT测试完成')
    
  } catch (error) {
    console.error('❌ JWT测试失败:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testJWT()
}

module.exports = { testJWT }
