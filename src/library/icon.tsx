import React from 'react';
// Import hình ảnh awatd.png và đặt tên biến khác để tránh trùng lặp
import StatsIconImage from './image/stats-icon.png'; // Đã đổi tên biến import

// Define props for the StatsIcon component
interface StatsIconProps {
  onClick: () => void; // Function to call when the icon is clicked
  // Add other props if needed for styling or state
}

// StatsIcon component: Displays the icon that opens the stats screen
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => {
  return (
    // Container div for the icon
    // Added relative and z-10 to ensure it's above background layers in the header
    <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10"
         onClick={onClick} // Call the onClick prop when clicked
         title="Xem chỉ số nhân vật" // Tooltip for accessibility
    >
      {/* Image tag for the icon */}
      <img
        src={StatsIconImage} // Sử dụng biến mới đã đổi tên làm nguồn ảnh
        alt="Award Icon" // Alt text for accessibility
        className="w-full h-full object-contain" // Ensure the image fits within the container
        // Handle potential errors when loading the image
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
          target.onerror = null; // Prevent infinite loop if placeholder also fails
          // Cập nhật placeholder hoặc xử lý lỗi tải ảnh từ đường dẫn local nếu cần
          target.src = "https://placehold.co/32x32/ffffff/000000?text=Icon"; // Show a placeholder image on error
        }}
      />
    </div>
  );
};

export default StatsIcon; // Export the component for use in other files
