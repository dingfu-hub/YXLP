'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface TranslationData {
  [namespace: string]: {
    [key: string]: string
  }
}

interface UseTranslationOptions {
  namespace?: string
  fallbackLanguage?: string
  forceLanguage?: string // 强制使用指定语言
}

interface UseTranslationReturn {
  t: (key: string, params?: Record<string, any>) => string
  language: string
  setLanguage: (lang: string) => void
  isLoading: boolean
  error: string | null
  availableLanguages: Array<{
    code: string
    name: string
    nativeName: string
    isRtl: boolean
  }>
  formatCurrency: (amount: number, currency?: string) => string
  formatNumber: (number: number) => string
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
}

const STORAGE_KEY = 'yxlp_language'
const DEFAULT_LANGUAGE = 'zh'
const FALLBACK_LANGUAGE = 'zh'

// Cache for translations
const translationCache: Record<string, TranslationData> = {}

// Built-in translations
const BUILT_IN_TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = {
  zh: {
    common: {
      'nav.home': '首页',
      'nav.products': '产品中心',
      'nav.categories': '产品分类',
      'nav.news': '新闻资讯',
      'nav.partners': '合作伙伴',
      'nav.about': '关于我们',
      'nav.contact': '联系我们',
      'nav.login': '登录',
      'nav.register': '免费注册',
      'hero.slide1.title': '优质产品，卓越服务',
      'hero.slide1.subtitle': '品质保证，信赖之选',
      'hero.slide1.description': '严格的质量控制体系，完善的售后服务网络，为客户提供最优质的产品和服务体验',
      'hero.slide1.cta': '查看产品',
      'hero.slide2.title': '引领未来商业创新',
      'hero.slide2.subtitle': 'YXLP - 您的数字化转型伙伴',
      'hero.slide2.description': '专注于为企业提供全方位的数字化解决方案，助力企业在数字时代实现跨越式发展',
      'hero.slide2.cta': '了解更多',
      'hero.slide3.title': '全球合作，共创未来',
      'hero.slide3.subtitle': '携手共进，合作共赢',
      'hero.slide3.description': '与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标',
      'hero.slide3.cta': '成为合伙人',
      'hero.watchVideo': '观看视频',
      'advantages.title': '为什么选择YXLP服装',
      'advantages.subtitle': '专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务',
      'products.title': '精选服装',
      'products.subtitle': '汇聚全球优质服装品牌，为您提供时尚多样的选择',
      'products.view_all': '查看全部产品',
      'about.title': '关于YXLP',
      'contact.title': '联系我们',
      'contact.subtitle': '有任何问题或合作意向，欢迎随时联系我们',
      // Categories
      'categories.title': '产品分类',
      'categories.subtitle': '浏览我们的产品分类',
      'categories.all': '全部商品',
      'categories.underwear': '内衣',
      'categories.underwear.desc': '内衣内裤、贴身衣物等',
      'categories.sportswear': '运动服装',
      'categories.sportswear.desc': '运动服、健身服等',
      'categories.clothing': '服装',
      'categories.clothing.desc': '时尚服饰、运动装等',
      'categories.shoes': '鞋类',
      'categories.shoes.desc': '运动鞋、休闲鞋等',
      'categories.bags': '包类',
      'categories.bags.desc': '手提包、背包等',
      'categories.accessories': '配饰',
      'categories.accessories.desc': '时尚配饰、服装搭配等',
      'categories.viewProducts': '查看产品',
      // Products
      'products.categories': '商品分类',
      'products.searchPlaceholder': '搜索产品...',
      'products.sort.default': '默认排序',
      'products.sort.priceAsc': '价格从低到高',
      'products.sort.priceDesc': '价格从高到低',
      'products.sort.newest': '最新上架',
      'products.sort.popular': '最受欢迎',
      'products.casualShirt.name': '休闲衬衫',
      'products.elegantDress.name': '优雅连衣裙',
      'products.luxuryBag.name': '奢侈手提包',
      'products.addToCart': '加入购物车',
      // News
      'news.title': '新闻资讯',
      'news.subtitle': '了解最新的服装行业动态和产品资讯',
      'news.categories.title': '新闻分类',
      'news.categories.all': '全部',
      'news.categories.fashion': '时尚',
      'news.categories.textile': '纺织',
      'news.categories.apparel': '服装',
      'news.categories.manufacturing': '制造',
      'news.categories.export': '出口',
      'news.readMore': '阅读更多',
      'news.noArticles': '暂无新闻',
      // Partners
      'partners.title': '合作伙伴',
      'partners.subtitle': '与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标',
      'partners.fashion.name': '时尚集团国际',
      'partners.fashion.desc': '全球领先的时尚零售集团，在欧美拥有超过500家门店',
      'partners.textile.name': '全球纺织解决方案',
      'partners.textile.desc': '专业的纺织品供应商，为我们提供优质的原材料',
      'partners.ecommerce.name': '电商平台有限公司',
      'partners.ecommerce.desc': '领先的电商平台，帮助我们拓展在线销售渠道',
      'partners.join.title': '成为我们的合作伙伴',
      'partners.join.subtitle': '加入YXLP合作伙伴网络，共同开拓无限商机',
      'partners.join.button': '立即申请',
      // Common
      'common.loading': '加载中...',
      'common.error': '出错了',
      'common.retry': '重试',
      // About
      'about.subtitle': '专注服装领域多年，为客户提供最优质的服装产品和专业的时尚搭配服务',
      'about.company.title': '公司简介',
      'about.company.desc1': 'YXLP成立于2010年，是一家专注于服装设计、生产和销售的现代化企业。我们致力于为全球客户提供高品质的服装产品和专业的时尚解决方案。',
      'about.company.desc2': '经过十多年的发展，我们已经建立了完善的供应链体系和质量管理系统，产品远销欧美、亚太等多个国家和地区，深受客户信赖。',
      'about.company.desc3': '我们坚持"品质第一、客户至上"的经营理念，不断创新设计，优化生产工艺，为客户创造更大价值。',
      'about.company.imageAlt': '公司办公环境',
      'about.values.title': '核心价值',
      'about.values.quality.title': '品质至上',
      'about.values.quality.desc': '严格的质量控制体系，确保每一件产品都达到最高标准',
      'about.values.innovation.title': '持续创新',
      'about.values.innovation.desc': '紧跟时尚潮流，不断推出创新设计和优质产品',
      'about.values.service.title': '客户至上',
      'about.values.service.desc': '以客户需求为导向，提供专业贴心的服务体验',
      'about.team.title': '核心团队',
      'about.team.ceo.name': '张明',
      'about.team.ceo.title': '首席执行官',
      'about.team.ceo.desc': '拥有20年服装行业经验，致力于推动公司创新发展',
      'about.team.cto.name': '李华',
      'about.team.cto.title': '首席技术官',
      'about.team.cto.desc': '专注于数字化转型和技术创新，推动智能制造',
      'about.team.cmo.name': '王芳',
      'about.team.cmo.title': '首席营销官',
      'about.team.cmo.desc': '负责品牌建设和市场拓展，打造国际化品牌形象',
      'about.history.title': '发展历程',
      'about.history.2010.title': '公司成立',
      'about.history.2010.desc': 'YXLP正式成立，开始专注于服装设计和生产',
      'about.history.2015.title': '国际化发展',
      'about.history.2015.desc': '产品开始出口海外，建立国际销售网络',
      'about.history.2020.title': '数字化转型',
      'about.history.2020.desc': '启动数字化转型，建立智能制造体系',
      'about.history.2024.title': '持续创新',
      'about.history.2024.desc': '继续深化创新发展，打造行业领先品牌',
      'about.contact.title': '了解更多',
      'about.contact.desc': '想要了解更多关于YXLP的信息？欢迎联系我们',
      'about.contact.button': '联系我们',
      // Contact
      'contact.info.title': '联系信息',
      'contact.info.address.title': '公司地址',
      'contact.info.address.value': '中国上海市浦东新区张江高科技园区',
      'contact.info.phone.title': '联系电话',
      'contact.info.email.title': '邮箱地址',
      'contact.info.hours.title': '工作时间',
      'contact.info.hours.value': '周一至周五 9:00-18:00',
      'contact.social.title': '关注我们',
      'contact.form.title': '发送消息',
      'contact.form.name': '姓名',
      'contact.form.namePlaceholder': '请输入您的姓名',
      'contact.form.email': '邮箱',
      'contact.form.emailPlaceholder': '请输入您的邮箱',
      'contact.form.company': '公司名称',
      'contact.form.companyPlaceholder': '请输入公司名称',
      'contact.form.phone': '联系电话',
      'contact.form.phonePlaceholder': '请输入联系电话',
      'contact.form.subject': '主题',
      'contact.form.subjectPlaceholder': '请选择主题',
      'contact.form.subjects.general': '一般咨询',
      'contact.form.subjects.partnership': '合作洽谈',
      'contact.form.subjects.support': '技术支持',
      'contact.form.subjects.complaint': '投诉建议',
      'contact.form.message': '留言内容',
      'contact.form.messagePlaceholder': '请详细描述您的问题或需求...',
      'contact.form.submit': '发送消息',
      'contact.form.success': '感谢您的留言，我们会尽快回复！',
      'contact.map.title': '找到我们',
      'contact.map.placeholder': '地图加载中...',
      // Partners
      'partners.subtitle': '与全球优秀企业建立战略合作关系，共同开拓市场，实现互利共赢的发展目标',
      'partners.fashion.desc': '全球领先的时尚零售集团，在欧美拥有超过500家门店',
      'partners.textile.desc': '专业的纺织品供应商，为我们提供优质的原材料',
      'partners.ecommerce.desc': '领先的电商平台，帮助我们拓展在线销售渠道',
      'partners.logistics.desc': '专业的物流服务提供商，确保产品快速安全送达',
      'partners.design.desc': '创意设计工作室，为我们提供前沿的设计理念',
      'partners.quality.desc': '专业的质量检测机构，确保产品质量达到国际标准',
      'partners.categories.all': '全部合作伙伴',
      'partners.categories.retail': '零售商',
      'partners.categories.supplier': '供应商',
      'partners.categories.technology': '技术伙伴',
      'partners.categories.logistics': '物流伙伴',
      'partners.categories.design': '设计伙伴',
      'partners.categories.quality': '质检伙伴',
      'partners.advantages.title': '合作优势',
      'partners.advantages.global.title': '全球网络',
      'partners.advantages.global.desc': '覆盖全球主要市场的销售和服务网络',
      'partners.advantages.support.title': '全方位支持',
      'partners.advantages.support.desc': '提供技术、营销、培训等全方位支持',
      'partners.advantages.growth.title': '共同成长',
      'partners.advantages.growth.desc': '与合作伙伴共享成功，实现互利共赢',
      'partners.join.title': '成为我们的合作伙伴',
      'partners.join.subtitle': '加入YXLP合作伙伴网络，共同开拓无限商机',
      'partners.join.benefits.market.title': '市场拓展',
      'partners.join.benefits.market.desc': '获得新市场准入机会',
      'partners.join.benefits.resources.title': '资源共享',
      'partners.join.benefits.resources.desc': '共享技术和市场资源',
      'partners.join.benefits.profit.title': '利润增长',
      'partners.join.benefits.profit.desc': '实现可持续的利润增长',
      'partners.join.button': '立即申请',
      'partners.process.title': '合作流程',
      'partners.process.step1.title': '提交申请',
      'partners.process.step1.desc': '填写合作申请表，提交相关资料',
      'partners.process.step2.title': '资质审核',
      'partners.process.step2.desc': '我们将对您的资质进行全面评估',
      'partners.process.step3.title': '洽谈合作',
      'partners.process.step3.desc': '深入沟通合作模式和具体条款',
      'partners.process.step4.title': '签署协议',
      'partners.process.step4.desc': '正式签署合作协议，开始合作',
      'partners.contact.title': '开启合作之旅',
      'partners.contact.desc': '想了解更多合作机会？立即联系我们的合作团队',
      'partners.contact.button': '联系我们',
      'partners.contact.email': '发送邮件',
      // Admin sidebar - 一级菜单
      'admin.sidebar.dashboard': '数据仪表板',
      'admin.sidebar.products': '商品管理',
      'admin.sidebar.orders': '订单管理',
      'admin.sidebar.users': '用户管理',
      'admin.sidebar.news': '新闻管理',
      'admin.sidebar.analytics': '数据分析',
      'admin.sidebar.settings': '系统设置',
      // Admin sidebar - 商品管理子菜单
      'admin.sidebar.products-list': '商品列表',
      'admin.sidebar.products-create': '添加商品',
      'admin.sidebar.products-categories': '分类管理',
      // Admin sidebar - 新闻管理子菜单
      'admin.sidebar.news-list': '新闻列表',
      'admin.sidebar.news-sources': 'RSS源管理',
      'admin.sidebar.news-collect': '新闻采集',
      'admin.sidebar.news-schedule': '定时采集',
      'admin.sidebar.news-polish': 'AI润色',
      'admin.sidebar.news-publish': '发布中心',
      'admin.sidebar.news-create': '手动发布',
      'admin.sidebar.ai-config': 'AI配置',
      // Admin sidebar - 数据分析子菜单
      'admin.sidebar.analytics-overview': '数据概览',
      'admin.sidebar.analytics-sales': '销售分析',
      'admin.sidebar.analytics-users': '用户分析',
      // Admin sidebar - 系统设置子菜单
      'admin.sidebar.settings-general': '基本设置',
      'admin.sidebar.settings-profile': '个人资料',
      'admin.sidebar.settings-security': '安全设置',
      // Admin pages - 页面标题
      'admin.pages.dashboard': '仪表板',
      'admin.pages.databoard': '数据仪表板',
      'admin.pages.products': '商品管理',
      'admin.pages.orders': '订单管理',
      'admin.pages.users': '用户管理',
      'admin.pages.news': '新闻管理',
      'admin.pages.analytics': '数据分析',
      'admin.pages.settings': '系统设置',
      'admin.pages.backend': '后台管理',
      // Admin menu - 菜单项
      'admin.menu.visitWebsite': '访问网站',
      // Admin news - 新闻管理
      'admin.news.title': '新闻管理',
      'admin.news.description': '管理新闻内容，支持多语言和AI润色功能',
      'admin.news.displayLanguage': '显示语言',
      'admin.news.startCrawl': '开始采集',
      'admin.news.createNews': '创建新闻',
      'admin.news.edit': '编辑',
      'admin.news.delete': '删除',
      'admin.news.publish': '发布',
      'admin.news.unpublish': '取消发布',
      'admin.news.translateToChinese': '中文翻译',
      'admin.news.viewChineseTranslation': '查看中文翻译',
      'admin.news.aiPolish': 'AI润色',
      'admin.news.translating': '翻译中...',
      'admin.news.translation': '翻译',
      'admin.news.originalContent': '原文内容',
      'admin.news.translatedContent': '翻译内容',
      'admin.news.close': '关闭',
      'admin.news.save': '保存',
      'admin.news.cancel': '取消',
      'admin.news.loading': '加载中...',
      'admin.news.noData': '暂无数据',
      'admin.news.searchPlaceholder': '搜索新闻标题或内容...',
      'admin.news.filterByLanguage': '按语言筛选',
      'admin.news.allLanguages': '所有语言',
      'admin.news.status': '状态',
      'admin.news.draft': '草稿',
      'admin.news.published': '已发布',
      'admin.news.archived': '已归档',
      'admin.news.author': '作者',
      'admin.news.publishDate': '发布日期',
      'admin.news.lastModified': '最后修改',
      'admin.news.views': '浏览量',
      'admin.news.actions': '操作',
      'admin.news.chineseTranslation': '中文翻译',
      'admin.news.titleTranslation': '标题翻译',
      'admin.news.summaryTranslation': '摘要翻译',
      'admin.news.contentTranslation': '内容翻译',
      // Buttons - 通用按钮
      'buttons.back': '返回',
      'buttons.save': '保存',
      'buttons.cancel': '取消',
      'buttons.delete': '删除',
      'buttons.edit': '编辑',
      'buttons.create': '创建',
      'buttons.update': '更新',
      'buttons.submit': '提交',
      'buttons.reset': '重置',
      'buttons.search': '搜索',
      'buttons.filter': '筛选',
      'buttons.export': '导出',
      'buttons.import': '导入',
      'buttons.refresh': '刷新',
      'buttons.close': '关闭',
      'buttons.confirm': '确认',
      'buttons.yes': '是',
      'buttons.no': '否',
      // Common status and filter options
      'common.filter': '筛选',
      'common.all': '全部',
      'common.draft': '草稿',
      'common.published': '已发布',
      'common.archived': '已归档',
      'common.processing': '处理中',
    }
  },
  en: {
    common: {
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.categories': 'Categories',
      'nav.news': 'News',
      'nav.partners': 'Partners',
      'nav.about': 'About Us',
      'nav.contact': 'Contact',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'hero.slide1.title': 'Quality Products, Excellent Service',
      'hero.slide1.subtitle': 'Quality Assurance, Trusted Choice',
      'hero.slide1.description': 'Strict quality control system and comprehensive after-sales service network to provide customers with the highest quality products and service experience',
      'hero.slide1.cta': 'View Products',
      'hero.slide2.title': 'Leading Future Business Innovation',
      'hero.slide2.subtitle': 'YXLP - Your Digital Transformation Partner',
      'hero.slide2.description': 'Focused on providing comprehensive digital solutions for enterprises, helping businesses achieve leapfrog development in the digital age',
      'hero.slide2.cta': 'Learn More',
      'hero.slide3.title': 'Global Cooperation, Creating the Future Together',
      'hero.slide3.subtitle': 'Working Together, Win-Win Cooperation',
      'hero.slide3.description': 'Establish strategic partnerships with excellent global enterprises, jointly explore markets, and achieve mutually beneficial development goals',
      'hero.slide3.cta': 'Become a Partner',
      'hero.watchVideo': 'Watch Video',
      'advantages.title': 'Why Choose YXLP Fashion',
      'advantages.subtitle': 'Years of focus in the fashion industry, providing customers with the highest quality clothing products and professional fashion styling services',
      'products.title': 'Featured Clothing',
      'products.subtitle': 'Bringing together global quality clothing brands to provide you with fashionable and diverse choices',
      'products.view_all': 'View All Products',
      'about.title': 'About YXLP',
      'contact.title': 'Contact Us',
      'contact.subtitle': 'If you have any questions or cooperation intentions, please feel free to contact us at any time',
      // Categories
      'categories.title': 'Categories',
      'categories.subtitle': 'Browse our product categories',
      'categories.all': 'All Products',
      'categories.underwear': 'Underwear',
      'categories.underwear.desc': 'Underwear, intimate apparel, etc.',
      'categories.sportswear': 'Sportswear',
      'categories.sportswear.desc': 'Athletic wear, fitness clothing, etc.',
      'categories.clothing': 'Clothing',
      'categories.clothing.desc': 'Fashion apparel, sportswear, etc.',
      'categories.shoes': 'Shoes',
      'categories.shoes.desc': 'Sneakers, casual shoes, etc.',
      'categories.bags': 'Bags',
      'categories.bags.desc': 'Handbags, backpacks, etc.',
      'categories.accessories': 'Accessories',
      'categories.accessories.desc': 'Fashion accessories, clothing accessories, etc.',
      'categories.viewProducts': 'View Products',
      // Products
      'products.categories': 'Product Categories',
      'products.searchPlaceholder': 'Search products...',
      'products.sort.default': 'Default Sort',
      'products.sort.priceAsc': 'Price: Low to High',
      'products.sort.priceDesc': 'Price: High to Low',
      'products.sort.newest': 'Newest',
      'products.sort.popular': 'Most Popular',
      'products.casualShirt.name': 'Casual Shirt',
      'products.elegantDress.name': 'Elegant Dress',
      'products.luxuryBag.name': 'Luxury Handbag',
      'products.addToCart': 'Add to Cart',
      // News
      'news.title': 'News',
      'news.subtitle': 'Stay updated with the latest apparel industry trends and product information',
      'news.categories.title': 'News Categories',
      'news.categories.all': 'All',
      'news.categories.fashion': 'Fashion',
      'news.categories.textile': 'Textile',
      'news.categories.apparel': 'Apparel',
      'news.categories.manufacturing': 'Manufacturing',
      'news.categories.export': 'Export',
      'news.readMore': 'Read More',
      'news.noArticles': 'No articles found',
      // Partners
      'partners.title': 'Partners',
      'partners.subtitle': 'Building strategic partnerships with excellent global companies to jointly explore markets and achieve mutually beneficial development goals',
      'partners.fashion.name': 'Fashion Group International',
      'partners.fashion.desc': 'Leading global fashion retail group with over 500 stores in Europe and America',
      'partners.textile.name': 'Global Textile Solutions',
      'partners.textile.desc': 'Professional textile supplier providing us with high-quality raw materials',
      'partners.ecommerce.name': 'E-Commerce Platform Ltd',
      'partners.ecommerce.desc': 'Leading e-commerce platform helping us expand online sales channels',
      'partners.join.title': 'Become Our Partner',
      'partners.join.subtitle': 'Join the YXLP partner network and explore unlimited business opportunities together',
      'partners.join.button': 'Apply Now',
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error occurred',
      'common.retry': 'Retry',
      // About
      'about.subtitle': 'Years of focus in the fashion industry, providing customers with the highest quality clothing products and professional fashion styling services',
      'about.company.title': 'Company Profile',
      'about.company.desc1': 'YXLP was founded in 2010 as a modern enterprise specializing in clothing design, production and sales. We are committed to providing global customers with high-quality clothing products and professional fashion solutions.',
      'about.company.desc2': 'After more than ten years of development, we have established a complete supply chain system and quality management system. Our products are exported to Europe, America, Asia-Pacific and other countries and regions, and are deeply trusted by customers.',
      'about.company.desc3': 'We adhere to the business philosophy of "quality first, customer first", continuously innovate design, optimize production processes, and create greater value for customers.',
      'about.company.imageAlt': 'Company office environment',
      'about.values.title': 'Core Values',
      'about.values.quality.title': 'Quality First',
      'about.values.quality.desc': 'Strict quality control system to ensure every product meets the highest standards',
      'about.values.innovation.title': 'Continuous Innovation',
      'about.values.innovation.desc': 'Keep up with fashion trends and continuously launch innovative designs and quality products',
      'about.values.service.title': 'Customer First',
      'about.values.service.desc': 'Customer-oriented, providing professional and caring service experience',
      'about.team.title': 'Core Team',
      'about.team.ceo.name': 'Zhang Ming',
      'about.team.ceo.title': 'Chief Executive Officer',
      'about.team.ceo.desc': 'With 20 years of experience in the fashion industry, committed to driving innovation and development',
      'about.team.cto.name': 'Li Hua',
      'about.team.cto.title': 'Chief Technology Officer',
      'about.team.cto.desc': 'Focus on digital transformation and technological innovation, promoting smart manufacturing',
      'about.team.cmo.name': 'Wang Fang',
      'about.team.cmo.title': 'Chief Marketing Officer',
      'about.team.cmo.desc': 'Responsible for brand building and market expansion, creating an international brand image',
      'about.history.title': 'Development History',
      'about.history.2010.title': 'Company Founded',
      'about.history.2010.desc': 'YXLP was officially established, focusing on clothing design and production',
      'about.history.2015.title': 'International Development',
      'about.history.2015.desc': 'Products began to be exported overseas, establishing international sales networks',
      'about.history.2020.title': 'Digital Transformation',
      'about.history.2020.desc': 'Launched digital transformation, established smart manufacturing system',
      'about.history.2024.title': 'Continuous Innovation',
      'about.history.2024.desc': 'Continue to deepen innovative development and build industry-leading brands',
      'about.contact.title': 'Learn More',
      'about.contact.desc': 'Want to learn more about YXLP? Feel free to contact us',
      'about.contact.button': 'Contact Us',
      // Contact
      'contact.info.title': 'Contact Information',
      'contact.info.address.title': 'Company Address',
      'contact.info.address.value': 'Zhangjiang Hi-Tech Park, Pudong New Area, Shanghai, China',
      'contact.info.phone.title': 'Phone Number',
      'contact.info.email.title': 'Email Address',
      'contact.info.hours.title': 'Business Hours',
      'contact.info.hours.value': 'Monday to Friday 9:00-18:00',
      'contact.social.title': 'Follow Us',
      'contact.form.title': 'Send Message',
      'contact.form.name': 'Name',
      'contact.form.namePlaceholder': 'Please enter your name',
      'contact.form.email': 'Email',
      'contact.form.emailPlaceholder': 'Please enter your email',
      'contact.form.company': 'Company Name',
      'contact.form.companyPlaceholder': 'Please enter company name',
      'contact.form.phone': 'Phone Number',
      'contact.form.phonePlaceholder': 'Please enter phone number',
      'contact.form.subject': 'Subject',
      'contact.form.subjectPlaceholder': 'Please select subject',
      'contact.form.subjects.general': 'General Inquiry',
      'contact.form.subjects.partnership': 'Partnership',
      'contact.form.subjects.support': 'Technical Support',
      'contact.form.subjects.complaint': 'Complaint & Suggestion',
      'contact.form.message': 'Message',
      'contact.form.messagePlaceholder': 'Please describe your question or requirements in detail...',
      'contact.form.submit': 'Send Message',
      'contact.form.success': 'Thank you for your message, we will reply as soon as possible!',
      'contact.map.title': 'Find Us',
      'contact.map.placeholder': 'Map loading...',
      // Partners
      'partners.subtitle': 'Establish strategic partnerships with excellent global enterprises, jointly explore markets, and achieve mutually beneficial development goals',
      'partners.fashion.desc': 'Leading global fashion retail group with over 500 stores in Europe and America',
      'partners.textile.desc': 'Professional textile supplier providing us with high-quality raw materials',
      'partners.ecommerce.desc': 'Leading e-commerce platform helping us expand online sales channels',
      'partners.logistics.desc': 'Professional logistics service provider ensuring fast and safe product delivery',
      'partners.design.desc': 'Creative design studio providing us with cutting-edge design concepts',
      'partners.quality.desc': 'Professional quality testing agency ensuring product quality meets international standards',
      'partners.categories.all': 'All Partners',
      'partners.categories.retail': 'Retailers',
      'partners.categories.supplier': 'Suppliers',
      'partners.categories.technology': 'Technology Partners',
      'partners.categories.logistics': 'Logistics Partners',
      'partners.categories.design': 'Design Partners',
      'partners.categories.quality': 'Quality Partners',
      'partners.advantages.title': 'Partnership Advantages',
      'partners.advantages.global.title': 'Global Network',
      'partners.advantages.global.desc': 'Sales and service network covering major global markets',
      'partners.advantages.support.title': 'Comprehensive Support',
      'partners.advantages.support.desc': 'Providing comprehensive support in technology, marketing, training, etc.',
      'partners.advantages.growth.title': 'Mutual Growth',
      'partners.advantages.growth.desc': 'Share success with partners and achieve mutual benefit',
      'partners.join.title': 'Become Our Partner',
      'partners.join.subtitle': 'Join YXLP partner network and explore unlimited business opportunities together',
      'partners.join.benefits.market.title': 'Market Expansion',
      'partners.join.benefits.market.desc': 'Access to new market opportunities',
      'partners.join.benefits.resources.title': 'Resource Sharing',
      'partners.join.benefits.resources.desc': 'Share technology and market resources',
      'partners.join.benefits.profit.title': 'Profit Growth',
      'partners.join.benefits.profit.desc': 'Achieve sustainable profit growth',
      'partners.join.button': 'Apply Now',
      'partners.process.title': 'Partnership Process',
      'partners.process.step1.title': 'Submit Application',
      'partners.process.step1.desc': 'Fill out partnership application and submit relevant materials',
      'partners.process.step2.title': 'Qualification Review',
      'partners.process.step2.desc': 'We will conduct a comprehensive assessment of your qualifications',
      'partners.process.step3.title': 'Negotiate Cooperation',
      'partners.process.step3.desc': 'In-depth communication on cooperation models and specific terms',
      'partners.process.step4.title': 'Sign Agreement',
      'partners.process.step4.desc': 'Formally sign cooperation agreement and start partnership',
      'partners.contact.title': 'Start Partnership Journey',
      'partners.contact.desc': 'Want to learn more about partnership opportunities? Contact our partnership team immediately',
      'partners.contact.button': 'Contact Us',
      'partners.contact.email': 'Send Email',
      // Admin sidebar - 一级菜单
      'admin.sidebar.dashboard': 'Dashboard',
      'admin.sidebar.products': 'Products',
      'admin.sidebar.orders': 'Orders',
      'admin.sidebar.users': 'Users',
      'admin.sidebar.news': 'News',
      'admin.sidebar.analytics': 'Analytics',
      'admin.sidebar.settings': 'Settings',
      // Admin sidebar - 商品管理子菜单
      'admin.sidebar.products-list': 'Product List',
      'admin.sidebar.products-create': 'Add Product',
      'admin.sidebar.products-categories': 'Category Management',
      // Admin sidebar - 新闻管理子菜单
      'admin.sidebar.news-list': 'News List',
      'admin.sidebar.news-sources': 'RSS Sources',
      'admin.sidebar.news-collect': 'News Collection',
      'admin.sidebar.news-schedule': 'Scheduled Collection',
      'admin.sidebar.news-polish': 'AI Polish',
      'admin.sidebar.news-publish': 'Publishing Center',
      'admin.sidebar.news-create': 'Manual Publish',
      'admin.sidebar.ai-config': 'AI Configuration',
      // Admin sidebar - 数据分析子菜单
      'admin.sidebar.analytics-overview': 'Data Overview',
      'admin.sidebar.analytics-sales': 'Sales Analytics',
      'admin.sidebar.analytics-users': 'User Analytics',
      // Admin sidebar - 系统设置子菜单
      'admin.sidebar.settings-general': 'General Settings',
      'admin.sidebar.settings-profile': 'Profile',
      'admin.sidebar.settings-security': 'Security Settings',
      // Admin pages - 页面标题
      'admin.pages.dashboard': 'Dashboard',
      'admin.pages.databoard': 'Data Dashboard',
      'admin.pages.products': 'Products',
      'admin.pages.orders': 'Orders',
      'admin.pages.users': 'Users',
      'admin.pages.news': 'News',
      'admin.pages.analytics': 'Analytics',
      'admin.pages.settings': 'Settings',
      'admin.pages.backend': 'Admin Panel',
      // Admin menu - 菜单项
      'admin.menu.visitWebsite': 'Visit Website',
      // Admin news - 新闻管理
      'admin.news.title': 'News Management',
      'admin.news.description': 'Manage news content with multilingual and AI polish features',
      'admin.news.displayLanguage': 'Display Language',
      'admin.news.startCrawl': 'Start Crawling',
      'admin.news.createNews': 'Create News',
      'admin.news.edit': 'Edit',
      'admin.news.delete': 'Delete',
      'admin.news.publish': 'Publish',
      'admin.news.unpublish': 'Unpublish',
      'admin.news.translateToChinese': 'Chinese Translation',
      'admin.news.viewChineseTranslation': 'View Chinese Translation',
      'admin.news.aiPolish': 'AI Polish',
      'admin.news.translating': 'Translating...',
      'admin.news.translation': 'Translation',
      'admin.news.originalContent': 'Original Content',
      'admin.news.translatedContent': 'Translated Content',
      'admin.news.close': 'Close',
      'admin.news.save': 'Save',
      'admin.news.cancel': 'Cancel',
      'admin.news.loading': 'Loading...',
      'admin.news.noData': 'No Data',
      'admin.news.searchPlaceholder': 'Search news title or content...',
      'admin.news.filterByLanguage': 'Filter by Language',
      'admin.news.allLanguages': 'All Languages',
      'admin.news.status': 'Status',
      'admin.news.draft': 'Draft',
      'admin.news.published': 'Published',
      'admin.news.archived': 'Archived',
      'admin.news.author': 'Author',
      'admin.news.publishDate': 'Publish Date',
      'admin.news.lastModified': 'Last Modified',
      'admin.news.views': 'Views',
      'admin.news.actions': 'Actions',
      'admin.news.chineseTranslation': 'Chinese Translation',
      'admin.news.titleTranslation': 'Title Translation',
      'admin.news.summaryTranslation': 'Summary Translation',
      'admin.news.contentTranslation': 'Content Translation',
      // Buttons - 通用按钮
      'buttons.back': 'Back',
      'buttons.save': 'Save',
      'buttons.cancel': 'Cancel',
      'buttons.delete': 'Delete',
      'buttons.edit': 'Edit',
      'buttons.create': 'Create',
      'buttons.update': 'Update',
      'buttons.submit': 'Submit',
      'buttons.reset': 'Reset',
      'buttons.search': 'Search',
      'buttons.filter': 'Filter',
      'buttons.export': 'Export',
      'buttons.import': 'Import',
      'buttons.refresh': 'Refresh',
      'buttons.close': 'Close',
      'buttons.confirm': 'Confirm',
      'buttons.yes': 'Yes',
      'buttons.no': 'No',
      // Common status and filter options
      'common.filter': 'Filter',
      'common.all': 'All',
      'common.draft': 'Draft',
      'common.published': 'Published',
      'common.archived': 'Archived',
      'common.processing': 'Processing',
    }
  },
  fr: {
    common: {
      'nav.home': 'Accueil',
      'nav.products': 'Produits',
      'nav.categories': 'Catégories',
      'nav.news': 'Actualités',
      'nav.partners': 'Partenaires',
      'nav.about': 'À propos',
      'nav.contact': 'Contact',
      'nav.login': 'Connexion',
      'nav.register': 'S\'inscrire',
      'hero.slide1.title': 'Produits de Qualité, Service Excellent',
      'hero.slide1.subtitle': 'Assurance Qualité, Choix de Confiance',
      'hero.slide1.description': 'Système de contrôle qualité strict et réseau de service après-vente complet pour fournir aux clients les produits et l\'expérience de service de la plus haute qualité',
      'hero.slide1.cta': 'Voir les Produits',
      'hero.slide2.title': 'Mener l\'Innovation Commerciale Future',
      'hero.slide2.subtitle': 'YXLP - Votre Partenaire de Transformation Numérique',
      'hero.slide2.description': 'Concentré sur la fourniture de solutions numériques complètes pour les entreprises, aidant les entreprises à réaliser un développement par bonds dans l\'ère numérique',
      'hero.slide2.cta': 'En Savoir Plus',
      'hero.slide3.title': 'Coopération Mondiale, Créer l\'Avenir Ensemble',
      'hero.slide3.subtitle': 'Travailler Ensemble, Coopération Gagnant-Gagnant',
      'hero.slide3.description': 'Établir des partenariats stratégiques avec d\'excellentes entreprises mondiales, explorer conjointement les marchés et atteindre des objectifs de développement mutuellement bénéfiques',
      'hero.slide3.cta': 'Devenir Partenaire',
      'hero.watchVideo': 'Regarder la Vidéo',
      'advantages.title': 'Pourquoi Choisir YXLP Mode',
      'advantages.subtitle': 'Des années de concentration dans l\'industrie de la mode, fournissant aux clients les produits vestimentaires de la plus haute qualité et des services de stylisme professionnel',
      'products.title': 'Vêtements Sélectionnés',
      'products.subtitle': 'Rassemblant des marques de vêtements de qualité mondiale pour vous offrir des choix à la mode et diversifiés',
      'products.view_all': 'Voir Tous les Produits',
      'about.title': 'À Propos de YXLP',
      'contact.title': 'Nous Contacter',
      'contact.subtitle': 'Si vous avez des questions ou des intentions de coopération, n\'hésitez pas à nous contacter à tout moment',
      // Categories
      'categories.title': 'Catégories',
      'categories.subtitle': 'Parcourez nos catégories de produits',
      'categories.all': 'Tous les Produits',
      'categories.underwear': 'Sous-vêtements',
      'categories.underwear.desc': 'Sous-vêtements, lingerie, etc.',
      'categories.sportswear': 'Vêtements de Sport',
      'categories.sportswear.desc': 'Vêtements d\'entraînement, fitness, etc.',
      'categories.clothing': 'Vêtements',
      'categories.clothing.desc': 'Mode, vêtements de sport, etc.',
      'categories.shoes': 'Chaussures',
      'categories.shoes.desc': 'Baskets, chaussures décontractées, etc.',
      'categories.bags': 'Sacs',
      'categories.bags.desc': 'Sacs à main, sacs à dos, etc.',
      'categories.accessories': 'Accessoires',
      'categories.accessories.desc': 'Accessoires de mode, accessoires vestimentaires, etc.',
      'categories.viewProducts': 'Voir les Produits',
      // Products
      'products.categories': 'Catégories de Produits',
      'products.searchPlaceholder': 'Rechercher des produits...',
      'products.sort.default': 'Tri par Défaut',
      'products.sort.priceAsc': 'Prix: Croissant',
      'products.sort.priceDesc': 'Prix: Décroissant',
      'products.sort.newest': 'Plus Récent',
      'products.sort.popular': 'Plus Populaire',
      'products.casualShirt.name': 'Chemise Décontractée',
      'products.elegantDress.name': 'Robe Élégante',
      'products.luxuryBag.name': 'Sac à Main de Luxe',
      'products.addToCart': 'Ajouter au Panier',
      // News
      'news.title': 'Actualités',
      'news.subtitle': 'Restez informé des dernières nouvelles de l\'industrie et des mises à jour de produits',
      'news.categories.all': 'Tout',
      'news.categories.business': 'Affaires',
      'news.categories.technology': 'Technologie',
      'news.categories.fashion': 'Mode',
      'news.categories.lifestyle': 'Style de Vie',
      'news.readMore': 'Lire Plus',
      'news.noArticles': 'Aucun article trouvé',
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur survenue',
      'common.retry': 'Réessayer',
    }
  },
  ko: {
    common: {
      'nav.home': '홈',
      'nav.products': '제품',
      'nav.categories': '카테고리',
      'nav.news': '뉴스',
      'nav.partners': '파트너',
      'nav.about': '회사소개',
      'nav.contact': '연락처',
      'nav.login': '로그인',
      'nav.register': '무료 가입',
      'hero.slide1.title': '고품질 제품, 우수한 서비스',
      'hero.slide1.subtitle': '품질 보증, 신뢰할 수 있는 선택',
      'hero.slide1.description': '엄격한 품질 관리 시스템과 완벽한 애프터서비스 네트워크로 고객에게 최고 품질의 제품과 서비스 경험을 제공합니다',
      'hero.slide1.cta': '제품 보기',
      'hero.slide2.title': '미래 비즈니스 혁신을 선도하다',
      'hero.slide2.subtitle': 'YXLP - 귀하의 디지털 전환 파트너',
      'hero.slide2.description': '기업을 위한 포괄적인 디지털 솔루션 제공에 집중하여 디지털 시대에 기업의 도약적 발전을 지원합니다',
      'hero.slide2.cta': '더 알아보기',
      'hero.slide3.title': '글로벌 협력, 함께 미래를 창조하다',
      'hero.slide3.subtitle': '함께 나아가며, 상생 협력',
      'hero.slide3.description': '전 세계 우수 기업과 전략적 파트너십을 구축하여 시장을 공동 개척하고 상호 이익이 되는 발전 목표를 달성합니다',
      'hero.slide3.cta': '파트너 되기',
      'hero.watchVideo': '비디오 시청',
      'advantages.title': 'YXLP 패션을 선택하는 이유',
      'advantages.subtitle': '패션 분야에서 수년간의 전문성으로 고객에게 최고 품질의 의류 제품과 전문적인 패션 스타일링 서비스를 제공합니다',
      'products.title': '엄선된 의류',
      'products.subtitle': '전 세계 고품질 의류 브랜드를 모아 패셔너블하고 다양한 선택을 제공합니다',
      'products.view_all': '모든 제품 보기',
      'about.title': 'YXLP 소개',
      'contact.title': '연락처',
      'contact.subtitle': '궁금한 점이나 협력 의향이 있으시면 언제든지 연락해 주세요',
      // About
      'about.subtitle': '패션 분야에서 수년간의 전문성으로 고객에게 최고 품질의 의류 제품과 전문적인 패션 스타일링 서비스를 제공합니다',
      'about.company.title': '회사 소개',
      'about.company.desc1': 'YXLP는 2010년에 설립된 의류 디자인, 생산 및 판매를 전문으로 하는 현대적인 기업입니다. 전 세계 고객에게 고품질 의류 제품과 전문적인 패션 솔루션을 제공하는 데 전념하고 있습니다.',
      'about.company.desc2': '10년 이상의 발전을 통해 완전한 공급망 시스템과 품질 관리 시스템을 구축했습니다. 제품은 유럽, 미국, 아시아 태평양 지역 등 여러 국가와 지역으로 수출되어 고객들로부터 깊은 신뢰를 받고 있습니다.',
      'about.company.desc3': '우리는 "품질 우선, 고객 우선"의 경영 철학을 고수하며, 지속적으로 디자인을 혁신하고 생산 공정을 최적화하여 고객에게 더 큰 가치를 창조합니다.',
      'about.company.imageAlt': '회사 사무실 환경',
      'about.values.title': '핵심 가치',
      'about.values.quality.title': '품질 우선',
      'about.values.quality.desc': '엄격한 품질 관리 시스템으로 모든 제품이 최고 기준을 충족하도록 보장합니다',
      'about.values.innovation.title': '지속적 혁신',
      'about.values.innovation.desc': '패션 트렌드를 따라가며 혁신적인 디자인과 고품질 제품을 지속적으로 출시합니다',
      'about.values.service.title': '우수한 서비스',
      'about.values.service.desc': '전문 서비스 팀이 고객에게 포괄적인 지원을 제공합니다',
      'about.values.trust.title': '신뢰할 수 있는 파트너',
      'about.values.trust.desc': '장기적인 파트너십을 구축하여 고객과 함께 성장합니다',
      'about.team.title': '우리 팀',
      'about.team.desc': '경험이 풍부한 전문가 팀이 디자인부터 생산까지 전 과정을 지원합니다',
      'about.team.design.title': '디자인 팀',
      'about.team.design.desc': '창의적인 디자이너들이 최신 패션 트렌드를 추구합니다',
      'about.team.production.title': '생산 팀',
      'about.team.production.desc': '숙련된 기술자들이 고품질 제품을 보장합니다',
      'about.team.quality.title': '품질 관리 팀',
      'about.team.quality.desc': '엄격한 품질 기준으로 제품의 우수성을 확보합니다',
      'about.team.sales.title': '영업 팀',
      'about.team.sales.desc': '전문 영업 팀이 고객에게 최적의 솔루션을 제공합니다',
      'about.history.title': '발전 역사',
      'about.history.2010.title': '2010년 - 회사 설립',
      'about.history.2010.desc': 'YXLP가 정식으로 설립되어 의류 산업 진출을 시작',
      'about.history.2015.title': '2015년 - 국제 진출',
      'about.history.2015.desc': '해외 시장 진출을 시작하여 유럽과 미국 시장에 진입',
      'about.history.2018.title': '2018년 - 기술 혁신',
      'about.history.2018.desc': '첨단 생산 장비를 도입하여 생산 효율성과 품질을 크게 향상',
      'about.history.2020.title': '2020년 - 디지털 전환',
      'about.history.2020.desc': '디지털화 프로세스를 시작하고 온라인 판매 플랫폼을 구축',
      'about.history.2023.title': '2023년 - 지속 가능한 발전',
      'about.history.2023.desc': '친환경 생산 공정을 채택하고 지속 가능한 발전 전략을 실시',
      'about.mission.title': '우리의 사명',
      'about.mission.desc': '고품질 의류를 통해 고객의 삶을 더 아름답고 자신감 있게 만듭니다',
      'about.vision.title': '우리의 비전',
      'about.vision.desc': '세계를 선도하는 패션 브랜드가 되어 글로벌 고객에게 우수한 제품과 서비스를 제공합니다',
      'about.contact.title': '연락처',
      'about.contact.desc': '저희와의 협력에 관심이 있으시면 언제든지 연락해 주세요',
      'about.contact.button': '연락하기',
      // Contact
      'contact.info.title': '연락처 정보',
      'contact.info.address.title': '회사 주소',
      'contact.info.address.value': '중국 상하이시 푸둥신구 장장 하이테크 파크',
      'contact.info.phone.title': '연락 전화',
      'contact.info.email.title': '이메일 주소',
      'contact.info.hours.title': '근무 시간',
      'contact.info.hours.value': '월요일부터 금요일 9:00-18:00',
      'contact.social.title': '팔로우하기',
      'contact.form.title': '메시지 보내기',
      'contact.form.name': '이름',
      'contact.form.namePlaceholder': '이름을 입력해 주세요',
      'contact.form.email': '이메일',
      'contact.form.emailPlaceholder': '이메일을 입력해 주세요',
      'contact.form.company': '회사명',
      'contact.form.companyPlaceholder': '회사명을 입력해 주세요',
      'contact.form.phone': '연락처',
      'contact.form.phonePlaceholder': '전화번호를 입력해 주세요',
      'contact.form.subject': '제목',
      'contact.form.subjectPlaceholder': '제목을 선택해 주세요',
      'contact.form.subjects.general': '일반 문의',
      'contact.form.subjects.partnership': '파트너십 상담',
      'contact.form.subjects.support': '기술 지원',
      'contact.form.subjects.complaint': '불만 및 제안',
      'contact.form.message': '메시지 내용',
      'contact.form.messagePlaceholder': '질문이나 요구사항을 자세히 설명해 주세요...',
      'contact.form.submit': '메시지 보내기',
      'contact.form.success': '문의해 주셔서 감사합니다. 최대한 빨리 답변드리겠습니다!',
      'contact.map.title': '찾아오시는 길',
      'contact.map.placeholder': '지도 로딩 중...',
      // Partners
      'partners.title': '파트너',
      'partners.subtitle': '전 세계 우수 기업과 전략적 파트너십을 구축하여 시장을 공동 개척하고 상호 이익이 되는 발전 목표를 달성합니다',
      'partners.fashion.desc': '유럽과 미국에 500개 이상의 매장을 보유한 세계 선도적인 패션 소매 그룹',
      'partners.textile.desc': '고품질 원자재를 제공하는 전문 섬유 공급업체',
      'partners.ecommerce.desc': '온라인 판매 채널 확장을 지원하는 선도적인 전자상거래 플랫폼',
      'partners.logistics.desc': '제품의 빠르고 안전한 배송을 보장하는 전문 물류 서비스 제공업체',
      'partners.design.desc': '최첨단 디자인 컨셉을 제공하는 창의적인 디자인 스튜디오',
      'partners.quality.desc': '제품 품질이 국제 표준에 도달하도록 보장하는 전문 품질 검사 기관',
      'partners.categories.all': '모든 파트너',
      'partners.categories.retail': '소매업체',
      'partners.categories.supplier': '공급업체',
      'partners.categories.technology': '기술 파트너',
      'partners.categories.logistics': '물류 파트너',
      'partners.categories.design': '디자인 파트너',
      'partners.categories.quality': '품질 검사 파트너',
      'partners.advantages.title': '협력 우위',
      'partners.advantages.global.title': '글로벌 네트워크',
      'partners.advantages.global.desc': '전 세계 주요 시장을 커버하는 판매 및 서비스 네트워크',
      'partners.advantages.support.title': '전방위 지원',
      'partners.advantages.support.desc': '기술, 마케팅, 교육 등 전방위 지원 제공',
      'partners.advantages.growth.title': '공동 성장',
      'partners.advantages.growth.desc': '파트너와 성공을 공유하고 상호 이익 실현',
      'partners.join.title': '우리의 파트너가 되세요',
      'partners.join.subtitle': 'YXLP 파트너 네트워크에 참여하여 무한한 비즈니스 기회를 공동 개척하세요',
      'partners.join.benefits.market.title': '시장 확장',
      'partners.join.benefits.market.desc': '새로운 시장 진입 기회 획득',
      'partners.join.benefits.resources.title': '자원 공유',
      'partners.join.benefits.resources.desc': '기술 및 시장 자원 공유',
      'partners.join.benefits.profit.title': '이익 성장',
      'partners.join.benefits.profit.desc': '지속 가능한 이익 성장 실현',
      'partners.join.button': '지금 신청',
      'partners.process.title': '협력 프로세스',
      'partners.process.step1.title': '신청 제출',
      'partners.process.step1.desc': '협력 신청서를 작성하고 관련 자료를 제출',
      'partners.process.step2.title': '자격 심사',
      'partners.process.step2.desc': '귀하의 자격을 종합적으로 평가합니다',
      'partners.process.step3.title': '협력 협상',
      'partners.process.step3.desc': '협력 모델과 구체적인 조건에 대해 심도 있게 논의',
      'partners.process.step4.title': '계약 체결',
      'partners.process.step4.desc': '정식으로 협력 계약을 체결하고 협력을 시작',
      'partners.contact.title': '협력 여정 시작',
      'partners.contact.desc': '더 많은 협력 기회에 대해 알고 싶으신가요? 지금 바로 협력 팀에 문의하세요',
      'partners.contact.button': '문의하기',
      'partners.contact.email': '이메일 보내기',
      // Categories
      'categories.title': '카테고리',
      'categories.subtitle': '제품 카테고리를 둘러보세요',
      'categories.all': '모든 제품',
      'categories.underwear': '속옷',
      'categories.underwear.desc': '속옷, 란제리 등',
      'categories.sportswear': '스포츠웨어',
      'categories.sportswear.desc': '운동복, 피트니스 의류 등',
      'categories.clothing': '의류',
      'categories.clothing.desc': '패션 의류, 스포츠웨어 등',
      'categories.shoes': '신발',
      'categories.shoes.desc': '운동화, 캐주얼 신발 등',
      'categories.bags': '가방',
      'categories.bags.desc': '핸드백, 백팩 등',
      'categories.accessories': '액세서리',
      'categories.accessories.desc': '패션 액세서리, 의류 액세서리 등',
      'categories.viewProducts': '제품 보기',
      // Products
      'products.categories': '제품 카테고리',
      'products.searchPlaceholder': '제품 검색...',
      'products.sort.default': '기본 정렬',
      'products.sort.priceAsc': '가격: 낮은순',
      'products.sort.priceDesc': '가격: 높은순',
      'products.sort.newest': '최신순',
      'products.sort.popular': '인기순',
      'products.casualShirt.name': '캐주얼 셔츠',
      'products.elegantDress.name': '우아한 드레스',
      'products.luxuryBag.name': '럭셔리 핸드백',
      'products.addToCart': '장바구니 담기',
      // News
      'news.title': '뉴스',
      'news.subtitle': '최신 업계 뉴스와 제품 업데이트를 확인하세요',
      'news.categories.all': '전체',
      'news.categories.business': '비즈니스',
      'news.categories.technology': '기술',
      'news.categories.fashion': '패션',
      'news.categories.lifestyle': '라이프스타일',
      'news.readMore': '더 읽기',
      'news.noArticles': '기사를 찾을 수 없습니다',
      // Common
      'common.loading': '로딩 중...',
      'common.error': '오류가 발생했습니다',
      'common.retry': '다시 시도',
    }
  },
  ja: {
    common: {
      'nav.home': 'ホーム',
      'nav.products': '製品',
      'nav.categories': 'カテゴリー',
      'nav.news': 'ニュース',
      'nav.partners': 'パートナー',
      'nav.about': '会社概要',
      'nav.contact': 'お問い合わせ',
      'nav.login': 'ログイン',
      'nav.register': '無料登録',
      'hero.slide1.title': '高品質製品、優秀なサービス',
      'hero.slide1.subtitle': '品質保証、信頼の選択',
      'hero.slide1.description': '厳格な品質管理システムと完璧なアフターサービスネットワークで、お客様に最高品質の製品とサービス体験を提供します',
      'hero.slide1.cta': '製品を見る',
      'hero.slide2.title': '未来のビジネス革新をリードする',
      'hero.slide2.subtitle': 'YXLP - あなたのデジタル変革パートナー',
      'hero.slide2.description': '企業向けの包括的なデジタルソリューションの提供に集中し、デジタル時代における企業の飛躍的発展を支援します',
      'hero.slide2.cta': '詳細を見る',
      'hero.slide3.title': 'グローバル協力、共に未来を創造',
      'hero.slide3.subtitle': '共に歩み、Win-Win協力',
      'hero.slide3.description': '世界の優秀な企業と戦略的パートナーシップを構築し、市場を共同開拓し、相互利益となる発展目標を達成します',
      'hero.slide3.cta': 'パートナーになる',
      'hero.watchVideo': 'ビデオを見る',
      'advantages.title': 'YXLPファッションを選ぶ理由',
      'advantages.subtitle': 'ファッション分野での長年の専門性により、お客様に最高品質の衣料品と専門的なファッションスタイリングサービスを提供します',
      'products.title': '厳選された衣料品',
      'products.subtitle': '世界の高品質衣料品ブランドを集め、ファッショナブルで多様な選択肢を提供します',
      'products.view_all': 'すべての製品を見る',
      'about.title': 'YXLPについて',
      'contact.title': 'お問い合わせ',
      'contact.subtitle': 'ご質問や協力のご意向がございましたら、いつでもお気軽にお問い合わせください',
      // About
      'about.subtitle': 'ファッション分野での長年の専門性により、お客様に最高品質の衣料品と専門的なファッションスタイリングサービスを提供します',
      'about.company.title': '会社概要',
      'about.company.desc1': 'YXLPは2010年に設立され、衣料品のデザイン、生産、販売を専門とする現代的な企業です。世界中のお客様に高品質の衣料品と専門的なファッションソリューションを提供することに取り組んでいます。',
      'about.company.desc2': '10年以上の発展を経て、完全なサプライチェーンシステムと品質管理システムを構築しました。製品はヨーロッパ、アメリカ、アジア太平洋地域など多くの国と地域に輸出され、お客様から深く信頼されています。',
      'about.company.desc3': '私たちは「品質第一、お客様第一」の経営理念を堅持し、継続的にデザインを革新し、生産プロセスを最適化し、お客様により大きな価値を創造します。',
      'about.company.imageAlt': '会社のオフィス環境',
      'about.values.title': 'コアバリュー',
      'about.values.quality.title': '品質至上',
      'about.values.quality.desc': '厳格な品質管理システムにより、すべての製品が最高基準を満たすことを保証します',
      'about.values.innovation.title': '継続的革新',
      'about.values.innovation.desc': 'ファッショントレンドに追従し、革新的なデザインと高品質製品を継続的に発表します',
      'about.values.service.title': '優秀なサービス',
      'about.values.service.desc': '専門的なサービスチームがお客様に包括的なサポートを提供します',
      'about.values.trust.title': '信頼できるパートナー',
      'about.values.trust.desc': '長期的なパートナーシップを構築し、お客様と共に成長します',
      'about.team.title': '私たちのチーム',
      'about.team.desc': '経験豊富な専門家チームが、デザインから生産まで全プロセスをサポートします',
      'about.team.design.title': 'デザインチーム',
      'about.team.design.desc': '創造的なデザイナーが最新のファッショントレンドを追求します',
      'about.team.production.title': '生産チーム',
      'about.team.production.desc': '熟練した技術者が高品質な製品を保証します',
      'about.team.quality.title': '品質管理チーム',
      'about.team.quality.desc': '厳格な品質基準により製品の優秀性を確保します',
      'about.team.sales.title': '営業チーム',
      'about.team.sales.desc': '専門的な営業チームがお客様に最適なソリューションを提供します',
      'about.history.title': '発展の歴史',
      'about.history.2010.title': '2010年 - 会社設立',
      'about.history.2010.desc': 'YXLPが正式に設立され、衣料品業界への参入を開始',
      'about.history.2015.title': '2015年 - 国際展開',
      'about.history.2015.desc': '海外市場への展開を開始し、ヨーロッパとアメリカ市場に参入',
      'about.history.2018.title': '2018年 - 技術革新',
      'about.history.2018.desc': '先進的な生産設備を導入し、生産効率と品質を大幅に向上',
      'about.history.2020.title': '2020年 - デジタル変革',
      'about.history.2020.desc': 'デジタル化プロセスを開始し、オンライン販売プラットフォームを構築',
      'about.history.2023.title': '2023年 - 持続可能な発展',
      'about.history.2023.desc': '環境に優しい生産プロセスを採用し、持続可能な発展戦略を実施',
      'about.mission.title': '私たちの使命',
      'about.mission.desc': '高品質の衣料品を通じて、お客様の生活をより美しく、より自信に満ちたものにします',
      'about.vision.title': '私たちのビジョン',
      'about.vision.desc': '世界をリードするファッションブランドになり、グローバルなお客様に優秀な製品とサービスを提供します',
      'about.contact.title': 'お問い合わせ',
      'about.contact.desc': '私たちとの協力にご興味がございましたら、お気軽にお問い合わせください',
      'about.contact.button': 'お問い合わせ',
      // Contact
      'contact.info.title': '連絡先情報',
      'contact.info.address.title': '会社住所',
      'contact.info.address.value': '中国上海市浦東新区張江ハイテクパーク',
      'contact.info.phone.title': '連絡電話',
      'contact.info.email.title': 'メールアドレス',
      'contact.info.hours.title': '営業時間',
      'contact.info.hours.value': '月曜日から金曜日 9:00-18:00',
      'contact.social.title': 'フォローする',
      'contact.form.title': 'メッセージを送信',
      'contact.form.name': '氏名',
      'contact.form.namePlaceholder': 'お名前を入力してください',
      'contact.form.email': 'メール',
      'contact.form.emailPlaceholder': 'メールアドレスを入力してください',
      'contact.form.company': '会社名',
      'contact.form.companyPlaceholder': '会社名を入力してください',
      'contact.form.phone': '連絡電話',
      'contact.form.phonePlaceholder': '電話番号を入力してください',
      'contact.form.subject': '件名',
      'contact.form.subjectPlaceholder': '件名を選択してください',
      'contact.form.subjects.general': '一般的なお問い合わせ',
      'contact.form.subjects.partnership': '提携相談',
      'contact.form.subjects.support': '技術サポート',
      'contact.form.subjects.complaint': '苦情・提案',
      'contact.form.message': 'メッセージ内容',
      'contact.form.messagePlaceholder': 'ご質問やご要望を詳しくお書きください...',
      'contact.form.submit': 'メッセージを送信',
      'contact.form.success': 'お問い合わせありがとうございます。できるだけ早くご返信いたします！',
      'contact.map.title': '私たちを見つける',
      'contact.map.placeholder': 'マップを読み込み中...',
      // Partners
      'partners.title': 'パートナー',
      'partners.subtitle': '世界の優秀な企業と戦略的パートナーシップを構築し、市場を共同開拓し、相互利益となる発展目標を達成します',
      'partners.fashion.desc': 'ヨーロッパとアメリカで500店舗以上を展開する世界をリードするファッション小売グループ',
      'partners.textile.desc': '高品質な原材料を提供する専門的な繊維サプライヤー',
      'partners.ecommerce.desc': 'オンライン販売チャネルの拡大を支援する大手eコマースプラットフォーム',
      'partners.logistics.desc': '製品の迅速で安全な配送を保証する専門的な物流サービスプロバイダー',
      'partners.design.desc': '最先端のデザインコンセプトを提供するクリエイティブデザインスタジオ',
      'partners.quality.desc': '製品品質が国際基準に達することを保証する専門的な品質検査機関',
      'partners.categories.all': 'すべてのパートナー',
      'partners.categories.retail': '小売業者',
      'partners.categories.supplier': 'サプライヤー',
      'partners.categories.technology': '技術パートナー',
      'partners.categories.logistics': '物流パートナー',
      'partners.categories.design': 'デザインパートナー',
      'partners.categories.quality': '品質検査パートナー',
      'partners.advantages.title': '協力の優位性',
      'partners.advantages.global.title': 'グローバルネットワーク',
      'partners.advantages.global.desc': '世界主要市場をカバーする販売・サービスネットワーク',
      'partners.advantages.support.title': '全面的なサポート',
      'partners.advantages.support.desc': '技術、マーケティング、トレーニングなど全面的なサポートを提供',
      'partners.advantages.growth.title': '共同成長',
      'partners.advantages.growth.desc': 'パートナーと成功を共有し、相互利益を実現',
      'partners.join.title': '私たちのパートナーになる',
      'partners.join.subtitle': 'YXLPパートナーネットワークに参加し、無限のビジネスチャンスを共同開拓',
      'partners.join.benefits.market.title': '市場拡大',
      'partners.join.benefits.market.desc': '新市場参入機会の獲得',
      'partners.join.benefits.resources.title': 'リソース共有',
      'partners.join.benefits.resources.desc': '技術と市場リソースの共有',
      'partners.join.benefits.profit.title': '利益成長',
      'partners.join.benefits.profit.desc': '持続可能な利益成長の実現',
      'partners.join.button': '今すぐ申請',
      'partners.process.title': '協力プロセス',
      'partners.process.step1.title': '申請提出',
      'partners.process.step1.desc': '協力申請書を記入し、関連資料を提出',
      'partners.process.step2.title': '資格審査',
      'partners.process.step2.desc': 'お客様の資格を総合的に評価いたします',
      'partners.process.step3.title': '協力交渉',
      'partners.process.step3.desc': '協力モデルと具体的な条項について詳しく話し合い',
      'partners.process.step4.title': '契約締結',
      'partners.process.step4.desc': '正式に協力契約を締結し、協力を開始',
      'partners.contact.title': '協力の旅を始める',
      'partners.contact.desc': 'より多くの協力機会について知りたいですか？今すぐ協力チームにお問い合わせください',
      'partners.contact.button': 'お問い合わせ',
      'partners.contact.email': 'メールを送信',
      // Categories
      'categories.title': 'カテゴリー',
      'categories.subtitle': '製品カテゴリーをご覧ください',
      'categories.all': 'すべての製品',
      'categories.underwear': '下着',
      'categories.underwear.desc': '下着、ランジェリーなど',
      'categories.sportswear': 'スポーツウェア',
      'categories.sportswear.desc': '運動服、フィットネス衣料など',
      'categories.clothing': '衣料品',
      'categories.clothing.desc': 'ファッション衣料、スポーツウェアなど',
      'categories.shoes': '靴',
      'categories.shoes.desc': 'スニーカー、カジュアルシューズなど',
      'categories.bags': 'バッグ',
      'categories.bags.desc': 'ハンドバッグ、バックパックなど',
      'categories.accessories': 'アクセサリー',
      'categories.accessories.desc': 'ファッションアクセサリー、衣料アクセサリーなど',
      'categories.viewProducts': '製品を見る',
      // Products
      'products.categories': '製品カテゴリー',
      'products.searchPlaceholder': '製品を検索...',
      'products.sort.default': 'デフォルト並び替え',
      'products.sort.priceAsc': '価格: 安い順',
      'products.sort.priceDesc': '価格: 高い順',
      'products.sort.newest': '新着順',
      'products.sort.popular': '人気順',
      'products.casualShirt.name': 'カジュアルシャツ',
      'products.elegantDress.name': 'エレガントドレス',
      'products.luxuryBag.name': 'ラグジュアリーハンドバッグ',
      'products.addToCart': 'カートに追加',
      // News
      'news.title': 'ニュース',
      'news.subtitle': '最新の業界ニュースと製品アップデートをご確認ください',
      'news.categories.all': 'すべて',
      'news.categories.business': 'ビジネス',
      'news.categories.technology': 'テクノロジー',
      'news.categories.fashion': 'ファッション',
      'news.categories.lifestyle': 'ライフスタイル',
      'news.readMore': 'もっと読む',
      'news.noArticles': '記事が見つかりません',
      // Common
      'common.loading': '読み込み中...',
      'common.error': 'エラーが発生しました',
      'common.retry': '再試行',
    }
  },
  de: {
    common: {
      'nav.home': 'Startseite',
      'nav.products': 'Produkte',
      'nav.categories': 'Kategorien',
      'nav.news': 'Nachrichten',
      'nav.partners': 'Partner',
      'nav.about': 'Über uns',
      'nav.contact': 'Kontakt',
      'nav.login': 'Anmelden',
      'nav.register': 'Kostenlos registrieren',
      'hero.slide1.title': 'Qualitätsprodukte, Exzellenter Service',
      'hero.slide1.subtitle': 'Qualitätsgarantie, Vertrauenswürdige Wahl',
      'hero.slide1.description': 'Strenges Qualitätskontrollsystem und umfassendes Kundendienst-Netzwerk, um Kunden die höchste Qualität von Produkten und Serviceerfahrung zu bieten',
      'hero.slide1.cta': 'Produkte ansehen',
      'hero.slide2.title': 'Führend in zukünftiger Geschäftsinnovation',
      'hero.slide2.subtitle': 'YXLP - Ihr Partner für digitale Transformation',
      'hero.slide2.description': 'Fokussiert auf die Bereitstellung umfassender digitaler Lösungen für Unternehmen und hilft Unternehmen dabei, sprunghafte Entwicklung im digitalen Zeitalter zu erreichen',
      'hero.slide2.cta': 'Mehr erfahren',
      'hero.slide3.title': 'Globale Zusammenarbeit, Gemeinsam die Zukunft gestalten',
      'hero.slide3.subtitle': 'Zusammenarbeiten, Win-Win-Kooperation',
      'hero.slide3.description': 'Strategische Partnerschaften mit exzellenten globalen Unternehmen aufbauen, Märkte gemeinsam erschließen und gegenseitig vorteilhafte Entwicklungsziele erreichen',
      'hero.slide3.cta': 'Partner werden',
      'hero.watchVideo': 'Video ansehen',
      'advantages.title': 'Warum YXLP Mode wählen',
      'advantages.subtitle': 'Jahrelange Fokussierung auf die Modebranche, um Kunden die höchste Qualität von Bekleidungsprodukten und professionelle Mode-Styling-Services zu bieten',
      'products.title': 'Ausgewählte Bekleidung',
      'products.subtitle': 'Zusammenführung globaler Qualitäts-Bekleidungsmarken, um Ihnen modische und vielfältige Auswahlmöglichkeiten zu bieten',
      'products.view_all': 'Alle Produkte ansehen',
      'about.title': 'Über YXLP',
      'contact.title': 'Kontaktieren Sie uns',
      'contact.subtitle': 'Wenn Sie Fragen haben oder Kooperationsabsichten haben, zögern Sie nicht, uns jederzeit zu kontaktieren',
      // About
      'about.subtitle': 'Jahrelange Fokussierung auf die Modebranche, um Kunden die höchste Qualität von Bekleidungsprodukten und professionelle Mode-Styling-Services zu bieten',
      'about.company.title': 'Unternehmensprofil',
      'about.company.desc1': 'YXLP wurde 2010 gegründet und ist ein modernes Unternehmen, das sich auf Bekleidungsdesign, -produktion und -verkauf spezialisiert hat. Wir sind bestrebt, globalen Kunden hochwertige Bekleidungsprodukte und professionelle Modelösungen zu bieten.',
      'about.company.desc2': 'Nach mehr als zehn Jahren der Entwicklung haben wir ein vollständiges Lieferkettensystem und Qualitätsmanagementsystem aufgebaut. Unsere Produkte werden nach Europa, Amerika, Asien-Pazifik und andere Länder und Regionen exportiert und sind bei Kunden sehr vertrauenswürdig.',
      'about.company.desc3': 'Wir halten an der Geschäftsphilosophie "Qualität zuerst, Kunde zuerst" fest, innovieren kontinuierlich das Design, optimieren Produktionsprozesse und schaffen größeren Wert für Kunden.',
      'about.company.imageAlt': 'Büroumgebung des Unternehmens',
      'about.values.title': 'Kernwerte',
      'about.values.quality.title': 'Qualität an erster Stelle',
      'about.values.quality.desc': 'Strenges Qualitätskontrollsystem, um sicherzustellen, dass jedes Produkt den höchsten Standards entspricht',
      'about.values.innovation.title': 'Kontinuierliche Innovation',
      'about.values.innovation.desc': 'Mit Modetrends Schritt halten und kontinuierlich innovative Designs und Qualitätsprodukte einführen',
      'about.values.service.title': 'Exzellenter Service',
      'about.values.service.desc': 'Professionelles Serviceteam bietet Kunden umfassende Unterstützung',
      'about.values.trust.title': 'Vertrauensvoller Partner',
      'about.values.trust.desc': 'Langfristige Partnerschaften aufbauen und gemeinsam mit Kunden wachsen',
      'about.team.title': 'Unser Team',
      'about.team.desc': 'Erfahrenes Expertenteam unterstützt den gesamten Prozess vom Design bis zur Produktion',
      'about.team.design.title': 'Design-Team',
      'about.team.design.desc': 'Kreative Designer verfolgen die neuesten Modetrends',
      'about.team.production.title': 'Produktionsteam',
      'about.team.production.desc': 'Erfahrene Techniker gewährleisten hochwertige Produkte',
      'about.team.quality.title': 'Qualitätskontrollteam',
      'about.team.quality.desc': 'Strenge Qualitätsstandards gewährleisten Produktexzellenz',
      'about.team.sales.title': 'Vertriebsteam',
      'about.team.sales.desc': 'Professionelles Vertriebsteam bietet Kunden optimale Lösungen',
      'about.history.title': 'Entwicklungsgeschichte',
      'about.history.2010.title': '2010 - Unternehmensgründung',
      'about.history.2010.desc': 'YXLP wurde offiziell gegründet und begann den Eintritt in die Bekleidungsindustrie',
      'about.history.2015.title': '2015 - Internationale Expansion',
      'about.history.2015.desc': 'Beginn der Expansion in Übersee-Märkte, Eintritt in europäische und amerikanische Märkte',
      'about.history.2018.title': '2018 - Technologische Innovation',
      'about.history.2018.desc': 'Einführung fortschrittlicher Produktionsausrüstung, erhebliche Verbesserung der Produktionseffizienz und -qualität',
      'about.history.2020.title': '2020 - Digitale Transformation',
      'about.history.2020.desc': 'Beginn des Digitalisierungsprozesses und Aufbau einer Online-Verkaufsplattform',
      'about.history.2023.title': '2023 - Nachhaltige Entwicklung',
      'about.history.2023.desc': 'Annahme umweltfreundlicher Produktionsprozesse und Umsetzung nachhaltiger Entwicklungsstrategien',
      'about.mission.title': 'Unsere Mission',
      'about.mission.desc': 'Durch hochwertige Bekleidung das Leben der Kunden schöner und selbstbewusster machen',
      'about.vision.title': 'Unsere Vision',
      'about.vision.desc': 'Eine weltweit führende Modemarke werden und globalen Kunden exzellente Produkte und Services bieten',
      'about.contact.title': 'Kontakt',
      'about.contact.desc': 'Wenn Sie an einer Zusammenarbeit mit uns interessiert sind, zögern Sie nicht, uns zu kontaktieren',
      'about.contact.button': 'Kontaktieren',
      // Contact
      'contact.info.title': 'Kontaktinformationen',
      'contact.info.address.title': 'Firmenadresse',
      'contact.info.address.value': 'Zhangjiang High-Tech Park, Pudong New Area, Shanghai, China',
      'contact.info.phone.title': 'Telefon',
      'contact.info.email.title': 'E-Mail-Adresse',
      'contact.info.hours.title': 'Geschäftszeiten',
      'contact.info.hours.value': 'Montag bis Freitag 9:00-18:00',
      'contact.social.title': 'Folgen Sie uns',
      'contact.form.title': 'Nachricht senden',
      'contact.form.name': 'Name',
      'contact.form.namePlaceholder': 'Bitte geben Sie Ihren Namen ein',
      'contact.form.email': 'E-Mail',
      'contact.form.emailPlaceholder': 'Bitte geben Sie Ihre E-Mail ein',
      'contact.form.company': 'Firmenname',
      'contact.form.companyPlaceholder': 'Bitte geben Sie den Firmennamen ein',
      'contact.form.phone': 'Telefonnummer',
      'contact.form.phonePlaceholder': 'Bitte geben Sie Ihre Telefonnummer ein',
      'contact.form.subject': 'Betreff',
      'contact.form.subjectPlaceholder': 'Bitte wählen Sie einen Betreff',
      'contact.form.subjects.general': 'Allgemeine Anfrage',
      'contact.form.subjects.partnership': 'Partnerschaft',
      'contact.form.subjects.support': 'Technischer Support',
      'contact.form.subjects.complaint': 'Beschwerde & Vorschlag',
      'contact.form.message': 'Nachricht',
      'contact.form.messagePlaceholder': 'Bitte beschreiben Sie Ihre Frage oder Anforderungen im Detail...',
      'contact.form.submit': 'Nachricht senden',
      'contact.form.success': 'Vielen Dank für Ihre Nachricht, wir werden so schnell wie möglich antworten!',
      'contact.map.title': 'Finden Sie uns',
      'contact.map.placeholder': 'Karte wird geladen...',
      // Partners
      'partners.title': 'Partner',
      'partners.subtitle': 'Strategische Partnerschaften mit exzellenten globalen Unternehmen aufbauen, Märkte gemeinsam erschließen und gegenseitig vorteilhafte Entwicklungsziele erreichen',
      'partners.fashion.desc': 'Weltweit führende Modehandelsgruppe mit über 500 Geschäften in Europa und Amerika',
      'partners.textile.desc': 'Professioneller Textillieferant, der uns hochwertige Rohstoffe liefert',
      'partners.ecommerce.desc': 'Führende E-Commerce-Plattform, die uns bei der Erweiterung der Online-Verkaufskanäle hilft',
      'partners.logistics.desc': 'Professioneller Logistikdienstleister, der schnelle und sichere Produktlieferung gewährleistet',
      'partners.design.desc': 'Kreatives Designstudio, das uns modernste Designkonzepte liefert',
      'partners.quality.desc': 'Professionelle Qualitätsprüfungseinrichtung, die sicherstellt, dass die Produktqualität internationale Standards erreicht',
      'partners.categories.all': 'Alle Partner',
      'partners.categories.retail': 'Einzelhändler',
      'partners.categories.supplier': 'Lieferanten',
      'partners.categories.technology': 'Technologiepartner',
      'partners.categories.logistics': 'Logistikpartner',
      'partners.categories.design': 'Designpartner',
      'partners.categories.quality': 'Qualitätsprüfungspartner',
      'partners.advantages.title': 'Kooperationsvorteile',
      'partners.advantages.global.title': 'Globales Netzwerk',
      'partners.advantages.global.desc': 'Verkaufs- und Servicenetzwerk, das die wichtigsten Märkte weltweit abdeckt',
      'partners.advantages.support.title': 'Umfassende Unterstützung',
      'partners.advantages.support.desc': 'Bereitstellung umfassender Unterstützung in Technologie, Marketing, Schulung usw.',
      'partners.advantages.growth.title': 'Gemeinsames Wachstum',
      'partners.advantages.growth.desc': 'Erfolg mit Partnern teilen und gegenseitigen Nutzen realisieren',
      'partners.join.title': 'Werden Sie unser Partner',
      'partners.join.subtitle': 'Treten Sie dem YXLP-Partnernetzwerk bei und erschließen Sie gemeinsam unbegrenzte Geschäftsmöglichkeiten',
      'partners.join.benefits.market.title': 'Markterweiterung',
      'partners.join.benefits.market.desc': 'Neue Marktzugangsmöglichkeiten erhalten',
      'partners.join.benefits.resources.title': 'Ressourcen teilen',
      'partners.join.benefits.resources.desc': 'Technologie- und Marktressourcen teilen',
      'partners.join.benefits.profit.title': 'Gewinnwachstum',
      'partners.join.benefits.profit.desc': 'Nachhaltiges Gewinnwachstum realisieren',
      'partners.join.button': 'Jetzt bewerben',
      'partners.process.title': 'Kooperationsprozess',
      'partners.process.step1.title': 'Antrag einreichen',
      'partners.process.step1.desc': 'Kooperationsantrag ausfüllen und relevante Unterlagen einreichen',
      'partners.process.step2.title': 'Qualifikationsprüfung',
      'partners.process.step2.desc': 'Wir werden Ihre Qualifikationen umfassend bewerten',
      'partners.process.step3.title': 'Kooperationsverhandlung',
      'partners.process.step3.desc': 'Eingehende Diskussion über Kooperationsmodell und spezifische Bedingungen',
      'partners.process.step4.title': 'Vertragsunterzeichnung',
      'partners.process.step4.desc': 'Offiziell Kooperationsvertrag unterzeichnen und Kooperation beginnen',
      'partners.contact.title': 'Kooperationsreise beginnen',
      'partners.contact.desc': 'Möchten Sie mehr über Kooperationsmöglichkeiten erfahren? Kontaktieren Sie sofort unser Kooperationsteam',
      'partners.contact.button': 'Kontaktieren',
      'partners.contact.email': 'E-Mail senden',
      // Categories
      'categories.title': 'Kategorien',
      'categories.all': 'Alle Produkte',
      'categories.underwear': 'Unterwäsche',
      'categories.underwear.desc': 'Unterwäsche, Dessous usw.',
      'categories.sportswear': 'Sportbekleidung',
      'categories.sportswear.desc': 'Sportkleidung, Fitness-Bekleidung usw.',
      'categories.clothing': 'Bekleidung',
      'categories.clothing.desc': 'Mode, Sportbekleidung usw.',
      'categories.shoes': 'Schuhe',
      'categories.shoes.desc': 'Sneaker, Freizeitschuhe usw.',
      'categories.bags': 'Taschen',
      'categories.bags.desc': 'Handtaschen, Rucksäcke usw.',
      'categories.accessories': 'Accessoires',
      'categories.accessories.desc': 'Mode-Accessoires, Bekleidungs-Accessoires usw.',
      // Products
      'products.categories': 'Produktkategorien',
      'products.casualShirt.name': 'Freizeithemd',
      'products.elegantDress.name': 'Elegantes Kleid',
      'products.luxuryBag.name': 'Luxus-Handtasche',
      // News
      'news.title': 'Nachrichten',
      'news.categories.all': 'Alle',
      'news.categories.business': 'Geschäft',
      'news.categories.technology': 'Technologie',
      'news.categories.fashion': 'Mode',
      'news.categories.lifestyle': 'Lebensstil',
      'news.readMore': 'Mehr lesen',
      'news.noArticles': 'Keine Artikel gefunden',
      // Common
      'common.loading': 'Laden...',
      'common.error': 'Fehler aufgetreten',
      'common.retry': 'Wiederholen',
    }
  },
  es: {
    common: {
      'nav.home': 'Inicio',
      'nav.products': 'Productos',
      'nav.categories': 'Categorías',
      'nav.news': 'Noticias',
      'nav.partners': 'Socios',
      'nav.about': 'Acerca de',
      'nav.contact': 'Contacto',
      'nav.login': 'Iniciar sesión',
      'nav.register': 'Registro gratuito',
      'hero.slide1.title': 'Productos de Calidad, Servicio Excelente',
      'hero.slide1.subtitle': 'Garantía de Calidad, Elección Confiable',
      'hero.slide1.description': 'Sistema estricto de control de calidad y red completa de servicio postventa para brindar a los clientes la más alta calidad de productos y experiencia de servicio',
      'hero.slide1.cta': 'Ver Productos',
      'hero.slide2.title': 'Liderando la Innovación Empresarial Futura',
      'hero.slide2.subtitle': 'YXLP - Su Socio de Transformación Digital',
      'hero.slide2.description': 'Enfocado en proporcionar soluciones digitales integrales para empresas, ayudando a las empresas a lograr un desarrollo de salto en la era digital',
      'hero.slide2.cta': 'Saber Más',
      'hero.slide3.title': 'Cooperación Global, Creando el Futuro Juntos',
      'hero.slide3.subtitle': 'Trabajando Juntos, Cooperación Ganar-Ganar',
      'hero.slide3.description': 'Establecer asociaciones estratégicas con excelentes empresas globales, explorar mercados conjuntamente y lograr objetivos de desarrollo mutuamente beneficiosos',
      'hero.slide3.cta': 'Convertirse en Socio',
      'hero.watchVideo': 'Ver Video',
      'advantages.title': 'Por Qué Elegir YXLP Moda',
      'advantages.subtitle': 'Años de enfoque en la industria de la moda, brindando a los clientes productos de vestimenta de la más alta calidad y servicios profesionales de estilismo de moda',
      'products.title': 'Ropa Seleccionada',
      'products.subtitle': 'Reuniendo marcas de ropa de calidad global para ofrecerle opciones de moda y diversas',
      'products.view_all': 'Ver Todos los Productos',
      'about.title': 'Acerca de YXLP',
      'contact.title': 'Contáctanos',
      'contact.subtitle': 'Si tiene alguna pregunta o intención de cooperación, no dude en contactarnos en cualquier momento',
      // About
      'about.subtitle': 'Años de enfoque en la industria de la moda, brindando a los clientes productos de vestimenta de la más alta calidad y servicios profesionales de estilismo de moda',
      'about.company.title': 'Perfil de la Empresa',
      'about.company.desc1': 'YXLP fue fundada en 2010 como una empresa moderna especializada en diseño, producción y venta de ropa. Nos comprometemos a brindar a los clientes globales productos de ropa de alta calidad y soluciones de moda profesionales.',
      'about.company.desc2': 'Después de más de diez años de desarrollo, hemos establecido un sistema completo de cadena de suministro y sistema de gestión de calidad. Nuestros productos se exportan a Europa, América, Asia-Pacífico y otras regiones, y son profundamente confiados por los clientes.',
      'about.company.desc3': 'Nos adherimos a la filosofía empresarial de "calidad primero, cliente primero", innovamos continuamente el diseño, optimizamos los procesos de producción y creamos mayor valor para los clientes.',
      'about.company.imageAlt': 'Ambiente de oficina de la empresa',
      'about.values.title': 'Valores Fundamentales',
      'about.values.quality.title': 'Calidad Primero',
      'about.values.quality.desc': 'Sistema estricto de control de calidad para garantizar que cada producto cumpla con los más altos estándares',
      'about.values.innovation.title': 'Innovación Continua',
      'about.values.innovation.desc': 'Mantenerse al día con las tendencias de la moda y lanzar continuamente diseños innovadores y productos de calidad',
      'about.values.service.title': 'Servicio Excelente',
      'about.values.service.desc': 'Equipo de servicio profesional brinda apoyo integral a los clientes',
      'about.values.trust.title': 'Socio Confiable',
      'about.values.trust.desc': 'Construir asociaciones a largo plazo y crecer junto con los clientes',
      'about.team.title': 'Nuestro Equipo',
      'about.team.desc': 'Equipo de expertos experimentados apoya todo el proceso desde el diseño hasta la producción',
      'about.team.design.title': 'Equipo de Diseño',
      'about.team.design.desc': 'Diseñadores creativos persiguen las últimas tendencias de la moda',
      'about.team.production.title': 'Equipo de Producción',
      'about.team.production.desc': 'Técnicos experimentados garantizan productos de alta calidad',
      'about.team.quality.title': 'Equipo de Control de Calidad',
      'about.team.quality.desc': 'Estándares de calidad estrictos aseguran la excelencia del producto',
      'about.team.sales.title': 'Equipo de Ventas',
      'about.team.sales.desc': 'Equipo de ventas profesional proporciona soluciones óptimas a los clientes',
      'about.history.title': 'Historia de Desarrollo',
      'about.history.2010.title': '2010 - Fundación de la Empresa',
      'about.history.2010.desc': 'YXLP fue oficialmente establecida y comenzó a ingresar a la industria de la ropa',
      'about.history.2015.title': '2015 - Expansión Internacional',
      'about.history.2015.desc': 'Comenzó la expansión a mercados extranjeros, ingresando a mercados europeos y americanos',
      'about.history.2018.title': '2018 - Innovación Tecnológica',
      'about.history.2018.desc': 'Introdujo equipos de producción avanzados, mejorando significativamente la eficiencia y calidad de producción',
      'about.history.2020.title': '2020 - Transformación Digital',
      'about.history.2020.desc': 'Comenzó el proceso de digitalización y construyó una plataforma de ventas en línea',
      'about.history.2023.title': '2023 - Desarrollo Sostenible',
      'about.history.2023.desc': 'Adoptó procesos de producción ecológicos e implementó estrategias de desarrollo sostenible',
      'about.mission.title': 'Nuestra Misión',
      'about.mission.desc': 'A través de ropa de alta calidad, hacer que la vida de los clientes sea más hermosa y confiada',
      'about.vision.title': 'Nuestra Visión',
      'about.vision.desc': 'Convertirse en una marca de moda líder mundial y brindar productos y servicios excelentes a clientes globales',
      'about.contact.title': 'Contacto',
      'about.contact.desc': 'Si está interesado en cooperar con nosotros, no dude en contactarnos',
      'about.contact.button': 'Contactar',
      // Categories
      'categories.title': 'Categorías',
      'categories.all': 'Todos los Productos',
      'categories.electronics': 'Electrónicos',
      'categories.electronics.desc': 'Dispositivos inteligentes, productos digitales, etc.',
      'categories.clothing': 'Ropa',
      'categories.clothing.desc': 'Moda, ropa deportiva, etc.',
      'categories.shoes': 'Zapatos',
      'categories.shoes.desc': 'Zapatillas, zapatos casuales, etc.',
      'categories.bags': 'Bolsos',
      'categories.bags.desc': 'Bolsos de mano, mochilas, etc.',
      'categories.accessories': 'Accesorios',
      'categories.accessories.desc': 'Joyas, relojes, etc.',
      'categories.home': 'Hogar y Vida',
      'categories.home.desc': 'Muebles, decoraciones, etc.',
      // Products
      'products.categories': 'Categorías de Productos',
      'products.techWatch.name': 'Reloj Inteligente',
      'products.smartphone.name': 'Teléfono Inteligente',
      'products.luxuryBag.name': 'Bolso de Lujo',
      // News
      'news.title': 'Noticias',
      'news.categories.all': 'Todo',
      'news.categories.business': 'Negocios',
      'news.categories.technology': 'Tecnología',
      'news.categories.fashion': 'Moda',
      'news.categories.lifestyle': 'Estilo de Vida',
      'news.readMore': 'Leer Más',
      'news.noArticles': 'No se encontraron artículos',
      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Error ocurrido',
      'common.retry': 'Reintentar',
    }
  },
  ru: {
    common: {
      'nav.home': 'Главная',
      'nav.products': 'Продукты',
      'nav.categories': 'Категории',
      'nav.news': 'Новости',
      'nav.partners': 'Партнеры',
      'nav.about': 'О нас',
      'nav.contact': 'Контакты',
      'nav.login': 'Войти',
      'nav.register': 'Бесплатная регистрация',
      'hero.slide1.title': 'Качественные Продукты, Отличный Сервис',
      'hero.slide1.subtitle': 'Гарантия Качества, Надежный Выбор',
      'hero.slide1.description': 'Строгая система контроля качества и комплексная сеть послепродажного обслуживания для предоставления клиентам продуктов высочайшего качества и сервисного опыта',
      'hero.slide1.cta': 'Посмотреть Продукты',
      'hero.slide2.title': 'Ведущие Инновации Будущего Бизнеса',
      'hero.slide2.subtitle': 'YXLP - Ваш Партнер по Цифровой Трансформации',
      'hero.slide2.description': 'Сосредоточены на предоставлении комплексных цифровых решений для предприятий, помогая бизнесу достичь скачкообразного развития в цифровую эпоху',
      'hero.slide2.cta': 'Узнать Больше',
      'hero.slide3.title': 'Глобальное Сотрудничество, Создавая Будущее Вместе',
      'hero.slide3.subtitle': 'Работая Вместе, Взаимовыгодное Сотрудничество',
      'hero.slide3.description': 'Установление стратегических партнерств с отличными глобальными предприятиями, совместное освоение рынков и достижение взаимовыгодных целей развития',
      'hero.slide3.cta': 'Стать Партнером',
      'hero.watchVideo': 'Смотреть Видео',
      'advantages.title': 'Почему Выбрать YXLP Моду',
      'advantages.subtitle': 'Годы сосредоточения на индустрии моды, предоставляя клиентам одежду высочайшего качества и профессиональные услуги модного стайлинга',
      'products.title': 'Отобранная Одежда',
      'products.subtitle': 'Объединяя глобальные качественные бренды одежды, чтобы предложить вам модные и разнообразные варианты',
      'products.view_all': 'Посмотреть Все Продукты',
      'about.title': 'О YXLP',
      'contact.title': 'Свяжитесь с Нами',
      'contact.subtitle': 'Если у вас есть вопросы или намерения сотрудничества, не стесняйтесь обращаться к нам в любое время',
      // About
      'about.subtitle': 'Годы сосредоточения на индустрии моды, предоставляя клиентам одежду высочайшего качества и профессиональные услуги модного стайлинга',
      'about.company.title': 'Профиль Компании',
      'about.company.desc1': 'YXLP была основана в 2010 году как современное предприятие, специализирующееся на дизайне, производстве и продаже одежды. Мы стремимся предоставлять глобальным клиентам высококачественные продукты одежды и профессиональные модные решения.',
      'about.company.desc2': 'После более чем десяти лет развития мы построили полную систему цепочки поставок и систему управления качеством. Наши продукты экспортируются в Европу, Америку, Азиатско-Тихоокеанский регион и другие страны и регионы, и глубоко доверяются клиентами.',
      'about.company.desc3': 'Мы придерживаемся бизнес-философии "качество прежде всего, клиент прежде всего", постоянно внедряем инновации в дизайн, оптимизируем производственные процессы и создаем большую ценность для клиентов.',
      'about.company.imageAlt': 'Офисная среда компании',
      'about.values.title': 'Основные Ценности',
      'about.values.quality.title': 'Качество Прежде Всего',
      'about.values.quality.desc': 'Строгая система контроля качества для обеспечения соответствия каждого продукта высочайшим стандартам',
      'about.values.innovation.title': 'Непрерывные Инновации',
      'about.values.innovation.desc': 'Следование модным трендам и постоянный выпуск инновационных дизайнов и качественных продуктов',
      'about.values.service.title': 'Отличный Сервис',
      'about.values.service.desc': 'Профессиональная команда сервиса предоставляет клиентам всестороннюю поддержку',
      'about.values.trust.title': 'Надежный Партнер',
      'about.values.trust.desc': 'Построение долгосрочных партнерств и рост вместе с клиентами',
      'about.team.title': 'Наша Команда',
      'about.team.desc': 'Опытная команда экспертов поддерживает весь процесс от дизайна до производства',
      'about.team.design.title': 'Команда Дизайна',
      'about.team.design.desc': 'Креативные дизайнеры следуют последним модным трендам',
      'about.team.production.title': 'Производственная Команда',
      'about.team.production.desc': 'Опытные техники гарантируют высококачественные продукты',
      'about.team.quality.title': 'Команда Контроля Качества',
      'about.team.quality.desc': 'Строгие стандарты качества обеспечивают превосходство продукции',
      'about.team.sales.title': 'Команда Продаж',
      'about.team.sales.desc': 'Профессиональная команда продаж предоставляет клиентам оптимальные решения',
      'about.history.title': 'История Развития',
      'about.history.2010.title': '2010 - Основание Компании',
      'about.history.2010.desc': 'YXLP была официально основана и начала вход в индустрию одежды',
      'about.history.2015.title': '2015 - Международная Экспансия',
      'about.history.2015.desc': 'Начало экспансии на зарубежные рынки, вход на европейские и американские рынки',
      'about.history.2018.title': '2018 - Технологические Инновации',
      'about.history.2018.desc': 'Внедрение передового производственного оборудования, значительное улучшение эффективности и качества производства',
      'about.history.2020.title': '2020 - Цифровая Трансформация',
      'about.history.2020.desc': 'Начало процесса цифровизации и построение онлайн-платформы продаж',
      'about.history.2023.title': '2023 - Устойчивое Развитие',
      'about.history.2023.desc': 'Принятие экологически чистых производственных процессов и реализация стратегий устойчивого развития',
      'about.mission.title': 'Наша Миссия',
      'about.mission.desc': 'Через высококачественную одежду сделать жизнь клиентов более красивой и уверенной',
      'about.vision.title': 'Наше Видение',
      'about.vision.desc': 'Стать ведущим мировым модным брендом и предоставлять глобальным клиентам превосходные продукты и услуги',
      'about.contact.title': 'Контакт',
      'about.contact.desc': 'Если вы заинтересованы в сотрудничестве с нами, не стесняйтесь обращаться к нам',
      'about.contact.button': 'Связаться',
      // Categories
      'categories.title': 'Категории',
      'categories.all': 'Все Продукты',
      'categories.electronics': 'Электроника',
      'categories.electronics.desc': 'Умные устройства, цифровые продукты и т.д.',
      'categories.clothing': 'Одежда',
      'categories.clothing.desc': 'Мода, спортивная одежда и т.д.',
      'categories.shoes': 'Обувь',
      'categories.shoes.desc': 'Кроссовки, повседневная обувь и т.д.',
      'categories.bags': 'Сумки',
      'categories.bags.desc': 'Сумочки, рюкзаки и т.д.',
      'categories.accessories': 'Аксессуары',
      'categories.accessories.desc': 'Украшения, часы и т.д.',
      'categories.home': 'Дом и Быт',
      'categories.home.desc': 'Мебель, декорации и т.д.',
      // Products
      'products.categories': 'Категории Продуктов',
      'products.techWatch.name': 'Умные Часы',
      'products.smartphone.name': 'Смартфон',
      'products.luxuryBag.name': 'Роскошная Сумка',
      // News
      'news.title': 'Новости',
      'news.categories.all': 'Все',
      'news.categories.business': 'Бизнес',
      'news.categories.technology': 'Технологии',
      'news.categories.fashion': 'Мода',
      'news.categories.lifestyle': 'Образ Жизни',
      'news.readMore': 'Читать Далее',
      'news.noArticles': 'Статьи не найдены',
      // Common
      'common.loading': 'Загрузка...',
      'common.error': 'Произошла ошибка',
      'common.retry': 'Повторить',
    }
  },
  ar: {
    common: {
      'nav.home': 'الرئيسية',
      'nav.products': 'المنتجات',
      'nav.categories': 'الفئات',
      'nav.news': 'الأخبار',
      'nav.partners': 'الشركاء',
      'nav.about': 'من نحن',
      'nav.contact': 'اتصل بنا',
      'nav.login': 'تسجيل الدخول',
      'nav.register': 'التسجيل المجاني',
      'hero.slide1.title': 'منتجات عالية الجودة، خدمة ممتازة',
      'hero.slide1.subtitle': 'ضمان الجودة، الخيار الموثوق',
      'hero.slide1.description': 'نظام صارم لمراقبة الجودة وشبكة شاملة لخدمة ما بعد البيع لتوفير أعلى جودة من المنتجات وتجربة الخدمة للعملاء',
      'hero.slide1.cta': 'عرض المنتجات',
      'hero.slide2.title': 'قيادة ابتكار الأعمال المستقبلية',
      'hero.slide2.subtitle': 'YXLP - شريكك في التحول الرقمي',
      'hero.slide2.description': 'نركز على توفير حلول رقمية شاملة للمؤسسات، مما يساعد الشركات على تحقيق تطوير نوعي في العصر الرقمي',
      'hero.slide2.cta': 'اعرف المزيد',
      'hero.slide3.title': 'التعاون العالمي، خلق المستقبل معاً',
      'hero.slide3.subtitle': 'العمل معاً، تعاون مربح للجانبين',
      'hero.slide3.description': 'إقامة شراكات استراتيجية مع الشركات العالمية المتميزة، واستكشاف الأسواق بشكل مشترك، وتحقيق أهداف التنمية المفيدة للطرفين',
      'hero.slide3.cta': 'كن شريكاً',
      'hero.watchVideo': 'مشاهدة الفيديو',
      'advantages.title': 'لماذا تختار أزياء YXLP',
      'advantages.subtitle': 'سنوات من التركيز في صناعة الأزياء، نوفر للعملاء منتجات الملابس عالية الجودة وخدمات التصميم المهنية',
      'products.title': 'ملابس مختارة',
      'products.subtitle': 'جمع العلامات التجارية العالمية عالية الجودة للملابس لتوفير خيارات عصرية ومتنوعة لك',
      'products.view_all': 'عرض جميع المنتجات',
      'about.title': 'حول YXLP',
      'contact.title': 'اتصل بنا',
      'contact.subtitle': 'إذا كان لديك أي أسئلة أو نوايا للتعاون، لا تتردد في الاتصال بنا في أي وقت',
      // About
      'about.subtitle': 'سنوات من التركيز في صناعة الأزياء، نوفر للعملاء منتجات الملابس عالية الجودة وخدمات التصميم المهنية',
      'about.company.title': 'ملف الشركة',
      'about.company.desc1': 'تأسست YXLP في عام 2010 كشركة حديثة متخصصة في تصميم وإنتاج وبيع الملابس. نحن ملتزمون بتوفير منتجات ملابس عالية الجودة وحلول أزياء مهنية للعملاء العالميين.',
      'about.company.desc2': 'بعد أكثر من عشر سنوات من التطوير، أنشأنا نظام سلسلة توريد كامل ونظام إدارة جودة. منتجاتنا تُصدر إلى أوروبا وأمريكا ومنطقة آسيا والمحيط الهادئ ومناطق أخرى، وهي موثوقة بعمق من قبل العملاء.',
      'about.company.desc3': 'نحن نلتزم بفلسفة الأعمال "الجودة أولاً، العميل أولاً"، نبتكر باستمرار في التصميم، نحسن عمليات الإنتاج، ونخلق قيمة أكبر للعملاء.',
      'about.company.imageAlt': 'بيئة مكتب الشركة',
      'about.values.title': 'القيم الأساسية',
      'about.values.quality.title': 'الجودة أولاً',
      'about.values.quality.desc': 'نظام صارم لمراقبة الجودة لضمان أن كل منتج يلبي أعلى المعايير',
      'about.values.innovation.title': 'الابتكار المستمر',
      'about.values.innovation.desc': 'مواكبة اتجاهات الموضة وإطلاق تصاميم مبتكرة ومنتجات عالية الجودة باستمرار',
      'about.values.service.title': 'خدمة ممتازة',
      'about.values.service.desc': 'فريق خدمة مهني يوفر دعماً شاملاً للعملاء',
      'about.values.trust.title': 'شريك موثوق',
      'about.values.trust.desc': 'بناء شراكات طويلة الأمد والنمو مع العملاء',
      'about.team.title': 'فريقنا',
      'about.team.desc': 'فريق خبراء ذو خبرة يدعم العملية الكاملة من التصميم إلى الإنتاج',
      'about.team.design.title': 'فريق التصميم',
      'about.team.design.desc': 'مصممون مبدعون يتابعون أحدث اتجاهات الموضة',
      'about.team.production.title': 'فريق الإنتاج',
      'about.team.production.desc': 'فنيون ذوو خبرة يضمنون منتجات عالية الجودة',
      'about.team.quality.title': 'فريق مراقبة الجودة',
      'about.team.quality.desc': 'معايير جودة صارمة تضمن تميز المنتج',
      'about.team.sales.title': 'فريق المبيعات',
      'about.team.sales.desc': 'فريق مبيعات مهني يوفر حلولاً مثلى للعملاء',
      'about.history.title': 'تاريخ التطوير',
      'about.history.2010.title': '2010 - تأسيس الشركة',
      'about.history.2010.desc': 'تأسست YXLP رسمياً وبدأت دخول صناعة الملابس',
      'about.history.2015.title': '2015 - التوسع الدولي',
      'about.history.2015.desc': 'بدء التوسع في الأسواق الخارجية، دخول الأسواق الأوروبية والأمريكية',
      'about.history.2018.title': '2018 - الابتكار التكنولوجي',
      'about.history.2018.desc': 'إدخال معدات إنتاج متقدمة، تحسين كبير في كفاءة وجودة الإنتاج',
      'about.history.2020.title': '2020 - التحول الرقمي',
      'about.history.2020.desc': 'بدء عملية الرقمنة وبناء منصة مبيعات عبر الإنترنت',
      'about.history.2023.title': '2023 - التنمية المستدامة',
      'about.history.2023.desc': 'اعتماد عمليات إنتاج صديقة للبيئة وتنفيذ استراتيجيات التنمية المستدامة',
      'about.mission.title': 'مهمتنا',
      'about.mission.desc': 'من خلال الملابس عالية الجودة، جعل حياة العملاء أكثر جمالاً وثقة',
      'about.vision.title': 'رؤيتنا',
      'about.vision.desc': 'أن نصبح علامة أزياء رائدة عالمياً ونوفر منتجات وخدمات ممتازة للعملاء العالميين',
      'about.contact.title': 'اتصال',
      'about.contact.desc': 'إذا كنت مهتماً بالتعاون معنا، لا تتردد في الاتصال بنا',
      'about.contact.button': 'اتصل',
      // Categories
      'categories.title': 'الفئات',
      'categories.all': 'جميع المنتجات',
      'categories.electronics': 'الإلكترونيات',
      'categories.electronics.desc': 'الأجهزة الذكية، المنتجات الرقمية، إلخ.',
      'categories.clothing': 'الملابس',
      'categories.clothing.desc': 'الأزياء، الملابس الرياضية، إلخ.',
      'categories.shoes': 'الأحذية',
      'categories.shoes.desc': 'أحذية رياضية، أحذية كاجوال، إلخ.',
      'categories.bags': 'الحقائب',
      'categories.bags.desc': 'حقائب اليد، حقائب الظهر، إلخ.',
      'categories.accessories': 'الإكسسوارات',
      'categories.accessories.desc': 'المجوهرات، الساعات، إلخ.',
      'categories.home': 'المنزل والمعيشة',
      'categories.home.desc': 'الأثاث، الديكورات، إلخ.',
      // Products
      'products.categories': 'فئات المنتجات',
      'products.techWatch.name': 'ساعة ذكية',
      'products.smartphone.name': 'هاتف ذكي',
      'products.luxuryBag.name': 'حقيبة فاخرة',
      // News
      'news.title': 'الأخبار',
      'news.categories.all': 'الكل',
      'news.categories.business': 'الأعمال',
      'news.categories.technology': 'التكنولوجيا',
      'news.categories.fashion': 'الأزياء',
      'news.categories.lifestyle': 'نمط الحياة',
      'news.readMore': 'اقرأ المزيد',
      'news.noArticles': 'لم يتم العثور على مقالات',
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'حدث خطأ',
      'common.retry': 'إعادة المحاولة',
    }
  },
  pt: {
    common: {
      'nav.home': 'Início',
      'nav.products': 'Produtos',
      'nav.categories': 'Categorias',
      'nav.news': 'Notícias',
      'nav.partners': 'Parceiros',
      'nav.about': 'Sobre Nós',
      'nav.contact': 'Contato',
      'nav.login': 'Entrar',
      'nav.register': 'Registro Gratuito',
      'hero.slide1.title': 'Produtos de Qualidade, Serviço Excelente',
      'hero.slide1.subtitle': 'Garantia de Qualidade, Escolha Confiável',
      'hero.slide1.description': 'Sistema rigoroso de controle de qualidade e rede abrangente de atendimento pós-venda para fornecer aos clientes a mais alta qualidade de produtos e experiência de serviço',
      'hero.slide1.cta': 'Ver Produtos',
      'hero.slide2.title': 'Liderando a Inovação Empresarial Futura',
      'hero.slide2.subtitle': 'YXLP - Seu Parceiro de Transformação Digital',
      'hero.slide2.description': 'Focado em fornecer soluções digitais abrangentes para empresas, ajudando as empresas a alcançar desenvolvimento de salto na era digital',
      'hero.slide2.cta': 'Saiba Mais',
      'hero.slide3.title': 'Cooperação Global, Criando o Futuro Juntos',
      'hero.slide3.subtitle': 'Trabalhando Juntos, Cooperação Ganha-Ganha',
      'hero.slide3.description': 'Estabelecer parcerias estratégicas com excelentes empresas globais, explorar mercados conjuntamente e alcançar objetivos de desenvolvimento mutuamente benéficos',
      'hero.slide3.cta': 'Tornar-se Parceiro',
      'hero.watchVideo': 'Assistir Vídeo',
      'advantages.title': 'Por Que Escolher YXLP Moda',
      'advantages.subtitle': 'Anos de foco na indústria da moda, fornecendo aos clientes produtos de vestuário da mais alta qualidade e serviços profissionais de styling de moda',
      'products.title': 'Roupas Selecionadas',
      'products.subtitle': 'Reunindo marcas de roupas de qualidade global para oferecer a você opções elegantes e diversificadas',
      'products.view_all': 'Ver Todos os Produtos',
      'about.title': 'Sobre YXLP',
      'contact.title': 'Entre em Contato',
      'contact.subtitle': 'Se você tiver alguma dúvida ou intenção de cooperação, não hesite em nos contatar a qualquer momento',
      // About
      'about.subtitle': 'Anos de foco na indústria da moda, fornecendo aos clientes produtos de vestuário da mais alta qualidade e serviços profissionais de styling de moda',
      'about.company.title': 'Perfil da Empresa',
      'about.company.desc1': 'YXLP foi fundada em 2010 como uma empresa moderna especializada em design, produção e venda de roupas. Estamos comprometidos em fornecer aos clientes globais produtos de vestuário de alta qualidade e soluções de moda profissionais.',
      'about.company.desc2': 'Após mais de dez anos de desenvolvimento, construímos um sistema completo de cadeia de suprimentos e sistema de gestão de qualidade. Nossos produtos são exportados para Europa, América, Ásia-Pacífico e outras regiões, e são profundamente confiados pelos clientes.',
      'about.company.desc3': 'Aderimos à filosofia empresarial de "qualidade em primeiro lugar, cliente em primeiro lugar", inovamos continuamente no design, otimizamos processos de produção e criamos maior valor para os clientes.',
      'about.company.imageAlt': 'Ambiente de escritório da empresa',
      'about.values.title': 'Valores Fundamentais',
      'about.values.quality.title': 'Qualidade em Primeiro Lugar',
      'about.values.quality.desc': 'Sistema rigoroso de controle de qualidade para garantir que cada produto atenda aos mais altos padrões',
      'about.values.innovation.title': 'Inovação Contínua',
      'about.values.innovation.desc': 'Acompanhar as tendências da moda e lançar continuamente designs inovadores e produtos de qualidade',
      'about.values.service.title': 'Serviço Excelente',
      'about.values.service.desc': 'Equipe de serviço profissional fornece suporte abrangente aos clientes',
      'about.values.trust.title': 'Parceiro Confiável',
      'about.values.trust.desc': 'Construir parcerias de longo prazo e crescer junto com os clientes',
      'about.team.title': 'Nossa Equipe',
      'about.team.desc': 'Equipe de especialistas experientes apoia todo o processo do design à produção',
      'about.team.design.title': 'Equipe de Design',
      'about.team.design.desc': 'Designers criativos seguem as últimas tendências da moda',
      'about.team.production.title': 'Equipe de Produção',
      'about.team.production.desc': 'Técnicos experientes garantem produtos de alta qualidade',
      'about.team.quality.title': 'Equipe de Controle de Qualidade',
      'about.team.quality.desc': 'Padrões rigorosos de qualidade garantem a excelência do produto',
      'about.team.sales.title': 'Equipe de Vendas',
      'about.team.sales.desc': 'Equipe de vendas profissional fornece soluções ótimas aos clientes',
      'about.history.title': 'História de Desenvolvimento',
      'about.history.2010.title': '2010 - Fundação da Empresa',
      'about.history.2010.desc': 'YXLP foi oficialmente estabelecida e começou a entrar na indústria de vestuário',
      'about.history.2015.title': '2015 - Expansão Internacional',
      'about.history.2015.desc': 'Início da expansão para mercados estrangeiros, entrada nos mercados europeu e americano',
      'about.history.2018.title': '2018 - Inovação Tecnológica',
      'about.history.2018.desc': 'Introdução de equipamentos de produção avançados, melhoria significativa na eficiência e qualidade da produção',
      'about.history.2020.title': '2020 - Transformação Digital',
      'about.history.2020.desc': 'Início do processo de digitalização e construção de plataforma de vendas online',
      'about.history.2023.title': '2023 - Desenvolvimento Sustentável',
      'about.history.2023.desc': 'Adoção de processos de produção ecológicos e implementação de estratégias de desenvolvimento sustentável',
      'about.mission.title': 'Nossa Missão',
      'about.mission.desc': 'Através de roupas de alta qualidade, tornar a vida dos clientes mais bonita e confiante',
      'about.vision.title': 'Nossa Visão',
      'about.vision.desc': 'Tornar-se uma marca de moda líder mundial e fornecer produtos e serviços excelentes aos clientes globais',
      'about.contact.title': 'Contato',
      'about.contact.desc': 'Se você está interessado em cooperar conosco, não hesite em nos contatar',
      'about.contact.button': 'Contatar',
      // Categories
      'categories.title': 'Categorias',
      'categories.all': 'Todos os Produtos',
      'categories.electronics': 'Eletrônicos',
      'categories.electronics.desc': 'Dispositivos inteligentes, produtos digitais, etc.',
      'categories.clothing': 'Roupas',
      'categories.clothing.desc': 'Moda, roupas esportivas, etc.',
      'categories.shoes': 'Sapatos',
      'categories.shoes.desc': 'Tênis, sapatos casuais, etc.',
      'categories.bags': 'Bolsas',
      'categories.bags.desc': 'Bolsas de mão, mochilas, etc.',
      'categories.accessories': 'Acessórios',
      'categories.accessories.desc': 'Joias, relógios, etc.',
      'categories.home': 'Casa e Vida',
      'categories.home.desc': 'Móveis, decorações, etc.',
      // Products
      'products.categories': 'Categorias de Produtos',
      'products.techWatch.name': 'Relógio Inteligente',
      'products.smartphone.name': 'Smartphone',
      'products.luxuryBag.name': 'Bolsa de Luxo',
      // News
      'news.title': 'Notícias',
      'news.categories.all': 'Tudo',
      'news.categories.business': 'Negócios',
      'news.categories.technology': 'Tecnologia',
      'news.categories.fashion': 'Moda',
      'news.categories.lifestyle': 'Estilo de Vida',
      'news.readMore': 'Ler Mais',
      'news.noArticles': 'Nenhum artigo encontrado',
      // Common
      'common.loading': 'Carregando...',
      'common.error': 'Erro ocorreu',
      'common.retry': 'Tentar Novamente',
    }
  }
}

