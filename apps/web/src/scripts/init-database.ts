// 数据库初始化脚本
// 导入生产环境RSS源和SEO关键词数据

import { DatabaseManager } from '@/lib/database'
import { generateProductionRSSSources } from '@/data/production-rss-sources'
import { GOOGLE_SEO_KEYWORDS, BAIDU_SEO_KEYWORDS } from '@/data/seo-keywords'

async function initializeDatabase() {
  console.log('开始初始化数据库...')
  
  const db = new DatabaseManager()
  
  try {
    // 1. 导入RSS源数据
    console.log('导入RSS源数据...')
    const rssSources = generateProductionRSSSources()
    
    let importedSources = 0
    for (const source of rssSources) {
      try {
        db.insertRSSSource({
          id: source.id,
          name: source.name,
          url: source.url,
          language: source.language,
          country: source.country,
          region: source.region,
          category: source.category,
          priority: source.priority,
          quality_score: source.quality_score,
          is_active: source.is_active,
          crawl_interval: source.crawl_interval
        })
        importedSources++
      } catch (error) {
        console.error(`导入RSS源 ${source.id} 失败:`, error)
      }
    }
    
    console.log(`成功导入 ${importedSources} 个RSS源`)
    
    // 2. 导入SEO关键词数据
    console.log('导入SEO关键词数据...')
    const allKeywords = [...GOOGLE_SEO_KEYWORDS, ...BAIDU_SEO_KEYWORDS]
    
    try {
      db.insertSEOKeywords(allKeywords.map(keyword => ({
        keyword: keyword.keyword,
        language: keyword.language,
        search_engine: keyword.search_engine,
        category: keyword.category,
        search_volume: keyword.search_volume,
        competition: keyword.competition,
        relevance_score: keyword.relevance_score
      })))
      
      console.log(`成功导入 ${allKeywords.length} 个SEO关键词`)
    } catch (error) {
      console.error('导入SEO关键词失败:', error)
    }
    
    // 3. 验证数据
    console.log('验证导入的数据...')
    
    const languages = ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'nl', 'tr']
    
    for (const language of languages) {
      const sources = db.getRSSSourcesByLanguage(language)
      const keywords = db.getSEOKeywords(language, language === 'zh' ? 'baidu' : 'google')
      
      console.log(`${language.toUpperCase()}: ${sources.length} 个RSS源, ${keywords.length} 个SEO关键词`)
    }
    
    // 4. 显示统计信息
    const allSources = db.getAllRSSSources()
    const activeSources = allSources.filter(s => s.is_active)
    const sourcesByPriority = allSources.reduce((acc, source) => {
      acc[source.priority] = (acc[source.priority] || 0) + 1
      return acc
    }, {} as { [key: number]: number })
    
    console.log('\n=== 数据库初始化完成 ===')
    console.log(`总RSS源数量: ${allSources.length}`)
    console.log(`活跃RSS源数量: ${activeSources.length}`)
    console.log(`总SEO关键词数量: ${allKeywords.length}`)
    console.log('\n按优先级分布:')
    Object.entries(sourcesByPriority)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .forEach(([priority, count]) => {
        console.log(`  优先级 ${priority}: ${count} 个源`)
      })
    
    console.log('\n按语言分布:')
    languages.forEach(lang => {
      const count = allSources.filter(s => s.language === lang).length
      console.log(`  ${lang.toUpperCase()}: ${count} 个源`)
    })
    
    console.log('\n数据库初始化成功！')
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  } finally {
    db.close()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('初始化完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('初始化失败:', error)
      process.exit(1)
    })
}

export { initializeDatabase }
