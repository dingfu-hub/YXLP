import { faker } from '@faker-js/faker'
import * as fs from 'fs'
import * as path from 'path'

// 配置 faker 为中英文混合
faker.setLocale('en')

// 产品相关的真实数据
const CLOTHING_CATEGORIES = [
  {
    id: 'mens-clothing',
    name: { en: "Men's Clothing", zh: '男装' },
    children: [
      { id: 'business-shirts', name: { en: 'Business Shirts', zh: '商务衬衫' } },
      { id: 'casual-shirts', name: { en: 'Casual Shirts', zh: '休闲衬衫' } },
      { id: 'suits', name: { en: 'Suits', zh: '西装' } },
      { id: 'pants', name: { en: 'Pants', zh: '裤子' } },
      { id: 'jackets', name: { en: 'Jackets', zh: '夹克' } },
      { id: 'sweaters', name: { en: 'Sweaters', zh: '毛衣' } },
      { id: 'polo-shirts', name: { en: 'Polo Shirts', zh: 'Polo衫' } },
      { id: 't-shirts', name: { en: 'T-Shirts', zh: 'T恤' } }
    ]
  },
  {
    id: 'womens-clothing',
    name: { en: "Women's Clothing", zh: '女装' },
    children: [
      { id: 'dresses', name: { en: 'Dresses', zh: '连衣裙' } },
      { id: 'blouses', name: { en: 'Blouses', zh: '女式衬衫' } },
      { id: 'skirts', name: { en: 'Skirts', zh: '裙子' } },
      { id: 'pants-women', name: { en: 'Pants', zh: '女裤' } },
      { id: 'blazers', name: { en: 'Blazers', zh: '西装外套' } },
      { id: 'sweaters-women', name: { en: 'Sweaters', zh: '女式毛衣' } },
      { id: 'tops', name: { en: 'Tops', zh: '上衣' } },
      { id: 'coats', name: { en: 'Coats', zh: '大衣' } }
    ]
  },
  {
    id: 'kids-clothing',
    name: { en: "Kids' Clothing", zh: '童装' },
    children: [
      { id: 'baby-wear', name: { en: 'Baby Wear', zh: '婴儿装' } },
      { id: 'boys-clothing', name: { en: "Boys' Clothing", zh: '男童装' } },
      { id: 'girls-clothing', name: { en: "Girls' Clothing", zh: '女童装' } },
      { id: 'school-uniforms', name: { en: 'School Uniforms', zh: '校服' } }
    ]
  },
  {
    id: 'accessories',
    name: { en: 'Accessories', zh: '配饰' },
    children: [
      { id: 'bags', name: { en: 'Bags', zh: '包包' } },
      { id: 'hats', name: { en: 'Hats', zh: '帽子' } },
      { id: 'scarves', name: { en: 'Scarves', zh: '围巾' } },
      { id: 'belts', name: { en: 'Belts', zh: '腰带' } },
      { id: 'gloves', name: { en: 'Gloves', zh: '手套' } }
    ]
  }
]

const BRANDS = [
  'YXLP Collection',
  'Premium Fashion',
  'Elite Wear',
  'Classic Style',
  'Modern Trends',
  'Luxury Line',
  'Urban Fashion',
  'Business Elite',
  'Casual Comfort',
  'Designer Choice'
]

const MATERIALS = [
  '100% Cotton',
  '100% Silk',
  '100% Wool',
  '95% Cotton, 5% Elastane',
  '80% Cotton, 20% Polyester',
  '70% Wool, 30% Cashmere',
  '60% Cotton, 40% Linen',
  'Polyester Blend',
  'Bamboo Fiber',
  'Organic Cotton'
]

const COLORS = [
  { en: 'White', zh: '白色', value: 'white' },
  { en: 'Black', zh: '黑色', value: 'black' },
  { en: 'Navy Blue', zh: '藏青色', value: 'navy' },
  { en: 'Light Blue', zh: '浅蓝色', value: 'lightblue' },
  { en: 'Gray', zh: '灰色', value: 'gray' },
  { en: 'Pink', zh: '粉色', value: 'pink' },
  { en: 'Red', zh: '红色', value: 'red' },
  { en: 'Green', zh: '绿色', value: 'green' },
  { en: 'Yellow', zh: '黄色', value: 'yellow' },
  { en: 'Purple', zh: '紫色', value: 'purple' },
  { en: 'Brown', zh: '棕色', value: 'brown' },
  { en: 'Beige', zh: '米色', value: 'beige' }
]

