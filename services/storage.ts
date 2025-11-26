
import { Product, Order, OrderStatus, PaymentStatus, CartItem, User, HeroSlide, SiteConfig, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_HERO_SLIDES, INITIAL_CATEGORIES } from './data';

const PRODUCTS_KEY = 'nintenstore_products';
const ORDERS_KEY = 'nintenstore_orders';
const USERS_KEY = 'nintenstore_users_db';
const SLIDES_KEY = 'nintenstore_hero_slides';
const CONFIG_KEY = 'nintenstore_site_config';
const CATEGORIES_KEY = 'nintenstore_categories';

// Initialize DB
if (!localStorage.getItem(PRODUCTS_KEY)) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
}
if (!localStorage.getItem(ORDERS_KEY)) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
}
if (!localStorage.getItem(SLIDES_KEY)) {
  localStorage.setItem(SLIDES_KEY, JSON.stringify(INITIAL_HERO_SLIDES));
}
if (!localStorage.getItem(CATEGORIES_KEY)) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
}
if (!localStorage.getItem(USERS_KEY)) {
    // Seed an admin
    const adminUser: User = {
        id: 'ADMIN_001',
        name: 'Super Admin',
        email: 'admin@ninten.com',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
}
if (!localStorage.getItem(CONFIG_KEY)) {
    // Initial config will be handled by getSiteConfig defaults
}

// Helper to notify listeners
const notifyChange = () => {
    window.dispatchEvent(new Event('nintenstore_data_change'));
};

export const StorageService = {
  // PRODUCTS
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProductById: (id: string): Product | undefined => {
    const products = StorageService.getProducts();
    return products.find(p => p.id === id);
  },

  saveProduct: (product: Product): void => {
      const products = StorageService.getProducts();
      const index = products.findIndex(p => p.id === product.id);
      
      if (index >= 0) {
          // Update
          products[index] = product;
      } else {
          // Add new
          products.push(product);
      }
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      notifyChange();
  },

  deleteProduct: (id: string): void => {
      let products = StorageService.getProducts();
      products = products.filter(p => p.id !== id);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      notifyChange();
  },

  // CATEGORIES
  getCategories: (): Category[] => {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : [];
  },

  saveCategory: (category: Category): void => {
      const categories = StorageService.getCategories();
      const index = categories.findIndex(c => c.id === category.id);
      if (index >= 0) {
          categories[index] = category;
      } else {
          categories.push(category);
      }
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      notifyChange();
  },

  deleteCategory: (id: string): void => {
      let categories = StorageService.getCategories();
      categories = categories.filter(c => c.id !== id);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      notifyChange();
  },

  // ORDERS
  createOrder: (
    items: CartItem[], 
    customerDetails: { name: string; email: string; address: string; paymentMethod: string },
    total: number,
    userId?: string
  ): Order => {
    const ordersData = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = ordersData ? JSON.parse(ordersData) : [];

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      totalAmount: total,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      shippingAddress: customerDetails.address,
      paymentMethod: customerDetails.paymentMethod,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.PROCESSING,
      transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
      createdAt: new Date().toISOString(),
      userId
    };

    orders.unshift(newOrder); // Add to top
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notifyChange();
    return newOrder;
  },

  getOrders: (): Order[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getOrdersByUserId: (userId: string, email?: string): Order[] => {
      const orders = StorageService.getOrders();
      return orders.filter(o => 
          (userId && o.userId === userId) || 
          (email && o.customerEmail === email)
      );
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): void => {
      const orders = StorageService.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
          order.orderStatus = status;
          localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
          notifyChange();
      }
  },

  // USERS
  getUsers: (): User[] => {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
  },

  addUser: (user: User): void => {
      const users = StorageService.getUsers();
      // Check if exists
      if (!users.find(u => (user.email && u.email === user.email) || (user.phoneNumber && u.phoneNumber === user.phoneNumber))) {
          users.push({ ...user, createdAt: new Date().toISOString() });
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          notifyChange();
      }
  },

  updateUser: (updatedUser: User): void => {
      const users = StorageService.getUsers();
      const index = users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          notifyChange();
      }
  },

  // HERO SLIDES
  getHeroSlides: (): HeroSlide[] => {
      const data = localStorage.getItem(SLIDES_KEY);
      return data ? JSON.parse(data) : [];
  },

  updateHeroSlide: (updatedSlide: HeroSlide): void => {
      const slides = StorageService.getHeroSlides();
      const index = slides.findIndex(s => s.id === updatedSlide.id);
      if (index >= 0) {
          slides[index] = updatedSlide;
          localStorage.setItem(SLIDES_KEY, JSON.stringify(slides));
          notifyChange();
      }
  },

  // SITE CONFIG
  getSiteConfig: (): SiteConfig => {
      const data = localStorage.getItem(CONFIG_KEY);
      let config: SiteConfig = data ? JSON.parse(data) : { facebookUrl: 'https://m.me/' };

      // Ensure defaults for Auth Config
      if (!config.authConfig) {
          config.authConfig = {
            login: {
                title: "Welcome Back, Gamer!",
                subtitle: "Tiếp tục cuộc hành trình của bạn trong thế giới Nintendo. Hàng ngàn ưu đãi đang chờ đón.",
                image: "https://images.unsplash.com/photo-1620287532393-273679805d77?auto=format&fit=crop&q=80&w=1500"
            },
            register: {
                title: "Tham Gia Cộng Đồng",
                subtitle: "Tạo tài khoản ngay để theo dõi đơn hàng, nhận ưu đãi độc quyền và tham gia bình luận.",
                image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&q=80&w=1500"
            },
            forgotPassword: {
                title: "Quên Mật Khẩu?",
                subtitle: "Đừng lo, hãy nhập email của bạn để chúng tôi gửi hướng dẫn đặt lại mật khẩu.",
                image: ""
            }
        };
      }

      // Ensure defaults for Footer Config
      if (!config.footerConfig) {
          config.footerConfig = {
              description: "Địa điểm mua sắm tin cậy cho cộng đồng game thủ Nintendo tại Việt Nam. Cung cấp máy game, đĩa game và phụ kiện chính hãng.",
              copyright: "© 2023 NintenStore Vietnam. Designed with passion.",
              sections: [
                  {
                      title: "Mua sắm",
                      links: [
                          { label: "Máy chơi game", url: "#" },
                          { label: "Đĩa Game", url: "#" },
                          { label: "Phụ kiện", url: "#" }
                      ]
                  },
                  {
                      title: "Hỗ trợ",
                      links: [
                          { label: "Trung tâm bảo hành", url: "#" },
                          { label: "Chính sách đổi trả", url: "#" },
                          { label: "Liên hệ chúng tôi", url: "#" }
                      ]
                  }
              ]
          };
      }

      return config;
  },

  saveSiteConfig: (config: SiteConfig): void => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      notifyChange();
  }
};
