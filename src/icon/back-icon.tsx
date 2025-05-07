import React from 'react';
// Import hình ảnh từ đường dẫn tương đối trong dự án của bạn
// Đảm bảo đường dẫn này là chính xác dựa trên vị trí của tệp hình ảnh
import leftArrowIcon from './image/back.png'; // Ví dụ: nếu tệp hình ảnh ở cùng thư mục hoặc trong thư mục con

interface BackIconProps {
  onClick?: () => void; // Optional click handler
  className?: string; // Optional class name for styling
}

const BackIcon: React.FC<BackIconProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      // Base styles for the button container
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors p-1 hover:bg-gray-100 ${className || ''}`}
      aria-label="Quay lại"
      title="Quay lại"
    >
      <img
        // Sử dụng biến đã import làm nguồn ảnh
        src={leftArrowIcon}
        alt="Return icon"
        className="w-full h-full object-contain" // Ensure image fits and maintains aspect ratio
      />
    </button>
  );
};

export default BackIcon;
