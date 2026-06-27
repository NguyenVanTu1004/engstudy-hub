import { Request, Response } from "express";
import { VocabularyModel } from "../models/vocabularyModel";

export class VocabularyController {
  static async getVocabularies(req: Request, res: Response) {
    try {
      const vocabularies = await VocabularyModel.getAll();
      return res.json({ success: true, vocabularies });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách từ vựng: " + err.message });
    }
  }

  static async createVocabulary(req: Request, res: Response) {
    const { word, ipa, meaning, partOfSpeech, example, exampleMeaning, image, difficulty, topic } = req.body;

    try {
      const vocabulary = await VocabularyModel.create({
        word,
        ipa,
        meaning,
        partOfSpeech,
        example,
        exampleMeaning,
        image,
        difficulty,
        isLearned: false,
        topic: topic || "TOEIC Office",
        createdAt: new Date().toISOString().split("T")[0]
      });
      return res.json({ success: true, vocabulary });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi thêm từ vựng mới: " + err.message });
    }
  }

  static async updateVocabulary(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { word, ipa, meaning, partOfSpeech, example, exampleMeaning, image, difficulty, isLearned, topic } = req.body;

    try {
      await VocabularyModel.update(id, {
        word,
        ipa,
        meaning,
        partOfSpeech,
        example,
        exampleMeaning,
        image,
        difficulty,
        isLearned,
        topic
      });
      return res.json({ success: true, message: "Đã cập nhật từ vựng thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật từ vựng: " + err.message });
    }
  }

  static async deleteVocabulary(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      await VocabularyModel.delete(id);
      return res.json({ success: true, message: "Đã xóa từ vựng thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xóa từ vựng: " + err.message });
    }
  }

  static async syncVocabularies(req: Request, res: Response) {
    const { vocabularies } = req.body;
    if (!Array.isArray(vocabularies)) {
      return res.status(400).json({ success: false, message: "Dữ liệu từ vựng gửi lên không hợp lệ!" });
    }

    try {
      await VocabularyModel.sync(vocabularies);
      return res.json({ success: true, message: `Đồng bộ thành công ${vocabularies.length} từ vựng vào hệ thống!` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi đồng bộ từ vựng: " + err.message });
    }
  }
}
