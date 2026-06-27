import React, { useState } from 'react';
import { UserProfile, ExamResult } from '../types';
import { User, Mail, Award, Clock, FileCheck, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury';

export default function ProfileSection({ profile, onUpdateProfile }: ProfileSectionProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName,
      email,
      avatar: avatarUrl
    });
    setIsEditing(false);
  };

  return (
    <div id="profile-section-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Avatar & Metadata */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-indigo-100">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">{profile.fullName}</h3>
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold uppercase tracking-wider">{profile.role} ACCOUNT</span>
            </div>
          </div>
        </div>

        {/* Bio Edit Form */}
        {!isEditing ? (
          <div className="space-y-4 pt-4 border-t border-slate-50 text-xs">
            <div className="flex items-center space-x-3 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="font-bold text-slate-800">{profile.fullName}</p>
                <p className="text-[10px] text-slate-400">Họ và tên</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="font-bold text-slate-800">{profile.email}</p>
                <p className="text-[10px] text-slate-400">Hòm thư email</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-center transition text-xs"
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-50 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Họ và tên</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Địa chỉ Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Đường dẫn ảnh đại diện (Avatar URL)</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                required
                placeholder="Nhập link ảnh avatar..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-center transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-center transition"
              >
                Lưu
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right side: Practice history list */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Lịch sử làm bài thi & luyện đề</h3>
          <p className="text-[10px] text-slate-400">Lưu vết kết quả, số câu đúng và tốc độ hoàn thành đề thi tiếng Anh</p>
        </div>

        {profile.history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl">
            <p className="text-xs text-slate-400">Bạn chưa thực hiện bài thi thử nào. Hãy chọn mục Luyện Đề để bắt đầu!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5">Đề thi</th>
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5 text-center">Đúng/Tổng</th>
                  <th className="py-2.5 text-right">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {profile.history.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                          {result.category}
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{result.examTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400 font-mono">{result.timeSpent}</td>
                    <td className="py-3 text-center font-mono">
                      {result.correctAnswers} / {result.totalQuestions}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-black ${
                        result.score >= 80 ? 'text-emerald-600' :
                        result.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {result.score}%
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
  );
}