const SIZES = [
  { en: 'XS', zh: '特小号', value: 'XS' },
  { en: 'Small', zh: '小号', value: 'S' },
  { en: 'Medium', zh: '中号', value: 'M' },
  { en: 'Large', zh: '大号', value: 'L' },
  { en: 'XL', zh: '特大号', value: 'XL' },
  { en: 'XXL', zh: '超大号', value: 'XXL' },
  { en: 'XXXL', zh: '超超大号', value: 'XXXL' }
]

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'NZ', name: 'New Zealand' }
]

// 生成用户数据
function generateUsers(count: number) {
  const users = []
  const roles = ['customer', 'distributor', 'admin']
  const roleWeights = [0.85, 0.14, 0.01] // 85% customer, 14% distributor, 1% admin

  for (let i = 0; i < count; i++) {
    const role = faker.helpers.weightedArrayElement([
      { weight: roleWeights[0], value: roles[0] },
      { weight: roleWeights[1], value: roles[1] },
      { weight: roleWeights[2], value: roles[2] }
    ])

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const country = faker.helpers.arrayElement(COUNTRIES)
    
    const user = {
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/G.', // password123
      role,
      status: faker.helpers.weightedArrayElement([
        { weight: 0.9, value: 'active' },
        { weight: 0.05, value: 'pending' },
        { weight: 0.03, value: 'inactive' },
        { weight: 0.02, value: 'locked' }
      ]),
      firstName,
      lastName,
      avatar: faker.image.avatar(),
      phone: faker.phone.number(),
      country: country.code,
      language: faker.helpers.arrayElement(['en', 'zh', 'es', 'fr', 'de']),
      preferences: {
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'JPY', 'CNY']),
        timezone: faker.location.timeZone(),
        notifications: {
          email: {
            marketing: faker.datatype.boolean(),
            orderUpdates: true,
            newsletter: faker.datatype.boolean()
          },
          sms: {
            orderUpdates: faker.datatype.boolean(),
            marketing: false
          }
        }
      },
      emailVerifiedAt: faker.helpers.maybe(() => faker.date.past(), { probability: 0.8 }),
      lastLoginAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
      loginAttempts: 0,
      lockedUntil: null,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent()
    }

    // 为经销商添加公司信息
    if (role === 'distributor') {
      user['company'] = {
        name: faker.company.name(),
        registrationNumber: faker.string.alphanumeric(10).toUpperCase(),
        industry: faker.helpers.arrayElement([
          'Fashion Retail',
          'Wholesale Distribution',
          'E-commerce',
          'Import/Export',
          'Manufacturing'
        ]),
        website: faker.internet.url(),
        description: faker.company.catchPhrase(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: country.code,
          zipCode: faker.location.zipCode()
        },
        taxId: faker.string.alphanumeric(12).toUpperCase(),
        creditLimit: faker.number.int({ min: 10000, max: 500000 }),
        paymentTerms: faker.helpers.arrayElement(['NET30', 'NET60', 'NET90', 'COD'])
      }
    }

    users.push(user)
  }

  return users
}

