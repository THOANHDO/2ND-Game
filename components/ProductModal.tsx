import React from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Media Section */}
          <div className="p-0 bg-gray-900 flex flex-col items-center justify-center min-h-[300px] md:h-full">
            {product.videoUrl ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`${product.videoUrl}?autoplay=0&controls=1`} 
                title={product.title} 
                className="w-full aspect-video md:h-full"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
            )}
          </div>

          {/* Info Section */}
          <div className="p-8 flex flex-col">
            <div className="flex-grow">
               <span className="inline-block bg-red-100 text-nintendo-red text-xs font-bold px-2 py-1 rounded mb-2">
                 {product.category}
               </span>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{product.title}</h2>
              <div className="flex items-center mb-4">
                 <span className="text-yellow-400 text-xl mr-1">★★★★★</span>
                 <span className="text-gray-500 text-sm">({product.rating} / 5.0)</span>
                 <span className="mx-2 text-gray-300">|</span>
                 <span className="text-gray-500 text-sm">Còn hàng: {product.stock}</span>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                 <p className="text-sm text-gray-500">Ngày phát hành: {product.releaseDate}</p>
                 <p className="text-sm text-gray-500">Chính hãng Nintendo VN</p>
              </div>
            </div>

            <div className="mt-auto border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Giá bán</span>
                <span className="text-3xl font-extrabold text-nintendo-red">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
              </div>
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-nintendo-red hover:bg-nintendo-dark text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all"
              >
                Thêm vào giỏ hàng ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;