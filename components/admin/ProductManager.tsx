
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category } from '../../types';
import { StorageService } from '../../services/storage';
import { fileToBase64 } from '../../utils/helpers';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  refreshData: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, refreshData }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Custom Dropdown State
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Import Stock State
  const [importTarget, setImportTarget] = useState<Product | null>(null);
  const [importQty, setImportQty] = useState(10);
  const [importCost, setImportCost] = useState(0);
  const [importNote, setImportNote] = useState('');

  const inputClass = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-transparent transition-all shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsCatDropdownOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createNewProduct = () => {
    setEditingProduct({
        id: `PROD-${Date.now()}`,
        title: '',
        description: '',
        price: 0,
        costPrice: 0,
        category: categories.length > 0 ? categories[0].slug : 'OTHER',
        imageUrl: '',
        images: [],
        rating: 5,
        stock: 0,
        releaseDate: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingProduct) {
          const isNew = editingProduct.id.startsWith('PROD-') && !products.find(p => p.id === editingProduct.id);
          const prodToSave = { ...editingProduct, images: editingProduct.images?.length ? editingProduct.images : [editingProduct.imageUrl] };
          
          StorageService.saveProduct(prodToSave);

          // If it's a new product and has stock > 0, automatically create an import record
          if (isNew && prodToSave.stock > 0 && prodToSave.costPrice > 0) {
              StorageService.importProduct(
                  prodToSave.id, 
                  prodToSave.stock, 
                  prodToSave.costPrice, 
                  "Nhập hàng đầu kỳ khi tạo sản phẩm"
              );
              // Note: importProduct adds to stock, but saveProduct already set stock. 
              // To avoid double counting, we rely on the fact that StorageService.saveProduct overwrites.
              // However, StorageService.importProduct ALSO adds stock. 
              // Correction: StorageService.importProduct adds to EXISTING stock.
              // If we saved stock=10, then import adds 10, total 20. 
              // Better approach: Save product with stock 0, then import.
              
              // Refined Logic:
              // 1. Save product with 0 stock initially if we want the import to drive stock.
              // OR 2. Just create the import record manually in storage without increasing stock (need new service method).
              
              // Since we don't have a 'logImportOnly' method, let's do this:
              // Save product with correct stock.
              // Manually push import record to localstorage to avoid double counting stock in `importProduct` logic
              // OR simpler: Just save product with stock 0, then call importProduct.
              
              // Let's do the "Save with 0 then Import" method to be clean and use existing logic.
              // BUT `saveProduct` is synchronous. 
              
              const pWithZeroStock = { ...prodToSave, stock: 0 };
              StorageService.saveProduct(pWithZeroStock);
              StorageService.importProduct(prodToSave.id, prodToSave.stock, prodToSave.costPrice, "Nhập hàng đầu kỳ");
          } else {
              // Just save (edit mode or 0 stock)
               StorageService.saveProduct(prodToSave);
          }

          setIsEditing(false); setEditingProduct(null);
          refreshData();
      }
  };

  const handleDelete = () => {
      if (deleteId) {
          StorageService.deleteProduct(deleteId);
          setShowDeleteModal(false); setDeleteId(null);
          refreshData();
      }
  };

  const handleImportStock = (e: React.FormEvent) => {
      e.preventDefault();
      if (importTarget) {
          StorageService.importProduct(importTarget.id, importQty, importCost, importNote);
          refreshData();
          setImportTarget(null);
          alert(`Nhập hàng thành công!`);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
      if (e.target.files && editingProduct) {
          if (isMain && e.target.files[0]) {
              const base64 = await fileToBase64(e.target.files[0]);
              setEditingProduct({ ...editingProduct, imageUrl: base64 });
          } else if (!isMain) {
              const newImages: string[] = [];
              for (let i = 0; i < e.target.files.length; i++) {
                newImages.push(await fileToBase64(e.target.files[i]));
              }
              setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), ...newImages] });
          }
      }
  };

  // Helper to get selected category object
  const getSelectedCategory = () => {
      return categories.find(c => c.slug === editingProduct?.category);
  };

  if (isEditing && editingProduct) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-black text-gray-900">
                    {editingProduct.id.startsWith('PROD-') ? 'Thêm Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm'}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-lg transition-colors">Hủy bỏ</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                    <label className={labelClass}>Tên sản phẩm</label>
                    <input required type="text" className={inputClass} placeholder="VD: Nintendo Switch OLED..." value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                </div>
                
                {/* Price Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-2 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Giá vốn (Giá nhập)</label>
                        <div className="relative">
                            <input required type="number" min="0" className={inputClass} value={editingProduct.costPrice || 0} onChange={e => setEditingProduct({...editingProduct, costPrice: Number(e.target.value)})} />
                            <span className="absolute right-4 top-3 text-gray-500 font-bold text-sm">VND</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Dùng để tính lợi nhuận.</p>
                    </div>
                    <div>
                        <label className={labelClass}>Giá bán lẻ</label>
                        <div className="relative">
                            <input required type="number" min="0" className={inputClass} value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                            <span className="absolute right-4 top-3 text-gray-500 font-bold text-sm">VND</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className={labelClass}>Danh mục</label>
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            type="button"
                            onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                            className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red text-left flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                {getSelectedCategory()?.icon && <span className="material-icons-round text-nintendo-red">{getSelectedCategory()?.icon}</span>}
                                {getSelectedCategory()?.name || 'Chọn danh mục'}
                            </span>
                            <span className="material-icons-round text-gray-400">arrow_drop_down</span>
                        </button>
                        
                        {isCatDropdownOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setEditingProduct({...editingProduct, category: cat.slug});
                                            setIsCatDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-50 text-nintendo-red flex items-center justify-center">
                                            <span className="material-icons-round text-lg">{cat.icon}</span>
                                        </div>
                                        <span className={`font-bold ${editingProduct.category === cat.slug ? 'text-nintendo-red' : 'text-gray-700'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Tồn kho ban đầu</label>
                    <input required type="number" min="0" className={inputClass} value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                    {editingProduct.id.startsWith('PROD-') && editingProduct.stock > 0 && (
                        <p className="text-xs text-green-600 mt-1 font-bold">* Sẽ tự động tạo phiếu nhập kho đầu kỳ</p>
                    )}
                </div>

                <div className="col-span-2">
                    <label className={labelClass}>Mô tả chi tiết</label>
                    <textarea required rows={5} className={inputClass} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                </div>
                
                 <div className="col-span-2">
                    <label className={labelClass}>Video YouTube URL (Mã nhúng)</label>
                    <input type="text" className={inputClass} placeholder="https://www.youtube.com/embed/..." value={editingProduct.videoUrl || ''} onChange={e => setEditingProduct({...editingProduct, videoUrl: e.target.value})} />
                </div>

                {/* Image Section */}
                <div className="col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
                    <label className={labelClass}>Ảnh Đại Diện (Bắt buộc)</label>
                    <div className="flex items-center gap-6 mt-2">
                        <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                            {editingProduct.imageUrl ? (
                                <img src={editingProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <span className="text-gray-400 text-xs text-center px-2">Chưa có ảnh</span>
                            )}
                        </div>
                        <div className="flex-1">
                             <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-white hover:file:bg-black transition-all cursor-pointer"/>
                             <p className="text-xs text-gray-500 mt-2">Định dạng hỗ trợ: JPG, PNG, WebP. Tối đa 2MB.</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
                     <label className={labelClass}>Thư viện ảnh phụ (Tùy chọn)</label>
                     <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-white hover:file:bg-black transition-all cursor-pointer mb-4"/>
                     
                     <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                        {editingProduct.images?.map((img, idx) => (
                            <div key={idx} className="relative aspect-square group">
                                <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" alt="" />
                                <button type="button" onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors">
                                    <span className="material-icons-round text-xs block">close</span>
                                </button>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="col-span-2 pt-4 border-t border-gray-100 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                    <button type="submit" className="bg-nintendo-red text-white font-bold py-3 px-8 rounded-xl hover:bg-nintendo-dark shadow-lg shadow-red-500/30 transition-all transform active:scale-95">Lưu Thay Đổi</button>
                </div>
            </form>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-xl font-black text-gray-800">Sản Phẩm</h3>
                <p className="text-sm text-gray-500">Quản lý kho hàng và thông tin sản phẩm</p>
            </div>
            <button onClick={createNewProduct} className="bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-black shadow-lg transition-all flex items-center gap-2">
                <span className="material-icons-round">add</span> Thêm Sản Phẩm
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr><th className="px-6 py-4 font-bold text-gray-700">Thông tin</th><th className="px-6 py-4 font-bold text-gray-700">Giá & Vốn</th><th className="px-6 py-4 font-bold text-gray-700">Tồn kho</th><th className="px-6 py-4 font-bold text-gray-700">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-gray-100 bg-white p-1">
                                        <img src={p.imageUrl} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 line-clamp-1">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-nintendo-red font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                                <div className="text-gray-400 text-xs">Vốn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.costPrice || 0)}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {p.stock}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <button onClick={() => { setImportTarget(p); setImportCost(p.costPrice || p.price * 0.7); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Nhập hàng"><span className="material-icons-round text-lg">inventory</span></button>
                                    <button onClick={() => { setEditingProduct(p); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa"><span className="material-icons-round text-lg">edit</span></button>
                                    <button onClick={() => { setDeleteId(p.id); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><span className="material-icons-round text-lg">delete</span></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                        <span className="material-icons-round text-2xl">warning</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận xóa sản phẩm?</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">Hành động này không thể hoàn tác. Dữ liệu sản phẩm sẽ bị mất vĩnh viễn.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                        <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">Xóa vĩnh viễn</button>
                    </div>
                </div>
            </div>
        )}

        {/* Import Modal */}
        {importTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Nhập Kho</h3>
                      <button onClick={() => setImportTarget(null)} className="text-gray-400 hover:text-gray-600"><span className="material-icons-round">close</span></button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 flex items-center gap-4">
                      <img src={importTarget.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="" />
                      <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{importTarget.title}</p>
                          <p className="text-xs text-gray-500">Tồn hiện tại: {importTarget.stock}</p>
                      </div>
                  </div>
                  <form onSubmit={handleImportStock} className="space-y-4">
                      <div><label className={labelClass}>Số lượng nhập thêm</label><input type="number" min="1" className={inputClass} value={importQty} onChange={(e) => setImportQty(parseInt(e.target.value) || 0)} /></div>
                      <div>
                          <label className={labelClass}>Giá vốn (VND/SP)</label>
                          <input type="number" min="0" className={inputClass} value={importCost} onChange={(e) => setImportCost(Number(e.target.value) || 0)} />
                          <p className="text-[10px] text-gray-500 mt-1">Sẽ tự động cập nhật giá vốn mới cho sản phẩm</p>
                      </div>
                      <div><label className={labelClass}>Ghi chú nhập hàng</label><textarea className={inputClass} rows={2} value={importNote} onChange={(e) => setImportNote(e.target.value)} placeholder="VD: Nhập lô hàng tháng 10..." /></div>
                      <button type="submit" className="w-full mt-4 px-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">Xác nhận nhập kho</button>
                  </form>
              </div>
          </div>
        )}
    </div>
  );
};

export default ProductManager;
