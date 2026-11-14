import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Vocabulary } from '../types';
import { 
  RefreshCw, Check, X, ArrowLeft, ArrowRight, Shuffle, Volume2, 
  Flame, Zap, Keyboard, Eye, EyeOff, Layers, Headphones, 
  HelpCircle, Sparkles, CheckCircle2, AlertCircle, RotateCcw,
  SlidersHorizontal, Bookmark, BookOpen
} from 'lucide-react';

interface FlashcardSectionProps {
  vocabularies: Vocabulary[];
  onUpdateVocab: (updated: Vocabulary[]) => void;
}

type StudyMode = 'flashcard' | 'speed' | 'spelling' | 'listening';

export default function FlashcardSection({ vocabularies, onUpdateVocab }: FlashcardSectionProps) {
  // Study Modes
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');
  
  // Topic & Filter (Default to UNLEARNED so words already learned don't clutter the study session)
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [filterLearned, setFilterLearned] = useState<'ALL' | 'UNLEARNED' | 'LEARNED'>('UNLEARNED');

  // Dynamic available topics from actual dataset
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    vocabularies.forEach(v => {
      if (v.topic) set.add(v.topic);
    });
    return Array.from(set).sort();
  }, [vocabularies]);

  // Filtered Vocabulary Pool - Strictly respects the chosen filter
  const filteredVocabs = useMemo(() => {
    let list = vocabularies;
    if (selectedTopic !== 'ALL') {
      list = list.filter(v => v.topic === selectedTopic);
    }
    if (filterLearned === 'UNLEARNED') {
      list = list.filter(v => !v.isLearned);
    } else if (filterLearned === 'LEARNED') {
      list = list.filter(v => v.isLearned);
    }
    return list;
  }, [vocabularies, selectedTopic, filterLearned]);

  // Current Card Index & State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionLearnedCount, setSessionLearnedCount] = useState(0);

  // Track filter changes to reset index & ensure front face
  const filterKey = `${selectedTopic}_${filterLearned}`;
  const prevFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      setCurrentIndex(0);
      setIsFlipped(false);
      setDragOffset(0);
    }
  }, [filterKey]);

  // Ensure currentIndex stays within bounds if filteredVocabs shrinks
  const safeIndex = filteredVocabs.length > 0 ? (currentIndex < filteredVocabs.length ? currentIndex : 0) : 0;
  const current = filteredVocabs[safeIndex] || null;

  // -------------------------------------------------------------
  // MOUSE & TOUCH DRAG GESTURE LOGIC (Kéo phải = Đã nhớ, Kéo trái = Chưa nhớ)
  // Prevents drag movements from falsely triggering the click/flip event!
  // -------------------------------------------------------------
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const justSwipedRef = useRef<boolean>(false);
  const dragThreshold = 70;

  const handleDragStart = (clientX: number) => {
    dragStartXRef.current = clientX;
    dragDistanceRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const delta = clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (dragOffset > dragThreshold) {
      // Swiped Right -> ĐÃ THUỘC (Learned)
      justSwipedRef.current = true;
      setTimeout(() => { justSwipedRef.current = false; }, 350);
      setIsFlipped(false);
      triggerMarkKnown();
    } else if (dragOffset < -dragThreshold) {
      // Swiped Left -> CHƯA THUỘC (Review)
      justSwipedRef.current = true;
      setTimeout(() => { justSwipedRef.current = false; }, 350);
      setIsFlipped(false);
      triggerMarkUnknown();
    } else {
      // Snap back to center without flipping
      setDragOffset(0);
      if (dragDistanceRef.current > 10) {
        justSwipedRef.current = true;
        setTimeout(() => { justSwipedRef.current = false; }, 350);
      }
    }
  };

  // -------------------------------------------------------------
  // AUDIO PRONUNCIATION (Speech Synthesis)
  // -------------------------------------------------------------
  const playAudio = useCallback((text: string, rate = 0.9, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // -------------------------------------------------------------
  // ACTIONS: NEXT, PREV, MARK KNOWN, MARK UNKNOWN
  // All actions reset isFlipped to false so the next card ALWAYS starts on the front face
  // -------------------------------------------------------------
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setDragOffset(0);
    if (filteredVocabs.length > 0) {
      setCurrentIndex(prev => (prev + 1) % filteredVocabs.length);
    }
  }, [filteredVocabs.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setDragOffset(0);
    if (filteredVocabs.length > 0) {
      setCurrentIndex(prev => (prev - 1 + filteredVocabs.length) % filteredVocabs.length);
    }
  }, [filteredVocabs.length]);

  const triggerMarkKnown = useCallback(() => {
    if (!current) return;
    setIsFlipped(false);
    setDragOffset(0);
    setStreak(s => s + 1);
    setSessionLearnedCount(c => c + 1);

    // Save to server/parent
    const updated = vocabularies.map(v => (v.id === current.id ? { ...v, isLearned: true } : v));
    onUpdateVocab(updated);

    // When studying UNLEARNED words, current word leaves this pool
    // Since item at safeIndex is removed, next item automatically occupies safeIndex
    if (filterLearned === 'UNLEARNED') {
      setCurrentIndex(prev => (prev >= filteredVocabs.length - 1 ? 0 : prev));
    } else {
      setCurrentIndex(prev => (prev + 1) % (filteredVocabs.length || 1));
    }
  }, [current, filterLearned, filteredVocabs.length, vocabularies, onUpdateVocab]);

  const triggerMarkUnknown = useCallback(() => {
    if (!current) return;
    setIsFlipped(false);
    setDragOffset(0);
    setStreak(0);

    // Save to server/parent
    const updated = vocabularies.map(v => (v.id === current.id ? { ...v, isLearned: false } : v));
    onUpdateVocab(updated);

    if (filterLearned === 'LEARNED') {
      setCurrentIndex(prev => (prev >= filteredVocabs.length - 1 ? 0 : prev));
    } else {
      setCurrentIndex(prev => (prev + 1) % (filteredVocabs.length || 1));
    }
  }, [current, filterLearned, filteredVocabs.length, vocabularies, onUpdateVocab]);

  const handleShuffle = () => {
    setIsFlipped(false);
    setDragOffset(0);
    const shuffled = [...filteredVocabs].sort(() => Math.random() - 0.5);
    onUpdateVocab(shuffled);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }
      if (studyMode === 'flashcard') {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          triggerMarkKnown();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          triggerMarkUnknown();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          if (current) playAudio(current.word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studyMode, current, triggerMarkKnown, triggerMarkUnknown, playAudio]);

  // -------------------------------------------------------------
  // SPEED REVIEW (MEMRISE STYLE)
  // -------------------------------------------------------------
  const [speedOptions, setSpeedOptions] = useState<string[]>([]);
  const [speedTimer, setSpeedTimer] = useState<number>(10);
  const [speedAnswerStatus, setSpeedAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [speedSelectedOption, setSpeedSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (studyMode !== 'speed' || !current) return;

    setSpeedAnswerStatus('idle');
    setSpeedSelectedOption(null);
    setSpeedTimer(10);

    const correctMeaning = current.meaning;
    const others = vocabularies
      .filter(v => v.id !== current.id && v.meaning && v.meaning !== correctMeaning)
      .map(v => v.meaning);

    const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [...shuffledOthers, correctMeaning].sort(() => 0.5 - Math.random());
    setSpeedOptions(all);
  }, [studyMode, safeIndex, current, vocabularies]);

  useEffect(() => {
    if (studyMode !== 'speed' || speedAnswerStatus !== 'idle') return;

    if (speedTimer <= 0) {
      setSpeedAnswerStatus('wrong');
      setStreak(0);
      setTimeout(handleNext, 1200);
      return;
    }

    const timer = setInterval(() => {
      setSpeedTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [studyMode, speedTimer, speedAnswerStatus, handleNext]);

  const handleSpeedChoice = (option: string) => {
    if (speedAnswerStatus !== 'idle') return;
    setSpeedSelectedOption(option);

    if (option === current.meaning) {
      setSpeedAnswerStatus('correct');
      setStreak(s => s + 1);
      setSessionLearnedCount(c => c + 1);
      setTimeout(handleNext, 800);
    } else {
      setSpeedAnswerStatus('wrong');
      setStreak(0);
      setTimeout(handleNext, 1400);
    }
  };

  // -------------------------------------------------------------
  // SPELLING / TYPING MODE
  // -------------------------------------------------------------
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingResult, setSpellingResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSpellingInput('');
    setSpellingResult('idle');
    setShowHint(false);
  }, [safeIndex, studyMode]);

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spellingInput.trim() || spellingResult !== 'idle') return;

    const cleanInput = spellingInput.trim().toLowerCase();
    const cleanWord = current.word.trim().toLowerCase();

    if (cleanInput === cleanWord) {
      setSpellingResult('correct');
      playAudio(current.word);
      setStreak(s => s + 1);
      setSessionLearnedCount(c => c + 1);
      setTimeout(handleNext, 900);
    } else {
      setSpellingResult('wrong');
      setStreak(0);
      setTimeout(() => setSpellingResult('idle'), 1500);
    }
  };

  // -------------------------------------------------------------
  // LISTENING MODE
  // -------------------------------------------------------------
  const [listeningOptions, setListeningOptions] = useState<string[]>([]);
  const [listeningSelected, setListeningSelected] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    if (studyMode !== 'listening' || !current) return;
    setListeningSelected(null);
    setListeningStatus('idle');

    const timer = setTimeout(() => {
      playAudio(current.word);
    }, 300);

    const correctMeaning = current.meaning;
    const others = vocabularies
      .filter(v => v.id !== current.id && v.meaning && v.meaning !== correctMeaning)
      .map(v => v.meaning);

    const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [...shuffledOthers, correctMeaning].sort(() => 0.5 - Math.random());
    setListeningOptions(all);

    return () => clearTimeout(timer);
  }, [studyMode, safeIndex, current, vocabularies, playAudio]);

  const handleListeningChoice = (option: string) => {
    if (listeningStatus !== 'idle') return;
    setListeningSelected(option);

    if (option === current.meaning) {
      setListeningStatus('correct');
      setStreak(s => s + 1);
      setSessionLearnedCount(c => c + 1);
      setTimeout(handleNext, 800);
    } else {
      setListeningStatus('wrong');
      setStreak(0);
      setTimeout(handleNext, 1400);
    }
  };

  // -------------------------------------------------------------
  // PART OF SPEECH FORMATTING HELPER
  // -------------------------------------------------------------
  const formatPartOfSpeech = (pos?: string) => {
    const p = (pos || '').toLowerCase();
    if (p.includes('phrasal') || p.includes('cụm')) {
      return { label: 'Phrasal Verb • Cụm Động từ', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (p.includes('verb') || p === 'v') {
      return { label: 'Verb • Động từ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (p.includes('noun') || p === 'n') {
      return { label: 'Noun • Danh từ', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (p.includes('adj') || p.includes('tính')) {
      return { label: 'Adjective • Tính từ', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (p.includes('adv') || p.includes('trạng')) {
      return { label: 'Adverb • Trạng từ', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (p.includes('idiom') || p.includes('ngữ')) {
      return { label: 'Idiom • Thành ngữ', bg: 'bg-pink-50 text-pink-700 border-pink-200' };
    }
    return { label: pos || 'Từ vựng', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  const posInfo = formatPartOfSpeech(current?.partOfSpeech);

  if (!current || filteredVocabs.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto shadow-sm space-y-3">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="font-bold text-slate-700">Không tìm thấy từ vựng phù hợp!</h4>
        <p className="text-xs text-slate-400">Hãy thay đổi bộ lọc chủ đề hoặc trạng thái để bắt đầu học.</p>
        <button
          onClick={() => { setSelectedTopic('ALL'); setFilterLearned('ALL'); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div id="flashcard-section-container" className="max-w-2xl mx-auto space-y-6 select-none">
      {/* Top Header: Mode Switcher & Stats */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => { setStudyMode('flashcard'); setIsFlipped(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Thẻ lật 3D</span>
            </button>
            <button
              onClick={() => { setStudyMode('speed'); setIsFlipped(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                studyMode === 'speed' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tốc độ (Memrise)</span>
            </button>
            <button
              onClick={() => { setStudyMode('spelling'); setIsFlipped(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                studyMode === 'spelling' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Gõ từ vựng</span>
            </button>
            <button
              onClick={() => { setStudyMode('listening'); setIsFlipped(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                studyMode === 'listening' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Luyện nghe</span>
            </button>
          </div>

          {/* Streak & Score Counter */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-black">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>Streak: {streak}</span>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã nhớ: {sessionLearnedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="ALL">Tất cả chủ đề ({vocabularies.length})</option>
              {availableTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterLearned}
              onChange={e => setFilterLearned(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="UNLEARNED">Chưa thuộc ({vocabularies.filter(v => !v.isLearned).length})</option>
              <option value="LEARNED">Đã thuộc ({vocabularies.filter(v => v.isLearned).length})</option>
              <option value="ALL">Tất cả ({vocabularies.length})</option>
            </select>
          </div>

          {/* Shuffle & Progress */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-400 text-xs font-semibold">
              {filteredVocabs.length > 0 ? `${safeIndex + 1} / ${filteredVocabs.length}` : '0 / 0'}
            </span>
            <button
              onClick={handleShuffle}
              disabled={filteredVocabs.length === 0}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
              title="Trộn ngẫu nhiên danh sách"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Spaced Repetition Review Trigger Banner */}
        {filterLearned !== 'LEARNED' && vocabularies.filter(v => v.isLearned).length > 0 && (
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 px-4 flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-900">
                Ôn tập nhắc lại: Bạn đã tích lũy <strong>{vocabularies.filter(v => v.isLearned).length} từ đã thuộc</strong>. Ôn tập định kỳ để không bị quên!
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterLearned('LEARNED');
                setCurrentIndex(0);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>Ôn tập ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {filterLearned === 'LEARNED' && (
          <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-3 px-4 flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-bold text-indigo-900">
                Chế độ: <strong>Ôn tập từ đã thuộc ({filteredVocabs.length} từ)</strong>. Nếu gặp từ chưa nhớ rõ, hãy bấm "Chưa nhớ" để chuyển về học lại!
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterLearned('UNLEARNED');
                setCurrentIndex(0);
              }}
              className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition"
            >
              Học từ mới
            </button>
          </div>
        )}

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${filteredVocabs.length > 0 ? Math.round(((safeIndex + 1) / filteredVocabs.length) * 100) : 0}%` }}
          ></div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: 3D SWIPE & FLIP FLASHCARD                         */}
      {/* ========================================================= */}
      {studyMode === 'flashcard' && (
        <div className="space-y-4">
          {filteredVocabs.length === 0 ? (
            /* Empty State: All words in category have been learned! */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {filterLearned === 'UNLEARNED'
                  ? 'Tuyệt vời! Bạn đã thuộc hết toàn bộ từ vựng trong mục này!'
                  : 'Không có từ vựng nào khớp với bộ lọc hiện tại.'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {filterLearned === 'UNLEARNED'
                  ? 'Tất cả các từ vựng đã được bạn ghi nhớ thành công. Bạn có thể chuyển sang chế độ "Đã thuộc" để ôn tập lại hoặc chọn chủ đề khác.'
                  : 'Hãy chọn chủ đề hoặc trạng thái khác để tiếp tục học tập.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setFilterLearned('LEARNED')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
                >
                  Ôn tập từ đã thuộc ({vocabularies.filter(v => v.isLearned).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLearned('ALL')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Xem tất cả từ ({vocabularies.length})
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Gesture Instruction Banner */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2">
                <span className="flex items-center space-x-1 text-rose-500 font-semibold">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kéo trái: Chưa nhớ</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFlipped(prev => !prev)}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isFlipped ? 'Xem mặt trước (Tiếng Anh)' : 'Lật xem nghĩa (Tiếng Việt)'}</span>
                </button>
                <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                  <span>Kéo phải: Đã thuộc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* 3D Perspective Card Container with Drag Gestures */}
              <div
                className="relative h-80 sm:h-96 w-full cursor-grab active:cursor-grabbing select-none"
                style={{ perspective: '1200px' }}
                onMouseDown={e => handleDragStart(e.clientX)}
                onMouseMove={e => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={e => handleDragStart(e.touches[0].clientX)}
                onTouchMove={e => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
              >
                {/* Stamp Overlays based on Drag Direction */}
                <div
                  className={`absolute top-6 right-6 z-30 px-5 py-2.5 border-3 border-emerald-500 bg-emerald-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transform rotate-12 transition-all duration-150 pointer-events-none ${
                    dragOffset > 25 ? 'opacity-100 scale-105' : 'opacity-0 scale-90'
                  }`}
                >
                  ĐÃ THUỘC ✓
                </div>
                <div
                  className={`absolute top-6 left-6 z-30 px-5 py-2.5 border-3 border-rose-500 bg-rose-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transform -rotate-12 transition-all duration-150 pointer-events-none ${
                    dragOffset < -25 ? 'opacity-100 scale-105' : 'opacity-0 scale-90'
                  }`}
                >
                  CHƯA NHỚ ✕
                </div>

                {/* The Actual 3D Rotating Card Container */}
                <div
                  onClick={() => {
                    // Only flip if it was NOT a drag/swipe gesture!
                    if (justSwipedRef.current || dragDistanceRef.current > 10) {
                      return;
                    }
                    setIsFlipped(prev => !prev);
                  }}
                  style={{
                    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.07}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="relative h-full w-full rounded-3xl shadow-xl select-none cursor-pointer"
                >
              {/* ===================== FRONT FACE ===================== */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className={`absolute inset-0 h-full w-full rounded-3xl bg-white p-7 flex flex-col justify-between border-2 transition-colors duration-200 ${
                  dragOffset > 25
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : dragOffset < -25
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-200 shadow-slate-100'
                }`}
              >
                {/* Front Top: POS & Topic */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${posInfo.bg}`}>
                    {posInfo.label}
                  </span>
                  <span className="font-semibold text-slate-500 text-[11px] bg-slate-100 px-3 py-1 rounded-full">
                    {current.topic || 'General'}
                  </span>
                </div>

                {/* Front Center: Word, IPA, Audio */}
                <div className="text-center space-y-4 my-auto">
                  <div className="flex items-center justify-center space-x-3">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {current.word}
                    </h2>
                    <button
                      type="button"
                      onClick={e => playAudio(current.word, 0.9, e)}
                      className="p-3 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-600 rounded-full transition shadow-sm cursor-pointer"
                      title="Phát âm tiếng Anh chuẩn (US/UK)"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {current.ipa && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-base font-mono text-indigo-600 font-semibold bg-indigo-50/70 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                        {current.ipa}
                      </span>
                    </div>
                  )}

                  {current.difficulty && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Level: {current.difficulty}
                    </span>
                  )}
                </div>

                {/* Front Bottom */}
                <div className="text-center text-xs text-slate-400 flex items-center justify-center space-x-2 pt-2 border-t border-slate-100">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Nhấp thẻ để xem nghĩa • Phím Space để lật</span>
                </div>
              </div>

              {/* ===================== BACK FACE ===================== */}
              <div
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="absolute inset-0 h-full w-full rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-7 flex flex-col justify-between border-2 border-indigo-500 shadow-2xl"
              >
                {/* Back Top */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-bold uppercase tracking-wider text-[11px] bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/60">
                    {current.word} ({posInfo.label.split('•')[0].trim()})
                  </span>
                  <span className="text-emerald-400 uppercase font-black tracking-wider text-[10px] bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                    NGHĨA TIẾNG VIỆT
                  </span>
                </div>

                {/* Back Center: Huge Meaning & Example */}
                <div className="text-center space-y-4 my-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Dịch nghĩa chuẩn</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-white leading-snug drop-shadow-md">
                      {current.meaning || 'Chưa có bản dịch nghĩa'}
                    </h3>
                  </div>

                  {current.example && (
                    <div className="max-w-md mx-auto space-y-2 bg-slate-800/90 p-4 rounded-2xl border border-slate-700/70 text-left">
                      <div className="flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold text-xs shrink-0">Ví dụ:</span>
                        <p className="text-xs text-slate-100 italic leading-relaxed">
                          "{current.example}"
                        </p>
                      </div>
                      {current.exampleMeaning && (
                        <p className="text-[11px] text-emerald-300 font-medium pl-8">
                          → {current.exampleMeaning}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Back Bottom */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <span className="text-indigo-300">Nhấp để xem lại từ tiếng Anh</span>
                  <span className="font-mono text-slate-500">Phím Space để lật</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Flip Action Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isFlipped ? 'Quay lại mặt trước (Từ vựng)' : 'Lật mặt sau (Xem nghĩa & ví dụ)'}</span>
            </button>
          </div>

          {/* Bottom Action Controls: Unknown, Known, Prev, Next */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handlePrev}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl transition active:scale-95 shadow-sm cursor-pointer"
              title="Từ trước đó (Phím Mũi tên trái)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex space-x-2 sm:space-x-3">
              <button
                onClick={triggerMarkUnknown}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 rounded-2xl text-xs font-black transition border border-rose-200 shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>Chưa nhớ</span>
                <span className="hidden sm:inline font-normal opacity-80">(Phím A)</span>
              </button>

              <button
                onClick={triggerMarkKnown}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-black transition shadow-md shadow-emerald-200 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Đã nhớ</span>
                <span className="hidden sm:inline font-normal opacity-80">(Phím D)</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl transition active:scale-95 shadow-sm cursor-pointer"
              title="Từ tiếp theo (Phím Mũi tên phải)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MODE 2: SPEED REVIEW (MEMRISE STYLE)                      */}
      {/* ========================================================= */}
      {studyMode === 'speed' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center space-x-1.5 text-amber-600">
                <Zap className="w-4 h-4" />
                <span>Ôn luyện tốc độ (Memrise)</span>
              </span>
              <span className={`font-mono text-sm font-black ${speedTimer <= 3 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                {speedTimer}s
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  speedTimer <= 3 ? 'bg-rose-500' : speedTimer <= 6 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(speedTimer / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">{current.word}</h2>
              <button
                type="button"
                onClick={() => playAudio(current.word)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            {current.ipa && <p className="text-sm font-mono text-slate-400">{current.ipa}</p>}
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${posInfo.bg}`}>
              {posInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {speedOptions.map((opt, idx) => {
              const isSelected = speedSelectedOption === opt;
              const isCorrect = opt === current.meaning;
              let btnClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300';

              if (speedAnswerStatus !== 'idle') {
                if (isCorrect) {
                  btnClass = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-rose-500 border-rose-600 text-white font-black';
                } else {
                  btnClass = 'bg-slate-50 border-slate-150 text-slate-300 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSpeedChoice(opt)}
                  disabled={speedAnswerStatus !== 'idle'}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: SPELLING & TYPING RECALL                          */}
      {/* ========================================================= */}
      {studyMode === 'spelling' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="text-center space-y-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${posInfo.bg}`}>
              {posInfo.label}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{current.meaning}</h3>
            {current.example && (
              <p className="text-xs text-slate-500 italic max-w-md mx-auto">
                VD: "{current.example.replace(new RegExp(current.word, 'gi'), '_____')}"
              </p>
            )}
          </div>

          <form onSubmit={handleSpellingSubmit} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                className={`w-full px-5 py-4 text-center text-xl font-black rounded-2xl border-2 tracking-wider transition-all duration-200 focus:outline-none ${
                  spellingResult === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : spellingResult === 'wrong'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
                placeholder="Gõ từ tiếng Anh chính xác..."
                value={spellingInput}
                onChange={e => setSpellingInput(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-indigo-600 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Gợi ý ({current.word.length} ký tự)</span>
              </button>

              {showHint && (
                <span className="font-mono font-bold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Bắt đầu bằng: "{current.word.slice(0, 2)}..."
                </span>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black rounded-2xl text-xs transition shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Kiểm tra (Enter)</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Bỏ qua
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 4: LISTENING PRACTICE                                */}
      {/* ========================================================= */}
      {studyMode === 'listening' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="text-center py-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => playAudio(current.word, 0.9)}
                className="p-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-xl shadow-indigo-300 transition cursor-pointer"
                title="Nghe phát âm chuẩn"
              >
                <Volume2 className="w-10 h-10" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-900">Nhấp vào loa để nghe lại</p>
              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => playAudio(current.word, 0.7)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200 cursor-pointer"
                >
                  Nghe chậm (0.7x)
                </button>
                <button
                  type="button"
                  onClick={() => playAudio(current.word, 1.0)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200 cursor-pointer"
                >
                  Bình thường (1.0x)
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chọn nghĩa tương ứng với từ bạn vừa nghe được:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listeningOptions.map((opt, idx) => {
              const isSelected = listeningSelected === opt;
              const isCorrect = opt === current.meaning;
              let btnClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300';

              if (listeningStatus !== 'idle') {
                if (isCorrect) {
                  btnClass = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-rose-500 border-rose-600 text-white font-black';
                } else {
                  btnClass = 'bg-slate-50 border-slate-150 text-slate-300 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleListeningChoice(opt)}
                  disabled={listeningStatus !== 'idle'}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
