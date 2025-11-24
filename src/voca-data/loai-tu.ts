// --- START OF FILE: src/voca-data/loai-tu.ts ---

// Dữ liệu thô: Bạn có thể nhập theo dạng "Từ - Loại từ"
const rawData = `
Source - Danh Từ
Insurance - Danh Từ
College - Danh Từ 
Argument - Danh Từ
Influence - Danh Từ
Release - Danh Từ
Capacity - Danh Từ
Senate - Danh Từ
Massive - Tính Từ
Stick - Danh Từ
District - Danh Từ
Budget - Danh Từ
Measure - Danh Từ
Cross - Danh Từ
Central - Tính Từ
Proud - Tính Từ
Core - Danh Từ
County - Danh Từ
Species - Danh Từ
Conditions - Danh Từ
Touch - Danh Từ
`;

// Hàm xử lý: Tự động chuyển danh sách trên thành object tra cứu
// Ví dụ: "Conditions - Danh Từ" -> Key: "CONDITIONS", Value: "Danh Từ"
const parseData = (text: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const lines = text.trim().split('\n');

  lines.forEach(line => {
    // Tách phần trước và sau dấu gạch ngang "-"
    const parts = line.split('-');
    
    if (parts.length === 2) {
      const word = parts[0].trim().toUpperCase(); // Chuyển IN HOA để khớp mọi trường hợp
      const type = parts[1].trim();               
      
      if (word && type) {
        map[word] = type;
      }
    }
  });
  
  return map;
};

// Xuất biến này để các file khác sử dụng
export const partOfSpeechData = parseData(rawData);

// --- END OF FILE: src/voca-data/loai-tu.ts ---
