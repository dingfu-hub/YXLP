'use client'

import React from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import Link from 'next/link'

export default function NewsDemoPage() {
  const { user } = useAdmin()

  const features = [
    {
      title: '智能新闻采集',
      description: '支持RSS订阅、网页爬虫、API接口等多种采集方式，自动获取最新新闻内容',
      href: '/admin/news/collect',
      icon: '📡',
      features: [
        '多源采集：RSS、网页爬虫、API',
        '智能去重和内容提取',
        '自定义采集规则配置',
        '实时任务监控和进度跟踪',
        '批量采集和定时任务'
      ]
    },
    {
      title: 'AI智能润色',
      description: '使用先进的AI技术对新闻内容进行智能润色，提升文章质量和可读性',
      href: '/admin/news/polish',
      icon: '✨',
      features: [
        '标题优化：更吸引人的标题',
        '内容润色：提高可读性和流畅度',
        '自动摘要：生成精准摘要',
        '关键词提取：SEO优化',
        '批量处理：高效处理大量文章'
      ]
    },
    {
      title: '发布工作流',
      description: '完整的新闻发布流程，支持多平台同步发布和定时发布功能',
      href: '/admin/news/publish',
      icon: '📢',
      features: [
        '多平台发布：官网、微信、微博等',
        '定时发布：预约发布时间',
        'SEO优化：自动生成元数据',
        '社交媒体文案：自动生成推广文案',
        '订阅者通知：自动推送给订阅用户'
      ]
    },
    {
      title: '新闻管理',
      description: '完整的新闻内容管理系统，支持分类、标签、状态管理等功能',
      href: '/admin/news',
      icon: '📰',
      features: [
        '分类管理：科技、商业、体育等',
        '状态管理：草稿、已发布、已归档',
        '搜索筛选：快速找到目标文章',
        '批量操作：提高管理效率',
        '统计分析：阅读量、分享数据'
      ]
    }
  ]

  const workflow = [
    {
      step: 1,
      title: '配置新闻源',
      description: '添加RSS订阅、配置网页爬虫规则或API接口',
      icon: '⚙️'
    },
    {
      step: 2,
      title: '自动采集',
      description: '系统自动从配置的新闻源采集最新内容',
      icon: '🔄'
    },
    {
      step: 3,
      title: 'AI润色',
      description: '使用AI技术优化标题、润色内容、生成摘要',
      icon: '🤖'
    },
    {
      step: 4,
      title: '审核编辑',
      description: '人工审核AI处理结果，进行必要的编辑调整',
      icon: '👁️'
    },
    {
      step: 5,
      title: '发布推广',
      description: '选择发布平台，设置发布时间，自动推送给用户',
      icon: '🚀'
    }
  ]

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            智能新闻管理系统
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            集新闻采集、AI润色、智能发布于一体的现代化新闻管理平台，
            让新闻内容创作和发布变得更加高效和智能。
          </p>
        </div>

        {/* 功能特性 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2 mb-6">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={feature.href}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                立即体验
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* 工作流程 */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            智能新闻处理流程
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-4">
            {workflow.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-xs">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-2">
                  步骤 {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute transform translate-x-32">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 技术优势 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            技术优势
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🚀
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">高效自动化</h3>
              <p className="text-gray-600">
                全自动化的新闻采集和处理流程，大幅提升工作效率，减少人工操作。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🧠
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI智能处理</h3>
              <p className="text-gray-600">
                采用最新的AI技术进行内容优化，提升文章质量和用户体验。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🔗
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">多平台集成</h3>
              <p className="text-gray-600">
                支持多个发布平台，一键同步发布，扩大内容传播范围。
              </p>
            </div>
          </div>
        </div>

        {/* 快速开始 */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            立即开始使用
          </h2>
          <p className="text-gray-600 mb-6">
            选择一个功能模块开始体验我们的智能新闻管理系统
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/news/collect"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              开始采集新闻
            </Link>
            <Link
              href="/admin/news/polish"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              AI润色体验
            </Link>
            <Link
              href="/admin/news/publish"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              发布管理
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
