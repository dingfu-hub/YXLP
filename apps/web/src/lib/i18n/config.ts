// 国际化配置

import { SupportedLocale, LanguageInfo, CurrencyInfo, TimezoneInfo, I18nConfig } from '@/types/i18n'

// 支持的语言列表
export const supportedLanguages: LanguageInfo[] = [
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false,
    enabled: true,
    completeness: 100
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    rtl: false,
    enabled: true,
    completeness: 95
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    rtl: false,
    enabled: true,
    completeness: 100
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    rtl: false,
    enabled: true,
    completeness: 98
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    enabled: true,
    completeness: 90
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    enabled: true,
    completeness: 85
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    enabled: true,
    completeness: 85
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    enabled: true,
    completeness: 80
  },
  {
    code: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    rtl: false,
    enabled: true,
    completeness: 75
  },
  {
    code: 'ms-MY',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    rtl: false,
    enabled: true,
    completeness: 70
  },
  {
    code: 'th-TH',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    rtl: false,
    enabled: true,
    completeness: 70
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    enabled: true,
    completeness: 80
  }
]

// 支持的货币列表
export const supportedCurrencies: CurrencyInfo[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    rate: 1.0, // 基准货币
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    rate: 0.85,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimals: 2,
    rate: 7.2,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimals: 0,
    rate: 150.0,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    rate: 0.75,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'KRW',
    name: 'Korean Won',
    symbol: '₩',
    decimals: 0,
    rate: 1300.0,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    decimals: 0,
    rate: 24000.0,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    decimals: 2,
    rate: 4.7,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    decimals: 2,
    rate: 36.0,
    enabled: true,
    lastUpdated: new Date()
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    decimals: 2,
    rate: 1.35,
    enabled: true,
    lastUpdated: new Date()
  }
]

// 主要时区列表
export const supportedTimezones: TimezoneInfo[] = [
  {
    id: 'Asia/Shanghai',
    name: 'China Standard Time',
    offset: '+08:00',
    offsetMinutes: 480,
    abbreviation: 'CST',
    region: 'Asia',
    country: 'China'
  },
  {
    id: 'Asia/Taipei',
    name: 'Taipei Standard Time',
    offset: '+08:00',
    offsetMinutes: 480,
    abbreviation: 'TST',
    region: 'Asia',
    country: 'Taiwan'
  },
  {
    id: 'America/New_York',
    name: 'Eastern Standard Time',
    offset: '-05:00',
    offsetMinutes: -300,
    abbreviation: 'EST',
    region: 'America',
    country: 'United States'
  },
  {
    id: 'America/Los_Angeles',
    name: 'Pacific Standard Time',
    offset: '-08:00',
    offsetMinutes: -480,
    abbreviation: 'PST',
    region: 'America',
    country: 'United States'
  },
  {
    id: 'Europe/London',
    name: 'Greenwich Mean Time',
    offset: '+00:00',
    offsetMinutes: 0,
    abbreviation: 'GMT',
    region: 'Europe',
    country: 'United Kingdom'
  },
  {
    id: 'Europe/Paris',
    name: 'Central European Time',
    offset: '+01:00',
    offsetMinutes: 60,
    abbreviation: 'CET',
    region: 'Europe',
    country: 'France'
  },
  {
    id: 'Europe/Berlin',
    name: 'Central European Time',
    offset: '+01:00',
    offsetMinutes: 60,
    abbreviation: 'CET',
    region: 'Europe',
    country: 'Germany'
  },
  {
    id: 'Asia/Tokyo',
    name: 'Japan Standard Time',
    offset: '+09:00',
    offsetMinutes: 540,
    abbreviation: 'JST',
    region: 'Asia',
    country: 'Japan'
  },
  {
    id: 'Asia/Seoul',
    name: 'Korea Standard Time',
    offset: '+09:00',
    offsetMinutes: 540,
    abbreviation: 'KST',
    region: 'Asia',
    country: 'South Korea'
  },
  {
    id: 'Asia/Ho_Chi_Minh',
    name: 'Indochina Time',
    offset: '+07:00',
    offsetMinutes: 420,
    abbreviation: 'ICT',
    region: 'Asia',
    country: 'Vietnam'
  },
  {
    id: 'Asia/Kuala_Lumpur',
    name: 'Malaysia Time',
    offset: '+08:00',
    offsetMinutes: 480,
    abbreviation: 'MYT',
    region: 'Asia',
    country: 'Malaysia'
  },
  {
    id: 'Asia/Bangkok',
    name: 'Indochina Time',
    offset: '+07:00',
    offsetMinutes: 420,
    abbreviation: 'ICT',
    region: 'Asia',
    country: 'Thailand'
  }
]

// 国际化配置
export const i18nConfig: I18nConfig = {
  defaultLocale: 'zh-CN',
  locales: supportedLanguages.filter(lang => lang.enabled).map(lang => lang.code),
  fallbackLocale: 'en-US',
  interpolation: {
    escapeValue: false,
    format: (value: any, format: string, lng: string) => {
      if (format === 'currency') {
        return formatCurrency(value, getCurrentCurrency())
      }
      if (format === 'date') {
        return formatDate(value, lng)
      }
      if (format === 'number') {
        return formatNumber(value, lng)
      }
      return value
    }
  },
  detection: {
    order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
    caches: ['cookie', 'localStorage'],
    cookieMinutes: 60 * 24 * 30 // 30 days
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false
  }
}

// 工具函数
export function getLanguageByCode(code: SupportedLocale): LanguageInfo | undefined {
  return supportedLanguages.find(lang => lang.code === code)
}

export function getCurrencyByCode(code: string): CurrencyInfo | undefined {
  return supportedCurrencies.find(currency => currency.code === code)
}

export function getTimezoneById(id: string): TimezoneInfo | undefined {
  return supportedTimezones.find(tz => tz.id === id)
}

export function getCurrentCurrency(): string {
  // 从用户偏好或浏览器设置获取当前货币
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currency') || 'USD'
  }
  return 'USD'
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyInfo = getCurrencyByCode(currency)
  if (!currencyInfo) return amount.toString()

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals
  }).format(amount)
}

export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatNumber(number: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(number)
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = getCurrencyByCode(fromCurrency)?.rate || 1
  const toRate = getCurrencyByCode(toCurrency)?.rate || 1
  
  // 先转换为基准货币（USD），再转换为目标货币
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

export function detectUserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en-US'
  
  // 从 localStorage 获取
  const stored = localStorage.getItem('locale') as SupportedLocale
  if (stored && supportedLanguages.find(lang => lang.code === stored)) {
    return stored
  }
  
  // 从浏览器语言检测
  const browserLang = navigator.language
  const matchedLang = supportedLanguages.find(lang => 
    lang.code === browserLang || lang.code.split('-')[0] === browserLang.split('-')[0]
  )
  
  return matchedLang?.code || 'en-US'
}

export function detectUserTimezone(): string {
  if (typeof window === 'undefined') return 'UTC'
  
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

export function detectUserCurrency(): string {
  if (typeof window === 'undefined') return 'USD'
  
  // 从地理位置推断货币
  const locale = detectUserLocale()
  const currencyMap: Record<string, string> = {
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
  
  return currencyMap[locale] || 'USD'
}
