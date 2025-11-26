import React from 'react';
import { Order, Product, User, StockImport, OrderStatus } from '../../types';

interface DashboardStatsProps {
  orders: Order[];
  products: Product[];
  users: User[];
  stockImports: StockImport[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ orders, products, users, stockImports }) => {
  
  const getAgeDistribution = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const groups = { 'Dưới 18': 0, '18 - 24': 0, '25 - 34': 0, 'Trên 35': 0, 'Chưa rõ': 0 };
    let total = 0;
    
    users.forEach(u => {
        if (u.role === 'ADMIN') return;
        total++;
        if (!u.dob) { groups['Chưa rõ']++; return; }
        const age = currentYear - new Date(u.dob).getFullYear();
        if (age < 18) groups['Dưới 18']++;
        else if (age <= 24) groups['18 - 24']++;
        else if (age <= 34) groups['25 - 34']++;
        else groups['Trên 35']++;
    });
    
    return Object.entries(groups).map(([label, count]) => ({
        label, count, percent: total === 0 ? 0 : Math.round((count / total) * 100)
    }));
  };

  const getCityDistribution = () => {
    const cityCounts: Record<string, number> = {};
    let total = 0;
    users.forEach(u => {
        if (u.role === 'ADMIN') return;
        total++;
        const city = u.city || 'Chưa rõ';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([label, count]) => ({
            label, count, percent: total === 0 ? 0 : Math.round((count / total) * 100)
        }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orders.reduce((acc, o) => acc + o.totalAmount, 0))}
              </p>
              <span className="text-green-500 text-xs font-bold mt-2 inline-flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span> Tăng trưởng tốt
              </span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đơn Hàng</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">{orders.length}</p>
              <div className="flex gap-2 mt-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                      {orders.filter(o => o.orderStatus === OrderStatus.PROCESSING).length} Chờ xử lý
                  </span>
              </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng Tồn Kho</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {products.reduce((acc, p) => acc + p.stock, 0)} <span className="text-base font-normal text-gray-500">sản phẩm</span>
              </p>
          </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
          {/* Customer Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <span className="material-icons-round text-blue-500">pie_chart</span>
                   Phân tích Khách Hàng
              </h3>
              <div className="space-y-6">
                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Tỷ lệ theo độ tuổi</h4>
                      <div className="space-y-3">
                          {getAgeDistribution().map((stat, idx) => (
                              <div key={idx}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-700 font-medium">{stat.label}</span>
                                      <span className="text-gray-500">{stat.percent}% ({stat.count})</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${stat.percent}%` }}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                   <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Khu vực sinh sống (Top 5)</h4>
                      <div className="space-y-3">
                          {getCityDistribution().map((stat, idx) => (
                              <div key={idx}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-700 font-medium">{stat.label}</span>
                                      <span className="text-gray-500">{stat.percent}% ({stat.count})</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div className="bg-nintendo-red h-2.5 rounded-full" style={{ width: `${stat.percent}%` }}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
           {/* Import History */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
               <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <span className="material-icons-round text-green-600">history</span>
                   Lịch sử Nhập hàng
               </h3>
               <div className="flex-grow overflow-auto">
                   {stockImports.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">Chưa có lịch sử.</div> : (
                       <table className="w-full text-left text-sm">
                           <thead className="bg-gray-50">
                               <tr>
                                   <th className="px-4 py-2 text-gray-500 font-medium">Sản phẩm</th>
                                   <th className="px-4 py-2 text-gray-500 font-medium">SL</th>
                                   <th className="px-4 py-2 text-gray-500 font-medium">Thời gian</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {stockImports.slice(0, 8).map(imp => {
                                   const prod = products.find(p => p.id === imp.productId);
                                   return (
                                       <tr key={imp.id}>
                                           <td className="px-4 py-3"><p className="font-bold text-gray-800 line-clamp-1">{prod?.title || 'Unknown'}</p></td>
                                           <td className="px-4 py-3 font-bold text-green-600">+{imp.quantity}</td>
                                           <td className="px-4 py-3 text-xs text-gray-500">{new Date(imp.timestamp).toLocaleDateString('vi-VN')}</td>
                                       </tr>
                                   );
                               })}
                           </tbody>
                       </table>
                   )}
               </div>
           </div>
      </div>
    </div>
  );
};

export default DashboardStats;