
import React, { useState } from 'react';
import { Order, Product, User, StockImport, OrderStatus, PaymentStatus } from '../../types';

interface DashboardStatsProps {
  orders: Order[];
  products: Product[];
  users: User[];
  stockImports: StockImport[];
}

type TimeFrame = 'WEEK' | 'MONTH' | 'YEAR';

const DashboardStats: React.FC<DashboardStatsProps> = ({ orders, products, users, stockImports }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('MONTH');

  // --- Helper Functions ---

  const getStartOfPeriod = (date: Date, type: TimeFrame, offset: number = 0): Date => {
      const d = new Date(date);
      if (type === 'WEEK') {
          // Adjust to previous week if offset > 0
          d.setDate(d.getDate() - (d.getDay() || 7) + 1 - (offset * 7)); 
          d.setHours(0,0,0,0);
      } else if (type === 'MONTH') {
          d.setMonth(d.getMonth() - offset);
          d.setDate(1);
          d.setHours(0,0,0,0);
      } else { // YEAR
          d.setFullYear(d.getFullYear() - offset);
          d.setMonth(0);
          d.setDate(1);
          d.setHours(0,0,0,0);
      }
      return d;
  };

  const getEndOfPeriod = (date: Date, type: TimeFrame, offset: number = 0): Date => {
      const d = new Date(date);
      if (type === 'WEEK') {
          d.setDate(d.getDate() - (d.getDay() || 7) + 7 - (offset * 7));
          d.setHours(23,59,59,999);
      } else if (type === 'MONTH') {
          d.setMonth(d.getMonth() - offset + 1);
          d.setDate(0); // Last day of previous month
          d.setHours(23,59,59,999);
      } else {
          d.setFullYear(d.getFullYear() - offset + 1);
          d.setMonth(0);
          d.setDate(0);
          d.setHours(23,59,59,999);
      }
      return d;
  };

  const filterOrdersByTime = (offset: number = 0) => {
      const now = new Date();
      const start = getStartOfPeriod(now, timeFrame, offset);
      const end = getEndOfPeriod(now, timeFrame, offset);
      
      return orders.filter(o => {
          const d = new Date(o.createdAt);
          return d >= start && d <= end && o.orderStatus !== OrderStatus.CANCELLED;
      });
  };

  // --- Statistics Logic ---

  const currentOrders = filterOrdersByTime(0);
  const previousOrders = filterOrdersByTime(1);

  const revenueCurrent = currentOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const revenuePrev = previousOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  // Calculate Profit = Revenue - (Cost Price of sold items)
  // Note: For cancelled orders, we exclude them.
  // We approximate using the CURRENT product costPrice. In a real system, we'd use historical cost.
  const calculateCost = (orderList: Order[]) => {
      let totalCost = 0;
      orderList.forEach(order => {
          order.items.forEach(item => {
              // Find current product to get latest cost price
              const prod = products.find(p => p.id === item.productId);
              if (prod && prod.costPrice) {
                  totalCost += prod.costPrice * item.quantity;
              } else if (prod) {
                  // Fallback if no cost price set: assume 70% of sell price
                  totalCost += (prod.price * 0.7) * item.quantity;
              }
          });
      });
      return totalCost;
  };

  const costCurrent = calculateCost(currentOrders);
  const profitCurrent = revenueCurrent - costCurrent;
  
  const growthPercent = revenuePrev > 0 
      ? Math.round(((revenueCurrent - revenuePrev) / revenuePrev) * 100) 
      : (revenueCurrent > 0 ? 100 : 0);

  // --- Demographics Logic ---

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
      {/* Time Filter Tabs */}
      <div className="flex bg-gray-200 p-1 rounded-xl w-fit">
          <button onClick={() => setTimeFrame('WEEK')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFrame === 'WEEK' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Theo Tuần</button>
          <button onClick={() => setTimeFrame('MONTH')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFrame === 'MONTH' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Theo Tháng</button>
          <button onClick={() => setTimeFrame('YEAR')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFrame === 'YEAR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Theo Năm</button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-icons-round text-6xl text-nintendo-red">payments</span>
              </div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Doanh Thu ({timeFrame === 'WEEK' ? 'Tuần này' : timeFrame === 'MONTH' ? 'Tháng này' : 'Năm nay'})</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueCurrent)}
              </p>
              <div className={`text-xs font-bold mt-2 inline-flex items-center gap-1 ${growthPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="material-icons-round text-sm">{growthPercent >= 0 ? 'trending_up' : 'trending_down'}</span> 
                  {growthPercent > 0 ? '+' : ''}{growthPercent}% 
                  <span className="text-gray-400 font-normal ml-1">so với kỳ trước</span>
              </div>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
               <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-icons-round text-6xl text-green-600">savings</span>
              </div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lợi Nhuận Ước Tính</h3>
              <p className="text-3xl font-black text-green-600 mt-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitCurrent)}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                  Doanh thu - Giá vốn hàng bán
              </div>
          </div>

          {/* Orders Count */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-icons-round text-6xl text-blue-500">shopping_bag</span>
              </div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đơn Hàng Mới</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">{currentOrders.length}</p>
              <div className="flex gap-2 mt-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                      {currentOrders.filter(o => o.orderStatus === OrderStatus.PROCESSING).length} Chờ xử lý
                  </span>
              </div>
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
               <div className="flex-grow overflow-auto max-h-[400px]">
                   {stockImports.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">Chưa có lịch sử.</div> : (
                       <table className="w-full text-left text-sm">
                           <thead className="bg-gray-50 sticky top-0">
                               <tr>
                                   <th className="px-4 py-2 text-gray-500 font-medium">Sản phẩm</th>
                                   <th className="px-4 py-2 text-gray-500 font-medium">Chi phí</th>
                                   <th className="px-4 py-2 text-gray-500 font-medium">Thời gian</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {stockImports.slice(0, 15).map(imp => {
                                   const prod = products.find(p => p.id === imp.productId);
                                   return (
                                       <tr key={imp.id}>
                                           <td className="px-4 py-3">
                                               <p className="font-bold text-gray-800 line-clamp-1">{prod?.title || 'Unknown'}</p>
                                               <p className="text-xs text-green-600 font-bold">+{imp.quantity} sp</p>
                                           </td>
                                           <td className="px-4 py-3">
                                               <div className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(imp.totalCost)}</div>
                                               <div className="text-[10px] text-gray-500">Giá nhập: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(imp.importPrice)}</div>
                                           </td>
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
