
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Services & Types
import { Product, CartItem, User, SiteConfig } from './types';
import { StorageService } from './services/storage';
import { AuthService } from './services/auth';

// Components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import SocialFloatingButton from './components/SocialFloatingButton';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  // --- Global State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(StorageService.getSiteConfig());

  // Initialize synchronously
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return AuthService.getCurrentUser();
  });

  const navigate = useNavigate();
  const location = useLocation();

  // --- Effects ---

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Load Data & Listeners
  useEffect(() => {
    const loadData = () => {
      setProducts(StorageService.getProducts());
      setSiteConfig(StorageService.getSiteConfig());
    };

    loadData();

    // Listener for real-time updates from Admin
    window.addEventListener('nintenstore_data_change', loadData);
    
    // Load persisted cart
    const savedCart = localStorage.getItem('nintenstore_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    return () => {
      window.removeEventListener('nintenstore_data_change', loadData);
    };
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('nintenstore_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Handlers ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const addToCart = (product: Product) => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Layout logic
  const isSpecialPage = location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
      {!isSpecialPage && (
        <Navbar
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home featuredProducts={products} onAddToCart={addToCart} onViewDetails={() => { }} />} />
          <Route path="/shop" element={<Shop products={products} onAddToCart={addToCart} onViewDetails={() => { }} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />

          <Route path="/checkout" element={
            currentUser ? (
              <Checkout cart={cart} total={cartTotal} clearCart={clearCart} />
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          } />

          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/profile" element={
            currentUser ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />
          } />

          <Route path="/admin" element={
            currentUser ? (
              currentUser.role === 'ADMIN' ? <AdminDashboard /> : <div className="text-center py-20 text-red-500 font-bold">Access Denied.</div>
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          } />
        </Routes>
      </main>

      {!isSpecialPage && siteConfig.footerConfig && (
        <footer className="bg-gray-900 text-white py-16 mt-0 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-extrabold mb-6 tracking-tight">Ninten<span className="text-nintendo-red">Store</span></h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {siteConfig.footerConfig.description}
              </p>
            </div>
            {siteConfig.footerConfig.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-lg mb-6">{section.title}</h3>
                <ul className="text-gray-400 text-sm space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href={link.url} className="hover:text-white transition-colors">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="font-bold text-lg mb-6">Đăng ký tin mới</h3>
              <div className="flex gap-2">
                <input type="email" placeholder="Email của bạn" className="bg-gray-800 border-none rounded-lg px-4 py-2 text-sm w-full text-white focus:ring-1 focus:ring-nintendo-red" />
                <button className="bg-nintendo-red hover:bg-nintendo-dark text-white px-4 rounded-lg font-bold text-sm">Gửi</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
            <p>{siteConfig.footerConfig.copyright}</p>
          </div>
        </footer>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={removeFromCart} total={cartTotal} />
      {!location.pathname.startsWith('/admin') && <SocialFloatingButton />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App;
