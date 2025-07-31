import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Poppins } from 'next/font/google'
import '../globals.css'
import AuthProvider from '@/components/auth/AuthProvider'
import '@/lib/init' // 初始化应用
import '@/lib/suppressWarnings' // 抑制开发环境警告

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

interface LocaleLayoutProps {
  children: React.ReactNode
  params: {
    locale: string
  }
}

// 支持的语言列表
const supportedLocales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru']

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = params

  // 语言特定的元数据
  const metadataByLocale: Record<string, Metadata> = {
    zh: {
      title: 'YXLP - 优质服装品牌',
      description: '专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务',
    },
    en: {
      title: 'YXLP - Quality Fashion Brand',
      description: 'Years of focus in the fashion industry, providing customers with the highest quality clothing products and professional fashion styling services',
    },
    ja: {
      title: 'YXLP - 高品質ファッションブランド',
      description: 'ファッション業界に長年注力し、お客様に最高品質の衣料品と専門的なファッションスタイリングサービスを提供',
    },
    ko: {
      title: 'YXLP - 고품질 패션 브랜드',
      description: '패션 업계에 수년간 집중하여 고객에게 최고 품질의 의류 제품과 전문적인 패션 스타일링 서비스를 제공',
    },
    es: {
      title: 'YXLP - Marca de Moda de Calidad',
      description: 'Años de enfoque en la industria de la moda, brindando a los clientes productos de vestimenta de la más alta calidad y servicios profesionales de estilismo de moda',
    },
    fr: {
      title: 'YXLP - Marque de Mode de Qualité',
      description: 'Des années de concentration dans l\'industrie de la mode, fournissant aux clients des produits vestimentaires de la plus haute qualité et des services de stylisme de mode professionnels',
    },
    de: {
      title: 'YXLP - Qualitäts-Modemarke',
      description: 'Jahrelange Fokussierung auf die Modebranche, Bereitstellung von Bekleidungsprodukten höchster Qualität und professionellen Mode-Styling-Services für Kunden',
    },
    it: {
      title: 'YXLP - Marchio di Moda di Qualità',
      description: 'Anni di focus nell\'industria della moda, fornendo ai clienti prodotti di abbigliamento della più alta qualità e servizi professionali di styling di moda',
    },
    pt: {
      title: 'YXLP - Marca de Moda de Qualidade',
      description: 'Anos de foco na indústria da moda, fornecendo aos clientes produtos de vestuário da mais alta qualidade e serviços profissionais de styling de moda',
    },
    ru: {
      title: 'YXLP - Качественный Модный Бренд',
      description: 'Годы сосредоточения на индустрии моды, предоставление клиентам одежды высочайшего качества и профессиональных услуг модного стайлинга',
    },
  }

  return metadataByLocale[locale] || metadataByLocale['en']
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params

  // 验证语言是否支持
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col" data-locale={locale}>
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

// 生成静态参数
export async function generateStaticParams() {
  return supportedLocales.map((locale) => ({
    locale,
  }))
}
