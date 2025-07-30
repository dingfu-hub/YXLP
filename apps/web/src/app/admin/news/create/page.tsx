'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewsCategory, NewsStatus, AIModel, SupportedLanguage, MultiLanguageContent, AIPolishProgress } from '@/types/news'
import { aiPolishService, AI_MODELS } from '@/lib/ai-polish'
import { SUPPORTED_LANGUAGES, createMultiLanguageContent, getLocalizedContent } from '@/lib/i18n'

export default function CreateNewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'fashion' as NewsCategory,
    status: 'draft' as NewsStatus,
    keywords: '',
    author: '',
    featuredImage: '',
    sourceUrl: '',
    sourceName: ''
  })

  // AI润色相关状态
  const [aiModel, setAiModel] = useState<AIModel>('deepseek')
  const [polishProgress, setPolishProgress] = useState<AIPolishProgress>({
    total: 0,
    completed: 0,
    status: 'idle'
  })
  const [polishedContent, setPolishedContent] = useState<{
    title?: MultiLanguageContent
    content?: MultiLanguageContent
    summary?: MultiLanguageContent
  }>({})
  const [isPolishing, setIsPolishing] = useState(false)
  const [polishCompleted, setPolishCompleted] = useState(false)

  // 系统支持的所有语言（自动生成所有语言版本）
  const ALL_LANGUAGES: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']

  const categories: { value: NewsCategory; label: string }[] = [
    { value: 'fashion', label: '时尚' },
    { value: 'underwear', label: '内衣' },
    { value: 'business', label: '商业' }
  ]

  // AI润色功能 - 自动生成所有语言版本
  const handleAIPolish = async () => {
    if (!formData.title || !formData.content || !formData.summary) {
      alert('请先填写标题、内容和摘要')
      return
    }

    setIsPolishing(true)
    setPolishCompleted(false)
    setPolishProgress({ total: ALL_LANGUAGES.length * 3, completed: 0, status: 'processing' })

    try {
      // 调用AI润色API - 生成所有语言版本
      const response = await fetch('/api/admin/news/ai-polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          aiModel: aiModel,
          targetLanguages: ALL_LANGUAGES // 生成所有语言版本
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI润色失败')
      }

      // 获取润色结果
      const result = await response.json()

      // 实时进度更新
      const totalTasks = ALL_LANGUAGES.length * 3
      let completed = 0

      const progressInterval = setInterval(() => {
        completed += Math.floor(Math.random() * 3) + 1 // 随机增加进度
        const currentCompleted = Math.min(completed, totalTasks)

        setPolishProgress({
          total: totalTasks,
          completed: currentCompleted,
          status: currentCompleted >= totalTasks ? 'completed' : 'processing'
        })

        if (currentCompleted >= totalTasks) {
          clearInterval(progressInterval)
          setPolishedContent({
            title: result.data.title,
            content: result.data.content,
            summary: result.data.summary
          })
          setPolishCompleted(true)
        }
      }, 200) // 每200ms更新一次进度，更流畅
    } catch (error) {
      console.error('AI润色失败:', error)
      const errorMessage = error instanceof Error ? error.message : 'AI润色失败'
      setPolishProgress(prev => ({ ...prev, status: 'failed', error: errorMessage }))

      // 显示详细错误信息
      const errorDetails = error instanceof Error && error.message.includes('fetch')
        ? '网络连接失败，请检查网络连接后重试'
        : errorMessage

      alert(`AI润色失败: ${errorDetails}\n\n如果问题持续存在，请联系技术支持。`)
    } finally {
      setIsPolishing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!polishCompleted) {
      alert('请先完成AI润色后再创建新闻')
      return
    }

    setLoading(true)

    try {
      const newsData = {
        title: polishedContent.title || createMultiLanguageContent(formData.title),
        content: polishedContent.content || createMultiLanguageContent(formData.content),
        summary: polishedContent.summary || createMultiLanguageContent(formData.summary),
        category: formData.category,
        status: formData.status,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        author: formData.author,
        featuredImage: formData.featuredImage,
        sourceType: 'manual',
        aiProcessed: true,
        aiModel: aiModel,
        polishedLanguages: targetLanguages
      }

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newsData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '创建失败')
      }

      alert('新闻创建成功！')
      router.push('/admin/news')
    } catch (error) {
      console.error('创建新闻错误:', error)
      alert(error instanceof Error ? error.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">创建新闻</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              返回
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI润色配置 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI智能润色</h3>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  🌍 <strong>自动生成多语言版本</strong>：系统将自动为您的内容生成 <span className="font-semibold text-blue-600">{ALL_LANGUAGES.length} 种语言</span> 的专业版本
                </p>
                <div className="flex flex-wrap gap-1">
                  {SUPPORTED_LANGUAGES.filter(lang => ALL_LANGUAGES.includes(lang.code)).map(lang => (
                    <span key={lang.code} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {lang.flag} {lang.chineseName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  AI模型选择
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as AIModel)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deepseek">🚀 DeepSeek - 推荐</option>
                  <option value="doubao">🎯 豆包 - 中文优化</option>
                  <option value="claude">📝 Claude - 专业写作</option>
                  <option value="gemini">⭐ Gemini - 多语言</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAIPolish}
                disabled={isPolishing || !formData.title || !formData.content || !formData.summary}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg"
              >
                {isPolishing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在AI润色中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始AI智能润色
                  </div>
                )}
              </button>

              {/* 进度条 */}
              {polishProgress.status === 'processing' && (
                <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg font-semibold text-blue-900">AI智能润色进行中</span>
                    </div>
                    <span className="text-sm font-medium text-blue-700 bg-white px-3 py-1 rounded-full">
                      {polishProgress.completed} / {polishProgress.total}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-blue-700 mb-1">
                      <span>处理进度</span>
                      <span>{Math.round((polishProgress.completed / polishProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(polishProgress.completed / polishProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-blue-600 space-y-1">
                    <p>🌍 正在生成 {ALL_LANGUAGES.length} 种语言版本</p>
                    <p>📝 包含标题、内容、摘要的专业润色</p>
                    <p>⚡ 预计完成时间: {Math.ceil((polishProgress.total - polishProgress.completed) * 0.5)} 秒</p>
                  </div>
                </div>
              )}

              {polishProgress.status === 'completed' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 text-green-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold">✅ AI润色完成！</p>
                      <p className="text-sm">已成功生成 {ALL_LANGUAGES.length} 种语言的专业版本</p>
                    </div>
                  </div>
                </div>
              )}

              {polishProgress.status === 'failed' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-300 text-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold">❌ AI润色失败</p>
                      <p className="text-sm">{polishProgress.error || '未知错误，请重试'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 润色结果展示 */}
            {polishCompleted && polishedContent.title && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI润色结果预览
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {ALL_LANGUAGES.map(lang => {
                    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang)
                    return (
                      <div key={lang} className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <span className="text-lg mr-2">{langInfo?.flag}</span>
                          {langInfo?.chineseName}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-green-700 block mb-1">标题</label>
                            <p className="text-sm bg-gray-50 p-2 rounded border text-gray-800 line-clamp-2">
                              {polishedContent.title?.[lang] || '暂无'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-green-700 block mb-1">摘要</label>
                            <p className="text-sm bg-gray-50 p-2 rounded border text-gray-800 line-clamp-3">
                              {polishedContent.summary?.[lang] || '暂无'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-green-700 block mb-1">内容预览</label>
                            <div className="text-sm bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto text-gray-800">
                              {polishedContent.content?.[lang]?.substring(0, 100) || '暂无'}
                              {polishedContent.content?.[lang]?.length > 100 && '...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                摘要 *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻摘要"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新闻内容"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态 *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入关键词，用逗号分隔"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入作者姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特色图片URL
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入图片URL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  源文章链接
                </label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入源文章URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  来源名称
                </label>
                <input
                  type="text"
                  name="sourceName"
                  value={formData.sourceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入来源名称"
                />
              </div>
            </div>

            {/* 润色结果展示 */}
            {polishCompleted && polishedContent.title && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">润色结果预览</h3>

                {targetLanguages.map(lang => (
                  <div key={lang} className="mb-6 last:mb-0">
                    <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                      {SUPPORTED_LANGUAGES[lang].flag} {SUPPORTED_LANGUAGES[lang].chineseName}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">标题</label>
                        <div className="p-2 bg-white border rounded text-sm">
                          {getLocalizedContent(polishedContent.title!, lang)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">摘要</label>
                        <div className="p-2 bg-white border rounded text-sm">
                          {getLocalizedContent(polishedContent.summary!, lang)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">内容</label>
                        <div className="p-2 bg-white border rounded text-sm max-h-32 overflow-y-auto">
                          {getLocalizedContent(polishedContent.content!, lang)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !polishCompleted}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '创建中...' : polishCompleted ? '创建新闻' : '请先完成AI润色'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
