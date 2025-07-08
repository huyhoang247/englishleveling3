// --- START OF FILE example-data.ts ---

export interface ExampleSentence {
  english: string;
  vietnamese: string;
}

// Dữ liệu thô chứa các câu ví dụ và bản dịch
const exampleSentencesText = `
The river is the main source of water for the town. (Dòng sông là nguồn nước chính cho thị trấn.)
Solar energy is a renewable source of power. (Năng lượng mặt trời là một nguồn năng lượng tái tạo.)
The company is looking for a new source of raw materials. (Công ty đang tìm kiếm một nguồn nguyên liệu thô mới.)
Health insurance is a must for all employees. (Bảo hiểm sức khỏe là điều bắt buộc đối với tất cả nhân viên.)
`;

/**
 * Phân tích chuỗi dữ liệu ví dụ thành một mảng các đối tượng có cấu trúc.
 * @param text - Chuỗi văn bản thô chứa các ví dụ.
 * @returns Một mảng các đối tượng ExampleSentence.
 */
export const parseExampleSentences = (text: string): ExampleSentence[] => {
  const lines = text.trim().split('\n');
  const examples: ExampleSentence[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const match = line.match(/(.*)\s*\((.*)\)/);
    if (match && match[1] && match[2]) {
      examples.push({
        english: match[1].trim(),
        vietnamese: match[2].trim().replace(/\.$/, ''), // Bỏ dấu chấm ở cuối nếu có
      });
    } else {
      // Fallback nếu dòng không đúng định dạng
      examples.push({
        english: line.trim(),
        vietnamese: 'Bản dịch không có sẵn',
      });
    }
  }

  return examples;
};

// Xuất dữ liệu đã được phân tích để các component khác có thể sử dụng trực tiếp
export const exampleData: ExampleSentence[] = parseExampleSentences(exampleSentencesText);

// --- END OF FILE example-data.ts ---
