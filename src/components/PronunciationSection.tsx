import React, { useState } from 'react';
import { Vocabulary } from '../types';
import { BookOpen, Search, Volume2, Info, Plus, Check, Star, RefreshCw, Layers } from 'lucide-react';

interface PronunciationSectionProps {
  vocabularies: Vocabulary[];
  onUpdateVocab: (updated: Vocabulary[]) => void;
}

interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

export default function PronunciationSection({ vocabularies, onUpdateVocab }: PronunciationSectionProps) {
  const [subTab, setSubTab] = useState<'alphabet' | 'ipa' | 'dictionary'>('alphabet');

  // Dictionary lookup state
  const [searchWord, setSearchWord] = useState('');
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dictError, setDictError] = useState('');
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});

  // TTS Speaker helper
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Natural learning pace
      window.speechSynthesis.speak(utterance);
    }
  };

  // Free English Dictionary API Fetcher
  const handleDictLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchWord.trim()) return;

    setIsLoading(true);
    setDictError('');
    setDictResult(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchWord.trim().toLowerCase())}`);
      if (!response.ok) {
        throw new Error('Không tìm thấy từ này trong cơ sở từ điển của chúng tôi.');
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setDictResult(data[0]);
      } else {
        setDictError('Dữ liệu không đúng định dạng!');
      }
    } catch (err: any) {
      setDictError(err.message || 'Lỗi tải từ điển.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Word from dictionary into active vocab list
  const handleQuickAddVocab = (dictWord: string, dictPhonetic: string, dictMeaning: string, dictPart: string, dictExample: string) => {
    const isExist = vocabularies.some(v => v.word.toLowerCase() === dictWord.toLowerCase());
    if (isExist) {
      alert('Từ vựng này đã tồn tại trong danh sách của bạn!');
      return;
    }

    const newVocab: Vocabulary = {
      id: Date.now(),
      word: dictWord,
      ipa: dictPhonetic || '/.../',
      meaning: dictMeaning || 'Nghĩa của từ',
      partOfSpeech: dictPart || 'Noun',
      example: dictExample || 'An example of this word.',
      exampleMeaning: 'Ví dụ tương ứng',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80',
      topic: 'Personal List',
      difficulty: 'Medium',
      createdAt: new Date().toISOString().split('T')[0],
      isFavorite: true,
      isLearned: false
    };

    onUpdateVocab([newVocab, ...vocabularies]);
    setAddedWords(prev => ({ ...prev, [dictWord]: true }));
    alert(`Đã thêm từ "${dictWord}" vào danh sách từ vựng cá nhân thành công!`);
  };

  // Alphabet Data
  const alphabetData = [
    { letter: 'A', ipa: '/eɪ/', word: 'Apple', wordIpa: '/ˈæp.əl/', meaning: 'Quả táo' },
    { letter: 'B', ipa: '/biː/', word: 'Banana', wordIpa: '/bəˈnɑː.nə/', meaning: 'Quả chuối' },
    { letter: 'C', ipa: '/siː/', word: 'Cat', wordIpa: '/kæt/', meaning: 'Con mèo' },
    { letter: 'D', ipa: '/diː/', word: 'Dog', wordIpa: '/dɒɡ/', meaning: 'Con chó' },
    { letter: 'E', ipa: '/iː/', word: 'Elephant', wordIpa: '/ˈel.ɪ.fənt/', meaning: 'Con voi' },
    { letter: 'F', ipa: '/ef/', word: 'Fish', wordIpa: '/fɪʃ/', meaning: 'Con cá' },
    { letter: 'G', ipa: '/dʒiː/', word: 'Giraffe', wordIpa: '/dʒɪˈrɑːf/', meaning: 'Con hươu cao cổ' },
    { letter: 'H', ipa: '/eɪtʃ/', word: 'House', wordIpa: '/haʊs/', meaning: 'Ngôi nhà' },
    { letter: 'I', ipa: '/aɪ/', word: 'Ice cream', wordIpa: '/ˌaɪs ˈkriːm/', meaning: 'Kem' },
    { letter: 'J', ipa: '/dʒeɪ/', word: 'Jellyfish', wordIpa: '/ˈdʒel.i.fɪʃ/', meaning: 'Con sứa' },
    { letter: 'K', ipa: '/keɪ/', word: 'Kangaroo', wordIpa: '/ˌkæŋ.ɡərˈuː/', meaning: 'Con chuột túi' },
    { letter: 'L', ipa: '/el/', word: 'Lion', wordIpa: '/ˈlaɪ.ən/', meaning: 'Con sư tử' },
    { letter: 'M', ipa: '/em/', word: 'Monkey', wordIpa: '/ˈmʌŋ.ki/', meaning: 'Con khỉ' },
    { letter: 'N', ipa: '/en/', word: 'Nest', wordIpa: '/nest/', meaning: 'Cái tổ chim' },
    { letter: 'O', ipa: '/əʊ/', word: 'Orange', wordIpa: '/ˈɒr.ɪndʒ/', meaning: 'Quả cam' },
    { letter: 'P', ipa: '/piː/', word: 'Penguin', wordIpa: '/ˈpeŋ.ɡwɪn/', meaning: 'Con chim cánh cụt' },
    { letter: 'Q', ipa: '/kjuː/', word: 'Queen', wordIpa: '/kwiːn/', meaning: 'Nữ hoàng' },
    { letter: 'R', ipa: '/ɑːr/', word: 'Rabbit', wordIpa: '/ˈræb.ɪt/', meaning: 'Con thỏ' },
    { letter: 'S', ipa: '/es/', word: 'Sun', wordIpa: '/sʌn/', meaning: 'Mặt trời' },
    { letter: 'T', ipa: '/tiː/', word: 'Tiger', wordIpa: '/ˈtaɪ.ɡər/', meaning: 'Con hổ' },
    { letter: 'U', ipa: '/juː/', word: 'Umbrella', wordIpa: '/ʌmˈbrel.ə/', meaning: 'Cái ô / dù' },
    { letter: 'V', ipa: '/viː/', word: 'Violin', wordIpa: '/ˌvaɪəˈlɪn/', meaning: 'Đàn vĩ cầm' },
    { letter: 'W', ipa: '/ˈdʌb.əl.juː/', word: 'Water', wordIpa: '/ˈwɔː.tər/', meaning: 'Nước' },
    { letter: 'X', ipa: '/eks/', word: 'Xylophone', wordIpa: '/ˈzaɪ.lə.fəʊn/', meaning: 'Đàn mộc cầm' },
    { letter: 'Y', ipa: '/waɪ/', word: 'Yacht', wordIpa: '/jɒt/', meaning: 'Du thuyền' },
    { letter: 'Z', ipa: '/zed/', word: 'Zebra', wordIpa: '/ˈzeb.rə/', meaning: 'Con ngựa vằn' }
  ];

  // International Phonetic Alphabet (IPA) Vowels & Consonants Data
  const ipaVowels = [
    { symbol: 'iː', type: 'Nguyên âm dài', word: 'sheep', wordIpa: '/ʃiːp/', meaning: 'con cừu' },
    { symbol: 'ɪ', type: 'Nguyên âm ngắn', word: 'ship', wordIpa: '/ʃɪp/', meaning: 'tàu thủy' },
    { symbol: 'ʊ', type: 'Nguyên âm ngắn', word: 'good', wordIpa: '/ɡʊd/', meaning: 'tốt, khỏe' },
    { symbol: 'uː', type: 'Nguyên âm dài', word: 'shoot', wordIpa: '/ʃuːt/', meaning: 'bắn' },
    { symbol: 'e', type: 'Nguyên âm ngắn', word: 'bed', wordIpa: '/bed/', meaning: 'cái giường' },
    { symbol: 'ə', type: 'Nguyên âm lướt', word: 'teacher', wordIpa: '/ˈtiː.tʃər/', meaning: 'giáo viên' },
    { symbol: 'ɜː', type: 'Nguyên âm dài', word: 'bird', wordIpa: '/bɜːd/', meaning: 'con chim' },
    { symbol: 'ɔː', type: 'Nguyên âm dài', word: 'door', wordIpa: '/dɔːr/', meaning: 'cánh cửa' },
    { symbol: 'æ', type: 'Nguyên âm ngắn', word: 'cat', wordIpa: '/kæt/', meaning: 'con mèo' },
    { symbol: 'ʌ', type: 'Nguyên âm ngắn', word: 'up', wordIpa: '/ʌp/', meaning: 'lên trên' },
    { symbol: 'ɑː', type: 'Nguyên âm dài', word: 'far', wordIpa: '/fɑːr/', meaning: 'xa xôi' },
    { symbol: 'ɒ', type: 'Nguyên âm ngắn', word: 'on', wordIpa: '/ɒn/', meaning: 'trên' },
    { symbol: 'ɪə', type: 'Nguyên âm đôi', word: 'here', wordIpa: '/hɪər/', meaning: 'ở đây' },
    { symbol: 'eɪ', type: 'Nguyên âm đôi', word: 'wait', wordIpa: '/weɪt/', meaning: 'đợi chờ' },
    { symbol: 'ʊə', type: 'Nguyên âm đôi', word: 'tour', wordIpa: '/tʊər/', meaning: 'du lịch' },
    { symbol: 'ɔɪ', type: 'Nguyên âm đôi', word: 'boy', wordIpa: '/bɔɪ/', meaning: 'cậu bé' },
    { symbol: 'əʊ', type: 'Nguyên âm đôi', word: 'show', wordIpa: '/ʃəʊ/', meaning: 'chỉ ra' },
    { symbol: 'eə', type: 'Nguyên âm đôi', word: 'hair', wordIpa: '/heər/', meaning: 'mái tóc' },
    { symbol: 'aɪ', type: 'Nguyên âm đôi', word: 'my', wordIpa: '/maɪ/', meaning: 'của tôi' },
    { symbol: 'aʊ', type: 'Nguyên âm đôi', word: 'house', wordIpa: '/haʊs/', meaning: 'ngôi nhà' }
  ];

  const ipaConsonants = [
    { symbol: 'p', type: 'Vô thanh', word: 'pea', wordIpa: '/piː/', meaning: 'hạt đậu' },
    { symbol: 'b', type: 'Hữu thanh', word: 'boat', wordIpa: '/bəʊt/', meaning: 'con thuyền' },
    { symbol: 't', type: 'Vô thanh', word: 'tea', wordIpa: '/tiː/', meaning: 'tách trà' },
    { symbol: 'd', type: 'Hữu thanh', word: 'dog', wordIpa: '/dɒɡ/', meaning: 'con chó' },
    { symbol: 'tʃ', type: 'Vô thanh', word: 'cheese', wordIpa: '/tʃiːz/', meaning: 'phô mai' },
    { symbol: 'dʒ', type: 'Hữu thanh', word: 'june', wordIpa: '/dʒuːn/', meaning: 'tháng 6' },
    { symbol: 'k', type: 'Vô thanh', word: 'car', wordIpa: '/kɑːr/', meaning: 'xe hơi' },
    { symbol: 'ɡ', type: 'Hữu thanh', word: 'go', wordIpa: '/ɡəʊ/', meaning: 'đi' },
    { symbol: 'f', type: 'Vô thanh', word: 'fly', wordIpa: '/flaɪ/', meaning: 'bay' },
    { symbol: 'v', type: 'Hữu thanh', word: 'video', wordIpa: '/ˈvɪd.i.əʊ/', meaning: 'băng hình' },
    { symbol: 'θ', type: 'Vô thanh', word: 'think', wordIpa: '/θɪŋk/', meaning: 'suy nghĩ' },
    { symbol: 'ð', type: 'Hữu thanh', word: 'this', wordIpa: '/ðɪs/', meaning: 'cái này' },
    { symbol: 's', type: 'Vô thanh', word: 'see', wordIpa: '/siː/', meaning: 'nhìn thấy' },
    { symbol: 'z', type: 'Hữu thanh', word: 'zoo', wordIpa: '/zuː/', meaning: 'vườn thú' },
    { symbol: 'ʃ', type: 'Vô thanh', word: 'shall', wordIpa: '/ʃæl/', meaning: 'sẽ' },
    { symbol: 'ʒ', type: 'Hữu thanh', word: 'television', wordIpa: '/ˈtel.ɪ.vɪʒ.ən/', meaning: 'vô tuyến' },
    { symbol: 'm', type: 'Âm mũi', word: 'man', wordIpa: '/mæn/', meaning: 'đàn ông' },
    { symbol: 'n', type: 'Âm mũi', word: 'now', wordIpa: '/naʊ/', meaning: 'bây giờ' },
    { symbol: 'ŋ', type: 'Âm mũi', word: 'sing', wordIpa: '/sɪŋ/', meaning: 'hát' },
    { symbol: 'h', type: 'Âm hơi', word: 'hat', wordIpa: '/hæt/', meaning: 'cái mũ' },
    { symbol: 'l', type: 'Âm bên', word: 'love', wordIpa: '/lʌv/', meaning: 'yêu thương' },
    { symbol: 'r', type: 'Âm cuộn', word: 'red', wordIpa: '/red/', meaning: 'màu đỏ' },
    { symbol: 'w', type: 'Bán nguyên âm', word: 'wet', wordIpa: '/wet/', meaning: 'ẩm ướt' },
    { symbol: 'j', type: 'Bán nguyên âm', word: 'yes', wordIpa: '/jes/', meaning: 'đúng, vâng' }
  ];

  return (
    <div id="pronunciation-section" className="space-y-6">
      {/* Title Header banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-indigo-900">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Văn Âm & Phát Âm Chuẩn IPA
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Phát Âm Tiếng Anh & Tra Từ Điển
          </h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
            Học bảng chữ cái, phân tích chi tiết bảng phiên âm Quốc tế (IPA) chuẩn bản xứ có phát âm giọng đọc, tích hợp bộ máy tra từ điển chuyên sâu giúp bạn bứt phá kỹ năng giao tiếp.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-md border border-slate-200">
        <button
          onClick={() => setSubTab('alphabet')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'alphabet'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600'
          }`}
        >
          Bảng Chữ Cái
        </button>
        <button
          onClick={() => setSubTab('ipa')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'ipa'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600'
          }`}
        >
          Bảng IPA chuẩn
        </button>
        <button
          onClick={() => setSubTab('dictionary')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'dictionary'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600'
          }`}
        >
          Kho Từ Điển Tra Cứu
        </button>
      </div>

      {/* Subtab Contents */}
      {subTab === 'alphabet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Bảng chữ cái tiếng Anh (English Alphabet)</strong> gồm 26 chữ cái. Bấm vào nút loa <Volume2 className="w-3.5 h-3.5 inline text-indigo-600" /> bên cạnh từng ô để nghe phát âm mẫu chuẩn xác của chữ cái đó kèm từ ví dụ minh họa thực tế!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {alphabetData.map((item) => (
              <div
                key={item.letter}
                onClick={() => speakWord(item.letter)}
                className="group bg-white hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-200 rounded-2xl p-4 text-center cursor-pointer shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 text-slate-300 group-hover:text-indigo-500 transition">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition">
                  {item.letter}
                </div>
                <div className="text-xs font-mono text-indigo-500 font-bold tracking-wider mt-1">
                  {item.ipa}
                </div>
                <div className="border-t border-slate-100 my-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Ví dụ:</span>
                  <span className="text-xs font-bold text-slate-700 block group-hover:text-indigo-700 transition">
                    {item.word}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {item.wordIpa}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 block mt-0.5 bg-emerald-50 px-1 py-0.5 rounded">
                    {item.meaning}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'ipa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Bảng phiên âm quốc tế IPA (International Phonetic Alphabet)</strong> gồm 44 âm vị cơ bản (20 nguyên âm và 24 phụ âm). Gõ nhẹ vào âm vị hoặc từ vựng ví dụ để phát âm to rõ giọng bản ngữ, rèn luyện nói chuẩn lưu loát hơn.
            </p>
          </div>

          {/* Vowels Group */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
              Nguyên Âm (Vowels - 20 Âm)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ipaVowels.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => speakWord(item.word)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xl font-bold font-mono text-indigo-600">{`/${item.symbol}/`}</span>
                    <p className="text-[9px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md inline-block">
                      {item.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">{item.word}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{item.wordIpa}</span>
                    <span className="text-[10px] text-emerald-600 block italic">{item.meaning}</span>
                  </div>
                  <div className="p-1 text-slate-300 hover:text-indigo-600 rounded-lg">
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consonants Group */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 bg-rose-600 rounded-full" />
              Phụ Âm (Consonants - 24 Âm)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ipaConsonants.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => speakWord(item.word)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xl font-bold font-mono text-rose-600">{`/${item.symbol}/`}</span>
                    <p className="text-[9px] font-medium bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md inline-block">
                      {item.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">{item.word}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{item.wordIpa}</span>
                    <span className="text-[10px] text-emerald-600 block italic">{item.meaning}</span>
                  </div>
                  <div className="p-1 text-slate-300 hover:text-rose-600 rounded-lg">
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
            <Search className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Tra cứu từ điển đa phương tiện</strong> kết nối trực tiếp với nguồn từ điển bách khoa Anh - Anh đáng tin cậy. Nhập bất kỳ từ tiếng Anh nào (ví dụ: <i>success</i>, <i>learning</i>, <i>beautiful</i>) để tra cứu phát âm, nghĩa, loại từ và tự động thêm nhanh vào kho từ của bạn!
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <form onSubmit={handleDictLookup} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh cần tra cứu..."
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs font-medium focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-6 py-3 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-100"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Tra Từ</span>
              </button>
            </form>

            {dictError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 font-medium">
                {dictError}
              </div>
            )}
          </div>

          {/* Dictionary lookup result panel */}
          {dictResult && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
              {/* Word and pron header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1.5">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                    {dictResult.word}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-indigo-600 font-bold">
                      {dictResult.phonetic || (dictResult.phonetics[0] && dictResult.phonetics[0].text) || '/.../'}
                    </span>
                    <button
                      onClick={() => speakWord(dictResult.word)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-lg transition"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  {addedWords[dictResult.word] ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      Đã Thêm Vào Từ Vựng
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const defaultMeaning = dictResult.meanings[0]?.definitions[0]?.definition || '';
                        const defaultPart = dictResult.meanings[0]?.partOfSpeech || 'Noun';
                        const defaultExample = dictResult.meanings[0]?.definitions[0]?.example || '';
                        handleQuickAddVocab(
                          dictResult.word,
                          dictResult.phonetic || '',
                          defaultMeaning,
                          defaultPart,
                          defaultExample
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm vào Từ Vựng Học Tập
                    </button>
                  )}
                </div>
              </div>

              {/* Meanings loop */}
              <div className="space-y-6">
                {dictResult.meanings.map((meaning, mIdx) => (
                  <div key={mIdx} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-indigo-700 tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                        {meaning.partOfSpeech}
                      </span>
                    </div>

                    <div className="pl-2 border-l-2 border-indigo-200 space-y-4">
                      {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                        <div key={dIdx} className="space-y-1">
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            <span className="text-slate-400 font-bold mr-1.5">{dIdx + 1}.</span>
                            {def.definition}
                          </p>
                          {def.example && (
                            <p className="text-xs text-slate-400 italic pl-5 bg-slate-50/50 p-1.5 rounded border border-dashed border-slate-100">
                              e.g.: "{def.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
