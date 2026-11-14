import { Response } from "express";
import { VocabularyModel } from "../models/vocabularyModel";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class VocabularyController {
  static async getVocabularies(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const vocabularies = await VocabularyModel.getAll(userId);
      return res.json({ success: true, vocabularies });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách từ vựng: " + err.message });
    }
  }

  static async toggleLearned(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để lưu tiến độ học tập!" });
    }

    const vocabId = req.params.id;
    if (!vocabId) {
      return res.status(400).json({ success: false, message: "ID từ vựng không hợp lệ!" });
    }

    try {
      const result = await VocabularyModel.toggleLearned(req.user.id, vocabId);
      return res.json({ success: true, isLearned: result.isLearned });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật tiến độ học: " + err.message });
    }
  }

  static async toggleFavorite(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để lưu từ vựng yêu thích!" });
    }

    const vocabId = req.params.id;
    if (!vocabId) {
      return res.status(400).json({ success: false, message: "ID từ vựng không hợp lệ!" });
    }

    try {
      const result = await VocabularyModel.toggleFavorite(req.user.id, vocabId);
      return res.json({ success: true, isFavorite: result.isFavorite });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật từ yêu thích: " + err.message });
    }
  }

  static async createVocabulary(req: AuthenticatedRequest, res: Response) {
    const { word, ipa, meaning, partOfSpeech, example, exampleMeaning, image, difficulty, topic } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ success: false, message: "Từ tiếng Anh và định nghĩa là bắt buộc!" });
    }

    try {
      const vocabulary = await VocabularyModel.create({
        word,
        ipa,
        meaning,
        partOfSpeech,
        example,
        exampleMeaning,
        image,
        difficulty: difficulty || "Medium",
        isLearned: false,
        topic: topic || "TOEIC Office",
        createdAt: new Date().toISOString().split("T")[0]
      });
      return res.json({ success: true, vocabulary, message: "Thêm từ vựng thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi thêm từ vựng mới: " + err.message });
    }
  }

  static async updateVocabulary(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id;
    const { word, ipa, meaning, partOfSpeech, example, exampleMeaning, image, difficulty, topic } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID từ vựng không hợp lệ!" });
    }

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
        topic
      });
      return res.json({ success: true, message: "Đã cập nhật từ vựng thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật từ vựng: " + err.message });
    }
  }

  static async deleteVocabulary(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID từ vựng không hợp lệ!" });
    }

    try {
      await VocabularyModel.delete(id);
      return res.json({ success: true, message: "Đã xóa từ vựng thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xóa từ vựng: " + err.message });
    }
  }

  static async syncVocabularies(req: AuthenticatedRequest, res: Response) {
    const { vocabularies } = req.body;
    if (!Array.isArray(vocabularies)) {
      return res.status(400).json({ success: false, message: "Dữ liệu từ vựng gửi lên không hợp lệ!" });
    }

    try {
      await VocabularyModel.sync(vocabularies);
      return res.json({ success: true, message: `Đồng bộ thành công ${vocabularies.length} từ vựng vào hệ thống an toàn!` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi đồng bộ từ vựng: " + err.message });
    }
  }
}
