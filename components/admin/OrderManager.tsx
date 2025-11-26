import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { StorageService } from '../../services/storage';

interface OrderManagerProps {
  orders: Order[];
  refreshData: () => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ orders, refreshData }) => {
  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
      StorageService.updateOrderStatus(orderId, status);
      refreshData();
  };

  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
           <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-700">Mã Đơn</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Khách Hàng</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Tổng Tiền</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Thanh toán</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Trạng Thái</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.id}</td>
                                <td className="px-6 py-4"><div className="font-bold text-gray-900">{order.customerName}</div></td>
                                <td className="px-6 py-4 font-bold text-nintendo-red">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</td>
                                <td className="px-6 py-4 text-xs">
                                    <span className="block font-bold text-gray-700">{order.paymentMethod}</span>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${order.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${order.orderStatus === OrderStatus.DELIVERED ? 'bg-green-50 text-green-600 border-green-200' : order.orderStatus === OrderStatus.CANCELLED ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{order.orderStatus}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-nintendo-red text-xs font-bold shadow-sm cursor-pointer hover:border-gray-400"
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    >
                                        <option value={OrderStatus.PROCESSING}>Đang xử lý</option>
                                        <option value={OrderStatus.SHIPPED}>Đã gửi hàng</option>
                                        <option value={OrderStatus.DELIVERED}>Đã giao</option>
                                        <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
  );
};

export default OrderManager;