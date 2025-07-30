// AI润色服务
import { AIModel, SupportedLanguage, MultiLanguageContent, AIPolishProgress } from '@/types/news'
import { SUPPORTED_LANGUAGES } from './i18n'

// AI模型配置（从API动态获取）
export async function getAIModelConfig(model: AIModel) {
  try {
    const response = await fetch('/api/admin/ai-config')
    const result = await response.json()

    if (!result.success) {
      throw new Error('获取AI配置失败')
    }

    const config = result.data.find((c: any) => c.model === model)
    if (!config) {
      throw new Error(`AI模型配置不存在: ${model}`)
    }

    return config
  } catch (error) {
    console.error('获取AI配置失败:', error)
    throw error
  }
}

// 导出AI模型配置常量供客户端使用
export const AI_MODELS = {
  deepseek: {
    name: 'DeepSeek',
    description: '深度求索 - 高质量中文处理'
  },
  doubao: {
    name: '豆包',
    description: '字节跳动豆包 - 多语言优化'
  }
}

// 润色提示词模板
const POLISH_PROMPTS = {
  title: {
    zh: '请将以下新闻标题润色得更加吸引人和专业，保持原意不变，适合服装行业读者。请只返回润色后的标题，不要添加任何解释或其他内容：',
    en: 'Please polish the following news title to make it more attractive and professional while maintaining the original meaning, suitable for fashion industry readers. Return only the polished title without any explanation or additional content:',
    ja: '以下のニュースタイトルをより魅力的で専門的に磨き上げ、元の意味を保ちながら、ファッション業界の読者に適したものにしてください。説明や追加内容なしで、磨き上げられたタイトルのみを返してください：',
    ko: '다음 뉴스 제목을 더 매력적이고 전문적으로 다듬어 주세요. 원래 의미는 유지하면서 패션 업계 독자에게 적합하게 해주세요. 설명이나 추가 내용 없이 다듬어진 제목만 반환해 주세요:',
    es: 'Por favor, pule el siguiente titular de noticias para hacerlo más atractivo y profesional manteniendo el significado original, adecuado para lectores de la industria de la moda. Devuelve solo el titular pulido sin explicación o contenido adicional:',
    fr: 'Veuillez polir le titre de nouvelles suivant pour le rendre plus attrayant et professionnel tout en conservant le sens original, adapté aux lecteurs de l\'industrie de la mode. Retournez uniquement le titre poli sans explication ou contenu supplémentaire:',
    de: 'Bitte polieren Sie die folgende Nachrichtenschlagzeile, um sie attraktiver und professioneller zu machen, während Sie die ursprüngliche Bedeutung beibehalten, geeignet für Leser der Modebranche. Geben Sie nur die polierte Schlagzeile ohne Erklärung oder zusätzlichen Inhalt zurück:',
    it: 'Si prega di lucidare il seguente titolo di notizie per renderlo più attraente e professionale mantenendo il significato originale, adatto ai lettori dell\'industria della moda. Restituire solo il titolo lucidato senza spiegazioni o contenuti aggiuntivi:',
    pt: 'Por favor, polir o seguinte título de notícias para torná-lo mais atraente e profissional mantendo o significado original, adequado para leitores da indústria da moda. Retorne apenas o título polido sem explicação ou conteúdo adicional:',
    ru: 'Пожалуйста, отполируйте следующий заголовок новостей, чтобы сделать его более привлекательным и профессиональным, сохраняя первоначальный смысл, подходящий для читателей модной индустрии. Верните только отполированный заголовок без объяснений или дополнительного содержания:'
  },
  content: {
    zh: '请将以下新闻内容润色，使其更加专业、流畅和吸引人，保持事实准确性，适合服装行业专业人士阅读。请只返回润色后的内容，不要添加任何解释或其他内容：',
    en: 'Please polish the following news content to make it more professional, fluent and engaging while maintaining factual accuracy, suitable for fashion industry professionals. Return only the polished content without any explanation or additional content:',
    ja: '以下のニュース内容をより専門的で流暢で魅力的に磨き上げ、事実の正確性を保ちながら、ファッション業界の専門家の読書に適したものにしてください。説明や追加内容なしで、磨き上げられた内容のみを返してください：',
    ko: '다음 뉴스 내용을 더 전문적이고 유창하며 매력적으로 다듬어 주세요. 사실의 정확성을 유지하면서 패션 업계 전문가들이 읽기에 적합하게 해주세요. 설명이나 추가 내용 없이 다듬어진 내용만 반환해 주세요:',
    es: 'Por favor, pule el siguiente contenido de noticias para hacerlo más profesional, fluido y atractivo manteniendo la precisión factual, adecuado para profesionales de la industria de la moda. Devuelve solo el contenido pulido sin explicación o contenido adicional:',
    fr: 'Veuillez polir le contenu de nouvelles suivant pour le rendre plus professionnel, fluide et engageant tout en maintenant la précision factuelle, adapté aux professionnels de l\'industrie de la mode. Retournez uniquement le contenu poli sans explication ou contenu supplémentaire:',
    de: 'Bitte polieren Sie den folgenden Nachrichteninhalt, um ihn professioneller, fließender und ansprechender zu machen, während Sie die sachliche Genauigkeit beibehalten, geeignet für Fachleute der Modebranche. Geben Sie nur den polierten Inhalt ohne Erklärung oder zusätzlichen Inhalt zurück:',
    it: 'Si prega di lucidare il seguente contenuto di notizie per renderlo più professionale, fluido e coinvolgente mantenendo l\'accuratezza fattuale, adatto ai professionisti dell\'industria della moda. Restituire solo il contenuto lucidato senza spiegazioni o contenuti aggiuntivi:',
    pt: 'Por favor, polir o seguinte conteúdo de notícias para torná-lo mais profissional, fluente e envolvente mantendo a precisão factual, adequado para profissionais da indústria da moda. Retorne apenas o conteúdo polido sem explicação ou conteúdo adicional:',
    ru: 'Пожалуйста, отполируйте следующий новостной контент, чтобы сделать его более профессиональным, плавным и привлекательным, сохраняя фактическую точность, подходящий для профессионалов модной индустрии. Верните только отполированный контент без объяснений или дополнительного содержания:'
  },
  summary: {
    zh: '请为以下新闻内容写一个简洁、准确的摘要，突出关键信息，适合服装行业读者快速了解。请只返回摘要内容，不要添加任何解释或其他内容：',
    en: 'Please write a concise and accurate summary for the following news content, highlighting key information, suitable for fashion industry readers to quickly understand. Return only the summary content without any explanation or additional content:',
    ja: '以下のニュース内容について、重要な情報を強調し、ファッション業界の読者が素早く理解できるような簡潔で正確な要約を書いてください。説明や追加内容なしで、要約内容のみを返してください：',
    ko: '다음 뉴스 내용에 대해 핵심 정보를 강조하고 패션 업계 독자들이 빠르게 이해할 수 있도록 간결하고 정확한 요약을 작성해 주세요. 설명이나 추가 내용 없이 요약 내용만 반환해 주세요:',
    es: 'Por favor, escriba un resumen conciso y preciso para el siguiente contenido de noticias, destacando información clave, adecuado para que los lectores de la industria de la moda entiendan rápidamente. Devuelve solo el contenido del resumen sin explicación o contenido adicional:',
    fr: 'Veuillez rédiger un résumé concis et précis pour le contenu de nouvelles suivant, en soulignant les informations clés, adapté aux lecteurs de l\'industrie de la mode pour une compréhension rapide. Retournez uniquement le contenu du résumé sans explication ou contenu supplémentaire:',
    de: 'Bitte schreiben Sie eine prägnante und genaue Zusammenfassung für den folgenden Nachrichteninhalt, die wichtige Informationen hervorhebt und für Leser der Modebranche geeignet ist, um schnell zu verstehen. Geben Sie nur den Zusammenfassungsinhalt ohne Erklärung oder zusätzlichen Inhalt zurück:',
    it: 'Si prega di scrivere un riassunto conciso e accurato per il seguente contenuto di notizie, evidenziando le informazioni chiave, adatto ai lettori dell\'industria della moda per una comprensione rapida. Restituire solo il contenuto del riassunto senza spiegazioni o contenuti aggiuntivi:',
    pt: 'Por favor, escreva um resumo conciso e preciso para o seguinte conteúdo de notícias, destacando informações-chave, adequado para leitores da indústria da moda entenderem rapidamente. Retorne apenas o conteúdo do resumo sem explicação ou conteúdo adicional:',
    ru: 'Пожалуйста, напишите краткое и точное резюме для следующего новостного контента, выделяя ключевую информацию, подходящую для читателей модной индустрии для быстрого понимания. Верните только содержание резюме без объяснений или дополнительного содержания:'
  }
}

