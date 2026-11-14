import React, { useState, useEffect, useRef } from 'react';
import { DICTATION_DATA, DictationItem } from '../data/dictationData';
import { 
  Headphones, 
  Volume2, 
  RotateCcw, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Keyboard
} from 'lucide-react';

export default function DictationSection() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // Stats
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<{ [id: number]: number }>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter items by level
  const filteredItems = DICTATION_DATA.filter(item => {
    if (selectedLevel === 'all') return true;
    return item.level === selectedLevel;
  });

  const currentItem: DictationItem | undefined = filteredItems[currentIndex] || filteredItems[0];

  // Play audio via Web Speech Synthesis API
  const playAudio = (speed: number = playbackSpeed) => {
    if (!currentItem || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentItem.englishText);
    utterance.lang = 'en-US';
    utterance.rate = speed;

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto focus input on sentence change
  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setHintCount(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, selectedLevel]);

  // Clean word helper
  const cleanWord = (w: string) => w.toLowerCase().replace(/[.,!?;:"'()]/g, '').trim();

  // Calculate word-by-word diff
  const targetWords = currentItem ? currentItem.englishText.split(/\s+/) : [];
  const typedWords = userInput.trim().split(/\s+/).filter(w => w.length > 0);

  const evaluation = targetWords.map((target, idx) => {
    const typed = typedWords[idx] || '';
    const isMatch = cleanWord(target) === cleanWord(typed);
    return {
      target,
      typed,
      isMatch
    };
  });

  const correctWordsCount = evaluation.filter(e => e.isMatch).length;
  const accuracyScore = targetWords.length > 0 
    ? Math.round((correctWordsCount / targetWords.length) * 100) 
    : 0;

  // Handle submit check
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    setIsSubmitted(true);
    if (currentItem && !completedIds.includes(currentItem.id)) {
      setCompletedIds(prev => [...prev, currentItem.id]);
    }
    if (currentItem) {
      setAccuracyHistory(prev => ({ ...prev, [currentItem.id]: accuracyScore }));
    }
  };

  // Provide next word hint
  const handleGiveHint = () => {
    if (!currentItem) return;
    const words = currentItem.englishText.split(/\s+/);
    if (hintCount < words.length) {
      setHintCount(prev => prev + 1);
    }
  };

  // Handle next item
  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Handle key down for fast dictation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitted) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  return (
    <div id="dictation-section" className="space-y-6">
      {/* Header Banner - Tông màu trang nhã, sắc nét */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <Headphones className="w-3.5 h-3.5 text-amber-300" />
            <span>Phòng Luyện Chép Chính Tả (Dictation Studio)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Luyện Nghe Sâu & Chép Chính Tả
          </h2>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Nghe âm thanh chuẩn bản xứ, tự tay gõ lại từng từ và kiểm tra độ chính xác tức thì để khắc sâu từ vựng và ngữ pháp.
          </p>
        </div>

        {/* Stats badge */}
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-white">{completedIds.length}</span>
            <span className="text-[10px] text-teal-100 uppercase tracking-wider font-bold">Đã chép</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-amber-300">
              {completedIds.length > 0 
                ? `${Math.round(((Object.values(accuracyHistory) as number[]).reduce((a, b) => a + b, 0)) / completedIds.length)}%` 
                : '100%'}
            </span>
            <span className="text-[10px] text-teal-100 uppercase tracking-wider font-bold">Độ chính xác</span>
          </div>
        </div>
      </div>

      {/* Level Filters - Nền sáng, viền nhẹ, chữ đậm */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <button
            onClick={() => {
              setSelectedLevel('all');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedLevel === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tất cả ({DICTATION_DATA.length})
          </button>
          <button
            onClick={() => {
              setSelectedLevel('beginner');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedLevel === 'beginner'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🌱 Căn bản (5 câu)
          </button>
          <button
            onClick={() => {
              setSelectedLevel('intermediate');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedLevel === 'intermediate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ⚡ Trung cấp (5 câu)
          </button>
          <button
            onClick={() => {
              setSelectedLevel('advanced');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedLevel === 'advanced'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🔥 Nâng cao (4 câu)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
          <Keyboard className="w-4 h-4 text-indigo-500" />
          <span>Nhấn <strong>Enter</strong> để kiểm tra hoặc qua câu tiếp theo</span>
        </div>
      </div>

      {/* Main Dictation Box - Nền trắng sạch sẽ, viền xám nhẹ nhàng */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Top Sentence Status */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                #{currentIndex + 1}
              </span>
              <div>
                <span className="text-sm font-black text-slate-900 block">
                  {currentItem.topic}
                </span>
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Cấp độ: {currentItem.level}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Câu {currentIndex + 1} / {filteredItems.length}
            </span>
          </div>

          {/* Audio Player Controls */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Play Standard Speed */}
              <button
                type="button"
                onClick={() => playAudio(1.0)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition flex items-center space-x-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe tốc độ chuẩn (1.0x)</span>
              </button>

              {/* Play Slow Speed */}
              <button
                type="button"
                onClick={() => playAudio(0.75)}
                className="px-5 py-3.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 active:scale-95 cursor-pointer shadow-xs"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Nghe chậm (0.75x)</span>
              </button>

              {/* Hint button */}
              <button
                type="button"
                onClick={handleGiveHint}
                className="p-3.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-bold transition hover:bg-amber-100 cursor-pointer shadow-xs"
                title="Gợi ý chữ cái đầu từ tiếp theo"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Hint Box */}
            {hintCount > 0 && (
              <div className="inline-block bg-white px-4 py-2 rounded-xl border border-amber-200 text-xs font-mono text-slate-800 shadow-xs animate-fadeIn">
                <span className="text-amber-700 font-bold mr-1.5">Gợi ý từ đầu:</span>
                {currentItem.englishText.split(/\s+/).slice(0, hintCount).map((w, i) => (
                  <span key={i} className="mr-1.5 font-bold text-indigo-700">{w}</span>
                ))}
                <span className="text-slate-400">...</span>
              </div>
            )}
          </div>

          {/* Typing Input Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Nhập nội dung bạn vừa nghe được vào đây:
              </label>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Gõ toàn bộ câu tiếng Anh bạn nghe được rồi nhấn Enter để kiểm tra..."
                disabled={isSubmitted}
                className="w-full p-4 bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-2xl text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition leading-relaxed resize-none shadow-xs"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setUserInput('');
                  setIsSubmitted(false);
                  setHintCount(0);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa làm lại</span>
              </button>

              {!isSubmitted ? (
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Kiểm tra chính tả (Enter)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-100 cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Evaluation & Smart Diff Results */}
          {isSubmitted && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
              {/* Score Header - Nền xám nhẹ, chữ đen đậm tương phản 100% */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs ${
                    accuracyScore >= 90 ? 'bg-emerald-600' : accuracyScore >= 60 ? 'bg-amber-600' : 'bg-rose-600'
                  }`}>
                    {accuracyScore}%
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {accuracyScore === 100 
                        ? 'Xuất sắc! Bạn đã chép chính xác 100%!' 
                        : accuracyScore >= 80 
                        ? 'Rất tốt! Chỉ một vài lỗi nhỏ.' 
                        : 'Hãy đối chiếu lại câu chuẩn bên dưới.'}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Đúng {correctWordsCount} / {targetWords.length} từ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => playAudio(1.0)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs text-indigo-600 font-bold rounded-xl transition flex items-center space-x-1 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe lại</span>
                </button>
              </div>

              {/* Word by word Diff */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  So khớp từng từ đã gõ:
                </span>
                <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm">
                  {evaluation.map((ev, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border ${
                        ev.isMatch
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                          : 'bg-rose-100 border-rose-300 text-rose-950 line-through'
                      }`}>
                        {ev.typed || '(thiếu)'}
                      </span>
                      {!ev.isMatch && (
                        <span className="text-xs text-emerald-700 font-mono font-black mt-1">
                          {ev.target}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Sentence & Translation */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div>
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                    Câu chuẩn tiếng Anh:
                  </span>
                  <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {currentItem.englishText}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                    Bản dịch tiếng Việt:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium italic mt-0.5">
                    {currentItem.vietnameseTranslation}
                  </p>
                </div>

                {/* Grammar Focus Breakdown */}
                <div className="pt-2 border-t border-emerald-200">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Điểm ngữ pháp trong câu:</span>
                  </span>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed font-medium">
                    {currentItem.grammarFocus}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
