'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

interface ContactPageProps {
  params: {
    locale: string
  }
}

export default function ContactPage({ params }: ContactPageProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里可以添加表单提交逻辑
    alert(t('contact.form.success', { defaultValue: '感谢您的留言，我们会尽快回复！' }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title', { defaultValue: '联系我们' })}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle', { defaultValue: '有任何问题或合作意向，欢迎随时联系我们' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 联系信息 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contact.info.title', { defaultValue: '联系信息' })}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">📍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('contact.info.address.title', { defaultValue: '公司地址' })}
                  </h3>
                  <p className="text-gray-600">
                    {t('contact.info.address.value', { defaultValue: '中国上海市浦东新区张江高科技园区' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">📞</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('contact.info.phone.title', { defaultValue: '联系电话' })}
                  </h3>
                  <p className="text-gray-600">+86 21 1234 5678</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">✉️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('contact.info.email.title', { defaultValue: '邮箱地址' })}
                  </h3>
                  <p className="text-gray-600">info@yxlp.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">🕒</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('contact.info.hours.title', { defaultValue: '工作时间' })}
                  </h3>
                  <p className="text-gray-600">
                    {t('contact.info.hours.value', { defaultValue: '周一至周五 9:00-18:00' })}
                  </p>
                </div>
              </div>
            </div>

            {/* 社交媒体 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('contact.social.title', { defaultValue: '关注我们' })}
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                  <span>📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500">
                  <span>🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700">
                  <span>📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800">
                  <span>💼</span>
                </a>
              </div>
            </div>
          </div>

          {/* 联系表单 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contact.form.title', { defaultValue: '发送消息' })}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.name', { defaultValue: '姓名' })} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('contact.form.namePlaceholder', { defaultValue: '请输入您的姓名' })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email', { defaultValue: '邮箱' })} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('contact.form.emailPlaceholder', { defaultValue: '请输入您的邮箱' })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.company', { defaultValue: '公司名称' })}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('contact.form.companyPlaceholder', { defaultValue: '请输入公司名称' })}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.phone', { defaultValue: '联系电话' })}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('contact.form.phonePlaceholder', { defaultValue: '请输入联系电话' })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.subject', { defaultValue: '主题' })} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('contact.form.subjectPlaceholder', { defaultValue: '请选择主题' })}</option>
                  <option value="general">{t('contact.form.subjects.general', { defaultValue: '一般咨询' })}</option>
                  <option value="partnership">{t('contact.form.subjects.partnership', { defaultValue: '合作洽谈' })}</option>
                  <option value="support">{t('contact.form.subjects.support', { defaultValue: '技术支持' })}</option>
                  <option value="complaint">{t('contact.form.subjects.complaint', { defaultValue: '投诉建议' })}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message', { defaultValue: '留言内容' })} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('contact.form.messagePlaceholder', { defaultValue: '请详细描述您的问题或需求...' })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {t('contact.form.submit', { defaultValue: '发送消息' })}
              </button>
            </form>
          </div>
        </div>

        {/* 地图区域 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('contact.map.title', { defaultValue: '找到我们' })}
          </h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">
              {t('contact.map.placeholder', { defaultValue: '地图加载中...' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
