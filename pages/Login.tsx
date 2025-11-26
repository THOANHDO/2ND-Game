
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';
import { User, PageContent } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageConfig, setPageConfig] = useState<PageContent>({
      title: "Welcome Back, Gamer!",
      subtitle: "Tiếp tục cuộc hành trình của bạn trong thế giới Nintendo. Hàng ngàn ưu đãi đang chờ đón.",
      image: "https://images.unsplash.com/photo-1620287532393-273679805d77?auto=format&fit=crop&q=80&w=1500"
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from state, or default to '/'
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
      const config = StorageService.getSiteConfig();
      if (config.authConfig?.login) {
          setPageConfig(config.authConfig.login);
      }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await AuthService.login(email, password);
      onLogin(user);

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (error) {
      console.error(error);
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-nintendo-red opacity-10 z-10 mix-blend-multiply"></div>
        <img 
          src={pageConfig.image} 
          alt="Gaming Setup" 
          className="w-full h-full object-cover opacity-60 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-20 flex flex-col justify-end p-12">
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{pageConfig.title}</h2>
            <p className="text-gray-300 text-lg max-w-md">
                {pageConfig.subtitle}
            </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        {/* Back Button */}
        <Link 
            to="/" 
            className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 text-gray-500 hover:text-nintendo-red font-bold transition-colors group"
        >
            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-red-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </div>
            <span className="text-sm">Trang chủ</span>
        </Link>

        <div className="max-w-md w-full space-y-8 animate-fade-in-down mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng Nhập</h2>
            <p className="mt-2 text-sm text-gray-600">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-nintendo-red hover:text-nintendo-dark transition-colors">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-nintendo-red sm:text-sm transition-all"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-nintendo-red sm:text-sm transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-nintendo-red focus:ring-nintendo-red border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Ghi nhớ tôi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-bold text-nintendo-red hover:text-nintendo-dark">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs text-gray-500">
               <p className="font-bold text-gray-700 mb-1">Tài khoản Demo:</p>
               <div className="flex justify-between">
                   <span>Admin: admin@ninten.com / 123456</span>
                   <button onClick={() => { setEmail('admin@ninten.com'); setPassword('123456'); }} type="button" className="text-blue-600 hover:underline">Copy</button>
               </div>
               <div className="flex justify-between">
                   <span>User: user@gmail.com / 123456</span>
                   <button onClick={() => { setEmail('user@gmail.com'); setPassword('123456'); }} type="button" className="text-blue-600 hover:underline">Copy</button>
               </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all transform active:scale-95 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-nintendo-red hover:bg-nintendo-dark hover:shadow-xl'}`}
            >
              {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;