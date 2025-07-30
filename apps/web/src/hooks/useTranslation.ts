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

      const response = await fetch(`/api/i18n/public/${lang}/${ns}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Cache the translations
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {}
        }
        translationCache[cacheKey][ns] = data.data
      } else {
        throw new Error('Failed to load translations')
      }
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
