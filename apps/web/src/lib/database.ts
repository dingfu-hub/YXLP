import Database from 'better-sqlite3'
import path from 'path'

// 数据库文件路径
const DB_PATH = path.join(process.cwd(), 'data', 'news.db')

// 创建数据库连接
let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    // 确保数据目录存在
    const fs = require('fs')
    const dataDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = new Database(DB_PATH)
    
    // 启用WAL模式以提高并发性能
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = 1000000')
    db.pragma('temp_store = memory')
    
    // 初始化表结构
    initializeTables(db)
  }
  
  return db
}

function initializeTables(db: Database.Database) {
  // RSS源表
  db.exec(`
    CREATE TABLE IF NOT EXISTS rss_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      language TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      category TEXT NOT NULL,
      priority INTEGER DEFAULT 5,
      quality_score REAL DEFAULT 0.0,
      is_active BOOLEAN DEFAULT 1,
      crawl_interval INTEGER DEFAULT 120,
      last_crawled_at DATETIME,
      success_rate REAL DEFAULT 0.0,
      articles_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 新闻文章表
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      original_title TEXT,
      original_content TEXT,
      source_url TEXT,
      source_id TEXT,
      language TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      ai_processed BOOLEAN DEFAULT 0,
      ai_process_status TEXT DEFAULT 'pending',
      seo_optimized BOOLEAN DEFAULT 0,
      featured_image TEXT,
      author TEXT,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES rss_sources(id)
    )
  `)

  // 采集任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS crawl_jobs (
      id TEXT PRIMARY KEY,
      job_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      config TEXT,
      progress TEXT,
      error_message TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 采集进度表（用于实时进度跟踪）
  db.exec(`
    CREATE TABLE IF NOT EXISTS crawl_progress (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      language TEXT NOT NULL,
      country TEXT NOT NULL,
      status TEXT NOT NULL,
      current_source TEXT,
      current_article_title TEXT,
      articles_found INTEGER DEFAULT 0,
      articles_processed INTEGER DEFAULT 0,
      articles_polished INTEGER DEFAULT 0,
      polish_stage TEXT,
      error_message TEXT,
      started_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES crawl_jobs(id)
    )
  `)

  // SEO关键词表
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      language TEXT NOT NULL,
      search_engine TEXT NOT NULL,
      category TEXT NOT NULL,
      search_volume INTEGER DEFAULT 0,
      competition REAL DEFAULT 0.0,
      relevance_score REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rss_sources_language ON rss_sources(language);
    CREATE INDEX IF NOT EXISTS idx_rss_sources_country ON rss_sources(country);
    CREATE INDEX IF NOT EXISTS idx_rss_sources_priority ON rss_sources(priority DESC);
    CREATE INDEX IF NOT EXISTS idx_rss_sources_active ON rss_sources(is_active);
    
    CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);
    CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);
    CREATE INDEX IF NOT EXISTS idx_news_articles_source_url ON news_articles(source_url);
    CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_crawl_progress_job_id ON crawl_progress(job_id);
    CREATE INDEX IF NOT EXISTS idx_crawl_progress_language ON crawl_progress(language);
    CREATE INDEX IF NOT EXISTS idx_crawl_progress_status ON crawl_progress(status);
    
    CREATE INDEX IF NOT EXISTS idx_seo_keywords_language ON seo_keywords(language);
    CREATE INDEX IF NOT EXISTS idx_seo_keywords_search_engine ON seo_keywords(search_engine);
  `)

  console.log('数据库表结构初始化完成')
}

// 数据库操作类
export class DatabaseManager {
  private db: Database.Database

  constructor() {
    this.db = getDatabase()
  }

  // RSS源操作
  insertRSSSource(source: any) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO rss_sources 
      (id, name, url, language, country, region, category, priority, quality_score, is_active, crawl_interval)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      source.id, source.name, source.url, source.language, source.country,
      source.region, source.category, source.priority, source.quality_score,
      source.is_active ? 1 : 0, source.crawl_interval
    )
  }

  getRSSSourcesByLanguage(language: string, activeOnly: boolean = true) {
    const sql = activeOnly 
      ? 'SELECT * FROM rss_sources WHERE language = ? AND is_active = 1 ORDER BY priority DESC, quality_score DESC'
      : 'SELECT * FROM rss_sources WHERE language = ? ORDER BY priority DESC, quality_score DESC'
    return this.db.prepare(sql).all(language)
  }

  getAllRSSSources() {
    return this.db.prepare('SELECT * FROM rss_sources ORDER BY language, priority DESC').all()
  }

  updateRSSSourceStats(sourceId: string, stats: any) {
    const stmt = this.db.prepare(`
      UPDATE rss_sources 
      SET last_crawled_at = ?, success_rate = ?, articles_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    return stmt.run(stats.last_crawled_at, stats.success_rate, stats.articles_count, sourceId)
  }

  // 新闻文章操作
  insertArticle(article: any) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO news_articles 
      (id, title, content, summary, source_url, source_id, language, category, status, featured_image, author)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      article.id, article.title, article.content, article.summary, article.source_url,
      article.source_id, article.language, article.category, article.status,
      article.featured_image, article.author
    )
  }

  checkArticleExists(sourceUrl: string) {
    const stmt = this.db.prepare('SELECT id FROM news_articles WHERE source_url = ?')
    return stmt.get(sourceUrl) !== undefined
  }

  // 采集进度操作
  insertCrawlProgress(progress: any) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO crawl_progress 
      (id, job_id, language, country, status, current_source, current_article_title, 
       articles_found, articles_processed, articles_polished, polish_stage, error_message, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      progress.id, progress.job_id, progress.language, progress.country, progress.status,
      progress.current_source, progress.current_article_title, progress.articles_found,
      progress.articles_processed, progress.articles_polished, progress.polish_stage,
      progress.error_message, progress.started_at
    )
  }

  updateCrawlProgress(progressId: string, updates: any) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    const stmt = this.db.prepare(`
      UPDATE crawl_progress 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    return stmt.run(...values, progressId)
  }

  getCrawlProgressByJobId(jobId: string) {
    return this.db.prepare('SELECT * FROM crawl_progress WHERE job_id = ? ORDER BY language').all(jobId)
  }

  // SEO关键词操作
  insertSEOKeywords(keywords: any[]) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO seo_keywords 
      (keyword, language, search_engine, category, search_volume, competition, relevance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const transaction = this.db.transaction((keywords) => {
      for (const keyword of keywords) {
        stmt.run(
          keyword.keyword, keyword.language, keyword.search_engine, keyword.category,
          keyword.search_volume, keyword.competition, keyword.relevance_score
        )
      }
    })
    
    return transaction(keywords)
  }

  getSEOKeywords(language: string, searchEngine: string) {
    return this.db.prepare(`
      SELECT * FROM seo_keywords 
      WHERE language = ? AND search_engine = ? 
      ORDER BY relevance_score DESC, search_volume DESC
    `).all(language, searchEngine)
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close()
    }
  }
}

export default DatabaseManager
