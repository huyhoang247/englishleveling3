// --- START OF FILE: src/voca-data/loai-tu.ts ---

// Dữ liệu thô: Hỗ trợ dạng "Từ - Loại 1 / Loại 2"
// QUY TẮC NHẬP LIỆU QUAN TRỌNG:
// 1. Dùng dấu gạch ngang "-" cuối cùng trong dòng để ngăn cách giữa TỪ và LOẠI TỪ.
// 2. Nếu từ vựng có dấu gạch ngang (ví dụ: decision-making), code vẫn hiểu đúng.
// 3. Nếu từ vựng là tiền tố (ví dụ: de-), hãy nhập: "de- - Tiền Tố".
const rawData = `
Source - Danh Từ
Insurance - Danh Từ
College - Danh Từ 
Argument - Danh Từ / Tính Từ
Influence - Danh Từ / Động Từ
Release - Danh Từ / Động Từ
Capacity - Danh Từ
Senate - Danh Từ
Massive - Tính Từ
Stick - Danh Từ / Động Từ
District - Danh Từ
Budget - Danh Từ
Measure - Danh Từ
Cross - Danh Từ / Động Từ
Central - Tính Từ
Proud - Tính Từ
Core - Danh Từ / Tính Từ
County - Danh Từ
Species - Danh Từ
Conditions - Danh Từ
Touch - Danh Từ / Động Từ
Decision-making - Danh Từ / Tính Từ
Self-confidence - Danh Từ
Long-term - Tính Từ
de- - Tiền Tố
non- - Tiền Tố
`;

// Hàm xử lý: Chuyển text thành Object, value là Mảng string[]
const parseData = (text: string): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  const lines = text.trim().split('\n');

  lines.forEach(line => {
    // TÌM DẤU GẠCH NGANG CUỐI CÙNG TRONG DÒNG
    // Logic này cực kỳ quan trọng để xử lý các từ vựng có chứa dấu gạch ngang (VD: Decision-making)
    // Code sẽ bỏ qua các dấu gạch ngang bên trong từ, chỉ lấy dấu gạch ngang cuối cùng làm vách ngăn.
    const lastHyphenIndex = line.lastIndexOf('-');
    
    // Đảm bảo tìm thấy dấu gạch ngang và nó không nằm ở đầu dòng (index > 0)
    if (lastHyphenIndex > 0) {
      // 1. Phần TỪ VỰNG: Cắt từ đầu dòng đến trước dấu gạch ngang cuối cùng
      // .trim() để xóa khoảng trắng thừa ở 2 đầu
      // .toUpperCase() để chuẩn hóa key giúp tra cứu dễ dàng
      const word = line.substring(0, lastHyphenIndex).trim().toUpperCase();
      
      // 2. Phần LOẠI TỪ: Cắt từ sau dấu gạch ngang cuối cùng đến hết dòng
      const typeString = line.substring(lastHyphenIndex + 1).trim();
      
      // Tách các loại từ bằng dấu gạch chéo "/" (nếu có nhiều loại từ)
      const types = typeString.split('/').map(t => t.trim()).filter(t => t !== '');
      
      // Chỉ lưu vào map nếu có đủ dữ liệu
      if (word && types.length > 0) {
        map[word] = types;
      }
    }
  });
  
  return map;
};

// Xuất dữ liệu đã được xử lý để các file khác (như flashcard.tsx) sử dụng
export const partOfSpeechData = parseData(rawData);

// --- END OF FILE: src/voca-data/loai-tu.ts ---
