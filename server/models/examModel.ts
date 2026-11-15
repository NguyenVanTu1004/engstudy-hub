import { pool, isDbConnected } from "./db";
import fs from "fs";
import path from "path";

export interface DBExamResult {
  id: number;
  userId: number;
  examTitle: string;
  category: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: string;
  createdAt: string;
  date?: string;
  minutes?: number;
}

export interface DBStudySession {
  id: number;
  userId: number;
  date: string;
  minutes: number;
  wordsLearned: number;
  score: number;
}

const EXAMS_STORE_PATH = path.join(process.cwd(), "server", "data", "exam_results_store.json");
const SESSIONS_STORE_PATH = path.join(process.cwd(), "server", "data", "study_sessions_store.json");

function loadJsonStore<T>(filePath: string, fallback: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err: any) {
    console.warn(`⚠️ Error reading ${filePath}:`, err.message);
  }
  return fallback;
}

function saveJsonStore<T>(filePath: string, items: T[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  } catch (err: any) {
    console.warn(`⚠️ Failed writing to ${filePath}:`, err.message);
  }
}

let memoryExamResults: DBExamResult[] = loadJsonStore<DBExamResult>(EXAMS_STORE_PATH, []);
let memoryStudySessions: DBStudySession[] = loadJsonStore<DBStudySession>(SESSIONS_STORE_PATH, []);

