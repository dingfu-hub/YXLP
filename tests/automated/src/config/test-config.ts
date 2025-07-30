export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
  slowMo: number;
  testData: {
    admin: {
      username: string;
      password: string;
    };
    editor: {
      username: string;
      password: string;
    };
    testUser: {
      username: string;
      password: string;
    };
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  reports: {
    outputDir: string;
    format: string[];
  };
}

export const testConfig: TestConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  retries: parseInt(process.env.TEST_RETRIES || '2'),
  headless: process.env.TEST_HEADLESS !== 'false',
  slowMo: parseInt(process.env.TEST_SLOW_MO || '0'),
  testData: {
    admin: {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
    },
    editor: {
      username: process.env.TEST_EDITOR_USERNAME || 'editor',
      password: process.env.TEST_EDITOR_PASSWORD || 'Editor123!'
    },
    testUser: {
      username: process.env.TEST_USER_USERNAME || 'testuser',
      password: process.env.TEST_USER_PASSWORD || 'Test123!'
    }
  },
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'test_news_system',
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password'
  },
  reports: {
    outputDir: process.env.TEST_REPORTS_DIR || './reports',
    format: ['json', 'html', 'junit']
  }
};

export const testCases = {
  AUTH: {
    'AUTH-001': {
      id: 'AUTH-001',
      title: '管理员正常登录',
      priority: 'high',
      type: 'functional',
      module: 'authentication'
    },
    'AUTH-002': {
      id: 'AUTH-002',
      title: '用户名不存在',
      priority: 'high',
      type: 'functional',
      module: 'authentication'
    },
    'AUTH-003': {
      id: 'AUTH-003',
      title: '密码错误',
      priority: 'high',
      type: 'functional',
      module: 'authentication'
    },
    'AUTH-004': {
      id: 'AUTH-004',
      title: '空用户名',
      priority: 'medium',
      type: 'functional',
      module: 'authentication'
    },
    'AUTH-005': {
      id: 'AUTH-005',
      title: '空密码',
      priority: 'medium',
      type: 'functional',
      module: 'authentication'
    }
  },
  USER: {
    'USER-001': {
      id: 'USER-001',
      title: '查看用户列表',
      priority: 'high',
      type: 'functional',
      module: 'user-management'
    },
    'USER-007': {
      id: 'USER-007',
      title: '创建新的管理员用户',
      priority: 'high',
      type: 'functional',
      module: 'user-management'
    }
  },
  NEWS: {
    'NEWS-001': {
      id: 'NEWS-001',
      title: '查看新闻文章列表',
      priority: 'high',
      type: 'functional',
      module: 'news-management'
    }
  },
  COLLECT: {
    'COLLECT-001': {
      id: 'COLLECT-001',
      title: '查看新闻源列表',
      priority: 'high',
      type: 'functional',
      module: 'news-collection'
    }
  },
  PUBLISH: {
    'PUBLISH-001': {
      id: 'PUBLISH-001',
      title: '查看待发布文章列表',
      priority: 'high',
      type: 'functional',
      module: 'news-publishing'
    }
  },
  POLISH: {
    'POLISH-001': {
      id: 'POLISH-001',
      title: '对单篇文章进行AI润色',
      priority: 'high',
      type: 'functional',
      module: 'ai-polish'
    }
  }
};

export default testConfig;
