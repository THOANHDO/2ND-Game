

// Enums - Deprecated for Category, keeping for Order/Payment status
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

export type UserRole = 'ADMIN' | 'CUSTOMER';

// Interfaces
export interface Category {
  id: string;
  name: string;
  slug: string; // Used for filtering e.g., 'CONSOLE', 'GAME'
  icon?: string; // Material Icon Name
  description?: string;
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
  createdAt?: string; // Added for Admin tracking
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // Changed from Enum to string to support dynamic categories
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

// New Interface for Homepage Management
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  bgGradient: string; // e.g., "from-red-600 to-orange-500"
  accentColor: string; // e.g., "bg-red-600"
  theme: 'dark' | 'light';
}

// Inventory Management
export interface StockImport {
    id: string;
    productId: string;
    quantity: number;
    importPrice: number; // Cost per unit
    totalCost: number;
    timestamp: string;
    note?: string;
}

// Auth Page Configuration
export interface PageContent {
    image?: string;
    title: string;
    subtitle: string;
}

// Footer Configuration
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

// Global Site Configuration
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
}