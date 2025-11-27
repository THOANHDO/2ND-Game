
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, PaymentMethod, PaymentStatus, BankConfig, User, Address, Campaign, Voucher } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import { PaymentService } from '../services/payment';
import { calculateProductPrice } from '../utils/helpers';

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

const Checkout: React.FC<CheckoutProps> = ({ cart, clearCart }) => {
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
  
  // Processing & UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'FORM' | 'QR_PAYMENT'>('FORM');
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [tempOrderId, setTempOrderId] = useState<string>('');

  // Calculations & Voucher
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // --- Effects ---
  useEffect(() => {
    const config = StorageService.getSiteConfig();
    if (config.bankConfig) setBankConfig(config.bankConfig);

    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setSelectedAddressId(defaultAddr.id);
        fillFormWithAddress(defaultAddr, user.email || '');
      } else {
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email || '',
          phone: user.phoneNumber || '',
          city: user.city || ''
        }));
      }
    }

    setActiveCampaigns(StorageService.getActiveCampaigns());
  }, []);

  // Recalculate Totals
  useEffect(() => {
    let newTotal = 0;
    let originalTotal = 0;

    // 1. Calculate Product Discounts
    cart.forEach(item => {
      const { finalPrice, originalPrice } = calculateProductPrice(item.product, activeCampaigns);
      newTotal += finalPrice * item.quantity;
      originalTotal += originalPrice * item.quantity;
    });

    // 2. Apply Voucher Discount
    if (appliedVoucher) {
        if (appliedVoucher.discountType === 'PERCENT') {
            const discountAmount = Math.min(newTotal * (appliedVoucher.value / 100), appliedVoucher.maxDiscountAmount || Infinity);
            newTotal -= discountAmount;
        } else {
            newTotal -= appliedVoucher.value;
        }
        // Ensure not negative
        newTotal = Math.max(0, newTotal);
    }

    setCalculatedTotal(newTotal);
    setTotalSavings(originalTotal - newTotal);
  }, [cart, activeCampaigns, appliedVoucher]);

  // --- Handlers ---

  const fillFormWithAddress = (addr: Address, email: string) => {
    setFormData({
      name: addr.recipientName,
      email: email,
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

  const handleApplyVoucher = () => {
      setVoucherError('');
      if (!voucherCode.trim() || !currentUser?.vouchers) {
          setVoucherError('Vui lòng nhập mã hợp lệ');
          return;
      }
      
      const voucher = currentUser.vouchers.find(v => v.code === voucherCode.trim() && !v.isUsed);
      if (!voucher) {
          setVoucherError('Mã voucher không tồn tại hoặc đã sử dụng');
          return;
      }
      
      // Check expiry
      if (new Date(voucher.expiryDate) < new Date()) {
          setVoucherError('Voucher đã hết hạn');
          return;
      }

      setAppliedVoucher(voucher);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const fullAddress = `${formData.addressLine}, ${formData.city}`;

    // Save Address Logic
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
      AuthService.updateProfile({ ...currentUser, addresses: updatedAddresses });
    }

    // Prepare Voucher Details for storage
    const voucherDetails = appliedVoucher ? {
        code: appliedVoucher.code,
        discount: totalSavings // This is approximate, ideally calculate just the voucher part
    } : undefined;

    setTimeout(() => {
      if (paymentMethod === PaymentMethod.COD) {
        StorageService.createOrder(
          cart,
          {
            name: formData.name,
            email: formData.email,
            address: fullAddress,
            paymentMethod: 'Thanh toán khi nhận hàng (COD)'
          },
          calculatedTotal,
          currentUser?.id,
          PaymentStatus.PENDING,
          voucherDetails
        );
        clearCart();
        setIsProcessing(false);
        alert('Đặt hàng thành công!');
        navigate('/profile');
      } else {
        const order = StorageService.createOrder(
          cart,
          {
            name: formData.name,
            email: formData.email,
            address: fullAddress,
            paymentMethod: 'Chuyển khoản Ngân hàng (QR)'
          },
          calculatedTotal,
          currentUser?.id,
          PaymentStatus.PENDING,
          voucherDetails
        );
        setTempOrderId(order.id);
        setStep('QR_PAYMENT');
        setIsProcessing(false);
      }
    }, 1000);
  };

  // --- Views ---

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
    const qrUrl = PaymentService.generateVietQRUrl(bankConfig, calculatedTotal, `THANHTOAN ${tempOrderId}`);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 text-center p-8">
            <h2 className="text-2xl font-bold text-nintendo-red mb-4">Quét Mã Thanh Toán</h2>
            <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain mx-auto mb-6 shadow-lg rounded-xl" />
            <p className="text-2xl font-black mb-6">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculatedTotal)}</p>
            <button onClick={() => { clearCart(); navigate('/profile'); }} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">Tôi đã chuyển khoản</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Thanh Toán</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Summary Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100 order-2 lg:order-1">
            <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {cart.map(item => {
                    const { finalPrice, discountPercent } = calculateProductPrice(item.product, activeCampaigns);
                    return (
                        <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                            <div className="flex gap-3">
                                <img src={item.product.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />
                                <div>
                                    <p className="font-bold text-sm">{item.product.title}</p>
                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {discountPercent > 0 && <p className="text-xs line-through text-gray-400">{new Intl.NumberFormat('vi-VN').format(item.product.price * item.quantity)}</p>}
                                <p className="font-bold text-sm">{new Intl.NumberFormat('vi-VN').format(finalPrice * item.quantity)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Voucher Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Mã giảm giá</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase"
                        placeholder="Nhập mã voucher"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                    <button onClick={handleApplyVoucher} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Áp dụng</button>
                </div>
                {voucherError && <p className="text-red-500 text-xs mt-1">{voucherError}</p>}
                {appliedVoucher && (
                    <div className="mt-2 bg-green-50 text-green-700 p-2 rounded text-sm flex justify-between items-center">
                        <span>Đã dùng: <strong>{appliedVoucher.code}</strong></span>
                        <button onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }} className="text-xs underline">Bỏ</button>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-lg font-black text-nintendo-red">
                    <span>Thành tiền</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculatedTotal)}</span>
                </div>
            </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleCreateOrder} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 order-1 lg:order-2">
           <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>
           <div className="space-y-4">
               {currentUser?.addresses && currentUser.addresses.length > 0 && (
                   <select 
                     className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 font-bold"
                     value={selectedAddressId}
                     onChange={(e) => handleAddressSelection(e.target.value)}
                   >
                       {currentUser.addresses.map(a => <option key={a.id} value={a.id}>{a.label} - {a.addressLine}</option>)}
                       <option value="NEW">+ Thêm địa chỉ mới</option>
                   </select>
               )}
               
               <input required name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Họ và tên" />
               <div className="grid grid-cols-2 gap-4">
                   <input required name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Số điện thoại" />
                   <input required name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Email" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                    <select required name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3">
                        <option value="">Tỉnh/Thành</option>
                        {VN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input required name="addressLine" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Địa chỉ cụ thể" />
               </div>
               
               {selectedAddressId === 'NEW' && currentUser && (
                   <label className="flex items-center gap-2 text-sm text-gray-600">
                       <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)} className="rounded text-nintendo-red focus:ring-nintendo-red" />
                       Lưu vào sổ địa chỉ
                   </label>
               )}
           </div>

           <div className="mt-8 pt-6 border-t border-gray-100">
               <h3 className="font-bold mb-4">Phương thức thanh toán</h3>
               <div className="space-y-3">
                   <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === PaymentMethod.COD ? 'border-nintendo-red bg-red-50' : 'border-gray-100'}`}>
                       <input type="radio" name="payment" value={PaymentMethod.COD} checked={paymentMethod === PaymentMethod.COD} onChange={() => setPaymentMethod(PaymentMethod.COD)} className="text-nintendo-red focus:ring-nintendo-red" />
                       <div>
                           <div className="font-bold">Thanh toán khi nhận hàng (COD)</div>
                           <div className="text-xs text-gray-500">Thanh toán tiền mặt cho shipper.</div>
                       </div>
                   </label>
                   <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-nintendo-red bg-red-50' : 'border-gray-100'}`}>
                       <input type="radio" name="payment" value={PaymentMethod.BANK_TRANSFER} checked={paymentMethod === PaymentMethod.BANK_TRANSFER} onChange={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)} className="text-nintendo-red focus:ring-nintendo-red" />
                       <div>
                           <div className="font-bold">Chuyển khoản Ngân hàng (QR)</div>
                           <div className="text-xs text-gray-500">Quét mã VietQR tiện lợi.</div>
                       </div>
                   </label>
               </div>
           </div>

           <button type="submit" disabled={isProcessing} className="w-full mt-8 bg-nintendo-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-nintendo-dark transition-all">
               {isProcessing ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
