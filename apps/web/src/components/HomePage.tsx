'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

interface HomePageProps {
  locale: string
}

// 多语言内容
const CONTENT: Record<string, any> = {
  zh: {
    title: 'YXLP - 优质服装出口平台',
    subtitle: '连接全球市场',
    description: '加入全球数千家经销商和零售商。获得优质服装，享受批发价格和可靠的全球运输服务。',
    cta: '开始批发',
    ctaSecondary: '查看目录',
    news: '最新资讯',
    products: '产品展示'
  },
  en: {
    title: 'YXLP - Premium Clothing Export Platform',
    subtitle: 'Connect with Global Markets',
    description: 'Join thousands of distributors and retailers worldwide. Access premium quality clothing with competitive wholesale prices and reliable global shipping.',
    cta: 'Start Wholesale',
    ctaSecondary: 'View Catalog',
    news: 'Latest News',
    products: 'Products'
  },
  ja: {
    title: 'YXLP - プレミアム衣料品輸出プラットフォーム',
    subtitle: 'グローバル市場との接続',
    description: '世界中の数千の販売業者や小売業者に参加してください。競争力のある卸売価格と信頼できる世界配送でプレミアム品質の衣料品にアクセスできます。',
    cta: '卸売を開始',
    ctaSecondary: 'カタログを見る',
    news: '最新ニュース',
    products: '製品'
  },
  ko: {
    title: 'YXLP - 프리미엄 의류 수출 플랫폼',
    subtitle: '글로벌 시장과 연결',
    description: '전 세계 수천 명의 유통업체와 소매업체에 합류하세요. 경쟁력 있는 도매 가격과 신뢰할 수 있는 글로벌 배송으로 프리미엄 품질의 의류에 액세스하세요.',
    cta: '도매 시작',
    ctaSecondary: '카탈로그 보기',
    news: '최신 뉴스',
    products: '제품'
  },
  es: {
    title: 'YXLP - Plataforma Premium de Exportación de Ropa',
    subtitle: 'Conecta con Mercados Globales',
    description: 'Únete a miles de distribuidores y minoristas en todo el mundo. Accede a ropa de calidad premium con precios mayoristas competitivos y envío global confiable.',
    cta: 'Comenzar Mayoreo',
    ctaSecondary: 'Ver Catálogo',
    news: 'Últimas Noticias',
    products: 'Productos'
  },
  fr: {
    title: 'YXLP - Plateforme Premium d\'Exportation de Vêtements',
    subtitle: 'Connectez-vous aux Marchés Mondiaux',
    description: 'Rejoignez des milliers de distributeurs et détaillants dans le monde entier. Accédez à des vêtements de qualité premium avec des prix de gros compétitifs et une expédition mondiale fiable.',
    cta: 'Commencer le Gros',
    ctaSecondary: 'Voir le Catalogue',
    news: 'Dernières Nouvelles',
    products: 'Produits'
  },
  de: {
    title: 'YXLP - Premium Bekleidungs-Export-Plattform',
    subtitle: 'Verbindung zu Globalen Märkten',
    description: 'Schließen Sie sich Tausenden von Distributoren und Einzelhändlern weltweit an. Zugang zu Premium-Qualitätskleidung mit wettbewerbsfähigen Großhandelspreisen und zuverlässigem globalem Versand.',
    cta: 'Großhandel Starten',
    ctaSecondary: 'Katalog Ansehen',
    news: 'Neueste Nachrichten',
    products: 'Produkte'
  },
  it: {
    title: 'YXLP - Piattaforma Premium di Esportazione Abbigliamento',
    subtitle: 'Connettiti ai Mercati Globali',
    description: 'Unisciti a migliaia di distributori e rivenditori in tutto il mondo. Accedi a abbigliamento di qualità premium con prezzi all\'ingrosso competitivi e spedizione globale affidabile.',
    cta: 'Inizia Ingrosso',
    ctaSecondary: 'Vedi Catalogo',
    news: 'Ultime Notizie',
    products: 'Prodotti'
  },
  pt: {
    title: 'YXLP - Plataforma Premium de Exportação de Roupas',
    subtitle: 'Conecte-se aos Mercados Globais',
    description: 'Junte-se a milhares de distribuidores e varejistas em todo o mundo. Acesse roupas de qualidade premium com preços atacadistas competitivos e envio global confiável.',
    cta: 'Começar Atacado',
    ctaSecondary: 'Ver Catálogo',
    news: 'Últimas Notícias',
    products: 'Produtos'
  },
  ru: {
    title: 'YXLP - Премиум Платформа Экспорта Одежды',
    subtitle: 'Подключение к Глобальным Рынкам',
    description: 'Присоединяйтесь к тысячам дистрибьюторов и розничных торговцев по всему миру. Получите доступ к одежде премиум-качества с конкурентными оптовыми ценами и надежной глобальной доставкой.',
    cta: 'Начать Оптовую Торговлю',
    ctaSecondary: 'Посмотреть Каталог',
    news: 'Последние Новости',
    products: 'Продукты'
  }
}

export default function HomePage({ locale }: HomePageProps) {
  const [mounted, setMounted] = useState(false)
  const content = CONTENT[locale] || CONTENT.en

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
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
            
            <nav className="hidden md:flex space-x-8">
              <Link href={`/${locale}/products`} className="text-gray-700 hover:text-blue-600">
                {content.products}
              </Link>
              <Link href={`/${locale}/news`} className="text-gray-700 hover:text-blue-600">
                {content.news}
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              {content.subtitle}
            </p>
            <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
              {content.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/products`}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                {content.cta}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                {content.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {content.news}
            </h2>
          </div>
          
          <div className="text-center">
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {content.news}
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">YXLP</div>
            <p className="text-gray-400 mb-4">
              {content.description}
            </p>
            <div className="text-sm text-gray-500">
              © 2024 YXLP Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
