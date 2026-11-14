import { pool, isDbConnected } from "./db";
import bcrypt from "bcryptjs";

export interface DBUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  avatar: string;
  createdAt: string;
}

// In-Memory Database Fallback Store
export let memoryUsers: DBUser[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Nguyễn Văn Admin',
    email: 'nguyenvantu03848@gmail.com',
    password: '$2a$10$wT0X7Vf8m8W8n3Vq7g5SfeO9l3Yw0s.g34qZ6j3rJtH5E5L7z1Qx.', // hashed 'VanTu1004@'
    role: 'ADMIN',
    isActive: true,
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury',
    createdAt: '2026-01-10'
  }
];

export class UserModel {
  static async verifyPassword(plainPassword: string, storedPassword?: string): Promise<boolean> {
    if (!storedPassword) return false;
    // Check if stored as bcrypt hash
    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
      return bcrypt.compare(plainPassword, storedPassword);
    }
    // Fallback plain-text comparison for legacy accounts
    return plainPassword === storedPassword;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async getAll(): Promise<Omit<DBUser, "password">[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users ORDER BY id DESC"
      );
      return rows.map((r: any) => ({
        ...r,
        isActive: !!r.isActive
      }));
    }
    return memoryUsers.map(({ password, ...u }) => u);
  }

  static async findById(id: number): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE id = ?",
        [id]
      );
      if (rows[0]) {
        return { ...rows[0], isActive: !!rows[0].isActive };
      }
      return null;
    }
    const user = memoryUsers.find(u => u.id === id);
    return user || null;
  }

  static async findByUsername(username: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(username) = LOWER(?)",
        [username]
      );
      if (rows[0]) {
        return { ...rows[0], isActive: !!rows[0].isActive };
      }
      return null;
    }
    const user = memoryUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  static async findByEmail(email: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)",
        [email]
      );
      if (rows[0]) {
        return { ...rows[0], isActive: !!rows[0].isActive };
      }
      return null;
    }
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async create(user: Omit<DBUser, "id">): Promise<DBUser> {
    const hashedPassword = user.password ? await this.hashPassword(user.password) : "";
    const today = user.createdAt || new Date().toISOString().split("T")[0];

    if (isDbConnected && pool) {
      const [result]: any = await pool.query(
        "INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [user.username, user.fullName, user.email, hashedPassword, user.role, user.isActive ? 1 : 0, user.avatar, today]
      );
      return {
        id: result.insertId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        createdAt: today
      };
    }
    
    const newUser: DBUser = {
      id: Date.now(),
      ...user,
      password: hashedPassword,
      createdAt: today
    };
    memoryUsers.push(newUser);
    return newUser;
  }

  static async update(id: number, data: Partial<Omit<DBUser, "id">>): Promise<boolean> {
    let hashedPassword: string | undefined = undefined;
    if (data.password) {
      hashedPassword = await this.hashPassword(data.password);
    }

    if (isDbConnected && pool) {
      if (data.username !== undefined) {
        await pool.query("UPDATE users SET username = ? WHERE id = ?", [data.username, id]);
      }
      if (data.role !== undefined) {
        await pool.query("UPDATE users SET role = ? WHERE id = ?", [data.role, id]);
      }
      if (data.isActive !== undefined) {
        await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [data.isActive ? 1 : 0, id]);
      }
      if (data.fullName !== undefined) {
        await pool.query("UPDATE users SET full_name = ? WHERE id = ?", [data.fullName, id]);
      }
      if (data.email !== undefined) {
        await pool.query("UPDATE users SET email = ? WHERE id = ?", [data.email, id]);
      }
      if (data.avatar !== undefined) {
        await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [data.avatar, id]);
      }
      if (hashedPassword !== undefined) {
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
      }
      return true;
    }

    memoryUsers = memoryUsers.map(u => {
      if (u.id === id) {
        return {
          ...u,
          ...data,
          ...(hashedPassword ? { password: hashedPassword } : {})
        };
      }
      return u;
    });
    return true;
  }

  static async upgradeLegacyPassword(id: number, plainPassword: string): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(plainPassword);
      if (isDbConnected && pool) {
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
      }
    } catch (e) {
      console.warn("Could not auto-upgrade legacy password:", e);
    }
  }

  static async delete(id: number): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query("DELETE FROM users WHERE id = ?", [id]);
      return true;
    }
    memoryUsers = memoryUsers.filter(u => u.id !== id);
    return true;
  }
}
