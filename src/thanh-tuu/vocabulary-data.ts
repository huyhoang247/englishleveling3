// src/vocabulary-data.ts

/**
 * Định nghĩa cấu trúc dữ liệu cho một mục thành tựu từ vựng.
 * File này đóng vai trò là "nguồn định nghĩa duy nhất" (single source of truth)
 * cho cấu trúc dữ liệu, đảm bảo tính nhất quán trên toàn bộ ứng dụng.
 */
export type VocabularyItem = {
  word: string;       // Từ vựng, cũng là ID trong Firestore
  level: number;      // Cấp độ thông thạo hiện tại
  exp: number;        // Kinh nghiệm đã tích lũy ở cấp độ hiện tại
  maxExp: number;     // Kinh nghiệm cần để lên cấp tiếp theo
  totalExp: number;   // Tổng kinh nghiệm đã tích lũy từ trước đến nay (dùng để tính toán khi lên cấp)
};

/**
 * Dữ liệu mẫu dưới đây chỉ dùng cho mục đích phát triển và thử nghiệm giao diện.
 * Nó không được sử dụng trong logic sản phẩm dành cho người dùng thật.
 */
export const initialVocabularyDataForTesting: VocabularyItem[] = [
  { word: 'Ephemeral', level: 3, exp: 75, maxExp: 300, totalExp: 375 + 100 + 200 }, // Level 1 (100) + Level 2 (200) + 75
  { word: 'Serendipity', level: 1, exp: 50, maxExp: 100, totalExp: 50 },
  { word: 'Luminous', level: 2, exp: 150, maxExp: 200, totalExp: 100 + 150 },
];
