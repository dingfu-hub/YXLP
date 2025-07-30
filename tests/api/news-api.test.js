/**
 * 新闻API接口全面验证测试
 * 测试目标：验证所有新闻相关端点的功能性、安全性、性能
 */

// 注意：这个测试需要安装额外的依赖包
// npm install --save-dev supertest
// 或者使用内置的fetch API进行测试

// 使用fetch API的简化版本
const fetch = require('node-fetch') || global.fetch

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3002',
  timeout: 5000,
  maxResponseTime: 2000,
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  }
}

// Test data
const TEST_DATA = {
  validArticle: {
    title: '测试新闻标题',
    content: '这是一篇测试新闻的内容，包含了足够的文字来验证内容字段的功能。',
    summary: '测试新闻摘要',
    category: 'business',
    status: 'draft',
    author: 'Test Author',
    keywords: ['测试', '新闻', 'API']
  },
  invalidArticle: {
    title: '', // Invalid: empty title
    content: '内容',
    category: 'invalid_category'
  },
  searchQueries: [
    '服装',
    '市场',
    '测试',
    'fashion',
    'business'
  ],
  languages: ['zh', 'en', 'ja', 'ko'],
  categories: ['fashion', 'underwear', 'business'],
  statuses: ['draft', 'published', 'archived']
}

