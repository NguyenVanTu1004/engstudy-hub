import { Request, Response } from "express";
import { UserModel } from "../models/userModel";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.getAll();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi tải danh sách người dùng: " + err.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { role, isActive, fullName, email, avatar } = req.body;

    try {
      await UserModel.update(id, { role, isActive, fullName, email, avatar });
      return res.json({ success: true, message: "Cập nhật tài khoản thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi cập nhật tài khoản: " + err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      await UserModel.delete(id);
      return res.json({ success: true, message: "Đã xóa tài khoản thành công!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xóa tài khoản: " + err.message });
    }
  }
}
