import { pool, isDbConnected } from "./db";

export interface DBDocument {
  id: number;
  title: string;
  description?: string;
  content: string;
  category: string;
  downloadUrl?: string;
  createdAt: string;
}

export let memoryDocuments: DBDocument[] = [
  {
    id: 1,
    title: 'Cẩm nang 600 từ vựng TOEIC căn bản',
    description: 'Tài liệu hướng dẫn học và ghi nhớ nhanh 600 từ vựng cốt lõi thường xuất hiện trong các bài thi TOEIC Listening & Reading.',
    content: '## Hướng dẫn học từ vựng TOEIC hiệu quả\n\n1. **Phân bổ thời gian**: Học 10-15 từ mỗi ngày thay vì nhồi nhét.\n2. **Học theo ngữ cảnh**: Luôn viết kèm câu ví dụ cụ thể.\n3. **Sử dụng Flashcard**: Lật thẻ ôn tập liên tục hàng tuần.\n\n### Chủ đề cốt lõi:\n- Contracts (Hợp đồng)\n- Marketing (Quảng cáo)\n- Warranties (Bảo hành)\n- Office Issues (Vấn đề văn phòng)\n- Conferencing (Hội thảo)',
    category: 'TOEIC',
    downloadUrl: 'https://example.com/toeic-vocab-600.pdf',
    createdAt: '2026-06-25'
  },
  {
    id: 2,
    title: 'Bí quyết đạt IELTS 7.5+ Reading',
    description: 'Chia sẻ chiến thuật làm bài Skimming, Scanning và nhận biết bẫy từ đồng nghĩa (Paraphrasing) trong bài thi IELTS Academic.',
    content: '## Chiến thuật làm bài IELTS Reading\n\n### 1. Skimming & Scanning\n- **Skimming**: Đọc lướt nhanh để nắm ý chính toàn bộ đoạn văn.\n- **Scanning**: Tìm từ khóa cụ thể (con số, tên riêng, thuật ngữ).\n\n### 2. Quản lý thời gian\n- Phân bổ chính xác 20 phút cho mỗi Passage.\n- Không dành quá 1.5 phút cho bất kỳ câu hỏi khó nào.',
    category: 'IELTS',
    downloadUrl: 'https://example.com/ielts-reading-tips.pdf',
    createdAt: '2026-06-25'
  },
  {
    id: 3,
    title: 'Bảng phiên âm quốc tế IPA chuẩn Anh-Mỹ',
    description: 'Hướng dẫn chi tiết khẩu hình miệng phát âm 44 nguyên âm và phụ âm trong tiếng Anh, giúp cải thiện kỹ năng nghe nói tự nhiên.',
    content: '## Tổng quan bảng ký tự phát âm IPA\n\nBảng IPA gồm 44 âm cơ bản:\n- **20 Nguyên âm (Vowels)**: gồm 12 nguyên âm đơn và 8 nguyên âm đơn.\n- **24 Phụ âm (Consonants)**: chia thành phụ âm vô thanh và phụ âm hữu thanh.\n\n### Lời khuyên tập phát âm:\n- Soi gương tập phát âm để kiểm tra răng, môi, lưỡi.\n- Ghi âm lại giọng đọc của mình rồi so sánh với người bản xứ.',
    category: 'Pronunciation',
    downloadUrl: '',
    createdAt: '2026-06-25'
  }
];

export class DocumentModel {
  static async getAll(): Promise<DBDocument[]> {
    if (isDbConnected && pool) {
      const [rows]: any = await pool.query(
        "SELECT id, title, description, content, category, download_url as downloadUrl, created_at as createdAt FROM study_documents ORDER BY id DESC"
      );
      return rows;
    }
    return memoryDocuments;
  }

  static async create(doc: Omit<DBDocument, "id">): Promise<DBDocument> {
    const today = new Date().toISOString().split("T")[0];
    if (isDbConnected && pool) {
      const [result]: any = await pool.query(
        "INSERT INTO study_documents (title, description, content, category, download_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [doc.title, doc.description || '', doc.content, doc.category || 'General', doc.downloadUrl || '', today]
      );
      return {
        id: result.insertId,
        ...doc,
        createdAt: today
      };
    }

    const newDoc = {
      id: Date.now(),
      ...doc,
      createdAt: today
    };
    memoryDocuments.unshift(newDoc);
    return newDoc;
  }

  static async delete(id: number): Promise<boolean> {
    if (isDbConnected && pool) {
      await pool.query("DELETE FROM study_documents WHERE id = ?", [id]);
      return true;
    }
    const idx = memoryDocuments.findIndex(d => d.id === id);
    if (idx !== -1) {
      memoryDocuments.splice(idx, 1);
      return true;
    }
    return false;
  }
}
