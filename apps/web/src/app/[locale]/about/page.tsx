'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

interface AboutPageProps {
  params: {
    locale: string
  }
}

export default function AboutPage({ params }: AboutPageProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about.title', { defaultValue: '关于YXLP' })}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle', { defaultValue: '专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务' })}
          </p>
        </div>

        {/* 公司介绍 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.company.title', { defaultValue: '公司简介' })}
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                {t('about.company.desc1', { defaultValue: 'YXLP成立于2010年，是一家专注于服装设计、生产和销售的现代化企业。我们致力于为全球客户提供高品质的服装产品和专业的时尚解决方案。' })}
              </p>
              <p>
                {t('about.company.desc2', { defaultValue: '经过十多年的发展，我们已经建立了完善的供应链体系和质量管理系统，产品远销欧美、亚太等多个国家和地区，深受客户信赖。' })}
              </p>
              <p>
                {t('about.company.desc3', { defaultValue: '我们坚持"品质第一、客户至上"的经营理念，不断创新设计，优化生产工艺，为客户创造更大价值。' })}
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
              alt={t('about.company.imageAlt', { defaultValue: '公司办公环境' })}
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* 核心价值 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.values.title', { defaultValue: '核心价值' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('about.values.quality.title', { defaultValue: '品质至上' })}
              </h3>
              <p className="text-gray-600">
                {t('about.values.quality.desc', { defaultValue: '严格的质量控制体系，确保每一件产品都达到最高标准' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('about.values.innovation.title', { defaultValue: '持续创新' })}
              </h3>
              <p className="text-gray-600">
                {t('about.values.innovation.desc', { defaultValue: '紧跟时尚潮流，不断推出创新设计和优质产品' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('about.values.service.title', { defaultValue: '客户至上' })}
              </h3>
              <p className="text-gray-600">
                {t('about.values.service.desc', { defaultValue: '以客户需求为导向，提供专业贴心的服务体验' })}
              </p>
            </div>
          </div>
        </div>

        {/* 团队介绍 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.team.title', { defaultValue: '核心团队' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                alt="CEO"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {t('about.team.ceo.name', { defaultValue: '张明' })}
              </h3>
              <p className="text-blue-600 mb-2">
                {t('about.team.ceo.title', { defaultValue: '首席执行官' })}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.team.ceo.desc', { defaultValue: '拥有20年服装行业经验，致力于推动公司创新发展' })}
              </p>
            </div>
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
                alt="CTO"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {t('about.team.cto.name', { defaultValue: '李华' })}
              </h3>
              <p className="text-blue-600 mb-2">
                {t('about.team.cto.title', { defaultValue: '首席技术官' })}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.team.cto.desc', { defaultValue: '专注于数字化转型和技术创新，推动智能制造' })}
              </p>
            </div>
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face"
                alt="CMO"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {t('about.team.cmo.name', { defaultValue: '王芳' })}
              </h3>
              <p className="text-blue-600 mb-2">
                {t('about.team.cmo.title', { defaultValue: '首席营销官' })}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.team.cmo.desc', { defaultValue: '负责品牌建设和市场拓展，打造国际化品牌形象' })}
              </p>
            </div>
          </div>
        </div>

        {/* 发展历程 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.history.title', { defaultValue: '发展历程' })}
          </h2>
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="w-24 text-right mr-8">
                <span className="text-2xl font-bold text-blue-600">2010</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('about.history.2010.title', { defaultValue: '公司成立' })}
                </h3>
                <p className="text-gray-600">
                  {t('about.history.2010.desc', { defaultValue: 'YXLP正式成立，开始专注于服装设计和生产' })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-right mr-8">
                <span className="text-2xl font-bold text-blue-600">2015</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('about.history.2015.title', { defaultValue: '国际化发展' })}
                </h3>
                <p className="text-gray-600">
                  {t('about.history.2015.desc', { defaultValue: '产品开始出口海外，建立国际销售网络' })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-right mr-8">
                <span className="text-2xl font-bold text-blue-600">2020</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('about.history.2020.title', { defaultValue: '数字化转型' })}
                </h3>
                <p className="text-gray-600">
                  {t('about.history.2020.desc', { defaultValue: '启动数字化转型，建立智能制造体系' })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-right mr-8">
                <span className="text-2xl font-bold text-blue-600">2024</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('about.history.2024.title', { defaultValue: '持续创新' })}
                </h3>
                <p className="text-gray-600">
                  {t('about.history.2024.desc', { defaultValue: '继续深化创新发展，打造行业领先品牌' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 联系我们 */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('about.contact.title', { defaultValue: '了解更多' })}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('about.contact.desc', { defaultValue: '想要了解更多关于YXLP的信息？欢迎联系我们' })}
          </p>
          <Link
            href={`/${params.locale}/contact`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('about.contact.button', { defaultValue: '联系我们' })}
          </Link>
        </div>
      </div>
    </div>
  )
}
