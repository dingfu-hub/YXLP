import { NextRequest, NextResponse } from 'next/server'

/**
 * 占位图片API
 * 生成指定尺寸的占位图片
 * 路径格式: /api/placeholder/width/height 或 /api/placeholder/widthxheight
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    let width = 400
    let height = 300
    let text = ''

    // 解析尺寸参数
    if (params.dimensions && params.dimensions.length > 0) {
      const dimensionStr = params.dimensions.join('/')
      
      // 支持格式: 400/300 或 400x300
      if (dimensionStr.includes('x')) {
        const [w, h] = dimensionStr.split('x')
        width = parseInt(w) || 400
        height = parseInt(h) || 300
      } else if (params.dimensions.length >= 2) {
        width = parseInt(params.dimensions[0]) || 400
        height = parseInt(params.dimensions[1]) || 300
      } else if (params.dimensions.length === 1) {
        const size = parseInt(params.dimensions[0]) || 400
        width = size
        height = size
      }
    }

    // 限制尺寸范围
    width = Math.min(Math.max(width, 50), 2000)
    height = Math.min(Math.max(height, 50), 2000)

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    text = searchParams.get('text') || `${width}×${height}`
    const bgColor = searchParams.get('bg') || 'e5e7eb' // 默认灰色
    const textColor = searchParams.get('color') || '374151' // 默认深灰色

    // 生成SVG占位图片
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#${bgColor}"/>
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          fill="#${textColor}" 
          font-family="Arial, sans-serif" 
          font-size="${Math.min(width, height) / 10}"
        >
          ${text}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('占位图片生成失败:', error)
    
    // 返回默认的占位图片
    const defaultSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          fill="#374151" 
          font-family="Arial, sans-serif" 
          font-size="24"
        >
          图片加载中...
        </text>
      </svg>
    `

    return new NextResponse(defaultSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}
