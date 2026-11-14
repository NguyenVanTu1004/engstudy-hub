import React, { useState, useEffect } from 'react';
import { Search, UserMinus, Shield, ShieldAlert, Check, Ban, Lock, Unlock, Key, Trash2, RefreshCw, Users } from 'lucide-react';
import { MockUser } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  users: MockUser[];
  onRefreshUsers: () => void;
}

export default function AdminPanel({ users = [], onRefreshUsers }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto fetch latest users on mount
  useEffect(() => {
    onRefreshUsers();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.resolve(onRefreshUsers());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Search filter with safe fallback
  const filteredUsers = (users || []).filter(u =>
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lock or unlock account
  const toggleLockUser = async (userId: number, currentActive: boolean) => {
    if (userId === 1) {
      alert('Không thể khóa tài khoản quản trị viên hệ thống tối cao (Super Admin)!');
      return;
    }
    
    try {
      const data = await api.put(`/api/users/${userId}`, { isActive: !currentActive }, true);
      if (data.success) {
        setAdminSuccess(currentActive ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
        onRefreshUsers();
        setTimeout(() => setAdminSuccess(''), 2000);
      } else {
        setAdminError(data.message || 'Lỗi cập nhật tài khoản!');
        setTimeout(() => setAdminError(''), 3000);
      }
    } catch (err: any) {
      setAdminError('Lỗi cập nhật tài khoản: ' + err.message);
      setTimeout(() => setAdminError(''), 3000);
    }
  };

  // Change user Role
  const toggleRole = async (userId: number, currentRole: string) => {
    if (userId === 1) {
      alert('Không thể hạ cấp tài khoản quản trị viên tối cao (Super Admin)!');
      return;
    }

    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    
    try {
      const data = await api.put(`/api/users/${userId}`, { role: nextRole }, true);
      if (data.success) {
        setAdminSuccess(`Đã thay đổi vai trò người dùng thành ${nextRole}!`);
        onRefreshUsers();
        setTimeout(() => setAdminSuccess(''), 2000);
      } else {
        setAdminError(data.message || 'Lỗi cập nhật vai trò!');
        setTimeout(() => setAdminError(''), 3000);
      }
    } catch (err: any) {
      setAdminError('Lỗi cập nhật vai trò: ' + err.message);
      setTimeout(() => setAdminError(''), 3000);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number, username: string) => {
    if (userId === 1) {
      alert('Không thể xóa tài khoản Super Admin!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${username}?`)) {
      return;
    }

    try {
      const data = await api.delete(`/api/users/${userId}`, true);
      if (data.success) {
        setAdminSuccess(`Đã xóa tài khoản @${username} thành công!`);
        onRefreshUsers();
        setTimeout(() => setAdminSuccess(''), 2000);
      } else {
        setAdminError(data.message || 'Lỗi xóa tài khoản!');
        setTimeout(() => setAdminError(''), 3000);
      }
    } catch (err: any) {
      setAdminError('Lỗi xóa tài khoản: ' + err.message);
      setTimeout(() => setAdminError(''), 3000);
    }
  };

  return (
    <div id="admin-panel-container" className="space-y-6">
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-xl font-bold text-slate-800">Quản Trị Người Dùng</h3>
        <p className="text-xs text-slate-500">
          Tìm kiếm thành viên, thay đổi quyền hạn hoặc tạm khóa quyền truy cập hệ thống khi phát hiện vi phạm.
        </p>
      </div>

      {adminSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium text-center">
          {adminSuccess}
        </div>
      )}
      {adminError && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 font-medium text-center">
          {adminError}
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thành viên theo tên, email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold">
          <span>Tổng cộng: {filteredUsers.length} thành viên</span>
          <button
            onClick={handleManualRefresh}
            className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition active:scale-95"
            title="Làm mới danh sách từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users List Table or Empty State */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Chưa có thành viên nào hoặc không tìm thấy kết quả phù hợp</p>
          <p className="text-xs text-slate-400">Nhấp nút bên dưới để tải danh sách thành viên mới nhất từ hệ thống.</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 inline-flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Tải lại danh sách</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Quyền hạn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-100">
                          <img src={user.avatar} alt={user.fullName} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName}</p>
                          <p className="text-[10px] text-slate-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        user.role === 'ADMIN'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center text-[9px] font-extrabold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-extrabold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full uppercase">
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Lock toggle button */}
                      <button
                        onClick={() => toggleLockUser(user.id, user.isActive)}
                        className={`p-1.5 rounded-lg border transition ${
                          user.isActive
                            ? 'border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'border-rose-100 text-rose-600 bg-rose-50 hover:bg-rose-100'
                        }`}
                        title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                      >
                        {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Change role button */}
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className="p-1.5 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Đổi quyền hạn"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete user button */}
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-1.5 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
