/**
 * 图片工具函数
 */

// 支持的图片格式
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml'
]

// 图片尺寸预设
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 },
  square: { width: 400, height: 400 },
  card: { width: 400, height: 300 },
  banner: { width: 1200, height: 300 },
}

/**
 * 生成占位图片URL
 */
export function generatePlaceholderUrl(
  width: number,
  height: number,
  options: {
    text?: string
    bgColor?: string
    textColor?: string
  } = {}
): string {
  const {
    text = `${width}×${height}`,
    bgColor = 'f3f4f6',
    textColor = '6b7280'
  } = options

  const params = new URLSearchParams({
    text: text,
    bg: bgColor,
    color: textColor
  })

  return `/api/placeholder/${width}x${height}?${params.toString()}`
}

/**
 * 获取图片的优化URL
 */
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'auto'
  } = {}
): string {
  if (!src) return generatePlaceholderUrl(400, 300)
  
  // 如果是外部URL，直接返回
  if (src.startsWith('http')) return src
  
  // 如果是占位图片API，直接返回
  if (src.startsWith('/api/placeholder')) return src
  
  // 构建Next.js图片优化URL
  const params = new URLSearchParams()
  
  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format && options.format !== 'auto') {
    params.set('f', options.format)
  }
  
  const queryString = params.toString()
  return queryString ? `${src}?${queryString}` : src
}

/**
 * 检查图片格式是否支持
 */
export function isSupportedImageFormat(mimeType: string): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType.toLowerCase())
}

/**
 * 获取图片文件扩展名
 */
export function getImageExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg'
  }
  
  return extensions[mimeType.toLowerCase()] || 'jpg'
}

/**
 * 生成响应式图片的sizes属性
 */
export function generateSizes(breakpoints: {
  mobile?: number
  tablet?: number
  desktop?: number
  default?: number
}): string {
  const {
    mobile = 100,
    tablet = 50,
    desktop = 33,
    default: defaultSize = 100
  } = breakpoints

  return [
    `(max-width: 640px) ${mobile}vw`,
    `(max-width: 1024px) ${tablet}vw`,
    `(max-width: 1280px) ${desktop}vw`,
    `${defaultSize}vw`
  ].join(', ')
}

/**
 * 图片预设配置
 */
export const IMAGE_PRESETS = {
  // 产品图片
  product: {
    sizes: IMAGE_SIZES.card,
    quality: 85,
    format: 'webp' as const,
    placeholder: (name: string) => generatePlaceholderUrl(
      IMAGE_SIZES.card.width,
      IMAGE_SIZES.card.height,
      { text: name || '产品图片', bgColor: 'f8fafc', textColor: '475569' }
    )
  },
  
  // 英雄区域图片
  hero: {
    sizes: IMAGE_SIZES.hero,
    quality: 90,
    format: 'webp' as const,
    placeholder: (text: string) => generatePlaceholderUrl(
      IMAGE_SIZES.hero.width,
      IMAGE_SIZES.hero.height,
      { text: text || '英雄图片', bgColor: '1e40af', textColor: 'ffffff' }
    )
  },
  
  // 缩略图
  thumbnail: {
    sizes: IMAGE_SIZES.thumbnail,
    quality: 75,
    format: 'webp' as const,
    placeholder: (text: string) => generatePlaceholderUrl(
      IMAGE_SIZES.thumbnail.width,
      IMAGE_SIZES.thumbnail.height,
      { text: text || '缩略图', bgColor: 'e5e7eb', textColor: '6b7280' }
    )
  },
  
  // 头像
  avatar: {
    sizes: IMAGE_SIZES.square,
    quality: 80,
    format: 'webp' as const,
    placeholder: (name: string) => generatePlaceholderUrl(
      IMAGE_SIZES.square.width,
      IMAGE_SIZES.square.height,
      { text: name?.charAt(0) || '?', bgColor: '3b82f6', textColor: 'ffffff' }
    )
  }
}

/**
 * 获取预设图片配置
 */
export function getImagePreset(preset: keyof typeof IMAGE_PRESETS) {
  return IMAGE_PRESETS[preset]
}
