import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Product, Order, User, HeroSlide, SiteConfig, Category, StockImport } from '../types';

// Components
import AdminSidebar, { Tab } from '../components/admin/AdminSidebar';
import DashboardStats from '../components/admin/DashboardStats';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import OrderManager from '../components/admin/OrderManager';
import CustomerManager from '../components/admin/CustomerManager';
import ContentManager from '../components/admin/ContentManager';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [stockImports, setStockImports] = useState<StockImport[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ facebookUrl: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setOrders(StorageService.getOrders());
    setUsers(StorageService.getUsers());
    setSlides(StorageService.getHeroSlides());
    setStockImports(StorageService.getStockImports());
    setSiteConfig(StorageService.getSiteConfig());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto max-h-screen">
          <div className="p-8">
              <header className="mb-8 flex justify-between items-center">
                  <div><h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeTab}</h2></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" alt="" />
                  </div>
              </header>

              {activeTab === 'DASHBOARD' && (
                <DashboardStats orders={orders} products={products} users={users} stockImports={stockImports} />
              )}
              {activeTab === 'PRODUCTS' && (
                <ProductManager products={products} categories={categories} refreshData={refreshData} />
              )}
              {activeTab === 'CATEGORIES' && (
                <CategoryManager categories={categories} refreshData={refreshData} />
              )}
              {activeTab === 'ORDERS' && (
                <OrderManager orders={orders} refreshData={refreshData} />
              )}
              {activeTab === 'CUSTOMERS' && (
                <CustomerManager users={users} />
              )}
              {activeTab === 'CONTENT' && (
                <ContentManager slides={slides} siteConfig={siteConfig} refreshData={refreshData} />
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;