// Function to get built-in translations
function getBuiltInTranslations(lang: string, namespace: string): Record<string, string> {
  return BUILT_IN_TRANSLATIONS[lang]?.[namespace] || BUILT_IN_TRANSLATIONS[FALLBACK_LANGUAGE]?.[namespace] || {}
}

// Available languages
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRtl: false },
]

export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const { namespace = 'common', fallbackLanguage = FALLBACK_LANGUAGE, forceLanguage } = options
  const pathname = usePathname()

  const [language, setLanguageState] = useState<string>(() => {
    // If forceLanguage is specified, use it
    if (forceLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === forceLanguage)) {
      return forceLanguage
    }

    // Initialize language from URL path immediately
    const pathSegments = pathname.split('/')
    const urlLanguage = pathSegments[1]
    if (urlLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
      return urlLanguage
    }
    return DEFAULT_LANGUAGE
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize language from URL path, storage or browser
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Highest priority: If forceLanguage is specified, use it
        if (forceLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === forceLanguage)) {
          setLanguageState(forceLanguage)
          return
        }

        // First priority: Get language from URL path
        const pathSegments = pathname.split('/')
        const urlLanguage = pathSegments[1] // /fr/... -> fr
        if (urlLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
          setLanguageState(urlLanguage)
          return
        }

        // Second priority: Try to get from localStorage
        const storedLanguage = localStorage.getItem(STORAGE_KEY)
        if (storedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)) {
          setLanguageState(storedLanguage)
          return
        }

        // Third priority: Try to detect from browser
        const browserLanguage = navigator.language.split('-')[0]
        if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLanguage)) {
          setLanguageState(browserLanguage)
          return
        }

        // Fall back to default
        setLanguageState(DEFAULT_LANGUAGE)
      } catch (error) {
        console.error('Error initializing language:', error)
        setLanguageState(DEFAULT_LANGUAGE)
      }
    }

    initializeLanguage()
  }, [pathname])

  const loadTranslations = useCallback(async (lang: string, ns: string) => {
    const cacheKey = `${lang}_${ns}`

    // Return cached translations if available
    if (translationCache[cacheKey] && translationCache[cacheKey][ns]) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Use built-in translations instead of API calls
      const translations = getBuiltInTranslations(lang, ns)

      // Cache the translations
      if (!translationCache[cacheKey]) {
        translationCache[cacheKey] = {}
      }
      translationCache[cacheKey][ns] = translations

      // Also preload fallback language if different
      if (lang !== fallbackLanguage) {
        const fallbackCacheKey = `${fallbackLanguage}_${ns}`
        if (!translationCache[fallbackCacheKey]) {
          const fallbackTranslations = getBuiltInTranslations(fallbackLanguage, ns)
          if (!translationCache[fallbackCacheKey]) {
            translationCache[fallbackCacheKey] = {}
          }
          translationCache[fallbackCacheKey][ns] = fallbackTranslations
        }
      }

    } catch (error) {
      console.error('Error loading translations:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')

      // Try to load fallback language if not already trying
      if (lang !== fallbackLanguage) {
        await loadTranslations(fallbackLanguage, ns)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load translations when language changes
  useEffect(() => {
    if (language) {
      loadTranslations(language, namespace)
    }
  }, [language, namespace, loadTranslations])

  // Initialize translations immediately
  useEffect(() => {
    loadTranslations(language, namespace)
  }, [loadTranslations, language, namespace])

  const setLanguage = useCallback((lang: string) => {
    if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === lang)) {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)
      
      // Update document language and direction
      document.documentElement.lang = lang
      const isRtl = AVAILABLE_LANGUAGES.find(l => l.code === lang)?.isRtl || false
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    } else {
      console.warn(`Language ${lang} is not supported`)
    }
  }, [])

  const t = useCallback((key: string, params: Record<string, any> = {}): string => {
    // First, try to get the translation directly from built-in translations
    const builtInTranslation = BUILT_IN_TRANSLATIONS[language]?.[namespace]?.[key]
    if (builtInTranslation) {
      return replaceParams(builtInTranslation, params)
    }

    // Fall back to fallback language built-in translations
    if (language !== fallbackLanguage) {
      const fallbackBuiltInTranslation = BUILT_IN_TRANSLATIONS[fallbackLanguage]?.[namespace]?.[key]
      if (fallbackBuiltInTranslation) {
        return replaceParams(fallbackBuiltInTranslation, params)
      }
    }

    const cacheKey = `${language}_${namespace}`
    const fallbackCacheKey = `${fallbackLanguage}_${namespace}`

    // Try to get translation from current language
    let translation = translationCache[cacheKey]?.[namespace]?.[key]

    // Fall back to fallback language
    if (!translation && language !== fallbackLanguage) {
      translation = translationCache[fallbackCacheKey]?.[namespace]?.[key]
    }

    // Fall back to key if no translation found
    if (!translation) {
      // For common keys, provide fallback translations
      const fallbackTranslations: Record<string, string> = {
        'cart.title': 'Shopping Cart',
        'cart.empty': 'Your cart is empty',
        'cart.subtotal': 'Subtotal',
        'cart.tax': 'Tax',
        'cart.shipping': 'Shipping',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'cart.continue_shopping': 'Continue Shopping',
        'cart.remove': 'Remove',
        'cart.quantity': 'Quantity',
        'cart.apply_coupon': 'Apply Coupon',
        'cart.coupon_code': 'Coupon Code',
        'cart.discount': 'Discount',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.update': 'Update',
        'product.add_to_cart': 'Add to Cart',
        'product.out_of_stock': 'Out of Stock',
        'product.in_stock': 'In Stock',
      }

      translation = fallbackTranslations[key] || key
    }

    // Replace parameters in translation
    return replaceParams(translation, params)
  }, [language, namespace, fallbackLanguage])

  const formatCurrencyLocal = useCallback((amount: number, currency: string = 'USD') => {
    return formatCurrency(amount, currency, language)
  }, [language])

  const formatNumberLocal = useCallback((number: number) => {
    return formatNumber(number, language)
  }, [language])

  const formatDateLocal = useCallback((date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
    return formatDate(date, language, options)
  }, [language])

  return {
    t,
    language,
    setLanguage,
    isLoading,
    error,
    availableLanguages: AVAILABLE_LANGUAGES,
    formatCurrency: formatCurrencyLocal,
    formatNumber: formatNumberLocal,
    formatDate: formatDateLocal,
  }
}

