#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 YXLP项目开发环境自动设置')
console.log('================================')

// 检查Node.js版本
function checkNodeVersion() {
  console.log('📋 检查前置条件...')
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  console.log(`✅ Node.js版本: ${nodeVersion}`)
  
  if (majorVersion < 18) {
    console.error('❌ Node.js版本过低，需要 >= 18.0.0')
    console.log('请访问 https://nodejs.org/ 下载最新版本')
    process.exit(1)
  }
}

// 安装依赖
function installDependencies() {
  const packages = [
    { name: '根目录', path: '.' },
    { name: 'Web应用', path: 'apps/web' },
    { name: 'API应用', path: 'apps/api' }
  ]

  for (const pkg of packages) {
    console.log(`\n📦 安装${pkg.name}依赖...`)
    try {
      process.chdir(pkg.path)
      execSync('npm install', { stdio: 'inherit' })
      console.log(`✅ ${pkg.name}依赖安装完成`)
      
      // 回到根目录
      if (pkg.path !== '.') {
        process.chdir(path.resolve(__dirname, '..'))
      }
    } catch (error) {
      console.error(`❌ ${pkg.name}依赖安装失败`)
      process.exit(1)
    }
  }
}

// 创建环境配置文件
function createEnvFiles() {
  console.log('\n⚙️ 创建环境配置文件...')
  
  const envConfigs = [
    {
      path: 'apps/web/.env.local',
      example: 'apps/web/.env.example',
      default: `NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development`
    },
    {
      path: 'apps/api/.env.local', 
      example: 'apps/api/.env.example',
      default: `NODE_ENV=development
PORT=3001
DATABASE_PATH=data/yxlp.db
JWT_SECRET=yxlp_jwt_secret_key_2024`
    }
  ]

  for (const config of envConfigs) {
    if (!fs.existsSync(config.path)) {
      if (fs.existsSync(config.example)) {
        fs.copyFileSync(config.example, config.path)
        console.log(`✅ 创建 ${config.path}`)
      } else {
        fs.writeFileSync(config.path, config.default)
        console.log(`✅ 创建基本的 ${config.path}`)
      }
    } else {
      console.log(`⚠️ ${config.path} 已存在，跳过`)
    }
  }
}

// 创建数据目录
function createDataDirectories() {
  console.log('\n📁 创建数据目录...')
  const directories = ['apps/web/data', 'apps/api/data']
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ 创建目录: ${dir}`)
    } else {
      console.log(`⚠️ 目录已存在: ${dir}`)
    }
  }
}

// 检查端口占用
function checkPorts() {
  console.log('\n🔍 检查端口占用...')
  const { exec } = require('child_process')
  const ports = [3000, 3001]
  
  ports.forEach(port => {
    exec(`netstat -an | grep :${port}`, (error, stdout) => {
      if (stdout) {
        console.log(`⚠️ 端口 ${port} 可能被占用`)
      } else {
        console.log(`✅ 端口 ${port} 可用`)
      }
    })
  })
}

// 初始化数据库
function initializeDatabase() {
  console.log('\n🗄️ 检查数据库...')

  const dbPath = 'apps/api/data/yxlp.db'

  if (!fs.existsSync(dbPath)) {
    console.log('📝 数据库不存在，将在首次启动时自动创建')
    console.log('💡 数据库表结构和初始数据会自动生成')
  } else {
    const stats = fs.statSync(dbPath)
    console.log(`✅ 数据库已存在 (${Math.round(stats.size / 1024)}KB)`)
  }

  // 确保数据目录存在
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('📁 创建数据目录')
  }
}

// 主函数
function main() {
  try {
    checkNodeVersion()
    installDependencies()
    createEnvFiles()
    createDataDirectories()
    checkPorts()
    
    console.log('\n🎉 开发环境设置完成！')
    console.log('================================')
    // 初始化数据库（如果不存在）
    initializeDatabase()

    console.log('📝 接下来的步骤:')
    console.log('1. 启动开发服务器: npm run dev')
    console.log('2. 访问前端应用: http://localhost:3000')
    console.log('3. 访问管理后台: http://localhost:3000/admin')
    console.log('4. 访问API文档: http://localhost:3001/api/docs')
    console.log('\n💡 提示:')
    console.log('- 默认管理员账号: admin / admin123')
    console.log('- 数据库文件位置: apps/api/data/yxlp.db')
    console.log('- 如遇问题请查看 项目启动指南.md')
    
  } catch (error) {
    console.error('❌ 设置过程中出现错误:', error.message)
    process.exit(1)
  }
}

main()
