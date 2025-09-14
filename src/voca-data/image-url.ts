// --- START OF REFACTORED FILE image-url.ts ---

// Phần URL cơ sở không thay đổi
const baseUrl = "https://raw.githubusercontent.com/englishleveling46/Flashcard/main/image-anime/";

/**
 * Hàm trợ giúp để tạo ra một chuỗi các URL theo một quy tắc nhất định.
 * @param folder - Tên thư mục (ví dụ: 'image', 'image2').
 * @param start - Số bắt đầu.
 * @param end - Số kết thúc.
 * @returns Một mảng các URL đã được tạo.
 */
const generateUrls = (folder: string, start: number, end: number): string[] => {
  const urls: string[] = [];
  for (let i = start; i <= end; i++) {
    // Số dưới 1000 sẽ được đệm bằng 3 chữ số (e.g., 1 -> "001")
    // Các số từ 1000 trở lên sẽ giữ nguyên (e.g., 1001, 8001, 10001)
    const fileName = i < 1000 ? String(i).padStart(3, '0') : String(i);
    urls.push(`${baseUrl}${folder}/${fileName}.webp`);
  }
  return urls;
};

// Định nghĩa các khối (blocks) URL cần tạo
const urlBlocks = [
  // Basic Voca
  { folder: 'image', start: 1, end: 1000 },
  { folder: 'image2', start: 1001, end: 2000 },
  { folder: 'image3', start: 2001, end: 2400 },
  
  // Elementary Voca
  { folder: 'image4', start: 3001, end: 4000 },
  { folder: 'image5', start: 4001, end: 4700 },

  // Intermediate Voca
  { folder: 'image6', start: 5001, end: 6000 },
  { folder: 'image7', start: 6001, end: 7000 },
  { folder: 'image8', start: 7001, end: 7400 },

  // Advanced Voca (Dựa trên cấu trúc file của bạn)
  { folder: 'image9', start: 8001, end: 9000 },
  { folder: 'image10', start: 9001, end: 10000 },
  { folder: 'image11', start: 10001, end: 10300 },
];

// Tạo mảng URL cuối cùng bằng cách duyệt qua các khối và gom kết quả lại
export const defaultImageUrls: string[] = urlBlocks.flatMap(block =>
  generateUrls(block.folder, block.start, block.end)
);

// Bạn có thể thêm các mảng URL ảnh cho các phong cách khác tại đây nếu muốn
// export const animeImageUrls: string[] = [ ... ];
// export const comicImageUrls: string[] = [ ... ];
// export const realisticImageUrls: string[] = [ ... ];

// --- END OF REFACTORED FILE ---