// 生成分类数据
function generateCategories() {
  const categories = []
  
  CLOTHING_CATEGORIES.forEach((parentCat, parentIndex) => {
    // 添加父分类
    const parentCategory = {
      id: faker.string.uuid(),
      name: parentCat.name,
      slug: {
        en: parentCat.id,
        zh: parentCat.name.zh.toLowerCase().replace(/\s+/g, '-')
      },
      description: {
        en: `High-quality ${parentCat.name.en.toLowerCase()} collection`,
        zh: `高品质${parentCat.name.zh}系列`
      },
      parentId: null,
      image: `https://cdn.yxlp.com/categories/${parentCat.id}.jpg`,
      order: parentIndex + 1,
      isActive: true,
      seo: {
        title: {
          en: `${parentCat.name.en} - Premium Quality Fashion`,
          zh: `${parentCat.name.zh} - 优质时尚`
        },
        description: {
          en: `Discover our premium ${parentCat.name.en.toLowerCase()} collection`,
          zh: `探索我们的优质${parentCat.name.zh}系列`
        },
        keywords: parentCat.name.en.toLowerCase().split(' ')
      },
      metadata: {},
      productCount: 0,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    }
    
    categories.push(parentCategory)
    
    // 添加子分类
    parentCat.children.forEach((childCat, childIndex) => {
      const childCategory = {
        id: faker.string.uuid(),
        name: childCat.name,
        slug: {
          en: childCat.id,
          zh: childCat.name.zh.toLowerCase().replace(/\s+/g, '-')
        },
        description: {
          en: `Premium ${childCat.name.en.toLowerCase()} for every occasion`,
          zh: `适合各种场合的优质${childCat.name.zh}`
        },
        parentId: parentCategory.id,
        image: `https://cdn.yxlp.com/categories/${childCat.id}.jpg`,
        order: childIndex + 1,
        isActive: true,
        seo: {
          title: {
            en: `${childCat.name.en} - ${parentCat.name.en}`,
            zh: `${childCat.name.zh} - ${parentCat.name.zh}`
          },
          description: {
            en: `Shop premium ${childCat.name.en.toLowerCase()} from our collection`,
            zh: `选购我们系列中的优质${childCat.name.zh}`
          },
          keywords: [...parentCat.name.en.toLowerCase().split(' '), ...childCat.name.en.toLowerCase().split(' ')]
        },
        metadata: {},
        productCount: 0,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent()
      }
      
      categories.push(childCategory)
    })
  })
  
  return categories
}

