/**
 * 测试采集进度显示的脚本
 * 模拟真实的采集进度数据
 */

const fs = require('fs')
const path = require('path')

const PROGRESS_FILE = path.join(__dirname, '../apps/web/data/crawl-progress.json')

// 模拟采集进度数据
const mockProgressData = {
  "totalSources": 11,
  "completedSources": 8,
  "currentSource": "人民网经济",
  "articlesFound": 427,
  "articlesProcessed": 19,
  "articlesPolished": 19,
  "status": "crawling",
  "error": "",
  "startTime": new Date().toISOString(),
  "endTime": null,
  "processedSources": [
    "cn_001",
    "cn_002",
    "jp_001",
    "kr_001",
    "tw_001",
    "hk_001",
    "us_001",
    "gb_001"
  ],
  "languageProgress": [
    {
      "language": "zh",
      "country": "中国",
      "status": "completed",
      "articlesFound": 300,
      "articlesProcessed": 19,
      "articlesPolished": 19,
      "currentSource": "人民网经济",
      "statusMessage": "采集完成，共处理19篇文章"
    },
    {
      "language": "zh",
      "country": "台湾",
      "status": "completed",
      "articlesFound": 0,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "currentSource": "中央社",
      "statusMessage": "该地区暂无可用文章"
    },
    {
      "language": "zh",
      "country": "香港",
      "status": "completed",
      "articlesFound": 0,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "currentSource": "香港01",
      "statusMessage": "该地区暂无可用文章"
    },
    {
      "language": "en",
      "country": "美国",
      "status": "crawling",
      "articlesFound": 45,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "currentSource": "CNN Business",
      "statusMessage": "正在处理美国地区新闻..."
    },
    {
      "language": "en",
      "country": "英国",
      "status": "pending",
      "articlesFound": 0,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "statusMessage": "等待处理..."
    },
    {
      "language": "en",
      "country": "澳大利亚",
      "status": "pending",
      "articlesFound": 0,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "statusMessage": "等待处理..."
    },
    {
      "language": "ja",
      "country": "日本",
      "status": "completed",
      "articlesFound": 7,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "currentSource": "NHK News",
      "statusMessage": "该地区暂无可用文章"
    },
    {
      "language": "ko",
      "country": "韩国",
      "status": "completed",
      "articlesFound": 75,
      "articlesProcessed": 0,
      "articlesPolished": 0,
      "currentSource": "Yonhap News",
      "statusMessage": "该地区暂无可用文章"
    }
  ],
  "canResume": true,
  "articlesPerLanguage": 50,
  "sessionId": Date.now().toString()
}

// 写入测试数据
function writeTestProgress() {
  try {
    // 确保目录存在
    const dir = path.dirname(PROGRESS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(mockProgressData, null, 2))
    console.log('✅ 测试进度数据已写入:', PROGRESS_FILE)
    console.log('📊 数据概览:')
    console.log(`- 总源数: ${mockProgressData.totalSources}`)
    console.log(`- 已完成: ${mockProgressData.completedSources}`)
    console.log(`- 状态: ${mockProgressData.status}`)
    console.log(`- 语言进度: ${mockProgressData.languageProgress.length} 个地区`)
    
    // 显示各地区状态
    console.log('\n🌍 各地区状态:')
    mockProgressData.languageProgress.forEach(lang => {
      const statusIcon = {
        'completed': '✅',
        'crawling': '⚡',
        'pending': '⏳',
        'failed': '❌'
      }[lang.status] || '❓'
      
      console.log(`  ${statusIcon} ${lang.country} (${lang.language}): ${lang.articlesProcessed}/${mockProgressData.articlesPerLanguage} 篇`)
    })
    
  } catch (error) {
    console.error('❌ 写入测试数据失败:', error)
  }
}

// 重置进度数据
function resetProgress() {
  const resetData = {
    "totalSources": 0,
    "completedSources": 0,
    "currentSource": "",
    "articlesFound": 0,
    "articlesProcessed": 0,
    "articlesPolished": 0,
    "status": "idle",
    "error": "",
    "startTime": null,
    "endTime": null,
    "processedSources": [],
    "languageProgress": [],
    "canResume": false,
    "articlesPerLanguage": 50
  }
  
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(resetData, null, 2))
    console.log('🔄 采集进度已重置')
  } catch (error) {
    console.error('❌ 重置进度失败:', error)
  }
}

// 命令行参数处理
const command = process.argv[2]

switch (command) {
  case 'test':
    writeTestProgress()
    break
  case 'reset':
    resetProgress()
    break
  default:
    console.log('使用方法:')
    console.log('  node test-crawl-progress.js test   # 写入测试数据')
    console.log('  node test-crawl-progress.js reset  # 重置进度数据')
    break
}
