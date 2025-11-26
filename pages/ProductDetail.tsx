
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Product, Category } from '../types';

interface ProductDetailProps {
  onAddToCart: (p: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [category, setCategory] = useState<Category | undefined>(undefined);
  
  useEffect(() => {
    const loadProduct = () => {
        if (id) {
          const found = StorageService.getProductById(id);
          if (found) {
            setProduct(found);
            // Only update active image if it wasn't set or if it's the first load
            // We want to avoid resetting the user's selected image if they are just viewing updates
            if (!activeImage) setActiveImage(found.imageUrl);
            
            // Find category
            const cats = StorageService.getCategories();
            const cat = cats.find(c => c.slug === found.category);
            setCategory(cat);
          } else {
              // If product deleted while viewing, maybe redirect or show error?
              // For now, let's just leave it undefined and show loading/not found
          }
        }
    };

    loadProduct();
    window.scrollTo(0, 0);

    window.addEventListener('nintenstore_data_change', loadProduct);
    return () => {
        window.removeEventListener('nintenstore_data_change', loadProduct);
    };
  }, [id]); // Keep activeImage out of deps to avoid reset on re-render

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại hoặc đã bị xóa. <button onClick={() => navigate('/shop')} className="ml-2 text-blue-600 underline">Quay lại</button></div>;
  }

  const imageList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

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

             <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                 <p className="text-gray-500 text-sm mb-1">Giá bán chính hãng</p>
                 <div className="text-4xl font-extrabold text-nintendo-red">
                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                 </div>
             </div>

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
                 <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-2xl transition-colors">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
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
