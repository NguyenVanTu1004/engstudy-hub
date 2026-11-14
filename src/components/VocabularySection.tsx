import React, { useState, useEffect, useMemo } from 'react';
import { Vocabulary } from '../types';
import { TOPICS } from '../data/englishData';
import { api } from '../services/api';
import * as XLSX from 'xlsx';
import { 
  Search, Volume2, Star, CheckCircle, Edit, Trash2, Plus, ArrowLeft, 
  Heart, FileSpreadsheet, Database, Download, Copy, Check, Info, 
  RefreshCw, Upload, LayoutList, LayoutGrid, AlertTriangle, Eye, Sparkles
} from 'lucide-react';

interface VocabularySectionProps {
  vocabularies: Vocabulary[];
  onUpdateVocab: (updated: Vocabulary[]) => void;
  isAdmin: boolean;
  onRefresh?: () => Promise<void>;
}

export default function VocabularySection({ vocabularies, onUpdateVocab, isAdmin, onRefresh }: VocabularySectionProps) {
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => typeof window !== 'undefined' && window.innerWidth < 640 ? 'grid' : 'list');
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const ITEMS_PER_PAGE = viewMode === 'list' ? 25 : 30;

  // Set of existing words (trimmed, lowercased) for real-time de-duplication
  const existingWordSet = useMemo(() => {
    const set = new Set<string>();
    vocabularies.forEach(v => {
      if (v.word) set.add(v.word.trim().toLowerCase());
    });
    return set;
  }, [vocabularies]);

  // Dynamically compute unique topics and their counts efficiently with useMemo
  const dynamicTopics = useMemo(() => {
    return Array.from(new Set(vocabularies.map(v => v.topic).filter(Boolean))).sort();
  }, [vocabularies]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    vocabularies.forEach(v => {
      if (v.topic) {
        map[v.topic] = (map[v.topic] || 0) + 1;
      }
    });
    return map;
  }, [vocabularies]);

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
      setSyncMessage('Đang kết nối & truyền tải đến MySQL CSDL...');
      
      const sanitizedVocabularies = vocabularies.map((v: any) => {
        let cleanDate = v.createdAt || v.created_at || new Date().toISOString();
        if (typeof cleanDate === 'string' && cleanDate.includes('T')) {
          cleanDate = cleanDate.replace('T', ' ').substring(0, 19);
        }
        return {
          ...v,
          createdAt: cleanDate
        };
      });

      const data = await api.post('/api/vocabularies/sync', { vocabularies: sanitizedVocabularies }, true);
      
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
      setSyncMessage('Thất bại: ' + (err.message || 'Lỗi kết nối máy chủ'));
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
  const [editingId, setEditingId] = useState<number | string | null>(null);

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
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [importText, setImportText] = useState('');
  const [importTopic, setImportTopic] = useState('TOEIC Office');
  const [importDifficulty, setImportDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [importPartOfSpeech, setImportPartOfSpeech] = useState('Noun');
  const [parsedWords, setParsedWords] = useState<Partial<Vocabulary>[]>([]);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importErrorMsg, setImportErrorMsg] = useState('');

  // Uploaded file info
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('ALL');
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Smart Row Parser
  const parseRow = (
    rawCells: any[],
    defaultTopic: string,
    defaultDifficulty: 'Easy' | 'Medium' | 'Hard',
    defaultPartOfSpeech: string
  ): Partial<Vocabulary> | null => {
    if (!Array.isArray(rawCells)) return null;
    const cells = rawCells.map(c => (c !== null && c !== undefined ? String(c).trim() : ''));
    if (cells.filter(Boolean).length === 0) return null;

    // Check header rows or episode banners
    const first2 = (cells[0] + ' ' + (cells[1] || '')).toLowerCase();
    if (
      first2.includes('stt') ||
      first2.includes('phrasal verb') ||
      first2.includes('từ vựng') ||
      first2.includes('nguyên thể') ||
      first2.includes('episode') ||
      first2.includes('tổng hợp') ||
      first2.includes('tên chuỗi')
    ) {
      return null;
    }

    // Strip sequence number (STT) if present in first cell
    const shiftedCells = [...cells];
    if (/^\d+$/.test(shiftedCells[0])) {
      shiftedCells.shift();
    }

    if (shiftedCells.length === 0 || !shiftedCells[0]) return null;

    let wordVal = shiftedCells[0];
    let ipaVal = '';
    let meaningVal = '';
    let partOfSpeechVal = defaultPartOfSpeech || 'Noun';
    let exampleVal = '';
    let exampleMeaningVal = '';
    let topicVal = defaultTopic;
    let difficultyVal: 'Easy' | 'Medium' | 'Hard' = defaultDifficulty;

    // A. Irregular Verbs: [V1, V2, V3, Nghĩa]
    if (shiftedCells.length >= 4 && (defaultTopic.toLowerCase().includes('bất quy tắc') || defaultTopic.toLowerCase().includes('irregular'))) {
      const v1 = shiftedCells[0];
      const v2 = shiftedCells[1];
      const v3 = shiftedCells[2];
      meaningVal = shiftedCells[3] || 'Động từ bất quy tắc';
      wordVal = v1;
      partOfSpeechVal = 'Verb';
      exampleVal = `V1: ${v1} | V2: ${v2} | V3: ${v3}`;
      exampleMeaningVal = `Dạng biến thể thì: Nguyên thể (${v1}), Quá khứ (${v2}), Quá khứ phân từ (${v3})`;
      topicVal = 'Động từ bất quy tắc (Irregular Verbs)';
      difficultyVal = 'Medium';
    }
    // B. Oxford 5000: [Word, PartOfSpeech, Level, IPA, Meaning, Example]
    else if (shiftedCells.length >= 5 && /^(A1|A2|B1|B2|C1|C2)$/i.test(shiftedCells[2])) {
      wordVal = shiftedCells[0];
      partOfSpeechVal = shiftedCells[1] || 'Noun';
      const level = shiftedCells[2].toUpperCase();
      ipaVal = shiftedCells[3] || '';
      meaningVal = shiftedCells[4] || '';
      exampleVal = shiftedCells[5] || '';
      topicVal = `Oxford Vocabulary - Level ${level}`;
      difficultyVal = (level === 'A1' || level === 'A2') ? 'Easy' : (level === 'B1' || level === 'B2') ? 'Medium' : 'Hard';
      exampleMeaningVal = exampleVal ? `Ví dụ minh họa cho từ ${wordVal}` : '';
    }
    // C. Phrasal Verbs: [Phrasal Verb, Meaning, Example, ExMeaning, (Optional IPA)]
    else if (shiftedCells.length >= 3 && (shiftedCells[1] || '').length > 0) {
      wordVal = shiftedCells[0];
      const ipaMatch = wordVal.match(/\/([^\/]+)\//);
      if (ipaMatch) {
        ipaVal = `/${ipaMatch[1]}/`;
        wordVal = wordVal.replace(ipaMatch[0], '').trim();
      }
      meaningVal = shiftedCells[1];
      exampleVal = shiftedCells[2] || '';
      exampleMeaningVal = shiftedCells[3] || (exampleVal ? `Ví dụ của cụm từ ${wordVal}` : '');
      partOfSpeechVal = 'Verb';
      if (!ipaVal && shiftedCells[4]) {
        const extraIpaMatch = shiftedCells[4].match(/\/([^\/]+)\//);
        if (extraIpaMatch) ipaVal = `/${extraIpaMatch[1]}/`;
      }
    } else {
      // D. Standard format: [Word, IPA, Meaning, Example]
      wordVal = shiftedCells[0];
      ipaVal = shiftedCells[1] || '';
      meaningVal = shiftedCells[2] || '';
      exampleVal = shiftedCells[3] || '';
      if (exampleVal.includes('|')) {
        const parts = exampleVal.split('|');
        exampleVal = parts[0].trim();
        exampleMeaningVal = parts[1].trim();
      } else if (exampleVal) {
        exampleMeaningVal = `Ví dụ minh họa cho từ ${wordVal}`;
      }
    }

    return {
      word: wordVal,
      ipa: ipaVal,
      meaning: meaningVal || 'Chưa dịch nghĩa',
      partOfSpeech: partOfSpeechVal || 'Noun',
      example: exampleVal,
      exampleMeaning: exampleMeaningVal || (exampleVal ? `Ví dụ của ${wordVal}` : ''),
      topic: topicVal || defaultTopic || 'TOEIC Office',
      difficulty: difficultyVal || defaultDifficulty || 'Medium',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=60'
    };
  };

  const parseWorkbook = (wb: XLSX.WorkBook, sheetChoice: string) => {
    const sheetsToProcess = sheetChoice === 'ALL'
      ? wb.SheetNames.filter(name => !name.toLowerCase().includes('tổng hợp'))
      : [sheetChoice];

    const results: Partial<Vocabulary>[] = [];

    sheetsToProcess.forEach(sheetName => {
      const sheet = wb.Sheets[sheetName];
      if (!sheet) return;

      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let sheetTopic = importTopic;
      if (sheetName.toLowerCase().includes('sheet22') || sheetName.toLowerCase().includes('bất quy tắc')) {
        sheetTopic = 'Động từ bất quy tắc (Irregular Verbs)';
      } else if (sheetName.toLowerCase().startsWith('bắt đầu bằng')) {
        sheetTopic = `1000 Phrasal Verbs - ${sheetName.trim()}`;
      }

      rawRows.forEach(row => {
        const parsed = parseRow(row, sheetTopic, importDifficulty, importPartOfSpeech);
        if (parsed && parsed.word) {
          results.push(parsed);
        }
      });
    });

    setParsedWords(results);
    setImportErrorMsg('');
    setImportSuccessMsg(`Đã phân tích thành công ${results.length} từ vựng từ tệp Excel!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportErrorMsg('');
    setImportSuccessMsg('Đang đọc tệp tin...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        setRawWorkbook(workbook);
        setUploadedFileName(file.name);
        setSheetNames(workbook.SheetNames);
        setSelectedSheet('ALL');

        parseWorkbook(workbook, 'ALL');
      } catch (err: any) {
        setImportErrorMsg('Lỗi khi đọc file Excel: ' + (err.message || 'Tệp không đúng định dạng.'));
      }
    };
    reader.onerror = () => {
      setImportErrorMsg('Không thể đọc file từ thiết bị của bạn.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
    if (rawWorkbook) {
      parseWorkbook(rawWorkbook, sheet);
    }
  };

  const handleParseImport = () => {
    if (!importText.trim()) {
      alert('Vui lòng dán dữ liệu sao chép từ bảng Excel vào ô nhập!');
      return;
    }

    const lines = importText.split('\n');
    const results: Partial<Vocabulary>[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let parts = trimmed.split('\t');
      if (parts.length < 2) {
        parts = trimmed.split(',');
      }

      const parsed = parseRow(parts, importTopic, importDifficulty, importPartOfSpeech);
      if (parsed && parsed.word) {
        results.push(parsed);
      }
    });

    if (results.length === 0) {
      setImportErrorMsg('Không tìm thấy dòng từ vựng hợp lệ nào. Vui lòng kiểm tra lại dữ liệu dán vào.');
      return;
    }

    setParsedWords(results);
    setImportErrorMsg('');
    setImportSuccessMsg(`Đã phát hiện và phân tích thành công ${results.length} từ vựng!`);
  };

  // Computed statistics for parsed words and duplicate detection
  const importStats = useMemo(() => {
    if (parsedWords.length === 0) return { total: 0, newCount: 0, dupCount: 0 };
    let dupCount = 0;
    parsedWords.forEach(pw => {
      const w = (pw.word || '').trim().toLowerCase();
      if (existingWordSet.has(w)) {
        dupCount++;
      }
    });
    return {
      total: parsedWords.length,
      dupCount,
      newCount: parsedWords.length - dupCount
    };
  }, [parsedWords, existingWordSet]);

  const handleSaveImport = async () => {
    if (parsedWords.length === 0) {
      alert('Không có từ vựng nào được phân tích thành công!');
      return;
    }

    if (!isAdmin) {
      alert('Yêu cầu quyền Quản trị viên (ADMIN) để nạp từ vựng vào MySQL Database!');
      return;
    }

    // Filter duplicates if user opted to skip existing words
    const wordsToProcess = skipDuplicates
      ? parsedWords.filter(pw => !existingWordSet.has((pw.word || '').trim().toLowerCase()))
      : parsedWords;

    if (wordsToProcess.length === 0) {
      alert('Tất cả các từ vựng này đều đã tồn tại trong hệ thống! Không có từ mới nào cần thêm.');
      return;
    }

    setIsSavingImport(true);
    setImportErrorMsg('');
    setImportSuccessMsg('');

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const mysqlDate = `${year}-${month}-${day}`;

      const newVocabs: Vocabulary[] = wordsToProcess.map((pw, index) => {
        return {
          id: pw.id || `v_${Date.now()}_${index}`,
          word: pw.word || '',
          ipa: pw.ipa || '',
          meaning: pw.meaning || '',
          partOfSpeech: pw.partOfSpeech || 'Noun',
          example: pw.example || '',
          exampleMeaning: pw.exampleMeaning || '',
          image: pw.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=60',
          topic: pw.topic || importTopic || 'TOEIC Office',
          difficulty: (pw.difficulty as any) || importDifficulty || 'Medium',
          createdAt: mysqlDate
        };
      });

      const res = await api.post('/api/vocabularies/sync', { vocabularies: newVocabs }, true);

      if (res.success) {
        if (onRefresh) {
          await onRefresh();
        } else {
          onUpdateVocab([...newVocabs, ...vocabularies]);
        }
        setIsImportOpen(false);
        setImportText('');
        setParsedWords([]);
        setRawWorkbook(null);
        setUploadedFileName('');
        const dupSkippedNote = importStats.dupCount > 0 && skipDuplicates
          ? ` (Đã tự động loại bỏ ${importStats.dupCount} từ trùng lặp đã có)`
          : '';
        alert(`🎉 Nạp thành công ${newVocabs.length} từ vựng vào Cơ sở dữ liệu MySQL!${dupSkippedNote}`);
      } else {
        setImportErrorMsg(res.message || 'Lỗi lưu dữ liệu vào hệ thống.');
      }
    } catch (err: any) {
      setImportErrorMsg('Lỗi kết nối máy chủ: ' + (err.message || 'Vui lòng kiểm tra quyền đăng nhập hoặc trạng thái server'));
    } finally {
      setIsSavingImport(false);
    }
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
  const toggleFavorite = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map(v =>
      v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
    );
    onUpdateVocab(updated);
  };

  // Toggle learned status
  const toggleLearned = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map(v =>
      v.id === id ? { ...v, isLearned: !v.isLearned } : v
    );
    onUpdateVocab(updated);
  };

  // Delete vocab
  const handleDelete = (id: number | string, e: React.MouseEvent) => {
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
        id: Date.now()  ,
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

  const totalPages = Math.max(1, Math.ceil(filteredVocabularies.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedVocabularies = filteredVocabularies.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

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
        /* Excel & Dataset Importer Interface */
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-150 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Nhập & Nạp dữ liệu từ vựng vào MySQL Database</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ tải tệp Excel (.xlsx, .xls, .csv) chứa 1000 Phrasal Verbs, Oxford 5000 hoặc dán trực tiếp.
              </p>
            </div>
            <button
              onClick={() => {
                setIsImportOpen(false);
                setImportText('');
                setParsedWords([]);
                setRawWorkbook(null);
                setUploadedFileName('');
                setImportErrorMsg('');
                setImportSuccessMsg('');
              }}
              className="text-slate-400 hover:text-slate-600 transition text-xs font-semibold px-3 py-1.5 hover:bg-slate-50 rounded-lg border border-slate-100"
            >
              Hủy bỏ
            </button>
          </div>

          {/* Import Method Tabs */}
          <div className="flex border-b border-slate-150 space-x-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setImportMode('upload')}
              className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                importMode === 'upload'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>1. Tải lên tệp Excel (.xlsx, .xls, .csv) [Khuyên dùng]</span>
            </button>
            <button
              type="button"
              onClick={() => setImportMode('paste')}
              className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                importMode === 'paste'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>2. Dán văn bản từ Clipboard (Copy - Paste)</span>
            </button>
          </div>

          {/* Status Banners */}
          {importSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}
          {importErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importErrorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Cấu hình thuộc tính mặc định</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chủ đề từ vựng dự phòng</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={importTopic}
                      onChange={e => setImportTopic(e.target.value)}
                    >
                      {TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="1000 Phrasal Verbs">1000 Phrasal Verbs</option>
                      <option value="Oxford Vocabulary">Oxford Vocabulary</option>
                      <option value="Động từ bất quy tắc (Irregular Verbs)">Động từ bất quy tắc (Irregular Verbs)</option>
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
                <strong className="font-bold text-emerald-900 block mb-1">💡 Cơ chế tự động nhận diện:</strong>
                <p className="leading-relaxed">
                  Hệ thống tự động phát hiện cấu trúc cột của tài liệu: tự bỏ cột STT, tự tách từ vựng, phiên âm IPA, loại từ, cấp độ (A1-C1) và nghĩa tiếng Việt mà không sợ bị lệch cột!
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
              {importMode === 'upload' ? (
                /* Mode 1: File Upload */
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chọn tệp dữ liệu Excel từ máy tính của bạn
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group"
                  >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {uploadedFileName ? `Tệp đã chọn: ${uploadedFileName}` : 'Nhấp vào đây để chọn tệp Excel (.xlsx, .xls, .csv)'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Hỗ trợ tệp 1000 Phrasal Verbs, Oxford 5000 A1-C1, hoặc danh sách từ vựng bất kỳ
                      </p>
                    </div>
                  </div>

                  {sheetNames.length > 1 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Chọn Sheet dữ liệu cần nạp:</span>
                        <span className="text-[10px] text-slate-400">Tệp này có {sheetNames.length} sheet khác nhau.</span>
                      </div>
                      <select
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-emerald-500"
                        value={selectedSheet}
                        onChange={e => handleSheetChange(e.target.value)}
                      >
                        <option value="ALL">Nạp tất cả các Sheet ({sheetNames.length})</option>
                        {sheetNames.map(sn => (
                          <option key={sn} value={sn}>{sn}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Paste text */
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Dán dữ liệu sao chép từ bảng Excel (Ctrl+V)
                  </label>
                  <textarea
                    className="w-full flex-1 min-h-[200px] px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                    placeholder={`Dán các dòng ở đây (ấn Ctrl+V)...\nVí dụ:\n1\taccount for\tGiải trình, giải thích\tPart of her job is to record...\n2\tabandon\tv.\tB2\t/əˈbændən/\ttừ bỏ`}
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                  />
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleParseImport}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-sm"
                    >
                      Phân tích dữ liệu dán vào (Parse)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {parsedWords.length > 0 && (
            <div className="border-t border-slate-100 pt-5 space-y-4">
              {/* Duplicate Detection & Statistics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số từ phân tích</span>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{importStats.total.toLocaleString()} từ</p>
                </div>
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Từ mới (Sẵn sàng nạp)</span>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">+{importStats.newCount.toLocaleString()} từ</p>
                </div>
                <div className={`p-3.5 rounded-2xl border ${
                  importStats.dupCount > 0 
                    ? 'bg-amber-50 border-amber-200/80 text-amber-800' 
                    : 'bg-slate-50 border-slate-200/80 text-slate-600'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Từ đã có (Trùng lặp)</span>
                  <p className="text-xl font-black mt-0.5">{importStats.dupCount.toLocaleString()} từ</p>
                </div>
              </div>

              {/* Duplicate Alert Banner & Checkbox */}
              {importStats.dupCount > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">
                        Phát hiện {importStats.dupCount} từ vựng đã tồn tại trong hệ thống!
                      </p>
                      <p className="text-amber-700 text-[11px] mt-0.5">
                        Tùy chọn dưới đây giúp tự động lọc bỏ các từ trùng lặp để dữ liệu luôn tinh gọn và chính xác.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-amber-300 cursor-pointer shadow-xs shrink-0 select-none">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={e => setSkipDuplicates(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      Tự động loại bỏ {importStats.dupCount} từ trùng lặp
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Xem trước kết quả phân tích & kiểm tra trùng lặp
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {skipDuplicates 
                      ? `Sẽ nạp ${importStats.newCount} từ mới vào MySQL (bỏ qua ${importStats.dupCount} từ trùng lặp).`
                      : `Sẽ nạp/cập nhật toàn bộ ${parsedWords.length} từ vào MySQL.`
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveImport}
                  disabled={isSavingImport || (skipDuplicates && importStats.newCount === 0)}
                  className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center space-x-2 ${
                    isSavingImport || (skipDuplicates && importStats.newCount === 0) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSavingImport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang nạp vào MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Xác nhận nạp {skipDuplicates ? importStats.newCount : importStats.total} từ vào CSDL MySQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] tracking-wider border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Từ vựng</th>
                      <th className="px-4 py-3">Phiên âm IPA</th>
                      <th className="px-4 py-3">Loại từ</th>
                      <th className="px-4 py-3">Chủ đề</th>
                      <th className="px-4 py-3">Dịch nghĩa</th>
                      <th className="px-4 py-3">Ví dụ minh họa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedWords.slice(0, 100).map((pw, i) => {
                      const isDup = existingWordSet.has((pw.word || '').trim().toLowerCase());
                      return (
                        <tr key={i} className={`hover:bg-slate-50 transition ${isDup && skipDuplicates ? 'opacity-50 bg-slate-50/50' : ''}`}>
                          <td className="px-4 py-3.5">
                            {isDup ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Đã có {skipDuplicates ? '(Bỏ qua)' : ''}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                <Check className="w-3 h-3" />
                                <span>Từ mới</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-950 text-sm">{pw.word}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">{pw.ipa || '-'}</td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">{pw.partOfSpeech || '-'}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {pw.topic}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-indigo-600 font-semibold">{pw.meaning}</td>
                          <td className="px-4 py-3.5 text-slate-600 italic leading-relaxed">"{pw.example}"</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parsedWords.length > 100 && (
                  <div className="p-3 text-center bg-slate-50 text-xs text-slate-500 font-medium border-t border-slate-100">
                    ...và còn {parsedWords.length - 100} từ vựng khác sẽ được nạp đồng loạt vào MySQL.
                  </div>
                )}
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
        /* List or Grid View of Vocabularies */
        <div className="space-y-6">
          {/* Filters & Control Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left Controls: Search, Topic, Difficulty */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Search Input */}
              <div className="sm:col-span-5 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo từ vựng, nghĩa, loại từ..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Topic Filter */}
              <div className="sm:col-span-4">
                <select
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  value={selectedTopic}
                  onChange={e => {
                    setSelectedTopic(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">Tất cả chủ đề ({vocabularies.length})</option>
                  {dynamicTopics.map(t => (
                    <option key={t} value={t}>{t} ({topicCounts[t] || 0})</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="sm:col-span-3">
                <select
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  value={selectedDifficulty}
                  onChange={e => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">Mọi độ khó</option>
                  <option value="Easy">Dễ (Easy)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="Hard">Khó (Hard)</option>
                </select>
              </div>
            </div>

            {/* Right Controls: Favorites + View Mode Switcher + Action Buttons */}
            <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
              {/* Favorite Filter Toggle */}
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition select-none">
                <input
                  type="checkbox"
                  checked={filterFavorite}
                  onChange={e => {
                    setFilterFavorite(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <Heart className={`w-3.5 h-3.5 ${filterFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                <span>Yêu thích ({vocabularies.filter(v => v.isFavorite).length})</span>
              </label>

              {/* View Mode Switcher: Danh sách (List/Table) vs Lưới thẻ (Grid) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Chế độ Danh sách gọn gàng (List View)"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Chế độ Lưới thẻ (Grid View)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lưới thẻ</span>
                </button>
              </div>

              {/* Admin Actions: MySQL Sync, Excel Import, Create Word */}
              {isAdmin && (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsSqlSyncOpen(true)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center border border-slate-800"
                    title="Đồng bộ hóa MySQL CSDL"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center"
                    title="Nhập từ vựng Excel / Dán bảng (Khử trùng lặp)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={openCreateForm}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center"
                    title="Thêm từ vựng mới"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Vocabulary Display: Table or Grid */}
          {filteredVocabularies.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-400">Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTopic('All');
                  setSelectedDifficulty('All');
                  setFilterFavorite(false);
                }}
                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                /* ========================================================= */
                /* HIGH-DENSITY, NEAT, MODERN TABLE VIEW (CHẾ ĐỘ DANH SÁCH)   */
                /* ========================================================= */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          <th className="py-3 px-2 w-10 text-center">STT</th>
                          <th className="py-3 px-3 w-40 min-w-[140px]">Từ vựng & Phát âm</th>
                          <th className="py-3 px-2 w-20 text-center">Loại từ</th>
                          <th className="py-3 px-3 min-w-[160px]">Nghĩa tiếng Việt</th>
                          <th className="py-3 px-3 hidden xl:table-cell max-w-[220px]">Ví dụ minh họa</th>
                          <th className="py-3 px-2 hidden lg:table-cell max-w-[130px]">Chủ đề</th>
                          <th className="py-3 px-2 w-20 text-center">Độ khó</th>
                          <th className="py-3 px-2 w-20 text-center">Trạng thái</th>
                          <th className="py-3 px-3 w-24 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {paginatedVocabularies.map((vocab, idx) => {
                          const stt = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                          const pos = (vocab.partOfSpeech || 'Noun').toLowerCase();
                          const posBadge =
                            pos.includes('verb') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            pos.includes('adj') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            pos.includes('adv') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-indigo-50 text-indigo-700 border-indigo-200';

                          return (
                            <tr
                              key={vocab.id}
                              onClick={() => setSelectedVocab(vocab)}
                              className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                            >
                              {/* STT */}
                              <td className="py-3 px-2 text-center font-mono text-[11px] text-slate-400 group-hover:text-indigo-600 font-semibold">
                                {stt}
                              </td>

                              {/* Word + Audio + IPA */}
                              <td className="py-3 px-3">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition text-sm">
                                    {vocab.word}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playAudio(vocab.word);
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition shrink-0"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {vocab.ipa && (
                                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                    {vocab.ipa}
                                  </span>
                                )}
                              </td>

                              {/* Part of Speech */}
                              <td className="py-3 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${posBadge}`}>
                                  {vocab.partOfSpeech || 'Noun'}
                                </span>
                              </td>

                              {/* Meaning */}
                              <td className="py-3 px-3 font-semibold text-slate-800">
                                <span className="line-clamp-2 leading-relaxed">
                                  {vocab.meaning}
                                </span>
                              </td>

                              {/* Example (Only on xl displays) */}
                              <td className="py-3 px-3 text-slate-600 hidden xl:table-cell">
                                {vocab.example ? (
                                  <div>
                                    <p className="italic text-slate-700 line-clamp-1">"{vocab.example}"</p>
                                    {vocab.exampleMeaning && (
                                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{vocab.exampleMeaning}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 italic text-[11px]">—</span>
                                )}
                              </td>

                              {/* Topic (Hidden on mobile/tablet) */}
                              <td className="py-3 px-2 hidden lg:table-cell">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 max-w-[130px] truncate" title={vocab.topic}>
                                  {vocab.topic}
                                </span>
                              </td>

                              {/* Difficulty */}
                              <td className="py-3 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  vocab.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  vocab.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                  'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {vocab.difficulty === 'Easy' ? 'Dễ' : vocab.difficulty === 'Hard' ? 'Khó' : 'Vừa'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-2 text-center" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={e => toggleFavorite(vocab.id, e)}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                                    title={vocab.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                                  >
                                    <Star className={`w-4 h-4 ${vocab.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                                  </button>
                                  <button
                                    onClick={e => toggleLearned(vocab.id, e)}
                                    className="p-1 text-slate-400 hover:text-emerald-500 transition"
                                    title={vocab.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}
                                  >
                                    <CheckCircle className={`w-4 h-4 ${vocab.isLearned ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />
                                  </button>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => setSelectedVocab(vocab)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {isAdmin && (
                                    <>
                                      <button
                                        onClick={(e) => openEditForm(vocab, e)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="Chỉnh sửa từ vựng"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDelete(vocab.id, e)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                        title="Xóa từ vựng"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* CARD GRID VIEW (CHẾ ĐỘ LƯỚI THẺ)                           */
                /* ========================================================= */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedVocabularies.map(vocab => (
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
                        <span className="truncate max-w-[200px]" title={vocab.topic}>{vocab.topic}</span>
                        <span className={`font-semibold shrink-0 ml-2 ${
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    Hiển thị <strong className="text-slate-800">{(safePage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong className="text-slate-800">{Math.min(safePage * ITEMS_PER_PAGE, filteredVocabularies.length)}</strong> trên tổng số <strong className="text-indigo-600">{filteredVocabularies.length.toLocaleString()}</strong> từ vựng
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                    >
                      &larr; Trang trước
                    </button>
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">
                      Trang {safePage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                    >
                      Trang sau &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
