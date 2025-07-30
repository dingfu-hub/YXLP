import { testConfig } from '../config/test-config';
import fetch from 'node-fetch';

// 设置全局fetch
if (!global.fetch) {
  global.fetch = fetch as any;
}

// 设置全局测试超时
jest.setTimeout(testConfig.timeout);

// 全局测试前置设置
beforeAll(async () => {
  console.log('🔧 设置全局测试环境...');
  
  // 设置环境变量
  process.env.NODE_ENV = 'test';
  process.env.TEST_BASE_URL = testConfig.baseUrl;
  process.env.TEST_API_URL = testConfig.apiUrl;
  
  // 检查测试环境是否可用
  try {
    const response = await fetch(`${testConfig.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    console.log('✅ 测试环境健康检查通过');
  } catch (error) {
    console.error('❌ 测试环境不可用:', (error as Error).message);
    console.error('请确保应用程序正在运行');
    process.exit(1);
  }
});

// 全局测试后置清理
afterAll(async () => {
  console.log('🧹 清理全局测试环境...');
  // 这里可以添加全局清理逻辑
});

// 每个测试前的设置
beforeEach(() => {
  // 重置所有模拟
  jest.clearAllMocks();
});

// 每个测试后的清理
afterEach(() => {
  // 清理定时器
  jest.clearAllTimers();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 扩展Jest匹配器
expect.extend({
  toBeValidApiResponse(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 typeof received.success === 'boolean' &&
                 typeof received.status === 'number' &&
                 typeof received.duration === 'number';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid API response with success, status, and duration properties`,
        pass: false,
      };
    }
  },

  toBeSuccessfulResponse(received) {
    const pass = received && 
                 received.success === true &&
                 received.status >= 200 && 
                 received.status < 300;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a successful response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a successful response (success: true, status: 2xx)`,
        pass: false,
      };
    }
  },

  toBeErrorResponse(received, expectedStatus?: number) {
    const pass = received && 
                 received.success === false &&
                 (expectedStatus ? received.status === expectedStatus : received.status >= 400);

    if (pass) {
      return {
        message: () => `expected ${received} not to be an error response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be an error response${expectedStatus ? ` with status ${expectedStatus}` : ''}`,
        pass: false,
      };
    }
  },

  toHaveValidTimestamp(received) {
    const pass = received && 
                 typeof received === 'string' &&
                 !isNaN(Date.parse(received));

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO timestamp string`,
        pass: false,
      };
    }
  }
});

// 声明自定义匹配器类型
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidApiResponse(): R;
      toBeSuccessfulResponse(): R;
      toBeErrorResponse(expectedStatus?: number): R;
      toHaveValidTimestamp(): R;
    }
  }
}

export {};
