import React, { useState } from 'react';
import { Category } from '../../types';
import { StorageService } from '../../services/storage';

const AVAILABLE_ICONS = [
    'videogame_asset', 'sports_esports', 'headset', 'memory', 'mouse', 'keyboard', 
    'laptop', 'desktop_windows', 'tv', 'router', 'wifi', 'sd_card', 'power', 
    'battery_full', 'bluetooth', 'usb', 'gamepad', 'casino', 'toys', 'local_shipping', 
    'verified', 'star', 'favorite', 'shopping_cart', 'home', 'person', 'category', 'list',
    'search', 'settings', 'info', 'check_circle', 'error', 'warning', 'add_circle'
];

interface CategoryManagerProps {
  categories: Category[];
  refreshData: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, refreshData }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const inputClass = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-transparent transition-all shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  const createNewCategory = () => {
      setEditingCategory({
          id: `CAT-${Date.now()}`,
          name: '',
          slug: '',
          description: '',
          icon: 'category'
      });
      setIsEditing(true);
      setIconSearch('');
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCategory) {
          StorageService.saveCategory(editingCategory);
          setIsEditing(false); setEditingCategory(null);
          refreshData();
      }
  };

  const handleDelete = () => {
      if (deleteId) {
          StorageService.deleteCategory(deleteId);
          setShowDeleteModal(false); setDeleteId(null);
          refreshData();
      }
  };

  if (isEditing && editingCategory) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-black text-gray-900">
                     {editingCategory.id.startsWith('CAT-') ? 'Thêm Danh Mục' : 'Chỉnh Sửa Danh Mục'}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-lg transition-colors">Hủy bỏ</button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Tên danh mục</label>
                        <input required type="text" className={inputClass} value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} placeholder="VD: Máy chơi game" />
                    </div>
                    <div>
                        <label className={labelClass}>Mã (Slug - Không dấu)</label>
                        <input required type="text" className={inputClass} value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value.toUpperCase()})} placeholder="VD: MAY_GAME" />
                    </div>
                </div>
                
                <div>
                    <label className={labelClass}>Mô tả ngắn</label>
                    <textarea className={inputClass} rows={3} value={editingCategory.description || ''} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} placeholder="Mô tả về danh mục này..." />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <label className={labelClass}>Chọn biểu tượng</label>
                    <div className="relative mb-4">
                         <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons-round text-gray-400">search</span>
                         </span>
                        <input type="text" placeholder="Tìm kiếm icon..." className={`${inputClass} pl-10`} value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {AVAILABLE_ICONS.filter(i => i.includes(iconSearch.toLowerCase())).map(icon => (
                            <button 
                                type="button" 
                                key={icon} 
                                onClick={() => setEditingCategory({...editingCategory, icon})} 
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${editingCategory.icon === icon ? 'bg-nintendo-red text-white shadow-lg scale-110' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                            >
                                <span className="material-icons-round text-2xl">{icon}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <span>Đã chọn:</span>
                        <span className="flex items-center gap-1 font-bold bg-white px-3 py-1 rounded-full border border-gray-200">
                            <span className="material-icons-round text-nintendo-red">{editingCategory.icon}</span> 
                            {editingCategory.icon}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                     <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                     <button type="submit" className="bg-nintendo-red text-white font-bold py-3 px-8 rounded-xl hover:bg-nintendo-dark shadow-lg transition-colors">Lưu Danh Mục</button>
                </div>
            </form>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xl font-black text-gray-800">Danh Mục</h3>
                <p className="text-sm text-gray-500">Phân loại sản phẩm để khách hàng dễ tìm kiếm</p>
            </div>
            <button onClick={createNewCategory} className="bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-black shadow-lg transition-all flex items-center gap-2">
                <span className="material-icons-round">add_circle</span> Thêm Danh Mục
            </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr><th className="px-6 py-4 font-bold text-gray-700">Tên</th><th className="px-6 py-4 font-bold text-gray-700">Mã (Slug)</th><th className="px-6 py-4 font-bold text-gray-700">Icon</th><th className="px-6 py-4 font-bold text-gray-700">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {categories.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono border border-gray-200">{c.slug}</span></td>
                            <td className="px-6 py-4"><span className="material-icons-round text-nintendo-red text-2xl">{c.icon}</span></td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingCategory(c); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><span className="material-icons-round">edit</span></button>
                                    <button onClick={() => { setDeleteId(c.id); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><span className="material-icons-round">delete</span></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                 <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                        <span className="material-icons-round text-2xl">delete_forever</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xóa danh mục?</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">Lưu ý: Các sản phẩm thuộc danh mục này sẽ cần được cập nhật lại.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                        <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">Xóa</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CategoryManager;