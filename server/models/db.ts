import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

dotenv.config();

export let isDbConnected = false;
export let dbErrorDetails: string = "";

let rawHost = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL || process.env.DB_HOST || "127.0.0.1";
let rawPort = parseInt(process.env.DB_PORT || "3307");
let rawUser = process.env.DB_USER || process.env.DB_USERNAME || "root";
let rawPassword = process.env.DB_PASSWORD || "";
let rawDatabase = process.env.DB_NAME || process.env.DB_DATABASE || "english_learning";

// Smart parsing if rawHost contains a full connection URL (e.g. mysql://user:pass@host:port/dbname)
if (rawHost.startsWith("mysql://") || rawHost.startsWith("mysql:")) {
  try {
    const url = new URL(rawHost);
    rawHost = url.hostname;
    if (url.port) {
      rawPort = parseInt(url.port);
    }
    if (url.username) {
      rawUser = decodeURIComponent(url.username);
    }
    if (url.password) {
      rawPassword = decodeURIComponent(url.password);
    }
    if (url.pathname) {
      const dbName = url.pathname.substring(1);
      if (dbName) {
        rawDatabase = dbName;
      }
    }
    console.log("🔌 Successfully parsed MySQL Connection String!");
  } catch (e: any) {
    console.warn("⚠️ Cannot parse DB connection string as URL, treating as literal string. Error:", e.message);
  }
}

export const dbConfigUsed = {
  host: rawHost,
  port: rawPort,
  user: rawUser,
  password: rawPassword,
  database: rawDatabase
};

export let pool: mysql.Pool | null = null;

