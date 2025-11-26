
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { PageContent } from '../types';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageConfig, setPageConfig] = useState<PageContent>({
      title: "Quên Mật Khẩu?",
      subtitle: "Đừng lo, hãy nhập email của bạn để chúng tôi gửi hướng dẫn đặt lại mật khẩu.",
      image: ""
  });

  useEffect(() => {
    const config = StorageService.getSiteConfig();
    if (config.authConfig?.forgotPassword) {
        setPageConfig(config.authConfig.forgotPassword);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Back Button */}
        <Link 
            to="/" 
            className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-nintendo-red font-bold transition-colors group"
        >
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </div>
            <span className="text-sm">Trang chủ</span>
        </Link>

      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-nintendo-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">{pageConfig.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
                {pageConfig.subtitle}
            </p>
        </div>

        {isSubmitted ? (
            <div className="text-center space-y-6 animate-fade-in-down">
                <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium">
                    Một email đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và cả mục spam).
                </div>
                <Link to="/login" className="block w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">
                    Quay lại Đăng Nhập
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email đăng ký</label>
                    <input
                        type="email"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-nintendo-red hover:bg-nintendo-dark text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                >
                    Gửi yêu cầu
                </button>
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại đăng nhập
                    </Link>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;