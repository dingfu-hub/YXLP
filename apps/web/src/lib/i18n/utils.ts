// 国际化工具函数

import { SupportedLocale, SupportedCurrency, FormatFunctions, LocalizationContext } from '@/types/i18n'
import { supportedLanguages, supportedCurrencies, supportedTimezones } from './config'

// 翻译资源映射
const translationResources = new Map()

// 动态导入翻译资源
export async function loadTranslationResource(locale: SupportedLocale) {
  if (translationResources.has(locale)) {
    return translationResources.get(locale)
  }

  try {
    let resource
    switch (locale) {
      case 'zh-CN':
        resource = await import('@/data/i18n/zh-CN')
        break
      case 'en-US':
        resource = await import('@/data/i18n/en-US')
        break
      // 其他语言可以在这里添加
      default:
        resource = await import('@/data/i18n/en-US') // 默认使用英文
    }
    
    const translations = resource.default || resource
    translationResources.set(locale, translations)
    return translations
  } catch (error) {
    console.error(`Failed to load translation resource for ${locale}:`, error)
    // 返回英文作为后备
    if (locale !== 'en-US') {
      return loadTranslationResource('en-US')
    }
    return {}
  }
}

// 翻译函数
export function createTranslationFunction(locale: SupportedLocale, translations: any) {
  return function t(
    key: string,
    options?: {
      defaultValue?: string
      count?: number
      context?: string
      replace?: Record<string, any>
      lng?: SupportedLocale
    }
  ): string {
    const keys = key.split('.')
    let value = translations
    
    // 遍历键路径获取翻译值
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    // 如果没有找到翻译，使用默认值或键名
    if (typeof value !== 'string') {
      return options?.defaultValue || key
    }
    
    // 处理复数形式
    if (options?.count !== undefined) {
      // 简单的复数处理，可以根据语言规则扩展
      if (options.count === 0 || options.count > 1) {
        const pluralKey = `${key}_plural`
        const pluralValue = getPluralTranslation(translations, pluralKey)
        if (pluralValue) {
          value = pluralValue
        }
      }
    }
    
    // 替换变量
    if (options?.replace) {
      Object.entries(options.replace).forEach(([placeholder, replacement]) => {
        value = value.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement))
      })
    }
    
    return value
  }
}

// 获取复数翻译
function getPluralTranslation(translations: any, key: string): string | undefined {
  const keys = key.split('.')
  let value = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return undefined
    }
  }
  
  return typeof value === 'string' ? value : undefined
}

// 创建格式化函数
export function createFormatFunctions(locale: SupportedLocale, currency: SupportedCurrency, timezone: string): FormatFunctions {
  return {
    formatDate: (date: Date, format?: string) => {
      const options: Intl.DateTimeFormatOptions = {}
      
      if (format) {
        // 解析自定义格式
        if (format.includes('YYYY')) options.year = 'numeric'
        if (format.includes('MM')) options.month = '2-digit'
        if (format.includes('DD')) options.day = '2-digit'
      } else {
        options.year = 'numeric'
        options.month = 'long'
        options.day = 'numeric'
      }
      
      return new Intl.DateTimeFormat(locale, options).format(date)
    },
    
    formatTime: (date: Date, format?: string) => {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      }
      
      if (format === '12h') {
        options.hour12 = true
      } else if (format === '24h') {
        options.hour12 = false
      }
      
      return new Intl.DateTimeFormat(locale, options).format(date)
    },
    
    formatDateTime: (date: Date, format?: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      }
      
      return new Intl.DateTimeFormat(locale, options).format(date)
    },
    
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(number)
    },
    
    formatCurrency: (amount: number, currencyCode?: SupportedCurrency) => {
      const targetCurrency = currencyCode || currency
      const currencyInfo = supportedCurrencies.find(c => c.code === targetCurrency)
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: currencyInfo?.decimals || 2,
        maximumFractionDigits: currencyInfo?.decimals || 2
      }).format(amount)
    },
    
    formatPercent: (value: number, decimals: number = 1) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100)
    },
    
    formatFileSize: (bytes: number) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      return `${size.toFixed(1)} ${units[unitIndex]}`
    },
    
    formatRelativeTime: (date: Date) => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      
      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second')
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
      } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
      } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
      }
    }
  }
}

// 创建本地化上下文
export function createLocalizationContext(
  locale: SupportedLocale,
  currency: SupportedCurrency,
  timezone: string
): LocalizationContext {
  const language = supportedLanguages.find(lang => lang.code === locale)
  const currencyInfo = supportedCurrencies.find(curr => curr.code === currency)
  const timezoneInfo = supportedTimezones.find(tz => tz.id === timezone)
  
  return {
    locale,
    currency,
    timezone,
    region: {
      code: locale.split('-')[1] || 'US',
      name: language?.name || 'English',
      currency,
      timezone,
      languages: [locale],
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      numberFormat: {
        decimal: '.',
        thousands: ',',
        grouping: [3]
      },
      phoneFormat: '+1-XXX-XXX-XXXX',
      addressFormat: ['line1', 'line2', 'city', 'state', 'postalCode', 'country']
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    },
    rtl: language?.rtl || false
  }
}

// 货币转换
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  const fromRate = supportedCurrencies.find(c => c.code === fromCurrency)?.rate || 1
  const toRate = supportedCurrencies.find(c => c.code === toCurrency)?.rate || 1
  
  // 转换为基准货币（USD），然后转换为目标货币
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

// 时区转换
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  // 创建一个新的日期对象，表示在目标时区的相同时刻
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
  
  // 获取目标时区的偏移量
  const targetTimezoneInfo = supportedTimezones.find(tz => tz.id === toTimezone)
  const targetOffset = targetTimezoneInfo?.offsetMinutes || 0
  
  return new Date(utcTime + (targetOffset * 60000))
}

// 检测用户偏好
export function detectUserPreferences() {
  if (typeof window === 'undefined') {
    return {
      locale: 'en-US' as SupportedLocale,
      currency: 'USD' as SupportedCurrency,
      timezone: 'UTC'
    }
  }
  
  // 检测语言
  const browserLang = navigator.language
  const supportedLocale = supportedLanguages.find(lang => 
    lang.code === browserLang || lang.code.split('-')[0] === browserLang.split('-')[0]
  )?.code || 'en-US'
  
  // 检测时区
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // 根据语言推断货币
  const currencyMap: Record<string, SupportedCurrency> = {
    'zh-CN': 'CNY',
    'zh-TW': 'CNY',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'vi-VN': 'VND',
    'ms-MY': 'MYR',
    'th-TH': 'THB',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'en-GB': 'GBP'
  }
  
  const detectedCurrency = currencyMap[supportedLocale] || 'USD'
  
  return {
    locale: supportedLocale,
    currency: detectedCurrency,
    timezone: detectedTimezone
  }
}

// 验证语言代码
export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLanguages.some(lang => lang.code === locale)
}

// 验证货币代码
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return supportedCurrencies.some(curr => curr.code === currency)
}

// 获取语言的RTL状态
export function isRTLLanguage(locale: SupportedLocale): boolean {
  const language = supportedLanguages.find(lang => lang.code === locale)
  return language?.rtl || false
}

// 获取语言的完成度
export function getLanguageCompleteness(locale: SupportedLocale): number {
  const language = supportedLanguages.find(lang => lang.code === locale)
  return language?.completeness || 0
}
