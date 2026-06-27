import React, { useState, useEffect, useRef } from 'react';
import { Vocabulary } from '../types';
import { Play, RotateCcw, CheckCircle2, XCircle, Timer, Volume2, Award, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  id: number;
  type: 'MCQ' | 'FILL_IN' | 'DICTATION' | 'PART_OF_SPEECH';
  word: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizSectionProps {
  vocabularies: Vocabulary[];
  onAddScore: (score: number, wordsCount: number) => void;
}

export default function QuizSection({ vocabularies, onAddScore }: QuizSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Timer state
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate questions based on existing vocab list
  const generateQuiz = () => {
    if (vocabularies.length < 4) {
      return;
    }

    const quizList: QuizQuestion[] = [];
    const shuffledVocabs = [...vocabularies].sort(() => Math.random() - 0.5);

    shuffledVocabs.forEach((vocab, index) => {
      // Pick 3 wrong options from other words' meanings or words
      const otherVocabs = vocabularies.filter(v => v.id !== vocab.id);
      const wrongMeanings = otherVocabs.map(v => v.meaning).slice(0, 3);
      const wrongWords = otherVocabs.map(v => v.word).slice(0, 3);

      // Randomly assign a question type
      const types: ('MCQ' | 'FILL_IN' | 'DICTATION' | 'PART_OF_SPEECH')[] = ['MCQ', 'FILL_IN', 'DICTATION', 'PART_OF_SPEECH'];
      const currentType = types[index % types.length];

      if (currentType === 'MCQ') {
        const options = [...wrongMeanings, vocab.meaning].sort(() => Math.random() - 0.5);
        quizList.push({
          id: index + 1,
          type: 'MCQ',
          word: vocab.word,
          text: `Từ "${vocab.word}" (${vocab.partOfSpeech}) có nghĩa tiếng Việt là gì?`,
          options,
          correctAnswer: vocab.meaning,
          explanation: `"${vocab.word}" nghĩa là "${vocab.meaning}". Ví dụ: ${vocab.example || 'N/A'}`
        });
      } else if (currentType === 'FILL_IN') {
        quizList.push({
          id: index + 1,
          type: 'FILL_IN',
          word: vocab.word,
          text: `Dịch nghĩa "${vocab.meaning}" sang tiếng Anh. Điền từ còn thiếu vào ô trống dưới đây:`,
          options: [],
          correctAnswer: vocab.word.toLowerCase().trim(),
          explanation: `Từ cần điền là "${vocab.word}". Phiên âm: ${vocab.ipa || ''}`
        });
      } else if (currentType === 'DICTATION') {
        quizList.push({
          id: index + 1,
          type: 'DICTATION',
          word: vocab.word,
          text: `Hãy bấm nút loa để nghe và gõ lại chính tả từ tiếng Anh bạn nghe được:`,
          options: [],
          correctAnswer: vocab.word.toLowerCase().trim(),
          explanation: `Từ phát âm là "${vocab.word}" [${vocab.ipa || ''}], mang nghĩa "${vocab.meaning}".`
        });
      } else if (currentType === 'PART_OF_SPEECH') {
        const options = ['Noun', 'Verb', 'Adjective', 'Adverb'].sort(() => Math.random() - 0.5);
        quizList.push({
          id: index + 1,
          type: 'PART_OF_SPEECH',
          word: vocab.word,
          text: `Từ vựng "${vocab.word}" (${vocab.meaning}) thuộc loại từ (Part of Speech) nào?`,
          options,
          correctAnswer: vocab.partOfSpeech,
          explanation: `"${vocab.word}" là một "${vocab.partOfSpeech}".`
        });
      }
    });

    setQuestions(quizList.slice(0, 10)); // limit to 10 questions
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTimeSpent(0);
    setIsAnswered(false);
    setSelectedOption('');
    setTypedAnswer('');
    setIsPlaying(true);
  };

  // Timer effect
  useEffect(() => {
    if (isPlaying && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isAnswered, currentIndex]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentQ = questions[currentIndex];

  // Auto pronunce dictation on question change
  useEffect(() => {
    if (currentQ && currentQ.type === 'DICTATION') {
      setTimeout(() => {
        handleSpeak(currentQ.word);
      }, 500);
    }
  }, [currentIndex, isPlaying]);

  const handleSubmit = () => {
    if (isAnswered) return;

    let isCorrect = false;
    if (currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH') {
      if (!selectedOption) return;
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else {
      if (!typedAnswer.trim()) return;
      isCorrect = typedAnswer.trim().toLowerCase() === currentQ.correctAnswer;
    }

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsAnswered(false);
      setSelectedOption('');
      setTypedAnswer('');
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quiz ended
      setIsPlaying(false);
      onAddScore(score, questions.length);
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (vocabularies.length < 4) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 max-w-md mx-auto text-center space-y-4">
        <p className="text-slate-500 text-sm">
          Bạn cần có ít nhất 4 từ vựng trong danh sách học tập để hệ thống có thể tạo Quiz trắc nghiệm phong phú.
        </p>
        <p className="text-xs text-slate-400">Hiện tại bạn có {vocabularies.length} từ vựng.</p>
      </div>
    );
  }

  return (
    <div id="quiz-section-container" className="max-w-xl mx-auto">
      {!isPlaying && questions.length === 0 ? (
        /* Start Screen */
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">Luyện Tập Từ Vựng</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Bài ôn tập trắc nghiệm ngẫu nhiên gồm 10 câu hỏi, phối hợp nhiều dạng bài: trắc nghiệm ngữ nghĩa, viết chính tả, loại từ và điền từ khuyết.
            </p>
          </div>
          <button
            onClick={generateQuiz}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 active:scale-95 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Bắt đầu ôn tập (10 câu)</span>
          </button>
        </div>
      ) : !isPlaying && questions.length > 0 ? (
        /* Results / End Screen */
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <Award className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">Kết Quả Ôn Tập!</h3>
            <p className="text-sm text-slate-400">Bạn đã hoàn thành bài luyện tập từ vựng xuất sắc.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Tổng Điểm</p>
              <p className="text-xl font-black text-indigo-600 mt-1">{score} / 100</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Đúng</p>
              <p className="text-xl font-black text-emerald-600 mt-1">{correctCount} / 10</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Thời Gian</p>
              <p className="text-xl font-black text-slate-700 mt-1">{formatTime(timeSpent)}</p>
            </div>
          </div>

          <button
            onClick={generateQuiz}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại Quiz mới</span>
          </button>
        </div>
      ) : (
        /* Quiz Active Playing */
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Đúng: {correctCount} / {questions.length}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 text-sm font-mono font-semibold">
              <Timer className="w-4 h-4 text-indigo-500" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <p className="text-base font-bold text-slate-800 leading-relaxed">
              {currentQ.text}
            </p>

            {/* Dictation Sound player utility */}
            {currentQ.type === 'DICTATION' && (
              <div className="flex justify-center p-3">
                <button
                  onClick={() => handleSpeak(currentQ.word)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe Phát Âm</span>
                </button>
              </div>
            )}
          </div>

          {/* Options / Input Form */}
          <div className="space-y-3">
            {currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH' ? (
              /* MCQ choices grid */
              <div className="grid grid-cols-1 gap-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  let optStyle = "border-slate-200 text-slate-700 hover:border-indigo-100 hover:bg-indigo-50/20";
                  if (isAnswered) {
                    if (opt === currentQ.correctAnswer) {
                      optStyle = "border-emerald-200 bg-emerald-50 text-emerald-700";
                    } else if (isSelected) {
                      optStyle = "border-rose-200 bg-rose-50 text-rose-700";
                    } else {
                      optStyle = "border-slate-100 text-slate-400 opacity-60";
                    }
                  } else if (isSelected) {
                    optStyle = "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold";
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left px-4 py-3 border rounded-xl text-xs transition ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Text Input spelling fill in */
              <div>
                <input
                  type="text"
                  disabled={isAnswered}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-1 ${
                    isAnswered
                      ? typedAnswer.trim().toLowerCase() === currentQ.correctAnswer
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                  placeholder="Gõ từ tiếng Anh của bạn tại đây..."
                  value={typedAnswer}
                  onChange={e => setTypedAnswer(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isAnswered) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            {!isAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={
                  (currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH' ? !selectedOption : !typedAnswer.trim())
                }
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl text-xs transition active:scale-95 shadow-sm"
              >
                Kiểm tra kết quả
              </button>
            ) : (
              /* Explanation & Next controls */
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
                  (currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH' ? selectedOption === currentQ.correctAnswer : typedAnswer.toLowerCase().trim() === currentQ.correctAnswer)
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {(currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH' ? selectedOption === currentQ.correctAnswer : typedAnswer.toLowerCase().trim() === currentQ.correctAnswer) ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <strong className="block font-bold mb-1">
                      {(currentQ.type === 'MCQ' || currentQ.type === 'PART_OF_SPEECH' ? selectedOption === currentQ.correctAnswer : typedAnswer.toLowerCase().trim() === currentQ.correctAnswer) ? 'Chính xác!' : `Chưa đúng! Đáp án đúng: "${currentQ.correctAnswer}"`}
                    </strong>
                    <span>{currentQ.explanation}</span>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 active:scale-95 shadow-md"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả chung cuộc'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
