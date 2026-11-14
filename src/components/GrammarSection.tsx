import React, { useState } from 'react';
import { GRAMMAR_DATA, GrammarItem } from '../data/grammarData';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Compass, 
  HelpCircle,
  Lightbulb,
  Check,
  RotateCcw
} from 'lucide-react';

export default function GrammarSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'tenses' | 'prepositions' | 'adverbs' | 'auxiliary'>('tenses');
  const [tensesSubFilter, setTensesSubFilter] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('present-simple');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Audio speech synthesis helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Filter items
  const filteredItems = GRAMMAR_DATA.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeCategory === 'tenses' && tensesSubFilter !== 'all') {
      if (tensesSubFilter === 'present' && !item.group?.includes('Hiện tại')) return false;
      if (tensesSubFilter === 'past' && !item.group?.includes('Quá khứ')) return false;
      if (tensesSubFilter === 'future' && !item.group?.includes('Tương lai')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchVi = item.titleVi.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchSignals = item.signals?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchVi && !matchSummary && !matchSignals) return false;
    }
    return true;
  });

  const selectedItem = GRAMMAR_DATA.find(i => i.id === selectedItemId) || filteredItems[0] || GRAMMAR_DATA[0];

  const handleSelectQuizOption = (qIdx: number, option: string) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  return (
    <div id="grammar-section" className="space-y-6">
      {/* Header Banner - Tông màu xanh tím trang nhã, dịu mắt */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Trung Tâm Ngữ Pháp Tiếng Anh</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            12 Thì, Giới Từ, Trạng Từ & Trợ Động Từ
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Học ngữ pháp trực quan, dễ hiểu với đầy đủ công thức, ví dụ song ngữ, phát âm bản xứ và bài tập củng cố.
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-white">12</span>
            <span className="text-[10px] text-indigo-100 uppercase tracking-wider font-bold">Thì chuẩn</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-amber-300">100%</span>
            <span className="text-[10px] text-indigo-100 uppercase tracking-wider font-bold">Ví dụ + Quiz</span>
          </div>
        </div>
      </div>

      {/* Main Category Tabs - Nền sáng, chữ đậm rõ ràng */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setActiveCategory('tenses');
              setQuizAnswers({});
              setShowQuizResults(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === 'tenses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ⏳ 12 Thì Tiếng Anh
          </button>
          <button
            onClick={() => {
              setActiveCategory('prepositions');
              setQuizAnswers({});
              setShowQuizResults(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === 'prepositions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📍 Giới Từ (IN - ON - AT)
          </button>
          <button
            onClick={() => {
              setActiveCategory('adverbs');
              setQuizAnswers({});
              setShowQuizResults(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === 'adverbs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ⚡ Trạng Từ & Vị Trí
          </button>
          <button
            onClick={() => {
              setActiveCategory('auxiliary');
              setQuizAnswers({});
              setShowQuizResults(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === 'auxiliary'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🛡️ Trợ Từ & Khiếm Khuyết
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo thì, từ khóa, công thức..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs transition"
          />
        </div>
      </div>

      {/* Sub-filter for 12 Tenses */}
      {activeCategory === 'tenses' && (
        <div className="flex items-center space-x-2 text-xs flex-wrap gap-1">
          <span className="text-slate-500 font-bold text-xs mr-1">Trục thời gian:</span>
          {(['all', 'present', 'past', 'future'] as const).map(tab => {
            const labels = {
              all: 'Tất cả 12 thì',
              present: 'Hiện tại (4 thì)',
              past: 'Quá khứ (4 thì)',
              future: 'Tương lai (4 thì)'
            };
            return (
              <button
                key={tab}
                onClick={() => setTensesSubFilter(tab)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  tensesSubFilter === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Topic Selector List - Nền trắng tinh tế, viền nhẹ */}
        <div className="lg:col-span-4 space-y-2 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm max-h-[720px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chủ điểm ({filteredItems.length})
            </span>
          </div>

          {filteredItems.map(item => {
            const isSelected = item.id === selectedItem?.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setQuizAnswers({});
                  setShowQuizResults(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl transition flex items-start justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-xs font-black block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.titleVi}
                  </span>
                  <span className={`text-[11px] font-mono block ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {item.title}
                  </span>
                </div>
                <ArrowRight className={`w-4 h-4 mt-1 transition ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Topic Details - Nền trắng, tương phản cao, chữ to rõ nét */}
        <div className="lg:col-span-8 space-y-6">
          {selectedItem ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Header Details */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold">
                    {selectedItem.group || selectedItem.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: #{selectedItem.id}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  {selectedItem.titleVi}
                </h3>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">
                  {selectedItem.title}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                  {selectedItem.summary}
                </p>
              </div>

              {/* Formula Matrix - Màu sắc dịu mắt, độ tương phản cao */}
              {selectedItem.formula && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Cấu trúc công thức (Formula)</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Positive - Khẳng định */}
                    <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3.5">
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        +
                      </span>
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                          Thể khẳng định
                        </span>
                        <code className="text-xs sm:text-sm font-bold font-mono text-slate-900 block leading-relaxed">
                          {selectedItem.formula.positive}
                        </code>
                      </div>
                    </div>

                    {/* Negative - Phủ định */}
                    <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3.5">
                      <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        -
                      </span>
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider block">
                          Thể phủ định
                        </span>
                        <code className="text-xs sm:text-sm font-bold font-mono text-slate-900 block leading-relaxed">
                          {selectedItem.formula.negative}
                        </code>
                      </div>
                    </div>

                    {/* Question - Nghi vấn */}
                    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3.5">
                      <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        ?
                      </span>
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                          Thể nghi vấn (Câu hỏi)
                        </span>
                        <code className="text-xs sm:text-sm font-bold font-mono text-slate-900 block leading-relaxed">
                          {selectedItem.formula.question}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usages with Bilingual Examples - Rõ ràng, dễ đọc */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Cách sử dụng & Ví dụ minh họa</span>
                </h4>

                <div className="space-y-3">
                  {selectedItem.usages.map((u, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                      <p className="text-xs font-bold text-indigo-700 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span>{u.context}</span>
                      </p>
                      
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-start justify-between gap-3 shadow-xs">
                        <div className="space-y-1 flex-1">
                          <p className="text-xs sm:text-sm font-black text-slate-900 font-sans leading-relaxed">
                            {u.example}
                          </p>
                          <p className="text-xs text-slate-600 font-medium italic">
                            {u.translation}
                          </p>
                        </div>
                        <button
                          onClick={() => speakText(u.example)}
                          className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 rounded-xl transition shrink-0 active:scale-95 cursor-pointer"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Words */}
              {selectedItem.signals && selectedItem.signals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Dấu hiệu nhận biết (Signal Words)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Notes & Traps */}
              {selectedItem.notes && selectedItem.notes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Lưu ý quan trọng & Bẫy đề thi</span>
                  </span>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-amber-950 font-medium space-y-1 leading-relaxed">
                    {selectedItem.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Mini-Quiz */}
              {selectedItem.quiz && selectedItem.quiz.length > 0 && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        <span>Bài tập thực hành củng cố ({selectedItem.quiz.length} câu)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Chọn đáp án đúng nhất để kiểm tra mức độ thấu hiểu bài</p>
                    </div>

                    <button
                      onClick={handleResetQuiz}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Làm lại</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedItem.quiz.map((q, qIdx) => {
                      const userChoice = quizAnswers[qIdx];
                      const isAnswered = !!userChoice;
                      const isCorrect = userChoice === q.correctAnswer;

                      return (
                        <div key={qIdx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                          <p className="text-xs sm:text-sm font-black text-slate-900">
                            Câu {qIdx + 1}: {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userChoice === opt;
                              let btnClass = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30';

                              if (showQuizResults) {
                                if (opt === q.correctAnswer) {
                                  btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 font-black shadow-xs';
                                } else if (isSelected && !isCorrect) {
                                  btnClass = 'bg-rose-500 text-white border-2 border-rose-600 font-black';
                                } else {
                                  btnClass = 'bg-white border-slate-200 text-slate-400 opacity-60';
                                }
                              } else if (isSelected) {
                                btnClass = 'bg-indigo-50 border-2 border-indigo-600 text-indigo-950 font-black';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, opt)}
                                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {showQuizResults && opt === q.correctAnswer && (
                                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                  )}
                                  {showQuizResults && isSelected && !isCorrect && (
                                    <XCircle className="w-4 h-4 text-white shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          {showQuizResults && (
                            <div className={`p-4 rounded-xl text-xs space-y-1.5 ${
                              isCorrect 
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' 
                                : 'bg-rose-50 border border-rose-200 text-rose-950'
                            }`}>
                              <span className="font-black text-xs block">
                                {isCorrect ? '✓ Chính xác!' : `✕ Chưa đúng! Đáp án chính xác là: ${q.correctAnswer}`}
                              </span>
                              <p className="text-xs leading-relaxed font-medium">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!showQuizResults && (
                    <button
                      onClick={() => setShowQuizResults(true)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      Kiểm tra đáp án & Xem giải thích
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
              Vui lòng chọn một chủ điểm ngữ pháp từ danh sách bên trái để bắt đầu học.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
