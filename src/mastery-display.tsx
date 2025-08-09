import React, { memo } from 'react';

// Define the props for the MasteryDisplay component
interface MasteryDisplayProps {
  masteryCount: number;
}

// Icon URL
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';

// MasteryDisplay component
const MasteryDisplay: React.FC<MasteryDisplayProps> = memo(({ masteryCount }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
    <style jsx>{`
      @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-fast {
        animation: pulse-fast 1s infinite;
      }
    `}</style>
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    <div className="relative flex items-center justify-center">
      <img src={masteryIconUrl} alt="Mastery Icon" className="w-4 h-4" />
    </div>
    <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{masteryCount}</div>
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div>
  </div>
));

export default MasteryDisplay;
