import React from 'react';
import { User } from '../../types';

interface CustomerManagerProps {
  users: User[];
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ users }) => {
  return (
      <div className="space-y-4 animate-fade-in-up">
           <h3 className="font-bold text-gray-800">Danh Sách Khách Hàng</h3>
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Khách hàng</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Thông tin liên hệ</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Vai trò</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Khu vực</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Ngày đăng ký</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                                        <div className="font-bold text-gray-900">{u.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{u.email || '--'}</div>
                                        <div className="text-xs text-gray-500">{u.phoneNumber || '--'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-800'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{u.city || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '--'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
      </div>
  );
};

export default CustomerManager;