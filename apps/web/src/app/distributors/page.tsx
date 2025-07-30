'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DistributorsPage() {
  const [activeTab, setActiveTab] = useState('benefits')

  const benefits = [
    {
      icon: '💰',
      title: '丰厚佣金',
      description: '高达30%的销售佣金，多劳多得'
    },
    {
      icon: '📈',
      title: '销售支持',
      description: '专业的销售培训和营销材料支持'
    },
    {
      icon: '🎯',
      title: '精准客户',
      description: '平台提供精准客户匹配和推荐'
    },
    {
      icon: '🏆',
      title: '等级奖励',
      description: '多层级奖励体系，业绩越好奖励越多'
    },
    {
      icon: '📱',
      title: '移动办公',
      description: '随时随地管理订单和客户'
    },
    {
      icon: '🤝',
      title: '团队建设',
      description: '发展下级分销商，获得团队收益'
    }
  ]

  const requirements = [
    '年满18周岁，具有完全民事行为能力',
    '有一定的销售经验或社交网络资源',
    '认同YXLP品牌理念和价值观',
    '具备基本的网络操作能力',
    '有时间投入分销业务'
  ]

  const steps = [
    {
      step: '01',
      title: '提交申请',
      description: '填写分销商申请表，提交相关资料'
    },
    {
      step: '02',
      title: '资格审核',
      description: '平台审核申请资料，通常1-3个工作日'
    },
    {
      step: '03',
      title: '签署协议',
      description: '通过审核后签署分销商合作协议'
    },
    {
      step: '04',
      title: '培训上岗',
      description: '参加产品培训，获得销售资格'
    },
    {
      step: '05',
      title: '开始销售',
      description: '获得专属推广链接，开始赚取佣金'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">YXLP</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">产品中心</Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900">产品分类</Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900">新闻资讯</Link>
              <Link href="/distributors" className="text-blue-600 font-medium">合作伙伴</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">登录</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">注册</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">成为YXLP分销商</h1>
          <p className="text-xl mb-8">开启您的创业之路，实现财富自由</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            立即申请
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标签导航 */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'benefits'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              分销优势
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'requirements'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              申请条件
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'process'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              申请流程
            </button>
          </div>
        </div>

        {/* 分销优势 */}
        {activeTab === 'benefits' && (
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">为什么选择YXLP分销</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 申请条件 */}
        {activeTab === 'requirements' && (
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">分销商申请条件</h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <ul className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>注意：</strong>我们欢迎有志于销售的朋友加入，无论您是全职还是兼职，都可以申请成为我们的分销商。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 申请流程 */}
        {activeTab === 'process' && (
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">申请流程</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center mb-8 last:mb-0">
                    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-6">
                      {step.step}
                    </div>
                    <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute left-6 mt-12 w-0.5 h-8 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA 区域 */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-lg mb-6">加入YXLP分销商大家庭，开启您的创业之路</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              立即申请
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
