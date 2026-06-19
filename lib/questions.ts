export interface SubQuestion {
  id: string;
  label: string; // e.g. "①" or "②"
  expectedAnswer: string;
  explanation: string;
}

export interface Question {
  id: number;
  title: string;
  category: "Kiến thức cơ bản" | "Ẩn dụ sơ cấp";
  subQuestions: SubQuestion[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Hãy viết ① Đức Chúa Trời và ② ma quỷ, là từng đối tượng như thế nào?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "1_1",
        label: "① Đức Chúa Trời:",
        expectedAnswer: "Đấng Tự Hữu tức Đấng Tự Tồn Tại",
        explanation: ""
      },
      {
        id: "1_2",
        label: "② Ma quỷ:",
        expectedAnswer: "Tạo vật, thiên sứ phạm tội",
        explanation: ""
      }
    ]
  },
  {
    id: 2,
    title: "Hãy viết kinh thánh ① Ai ban cho ai, ② lý do ban cho là gì?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "2_1",
        label: "① Ai ban cho ai:",
        expectedAnswer: "Đức Chúa Trời ban cho những tội nhân",
        explanation: ""
      },
      {
        id: "2_2",
        label: "② Lý do ban cho:",
        expectedAnswer: "Để nhận biết Thần sự sống Đức Chúa Trời và thần sự chết ma quỷ",
        explanation: ""
      }
    ]
  },
  {
    id: 3,
    title: "Hãy viết kinh thánh ① là sách như thế nào? Rồi ai là người phải vâng giữ giao ước ② cựu ước và ③ tân ước, hãy viết câu kinh dẫn chứng cho từng điều đi kèm.",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "3_1",
        label: "① Kinh Thánh là sách như thế nào:",
        expectedAnswer: "Sách giao ước giữa Đức Chúa Trời và dân được chọn",
        explanation: ""
      },
      {
        id: "3_2",
        label: "② Ai vâng giữ giao ước cựu ước và câu kinh dẫn chứng:",
        expectedAnswer: "Dân Israel huyết thống, Xuất 19:5~6",
        explanation: ""
      },
      {
        id: "3_3",
        label: "③ Ai vâng giữ giao ước tân ước và câu kinh dẫn chứng:",
        expectedAnswer: "Những người thời thành đạt khải huyền, Lu 22:14~20, Kh 22:18~19",
        explanation: ""
      }
    ]
  },
  {
    id: 4,
    title: "Hãy viết tác giả của kinh thánh ① là Ai, người ghi chép ② mấy người, là ai? Đức Chúa Trời ban cho kinh thánh với ③ mục đích gì? Và ④ cựu ước, ⑤ tân ước có mấy cuốn, mấy chương, mấy câu kinh?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "4_1",
        label: "① Tác giả:",
        expectedAnswer: "Đức Chúa Trời",
        explanation: ""
      },
      {
        id: "4_2",
        label: "② Người ghi chép:",
        expectedAnswer: "Khoảng 35~40 người, các nhà tiên tri và các môn đồ",
        explanation: ""
      },
      {
        id: "4_3",
        label: "③ Mục đích ban cho:",
        expectedAnswer: "Để ban thiên đàng và sự sống đời đời cho người tin",
        explanation: ""
      },
      {
        id: "4_4",
        label: "④ Cựu ước:",
        expectedAnswer: "39 cuốn, 929 chương, 23.144 câu",
        explanation: ""
      },
      {
        id: "4_5",
        label: "⑤ Tân ước:",
        expectedAnswer: "27 cuốn, 260 chương, 7.957 câu",
        explanation: ""
      }
    ]
  },
  {
    id: 5,
    title: "Hãy viết nội dung của kinh thánh nếu chia 4 phần ① là gì? Rồi quá trình lời tiên tri thành đạt ② là gì? và ③ 1 câu kinh dẫn chứng là gì?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "5_1",
        label: "① 4 phần nội dung:",
        expectedAnswer: "Lịch sử, giáo huấn, tiên tri, thành đạt (thực thể)",
        explanation: ""
      },
      {
        id: "5_2",
        label: "② Quá trình lời tiên tri thành đạt:",
        expectedAnswer: "Bội đạo, hủy diệt, cứu rỗi",
        explanation: ""
      },
      {
        id: "5_3",
        label: "③ 1 câu kinh dẫn chứng:",
        expectedAnswer: "2 Tê 2:1~3",
        explanation: ""
      }
    ]
  },
  {
    id: 6,
    title: "Hãy viết trong lời hứa giữa Đức Chúa Trời với Abraham (Sáng 15:13-14) có việc 'Dòng dõi của Abraham sẽ ra khỏi đất nước ngoại bang' ① đã thành đạt khi nào, Lời hứa của Đức Chúa Trời với các nhà tiên tri cựu ước ② đã thành đạt khi nào, Lời hứa của thời Đức Chúa Jesus đến ③ tất cả thành đạt khi nào? Hãy viết 1 câu kinh dẫn chứng đi kèm với từng hạng mục.",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "6_1",
        label: "① Lời hứa dòng dõi Abraham ra khỏi đất ngoại bang đã thành đạt khi nào và câu kinh dẫn chứng:",
        expectedAnswer: "Thời Mô-sê, Xuất 12",
        explanation: ""
      },
      {
        id: "6_2",
        label: "② Lời hứa với các nhà tiên tri cựu ước đã thành đạt khi nào và câu kinh dẫn chứng:",
        expectedAnswer: "Thời Đức Chúa Jesus đến, Giăng 19:30",
        explanation: ""
      },
      {
        id: "6_3",
        label: "③ Lời hứa của thời Đức Chúa Jesus đến tất cả thành đạt khi nào và câu kinh dẫn chứng:",
        expectedAnswer: "Thời Đức Chúa Jesus trở lại, Kh 21:6",
        explanation: ""
      }
    ]
  },
  {
    id: 7,
    title: "Hãy viết đức tin chân chính khi lời tiên tri thành đạt ① là gì, và ② 1 câu kinh dẫn chứng đi kèm.",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "7_1",
        label: "① Đức tin chân chính khi lời tiên tri thành đạt:",
        expectedAnswer: "Đức tin tin thực thể đã thành đạt theo lời tiên tri",
        explanation: ""
      },
      {
        id: "7_2",
        label: "② 1 câu kinh dẫn chứng đi kèm:",
        expectedAnswer: "Giăng 14:29",
        explanation: ""
      }
    ]
  },
  {
    id: 8,
    title: "Chiến tranh của tân·cựu ước ① là chiến tranh giữa ai và ai? Lý do Đức Chúa Trời và Satan chiến tranh với nhau ② từng bên là gì?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "8_1",
        label: "① Chiến tranh giữa ai và ai:",
        expectedAnswer: "Linh xác thịt thuộc Đức Chúa Trời và linh xác thịt thuộc Satan",
        explanation: ""
      },
      {
        id: "8_2",
        label: "② Lý do Đức Chúa Trời và Satan chiến tranh của từng bên:",
        expectedAnswer: "Đức Chúa Trời: Để tìm lại muôn vật, Satan: Để không bị lấy lại trái đất",
        explanation: ""
      }
    ]
  },
  {
    id: 9,
    title: "Hãy viết thứ tự phân loại theo 7 thời đại của dòng chảy lịch sử kinh thánh?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "9_1",
        label: "① 7 thời đại dòng chảy lịch sử Kinh Thánh:",
        expectedAnswer: "Thời sáng thế → Thời luật pháp xuất ai cập → Thời các quan xét → Thời các vua → Thời tiên tri → Thời tin lành thiên đàng → Thời khải thị tái sáng tạo",
        explanation: ""
      }
    ]
  },
  {
    id: 10,
    title: "Hãy viết 2 lý do Đức Chúa Jesus đã nói bí mật thiên đàng bằng ẩn dụ ở thời Đức Chúa Jesus đến ① là gì? Và kết quả của người không thể thấu hiểu ẩn dụ ② là gì, ý nghĩa chân thật của ẩn dụ ③ khi nào được hiểu sáng tỏ, 1 câu kinh dẫn chứng đi kèm từng hạng mục?",
    category: "Kiến thức cơ bản",
    subQuestions: [
      {
        id: "10_1",
        label: "① 2 lý do Đức Chúa Jesus nói bí mật thiên đàng bằng ẩn dụ và câu kinh dẫn chứng:",
        expectedAnswer: "Để ứng nghiệm lời hứa với nhà tiên tri cựu ước, để cất giấu với kẻ thù",
        explanation: ""
      },
      {
        id: "10_2",
        label: "② Kết quả của người không thể thấu hiểu ẩn dụ và câu kinh dẫn chứng:",
        expectedAnswer: "Không được tha tội và không thể được cứu rỗi, Mác 4:10~12",
        explanation: ""
      },
      {
        id: "10_3",
        label: "③ Ý nghĩa chân thật của ẩn dụ khi nào được hiểu sáng tỏ và câu kinh dẫn chứng:",
        expectedAnswer: "Khi thực thể của ẩn dụ đã xuất hiện, Giăng 16:25",
        explanation: ""
      }
    ]
  },
  {
    id: 11,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "11_1",
        label: "① Hạt giống:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "11_2",
        label: "② Đồng ruộng:",
        expectedAnswer: "Tấm lòng con người, thế gian",
        explanation: ""
      },
      {
        id: "11_3",
        label: "③ Cây:",
        expectedAnswer: "Con người bên trong (mục tử) đã sinh ra từ hạt giống ngôi lời",
        explanation: ""
      },
      {
        id: "11_4",
        label: "④ Chim:",
        expectedAnswer: "Linh",
        explanation: ""
      },
      {
        id: "11_5",
        label: "⑤ Cành:",
        expectedAnswer: "Môn đồ",
        explanation: ""
      },
      {
        id: "11_6",
        label: "⑥ Lá:",
        expectedAnswer: "Người truyền đạo",
        explanation: ""
      },
      {
        id: "11_7",
        label: "⑦ Trái:",
        expectedAnswer: "Ngôi lời, thánh đồ đã kết quả bởi ngôi lời",
        explanation: ""
      },
      {
        id: "11_8",
        label: "⑧ Mat 24, việc ban phát lương thực đúng giờ:",
        expectedAnswer: "Mat 24, việc ban phát lương thực đúng giờ :  Làm chứng thực thể của lời tiên tri đã thành đạt",
        explanation: ""
      }
    ]
  },
  {
    id: 12,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "12_1",
        label: "① Bát:",
        expectedAnswer: "Con người, hội thánh",
        explanation: ""
      },
      {
        id: "12_2",
        label: "② Cân:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "12_3",
        label: "③ Gậy:",
        expectedAnswer: "Ngôi lời và con người",
        explanation: ""
      },
      {
        id: "12_4",
        label: "④ Gậy sắt:",
        expectedAnswer: "Thẩm quyền cai trị",
        explanation: ""
      },
      {
        id: "12_5",
        label: "⑤ Lửa:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "12_6",
        label: "⑥ Bát hương, hương:",
        expectedAnswer: "Con người, lời cầu nguyện của thánh đồ",
        explanation: ""
      },
      {
        id: "12_7",
        label: "⑦ Khói hương:",
        expectedAnswer: "Lời cầu nguyện bay lên",
        explanation: ""
      },
      {
        id: "12_8",
        label: "⑧ Nồi:",
        expectedAnswer: "Hội thánh",
        explanation: ""
      }
    ]
  },
  {
    id: 13,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "13_1",
        label: "① Ánh sáng/ Bóng tối:",
        expectedAnswer: "Ngôi lời sự sống / Vô tri không biết ngôi lời",
        explanation: ""
      },
      {
        id: "13_2",
        label: "② Ngọn đèn(chân đèn)·mắt:",
        expectedAnswer: "Linh và người mang sứ mệnh",
        explanation: ""
      },
      {
        id: "13_3",
        label: "③ Người mù · người điếc:",
        expectedAnswer: "Người dù nhìn, dù nghe không thể thấu hiểu ngôi lời",
        explanation: ""
      },
      {
        id: "13_4",
        label: "④ Áo / lễ phục :",
        expectedAnswer: "Tấm lòng, hành xử, giáo lý / Việc làm công chính",
        explanation: ""
      },
      {
        id: "13_5",
        label: "⑤ Báu vật:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "13_6",
        label: "⑥ Người giàu:",
        expectedAnswer: "Người nhiều (tri thức) ngôi lời",
        explanation: ""
      }
    ]
  },
  {
    id: 14,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "14_1",
        label: "① Nước:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "14_2",
        label: "② Nguồn:",
        expectedAnswer: "Mục tử và Đền thờ (hội thánh)",
        explanation: ""
      },
      {
        id: "14_3",
        label: "③ Sông:",
        expectedAnswer: "Tấm lòng của môn đồ và người truyền đạo",
        explanation: ""
      },
      {
        id: "14_4",
        label: "④ Biển:",
        expectedAnswer: "Thế gian",
        explanation: ""
      },
      {
        id: "14_5",
        label: "⑤ Người đánh cá:",
        expectedAnswer: "Mục tử (người truyền đạo)",
        explanation: ""
      },
      {
        id: "14_6",
        label: "⑥ Lưới:",
        expectedAnswer: "Ngôi Lời",
        explanation: ""
      },
      {
        id: "14_7",
        label: "⑦ Cá:",
        expectedAnswer: "Con người",
        explanation: ""
      },
      {
        id: "14_8",
        label: "⑧ Thuyền:",
        expectedAnswer: "Hội thánh (tổ chức)",
        explanation: ""
      }
    ]
  },
  {
    id: 15,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "15_1",
        label: "① Con thú:",
        expectedAnswer: "Mục tử giả",
        explanation: ""
      },
      {
        id: "15_2",
        label: "② Đầu:",
        expectedAnswer: "Lãnh đạo (mục tử)",
        explanation: ""
      },
      {
        id: "15_3",
        label: "③ Sừng:",
        expectedAnswer: "Người thẩm quyền (trưởng lão) thuộc đầu",
        explanation: ""
      },
      {
        id: "15_4",
        label: "④ Đuôi:",
        expectedAnswer: "Nhà tiên tri giả",
        explanation: ""
      },
      {
        id: "15_5",
        label: "⑤ Huyết và thịt chiên con:",
        expectedAnswer: "Ngôi lời sự sống của Đức Chúa Jesus",
        explanation: ""
      }
    ]
  },
  {
    id: 16,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "16_1",
        label: "① Rượu nho mới:",
        expectedAnswer: "Ngôi lời khải thị mới",
        explanation: ""
      },
      {
        id: "16_2",
        label: "② Bầu da mới:",
        expectedAnswer: "Mục tử mới và các môn đồ",
        explanation: ""
      },
      {
        id: "16_3",
        label: "③ Dầu ô-liu:",
        expectedAnswer: "Ngôi lời làm chứng của chứng nhân",
        explanation: ""
      }
    ]
  },
  {
    id: 17,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "17_1",
        label: "① Núi:",
        expectedAnswer: "Hội thánh, Đền thờ",
        explanation: ""
      },
      {
        id: "17_2",
        label: "② Đá:",
        expectedAnswer: "Ngôi lời phán xét, mục tử đã nhận thẩm quyền phán xét",
        explanation: ""
      },
      {
        id: "17_3",
        label: "③ Hình tượng:",
        expectedAnswer: "Thầy giả dối (mục tử giả)",
        explanation: ""
      },
      {
        id: "17_4",
        label: "④ Ấn (印):",
        expectedAnswer: "Ngôi lời của Đức Chúa Trời",
        explanation: ""
      },
      {
        id: "17_5",
        label: "⑤ Tiếng kèn:",
        expectedAnswer: "Ngôi lời loan báo",
        explanation: ""
      },
      {
        id: "17_6",
        label: "⑥ Bài ca:",
        expectedAnswer: "Ngôi lời thuyết giảng",
        explanation: ""
      },
      {
        id: "17_7",
        label: "⑦ Bài ca Mô-sê:",
        expectedAnswer: "Ngôi lời kinh thánh cựu ước",
        explanation: ""
      },
      {
        id: "17_8",
        label: "⑧ Bài ca chiên con:",
        expectedAnswer: "Ngôi lời kinh thánh tân ước",
        explanation: ""
      },
      {
        id: "17_9",
        label: "⑨ Bài ca mới:",
        expectedAnswer: "Ngôi lời thực thể đã thành đạt của khải huyền",
        explanation: ""
      }
    ]
  },
  {
    id: 18,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "18_1",
        label: "① Bốn sinh vật:",
        expectedAnswer: "Bốn tướng chỉ huy",
        explanation: ""
      },
      {
        id: "18_2",
        label: "② Gió:",
        expectedAnswer: "Thiên sứ và phán xét",
        explanation: ""
      },
      {
        id: "18_3",
        label: "③ Sinh khí:",
        expectedAnswer: "Ngôi lời sự sống",
        explanation: ""
      },
      {
        id: "18_4",
        label: "④ Sự chết:",
        expectedAnswer: "Tình trạng không có ngôi lời sự sống",
        explanation: ""
      },
      {
        id: "18_5",
        label: "⑤ Mồ mả:",
        expectedAnswer: "Tổ chức phi chân lý",
        explanation: ""
      },
      {
        id: "18_6",
        label: "⑥ Phục sinh:",
        expectedAnswer: "Sống lại bởi ngôi lời sự sống",
        explanation: ""
      },
      {
        id: "18_7",
        label: "⑦ Chú rể / cô dâu:",
        expectedAnswer: "Linh / xác thịt",
        explanation: ""
      },
      {
        id: "18_8",
        label: "⑧ Góa phụ:",
        expectedAnswer: "Mục tử bội đạo",
        explanation: ""
      },
      {
        id: "18_9",
        label: "⑨ Trẻ mồ côi:",
        expectedAnswer: "Tín đồ thuộc mục tử bội đạo",
        explanation: ""
      }
    ]
  },
  {
    id: 19,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "19_1",
        label: "① Giê-ru-sa-lem:",
        expectedAnswer: "Giáo hội dân được chọn",
        explanation: ""
      },
      {
        id: "19_2",
        label: "② Babylon:",
        expectedAnswer: "Giáo hội ma quỷ ngoại bang",
        explanation: ""
      },
      {
        id: "19_3",
        label: "③ Chiến tranh:",
        expectedAnswer: "Chiến tranh giáo lý",
        explanation: ""
      },
      {
        id: "19_4",
        label: "④ Trời, đất:",
        expectedAnswer: "Đền tạm dân được chọn, dân chúng (thánh đồ)",
        explanation: ""
      },
      {
        id: "19_5",
        label: "⑤ Mặt trời·trăng·sao:",
        expectedAnswer: "Mục tử · người truyền đạo · thánh đồ",
        explanation: ""
      },
      {
        id: "19_6",
        label: "⑥ Trời thứ nhất đất thứ nhất:",
        expectedAnswer: "Đền tạm thứ nhất và thánh đồ thứ nhất",
        explanation: ""
      },
      {
        id: "19_7",
        label: "⑦ Trời mới đất mới:",
        expectedAnswer: "Đền tạm mới và thánh đồ mới",
        explanation: ""
      },
      {
        id: "19_8",
        label: "⑧ Chìa khóa thiên đàng:",
        expectedAnswer: "Trí tuệ hiểu biết bí mật thiên đàng",
        explanation: ""
      },
      {
        id: "19_9",
        label: "⑨ Chìa khóa địa ngục:",
        expectedAnswer: "Trí tuệ hiểu biết bí mật của Satan",
        explanation: ""
      }
    ]
  },
  {
    id: 20,
    title: "Hãy viết ý nghĩa chân thật của các từ vựng ẩn dụ sau?",
    category: "Ẩn dụ sơ cấp",
    subQuestions: [
      {
        id: "20_1",
        label: "① Israel:",
        expectedAnswer: "Người chiến thắng, dân được chọn",
        explanation: ""
      },
      {
        id: "20_2",
        label: "② Ba loại Israel:",
        expectedAnswer: "Israel huyết thống, Israel tâm linh, Israel tâm linh mới",
        explanation: ""
      },
      {
        id: "20_3",
        label: "③ Ba loại thiên đàng:",
        expectedAnswer: "Thiên đàng linh giới, Đền tạm của dân được chọn đầu tiên, 12 Bộ Tộc đã được đóng ấn và tái sáng tạo.",
        explanation: ""
      }
    ]
  }
];
