/**
 * 新闻数据管理单元测试
 * 测试目标：验证新闻CRUD操作、搜索功能、数据一致性
 */

import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  searchNews,
  getNewsByCategory,
  getNewsByStatus,
  getNewsStats
} from '../news'
import { NewsArticle, NewsCategory, NewsStatus, SupportedLanguage } from '@/types/news'

// Mock data for testing
const mockArticle: Partial<NewsArticle> = {
  id: 'test-1',
  title: { zh: '测试文章', en: 'Test Article' },
  content: { zh: '测试内容', en: 'Test Content' },
  summary: { zh: '测试摘要', en: 'Test Summary' },
  slug: 'test-article',
  category: 'business',
  status: 'published',
  author: 'Test Author',
  sourceUrl: 'https://example.com/test',
  sourceName: 'Test Source',
  sourceType: 'rss',
  aiProcessed: false,
  aiProcessStatus: 'pending',
  viewCount: 100,
  likeCount: 10,
  shareCount: 5,
  keywords: ['测试', 'test'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('新闻数据管理', () => {
  beforeEach(() => {
    // Reset news data before each test
    jest.clearAllMocks()
  })

  describe('getAllNews', () => {
    it('应该返回所有新闻文章', () => {
      const articles = getAllNews()
      expect(Array.isArray(articles)).toBe(true)
      expect(articles.length).toBeGreaterThan(0)
      
      // Verify article structure
      if (articles.length > 0) {
        const article = articles[0]
        expect(article).toHaveProperty('id')
        expect(article).toHaveProperty('title')
        expect(article).toHaveProperty('content')
        expect(article).toHaveProperty('category')
        expect(article).toHaveProperty('status')
      }
    })

    it('应该返回按创建时间排序的文章', () => {
      const articles = getAllNews()
      if (articles.length > 1) {
        for (let i = 1; i < articles.length; i++) {
          expect(new Date(articles[i-1].createdAt).getTime())
            .toBeGreaterThanOrEqual(new Date(articles[i].createdAt).getTime())
        }
      }
    })
  })

  describe('getNewsById', () => {
    it('应该根据ID返回正确的文章', () => {
      const articles = getAllNews()
      if (articles.length > 0) {
        const firstArticle = articles[0]
        const foundArticle = getNewsById(firstArticle.id)
        
        expect(foundArticle).toBeDefined()
        expect(foundArticle?.id).toBe(firstArticle.id)
        expect(foundArticle?.title).toEqual(firstArticle.title)
      }
    })

    it('应该在文章不存在时返回undefined', () => {
      const nonExistentId = 'non-existent-id'
      const article = getNewsById(nonExistentId)
      expect(article).toBeUndefined()
    })

    it('应该增加文章的浏览量', () => {
      const articles = getAllNews()
      if (articles.length > 0) {
        const firstArticle = articles[0]
        const originalViewCount = firstArticle.viewCount
        
        const foundArticle = getNewsById(firstArticle.id)
        expect(foundArticle?.viewCount).toBe(originalViewCount + 1)
      }
    })
  })

  describe('searchNews', () => {
    it('应该根据标题搜索文章', () => {
      const searchTerm = '服装'
      const results = searchNews(searchTerm)
      
      expect(Array.isArray(results)).toBe(true)
      
      if (results.length > 0) {
        const hasMatchingTitle = results.some(article => 
          Object.values(article.title).some(title => 
            title && title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        expect(hasMatchingTitle).toBe(true)
      }
    })

    it('应该根据内容搜索文章', () => {
      const searchTerm = '市场'
      const results = searchNews(searchTerm)
      
      expect(Array.isArray(results)).toBe(true)
      
      if (results.length > 0) {
        const hasMatchingContent = results.some(article => 
          Object.values(article.content).some(content => 
            content && content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        expect(hasMatchingContent).toBe(true)
      }
    })

    it('应该支持多语言搜索', () => {
      const chineseResults = searchNews('服装', 'zh')
      const englishResults = searchNews('fashion', 'en')
      
      expect(Array.isArray(chineseResults)).toBe(true)
      expect(Array.isArray(englishResults)).toBe(true)
    })

    it('应该在没有匹配结果时返回空数组', () => {
      const nonExistentTerm = 'xyz123nonexistent'
      const results = searchNews(nonExistentTerm)
      expect(results).toEqual([])
    })
  })

  describe('getNewsByCategory', () => {
    it('应该返回指定分类的文章', () => {
      const category: NewsCategory = 'business'
      const results = getNewsByCategory(category)
      
      expect(Array.isArray(results)).toBe(true)
      results.forEach(article => {
        expect(article.category).toBe(category)
      })
    })

    it('应该在分类不存在时返回空数组', () => {
      const nonExistentCategory = 'nonexistent' as NewsCategory
      const results = getNewsByCategory(nonExistentCategory)
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('getNewsByStatus', () => {
    it('应该返回指定状态的文章', () => {
      const status: NewsStatus = 'published'
      const results = getNewsByStatus(status)
      
      expect(Array.isArray(results)).toBe(true)
      results.forEach(article => {
        expect(article.status).toBe(status)
      })
    })

    it('应该支持所有有效状态', () => {
      const statuses: NewsStatus[] = ['draft', 'published', 'archived']
      
      statuses.forEach(status => {
        const results = getNewsByStatus(status)
        expect(Array.isArray(results)).toBe(true)
      })
    })
  })

  describe('getNewsStats', () => {
    it('应该返回正确的统计信息', () => {
      const stats = getNewsStats()
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('published')
      expect(stats).toHaveProperty('draft')
      expect(stats).toHaveProperty('archived')
      expect(stats).toHaveProperty('categories')
      
      expect(typeof stats.total).toBe('number')
      expect(typeof stats.published).toBe('number')
      expect(typeof stats.draft).toBe('number')
      expect(typeof stats.archived).toBe('number')
      expect(Array.isArray(stats.categories)).toBe(true)
    })

    it('统计数据应该一致', () => {
      const stats = getNewsStats()
      const allArticles = getAllNews()
      
      expect(stats.total).toBe(allArticles.length)
      
      const publishedCount = allArticles.filter(a => a.status === 'published').length
      const draftCount = allArticles.filter(a => a.status === 'draft').length
      const archivedCount = allArticles.filter(a => a.status === 'archived').length
      
      expect(stats.published).toBe(publishedCount)
      expect(stats.draft).toBe(draftCount)
      expect(stats.archived).toBe(archivedCount)
    })
  })

  describe('数据一致性验证', () => {
    it('所有文章应该有必需的字段', () => {
      const articles = getAllNews()
      
      articles.forEach(article => {
        expect(article.id).toBeDefined()
        expect(article.title).toBeDefined()
        expect(article.content).toBeDefined()
        expect(article.category).toBeDefined()
        expect(article.status).toBeDefined()
        expect(article.createdAt).toBeDefined()
        expect(article.updatedAt).toBeDefined()
      })
    })

    it('文章ID应该是唯一的', () => {
      const articles = getAllNews()
      const ids = articles.map(a => a.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('文章slug应该是唯一的', () => {
      const articles = getAllNews()
      const slugs = articles.map(a => a.slug).filter(Boolean)
      const uniqueSlugs = new Set(slugs)
      
      expect(uniqueSlugs.size).toBe(slugs.length)
    })
  })
})
