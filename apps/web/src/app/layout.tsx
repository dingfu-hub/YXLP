import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
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

export const metadata: Metadata = {
  title: 'YXLP - Premium Clothing Export Platform',
  description: 'Leading B2B and B2C platform for premium clothing exports. Connect with global distributors and customers worldwide.',
  keywords: 'clothing export, fashion wholesale, B2B clothing, premium apparel, global fashion trade',
  authors: [{ name: 'YXLP Team' }],
  creator: 'YXLP Platform',
  publisher: 'YXLP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yxlp.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'zh-CN': '/zh',
      'es-ES': '/es',
      'fr-FR': '/fr',
      'de-DE': '/de',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'YXLP - Premium Clothing Export Platform',
    description: 'Leading B2B and B2C platform for premium clothing exports. Connect with global distributors and customers worldwide.',
    siteName: 'YXLP',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'YXLP Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YXLP - Premium Clothing Export Platform',
    description: 'Leading B2B and B2C platform for premium clothing exports.',
    images: ['/og-image.jpg'],
    creator: '@yxlp_platform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
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
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
