import { pool, isDbConnected } from "./db";

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

let memoryExamResults: DBExamResult[] = [];
let memoryStudySessions: DBStudySession[] = [];

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

    if (isDbConnected && pool) {
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

      return {
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
    }

    const newResult: DBExamResult = {
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
    memoryExamResults.unshift(newResult);
    return newResult;
  }

  static async getUserResults(userId: number): Promise<DBExamResult[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        `SELECT id, user_id as userId, exam_title as examTitle, category, score, correct_answers as correctAnswers, total_questions as totalQuestions, time_spent as timeSpent, DATE_FORMAT(created_at, '%Y-%m-%d') as date, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as createdAt
         FROM exam_results 
         WHERE user_id = ? 
         ORDER BY id DESC`,
        [userId]
      );
      return rows;
    }
    return memoryExamResults.filter(r => r.userId === userId);
  }

  static async getUserStudySessions(userId: number): Promise<DBStudySession[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        `SELECT id, user_id as userId, DATE_FORMAT(study_date, '%Y-%m-%d') as date, minutes, words_learned as wordsLearned, score
         FROM study_sessions
         WHERE user_id = ?
         ORDER BY study_date ASC`,
        [userId]
      );
      return rows;
    }
    return memoryStudySessions.filter(s => s.userId === userId);
  }

  static async recordStudySession(userId: number, minutes: number, wordsLearned: number, score: number): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    if (isDbConnected && pool) {
      await pool.query(
        `INSERT INTO study_sessions (user_id, study_date, minutes, words_learned, score)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            minutes = minutes + VALUES(minutes),
            words_learned = words_learned + VALUES(words_learned),
            score = GREATEST(score, VALUES(score))`,
        [userId, today, minutes, wordsLearned, score]
      );
    }
  }

  static async getUserStats(userId: number): Promise<{
    learnedWordsCount: number;
    favoriteWordsCount: number;
    completedTestsCount: number;
    averageScore: number;
    totalMinutes: number;
  }> {
    if (isDbConnected && pool) {
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
    }

    const userResults = memoryExamResults.filter(r => r.userId === userId);
    const avg = userResults.length > 0 
      ? Math.round(userResults.reduce((s, r) => s + r.score, 0) / userResults.length)
      : 0;
    return {
      learnedWordsCount: 0,
      favoriteWordsCount: 0,
      completedTestsCount: userResults.length,
      averageScore: avg,
      totalMinutes: userResults.reduce((s, r) => s + (r.minutes || 5), 0)
    };
  }
}
