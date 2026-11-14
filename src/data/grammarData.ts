export interface GrammarItem {
  id: string;
  category: 'tenses' | 'prepositions' | 'adverbs' | 'auxiliary';
  title: string;
  titleVi: string;
  group?: string; // e.g. "Hiện tại", "Quá khứ", "Tương lai" or "Thời gian / Nơi chốn"
  summary: string;
  formula?: {
    positive: string;
    negative: string;
    question: string;
  };
  usages: {
    context: string;
    example: string;
    translation: string;
  }[];
  signals?: string[];
  notes?: string[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export const GRAMMAR_DATA: GrammarItem[] = [
  // =========================================================================
  // 1. NHÓM 12 THÌ TIẾNG ANH (12 TENSES)
  // =========================================================================
  {
    id: 'present-simple',
    category: 'tenses',
    title: 'Present Simple',
    titleVi: 'Thì Hiện Tại Đơn',
    group: 'Hiện tại (Present)',
    summary: 'Diễn tả chân lý, sự thật hiển nhiên, thói quen hoặc hành động lặp đi lặp lại hàng ngày.',
    formula: {
      positive: 'S + V(s/es) + O  (với to be: S + am/is/are + O/Adj)',
      negative: 'S + do/does + not + V_inf  (với to be: S + am/is/are + not)',
      question: 'Do/Does + S + V_inf?  (với to be: Am/Is/Are + S + O/Adj?)'
    },
    usages: [
      {
        context: 'Diễn tả sự thật hiển nhiên, quy luật tự nhiên',
        example: 'The sun rises in the east and sets in the west.',
        translation: 'Mặt trời mọc ở đằng đông và lặn ở đằng tây.'
      },
      {
        context: 'Thói quen, phong tục, lịch trình cố định',
        example: 'She drinks green tea every morning before going to work.',
        translation: 'Cô ấy uống trà xanh mỗi sáng trước khi đi làm.'
      },
      {
        context: 'Lịch trình tàu xe, máy bay, thời gian biểu',
        example: 'The train departs at 7:30 AM tomorrow.',
        translation: 'Chuyến tàu khởi hành lúc 7h30 sáng mai.'
      }
    ],
    signals: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'every day / week / year', 'once a month'],
    notes: [
      'Thêm -es sau các động từ tận cùng bằng: -o, -s, -ch, -x, -sh, -z (ví dụ: go -> goes, watch -> watches).',
      'Động từ tận cùng bằng phụ âm + y: đổi -y thành -i rồi thêm -es (study -> studies).'
    ],
    quiz: [
      {
        question: 'Water ______ at 100 degrees Celsius.',
        options: ['boil', 'boils', 'is boiling', 'boiled'],
        correctAnswer: 'boils',
        explanation: 'Diễn tả một sự thật hiển nhiên, khoa học, chủ ngữ là Water (danh từ không đếm được) nên động từ thêm -s (boils).'
      },
      {
        question: 'He usually ______ to school by bus, but today he walks.',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 'goes',
        explanation: 'Trạng từ "usually" chỉ thói quen hiện tại, chủ ngữ "He" là ngôi thứ 3 số ít nên động từ chia là "goes".'
      }
    ]
  },
  {
    id: 'present-continuous',
    category: 'tenses',
    title: 'Present Continuous',
    titleVi: 'Thì Hiện Tại Tiếp Diễn',
    group: 'Hiện tại (Present)',
    summary: 'Diễn tả hành động đang diễn ra ngay tại thời điểm nói hoặc một xu hướng tạm thời.',
    formula: {
      positive: 'S + am/is/are + V-ing + O',
      negative: 'S + am/is/are + not + V-ing + O',
      question: 'Am/Is/Are + S + V-ing + O?'
    },
    usages: [
      {
        context: 'Hành động đang diễn ra ngay lúc nói',
        example: 'Please be quiet! The baby is sleeping in the bedroom.',
        translation: 'Xin hãy giữ yên lặng! Em bé đang ngủ trong phòng ngủ.'
      },
      {
        context: 'Hành động mang tính chất tạm thời',
        example: 'I am staying with my uncle while looking for an apartment.',
        translation: 'Tôi đang ở tạm với chú trong lúc tìm kiếm căn hộ.'
      },
      {
        context: 'Phàn nàn về một thói quen gây khó chịu (dùng với always)',
        example: 'He is always leaving his keys on the sofa!',
        translation: 'Anh ta lúc nào cũng vứt chìa khóa bừa bãi trên ghế sofa!'
      }
    ],
    signals: ['now', 'right now', 'at the moment', 'at present', 'Look!', 'Listen!', 'Be quiet!'],
    notes: [
      'Không dùng thì tiếp diễn với các động từ chỉ tri giác, cảm xúc (Stative Verbs): love, hate, know, believe, understand, want, like.'
    ],
    quiz: [
      {
        question: 'Look! The bus ______ towards our stop.',
        options: ['comes', 'is coming', 'came', 'will come'],
        correctAnswer: 'is coming',
        explanation: 'Có dấu hiệu "Look!" báo hiệu hành động đang diễn ra trước mắt -> chọn "is coming".'
      }
    ]
  },
  {
    id: 'present-perfect',
    category: 'tenses',
    title: 'Present Perfect',
    titleVi: 'Thì Hiện Tại Hoàn Thành',
    group: 'Hiện tại (Present)',
    summary: 'Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại, hoặc vừa mới xảy ra để lại kết quả ở hiện tại.',
    formula: {
      positive: 'S + have/has + V3/V-ed + O',
      negative: 'S + have/has + not + V3/V-ed + O',
      question: 'Have/Has + S + V3/V-ed + O?'
    },
    usages: [
      {
        context: 'Hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại',
        example: 'We have lived in this city for over ten years.',
        translation: 'Chúng tôi đã sống ở thành phố này hơn 10 năm rồi (hiện vẫn đang sống).'
      },
      {
        context: 'Trải nghiệm, kinh nghiệm sống tính tới thời điểm hiện tại',
        example: 'Have you ever travelled to Japan?',
        translation: 'Bạn đã từng đi du lịch Nhật Bản bao giờ chưa?'
      },
      {
        context: 'Hành động vừa mới xảy ra, để lại kết quả rõ ràng ở hiện tại',
        example: 'I have just finished all my assignments.',
        translation: 'Tôi vừa mới hoàn thành toàn bộ bài tập của mình.'
      }
    ],
    signals: ['already', 'yet', 'just', 'ever', 'never', 'since + mốc thời gian', 'for + khoảng thời gian', 'so far', 'recently'],
    notes: [
      'Since đi với mốc thời gian (since 2020, since yesterday).',
      'For đi với khoảng thời gian (for 3 months, for 5 years).'
    ],
    quiz: [
      {
        question: 'She ______ in this international company since 2018.',
        options: ['worked', 'has worked', 'is working', 'works'],
        correctAnswer: 'has worked',
        explanation: 'Có cụm "since 2018" biểu thị mốc thời gian kéo dài đến hiện tại -> dùng Present Perfect: "has worked".'
      }
    ]
  },
  {
    id: 'present-perfect-continuous',
    category: 'tenses',
    title: 'Present Perfect Continuous',
    titleVi: 'Thì Hiện Tại Hoàn Thành Tiếp Diễn',
    group: 'Hiện tại (Present)',
    summary: 'Nhấn mạnh tính liên tục không ngừng nghỉ của hành động bắt đầu từ quá khứ và vẫn đang tiếp diễn ở hiện tại.',
    formula: {
      positive: 'S + have/has + been + V-ing + O',
      negative: 'S + have/has + not + been + V-ing + O',
      question: 'Have/Has + S + been + V-ing + O?'
    },
    usages: [
      {
        context: 'Nhấn mạnh khoảng thời gian kéo dài liên tục của hành động',
        example: 'It has been raining continuously for 4 hours.',
        translation: 'Trời đã và đang mưa liên tục suốt 4 tiếng đồng hồ rồi.'
      },
      {
        context: 'Hành động vừa kết thúc nhưng để lại dấu vết rõ ràng',
        example: 'He is exhausted because he has been working out all morning.',
        translation: 'Anh ấy kiệt sức vì vừa mới tập thể hình cật lực suốt cả buổi sáng.'
      }
    ],
    signals: ['all day', 'all week', 'since', 'for hours', 'how long...'],
    notes: ['So với Hiện tại hoàn thành (nhấn mạnh kết quả), Hiện tại hoàn thành tiếp diễn nhấn mạnh quá trình liên tục.'],
    quiz: [
      {
        question: 'They are tired. They ______ soccer all afternoon.',
        options: ['played', 'have been playing', 'are playing', 'will play'],
        correctAnswer: 'have been playing',
        explanation: 'Nhấn mạnh quá trình chơi bóng suốt cả buổi chiều dẫn đến kết quả hiện tại là "They are tired".'
      }
    ]
  },
  {
    id: 'past-simple',
    category: 'tenses',
    title: 'Past Simple',
    titleVi: 'Thì Quá Khứ Đơn',
    group: 'Quá khứ (Past)',
    summary: 'Diễn tả hành động đã xảy ra và chấm dứt hoàn toàn tại một thời điểm xác định trong quá khứ.',
    formula: {
      positive: 'S + V2/V-ed + O  (với to be: S + was/were + O/Adj)',
      negative: 'S + did + not + V_inf  (với to be: S + was/were + not)',
      question: 'Did + S + V_inf?  (với to be: Was/Were + S + O/Adj?)'
    },
    usages: [
      {
        context: 'Hành động đã hoàn tất trong quá khứ có thời gian rõ ràng',
        example: 'They graduated from university in 2023.',
        translation: 'Họ đã tốt nghiệp đại học vào năm 2023.'
      },
      {
        context: 'Chuỗi hành động liên tiếp xảy ra trong quá khứ',
        example: 'He entered the room, turned on the light, and sat down.',
        translation: 'Anh ấy bước vào phòng, bật đèn lên và ngồi xuống.'
      }
    ],
    signals: ['yesterday', 'ago', 'last night / week / month / year', 'in 1999', 'when I was young'],
    notes: ['Động từ bất quy tắc cần tra cứu cột 2 (V2): go -> went, see -> saw, buy -> bought.'],
    quiz: [
      {
        question: 'I ______ that fascinating documentary yesterday evening.',
        options: ['watch', 'watched', 'have watched', 'was watching'],
        correctAnswer: 'watched',
        explanation: 'Thời gian xác định trong quá khứ "yesterday evening" -> chia Quá khứ đơn: "watched".'
      }
    ]
  },
  {
    id: 'past-continuous',
    category: 'tenses',
    title: 'Past Continuous',
    titleVi: 'Thì Quá Khứ Tiếp Diễn',
    group: 'Quá khứ (Past)',
    summary: 'Diễn tả hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ, hoặc đang diễn ra thì có hành động khác xen vào.',
    formula: {
      positive: 'S + was/were + V-ing + O',
      negative: 'S + was/were + not + V-ing + O',
      question: 'Was/Were + S + V-ing + O?'
    },
    usages: [
      {
        context: 'Hành động đang diễn ra tại một thời điểm chính xác trong quá khứ',
        example: 'At 8 PM yesterday, I was watching the football match.',
        translation: 'Vào lúc 8h tối hôm qua, tôi đang xem trận bóng đá.'
      },
      {
        context: 'Hành động đang xảy ra (tiếp diễn) thì có hành động khác xen vào (quá khứ đơn)',
        example: 'While we were having dinner, the phone suddenly rang.',
        translation: 'Khi chúng tôi đang ăn tối thì điện thoại bất ngờ reo lên.'
      }
    ],
    signals: ['at + giờ + thời gian quá khứ', 'at this time yesterday', 'while / when / as'],
    notes: ['While thường đi với Quá khứ tiếp diễn (hành động dài), When thường đi với Quá khứ đơn (hành động ngắn xen vào).'],
    quiz: [
      {
        question: 'When I called him, he ______ a report in his office.',
        options: ['wrote', 'was writing', 'has written', 'writes'],
        correctAnswer: 'was writing',
        explanation: 'Hành động đang xảy ra trong quá khứ (đang viết báo cáo) thì hành động khác xen vào (gọi điện).'
      }
    ]
  },
  {
    id: 'past-perfect',
    category: 'tenses',
    title: 'Past Perfect',
    titleVi: 'Thì Quá Khứ Hoàn Thành',
    group: 'Quá khứ (Past)',
    summary: 'Diễn tả một hành động xảy ra và hoàn thành trước một hành động khác trong quá khứ.',
    formula: {
      positive: 'S + had + V3/V-ed + O',
      negative: 'S + had + not + V3/V-ed + O',
      question: 'Had + S + V3/V-ed + O?'
    },
    usages: [
      {
        context: 'Hành động xảy ra trước một mốc thời gian hoặc một hành động khác trong quá khứ',
        example: 'By the time the police arrived, the burglar had already fled.',
        translation: 'Vào lúc cảnh sát tới nơi, tên trộm đã tẩu thoát từ trước đó rồi.'
      }
    ],
    signals: ['by the time', 'before + quá khứ đơn', 'after + quá khứ hoàn thành', 'already', 'had never... before'],
    notes: ['Hành động xảy ra trước dùng Had + V3 (Quá khứ hoàn thành), hành động xảy ra sau dùng V2 (Quá khứ đơn).'],
    quiz: [
      {
        question: 'Before she moved to London, she ______ in Paris for two years.',
        options: ['lived', 'had lived', 'lives', 'was living'],
        correctAnswer: 'had lived',
        explanation: 'Hành động sống ở Paris diễn ra trước việc chuyển đến London -> chọn "had lived".'
      }
    ]
  },
  {
    id: 'past-perfect-continuous',
    category: 'tenses',
    title: 'Past Perfect Continuous',
    titleVi: 'Thì Quá Khứ Hoàn Thành Tiếp Diễn',
    group: 'Quá khứ (Past)',
    summary: 'Nhấn mạnh quá trình của một hành động diễn ra liên tục trước một thời điểm hoặc hành động khác trong quá khứ.',
    formula: {
      positive: 'S + had + been + V-ing + O',
      negative: 'S + had + not + been + V-ing + O',
      question: 'Had + S + been + V-ing + O?'
    },
    usages: [
      {
        context: 'Hành động diễn ra liên tục cho tới khi hành động quá khứ khác diễn ra',
        example: 'He had been waiting for two hours before the flight was finally announced.',
        translation: 'Anh ấy đã phải đợi suốt 2 tiếng đồng hồ trước khi chuyến bay cuối cùng cũng được thông báo.'
      }
    ],
    signals: ['had been V-ing + for... before + V2'],
    notes: ['Tập trung vào khoảng thời gian (duration) của hành động trong quá khứ.'],
    quiz: [
      {
        question: 'She was out of breath because she ______ for 30 minutes.',
        options: ['had been running', 'runs', 'is running', 'will run'],
        correctAnswer: 'had been running',
        explanation: 'Nhấn mạnh quá trình chạy bộ liên tục suốt 30 phút trong quá khứ dẫn đến việc hết hơi.'
      }
    ]
  },
  {
    id: 'future-simple',
    category: 'tenses',
    title: 'Future Simple',
    titleVi: 'Thì Tương Lai Đơn',
    group: 'Tương lai (Future)',
    summary: 'Diễn tả quyết định được đưa ra ngay tại thời điểm nói, lời hứa, dự đoán không có căn cứ chắc chắn.',
    formula: {
      positive: 'S + will + V_inf + O',
      negative: 'S + will + not (won\'t) + V_inf + O',
      question: 'Will + S + V_inf + O?'
    },
    usages: [
      {
        context: 'Quyết định tức thì ngay lúc nói',
        example: 'It\'s raining. I will take a taxi home.',
        translation: 'Trời đang mưa rồi. Tôi sẽ bắt taxi về nhà.'
      },
      {
        context: 'Lời hứa, lời đe dọa hoặc lời đề nghị',
        example: 'I promise I will return your book tomorrow.',
        translation: 'Tôi hứa tôi sẽ trả sách cho bạn vào ngày mai.'
      }
    ],
    signals: ['tomorrow', 'next week / month / year', 'in the future', 'I think / believe / hope'],
    notes: ['Phân biệt với Be Going To (dự định đã lên kế hoạch từ trước, hoặc dự đoán có bằng chứng cụ thể).'],
    quiz: [
      {
        question: 'The doorbell is ringing. I ______ it!',
        options: ['will answer', 'am answering', 'answered', 'have answered'],
        correctAnswer: 'will answer',
        explanation: 'Quyết định bộc phát ngay thời điểm nghe chuông reo -> dùng Will + V_inf ("will answer").'
      }
    ]
  },
  {
    id: 'future-continuous',
    category: 'tenses',
    title: 'Future Continuous',
    titleVi: 'Thì Tương Lai Tiếp Diễn',
    group: 'Tương lai (Future)',
    summary: 'Diễn tả hành động đang diễn ra tại một thời điểm xác định trong tương lai.',
    formula: {
      positive: 'S + will + be + V-ing + O',
      negative: 'S + will + not + be + V-ing + O',
      question: 'Will + S + be + V-ing + O?'
    },
    usages: [
      {
        context: 'Hành động đang diễn ra tại một thời điểm cụ thể trong tương lai',
        example: 'At 10 AM tomorrow, we will be taking our English proficiency test.',
        translation: 'Vào lúc 10h sáng mai, chúng tôi sẽ đang làm bài thi đánh giá năng lực tiếng Anh.'
      }
    ],
    signals: ['at + giờ + thời gian tương lai', 'at this time next week'],
    notes: ['Nhấn mạnh hành động đang trong quá trình tiến hành tại thời điểm tương lai.'],
    quiz: [
      {
        question: 'This time next month, I ______ on the beach in Da Nang.',
        options: ['will be relaxing', 'will relax', 'relax', 'relaxed'],
        correctAnswer: 'will be relaxing',
        explanation: 'Thời điểm cụ thể trong tương lai "This time next month" -> dùng Tương lai tiếp diễn.'
      }
    ]
  },
  {
    id: 'future-perfect',
    category: 'tenses',
    title: 'Future Perfect',
    titleVi: 'Thì Tương Lai Hoàn Thành',
    group: 'Tương lai (Future)',
    summary: 'Diễn tả hành động sẽ được hoàn tất trước một thời điểm hoặc một hành động khác trong tương lai.',
    formula: {
      positive: 'S + will + have + V3/V-ed + O',
      negative: 'S + will + not + have + V3/V-ed + O',
      question: 'Will + S + have + V3/V-ed + O?'
    },
    usages: [
      {
        context: 'Hành động sẽ hoàn tất trước một mốc thời gian trong tương lai',
        example: 'By the end of this year, they will have constructed the new bridge.',
        translation: 'Trước cuối năm nay, họ sẽ xây dựng xong cây cầu mới.'
      }
    ],
    signals: ['by the end of...', 'by tomorrow', 'by the time + hiện tại đơn'],
    notes: ['Mệnh đề sau By the time chia ở Hiện tại đơn, mệnh đề chính chia ở Tương lai hoàn thành.'],
    quiz: [
      {
        question: 'By 2028, she ______ her PhD program.',
        options: ['will have completed', 'completed', 'is completing', 'completes'],
        correctAnswer: 'will have completed',
        explanation: 'Có mốc "By 2028" trong tương lai -> dùng Future Perfect: "will have completed".'
      }
    ]
  },
  {
    id: 'future-perfect-continuous',
    category: 'tenses',
    title: 'Future Perfect Continuous',
    titleVi: 'Thì Tương Lai Hoàn Thành Tiếp Diễn',
    group: 'Tương lai (Future)',
    summary: 'Nhấn mạnh khoảng thời gian kéo dài của một hành động tính tới một mốc thời điểm trong tương lai.',
    formula: {
      positive: 'S + will + have + been + V-ing + O',
      negative: 'S + will + not + have + been + V-ing + O',
      question: 'Will + S + have + been + V-ing + O?'
    },
    usages: [
      {
        context: 'Nhấn mạnh độ dài thời gian tính đến tương lai',
        example: 'By next November, I will have been working at this university for ten years.',
        translation: 'Tính đến tháng 11 tới, tôi sẽ làm việc liên tục tại trường đại học này tròn 10 năm.'
      }
    ],
    signals: ['by + mốc tương lai + for + khoảng thời gian'],
    notes: ['Thì ít phổ biến nhất trong giao tiếp nhưng xuất hiện trong các bài thi nâng cao (IELTS, C1).'],
    quiz: [
      {
        question: 'By 5 PM, they ______ for eight continuous hours.',
        options: ['will have been studying', 'will study', 'studied', 'are studying'],
        correctAnswer: 'will have been studying',
        explanation: 'Có mốc tương lai "By 5 PM" kết hợp khoảng thời gian "for eight continuous hours".'
      }
    ]
  },

  // =========================================================================
  // 2. GIỚI TỪ (PREPOSITIONS)
  // =========================================================================
  {
    id: 'prepositions-in-on-at',
    category: 'prepositions',
    title: 'Prepositions: IN - ON - AT',
    titleVi: 'Giới Từ Thời Gian & Nơi Chốn: IN - ON - AT',
    group: 'Quy tắc Kim Tự Tháp',
    summary: 'Quy tắc hình tháp ngược từ rộng lớn, chung chung (IN) đến cụ thể vừa phải (ON) đến chính xác, cụ thể nhất (AT).',
    usages: [
      {
        context: 'IN - Thời gian rộng (thế kỷ, năm, tháng, mùa) & Nơi chốn rộng (quốc gia, thành phố)',
        example: 'in 2026, in summer, in July, in Vietnam, in Hanoi, in the room',
        translation: 'Vào năm 2026, vào mùa hè, vào tháng 7, ở Việt Nam, ở Hà Nội, trong phòng'
      },
      {
        context: 'ON - Thời gian cụ thể (ngày trong tuần, ngày tháng) & Nơi chốn bề mặt, tên đường',
        example: 'on Monday, on May 15th, on the table, on Oxford Street, on the bus',
        translation: 'Vào thứ hai, vào ngày 15 tháng 5, trên bàn, trên đường Oxford, trên xe buýt'
      },
      {
        context: 'AT - Thời gian chính xác (giờ giấc) & Nơi chốn điểm cụ thể, địa chỉ nhà',
        example: 'at 7:00 AM, at noon, at midnight, at 123 Main Street, at the airport',
        translation: 'Lúc 7h sáng, lúc trưa, lúc nửa đêm, tại số 123 đường Main, tại sân bay'
      }
    ],
    notes: [
      'Ngoại lệ thời gian: at night, at the weekend (Anh-Anh), in the morning/afternoon/evening.',
      'Phương tiện giao thông: on a bus/train/plane/ship (đứng đi lại được), nhưng in a car/taxi (phải cúi người vào ngồi).'
    ],
    quiz: [
      {
        question: 'The crucial board meeting will begin ______ 9:30 AM ______ Monday morning.',
        options: ['at / on', 'in / on', 'on / at', 'at / in'],
        correctAnswer: 'at / on',
        explanation: 'Giờ giấc chính xác dùng "at 9:30 AM", buổi kèm thứ trong tuần cụ thể dùng "on Monday morning".'
      },
      {
        question: 'My grandmother was born ______ 1952 ______ a tranquil village in Ninh Binh.',
        options: ['in / in', 'on / in', 'at / on', 'in / at'],
        correctAnswer: 'in / in',
        explanation: 'Năm dùng "in 1952", không gian làng quê rộng dùng "in a tranquil village".'
      }
    ]
  },
  {
    id: 'prepositional-phrases',
    category: 'prepositions',
    title: 'Essential Prepositional Collocations',
    titleVi: 'Cụm Giới Từ Đi Kèm Tính Từ & Động Từ Cốt Lõi',
    group: 'Cụm giới từ cố định',
    summary: 'Tổng hợp các cụm từ đi liền với giới từ bắt buộc phải ghi nhớ chuẩn xác trong giao tiếp và các đề thi.',
    usages: [
      {
        context: 'Tính từ + Giới từ phổ biến',
        example: 'good at (giỏi về), proud of (tự hào về), interested in (thích thú), famous for (nổi tiếng vì)',
        translation: 'She is exceptionally good at solving mathematical problems.'
      },
      {
        context: 'Động từ + Giới từ thông dụng',
        example: 'depend on (phụ thuộc), apologize for (xin lỗi vì), look forward to + V-ing (trông đợi)',
        translation: 'I look forward to hearing from you soon.'
      }
    ],
    signals: ['look forward to + V-ing', 'be capable of + V-ing', 'be responsible for + V-ing'],
    notes: [
      'Sau giới từ luôn luôn là Danh từ (Noun) hoặc Động từ đuôi -ing (Gerund).'
    ],
    quiz: [
      {
        question: 'We are truly looking forward to ______ your distinguished presentation.',
        options: ['attend', 'attending', 'attended', 'attendance'],
        correctAnswer: 'attending',
        explanation: 'Cấu trúc "look forward to + V-ing" -> chọn "attending".'
      }
    ]
  },

  // =========================================================================
  // 3. TRẠNG TỪ (ADVERBS)
  // =========================================================================
  {
    id: 'adverbs-types-and-position',
    category: 'adverbs',
    title: 'Adverbs: Classification & Position',
    titleVi: 'Trạng Từ: Phân Loại, Cấu Tạo & Vị Trí Trong Câu',
    group: 'Vị trí & Quy tắc',
    summary: 'Cách tạo lập trạng từ từ tính từ và quy tắc sắp xếp vị trí chuẩn trong câu tiếng Anh.',
    formula: {
      positive: 'Tính từ + ly -> Trạng từ cách thức (quick -> quickly, careful -> carefully)',
      negative: 'Vị trí: Đứng sau V thường, trước Adj/Adv khác, sau To Be/Trợ từ',
      question: 'Bất quy tắc: good -> well, fast -> fast, hard -> hard, early -> early'
    },
    usages: [
      {
        context: 'Bổ nghĩa cho Động từ thường (đứng sau động từ hoặc tân ngữ)',
        example: 'He speaks English fluently and confidently.',
        translation: 'Anh ấy nói tiếng Anh một cách lưu loát và tự tin.'
      },
      {
        context: 'Bổ nghĩa cho Tính từ (đứng ngay trước tính từ)',
        example: 'This analytical task is extremely difficult.',
        translation: 'Nhiệm vụ phân tích này cực kỳ khó khăn.'
      },
      {
        context: 'Cặp từ bẫy nguy hiểm: HARD vs HARDLY',
        example: 'He works hard (chăm chỉ) vs He hardly works (anh ta hầu như không làm gì).',
        translation: 'Phải chú ý nghĩa hoàn toàn khác biệt của đuôi -ly với hard/hardly, late/lately.'
      }
    ],
    notes: [
      'Trạng từ tần suất (always, often, rarely): Đứng TRƯỚC động từ thường, SAU động từ to be và trợ động từ.',
      'Các từ tận cùng -ly nhưng là TÍNH TỪ: friendly (thân thiện), lovely (đáng yêu), lonely (cô đơn), costly (đắt đỏ).'
    ],
    quiz: [
      {
        question: 'She sings ______ and always captures the audience\'s hearts.',
        options: ['beautiful', 'beautifully', 'beauty', 'beautify'],
        correctAnswer: 'beautifully',
        explanation: 'Cần một trạng từ bổ nghĩa cho động từ "sings" -> chọn "beautifully".'
      },
      {
        question: 'The professor spoke so quietly that the students could ______ hear him.',
        options: ['hard', 'hardly', 'harder', 'hardest'],
        correctAnswer: 'hardly',
        explanation: '"hardly" mang nghĩa phủ định: "hầu như không thể nghe thấy", phù hợp với vế trước "spoke so quietly".'
      }
    ]
  },

  // =========================================================================
  // 4. TRỢ TỪ & ĐỘNG TỪ KHIẾM KHUYẾT (AUXILIARY & MODAL VERBS)
  // =========================================================================
  {
    id: 'auxiliary-and-modal-verbs',
    category: 'auxiliary',
    title: 'Auxiliary & Modal Verbs',
    titleVi: 'Trợ Động Từ & Động Từ Khiếm Khuyết',
    group: 'Quy tắc bổ trợ câu',
    summary: 'Hệ thống trợ động từ cấu tạo câu hỏi, phủ định, nhấn mạnh và động từ khuyết thiếu chỉ khả năng, nghĩa vụ.',
    usages: [
      {
        context: 'Trợ động từ cơ bản (Do/Does/Did, Have/Has/Had, Be)',
        example: 'Do you agree? / I don\'t know. / She does love you! (nhấn mạnh)',
        translation: 'Bạn có đồng ý không? / Tôi không biết. / Cô ấy thực sự rất yêu bạn!'
      },
      {
        context: 'Động từ khuyết thiếu (Modal Verbs: Can, Must, Should, May)',
        example: 'You must submit the report today. / You should drink more water.',
        translation: 'Bạn bắt buộc phải nộp báo cáo hôm nay. / Bạn nên uống nhiều nước hơn.'
      },
      {
        context: 'Câu hỏi đuôi (Tag Questions)',
        example: 'You are a developer, aren\'t you? / She didn\'t call, did she?',
        translation: 'Bạn là một lập trình viên, có đúng không? / Cô ấy không gọi điện, phải không?'
      }
    ],
    notes: [
      'Sau tất cả các Động từ khuyết thiếu (Can, Could, Must, Should, May, Might, Will) luôn là Động từ nguyên mẫu KHÔNG to (V_inf).',
      'Must (bắt buộc chủ quan từ bản thân) vs Have to (bắt buộc do quy định, luật lệ bên ngoài).'
    ],
    quiz: [
      {
        question: 'Employees ______ wear safety helmets when entering the construction zone.',
        options: ['must', 'can', 'should to', 'ought'],
        correctAnswer: 'must',
        explanation: 'Quy tắc an toàn bắt buộc tại công trường -> dùng "must" (sau đó là V_inf "wear").'
      },
      {
        question: 'You haven\'t finished the project yet, ______ you?',
        options: ['have', 'do', 'did', 'haven\'t'],
        correctAnswer: 'have',
        explanation: 'Mệnh đề trước phủ định "haven\'t" -> câu hỏi đuôi ở thể khẳng định: "have you?".'
      }
    ]
  }
];
