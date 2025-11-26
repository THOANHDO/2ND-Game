import React, { useState } from 'react';
import { CartItem } from '../types';
import { StorageService } from '../services/storage';
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
    card: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API delay
    setTimeout(() => {
      // Create Order in "Database"
      StorageService.createOrder(
        cart,
        {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          paymentMethod: 'CREDIT_CARD'
        },
        total
      );

      clearCart();
      setIsProcessing(false);
      alert('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.');
      navigate('/');
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
           <h2 className="text-2xl font-bold text-gray-700">Giỏ hàng trống</h2>
           <button onClick={() => navigate('/shop')} className="mt-4 text-nintendo-red hover:underline">Quay lại cửa hàng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Thanh Toán</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-4">
                  <img src={item.product.imageUrl} alt={item.product.title} className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{item.product.title}</h4>
                    <p className="text-gray-500 text-sm">SL: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-700">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
             <div className="flex justify-between text-lg font-extrabold text-nintendo-red">
               <span>Tổng cộng</span>
               <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
             </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-nintendo-red">
          <h2 className="text-xl font-bold mb-6">Thông tin giao hàng & Thanh toán</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input required name="name" onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required name="email" onChange={handleInputChange} type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
              <input required name="address" onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Thẻ tín dụng / Ghi nợ (Mô phỏng)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <input required name="card" placeholder="Số thẻ" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
                 </div>
                 <div>
                    <input required name="expiry" placeholder="MM/YY" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
                 </div>
                 <div>
                    <input required name="cvv" placeholder="CVC" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nintendo-red focus:outline-none" />
                 </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-md transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-nintendo-red hover:bg-nintendo-dark hover:shadow-lg transform active:scale-95'}`}
            >
              {isProcessing ? 'Đang xử lý...' : `Thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}`}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Lưu ý: Đây là trang web mô phỏng, không nhập thông tin thẻ thật.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;