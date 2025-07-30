import { ApiClient } from '../../utils/api-client';
import { TestLogger, TestResult } from '../../utils/test-logger';
import { testConfig } from '../../config/test-config';

describe('News Collection System Tests', () => {
  let apiClient: ApiClient;
  let logger: TestLogger;
  let testSourceId: string;
  let testJobId: string;

  beforeAll(async () => {
    apiClient = new ApiClient();
    logger = new TestLogger();
    logger.startSuite('News Collection System');

    // 登录获取认证
    await apiClient.login(
      testConfig.testData.admin.username,
      testConfig.testData.admin.password
    );
  });

  afterAll(async () => {
    // 清理测试数据
    if (testJobId) {
      await apiClient.cancelCrawlJob(testJobId);
    }
    if (testSourceId) {
      await apiClient.deleteNewsSource(testSourceId);
    }
    
    logger.endSuite('News Collection System');
    await logger.generateReport();
  });

  // COLLECT-001: 查看新闻源列表
  test('COLLECT-001: 查看新闻源列表', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getNewsSources();

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sources');
      expect(Array.isArray(response.data.sources)).toBe(true);
      expect(response.data).toHaveProperty('total');
      expect(typeof response.data.total).toBe('number');

      // 验证新闻源结构
      if (response.data.sources.length > 0) {
        const source = response.data.sources[0];
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('type');
        expect(source).toHaveProperty('url');
        expect(source).toHaveProperty('status');
        expect(source).toHaveProperty('category');
      }

      result = {
        testId: 'COLLECT-001',
        title: '查看新闻源列表',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          sourceCount: response.data.sources.length,
          totalSources: response.data.total
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-001',
        title: '查看新闻源列表',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-002: 添加RSS类型新闻源
  test('COLLECT-002: 添加RSS类型新闻源', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const sourceData = {
        name: `测试RSS源_${Date.now()}`,
        type: 'rss',
        url: 'https://example.com/rss.xml',
        category: '科技',
        status: 'active',
        description: '测试RSS新闻源',
        config: {
          updateInterval: 3600,
          maxArticles: 50
        }
      };

      const response = await apiClient.createNewsSource(sourceData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('source');
      expect(response.data.source.name).toBe(sourceData.name);
      expect(response.data.source.type).toBe('rss');
      expect(response.data.source.url).toBe(sourceData.url);

      // 保存源ID用于后续清理
      testSourceId = response.data.source.id;

      result = {
        testId: 'COLLECT-002',
        title: '添加RSS类型新闻源',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          createdSourceId: testSourceId,
          sourceName: sourceData.name
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-002',
        title: '添加RSS类型新闻源',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-003: 添加网页爬虫类型新闻源
  test('COLLECT-003: 添加网页爬虫类型新闻源', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const sourceData = {
        name: `测试爬虫源_${Date.now()}`,
        type: 'crawler',
        url: 'https://news.example.com',
        category: '商业',
        status: 'active',
        description: '测试网页爬虫新闻源',
        config: {
          titleSelector: 'h1.title',
          contentSelector: '.content',
          imageSelector: '.featured-image img',
          linkSelector: 'a.article-link',
          updateInterval: 7200,
          maxArticles: 30
        }
      };

      const response = await apiClient.createNewsSource(sourceData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('source');
      expect(response.data.source.name).toBe(sourceData.name);
      expect(response.data.source.type).toBe('crawler');
      expect(response.data.source.config).toHaveProperty('titleSelector');

      result = {
        testId: 'COLLECT-003',
        title: '添加网页爬虫类型新闻源',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          createdSourceId: response.data.source.id,
          sourceName: sourceData.name
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-003',
        title: '添加网页爬虫类型新闻源',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-005: 新闻源URL格式验证
  test('COLLECT-005: 新闻源URL格式验证', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const sourceData = {
        name: `无效URL源_${Date.now()}`,
        type: 'rss',
        url: 'invalid-url-format',
        category: '科技',
        status: 'active'
      };

      const response = await apiClient.createNewsSource(sourceData);

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toContain('URL格式无效');

      result = {
        testId: 'COLLECT-005',
        title: '新闻源URL格式验证',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          errorMessage: response.error
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-005',
        title: '新闻源URL格式验证',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-007: 编辑现有新闻源
  test('COLLECT-007: 编辑现有新闻源', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testSourceId) {
        throw new Error('No test source available for editing');
      }

      const updateData = {
        name: `更新的测试源_${Date.now()}`,
        category: '体育',
        description: '更新后的描述',
        config: {
          updateInterval: 1800,
          maxArticles: 100
        }
      };

      const response = await apiClient.updateNewsSource(testSourceId, updateData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.source.name).toBe(updateData.name);
      expect(response.data.source.category).toBe(updateData.category);
      expect(response.data.source.description).toBe(updateData.description);

      result = {
        testId: 'COLLECT-007',
        title: '编辑现有新闻源',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          updatedSourceId: testSourceId,
          updatedFields: Object.keys(updateData)
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-007',
        title: '编辑现有新闻源',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-011: 启动单个新闻源采集
  test('COLLECT-011: 启动单个新闻源采集', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testSourceId) {
        throw new Error('No test source available for crawling');
      }

      const jobData = {
        sourceId: testSourceId,
        config: {
          enableAIPolish: false,
          autoPublish: false,
          defaultCategory: '科技',
          maxArticles: 10
        }
      };

      const response = await apiClient.startCrawlJob(jobData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('job');
      expect(response.data.job).toHaveProperty('id');
      expect(response.data.job.sourceId).toBe(testSourceId);
      expect(response.data.job.status).toBe('running');

      // 保存任务ID用于后续清理
      testJobId = response.data.job.id;

      result = {
        testId: 'COLLECT-011',
        title: '启动单个新闻源采集',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          jobId: testJobId,
          sourceId: testSourceId
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-011',
        title: '启动单个新闻源采集',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-014: 查看采集任务实时状态
  test('COLLECT-014: 查看采集任务实时状态', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getCrawlJobs();

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('jobs');
      expect(Array.isArray(response.data.jobs)).toBe(true);

      // 验证任务结构
      if (response.data.jobs.length > 0) {
        const job = response.data.jobs[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('sourceId');
        expect(job).toHaveProperty('status');
        expect(job).toHaveProperty('progress');
        expect(job).toHaveProperty('startTime');
        expect(['running', 'completed', 'failed', 'cancelled']).toContain(job.status);
      }

      result = {
        testId: 'COLLECT-014',
        title: '查看采集任务实时状态',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          jobCount: response.data.jobs.length
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-014',
        title: '查看采集任务实时状态',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-017: 取消正在运行的采集任务
  test('COLLECT-017: 取消正在运行的采集任务', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testJobId) {
        throw new Error('No running job available for cancellation');
      }

      const response = await apiClient.cancelCrawlJob(testJobId);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);

      // 验证任务状态已更新
      const jobsResponse = await apiClient.getCrawlJobs();
      const cancelledJob = jobsResponse.data.jobs.find(job => job.id === testJobId);
      if (cancelledJob) {
        expect(cancelledJob.status).toBe('cancelled');
      }

      // 清除testJobId，避免重复取消
      testJobId = null;

      result = {
        testId: 'COLLECT-017',
        title: '取消正在运行的采集任务',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          cancelledJobId: testJobId
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-017',
        title: '取消正在运行的采集任务',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // COLLECT-009: 删除新闻源
  test('COLLECT-009: 删除新闻源', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testSourceId) {
        throw new Error('No test source available for deletion');
      }

      const response = await apiClient.deleteNewsSource(testSourceId);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);

      // 验证新闻源已被删除
      const sourcesResponse = await apiClient.getNewsSources();
      const deletedSource = sourcesResponse.data.sources.find(source => source.id === testSourceId);
      expect(deletedSource).toBeUndefined();

      // 清除testSourceId，避免重复删除
      testSourceId = null;

      result = {
        testId: 'COLLECT-009',
        title: '删除新闻源',
        module: 'news-collection',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          deletedSourceId: testSourceId
        }
      };
    } catch (error) {
      result = {
        testId: 'COLLECT-009',
        title: '删除新闻源',
        module: 'news-collection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });
});
