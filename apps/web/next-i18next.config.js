module.exports = {
  i18n: {
    // 默认语言
    defaultLocale: 'en',
    
    // 支持的语言列表
    locales: [
      'en',    // 英语
      'zh',    // 中文简体
      'zh-TW', // 中文繁体
      'es',    // 西班牙语
      'fr',    // 法语
      'de',    // 德语
      'ja',    // 日语
      'ko',    // 韩语
      'ar',    // 阿拉伯语
      'pt',    // 葡萄牙语
      'ru',    // 俄语
      'it',    // 意大利语
    ],

    // 语言检测配置
    localeDetection: true,

    // 域名配置（用于多域名部署）
    domains: [
      {
        domain: 'yxlp.com',
        defaultLocale: 'en',
      },
      {
        domain: 'yxlp.cn',
        defaultLocale: 'zh',
      },
      {
        domain: 'yxlp.es',
        defaultLocale: 'es',
      },
      {
        domain: 'yxlp.fr',
        defaultLocale: 'fr',
      },
      {
        domain: 'yxlp.de',
        defaultLocale: 'de',
      },
      {
        domain: 'yxlp.jp',
        defaultLocale: 'ja',
      },
      {
        domain: 'yxlp.kr',
        defaultLocale: 'ko',
      },
    ],
  },

  // 翻译文件配置
  localePath: './public/locales',
  
  // 默认命名空间
  defaultNS: 'common',
  
  // 命名空间列表
  ns: [
    'common',
    'navigation',
    'auth',
    'product',
    'order',
    'user',
    'admin',
    'error',
    'validation',
    'seo',
  ],

  // 回退语言
  fallbackLng: {
    'zh-TW': ['zh', 'en'],
    'zh-HK': ['zh-TW', 'zh', 'en'],
    'zh-SG': ['zh', 'en'],
    default: ['en'],
  },

  // 调试模式
  debug: process.env.NODE_ENV === 'development',

  // 服务器端渲染
  serverLanguageDetection: true,

  // 客户端语言检测
  detection: {
    // 检测顺序
    order: [
      'querystring',
      'cookie',
      'localStorage',
      'sessionStorage',
      'navigator',
      'htmlTag',
      'path',
      'subdomain',
    ],

    // 缓存配置
    caches: ['localStorage', 'cookie'],

    // Cookie 配置
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 天
      sameSite: 'strict',
    },

    // 排除路径
    excludeCacheFor: ['cimode'],
  },

  // 插值配置
  interpolation: {
    escapeValue: false,
  },



  // 重新加载配置
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
