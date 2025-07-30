'use client'

import { useState, useEffect, useCallback } from 'react'

interface TranslationData {
  [namespace: string]: {
    [key: string]: string
  }
}

interface UseTranslationOptions {
  namespace?: string
  fallbackLanguage?: string
}

interface UseTranslationReturn {
  t: (key: string, params?: Record<string, any>) => string
  language: string
  setLanguage: (lang: string) => void
  isLoading: boolean
  error: string | null
  availableLanguages: Array<{
    code: string
    name: string
    nativeName: string
    isRtl: boolean
  }>
  formatCurrency: (amount: number, currency?: string) => string
  formatNumber: (number: number) => string
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
}

const STORAGE_KEY = 'yxlp_language'
const DEFAULT_LANGUAGE = 'en'
const FALLBACK_LANGUAGE = 'en'

// Cache for translations
const translationCache: Record<string, TranslationData> = {}

// Built-in translations
const BUILT_IN_TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = {
  zh: {
    common: {
      'nav.home': '首页',
      'nav.products': '产品中心',
      'nav.categories': '产品分类',
      'nav.news': '新闻资讯',
      'nav.partners': '合作伙伴',
      'nav.about': '关于我们',
      'nav.contact': '联系我们',
      'nav.login': '登录',
      'nav.register': '免费注册',
      'hero.slide1.title': '优质产品，卓越服务',
      'hero.slide1.subtitle': '品质保证，信赖之选',
      'hero.slide1.description': '严格的质量控制体系，完善的售后服务网络，为客户提供最优质的产品和服务体验',
      'hero.slide1.cta': '查看产品',
      'hero.slide2.title': '引领未来商业创新',
      'hero.slide2.subtitle': 'YXLP - 您的数字化转型伙伴',
      'hero.slide2.description': '专注于为企业提供全方位的数字化解决方案，助力企业在数字时代实现跨越式发展',
      'hero.slide2.cta': '了解更多',
      'hero.slide3.title': '全球合作，共创未来',
      'hero.slide3.subtitle': '携手共进，合作共赢',
      'hero.slide3.description': '与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标',
      'hero.slide3.cta': '成为合伙人',
      'hero.watchVideo': '观看视频',
      'advantages.title': '为什么选择YXLP服装',
      'advantages.subtitle': '专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务',
      'products.title': '精选服装',
      'products.subtitle': '汇聚全球优质服装品牌，为您提供时尚多样的选择',
      'products.view_all': '查看全部产品',
      'about.title': '关于YXLP',
      'contact.title': '联系我们',
      'contact.subtitle': '有任何问题或合作意向，欢迎随时联系我们',
    }
  },
  en: {
    common: {
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.categories': 'Categories',
      'nav.news': 'News',
      'nav.partners': 'Partners',
      'nav.about': 'About Us',
      'nav.contact': 'Contact',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'hero.slide1.title': 'Quality Products, Excellent Service',
      'hero.slide1.subtitle': 'Quality Assurance, Trusted Choice',
      'hero.slide1.description': 'Strict quality control system and comprehensive after-sales service network to provide customers with the highest quality products and service experience',
      'hero.slide1.cta': 'View Products',
      'hero.slide2.title': 'Leading Future Business Innovation',
      'hero.slide2.subtitle': 'YXLP - Your Digital Transformation Partner',
      'hero.slide2.description': 'Focused on providing comprehensive digital solutions for enterprises, helping businesses achieve leapfrog development in the digital age',
      'hero.slide2.cta': 'Learn More',
      'hero.slide3.title': 'Global Cooperation, Creating the Future Together',
      'hero.slide3.subtitle': 'Working Together, Win-Win Cooperation',
      'hero.slide3.description': 'Establish strategic partnerships with excellent global enterprises, jointly explore markets, and achieve mutually beneficial development goals',
      'hero.slide3.cta': 'Become a Partner',
      'hero.watchVideo': 'Watch Video',
      'advantages.title': 'Why Choose YXLP Fashion',
      'advantages.subtitle': 'Years of focus in the fashion industry, providing customers with the highest quality clothing products and professional fashion styling services',
      'products.title': 'Featured Clothing',
      'products.subtitle': 'Bringing together global quality clothing brands to provide you with fashionable and diverse choices',
      'products.view_all': 'View All Products',
      'about.title': 'About YXLP',
      'contact.title': 'Contact Us',
      'contact.subtitle': 'If you have any questions or cooperation intentions, please feel free to contact us at any time',
    }
  }
}

// Function to get built-in translations
function getBuiltInTranslations(lang: string, namespace: string): Record<string, string> {
  return BUILT_IN_TRANSLATIONS[lang]?.[namespace] || BUILT_IN_TRANSLATIONS['en']?.[namespace] || {}
}

// Available languages
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRtl: false },
]

