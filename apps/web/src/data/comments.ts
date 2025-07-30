// 评论数据管理
import { Comment, User } from '@/types/news'
import { users } from '@/data/users'

// 模拟评论数据
let comments: Comment[] = [
  {
    id: 'comment_1',
    newsId: '1',
    userId: 'user_001',
    content: '这篇关于时尚趋势的文章写得很好，很有见解！',
    isDeleted: false,
    likeCount: 5,
    replyCount: 2,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'comment_2',
    newsId: '1',
    userId: 'user_002',
    parentId: 'comment_1',
    content: '同意！特别是关于可持续时尚的部分。',
    isDeleted: false,
    likeCount: 2,
    replyCount: 0,
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z')
  },
  {
    id: 'comment_3',
    newsId: '1',
    userId: 'user_003',
    parentId: 'comment_1',
    content: '希望能看到更多这样的深度分析。',
    isDeleted: false,
    likeCount: 1,
    replyCount: 0,
    createdAt: new Date('2024-01-15T11:15:00Z'),
    updatedAt: new Date('2024-01-15T11:15:00Z')
  },
  {
    id: 'comment_4',
    newsId: '2',
    userId: 'user_001',
    content: '内衣行业的发展确实很快，这些数据很有参考价值。',
    isDeleted: false,
    likeCount: 3,
    replyCount: 0,
    createdAt: new Date('2024-01-16T09:20:00Z'),
    updatedAt: new Date('2024-01-16T09:20:00Z')
  }
]

// 评论CRUD操作
export function getAllComments(): Comment[] {
  return comments.filter(comment => !comment.isDeleted)
}

export function getCommentById(id: string): Comment | null {
  const comment = comments.find(comment => comment.id === id)
  return comment && !comment.isDeleted ? comment : null
}

