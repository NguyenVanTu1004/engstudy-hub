import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  X, 
  BookMarked, 
  Calendar, 
  Tag, 
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description?: string;
  content: string;
  category: string;
  downloadUrl?: string;
  createdAt: string;
}

interface DocumentSectionProps {
  profile: UserProfile;
}

export default function DocumentSection({ profile }: DocumentSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Reader detail modal
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  // Admin Publish Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('TOEIC');
  const [newContent, setNewContent] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');

  const isAdmin = profile.role === 'ADMIN';

  // Fetch documents
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setErrorMsg(data.message || 'Lỗi tải danh sách tài liệu.');
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Handle document submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      setErrorMsg('Vui lòng điền đầy đủ tiêu đề và nội dung tài liệu!');
      return;
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          content: newContent,
          downloadUrl: newDownloadUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Đăng tài liệu thành công!');
        setNewTitle('');
        setNewDescription('');
        setNewContent('');
        setNewDownloadUrl('');
        setShowAddForm(false);
        fetchDocs();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Không thể đăng tài liệu.');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi đăng tài liệu: ' + err.message);
    }
  };

  // Handle document deletion
  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${title}" không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Đã xóa tài liệu thành công!');
        fetchDocs();
        if (viewingDoc?.id === id) {
          setViewingDoc(null);
        }
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Lỗi khi xóa tài liệu.');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi xóa tài liệu: ' + err.message);
    }
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'TOEIC', 'IELTS', 'Vocabulary', 'Pronunciation', 'General'];

  return (
    <div id="document-section-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 translate-x-10 -translate-y-10">
          <BookOpen className="w-80 h-80 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            Tài Nguyên Học Tập Miễn Phí
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Kho Tài Liệu Học Tiếng Anh Chuyên Sâu
          </h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
            Tải về và nghiên cứu kho cẩm nang, tài liệu ôn tập TOEIC, IELTS, phát âm chuẩn IPA cùng các giáo trình độc quyền do ban quản trị biên soạn.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2 animate-fadeIn">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center space-x-2 animate-fadeIn">
          <span className="w-2 h-2 bg-rose-500 rounded-full" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Action bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Tìm kiếm tài liệu học tập..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 self-end md:self-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'All' ? 'Tất cả' : cat}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ml-2 flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-extrabold hover:bg-emerald-700 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Tài Liệu</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Document Admin Panel */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-slideDown">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Đăng tải giáo trình học tập mới (MySQL Sync)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề tài liệu *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ví dụ: Tài liệu ngữ pháp 12 thì tiếng Anh cốt lõi"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Phân loại (Category) *</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                <option value="TOEIC">TOEIC</option>
                <option value="IELTS">IELTS</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Pronunciation">Pronunciation</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Mô tả ngắn về tài liệu</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Nhập tóm tắt mô tả về bộ giáo trình này..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nội dung chi tiết tài liệu (Hỗ trợ Markdown) *</label>
            <textarea
              required
              rows={8}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="Nhập nội dung bài giảng, danh sách từ vựng, mẹo ôn luyện hay cấu trúc bài học chi tiết..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Đường dẫn tải xuống (PDF / Drive Link) - Không bắt buộc</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="https://drive.google.com/..."
              value={newDownloadUrl}
              onChange={e => setNewDownloadUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
            >
              Đăng Tài Liệu Lên Hệ Thống
            </button>
          </div>
        </form>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Đang tải tài liệu học tập...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-700 text-sm">Không tìm thấy tài liệu học tập nào</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chuyển phân loại tài liệu phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden hover:border-slate-300 hover:shadow-md transition">
              
              {/* Card top */}
              <div className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    doc.category === 'TOEIC' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    doc.category === 'IELTS' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    doc.category === 'Pronunciation' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {doc.category}
                  </span>
                  
                  <div className="flex items-center text-[10px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {doc.createdAt}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-tight leading-snug line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {doc.description || "Tài liệu học tập chuyên sâu được biên soạn cẩn thận hỗ trợ học viên đạt kết quả tốt nhất."}
                  </p>
                </div>
              </div>

              {/* Card actions bottom */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold active:scale-95 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Đọc Chi Tiết</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition"
                      title="Tải về file PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-lg transition"
                      title="Xóa tài liệu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal / Slide-over detail viewing */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div className="space-y-1.5 max-w-[90%]">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
                  {viewingDoc.category}
                </span>
                <h3 className="font-extrabold text-slate-800 text-base md:text-lg tracking-tight leading-snug">
                  {viewingDoc.title}
                </h3>
                <div className="flex items-center text-[10px] text-slate-400 font-semibold space-x-3 pt-1">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Đăng ngày: {viewingDoc.createdAt}
                  </span>
                  <span>|</span>
                  <span className="text-slate-500">Giáo trình ban quản trị</span>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Article Reading Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {viewingDoc.description && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs text-indigo-900 leading-relaxed italic font-medium">
                  {viewingDoc.description}
                </div>
              )}

              {/* Styled Document Content body */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans whitespace-pre-wrap select-text markdown-content">
                {viewingDoc.content}
              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold font-mono">ENGStudy Hub Reader v1.0</span>
              
              <div className="flex space-x-2">
                {viewingDoc.downloadUrl && (
                  <a
                    href={viewingDoc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Về PDF (Tài liệu)</span>
                  </a>
                )}
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition"
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
