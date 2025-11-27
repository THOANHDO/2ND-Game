
import React, { useState } from 'react';
import { Campaign, Product, CampaignType } from '../../types';
import { StorageService } from '../../services/storage';

interface MarketingManagerProps {
  products: Product[];
}

const MarketingManager: React.FC<MarketingManagerProps> = ({ products }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(StorageService.getCampaigns());
  const [isEditing, setIsEditing] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  // Search state for product selection
  const [productSearch, setProductSearch] = useState('');

  const inputClass = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-transparent transition-all shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  const refreshData = () => {
      setCampaigns(StorageService.getCampaigns());
  };

  const createNewCampaign = () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setEditingCampaign({
          id: `CAM-${Date.now()}`,
          name: '',
          type: 'DISCOUNT_PERCENT',
          value: 0,
          targetProductIds: [],
          startDate: today,
          endDate: nextWeek,
          isActive: true,
          voucherConfig: { // Default init
              codePrefix: 'GIFT',
              discountValue: 10,
              maxDiscountAmount: 50000,
              validDays: 30
          }
      });
      setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCampaign) {
          StorageService.saveCampaign(editingCampaign);
          setIsEditing(false);
          setEditingCampaign(null);
          refreshData();
      }
  };

  const handleDelete = (id: string) => {
      if (confirm("Bạn có chắc muốn xóa chiến dịch này không?")) {
          StorageService.deleteCampaign(id);
          refreshData();
      }
  };

  const toggleProductSelection = (productId: string) => {
      if (!editingCampaign) return;
      const currentIds = editingCampaign.targetProductIds;
      if (currentIds.includes(productId)) {
          setEditingCampaign({ ...editingCampaign, targetProductIds: currentIds.filter(id => id !== productId) });
      } else {
          setEditingCampaign({ ...editingCampaign, targetProductIds: [...currentIds, productId] });
      }
  };

  const toggleSelectAll = () => {
       if (!editingCampaign) return;
       if (editingCampaign.targetProductIds.length === products.length) {
           setEditingCampaign({ ...editingCampaign, targetProductIds: [] });
       } else {
           setEditingCampaign({ ...editingCampaign, targetProductIds: products.map(p => p.id) });
       }
  };

  if (isEditing && editingCampaign) {
      return (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-2xl font-black text-gray-900">
                       {editingCampaign.id.startsWith('CAM-') ? 'Tạo Chiến Dịch Mới' : 'Chỉnh Sửa Chiến Dịch'}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-lg transition-colors">Hủy bỏ</button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Tên chiến dịch</label>
                          <input required type="text" className={inputClass} value={editingCampaign.name} onChange={e => setEditingCampaign({...editingCampaign, name: e.target.value})} placeholder="VD: Sale Hè 2024" />
                      </div>
                      <div>
                          <label className={labelClass}>Trạng thái</label>
                          <select className={inputClass} value={editingCampaign.isActive ? 'active' : 'inactive'} onChange={e => setEditingCampaign({...editingCampaign, isActive: e.target.value === 'active'})}>
                              <option value="active">Đang kích hoạt</option>
                              <option value="inactive">Tạm dừng</option>
                          </select>
                      </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Ngày bắt đầu</label>
                          <input required type="date" className={inputClass} value={editingCampaign.startDate.split('T')[0]} onChange={e => setEditingCampaign({...editingCampaign, startDate: e.target.value})} />
                      </div>
                      <div>
                          <label className={labelClass}>Ngày kết thúc</label>
                          <input required type="date" className={inputClass} value={editingCampaign.endDate.split('T')[0]} onChange={e => setEditingCampaign({...editingCampaign, endDate: e.target.value})} />
                      </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Cấu Hình Khuyến Mãi</h4>
                      <div className="grid md:grid-cols-1 gap-6">
                          <div>
                              <label className={labelClass}>Loại khuyến mãi</label>
                              <select className={inputClass} value={editingCampaign.type} onChange={e => setEditingCampaign({...editingCampaign, type: e.target.value as CampaignType})}>
                                  <option value="DISCOUNT_PERCENT">Giảm giá trực tiếp (%)</option>
                                  <option value="GIFT_VOUCHER">Tặng Voucher khi mua</option>
                              </select>
                          </div>
                          
                          {editingCampaign.type === 'DISCOUNT_PERCENT' ? (
                               <div>
                                  <label className={labelClass}>Giá trị giảm (%)</label>
                                  <div className="relative">
                                      <input required type="number" min="1" max="100" className={inputClass} value={editingCampaign.value} onChange={e => setEditingCampaign({...editingCampaign, value: Number(e.target.value)})} />
                                      <span className="absolute right-4 top-3 text-gray-500 font-bold">%</span>
                                  </div>
                               </div>
                          ) : (
                               <div className="grid md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-200">
                                   <div className="col-span-2 text-xs text-blue-600 font-bold uppercase mb-2">Cấu hình Voucher được tặng</div>
                                   
                                   <div>
                                       <label className={labelClass}>Tiền tố Mã Voucher</label>
                                       <input required type="text" className={inputClass} value={editingCampaign.voucherConfig?.codePrefix || ''} onChange={e => setEditingCampaign({...editingCampaign, voucherConfig: { ...editingCampaign.voucherConfig!, codePrefix: e.target.value.toUpperCase() }})} placeholder="VD: TET2024" />
                                       <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ thêm đuôi ngẫu nhiên. VD: TET2024-X9Z1</p>
                                   </div>

                                   <div>
                                       <label className={labelClass}>Giá trị giảm (%)</label>
                                       <div className="relative">
                                            <input required type="number" min="1" max="100" className={inputClass} value={editingCampaign.voucherConfig?.discountValue || 0} onChange={e => setEditingCampaign({...editingCampaign, voucherConfig: { ...editingCampaign.voucherConfig!, discountValue: Number(e.target.value) }})} />
                                            <span className="absolute right-4 top-3 text-gray-500 font-bold">%</span>
                                       </div>
                                   </div>

                                   <div>
                                       <label className={labelClass}>Giảm tối đa (VND)</label>
                                       <input required type="number" min="0" className={inputClass} value={editingCampaign.voucherConfig?.maxDiscountAmount || 0} onChange={e => setEditingCampaign({...editingCampaign, voucherConfig: { ...editingCampaign.voucherConfig!, maxDiscountAmount: Number(e.target.value) }})} />
                                   </div>

                                   <div>
                                       <label className={labelClass}>Hạn sử dụng (Ngày)</label>
                                       <div className="relative">
                                            <input required type="number" min="1" className={inputClass} value={editingCampaign.voucherConfig?.validDays || 30} onChange={e => setEditingCampaign({...editingCampaign, voucherConfig: { ...editingCampaign.voucherConfig!, validDays: Number(e.target.value) }})} />
                                            <span className="absolute right-4 top-3 text-gray-500 font-bold">Ngày</span>
                                       </div>
                                       <p className="text-xs text-gray-500 mt-1">Tính từ ngày khách nhận được voucher</p>
                                   </div>
                               </div>
                          )}
                      </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h4 className="font-bold text-gray-800">Sản Phẩm Áp Dụng</h4>
                          <button type="button" onClick={toggleSelectAll} className="text-sm font-bold text-nintendo-red hover:underline">
                              {editingCampaign.targetProductIds.length === products.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          </button>
                      </div>
                      
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm..." 
                        className={`${inputClass} mb-4`}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                              <div key={product.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${editingCampaign.targetProductIds.includes(product.id) ? 'bg-white border-nintendo-red shadow-sm' : 'bg-gray-100 border-transparent opacity-70 hover:opacity-100'}`} onClick={() => toggleProductSelection(product.id)}>
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${editingCampaign.targetProductIds.includes(product.id) ? 'bg-nintendo-red border-nintendo-red text-white' : 'bg-white border-gray-400'}`}>
                                      {editingCampaign.targetProductIds.includes(product.id) && <span className="material-icons-round text-xs">check</span>}
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</p>
                                      <p className="text-xs text-gray-500">{product.id}</p>
                                  </div>
                                  <img src={product.imageUrl} className="w-10 h-10 object-cover rounded" alt="" />
                              </div>
                          ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">Đã chọn: {editingCampaign.targetProductIds.length} sản phẩm</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                      <button type="submit" className="bg-nintendo-red text-white font-bold py-3 px-8 rounded-xl hover:bg-nintendo-dark shadow-lg transition-colors">Lưu Chiến Dịch</button>
                  </div>
              </form>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xl font-black text-gray-800">Chiến Dịch Marketing</h3>
                <p className="text-sm text-gray-500">Quản lý giảm giá và chương trình tặng quà</p>
            </div>
            <button onClick={createNewCampaign} className="bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-black shadow-lg transition-all flex items-center gap-2">
                <span className="material-icons-round">campaign</span> Tạo Chiến Dịch
            </button>
        </div>

        <div className="grid gap-4">
            {campaigns.map(cam => (
                <div key={cam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-lg text-gray-900">{cam.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${cam.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {cam.isActive ? 'Đang chạy' : 'Tạm dừng'}
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                                {cam.type === 'DISCOUNT_PERCENT' ? `Giảm ${cam.value}%` : `Tặng Voucher`}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                            Thời gian: {new Date(cam.startDate).toLocaleDateString('vi-VN')} - {new Date(cam.endDate).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-400">
                            Áp dụng cho {cam.targetProductIds.length} sản phẩm
                        </p>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                         <button onClick={() => { setEditingCampaign(cam); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                             <span className="material-icons-round">edit</span>
                         </button>
                         <button onClick={() => handleDelete(cam.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                             <span className="material-icons-round">delete</span>
                         </button>
                    </div>
                </div>
            ))}
            
            {campaigns.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                    <span className="material-icons-round text-4xl text-gray-300 mb-2">campaign</span>
                    <p className="text-gray-500">Chưa có chiến dịch nào.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MarketingManager;