export function getCommentsByNewsId(newsId: string): Comment[] {
  return comments
    .filter(comment => comment.newsId === newsId && !comment.isDeleted)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export function getCommentsByUserId(userId: string): Comment[] {
  return comments
    .filter(comment => comment.userId === userId && !comment.isDeleted)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function createComment(commentData: Omit<Comment, 'id' | 'likeCount' | 'replyCount' | 'createdAt' | 'updatedAt'>): Comment {
  const newComment: Comment = {
    ...commentData,
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    likeCount: 0,
    replyCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  comments.push(newComment)
  
  // 如果是回复，更新父评论的回复数
  if (newComment.parentId) {
    updateCommentReplyCount(newComment.parentId)
  }
  
  return newComment
}

export function updateComment(id: string, updates: Partial<Pick<Comment, 'content'>>): Comment | null {
  const commentIndex = comments.findIndex(comment => comment.id === id)
  if (commentIndex === -1) return null
  
  comments[commentIndex] = {
    ...comments[commentIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  return comments[commentIndex]
}

export function deleteComment(id: string, deletedBy?: string): boolean {
  const commentIndex = comments.findIndex(comment => comment.id === id)
  if (commentIndex === -1) return false
  
  // 软删除
  comments[commentIndex] = {
    ...comments[commentIndex],
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy,
    updatedAt: new Date()
  }
  
  // 删除所有子评论
  const childComments = comments.filter(comment => comment.parentId === id)
  childComments.forEach(child => {
    deleteComment(child.id, deletedBy)
  })
  
  // 更新父评论的回复数
  const comment = comments[commentIndex]
  if (comment.parentId) {
    updateCommentReplyCount(comment.parentId)
  }
  
  return true
}

// 更新评论回复数
function updateCommentReplyCount(commentId: string) {
  const commentIndex = comments.findIndex(comment => comment.id === commentId)
  if (commentIndex === -1) return
  
  const replyCount = comments.filter(comment => 
    comment.parentId === commentId && !comment.isDeleted
  ).length
  
  comments[commentIndex] = {
    ...comments[commentIndex],
    replyCount,
    updatedAt: new Date()
  }
}

// 点赞/取消点赞评论
export function toggleCommentLike(commentId: string, userId: string): boolean {
  // 这里简化处理，实际项目中需要单独的点赞表
  const commentIndex = comments.findIndex(comment => comment.id === commentId)
  if (commentIndex === -1) return false
  
  // 模拟点赞逻辑
  comments[commentIndex] = {
    ...comments[commentIndex],
    likeCount: Math.max(0, comments[commentIndex].likeCount + (Math.random() > 0.5 ? 1 : -1)),
    updatedAt: new Date()
  }
  
  return true
}

// 获取评论树结构
export function getCommentTree(newsId: string): Comment[] {
  const allComments = getCommentsByNewsId(newsId)
  const rootComments = allComments.filter(comment => !comment.parentId)
  
  return rootComments.map(comment => ({
    ...comment,
    replies: getCommentReplies(comment.id, allComments)
  }))
}

function getCommentReplies(parentId: string, allComments: Comment[]): Comment[] {
  const replies = allComments.filter(comment => comment.parentId === parentId)
  
  return replies.map(reply => ({
    ...reply,
    replies: getCommentReplies(reply.id, allComments)
  }))
}

// 获取评论及用户信息
export function getCommentsWithUsers(newsId: string, isAdmin: boolean = false): any[] {
  const commentTree = getCommentTree(newsId)
  
  return commentTree.map(comment => ({
    ...comment,
    user: getUserForComment(comment.userId, isAdmin),
    replies: comment.replies?.map((reply: any) => ({
      ...reply,
      user: getUserForComment(reply.userId, isAdmin),
      parentComment: {
        id: comment.id,
        user: getUserForComment(comment.userId, isAdmin)
      }
    }))
  }))
}

function getUserForComment(userId: string, isAdmin: boolean): any {
  const user = users.find(u => u.id === userId)
  if (!user) return null
  
  if (isAdmin) {
    return {
      id: user.id,
      displayName: user.profile?.displayName || user.username,
      avatar: user.profile?.avatar,
      role: user.role
    }
  }
  
  // 普通用户看到的信息（隐藏部分信息）
  const displayName = user.profile?.displayName || user.username
  return {
    id: user.id,
    displayName: maskDisplayName(displayName),
    avatar: user.profile?.avatar,
    role: user.role
  }
}

// 隐藏显示名称
function maskDisplayName(displayName: string): string {
  if (displayName.length <= 2) {
    return displayName
  }
  
  const firstChar = displayName.charAt(0)
  const lastChar = displayName.charAt(displayName.length - 1)
  const middleStars = '*'.repeat(Math.max(1, displayName.length - 2))
  
  return `${firstChar}${middleStars}${lastChar}`
}

// 搜索评论
export function searchComments(query: string): Comment[] {
  const lowercaseQuery = query.toLowerCase()
  return comments.filter(comment =>
    !comment.isDeleted &&
    comment.content.toLowerCase().includes(lowercaseQuery)
  )
}

// 获取评论统计信息
export function getCommentStats(newsId?: string) {
  const targetComments = newsId 
    ? comments.filter(comment => comment.newsId === newsId)
    : comments
  
  const totalComments = targetComments.filter(comment => !comment.isDeleted).length
  const deletedComments = targetComments.filter(comment => comment.isDeleted).length
  const totalLikes = targetComments.reduce((sum, comment) => sum + comment.likeCount, 0)
  
  return {
    totalComments,
    deletedComments,
    totalLikes,
    averageLikes: totalComments > 0 ? totalLikes / totalComments : 0
  }
}

// 管理员功能：获取所有评论（包括已删除）
export function getAllCommentsForAdmin(): Comment[] {
  return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// 管理员功能：恢复已删除的评论
export function restoreComment(id: string): boolean {
  const commentIndex = comments.findIndex(comment => comment.id === id)
  if (commentIndex === -1) return false
  
  comments[commentIndex] = {
    ...comments[commentIndex],
    isDeleted: false,
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: new Date()
  }
  
  return true
}

// 批量删除评论
export function batchDeleteComments(commentIds: string[], deletedBy?: string): number {
  let deletedCount = 0
  
  commentIds.forEach(id => {
    if (deleteComment(id, deletedBy)) {
      deletedCount++
    }
  })
  
  return deletedCount
}
