import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (productId: string) => void;
  total: number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onRemove, total }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-4 bg-nintendo-red text-white flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold">Giỏ Hàng ({cart.reduce((acc, item) => acc + item.quantity, 0)})</h2>
          <button onClick={onClose} className="hover:bg-red-700 p-1 rounded">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex gap-4 items-start border-b pb-4">
                <img src={item.product.imageUrl} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{item.product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-nintendo-red font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}
                    </span>
                    <span className="text-gray-500 text-sm">x{item.quantity}</span>
                  </div>
                  <button 
                    onClick={() => onRemove(item.productId)}
                    className="text-xs text-red-500 underline mt-1 hover:text-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Tổng tiền:</span>
              <span className="text-xl font-bold text-nintendo-red">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-nintendo-red hover:bg-nintendo-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
            >
              Tiến hành thanh toán
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;