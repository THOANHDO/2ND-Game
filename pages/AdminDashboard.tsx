
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Product, Order, User, HeroSlide, OrderStatus, SiteConfig, Category } from '../types';
import { fileToBase64 } from '../utils/helpers';

type Tab = 'DASHBOARD' | 'PRODUCTS' | 'CATEGORIES' | 'ORDERS' | 'CUSTOMERS' | 'CONTENT';

// Available Material Icons for Picker
const AVAILABLE_ICONS = [
    'videogame_asset', 'sports_esports', 'headset', 'memory', 'mouse', 'keyboard', 
    'laptop', 'desktop_windows', 'tv', 'router', 'wifi', 'sd_card', 'power', 
    'battery_full', 'bluetooth', 'usb', 'gamepad', 'casino', 'toys', 'local_shipping', 
    'verified', 'star', 'favorite', 'shopping_cart', 'home', 'person', 'category', 'list',
    'search', 'settings', 'info', 'check_circle', 'error', 'warning', 'add_circle'
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ facebookUrl: '' });

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // Category Editing State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'PRODUCT' | 'CATEGORY'; id: string; name: string } | null>(null);

  // Load Data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setOrders(StorageService.getOrders());
    setUsers(StorageService.getUsers());
    setSlides(StorageService.getHeroSlides());
    setSiteConfig(StorageService.getSiteConfig());
  };

  // --- Handlers ---

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
      StorageService.updateOrderStatus(orderId, status);
      refreshData();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingProduct) {
          const prodToSave = {
              ...editingProduct,
              images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.imageUrl]
          };
          StorageService.saveProduct(prodToSave);
          setIsEditingProduct(false);
          setEditingProduct(null);
          refreshData();
          alert("Lưu sản phẩm thành công!");
      }
  };

  const confirmDeleteProduct = (id: string, title: string) => {
      setItemToDelete({ type: 'PRODUCT', id, name: title });
      setShowDeleteModal(true);
  };

  const confirmDeleteCategory = (id: string, name: string) => {
      setItemToDelete({ type: 'CATEGORY', id, name: name });
      setShowDeleteModal(true);
  };

  const executeDelete = () => {
      if (itemToDelete) {
          if (itemToDelete.type === 'PRODUCT') {
              StorageService.deleteProduct(itemToDelete.id);
          } else if (itemToDelete.type === 'CATEGORY') {
              StorageService.deleteCategory(itemToDelete.id);
          }
          refreshData();
          setShowDeleteModal(false);
          setItemToDelete(null);
      }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCategory) {
          StorageService.saveCategory(editingCategory);
          setIsEditingCategory(false);
          setEditingCategory(null);
          refreshData();
          alert("Lưu danh mục thành công!");
      }
  };

  const handleUpdateSlide = (slide: HeroSlide) => {
      StorageService.updateHeroSlide(slide);
      refreshData();
      alert("Cập nhật Banner thành công!");
  };

  const handleSaveConfig = () => {
      StorageService.saveSiteConfig(siteConfig);
      alert("Đã lưu cấu hình hệ thống!");
  };

  const createNewProduct = () => {
      setEditingProduct({
          id: `PROD-${Date.now()}`,
          title: '',
          description: '',
          price: 0,
          category: categories.length > 0 ? categories[0].slug : 'OTHER',
          imageUrl: 'https://via.placeholder.com/400',
          images: [],
          rating: 5,
          stock: 10,
          releaseDate: new Date().toISOString().split('T')[0]
      });
      setIsEditingProduct(true);
  };

  const createNewCategory = () => {
      setEditingCategory({
          id: `CAT-${Date.now()}`,
          name: '',
          slug: '',
          description: '',
          icon: 'category'
      });
      setIsEditingCategory(true);
      setIconSearch('');
  };

  // --- File Upload Handlers ---
  
  const handleProductMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && editingProduct) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              setEditingProduct({ ...editingProduct, imageUrl: base64 });
          } catch (error) {
              console.error(error);
          }
      }
  };

  const handleProductGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && editingProduct) {
          const newImages: string[] = [];
          for (let i = 0; i < e.target.files.length; i++) {
              try {
                const base64 = await fileToBase64(e.target.files[i]);
                newImages.push(base64);
              } catch (err) { console.error(err); }
          }
          setEditingProduct({ 
              ...editingProduct, 
              images: [...(editingProduct.images || []), ...newImages] 
          });
      }
  };

  const removeGalleryImage = (indexToRemove: number) => {
      if (editingProduct && editingProduct.images) {
          const newImages = editingProduct.images.filter((_, idx) => idx !== indexToRemove);
          setEditingProduct({ ...editingProduct, images: newImages });
      }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              const newSlides = [...slides];
              const idx = newSlides.findIndex(s => s.id === slideId);
              if (idx >= 0) {
                  newSlides[idx].image = base64;
                  setSlides(newSlides);
              }
          } catch (error) {
              console.error(error);
          }
      }
  };

  const handleAuthImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'login' | 'register') => {
      if (e.target.files && e.target.files[0] && siteConfig.authConfig) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              setSiteConfig({
                  ...siteConfig,
                  authConfig: {
                      ...siteConfig.authConfig,
                      [type]: {
                          ...siteConfig.authConfig[type],
                          image: base64
                      }
                  }
              });
          } catch (error) {
              console.error(error);
          }
      }
  };

  // --- Footer Handlers ---
  const handleFooterLinkChange = (sectionIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
      if (!siteConfig.footerConfig) return;
      
      const newSections = [...siteConfig.footerConfig.sections];
      newSections[sectionIndex].links[linkIndex] = {
          ...newSections[sectionIndex].links[linkIndex],
          [field]: value
      };

      setSiteConfig({
          ...siteConfig,
          footerConfig: {
              ...siteConfig.footerConfig,
              sections: newSections
          }
      });
  };

  const addFooterLink = (sectionIndex: number) => {
      if (!siteConfig.footerConfig) return;
      const newSections = [...siteConfig.footerConfig.sections];
      newSections[sectionIndex].links.push({ label: 'Link Mới', url: '#' });
      setSiteConfig({
          ...siteConfig,
          footerConfig: {
              ...siteConfig.footerConfig,
              sections: newSections
          }
      });
  };

  const removeFooterLink = (sectionIndex: number, linkIndex: number) => {
      if (!siteConfig.footerConfig) return;
      const newSections = [...siteConfig.footerConfig.sections];
      newSections[sectionIndex].links = newSections[sectionIndex].links.filter((_, idx) => idx !== linkIndex);
      setSiteConfig({
          ...siteConfig,
          footerConfig: {
              ...siteConfig.footerConfig,
              sections: newSections
          }
      });
  };

  // --- Renderers ---

  const renderDashboard = () => (
      <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orders.reduce((acc, o) => acc + o.totalAmount, 0))}
              </p>
              <span className="text-green-500 text-xs font-bold mt-2 inline-flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span>
                  Tăng trưởng tốt
              </span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đơn Hàng</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">{orders.length}</p>
              <div className="flex gap-2 mt-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                      {orders.filter(o => o.orderStatus === OrderStatus.PROCESSING).length} Chờ xử lý
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded">
                      {orders.filter(o => o.orderStatus === OrderStatus.DELIVERED).length} Hoàn thành
                  </span>
              </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Khách Hàng</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">{users.length}</p>
              <span className="text-gray-400 text-xs font-bold mt-2 inline-block">Thành viên đã đăng ký</span>
          </div>
      </div>
  );

  const renderCategories = () => {
      if (isEditingCategory && editingCategory) {
          const filteredIcons = AVAILABLE_ICONS.filter(icon => icon.includes(iconSearch.toLowerCase()));

          return (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                          {categories.find(c => c.id === editingCategory.id) ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                      </h3>
                      <button onClick={() => setIsEditingCategory(false)} className="text-gray-500 hover:text-gray-800 text-sm font-bold">Hủy bỏ</button>
                  </div>
                  <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Tên danh mục</label>
                          <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Mã (Slug - để lọc)</label>
                          <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" placeholder="VD: CONSOLE, GAME" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value.toUpperCase().replace(/\s/g, '_')})} />
                      </div>
                      <div className="col-span-2">
                           <label className="block text-sm font-bold text-gray-700 mb-1">Icon Danh Mục</label>
                           
                           <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-nintendo-red shadow-sm">
                                        <span className="material-icons-round text-3xl">{editingCategory.icon || 'category'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Tìm kiếm icon..." 
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                                            value={iconSearch}
                                            onChange={(e) => setIconSearch(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">Chọn một icon từ danh sách bên dưới.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 h-40 overflow-y-auto pr-2">
                                    {filteredIcons.map(icon => (
                                        <button 
                                            type="button"
                                            key={icon}
                                            onClick={() => setEditingCategory({...editingCategory, icon: icon})}
                                            className={`p-2 rounded hover:bg-white hover:shadow-sm flex items-center justify-center transition-all ${editingCategory.icon === icon ? 'bg-white shadow ring-2 ring-nintendo-red text-nintendo-red' : 'text-gray-500'}`}
                                            title={icon}
                                        >
                                            <span className="material-icons-round text-2xl">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                           </div>
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả ngắn</label>
                          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingCategory.description || ''} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                          <button type="submit" className="bg-nintendo-red text-white font-bold py-3 px-6 rounded-xl hover:bg-nintendo-dark transition-colors">Lưu Danh Mục</button>
                      </div>
                  </form>
              </div>
          );
      }

      return (
          <div className="space-y-4 animate-fade-in-up">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Danh Sách Danh Mục</h3>
                  <button onClick={createNewCategory} className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                      + Thêm Danh Mục
                  </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                  <th className="px-6 py-4 font-bold text-gray-700">Icon</th>
                                  <th className="px-6 py-4 font-bold text-gray-700">Tên Danh Mục</th>
                                  <th className="px-6 py-4 font-bold text-gray-700">Mã (Slug)</th>
                                  <th className="px-6 py-4 font-bold text-gray-700">Mô tả</th>
                                  <th className="px-6 py-4 font-bold text-gray-700">Hành động</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {categories.map(c => (
                                  <tr key={c.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-600">
                                          <span className="material-icons-round text-2xl">{c.icon || 'category'}</span>
                                      </td>
                                      <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                                      <td className="px-6 py-4 text-xs font-mono text-gray-500 bg-gray-100 rounded w-fit px-2">{c.slug}</td>
                                      <td className="px-6 py-4 text-gray-600">{c.description}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex gap-2">
                                              <button onClick={() => { setEditingCategory(c); setIsEditingCategory(true); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Sửa</button>
                                              <button onClick={() => confirmDeleteCategory(c.id, c.name)} className="text-red-600 hover:text-red-800 font-bold text-xs">Xóa</button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  };

  const renderProducts = () => {
    if (isEditingProduct && editingProduct) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {products.find(p => p.id === editingProduct.id) ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                    </h3>
                    <button onClick={() => setIsEditingProduct(false)} className="text-gray-500 hover:text-gray-800 text-sm font-bold">Hủy bỏ</button>
                </div>
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Giá (VND)</label>
                        <input required type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" 
                            value={editingProduct.category} 
                            onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload Section */}
                    <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh Đại Diện (Chính)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleProductMainImageUpload}
                                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-nintendo-red file:text-white
                                      hover:file:bg-nintendo-dark
                                    "
                                />
                                <p className="text-xs text-gray-500 mt-1">Chọn ảnh từ máy tính để thay thế.</p>
                            </div>
                        </div>
                    </div>

                     <div className="col-span-2 border-b border-gray-100 pb-4 mb-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Thư viện ảnh chi tiết (Gallery)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {editingProduct.images?.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 group">
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                    <button 
                                        type="button"
                                        onClick={() => removeGalleryImage(idx)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={handleProductGalleryUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-100 file:text-gray-700
                                hover:file:bg-gray-200
                            "
                        />
                    </div>

                     <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Link Video Youtube (Embed URL)</label>
                        <input type="text" placeholder="https://www.youtube.com/embed/..." className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.videoUrl || ''} onChange={e => setEditingProduct({...editingProduct, videoUrl: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tồn kho</label>
                        <input required type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ngày phát hành</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.releaseDate} onChange={e => setEditingProduct({...editingProduct, releaseDate: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <button type="submit" className="bg-nintendo-red text-white font-bold py-3 px-6 rounded-xl hover:bg-nintendo-dark transition-colors">Lưu Sản Phẩm</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Danh Sách Sản Phẩm</h3>
                <button onClick={createNewProduct} className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                    + Thêm Sản Phẩm
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Sản phẩm</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Giá</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Kho</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Danh mục</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p => {
                                // Find category name
                                const cat = categories.find(c => c.slug === p.category);
                                return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-gray-200" />
                                            <span className="font-medium text-gray-900 truncate max-w-xs">{p.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            {cat?.icon && <span className="material-icons-round text-sm">{cat.icon}</span>}
                                            {cat ? cat.name : p.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingProduct(p); setIsEditingProduct(true); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Sửa</button>
                                            <button onClick={() => confirmDeleteProduct(p.id, p.title)} className="text-red-600 hover:text-red-800 font-bold text-xs">Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderOrders = () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
           <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-700">Mã Đơn</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Khách Hàng</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Tổng Tiền</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Ngày Tạo</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Trạng Thái</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{order.customerName}</div>
                                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-nintendo-red">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                        order.orderStatus === OrderStatus.DELIVERED ? 'bg-green-50 text-green-600 border-green-200' :
                                        order.orderStatus === OrderStatus.SHIPPED ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                        'bg-yellow-50 text-yellow-600 border-yellow-200'
                                    }`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:outline-none focus:border-nintendo-red"
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    >
                                        <option value={OrderStatus.PROCESSING}>Processing</option>
                                        <option value={OrderStatus.SHIPPED}>Shipped</option>
                                        <option value={OrderStatus.DELIVERED}>Delivered</option>
                                        <option value={OrderStatus.CANCELLED}>Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
  );

  const renderCustomers = () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
           <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-700">Khách Hàng</th>
                        <th className="px-6 py-4 font-bold text-gray-700">Liên hệ</th>
                        <th className="px-6 py-4 font-bold text-gray-700">Khu vực</th>
                        <th className="px-6 py-4 font-bold text-gray-700">Ngày tham gia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{user.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {user.email && <div className="text-gray-600">{user.email}</div>}
                                {user.phoneNumber && <div className="text-gray-600">{user.phoneNumber}</div>}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{user.city || 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
           </table>
      </div>
  );

  const renderContent = () => {
    if (!siteConfig.authConfig) return null;

    return (
      <div className="space-y-8 animate-fade-in-up">
          {/* Site Config Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <span className="material-icons-round text-blue-600">settings</span>
                   Cấu hình Liên hệ & Mạng xã hội
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Facebook Messenger Link (URL)</label>
                       <input 
                           type="text" 
                           className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                           placeholder="https://m.me/..."
                           value={siteConfig.facebookUrl} 
                           onChange={(e) => setSiteConfig({...siteConfig, facebookUrl: e.target.value})} 
                        />
                       <p className="text-xs text-gray-400 mt-1">Dán link m.me của Fanpage để khách hàng chat trực tiếp.</p>
                   </div>
                   <div className="flex items-end">
                       <button onClick={handleSaveConfig} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                           Lưu Cấu Hình
                       </button>
                   </div>
               </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Footer Configuration */}
          {siteConfig.footerConfig && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-gray-600">view_column</span>
                       Cấu hình Footer (Chân trang)
                   </h3>
                   
                   <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả chung (Cột 1)</label>
                            <textarea 
                                rows={2}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.footerConfig.description}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    footerConfig: { ...siteConfig.footerConfig!, description: e.target.value }
                                })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {siteConfig.footerConfig.sections.map((section, sIdx) => (
                                <div key={sIdx} className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề Cột {sIdx + 1}</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 font-bold focus:outline-none focus:border-nintendo-red"
                                            value={section.title}
                                            onChange={(e) => {
                                                const newSections = [...siteConfig.footerConfig!.sections];
                                                newSections[sIdx].title = e.target.value;
                                                setSiteConfig({ ...siteConfig, footerConfig: { ...siteConfig.footerConfig!, sections: newSections } });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500">Các liên kết</label>
                                        {section.links.map((link, lIdx) => (
                                            <div key={lIdx} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red"
                                                    placeholder="Tên link"
                                                    value={link.label}
                                                    onChange={(e) => handleFooterLinkChange(sIdx, lIdx, 'label', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red"
                                                    placeholder="URL (#)"
                                                    value={link.url}
                                                    onChange={(e) => handleFooterLinkChange(sIdx, lIdx, 'url', e.target.value)}
                                                />
                                                <button onClick={() => removeFooterLink(sIdx, lIdx)} className="text-red-500 hover:text-red-700">
                                                    <span className="material-icons-round text-base">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addFooterLink(sIdx)} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-2">
                                            <span className="material-icons-round text-sm">add</span> Thêm liên kết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Bản quyền (Copyright)</label>
                            <input 
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.footerConfig.copyright}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    footerConfig: { ...siteConfig.footerConfig!, copyright: e.target.value }
                                })}
                            />
                        </div>

                        <div className="text-right">
                             <button onClick={handleSaveConfig} className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded hover:bg-black transition-colors">
                                Lưu Cấu Hình Footer
                            </button>
                        </div>
                   </div>
              </div>
          )}

          <div className="border-t border-gray-200 my-4"></div>

          {/* Auth Pages Config Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-gray-600">lock_person</span>
                   Cấu hình Trang Xác Thực (Đăng nhập / Đăng ký)
               </h3>
               <div className="grid md:grid-cols-2 gap-8">
                   {/* Login Page Config */}
                   <div className="space-y-4 border p-4 rounded-xl border-gray-100">
                       <h4 className="font-bold text-nintendo-red text-sm uppercase">Trang Đăng Nhập</h4>
                       
                       <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                           <img src={siteConfig.authConfig.login.image} alt="Login Banner" className="w-full h-full object-cover opacity-80" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-gray-100">
                                    Đổi ảnh
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAuthImageUpload(e, 'login')} />
                                </label>
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề (Title)</label>
                           <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.authConfig.login.title}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    authConfig: { ...siteConfig.authConfig!, login: { ...siteConfig.authConfig!.login, title: e.target.value } }
                                })}
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả (Subtitle)</label>
                           <textarea rows={2} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.authConfig.login.subtitle}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    authConfig: { ...siteConfig.authConfig!, login: { ...siteConfig.authConfig!.login, subtitle: e.target.value } }
                                })}
                           />
                       </div>
                   </div>

                   {/* Register Page Config */}
                   <div className="space-y-4 border p-4 rounded-xl border-gray-100">
                       <h4 className="font-bold text-nintendo-red text-sm uppercase">Trang Đăng Ký</h4>
                       
                       <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                           <img src={siteConfig.authConfig.register.image} alt="Register Banner" className="w-full h-full object-cover opacity-80" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-gray-100">
                                    Đổi ảnh
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAuthImageUpload(e, 'register')} />
                                </label>
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề (Title)</label>
                           <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.authConfig.register.title}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    authConfig: { ...siteConfig.authConfig!, register: { ...siteConfig.authConfig!.register, title: e.target.value } }
                                })}
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả (Subtitle)</label>
                           <textarea rows={2} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                value={siteConfig.authConfig.register.subtitle}
                                onChange={(e) => setSiteConfig({
                                    ...siteConfig,
                                    authConfig: { ...siteConfig.authConfig!, register: { ...siteConfig.authConfig!.register, subtitle: e.target.value } }
                                })}
                           />
                       </div>
                   </div>

                   {/* Forgot Password Config */}
                   <div className="space-y-4 border p-4 rounded-xl border-gray-100 md:col-span-2">
                       <h4 className="font-bold text-nintendo-red text-sm uppercase">Trang Quên Mật Khẩu</h4>
                       <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề (Title)</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                        value={siteConfig.authConfig.forgotPassword.title}
                                        onChange={(e) => setSiteConfig({
                                            ...siteConfig,
                                            authConfig: { ...siteConfig.authConfig!, forgotPassword: { ...siteConfig.authConfig!.forgotPassword, title: e.target.value } }
                                        })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả (Subtitle)</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" 
                                        value={siteConfig.authConfig.forgotPassword.subtitle}
                                        onChange={(e) => setSiteConfig({
                                            ...siteConfig,
                                            authConfig: { ...siteConfig.authConfig!, forgotPassword: { ...siteConfig.authConfig!.forgotPassword, subtitle: e.target.value } }
                                        })}
                                />
                            </div>
                       </div>
                   </div>

                   <div className="md:col-span-2">
                       <button onClick={handleSaveConfig} className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded hover:bg-black transition-colors">
                           Lưu Cấu Hình
                       </button>
                   </div>
               </div>
          </div>


          <div className="border-t border-gray-200 my-4"></div>

          {/* Banner Slides Section */}
          <div>
            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100 mb-6">
                Tại đây bạn có thể chỉnh sửa các Banner quảng cáo xuất hiện trên trang chủ.
            </div>
            <div className="grid gap-6">
                {slides.map(slide => (
                    <div key={slide.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 bg-gray-900 rounded-lg p-4 flex items-center justify-center relative group">
                            <img src={slide.image} alt="" className="h-32 object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                                    <label className="cursor-pointer bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-gray-100">
                                        Thay ảnh
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSlideImageUpload(e, slide.id)} />
                                    </label>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 space-y-4">
                            <h4 className="font-bold text-gray-500 uppercase text-xs">Slide #{slide.id}</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề lớn</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" value={slide.title} onChange={(e) => {
                                        const newSlides = [...slides];
                                        const idx = newSlides.findIndex(s => s.id === slide.id);
                                        newSlides[idx].title = e.target.value;
                                        setSlides(newSlides);
                                    }} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả ngắn</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-nintendo-red" value={slide.subtitle} onChange={(e) => {
                                        const newSlides = [...slides];
                                        const idx = newSlides.findIndex(s => s.id === slide.id);
                                        newSlides[idx].subtitle = e.target.value;
                                        setSlides(newSlides);
                                    }} />
                                </div>
                            </div>
                            <button onClick={() => handleUpdateSlide(slide)} className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded hover:bg-black">
                                Lưu Thay Đổi
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0">
          <div className="p-6">
              <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-8">
                  Ninten<span className="text-nintendo-red">Admin</span>
              </Link>
              <nav className="space-y-2">
                  {[
                      { id: 'DASHBOARD', label: 'Tổng Quan', icon: 'dashboard' },
                      { id: 'PRODUCTS', label: 'Sản Phẩm', icon: 'inventory_2' },
                      { id: 'CATEGORIES', label: 'Danh Mục', icon: 'category' },
                      { id: 'ORDERS', label: 'Đơn Hàng', icon: 'shopping_bag' },
                      { id: 'CUSTOMERS', label: 'Khách Hàng', icon: 'people' },
                      { id: 'CONTENT', label: 'Giao Diện Web', icon: 'web' },
                  ].map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-nintendo-red text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                          <span className="material-icons-round text-xl">{item.icon}</span>
                          {item.label}
                      </button>
                  ))}
              </nav>
          </div>
          <div className="mt-auto p-6 border-t border-gray-800">
             <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                 <span className="material-icons-round">storefront</span>
                 Về trang bán hàng
             </Link>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto max-h-screen">
          <div className="p-8">
              <header className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                        {activeTab === 'DASHBOARD' && 'Tổng Quan Hệ Thống'}
                        {activeTab === 'PRODUCTS' && 'Quản Lý Sản Phẩm'}
                        {activeTab === 'CATEGORIES' && 'Quản Lý Danh Mục'}
                        {activeTab === 'ORDERS' && 'Quản Lý Đơn Hàng'}
                        {activeTab === 'CUSTOMERS' && 'Danh Sách Khách Hàng'}
                        {activeTab === 'CONTENT' && 'Cấu Hình Trang Chủ'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Xin chào Admin, chúc bạn một ngày làm việc hiệu quả.</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                          <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" alt="" />
                      </div>
                  </div>
              </header>

              {activeTab === 'DASHBOARD' && renderDashboard()}
              {activeTab === 'PRODUCTS' && renderProducts()}
              {activeTab === 'CATEGORIES' && renderCategories()}
              {activeTab === 'ORDERS' && renderOrders()}
              {activeTab === 'CUSTOMERS' && renderCustomers()}
              {activeTab === 'CONTENT' && renderContent()}
          </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <span className="material-icons-round text-3xl">warning</span>
                    <h3 className="text-xl font-bold">Xác nhận xóa</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Bạn có chắc chắn muốn xóa {itemToDelete?.type === 'CATEGORY' ? 'danh mục' : 'sản phẩm'}: <br/>
                    <strong className="text-gray-900 text-lg">{itemToDelete?.name}</strong>?
                    
                    {itemToDelete?.type === 'CATEGORY' && (
                        <span className="block mt-2 text-sm bg-red-50 text-red-700 p-2 rounded">
                            Lưu ý: Xóa danh mục có thể ảnh hưởng đến các sản phẩm đang thuộc danh mục này.
                        </span>
                    )}
                </p>

                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                        className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={executeDelete}
                        className="px-5 py-2 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Đồng ý xóa
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