// 翻译提示词模板
const TRANSLATE_PROMPTS = {
  zh: '请将以下文本翻译成中文，保持专业性和准确性，适合服装行业：',
  en: 'Please translate the following text into English, maintaining professionalism and accuracy, suitable for the fashion industry:',
  ja: '以下のテキストを日本語に翻訳し、専門性と正確性を保ち、ファッション業界に適したものにしてください：',
  ko: '다음 텍스트를 한국어로 번역해 주세요. 전문성과 정확성을 유지하며 패션 업계에 적합하게 해주세요:',
  es: 'Por favor, traduzca el siguiente texto al español, manteniendo la profesionalidad y precisión, adecuado para la industria de la moda:',
  fr: 'Veuillez traduire le texte suivant en français, en maintenant le professionnalisme et la précision, adapté à l\'industrie de la mode:',
  de: 'Bitte übersetzen Sie den folgenden Text ins Deutsche und behalten Sie dabei Professionalität und Genauigkeit bei, geeignet für die Modebranche:',
  it: 'Si prega di tradurre il seguente testo in italiano, mantenendo professionalità e precisione, adatto all\'industria della moda:',
  pt: 'Por favor, traduza o seguinte texto para o português, mantendo profissionalismo e precisão, adequado para a indústria da moda:',
  ru: 'Пожалуйста, переведите следующий текст на русский язык, сохраняя профессионализм и точность, подходящий для модной индустрии:'
}

