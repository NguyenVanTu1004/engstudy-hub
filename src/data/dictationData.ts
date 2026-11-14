export interface DictationItem {
  id: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  englishText: string;
  vietnameseTranslation: string;
  grammarFocus: string;
}

export const DICTATION_DATA: DictationItem[] = [
  // =========================================================================
  // LEVEL 1: CĂN BẢN (BEGINNER) - TỪ VỰNG & CÂU ĐƠN
  // =========================================================================
  {
    id: 1,
    level: 'beginner',
    topic: 'Hiện tại đơn & Thói quen',
    englishText: 'She drinks warm green tea every single morning.',
    vietnameseTranslation: 'Cô ấy uống trà xanh ấm vào mỗi buổi sáng.',
    grammarFocus: 'Thì Hiện tại đơn: chủ ngữ ngôi thứ ba số ít "She" đi với động từ thêm -s ("drinks").'
  },
  {
    id: 2,
    level: 'beginner',
    topic: 'Giới từ nơi chốn',
    englishText: 'The essential documents are placed on the wooden desk.',
    vietnameseTranslation: 'Các tài liệu quan trọng được đặt ở trên chiếc bàn gỗ.',
    grammarFocus: 'Giới từ "on" chỉ vị trí tiếp xúc trên bề mặt của đồ vật.'
  },
  {
    id: 3,
    level: 'beginner',
    topic: 'Hiện tại tiếp diễn',
    englishText: 'Listen! The talented artist is playing a beautiful violin melody.',
    vietnameseTranslation: 'Hãy lắng nghe kìa! Nghệ sĩ tài năng đang chơi một giai điệu vĩ cầm tuyệt đẹp.',
    grammarFocus: 'Cụm cảm thán "Listen!" báo hiệu hành động đang diễn ra (Present Continuous).'
  },
  {
    id: 4,
    level: 'beginner',
    topic: 'Giới từ thời gian',
    englishText: 'Our international flight will depart at seven o\'clock tomorrow morning.',
    vietnameseTranslation: 'Chuyến bay quốc tế của chúng ta sẽ khởi hành lúc bảy giờ sáng mai.',
    grammarFocus: 'Giới từ "at" dùng cho mốc giờ giấc chính xác ("at seven o\'clock").'
  },
  {
    id: 5,
    level: 'beginner',
    topic: 'Trạng từ cách thức',
    englishText: 'The young students listen carefully to their professor\'s lecture.',
    vietnameseTranslation: 'Các bạn sinh viên trẻ lắng nghe chăm chú bài giảng của giáo sư.',
    grammarFocus: 'Trạng từ "carefully" bổ nghĩa cho động từ "listen".'
  },

  // =========================================================================
  // LEVEL 2: TRUNG CẤP (INTERMEDIATE) - TOEIC & CỤM GIỚI TỪ
  // =========================================================================
  {
    id: 6,
    level: 'intermediate',
    topic: 'Hiện tại hoàn thành & Giới từ',
    englishText: 'We have lived in this dynamic metropolis for more than five years.',
    vietnameseTranslation: 'Chúng tôi đã sinh sống tại đô thị sôi động này hơn năm năm rồi.',
    grammarFocus: 'Cấu trúc "have lived" + "for + khoảng thời gian" diễn tả hành động kéo dài tới hiện tại.'
  },
  {
    id: 7,
    level: 'intermediate',
    topic: 'Cụm giới từ cố định',
    englishText: 'I am really looking forward to receiving your constructive feedback.',
    vietnameseTranslation: 'Tôi thực sự rất mong đợi nhận được những phản hồi mang tính xây dựng của bạn.',
    grammarFocus: 'Cấu trúc cố định "look forward to + V-ing" (sau giới từ to là danh động từ receiving).'
  },
  {
    id: 8,
    level: 'intermediate',
    topic: 'Quá khứ tiếp diễn & Quá khứ đơn',
    englishText: 'While we were discussing the financial budget, the electricity suddenly went out.',
    vietnameseTranslation: 'Trong khi chúng tôi đang thảo luận về ngân sách tài chính thì mất điện đột ngột.',
    grammarFocus: 'Hành động kéo dài chia Quá khứ tiếp diễn ("were discussing"), hành động xen vào chia Quá khứ đơn ("went out").'
  },
  {
    id: 9,
    level: 'intermediate',
    topic: 'Trợ động từ & Động từ khiếm khuyết',
    englishText: 'All candidates must submit their application forms before the final deadline.',
    vietnameseTranslation: 'Tất cả các ứng viên bắt buộc phải nộp đơn ứng tuyển trước hạn chót cuối cùng.',
    grammarFocus: 'Động từ khuyết thiếu "must" diễn tả nghĩa vụ bắt buộc, đi kèm động từ nguyên mẫu "submit".'
  },
  {
    id: 10,
    level: 'intermediate',
    topic: 'Phân biệt Trạng từ HARD & HARDLY',
    englishText: 'He worked remarkably hard all night to finish the design proposal.',
    vietnameseTranslation: 'Anh ấy đã làm việc cực kỳ chăm chỉ suốt đêm để hoàn thành bản đề xuất thiết kế.',
    grammarFocus: '"hard" là trạng từ giữ nguyên dạng có nghĩa là "chăm chỉ, cật lực" (khác với "hardly" là hầu như không).'
  },

  // =========================================================================
  // LEVEL 3: NÂNG CAO (ADVANCED) - IELTS & CẤU TRÚC PHỨC
  // =========================================================================
  {
    id: 11,
    level: 'advanced',
    topic: 'Quá khứ hoàn thành & By the time',
    englishText: 'By the time the rescue team arrived, the mountaineers had already built a temporary shelter.',
    vietnameseTranslation: 'Trước thời điểm đội cứu hộ tới nơi, những người leo núi đã kịp dựng một nơi trú ẩn tạm thời.',
    grammarFocus: 'Hành động hoàn tất trước ("had already built") chia Quá khứ hoàn thành; hành động đến sau ("arrived") chia Quá khứ đơn.'
  },
  {
    id: 12,
    level: 'advanced',
    topic: 'Tương lai hoàn thành (Future Perfect)',
    englishText: 'By the end of this decade, artificial intelligence will have transformed global healthcare.',
    vietnameseTranslation: 'Trước cuối thập kỷ này, trí tuệ nhân tạo sẽ tạo ra bước chuyển đổi cho ngành y tế toàn cầu.',
    grammarFocus: 'Cụm "By the end of this decade" đi kèm thì Tương lai hoàn thành "will have transformed".'
  },
  {
    id: 13,
    level: 'advanced',
    topic: 'Tính từ đi kèm giới từ',
    englishText: 'The project manager is solely responsible for coordinating the multi-disciplinary team.',
    vietnameseTranslation: 'Trưởng dự án chịu trách nhiệm duy nhất trong việc điều phối đội ngũ đa chuyên ngành.',
    grammarFocus: 'Cấu trúc "responsible for + V-ing/Noun" mang nghĩa "chịu trách nhiệm về điều gì".'
  },
  {
    id: 14,
    level: 'advanced',
    topic: 'Hiện tại hoàn thành tiếp diễn',
    englishText: 'The dedicated researchers have been investigating this rare climate phenomenon for months.',
    vietnameseTranslation: 'Các nhà nghiên cứu tâm huyết đã và đang điều tra hiện tượng khí hậu hiếm gặp này suốt nhiều tháng qua.',
    grammarFocus: 'Thì Hiện tại hoàn thành tiếp diễn ("have been investigating") nhấn mạnh quá trình điều tra liên tục không ngừng.'
  }
];
