import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { api, setAuthToken } from '../services/api';
import { 
  User, Mail, Lock, Moon, Sun, LogOut, Save, Shield, 
  CheckCircle, AlertCircle, Camera, Upload, Smartphone, 
  Laptop, Sparkles, Check, RefreshCw, KeyRound, ShieldCheck
} from 'lucide-react';

interface SettingsSectionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentLang: 'VI' | 'EN' | 'JA';
  onLanguageChange: (lang: 'VI' | 'EN' | 'JA') => void;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury';

const SUGGESTED_AVATARS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Venus',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Earth',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Mars',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Jupiter',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
];

export default function SettingsSection({
  profile,
  onUpdateProfile,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  currentLang,
  onLanguageChange
}: SettingsSectionProps) {
  // Account settings state
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || DEFAULT_AVATAR);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Status notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload from Desktop or Phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 10MB)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize to 320x320 canvas for fast rendering and optimal storage
        const canvas = document.createElement('canvas');
        const MAX_DIM = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setSuccessMsg('Đã chọn ảnh đại diện thành công! Hãy nhấn "Lưu thay đổi" để áp dụng.');
          setErrorMsg('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Tên đăng nhập không được để trống!');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
        return;
      }
    }

    setIsSaving(true);

    try {
      const data = await api.put('/api/auth/profile', {
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        avatar: avatarUrl,
        password: password || undefined
      }, true);
      
      if (data.success) {
        if (data.token) {
          setAuthToken(data.token);
        }
        onUpdateProfile({
          ...profile,
          username: data.user?.username || username.trim(),
          fullName: data.user?.fullName || fullName.trim(),
          email: data.user?.email || email.trim(),
          avatar: data.user?.avatar || avatarUrl
        });
        setSuccessMsg('🎉 Cập nhật hồ sơ và ảnh đại diện thành công!');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Lỗi cập nhật hồ sơ từ máy chủ.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ khi lưu thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="settings-section-container" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Cài Đặt Hệ Thống & Tài Khoản</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              {profile.role?.toUpperCase() || 'USER'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý ảnh đại diện, thông tin cá nhân, tên đăng nhập, bảo mật và giao diện hiển thị.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tài khoản đã bảo vệ</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account & Profile Management (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveAccount} className="space-y-6">
            
            {/* Card 1: Avatar Upload & Photo Picker */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/60 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Ảnh Đại Diện (Profile Avatar)</h3>
                </div>
                <span className="text-[11px] text-slate-400">Hỗ trợ máy tính & điện thoại</span>
              </div>

              {/* Avatar Preview & Upload Action */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-indigo-100 shadow-lg bg-slate-100">
                    <img
                      src={avatarUrl}
                      alt={profile.fullName || 'User Avatar'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition active:scale-95 group-hover:scale-105"
                    title="Tải ảnh mới từ thiết bị"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Tải ảnh đại diện của bạn</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tự động nén tối ưu (320x320 px) giúp tải cực nhanh và tiết kiệm bộ nhớ trên mọi thiết bị.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition active:scale-95 border border-indigo-100"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ Máy tính / Điện thoại</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Avatars Row */}
              <div className="pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Hoặc chọn nhanh từ bộ sưu tập avatar mẫu:
                </span>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                  {SUGGESTED_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 transition-transform ${
                        avatarUrl === url
                          ? 'ring-2 ring-indigo-600 scale-110 shadow-md'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                      {avatarUrl === url && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Account Information Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/60 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Thông Tin Cá Nhân & Đăng Nhập</h3>
                </div>
                <span className="text-[11px] text-slate-400">Có thể chỉnh sửa</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username (Editable) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>TÊN ĐĂNG NHẬP (USERNAME) *</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Dùng khi đăng nhập</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-indigo-500 font-mono">@</span>
                    <input
                      type="text"
                      required
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="ví dụ: vantu1004"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Bạn có thể thay đổi tên đăng nhập bất cứ lúc nào. Tên đăng nhập mới sẽ có hiệu lực ngay lập tức.
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">HỌ VÀ TÊN ĐẦY ĐỦ *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Nguyễn Văn Tứ"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">HÒM THƯ EMAIL (GMAIL) *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Đổi Mật Khẩu (Để trống nếu không đổi)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">MẬT KHẨU MỚI</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">XÁC NHẬN MẬT KHẨU MỚI</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold active:scale-95 transition shadow-lg shadow-indigo-600/20 ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu thay đổi...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Thay Đổi Hồ Sơ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Preferences, Security & Sign out (1 Column) */}
        <div className="space-y-6">
          
          {/* Card: Theme & Display */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/60 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Giao Diện & Cá Nhân Hóa</span>
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Chế độ hiển thị</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Sáng / Tối bảo vệ mắt</p>
              </div>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}>
                  {isDarkMode ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                </div>
              </button>
            </div>
          </div>

          {/* Card: Account Security Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/60 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Bảo Mật Tài Khoản</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Vai trò:</span>
                <span className="font-bold text-slate-800">{profile.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên học tập'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Hoạt động
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Mã định danh:</span>
                <span className="font-mono text-[11px] text-slate-500 font-bold">ID #{profile.id || 9}</span>
              </div>
            </div>
          </div>

          {/* Card: Sign Out */}
          <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-6 shadow-xl shadow-rose-100/60 space-y-4">
            <h3 className="font-extrabold text-sm text-rose-800 flex items-center space-x-2">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Đăng Xuất Tài Khoản</span>
            </h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              Đăng xuất khỏi phiên làm việc hiện tại để bảo mật tài khoản của bạn trên thiết bị này.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center space-x-2 py-3 px-4 w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold active:scale-95 transition shadow-lg shadow-rose-600/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất ngay</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
