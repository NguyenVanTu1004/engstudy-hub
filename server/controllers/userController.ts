import { Response } from "express";
import { UserModel } from "../models/userModel";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UserModel.getAll();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tải danh sách người dùng: " + err.message });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    const { role, isActive, fullName, email, avatar, password } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ!" });
    }

    if (id === 1 && isActive === false) {
      return res.status(400).json({ success: false, message: "Không thể khóa tài khoản Super Admin!" });
    }

    if (id === 1 && role && role !== "ADMIN") {
      return res.status(400).json({ success: false, message: "Không thể thay đổi quyền Super Admin!" });
    }

    try {
      await UserModel.update(id, { role, isActive, fullName, email, avatar, password });
      return res.json({ success: true, message: "Cập nhật tài khoản thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật tài khoản: " + err.message });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ!" });
    }

    if (req.user && req.user.id === id) {
      return res.status(400).json({ success: false, message: "Bạn không thể tự xóa tài khoản của chính mình!" });
    }

    try {
      await UserModel.delete(id);
      return res.json({ success: true, message: "Đã xóa tài khoản thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xóa tài khoản: " + err.message });
    }
  }
}
