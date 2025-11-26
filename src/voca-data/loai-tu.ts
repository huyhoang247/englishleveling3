// --- START OF FILE: src/voca-data/loai-tu.ts ---

// Dữ liệu thô: Hỗ trợ dạng "Từ - Loại 1 / Loại 2"
const rawData = `
Source - Danh Từ
Insurance - Danh Từ
College - Danh Từ / Liên Từ
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
`;

// Hàm xử lý: Chuyển text thành Object, value là Mảng string[]
const parseData = (text: string): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  const lines = text.trim().split('\n');

  lines.forEach(line => {
    const parts = line.split('-');
    
    if (parts.length === 2) {
      const word = parts[0].trim().toUpperCase();
      // Tách các loại từ bằng dấu "/" và xóa khoảng trắng thừa
      const types = parts[1].split('/').map(t => t.trim()).filter(t => t !== '');
      
      if (word && types.length > 0) {
        map[word] = types;
      }
    }
  });
  
  return map;
};

export const partOfSpeechData = parseData(rawData);

// --- END OF FILE: src/voca-data/loai-tu.ts ---
