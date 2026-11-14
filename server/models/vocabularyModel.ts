import { pool, isDbConnected } from "./db";
import fs from "fs";
import path from "path";

export interface DBVocabulary {
  id: string | number;
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  exampleMeaning?: string;
  image?: string;
  difficulty: string;
  isLearned: boolean;
  isFavorite?: boolean;
  topic: string;
  createdAt: string;
}

function loadDefaultVocabularies(): DBVocabulary[] {
  try {
    const seedPath = path.join(process.cwd(), "server", "data", "default_vocabularies.json");
    if (fs.existsSync(seedPath)) {
      const data = fs.readFileSync(seedPath, "utf-8");
      const list = JSON.parse(data);
      console.log(`📦 Loaded ${list.length} pre-seeded vocabularies for in-memory mode.`);
      return list;
    }
  } catch (e: any) {
    console.warn("⚠️ Could not load default_vocabularies.json:", e.message);
  }
  return [];
}

export let memoryVocabularies: DBVocabulary[] = loadDefaultVocabularies();
let memoryUserProgress: { [key: string]: { isLearned: boolean; isFavorite: boolean } } = {};

export class VocabularyModel {
  static async getAll(userId?: number): Promise<DBVocabulary[]> {
    if (isDbConnected && pool) {
      if (userId) {
        const [rows]: any = await pool.query(
          `SELECT v.id, v.word, v.ipa, v.meaning, v.part_of_speech as partOfSpeech, v.example, v.example_meaning as exampleMeaning, v.image, v.difficulty,
                  COALESCE(uvp.is_learned, 0) as isLearned,
                  COALESCE(uvp.is_favorite, 0) as isFavorite,
                  v.topic, v.created_at as createdAt
           FROM vocabularies v
           LEFT JOIN user_vocabulary_progress uvp ON v.id = uvp.vocabulary_id AND uvp.user_id = ?
           ORDER BY v.id DESC`,
          [userId]
        );
        return rows.map((r: any) => ({
          ...r,
          isLearned: !!r.isLearned,
          isFavorite: !!r.isFavorite
        }));
      }

      const [rows]: any = await pool.query(
        `SELECT id, word, ipa, meaning, part_of_speech as partOfSpeech, example, example_meaning as exampleMeaning, image, difficulty, is_learned as isLearned, 0 as isFavorite, topic, created_at as createdAt
         FROM vocabularies 
         ORDER BY id DESC`
      );
      return rows.map((r: any) => ({
        ...r,
        isLearned: !!r.isLearned,
        isFavorite: false
      }));
    }

    return memoryVocabularies.map(v => {
      const key = `${userId || 0}_${v.id}`;
      const prog = memoryUserProgress[key];
      return {
        ...v,
        isLearned: prog ? prog.isLearned : !!v.isLearned,
        isFavorite: prog ? prog.isFavorite : false
      };
    });
  }

  static async toggleLearned(userId: number, vocabId: string | number): Promise<{ isLearned: boolean }> {
    const vocabIdStr = String(vocabId);
    if (isDbConnected && pool) {
      await pool.query(
        `INSERT INTO user_vocabulary_progress (user_id, vocabulary_id, is_learned, is_favorite)
         VALUES (?, ?, 1, 0)
         ON DUPLICATE KEY UPDATE is_learned = NOT is_learned`,
        [userId, vocabIdStr]
      );
      const [rows]: any = await pool.query(
        `SELECT is_learned as isLearned FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?`,
        [userId, vocabIdStr]
      );

      const isNowLearned = !!rows[0]?.isLearned;
      const today = new Date().toISOString().split("T")[0];

      if (isNowLearned) {
        await pool.query(
          `INSERT INTO study_sessions (user_id, study_date, minutes, words_learned, score)
           VALUES (?, ?, 2, 1, 100)
           ON DUPLICATE KEY UPDATE 
              minutes = minutes + 2,
              words_learned = words_learned + 1`,
          [userId, today]
        );
      } else {
        await pool.query(
          `UPDATE study_sessions 
           SET minutes = GREATEST(0, minutes - 2), words_learned = GREATEST(0, words_learned - 1)
           WHERE user_id = ? AND study_date = ?`,
          [userId, today]
        );
      }

      return { isLearned: isNowLearned };
    }

    const key = `${userId}_${vocabIdStr}`;
    const curr = memoryUserProgress[key] || { isLearned: false, isFavorite: false };
    curr.isLearned = !curr.isLearned;
    memoryUserProgress[key] = curr;
    return { isLearned: curr.isLearned };
  }

  static async toggleFavorite(userId: number, vocabId: string | number): Promise<{ isFavorite: boolean }> {
    const vocabIdStr = String(vocabId);
    if (isDbConnected && pool) {
      await pool.query(
        `INSERT INTO user_vocabulary_progress (user_id, vocabulary_id, is_learned, is_favorite)
         VALUES (?, ?, 0, 1)
         ON DUPLICATE KEY UPDATE is_favorite = NOT is_favorite`,
        [userId, vocabIdStr]
      );
      const [rows]: any = await pool.query(
        `SELECT is_favorite as isFavorite FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?`,
        [userId, vocabIdStr]
      );
      return { isFavorite: !!rows[0]?.isFavorite };
    }

    const key = `${userId}_${vocabIdStr}`;
    const curr = memoryUserProgress[key] || { isLearned: false, isFavorite: false };
    curr.isFavorite = !curr.isFavorite;
    memoryUserProgress[key] = curr;
    return { isFavorite: curr.isFavorite };
  }

