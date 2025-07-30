import { NextRequest, NextResponse } from 'next/server'
import { autoTranslator, SUPPORTED_LANGUAGES } from '@/lib/translation/auto-translator'
import { SupportedLanguage } from '@/types/news'

/**
 * 自动翻译API
 * POST /api/admin/translation/auto-translate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      content, 
      sourceLanguage = 'zh', 
      targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage),
      async: asyncMode = false 
    } = body

    // 验证输入
    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
      return NextResponse.json(
        { error: '不支持的源语言' },
        { status: 400 }
      )
    }

    // 验证目标语言
    const validTargetLanguages = targetLanguages.filter((lang: string) => 
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
    )

    if (validTargetLanguages.length === 0) {
      return NextResponse.json(
        { error: '没有有效的目标语言' },
        { status: 400 }
      )
    }

    if (asyncMode) {
      // 异步模式：创建翻译任务
      const task = await autoTranslator.createTranslationTask(
        content,
        sourceLanguage,
        validTargetLanguages
      )

      return NextResponse.json({
        success: true,
        data: {
          taskId: task.id,
          status: task.status,
          message: '翻译任务已创建，正在后台处理'
        }
      })
    } else {
      // 同步模式：直接翻译并返回结果
      const results = await autoTranslator.translateContent(
        content,
        sourceLanguage,
        validTargetLanguages
      )

      return NextResponse.json({
        success: true,
        data: {
          sourceLanguage,
          targetLanguages: validTargetLanguages,
          results,
          translatedAt: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('自动翻译失败:', error)
    return NextResponse.json(
      { error: '翻译服务暂时不可用' },
      { status: 500 }
    )
  }
}

/**
 * 获取翻译任务状态
 * GET /api/admin/translation/auto-translate?taskId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      )
    }

    const task = autoTranslator.getTaskStatus(taskId)

    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        status: task.status,
        progress: task.results.length / (task.targetLanguages.length * Object.keys(task.content).length),
        results: task.results,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        error: task.error
      }
    })

  } catch (error) {
    console.error('获取翻译任务状态失败:', error)
    return NextResponse.json(
      { error: '获取任务状态失败' },
      { status: 500 }
    )
  }
}
