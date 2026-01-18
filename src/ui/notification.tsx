// --- START OF FILE thong-bao.tsx ---

import React from 'react';

// Định nghĩa props cho component
interface RateLimitToastProps {
  /** Cờ để điều khiển việc hiển thị hay ẩn toast */
  show: boolean;
  /** Tùy chọn: nội dung thông báo, có giá trị mặc định */
  message?: string;
  /** Tùy chọn: các class CSS bổ sung để tùy chỉnh vị trí hoặc style */
  className?: string;
  /** Tùy chọn: cờ để điều khiển việc hiển thị icon tia chớp. Mặc định là true */
  showIcon?: boolean;
}

/**
 * Component hiển thị thông báo toast khi người dùng thao tác quá nhanh.
 * Nó có thể được tái sử dụng ở bất kỳ đâu trong ứng dụng.
 */
const RateLimitToast: React.FC<RateLimitToastProps> = ({
  show,
  message = 'Bạn thao tác quá nhanh...',
  className = 'absolute top-14 right-4 z-[101]', // Tăng z-index để nổi trên modal
  showIcon = true, // Giá trị mặc định là true để không phá vỡ các lần sử dụng cũ
}) => {
  return (
    <div
      className={`${className} transform transition-all duration-300 ${
        show
          ? 'opacity-100 translate-y-0' // Trạng thái hiển thị
          : 'opacity-0 -translate-y-5 pointer-events-none' // Trạng thái ẩn
      }`}
      aria-live="assertive" // Giúp trình đọc màn hình đọc thông báo khi nó xuất hiện
    >
      <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-amber-400/50">
        {/* <<< THAY ĐỔI: Chỉ hiển thị icon nếu showIcon là true >>> */}
        {showIcon && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default RateLimitToast;

// --- END OF FILE thong-bao.tsx ---
