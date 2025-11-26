
import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethod, PaymentStatus, BankConfig, User, Address } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import { PaymentService } from '../services/payment';
import { useNavigate } from 'react-router-dom';

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

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  clearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, clearCart }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    city: ''
  });
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('NEW');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'FORM' | 'QR_PAYMENT'>('FORM');
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [tempOrderId, setTempOrderId] = useState<string>('');

  useEffect(() => {
      const config = StorageService.getSiteConfig();
      if (config.bankConfig) {
          setBankConfig(config.bankConfig);
      }
      
      const user = AuthService.getCurrentUser();
      if (user) {
          setCurrentUser(user);
          // Pre-fill form if addresses exist
          if (user.addresses && user.addresses.length > 0) {
              const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
              setSelectedAddressId(defaultAddr.id);
              fillFormWithAddress(defaultAddr, user.email || '');
          } else {
              // Pre-fill partial info from profile if no specific address saved
              setFormData(prev => ({
                  ...prev,
                  name: user.name,
                  email: user.email || '',
                  phone: user.phoneNumber || '',
                  city: user.city || ''
              }));
          }
      }
  }, []);

  const fillFormWithAddress = (addr: Address, email: string) => {
      setFormData({
          name: addr.recipientName,
          email: email, // Email usually comes from user account, not address record
          phone: addr.phoneNumber,
          addressLine: addr.addressLine,
          city: addr.city
      });
  };

  const handleAddressSelection = (id: string) => {
      setSelectedAddressId(id);
      if (id === 'NEW') {
          setFormData({
              name: currentUser?.name || '',
              email: currentUser?.email || '',
              phone: currentUser?.phoneNumber || '',
              addressLine: '',
              city: currentUser?.city || ''
          });
      } else if (currentUser && currentUser.addresses) {
          const addr = currentUser.addresses.find(a => a.id === id);
          if (addr) fillFormWithAddress(addr, currentUser.email || '');
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const fullAddress = `${formData.addressLine}, ${formData.city}`;

    // Logic to save new address if user selected 'NEW' and checked box
    if (currentUser && selectedAddressId === 'NEW' && saveNewAddress) {
        const newAddr: Address = {
            id: `ADDR-${Date.now()}`,
            label: 'Địa chỉ mới',
            recipientName: formData.name,
            phoneNumber: formData.phone,
            city: formData.city,
            addressLine: formData.addressLine,
            isDefault: (currentUser.addresses?.length || 0) === 0
        };
        const updatedAddresses = currentUser.addresses ? [...currentUser.addresses, newAddr] : [newAddr];
        const updatedUser = { ...currentUser, addresses: updatedAddresses };
        AuthService.updateProfile(updatedUser); // Fire and forget update
    }

    // Simulate creation delay
    setTimeout(() => {
        if (paymentMethod === PaymentMethod.COD) {
            // COD: Create and Finish
            StorageService.createOrder(
                cart,
                {
                    name: formData.name,
                    email: formData.email,
                    address: fullAddress,
                    paymentMethod: 'Thanh toán khi nhận hàng (COD)'
                },
                total,
                currentUser?.id,
                PaymentStatus.PENDING
            );
            clearCart();
            setIsProcessing(false);
            alert('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn.');
            navigate('/profile');
        } else {
            // BANK TRANSFER: Create Pending Order and Show QR
            const order = StorageService.createOrder(
                cart,
                {
                    name: formData.name,
                    email: formData.email,
                    address: fullAddress,
                    paymentMethod: 'Chuyển khoản Ngân hàng (QR)'
                },
                total,
                currentUser?.id,
                PaymentStatus.PENDING
            );
            setTempOrderId(order.id);
            setStep('QR_PAYMENT');
            setIsProcessing(false);
        }
    }, 1000);
  };

  const handleConfirmTransfer = async () => {
      setIsProcessing(true);
      const success = await PaymentService.checkTransactionStatus(tempOrderId);
      if (success) {
          clearCart();
          setIsProcessing(false);
          alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
          navigate('/profile');
      } else {
          setIsProcessing(false);
          alert('Chưa nhận được thanh toán. Vui lòng thử lại.');
      }
  };

  if (cart.length === 0 && step === 'FORM') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
           <h2 className="text-2xl font-bold text-gray-700">Giỏ hàng trống</h2>
           <button onClick={() => navigate('/shop')} className="mt-4 text-nintendo-red hover:underline">Quay lại cửa hàng</button>
        </div>
      </div>
    );
  }

  if (step === 'QR_PAYMENT' && bankConfig) {
      const qrUrl = PaymentService.generateVietQRUrl(bankConfig, total, `THANHTOAN ${tempOrderId}`);
      
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-nintendo-red p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Thanh Toán QR Code</h2>
                    <p className="text-red-100 text-sm mt-1">Đơn hàng #{tempOrderId}</p>
                </div>
                <div className="p-8 flex flex-col items-center">
                    <p className="text-gray-600 mb-6 text-center">
                        Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.
                    </p>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
                        <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                    </div>
                    <button 
                        onClick={handleConfirmTransfer}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                    >
                        {isProcessing ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                    </button>
                    <button onClick={() => navigate('/')} className="mt-4 text-gray-500 font-bold text-sm hover:text-gray-800">Để sau, về trang chủ</button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Thanh Toán</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100 order-2 lg:order-1">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-icons-round text-gray-400">shopping_bag</span>
              Đơn hàng của bạn
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.product.title}</h4>
                    <p className="text-gray-500 text-xs mt-1">Số lượng: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-700 text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
             <div className="flex justify-between text-lg font-black text-nintendo-red">
               <span>Tổng cộng</span>
               <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
             </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleCreateOrder} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden order-1 lg:order-2">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nintendo-red to-red-600"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-icons-round text-nintendo-red">local_shipping</span>
              Thông tin giao hàng
          </h2>
          
          <div className="space-y-5">
            {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Chọn từ sổ địa chỉ</label>
                    <select 
                        className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelection(e.target.value)}
                    >
                        {currentUser.addresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                                {addr.label} - {addr.addressLine}, {addr.city}
                            </option>
                        ))}
                        <option value="NEW">+ Thêm địa chỉ giao hàng mới</option>
                    </select>
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Họ và tên</label>
              <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="Nguyễn Văn A" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại</label>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="0912..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="example@mail.com" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tỉnh/Thành phố</label>
                     <select required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none appearance-none">
                         <option value="">Chọn...</option>
                         {VN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ cụ thể</label>
                    <input required name="addressLine" value={formData.addressLine} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="Số nhà, đường, phường..." />
                </div>
            </div>

            {selectedAddressId === 'NEW' && currentUser && (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="saveAddress" 
                        checked={saveNewAddress} 
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="w-4 h-4 text-nintendo-red rounded focus:ring-nintendo-red border-gray-300" 
                    />
                    <label htmlFor="saveAddress" className="text-sm text-gray-600 cursor-pointer select-none">Lưu vào sổ địa chỉ cho lần sau</label>
                </div>
            )}

            <div className="pt-6 mt-6 border-t border-gray-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <span className="material-icons-round text-nintendo-red">payments</span>
                 Phương thức thanh toán
              </h3>
              
              <div className="grid gap-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === PaymentMethod.COD ? 'border-nintendo-red bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={PaymentMethod.COD} 
                        checked={paymentMethod === PaymentMethod.COD}
                        onChange={() => setPaymentMethod(PaymentMethod.COD)}
                        className="w-5 h-5 text-nintendo-red focus:ring-nintendo-red"
                      />
                      <div className="flex-1">
                          <p className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-xs text-gray-500">Thanh toán tiền mặt cho shipper khi nhận được hàng.</p>
                      </div>
                      <span className="material-icons-round text-gray-400">local_atm</span>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-nintendo-red bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={PaymentMethod.BANK_TRANSFER} 
                        checked={paymentMethod === PaymentMethod.BANK_TRANSFER}
                        onChange={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                        className="w-5 h-5 text-nintendo-red focus:ring-nintendo-red"
                      />
                      <div className="flex-1">
                          <p className="font-bold text-gray-900">Chuyển khoản Ngân hàng (QR Code)</p>
                          <p className="text-xs text-gray-500">Quét mã VietQR để thanh toán nhanh chóng, an toàn.</p>
                      </div>
                      <span className="material-icons-round text-blue-500">qr_code_scanner</span>
                  </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-nintendo-red hover:bg-nintendo-dark hover:shadow-red-500/30 transform active:scale-95'}`}
            >
              {isProcessing ? 'Đang xử lý...' : `Đặt hàng • ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
