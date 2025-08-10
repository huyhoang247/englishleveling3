// --- START OF FILE streak-display.tsx ---

import React from 'react';

// Define the props for the StreakDisplay component
interface StreakDisplayProps {
  displayedStreak: number;
  isAnimating: boolean;
}

// Centralized object for streak icon URLs
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png',
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png',
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png',
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png',
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png',
};

// Helper function to get the correct icon based on the streak count
const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20;
  if (streak >= 10) return streakIconUrls.streak10;
  if (streak >= 5) return streakIconUrls.streak5;
  if (streak >= 1) return streakIconUrls.streak1;
  return streakIconUrls.default;
};

// StreakDisplay component - Redesigned to match CoinDisplay
const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => (
  // Container được thiết kế lại với gradient, bóng, viền và padding tương tự CoinDisplay
  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-0.5 flex items-center justify-center shadow-lg border border-orange-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    {/* CSS cho các animation */}
    <style jsx>{`
      /* Animation khi số thay đổi, tương tự coin-display */
      @keyframes highlight-change {
        0% {
          color: #FFFFFF;
          text-shadow: 0 0 8px rgba(255, 165, 0, 0.9); /* Orange glow */
          transform: scale(1.15);
        }
        100% {
          color: #FFEDD5; /* text-orange-100 */
          text-shadow: none;
          transform: scale(1);
        }
      }
      .is-animating {
        animation: highlight-change 0.4s ease-out;
      }
      
      /* Animation lấp lánh */
      @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-fast {
        animation: pulse-fast 1.2s infinite;
      }
    `}</style>
    
    {/* Hiệu ứng "shine" khi hover, sao chép từ coin-display */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    {/* Icon lửa */}
    <div className="relative flex items-center justify-center mr-0.5">
      <img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" />
    </div>
    
    {/* Số streak, với màu chữ và animation mới */}
    <div className={`font-bold text-orange-100 text-xs tracking-wide streak-counter ml-1 ${isAnimating ? 'is-animating' : ''}`}>
      {displayedStreak}
    </div>
    
    {/* Các chấm lấp lánh, sao chép từ coin-display để tạo sự sống động */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast" style={{ animationDelay: '0.6s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx ---
