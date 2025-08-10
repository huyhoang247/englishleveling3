// --- START OF FILE streak-display.tsx (Shadow Steel Theme) ---

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

// StreakDisplay component - Shadow Steel Theme
const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => (
  // Thay đổi màu nền gradient và viền
  <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-0.5 flex items-center justify-center shadow-lg border border-gray-500 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    <style jsx>{`
      @keyframes highlight-change {
        0% {
          color: #FFFFFF;
          /* Thay đổi màu sắc của hiệu ứng phát sáng */
          text-shadow: 0 0 8px rgba(220, 220, 220, 0.8); /* White/Silver glow */
          transform: scale(1.15);
        }
        100% {
          /* Thay đổi màu sắc của chữ */
          color: #F3F4F6; /* text-gray-100 */
          text-shadow: none;
          transform: scale(1);
        }
      }
      .is-animating {
        animation: highlight-change 0.4s ease-out;
      }
      
      @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-fast {
        animation: pulse-fast 1.2s infinite;
      }
    `}</style>
    
    {/* Thay đổi màu sắc của hiệu ứng "shine" */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-400/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    <div className="relative flex items-center justify-center mr-0.5">
      <img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" />
    </div>
    
    {/* Thay đổi màu chữ */}
    <div className={`font-bold text-gray-100 text-xs tracking-wide streak-counter ml-1 ${isAnimating ? 'is-animating' : ''}`}>
      {displayedStreak}
    </div>
    
    {/* Thay đổi màu chấm lấp lánh cho phù hợp */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse-fast" style={{ animationDelay: '0.6s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx (Shadow Steel Theme) ---