// Helper function to replace parameters in translation strings
function replaceParams(text: string, params: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

// Hook for getting current language info
export function useLanguage() {
  const pathname = usePathname()
  const [language, setLanguageState] = useState<string>(() => {
    // Initialize language from URL path immediately, same as useTranslation
    const pathSegments = pathname.split('/')
    const urlLanguage = pathSegments[1]
    if (urlLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
      return urlLanguage
    }
    return DEFAULT_LANGUAGE
  })

  // Sync with URL path changes, same logic as useTranslation
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // First priority: Get language from URL path
        const pathSegments = pathname.split('/')
        const urlLanguage = pathSegments[1] // /fr/... -> fr
        if (urlLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
          setLanguageState(urlLanguage)
          return
        }

        // Second priority: Try to get from localStorage
        const storedLanguage = localStorage.getItem(STORAGE_KEY)
        if (storedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)) {
          setLanguageState(storedLanguage)
          return
        }

        // Fall back to default
        setLanguageState(DEFAULT_LANGUAGE)
      } catch (error) {
        console.error('Error initializing language:', error)
        setLanguageState(DEFAULT_LANGUAGE)
      }
    }

    initializeLanguage()
  }, [pathname])

  const currentLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === language)

  const setLanguage = useCallback((lang: string) => {
    if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === lang)) {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)

      // Update document language and direction
      document.documentElement.lang = lang
      const isRtl = AVAILABLE_LANGUAGES.find(l => l.code === lang)?.isRtl || false
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr'

      // Note: URL navigation is handled by LanguageSwitcher component
      // No need to reload the page here
    }
  }, [])

  return {
    language,
    currentLanguage,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    isRtl: currentLanguage?.isRtl || false,
  }
}

// Utility function to detect user's preferred language
export function detectLanguage(): string {
  try {
    // Check localStorage first
    const storedLanguage = localStorage.getItem(STORAGE_KEY)
    if (storedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)) {
      return storedLanguage
    }

    // Check browser language
    const browserLanguage = navigator.language.split('-')[0]
    if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLanguage)) {
      return browserLanguage
    }

    // Check browser languages array
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0]
      if (AVAILABLE_LANGUAGES.some(availableLang => availableLang.code === langCode)) {
        return langCode
      }
    }
  } catch (error) {
    console.error('Error detecting language:', error)
  }

  return DEFAULT_LANGUAGE
}

// Utility function to format numbers according to locale
export function formatNumber(number: number, language: string = DEFAULT_LANGUAGE): string {
  try {
    return new Intl.NumberFormat(language).format(number)
  } catch (error) {
    return number.toString()
  }
}

// Utility function to format currency according to locale
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  language: string = DEFAULT_LANGUAGE
): string {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount)
  } catch (error) {
    return `${currency} ${amount}`
  }
}

// Utility function to format dates according to locale
export function formatDate(
  date: Date | string,
  language: string = DEFAULT_LANGUAGE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(language, options).format(dateObj)
  } catch (error) {
    return date.toString()
  }
}
