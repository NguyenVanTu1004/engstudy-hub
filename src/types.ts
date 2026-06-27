export interface Vocabulary {
  id: number;
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleMeaning: string;
  image: string;
  audioUrl?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  isFavorite?: boolean;
  isLearned?: boolean;
}

export interface FlashcardState {
  currentIndex: number;
  isFlipped: boolean;
  knownIds: number[];
  unknownIds: number[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'MCQ' | 'FILL_IN' | 'LISTENING' | 'SPELLING' | 'MATCHING';
}

export interface Exam {
  id: number;
  title: string;
  category: 'TOEIC' | 'IELTS' | 'A2' | 'B1' | 'B2' | 'THPT_QG';
  timeLimit: number; // in minutes
  questions: Question[];
}

export interface ExamResult {
  id: number;
  examTitle: string;
  category: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: string;
  date: string;
}

export interface StudySession {
  date: string;
  minutes: number;
  wordsLearned: number;
  score: number;
}

export interface UserProfile {
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  role: 'ADMIN' | 'USER';
  learnedWordsCount: number;
  completedTestsCount: number;
  averageScore: number;
  history: ExamResult[];
  studyProgress: StudySession[];
}

export interface MockUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  avatar: string;
  createdAt: string;
}

export interface JavaCodeFile {
  id: string;
  name: string;
  path: string;
  category: 'Configuration' | 'Entity' | 'Repository' | 'Service' | 'Controller' | 'DTO & Mapper' | 'Security & JWT' | 'Database & SQL' | 'Guides';
  language: 'java' | 'sql' | 'xml' | 'yaml' | 'markdown';
  content: string;
  explanation: string;
}
