import { ApiClient } from '../../utils/api-client';
import { TestLogger, TestResult } from '../../utils/test-logger';
import { testConfig } from '../../config/test-config';

describe('Authentication System Tests', () => {
  let apiClient: ApiClient;
  let logger: TestLogger;

  beforeAll(() => {
    apiClient = new ApiClient();
    logger = new TestLogger();
    logger.startSuite('Authentication System');
  });

  afterAll(async () => {
    logger.endSuite('Authentication System');
    await logger.generateReport();
  });

  // AUTH-001: 管理员正常登录
  test('AUTH-001: 管理员正常登录', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 执行登录
      const response = await apiClient.login(
        testConfig.testData.admin.username,
        testConfig.testData.admin.password
      );

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);

      result = {
        testId: 'AUTH-001',
        title: '管理员正常登录',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          tokenLength: response.data.token.length
        }
      };
    } catch (error) {
      result = {
        testId: 'AUTH-001',
        title: '管理员正常登录',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-002: 用户名不存在
  test('AUTH-002: 用户名不存在', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.login('nonexistent', 'anypassword');

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
      expect(response.error).toContain('用户名或密码错误');

      result = {
        testId: 'AUTH-002',
        title: '用户名不存在',
        module: 'authentication',
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
        testId: 'AUTH-002',
        title: '用户名不存在',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-003: 密码错误
  test('AUTH-003: 密码错误', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.login(
        testConfig.testData.admin.username,
        'wrongpassword'
      );

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
      expect(response.error).toContain('用户名或密码错误');

      result = {
        testId: 'AUTH-003',
        title: '密码错误',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration
        }
      };
    } catch (error) {
      result = {
        testId: 'AUTH-003',
        title: '密码错误',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-004: 空用户名
  test('AUTH-004: 空用户名', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.login('', 'anypassword');

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toContain('请输入用户名');

      result = {
        testId: 'AUTH-004',
        title: '空用户名',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        testId: 'AUTH-004',
        title: '空用户名',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-005: 空密码
  test('AUTH-005: 空密码', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.login(testConfig.testData.admin.username, '');

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toContain('请输入密码');

      result = {
        testId: 'AUTH-005',
        title: '空密码',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        testId: 'AUTH-005',
        title: '空密码',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-016: 正常登出
  test('AUTH-016: 正常登出', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 先登录
      await apiClient.login(
        testConfig.testData.admin.username,
        testConfig.testData.admin.password
      );

      // 执行登出
      const response = await apiClient.logout();

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);

      // 验证token已清除
      const protectedResponse = await apiClient.getUsers();
      expect(protectedResponse.success).toBe(false);
      expect(protectedResponse.status).toBe(401);

      result = {
        testId: 'AUTH-016',
        title: '正常登出',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        testId: 'AUTH-016',
        title: '正常登出',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-019: 未登录访问保护页面
  test('AUTH-019: 未登录访问保护页面', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 确保未登录状态
      apiClient.clearAuthToken();

      // 尝试访问受保护的资源
      const response = await apiClient.getUsers();

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
      expect(response.error).toContain('未授权');

      result = {
        testId: 'AUTH-019',
        title: '未登录访问保护页面',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        testId: 'AUTH-019',
        title: '未登录访问保护页面',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // AUTH-020: 无效Token访问
  test('AUTH-020: 无效Token访问', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 设置无效token
      apiClient.setAuthToken('invalid-token-12345');

      // 尝试访问受保护的资源
      const response = await apiClient.getUsers();

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
      expect(response.error).toContain('无效的认证信息');

      result = {
        testId: 'AUTH-020',
        title: '无效Token访问',
        module: 'authentication',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        testId: 'AUTH-020',
        title: '无效Token访问',
        module: 'authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });
});
