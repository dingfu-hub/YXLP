'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

interface PartnersPageProps {
  params: {
    locale: string
  }
}

export default function PartnersPage({ params }: PartnersPageProps) {
  const { t } = useTranslation()

  const partners = [
    {
      id: 1,
      name: 'Fashion Group International',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
      description: t('partners.fashion.desc', { defaultValue: '全球领先的时尚零售集团，在欧美拥有超过500家门店' }),
      category: 'retail'
    },
    {
      id: 2,
      name: 'Global Textile Solutions',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop',
      description: t('partners.textile.desc', { defaultValue: '专业的纺织品供应商，为我们提供优质的原材料' }),
      category: 'supplier'
    },
    {
      id: 3,
      name: 'E-Commerce Platform Ltd',
      logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=100&fit=crop',
      description: t('partners.ecommerce.desc', { defaultValue: '领先的电商平台，帮助我们拓展在线销售渠道' }),
      category: 'technology'
    },
    {
      id: 4,
      name: 'Logistics Express Co.',
      logo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=100&fit=crop',
      description: t('partners.logistics.desc', { defaultValue: '专业的物流服务提供商，确保产品快速安全送达' }),
      category: 'logistics'
    },
    {
      id: 5,
      name: 'Design Studio International',
      logo: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&h=100&fit=crop',
      description: t('partners.design.desc', { defaultValue: '创意设计工作室，为我们提供前沿的设计理念' }),
      category: 'design'
    },
    {
      id: 6,
      name: 'Quality Assurance Corp',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=100&fit=crop',
      description: t('partners.quality.desc', { defaultValue: '专业的质量检测机构，确保产品质量达到国际标准' }),
      category: 'quality'
    }
  ]

  const partnerCategories = [
    { id: 'all', name: t('partners.categories.all', { defaultValue: '全部合作伙伴' }) },
    { id: 'retail', name: t('partners.categories.retail', { defaultValue: '零售商' }) },
    { id: 'supplier', name: t('partners.categories.supplier', { defaultValue: '供应商' }) },
    { id: 'technology', name: t('partners.categories.technology', { defaultValue: '技术伙伴' }) },
    { id: 'logistics', name: t('partners.categories.logistics', { defaultValue: '物流伙伴' }) },
    { id: 'design', name: t('partners.categories.design', { defaultValue: '设计伙伴' }) },
    { id: 'quality', name: t('partners.categories.quality', { defaultValue: '质检伙伴' }) }
  ]

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('partners.title', { defaultValue: '合作伙伴' })}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('partners.subtitle', { defaultValue: '与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标' })}
          </p>
        </div>

        {/* 合作优势 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('partners.advantages.title', { defaultValue: '合作优势' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('partners.advantages.global.title', { defaultValue: '全球网络' })}
              </h3>
              <p className="text-gray-600">
                {t('partners.advantages.global.desc', { defaultValue: '覆盖全球主要市场的销售和服务网络' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('partners.advantages.support.title', { defaultValue: '全方位支持' })}
              </h3>
              <p className="text-gray-600">
                {t('partners.advantages.support.desc', { defaultValue: '提供技术、营销、培训等全方位支持' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('partners.advantages.growth.title', { defaultValue: '共同成长' })}
              </h3>
              <p className="text-gray-600">
                {t('partners.advantages.growth.desc', { defaultValue: '与合作伙伴共享成功，实现互利共赢' })}
              </p>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {partnerCategories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-600 hover:bg-gray-100"
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 合作伙伴列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-center h-24 mb-4">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={200}
                    height={100}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {partner.name}
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  {partner.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 成为合作伙伴 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">
            {t('partners.join.title', { defaultValue: '成为我们的合作伙伴' })}
          </h2>
          <p className="text-xl mb-6 opacity-90">
            {t('partners.join.subtitle', { defaultValue: '加入YXLP合作伙伴网络，共同开拓无限商机' })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('partners.join.benefits.market.title', { defaultValue: '市场拓展' })}
              </h3>
              <p className="opacity-90">
                {t('partners.join.benefits.market.desc', { defaultValue: '获得新市场准入机会' })}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('partners.join.benefits.resources.title', { defaultValue: '资源共享' })}
              </h3>
              <p className="opacity-90">
                {t('partners.join.benefits.resources.desc', { defaultValue: '共享技术和市场资源' })}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('partners.join.benefits.profit.title', { defaultValue: '利润增长' })}
              </h3>
              <p className="opacity-90">
                {t('partners.join.benefits.profit.desc', { defaultValue: '实现可持续的利润增长' })}
              </p>
            </div>
          </div>
          <Link
            href={`/${params.locale}/contact`}
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            {t('partners.join.button', { defaultValue: '立即申请' })}
          </Link>
        </div>

        {/* 合作流程 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('partners.process.title', { defaultValue: '合作流程' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('partners.process.step1.title', { defaultValue: '提交申请' })}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('partners.process.step1.desc', { defaultValue: '填写合作申请表，提交相关资料' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('partners.process.step2.title', { defaultValue: '资质审核' })}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('partners.process.step2.desc', { defaultValue: '我们将对您的资质进行全面评估' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('partners.process.step3.title', { defaultValue: '洽谈合作' })}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('partners.process.step3.desc', { defaultValue: '深入沟通合作模式和具体条款' })}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('partners.process.step4.title', { defaultValue: '签署协议' })}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('partners.process.step4.desc', { defaultValue: '正式签署合作协议，开始合作' })}
              </p>
            </div>
          </div>
        </div>

        {/* 联系我们 */}
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('partners.contact.title', { defaultValue: '开启合作之旅' })}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('partners.contact.desc', { defaultValue: '想了解更多合作机会？立即联系我们的合作团队' })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${params.locale}/contact`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('partners.contact.button', { defaultValue: '联系我们' })}
            </Link>
            <a
              href="mailto:partners@yxlp.com"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {t('partners.contact.email', { defaultValue: '发送邮件' })}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
