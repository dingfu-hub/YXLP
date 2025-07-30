'use client'

import { useState } from 'react'
import { SupportedLanguage } from '@/types/news'
import { SUPPORTED_LANGUAGES, formatLanguageName } from '@/lib/i18n'

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  availableLanguages?: SupportedLanguage[]
  showAllOption?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  showAllOption = false,
  disabled = false,
  size = 'md'
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // 获取可选择的语言列表
  const languages = availableLanguages || Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]

  // 样式配置
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const buttonClasses = `
    ${sizeClasses[size]}
    bg-white border border-gray-300 rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:bg-gray-50 transition-colors duration-200
    flex items-center justify-between min-w-[120px]
  `

  const dropdownClasses = `
    absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg
    max-h-60 overflow-auto
    ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
  `

  const optionClasses = `
    px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700
    flex items-center justify-between
    transition-colors duration-150
  `

  const selectedOptionClasses = `
    ${optionClasses} bg-blue-100 text-blue-700 font-medium
  `

  const handleLanguageSelect = (language: SupportedLanguage) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  const selectedLanguageInfo = SUPPORTED_LANGUAGES[selectedLanguage]

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={buttonClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <span className="mr-2">{selectedLanguageInfo.flag}</span>
          <span>{selectedLanguageInfo.nativeName}</span>
        </div>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className={dropdownClasses} role="listbox">
            {showAllOption && (
              <div
                className={selectedLanguage === 'all' ? selectedOptionClasses : optionClasses}
                onClick={() => handleLanguageSelect('all' as SupportedLanguage)}
                role="option"
                aria-selected={selectedLanguage === 'all'}
              >
                <div className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <span>所有语言</span>
                </div>
                {selectedLanguage === 'all' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}

            {languages.map((language) => {
              const languageInfo = SUPPORTED_LANGUAGES[language]
              const isSelected = selectedLanguage === language

              return (
                <div
                  key={language}
                  className={isSelected ? selectedOptionClasses : optionClasses}
                  onClick={() => handleLanguageSelect(language)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{languageInfo.flag}</span>
                    <div>
                      <div className="font-medium">{languageInfo.chineseName}</div>
                      <div className="text-xs text-gray-500">{languageInfo.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// 简化版语言选择器（只显示标志）
export function CompactLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  disabled = false
}: Omit<LanguageSelectorProps, 'size' | 'showAllOption'>) {
  const [isOpen, setIsOpen] = useState(false)
  const languages = availableLanguages || Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]

  const handleLanguageSelect = (language: SupportedLanguage) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  const selectedLanguageInfo = SUPPORTED_LANGUAGES[selectedLanguage]

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        title={selectedLanguageInfo.nativeName}
      >
        {selectedLanguageInfo.flag}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-50 mt-1 right-0 bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[150px]">
            {languages.map((language) => {
              const languageInfo = SUPPORTED_LANGUAGES[language]
              const isSelected = selectedLanguage === language

              return (
                <div
                  key={language}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 flex items-center ${
                    isSelected ? 'bg-blue-100 text-blue-700 font-medium' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  <span className="mr-2">{languageInfo.flag}</span>
                  <span className="text-sm">{languageInfo.chineseName}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// 语言标签组件
export function LanguageTag({ language, size = 'sm' }: { language: SupportedLanguage; size?: 'sm' | 'md' }) {
  const languageInfo = SUPPORTED_LANGUAGES[language]
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span className={`inline-flex items-center bg-gray-100 text-gray-700 rounded-full ${sizeClasses[size]}`}>
      <span className="mr-1">{languageInfo.flag}</span>
      <span>{languageInfo.chineseName}</span>
    </span>
  )
}

// 多语言状态指示器
export function MultiLanguageIndicator({ 
  availableLanguages, 
  totalLanguages = 10 
}: { 
  availableLanguages: SupportedLanguage[]
  totalLanguages?: number 
}) {
  const percentage = (availableLanguages.length / totalLanguages) * 100

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-1">
        {availableLanguages.slice(0, 3).map((language) => (
          <span
            key={language}
            className="inline-block w-6 h-6 rounded-full bg-white border-2 border-white text-xs flex items-center justify-center"
            title={SUPPORTED_LANGUAGES[language].chineseName}
          >
            {SUPPORTED_LANGUAGES[language].flag}
          </span>
        ))}
        {availableLanguages.length > 3 && (
          <span className="inline-block w-6 h-6 rounded-full bg-gray-200 border-2 border-white text-xs flex items-center justify-center text-gray-600">
            +{availableLanguages.length - 3}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600">
        {availableLanguages.length}/{totalLanguages} 语言
      </div>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
