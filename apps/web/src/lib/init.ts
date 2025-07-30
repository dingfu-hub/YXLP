// 应用初始化
import { startNewsScheduler } from './news-scheduler'

// 初始化应用
export function initializeApp() {
  console.log('初始化应用...')
  
  try {
    // 启动新闻调度器
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULER === 'true') {
      console.log('启动新闻调度器...')
      startNewsScheduler()
    } else {
      console.log('开发环境，跳过调度器启动 (设置 ENABLE_SCHEDULER=true 强制启动)')
    }
    
    console.log('应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 在模块加载时自动初始化
if (typeof window === 'undefined') {
  // 只在服务端执行
  initializeApp()
}