// AI润色服务类
export class AIPolishService {
  private model: AIModel
  private progressCallback?: (progress: AIPolishProgress) => void

  constructor(model: AIModel = 'deepseek') {
    this.model = model
  }

  // 设置进度回调
  setProgressCallback(callback: (progress: AIPolishProgress) => void) {
    this.progressCallback = callback
  }

  // 润色单个文本
  async polishText(
    text: string, 
    type: 'title' | 'content' | 'summary',
    targetLanguage: SupportedLanguage = 'zh'
  ): Promise<string> {
    try {
      const prompt = POLISH_PROMPTS[type][targetLanguage] || POLISH_PROMPTS[type].zh
      
      // 模拟AI调用（实际项目中需要调用真实的AI API）
      const response = await this.callAI(`${prompt}\n\n${text}`)
      return response.trim()
    } catch (error) {
      console.error('AI润色失败:', error)
      throw new Error(`AI润色失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 翻译文本
  async translateText(
    text: string,
    targetLanguage: SupportedLanguage
  ): Promise<string> {
    try {
      const prompt = TRANSLATE_PROMPTS[targetLanguage] || TRANSLATE_PROMPTS.zh
      
      // 模拟AI调用
      const response = await this.callAI(`${prompt}\n\n${text}`)
      return response.trim()
    } catch (error) {
      console.error('AI翻译失败:', error)
      throw new Error(`AI翻译失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 润色多语言内容
  async polishMultiLanguageContent(
    originalText: string,
    type: 'title' | 'content' | 'summary',
    targetLanguages: SupportedLanguage[] = ['zh', 'en']
  ): Promise<MultiLanguageContent> {
    const result: MultiLanguageContent = { zh: '' }
    const total = targetLanguages.length
    let completed = 0

    // 更新进度
    const updateProgress = (current?: string, status: AIPolishProgress['status'] = 'processing') => {
      if (this.progressCallback) {
        this.progressCallback({
          total,
          completed,
          current,
          status
        })
      }
    }

    updateProgress(undefined, 'processing')

    try {
      for (const language of targetLanguages) {
        updateProgress(SUPPORTED_LANGUAGES[language].nativeName)
        
        if (language === 'zh') {
          // 中文润色
          result[language] = await this.polishText(originalText, type, language)
        } else {
          // 其他语言：先翻译再润色
          const translated = await this.translateText(originalText, language)
          result[language] = await this.polishText(translated, type, language)
        }
        
        completed++
        updateProgress(SUPPORTED_LANGUAGES[language].nativeName)
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      updateProgress(undefined, 'completed')
      return result
    } catch (error) {
      updateProgress(undefined, 'failed')
      throw error
    }
  }

  // 调用AI API进行润色
  private async callAI(prompt: string): Promise<string> {
    try {
      // 在服务端环境中，直接导入数据库模块
      if (typeof window === 'undefined') {
        const { getAIConfig } = await import('./db/ai-config')
        const modelConfig = await getAIConfig(this.model)

        if (!modelConfig || !modelConfig.enabled || !modelConfig.apiKey) {
          console.warn(`${this.model} 未启用或API密钥未配置，返回原始文本`)
          // 从prompt中提取原始文本
          const lines = prompt.split('\n\n')
          return lines.length > 1 ? lines[lines.length - 1].trim() : prompt.trim()
        }

        const requestBody = this.model === 'deepseek'
          ? this.buildDeepSeekRequest(prompt, modelConfig)
          : this.buildDoubaoRequest(prompt, modelConfig)

        const response = await fetch(modelConfig.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${modelConfig.apiKey}`
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        let result = ''
        if (this.model === 'deepseek') {
          result = data.choices?.[0]?.message?.content?.trim() || '润色失败'
        } else {
          // 豆包响应格式
          result = data.choices?.[0]?.message?.content?.trim() || '润色失败'
        }

        // 清理AI响应，确保只返回润色后的内容
        return this.cleanAIResponse(result)
      } else {
        // 客户端环境，返回原始文本
        console.warn('客户端环境不支持AI润色，返回原始文本')
        const lines = prompt.split('\n\n')
        return lines.length > 1 ? lines[lines.length - 1].trim() : prompt.trim()
      }
    } catch (error) {
      console.error(`${this.model} API调用失败:`, error)
      // 失败时返回原始文本
      const lines = prompt.split('\n\n')
      return lines.length > 1 ? lines[lines.length - 1].trim() : prompt.trim()
    }
  }

  // 清理AI响应内容
  private cleanAIResponse(response: string): string {
    if (!response || response === '润色失败') {
      return response
    }

    // 移除常见的AI解释性前缀和后缀
    const cleanPatterns = [
      /^(润色后的标题：|润色后的内容：|润色后的摘要：|以下是润色后的)/i,
      /^(Here is the polished|The polished|Polished)/i,
      /^(以下是|这是|润色结果：)/i,
      /(希望这个润色版本|这个版本更加|如有需要可以进一步调整).*$/i,
      /^["'「『](.*)["'」』]$/,  // 移除引号包围
    ]

    let cleaned = response.trim()

    // 应用清理模式
    for (const pattern of cleanPatterns) {
      cleaned = cleaned.replace(pattern, '$1').trim()
    }

    // 如果结果为空或过短，返回原始响应
    if (!cleaned || cleaned.length < 5) {
      return response.trim()
    }

    return cleaned
  }

  // 构建DeepSeek请求体
  private buildDeepSeekRequest(prompt: string, config: any) {
    return {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: false
    }
  }

  // 构建豆包请求体
  private buildDoubaoRequest(prompt: string, config: any) {
    return {
      model: config.modelId || 'doubao-pro-4k',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: false
    }
  }

  // 获取模型信息
  getModelInfo(): typeof AI_MODELS[AIModel] {
    return AI_MODELS[this.model]
  }

  // 切换模型
  switchModel(model: AIModel) {
    this.model = model
  }
}

// 创建默认实例
export const aiPolishService = new AIPolishService()

// 润色新闻内容（用于采集流程）
export async function polishNewsContent(
  title: string,
  content: string,
  summary: string,
  aiModel: AIModel,
  targetLanguages: SupportedLanguage[]
): Promise<{
  polishedContent: {
    title: MultiLanguageContent
    content: MultiLanguageContent
    summary: MultiLanguageContent
  }
  aiModel: AIModel
  processedAt: Date
}> {
  const service = new AIPolishService(aiModel)

  try {
    // 并行处理标题、内容和摘要的多语言润色
    const [polishedTitle, polishedContent, polishedSummary] = await Promise.all([
      service.polishMultiLanguageContent(title, 'title', targetLanguages),
      service.polishMultiLanguageContent(content, 'content', targetLanguages),
      service.polishMultiLanguageContent(summary, 'summary', targetLanguages)
    ])

    return {
      polishedContent: {
        title: polishedTitle,
        content: polishedContent,
        summary: polishedSummary
      },
      aiModel,
      processedAt: new Date()
    }
  } catch (error) {
    console.error('AI润色失败:', error)
    throw new Error(`AI润色失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}
