import React from 'react';
import gemImage from './image/gem.png';
import StatsIconImage from './image/stats-icon.png';

// --- Component Icon Gem ---
// Định nghĩa props cho GemIcon
interface GemIconProps {
  size?: number; // Kích thước icon (mặc định 24)
  color?: string; // Màu sắc icon (mặc định 'currentColor') - Lưu ý: SVG này dùng ảnh, màu sắc có thể không áp dụng trực tiếp
  className?: string; // Các class CSS bổ sung
  [key: string]: any; // Cho phép các props khác như onClick, style, v.v.
}

// Component GemIcon: Hiển thị icon viên ngọc
const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  // Lưu ý: Icon này sử dụng ảnh, nên thuộc tính 'color' sẽ không thay đổi màu của ảnh.
  // Bạn có thể cần thay đổi ảnh hoặc sử dụng SVG gốc nếu muốn thay đổi màu sắc động.
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
      <img
        // Sử dụng ảnh đã import từ đường dẫn cục bộ
        src={gemImage}
        alt="Tourmaline Gem Icon" // Alt text cho khả năng tiếp cận
        className="w-full h-full object-contain" // Đảm bảo ảnh vừa với container
        // Xử lý lỗi tải ảnh cục bộ (tùy chọn, thường không cần thiết với asset được bundle)
        // onError={(e) => {
        //   const target = e as any;
        //   target.onerror = null;
        //   target.src = `https://placehold.co/${size}x${size}/8a2be2/ffffff?text=Gem`; // Placeholder
        // }}
      />
    </div>
  );
};

// --- Component Stats Icon ---
// Định nghĩa props cho StatsIcon
interface StatsIconProps {
  onClick: () => void; // Hàm được gọi khi icon được click
  // Thêm các props khác nếu cần cho styling hoặc state
}

// Component StatsIcon: Hiển thị icon mở màn hình chỉ số
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => {
  return (
    // Container div cho icon
    // Thêm relative và z-10 để đảm bảo nó nằm trên các lớp nền trong header
    <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10"
         onClick={onClick} // Gọi hàm onClick khi được click
         title="Xem chỉ số nhân vật" // Tooltip cho khả năng tiếp cận
    >
      {/* Thẻ img cho icon */}
      <img
        src={StatsIconImage} // Sử dụng biến import ảnh
        alt="Award Icon" // Alt text cho khả năng tiếp cận
        className="w-full h-full object-contain" // Đảm bảo ảnh vừa với container
        // Xử lý lỗi tải ảnh
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Ép kiểu sang HTMLImageElement
          target.onerror = null; // Ngăn chặn vòng lặp vô hạn nếu placeholder cũng lỗi
          // Cập nhật placeholder hoặc xử lý lỗi tải ảnh từ đường dẫn local nếu cần
          target.src = "https://placehold.co/32x32/ffffff/000000?text=Icon"; // Hiển thị ảnh placeholder khi lỗi
        }}
      />
    </div>
  );
};

// Export cả hai component để có thể import và sử dụng ở nơi khác
export { GemIcon, StatsIcon };
