import { pool, isDbConnected } from "./db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

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

const USERS_STORE_PATH = path.join(process.cwd(), "server", "data", "users_store.json");

function loadUsersStore(): DBUser[] {
  try {
    if (fs.existsSync(USERS_STORE_PATH)) {
      const content = fs.readFileSync(USERS_STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`👤 Loaded ${parsed.length} persistent user accounts from users_store.json`);
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Error reading users_store.json, using defaults:", err.message);
  }

  return [
    {
      id: 1,
      username: 'admin',
      fullName: 'Nguyễn Văn Tứ',
      email: 'nguyenvantu03848@gmail.com',
      password: '$2b$10$rYNZ9.15wa3YiUmkyePAZ.8FL/Y6T8VAD6pi7CmhuWMLDc5/S1J9a',
      role: 'ADMIN',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-06-25'
    },
    {
      id: 2,
      username: 'tu',
      fullName: 'văn tứ',
      email: 'tu@gmail.com',
      password: 'VanTu1004@',
      role: 'USER',
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Mars',
      createdAt: '2026-06-25'
    },
    {
      id: 9,
      username: 'van tuu',
      fullName: 'nguyen van tu',
      email: 'nguyenvantu090893848@gmail.com',
      password: '$2b$10$udMTNLrP42l/uthcjD1Gj.dNd17OLwNm5bPTmttXjDj43EBWhq3mW',
      role: 'USER',
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Earth',
      createdAt: '2026-11-13'
    }
  ];
}

function saveUsersStore(users: DBUser[]) {
  try {
    const dir = path.dirname(USERS_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("⚠️ Failed to write to users_store.json:", err.message);
  }
}

// Persistent In-Memory Database Fallback Store
export let memoryUsers: DBUser[] = loadUsersStore();

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
      try {
        const [rows]: any = await pool.query(
          "SELECT id, username, full_name as fullName, email, role, is_active as isActive, avatar, created_at as createdAt FROM users ORDER BY id DESC"
        );
        if (rows && rows.length > 0) {
          return rows.map((r: any) => ({
            ...r,
            isActive: !!r.isActive
          }));
        }
      } catch (e: any) {
        console.warn("⚠️ Error fetching users from pool, falling back to persistent store:", e.message);
      }
    }
    return memoryUsers.map(({ password, ...u }) => u);
  }

  static async findById(id: number): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query(
          "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE id = ?",
          [id]
        );
        if (rows[0]) {
          return { ...rows[0], isActive: !!rows[0].isActive };
        }
      } catch (e) {
        // Fall back to memory store
      }
    }
    const user = memoryUsers.find(u => u.id === id);
    return user || null;
  }

  static async findByUsername(username: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query(
          "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(username) = LOWER(?)",
          [username]
        );
        if (rows[0]) {
          return { ...rows[0], isActive: !!rows[0].isActive };
        }
      } catch (e) {
        // Fall back to memory store
      }
    }
    const user = memoryUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  static async findByEmail(email: string): Promise<DBUser | null> {
    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query(
          "SELECT id, username, full_name as fullName, email, password, role, is_active as isActive, avatar, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)",
          [email]
        );
        if (rows[0]) {
          return { ...rows[0], isActive: !!rows[0].isActive };
        }
      } catch (e) {
        // Fall back to memory store
      }
    }
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async create(user: Omit<DBUser, "id">): Promise<DBUser> {
    const hashedPassword = user.password ? await this.hashPassword(user.password) : "";
    const today = user.createdAt || new Date().toISOString().split("T")[0];

    let createdUser: DBUser;

    if (isDbConnected && pool) {
      try {
        const [result]: any = await pool.query(
          "INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [user.username, user.fullName, user.email, hashedPassword, user.role, user.isActive ? 1 : 0, user.avatar, today]
        );
        createdUser = {
          id: result.insertId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          avatar: user.avatar,
          createdAt: today,
          password: hashedPassword
        };
      } catch (e: any) {
        console.warn("⚠️ Failed to insert user into MySQL pool, falling back to disk store:", e.message);
        createdUser = {
          id: Date.now(),
          ...user,
          password: hashedPassword,
          createdAt: today
        };
      }
    } else {
      createdUser = {
        id: Date.now(),
        ...user,
        password: hashedPassword,
        createdAt: today
      };
    }

    // Always mirror to persistent store so accounts survive server restarts & outages
    memoryUsers = memoryUsers.filter(u => u.username.toLowerCase() !== createdUser.username.toLowerCase() && u.id !== createdUser.id);
    memoryUsers.unshift(createdUser);
    saveUsersStore(memoryUsers);

    return createdUser;
  }

  static async update(id: number, data: Partial<Omit<DBUser, "id">>): Promise<boolean> {
    let hashedPassword: string | undefined = undefined;
    if (data.password) {
      hashedPassword = await this.hashPassword(data.password);
    }

    if (isDbConnected && pool) {
      try {
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
      } catch (e: any) {
        console.warn("⚠️ Failed to update user in MySQL pool, persisting to file store:", e.message);
      }
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
    saveUsersStore(memoryUsers);
    return true;
  }

  static async upgradeLegacyPassword(id: number, plainPassword: string): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(plainPassword);
      if (isDbConnected && pool) {
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
      }
      memoryUsers = memoryUsers.map(u => u.id === id ? { ...u, password: hashedPassword } : u);
      saveUsersStore(memoryUsers);
    } catch (e) {
      console.warn("Could not auto-upgrade legacy password:", e);
    }
  }

  static async delete(id: number): Promise<boolean> {
    if (isDbConnected && pool) {
      try {
        await pool.query("DELETE FROM users WHERE id = ?", [id]);
      } catch (e: any) {
        console.warn("⚠️ Failed to delete user from MySQL pool:", e.message);
      }
    }
    memoryUsers = memoryUsers.filter(u => u.id !== id);
    saveUsersStore(memoryUsers);
    return true;
  }
}
