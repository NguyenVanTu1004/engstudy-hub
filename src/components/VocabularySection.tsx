import React, { useState } from 'react';
import { Vocabulary } from '../types';
import { TOPICS } from '../data/englishData';
import { Search, Volume2, Star, CheckCircle, Edit, Trash2, Plus, ArrowLeft, Heart, FileSpreadsheet, Database, Download, Copy, Check, Info, RefreshCw } from 'lucide-react';

interface VocabularySectionProps {
  vocabularies: Vocabulary[];
  onUpdateVocab: (updated: Vocabulary[]) => void;
  isAdmin: boolean;
}

export default function VocabularySection({ vocabularies, onUpdateVocab, isAdmin }: VocabularySectionProps) {
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [filterFavorite, setFilterFavorite] = useState(false);

  // MySQL Sync & Integration state
  const [isSqlSyncOpen, setIsSqlSyncOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    mode: string;
    config?: { host: string; port: number; user: string; database: string } | null;
    error?: string | null;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const [showManualSql, setShowManualSql] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        connected: false,
        mode: 'Hệ thống Lưu trữ Dự phòng',
        config: null,
        error: 'Lỗi khi gọi API hệ thống: ' + err.message
      });
    }
  };

  const handleDirectSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Đang chuẩn bị dữ liệu từ vựng...');
    setSyncSuccess(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncMessage('Đang kết nối & truyền tải đến MySQL CSDL...');
   // Làm sạch định dạng toàn bộ mảng từ vựng trước khi nhấn nút Push gửi lên API
const sanitizedVocabularies = vocabularies.map((v: any) => {
  let cleanDate = v.createdAt || v.created_at || new Date().toISOString();
  
  // Nếu chuỗi thời gian còn chứa ký tự T và Z, tiến hành cắt gọt về dạng chuẩn YYYY-MM-DD HH:mm:ss
  if (typeof cleanDate === 'string' && cleanDate.includes('T')) {
    cleanDate = cleanDate.replace('T', ' ').substring(0, 19);
  }
  
  return {
    ...v,
    createdAt: cleanDate,
    created_at: cleanDate // Phòng hờ cấu trúc ở backend bốc một trong hai trường
  };
});

setSyncMessage('Đang kết nối & truyền tải đến MySQL CSDL...');

const res = await fetch('/api/vocabularies/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // 👉 ĐỔI TỪ { vocabularies } THÀNH MẢNG ĐÃ ĐƯỢC LÀM SẠCH:
  body: JSON.stringify({ vocabularies: sanitizedVocabularies }) 
});
      const data = await res.json();
      
      if (data.success) {
        setSyncSuccess(true);
        setSyncMessage(`Đồng bộ hóa thành công toàn bộ ${vocabularies.length} từ vựng vào MySQL Database của hệ thống!`);
        fetchDbStatus();
      } else {
        setSyncSuccess(false);
        setSyncMessage(data.message || 'Lỗi đồng bộ hóa dữ liệu.');
      }
    } catch (err: any) {
      setSyncSuccess(false);
      setSyncMessage('Thất bại: Không thể kết nối với máy chủ API: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    if (isSqlSyncOpen) {
      fetchDbStatus();
    }
  }, [isSqlSyncOpen]);

  // CRUD Admin Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [word, setWord] = useState('');
  const [ipa, setIpa] = useState('');
  const [meaning, setMeaning] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('Noun');
  const [example, setExample] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [image, setImage] = useState('');
  const [topic, setTopic] = useState('TOEIC Office');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Excel Bulk Importer state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importTopic, setImportTopic] = useState('TOEIC Office');
  const [importDifficulty, setImportDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [importPartOfSpeech, setImportPartOfSpeech] = useState('Noun');
  const [parsedWords, setParsedWords] = useState<Partial<Vocabulary>[]>([]);

  const handleParseImport = () => {
    if (!importText.trim()) {
      alert('Vui lòng dán dữ liệu sao chép từ bảng Excel vào ô nhập!');
      return;
    }
    const lines = importText.split('\n');
    const result: Partial<Vocabulary>[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Split by tab character (standard Excel copy-paste)
      let parts = trimmed.split('\t');
      if (parts.length < 2) {
        // Fallback to comma if no tabs are found
        parts = trimmed.split(',');
      }

      if (parts.length > 0 && parts[0].trim()) {
        const wordVal = parts[0].trim();
        const ipaVal = parts[1] ? parts[1].trim() : '';
        const meaningVal = parts[2] ? parts[2].trim() : '';
        const exampleVal = parts[3] ? parts[3].trim() : '';

        let ex = exampleVal;
        let exMeaning = '';
        if (exampleVal.includes('|')) {
          const exParts = exampleVal.split('|');
          ex = exParts[0].trim();
          exMeaning = exParts[1].trim();
        } else if (exampleVal) {
          exMeaning = `Ví dụ của từ ${wordVal}`;
        }

        result.push({
          word: wordVal,
          ipa: ipaVal,
          meaning: meaningVal || 'Chưa dịch nghĩa',
          partOfSpeech: importPartOfSpeech,
          example: ex,
          exampleMeaning: exMeaning || `Ví dụ minh họa cho từ ${wordVal}`,
          topic: importTopic,
          difficulty: importDifficulty,
          image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=60'
        });
      }
    });

    setParsedWords(result);
  };

  const handleSaveImport = () => {
    if (parsedWords.length === 0) {
      alert('Không có từ vựng nào được phân tích thành công!');
      return;
    }

    const newVocabs: Vocabulary[] = parsedWords.map((pw, index) => {
      // Tự động tạo chuỗi thời gian định dạng 'YYYY-MM-DD HH:mm:ss' sạch ký tự T và Z
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const mysqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      return {
        // Chuyển id thành dạng chuỗi hợp lệ để khớp với trường VARCHAR(50) của MySQL
        id: `v_${Date.now()}_${index}`,
        word: pw.word || '',
        ipa: pw.ipa || '',
        meaning: pw.meaning || '',
        partOfSpeech: pw.partOfSpeech || 'Noun',
        example: pw.example || '',
        exampleMeaning: pw.exampleMeaning || '',
        image: pw.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=60',
        topic: pw.topic || 'TOEIC Office',
        difficulty: (pw.difficulty as any) || 'Medium',
        // Đẩy chuỗi ngày tháng chuẩn chỉnh không dính lỗi định dạng vào database
        createdAt: mysqlDateTime
      };
    });

    onUpdateVocab([...newVocabs, ...vocabularies]);
    setIsImportOpen(false);
    setImportText('');
    setParsedWords([]);
    alert(`Đã nhập thành công ${newVocabs.length} từ vựng mới từ Excel!`);
  };

  // MySQL Sync Script Generator
  const generateMySqlScript = () => {
    let sql = `-- =========================================================================\n`;
    sql += `-- TẬP LỆNH ĐỒNG BỘ HÓA DỮ LIỆU TỪ VỰNG TIẾNG ANH VÀO CƠ SỞ DỮ LIỆU MYSQL\n`;
    sql += `-- Hệ điều hành tương thích: Windows, macOS, Linux\n`;
    sql += `-- Phiên bản MySQL hỗ trợ: 8.0 hoặc cao hơn\n`;
    sql += `-- Xuất bản tự động từ ENGStudy Platform: ${new Date().toLocaleString()}\n`;
    sql += `-- =========================================================================\n\n`;
    sql += `-- BƯỚC 1: Sử dụng Database (Nếu chưa có, vui lòng chạy file schema.sql trong Developer Hub)\n`;
    sql += `CREATE DATABASE IF NOT EXISTS english_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE english_learning;\n\n`;
    sql += `-- BƯỚC 2: Tắt tạm kiểm tra khóa ngoại để dọn dẹp và nạp dữ liệu ổn định\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sql += `TRUNCATE TABLE vocabularies;\n\n`;
    sql += `-- BƯỚC 3: Thực hiện nạp nhanh ${vocabularies.length} từ vựng hiện tại của bạn\n`;
    sql += `INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, created_at, category_id)\nVALUES\n`;

    const values = vocabularies.map((v) => {
      const escapeSql = (str: string) => str ? str.replace(/'/g, "''") : '';
      const escWord = escapeSql(v.word);
      const escIpa = escapeSql(v.ipa);
      const escMeaning = escapeSql(v.meaning);
      const escPartOfSpeech = escapeSql(v.partOfSpeech);
      const escExample = escapeSql(v.example);
      const escExampleMeaning = escapeSql(v.exampleMeaning);
      const escImage = escapeSql(v.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=60');
      const escDifficulty = escapeSql(v.difficulty);
      const createdAt = v.createdAt || new Date().toISOString().split('T')[0];

      // Match topic name to database category_id
      let categoryId = 1; // Default to TOEIC Office
      const topicLower = v.topic.toLowerCase();
      if (topicLower.includes('human') || topicLower.includes('nhân sự')) {
        categoryId = 2; // Human Resources
      } else if (topicLower.includes('travel') || topicLower.includes('du lịch')) {
        categoryId = 3;
      } else if (topicLower.includes('tech') || topicLower.includes('công nghệ')) {
        categoryId = 4;
      }

      return `(${v.id}, '${escWord}', '${escIpa}', '${escMeaning}', '${escPartOfSpeech}', '${escExample}', '${escExampleMeaning}', '${escImage}', '${escDifficulty}', '${createdAt}', ${categoryId})`;
    });

    sql += values.join(',\n') + ';\n\n';
    sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
    sql += `-- =========================================================================\n`;
    sql += `-- ĐỒNG BỘ THÀNH CÔNG! BẠN CÓ THỂ ĐĂNG NHẬP BACKEND SPRING BOOT ĐỂ SỬ DỤNG NGAY LẬP TỨC.\n`;
    sql += `-- =========================================================================\n`;
    return sql;
  };

  const handleDownloadSql = () => {
    const script = generateMySqlScript();
    const element = document.createElement("a");
    const file = new Blob([script], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "sync_vocabularies_mysql.sql";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopySql = () => {
    const script = generateMySqlScript();
    navigator.clipboard.writeText(script);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Text to Speech
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel active speeches
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ Phát Âm (TTS)!');
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map(v =>
      v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
    );
    onUpdateVocab(updated);
  };

  // Toggle learned status
  const toggleLearned = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map(v =>
      v.id === id ? { ...v, isLearned: !v.isLearned } : v
    );
    onUpdateVocab(updated);
  };

  // Delete vocab
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      const updated = vocabularies.filter(v => v.id !== id);
      onUpdateVocab(updated);
      if (selectedVocab && selectedVocab.id === id) {
        setSelectedVocab(null);
      }
    }
  };

  // Open Form for Creation
  const openCreateForm = () => {
    setFormMode('create');
    setWord('');
    setIpa('');
    setMeaning('');
    setPartOfSpeech('Noun');
    setExample('');
    setExampleMeaning('');
    setImage('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60');
    setTopic('TOEIC Office');
    setDifficulty('Medium');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (vocab: Vocabulary, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormMode('edit');
    setEditingId(vocab.id);
    setWord(vocab.word);
    setIpa(vocab.ipa);
    setMeaning(vocab.meaning);
    setPartOfSpeech(vocab.partOfSpeech);
    setExample(vocab.example);
    setExampleMeaning(vocab.exampleMeaning);
    setImage(vocab.image);
    setTopic(vocab.topic);
    setDifficulty(vocab.difficulty);
    setIsFormOpen(true);
  };

  // Save Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !meaning) {
      alert('Vui lòng nhập Từ và Dịch nghĩa!');
      return;
    }

    if (formMode === 'create') {
      const newVocab: Vocabulary = {
        id: Date.now(),
        word,
        ipa,
        meaning,
        partOfSpeech,
        example,
        exampleMeaning,
        image,
        topic,
        difficulty,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateVocab([newVocab, ...vocabularies]);
    } else if (formMode === 'edit' && editingId !== null) {
      const updated = vocabularies.map(v =>
        v.id === editingId
          ? {
              ...v,
              word,
              ipa,
              meaning,
              partOfSpeech,
              example,
              exampleMeaning,
              image,
              topic,
              difficulty
            }
          : v
      );
      onUpdateVocab(updated);
    }
    setIsFormOpen(false);
  };

  // Filters logic
  const filteredVocabularies = vocabularies.filter(v => {
    const matchSearch =
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.partOfSpeech.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTopic = selectedTopic === 'All' || v.topic === selectedTopic;
    const matchDifficulty = selectedDifficulty === 'All' || v.difficulty === selectedDifficulty;
    const matchFavorite = !filterFavorite || v.isFavorite;

    return matchSearch && matchTopic && matchDifficulty && matchFavorite;
  });

  return (
    <div id="vocabulary-section-container" className="space-y-6">
      {isFormOpen ? (
        /* Admin Form overlay */
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {formMode === 'create' ? 'Thêm từ vựng mới' : 'Cập nhật từ vựng'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition text-sm font-semibold"
            >
              Hủy bỏ
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ tiếng Anh *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={word}
                onChange={e => setWord(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phiên âm IPA</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={ipa}
                onChange={e => setIpa(e.target.value)}
                placeholder="/.../"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nghĩa tiếng Việt *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={meaning}
                onChange={e => setMeaning(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loại từ</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={partOfSpeech}
                onChange={e => setPartOfSpeech(e.target.value)}
              >
                <option value="Noun">Noun (Danh từ)</option>
                <option value="Verb">Verb (Động từ)</option>
                <option value="Adjective">Adjective (Tính từ)</option>
                <option value="Adverb">Adverb (Trạng từ)</option>
                <option value="Preposition">Preposition (Giới từ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              >
                {TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Độ khó</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đường dẫn ảnh mẫu</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={image}
                onChange={e => setImage(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ví dụ tiếng Anh</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16"
                value={example}
                onChange={e => setExample(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dịch nghĩa ví dụ</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16"
                value={exampleMeaning}
                onChange={e => setExampleMeaning(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                {formMode === 'create' ? 'Tạo mới' : 'Lưu cập nhật'}
              </button>
            </div>
          </form>
        </div>
      ) : isImportOpen ? (
        /* Excel Importer Interface */
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-150 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Nhập từ vựng hàng loạt từ Excel / Google Sheets</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Copy và dán các dòng từ bảng Excel của bạn để nạp nhanh vào cơ sở dữ liệu.</p>
            </div>
            <button
              onClick={() => {
                setIsImportOpen(false);
                setImportText('');
                setParsedWords([]);
              }}
              className="text-slate-400 hover:text-slate-600 transition text-xs font-semibold px-3 py-1.5 hover:bg-slate-50 rounded-lg border border-slate-100"
            >
              Hủy bỏ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">1. Chọn thuộc tính chung</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chủ đề từ vựng</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={importTopic}
                      onChange={e => setImportTopic(e.target.value)}
                    >
                      {TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loại từ mặc định</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={importPartOfSpeech}
                      onChange={e => setImportPartOfSpeech(e.target.value)}
                    >
                      <option value="Noun">Noun (Danh từ)</option>
                      <option value="Verb">Verb (Động từ)</option>
                      <option value="Adjective">Adjective (Tính từ)</option>
                      <option value="Adverb">Adverb (Trạng từ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Độ khó mặc định</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={importDifficulty}
                      onChange={e => setImportDifficulty(e.target.value as any)}
                    >
                      <option value="Easy">Dễ (Easy)</option>
                      <option value="Medium">Trung bình (Medium)</option>
                      <option value="Hard">Khó (Hard)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-2">
                <strong className="font-bold text-emerald-900 block mb-1">💡 Hướng dẫn copy từ Excel:</strong>
                <p>Hãy chọn và copy các cột dữ liệu theo đúng thứ tự tương tự như ảnh mẫu của bạn:</p>
                <div className="bg-white/80 p-2 rounded font-mono text-[10px] border border-emerald-100 text-slate-700 leading-normal">
                  <span className="text-slate-400">Cột 1:</span> Từ vựng<br/>
                  <span className="text-slate-400">Cột 2:</span> Phiên âm IPA<br/>
                  <span className="text-slate-400">Cột 3:</span> Dịch nghĩa<br/>
                  <span className="text-slate-400">Cột 4:</span> Ví dụ tiếng Anh
                </div>
                <p className="text-[10px] text-slate-400">Hệ thống sẽ tự động gán ảnh mẫu minh họa thích hợp cho mỗi từ!</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">2. Dán dữ liệu đã copy từ Excel</label>
                <textarea
                  className="w-full flex-1 min-h-[220px] px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                  placeholder={`Dán các dòng ở đây (ấn Ctrl+V)...\nVí dụ:\nAppointment\t/əˈpɔɪnt.mənt/\tCuộc hẹn\tI have an appointment with the manager...\nBriefcase\t/ˈbriːf.keɪs/\tCặp tài liệu\tHe carried his documents in a briefcase...`}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleParseImport}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  Phân tích dữ liệu dán vào (Parse)
                </button>
              </div>
            </div>
          </div>

          {parsedWords.length > 0 && (
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Xem trước kết quả phân tích
                  </h4>
                  <p className="text-[10px] text-slate-400">Đã phát hiện {parsedWords.length} hàng từ vựng hợp lệ.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveImport}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  Xác nhận nạp {parsedWords.length} từ vào ứng dụng
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] tracking-wider border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Từ vựng</th>
                      <th className="px-4 py-3">Phiên âm IPA</th>
                      <th className="px-4 py-3">Dịch nghĩa</th>
                      <th className="px-4 py-3">Ví dụ minh họa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedWords.map((pw, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-950 text-sm">{pw.word}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">{pw.ipa || '-'}</td>
                        <td className="px-4 py-3.5 text-indigo-600 font-semibold">{pw.meaning}</td>
                        <td className="px-4 py-3.5 text-slate-600 italic leading-relaxed">"{pw.example}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : isSqlSyncOpen ? (
        /* MySQL Sync & Integration Hub */
        <div className="bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-800 max-w-4xl mx-auto space-y-6 text-slate-100 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>MySQL Database Synchronization Hub</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Đồng bộ hóa toàn bộ từ vựng hiện tại trên Website của bạn vào Cơ sở dữ liệu MySQL cục bộ.</p>
            </div>
            <button
              onClick={() => setIsSqlSyncOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition text-xs font-semibold px-3 py-1.5 hover:bg-slate-800 rounded-lg border border-slate-800"
            >
              Quay lại danh sách
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">HƯỚNG DẪN TÍCH HỢP & ĐỒNG BỘ</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Bước 1</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Khởi chạy MySQL Server cục bộ (ví dụ: XAMPP, Docker, hoặc cài trực tiếp cổng 3306).
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Bước 2</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Tạo cơ sở dữ liệu và các bảng bằng cách chạy tệp <strong className="text-white">schema.sql</strong> có sẵn trong tab <span className="text-emerald-400">Developer Hub</span>.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Bước 3</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Bấm nút <strong className="text-indigo-400">Đồng bộ dữ liệu ngay lập tức</strong> ở bên phải để truyền dữ liệu trực tiếp vào hệ thống cơ sở dữ liệu mà không cần chạy thủ công!
                  </p>
                </div>
              </div>

              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30 text-[11px] text-indigo-300 space-y-2">
                <strong className="font-bold text-indigo-200 block mb-1">💡 Cơ Chế Đồng Bộ Tự Động:</strong>
                <p className="leading-relaxed">
                  Khi bạn kết nối ứng dụng Spring Boot 3 vào MySQL Database đã đồng bộ này, API Server sẽ tự động truy xuất các bảng từ vựng, tài khoản, lịch sử học tập và đồng bộ trạng thái trực tiếp theo thời gian thực!
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4 flex flex-col justify-start">
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin-slow text-indigo-400" />
                    <span>Trạng Thái Kết Nối & Cấu Hình CSDL</span>
                  </h4>
                  <button 
                    onClick={fetchDbStatus}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    title="Kiểm tra lại kết nối"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 relative">
                        {dbStatus?.connected ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        ) : (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </>
                        )}
                      </span>
                      <span className={`text-xs font-bold ${dbStatus?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {dbStatus?.connected ? 'MySQL Live Connected' : 'Chế độ Lưu trữ Dự phòng'}
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px] text-slate-400 leading-normal">
                      <div><span className="text-slate-500">Cơ chế hoạt động:</span> <span className="text-white font-medium">{dbStatus?.mode || 'Đang kết nối...'}</span></div>
                      {dbStatus?.config ? (
                        <>
                          <div><span className="text-slate-500">Địa chỉ Host:</span> <span className="text-white">{dbStatus.config.host}:{dbStatus.config.port}</span></div>
                          <div><span className="text-slate-500">Tài khoản:</span> <span className="text-white">{dbStatus.config.user}</span></div>
                          <div><span className="text-slate-500">Database:</span> <span className="text-emerald-400 font-bold">{dbStatus.config.database}</span></div>
                        </>
                      ) : (
                        <div><span className="text-slate-500">Trạng thái cấu hình:</span> <span className="text-amber-400">Dùng bộ nhớ ảo cục bộ của Web Server</span></div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Tổng số từ vựng</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">{vocabularies.length} từ</div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-2">
                      Sẵn sàng đồng bộ hóa toàn bộ danh sách {vocabularies.length} từ này vào bảng cơ sở dữ liệu thực của bạn.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDirectSync}
                    disabled={isSyncing}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-lg ${
                      isSyncing 
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : dbStatus?.connected 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40'
                    }`}
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>ĐANG ĐỒNG BỘ DỮ LIỆU... XIN VUI LÒNG CHỜ</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 text-white" />
                        <span>
                          {dbStatus?.connected 
                            ? 'ĐỒNG BỘ DỮ LIỆU NGAY LẬP TỨC VÀO MYSQL CSDL' 
                            : 'ĐỒNG BỘ HÓA VÀO BỘ NHỚ LƯU TRỮ HỆ THỐNG'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {syncMessage && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 animate-fade-in ${
                    syncSuccess === true 
                      ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' 
                      : syncSuccess === false 
                        ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    {syncSuccess === true && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {syncSuccess === false && <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    {!syncSuccess && isSyncing && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0 mt-0.5" />}
                    <span>{syncMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Manual SQL backup */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <button
              onClick={() => setShowManualSql(!showManualSql)}
              className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{showManualSql ? 'Ẩn tập lệnh SQL INSERT thủ công' : 'Hiện tập lệnh SQL INSERT thủ công (Dành cho Quản trị viên nâng cao)'}</span>
            </button>

            {showManualSql && (
              <div className="mt-4 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mã SQL INSERT thủ công ({vocabularies.length} từ vựng)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopySql}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition active:scale-95 border border-slate-700"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã copy!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép SQL</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadSql}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-lg shadow-emerald-950/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải tệp .SQL</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-[11px] text-slate-300 p-4 max-h-[250px] overflow-y-auto select-text">
                  <pre className="whitespace-pre">
                    <code>{generateMySqlScript()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : selectedVocab ? (
        /* Vocabulary Detail view */
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-w-3xl mx-auto">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setSelectedVocab(null)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách</span>
            </button>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => openEditForm(selectedVocab, e)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(selectedVocab.id, e)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Image & Word */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={selectedVocab.image}
                  alt={selectedVocab.word}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60';
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
                    {selectedVocab.partOfSpeech}
                  </span>
                  <span className={`ml-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedVocab.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                    selectedVocab.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedVocab.difficulty}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => toggleFavorite(selectedVocab.id, e)}
                    className={`p-2 rounded-lg border transition ${
                      selectedVocab.isFavorite
                        ? 'border-rose-100 bg-rose-50 text-rose-600'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${selectedVocab.isFavorite ? 'fill-rose-600' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => toggleLearned(selectedVocab.id, e)}
                    className={`p-2 rounded-lg border transition ${
                      selectedVocab.isLearned
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Definition & Example */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedVocab.word}</h2>
                  <button
                    onClick={() => playAudio(selectedVocab.word)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition active:scale-95"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {selectedVocab.ipa && (
                  <p className="text-sm font-mono text-slate-500 mt-1">{selectedVocab.ipa}</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dịch nghĩa</h4>
                <p className="text-lg font-semibold text-slate-800">{selectedVocab.meaning}</p>
              </div>

              {selectedVocab.example && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ví dụ minh họa</h4>
                  <p className="text-sm font-medium text-slate-800 italic mb-1">"{selectedVocab.example}"</p>
                  <p className="text-xs text-slate-500">{selectedVocab.exampleMeaning}</p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-xs text-slate-400">Chủ đề: </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {selectedVocab.topic}
                </span>
                <span className="text-xs text-slate-400 ml-4">Ngày tạo: </span>
                <span className="text-xs font-mono text-slate-600">{selectedVocab.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo từ, nghĩa, loại từ..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Topic Filter */}
            <div className="md:col-span-3">
              <select
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
              >
                <option value="All">Tất cả chủ đề</option>
                {TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="md:col-span-2">
              <select
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
              >
                <option value="All">Mọi độ khó</option>
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>

            {/* Favorite check */}
            <div className="md:col-span-2 flex items-center justify-center md:justify-start">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterFavorite}
                  onChange={e => setFilterFavorite(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Yêu thích ({vocabularies.filter(v => v.isFavorite).length})</span>
              </label>
            </div>

            {/* Add Button if Admin */}
            <div className="md:col-span-1 flex justify-end space-x-1.5">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => setIsSqlSyncOpen(true)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl transition shadow-md active:scale-95 flex items-center justify-center border border-slate-800"
                    title="Đồng bộ hóa MySQL CSDL"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md active:scale-95 flex items-center justify-center"
                    title="Nhập dữ liệu từ Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={openCreateForm}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md active:scale-95 flex items-center justify-center"
                    title="Thêm từ mới"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-1" />
              )}
            </div>
          </div>

          {/* Grid Layout */}
          {filteredVocabularies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-400">Không tìm thấy từ vựng nào khớp với bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVocabularies.map(vocab => (
                <div
                  key={vocab.id}
                  onClick={() => setSelectedVocab(vocab)}
                  className="bg-white rounded-xl border border-slate-100 hover:border-indigo-100 p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base">
                          {vocab.word}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                          {vocab.partOfSpeech}
                        </span>
                      </div>
                      <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => toggleFavorite(vocab.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                        >
                          <Star className={`w-4 h-4 ${vocab.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                        </button>
                        <button
                          onClick={e => toggleLearned(vocab.id, e)}
                          className="p-1 text-slate-400 hover:text-emerald-500 transition"
                        >
                          <CheckCircle className={`w-4 h-4 ${vocab.isLearned ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => openEditForm(vocab, e)}
                              className="p-1 text-indigo-400 hover:text-indigo-600 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(vocab.id, e)}
                              className="p-1 text-rose-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-mono mt-0.5">{vocab.ipa || 'N/A'}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-2 line-clamp-2">{vocab.meaning}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400">
                    <span>{vocab.topic}</span>
                    <span className={`font-semibold ${
                      vocab.difficulty === 'Easy' ? 'text-emerald-500' :
                      vocab.difficulty === 'Hard' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {vocab.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
