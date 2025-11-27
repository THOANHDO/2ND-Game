
import React, { useState, useEffect } from 'react';
import { Product, Category, Campaign } from '../types';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { calculateProductPrice } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails?: (product: Product) => void; 
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<string | undefined>(undefined);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Lookup category name from storage
    const categories = StorageService.getCategories();
    const cat = categories.find(c => c.slug === product.category);
    if (cat) {
        setCategoryName(cat.name);
        setCategoryIcon(cat.icon);
    } else {
        setCategoryName(product.category); // Fallback to raw value
    }
    
    // Get active campaigns
    setActiveCampaigns(StorageService.getActiveCampaigns());
  }, [product.category]);

  const { finalPrice, discountPercent, giftCampaign } = calculateProductPrice(product, activeCampaigns);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      <Link to={`/product/${product.id}`} className="relative h-64 w-full bg-gray-50 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
             {product.stock < 10 && product.stock > 0 && (
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md border border-red-100">
                    Sắp hết
                </span>
            )}
            {discountPercent > 0 && (
                <span className="bg-nintendo-red text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
                    -{discountPercent}%
                </span>
            )}
            {giftCampaign && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <span className="material-icons-round text-[10px]">card_giftcard</span> Quà tặng
                </span>
            )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                    {categoryIcon && (
                        <span className="material-icons-round text-sm">{categoryIcon}</span>
                    )}
                    {categoryName}
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <span>★</span>
                    <span className="text-gray-400 font-medium">{product.rating}</span>
                </div>
            </div>
            
            <Link to={`/product/${product.id}`}>
                <h3 className="text-lg font-bold text-gray-800 leading-snug hover:text-nintendo-red transition-colors line-clamp-2 mb-2">
                    {product.title}
                </h3>
            </Link>
            
            <div className="flex items-baseline gap-2">
                <p className="text-nintendo-red font-extrabold text-xl">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                </p>
                {discountPercent > 0 && (
                    <p className="text-gray-400 text-sm font-bold line-through decoration-2">
                         {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                )}
            </div>
        </div>
        
        <div className="mt-5">
          <button 
            onClick={(e) => {
                e.preventDefault();
                // We add the product, but cart usually uses base price. 
                // However, for consistency, the Cart calculation logic should ideally also be updated.
                // For this implementation, we just add the product object.
                onAddToCart(product);
            }}
            className="w-full bg-gray-900 hover:bg-nintendo-red text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/30 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
