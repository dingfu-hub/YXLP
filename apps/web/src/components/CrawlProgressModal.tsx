'use client'

import { useState, useEffect } from 'react'
import { CrawlProgress, AIModel, SupportedLanguage } from '@/types/news'
import { AI_MODELS } from '@/lib/ai-polish'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

interface CrawlProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: (config: CrawlConfig) => void
}

interface CrawlConfig {
  aiModel: AIModel
  onlyTodayNews: boolean
  articlesPerLanguage: number // 每个语种采集的文章数量
  targetLanguages: SupportedLanguage[] // 目标语言
}

export default function CrawlProgressModal({ isOpen, onClose, onStart }: CrawlProgressModalProps) {
  const [step, setStep] = useState<'config' | 'progress'>('config')
  const [config, setConfig] = useState<CrawlConfig>({
    aiModel: 'deepseek',
    onlyTodayNews: true,
    articlesPerLanguage: 50, // 默认每个语种采集50篇文章
    targetLanguages: Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
  })
  const [progress, setProgress] = useState<CrawlProgress>({
    totalSources: 0,
    completedSources: 0,
    articlesFound: 0,
    articlesProcessed: 0,
    articlesPolished: 0,
    status: 'idle'
  })

  // 检查现有采集进度（支持断点续传）
  useEffect(() => {
    if (isOpen) {
      checkExistingProgress()
    }
  }, [isOpen])

  // 检查是否有正在进行的采集任务
  const checkExistingProgress = async () => {
    try {
      const response = await fetch('/api/admin/news/crawl', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        const existingProgress = result.data

        if (existingProgress.status === 'crawling' || existingProgress.status === 'polishing') {
          // 有正在进行的任务，直接进入进度页面
          setStep('progress')
          setProgress(existingProgress)
          return
        }
      }
    } catch (error) {
      console.error('检查采集进度失败:', error)
    }

    // 没有正在进行的任务，重置状态
    setStep('config')
    setProgress({
      totalSources: 0,
      completedSources: 0,
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0,
      status: 'idle'
    })
  }

  // 实时获取采集进度
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (step === 'progress' && (progress.status === 'crawling' || progress.status === 'polishing')) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/admin/news/crawl/progress', {
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            setProgress(data.progress)

            // 如果采集完成，停止轮询但不自动关闭
            if (data.progress.status === 'completed' || data.progress.status === 'failed') {
              clearInterval(interval)
              // 不自动关闭，让用户查看结果
            }
          }
        } catch (error) {
          console.error('获取采集进度失败:', error)
        }
      }, 1000) // 每秒更新一次
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, progress.status, onClose])

  const handleStart = () => {
    setStep('progress')
    setProgress({
      totalSources: 6, // 假设有6个采集源
      completedSources: 0,
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPolished: 0,
      status: 'crawling'
    })
    onStart(config)
  }

  const handleClose = () => {
    if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'idle') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {step === 'config' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">采集配置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI模型
                </label>
                <select
                  value={config.aiModel}
                  onChange={(e) => setConfig(prev => ({ ...prev, aiModel: e.target.value as AIModel }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(AI_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  单次采集数量
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={config.articlesPerLanguage}
                    onChange={(e) => setConfig(prev => ({ ...prev, articlesPerLanguage: parseInt(e.target.value) || 5 }))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">篇文章/语种</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  建议设置为 5-50 篇，过多可能影响采集速度
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  多语言支持 (自动生成)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                    <label key={code} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="mr-2"
                      />
                      <span className="text-sm">{lang.flag} {lang.chineseName}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>系统将自动为所有采集的新闻生成上述10种语言版本，无需手动选择</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>系统默认只采集当天发布的新闻，确保内容时效性</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                开始采集
              </button>
            </div>
          </>
        )}

        {step === 'progress' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">新闻采集进度</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                progress.status === 'failed' ? 'bg-red-100 text-red-800' :
                progress.status === 'polishing' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {progress.status === 'crawling' && '正在采集'}
                {progress.status === 'polishing' && '正在润色'}
                {progress.status === 'completed' && '采集完成'}
                {progress.status === 'failed' && '采集失败'}
              </div>
            </div>

            {/* 当前任务状态 */}
            {progress.currentSource && progress.status === 'crawling' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm text-blue-800">
                    正在采集: <span className="font-medium">{progress.currentSource}</span>
                  </span>
                </div>
              </div>
            )}

            {/* 各地区/语言进度 - 详细显示 */}
            {progress.languageProgress && progress.languageProgress.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">各地区采集详情</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {progress.languageProgress.map((langProgress) => (
                    <div key={`${langProgress.language}-${langProgress.country}`}
                         className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* 地区标题行 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{SUPPORTED_LANGUAGES[langProgress.language]?.flag || '🌐'}</span>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {SUPPORTED_LANGUAGES[langProgress.language]?.chineseName || langProgress.language}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">- {langProgress.country}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          langProgress.status === 'completed' ? 'bg-green-100 text-green-700' :
                          langProgress.status === 'failed' ? 'bg-red-100 text-red-700' :
                          langProgress.status === 'polishing' ? 'bg-blue-100 text-blue-700' :
                          langProgress.status === 'crawling' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {(() => {
                            const targetArticles = progress.articlesPerLanguage || config.articlesPerLanguage
                            const hasArticles = langProgress.articlesProcessed > 0

                            if (langProgress.status === 'completed') {
                              if (hasArticles) {
                                return `✅ 完成`
                              } else {
                                return '⚪ 无内容'
                              }
                            } else if (langProgress.status === 'failed') {
                              return '❌ 失败'
                            } else if (langProgress.status === 'polishing') {
                              return '🔄 润色中'
                            } else if (langProgress.status === 'crawling') {
                              return '⚡ 采集中'
                            } else {
                              return '⏳ 等待中'
                            }
                          })()}
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>进度</span>
                          <span>
                            {langProgress.articlesProcessed}/{progress.articlesPerLanguage || config.articlesPerLanguage} 篇
                            {(progress.articlesPerLanguage || config.articlesPerLanguage) > 0 &&
                              ` (${Math.round((langProgress.articlesProcessed / (progress.articlesPerLanguage || config.articlesPerLanguage)) * 100)}%)`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              langProgress.status === 'completed' ?
                                (langProgress.articlesProcessed > 0 ? 'bg-green-500' : 'bg-gray-400') :
                              langProgress.status === 'failed' ? 'bg-red-500' :
                              langProgress.status === 'polishing' ? 'bg-blue-500' :
                              langProgress.status === 'crawling' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{
                              width: (() => {
                                const targetArticles = progress.articlesPerLanguage || config.articlesPerLanguage
                                if (targetArticles > 0 && langProgress.articlesProcessed > 0) {
                                  const percentage = (langProgress.articlesProcessed / targetArticles) * 100
                                  return `${Math.max(2, Math.min(100, percentage))}%`
                                }
                                // 如果状态是完成但没有处理文章，显示为100%（表示该地区无可用文章）
                                if (langProgress.status === 'completed') {
                                  return langProgress.articlesProcessed > 0 ? '100%' : '100%'
                                }
                                return '2%'
                              })()
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900">{langProgress.articlesFound}</div>
                          <div className="text-xs text-gray-500">发现</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-600">{langProgress.articlesProcessed}</div>
                          <div className="text-xs text-gray-500">采集</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-blue-600">{langProgress.articlesPolished}</div>
                          <div className="text-xs text-gray-500">润色</div>
                        </div>
                      </div>

                      {/* 当前任务或错误信息 */}
                      {langProgress.currentSource && langProgress.status === 'crawling' && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          正在采集: {langProgress.currentSource}
                        </div>
                      )}

                      {/* 状态消息 */}
                      {(langProgress as any).statusMessage && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {(langProgress as any).statusMessage}
                        </div>
                      )}

                      {langProgress.error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          错误: {langProgress.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 结果消息 */}
            {progress.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm font-medium">
                    采集完成！共处理 {progress.articlesProcessed} 篇新闻，润色 {progress.articlesPolished} 篇
                  </span>
                </div>
              </div>
            )}

            {progress.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm font-medium">采集失败: {progress.error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {progress.duration ? `耗时 ${Math.floor(progress.duration / 60)}:${(progress.duration % 60).toString().padStart(2, '0')}` : ''}
              </div>
              <div className="flex space-x-2">
                {progress.status === 'completed' && (
                  <button
                    onClick={() => {
                      window.open('/admin/news', '_blank')
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    查看结果
                  </button>
                )}
                <button
                  onClick={handleClose}
                  disabled={progress.status === 'crawling' || progress.status === 'polishing'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    progress.status === 'crawling' || progress.status === 'polishing'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {progress.status === 'completed' || progress.status === 'failed' ? '关闭' : '采集中...'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
