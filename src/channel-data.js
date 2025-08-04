// --- START OF FILE src/channel-data.js ---

// Chúng ta dùng file .js để script Node có thể đọc dễ dàng
// mà không cần cài đặt thêm công cụ phức tạp.

const sampleChannels = [
  {
    id: 'https://www.youtube.com/@TED',
    category: 'Bài Nói Truyền Cảm Hứng'
  },
  {
    id: 'https://www.youtube.com/@PracticalEngineeringChannel',
    category: 'Kỹ Thuật & Khoa Học'
  },
  {
    id: 'https://www.youtube.com/@MrBeast',
    category: 'Giải Trí'
  },
  // Thêm các kênh khác bạn muốn vào đây...
];

// Export để script có thể sử dụng
module.exports = { sampleChannels };

// --- END OF FILE src/channel-data.js ---
