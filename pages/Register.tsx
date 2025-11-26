
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService, RegisterPayload } from '../services/auth';
import { StorageService } from '../services/storage';
import { User, PageContent } from '../types';
import { isValidVietnamesePhoneNumber } from '../utils/helpers';

interface RegisterProps {
  onLogin: (user: User) => void;
}

type RegisterMethod = 'EMAIL' | 'PHONE';
type Step = 'INPUT' | 'OTP';

const VN_CITIES = [
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình",
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
    "Vĩnh Phúc", "Yên Bái"
];

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  
  // State
  const [method, setMethod] = useState<RegisterMethod>('EMAIL');
  const [step, setStep] = useState<Step>('INPUT');
  const [isLoading, setIsLoading] = useState(false);
  const [pageConfig, setPageConfig] = useState<PageContent>({
        title: "Tham Gia Cộng Đồng",
        subtitle: "Tạo tài khoản ngay để theo dõi đơn hàng, nhận ưu đãi độc quyền và tham gia bình luận.",
        image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&q=80&w=1500"
  });
  
  // Form Data
  const [name, setName] = useState('');
  const [contactValue, setContactValue] = useState(''); // Holds email or phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  
  // OTP
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const config = StorageService.getSiteConfig();
    if (config.authConfig?.register) {
        setPageConfig(config.authConfig.register);
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
    }
    if (method === 'PHONE' && !isValidVietnamesePhoneNumber(contactValue)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng (VD: 0912345678)");
        return;
    }
    if (!city) {
        alert("Vui lòng chọn Tỉnh/Thành phố sinh sống.");
        return;
    }

    setIsLoading(true);
    try {
        // Simulate sending OTP
        await AuthService.sendOTP(contactValue, method);
        setStep('OTP');
        alert(`Mã OTP demo (123456) đã được gửi tới ${method === 'EMAIL' ? 'email' : 'số điện thoại'} của bạn.`);
    } catch (error) {
        console.error(error);
        alert("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      const payload: RegisterPayload = {
          name,
          password,
          dob,
          city,
          email: method === 'EMAIL' ? contactValue : undefined,
          phoneNumber: method === 'PHONE' ? contactValue : undefined,
      };

      try {
          const user = await AuthService.verifyAndRegister(payload, otp);
          onLogin(user);
          navigate('/');
      } catch (error) {
          alert("Mã OTP không đúng hoặc đã hết hạn.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Right Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative order-2 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-10 z-10 mix-blend-multiply"></div>
        <img 
          src={pageConfig.image} 
          alt="Nintendo Switch Group" 
          className="w-full h-full object-cover opacity-60 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-20 flex flex-col justify-end p-12">
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{pageConfig.title}</h2>
            <p className="text-gray-300 text-lg max-w-md">
                {pageConfig.subtitle}
            </p>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 order-1 relative">
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

        <div className="max-w-md w-full animate-fade-in-down mt-10 lg:mt-0">
          
          {step === 'INPUT' ? (
            <>
                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tạo Tài Khoản</h2>
                    <p className="mt-2 text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-bold text-nintendo-red hover:text-nintendo-dark transition-colors">
                        Đăng nhập ngay
                    </Link>
                    </p>
                </div>

                {/* Method Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button 
                        type="button"
                        onClick={() => { setMethod('EMAIL'); setContactValue(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'EMAIL' ? 'bg-white text-nintendo-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Đăng ký qua Email
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setMethod('PHONE'); setContactValue(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'PHONE' ? 'bg-white text-nintendo-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Đăng ký qua SĐT
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSendOTP}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên đầy đủ</label>
                        <input
                            type="text"
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {method === 'EMAIL' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                                placeholder="user@example.com"
                                value={contactValue}
                                onChange={(e) => setContactValue(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (Việt Nam)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold border-r border-gray-200 pr-2 my-2">+84</span>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                                    placeholder="912345678"
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <input
                                type="date"
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red text-gray-700"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                            <select
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red text-gray-700 appearance-none"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="">Chọn nơi sống</option>
                                {VN_CITIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-nintendo-red"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        Bằng việc đăng ký, bạn đồng ý nhận mã OTP qua {method === 'EMAIL' ? 'Email' : 'Số điện thoại'} để xác thực tài khoản.
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all transform active:scale-95 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-nintendo-red hover:bg-nintendo-dark hover:shadow-xl'}`}
                    >
                    {isLoading ? 'Đang gửi mã...' : 'Tiếp Tục'}
                    </button>
                </form>
            </>
          ) : (
              // Step 2: OTP Verification
              <div className="bg-white p-2 rounded-xl">
                   <button 
                        onClick={() => setStep('INPUT')}
                        className="mb-6 flex items-center text-gray-500 hover:text-nintendo-red font-bold text-sm"
                   >
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                       </svg>
                       Quay lại
                   </button>
                   
                   <div className="text-center mb-8">
                       <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-8 h-8 text-nintendo-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                           </svg>
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900">Xác thực OTP</h2>
                       <p className="text-gray-500 mt-2 text-sm">
                           Nhập mã 6 số đã được gửi đến <br/>
                           <span className="font-bold text-gray-800">{contactValue}</span>
                       </p>
                   </div>

                   <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="flex justify-center gap-2">
                             <input 
                                type="text" 
                                maxLength={6}
                                className="w-full text-center text-3xl tracking-[1em] font-bold py-4 border-b-2 border-gray-300 focus:border-nintendo-red focus:outline-none bg-transparent"
                                placeholder="••••••"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                autoFocus
                             />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length < 6}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all ${isLoading || otp.length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-nintendo-red hover:bg-nintendo-dark hover:shadow-xl transform active:scale-95'}`}
                        >
                            {isLoading ? 'Đang xác thực...' : 'Xác Nhận & Đăng Ký'}
                        </button>
                        
                        <div className="text-center">
                            <button type="button" onClick={handleSendOTP} className="text-sm text-nintendo-red font-bold hover:underline">
                                Gửi lại mã OTP
                            </button>
                        </div>
                   </form>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;