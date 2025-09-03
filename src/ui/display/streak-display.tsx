// --- START OF FILE streak-display.tsx (Frosty Crystal Theme) ---

import React from 'react';

// Define the props for the StreakDisplay component
interface StreakDisplayProps {
  displayedStreak: number;
  isAnimating: boolean;
}

// Use a single, consistent icon for the streak
const STREAK_ICON_URL = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/streak-icon.webp';

// StreakDisplay component - Frosty Crystal Theme (Trắng Tuyết)
const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => (
  // Sử dụng 'gap-x-0.5' để tạo một khoảng cách nhỏ và nhất quán giữa icon và chữ số
  <div className="rounded-lg p-0.5 flex items-center justify-center border border-sky-200/50 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer gap-x-0.5">
    <style jsx>{`
      /* Animation for the streak number - điều chỉnh lại để hợp với chữ trắng */
      @keyframes highlight-change {
        0% {
          /* Chữ sẽ phát sáng màu trắng băng giá */
          color: #ffffff;
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.9), 0px 1px 3px rgba(0, 0, 0, 0.6);
          transform: scale(1.15);
        }
        100% {
          /* Trở về màu chữ mặc định với shadow cơ bản */
          color: #ffffff;
          text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.6);
          transform: scale(1);
        }
      }
      .is-animating {
        animation: highlight-change 0.4s ease-out;
      }
      
      /* Animation for the sparkling dots */
      @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-fast {
        animation: pulse-fast 1.3s infinite;
      }

      /* Gentle "pop" animation for the streak icon */
      @keyframes icon-pop {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.15);
        }
        100% {
          transform: scale(1);
        }
      }
      .is-icon-animating {
        animation: icon-pop 0.6s ease-out;
      }
    `}</style>
    
    {/* Hiệu ứng "shine" trong suốt như một lớp băng mỏng lướt qua */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    {/* Bỏ margin để 'gap' trong div cha xử lý khoảng cách */}
    <div className="relative flex items-center justify-center">
      <img 
        src={STREAK_ICON_URL} 
        alt="Streak Icon" 
        className={`w-4 h-4 ${isAnimating ? 'is-icon-animating' : ''}`} 
      />
    </div>
    
    {/* Chữ số màu trắng, font siêu đậm, có text-shadow để dễ đọc */}
    <div 
      className={`font-extrabold text-white text-xs tracking-wide streak-counter ${isAnimating ? 'is-animating' : ''}`}
      style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.6)' }}
    >
      {displayedStreak}
    </div>
    
    {/* Các chấm lấp lánh màu xanh băng giá */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-sky-500 rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-sky-400 rounded-full animate-pulse-fast" style={{ animationDelay: '0.65s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx (Frosty Crystal Theme) ---
