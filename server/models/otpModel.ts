import { pool, isDbConnected } from "./db";

export interface DBOtp {
  email: string;
  otp: string;
  expiresAt: number;
}

export let memoryOtps: DBOtp[] = [];

export class OtpModel {
  static async saveOtp(email: string, otp: string, expiresAt: number): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query("DELETE FROM otps WHERE email = ?", [email]);
      await pool.query("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)", [email, otp, expiresAt]);
      return true;
    }

    memoryOtps = memoryOtps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
    memoryOtps.push({ email, otp, expiresAt });
    return true;
  }

  static async verifyAndConsume(email: string, otp: string): Promise<boolean> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id FROM otps WHERE email = ? AND otp = ? AND expires_at > ?",
        [email, otp, Date.now()]
      );

      if (rows.length > 0) {
        await pool.query("DELETE FROM otps WHERE email = ?", [email]);
        return true;
      }
      return false;
    }

    const foundIdx = memoryOtps.findIndex(
      o => o.email.toLowerCase() === email.toLowerCase() && o.otp === otp && o.expiresAt > Date.now()
    );

    if (foundIdx !== -1) {
      memoryOtps.splice(foundIdx, 1);
      return true;
    }
    return false;
  }
}
