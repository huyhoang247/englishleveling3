// --- START OF FILE streak-display.tsx (Electric Violet Theme) ---

import React from 'react';

// Define the props for the StreakDisplay component
interface StreakDisplayProps {
  displayedStreak: number;
  isAnimating: boolean;
}

// ... (phần streakIconUrls và getStreakIconUrl giữ nguyên) ...

// StreakDisplay component - Electric Violet Theme
const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => (
  // <<< THAY ĐỔI Ở ĐÂY: Gradient, border
  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-0.5 flex items-center justify-center shadow-lg border border-violet-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    <style jsx>{`
      @keyframes highlight-change {
        0% {
          color: #FFFFFF;
          /* <<< THAY ĐỔI Ở ĐÂY: Glow color */
          text-shadow: 0 0 9px rgba(192, 132, 252, 0.9); /* Violet glow */
          transform: scale(1.15);
        }
        100% {
          /* <<< THAY ĐỔI Ở ĐÂY: Text color */
          color: #EDE9FE; /* text-violet-100 */
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
    
    {/* <<< THAY ĐỔI Ở ĐÂY: Shine color */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-violet-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    <div className="relative flex items-center justify-center mr-0.5">
      <img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" />
    </div>
    
    {/* <<< THAY ĐỔI Ở ĐÂY: Text color */}
    <div className={`font-bold text-violet-100 text-xs tracking-wide streak-counter ml-1 ${isAnimating ? 'is-animating' : ''}`}>
      {displayedStreak}
    </div>
    
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-violet-200 rounded-full animate-pulse-fast" style={{ animationDelay: '0.6s' }}></div>
  </div>
);

export default StreakDisplay;

// --- END OF FILE streak-display.tsx (Electric Violet Theme) ---
