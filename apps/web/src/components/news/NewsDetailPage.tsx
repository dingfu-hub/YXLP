'use client'

import { useState } from 'react'
import Link from 'next/link'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { NewsArticle } from '@/types/news'

interface NewsDetailPageProps {
  news: NewsArticle
  locale: string
}

// 多语言内容
const CONTENT: Record<string, any> = {
  zh: {
    backToNews: '返回新闻列表',
    publishedOn: '发布于',
    author: '作者',
    category: '分类',
    tags: '标签',
    source: '来源',
    translating: '内容翻译中...',
    translationNotAvailable: '该语言版本暂不可用'
  },
  en: {
    backToNews: 'Back to News',
    publishedOn: 'Published on',
    author: 'Author',
    category: 'Category',
    tags: 'Tags',
    source: 'Source',
    translating: 'Content is being translated...',
    translationNotAvailable: 'This language version is not available'
  },
  ja: {
    backToNews: 'ニュース一覧に戻る',
    publishedOn: '公開日',
    author: '著者',
    category: 'カテゴリ',
    tags: 'タグ',
    source: 'ソース',
    translating: 'コンテンツを翻訳中...',
    translationNotAvailable: 'この言語版は利用できません'
  },
  ko: {
    backToNews: '뉴스 목록으로 돌아가기',
    publishedOn: '게시일',
    author: '저자',
    category: '카테고리',
    tags: '태그',
    source: '출처',
    translating: '콘텐츠 번역 중...',
    translationNotAvailable: '이 언어 버전은 사용할 수 없습니다'
  },
  es: {
    backToNews: 'Volver a Noticias',
    publishedOn: 'Publicado el',
    author: 'Autor',
    category: 'Categoría',
    tags: 'Etiquetas',
    source: 'Fuente',
    translating: 'Contenido siendo traducido...',
    translationNotAvailable: 'Esta versión de idioma no está disponible'
  },
  fr: {
    backToNews: 'Retour aux Actualités',
    publishedOn: 'Publié le',
    author: 'Auteur',
    category: 'Catégorie',
    tags: 'Étiquettes',
    source: 'Source',
    translating: 'Contenu en cours de traduction...',
    translationNotAvailable: 'Cette version linguistique n\'est pas disponible'
  },
  de: {
    backToNews: 'Zurück zu Nachrichten',
    publishedOn: 'Veröffentlicht am',
    author: 'Autor',
    category: 'Kategorie',
    tags: 'Tags',
    source: 'Quelle',
    translating: 'Inhalt wird übersetzt...',
    translationNotAvailable: 'Diese Sprachversion ist nicht verfügbar'
  },
  it: {
    backToNews: 'Torna alle Notizie',
    publishedOn: 'Pubblicato il',
    author: 'Autore',
    category: 'Categoria',
    tags: 'Tag',
    source: 'Fonte',
    translating: 'Contenuto in traduzione...',
    translationNotAvailable: 'Questa versione linguistica non è disponibile'
  },
  pt: {
    backToNews: 'Voltar às Notícias',
    publishedOn: 'Publicado em',
    author: 'Autor',
    category: 'Categoria',
    tags: 'Tags',
    source: 'Fonte',
    translating: 'Conteúdo sendo traduzido...',
    translationNotAvailable: 'Esta versão de idioma não está disponível'
  },
  ru: {
    backToNews: 'Назад к Новостям',
    publishedOn: 'Опубликовано',
    author: 'Автор',
    category: 'Категория',
    tags: 'Теги',
    source: 'Источник',
    translating: 'Контент переводится...',
    translationNotAvailable: 'Эта языковая версия недоступна'
  }
}

export default function NewsDetailPage({ news, locale }: NewsDetailPageProps) {
  const content = CONTENT[locale] || CONTENT.en

  const getLocalizedContent = (field: string) => {
    if (!news[field as keyof NewsArticle]) return ''
    const fieldContent = news[field as keyof NewsArticle] as any
    if (typeof fieldContent === 'string') return fieldContent
    return fieldContent[locale] || fieldContent.zh || fieldContent.en || ''
  }

  const title = getLocalizedContent('title')
  const summary = getLocalizedContent('summary')
  const newsContent = getLocalizedContent('content')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 检查内容是否可用
  const hasContent = title && newsContent
  
  if (!hasContent) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href={`/${locale}`} className="text-2xl font-bold text-blue-600">
                  YXLP
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Not Available */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.translating}</h2>
              <p className="text-gray-600 mb-8">{content.translationNotAvailable}</p>
              <Link
                href={`/${locale}/news`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {content.backToNews}
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-2xl font-bold text-blue-600">
                YXLP
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {content.backToNews}
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            
            {summary && (
              <p className="text-xl text-gray-600 mb-6">{summary}</p>
            )}

            <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-6">
              <div className="flex items-center">
                <svg className="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {content.publishedOn} {formatDate(news.createdAt)}
              </div>
              
              {news.author && (
                <div className="flex items-center">
                  <svg className="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {content.author}: {news.author}
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {news.featuredImage && (
            <div className="mb-8">
              <img
                src={news.featuredImage}
                alt={title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: newsContent }} />
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              {news.sourceName && (
                <div className="text-sm text-gray-500">
                  {content.source}: {news.sourceName}
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>
    </div>
  )
}
