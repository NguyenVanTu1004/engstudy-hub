import React, { useState, useEffect } from 'react';
import { Vocabulary, UserProfile, ExamResult, MockUser } from './types';
import { INITIAL_VOCABULARIES, INITIAL_MOCK_USERS } from './data/englishData';

// Subcomponents
import VocabularySection from './components/VocabularySection';
import FlashcardSection from './components/FlashcardSection';
import QuizSection from './components/QuizSection';
import ExamSection from './components/ExamSection';
import DashboardSection from './components/DashboardSection';
import ProfileSection from './components/ProfileSection';
import AdminPanel from './components/AdminPanel';
import JavaCodeViewer from './components/JavaCodeViewer';
import PronunciationSection from './components/PronunciationSection';
import DocumentSection from './components/DocumentSection';
import SettingsSection from './components/SettingsSection';

// Icons
import {
  BookOpen,
  LayoutDashboard,
  Brain,
  GraduationCap,
  Sparkles,
  User,
  Shield,
  Code,
  LogOut,
  HelpCircle,
  LogIn,
  RefreshCw,
  Heart,
  Database,
  Eye,
  EyeOff,
  Volume2,
  FileText,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

const AVATARS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Venus',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Earth',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Mars'
];

export default function App() {
  // Navigation: 'APP' | 'DEV_HUB'
  const [currentMode, setCurrentMode] = useState<'APP' | 'DEV_HUB'>('APP');
  
  // App internal tabs: 'dashboard' | 'vocab' | 'flashcard' | 'quiz' | 'exam' | 'profile' | 'admin' | 'pronounce' | 'document' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vocab' | 'flashcard' | 'quiz' | 'exam' | 'profile' | 'admin' | 'pronounce' | 'document' | 'settings'>('dashboard');

  // Multi-language system state ('VI' | 'EN' | 'JA')
  const [language, setLanguage] = useState<'VI' | 'EN' | 'JA'>('VI');

  // Dark/Light theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const handleToggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Authenticated User State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    username: 'admin',
    email: 'admin@edu.vn',
    fullName: 'Nguyễn Văn Admin',
    avatar: AVATARS[0],
    role: 'ADMIN',
    learnedWordsCount: 6,
    completedTestsCount: 1,
    averageScore: 85,
    history: [
      {
        id: 1,
        examTitle: 'TOEIC Reading Practice Test 01',
        category: 'TOEIC',
        score: 85,
        correctAnswers: 3,
        totalQuestions: 4,
        timeSpent: '5m 12s',
        date: '2026-06-25'
      }
    ],
    studyProgress: []
  });

  // App-wide vocabularies state
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);

  // App-wide users state (for real user count and management)
  const [users, setUsers] = useState<MockUser[]>([]);

  // Authenticated mock auth screen state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register state
  const [regUser, setRegUser] = useState('');
  const [regMail, setRegMail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [regName, setRegName] = useState('');

  // Show/Hide password toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showOtpNewPassword, setShowOtpNewPassword] = useState(false);

  // Database Connection Indicator State
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string; config?: any; error?: string | null; smtpConfigured?: boolean } | null>(null);

  // Password Recovery multi-step state
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify'>('request');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpNewPass, setOtpNewPass] = useState('');
  const [serverProvidedOtp, setServerProvidedOtp] = useState<string | null>(null);

  // Handle digit change
  const handleOtpDigitChange = (index: number, val: string) => {
    const singleChar = val.slice(-1).replace(/[^0-9]/g, '');
    const nextDigits = [...otpDigits];
    nextDigits[index] = singleChar;
    setOtpDigits(nextDigits);
    setOtpCode(nextDigits.join(''));

    // Auto focus next
    if (singleChar && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  // Handle backspace or arrow keys
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
        setOtpCode(nextDigits.join(''));
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          (prevInput as HTMLInputElement).focus();
        }
      } else if (otpDigits[index]) {
        const nextDigits = [...otpDigits];
        nextDigits[index] = '';
        setOtpDigits(nextDigits);
        setOtpCode(nextDigits.join(''));
      }
    }
  };

  // Handle paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6).replace(/[^0-9]/g, '');
    if (pasteData) {
      const chars = pasteData.split('');
      const nextDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = chars[i] || '';
      }
      setOtpDigits(nextDigits);
      setOtpCode(nextDigits.join(''));
      
      // Focus on the last filled or last input
      const lastFocusIndex = Math.min(chars.length, 5);
      const targetInput = document.getElementById(`otp-input-${lastFocusIndex}`);
      if (targetInput) {
        (targetInput as HTMLInputElement).focus();
      }
    }
  };

  // API Callers
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({ connected: false, mode: 'Offline Failover' });
    }
  };

  const fetchVocabularies = async () => {
    try {
      const res = await fetch('/api/vocabularies');
      const data = await res.json();
      if (data.success) {
        if (data.vocabularies.length === 0) {
          console.log("Database empty. Seeding initial vocabulary values automatically...");
          await fetch('/api/vocabularies/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vocabularies: INITIAL_VOCABULARIES })
          });
          const refRes = await fetch('/api/vocabularies');
          const refData = await refRes.json();
          if (refData.success) {
            setVocabularies(refData.vocabularies);
          }
        } else {
          setVocabularies(data.vocabularies);
        }
      }
    } catch (err) {
      console.error("Error loading vocabularies:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchDbStatus();
    fetchVocabularies();
    fetchUsers();
  }, []);

  // Sync edited vocabularies to Backend (MySQL on Port 3307 or fallback memory store)
  const handleUpdateVocabularies = async (updatedVocabs: Vocabulary[]) => {
    setVocabularies(updatedVocabs);
    try {
      await fetch('/api/vocabularies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularies: updatedVocabs })
      });
    } catch (err) {
      console.error("Error updating vocabulary store:", err);
    }
  };

  // Handle Login Click via Backend REST API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser({
          ...currentUser,
          username: data.user.username,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || AVATARS[1],
          history: currentUser.history
        });
        setIsLoggedIn(true);
        setErrorMsg('');
        setActiveTab('dashboard');
        // Refresh values on success
        fetchVocabularies();
        fetchUsers();
        fetchDbStatus();
      } else {
        setErrorMsg(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối Server: ' + err.message);
    }
  };

  // Password Strength Checker
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'text-slate-400 bg-slate-100', percentage: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score, label: 'Yếu', color: 'text-rose-700 bg-rose-50 border border-rose-200', percentage: '33.3%' };
    } else if (score <= 4) {
      return { score, label: 'Trung bình', color: 'text-amber-700 bg-amber-50 border border-amber-200', percentage: '66.6%' };
    } else {
      return { score, label: 'Mạnh', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200', percentage: '100%' };
    }
  };

  // Handle Register via Backend REST API
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUser || !regMail || !regPass || !regPassConfirm || !regName) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng ký!');
      return;
    }

    if (regPass !== regPassConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    const strength = checkPasswordStrength(regPass);
    if (strength.score <= 2) {
      setErrorMsg('Mật khẩu quá yếu! Mật khẩu tối thiểu phải từ 6 ký tự và có chữ, số hoặc ký tự đặc biệt.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUser,
          fullName: regName,
          email: regMail,
          password: regPass,
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] || AVATARS[1]
        })
      });
      const data = await response.json();
      if (data.success) {
        setErrorMsg('');
        setSuccessMsg(data.message || 'Đăng ký thành công tài khoản mới!');
        fetchUsers();
        // Reset registration fields
        setRegUser('');
        setRegMail('');
        setRegPass('');
        setRegPassConfirm('');
        setRegName('');
        setTimeout(() => {
          setAuthView('login');
          setLoginUsername(regUser);
          setLoginPassword(regPass);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Lỗi đăng ký tài khoản!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối Server: ' + err.message);
    }
  };

  // Handle Forgot Password OTP Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ Email!');
      return;
    }

    try {
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCode('');
      const response = await fetch('/api/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      });
      const data = await response.json();
      if (data.success) {
        setErrorMsg('');
        setSuccessMsg(data.message);
        setForgotPasswordStep('verify');
        if (data.otpForTesting) {
          setServerProvidedOtp(data.otpForTesting);
        } else {
          setServerProvidedOtp(null);
        }
      } else {
        setErrorMsg(data.message || 'Địa chỉ email không tồn tại trong hệ thống!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối khôi phục: ' + err.message);
    }
  };

  // Handle OTP Verification and change password
  const handleOtpVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail || !otpCode || !otpNewPass) {
      setErrorMsg('Vui lòng nhập đầy đủ OTP và Mật khẩu mới!');
      return;
    }

    try {
      const response = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode, newPassword: otpNewPass })
      });
      const data = await response.json();
      if (data.success) {
        setErrorMsg('');
        setSuccessMsg(data.message || 'Đặt lại mật khẩu thành công!');
        setForgotPasswordStep('request');
        setOtpEmail('');
        setOtpCode('');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpNewPass('');
        setServerProvidedOtp(null);
        setTimeout(() => {
          setAuthView('login');
          setSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối xác nhận: ' + err.message);
    }
  };



  // Add Test Result
  const handleAddTestResult = (result: {
    examTitle: string;
    category: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: string;
  }) => {
    const newResult: ExamResult = {
      id: Date.now(),
      ...result,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedHistory = [newResult, ...currentUser.history];
    const totalScores = updatedHistory.reduce((acc, curr) => acc + curr.score, 0);

    setCurrentUser({
      ...currentUser,
      history: updatedHistory,
      completedTestsCount: updatedHistory.length,
      averageScore: Math.round(totalScores / updatedHistory.length)
    });
  };

  // Update profile
  const handleUpdateProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  // Add score from Quiz
  const handleAddQuizScore = (score: number, wordsCount: number) => {
    // Increment learned words and register stats
    const updatedUser = { ...currentUser };
    updatedUser.learnedWordsCount += wordsCount;
    setCurrentUser(updatedUser);
  };

  const uiTranslations = {
    VI: {
      dashboard: "Bảng Thống Kê",
      vocab: "Từ Vựng Tiếng Anh",
      flashcard: "Học Flashcard",
      quiz: "Luyện Tập Từ Vựng",
      exam: "Luyện Đề Thi",
      pronounce: "Luyện Phát Âm",
      profile: "Hồ Sơ Cá Nhân",
      document: "Tài Liệu Học Tập",
      settings: "Cài Đặt Hệ Thống",
      adminPanel: "Quản Lý Thành Viên",
      quickTip: "Mẹo học tập:",
      tipBody: "Hãy kết hợp lật thẻ Flashcard ghi nhớ từ vựng trước khi thực hành Quiz trắc nghiệm để nhân đôi hiệu năng ghi nhớ dài hạn!",
      menuTitle: "MENU TIỆN ÍCH",
      siteHeaderSub: "Hệ Thống Học Tiếng Anh Trực Tuyến",
      logOut: "Đăng xuất",
      footer: "© 2026 ENGStudy Hub. Hệ thống Quản lý và Học từ vựng Tiếng Anh trực tuyến."
    },
    EN: {
      dashboard: "Dashboard",
      vocab: "English Vocabulary",
      flashcard: "Learn Flashcards",
      quiz: "Vocabulary Practice",
      exam: "Take Practice Exams",
      pronounce: "Pronounce IPA",
      profile: "Personal Profile",
      document: "Study Documents",
      settings: "System Settings",
      adminPanel: "Manage Users",
      quickTip: "Learning tip:",
      tipBody: "Try combining Flashcard revision with interactive quizzes to double your retention performance!",
      menuTitle: "UTILITIES MENU",
      siteHeaderSub: "Online English Learning System",
      logOut: "Log out",
      footer: "© 2026 ENGStudy Hub. Online English Vocabulary Learning System."
    },
    JA: {
      dashboard: "統計ダッシュボード",
      vocab: "英単語学習",
      flashcard: "フラッシュカード",
      quiz: "単語クイズ練習",
      exam: "模擬試験テスト",
      pronounce: "発音練習ガイド",
      profile: "マイプロファイル",
      document: "学習参考資料",
      settings: "システム環境設定",
      adminPanel: "登録メンバー管理",
      quickTip: "学習のアドバイス：",
      tipBody: "ボキャブラリーを暗記するためのフラッシュカードと、多肢選択式のクイズを組み合わせることで、長期的な記憶を倍増させましょう！",
      menuTitle: "機能メニュー",
      siteHeaderSub: "オンライン英語学習システム",
      logOut: "ログアウト",
      footer: "© 2026 ENGStudy Hub. オンライン英語ボキャブラリー学習システム。"
    }
  }[language];

  return (
    <div id="main-layout" className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Professional Header */}
      <header className={`border-b py-3.5 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
            E
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              <span>ENGStudy Hub</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">{uiTranslations.siteHeaderSub}</p>
          </div>
        </div>



        {/* User Badge / Profile dropdown */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className={`text-xs font-extrabold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{currentUser.fullName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{currentUser.role} account</p>
            </div>
            <button
              onClick={() => {
                setActiveTab('settings');
                setCurrentMode('APP');
              }}
              className="w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200 cursor-pointer active:scale-95"
            >
              <img src={currentUser.avatar} alt={currentUser.fullName} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className={`p-1.5 rounded-lg transition ${
                darkMode ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-500' : 'bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500'
              }`}
              title={uiTranslations.logOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-1" />
        )}
      </header>

      {/* Main Container */}
      {!isLoggedIn ? (
        /* Authentication Screen (Login, Register, Forgot Password) */
        <main 
          className="flex-1 flex items-center justify-center p-6 bg-cover bg-center font-sans relative min-h-screen"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80')" }}
        >
          {/* Blur & Darken Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]"></div>

          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-white relative z-10 transition-all duration-300">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">ENGStudy Hub</h2>
              <p className="text-xs text-slate-200/90 font-medium">Hệ thống Quản lý và Học Tiếng Anh Trực tuyến</p>
            </div>

            <div className="space-y-6">
              {successMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-100 font-semibold backdrop-blur-md animate-fadeIn">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-100 font-semibold backdrop-blur-md animate-fadeIn">
                  {errorMsg}
                </div>
              )}

              {authView === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-2 text-sm text-white placeholder-slate-300/60 transition"
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      required
                      placeholder="Nhập tên đăng nhập..."
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Mật khẩu (Password)</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-2 pr-10 text-sm text-white placeholder-slate-300/60 font-mono transition"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-1 flex items-center text-white/60 hover:text-white transition"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/40 bg-white/10 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                        defaultChecked
                      />
                      <span className="text-slate-200 font-medium">Ghi nhớ đăng nhập</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot_password')}
                      className="text-slate-200 hover:text-white hover:underline font-bold"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-full text-xs transition active:scale-95 shadow-lg shadow-black/15 mt-2"
                  >
                    Đăng Nhập
                  </button>

                  <div className="pt-5 border-t border-white/10 text-center space-y-3">
                    <p className="text-xs text-slate-200 font-medium">
                      Chưa có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthView('register')}
                        className="text-white font-extrabold hover:underline"
                      >
                        Đăng ký thành viên
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {authView === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 text-sm text-white placeholder-slate-300/60 transition"
                      value={regUser}
                      onChange={e => setRegUser(e.target.value)}
                      required
                      placeholder="Tên đăng nhập của bạn..."
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Địa chỉ Email</label>
                    <input
                      type="email"
                      className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 text-sm text-white placeholder-slate-300/60 transition"
                      value={regMail}
                      onChange={e => setRegMail(e.target.value)}
                      required
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Họ và tên</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 text-sm text-white placeholder-slate-300/60 transition"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      placeholder="Họ và tên đầy đủ..."
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Mật khẩu (Password)</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 pr-10 text-sm text-white placeholder-slate-300/60 font-mono transition"
                        value={regPass}
                        onChange={e => setRegPass(e.target.value)}
                        required
                        placeholder="Tối thiểu 6 ký tự..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-1 flex items-center text-white/60 hover:text-white transition"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength UI gauge */}
                    {regPass && (
                      <div className="space-y-1 pt-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-300 font-bold">Độ mạnh mật khẩu:</span>
                          <span className={`px-1.5 py-0.5 rounded font-extrabold ${checkPasswordStrength(regPass).color}`}>
                            {checkPasswordStrength(regPass).label}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: checkPasswordStrength(regPass).percentage,
                              backgroundColor: checkPasswordStrength(regPass).score <= 2 ? '#f43f5e' : checkPasswordStrength(regPass).score <= 4 ? '#f59e0b' : '#10b981'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Nhập lại mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 pr-10 text-sm text-white placeholder-slate-300/60 font-mono transition"
                        value={regPassConfirm}
                        onChange={e => setRegPassConfirm(e.target.value)}
                        required
                        placeholder="Nhập lại mật khẩu..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-1 flex items-center text-white/60 hover:text-white transition"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-full text-xs transition shadow-lg mt-3"
                  >
                    Đăng Ký Thành Viên
                  </button>

                  <p className="text-center text-xs text-slate-200 mt-2">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-white font-extrabold hover:underline"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </form>
              )}

              {authView === 'forgot_password' && (
                <div className="space-y-4">
                  {forgotPasswordStep === 'request' ? (
                    <form onSubmit={handleForgotSubmit} className="space-y-5">
                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Địa chỉ Email đã đăng ký</label>
                        <input
                          type="email"
                          className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-2 text-sm text-white placeholder-slate-300/60 transition"
                          placeholder="example@gmail.com"
                          value={otpEmail}
                          onChange={e => setOtpEmail(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-full text-xs transition shadow-lg"
                      >
                        Gửi Mã Xác Thực OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpVerifyAndReset} className="space-y-4">
                      <div className="p-3 bg-white/10 border border-white/20 rounded-2xl space-y-1 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Mã OTP Khôi Phục</p>
                        <p className="text-xs text-slate-200">Kiểm tra hòm thư email <span className="font-semibold text-white">{otpEmail}</span></p>
                        <p className="text-[10px] text-slate-300/80 mt-1">Vui lòng kiểm tra mục Hộp thư đến hoặc Thư rác (Spam).</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider text-center">Nhập mã OTP (6 chữ số)</label>
                        <div className="flex justify-between items-center gap-2 max-w-[280px] mx-auto">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              id={`otp-input-${index}`}
                              type="text"
                              maxLength={1}
                              pattern="[0-9]*"
                              inputMode="numeric"
                              className="w-10 h-12 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white focus:outline-none focus:ring-1 focus:ring-white rounded-xl text-center text-lg font-black text-white font-mono transition"
                              value={otpDigits[index] || ''}
                              onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              required
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-300/80 text-center">Nhập hoặc dán mã OTP của bạn vào các ô trên</p>
                      </div>

                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Mật khẩu mới (New Password)</label>
                        <div className="relative">
                          <input
                            type={showOtpNewPassword ? "text" : "password"}
                            className="w-full bg-transparent border-b border-white/35 focus:border-white focus:outline-none py-1.5 pr-10 text-sm text-white placeholder-slate-300/60 font-mono transition"
                            placeholder="Nhập mật khẩu mới..."
                            value={otpNewPass}
                            onChange={e => setOtpNewPass(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowOtpNewPassword(!showOtpNewPassword)}
                            className="absolute inset-y-0 right-0 pr-1 flex items-center text-white/60 hover:text-white transition"
                          >
                            {showOtpNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-50 hover:bg-emerald-600 text-white font-bold py-3 rounded-full text-xs transition shadow-lg mt-3"
                      >
                        Đặt Lại Mật Khẩu & Đăng Nhập
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotPasswordStep('request')}
                        className="w-full text-center text-[10px] text-slate-300 hover:text-white hover:underline mt-2"
                      >
                        Yêu cầu gửi lại mã OTP mới
                      </button>
                    </form>
                  )}

                  <p className="text-center text-xs text-slate-200 mt-2">
                    Quay lại{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('login');
                        setForgotPasswordStep('request');
                      }}
                      className="text-white font-extrabold hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* Regular Application Workspace with Sidebars */
        <div id="app-workspace" className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
          {/* Side Navigation panel */}
          <aside className={`w-full md:w-64 p-5 flex flex-col justify-between shrink-0 transition-colors ${
            darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-300' : 'bg-indigo-950 text-slate-300 md:border-r border-indigo-900'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3 block mb-3">{uiTranslations.menuTitle}</span>
              
              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'dashboard'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{uiTranslations.dashboard}</span>
              </button>

              {/* Vocabularies */}
              <button
                onClick={() => setActiveTab('vocab')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'vocab'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{uiTranslations.vocab}</span>
              </button>

              {/* Flashcard */}
              <button
                onClick={() => setActiveTab('flashcard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'flashcard'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>{uiTranslations.flashcard}</span>
              </button>

              {/* Quiz */}
              <button
                onClick={() => setActiveTab('quiz')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'quiz'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{uiTranslations.quiz}</span>
              </button>

              {/* Exam */}
              <button
                onClick={() => setActiveTab('exam')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'exam'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{uiTranslations.exam}</span>
              </button>

              {/* Pronunciation */}
              <button
                onClick={() => setActiveTab('pronounce')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'pronounce'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{uiTranslations.pronounce}</span>
              </button>

              {/* Study Documents (Tài liệu học tập) */}
              <button
                onClick={() => setActiveTab('document')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'document'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{uiTranslations.document}</span>
              </button>

              {/* Settings (Cài đặt) */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'settings'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{uiTranslations.settings}</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'profile'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{uiTranslations.profile}</span>
              </button>

              {/* Admin panel if role ADMIN */}
              {currentUser.role === 'ADMIN' && (
                <div className="pt-4 border-t border-indigo-900/50 mt-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3 block mb-3">ADMIN PANEL</span>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                      activeTab === 'admin'
                        ? 'bg-rose-900 text-white shadow-lg shadow-rose-950/40'
                        : 'text-rose-300 hover:bg-rose-950/60 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>{uiTranslations.adminPanel}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick tips */}
            <div className={`hidden md:block p-4 rounded-xl text-[10px] leading-relaxed mt-6 border ${
              darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-indigo-900/40 border-indigo-900/30 text-indigo-200/90'
            }`}>
              <strong className="font-semibold text-white block mb-1">{uiTranslations.quickTip}</strong>
              {uiTranslations.tipBody}
            </div>
          </aside>

          {/* Interactive view switch panel */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardSection vocabularies={vocabularies} profile={currentUser} users={users} />
            )}
            {activeTab === 'vocab' && (
              <VocabularySection
                vocabularies={vocabularies}
                onUpdateVocab={handleUpdateVocabularies}
                isAdmin={currentUser.role === 'ADMIN'}
              />
            )}
            {activeTab === 'flashcard' && (
              <FlashcardSection vocabularies={vocabularies} onUpdateVocab={handleUpdateVocabularies} />
            )}
            {activeTab === 'quiz' && (
              <QuizSection vocabularies={vocabularies} onAddScore={handleAddQuizScore} />
            )}
            {activeTab === 'exam' && (
              <ExamSection onAddTestResult={handleAddTestResult} />
            )}
            {activeTab === 'pronounce' && (
              <PronunciationSection vocabularies={vocabularies} onUpdateVocab={handleUpdateVocabularies} />
            )}
            {activeTab === 'profile' && (
              <ProfileSection profile={currentUser} onUpdateProfile={handleUpdateProfile} />
            )}
            {activeTab === 'document' && (
              <DocumentSection profile={currentUser} />
            )}
            {activeTab === 'settings' && (
              <SettingsSection 
                profile={currentUser} 
                onUpdateProfile={handleUpdateProfile} 
                onLogout={() => setIsLoggedIn(false)}
                isDarkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
                currentLang={language}
                onLanguageChange={(lang) => setLanguage(lang)}
              />
            )}
            {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
              <AdminPanel users={users} onRefreshUsers={fetchUsers} />
            )}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[11px] py-4 text-center">
        <p>{uiTranslations.footer}</p>
      </footer>
    </div>
  );
}