// 生成产品数据
function generateProducts(categories: any[], count: number) {
  const products = []
  const childCategories = categories.filter(cat => cat.parentId !== null)
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(childCategories)
    const brand = faker.helpers.arrayElement(BRANDS)
    const material = faker.helpers.arrayElement(MATERIALS)
    
    // 生成产品名称
    const productTypes = {
      'business-shirts': ['Business Shirt', 'Dress Shirt', 'Formal Shirt'],
      'casual-shirts': ['Casual Shirt', 'Oxford Shirt', 'Flannel Shirt'],
      'dresses': ['Summer Dress', 'Evening Dress', 'Cocktail Dress', 'Maxi Dress'],
      'blouses': ['Silk Blouse', 'Chiffon Blouse', 'Cotton Blouse'],
      'suits': ['Business Suit', 'Formal Suit', 'Wedding Suit'],
      'pants': ['Dress Pants', 'Chinos', 'Trousers'],
      'jackets': ['Blazer', 'Sport Jacket', 'Casual Jacket'],
      'sweaters': ['Wool Sweater', 'Cashmere Sweater', 'Cotton Sweater']
    }
    
    const categorySlug = category.slug.en
    const productType = productTypes[categorySlug] 
      ? faker.helpers.arrayElement(productTypes[categorySlug])
      : category.name.en.slice(0, -1) // Remove 's' from plural
    
    const adjectives = ['Premium', 'Elegant', 'Classic', 'Modern', 'Luxury', 'Comfortable', 'Stylish']
    const adjective = faker.helpers.arrayElement(adjectives)
    
    const productName = {
      en: `${adjective} ${material.split(',')[0]} ${productType}`,
      zh: `${adjective === 'Premium' ? '优质' : 
           adjective === 'Elegant' ? '优雅' :
           adjective === 'Classic' ? '经典' :
           adjective === 'Modern' ? '现代' :
           adjective === 'Luxury' ? '奢华' :
           adjective === 'Comfortable' ? '舒适' : '时尚'}${material.includes('Cotton') ? '棉质' : 
           material.includes('Silk') ? '真丝' :
           material.includes('Wool') ? '羊毛' : ''}${category.name.zh.includes('衬衫') ? '衬衫' :
           category.name.zh.includes('连衣裙') ? '连衣裙' :
           category.name.zh.includes('西装') ? '西装' : category.name.zh}`
    }
    
    const basePrice = faker.number.float({ min: 29.99, max: 299.99, precision: 0.01 })
    const compareAtPrice = faker.helpers.maybe(() => 
      faker.number.float({ min: basePrice * 1.2, max: basePrice * 2, precision: 0.01 })
    , { probability: 0.6 })
    
    const sku = `${brand.replace(/\s+/g, '').toUpperCase().slice(0, 3)}-${faker.string.alphanumeric(3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`
    
    const product = {
      id: faker.string.uuid(),
      sku,
      name: productName,
      description: {
        en: `${productName.en} crafted from ${material.toLowerCase()}. Perfect for ${categorySlug.includes('business') ? 'professional occasions' : 'everyday wear'}. Features premium construction and attention to detail.`,
        zh: `采用${material.includes('Cotton') ? '棉质' : material.includes('Silk') ? '真丝' : material.includes('Wool') ? '羊毛' : '优质'}材料制作的${productName.zh}。${categorySlug.includes('business') ? '适合商务场合' : '适合日常穿着'}。具有优质的做工和精致的细节。`
      },
      shortDescription: {
        en: `${adjective} ${productType.toLowerCase()} made from ${material.toLowerCase()}`,
        zh: `采用${material.includes('Cotton') ? '棉质' : material.includes('Silk') ? '真丝' : '优质'}材料制作的${adjective === 'Premium' ? '优质' : '时尚'}${category.name.zh}`
      },
      categoryId: category.id,
      brand,
      tags: [
        material.toLowerCase().split(',')[0].trim(),
        productType.toLowerCase().replace(/\s+/g, '-'),
        adjective.toLowerCase(),
        categorySlug.split('-')[0]
      ],
      status: faker.helpers.weightedArrayElement([
        { weight: 0.85, value: 'active' },
        { weight: 0.1, value: 'inactive' },
        { weight: 0.03, value: 'out_of_stock' },
        { weight: 0.02, value: 'draft' }
      ]),
      images: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, (_, index) => ({
        id: faker.string.uuid(),
        url: `https://cdn.yxlp.com/products/${sku.toLowerCase()}-${index + 1}.jpg`,
        alt: {
          en: `${productName.en} - View ${index + 1}`,
          zh: `${productName.zh} - 视图 ${index + 1}`
        },
        order: index,
        isMain: index === 0,
        variants: [],
        width: 800,
        height: 1000,
        size: faker.number.int({ min: 100000, max: 500000 }),
        format: 'jpg',
        thumbnails: {
          small: `https://cdn.yxlp.com/products/thumbs/small_${sku.toLowerCase()}-${index + 1}.jpg`,
          medium: `https://cdn.yxlp.com/products/thumbs/medium_${sku.toLowerCase()}-${index + 1}.jpg`,
          large: `https://cdn.yxlp.com/products/thumbs/large_${sku.toLowerCase()}-${index + 1}.jpg`
        }
      })),
      specifications: [
        {
          id: faker.string.uuid(),
          name: { en: 'Material', zh: '材质' },
          value: { en: material, zh: material.includes('Cotton') ? '100% 棉' : material.includes('Silk') ? '100% 真丝' : material },
          group: 'materials',
          order: 0,
          isVisible: true,
          isFilterable: true
        },
        {
          id: faker.string.uuid(),
          name: { en: 'Care Instructions', zh: '护理说明' },
          value: { en: 'Machine wash cold, tumble dry low', zh: '冷水机洗，低温烘干' },
          group: 'care',
          order: 1,
          isVisible: true,
          isFilterable: false
        },
        {
          id: faker.string.uuid(),
          name: { en: 'Origin', zh: '产地' },
          value: { en: 'Made in China', zh: '中国制造' },
          group: 'origin',
          order: 2,
          isVisible: true,
          isFilterable: true
        }
      ],
      variants: [],
      seo: {
        title: {
          en: `${productName.en} - ${brand}`,
          zh: `${productName.zh} - ${brand}`
        },
        description: {
          en: `Shop ${productName.en.toLowerCase()} from ${brand}. Premium quality ${material.toLowerCase()} construction.`,
          zh: `选购${brand}的${productName.zh}。优质${material.includes('Cotton') ? '棉质' : '真丝'}制作。`
        },
        keywords: [material.toLowerCase(), productType.toLowerCase(), brand.toLowerCase(), 'clothing', 'fashion'],
        slug: {
          en: `${productName.en.toLowerCase().replace(/\s+/g, '-')}-${sku.toLowerCase()}`,
          zh: `${productName.zh.replace(/\s+/g, '-')}-${sku.toLowerCase()}`
        }
      },
      pricing: {
        basePrice,
        currency: 'USD',
        priceRules: [],
        taxClass: 'standard'
      },
      inventory: {
        trackQuantity: true,
        allowBackorder: faker.datatype.boolean(),
        lowStockThreshold: faker.number.int({ min: 5, max: 20 }),
        locations: [
          {
            locationId: 'warehouse-gz',
            locationName: 'Guangzhou Warehouse',
            quantity: faker.number.int({ min: 0, max: 500 }),
            reserved: faker.number.int({ min: 0, max: 50 }),
            available: faker.number.int({ min: 0, max: 450 })
          }
        ]
      },
      shipping: {
        weight: faker.number.float({ min: 0.2, max: 2.0, precision: 0.1 }),
        weightUnit: 'kg',
        dimensions: {
          length: faker.number.int({ min: 20, max: 40 }),
          width: faker.number.int({ min: 15, max: 30 }),
          height: faker.number.int({ min: 2, max: 8 }),
          unit: 'cm'
        },
        shippingClass: 'standard',
        freeShipping: faker.datatype.boolean(),
        shippingRules: []
      },
      metadata: {
        season: faker.helpers.arrayElement(['Spring', 'Summer', 'Fall', 'Winter']),
        collection: faker.helpers.arrayElement(['2024 Spring', '2024 Summer', '2024 Fall', '2024 Winter']),
        targetGender: categorySlug.includes('mens') ? 'male' : categorySlug.includes('womens') ? 'female' : 'unisex'
      },
      viewCount: faker.number.int({ min: 0, max: 10000 }),
      orderCount: faker.number.int({ min: 0, max: 500 }),
      averageRating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
      reviewCount: faker.number.int({ min: 0, max: 200 }),
      favoriteCount: faker.number.int({ min: 0, max: 1000 }),
      publishedAt: faker.helpers.maybe(() => faker.date.past(), { probability: 0.9 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    }
    
    // 生成产品变体
    const colorCount = faker.number.int({ min: 2, max: 5 })
    const sizeCount = faker.number.int({ min: 3, max: 6 })
    const selectedColors = faker.helpers.arrayElements(COLORS, colorCount)
    const selectedSizes = faker.helpers.arrayElements(SIZES, sizeCount)
    
    selectedColors.forEach((color, colorIndex) => {
      selectedSizes.forEach((size, sizeIndex) => {
        const variantSku = `${sku}-${color.value.toUpperCase()}-${size.value}`
        const variantPrice = basePrice + faker.number.float({ min: -10, max: 20, precision: 0.01 })
        
        const variant = {
          id: faker.string.uuid(),
          productId: product.id,
          sku: variantSku,
          name: {
            en: `${color.en} / ${size.en}`,
            zh: `${color.zh} / ${size.zh}`
          },
          attributes: [
            {
              name: 'color',
              value: color.value,
              displayName: { en: 'Color', zh: '颜色' },
              displayValue: { en: color.en, zh: color.zh }
            },
            {
              name: 'size',
              value: size.value,
              displayName: { en: 'Size', zh: '尺寸' },
              displayValue: { en: size.en, zh: size.zh }
            }
          ],
          price: variantPrice,
          compareAtPrice: compareAtPrice ? compareAtPrice + faker.number.float({ min: -10, max: 20, precision: 0.01 }) : null,
          cost: variantPrice * faker.number.float({ min: 0.4, max: 0.7, precision: 0.01 }),
          stock: faker.number.int({ min: 0, max: 100 }),
          weight: product.shipping.weight + faker.number.float({ min: -0.1, max: 0.1, precision: 0.01 }),
          dimensions: {
            length: product.shipping.dimensions.length + faker.number.int({ min: -2, max: 2 }),
            width: product.shipping.dimensions.width + faker.number.int({ min: -2, max: 2 }),
            height: product.shipping.dimensions.height + faker.number.int({ min: -1, max: 1 }),
            unit: 'cm'
          },
          images: [product.images[0].id], // 使用主图
          isDefault: colorIndex === 0 && sizeIndex === 0,
          status: product.status,
          metadata: {},
          orderCount: faker.number.int({ min: 0, max: 100 }),
          viewCount: faker.number.int({ min: 0, max: 1000 }),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        
        product.variants.push(variant)
      })
    })
    
    products.push(product)
  }
  
  return products
}

// 生成订单数据
function generateOrders(users: any[], products: any[], count: number) {
  const orders = []
  const customerUsers = users.filter(user => user.role === 'customer')
  
  for (let i = 0; i < count; i++) {
    const customer = faker.helpers.arrayElement(customerUsers)
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`
    
    // 随机选择1-5个产品
    const orderProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 5 }))
    const items = []
    let subtotal = 0
    
    orderProducts.forEach(product => {
      const variant = faker.helpers.arrayElement(product.variants)
      const quantity = faker.number.int({ min: 1, max: 10 })
      const unitPrice = variant.price
      const totalPrice = unitPrice * quantity
      
      items.push({
        id: faker.string.uuid(),
        orderId: '', // 将在后面设置
        productId: product.id,
        variantId: variant.id,
        product: {
          name: product.name,
          brand: product.brand,
          image: product.images[0].url
        },
        variant: {
          sku: variant.sku,
          name: variant.name,
          attributes: variant.attributes
        },
        quantity,
        unitPrice,
        compareAtPrice: variant.compareAtPrice,
        totalPrice,
        customizations: [],
        metadata: {},
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent()
      })
      
      subtotal += totalPrice
    })
    
    const discountAmount = faker.helpers.maybe(() => 
      faker.number.float({ min: 5, max: subtotal * 0.2, precision: 0.01 })
    , { probability: 0.3 }) || 0
    
    const taxAmount = (subtotal - discountAmount) * 0.09 // 9% tax
    const shippingAmount = subtotal > 100 ? 0 : faker.number.float({ min: 5, max: 25, precision: 0.01 })
    const total = subtotal - discountAmount + taxAmount + shippingAmount
    
    const country = faker.helpers.arrayElement(COUNTRIES)
    
    const order = {
      id: faker.string.uuid(),
      orderNumber,
      userId: customer.id,
      status: faker.helpers.weightedArrayElement([
        { weight: 0.1, value: 'pending' },
        { weight: 0.15, value: 'confirmed' },
        { weight: 0.2, value: 'processing' },
        { weight: 0.25, value: 'shipped' },
        { weight: 0.25, value: 'delivered' },
        { weight: 0.03, value: 'cancelled' },
        { weight: 0.02, value: 'refunded' }
      ]),
      paymentStatus: faker.helpers.weightedArrayElement([
        { weight: 0.05, value: 'pending' },
        { weight: 0.02, value: 'authorized' },
        { weight: 0.85, value: 'paid' },
        { weight: 0.03, value: 'partially_paid' },
        { weight: 0.02, value: 'refunded' },
        { weight: 0.02, value: 'failed' },
        { weight: 0.01, value: 'cancelled' }
      ]),
      fulfillmentStatus: faker.helpers.weightedArrayElement([
        { weight: 0.15, value: 'unfulfilled' },
        { weight: 0.1, value: 'partially_fulfilled' },
        { weight: 0.25, value: 'fulfilled' },
        { weight: 0.25, value: 'shipped' },
        { weight: 0.25, value: 'delivered' }
      ]),
      items,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        isGuest: false
      },
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }),
        address1: faker.location.streetAddress(),
        address2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
        city: faker.location.city(),
        province: faker.location.state(),
        country: country.code,
        zip: faker.location.zipCode(),
        phone: customer.phone
      },
      billingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }),
        address1: faker.location.streetAddress(),
        address2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
        city: faker.location.city(),
        province: faker.location.state(),
        country: country.code,
        zip: faker.location.zipCode(),
        phone: customer.phone
      },
      shipping: {
        method: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
        methodName: faker.helpers.arrayElement(['Standard Shipping', 'Express Shipping', 'Overnight Delivery']),
        cost: shippingAmount,
        estimatedDelivery: faker.date.future(),
        actualDelivery: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.6 }),
        trackingNumber: faker.helpers.maybe(() => faker.string.alphanumeric(12).toUpperCase(), { probability: 0.8 }),
        trackingUrl: faker.helpers.maybe(() => `https://tracking.example.com/${faker.string.alphanumeric(12)}`, { probability: 0.8 }),
        carrier: faker.helpers.arrayElement(['DHL', 'FedEx', 'UPS', 'EMS'])
      },
      payment: {
        method: faker.helpers.arrayElement(['stripe', 'paypal', 'bank_transfer']),
        methodName: faker.helpers.arrayElement(['Credit Card', 'PayPal', 'Bank Transfer']),
        transactionId: faker.string.alphanumeric(16).toUpperCase(),
        gateway: faker.helpers.arrayElement(['stripe', 'paypal', 'adyen']),
        gatewayTransactionId: faker.string.alphanumeric(20),
        currency: 'USD',
        exchangeRate: 1,
        paidAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.9 }),
        authorizedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.8 }),
        capturedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.8 })
      },
      discounts: discountAmount > 0 ? [{
        id: faker.string.uuid(),
        code: faker.helpers.arrayElement(['SAVE10', 'WELCOME20', 'SUMMER15', 'NEWUSER']),
        type: 'percentage',
        value: discountAmount,
        description: 'Discount applied',
        appliedAt: faker.date.recent()
      }] : [],
      taxes: [{
        name: 'Sales Tax',
        rate: 0.09,
        amount: taxAmount,
        jurisdiction: country.code
      }],
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount,
      total,
      paidAmount: total,
      refundedAmount: 0,
      metadata: {
        source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
        userAgent: faker.internet.userAgent(),
        ipAddress: faker.internet.ip(),
        utm: {
          source: faker.helpers.arrayElement(['google', 'facebook', 'email', 'direct']),
          medium: faker.helpers.arrayElement(['cpc', 'social', 'email', 'organic']),
          campaign: faker.helpers.arrayElement(['summer_sale', 'new_collection', 'retargeting'])
        }
      },
      processedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.8 }),
      shippedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.6 }),
      deliveredAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.5 }),
      cancelledAt: null,
      cancellationReason: null,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    }
    
    // 设置订单项的 orderId
    items.forEach(item => {
      item.orderId = order.id
    })
    
    orders.push(order)
  }
  
  return orders
}

