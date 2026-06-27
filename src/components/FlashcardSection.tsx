import React, { useState } from 'react';
import { Vocabulary } from '../types';
import { RefreshCw, Check, X, ArrowLeft, ArrowRight, Shuffle, Volume2 } from 'lucide-react';

interface FlashcardSectionProps {
  vocabularies: Vocabulary[];
  onUpdateVocab: (updated: Vocabulary[]) => void;
}

export default function FlashcardSection({ vocabularies, onUpdateVocab }: FlashcardSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [localVocabs, setLocalVocabs] = useState<Vocabulary[]>(vocabularies);

  if (localVocabs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 max-w-lg mx-auto">
        <p className="text-sm text-slate-400">Danh sách từ vựng trống. Hãy thêm từ vựng để học Flashcard!</p>
      </div>
    );
  }

  const current = localVocabs[currentIndex] || localVocabs[0];

  // TTS audio pronunciation
  const playAudio = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % localVocabs.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + localVocabs.length) % localVocabs.length);
    }, 150);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...localVocabs].sort(() => Math.random() - 0.5);
    setLocalVocabs(shuffled);
    setCurrentIndex(0);
    setShuffleActive(true);
    setTimeout(() => setShuffleActive(false), 800);
  };

  const markKnown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map((v) =>
      v.id === current.id ? { ...v, isLearned: true } : v
    );
    onUpdateVocab(updated);
    // update local state so current updates
    setLocalVocabs(localVocabs.map((v) =>
      v.id === current.id ? { ...v, isLearned: true } : v
    ));
    handleNext();
  };

  const markUnknown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vocabularies.map((v) =>
      v.id === current.id ? { ...v, isLearned: false } : v
    );
    onUpdateVocab(updated);
    // update local state
    setLocalVocabs(localVocabs.map((v) =>
      v.id === current.id ? { ...v, isLearned: false } : v
    ));
    handleNext();
  };

  return (
    <div id="flashcard-section-container" className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800">Thẻ từ vựng (Flashcard)</h3>
        <p className="text-xs text-slate-500">
          Click vào thẻ để lật, nhấp nút bên dưới để xác định tiến độ học của bạn.
        </p>
      </div>

      {/* Card Wrapper */}
      <div
        id="flashcard-card"
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-80 w-full cursor-pointer select-none perspective"
      >
        <div
          className={`relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 preserve-3d border border-slate-100 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT Side */}
          <div className={`absolute inset-0 h-full w-full rounded-2xl bg-white p-6 backface-hidden flex flex-col justify-between transition-all duration-300 border border-slate-150 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase">
                {current.partOfSpeech}
              </span>
              <span>
                {currentIndex + 1} / {localVocabs.length}
              </span>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{current.word}</h2>
                <button
                  onClick={(e) => playAudio(current.word, e)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-500 rounded-full transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {current.ipa && <p className="text-sm font-mono text-slate-400">{current.ipa}</p>}
            </div>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nhấp để lật nghĩa</span>
            </div>
          </div>

          {/* BACK Side */}
          <div className={`absolute inset-0 h-full w-full rounded-2xl bg-indigo-950 text-white p-6 rotate-y-180 backface-hidden flex flex-col justify-between transition-all duration-300 ${
            isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold">
              <span className="bg-indigo-800/60 px-2.5 py-1 rounded-full uppercase">
                {current.topic}
              </span>
              <span className="text-emerald-400 uppercase font-black tracking-wider text-[10px]">
                Nghĩa tiếng Việt
              </span>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black tracking-tight text-white leading-normal">{current.meaning}</h3>
              {current.example && (
                <div className="max-w-xs mx-auto space-y-2 bg-indigo-900/40 p-4 rounded-xl border border-indigo-800/30">
                  <p className="text-xs text-indigo-200 italic leading-relaxed">"{current.example}"</p>
                  <p className="text-[11px] text-emerald-300 font-medium">{current.exampleMeaning}</p>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-indigo-300">
              Nhấp để xem lại từ tiếng Anh
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handlePrev}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-xl transition active:scale-95 shadow-sm"
          title="Trước"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex space-x-3">
          <button
            onClick={markUnknown}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition active:scale-95 border border-rose-100"
            title="Chưa thuộc"
          >
            <X className="w-4 h-4" />
            <span>Chưa nhớ</span>
          </button>
          <button
            onClick={markKnown}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold transition active:scale-95 border border-emerald-100"
            title="Đã thuộc"
          >
            <Check className="w-4 h-4" />
            <span>Đã nhớ</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-xl transition active:scale-95 shadow-sm"
          title="Sau"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={handleShuffle}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition active:scale-95 ${
            shuffleActive ? 'animate-bounce' : ''
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Trộn thẻ ngẫu nhiên</span>
        </button>
      </div>
    </div>
  );
}
