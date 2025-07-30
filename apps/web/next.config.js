const { i18n } = require('./next-i18next.config.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 国际化配置
  i18n,

  // 实验性功能
  experimental: {
    // 服务器组件
    serverComponentsExternalPackages: ['@yxlp/types'],
  },

  // 图片优化配置
  images: {
    domains: [
      'localhost',
      'yxlp-platform.com',
      's3.amazonaws.com',
      'cloudfront.net',
      'picsum.photos', // 示例图片服务
      'images.unsplash.com', // Unsplash图片
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 允许优化SVG图片
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 编译配置
  compiler: {
    // 移除 console.log
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },

  // 重写配置 - 暂时禁用，因为API在同一个应用中
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
  //     },
  //   ]
  // },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 输出配置
  output: 'standalone',

  // 压缩配置
  compress: true,

  // 电源配置
  poweredByHeader: false,

  // 严格模式
  reactStrictMode: true,

  // SWC 最小化
  swcMinify: true,

  // 分析包大小
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html',
          })
        )
      }
      return config
    },
  }),
}

module.exports = nextConfig
