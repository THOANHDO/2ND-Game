
import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethod, PaymentStatus, BankConfig } from '../types';
import { StorageService } from '../services/storage';
import { PaymentService } from '../services/payment';
import { useNavigate } from 'react-router-dom';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  clearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate creation delay
    setTimeout(() => {
        if (paymentMethod === PaymentMethod.COD) {
            // COD: Create and Finish
            StorageService.createOrder(
                cart,
                {
                    name: formData.name,
                    email: formData.email,
                    address: formData.address,
                    paymentMethod: 'Thanh toán khi nhận hàng (COD)'
                },
                total,
                undefined,
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
                    address: formData.address,
                    paymentMethod: 'Chuyển khoản Ngân hàng (QR)'
                },
                total,
                undefined,
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
      // Mock checking transaction
      const success = await PaymentService.checkTransactionStatus(tempOrderId);
      if (success) {
          // Update Order to PAID
          // NOTE: In a real app, this update happens via Webhook on the backend.
          // Here we just mock updating the local storage "status" if we had an update method exposed for payment status.
          // Since we don't have a direct "updatePaymentStatus" exposed in StorageService for this demo, we'll just assume success UI.
          
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

                    <div className="w-full bg-gray-50 rounded-xl p-4 mb-8 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngân hàng:</span>
                            <span className="font-bold text-gray-900">{bankConfig.bankId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số tài khoản:</span>
                            <span className="font-bold text-gray-900">{bankConfig.accountNo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Chủ tài khoản:</span>
                            <span className="font-bold text-gray-900">{bankConfig.accountName}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="font-bold text-nintendo-red text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nội dung:</span>
                            <span className="font-bold text-blue-600">THANHTOAN {tempOrderId}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirmTransfer}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                    >
                        {isProcessing ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 text-gray-500 font-bold text-sm hover:text-gray-800"
                    >
                        Để sau, về trang chủ
                    </button>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100">
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
        <form onSubmit={handleCreateOrder} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nintendo-red to-red-600"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-icons-round text-nintendo-red">local_shipping</span>
              Thông tin giao hàng
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Họ và tên</label>
              <input required name="name" onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="Nguyễn Văn A" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại</label>
                    <input required name="phone" onChange={handleInputChange} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="0912..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                    <input required name="email" onChange={handleInputChange} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="example@mail.com" />
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ nhận hàng</label>
              <input required name="address" onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-nintendo-red focus:bg-white focus:border-transparent transition-all outline-none" placeholder="Số nhà, Đường, Phường/Xã..." />
            </div>

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
