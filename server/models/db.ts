import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export let isDbConnected = false;
// Parse environment variables with robust fallback support
export let dbErrorDetails: string = "";
let rawHost = process.env.DB_HOST || "127.0.0.1";
let rawPort = parseInt(process.env.DB_PORT || "3307");
let rawUser = process.env.DB_USER || process.env.DB_USERNAME || "root";
let rawPassword = process.env.DB_PASSWORD || "";
let rawDatabase = process.env.DB_NAME || process.env.DB_DATABASE || "english_learning";

// Smart parsing if DB_HOST contains a full connection URL (e.g. mysql://user:pass@host:port/database)
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
    console.warn("⚠️ Cannot parse DB_HOST as URL, treating as literal string. Error:", e.message);
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
  try {
    console.log(`📡 Connecting to MySQL database at ${dbConfigUsed.host}:${dbConfigUsed.port}...`);
    
    pool = mysql.createPool({
      host: dbConfigUsed.host,
      port: dbConfigUsed.port,
      user: dbConfigUsed.user,
      password: dbConfigUsed.password,
      database: dbConfigUsed.database,
      waitForConnections: true,
      connectionLimit: 5, 
      queueLimit: 0,
      connectTimeout: 5000
    });

    const connection = await pool.getConnection();
    connection.release();
    isDbConnected = true;
    console.log("✅ MySQL Database connected successfully on port " + dbConfigUsed.port);

    await createTablesIfNotExist();
  } catch (error: any) {
    isDbConnected = false;
    dbErrorDetails = error.message || String(error);
    pool = null;
    console.warn("⚠️ Cannot connect to MySQL. Falling back to high-performance in-memory mode.");
    console.warn("⚠️ Error details:", dbErrorDetails);
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
        role VARCHAR(10) DEFAULT 'USER',
        is_active BOOLEAN DEFAULT TRUE,
        avatar VARCHAR(255) DEFAULT '',
        created_at DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Vocabularies Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vocabularies (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    // 3. OTPs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Study Documents Table
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

    console.log("⚙️ Verified and initialized MySQL schemas (users, vocabularies, otps, study_documents).");

    // Insert Default admin user if empty
    const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO users (username, full_name, email, password, role, is_active, avatar, created_at)
        VALUES ('admin', 'Nguyễn Văn Admin', 'nguyenvantu03848@gmail.com', 'admin', 'ADMIN', 1, 'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury', CURRENT_DATE())
      `);
      console.log("👤 Inserted default administrator account.");
    } else {
      // Force update existing admin email to nguyenvantu03848@gmail.com & update existing admin avatar to be neutral as well
      await pool.query("UPDATE users SET email = 'nguyenvantu03848@gmail.com', avatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=Mercury' WHERE username = 'admin'");
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