export class ExamModel {
  static async saveResult(data: {
    userId: number;
    examTitle: string;
    category: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: string;
  }): Promise<DBExamResult> {
    const today = new Date().toISOString().split("T")[0];
    
    // Parse minutes from timeSpent (e.g. "5m 12s" or "300" seconds)
    let minutes = 5;
    const match = data.timeSpent.match(/(\d+)m/);
    if (match) {
      minutes = Math.max(1, parseInt(match[1]));
    }

    let savedResult: DBExamResult;

    if (isDbConnected && pool) {
      try {
        const [res]: any = await pool.query(
          `INSERT INTO exam_results (user_id, exam_title, category, score, correct_answers, total_questions, time_spent)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [data.userId, data.examTitle, data.category, data.score, data.correctAnswers, data.totalQuestions, data.timeSpent]
        );

        // Record / Update today's study session for the user
        await pool.query(
          `INSERT INTO study_sessions (user_id, study_date, minutes, words_learned, score)
           VALUES (?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE 
              minutes = minutes + VALUES(minutes),
              score = GREATEST(score, VALUES(score))`,
          [data.userId, today, minutes, data.score]
        );

        savedResult = {
          id: res.insertId,
          userId: data.userId,
          examTitle: data.examTitle,
          category: data.category,
          score: data.score,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          timeSpent: data.timeSpent,
          createdAt: today,
          date: today,
          minutes
        };
      } catch (e: any) {
        console.warn("⚠️ Pool saveResult failed, falling back to disk store:", e.message);
        savedResult = {
          id: Date.now(),
          userId: data.userId,
          examTitle: data.examTitle,
          category: data.category,
          score: data.score,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          timeSpent: data.timeSpent,
          createdAt: today,
          date: today,
          minutes
        };
      }
    } else {
      savedResult = {
        id: Date.now(),
        userId: data.userId,
        examTitle: data.examTitle,
        category: data.category,
        score: data.score,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
        timeSpent: data.timeSpent,
        createdAt: today,
        date: today,
        minutes
      };
    }

    // Mirror to persistent disk stores
    memoryExamResults.unshift(savedResult);
    saveJsonStore(EXAMS_STORE_PATH, memoryExamResults);

    const existingSession = memoryStudySessions.find(s => s.userId === data.userId && s.date === today);
    if (existingSession) {
      existingSession.minutes += minutes;
      existingSession.score = Math.max(existingSession.score, data.score);
    } else {
      memoryStudySessions.push({
        id: Date.now(),
        userId: data.userId,
        date: today,
        minutes,
        wordsLearned: 0,
        score: data.score
      });
    }
    saveJsonStore(SESSIONS_STORE_PATH, memoryStudySessions);

    return savedResult;
  }

  static async getUserResults(userId: number): Promise<DBExamResult[]> {
    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query(
          `SELECT id, user_id as userId, exam_title as examTitle, category, score, correct_answers as correctAnswers, total_questions as totalQuestions, time_spent as timeSpent, DATE_FORMAT(created_at, '%Y-%m-%d') as date, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as createdAt
           FROM exam_results 
           WHERE user_id = ? 
           ORDER BY id DESC`,
          [userId]
        );
        if (rows && rows.length > 0) return rows;
      } catch (e) {
        // Fall back to disk store
      }
    }
    return memoryExamResults.filter(r => r.userId === userId);
  }

  static async getUserStudySessions(userId: number): Promise<DBStudySession[]> {
    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query(
          `SELECT id, user_id as userId, DATE_FORMAT(study_date, '%Y-%m-%d') as date, minutes, words_learned as wordsLearned, score
           FROM study_sessions
           WHERE user_id = ?
           ORDER BY study_date ASC`,
          [userId]
        );
        if (rows && rows.length > 0) return rows;
      } catch (e) {
        // Fall back to disk store
      }
    }
    return memoryStudySessions.filter(s => s.userId === userId);
  }

  static async recordStudySession(userId: number, minutes: number, wordsLearned: number, score: number): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO study_sessions (user_id, study_date, minutes, words_learned, score)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
              minutes = minutes + VALUES(minutes),
              words_learned = words_learned + VALUES(words_learned),
              score = GREATEST(score, VALUES(score))`,
          [userId, today, minutes, wordsLearned, score]
        );
      } catch (e) {
        // Handled below in mirror
      }
    }

    const session = memoryStudySessions.find(s => s.userId === userId && s.date === today);
    if (session) {
      session.minutes += minutes;
      session.wordsLearned += wordsLearned;
      session.score = Math.max(session.score, score);
    } else {
      memoryStudySessions.push({
        id: Date.now(),
        userId,
        date: today,
        minutes,
        wordsLearned,
        score
      });
    }
    saveJsonStore(SESSIONS_STORE_PATH, memoryStudySessions);
  }

  static async getUserStats(userId: number): Promise<{
    learnedWordsCount: number;
    favoriteWordsCount: number;
    completedTestsCount: number;
    averageScore: number;
    totalMinutes: number;
  }> {
    if (isDbConnected && pool) {
      try {
        const [vocabStats]: any = await pool.query(
          `SELECT 
             COALESCE(SUM(CASE WHEN is_learned = 1 THEN 1 ELSE 0 END), 0) as learnedCount,
             COALESCE(SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END), 0) as favCount
           FROM user_vocabulary_progress
           WHERE user_id = ?`,
          [userId]
        );

        const [examStats]: any = await pool.query(
          `SELECT 
             COUNT(*) as completedTests,
             COALESCE(AVG(score), 0) as avgScore
           FROM exam_results
           WHERE user_id = ?`,
          [userId]
        );

        const [timeStats]: any = await pool.query(
          `SELECT COALESCE(SUM(minutes), 0) as totalMins
           FROM study_sessions
           WHERE user_id = ?`,
          [userId]
        );

        return {
          learnedWordsCount: parseInt(vocabStats[0]?.learnedCount || 0),
          favoriteWordsCount: parseInt(vocabStats[0]?.favCount || 0),
          completedTestsCount: parseInt(examStats[0]?.completedTests || 0),
          averageScore: Math.round(Number(examStats[0]?.avgScore || 0)),
          totalMinutes: parseInt(timeStats[0]?.totalMins || 0)
        };
      } catch (e) {
        // Fall back below
      }
    }

    const userResults = memoryExamResults.filter(r => r.userId === userId);
    const avg = userResults.length > 0 
      ? Math.round(userResults.reduce((s, r) => s + r.score, 0) / userResults.length)
      : 0;
    const userSessions = memoryStudySessions.filter(s => s.userId === userId);
    const totalMins = userSessions.reduce((acc, s) => acc + s.minutes, 0);

    return {
      learnedWordsCount: 0,
      favoriteWordsCount: 0,
      completedTestsCount: userResults.length,
      averageScore: avg,
      totalMinutes: totalMins || userResults.reduce((s, r) => s + (r.minutes || 5), 0)
    };
  }
}
