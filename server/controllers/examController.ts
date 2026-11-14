import { Response } from "express";
import { ExamModel } from "../models/examModel";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class ExamController {
  static async submitResult(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để lưu kết quả thi!" });
    }

    const { examTitle, category, score, correctAnswers, totalQuestions, timeSpent } = req.body;

    if (!examTitle || score === undefined || correctAnswers === undefined || totalQuestions === undefined) {
      return res.status(400).json({ success: false, message: "Dữ liệu kết quả thi không hợp lệ!" });
    }

    try {
      const result = await ExamModel.saveResult({
        userId: req.user.id,
        examTitle,
        category: category || "TOEIC",
        score: Number(score),
        correctAnswers: Number(correctAnswers),
        totalQuestions: Number(totalQuestions),
        timeSpent: timeSpent || "5m 0s"
      });

      return res.json({
        success: true,
        message: "Kết quả bài thi đã được lưu thành công vào cơ sở dữ liệu!",
        result
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi lưu kết quả bài thi: " + err.message });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập!" });
    }

    try {
      const history = await ExamModel.getUserResults(req.user.id);
      return res.json({ success: true, history });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tải lịch sử thi: " + err.message });
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập!" });
    }

    try {
      const stats = await ExamModel.getUserStats(req.user.id);
      const studySessions = await ExamModel.getUserStudySessions(req.user.id);
      return res.json({ success: true, stats, studySessions });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tải thống kê học tập: " + err.message });
    }
  }
}
