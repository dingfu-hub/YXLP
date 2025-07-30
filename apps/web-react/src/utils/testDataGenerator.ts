import { Product, Category, Customer, Order, OrderItem, Address, ProductColor, ProductSize } from '../types';

// 随机数据生成工具
class TestDataGenerator {
  private static instance: TestDataGenerator;
  
  // 基础数据
  private readonly categories = [
    'shirts', 'pants', 'dresses', 'jackets', 'accessories', 'shoes', 'underwear', 'sportswear'
  ];
  
  private readonly brands = [
    'YXLP Premium', 'Fashion Forward', 'Urban Style', 'Classic Wear', 'Modern Threads',
    'Elite Fashion', 'Trendy Basics', 'Luxury Line', 'Casual Comfort', 'Professional Wear'
  ];
  
  private readonly colors: ProductColor[] = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Navy Blue', code: '#000080' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Green', code: '#008000' },
    { name: 'Gray', code: '#808080' },
    { name: 'Brown', code: '#A52A2A' },
    { name: 'Pink', code: '#FFC0CB' },
    { name: 'Purple', code: '#800080' },
    { name: 'Orange', code: '#FFA500' },
  ];
  
  private readonly sizes: ProductSize[] = [
    { name: 'XS', measurements: { chest: 32, waist: 26, length: 24 } },
    { name: 'S', measurements: { chest: 36, waist: 30, length: 26 } },
    { name: 'M', measurements: { chest: 40, waist: 34, length: 28 } },
    { name: 'L', measurements: { chest: 44, waist: 38, length: 30 } },
    { name: 'XL', measurements: { chest: 48, waist: 42, length: 32 } },
    { name: 'XXL', measurements: { chest: 52, waist: 46, length: 34 } },
  ];
  
  private readonly materials = [
    'Cotton', 'Polyester', 'Silk', 'Wool', 'Linen', 'Denim', 'Leather', 'Cashmere', 'Bamboo', 'Modal'
  ];
  
  private readonly countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
    'Australia', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Netherlands', 'Sweden'
  ];
  
  private readonly firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer',
    'James', 'Mary', 'Christopher', 'Patricia', 'Daniel', 'Linda', 'Matthew', 'Elizabeth', 'Anthony', 'Barbara'
  ];
  
  private readonly lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];
  
  private readonly companyNames = [
    'Fashion Retail Group', 'Style Boutique', 'Urban Fashion Co.', 'Trendy Threads Ltd.',
    'Classic Clothing Inc.', 'Modern Apparel', 'Elite Fashion House', 'Casual Wear Co.',
    'Professional Attire', 'Luxury Fashion Brand'
  ];

  public static getInstance(): TestDataGenerator {
    if (!TestDataGenerator.instance) {
      TestDataGenerator.instance = new TestDataGenerator();
    }
    return TestDataGenerator.instance;
  }

  // 随机选择数组中的元素
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // 随机选择多个元素
  private randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // 生成随机字符串
  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成随机日期
  private randomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
  }

  // 生成产品数据
  generateProducts(count: number): Product[] {
    const products: Product[] = [];
    
    for (let i = 0; i < count; i++) {
      const category = this.randomChoice(this.categories);
      const brand = this.randomChoice(this.brands);
      const productColors = this.randomChoices(this.colors, Math.floor(Math.random() * 4) + 1);
      const productSizes = this.randomChoices(this.sizes, Math.floor(Math.random() * 4) + 2);
      const productMaterials = this.randomChoices(this.materials, Math.floor(Math.random() * 3) + 1);
      
      const price = Math.floor(Math.random() * 200) + 20;
      const originalPrice = Math.random() > 0.7 ? price + Math.floor(Math.random() * 100) + 20 : undefined;
      
      const product: Product = {
        id: `product-${i + 1}`,
        name: `${brand} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
        description: `Premium quality ${category} made from ${productMaterials.join(', ')}. Perfect for both casual and formal occasions.`,
        price,
        originalPrice,
        images: [
          `/api/placeholder/400/400?text=${encodeURIComponent(category)}-${i + 1}-1`,
          `/api/placeholder/400/400?text=${encodeURIComponent(category)}-${i + 1}-2`,
          `/api/placeholder/400/400?text=${encodeURIComponent(category)}-${i + 1}-3`,
        ],
        category,
        subcategory: `${category}-sub`,
        brand,
        sku: `${category.toUpperCase()}-${this.randomString(6)}`,
        colors: productColors,
        sizes: productSizes,
        materials: productMaterials,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviewCount: Math.floor(Math.random() * 500) + 10,
        inStock: Math.random() > 0.1,
        stockQuantity: Math.floor(Math.random() * 1000) + 50,
        minOrderQuantity: Math.floor(Math.random() * 10) + 1,
        tags: this.randomChoices(['trendy', 'comfortable', 'durable', 'stylish', 'premium', 'casual', 'formal'], 3),
        isNew: Math.random() > 0.8,
        isBestSeller: Math.random() > 0.9,
        isPremium: Math.random() > 0.85,
        isFeatured: Math.random() > 0.7,
        weight: Math.floor(Math.random() * 500) + 100, // grams
        dimensions: {
          length: Math.floor(Math.random() * 50) + 20,
          width: Math.floor(Math.random() * 40) + 15,
          height: Math.floor(Math.random() * 10) + 2,
        },
        createdAt: this.randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: this.randomDate(new Date(2023, 6, 1), new Date()),
      };
      
      products.push(product);
    }
    
    return products;
  }

  // 生成分类数据
  generateCategories(): Category[] {
    return this.categories.map((category, index) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      description: `Premium ${category} collection with various styles and designs`,
      image: `/api/placeholder/400/300?text=${encodeURIComponent(category)}`,
      subcategories: [`${category}-casual`, `${category}-formal`, `${category}-premium`],
      productCount: Math.floor(Math.random() * 500) + 100,
      featured: Math.random() > 0.5,
      sortOrder: index,
      createdAt: this.randomDate(new Date(2023, 0, 1), new Date(2023, 6, 1)),
      updatedAt: this.randomDate(new Date(2023, 6, 1), new Date()),
    }));
  }

  // 生成客户数据
  generateCustomers(count: number): Customer[] {
    const customers: Customer[] = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = this.randomChoice(this.firstNames);
      const lastName = this.randomChoice(this.lastNames);
      const country = this.randomChoice(this.countries);
      
      const customer: Customer = {
        id: `customer-${i + 1}`,
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
        displayName: `${firstName} ${lastName}`,
        role: Math.random() > 0.9 ? 'distributor' : 'user',
        firstName,
        lastName,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        company: Math.random() > 0.6 ? this.randomChoice(this.companyNames) : undefined,
        country,
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} ${this.randomChoice(['Main', 'Oak', 'Pine', 'Elm', 'Maple'])} St`,
          city: this.randomChoice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
          state: this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ']),
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
          country,
        },
        isVerified: Math.random() > 0.2,
        isActive: Math.random() > 0.1,
        avatar: `/api/placeholder/100/100?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
        preferences: {
          language: 'en',
          currency: 'USD',
          notifications: {
            email: Math.random() > 0.3,
            sms: Math.random() > 0.7,
            push: Math.random() > 0.5,
          },
        },
        createdAt: this.randomDate(new Date(2023, 0, 1), new Date()),
        lastLoginAt: Math.random() > 0.2 ? this.randomDate(new Date(2024, 0, 1), new Date()) : undefined,
        updatedAt: this.randomDate(new Date(2023, 6, 1), new Date()),
      };
      
      customers.push(customer);
    }
    
    return customers;
  }

  // 生成订单数据
  generateOrders(count: number, customers: Customer[], products: Product[]): Order[] {
    const orders: Order[] = [];
    
    for (let i = 0; i < count; i++) {
      const customer = this.randomChoice(customers);
      const orderProducts = this.randomChoices(products, Math.floor(Math.random() * 5) + 1);
      
      const items: OrderItem[] = orderProducts.map(product => {
        const quantity = Math.floor(Math.random() * 5) + 1;
        return {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          sku: product.sku,
          quantity,
          price: product.price,
          color: product.colors.length > 0 ? this.randomChoice(product.colors).name : undefined,
          size: product.sizes.length > 0 ? this.randomChoice(product.sizes).name : undefined,
          total: product.price * quantity,
        };
      });
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
      const total = subtotal + tax + shipping;
      
      const order: Order = {
        id: `order-${i + 1}`,
        userId: customer.id,
        items,
        subtotal,
        tax,
        shipping,
        total,
        currency: 'USD',
        status: this.randomChoice(['pending', 'confirmed', 'processing', 'shipped', 'delivered']),
        paymentStatus: this.randomChoice(['pending', 'paid', 'failed']),
        paymentMethod: this.randomChoice(['credit_card', 'paypal', 'bank_transfer']),
        shippingAddress: customer.address!,
        billingAddress: customer.address!,
        trackingNumber: Math.random() > 0.5 ? `TRK${this.randomString(10).toUpperCase()}` : undefined,
        notes: Math.random() > 0.7 ? 'Please handle with care' : undefined,
        createdAt: this.randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: this.randomDate(new Date(2023, 6, 1), new Date()),
        estimatedDelivery: this.randomDate(new Date(), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      };
      
      orders.push(order);
    }
    
    return orders;
  }

  // 生成完整的测试数据集
  generateFullDataset(config: {
    products: number;
    customers: number;
    orders: number;
  }) {
    console.log('Generating test data...');
    
    const categories = this.generateCategories();
    const products = this.generateProducts(config.products);
    const customers = this.generateCustomers(config.customers);
    const orders = this.generateOrders(config.orders, customers, products);
    
    console.log(`Generated:
      - ${categories.length} categories
      - ${products.length} products
      - ${customers.length} customers
      - ${orders.length} orders
    `);
    
    return {
      categories,
      products,
      customers,
      orders,
    };
  }
}

export default TestDataGenerator;
