/**
 * 智能自动翻译系统
 * 管理员发布内容时自动翻译成所有支持语言
 */

import { SupportedLanguage } from '@/types/news'

// 支持的语言列表
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'
]

// 语言名称映射
export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string }> = {
  zh: { native: '中文', english: 'Chinese' },
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  ko: { native: '한국어', english: 'Korean' },
  es: { native: 'Español', english: 'Spanish' },
  fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' },
  it: { native: 'Italiano', english: 'Italian' },
  pt: { native: 'Português', english: 'Portuguese' },
  ru: { native: 'Русский', english: 'Russian' }
}

// 翻译状态
export enum TranslationStatus {
  PENDING = 'pending',      // 待翻译
  TRANSLATING = 'translating', // 翻译中
  COMPLETED = 'completed',  // 已完成
  FAILED = 'failed',       // 翻译失败
  NEEDS_UPDATE = 'needs_update' // 需要更新
}

// 翻译结果接口
export interface TranslationResult {
  language: SupportedLanguage
  text: string
  status: TranslationStatus
  quality?: number // 翻译质量评分 0-100
  translatedAt: Date
  needsReview?: boolean // 是否需要人工校对
}

// 多语言内容接口
export interface MultiLanguageContent {
  [key: string]: string
  zh: string // 中文为必需字段
}

// 翻译任务接口
export interface TranslationTask {
  id: string
  sourceLanguage: SupportedLanguage
  targetLanguages: SupportedLanguage[]
  content: {
    title?: string
    summary?: string
    content?: string
    description?: string
    [key: string]: string | undefined
  }
  status: TranslationStatus
  results: TranslationResult[]
  createdAt: Date
  completedAt?: Date
  error?: string
}

/**
 * 自动翻译服务类
 */
export class AutoTranslator {
  private static instance: AutoTranslator
  private translationQueue: TranslationTask[] = []
  private isProcessing = false

  static getInstance(): AutoTranslator {
    if (!AutoTranslator.instance) {
      AutoTranslator.instance = new AutoTranslator()
    }
    return AutoTranslator.instance
  }

  /**
   * 翻译单个文本
   */
  async translateText(
    text: string, 
    fromLang: SupportedLanguage, 
    toLang: SupportedLanguage
  ): Promise<string> {
    if (!text || text.trim() === '') return ''
    if (fromLang === toLang) return text

    try {
      // 这里应该调用真实的翻译API
      // 目前使用模拟翻译
      const response = await this.callTranslationAPI(text, fromLang, toLang)
      return response
    } catch (error) {
      console.error(`翻译失败 ${fromLang} -> ${toLang}:`, error)
      throw error
    }
  }

  /**
   * 批量翻译内容对象
   */
  async translateContent(
    content: Record<string, string>,
    sourceLanguage: SupportedLanguage = 'zh',
    targetLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage)
  ): Promise<Record<string, MultiLanguageContent>> {
    const results: Record<string, MultiLanguageContent> = {}

    for (const [key, text] of Object.entries(content)) {
      if (!text) continue

      const translations: MultiLanguageContent = { zh: '' }
      
      // 如果源语言是中文，直接使用原文
      if (sourceLanguage === 'zh') {
        translations.zh = text
      }

      // 翻译到所有目标语言
      for (const targetLang of targetLanguages) {
        try {
          translations[targetLang] = await this.translateText(text, sourceLanguage, targetLang)
        } catch (error) {
          console.error(`翻译失败 ${key} ${sourceLanguage}->${targetLang}:`, error)
          translations[targetLang] = text // 失败时使用原文
        }
      }

      results[key] = translations
    }

    return results
  }

  /**
   * 创建翻译任务
   */
  async createTranslationTask(
    content: Record<string, string>,
    sourceLanguage: SupportedLanguage = 'zh',
    targetLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage)
  ): Promise<TranslationTask> {
    const task: TranslationTask = {
      id: this.generateTaskId(),
      sourceLanguage,
      targetLanguages,
      content,
      status: TranslationStatus.PENDING,
      results: [],
      createdAt: new Date()
    }

    this.translationQueue.push(task)
    
    // 异步处理翻译任务
    this.processQueue()

    return task
  }

  /**
   * 处理翻译队列
   */
  private async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.translationQueue.length > 0) {
      const task = this.translationQueue.shift()
      if (!task) continue

      try {
        task.status = TranslationStatus.TRANSLATING
        const results = await this.translateContent(
          task.content,
          task.sourceLanguage,
          task.targetLanguages
        )

        task.results = Object.entries(results).flatMap(([key, translations]) =>
          Object.entries(translations).map(([lang, text]) => ({
            language: lang as SupportedLanguage,
            text,
            status: TranslationStatus.COMPLETED,
            translatedAt: new Date(),
            quality: this.calculateQuality(text)
          }))
        )

        task.status = TranslationStatus.COMPLETED
        task.completedAt = new Date()
      } catch (error) {
        task.status = TranslationStatus.FAILED
        task.error = error instanceof Error ? error.message : '翻译失败'
      }
    }

    this.isProcessing = false
  }

  /**
   * 调用翻译API（模拟实现）
   */
  private async callTranslationAPI(
    text: string,
    fromLang: SupportedLanguage,
    toLang: SupportedLanguage
  ): Promise<string> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // 模拟翻译结果
    const fromName = LANGUAGE_NAMES[fromLang]?.native || fromLang
    const toName = LANGUAGE_NAMES[toLang]?.native || toLang
    
    return `[${toName}翻译] ${text} [由${fromName}翻译]`
  }

  /**
   * 计算翻译质量评分
   */
  private calculateQuality(text: string): number {
    // 简单的质量评分算法
    const length = text.length
    const hasSpecialChars = /[^\w\s]/.test(text)
    const baseScore = Math.min(90, 60 + length * 0.1)
    const bonus = hasSpecialChars ? 5 : 0
    return Math.min(100, Math.round(baseScore + bonus))
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TranslationTask | null {
    return this.translationQueue.find(task => task.id === taskId) || null
  }
}

// 导出单例实例
export const autoTranslator = AutoTranslator.getInstance()
