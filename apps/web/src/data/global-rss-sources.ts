// 全球多语种RSS源配置
import { NewsSource, SupportedLanguage, CountryLanguageMapping } from '@/types/news'

// 全球国家和语言映射
export const COUNTRY_LANGUAGE_MAPPINGS: CountryLanguageMapping[] = [
  // 中文
  { country: 'China', countryCode: 'CN', language: 'zh', region: 'Asia', flag: '🇨🇳' },
  { country: 'Taiwan', countryCode: 'TW', language: 'zh', region: 'Asia', flag: '🇹🇼' },
  { country: 'Hong Kong', countryCode: 'HK', language: 'zh', region: 'Asia', flag: '🇭🇰' },
  { country: 'Singapore', countryCode: 'SG', language: 'zh', region: 'Asia', flag: '🇸🇬' },
  
  // 英文
  { country: 'United States', countryCode: 'US', language: 'en', region: 'Americas', flag: '🇺🇸' },
  { country: 'United Kingdom', countryCode: 'GB', language: 'en', region: 'Europe', flag: '🇬🇧' },
  { country: 'Canada', countryCode: 'CA', language: 'en', region: 'Americas', flag: '🇨🇦' },
  { country: 'Australia', countryCode: 'AU', language: 'en', region: 'Oceania', flag: '🇦🇺' },
  { country: 'India', countryCode: 'IN', language: 'en', region: 'Asia', flag: '🇮🇳' },
  
  // 日文
  { country: 'Japan', countryCode: 'JP', language: 'ja', region: 'Asia', flag: '🇯🇵' },
  
  // 韩文
  { country: 'South Korea', countryCode: 'KR', language: 'ko', region: 'Asia', flag: '🇰🇷' },
  
  // 西班牙文
  { country: 'Spain', countryCode: 'ES', language: 'es', region: 'Europe', flag: '🇪🇸' },
  { country: 'Mexico', countryCode: 'MX', language: 'es', region: 'Americas', flag: '🇲🇽' },
  { country: 'Argentina', countryCode: 'AR', language: 'es', region: 'Americas', flag: '🇦🇷' },
  { country: 'Colombia', countryCode: 'CO', language: 'es', region: 'Americas', flag: '🇨🇴' },
  
  // 法文
  { country: 'France', countryCode: 'FR', language: 'fr', region: 'Europe', flag: '🇫🇷' },
  { country: 'Belgium', countryCode: 'BE', language: 'fr', region: 'Europe', flag: '🇧🇪' },
  { country: 'Switzerland', countryCode: 'CH', language: 'fr', region: 'Europe', flag: '🇨🇭' },
  
  // 德文
  { country: 'Germany', countryCode: 'DE', language: 'de', region: 'Europe', flag: '🇩🇪' },
  { country: 'Austria', countryCode: 'AT', language: 'de', region: 'Europe', flag: '🇦🇹' },
  
  // 意大利文
  { country: 'Italy', countryCode: 'IT', language: 'it', region: 'Europe', flag: '🇮🇹' },
  
  // 葡萄牙文
  { country: 'Portugal', countryCode: 'PT', language: 'pt', region: 'Europe', flag: '🇵🇹' },
  { country: 'Brazil', countryCode: 'BR', language: 'pt', region: 'Americas', flag: '🇧🇷' },
  
  // 俄文
  { country: 'Russia', countryCode: 'RU', language: 'ru', region: 'Europe', flag: '🇷🇺' },
  
  // 阿拉伯文
  { country: 'Saudi Arabia', countryCode: 'SA', language: 'ar', region: 'Asia', flag: '🇸🇦' },
  { country: 'UAE', countryCode: 'AE', language: 'ar', region: 'Asia', flag: '🇦🇪' },
  
  // 荷兰文
  { country: 'Netherlands', countryCode: 'NL', language: 'nl', region: 'Europe', flag: '🇳🇱' },
  
  // 土耳其文
  { country: 'Turkey', countryCode: 'TR', language: 'tr', region: 'Europe', flag: '🇹🇷' }
]

// 生成RSS源的基础模板
function generateRSSSourcesForCountry(mapping: CountryLanguageMapping, startIndex: number): NewsSource[] {
  const sources: NewsSource[] = []
  
  // 为每个国家生成100个RSS源
  for (let i = 1; i <= 100; i++) {
    const sourceId = `${mapping.countryCode.toLowerCase()}_${i.toString().padStart(3, '0')}`
    
    sources.push({
      id: sourceId,
      name: `${mapping.country} Textile & Apparel News ${i}`,
      type: 'rss',
      url: `https://textile-news-${mapping.countryCode.toLowerCase()}-${i}.com/rss`,
      category: 'business',
      language: mapping.language,
      country: mapping.countryCode,
      region: mapping.region,
      isActive: true,
      crawlInterval: 120, // 2小时
      rssConfig: {
        titleSelector: 'title',
        contentSelector: 'description',
        linkSelector: 'link',
        imageSelector: 'enclosure'
      },
      filters: {
        keywords: [
          'textile', 'apparel', 'clothing', 'fashion', 'garment',
          'underwear', 'lingerie', 'intimate', 'bra', 'panties',
          'manufacturing', 'supplier', 'wholesale', 'B2B', 'trade',
          'export', 'import', 'sourcing', 'procurement', 'China'
        ],
        excludeKeywords: ['retail', 'consumer', 'B2C', 'shopping'],
        minContentLength: 200,
        minQualityScore: 70,
        maxArticlesPerCrawl: 10,
        enableDuplicateDetection: true,
        contentLanguage: mapping.language
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  return sources
}

// 生成所有国家的RSS源
export function generateGlobalRSSSources(): NewsSource[] {
  const allSources: NewsSource[] = []
  
  COUNTRY_LANGUAGE_MAPPINGS.forEach((mapping, index) => {
    const countrySources = generateRSSSourcesForCountry(mapping, index * 100)
    allSources.push(...countrySources)
  })
  
  return allSources
}

// 按语言分组获取RSS源
export function getRSSSourcesByLanguage(language: SupportedLanguage): NewsSource[] {
  const allSources = generateGlobalRSSSources()
  return allSources.filter(source => source.language === language)
}

// 按国家获取RSS源
export function getRSSSourcesByCountry(countryCode: string): NewsSource[] {
  const allSources = generateGlobalRSSSources()
  return allSources.filter(source => source.country === countryCode)
}

// 获取支持的语言列表
export function getSupportedLanguagesWithCountries(): { language: SupportedLanguage, countries: CountryLanguageMapping[] }[] {
  const languageGroups: { [key: string]: CountryLanguageMapping[] } = {}
  
  COUNTRY_LANGUAGE_MAPPINGS.forEach(mapping => {
    if (!languageGroups[mapping.language]) {
      languageGroups[mapping.language] = []
    }
    languageGroups[mapping.language].push(mapping)
  })
  
  return Object.entries(languageGroups).map(([language, countries]) => ({
    language: language as SupportedLanguage,
    countries
  }))
}
