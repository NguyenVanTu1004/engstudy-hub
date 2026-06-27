import { Request, Response } from "express";
import { DocumentModel } from "../models/documentModel";

export class DocumentController {
  static async getDocuments(req: Request, res: Response) {
    try {
      const documents = await DocumentModel.getAll();
      return res.json({ success: true, documents });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tải tài liệu học tập: " + err.message });
    }
  }

  static async createDocument(req: Request, res: Response) {
    const { title, description, content, category, downloadUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Tiêu đề và nội dung tài liệu là bắt buộc!" });
    }

    try {
      const doc = await DocumentModel.create({
        title,
        description,
        content,
        category: category || "General",
        downloadUrl,
        createdAt: new Date().toISOString().split("T")[0]
      });
      return res.json({ success: true, document: doc, message: "Đăng tải tài liệu thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tạo tài liệu mới: " + err.message });
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      const ok = await DocumentModel.delete(id);
      if (ok) {
        return res.json({ success: true, message: "Đã xóa tài liệu học tập thành công!" });
      } else {
        return res.status(404).json({ success: false, message: "Không tìm thấy tài liệu!" });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xóa tài liệu: " + err.message });
    }
  }
}
