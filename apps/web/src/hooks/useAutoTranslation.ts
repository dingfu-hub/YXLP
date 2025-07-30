import { useState, useCallback } from 'react'
import { SupportedLanguage } from '@/types/news'
import { MultiLanguageContent, TranslationTask, TranslationStatus } from '@/lib/translation/auto-translator'

interface UseAutoTranslationOptions {
  sourceLanguage?: SupportedLanguage
  targetLanguages?: SupportedLanguage[]
  autoTranslate?: boolean // 是否在内容变化时自动翻译
}

interface TranslationState {
  isTranslating: boolean
  progress: number
  error: string | null
  results: Record<string, MultiLanguageContent> | null
  taskId: string | null
}

export function useAutoTranslation(options: UseAutoTranslationOptions = {}) {
  const {
    sourceLanguage = 'zh',
    targetLanguages = ['en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'],
    autoTranslate = false
  } = options

  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    progress: 0,
    error: null,
    results: null,
    taskId: null
  })

  /**
   * 翻译内容
   */
  const translateContent = useCallback(async (
    content: Record<string, string>,
    asyncMode = false
  ) => {
    setState(prev => ({
      ...prev,
      isTranslating: true,
      error: null,
      progress: 0
    }))

    try {
      const response = await fetch('/api/admin/translation/auto-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          sourceLanguage,
          targetLanguages,
          async: asyncMode
        })
      })

      if (!response.ok) {
        throw new Error('翻译请求失败')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '翻译失败')
      }

      if (asyncMode) {
        // 异步模式：开始轮询任务状态
        setState(prev => ({
          ...prev,
          taskId: result.data.taskId
        }))
        
        await pollTranslationStatus(result.data.taskId)
      } else {
        // 同步模式：直接返回结果
        setState(prev => ({
          ...prev,
          isTranslating: false,
          progress: 100,
          results: result.data.results
        }))
      }

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '翻译失败'
      setState(prev => ({
        ...prev,
        isTranslating: false,
        error: errorMessage
      }))
      throw error
    }
  }, [sourceLanguage, targetLanguages])

  /**
   * 轮询翻译任务状态
   */
  const pollTranslationStatus = useCallback(async (taskId: string) => {
    const maxAttempts = 60 // 最多轮询60次（5分钟）
    let attempts = 0

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/translation/auto-translate?taskId=${taskId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('获取翻译状态失败')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || '获取翻译状态失败')
        }

        const { status, progress, results, error } = result.data

        setState(prev => ({
          ...prev,
          progress: Math.round(progress * 100)
        }))

        if (status === TranslationStatus.COMPLETED) {
          // 翻译完成
          setState(prev => ({
            ...prev,
            isTranslating: false,
            progress: 100,
            results: results.reduce((acc: Record<string, MultiLanguageContent>, item: any) => {
              const key = Object.keys(acc).length.toString() // 简单的key生成
              acc[key] = { [item.language]: item.text }
              return acc
            }, {})
          }))
          return
        }

        if (status === TranslationStatus.FAILED) {
          throw new Error(error || '翻译任务失败')
        }

        // 继续轮询
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // 5秒后再次轮询
        } else {
          throw new Error('翻译任务超时')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '翻译状态检查失败'
        setState(prev => ({
          ...prev,
          isTranslating: false,
          error: errorMessage
        }))
      }
    }

    await poll()
  }, [])

  /**
   * 翻译单个字段
   */
  const translateField = useCallback(async (
    fieldName: string,
    text: string
  ): Promise<MultiLanguageContent> => {
    const content = { [fieldName]: text }
    const result = await translateContent(content, false)
    return result.results[fieldName] || { zh: text }
  }, [translateContent])

  /**
   * 批量翻译多个字段
   */
  const translateFields = useCallback(async (
    fields: Record<string, string>,
    asyncMode = false
  ) => {
    return await translateContent(fields, asyncMode)
  }, [translateContent])

  /**
   * 重置翻译状态
   */
  const resetTranslation = useCallback(() => {
    setState({
      isTranslating: false,
      progress: 0,
      error: null,
      results: null,
      taskId: null
    })
  }, [])

  /**
   * 检查是否有翻译结果
   */
  const hasResults = state.results !== null && Object.keys(state.results).length > 0

  /**
   * 获取特定字段的翻译结果
   */
  const getFieldTranslation = useCallback((
    fieldName: string,
    language: SupportedLanguage
  ): string => {
    if (!state.results || !state.results[fieldName]) {
      return ''
    }
    return state.results[fieldName][language] || ''
  }, [state.results])

  return {
    // 状态
    isTranslating: state.isTranslating,
    progress: state.progress,
    error: state.error,
    results: state.results,
    taskId: state.taskId,
    hasResults,

    // 方法
    translateContent,
    translateField,
    translateFields,
    resetTranslation,
    getFieldTranslation,
    pollTranslationStatus
  }
}

export default useAutoTranslation