export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const { namespace = 'common', fallbackLanguage = FALLBACK_LANGUAGE } = options
  
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize language from storage or browser
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Try to get from localStorage
        const storedLanguage = localStorage.getItem(STORAGE_KEY)
        if (storedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)) {
          setLanguageState(storedLanguage)
          return
        }

        // Try to detect from browser
        const browserLanguage = navigator.language.split('-')[0]
        if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLanguage)) {
          setLanguageState(browserLanguage)
          return
        }

        // Fall back to default
        setLanguageState(DEFAULT_LANGUAGE)
      } catch (error) {
        console.error('Error initializing language:', error)
        setLanguageState(DEFAULT_LANGUAGE)
      }
    }

    initializeLanguage()
  }, [])

  // Load translations when language changes
  useEffect(() => {
    if (language) {
      loadTranslations(language, namespace)
    }
  }, [language, namespace])

  const loadTranslations = async (lang: string, ns: string) => {
    const cacheKey = `${lang}_${ns}`

    // Return cached translations if available
    if (translationCache[cacheKey]) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Use built-in translations instead of API calls
      const translations = getBuiltInTranslations(lang, ns)

      // Cache the translations
      if (!translationCache[cacheKey]) {
        translationCache[cacheKey] = {}
      }
      translationCache[cacheKey][ns] = translations

    } catch (error) {
      console.error('Error loading translations:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')

      // Try to load fallback language if not already trying
      if (lang !== fallbackLanguage) {
        await loadTranslations(fallbackLanguage, ns)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const setLanguage = useCallback((lang: string) => {
    if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === lang)) {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)
      
      // Update document language and direction
      document.documentElement.lang = lang
      const isRtl = AVAILABLE_LANGUAGES.find(l => l.code === lang)?.isRtl || false
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    } else {
      console.warn(`Language ${lang} is not supported`)
    }
  }, [])

  const t = useCallback((key: string, params: Record<string, any> = {}): string => {
    const cacheKey = `${language}_${namespace}`
    const fallbackCacheKey = `${fallbackLanguage}_${namespace}`

    // Try to get translation from current language
    let translation = translationCache[cacheKey]?.[namespace]?.[key]

    // Fall back to fallback language
    if (!translation && language !== fallbackLanguage) {
      translation = translationCache[fallbackCacheKey]?.[namespace]?.[key]
    }

    // Fall back to key if no translation found
    if (!translation) {
      // For common keys, provide fallback translations
      const fallbackTranslations: Record<string, string> = {
        'cart.title': 'Shopping Cart',
        'cart.empty': 'Your cart is empty',
        'cart.subtotal': 'Subtotal',
        'cart.tax': 'Tax',
        'cart.shipping': 'Shipping',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'cart.continue_shopping': 'Continue Shopping',
        'cart.remove': 'Remove',
        'cart.quantity': 'Quantity',
        'cart.apply_coupon': 'Apply Coupon',
        'cart.coupon_code': 'Coupon Code',
        'cart.discount': 'Discount',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.update': 'Update',
        'product.add_to_cart': 'Add to Cart',
        'product.out_of_stock': 'Out of Stock',
        'product.in_stock': 'In Stock',
      }

      translation = fallbackTranslations[key] || key
    }

    // Replace parameters in translation
    return replaceParams(translation, params)
  }, [language, namespace, fallbackLanguage])

  const formatCurrencyLocal = useCallback((amount: number, currency: string = 'USD') => {
    return formatCurrency(amount, currency, language)
  }, [language])

  const formatNumberLocal = useCallback((number: number) => {
    return formatNumber(number, language)
  }, [language])

  const formatDateLocal = useCallback((date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
    return formatDate(date, language, options)
  }, [language])

  return {
    t,
    language,
    setLanguage,
    isLoading,
    error,
    availableLanguages: AVAILABLE_LANGUAGES,
    formatCurrency: formatCurrencyLocal,
    formatNumber: formatNumberLocal,
    formatDate: formatDateLocal,
  }
}

// Helper function to replace parameters in translation strings
function replaceParams(text: string, params: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

// Hook for getting current language info
export function useLanguage() {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const storedLanguage = localStorage.getItem(STORAGE_KEY)
    if (storedLanguage) {
      setLanguageState(storedLanguage)
    }
  }, [])

  const currentLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === language)

  const setLanguage = useCallback((lang: string) => {
    if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === lang)) {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)
      
      // Update document language and direction
      document.documentElement.lang = lang
      const isRtl = AVAILABLE_LANGUAGES.find(l => l.code === lang)?.isRtl || false
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
      
      // Reload page to apply language changes
      window.location.reload()
    }
  }, [])

  return {
    language,
    currentLanguage,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    isRtl: currentLanguage?.isRtl || false,
  }
}

// Utility function to detect user's preferred language
export function detectLanguage(): string {
  try {
    // Check localStorage first
    const storedLanguage = localStorage.getItem(STORAGE_KEY)
    if (storedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)) {
      return storedLanguage
    }

    // Check browser language
    const browserLanguage = navigator.language.split('-')[0]
    if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLanguage)) {
      return browserLanguage
    }

    // Check browser languages array
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0]
      if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === langCode)) {
        return langCode
      }
    }
  } catch (error) {
    console.error('Error detecting language:', error)
  }

  return DEFAULT_LANGUAGE
}

// Utility function to format numbers according to locale
export function formatNumber(number: number, language: string = DEFAULT_LANGUAGE): string {
  try {
    return new Intl.NumberFormat(language).format(number)
  } catch (error) {
    return number.toString()
  }
}

// Utility function to format currency according to locale
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  language: string = DEFAULT_LANGUAGE
): string {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount)
  } catch (error) {
    return `${currency} ${amount}`
  }
}

// Utility function to format dates according to locale
export function formatDate(
  date: Date | string,
  language: string = DEFAULT_LANGUAGE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(language, options).format(dateObj)
  } catch (error) {
    return date.toString()
  }
}
