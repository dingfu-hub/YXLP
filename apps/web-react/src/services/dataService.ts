import { Product, Category, Customer, Order, PaginatedResponse, ProductSearchFilters } from '../types';
import TestDataGenerator from '../utils/testDataGenerator';

// 模拟数据存储
class DataService {
  private static instance: DataService;
  private generator: TestDataGenerator;
  private data: {
    categories: Category[];
    products: Product[];
    customers: Customer[];
    orders: Order[];
  } | null = null;

  private constructor() {
    this.generator = TestDataGenerator.getInstance();
    this.initializeData();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // 初始化数据
  private initializeData() {
    if (!this.data) {
      this.data = this.generator.generateFullDataset({
        products: 5000,
        customers: 1000,
        orders: 2000,
      });
    }
  }

  // 模拟API延迟
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 分页工具函数
  private paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // 产品相关方法
  async getProducts(
    page: number = 1,
    limit: number = 20,
    filters?: ProductSearchFilters
  ): Promise<PaginatedResponse<Product>> {
    await this.delay();
    
    if (!this.data) throw new Error('Data not initialized');

    let filteredProducts = [...this.data.products];

    // 应用过滤器
    if (filters) {
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
      }
      if (filters.colors && filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.colors.some(color => filters.colors!.includes(color.name))
        );
      }
      if (filters.sizes && filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.sizes.some(size => filters.sizes!.includes(size.name))
        );
      }
      if (filters.brands && filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(p => filters.brands!.includes(p.brand));
      }
      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
      }
      if (filters.rating) {
        filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating!);
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          filters.tags!.some(tag => p.tags.includes(tag))
        );
      }
    }

    return this.paginate(filteredProducts, page, limit);
  }

  async getProduct(id: string): Promise<Product | null> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.products.find(p => p.id === id) || null;
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    await this.delay(300);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.products
      .filter(p => p.isFeatured)
      .slice(0, limit);
  }

  async getBestSellingProducts(limit: number = 8): Promise<Product[]> {
    await this.delay(300);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.products
      .filter(p => p.isBestSeller)
      .slice(0, limit);
  }

  async getNewProducts(limit: number = 8): Promise<Product[]> {
    await this.delay(300);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.products
      .filter(p => p.isNew)
      .slice(0, limit);
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    await this.delay(400);
    
    if (!this.data) throw new Error('Data not initialized');
    
    const lowercaseQuery = query.toLowerCase();
    return this.data.products
      .filter(p => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        p.brand.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, limit);
  }

  // 分类相关方法
  async getCategories(): Promise<Category[]> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return [...this.data.categories];
  }

  async getCategory(id: string): Promise<Category | null> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.categories.find(c => c.id === id) || null;
  }

  async getFeaturedCategories(): Promise<Category[]> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.categories.filter(c => c.featured);
  }

  // 客户相关方法
  async getCustomers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Customer>> {
    await this.delay();
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.paginate(this.data.customers, page, limit);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.customers.find(c => c.id === id) || null;
  }

  // 订单相关方法
  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Order>> {
    await this.delay();
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.paginate(this.data.orders, page, limit);
  }

  async getOrder(id: string): Promise<Order | null> {
    await this.delay(200);
    
    if (!this.data) throw new Error('Data not initialized');
    
    return this.data.orders.find(o => o.id === id) || null;
  }

  async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    await this.delay();
    
    if (!this.data) throw new Error('Data not initialized');
    
    const customerOrders = this.data.orders.filter(o => o.userId === customerId);
    return this.paginate(customerOrders, page, limit);
  }

  // 统计数据方法
  async getStatistics() {
    await this.delay(300);
    
    if (!this.data) throw new Error('Data not initialized');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      products: {
        total: this.data.products.length,
        inStock: this.data.products.filter(p => p.inStock).length,
        outOfStock: this.data.products.filter(p => !p.inStock).length,
        featured: this.data.products.filter(p => p.isFeatured).length,
        new: this.data.products.filter(p => p.isNew).length,
      },
      categories: {
        total: this.data.categories.length,
        featured: this.data.categories.filter(c => c.featured).length,
      },
      customers: {
        total: this.data.customers.length,
        active: this.data.customers.filter(c => c.isActive).length,
        verified: this.data.customers.filter(c => c.isVerified).length,
        distributors: this.data.customers.filter(c => c.role === 'distributor').length,
      },
      orders: {
        total: this.data.orders.length,
        pending: this.data.orders.filter(o => o.status === 'pending').length,
        processing: this.data.orders.filter(o => o.status === 'processing').length,
        shipped: this.data.orders.filter(o => o.status === 'shipped').length,
        delivered: this.data.orders.filter(o => o.status === 'delivered').length,
        totalRevenue: this.data.orders.reduce((sum, o) => sum + o.total, 0),
      },
    };
  }

  // 重新生成数据
  async regenerateData(config?: { products?: number; customers?: number; orders?: number }) {
    await this.delay(1000);
    
    const defaultConfig = { products: 5000, customers: 1000, orders: 2000 };
    const finalConfig = { ...defaultConfig, ...config };
    
    this.data = this.generator.generateFullDataset(finalConfig);
    
    return this.data;
  }

  // 获取所有数据（用于导出）
  getAllData() {
    return this.data;
  }

  // 清空数据
  clearData() {
    this.data = null;
  }
}

export default DataService;
