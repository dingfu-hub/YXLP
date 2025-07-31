#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')

console.log('🚀 YXLP项目一键启动')
console.log('===================')
console.log('正在自动完成所有设置...\n')

// 检查Node.js版本
function checkNodeVersion() {
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  console.log(`✅ Node.js版本: ${nodeVersion}`)
  
  if (majorVersion < 18) {
    console.error('❌ Node.js版本过低，需要 >= 18.0.0')
    console.log('请访问 https://nodejs.org/ 下载最新版本')
    process.exit(1)
  }
}

// 安装所有依赖
function installAllDependencies() {
  console.log('📦 安装项目依赖...')
  
  const packages = [
    { name: '根目录', path: '.' },
    { name: 'Web应用', path: 'apps/web' },
    { name: 'API应用', path: 'apps/api' }
  ]

  for (const pkg of packages) {
    console.log(`   安装${pkg.name}依赖...`)
    try {
      const originalCwd = process.cwd()
      process.chdir(pkg.path)
      
      // 静默安装，只显示错误
      execSync('npm install', { 
        stdio: ['ignore', 'ignore', 'pipe'],
        cwd: process.cwd()
      })
      
      process.chdir(originalCwd)
      console.log(`   ✅ ${pkg.name}依赖安装完成`)
    } catch (error) {
      console.error(`   ❌ ${pkg.name}依赖安装失败:`, error.message)
      process.exit(1)
    }
  }
}

// 创建环境配置文件
function createEnvFiles() {
  console.log('⚙️ 创建环境配置...')
  
  const envConfigs = [
    {
      path: 'apps/web/.env.local',
      content: `NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=YXLP
NEXT_PUBLIC_APP_VERSION=1.0.0
`
    },
    {
      path: 'apps/api/.env.local', 
      content: `NODE_ENV=development
PORT=3001
DATABASE_PATH=data/yxlp.db
JWT_SECRET=yxlp_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
`
    }
  ]

  for (const config of envConfigs) {
    if (!fs.existsSync(config.path)) {
      // 确保目录存在
      const dir = path.dirname(config.path)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(config.path, config.content)
      console.log(`   ✅ 创建 ${config.path}`)
    } else {
      console.log(`   ✅ ${config.path} 已存在`)
    }
  }
}

// 初始化数据库
function initializeDatabase() {
  console.log('🗄️ 初始化数据库...')
  
  const dbPath = 'apps/api/data/yxlp.db'
  const dataDir = path.dirname(dbPath)
  
  // 确保数据目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('   📁 创建数据目录')
  }
  
  if (!fs.existsSync(dbPath)) {
    console.log('   📝 数据库将在首次启动时自动创建')
  } else {
    const stats = fs.statSync(dbPath)
    console.log(`   ✅ 数据库已存在 (${Math.round(stats.size / 1024)}KB)`)
  }
}

// 检查端口是否被占用
function checkPorts() {
  console.log('🔍 检查端口占用...')
  
  const ports = [3000, 3001]
  
  for (const port of ports) {
    try {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' })
      console.log(`   ⚠️  端口 ${port} 被占用，启动时会自动选择其他端口`)
    } catch (error) {
      console.log(`   ✅ 端口 ${port} 可用`)
    }
  }
}

// 启动开发服务器
function startDevServer() {
  console.log('🚀 启动开发服务器...')
  console.log('   请稍等，正在启动前端和后端服务...\n')
  
  // 使用spawn启动开发服务器，保持输出
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  })
  
  // 监听进程退出
  devProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ 开发服务器启动失败，退出码: ${code}`)
      process.exit(1)
    }
  })
  
  // 监听错误
  devProcess.on('error', (error) => {
    console.error('❌ 启动开发服务器时出错:', error.message)
    process.exit(1)
  })
  
  // 显示访问信息
  setTimeout(() => {
    console.log('\n🎉 项目启动成功！')
    console.log('📱 访问地址:')
    console.log('   前端应用: http://localhost:3000')
    console.log('   管理后台: http://localhost:3000/admin')
    console.log('   API接口: http://localhost:3001')
    console.log('   API文档: http://localhost:3001/api/docs')
    console.log('\n🔑 默认账号:')
    console.log('   管理员: admin / admin123')
    console.log('\n💡 提示: 按 Ctrl+C 停止服务器')
  }, 3000)
}

// 主函数
async function main() {
  try {
    checkNodeVersion()
    installAllDependencies()
    createEnvFiles()
    initializeDatabase()
    checkPorts()
    
    console.log('\n✅ 所有准备工作完成！')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    startDevServer()
    
  } catch (error) {
    console.error('\n❌ 启动过程中出现错误:', error.message)
    console.log('\n🔧 可能的解决方案:')
    console.log('1. 检查网络连接')
    console.log('2. 确保Node.js版本 >= 18')
    console.log('3. 尝试删除node_modules后重新运行')
    console.log('4. 查看详细错误信息并搜索解决方案')
    process.exit(1)
  }
}

main()
