import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question } from '../types';
import { INITIAL_EXAMS } from '../data/englishData';
import { Play, Timer, CheckCircle, Award, AlertCircle, RefreshCw, FileText, ChevronRight } from 'lucide-react';

interface ExamSectionProps {
  onAddTestResult: (result: {
    examTitle: string;
    category: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: string;
  }) => void;
}

export default function ExamSection({ onAddTestResult }: ExamSectionProps) {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTest, setActiveTest] = useState<boolean>(false);
  
  // Test gameplay states
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [initialTimeLimit, setInitialTimeLimit] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start test session
  const startExam = (exam: Exam) => {
    setSelectedExam(exam);
    setUserAnswers({});
    setIsSubmitted(false);
    setTimeRemaining(exam.timeLimit * 60);
    setInitialTimeLimit(exam.timeLimit * 60);
    setActiveTest(true);
  };

  // Timer effect
  useEffect(() => {
    if (activeTest && !isSubmitted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true); // Auto-submit when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTest, isSubmitted, timeRemaining]);

  // Handle Radio Option Changes
  const handleSelectOption = (questionId: number, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  // Handle Text Spelling input
  const handleTextInput = (questionId: number, text: string) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [questionId]: text
    });
  };

  // Submission
  const handleSubmit = (forceAuto = false) => {
    if (isSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (!forceAuto) {
      const unansweredCount = selectedExam!.questions.length - Object.keys(userAnswers).length;
      if (unansweredCount > 0) {
        if (!confirm(`Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn chắc chắn muốn nộp bài?`)) {
          // Restart timer
          setTimeRemaining(timeRemaining);
          return;
        }
      }
    }

    // Calculate score
    let correctCount = 0;
    selectedExam!.questions.forEach((q) => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      if (uAns === cAns) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / selectedExam!.questions.length) * 100);
    setIsSubmitted(true);

    const secondsSpent = initialTimeLimit - timeRemaining;
    const minutes = Math.floor(secondsSpent / 60);
    const seconds = secondsSpent % 60;
    const formattedTimeSpent = `${minutes}m ${seconds}s`;

    // Save test result up to global context
    onAddTestResult({
      examTitle: selectedExam!.title,
      category: selectedExam!.category,
      score: calculatedScore,
      correctAnswers: correctCount,
      totalQuestions: selectedExam!.questions.length,
      timeSpent: formattedTimeSpent
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="exam-section-container" className="space-y-6">
      {!activeTest ? (
        /* List of Exams Available */
        <div className="space-y-4">
          <div className="text-center max-w-md mx-auto mb-6">
            <h3 className="text-xl font-bold text-slate-800">Hệ Thống Luyện Đề Thi Tiếng Anh</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tuyển tập đề thi thử trắc nghiệm có cấu trúc và thời gian giới hạn sát với thực tế giúp nâng cao chứng chỉ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase">
                      {exam.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{exam.timeLimit} phút</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{exam.title}</h4>
                  <p className="text-xs text-slate-400">Gồm {exam.questions.length} câu hỏi tự luận & trắc nghiệm.</p>
                </div>

                <button
                  onClick={() => startExam(exam)}
                  className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1 active:scale-95 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Bắt đầu thi thử</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Test Taking Screen */
        <div className="space-y-6">
          {/* Sticky Test Header */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex items-center justify-between sticky top-4 z-10">
            <div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                {selectedExam?.category}
              </span>
              <h3 className="font-bold text-slate-800 text-xs md:text-sm mt-1">{selectedExam?.title}</h3>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                timeRemaining < 120 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
              }`}>
                <Timer className="w-4 h-4" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
              {!isSubmitted ? (
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition active:scale-95"
                >
                  Nộp bài
                </button>
              ) : (
                <button
                  onClick={() => setActiveTest(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition active:scale-95"
                >
                  Thoát phòng thi
                </button>
              )}
            </div>
          </div>

          {/* Test Questions Loop */}
          <div className="space-y-6">
            {selectedExam?.questions.map((q, idx) => {
              const uAns = userAnswers[q.id] || '';
              const isCorrect = uAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-rose-200 bg-rose-50/10'
                      : 'border-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Câu {idx + 1}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mb-4 leading-relaxed">
                    {q.text}
                  </p>

                  {/* Answers layout */}
                  {q.type === 'MCQ' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = uAns === opt;
                        let optionStyle = "border-slate-200 hover:bg-slate-50";

                        if (isSubmitted) {
                          if (opt === q.correctAnswer) {
                            optionStyle = "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold";
                          } else if (isChosen) {
                            optionStyle = "border-rose-300 bg-rose-50 text-rose-800";
                          } else {
                            optionStyle = "border-slate-100 text-slate-400 opacity-60";
                          }
                        } else if (isChosen) {
                          optionStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`text-left px-4 py-2.5 border rounded-xl text-xs transition ${optionStyle}`}
                          >
                            <span className="font-mono text-[10px] text-slate-400 mr-2 uppercase">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Text input answers spelling */
                    <div className="max-w-md">
                      <input
                        type="text"
                        disabled={isSubmitted}
                        className={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 ${
                          isSubmitted
                            ? isCorrect
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                              : 'border-rose-300 bg-rose-50 text-rose-800'
                            : 'border-slate-200 focus:ring-indigo-500'
                        }`}
                        placeholder="Nhập câu trả lời viết tay của bạn..."
                        value={uAns}
                        onChange={(e) => handleTextInput(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* Submit Feedback explanation details */}
                  {isSubmitted && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`} />
                      <div>
                        <p className="font-bold mb-1">
                          {isCorrect ? 'Trả lời đúng!' : `Đáp án đúng: "${q.correctAnswer}"`}
                        </p>
                        <p className="text-slate-500">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom actions summary after submit */}
          {isSubmitted && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center space-y-4 shadow-sm max-w-md mx-auto">
              <Award className="w-12 h-12 text-indigo-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Tổng quan kết quả làm đề</h3>
              <p className="text-sm text-slate-500">
                Kết quả đã được cập nhật thành công lên hồ sơ thành viên.
              </p>
              <button
                onClick={() => setActiveTest(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition active:scale-95"
              >
                Trở lại danh sách đề thi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
