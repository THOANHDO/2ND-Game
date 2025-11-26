
import React, { useState, useEffect } from 'react';
import { HeroSlide, SiteConfig, FooterSection, HomeSection, Category } from '../../types';
import { StorageService } from '../../services/storage';
import { fileToBase64 } from '../../utils/helpers';

interface ContentManagerProps {
  slides: HeroSlide[];
  siteConfig: SiteConfig;
  refreshData: () => void;
}

type SubTab = 'HERO' | 'HOME' | 'AUTH' | 'FOOTER' | 'GENERAL';
type AuthPageType = 'login' | 'register' | 'forgotPassword';

const ContentManager: React.FC<ContentManagerProps> = ({ slides, siteConfig, refreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('HERO');
  const [activeAuthPage, setActiveAuthPage] = useState<AuthPageType>('login');
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
      setCategories(StorageService.getCategories());
  }, []);

  // Styles
  const inputClass = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-transparent transition-all shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";
  
  const handleUpdateSlide = (slide: HeroSlide) => {
      StorageService.updateHeroSlide(slide);
      refreshData();
      alert("Cập nhật Banner thành công!");
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              const slide = slides.find(s => s.id === slideId);
              if (slide) handleUpdateSlide({ ...slide, image: base64 });
          } catch (error) { console.error(error); }
      }
  };

  const saveConfig = (newConfig: SiteConfig) => {
      StorageService.saveSiteConfig(newConfig);
      refreshData();
  };

  const handleAuthImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && siteConfig.authConfig) {
          const base64 = await fileToBase64(e.target.files[0]);
          const newConfig = { ...siteConfig };
          if(newConfig.authConfig) {
             newConfig.authConfig[activeAuthPage].image = base64;
             saveConfig(newConfig);
          }
      }
  };

  // --- Render Sections ---

  const renderHero = () => (
      <div className="grid gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-900">Quản Lý Banner (Slider)</h3>
               <span className="text-xs text-gray-500">Hiển thị tối đa 3 banner</span>
          </div>
          {slides.map(slide => (
              <div key={slide.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 aspect-video bg-gray-50 rounded-xl overflow-hidden relative group border border-gray-200">
                      <img src={slide.image} className="w-full h-full object-contain" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all">
                          <label className="cursor-pointer bg-white px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all transform hover:scale-105">
                              Thay đổi ảnh <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSlideImageUpload(e, slide.id)} />
                          </label>
                      </div>
                  </div>
                  <div className="flex-1 space-y-4">
                      <div>
                          <label className={labelClass}>Tiêu đề lớn</label>
                          <input type="text" className={inputClass} value={slide.title} onChange={(e) => { slide.title = e.target.value; }} placeholder="Nhập tiêu đề..." />
                      </div>
                      <div>
                          <label className={labelClass}>Mô tả ngắn</label>
                          <textarea className={inputClass} rows={3} value={slide.subtitle} onChange={(e) => { slide.subtitle = e.target.value; }} placeholder="Nhập mô tả..." />
                      </div>
                      <div className="pt-2">
                        <button onClick={() => handleUpdateSlide(slide)} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg">Lưu Banner Này</button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderHomeConfig = () => {
    const sections = siteConfig.homeSections || [];

    const addSection = () => {
        const newSection: HomeSection = {
            id: `sec_${Date.now()}`,
            title: 'Tiêu đề mới',
            categorySlug: categories.length > 0 ? categories[0].slug : 'ALL',
            limit: 4
        };
        saveConfig({ ...siteConfig, homeSections: [...sections, newSection] });
    };

    const removeSection = (id: string) => {
        saveConfig({ ...siteConfig, homeSections: sections.filter(s => s.id !== id) });
    };

    const updateSection = (id: string, field: keyof HomeSection, value: any) => {
        const updated = sections.map(s => s.id === id ? { ...s, [field]: value } : s);
        saveConfig({ ...siteConfig, homeSections: updated });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
             <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Các Kệ Hàng Trang Chủ</h3>
                    <p className="text-sm text-gray-500">Tùy chỉnh các danh mục sản phẩm hiển thị trên trang chủ.</p>
                 </div>
                 <button onClick={addSection} className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                     <span className="material-icons-round text-sm">add</span> Thêm Section
                 </button>
             </div>

             <div className="grid gap-6">
                 {sections.map((section, idx) => (
                     <div key={section.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                         <div className="absolute top-4 right-4 flex gap-2">
                             <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Vị trí: {idx + 1}</span>
                             <button onClick={() => removeSection(section.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" title="Xóa section này">
                                 <span className="material-icons-round">delete</span>
                             </button>
                         </div>
                         
                         <div className="grid md:grid-cols-2 gap-6 mt-4">
                             <div>
                                 <label className={labelClass}>Tiêu đề hiển thị</label>
                                 <input type="text" className={inputClass} value={section.title} onChange={(e) => updateSection(section.id, 'title', e.target.value)} />
                             </div>
                             <div>
                                 <label className={labelClass}>Lọc theo danh mục</label>
                                 <select className={inputClass} value={section.categorySlug} onChange={(e) => updateSection(section.id, 'categorySlug', e.target.value)}>
                                     <option value="ALL">Tất cả sản phẩm</option>
                                     {categories.map(cat => (
                                         <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                     ))}
                                 </select>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
  };

  const renderAuth = () => {
     if (!siteConfig.authConfig) return null;
     const config = siteConfig.authConfig[activeAuthPage];
     return (
        <div className="space-y-6 animate-fade-in-up">
             <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit border border-gray-200">
                {(['login', 'register', 'forgotPassword'] as AuthPageType[]).map(t => (
                    <button key={t} onClick={() => setActiveAuthPage(t)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeAuthPage === t ? 'bg-white shadow-md text-nintendo-red' : 'text-gray-500 hover:text-gray-700'}`}>{t === 'forgotPassword' ? 'Forgot Pass' : t}</button>
                ))}
             </div>
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
                 <div className="aspect-[4/3] bg-gray-50 relative group rounded-xl overflow-hidden border border-gray-200">
                     {config.image && <img src={config.image} className="w-full h-full object-cover" alt="" />}
                     <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all">
                          <label className="cursor-pointer bg-white px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100">
                              Upload Ảnh Mới <input type="file" className="hidden" accept="image/*" onChange={handleAuthImageUpload} />
                          </label>
                      </div>
                 </div>
                 <div className="space-y-6">
                     <div>
                        <label className={labelClass}>Tiêu đề trang</label>
                        <input type="text" className={inputClass} value={config.title} onChange={e => { config.title = e.target.value; saveConfig({...siteConfig}); }} />
                     </div>
                     <div>
                        <label className={labelClass}>Nội dung chào mừng</label>
                        <textarea className={inputClass} rows={5} value={config.subtitle} onChange={e => { config.subtitle = e.target.value; saveConfig({...siteConfig}); }} />
                     </div>
                     <p className="text-xs text-gray-500 italic">Thay đổi sẽ được lưu tự động.</p>
                 </div>
             </div>
        </div>
     );
  };

  const renderGeneral = () => (
     <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8 animate-fade-in-up">
         <div>
             <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Mạng Xã Hội</h3>
             <label className={labelClass}>Link Facebook Messenger</label>
             <div className="flex gap-2">
                 <input type="text" className={inputClass} value={siteConfig.facebookUrl} onChange={e => saveConfig({ ...siteConfig, facebookUrl: e.target.value })} placeholder="https://m.me/yourpage" />
             </div>
             <p className="text-xs text-gray-500 mt-2">Dùng để hiển thị nút Chat ở góc màn hình.</p>
         </div>
         
         {siteConfig.bankConfig && (
             <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Cấu Hình Thanh Toán (VietQR)</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                     <div>
                         <label className={labelClass}>Mã Ngân Hàng (Bin ID)</label>
                         <input type="text" className={inputClass} placeholder="VD: MB, VCB, TPB" value={siteConfig.bankConfig.bankId} onChange={e => saveConfig({ ...siteConfig, bankConfig: { ...siteConfig.bankConfig!, bankId: e.target.value }})} />
                     </div>
                     <div>
                         <label className={labelClass}>Số Tài Khoản</label>
                         <input type="text" className={inputClass} placeholder="VD: 0123456789" value={siteConfig.bankConfig.accountNo} onChange={e => saveConfig({ ...siteConfig, bankConfig: { ...siteConfig.bankConfig!, accountNo: e.target.value }})} />
                     </div>
                     <div className="col-span-2">
                         <label className={labelClass}>Tên Chủ Tài Khoản (Không dấu)</label>
                         <input type="text" className={inputClass} placeholder="VD: NGUYEN VAN A" value={siteConfig.bankConfig.accountName} onChange={e => saveConfig({ ...siteConfig, bankConfig: { ...siteConfig.bankConfig!, accountName: e.target.value.toUpperCase() }})} />
                     </div>
                 </div>
             </div>
         )}
     </div>
  );

  const renderFooter = () => {
    if (!siteConfig.footerConfig) return <div className="p-4">Chưa có cấu hình Footer</div>;
    
    // We clone the config to avoid direct mutation issues during editing
    const config = { ...siteConfig.footerConfig };

    const updateSectionTitle = (index: number, val: string) => {
        config.sections[index].title = val;
        saveConfig({ ...siteConfig, footerConfig: config });
    };

    const updateLink = (sectionIndex: number, linkIndex: number, field: 'label'|'url', val: string) => {
        config.sections[sectionIndex].links[linkIndex][field] = val;
        saveConfig({ ...siteConfig, footerConfig: config });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8 animate-fade-in-up">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Thông Tin Chung</h3>
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Mô tả ngắn về cửa hàng</label>
                        <textarea className={inputClass} rows={3} value={config.description} onChange={(e) => saveConfig({...siteConfig, footerConfig: {...config, description: e.target.value}})} />
                    </div>
                    <div>
                        <label className={labelClass}>Dòng bản quyền (Copyright)</label>
                        <input type="text" className={inputClass} value={config.copyright} onChange={(e) => saveConfig({...siteConfig, footerConfig: {...config, copyright: e.target.value}})} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Các Cột Liên Kết</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {config.sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <label className={labelClass}>Tiêu đề cột {sIdx + 1}</label>
                            <input 
                                type="text" 
                                className={`${inputClass} mb-4 border-gray-300 focus:border-nintendo-red`} 
                                value={section.title} 
                                onChange={(e) => updateSectionTitle(sIdx, e.target.value)} 
                            />
                            
                            <label className={`${labelClass} text-xs text-gray-500`}>Danh sách link</label>
                            <div className="space-y-3">
                                {section.links.map((link, lIdx) => (
                                    <div key={lIdx} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="w-1/2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none placeholder-gray-400" 
                                            placeholder="Tên link"
                                            value={link.label}
                                            onChange={(e) => updateLink(sIdx, lIdx, 'label', e.target.value)}
                                        />
                                        <input 
                                            type="text" 
                                            className="w-1/2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-nintendo-red focus:outline-none placeholder-gray-400" 
                                            placeholder="URL (#)"
                                            value={link.url}
                                            onChange={(e) => updateLink(sIdx, lIdx, 'url', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-8">
        <div className="flex border-b border-gray-200 overflow-x-auto">
            {(['HERO', 'HOME', 'AUTH', 'FOOTER', 'GENERAL'] as SubTab[]).map(t => (
                <button 
                    key={t} 
                    onClick={() => setActiveSubTab(t)} 
                    className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeSubTab === t ? 'border-nintendo-red text-nintendo-red bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                >
                    {t === 'HERO' ? 'BANNER' : t === 'HOME' ? 'TRANG CHỦ' : t === 'AUTH' ? 'LOGIN/REGISTER' : t === 'FOOTER' ? 'CHÂN TRANG' : 'CẤU HÌNH CHUNG'}
                </button>
            ))}
        </div>
        
        {activeSubTab === 'HERO' && renderHero()}
        {activeSubTab === 'HOME' && renderHomeConfig()}
        {activeSubTab === 'AUTH' && renderAuth()}
        {activeSubTab === 'GENERAL' && renderGeneral()}
        {activeSubTab === 'FOOTER' && renderFooter()}
    </div>
  );
};

export default ContentManager;
