import { pool, isDbConnected } from "./db";

export interface DBVocabulary {
  id: number;
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  exampleMeaning?: string;
  image?: string;
  difficulty: string;
  isLearned: boolean;
  topic: string;
  createdAt: string;
}

export let memoryVocabularies: DBVocabulary[] = [];

export class VocabularyModel {
  static async getAll(): Promise<DBVocabulary[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        `SELECT id, word, ipa, meaning, part_of_speech as partOfSpeech, example, example_meaning as exampleMeaning, image, difficulty, is_learned as isLearned, topic, created_at as createdAt FROM vocabularies ORDER BY id DESC`
      );
      return rows.map((r: any) => ({
        ...r,
        isLearned: !!r.isLearned
      }));
    }
    return memoryVocabularies;
  }

  static async create(vocab: Omit<DBVocabulary, "id">): Promise<DBVocabulary> {
    const today = new Date().toISOString().split("T")[0];
    if (isDbConnected && pool) {
      const [result]: any = await pool.query(
        `INSERT INTO vocabularies (word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [vocab.word, vocab.ipa, vocab.meaning, vocab.partOfSpeech, vocab.example, vocab.exampleMeaning, vocab.image, vocab.difficulty, vocab.topic || 'TOEIC Office', today]
      );
      return {
        id: result.insertId,
        ...vocab,
        isLearned: false,
        createdAt: today
      };
    }

    const newVocab = {
      id: Date.now(),
      ...vocab,
      isLearned: false,
      createdAt: today
    };
    memoryVocabularies.push(newVocab);
    return newVocab;
  }

  static async update(id: number, vocab: Partial<DBVocabulary>): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query(
        `UPDATE vocabularies SET word = ?, ipa = ?, meaning = ?, part_of_speech = ?, example = ?, example_meaning = ?, image = ?, difficulty = ?, is_learned = ?, topic = ?
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
          vocab.isLearned ? 1 : 0,
          vocab.topic,
          id
        ]
      );
      return true;
    }

    memoryVocabularies = memoryVocabularies.map(v => {
      if (v.id === id) {
        return {
          ...v,
          ...vocab
        };
      }
      return v;
    });
    return true;
  }

  static async delete(id: number): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query("DELETE FROM vocabularies WHERE id = ?", [id]);
      return true;
    }
    memoryVocabularies = memoryVocabularies.filter(v => v.id !== id);
    return true;
  }

  static async sync(vocabularies: DBVocabulary[]): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query("SET FOREIGN_KEY_CHECKS = 0;");
      await pool.query("TRUNCATE TABLE vocabularies;");

      const today = new Date().toISOString().split("T")[0];

      for (const v of vocabularies) {
        await pool.query(
          `INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [v.id, v.word, v.ipa, v.meaning, v.partOfSpeech, v.example, v.exampleMeaning, v.image || '', v.difficulty, v.isLearned ? 1 : 0, v.topic, v.createdAt || today]
        );
      }
      await pool.query("SET FOREIGN_KEY_CHECKS = 1;");
      return true;
    }

    memoryVocabularies = [...vocabularies];
    return true;
  }
}
