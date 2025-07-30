'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useTranslation()
  const { t } = useTranslation()

  const heroSlides = [
    {
      title: "引领未来商业创新",
      subtitle: "YXLP - 您的数字化转型伙伴",
      description: "专注于为企业提供全方位的数字化解决方案，助力企业在数字时代实现跨越式发展",
      image: "/api/placeholder/1200/600",
      cta: "了解更多"
    },
    {
      title: "优质产品，卓越服务",
      subtitle: "品质保证，信赖之选",
      description: "严格的质量控制体系，完善的售后服务网络，为客户提供最优质的产品和服务体验",
      image: "/api/placeholder/1200/600",
      cta: "查看产品"
    },
    {
      title: "全球合作，共创未来",
      subtitle: "携手共进，合作共赢",
      description: "与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标",
      image: "/api/placeholder/1200/600",
      cta: "成为合伙人"
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="font-heading font-bold text-2xl text-gray-900">YXLP</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-blue-600 font-medium">首页</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">产品中心</Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">产品分类</Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900 transition-colors">新闻资讯</Link>
              <Link href="/distributors" className="text-gray-600 hover:text-gray-900 transition-colors">合作伙伴</Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">关于我们</Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">联系我们</Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showFlag={true} showNativeName={false} />
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">登录</Link>
              <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 z-10"></div>
        <div className="absolute inset-0 bg-black/20 z-20"></div>

        {/* 背景轮播 */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>
            </div>
          ))}
        </div>

        <div className="relative z-30 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-medium text-blue-100">
            {heroSlides[currentSlide].subtitle}
          </p>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            {heroSlides[currentSlide].description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              {heroSlides[currentSlide].cta}
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center">
              <PlayIcon className="mr-2 h-5 w-5" />
              观看视频
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">为什么选择YXLP服装</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '👗',
                title: '品质面料',
                description: '精选优质面料，严格质检，确保每件服装舒适耐穿'
              },
              {
                icon: '✂️',
                title: '精工制作',
                description: '专业裁剪工艺，精细缝制，打造完美版型'
              },
              {
                icon: '🌟',
                title: '时尚设计',
                description: '紧跟国际潮流，原创设计，让您引领时尚'
              },
              {
                icon: '🚚',
                title: '快速配送',
                description: '全国仓储网络，48小时快速配送，购物无忧'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品展示 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">精选服装</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              汇聚全球优质服装品牌，为您提供时尚多样的选择
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: '时尚上衣外套',
                description: '经典设计，品质面料，职场休闲两相宜',
                image: '/api/placeholder/400/300',
                category: '上衣外套',
                price: '¥299起',
                brand: 'UNIQLO'
              },
              {
                name: '精品裤装裙装',
                description: '修身剪裁，舒适面料，展现完美身材',
                image: '/api/placeholder/400/300',
                category: '裤装裙装',
                price: '¥459起',
                brand: 'Levi\'s'
              },
              {
                name: '潮流鞋靴',
                description: '时尚设计，舒适体验，每一步都自信',
                image: '/api/placeholder/400/300',
                category: '鞋靴',
                price: '¥699起',
                brand: 'Nike'
              }
            ].map((product, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">产品图片</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-sm bg-blue-600 px-2 py-1 rounded">{product.category}</span>
                    </div>
                    <div className="absolute top-4 right-4 text-white">
                      <span className="text-sm bg-black/50 px-2 py-1 rounded">{product.brand}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">{product.price}</span>
                  </div>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              查看全部产品
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '50,000+', label: '服装销量' },
              { number: '15,000+', label: '满意客户' },
              { number: '200+', label: '品牌合作' },
              { number: '99.8%', label: '好评率' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 客户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">客户评价</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              听听我们的客户怎么说
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: '张总',
                company: '科技有限公司',
                content: 'YXLP提供的产品质量非常好，服务也很专业。我们已经合作了3年，非常满意。',
                avatar: '👨‍💼'
              },
              {
                name: '李经理',
                company: '贸易集团',
                content: '产品种类丰富，价格合理，物流快速。是我们长期信赖的合作伙伴。',
                avatar: '👩‍💼'
              },
              {
                name: '王总监',
                company: '制造企业',
                content: '专业的团队，优质的服务，帮助我们解决了很多采购难题。强烈推荐！',
                avatar: '👨‍💻'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">关于YXLP</h2>
              <p className="text-lg text-gray-600 mb-6">
                YXLP成立于2020年，是一家专注于优质产品销售和分销的现代化企业。我们致力于为客户提供最优质的产品和最专业的服务。
              </p>
              <p className="text-lg text-gray-600 mb-6">
                经过几年的发展，我们已经建立了完善的供应链体系和销售网络，与众多知名品牌建立了长期稳定的合作关系。
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">我们的使命</h4>
                  <p className="text-gray-600">为客户创造价值，为社会贡献力量</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">我们的愿景</h4>
                  <p className="text-gray-600">成为行业领先的综合性服务平台</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">公司图片</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">联系我们</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              有任何问题或合作意向，欢迎随时联系我们
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '📍',
                title: '公司地址',
                content: '北京市朝阳区建国路88号'
              },
              {
                icon: '📞',
                title: '联系电话',
                content: '+86 400-123-4567'
              },
              {
                icon: '✉️',
                title: '邮箱地址',
                content: 'contact@yxlp.com'
              },
              {
                icon: '🕒',
                title: '工作时间',
                content: '周一至周五 9:00-18:00'
              }
            ].map((contact, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{contact.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{contact.title}</h3>
                <p className="text-gray-300">{contact.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">发送消息</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="您的姓名"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="您的邮箱"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="主题"
                className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                rows={4}
                placeholder="您的消息"
                className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <button
                type="submit"
                className="md:col-span-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                发送消息
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Y</span>
                </div>
                <span className="font-heading font-bold text-2xl">YXLP</span>
              </div>
              <p className="text-gray-400 mb-4">
                专业的产品销售和分销平台，为客户提供优质的产品和服务。
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">微信</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">微博</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">抖音</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">产品服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">产品中心</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">产品分类</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">定制服务</a></li>
                <li><a href="#" className="hover:text-white transition-colors">批发采购</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">合作伙伴</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/distributors" className="hover:text-white transition-colors">成为分销商</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">供应商入驻</a></li>
                <li><a href="#" className="hover:text-white transition-colors">代理加盟</a></li>
                <li><a href="#" className="hover:text-white transition-colors">战略合作</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">帮助支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">售后服务</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 YXLP. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
