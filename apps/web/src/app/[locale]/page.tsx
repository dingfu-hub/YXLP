'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { ProductImage, PlaceholderImage } from '@/components/ui/ImageWithFallback'

interface HomePageProps {
  params: {
    locale: string
  }
}

export default function HomePage({ params }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useTranslation()

  const heroSlides = [
    {
      title: t('hero.slide1.title', { defaultValue: "优质产品，卓越服务" }),
      subtitle: t('hero.slide1.subtitle', { defaultValue: "品质保证，信赖之选" }),
      description: t('hero.slide1.description', { defaultValue: "严格的质量控制体系，完善的售后服务网络，为客户提供最优质的产品和服务体验" }),
      image: "/api/placeholder/1200/600",
      cta: t('hero.slide1.cta', { defaultValue: "查看产品" })
    },
    {
      title: t('hero.slide2.title', { defaultValue: "引领未来商业创新" }),
      subtitle: t('hero.slide2.subtitle', { defaultValue: "YXLP - 您的数字化转型伙伴" }),
      description: t('hero.slide2.description', { defaultValue: "专注于为企业提供全方位的数字化解决方案，助力企业在数字时代实现跨越式发展" }),
      image: "/api/placeholder/1200/600",
      cta: t('hero.slide2.cta', { defaultValue: "了解更多" })
    },
    {
      title: t('hero.slide3.title', { defaultValue: "全球合作，共创未来" }),
      subtitle: t('hero.slide3.subtitle', { defaultValue: "携手共进，合作共赢" }),
      description: t('hero.slide3.description', { defaultValue: "与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标" }),
      image: "/api/placeholder/1200/600",
      cta: t('hero.slide3.cta', { defaultValue: "成为合伙人" })
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${params.locale}`} className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="font-heading font-bold text-2xl text-gray-900">YXLP</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/${params.locale}`} className="text-blue-600 font-medium">{t('nav.home', { defaultValue: "首页" })}</Link>
              <Link href={`/${params.locale}/products`} className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.products', { defaultValue: "产品中心" })}</Link>
              <Link href={`/${params.locale}/categories`} className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.categories', { defaultValue: "产品分类" })}</Link>
              <Link href={`/${params.locale}/news`} className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.news', { defaultValue: "新闻资讯" })}</Link>
              <Link href={`/${params.locale}/distributors`} className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.partners', { defaultValue: "合作伙伴" })}</Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.about', { defaultValue: "关于我们" })}</Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.contact', { defaultValue: "联系我们" })}</Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
              <Link href={`/${params.locale}/login`} className="text-gray-600 hover:text-gray-900 transition-colors">{t('nav.login', { defaultValue: "登录" })}</Link>
              <Link href={`/${params.locale}/register`} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {t('nav.register', { defaultValue: "免费注册" })}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <PlaceholderImage
              src={slide.image}
              alt={slide.title}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60" />
          </div>
        ))}

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 opacity-90">
            {heroSlides[currentSlide].subtitle}
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {heroSlides[currentSlide].description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${params.locale}/products`}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              {heroSlides[currentSlide].cta}
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center">
              <PlayIcon className="mr-2 h-5 w-5" />
              {t('hero.watchVideo', { defaultValue: "观看视频" })}
            </button>
          </div>
        </div>

        {/* 轮播指示器 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 核心优势 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('advantages.title', { defaultValue: "为什么选择YXLP服装" })}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('advantages.subtitle', { defaultValue: "专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务" })}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