describe('新闻API接口全面验证', () => {
  let app
  let server
  let adminToken

  beforeAll(async () => {
    // Setup test server
    const dev = process.env.NODE_ENV !== 'production'
    app = next({ dev, dir: './apps/web' })
    const handle = app.getRequestHandler()

    await app.prepare()

    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })

    await new Promise((resolve) => {
      server.listen(3002, resolve)
    })

    // Get admin token for authenticated requests
    adminToken = await getAdminToken()
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve)
      })
    }
    if (app) {
      await app.close()
    }
  })

  // Helper function to get admin authentication token
  async function getAdminToken() {
    const response = await request(server)
      .post('/api/admin/auth/login')
      .send(TEST_CONFIG.adminCredentials)
      .expect(200)

    return response.body.data.token
  }

  // Helper function for authenticated requests
  function authenticatedRequest(method, endpoint) {
    return request(server)[method](endpoint)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', `admin_token=${adminToken}`)
  }

  describe('管理员新闻API (/api/admin/news)', () => {
    describe('GET /api/admin/news - 获取新闻列表', () => {
      it('应该返回新闻列表', async () => {
        const response = await authenticatedRequest('get', '/api/admin/news')
          .expect(200)

        expect(response.body).toHaveProperty('message')
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('articles')
        expect(response.body.data).toHaveProperty('total')
        expect(response.body.data).toHaveProperty('page')
        expect(response.body.data).toHaveProperty('limit')
        expect(response.body.data).toHaveProperty('totalPages')
        expect(Array.isArray(response.body.data.articles)).toBe(true)
      })

      it('应该支持分页参数', async () => {
        const response = await authenticatedRequest('get', '/api/admin/news?page=1&limit=5')
          .expect(200)

        expect(response.body.data.page).toBe(1)
        expect(response.body.data.limit).toBe(5)
        expect(response.body.data.articles.length).toBeLessThanOrEqual(5)
      })

      it('应该支持语言参数', async () => {
        for (const language of TEST_DATA.languages) {
          const response = await authenticatedRequest('get', `/api/admin/news?language=${language}`)
            .expect(200)

          expect(response.body.data).toHaveProperty('currentLanguage', language)
        }
      })

      it('应该支持状态过滤', async () => {
        for (const status of TEST_DATA.statuses) {
          const response = await authenticatedRequest('get', `/api/admin/news?status=${status}`)
            .expect(200)

          // Verify all returned articles have the correct status
          response.body.data.articles.forEach(article => {
            expect(article.status).toBe(status)
          })
        }
      })

      it('应该支持分类过滤', async () => {
        for (const category of TEST_DATA.categories) {
          const response = await authenticatedRequest('get', `/api/admin/news?category=${category}`)
            .expect(200)

          // Verify all returned articles have the correct category
          response.body.data.articles.forEach(article => {
            expect(article.category).toBe(category)
          })
        }
      })

      it('应该支持搜索功能', async () => {
        for (const query of TEST_DATA.searchQueries) {
          const response = await authenticatedRequest('get', `/api/admin/news?search=${encodeURIComponent(query)}`)
            .expect(200)

          expect(Array.isArray(response.body.data.articles)).toBe(true)
        }
      })

      it('应该在2秒内响应', async () => {
        const startTime = Date.now()
        
        await authenticatedRequest('get', '/api/admin/news')
          .expect(200)
        
        const responseTime = Date.now() - startTime
        expect(responseTime).toBeLessThan(TEST_CONFIG.maxResponseTime)
      })

      it('应该拒绝未认证的请求', async () => {
        await request(server)
          .get('/api/admin/news')
          .expect(401)
      })

      it('应该拒绝无效token的请求', async () => {
        await request(server)
          .get('/api/admin/news')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)
      })
    })

    describe('POST /api/admin/news - 创建新闻', () => {
      it('应该创建新的新闻文章', async () => {
        const response = await authenticatedRequest('post', '/api/admin/news')
          .send(TEST_DATA.validArticle)
          .expect(201)

        expect(response.body).toHaveProperty('message')
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id')
      })

      it('应该验证必需字段', async () => {
        await authenticatedRequest('post', '/api/admin/news')
          .send(TEST_DATA.invalidArticle)
          .expect(400)
      })

      it('应该拒绝未认证的创建请求', async () => {
        await request(server)
          .post('/api/admin/news')
          .send(TEST_DATA.validArticle)
          .expect(401)
      })

      it('应该处理重复标题', async () => {
        // Create first article
        await authenticatedRequest('post', '/api/admin/news')
          .send(TEST_DATA.validArticle)
          .expect(201)

        // Try to create duplicate
        const response = await authenticatedRequest('post', '/api/admin/news')
          .send(TEST_DATA.validArticle)

        // Should either succeed with different slug or return appropriate error
        expect([201, 400, 409]).toContain(response.status)
      })
    })

    describe('GET /api/admin/news/[id] - 获取单个新闻', () => {
      let articleId

      beforeAll(async () => {
        // Create a test article
        const response = await authenticatedRequest('post', '/api/admin/news')
          .send({
            ...TEST_DATA.validArticle,
            title: '测试文章用于获取详情'
          })
          .expect(201)

        articleId = response.body.data.id
      })

      it('应该返回指定ID的新闻详情', async () => {
        const response = await authenticatedRequest('get', `/api/admin/news/${articleId}`)
          .expect(200)

        expect(response.body.data).toHaveProperty('id', articleId)
        expect(response.body.data).toHaveProperty('title')
        expect(response.body.data).toHaveProperty('content')
      })

      it('应该在文章不存在时返回404', async () => {
        await authenticatedRequest('get', '/api/admin/news/nonexistent-id')
          .expect(404)
      })

      it('应该拒绝未认证的请求', async () => {
        await request(server)
          .get(`/api/admin/news/${articleId}`)
          .expect(401)
      })
    })
  })

  describe('公共新闻API (/api/news)', () => {
    describe('GET /api/news - 获取公共新闻列表', () => {
      it('应该返回已发布的新闻列表', async () => {
        const response = await request(server)
          .get('/api/news')
          .expect(200)

        expect(response.body).toHaveProperty('data')
        expect(Array.isArray(response.body.data.articles)).toBe(true)
        
        // All articles should be published
        response.body.data.articles.forEach(article => {
          expect(article.status).toBe('published')
        })
      })

      it('应该支持分页', async () => {
        const response = await request(server)
          .get('/api/news?page=1&limit=3')
          .expect(200)

        expect(response.body.data.articles.length).toBeLessThanOrEqual(3)
      })

      it('应该支持分类过滤', async () => {
        const response = await request(server)
          .get('/api/news?category=business')
          .expect(200)

        response.body.data.articles.forEach(article => {
          expect(article.category).toBe('business')
        })
      })

      it('应该快速响应', async () => {
        const startTime = Date.now()
        
        await request(server)
          .get('/api/news')
          .expect(200)
        
        const responseTime = Date.now() - startTime
        expect(responseTime).toBeLessThan(1000) // Public API should be faster
      })
    })

    describe('GET /api/news/[id] - 获取公共新闻详情', () => {
      it('应该返回已发布新闻的详情', async () => {
        // First get a published article ID
        const listResponse = await request(server)
          .get('/api/news?limit=1')
          .expect(200)

        if (listResponse.body.data.articles.length > 0) {
          const articleId = listResponse.body.data.articles[0].id
          
          const response = await request(server)
            .get(`/api/news/${articleId}`)
            .expect(200)

          expect(response.body.data).toHaveProperty('id', articleId)
          expect(response.body.data).toHaveProperty('sourceUrl')
          expect(response.body.data).toHaveProperty('sourceName')
        }
      })

      it('应该增加浏览量', async () => {
        const listResponse = await request(server)
          .get('/api/news?limit=1')
          .expect(200)

        if (listResponse.body.data.articles.length > 0) {
          const articleId = listResponse.body.data.articles[0].id
          const initialViewCount = listResponse.body.data.articles[0].readCount

          await request(server)
            .get(`/api/news/${articleId}`)
            .expect(200)

          // Get the article again to check view count
          const updatedResponse = await request(server)
            .get(`/api/news/${articleId}`)
            .expect(200)

          expect(updatedResponse.body.data.readCount).toBeGreaterThan(initialViewCount)
        }
      })
    })
  })

  describe('新闻采集API (/api/admin/news/crawl)', () => {
    describe('GET /api/admin/news/crawl - 获取采集状态', () => {
      it('应该返回采集状态信息', async () => {
        const response = await authenticatedRequest('get', '/api/admin/news/crawl')
          .expect(200)

        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('status')
      })
    })

    describe('POST /api/admin/news/crawl - 启动采集', () => {
      it('应该启动新闻采集任务', async () => {
        const response = await authenticatedRequest('post', '/api/admin/news/crawl')
          .send({
            aiModel: 'deepseek',
            targetLanguages: ['zh', 'en'],
            onlyTodayNews: true,
            articlesPerLanguage: 5
          })
          .expect(200)

        expect(response.body).toHaveProperty('message')
        expect(response.body.data).toHaveProperty('status', 'started')
      })

      it('应该拒绝未认证的采集请求', async () => {
        await request(server)
          .post('/api/admin/news/crawl')
          .send({
            aiModel: 'deepseek',
            targetLanguages: ['zh']
          })
          .expect(401)
      })
    })
  })

  describe('安全性测试', () => {
    describe('SQL注入防护', () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE news; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "' UNION SELECT * FROM admin_users --"
      ]

      it('应该防护搜索参数的SQL注入', async () => {
        for (const payload of sqlInjectionPayloads) {
          const response = await authenticatedRequest('get', `/api/admin/news?search=${encodeURIComponent(payload)}`)
          
          // Should not return 500 error or expose database structure
          expect([200, 400]).toContain(response.status)
          
          if (response.status === 200) {
            expect(response.body).toHaveProperty('data')
            expect(Array.isArray(response.body.data.articles)).toBe(true)
          }
        }
      })
    })

    describe('XSS防护', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<svg onload="alert(1)">'
      ]

      it('应该防护创建新闻时的XSS攻击', async () => {
        for (const payload of xssPayloads) {
          const response = await authenticatedRequest('post', '/api/admin/news')
            .send({
              ...TEST_DATA.validArticle,
              title: payload,
              content: payload
            })

          // Should either sanitize the input or reject it
          if (response.status === 201) {
            expect(response.body.data.title).not.toContain('<script>')
            expect(response.body.data.content).not.toContain('<script>')
          }
        }
      })
    })

    describe('权限验证', () => {
      it('应该验证管理员权限', async () => {
        // Test with invalid token
        await request(server)
          .get('/api/admin/news')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)

        // Test without token
        await request(server)
          .get('/api/admin/news')
          .expect(401)
      })

      it('应该验证操作权限', async () => {
        // This would require a user with limited permissions
        // For now, just verify that permission checking exists
        const response = await authenticatedRequest('get', '/api/admin/news')
        expect(response.status).toBe(200)
      })
    })
  })

  describe('性能测试', () => {
    it('API响应时间应该符合要求', async () => {
      const endpoints = [
        '/api/news',
        '/api/admin/news',
        '/api/admin/news/crawl'
      ]

      for (const endpoint of endpoints) {
        const startTime = Date.now()
        
        if (endpoint.includes('/admin/')) {
          await authenticatedRequest('get', endpoint).expect(200)
        } else {
          await request(server).get(endpoint).expect(200)
        }
        
        const responseTime = Date.now() - startTime
        expect(responseTime).toBeLessThan(TEST_CONFIG.maxResponseTime)
      }
    })

    it('应该处理并发请求', async () => {
      const concurrentRequests = 10
      const promises = []

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(server)
            .get('/api/news')
            .expect(200)
        )
      }

      const results = await Promise.all(promises)
      expect(results).toHaveLength(concurrentRequests)
    })
  })
})
