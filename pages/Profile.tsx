
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';
import { User, Order, OrderStatus, Address } from '../types';
import { isValidVietnamesePhoneNumber, fileToBase64 } from '../utils/helpers';

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

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'INFO' | 'ORDERS' | 'ADDRESS'>('INFO');
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState<Address>({
        id: '',
        label: 'Nhà riêng',
        recipientName: '',
        phoneNumber: '',
        city: '',
        addressLine: '',
        isDefault: false
    });

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        dob: '',
        city: '',
        avatar: ''
    });

    // UI Styles
    const inputClass = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nintendo-red focus:border-transparent transition-all shadow-sm";
    const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        setFormData({
            name: currentUser.name,
            phoneNumber: currentUser.phoneNumber || '',
            dob: currentUser.dob || '',
            city: currentUser.city || '',
            avatar: currentUser.avatar || ''
        });

        // Load Orders
        const userOrders = StorageService.getOrdersByUserId(currentUser.id, currentUser.email);
        setOrders(userOrders);
    }, [navigate]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setFormData({ ...formData, avatar: base64 });
                setIsEditing(true); 
            } catch (error) {
                console.error("Error reading file", error);
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (formData.phoneNumber && !isValidVietnamesePhoneNumber(formData.phoneNumber)) {
            alert("Số điện thoại không hợp lệ");
            return;
        }

        const updatedUser: User = {
            ...user,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            dob: formData.dob,
            city: formData.city,
            avatar: formData.avatar || user.avatar
        };

        try {
            await AuthService.updateProfile(updatedUser);
            setUser(updatedUser);
            setIsEditing(false);
            alert("Cập nhật thông tin thành công!");
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi cập nhật.");
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) return;
        
        const addressToAdd: Address = {
            ...newAddress,
            id: `ADDR-${Date.now()}`,
            isDefault: (user.addresses?.length || 0) === 0 ? true : newAddress.isDefault // First address is always default
        };

        // If setting as default, unset others
        let updatedAddresses = user.addresses ? [...user.addresses] : [];
        if (addressToAdd.isDefault) {
            updatedAddresses = updatedAddresses.map(a => ({...a, isDefault: false}));
        }
        updatedAddresses.push(addressToAdd);

        const updatedUser = { ...user, addresses: updatedAddresses };
        await AuthService.updateProfile(updatedUser);
        setUser(updatedUser);
        setShowAddressForm(false);
        // Reset form
        setNewAddress({
            id: '',
            label: 'Nhà riêng',
            recipientName: user.name,
            phoneNumber: user.phoneNumber || '',
            city: user.city || '',
            addressLine: '',
            isDefault: false
        });
    };

    const initiateDeleteAddress = (id: string) => {
        setAddressToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteAddress = async () => {
        if(!user || !user.addresses || !addressToDelete) return;

        const updatedAddresses = user.addresses.filter(a => a.id !== addressToDelete);
        const updatedUser = { ...user, addresses: updatedAddresses };
        
        try {
            await AuthService.updateProfile(updatedUser);
            setUser(updatedUser);
            setShowDeleteModal(false);
            setAddressToDelete(null);
        } catch (error) {
            alert("Có lỗi xảy ra khi xóa địa chỉ.");
        }
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <img 
                                    src={isEditing ? formData.avatar : user.avatar} 
                                    alt={user.name} 
                                    className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md object-cover" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-1">{user.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên thân thiết'}</p>
                            
                            <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-2">
                                <button 
                                    onClick={() => setActiveTab('INFO')}
                                    className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'INFO' ? 'bg-nintendo-red text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Thông tin tài khoản
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ADDRESS')}
                                    className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'ADDRESS' ? 'bg-nintendo-red text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Sổ địa chỉ
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ORDERS')}
                                    className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'ORDERS' ? 'bg-nintendo-red text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Lịch sử đơn hàng
                                </button>
                                {user.role === 'ADMIN' && (
                                     <button 
                                        onClick={() => navigate('/admin')}
                                        className="w-full py-2 px-4 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Vào trang quản trị
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
                            
                            {activeTab === 'INFO' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
                                        {!isEditing && (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="text-nintendo-red font-bold text-sm hover:underline"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Họ tên</label>
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Số điện thoại</label>
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Ngày sinh</label>
                                                    <input 
                                                        type="date" 
                                                        className={inputClass}
                                                        value={formData.dob}
                                                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Tỉnh/Thành phố (Mặc định)</label>
                                                    <select
                                                        className={inputClass}
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                    >
                                                        <option value="">Chọn nơi sống</option>
                                                        {VN_CITIES.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <label className={labelClass}>Email (Không thể thay đổi)</label>
                                                    <input 
                                                        type="email" 
                                                        disabled
                                                        className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200`}
                                                        value={user.email || ''}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button type="submit" className="bg-nintendo-red text-white font-bold px-6 py-3 rounded-xl hover:bg-nintendo-dark transition-colors shadow-lg">Lưu thay đổi</button>
                                                <button type="button" onClick={() => { setIsEditing(false); setFormData({...formData, avatar: user.avatar || ''}); }} className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Họ tên</p>
                                                <p className="text-lg font-medium text-gray-900">{user.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email</p>
                                                <p className="text-lg font-medium text-gray-900">{user.email || 'Chưa cập nhật'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Số điện thoại</p>
                                                <p className="text-lg font-medium text-gray-900">{user.phoneNumber || 'Chưa cập nhật'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Khu vực</p>
                                                <p className="text-lg font-medium text-gray-900">{user.city || 'Chưa cập nhật'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Ngày sinh</p>
                                                <p className="text-lg font-medium text-gray-900">{user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Ngày tham gia</p>
                                                <p className="text-lg font-medium text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ADDRESS' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Sổ Địa Chỉ</h3>
                                        <button 
                                            onClick={() => setShowAddressForm(true)}
                                            className="bg-gray-900 text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-black transition-colors shadow-lg"
                                        >
                                            + Thêm địa chỉ mới
                                        </button>
                                    </div>
                                    
                                    {showAddressForm && (
                                        <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 animate-fade-in-up">
                                            <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                                <span className="material-icons-round text-nintendo-red">add_location</span> 
                                                Thêm địa chỉ giao hàng
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                 <div>
                                                    <label className={labelClass}>Tên gợi nhớ</label>
                                                    <input required type="text" className={inputClass} placeholder="VD: Nhà riêng, Công ty..." value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
                                                 </div>
                                                 <div>
                                                    <label className={labelClass}>Tên người nhận</label>
                                                    <input required type="text" className={inputClass} value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} />
                                                 </div>
                                                 <div>
                                                    <label className={labelClass}>Số điện thoại</label>
                                                    <input required type="text" className={inputClass} value={newAddress.phoneNumber} onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})} />
                                                 </div>
                                                 <div>
                                                    <label className={labelClass}>Tỉnh/Thành phố</label>
                                                    <select className={inputClass} value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}>
                                                        <option value="">Chọn...</option>
                                                        {VN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                 </div>
                                                 <div className="col-span-1 md:col-span-2">
                                                    <label className={labelClass}>Địa chỉ cụ thể</label>
                                                    <input required type="text" className={inputClass} placeholder="Số nhà, tên đường, phường/xã..." value={newAddress.addressLine} onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})} />
                                                 </div>
                                                 <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
                                                     <input type="checkbox" id="defaultAddr" className="w-5 h-5 text-nintendo-red rounded focus:ring-nintendo-red" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} />
                                                     <label htmlFor="defaultAddr" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Đặt làm địa chỉ mặc định cho các đơn hàng sau</label>
                                                 </div>
                                            </div>
                                            <div className="flex gap-4 mt-6">
                                                <button type="submit" className="bg-nintendo-red text-white font-bold px-6 py-3 rounded-xl hover:bg-nintendo-dark transition-colors shadow-lg">Lưu Địa Chỉ</button>
                                                <button type="button" onClick={() => setShowAddressForm(false)} className="bg-white text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-300">Hủy</button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="grid gap-4">
                                        {user.addresses && user.addresses.length > 0 ? (
                                            user.addresses.map(addr => (
                                                <div key={addr.id} className="border border-gray-200 rounded-2xl p-5 flex justify-between items-start hover:shadow-md transition-shadow bg-white group">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="font-bold text-gray-900 text-lg">{addr.label}</span>
                                                            {addr.isDefault && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Mặc định</span>}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <span className="material-icons-round text-gray-400 text-sm">person</span>
                                                            {addr.recipientName} 
                                                            <span className="text-gray-300">|</span> 
                                                            <span className="material-icons-round text-gray-400 text-sm">phone</span>
                                                            {addr.phoneNumber}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                                                            <span className="material-icons-round text-gray-400 text-sm mt-0.5">location_on</span>
                                                            <span>{addr.addressLine}, {addr.city}</span>
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => initiateDeleteAddress(addr.id)} 
                                                        className="text-gray-300 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Xóa địa chỉ này"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                                <span className="material-icons-round text-4xl mb-2 text-gray-300">location_off</span>
                                                <p>Chưa có địa chỉ nào được lưu.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ORDERS' && (
                                <div>
                                     <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h3>
                                     {orders.length === 0 ? (
                                         <div className="text-center py-10">
                                             <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                             </div>
                                             <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                                             <button onClick={() => navigate('/shop')} className="mt-4 text-nintendo-red font-bold hover:underline">Mua sắm ngay</button>
                                         </div>
                                     ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                                                        <div>
                                                            <span className="font-bold text-gray-900 mr-2">#{order.id}</span>
                                                            <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                                            order.orderStatus === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                                                            order.orderStatus === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex gap-3 items-center">
                                                                <img src={item.product.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-gray-100" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.title}</p>
                                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                                </div>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Tổng tiền</span>
                                                        <span className="text-lg font-black text-nintendo-red">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                            <span className="material-icons-round text-2xl">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Xóa địa chỉ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không? Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="flex-1 px-4 py-3 rounded-xl text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={confirmDeleteAddress} 
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
