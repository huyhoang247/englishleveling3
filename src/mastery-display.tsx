import React, { memo } from 'react';
import { dashboardAssets, uiAssets } from './game-assets.ts'; // <-- NHẬP TÀI NGUYÊN

// Define the props for the MasteryDisplay component
interface MasteryDisplayProps {
  masteryCount: number;
}

// Icon URL đã được chuyển vào game-assets.ts
// const masteryIconUrl = '...';
// const masteryIconPlaceholderUrl = '...';

// MasteryDisplay component - Platinum/Slate Theme
const MasteryDisplay: React.FC<MasteryDisplayProps> = memo(({ masteryCount }) => (
  // Container with a sleek slate-to-gray gradient
  <div className="bg-gradient-to-br from-slate-600 to-gray-800 rounded-lg p-0.5 flex items-center shadow-lg border border-slate-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    {/* Keyframe animation for the pulsing dots */}
    <style jsx>{`
      @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-fast {
        animation: pulse-fast 1s infinite;
      }
    `}</style>

    {/* Shine effect on hover with a white/light gray tint */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

    {/* Icon container */}
    <div className="relative flex items-center justify-center mr-1">
      <img
        src={dashboardAssets.masteryIcon} // <-- SỬ DỤNG TÀI NGUYÊN TẬP TRUNG
        alt="Mastery Icon"
        className="w-4 h-4"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = uiAssets.masteryIconPlaceholder; // <-- SỬ DỤNG TÀI NGUYÊN TẬP TRUNG
        }}
      />
    </div>

    {/* Mastery count with a bright, clear text color */}
    <div className="font-bold text-slate-100 text-xs tracking-wide">{masteryCount}</div>

    {/* Plus button for Mastery - Adjusted to match the slate theme */}
    <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-slate-500 to-gray-700 rounded-full flex items-center justify-center cursor-pointer border border-slate-400 shadow-inner hover:shadow-slate-400/50 hover:scale-110 transition-all duration-200">
      <span className="text-white font-bold text-xs">+</span>
    </div>

    {/* Pulsing dots for a "live" feel */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-slate-300 rounded-full animate-pulse-fast"></div>
  </div>
));

export default MasteryDisplay;
