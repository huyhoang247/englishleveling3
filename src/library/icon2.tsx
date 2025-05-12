import React from 'react';
// Nhập ảnh từ đường dẫn cục bộ
import gemImage from './image/gem.png';

// --- Component Icon Gem ---
interface GemIconProps {
  size?: number; // Kích thước icon (mặc định 24)
  color?: string; // Màu sắc icon (mặc định 'currentColor') - Lưu ý: SVG này dùng ảnh, màu sắc có thể không áp dụng trực tiếp
  className?: string; // Các class CSS bổ sung
  [key: string]: any; // Cho phép các props khác như onClick, style, v.v.
}

const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  // Lưu ý: Icon này sử dụng ảnh, nên thuộc tính 'color' sẽ không thay đổi màu của ảnh.
  // Bạn có thể cần thay đổi ảnh hoặc sử dụng SVG gốc nếu muốn thay đổi màu sắc động.
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
      <img
        // Sử dụng ảnh đã import từ đường dẫn cục bộ
        src={gemImage}
        alt="Tourmaline Gem Icon"
        className="w-full h-full object-contain"
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

export default GemIcon; // Export component để có thể sử dụng ở nơi khác
