'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/useTranslation'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact'
  showFlag?: boolean
  showNativeName?: boolean
  className?: string
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className = '',
}: LanguageSwitcherProps) {
  const { language, currentLanguage, setLanguage, availableLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    // 设置Cookie以持久化语言偏好
    document.cookie = `preferred-language=${langCode}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`

    // 设置语言
    setLanguage(langCode)

    // 构建新的URL路径
    const currentPath = pathname
    let newPath = currentPath

    // 移除现有的语言前缀（如果有）
    const pathSegments = currentPath.split('/').filter(Boolean)
    const supportedLocales = availableLanguages.map(lang => lang.code)

    if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
      // 移除第一个语言段
      newPath = '/' + pathSegments.slice(1).join('/')
    }

    // 添加新的语言前缀
    const targetPath = `/${langCode}${newPath === '/' ? '' : newPath}`

    // 跳转到新的语言路径
    router.push(targetPath)

    setIsOpen(false)
  }

  const getFlag = (langCode: string) => {
    const flags: Record<string, string> = {
      en: '🇺🇸',
      zh: '🇨🇳',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
      ja: '🇯🇵',
      ko: '🇰🇷',
      ru: '🇷🇺',
      ar: '🇸🇦',
      pt: '🇵🇹',
    }
    return flags[langCode] || '🌐'
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              language === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showFlag && <span className="mr-1">{getFlag(lang.code)}</span>}
            {showNativeName ? lang.nativeName : lang.name}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-2 py-1 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          {showFlag && <span className="mr-1">{getFlag(language)}</span>}
          <span className="uppercase font-medium">{language}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {showFlag && <span className="mr-2">{getFlag(lang.code)}</span>}
                    <span>{showNativeName ? lang.nativeName : lang.name}</span>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <Globe className="w-4 h-4 mr-2" />
        {showFlag && <span className="mr-2">{getFlag(language)}</span>}
        <span>{currentLanguage ? (showNativeName ? currentLanguage.nativeName : currentLanguage.name) : 'Language'}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Select Language
            </div>
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center">
                  {showFlag && <span className="mr-3 text-lg">{getFlag(lang.code)}</span>}
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    {showNativeName && lang.nativeName !== lang.name && (
                      <div className="text-xs text-gray-500">{lang.nativeName}</div>
                    )}
                  </div>
                </div>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Language detection banner component
export function LanguageDetectionBanner() {
  const { language, setLanguage, availableLanguages } = useLanguage()
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.split('-')[0]
    
    // Show banner if browser language is different from current language
    // and the browser language is supported
    if (
      browserLanguage !== language &&
      availableLanguages.some(lang => lang.code === browserLanguage)
    ) {
      setDetectedLanguage(browserLanguage)
      setShowBanner(true)
    }
  }, [language, availableLanguages])

  const handleAccept = () => {
    if (detectedLanguage) {
      setLanguage(detectedLanguage)
    }
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Remember user's choice
    localStorage.setItem('yxlp_language_detection_dismissed', 'true')
  }

  if (!showBanner || !detectedLanguage) {
    return null
  }

  const detectedLang = availableLanguages.find(lang => lang.code === detectedLanguage)
  
  if (!detectedLang) {
    return null
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              We detected that you might prefer{' '}
              <span className="font-medium">{detectedLang.name}</span>. Would you like to switch?
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAccept}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Yes, switch to {detectedLang.name}
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// RTL support component
export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { isRtl } = useLanguage()

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [isRtl])

  return <>{children}</>
}
