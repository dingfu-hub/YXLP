/**
 * 生成有效的管理员JWT token用于测试
 */

const { SignJWT } = require('jose')

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode('yxlp_jwt_secret_key_2024')

// 生成token
async function generateTestToken() {
  try {
    const payload = {
      userId: 'admin_001',
      username: 'admin',
      role: 'super_admin',
      permissions: [
        'user:view', 'user:create', 'user:update', 'user:delete',
        'product:view', 'product:create', 'product:update', 'product:delete',
        'order:view', 'order:create', 'order:update', 'order:delete',
        'news:view', 'news:create', 'news:update', 'news:delete',
        'analytics:view', 'system:manage'
      ]
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    console.log('生成的测试token:')
    console.log(token)
    
    return token
  } catch (error) {
    console.error('生成token失败:', error)
    return null
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateTestToken()
}

module.exports = { generateTestToken }
