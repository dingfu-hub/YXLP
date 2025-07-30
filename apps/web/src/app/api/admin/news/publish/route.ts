import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getNewsById, updateNews } from '@/data/news'

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { articleIds, settings } = body

    // 验证必填字段
    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: '缺少文章ID列表' },
        { status: 400 }
      )
    }

    if (!settings) {
      return NextResponse.json(
        { error: '缺少发布设置' },
        { status: 400 }
      )
    }

    const { scheduleType, scheduledTime, platforms, seoOptimization, generateSocialPosts, notifySubscribers } = settings

    let publishedCount = 0
    let failedCount = 0
    const results = []

    // 处理每篇文章
    for (const articleId of articleIds) {
      try {
        const article = getNewsById(articleId)
        
        if (!article) {
          results.push({
            articleId,
            success: false,
            error: '文章不存在'
          })
          failedCount++
          continue
        }

        // 根据发布类型处理
        let updateData: any = {
          updatedAt: new Date()
        }

        if (scheduleType === 'immediate') {
          updateData.status = 'published'
          updateData.publishedAt = new Date()
          updateData.author = user.username
        } else if (scheduleType === 'scheduled') {
          if (!scheduledTime) {
            results.push({
              articleId,
              success: false,
              error: '缺少定时发布时间'
            })
            failedCount++
            continue
          }
          
          updateData.status = 'scheduled'
          updateData.scheduledAt = new Date(scheduledTime)
          updateData.author = user.username
        } else if (scheduleType === 'draft') {
          updateData.status = 'draft'
        }

        // SEO优化
        if (seoOptimization) {
          if (!article.metaDescription && article.summary) {
            updateData.metaDescription = article.summary.substring(0, 160)
          }
          
          if (!article.keywords && article.title) {
            // 简单的关键词提取（实际应用中可以使用更复杂的算法）
            const keywords = article.title
              .split(/[\s,，。！？；：]/)
              .filter(word => word.length > 1)
              .slice(0, 5)
            updateData.keywords = keywords
          }
        }

        // 生成社交媒体文案
        if (generateSocialPosts) {
          updateData.socialPosts = {
            wechat: `【${article.title}】${article.summary}`,
            weibo: `#${article.category}# ${article.title} ${article.summary}`,
            toutiao: article.title
          }
        }

        // 发布平台设置
        updateData.publishPlatforms = platforms

        // 更新文章
        const updatedArticle = updateNews(articleId, updateData)
        
        if (updatedArticle) {
          results.push({
            articleId,
            success: true,
            status: updateData.status,
            publishedAt: updateData.publishedAt,
            scheduledAt: updateData.scheduledAt
          })
          publishedCount++

          // 模拟发布到各平台
          if (scheduleType === 'immediate' && platforms) {
            const platformResults = []
            
            if (platforms.website) {
              platformResults.push({ platform: 'website', success: true })
            }
            
            if (platforms.wechat) {
              // 模拟微信公众号发布
              platformResults.push({ 
                platform: 'wechat', 
                success: Math.random() > 0.1, // 90% 成功率
                error: Math.random() > 0.1 ? null : '微信API调用失败'
              })
            }
            
            if (platforms.weibo) {
              // 模拟微博发布
              platformResults.push({ 
                platform: 'weibo', 
                success: Math.random() > 0.1,
                error: Math.random() > 0.1 ? null : '微博API调用失败'
              })
            }
            
            if (platforms.toutiao) {
              // 模拟今日头条发布
              platformResults.push({ 
                platform: 'toutiao', 
                success: Math.random() > 0.1,
                error: Math.random() > 0.1 ? null : '头条API调用失败'
              })
            }
            
            results[results.length - 1].platformResults = platformResults
          }

          // 通知订阅者
          if (notifySubscribers && scheduleType === 'immediate') {
            // 模拟发送通知
            console.log(`通知订阅者新文章发布: ${article.title}`)
          }
        } else {
          results.push({
            articleId,
            success: false,
            error: '更新文章失败'
          })
          failedCount++
        }

      } catch (error) {
        console.error(`处理文章 ${articleId} 时出错:`, error)
        results.push({
          articleId,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        published: publishedCount,
        failed: failedCount,
        total: articleIds.length,
        results
      },
      message: `成功处理 ${publishedCount} 篇文章，失败 ${failedCount} 篇`
    })

  } catch (error) {
    console.error('发布文章错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取发布统计
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    let token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      token = parseAuthHeader(authHeader)
    }

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 403 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('news:read')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 模拟发布统计数据
    const stats = {
      today: {
        published: 12,
        scheduled: 5,
        draft: 8
      },
      thisWeek: {
        published: 85,
        scheduled: 23,
        draft: 34
      },
      thisMonth: {
        published: 342,
        scheduled: 89,
        draft: 156
      },
      platforms: {
        website: { published: 342, success: 340, failed: 2 },
        wechat: { published: 298, success: 295, failed: 3 },
        weibo: { published: 256, success: 251, failed: 5 },
        toutiao: { published: 189, success: 186, failed: 3 }
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取发布统计错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
