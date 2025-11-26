
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/ChatWidget';
import { Product, CartItem, User, SiteConfig } from './types';
import { StorageService } from './services/storage';
import { AuthService } from './services/auth';

const AppContent: React.FC = () => {
  // Global State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(StorageService.getSiteConfig());

  const navigate = useNavigate();
  const location = useLocation();

  // SCROLL TO TOP LOGIC
  // Automatically scroll to top whenever the path or search query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Load Data and Set up Listener
  useEffect(() => {
    console.log('App mounted, loading data and setting up listeners.');
    const loadData = () => {
        setProducts(StorageService.getProducts());
        setSiteConfig(StorageService.getSiteConfig());
    };

    loadData(); // Initial load

    // Setup listener for Admin changes
    window.addEventListener('nintenstore_data_change', loadData);

    // Load cart
    const savedCart = localStorage.getItem('nintenstore_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load User
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);

    return () => {
        window.removeEventListener('nintenstore_data_change', loadData);
    };
  }, []);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('nintenstore_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  // Cart Actions with Auth Guard
  const addToCart = (product: Product) => {
    if (!currentUser) {
        // Redirect to login, saving the current location to return to
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

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Exclude Navbar on Login/Register/Admin pages for cleaner look
  const isSpecialPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname.startsWith('/admin');

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
          <Route path="/" element={
            <Home 
              featuredProducts={products} 
              onAddToCart={addToCart} 
              onViewDetails={() => {}} 
            />
          } />
          <Route path="/shop" element={
            <Shop 
              products={products} 
              onAddToCart={addToCart} 
              onViewDetails={() => {}} 
            />
          } />
          <Route path="/product/:id" element={
            <ProductDetail 
              onAddToCart={addToCart}
            />
          } />
          <Route path="/checkout" element={
            <Checkout 
              cart={cart} 
              total={cartTotal} 
              clearCart={clearCart} 
            />
          } />
          <Route path="/login" element={
            <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            <Register onLogin={handleLogin} />
          } />
          <Route path="/forgot-password" element={
            <ForgotPassword />
          } />
          <Route path="/profile" element={
            <Profile />
          } />
          <Route path="/admin" element={
             currentUser?.role === 'ADMIN' ? <AdminDashboard /> : <div className="text-center py-20">Access Denied</div>
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

      {/* Global Components */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onRemove={removeFromCart}
        total={cartTotal}
      />
      
      {!location.pathname.startsWith('/admin') && <ChatWidget />}
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
