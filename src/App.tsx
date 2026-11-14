import React, { useState, useEffect } from 'react';
import { Vocabulary, UserProfile, ExamResult, MockUser } from './types';
import { INITIAL_VOCABULARIES, INITIAL_MOCK_USERS } from './data/englishData';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './services/api';

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
import GrammarSection from './components/GrammarSection';
import DictationSection from './components/DictationSection';

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
  Moon,
  Menu,
  X,
  Compass,
  Headphones
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
  
  // App internal tabs: 'dashboard' | 'vocab' | 'flashcard' | 'quiz' | 'exam' | 'profile' | 'admin' | 'pronounce' | 'document' | 'settings' | 'grammar' | 'dictation'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vocab' | 'flashcard' | 'quiz' | 'exam' | 'profile' | 'admin' | 'pronounce' | 'document' | 'settings' | 'grammar' | 'dictation'>('dashboard');

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [users, setUsers] = useState<MockUser[]>(INITIAL_MOCK_USERS);

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
      const data = await api.get('/api/db-status');
      setDbStatus(data);
    } catch (err) {
      setDbStatus({ connected: false, mode: 'Offline Failover' });
    }
  };

  const fetchVocabularies = async () => {
    try {
      const data = await api.get('/api/vocabularies');
      if (data.success) {
        if (data.vocabularies.length === 0) {
          console.log("Database empty. Seeding initial vocabulary values automatically...");
          await api.post('/api/vocabularies/sync', { vocabularies: INITIAL_VOCABULARIES }, true);
          const refData = await api.get('/api/vocabularies');
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
      const data = await api.get('/api/users', true);
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // Run on mount with real JWT session restore
  useEffect(() => {
    const initApp = async () => {
      await fetchDbStatus();

      const token = getAuthToken();
      if (token) {
        try {
          const authData = await api.get('/api/auth/me', true);
          if (authData.success && authData.user) {
            setCurrentUser(authData.user);
            setIsLoggedIn(true);
            await fetchUsers();
          }
        } catch (e) {
          console.warn("Session expired or invalid, logging out.");
          removeAuthToken();
          setIsLoggedIn(false);
        }
      }

      await fetchVocabularies();
    };

    initApp();

    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      removeAuthToken();
      setActiveTab('dashboard');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Sync edited vocabularies to Backend granularly
  const handleUpdateVocabularies = async (updatedVocabs: Vocabulary[]) => {
    setVocabularies(updatedVocabs);

    // 1. Detect if items were added
    if (updatedVocabs.length > vocabularies.length) {
      const newWords = updatedVocabs.filter(v => !vocabularies.some(old => old.id === v.id));
      if (newWords.length > 0) {
        try {
          if (newWords.length === 1) {
            await api.post('/api/vocabularies', newWords[0], true);
          } else {
            await api.post('/api/vocabularies/sync', { vocabularies: newWords }, true);
          }
          fetchVocabularies();
        } catch (e) {
          console.error('Lỗi thêm từ vựng:', e);
        }
      }
      return;
    }

    // 2. Detect if an item was deleted
    if (updatedVocabs.length < vocabularies.length) {
      const deleted = vocabularies.find(v => !updatedVocabs.some(u => u.id === v.id));
      if (deleted) {
        try {
          await api.delete(`/api/vocabularies/${deleted.id}`, true);
          fetchVocabularies();
        } catch (e) {
          console.error('Lỗi xóa từ vựng:', e);
        }
      }
      return;
    }

    // 3. Detect if a property was updated (learned, favorite, or details)
    const changed = updatedVocabs.find(v => {
      const old = vocabularies.find(o => o.id === v.id);
      return old && (
        old.isLearned !== v.isLearned || 
        old.isFavorite !== v.isFavorite || 
        old.word !== v.word || 
        old.meaning !== v.meaning ||
        old.difficulty !== v.difficulty ||
        old.topic !== v.topic
      );
    });

    if (changed) {
      const old = vocabularies.find(o => o.id === changed.id);
      if (old) {
        try {
          if (old.isLearned !== changed.isLearned) {
            await api.post(`/api/vocabularies/${changed.id}/toggle-learned`, {}, true);
            setCurrentUser(prev => ({
              ...prev,
              learnedWordsCount: Math.max(0, prev.learnedWordsCount + (changed.isLearned ? 1 : -1))
            }));
          } else if (old.isFavorite !== changed.isFavorite) {
            await api.post(`/api/vocabularies/${changed.id}/toggle-favorite`, {}, true);
          } else {
            await api.put(`/api/vocabularies/${changed.id}`, changed, true);
          }
        } catch (e) {
          console.error('Lỗi cập nhật từ vựng:', e);
        }
      }
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
      const data = await api.post('/api/auth/login', { username: loginUsername, password: loginPassword });
      if (data.success) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setErrorMsg('');
        setActiveTab('dashboard');
        // Refresh values on success
        await Promise.all([
          fetchVocabularies(),
          fetchUsers(),
          fetchDbStatus()
        ]);
      } else {
        setErrorMsg(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối Server');
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
      const data = await api.post('/api/auth/register', {
        username: regUser,
        fullName: regName,
        email: regMail,
        password: regPass,
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] || AVATARS[1]
      });
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

        if (data.token) {
          setAuthToken(data.token);
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          setActiveTab('dashboard');
        } else {
          setTimeout(() => {
            setAuthView('login');
            setLoginUsername(regUser);
            setLoginPassword(regPass);
            setSuccessMsg('');
          }, 1500);
        }
      } else {
        setErrorMsg(data.message || 'Lỗi đăng ký tài khoản!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối Server');
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
      const data = await api.post('/api/auth/otp-request', { email: otpEmail });
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
      setErrorMsg(err.message || 'Lỗi kết nối khôi phục');
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
      const data = await api.post('/api/auth/otp-verify', { email: otpEmail, otp: otpCode, newPassword: otpNewPass });
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
      setErrorMsg(err.message || 'Lỗi kết nối xác nhận');
    }
  };

  // Add Test Result (Real Database persistence)
  const handleAddTestResult = async (result: {
    examTitle: string;
    category: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: string;
  }) => {
    let savedResult: ExamResult = {
      id: Date.now(),
      ...result,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const data = await api.post('/api/exams/results', result, true);
      if (data.success && data.result) {
        savedResult = data.result;
      }
    } catch (err) {
      console.error("Lưu kết quả bài thi vào cơ sở dữ liệu:", err);
    }

    const updatedHistory = [savedResult, ...currentUser.history];
    const totalScores = updatedHistory.reduce((acc, curr) => acc + curr.score, 0);

    setCurrentUser(prev => ({
      ...prev,
      history: updatedHistory,
      completedTestsCount: updatedHistory.length,
      averageScore: Math.round(totalScores / updatedHistory.length)
    }));
  };

  // Handle user logout
  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    setCurrentUser({
      username: 'guest',
      email: '',
      fullName: 'Khách vãng lai',
      avatar: AVATARS[0],
      role: 'USER',
      learnedWordsCount: 0,
      completedTestsCount: 0,
      averageScore: 0,
      history: [],
      studyProgress: []
    });
    fetchVocabularies();
    setActiveTab('dashboard');
  };

  // Update profile
  const handleUpdateProfile = async (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      const res = await api.put('/api/auth/profile', {
        username: updated.username,
        fullName: updated.fullName,
        email: updated.email,
        avatar: updated.avatar
      }, true);
      if (res && res.token) {
        setAuthToken(res.token);
      }
      if (res && res.user) {
        setCurrentUser(prev => ({
          ...prev,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          avatar: res.user.avatar,
          role: res.user.role
        }));
      }
      return res;
    } catch (err: any) {
      console.error("Lỗi cập nhật hồ sơ người dùng:", err);
      throw err;
    }
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
      grammar: "Ngữ Pháp & 12 Thì",
      dictation: "Luyện Chép Chính Tả",
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
      grammar: "12 Tenses & Grammar",
      dictation: "Dictation Practice",
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
      grammar: "英文法・12時制",
      dictation: "ディクテーション練習",
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
      <header className={`border-b py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Hamburger Toggle Button */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`p-2 -ml-1 rounded-xl md:hidden transition active:scale-95 ${
                darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Menu điều hướng"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shadow-indigo-200">
            E
          </div>
          <div>
            <h1 className={`text-sm sm:text-base font-bold tracking-tight flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              <span>ENGStudy Hub</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden xs:block">{uiTranslations.siteHeaderSub}</p>
          </div>
        </div>

        {/* User Badge / Profile dropdown */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block text-right">
              <p className={`text-xs font-extrabold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{currentUser.fullName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{currentUser.role} account</p>
            </div>
            {/* Quick Dark/Light Mode Toggle */}
            <button
              onClick={handleToggleDarkMode}
              className={`p-2 rounded-xl transition active:scale-95 cursor-pointer ${
                darkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setCurrentMode('APP');
                setIsMobileMenuOpen(false);
              }}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden border border-slate-200 cursor-pointer active:scale-95"
            >
              <img src={currentUser.avatar} alt={currentUser.fullName} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
            </button>
            <button
              onClick={handleLogout}
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
                      onChange={e => {
                        setLoginUsername(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
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
                        onChange={e => {
                          setLoginPassword(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
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
        <div id="app-workspace" className="flex-1 w-full flex min-h-0 overflow-x-hidden relative">
          {/* Mobile Backdrop Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Side Navigation panel: Responsive Slide Drawer on Mobile, Docked Sidebar on Desktop */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:shrink-0 md:flex shadow-2xl md:shadow-none overflow-y-auto
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-300' : 'bg-indigo-950 text-slate-300 md:border-r border-indigo-900'}
          `}>
            {/* Mobile Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-indigo-900/60 md:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">E</div>
                <span className="text-xs font-black text-white tracking-wider">ENGStudy Hub</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-900/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3 block mb-3">{uiTranslations.menuTitle}</span>
              
              {/* Dashboard */}
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('vocab');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('flashcard');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('quiz');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'quiz'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{uiTranslations.quiz}</span>
              </button>

              {/* Grammar & 12 Tenses */}
              <button
                onClick={() => {
                  setActiveTab('grammar');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'grammar'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{uiTranslations.grammar}</span>
              </button>

              {/* Exam */}
              <button
                onClick={() => {
                  setActiveTab('exam');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('pronounce');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'pronounce'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{uiTranslations.pronounce}</span>
              </button>

              {/* Dictation (Luyện chép chính tả) */}
              <button
                onClick={() => {
                  setActiveTab('dictation');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                  activeTab === 'dictation'
                    ? (darkMode ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-950/40' : 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/40')
                    : 'text-slate-300 hover:bg-indigo-900/60 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4 text-teal-400" />
                <span>{uiTranslations.dictation}</span>
              </button>

              {/* Study Documents (Tài liệu học tập) */}
              <button
                onClick={() => {
                  setActiveTab('document');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
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
              {currentUser.role?.toUpperCase() === 'ADMIN' && (
                <div className="pt-4 border-t border-indigo-900/50 mt-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3 block mb-3">ADMIN PANEL</span>
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setIsMobileMenuOpen(false);
                      fetchUsers();
                    }}
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
          <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {activeTab === 'dashboard' && (
                <DashboardSection vocabularies={vocabularies} profile={currentUser} users={users} />
              )}
              {activeTab === 'vocab' && (
                <VocabularySection
                  vocabularies={vocabularies}
                  onUpdateVocab={handleUpdateVocabularies}
                  isAdmin={currentUser.role?.toUpperCase() === 'ADMIN'}
                  onRefresh={fetchVocabularies}
                />
              )}
              {activeTab === 'flashcard' && (
                <FlashcardSection vocabularies={vocabularies} onUpdateVocab={handleUpdateVocabularies} />
              )}
              {activeTab === 'quiz' && (
                <QuizSection vocabularies={vocabularies} onAddScore={handleAddQuizScore} />
              )}
              {activeTab === 'grammar' && (
                <GrammarSection />
              )}
              {activeTab === 'exam' && (
                <ExamSection onAddTestResult={handleAddTestResult} />
              )}
              {activeTab === 'pronounce' && (
                <PronunciationSection vocabularies={vocabularies} onUpdateVocab={handleUpdateVocabularies} />
              )}
              {activeTab === 'dictation' && (
                <DictationSection />
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
                  onLogout={handleLogout}
                  isDarkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                  currentLang={language}
                  onLanguageChange={(lang) => setLanguage(lang)}
                />
              )}
              {activeTab === 'admin' && currentUser.role?.toUpperCase() === 'ADMIN' && (
                <AdminPanel users={users} onRefreshUsers={fetchUsers} />
              )}
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar (Chuẩn ứng dụng học tập di động phong cách Memrise/Duolingo) */}
          <nav className={`fixed bottom-0 inset-x-0 z-30 md:hidden border-t px-2 py-1.5 flex items-center justify-around backdrop-blur-md transition-colors ${
            darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-500 shadow-lg'
          }`}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
              <span className="text-[10px] leading-tight">Tổng quan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('vocab');
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                activeTab === 'vocab' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className={`w-5 h-5 mb-0.5 ${activeTab === 'vocab' ? 'scale-110' : ''}`} />
              <span className="text-[10px] leading-tight">Từ vựng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('flashcard');
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                activeTab === 'flashcard' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl ${activeTab === 'flashcard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300' : ''}`}>
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight mt-0.5">Flashcard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('quiz');
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                activeTab === 'quiz' || activeTab === 'exam' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className={`w-5 h-5 mb-0.5 ${activeTab === 'quiz' || activeTab === 'exam' ? 'scale-110' : ''}`} />
              <span className="text-[10px] leading-tight">Luyện tập</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                isMobileMenuOpen ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">Thêm</span>
            </button>
          </nav>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[11px] py-4 text-center">
        <p>{uiTranslations.footer}</p>
      </footer>
    </div>
  );
}
