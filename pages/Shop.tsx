
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { toNonAccentVietnamese } from '../utils/helpers';
import { StorageService } from '../services/storage';

interface ShopProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

const Shop: React.FC<ShopProps> = ({ products, onAddToCart, onViewDetails }) => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [categories, setCategories] = useState<Category[]>([]);

  // Load Categories with listener
  useEffect(() => {
    const loadCategories = () => {
        setCategories(StorageService.getCategories());
    };
    loadCategories();
    
    // Listen for admin changes
    window.addEventListener('nintenstore_data_change', loadCategories);
    return () => {
        window.removeEventListener('nintenstore_data_change', loadCategories);
    };
  }, []);

  // Initialize search from URL param
  useEffect(() => {
    const query = searchParams.get('search');
    // Set searchTerm to query if exists, otherwise empty string
    setSearchTerm(query || '');
  }, [searchParams]);

  // Scroll to top when Category changes (since it's internal state, not URL routing)
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [selectedCategory]);

  useEffect(() => {
    let result = products;

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Term (Optimized for Vietnamese)
    if (searchTerm) {
      const normalizedSearch = toNonAccentVietnamese(searchTerm.trim());
      
      result = result.filter(p => {
        const titleNorm = toNonAccentVietnamese(p.title);
        const descNorm = toNonAccentVietnamese(p.description);
        
        return titleNorm.includes(normalizedSearch) || descNorm.includes(normalizedSearch);
      });
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Cửa Hàng</h1>
            {searchTerm && (
                <div className="text-sm text-gray-500 font-medium">
                    Kết quả tìm kiếm cho: <span className="text-nintendo-red font-bold">"{searchTerm}"</span>
                </div>
            )}
        </div>
        
        {/* Filter Chips */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            <button
                onClick={() => setSelectedCategory('ALL')}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 border ${
                    selectedCategory === 'ALL' 
                    ? 'bg-nintendo-red text-white border-nintendo-red shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
                <span className="material-icons-round text-base">grid_view</span>
                Tất cả
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 border ${
                        selectedCategory === cat.slug 
                        ? 'bg-nintendo-red text-white border-nintendo-red shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {cat.icon && <span className="material-icons-round text-base">{cat.icon}</span>}
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
             <span className="material-icons-round text-5xl">search_off</span>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
          <p className="mt-1 text-sm text-gray-500">
             {searchTerm ? `Không tìm thấy kết quả nào cho "${searchTerm}".` : 'Chưa có sản phẩm nào trong danh mục này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
