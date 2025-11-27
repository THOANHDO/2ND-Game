
// --- Enums ---
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

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  isUsed: boolean;
  campaignId?: string;
  minOrderAmount?: number;
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
  addresses?: Address[];
  vouchers?: Voucher[];
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  costPrice: number;
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
  appliedVoucherCode?: string;
  voucherDiscountAmount?: number;
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

// --- Marketing Interfaces ---

export type CampaignType = 'DISCOUNT_PERCENT' | 'GIFT_VOUCHER';

export interface VoucherConfig {
  codePrefix: string;
  discountValue: number;
  maxDiscountAmount: number;
  validDays: number;
  minOrderAmount?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  value: number; // Percentage for direct discount
  voucherConfig?: VoucherConfig; // For GIFT_VOUCHER type
  targetProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
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
  categorySlug: string;
  limit: number;
}

export interface SiteConfig {
  facebookUrl: string;
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
