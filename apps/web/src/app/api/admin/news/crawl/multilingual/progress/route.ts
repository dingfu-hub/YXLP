import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'

// 这个文件专门用于获取多语种采集进度
// 实际的进度数据存储在 multilingual/route.ts 中

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json({ error: '无效的认证格式' }, { status: 401 })
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json({ error: '令牌已失效' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const admin = findAdminById(decoded.userId)
    if (!admin) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 401 })
    }

    // 调用主要的多语种采集API来获取进度
    const progressResponse = await fetch(`${request.nextUrl.origin}/api/admin/news/crawl/multilingual`, {
      method: 'GET',
      headers: {
        'authorization': request.headers.get('authorization') || '',
        'cookie': request.headers.get('cookie') || ''
      }
    })

    if (!progressResponse.ok) {
      throw new Error('获取进度失败')
    }

    const progressData = await progressResponse.json()
    
    return NextResponse.json(progressData)

  } catch (error) {
    console.error('获取多语种采集进度失败:', error)
    return NextResponse.json(
      { error: '获取进度失败' },
      { status: 500 }
    )
  }
}
