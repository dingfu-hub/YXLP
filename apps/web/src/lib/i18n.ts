// 国际化工具函数
import { MultiLanguageContent, SupportedLanguage } from '@/types/news'

// 支持的语言配置
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  chineseName: string;
  flag: string
}> = {
  zh: { name: 'Chinese', nativeName: '中文', chineseName: '中文', flag: '🇨🇳' },
  en: { name: 'English', nativeName: 'English', chineseName: '英文', flag: '🇺🇸' },
  ja: { name: 'Japanese', nativeName: '日本語', chineseName: '日文', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', chineseName: '韩文', flag: '🇰🇷' },
  es: { name: 'Spanish', nativeName: 'Español', chineseName: '西班牙文', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', chineseName: '法文', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', chineseName: '德文', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', chineseName: '意大利文', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', chineseName: '葡萄牙文', flag: '🇵🇹' },
  ru: { name: 'Russian', nativeName: 'Русский', chineseName: '俄文', flag: '🇷🇺' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', chineseName: '越南语', flag: '🇻🇳' },
  th: { name: 'Thai', nativeName: 'ไทย', chineseName: '泰语', flag: '🇹🇭' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', chineseName: '印尼语', flag: '🇮🇩' }
}

// 默认语言
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh'

// 根据地区检测语言
export function detectLanguageFromRegion(region?: string): SupportedLanguage {
  if (!region) return DEFAULT_LANGUAGE
  
  const regionMap: Record<string, SupportedLanguage> = {
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh',
    'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en',
    'JP': 'ja',
    'KR': 'ko',
    'ES': 'es', 'MX': 'es', 'AR': 'es',
    'FR': 'fr',
    'DE': 'de', 'AT': 'de', 'CH': 'de',
    'IT': 'it',
    'PT': 'pt', 'BR': 'pt',
    'RU': 'ru',
    'VN': 'vi',
    'TH': 'th',
    'ID': 'id'
  }
  
  return regionMap[region.toUpperCase()] || DEFAULT_LANGUAGE
}

// 从浏览器检测语言
export function detectLanguageFromBrowser(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage
  return Object.keys(SUPPORTED_LANGUAGES).includes(browserLang) ? browserLang : DEFAULT_LANGUAGE
}

// 获取多语言内容中的指定语言文本
export function getLocalizedContent(content: MultiLanguageContent, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  return content[language] || content.zh || Object.values(content)[0] || ''
}

// 创建多语言内容对象
export function createMultiLanguageContent(defaultText: string, language: SupportedLanguage = DEFAULT_LANGUAGE): MultiLanguageContent {
  const content: MultiLanguageContent = { zh: '' }
  content[language] = defaultText
  if (language !== 'zh') {
    content.zh = defaultText // 如果不是中文，也设置中文为默认值
  }
  return content
}

// 更新多语言内容
export function updateMultiLanguageContent(
  content: MultiLanguageContent, 
  text: string, 
  language: SupportedLanguage
): MultiLanguageContent {
  return {
    ...content,
    [language]: text
  }
}

// 检查多语言内容是否为空
export function isMultiLanguageContentEmpty(content: MultiLanguageContent): boolean {
  return Object.values(content).every(text => !text || text.trim() === '')
}

// 获取多语言内容中已有的语言列表
export function getAvailableLanguages(content: MultiLanguageContent): SupportedLanguage[] {
  return Object.entries(content)
    .filter(([_, text]) => text && text.trim() !== '')
    .map(([lang, _]) => lang as SupportedLanguage)
}

// 搜索多语言内容
export function searchInMultiLanguageContent(
  content: MultiLanguageContent, 
  query: string, 
  languages?: SupportedLanguage[]
): boolean {
  const searchLanguages = languages || Object.keys(content) as SupportedLanguage[]
  const lowercaseQuery = query.toLowerCase()
  
  return searchLanguages.some(lang => {
    const text = content[lang]
    return text && text.toLowerCase().includes(lowercaseQuery)
  })
}

// 语言优先级排序（根据用户偏好）
export function sortLanguagesByPreference(
  languages: SupportedLanguage[], 
  userLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): SupportedLanguage[] {
  const priority = [userLanguage, DEFAULT_LANGUAGE, 'en']
  
  return languages.sort((a, b) => {
    const aIndex = priority.indexOf(a)
    const bIndex = priority.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return 0
  })
}

// 格式化语言显示名称
export function formatLanguageName(language: SupportedLanguage, showFlag: boolean = true): string {
  const config = SUPPORTED_LANGUAGES[language]
  if (!config) return language
  
  return showFlag ? `${config.flag} ${config.nativeName}` : config.nativeName
}

// 验证语言代码
export function isValidLanguage(language: string): language is SupportedLanguage {
  return Object.keys(SUPPORTED_LANGUAGES).includes(language)
}
