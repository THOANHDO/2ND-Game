
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // State for mobile search toggle
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu and search when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowMobileSearch(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        setShowMobileSearch(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full">
      {/* Promo Bar */}
      <div className="bg-nintendo-red text-white text-xs font-bold py-2 text-center hidden sm:block tracking-wide">
        🎉 MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TỪ 1.000.000Đ
      </div>

      {/* Main Navbar */}
      <nav 
        className={`w-full transition-all duration-300 border-b border-gray-100 ${
          isScrolled ? 'glass-nav shadow-sm py-2' : 'bg-white py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-nintendo-red text-white p-2 rounded-xl shadow-lg shadow-red-500/20 group-hover:bg-nintendo-dark transition-all duration-300 transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6a2 2 0 012-2h3.5a.5.5 0 01.5.5v15a.5.5 0 01-.5.5H6a2 2 0 01-2-2V6zm9.5-1.5a.5.5 0 01.5-.5H18a2 2 0 012 2v12a2 2 0 01-2 2h-4a.5.5 0 01-.5-.5v-15zM7.5 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="font-extrabold text-2xl tracking-tighter text-gray-900 leading-none">Ninten<span className="text-nintendo-red">Store</span></span>
                  <span className="text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase ml-0.5">Gaming World</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
             <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
                <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-nintendo-red' : 'text-gray-600 hover:text-nintendo-red'}`}>
                  Trang chủ
                </Link>
                <Link to="/shop" className={`text-sm font-bold transition-colors ${location.pathname === '/shop' ? 'text-nintendo-red' : 'text-gray-600 hover:text-nintendo-red'}`}>
                  Sản phẩm
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors">
                    Admin Dashboard
                  </Link>
                )}
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-md mx-4 relative group">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm game, phụ kiện..." 
                    className="w-full bg-gray-100 border border-transparent group-hover:bg-white group-hover:border-gray-300 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-hover:text-nintendo-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </form>

            {/* Icons Area */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              
              {/* Mobile Search Toggle Icon */}
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 text-gray-600 hover:text-nintendo-red hover:bg-red-50 rounded-lg transition-colors"
              >
                {showMobileSearch ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )}
              </button>

              {/* User Account */}
              <div className="relative group z-50">
                {user ? (
                   <div className="flex items-center gap-2 cursor-pointer py-2">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                      <span className="hidden lg:block text-sm font-bold text-gray-700 max-w-[100px] truncate">{user.name}</span>
                      
                      {/* Dropdown */}
                      <div className="absolute top-full right-0 pt-3 w-56 hidden group-hover:block animate-fade-in-down">
                          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500">Xin chào,</p>
                                <p className="font-bold text-gray-800 truncate">{user.name}</p>
                            </div>
                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-nintendo-red transition-colors">
                                Hồ sơ & Đơn hàng
                            </Link>
                            {user.role === 'ADMIN' && (
                              <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-nintendo-red transition-colors">
                                  Trang Quản Trị
                              </Link>
                            )}
                            <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors border-t border-gray-100">
                                Đăng xuất
                            </button>
                          </div>
                      </div>
                   </div>
                ) : (
                    <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-nintendo-red font-bold text-sm transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="hidden lg:inline">Đăng nhập</span>
                    </Link>
                )}
              </div>

              {/* Cart Button */}
              <button 
                onClick={onOpenCart}
                className="relative p-2 text-gray-800 hover:text-nintendo-red transition-colors group"
              >
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-nintendo-red text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-sm transform group-hover:scale-110 transition-transform">
                  {cartCount}
                </div>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
              
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-nintendo-red hover:bg-red-50 focus:outline-none transition-colors"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path className={isMenuOpen ? 'hidden' : 'inline-flex'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    <path className={isMenuOpen ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Collapsible (Only shows when icon is clicked) */}
        <div 
            className={`md:hidden absolute top-full left-0 w-full bg-white px-4 pb-4 pt-2 shadow-lg border-b border-gray-100 transition-all duration-300 ease-in-out transform origin-top z-40 ${
                showMobileSearch ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
            }`}
        >
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm game, phụ kiện..." 
                    className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nintendo-red"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus={showMobileSearch}
                />
                 <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </form>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
            className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-30 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 hover:bg-red-50 hover:text-nintendo-red transition-colors">Trang chủ</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 hover:bg-red-50 hover:text-nintendo-red transition-colors">Sản phẩm</Link>
             {!user && (
                 <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 hover:bg-red-50 hover:text-nintendo-red transition-colors">Đăng nhập</Link>
             )}
             {user && (
                 <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 hover:bg-red-50 hover:text-nintendo-red transition-colors">Tài khoản của tôi</Link>
                    <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-colors">Đăng xuất</button>
                 </>
             )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