  static async create(vocab: Omit<DBVocabulary, "id">): Promise<DBVocabulary> {
    const today = new Date().toISOString().split("T")[0];
    const generatedId = `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (isDbConnected && pool) {
      await pool.query(
        `INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [generatedId, vocab.word, vocab.ipa || '', vocab.meaning, vocab.partOfSpeech || '', vocab.example || '', vocab.exampleMeaning || '', vocab.image || '', vocab.difficulty || 'Medium', vocab.topic || 'TOEIC Office', today]
      );
      return {
        id: generatedId,
        ...vocab,
        isLearned: false,
        isFavorite: false,
        createdAt: today
      };
    }

    const newVocab = {
      id: generatedId,
      ...vocab,
      isLearned: false,
      isFavorite: false,
      createdAt: today
    };
    memoryVocabularies.push(newVocab);
    return newVocab;
  }

  static async update(id: string | number, vocab: Partial<DBVocabulary>): Promise<boolean> {
    const vocabIdStr = String(id);
    if (isDbConnected && pool) {
      await pool.query(
        `UPDATE vocabularies SET word = ?, ipa = ?, meaning = ?, part_of_speech = ?, example = ?, example_meaning = ?, image = ?, difficulty = ?, topic = ?
         WHERE id = ?`,
        [
          vocab.word,
          vocab.ipa,
          vocab.meaning,
          vocab.partOfSpeech,
          vocab.example,
          vocab.exampleMeaning,
          vocab.image,
          vocab.difficulty,
          vocab.topic,
          vocabIdStr
        ]
      );
      return true;
    }

    memoryVocabularies = memoryVocabularies.map(v => {
      if (String(v.id) === vocabIdStr) {
        return {
          ...v,
          ...vocab
        };
      }
      return v;
    });
    return true;
  }

  static async delete(id: string | number): Promise<boolean> {
    const vocabIdStr = String(id);
    if (isDbConnected && pool) {
      await pool.query("DELETE FROM user_vocabulary_progress WHERE vocabulary_id = ?", [vocabIdStr]);
      await pool.query("DELETE FROM vocabularies WHERE id = ?", [vocabIdStr]);
      return true;
    }
    memoryVocabularies = memoryVocabularies.filter(v => String(v.id) !== vocabIdStr);
    return true;
  }

  static async sync(vocabularies: DBVocabulary[]): Promise<boolean> {
    if (isDbConnected && pool) {
      const today = new Date().toISOString().split("T")[0];
      const BATCH_SIZE = 500;

      // 1. Fetch all existing words in database to prevent duplicates
      const [existingRows]: any = await pool.query("SELECT id, LOWER(TRIM(word)) as word_lower FROM vocabularies");
      const wordMap = new Map<string, string>(); // lowercase word -> existing id
      for (const row of existingRows) {
        if (row.word_lower) {
          wordMap.set(row.word_lower, String(row.id));
        }
      }

      for (let i = 0; i < vocabularies.length; i += BATCH_SIZE) {
        const chunk = vocabularies.slice(i, i + BATCH_SIZE);
        const values = chunk.map((v, idx) => {
          const cleanWord = (v.word || '').trim().toLowerCase();
          let targetId = v.id ? String(v.id) : null;
          
          // If word already exists in database, reuse its ID to UPDATE instead of duplicating
          if (wordMap.has(cleanWord)) {
            targetId = wordMap.get(cleanWord)!;
          } else {
            if (!targetId) {
              targetId = `v_${Date.now()}_${i + idx}`;
            }
            wordMap.set(cleanWord, targetId);
          }

          return [
            targetId,
            v.word || '',
            v.ipa || '',
            v.meaning || '',
            v.partOfSpeech || 'Noun',
            v.example || '',
            v.exampleMeaning || '',
            v.image || '',
            v.difficulty || 'Medium',
            v.isLearned ? 1 : 0,
            v.topic || 'General',
            v.createdAt ? (typeof v.createdAt === 'string' && v.createdAt.includes('T') ? v.createdAt.split('T')[0] : v.createdAt) : today
          ];
        });

        const sql = `
          INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
          VALUES ?
          ON DUPLICATE KEY UPDATE 
            word = VALUES(word),
            ipa = VALUES(ipa),
            meaning = VALUES(meaning),
            part_of_speech = VALUES(part_of_speech),
            example = VALUES(example),
            example_meaning = VALUES(example_meaning),
            image = VALUES(image),
            difficulty = VALUES(difficulty),
            topic = VALUES(topic)
        `;

        await pool.query(sql, [values]);
      }
      return true;
    }

    // In-memory de-duplication fallback
    for (const v of vocabularies) {
      const cleanWord = (v.word || '').trim().toLowerCase();
      const existingIdx = memoryVocabularies.findIndex(m => m.word.trim().toLowerCase() === cleanWord);
      if (existingIdx !== -1) {
        memoryVocabularies[existingIdx] = {
          ...memoryVocabularies[existingIdx],
          ...v,
          id: memoryVocabularies[existingIdx].id
        };
      } else {
        memoryVocabularies.push({
          ...v,
          id: v.id || `v_${Date.now()}_${Math.random()}`
        });
      }
    }
    return true;
  }
}