export async function initDatabase() {
  const createAndTestPool = async (sslConfig: any) => {
    const testPool = mysql.createPool({
      host: dbConfigUsed.host,
      port: dbConfigUsed.port,
      user: dbConfigUsed.user,
      password: dbConfigUsed.password,
      database: dbConfigUsed.database,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    const connection = await testPool.getConnection();
    connection.release();
    return testPool;
  };

  try {
    console.log(`📡 Connecting to MySQL database at ${dbConfigUsed.host}:${dbConfigUsed.port}...`);
    
    // Determine whether to attempt SSL first:
    // Aiven / TiDB Cloud mandate SSL. Localhost, Railway TCP proxies, and Clever Cloud reject SSL handshakes.
    const isCloudHostWithSsl = process.env.DB_SSL === "true" || rawHost.includes("aivencloud") || rawHost.includes("tidbcloud");
    const isRailwayOrPlain = rawHost.includes("rlwy.net") || rawHost.includes("clever-cloud") || rawHost === "127.0.0.1" || rawHost === "localhost";

    const trySslFirst = isCloudHostWithSsl && !isRailwayOrPlain;

    try {
      pool = await createAndTestPool(trySslFirst ? { rejectUnauthorized: false } : undefined);
    } catch (firstErr: any) {
      console.warn(`⚠️ First connection attempt (${trySslFirst ? "with SSL" : "Plain TCP"}) failed: ${firstErr.message}. Retrying with alternate SSL setting...`);
      // Retry once by inverting SSL
      pool = await createAndTestPool(trySslFirst ? undefined : { rejectUnauthorized: false });
    }

    isDbConnected = true;
    dbErrorDetails = "";
    console.log(`✅ MySQL Database connected successfully [${dbConfigUsed.database}] on port ${dbConfigUsed.port}`);

    await createTablesIfNotExist();
    await syncPersistentUsersToDatabase();
  } catch (error: any) {
    isDbConnected = false;
    dbErrorDetails = error.message || String(error);
    pool = null;
    console.warn("⚠️ Cannot connect to MySQL. Falling back to persistent file/in-memory mode.");
    console.warn("⚠️ Error details:", dbErrorDetails);
  }
}

async function syncPersistentUsersToDatabase() {
  if (!pool) return;
  try {
    const usersStorePath = path.join(process.cwd(), "server", "data", "users_store.json");
    if (fs.existsSync(usersStorePath)) {
      const storedUsers: any[] = JSON.parse(fs.readFileSync(usersStorePath, "utf-8"));
      for (const u of storedUsers) {
        const [existing]: any = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [u.username, u.email]);
        if (!existing || existing.length === 0) {
          console.log(`🔄 Syncing persistent user [${u.username}] to MySQL database...`);
          await pool.query(
            "INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [u.username, u.fullName, u.email, u.password, u.role, u.isActive ? 1 : 0, u.avatar, u.createdAt || new Date().toISOString().split("T")[0]]
          );
        }
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Error syncing persistent users to MySQL:", err.message);
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        is_active BOOLEAN DEFAULT TRUE,
        avatar VARCHAR(255) DEFAULT '',
        created_at DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Vocabularies Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vocabularies (
        id VARCHAR(50) PRIMARY KEY,
        word VARCHAR(100) NOT NULL,
        ipa VARCHAR(100),
        meaning TEXT NOT NULL,
        part_of_speech VARCHAR(50),
        example TEXT,
        example_meaning TEXT,
        image TEXT,
        difficulty VARCHAR(20) DEFAULT 'Medium',
        is_learned BOOLEAN DEFAULT FALSE,
        topic VARCHAR(100) DEFAULT 'TOEIC Office',
        created_at DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. User Vocabulary Progress (Real per-user learning tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vocabulary_id VARCHAR(50) NOT NULL,
        is_learned BOOLEAN DEFAULT FALSE,
        is_favorite BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_vocab (user_id, vocabulary_id),
        INDEX idx_user_learned (user_id, is_learned),
        INDEX idx_user_fav (user_id, is_favorite)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Exam Results Table (Real persistence of test submissions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exam_title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        score INT NOT NULL,
        correct_answers INT NOT NULL,
        total_questions INT NOT NULL,
        time_spent VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_exam (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Study Sessions Table (Real user activity & charts)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        study_date DATE NOT NULL,
        minutes INT DEFAULT 0,
        words_learned INT DEFAULT 0,
        score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_date (user_id, study_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. OTPs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at BIGINT NOT NULL,
        INDEX idx_email_expires (email, expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Study Documents Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        download_url VARCHAR(255) DEFAULT '',
        created_at DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-seed 6,586 vocabularies if table is empty
    const [vocabRows]: any = await pool.query("SELECT COUNT(*) as count FROM vocabularies");
    if (vocabRows[0].count === 0) {
      console.log("📥 Auto-seeding 6,586 vocabularies into newly connected MySQL database...");
      const seedPath = path.join(process.cwd(), "server", "data", "default_vocabularies.json");
      if (fs.existsSync(seedPath)) {
        const seedData: any[] = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
        const batchSize = 1000;
        for (let i = 0; i < seedData.length; i += batchSize) {
          const chunk = seedData.slice(i, i + batchSize);
          const values = chunk.map(v => [
            String(v.id),
            v.word,
            v.ipa || '',
            v.meaning,
            v.partOfSpeech || 'Noun',
            v.example || '',
            v.exampleMeaning || '',
            v.image || '',
            v.difficulty || 'Medium',
            v.isLearned ? 1 : 0,
            v.topic || 'General',
            v.createdAt || new Date().toISOString().split('T')[0]
          ]);
          await pool.query(`
            INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
            VALUES ?
            ON DUPLICATE KEY UPDATE word = VALUES(word)
          `, [values]);
        }
        console.log(`✅ Successfully seeded ${seedData.length} vocabularies into MySQL database!`);
      }
    }

    console.log("⚙️ Verified production MySQL schemas (users, vocabularies, user_vocabulary_progress, exam_results, study_sessions, otps, study_documents).");

    // Insert Default admin user & sample members if empty
    const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
    if (rows[0].count === 0) {
      const defaultHashedPassword = await bcrypt.hash("VanTu1004@", 10);
      await pool.query(`
        INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at)
        VALUES 
        ('admin', 'Nguyễn Văn Tứ', 'nguyenvantu03848@gmail.com', ?, 'ADMIN', 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', CURRENT_DATE()),
        ('tu', 'văn tứ', 'tu@gmail.com', ?, 'USER', 1, 'https://api.dicebear.com/7.x/identicon/svg?seed=Mars', CURRENT_DATE()),
        ('van tuu', 'nguyen van tu', 'nguyenvantu090893848@gmail.com', ?, 'USER', 1, 'https://api.dicebear.com/7.x/identicon/svg?seed=Earth', CURRENT_DATE())
      `, [defaultHashedPassword, defaultHashedPassword, defaultHashedPassword]);
      console.log("👤 Seeded default administrator and sample members into database.");
    }

    // Insert Default study documents if empty
    const [docRows]: any = await pool.query("SELECT COUNT(*) as count FROM study_documents");
    if (docRows[0].count === 0) {
      await pool.query(`
        INSERT INTO study_documents (title, description, content, category, download_url, created_at)
        VALUES 
        ('Cẩm nang 600 từ vựng TOEIC căn bản', 'Tài liệu hướng dẫn học và ghi nhớ nhanh 600 từ vựng cốt lõi thường xuất hiện trong các bài thi TOEIC Listening & Reading.', '## Hướng dẫn học từ vựng TOEIC hiệu quả\n\n1. **Phân bổ thời gian**: Học 10-15 từ mỗi ngày thay vì nhồi nhét.\n2. **Học theo ngữ cảnh**: Luôn viết kèm câu ví dụ cụ thể.\n3. **Sử dụng Flashcard**: Lật thẻ ôn tập liên tục hàng tuần.\n\n### Chủ đề cốt lõi:\n- Contracts (Hợp đồng)\n- Marketing (Quảng cáo)\n- Warranties (Bảo hành)\n- Office Issues (Vấn đề văn phòng)\n- Conferencing (Hội thảo)', 'TOEIC', 'https://example.com/toeic-vocab-600.pdf', CURRENT_DATE()),
        ('Bí quyết đạt IELTS 7.5+ Reading', 'Chia sẻ chiến thuật làm bài Skimming, Scanning và nhận biết bẫy từ đồng nghĩa (Paraphrasing) trong bài thi IELTS Academic.', '## Chiến thuật làm bài IELTS Reading\n\n### 1. Skimming & Scanning\n- **Skimming**: Đọc lướt nhanh để nắm ý chính toàn bộ đoạn văn.\n- **Scanning**: Tìm từ khóa cụ thể (con số, tên riêng, thuật ngữ).\n\n### 2. Quản lý thời gian\n- Phân bổ chính xác 20 phút cho mỗi Passage.\n- Không dành quá 1.5 phút cho bất kỳ câu hỏi khó nào.', 'IELTS', 'https://example.com/ielts-reading-tips.pdf', CURRENT_DATE()),
        ('Bảng phiên âm quốc tế IPA chuẩn Anh-Mỹ', 'Hướng dẫn chi tiết khẩu hình miệng phát âm 44 nguyên âm và phụ âm trong tiếng Anh, giúp cải thiện kỹ năng nghe nói tự nhiên.', '## Tổng quan bảng ký tự phát âm IPA\n\nBảng IPA gồm 44 âm cơ bản:\n- **20 Nguyên âm (Vowels)**: gồm 12 nguyên âm đơn và 8 nguyên âm đôi.\n- **24 Phụ âm (Consonants)**: chia thành phụ âm vô thanh và phụ âm hữu thanh.\n\n### Lời khuyên tập phát âm:\n- Soi gương tập phát âm để kiểm tra răng, môi, lưỡi.\n- Ghi âm lại giọng đọc của mình rồi so sánh với người bản xứ.', 'Pronunciation', '', CURRENT_DATE())
      `);
      console.log("📚 Seeded default study documents into database.");
    }
  } catch (err) {
    console.error("❌ Failed to compile database schemas:", err);
  }
}
