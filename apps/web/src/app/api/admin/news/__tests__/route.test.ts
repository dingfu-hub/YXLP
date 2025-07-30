/**
 * 新闻管理API路由测试
 * 测试目标：验证API端点的功能性、安全性、错误处理
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { verifyToken } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// Mock dependencies
jest.mock('@/lib/jwt')
jest.mock('@/data/admin-users')
jest.mock('@/data/news')

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>
const mockFindAdminById = findAdminById as jest.MockedFunction<typeof findAdminById>

// Mock admin user
const mockAdmin = {
  id: 'admin-1',
  username: 'testadmin',
  email: 'admin@test.com',
  displayName: 'Test Admin',
  role: 'admin' as const,
  isActive: true,
  permissions: ['news:view', 'news:create', 'news:edit', 'news:delete'],
  createdAt: new Date(),
  updatedAt: new Date()
}

// Helper function to create mock request
const createMockRequest = (options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  cookies?: Record<string, string>
} = {}) => {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/admin/news',
    headers = {},
    body,
    cookies = {}
  } = options

  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  return request
}

describe('/api/admin/news API路由', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockVerifyToken.mockResolvedValue({ userId: 'admin-1', role: 'admin' })
    mockFindAdminById.mockReturnValue(mockAdmin)
  })

  describe('GET /api/admin/news', () => {
    it('应该返回新闻列表给已认证的管理员', async () => {
      const request = createMockRequest({
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('articles')
      expect(data.data).toHaveProperty('total')
      expect(data.data).toHaveProperty('page')
      expect(data.data).toHaveProperty('limit')
      expect(data.data).toHaveProperty('totalPages')
    })

    it('应该支持分页参数', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/news?page=2&limit=10',
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.page).toBe(2)
      expect(data.data.limit).toBe(10)
    })

    it('应该支持搜索参数', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/news?search=测试&language=zh',
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveProperty('currentLanguage', 'zh')
    })

    it('应该支持状态过滤', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/news?status=published',
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.data.articles)).toBe(true)
    })

    it('应该支持分类过滤', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/news?category=business',
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.data.articles)).toBe(true)
    })

    it('应该拒绝未认证的请求', async () => {
      const request = createMockRequest()

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('应该拒绝无效token的请求', async () => {
      mockVerifyToken.mockResolvedValue(null)
      
      const request = createMockRequest({
        cookies: { admin_token: 'invalid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('应该拒绝权限不足的用户', async () => {
      mockFindAdminById.mockReturnValue({
        ...mockAdmin,
        permissions: [] // No permissions
      })

      const request = createMockRequest({
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
    })

    it('应该拒绝被禁用的用户', async () => {
      mockFindAdminById.mockReturnValue({
        ...mockAdmin,
        isActive: false
      })

      const request = createMockRequest({
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/admin/news', () => {
    const validNewsData = {
      title: '测试新闻标题',
      content: '测试新闻内容',
      summary: '测试新闻摘要',
      category: 'business',
      status: 'draft',
      author: 'Test Author'
    }

    it('应该创建新闻文章', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: validNewsData,
        cookies: { admin_token: 'valid-token' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('data')
    })

    it('应该验证必需字段', async () => {
      const invalidData = {
        title: '', // Empty title
        content: '测试内容'
      }

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
        cookies: { admin_token: 'valid-token' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('应该拒绝未认证的创建请求', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: validNewsData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('应该拒绝权限不足的创建请求', async () => {
      mockFindAdminById.mockReturnValue({
        ...mockAdmin,
        permissions: ['news:view'] // No create permission
      })

      const request = createMockRequest({
        method: 'POST',
        body: validNewsData,
        cookies: { admin_token: 'valid-token' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
    })
  })

  describe('错误处理', () => {
    it('应该处理服务器内部错误', async () => {
      // Mock an error in the data layer
      mockVerifyToken.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest({
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('应该处理无效的JSON请求体', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })
      request.cookies.set('admin_token', 'valid-token')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('性能测试', () => {
    it('API响应时间应该小于500ms', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({
        cookies: { admin_token: 'valid-token' }
      })

      await GET(request)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500)
    })

    it('应该处理大量数据请求', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/news?limit=1000',
        cookies: { admin_token: 'valid-token' }
      })

      const response = await GET(request)
      expect(response.status).toBe(200)
    })
  })
})
