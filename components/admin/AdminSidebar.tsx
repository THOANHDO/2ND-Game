
import React from 'react';
import { Link } from 'react-router-dom';

export type Tab = 'DASHBOARD' | 'PRODUCTS' | 'CATEGORIES' | 'ORDERS' | 'CUSTOMERS' | 'CONTENT' | 'MARKETING';

interface AdminSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Tổng Quan', icon: 'dashboard' },
    { id: 'PRODUCTS', label: 'Sản Phẩm', icon: 'inventory_2' },
    { id: 'CATEGORIES', label: 'Danh Mục', icon: 'category' },
    { id: 'MARKETING', label: 'Marketing', icon: 'campaign' },
    { id: 'ORDERS', label: 'Đơn Hàng', icon: 'shopping_bag' },
    { id: 'CUSTOMERS', label: 'Khách Hàng', icon: 'people' },
    { id: 'CONTENT', label: 'Giao Diện Web', icon: 'web' },
  ];

  return (
    <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col min-h-screen">
      <div className="p-6">
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-8">
          Ninten<span className="text-nintendo-red">Admin</span>
        </Link>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? 'bg-nintendo-red text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="material-icons-round text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-gray-800">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
          <span className="material-icons-round">storefront</span> Về trang bán hàng
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
