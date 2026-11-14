import React, { useState, useRef } from 'react';
import { UserProfile, ExamResult } from '../types';
import { 
  User, Mail, Award, Clock, FileCheck, CheckCircle, Calendar, 
  ShieldCheck, Camera, Upload, Sparkles, Check, AlertCircle, 
  Flame, BookOpen, Star, RefreshCw, Smartphone, Laptop
} from 'lucide-react';

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => Promise<any> | void;
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

export default function ProfileSection({ profile, onUpdateProfile }: ProfileSectionProps) {
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || DEFAULT_AVATAR);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload from Desktop or Phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!' });
      return;
    }

    // Limit original file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: 'Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 10MB)!' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize to 300x300 canvas for fast rendering and minimal storage
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
          setFeedbackMsg({ type: 'success', text: 'Tải ảnh đại diện thành công! Nhấn "Lưu thay đổi" để áp dụng.' });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Tên đăng nhập không được để trống!' });
      return;
    }
    if (username.trim().length < 3) {
      setFeedbackMsg({ type: 'error', text: 'Tên đăng nhập phải có ít nhất 3 ký tự!' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        username: username.trim().toLowerCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        avatar: avatarUrl
      };

      await Promise.resolve(onUpdateProfile(updatedProfile));
      setIsEditing(false);
      setFeedbackMsg({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi cập nhật thông tin tài khoản!' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-section-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Notification */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold shadow-sm transition-all duration-300 animate-fadeIn ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{feedbackMsg.text}</span>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 text-sm px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card & Edit Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
            {/* Background Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-90"></div>

            <div className="relative pt-6 text-center space-y-4">
              {/* Avatar with Upload Trigger */}
              <div className="relative inline-block mx-auto">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 mx-auto group">
                  <img
                    src={avatarUrl || DEFAULT_AVATAR}
                    alt={fullName}
                    className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                </div>

                {/* Camera / Upload Action Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white rounded-full shadow-lg border-2 border-white transition flex items-center justify-center cursor-pointer"
                  title="Tải ảnh lên từ máy tính hoặc điện thoại"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Hidden File Input (supports desktop file dialog & mobile photo camera / gallery) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{fullName || 'Chưa đặt tên'}</h3>
                <p className="text-xs font-semibold text-indigo-600 font-mono mt-0.5">@{username}</p>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{profile.role} ACCOUNT</span>
                </div>
              </div>

              {/* Quick Upload Indicator for Mobile/Desktop */}
              <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Máy tính</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Điện thoại</span>
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Đổi ảnh đại diện
                </button>
              </div>
            </div>

            {/* View or Edit Information */}
            {!isEditing ? (
              <div className="space-y-4 pt-6 mt-6 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <User className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Tên đăng nhập (Username)</p>
                      <p className="font-bold text-slate-800 font-mono text-xs">@{username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Họ và tên hiển thị</p>
                      <p className="font-bold text-slate-800">{fullName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Địa chỉ Email</p>
                      <p className="font-bold text-slate-800">{email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-2xl text-center transition shadow-lg shadow-indigo-200 text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Chỉnh sửa thông tin cá nhân</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 pt-6 mt-6 border-t border-slate-100 text-xs">
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Tên đăng nhập (Username)</span>
                    <span className="text-[10px] font-normal text-slate-400">Dùng để đăng nhập hệ thống</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono font-bold">@</span>
                    <input
                      type="text"
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono font-semibold"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                      placeholder="ten_dang_nhap"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Họ và tên hiển thị</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Địa chỉ Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                  />
                </div>

                {/* Avatar Options */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Chọn Avatar gợi ý hoặc tải lên từ thiết bị</span>
                  </label>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_AVATARS.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(sug)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                          avatarUrl === sug ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={sug} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tải ảnh lên...</span>
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setUsername(profile.username);
                      setFullName(profile.fullName);
                      setEmail(profile.email);
                      setAvatarUrl(profile.avatar);
                      setIsEditing(false);
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-center transition shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Learning Performance & Exam History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Highlight Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center space-x-2 text-indigo-600">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Từ đã học</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{profile.learnedWordsCount || 0}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Tiến độ tích lũy</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center space-x-2 text-amber-500">
                <FileCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bài đã nộp</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{profile.completedTestsCount || (profile.history?.length || 0)}</p>
              <p className="text-[10px] text-amber-600 font-medium">Đề luyện thi</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center space-x-2 text-emerald-500">
                <Star className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Điểm TB</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{profile.averageScore || 0}%</p>
              <p className="text-[10px] text-emerald-600 font-medium">Hiệu suất làm bài</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center space-x-2 text-rose-500">
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chuỗi học</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{profile.studyProgress?.length || 1} ngày</p>
              <p className="text-[10px] text-rose-600 font-medium">Kiên trì mỗi ngày</p>
            </div>
          </div>

          {/* Practice & Exam History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Lịch sử làm bài thi & luyện đề</h3>
                <p className="text-xs text-slate-400 mt-0.5">Lưu trữ kết quả, thời gian làm bài và số câu đúng chi tiết</p>
              </div>
              <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold font-mono">
                {profile.history?.length || 0} bài đã làm
              </span>
            </div>

            {(!profile.history || profile.history.length === 0) ? (
              <div className="text-center py-14 border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Bạn chưa có bài thi thử nào!</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Hãy vào mục "Luyện Đề" hoặc "Kiểm Tra" để thử sức với đề thi TOEIC, IELTS chuẩn format.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Đề thi</th>
                      <th className="py-3 px-3">Thời gian</th>
                      <th className="py-3 px-3 text-center">Đúng/Tổng</th>
                      <th className="py-3 px-3 text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {profile.history.map((result, idx) => (
                      <tr key={result.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-2.5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              result.category === 'IELTS'
                                ? 'bg-purple-100 text-purple-700'
                                : result.category === 'TOEIC'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {result.category || 'General'}
                            </span>
                            <span className="font-bold text-slate-800">{result.examTitle}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                          {result.date || result.createdAt || 'Gần đây'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            {result.correctAnswers} / {result.totalQuestions}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`inline-flex items-center space-x-1 font-black px-2.5 py-1 rounded-full text-xs ${
                            result.score >= 80 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : result.score >= 50
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            <span>{result.score}%</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
