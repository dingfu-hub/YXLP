module.exports = {
  i18n: {
    // 默认语言 - 检测浏览器语言失败时的回退语言
    defaultLocale: 'zh',

    // 支持的语言列表 - 对应URL路径
    locales: [
      'zh',    // 中文简体 - /zh/
      'en',    // 英语 - /en/
      'ja',    // 日语 - /ja/
      'ko',    // 韩语 - /ko/
      'es',    // 西班牙语 - /es/
      'fr',    // 法语 - /fr/
      'de',    // 德语 - /de/
      'it',    // 意大利语 - /it/
      'pt',    // 葡萄牙语 - /pt/
      'ru',    // 俄语 - /ru/
    ],

    // 语言检测配置 - 自动检测用户浏览器语言
    localeDetection: true,

    // 域名配置（可选，用于多域名部署）
    // domains: [
    //   {
    //     domain: 'yxlp.com',
    //     defaultLocale: 'en',
    //   },
    //   {
    //     domain: 'yxlp.cn',
    //     defaultLocale: 'zh',
    //   }
    // ],
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

  // 回退语言配置
  fallbackLng: {
    // 不支持的语言回退到英文，英文不可用时回退到中文
    default: ['en', 'zh'],
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