// 主函数
async function generateTestData() {
  console.log('🚀 开始生成测试数据...')
  
  // 生成数据
  console.log('👥 生成用户数据...')
  const users = generateUsers(1000)
  
  console.log('📂 生成分类数据...')
  const categories = generateCategories()
  
  console.log('🛍️ 生成产品数据...')
  const products = generateProducts(categories, 2000)
  
  console.log('📦 生成订单数据...')
  const orders = generateOrders(users, products, 2000)
  
  // 创建输出目录
  const outputDir = path.join(__dirname, '../data/test-data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // 写入文件
  console.log('💾 保存数据到文件...')
  
  fs.writeFileSync(
    path.join(outputDir, 'users.json'),
    JSON.stringify(users, null, 2)
  )
  
  fs.writeFileSync(
    path.join(outputDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  )
  
  fs.writeFileSync(
    path.join(outputDir, 'products.json'),
    JSON.stringify(products, null, 2)
  )
  
  fs.writeFileSync(
    path.join(outputDir, 'orders.json'),
    JSON.stringify(orders, null, 2)
  )
  
  // 生成统计信息
  const stats = {
    users: {
      total: users.length,
      customers: users.filter(u => u.role === 'customer').length,
      distributors: users.filter(u => u.role === 'distributor').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.status === 'active').length
    },
    categories: {
      total: categories.length,
      parent: categories.filter(c => c.parentId === null).length,
      child: categories.filter(c => c.parentId !== null).length
    },
    products: {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      variants: products.reduce((sum, p) => sum + p.variants.length, 0),
      brands: [...new Set(products.map(p => p.brand))].length
    },
    orders: {
      total: orders.length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalValue: orders.reduce((sum, o) => sum + o.total, 0),
      items: orders.reduce((sum, o) => sum + o.items.length, 0)
    }
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'stats.json'),
    JSON.stringify(stats, null, 2)
  )
  
  // 生成 SQL 导入脚本
  console.log('📝 生成 SQL 导入脚本...')
  generateSQLScript(users, categories, products, orders, outputDir)
  
  console.log('✅ 测试数据生成完成!')
  console.log(`📊 统计信息:`)
  console.log(`   用户: ${stats.users.total} (客户: ${stats.users.customers}, 经销商: ${stats.users.distributors}, 管理员: ${stats.users.admins})`)
  console.log(`   分类: ${stats.categories.total} (父分类: ${stats.categories.parent}, 子分类: ${stats.categories.child})`)
  console.log(`   产品: ${stats.products.total} (变体: ${stats.products.variants}, 品牌: ${stats.products.brands})`)
  console.log(`   订单: ${stats.orders.total} (总价值: $${stats.orders.totalValue.toFixed(2)})`)
  console.log(`📁 文件保存在: ${outputDir}`)
}

