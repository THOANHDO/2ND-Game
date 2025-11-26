
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, HeroSlide } from '../types';
import ProductCard from '../components/ProductCard';
import { StorageService } from '../services/storage';

interface HomeProps {
  featuredProducts: Product[];
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

const Home: React.FC<HomeProps> = ({ featuredProducts, onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const loadSlides = () => {
        setHeroSlides(StorageService.getHeroSlides());
    };
    loadSlides();

    // Listen for admin changes
    window.addEventListener('nintenstore_data_change', loadSlides);
    return () => {
        window.removeEventListener('nintenstore_data_change', loadSlides);
    };
  }, []);

  // Auto-play Slider logic
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); 

    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  if (heroSlides.length === 0) return null;

  return (
    <div className="space-y-20 pb-20">
      
      {/* Immersive Hero Slider Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
        <div className="relative bg-gray-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden h-[640px] md:h-[600px] shadow-2xl shadow-gray-400/50">
          
          {heroSlides.map((slide, index) => (
            <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] ${slide.accentColor} opacity-20 blur-[100px] rounded-full mix-blend-screen`}></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-white opacity-10 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>

                <div className="relative w-full h-full flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-8 items-center py-6 md:py-0">
                    
                    {/* Image Content (Mobile: Top, Desktop: Right) */}
                    <div className="relative h-[260px] md:h-full w-full flex items-center justify-center order-1 md:order-2 pointer-events-none flex-shrink-0 mt-4 md:mt-0">
                        <img 
                            src={slide.image} 
                            alt={slide.title}
                            className={`w-auto h-[90%] md:w-[110%] md:h-auto max-w-[300px] md:max-w-none object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform md:-translate-x-10 transition-transform duration-1000 ${index === currentSlide ? 'animate-float scale-100' : 'scale-95'}`}
                        />
                    </div>

                    {/* Text Content (Mobile: Bottom, Desktop: Left) */}
                    <div className="relative z-20 px-6 md:pl-16 lg:pl-20 text-center md:text-left order-2 md:order-1 flex flex-col items-center md:items-start justify-start md:justify-center flex-grow pt-2 pb-12 md:pb-0">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 border border-white/10">
                            <span className={`w-2 h-2 rounded-full ${index === currentSlide ? 'animate-pulse bg-white' : 'bg-gray-400'}`}></span>
                            Featured
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-3 md:mb-6 drop-shadow-lg">
                            {slide.title.split(' ').slice(0, -1).join(' ')} <br/>
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.bgGradient}`}>
                                {slide.title.split(' ').slice(-1)}
                            </span>
                        </h1>
                        <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed max-w-sm md:max-w-lg mx-auto md:mx-0 font-medium line-clamp-2 md:line-clamp-none">
                            {slide.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full md:w-auto">
                            <Link 
                                to="/shop" 
                                className={`relative z-40 ${slide.accentColor} hover:brightness-110 text-white px-8 py-3 md:py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-gray-900/20 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto`}
                            >
                                Mua Ngay
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
          ))}
          
          {/* Slider Indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
            {heroSlides.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white w-6 md:w-8' : 'bg-white/30 hover:bg-white/50'}`}
                />
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: "M5 13l4 4L19 7", title: "Chính hãng 100%", desc: "Bảo hành Nintendo VN" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Giao hàng hỏa tốc", desc: "Nhận hàng trong 2h" },
              { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", title: "Thanh toán an toàn", desc: "Đa dạng phương thức" },
              { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", title: "Hỗ trợ 24/7", desc: "Tư vấn chuyên nghiệp" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow group">
                 <div className="w-12 h-12 bg-red-50 text-nintendo-red rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                 </div>
                 <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.title}</h3>
                 <p className="text-gray-500 text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <span className="text-nintendo-red font-bold text-sm tracking-widest uppercase block mb-1">Trending</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Sản Phẩm Nổi Bật</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-gray-500 font-bold hover:text-nintendo-red transition-all">
                Xem tất cả 
                <span className="bg-gray-100 group-hover:bg-red-100 group-hover:text-nintendo-red p-1.5 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
            </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.slice(0, 4).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Home;
