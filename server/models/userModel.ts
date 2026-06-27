import { pool, isDbConnected } from "./db";

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
    email: 'admin@edu.vn',
    password: 'admin',
    role: 'ADMIN',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10'
  },
  {
    id: 2,
    username: 'tuan_nguyen',
    fullName: 'Nguyễn Anh Tuấn',
    email: 'tuanna@gmail.com',
    password: '123',
    role: 'USER',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-06-15'
  }
];

export class UserModel {
  static async getAll(): Promise<DBUser[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users ORDER BY id DESC"
      );
      return rows;
    }
    return memoryUsers;
  }

  static async findByUsernameAndPassword(username: string, password?: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(username) = LOWER(?) AND password = ?",
        [username, password]
      );
      return rows[0] || null;
    }
    const user = memoryUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    return user || null;
  }

  static async findByUsername(username: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(username) = LOWER(?)",
        [username]
      );
      return rows[0] || null;
    }
    const user = memoryUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  static async findByEmail(email: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)",
        [email]
      );
      return rows[0] || null;
    }
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async create(user: Omit<DBUser, "id">): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query(
        "INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [user.username, user.fullName, user.email, user.password || "", user.role, user.isActive ? 1 : 0, user.avatar, user.createdAt]
      );
      return true;
    }
    
    const newUser = {
      id: Date.now(),
      ...user
    };
    memoryUsers.push(newUser);
    return true;
  }

  static async update(id: number, data: Partial<Omit<DBUser, "id">>): Promise<boolean> {
    if (isDbConnected && pool) {
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
      if (data.password !== undefined) {
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [data.password, id]);
      }
      return true;
    }

    memoryUsers = memoryUsers.map(u => {
      if (u.id === id) {
        return {
          ...u,
          ...data
        };
      }
      return u;
    });
    return true;
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