// 生成 SQL 导入脚本
function generateSQLScript(users: any[], categories: any[], products: any[], orders: any[], outputDir: string) {
  let sql = `-- YXLP Platform Test Data
-- Generated on ${new Date().toISOString()}
-- Total records: ${users.length + categories.length + products.length + orders.length}

SET foreign_key_checks = 0;

`

  // 用户数据
  sql += `-- Users (${users.length} records)\n`
  sql += `TRUNCATE TABLE users;\n`
  sql += `INSERT INTO users (id, email, username, password, role, status, first_name, last_name, avatar, phone, country, language, preferences, email_verified_at, last_login_at, login_attempts, locked_until, created_at, updated_at) VALUES\n`
  
  users.forEach((user, index) => {
    const values = [
      `'${user.id}'`,
      `'${user.email}'`,
      user.username ? `'${user.username}'` : 'NULL',
      `'${user.password}'`,
      `'${user.role}'`,
      `'${user.status}'`,
      `'${user.firstName.replace(/'/g, "''")}'`,
      `'${user.lastName.replace(/'/g, "''")}'`,
      user.avatar ? `'${user.avatar}'` : 'NULL',
      user.phone ? `'${user.phone}'` : 'NULL',
      `'${user.country}'`,
      `'${user.language}'`,
      `'${JSON.stringify(user.preferences).replace(/'/g, "''")}'`,
      user.emailVerifiedAt ? `'${user.emailVerifiedAt.toISOString()}'` : 'NULL',
      user.lastLoginAt ? `'${user.lastLoginAt.toISOString()}'` : 'NULL',
      user.loginAttempts,
      'NULL',
      `'${user.createdAt.toISOString()}'`,
      `'${user.updatedAt.toISOString()}'`
    ]
    
    sql += `(${values.join(', ')})${index === users.length - 1 ? ';\n\n' : ',\n'}`
  })
  
  // 分类数据
  sql += `-- Categories (${categories.length} records)\n`
  sql += `TRUNCATE TABLE categories;\n`
  sql += `INSERT INTO categories (id, name, slug, description, parent_id, image, \`order\`, is_active, seo, metadata, product_count, created_at, updated_at) VALUES\n`
  
  categories.forEach((category, index) => {
    const values = [
      `'${category.id}'`,
      `'${JSON.stringify(category.name).replace(/'/g, "''")}'`,
      `'${JSON.stringify(category.slug).replace(/'/g, "''")}'`,
      `'${JSON.stringify(category.description).replace(/'/g, "''")}'`,
      category.parentId ? `'${category.parentId}'` : 'NULL',
      category.image ? `'${category.image}'` : 'NULL',
      category.order,
      category.isActive ? 'TRUE' : 'FALSE',
      `'${JSON.stringify(category.seo).replace(/'/g, "''")}'`,
      `'${JSON.stringify(category.metadata).replace(/'/g, "''")}'`,
      category.productCount,
      `'${category.createdAt.toISOString()}'`,
      `'${category.updatedAt.toISOString()}'`
    ]
    
    sql += `(${values.join(', ')})${index === categories.length - 1 ? ';\n\n' : ',\n'}`
  })
  
  sql += `SET foreign_key_checks = 1;\n`
  
  fs.writeFileSync(path.join(outputDir, 'import.sql'), sql)
}

// 运行生成器
if (require.main === module) {
  generateTestData().catch(console.error)
}

export { generateTestData }
