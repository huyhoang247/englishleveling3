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
  // Nền gradient từ trắng tinh sang xanh da trời rất nhạt, viền xanh nhạt
  <div className="bg-gradient-to-br from-white to-sky-100 rounded-lg p-0.5 flex items-center justify-center shadow-lg border border-sky-200 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    <style jsx>{`
      /* Animation for the streak number */
      @keyframes highlight-change {
        0% {
          /* Chữ sẽ đậm lên thành màu xanh thẫm */
          color: #0c4a6e; /* Tailwind's sky-900 */
          /* Hiệu ứng phát sáng màu xanh băng giá */
          text-shadow: 0 0 7px rgba(56, 189, 248, 0.7); /* Sky-blue frosty glow */
          transform: scale(1.15);
        }
        100% {
          /* Trở về màu chữ mặc định */
          color: #075985; /* Tailwind's sky-800 */
          text-shadow: none;
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

      /* Gentle "pop" animation for the streak icon when updated */
      @keyframes icon-pop {
        0% {
          transform: scale(1) rotate(0deg);
        }
        50% {
          transform: scale(1.25) rotate(-10deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
      }
      .is-icon-animating {
        animation: icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* A bouncy ease */
      }
    `}</style>
    
    {/* Hiệu ứng "shine" trong suốt như một lớp băng mỏng lướt qua */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    <div className="relative flex items-center justify-center mr-0.5">
      {/* Use the single icon and apply animation when isAnimating is true */}
      <img 
        src={STREAK_ICON_URL} 
        alt="Streak Icon" 
        className={`w-4 h-4 ${isAnimating ? 'is-icon-animating' : ''}`} 
      />
    </div>
    
    {/* Màu chữ là màu xanh đậm, font siêu đậm để nổi bật trên nền trắng */}
    <div className={`font-extrabold text-sky-800 text-xs tracking-wide streak-counter ml-1 mr-1 ${isAnimating ? 'is-animating' : ''}`}>
      {displayedStreak}
    </div>
    
    {/* Các chấm lấp lánh màu xanh băng giá */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-sky-500 rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-sky-400 rounded-full animate-pulse-fast" style={{ animationDelay: '0.65s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx (Frosty Crystal Theme) ---
