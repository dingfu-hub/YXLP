// 评论系统API
import { NextRequest, NextResponse } from 'next/server'

// 模拟评论数据存储
let comments: any[] = [
  {
    id: '1',
    newsId: '1753560316774',
    author: '张三',
    email: 'zhangsan@example.com',
    content: '这篇文章写得很好，对服装行业的分析很到位！',
    parentId: undefined,
    status: 'approved',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    replies: []
  },
  {
    id: '2',
    newsId: '1753560316774',
    author: '李四',
    email: 'lisi@example.com',
    content: '同意楼上的观点，现在服装行业确实面临很多挑战。',
    parentId: '1',
    status: 'approved',
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z'),
    replies: []
  },
  {
    id: '3',
    newsId: '1753560316774',
    author: '王五',
    email: 'wangwu@example.com',
    content: '希望能看到更多关于可持续时尚的内容。',
    parentId: undefined,
    status: 'pending',
    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z'),
    replies: []
  }
]

// 获取评论
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')
    
    if (!newsId) {
      return NextResponse.json(
        { error: '缺少新闻ID' },
        { status: 400 }
      )
    }

    // 过滤指定新闻的评论
    const newsComments = comments.filter(c => c.newsId === newsId)
    
    // 构建评论树结构
    const commentTree = buildCommentTree(newsComments)

    return NextResponse.json({
      success: true,
      data: commentTree
    })

  } catch (error) {
    console.error('获取评论失败:', error)
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    )
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsId, author, email, content, parentId } = body

    // 验证必填字段
    if (!newsId || !author || !content) {
      return NextResponse.json(
        { error: '新闻ID、作者和内容为必填字段' },
        { status: 400 }
      )
    }

    // 验证内容长度
    if (content.length > 1000) {
      return NextResponse.json(
        { error: '评论内容不能超过1000字符' },
        { status: 400 }
      )
    }

    // 简单的垃圾评论过滤
    const spamKeywords = ['垃圾', '广告', '推广', 'spam']
    const isSpam = spamKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )

    // 创建新评论
    const newComment = {
      id: Date.now().toString(),
      newsId,
      author: author.trim(),
      email: email?.trim() || '',
      content: content.trim(),
      parentId: parentId || undefined,
      status: isSpam ? 'rejected' : 'pending', // 新评论默认待审核
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: []
    }

    comments.push(newComment)

    return NextResponse.json({
      success: true,
      message: '评论提交成功，等待审核',
      data: newComment
    })

  } catch (error) {
    console.error('创建评论失败:', error)
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    )
  }
}

// 构建评论树结构
function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map()
  const rootComments: any[] = []

  // 首先创建所有评论的映射
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // 然后构建树结构
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)
    
    if (comment.parentId) {
      // 这是一个回复
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      // 这是一个根评论
      rootComments.push(commentWithReplies)
    }
  })

  // 按时间排序
  rootComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
  // 对每个评论的回复也按时间排序
  rootComments.forEach(comment => {
    if (comment.replies.length > 0) {
      comment.replies.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }
  })

  return rootComments
}

// 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    
    if (!commentId) {
      return NextResponse.json(
        { error: '缺少评论ID' },
        { status: 400 }
      )
    }

    // 查找评论
    const commentIndex = comments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }

    // 删除评论及其所有回复
    const deleteCommentAndReplies = (id: string) => {
      // 删除主评论
      comments = comments.filter(c => c.id !== id)
      
      // 删除所有回复
      const replies = comments.filter(c => c.parentId === id)
      replies.forEach(reply => {
        deleteCommentAndReplies(reply.id)
      })
    }

    deleteCommentAndReplies(commentId)

    return NextResponse.json({
      success: true,
      message: '评论删除成功'
    })

  } catch (error) {
    console.error('删除评论失败:', error)
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    )
  }
}

// 获取评论统计
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')
    
    if (!newsId) {
      return NextResponse.json(
        { error: '缺少新闻ID' },
        { status: 400 }
      )
    }

    const newsComments = comments.filter(c => c.newsId === newsId)
    const approvedCount = newsComments.filter(c => c.status === 'approved').length
    const pendingCount = newsComments.filter(c => c.status === 'pending').length
    const rejectedCount = newsComments.filter(c => c.status === 'rejected').length

    return NextResponse.json({
      success: true,
      data: {
        total: newsComments.length,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount
      }
    })

  } catch (error) {
    console.error('获取评论统计失败:', error)
    return NextResponse.json(
      { error: '获取评论统计失败' },
      { status: 500 }
    )
  }
}
