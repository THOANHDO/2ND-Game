
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Product, Category, Campaign } from '../types';
import { calculateProductPrice } from '../utils/helpers';

interface ProductDetailProps {
  onAddToCart: (p: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  
  useEffect(() => {
    const loadProduct = () => {
        if (id) {
          const found = StorageService.getProductById(id);
          if (found) {
            setProduct(found);
            // Only update active image if it wasn't set or if it's the first load
            if (!activeImage) setActiveImage(found.imageUrl);
            
            // Find category
            const cats = StorageService.getCategories();
            const cat = cats.find(c => c.slug === found.category);
            setCategory(cat);
            
            // Campaigns
            setActiveCampaigns(StorageService.getActiveCampaigns());
          } else {
              // If product deleted
          }
        }
    };

    loadProduct();
    window.scrollTo(0, 0);

    window.addEventListener('nintenstore_data_change', loadProduct);
    return () => {
        window.removeEventListener('nintenstore_data_change', loadProduct);
    };
  }, [id]);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại hoặc đã bị xóa. <button onClick={() => navigate('/shop')} className="ml-2 text-blue-600 underline">Quay lại</button></div>;
  }

  const imageList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const { finalPrice, discountPercent, discountCampaign, giftCampaign } = calculateProductPrice(product, activeCampaigns);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-nintendo-red flex items-center gap-1 text-sm font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
              </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 relative group">
                <img 
                    src={activeImage} 
                    alt={product.title} 
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
                />
                 {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-nintendo-red text-white font-black text-xl px-4 py-2 rounded-xl shadow-lg transform -rotate-3">
                        SALE -{discountPercent}%
                    </div>
                )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {imageList.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden bg-gray-50 ${activeImage === img ? 'border-nintendo-red' : 'border-transparent hover:border-gray-300'} transition-all`}
                    >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                ))}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
             <div className="mb-2 flex items-center gap-2">
                 <span className="bg-nintendo-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                     {category?.icon && (
                        <span className="material-icons-round text-sm">{category.icon}</span>
                     )}
                     {category ? category.name : product.category}
                 </span>
             </div>
             <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                 {product.title}
             </h1>
             
             <div className="flex items-center gap-4 mb-6">
                 <div className="flex text-yellow-400">
                     {'★'.repeat(Math.floor(product.rating))}
                     <span className="text-gray-300">{'★'.repeat(5 - Math.floor(product.rating))}</span>
                 </div>
                 <span className="text-gray-400 text-sm">|</span>
                 <span className="text-gray-500 text-sm">SKU: {product.id.toUpperCase()}</span>
                 <span className="text-gray-400 text-sm">|</span>
                 <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
                     {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                 </span>
             </div>
             
             {/* Pricing Block */}
             <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                 {discountPercent > 0 ? (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                 {discountCampaign?.name}
                             </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1 line-through font-medium">Giá gốc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
                        <div className="flex items-center gap-3">
                            <div className="text-4xl font-extrabold text-nintendo-red">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                            </div>
                            <span className="text-red-600 font-bold bg-white border border-red-100 px-2 py-1 rounded-lg">Tiết kiệm {discountPercent}%</span>
                        </div>
                    </div>
                 ) : (
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Giá bán chính hãng</p>
                        <div className="text-4xl font-extrabold text-nintendo-red">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </div>
                    </div>
                 )}
             </div>

             {/* Gift Campaign Block */}
             {giftCampaign && giftCampaign.voucherConfig && (
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex gap-4 items-start">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <span className="material-icons-round text-xl">card_giftcard</span>
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">{giftCampaign.name}</h4>
                         <p className="text-gray-600 text-sm">Mua ngay để nhận Voucher quà tặng: <span className="font-mono font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">{giftCampaign.voucherConfig.codePrefix}-****</span></p>
                     </div>
                 </div>
             )}

             <div className="prose prose-sm text-gray-600 mb-8 line-clamp-3">
                 {product.description}
             </div>

             <div className="flex gap-4 mt-auto">
                 <button 
                    onClick={() => onAddToCart(product)}
                    className="flex-1 bg-nintendo-red hover:bg-nintendo-dark text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-red-500/30 transform active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                     Thêm vào giỏ ngay
                 </button>
             </div>
          </div>
        </div>

        {/* Details & Video Section */}
        <div className="mt-20 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Mô tả sản phẩm</h3>
                    <div className="text-gray-600 leading-relaxed space-y-4">
                        <p>{product.description}</p>
                        <p>Sản phẩm được phân phối chính hãng bởi Nintendo. Bảo hành 12 tháng tại các trung tâm ủy quyền. Hỗ trợ đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.</p>
                    </div>
                </div>

                {product.videoUrl && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Video Giới Thiệu</h3>
                        <div className="aspect-video rounded-3xl overflow-hidden shadow-lg bg-black">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={`${product.videoUrl}?rel=0`} 
                                title={product.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-4">Thông tin chi tiết</h3>
                    <dl className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <dt className="text-gray-500">Ngày phát hành</dt>
                            <dd className="font-medium">{product.releaseDate}</dd>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <dt className="text-gray-500">Nhà phát hành</dt>
                            <dd className="font-medium">Nintendo</dd>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <dt className="text-gray-500">Thể loại</dt>
                            <dd className="font-medium">{category ? category.name : product.category}</dd>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <dt className="text-gray-500">Rating</dt>
                            <dd className="font-medium">{product.rating}/5</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
