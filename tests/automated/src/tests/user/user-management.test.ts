import { ApiClient } from '../../utils/api-client';
import { TestLogger, TestResult } from '../../utils/test-logger';
import { testConfig } from '../../config/test-config';

describe('User Management System Tests', () => {
  let apiClient: ApiClient;
  let logger: TestLogger;
  let testUserId: string;

  beforeAll(async () => {
    apiClient = new ApiClient();
    logger = new TestLogger();
    logger.startSuite('User Management System');

    // 登录获取认证
    await apiClient.login(
      testConfig.testData.admin.username,
      testConfig.testData.admin.password
    );
  });

  afterAll(async () => {
    // 清理测试数据
    if (testUserId) {
      await apiClient.deleteUser(testUserId);
    }
    
    logger.endSuite('User Management System');
    await logger.generateReport();
  });

  // USER-001: 查看用户列表
  test('USER-001: 查看用户列表', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getUsers();

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      expect(Array.isArray(response.data.users)).toBe(true);
      expect(response.data).toHaveProperty('total');
      expect(typeof response.data.total).toBe('number');

      result = {
        testId: 'USER-001',
        title: '查看用户列表',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          userCount: response.data.users.length,
          totalUsers: response.data.total
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-001',
        title: '查看用户列表',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-002: 用户列表分页
  test('USER-002: 用户列表分页', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getUsers({ page: 1, limit: 10 });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.pagination).toHaveProperty('page');
      expect(response.data.pagination).toHaveProperty('limit');
      expect(response.data.pagination).toHaveProperty('total');
      expect(response.data.users.length).toBeLessThanOrEqual(10);

      result = {
        testId: 'USER-002',
        title: '用户列表分页',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          pagination: response.data.pagination
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-002',
        title: '用户列表分页',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-003: 按用户名搜索
  test('USER-003: 按用户名搜索', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const response = await apiClient.getUsers({ search: 'admin' });

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      
      // 验证搜索结果
      const users = response.data.users;
      if (users.length > 0) {
        const hasAdminUser = users.some(user => 
          user.username.toLowerCase().includes('admin')
        );
        expect(hasAdminUser).toBe(true);
      }

      result = {
        testId: 'USER-003',
        title: '按用户名搜索',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          searchResults: users.length
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-003',
        title: '按用户名搜索',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-007: 创建新的管理员用户
  test('USER-007: 创建新的管理员用户', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const userData = {
        username: `testadmin_${Date.now()}`,
        password: 'TestAdmin123!',
        confirmPassword: 'TestAdmin123!',
        role: 'admin',
        email: `testadmin_${Date.now()}@example.com`,
        name: 'Test Admin User'
      };

      const response = await apiClient.createUser(userData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.username).toBe(userData.username);
      expect(response.data.user.role).toBe('admin');

      // 保存用户ID用于后续清理
      testUserId = response.data.user.id;

      result = {
        testId: 'USER-007',
        title: '创建新的管理员用户',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          createdUserId: testUserId,
          username: userData.username
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-007',
        title: '创建新的管理员用户',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-008: 创建重复用户名的用户
  test('USER-008: 创建重复用户名的用户', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const userData = {
        username: 'admin', // 使用已存在的用户名
        password: 'TestAdmin123!',
        confirmPassword: 'TestAdmin123!',
        role: 'admin',
        email: 'duplicate@example.com',
        name: 'Duplicate User'
      };

      const response = await apiClient.createUser(userData);

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(409);
      expect(response.error).toContain('用户名已存在');

      result = {
        testId: 'USER-008',
        title: '创建重复用户名的用户',
        module: 'user-management',
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
        testId: 'USER-008',
        title: '创建重复用户名的用户',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-009: 密码强度验证
  test('USER-009: 密码强度验证', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const userData = {
        username: `weakpass_${Date.now()}`,
        password: '123456', // 弱密码
        confirmPassword: '123456',
        role: 'editor',
        email: `weakpass_${Date.now()}@example.com`,
        name: 'Weak Password User'
      };

      const response = await apiClient.createUser(userData);

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toContain('密码强度不足');

      result = {
        testId: 'USER-009',
        title: '密码强度验证',
        module: 'user-management',
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
        testId: 'USER-009',
        title: '密码强度验证',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-015: 编辑用户基本信息
  test('USER-015: 编辑用户基本信息', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testUserId) {
        throw new Error('No test user available for editing');
      }

      const updateData = {
        name: 'Updated Test Admin',
        email: `updated_${Date.now()}@example.com`,
        role: 'editor'
      };

      const response = await apiClient.updateUser(testUserId, updateData);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.name).toBe(updateData.name);
      expect(response.data.user.email).toBe(updateData.email);
      expect(response.data.user.role).toBe(updateData.role);

      result = {
        testId: 'USER-015',
        title: '编辑用户基本信息',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          updatedUserId: testUserId,
          updatedFields: Object.keys(updateData)
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-015',
        title: '编辑用户基本信息',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-020: 删除单个用户
  test('USER-020: 删除单个用户', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      if (!testUserId) {
        throw new Error('No test user available for deletion');
      }

      const response = await apiClient.deleteUser(testUserId);

      // 验证响应
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);

      // 验证用户已被删除
      const getUserResponse = await apiClient.getUsers({ search: testUserId });
      expect(getUserResponse.success).toBe(true);
      const deletedUser = getUserResponse.data.users.find(user => user.id === testUserId);
      expect(deletedUser).toBeUndefined();

      // 清除testUserId，避免重复删除
      testUserId = null;

      result = {
        testId: 'USER-020',
        title: '删除单个用户',
        module: 'user-management',
        status: 'PASS',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: {
          responseTime: response.duration,
          deletedUserId: testUserId
        }
      };
    } catch (error) {
      result = {
        testId: 'USER-020',
        title: '删除单个用户',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });

  // USER-023: 尝试删除当前登录的用户
  test('USER-023: 尝试删除当前登录的用户', async () => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // 获取当前用户信息
      const usersResponse = await apiClient.getUsers({ search: 'admin' });
      const currentUser = usersResponse.data.users.find(user => user.username === 'admin');
      
      if (!currentUser) {
        throw new Error('Current admin user not found');
      }

      const response = await apiClient.deleteUser(currentUser.id);

      // 验证响应
      expect(response.success).toBe(false);
      expect(response.status).toBe(403);
      expect(response.error).toContain('不能删除当前登录的用户');

      result = {
        testId: 'USER-023',
        title: '尝试删除当前登录的用户',
        module: 'user-management',
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
        testId: 'USER-023',
        title: '尝试删除当前登录的用户',
        module: 'user-management',
        status: 'FAIL',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    logger.logResult(result);
  });
});
