// --- START OF FILE streak-display.tsx (Frosty Crystal Theme with Lilita Font) ---

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

// StreakDisplay component - Frosty Crystal Theme (Trắng Tuyết)
const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => (
  // Nền gradient từ trắng tinh sang xanh da trời rất nhạt, viền xanh nhạt
  <div className="bg-gradient-to-br from-white to-sky-100 rounded-lg p-0.5 flex items-center justify-center shadow-lg border border-sky-200 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    <style jsx>{`
      @keyframes highlight-change {
        0% {
          color: #0c4a6e; /* Tailwind's sky-900 */
          text-shadow: 0 0 7px rgba(56, 189, 248, 0.7); /* Sky-blue frosty glow */
          transform: scale(1.15);
        }
        100% {
          color: #075985; /* Tailwind's sky-800 */
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
        animation: pulse-fast 1.3s infinite;
      }
    `}</style>
    
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    <div className="relative flex items-center justify-center mr-0.5">
      <img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" />
    </div>
    
    {/* <<< THAY ĐỔI Ở ĐÂY */}
    <div className={`
        font-lilita text-sky-800 text-xs tracking-wide streak-counter 
        ml-1 pr-1
        ${isAnimating ? 'is-animating' : ''}
    `}>
      {displayedStreak}
    </div>
    
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-sky-500 rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-sky-400 rounded-full animate-pulse-fast" style={{ animationDelay: '0.65s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx (Frosty Crystal Theme with Lilita Font) ---
