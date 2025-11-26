
// Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum OrderStatus {
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export type UserRole = 'ADMIN' | 'CUSTOMER';

// --- Core Interfaces ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string; // Material Icon Name
  description?: string;
}

export interface Address {
    id: string;
    label: string; // "Nhà riêng", "Công ty", etc.
    recipientName: string;
    phoneNumber: string;
    city: string;
    addressLine: string; // Số nhà, tên đường, phường xã
    isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;      
  phoneNumber?: string; 
  role: UserRole;
  avatar?: string;
  dob?: string;        
  city?: string;
  addresses?: Address[]; // New: List of saved addresses
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; 
  images: string[]; 
  videoUrl?: string; 
  rating: number;
  stock: number;
  releaseDate: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product; 
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string; 
  createdAt: string;
  userId?: string; 
}

// --- CMS / Admin Interfaces ---

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  bgGradient: string;
  accentColor: string;
  theme: 'dark' | 'light';
}

export interface StockImport {
    id: string;
    productId: string;
    quantity: number;
    importPrice: number;
    totalCost: number;
    timestamp: string;
    note?: string;
}

// --- Configuration Interfaces ---

export interface PageContent {
    image?: string;
    title: string;
    subtitle: string;
}

export interface FooterLink {
    label: string;
    url: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    description: string;
    sections: FooterSection[];
    copyright: string;
}

export interface BankConfig {
    bankId: string;
    accountNo: string;
    accountName: string;
    template: string;
}

export interface HomeSection {
    id: string;
    title: string;
    categorySlug: string; // Map to Category.slug or 'ALL'
    limit: number;
}

export interface SiteConfig {
  facebookUrl: string; // m.me link
  contactPhone?: string;
  contactEmail?: string;
  authConfig?: {
      login: PageContent;
      register: PageContent;
      forgotPassword: PageContent;
  };
  footerConfig?: FooterConfig;
  bankConfig?: BankConfig;
  homeSections?: HomeSection[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
