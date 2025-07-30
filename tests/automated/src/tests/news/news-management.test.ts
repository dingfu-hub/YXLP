import { ApiClient } from '../../utils/api-client';
import { TestLogger, TestResult } from '../../utils/test-logger';
import { testConfig } from '../../config/test-config';

describe('News Management System Tests', () => {
  let apiClient: ApiClient;
  let logger: TestLogger;
  let testNewsId: string;

  beforeAll(async () => {
    apiClient = new ApiClient();
    logger = new TestLogger();
    logger.startSuite('News Management System');

    // 登录获取认证
    await apiClient.login(
      testConfig.testData.admin.username,
      testConfig.testData.admin.password
    );
  });

  afterAll(async () => {
    // 清理测试数据
    if (testNewsId) {
      await apiClient.deleteNews(testNewsId);
    }
    
    logger.endSuite('News Management System');
    await logger.generateReport();
  });

  // NEWS-001: 查看新闻文章列表
  test('NEWS-001: 查看新闻文章列表', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getNews();

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('articles');
      expect(Array.isArray(response.data.articles)).toBe(true);
      expect(response.data).toHaveProperty('total');
      expect(typeof response.data.total).toBe('number');

      // 验证文章结构
      if (response.data.articles.length > 0) {
        const article = response.data.articles[0];
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('content');
        expect(article).toHaveProperty('status');
        expect(article).toHaveProperty('category');
        expect(article).toHaveProperty('createdAt');
      }

      result = {
        testId: 'NEWS-001',
        title: '查看新闻文章列表',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          articleCount: response.data.articles.length,
          totalArticles: response.data.total
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-001',
        title: '查看新闻文章列表',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-002: 按标题搜索新闻
  test('NEWS-002: 按标题搜索新闻', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getNews({ search: '科技' });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('articles');
      
      // 验证搜索结果
      const articles = response.data.articles;
      if (articles.length > 0) {
        const hasMatchingTitle = articles.some(article => 
          article.title.includes('科技') || article.content.includes('科技')
        );
        expect(hasMatchingTitle).toBe(true);
      }

      result = {
        testId: 'NEWS-002',
        title: '按标题搜索新闻',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          searchResults: articles.length
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-002',
        title: '按标题搜索新闻',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-003: 按分类筛选新闻
  test('NEWS-003: 按分类筛选新闻', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getNews({ category: '科技' });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('articles');
      
      // 验证筛选结果
      const articles = response.data.articles;
      if (articles.length > 0) {
        const allMatchCategory = articles.every(article => 
          article.category === '科技'
        );
        expect(allMatchCategory).toBe(true);
      }

      result = {
        testId: 'NEWS-003',
        title: '按分类筛选新闻',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          filteredResults: articles.length
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-003',
        title: '按分类筛选新闻',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-007: 编辑现有新闻文章
  test('NEWS-007: 编辑现有新闻文章', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 首先创建一篇测试文章
      const createData = {
        title: `测试文章_${Date.now()}`,
        content: '这是一篇测试文章的内容',
        category: '科技',
        status: 'draft',
        summary: '测试文章摘要',
        tags: ['测试', '自动化']
      };

      const createResponse = await apiClient.createNews(createData);
      expect(createResponse.success).toBe(true);
      testNewsId = createResponse.data.article.id;

      // 编辑文章
      const updateData = {
        title: `更新的测试文章_${Date.now()}`,
        content: '这是更新后的文章内容',
        category: '商业',
        summary: '更新的文章摘要'
      };

      const response = await apiClient.updateNews(testNewsId, updateData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('article');
      expect(response.data.article.title).toBe(updateData.title);
      expect(response.data.article.content).toBe(updateData.content);
      expect(response.data.article.category).toBe(updateData.category);

      result = {
        testId: 'NEWS-007',
        title: '编辑现有新闻文章',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          updatedArticleId: testNewsId,
          updatedFields: Object.keys(updateData)
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-007',
        title: '编辑现有新闻文章',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-008: 修改文章标题
  test('NEWS-008: 修改文章标题', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testNewsId) {
        throw new Error('No test article available for title update');
      }

      const newTitle = `新标题_${Date.now()}`;
      const response = await apiClient.updateNews(testNewsId, { title: newTitle });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.article.title).toBe(newTitle);

      result = {
        testId: 'NEWS-008',
        title: '修改文章标题',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          newTitle: newTitle
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-008',
        title: '修改文章标题',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-011: 修改文章发布状态
  test('NEWS-011: 修改文章发布状态', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testNewsId) {
        throw new Error('No test article available for status update');
      }

      const response = await apiClient.updateNews(testNewsId, { 
        status: 'published',
        publishedAt: new Date().toISOString()
      });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.article.status).toBe('published');
      expect(response.data.article).toHaveProperty('publishedAt');

      result = {
        testId: 'NEWS-011',
        title: '修改文章发布状态',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          newStatus: 'published'
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-011',
        title: '修改文章发布状态',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-017: 删除单篇新闻文章
  test('NEWS-017: 删除单篇新闻文章', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testNewsId) {
        throw new Error('No test article available for deletion');
      }

      const response = await apiClient.deleteNews(testNewsId);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);

      // 验证文章已被删除
      const getResponse = await apiClient.getNews({ search: testNewsId });
      expect(getResponse.success).toBe(true);
      const deletedArticle = getResponse.data.articles.find(article => article.id === testNewsId);
      expect(deletedArticle).toBeUndefined();

      // 清除testNewsId，避免重复删除
      testNewsId = null;

      result = {
        testId: 'NEWS-017',
        title: '删除单篇新闻文章',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          deletedArticleId: testNewsId
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-017',
        title: '删除单篇新闻文章',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // NEWS-022: 查看文章统计数据
  test('NEWS-022: 查看文章统计数据', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getNews({ stats: true });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('statistics');
      
      const stats = response.data.statistics;
      expect(stats).toHaveProperty('totalArticles');
      expect(stats).toHaveProperty('publishedArticles');
      expect(stats).toHaveProperty('draftArticles');
      expect(stats).toHaveProperty('categoriesCount');
      expect(typeof stats.totalArticles).toBe('number');

      result = {
        testId: 'NEWS-022',
        title: '查看文章统计数据',
        module: 'news-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          statistics: stats
        }
      };
    } catch (error) {
      result = {
        testId: 'NEWS-022',
        title: '查看文章统计数据',
        module: 'news-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });
});
