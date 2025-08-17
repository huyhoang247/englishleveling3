import React from 'react';
import { uiAssets } from '../../game-assets.ts'; // Import from centralized assets file

// Define the props for the CardCapacityDisplay component
interface CardCapacityDisplayProps {
  current: number; // The current number of cards
  max: number;     // The maximum capacity for cards
}

// CardCapacityDisplay component, now self-contained
const CardCapacityDisplay: React.FC<CardCapacityDisplayProps> = ({ current, max }) => {
  return (
    // Capacity Container
    // Extracted from lat-the.tsx
    <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-0.5 flex items-center shadow-lg border border-slate-600 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
        title="Nâng cấp sức chứa thẻ"
    >
      {/* Add necessary styles for animations used here to make the component self-contained */}
      <style jsx>{`
        @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative mr-1 flex items-center justify-center">
        <img src={uiAssets.cardCapacityIcon} alt="Sức chứa thẻ" className="w-4 h-4" />
      </div>
      <div className="font-bold text-white text-xs tracking-wide">
        {current.toLocaleString()}
        <span className="text-slate-400/80 font-medium opacity-90"> / {max.toLocaleString()}</span>
      </div>
      <div className="ml-1 w-3 h-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center cursor-pointer border border-slate-500 shadow-inner hover:shadow-blue-500/50 hover:scale-110 transition-all duration-200">
        <span className="text-white font-bold text-xs">+</span>
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default CardCapacityDisplay;
