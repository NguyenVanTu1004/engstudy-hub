import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { OtpModel } from "../models/otpModel";
import { isDbConnected } from "../models/db";
import nodemailer from "nodemailer";

// SMTP Transporter setup
function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const { username, fullName, email, password, avatar } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đăng ký bắt buộc!" });
    }

    const defaultAvatar = avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
    const today = new Date().toISOString().split("T")[0];

    try {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại trong hệ thống!" });
      }

      await UserModel.create({
        username,
        fullName,
        email,
        password,
        role: "USER",
        isActive: true,
        avatar: defaultAvatar,
        createdAt: today
      });

      const modeMsg = isDbConnected ? "vào Hệ thống Chính" : "vào Hệ thống Lưu trữ Dự phòng";
      return res.json({ success: true, message: `Đăng ký thành công tài khoản mới ${modeMsg}!` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi đăng ký tài khoản: " + err.message });
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" });
    }

    try {
      const user = await UserModel.findByUsernameAndPassword(username, password);

      if (!user) {
        return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Tài khoản này đã bị khóa bởi Quản trị viên!" });
      }

      return res.json({ success: true, user });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi đăng nhập: " + err.message });
    }
  }

  static async requestOtp(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập Email đã đăng ký!" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ success: false, message: "Không tìm thấy người dùng nào với email này trong hệ thống!" });
      }

      await OtpModel.saveOtp(email, otpCode, expiresAt);

      const mailer = getMailTransporter();
      let emailSentSuccessfully = false;
      let emailError = "";

      if (mailer) {
        try {
          const fromAddress = process.env.SMTP_FROM || `"ENGStudy Support" <${process.env.SMTP_USER}>`;
          await mailer.sendMail({
            from: fromAddress,
            to: email,
            subject: `[ENGStudy] Mã xác thực OTP cấp lại mật khẩu: ${otpCode}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 30px auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.15); color: #ffffff;">ENGStudy Support</h1>
                  <p style="margin: 6px 0 0 0; color: #c7d2fe; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px;">CẤP LẠI MẬT KHẨU TÀI KHOẢN</p>
                </div>
                
                <div style="padding: 40px 35px; background-color: #ffffff;">
                  <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; font-weight: 600;">Xin chào bạn,</p>
                  <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">Chúng tôi đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản liên kết với địa chỉ email của bạn. Để bảo mật thông tin, vui lòng sử dụng mã xác minh OTP bên dưới để xác thực:</p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <div style="display: inline-block; padding: 15px 30px; background-color: #f0fdf4; border: 2px dashed #bbf7d0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.01);">
                      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 1.2px;">Mã xác thực OTP của bạn</p>
                      <span style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #16a34a; display: block; padding-left: 8px;">
                        ${otpCode}
                      </span>
                    </div>
                  </div>
                  
                  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="vertical-align: top; width: 24px;">
                          <span style="font-size: 16px; line-height: 1;">⚠️</span>
                        </td>
                        <td style="font-size: 13px; color: #b45309; line-height: 1.5; padding-left: 8px;">
                          <strong>Lưu ý quan trọng:</strong> Mã OTP này chỉ có hiệu lực sử dụng trong vòng <strong>5 phút</strong>. Tuyệt đối không được tiết lộ hoặc chia sẻ mã này cho bất kỳ ai khác (kể cả nhân viên hỗ trợ của ENGStudy).
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Nếu bạn không yêu cầu hành động này, bạn có thể an tâm bỏ qua email này. Tài khoản của bạn vẫn được bảo mật an toàn.</p>
                </div>
                
                <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 25px 35px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                  <p style="margin: 0;">Đây là email tự động từ hệ thống. Vui lòng không trả lời trực tiếp thư này.</p>
                  <p style="margin: 6px 0 0 0; font-weight: 600; color: #64748b;">ENGStudy Platform © 2026 - Hệ thống học Tiếng Anh thông minh</p>
                </div>
              </div>
            `
          });
          emailSentSuccessfully = true;
        } catch (err: any) {
          emailError = err.message || String(err);
          console.error("📧 Error sending real OTP email:", err);
        }
      } else {
        console.log(`✉️ [INFO] SMTP is not configured. Displaying OTP: [${otpCode}] for user ${email}`);
      }

      return res.json({
        success: true,
        message: emailSentSuccessfully 
          ? "Mã xác thực OTP đã được gửi thành công đến hòm thư email của bạn!"
          : "Đã tạo mã OTP khôi phục mật khẩu thành công!",
        otpForTesting: emailSentSuccessfully ? null : otpCode,
        debugMode: !emailSentSuccessfully
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi yêu cầu mã OTP: " + err.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu xác thực bắt buộc!" });
    }

    try {
      const isValid = await OtpModel.verifyAndConsume(email, otp);
      if (!isValid) {
        return res.status(400).json({ success: false, message: "Mã OTP không đúng hoặc đã hết hạn sử dụng!" });
      }

      const user = await UserModel.findByEmail(email);
      if (user) {
        await UserModel.update(user.id, { password: newPassword });
        return res.json({ success: true, message: "Mật khẩu mới đã được cập nhật thành công! Vui lòng đăng nhập lại." });
      } else {
        return res.status(400).json({ success: false, message: "Không tìm thấy tài khoản người dùng!" });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Lỗi xác thực mã OTP: " + err.message });
    }
  }
}
