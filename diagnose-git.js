#!/usr/bin/env node

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🔍 Git环境诊断工具')
console.log('==================')

// 项目路径
const projectPath = 'c:\\Users\\付立定\\Documents\\augment-projects\\yxlp'

console.log('📋 系统信息:')
console.log('- 操作系统:', os.platform(), os.release())
console.log('- Node.js版本:', process.version)
console.log('- 当前工作目录:', process.cwd())
console.log('- 项目路径:', projectPath)

// 检查项目目录是否存在
console.log('\n📁 检查项目目录:')
if (fs.existsSync(projectPath)) {
  console.log('✅ 项目目录存在')
  
  // 检查是否是Git仓库
  const gitDir = path.join(projectPath, '.git')
  if (fs.existsSync(gitDir)) {
    console.log('✅ 是Git仓库')
  } else {
    console.log('❌ 不是Git仓库')
  }
} else {
  console.log('❌ 项目目录不存在')
  process.exit(1)
}

// 检查Git安装
console.log('\n🔧 检查Git安装:')
const gitPaths = [
  'git',
  'C:\\Program Files\\Git\\bin\\git.exe',
  'C:\\Program Files (x86)\\Git\\bin\\git.exe',
  'C:\\Git\\bin\\git.exe'
]

let workingGitPath = null

for (const gitPath of gitPaths) {
  try {
    const result = execSync(`"${gitPath}" --version`, { 
      encoding: 'utf8',
      timeout: 5000,
      cwd: projectPath
    })
    console.log(`✅ ${gitPath}: ${result.trim()}`)
    if (!workingGitPath) workingGitPath = gitPath
  } catch (error) {
    console.log(`❌ ${gitPath}: 不可用`)
  }
}

if (!workingGitPath) {
  console.log('\n❌ 未找到可用的Git安装')
  console.log('🔧 解决方案:')
  console.log('1. 安装Git: https://git-scm.com/download/windows')
  console.log('2. 确保Git在PATH环境变量中')
  console.log('3. 重启命令行工具')
  process.exit(1)
}

// 检查Git配置
console.log('\n⚙️ 检查Git配置:')
try {
  process.chdir(projectPath)
  
  const userName = execSync(`"${workingGitPath}" config user.name`, { 
    encoding: 'utf8',
    cwd: projectPath 
  }).trim()
  const userEmail = execSync(`"${workingGitPath}" config user.email`, { 
    encoding: 'utf8',
    cwd: projectPath 
  }).trim()
  
  console.log(`✅ 用户名: ${userName}`)
  console.log(`✅ 邮箱: ${userEmail}`)
} catch (error) {
  console.log('⚠️ Git配置不完整，正在设置...')
  try {
    execSync(`"${workingGitPath}" config user.name "YXLP Developer"`, { cwd: projectPath })
    execSync(`"${workingGitPath}" config user.email "developer@yxlp.com"`, { cwd: projectPath })
    console.log('✅ Git配置已设置')
  } catch (configError) {
    console.log('❌ 无法设置Git配置:', configError.message)
  }
}

// 检查Git状态
console.log('\n📊 检查Git状态:')
try {
  const status = execSync(`"${workingGitPath}" status --porcelain`, { 
    encoding: 'utf8',
    cwd: projectPath 
  })
  
  if (status.trim()) {
    console.log('📝 有未提交的更改:')
    console.log(status)
  } else {
    console.log('✅ 工作目录干净')
  }
} catch (error) {
  console.log('❌ 无法检查Git状态:', error.message)
}

// 检查远程仓库
console.log('\n🌐 检查远程仓库:')
try {
  const remotes = execSync(`"${workingGitPath}" remote -v`, { 
    encoding: 'utf8',
    cwd: projectPath 
  })
  console.log('✅ 远程仓库:')
  console.log(remotes)
} catch (error) {
  console.log('❌ 无法检查远程仓库:', error.message)
}

// 尝试执行Git操作
console.log('\n🚀 尝试执行Git操作:')
try {
  console.log('📦 添加文件...')
  execSync(`"${workingGitPath}" add .`, { cwd: projectPath })
  console.log('✅ 添加成功')
  
  console.log('💾 提交更改...')
  execSync(`"${workingGitPath}" commit -m "feat: 实现真正的一键启动方案"`, { cwd: projectPath })
  console.log('✅ 提交成功')
  
  console.log('🌐 推送到远程...')
  execSync(`"${workingGitPath}" push origin main`, { 
    cwd: projectPath,
    stdio: 'inherit'
  })
  console.log('✅ 推送成功')
  
  console.log('\n🎉 Git操作全部成功！')
  
} catch (error) {
  console.log('❌ Git操作失败:', error.message)
  
  if (error.stdout) {
    console.log('📤 输出:', error.stdout.toString())
  }
  if (error.stderr) {
    console.log('📥 错误:', error.stderr.toString())
  }
  
  console.log('\n🔧 建议的解决方案:')
  console.log('1. 检查网络连接')
  console.log('2. 确认GitHub访问权限')
  console.log('3. 检查SSH密钥或访问令牌')
  console.log('4. 尝试手动执行Git命令')
}

console.log('\n📝 诊断完成！')
