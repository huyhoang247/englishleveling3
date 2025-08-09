import React, { memo } from 'react';

// Define the props for the MasteryDisplay component
interface MasteryDisplayProps {
  masteryCount: number;
}

// Icon URL
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';
const masteryIconPlaceholderUrl = 'https://placehold.co/16x16/8b5cf6/ffffff?text=M'; // Placeholder

// MasteryDisplay component - Redesigned to match CoinDisplay's aesthetic
const MasteryDisplay: React.FC<MasteryDisplayProps> = memo(({ masteryCount }) => (
  // Container with a rich gradient, shadow, and interactive effects, mirroring CoinDisplay
  <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
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
    
    {/* Shine effect on hover, identical to CoinDisplay */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
    
    {/* Icon container */}
    <div className="relative flex items-center justify-center mr-1">
      <img 
        src={masteryIconUrl} 
        alt="Mastery Icon" 
        className="w-4 h-4"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = masteryIconPlaceholderUrl; // Fallback to placeholder
        }}
      />
    </div>

    {/* Mastery count with updated text color for better contrast */}
    <div className="font-bold text-indigo-100 text-xs tracking-wide">{masteryCount}</div>
    
    {/* Pulsing dots for a "live" feel, identical to CoinDisplay */}
    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div>
  </div>
));

export default MasteryDisplay;
