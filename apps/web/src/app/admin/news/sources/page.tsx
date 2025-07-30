'use client'

import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { NewsSource, SupportedLanguage } from '@/types/news'
import { 
  COUNTRY_LANGUAGE_MAPPINGS, 
  generateGlobalRSSSources, 
  getRSSSourcesByLanguage,
  getSupportedLanguagesWithCountries 
} from '@/data/global-rss-sources'

export default function NewsSourcesPage() {
  const { user } = useAdmin()
  const [sources, setSources] = useState<NewsSource[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('zh')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('')

  // 获取语言和国家数据
  const languageGroups = getSupportedLanguagesWithCountries()
  const currentLanguageGroup = languageGroups.find(g => g.language === selectedLanguage)

  useEffect(() => {
    loadSources()
  }, [selectedLanguage, selectedCountry])

  const loadSources = async () => {
    setLoading(true)
    try {
      // 从数据库API获取RSS源
      const response = await fetch(`/api/admin/news/sources?language=${selectedLanguage}&country=${selectedCountry}&search=${searchTerm}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        // 如果API失败，使用本地模拟数据作为后备
        console.warn('API获取失败，使用本地数据')
        const { getAllSources } = await import('@/data/news')
        let localSources = getAllSources()

        // 应用过滤器
        if (selectedLanguage) {
          localSources = localSources.filter(source => source.language === selectedLanguage)
        }
        if (selectedCountry) {
          localSources = localSources.filter(source => source.country === selectedCountry)
        }
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          localSources = localSources.filter(source =>
            source.name.toLowerCase().includes(searchLower) ||
            source.url.toLowerCase().includes(searchLower)
          )
        }

        setSources(localSources)
        return
      }

      const result = await response.json()
      setSources(result.data || [])
    } catch (error) {
      console.error('加载RSS源失败:', error)
      // 使用本地数据作为后备
      try {
        const { getAllSources } = await import('@/data/news')
        setSources(getAllSources())
      } catch (fallbackError) {
        console.error('加载本地数据也失败:', fallbackError)
        alert('加载RSS源失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, isActive: !source.isActive }
        : source
    ))
  }

  const getCountryFlag = (countryCode: string) => {
    const mapping = COUNTRY_LANGUAGE_MAPPINGS.find(m => m.countryCode === countryCode)
    return mapping?.flag || '🌍'
  }

  const getCountryName = (countryCode: string) => {
    const mapping = COUNTRY_LANGUAGE_MAPPINGS.find(m => m.countryCode === countryCode)
    return mapping?.country || countryCode
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RSS源管理</h1>
          <p className="text-gray-600 mt-2">管理全球多语种RSS新闻源，每个语种配置100个采集源</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {languageGroups.length} 种语言
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {COUNTRY_LANGUAGE_MAPPINGS.length} 个国家
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {generateGlobalRSSSources().length} 个RSS源
            </span>
          </div>
        </div>

        {/* 筛选控件 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 语言选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value as SupportedLanguage)
                  setSelectedCountry('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageGroups.map(group => (
                  <option key={group.language} value={group.language}>
                    {group.language.toUpperCase()} ({group.countries.length} 国家)
                  </option>
                ))}
              </select>
            </div>

            {/* 国家选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">国家</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有国家</option>
                {currentLanguageGroup?.countries.map(country => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.flag} {country.country}
                  </option>
                ))}
              </select>
            </div>

            {/* 搜索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索RSS源名称或URL..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex items-end">
              <button
                onClick={loadSources}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                刷新
              </button>
            </div>
          </div>
        </div>

        {/* RSS源列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                RSS源列表 ({sources.length} 个)
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  活跃: {sources.filter(s => s.isActive).length} / {sources.length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSS源信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    国家/地区
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    采集间隔
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {source.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {source.url}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCountryFlag(source.country)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getCountryName(source.country)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {source.region}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        source.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {source.isActive ? '活跃' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {source.crawlInterval} 分钟
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(source.id)}
                        className={`${
                          source.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {source.isActive ? '停用' : '启用'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sources.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">没有找到RSS源</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
