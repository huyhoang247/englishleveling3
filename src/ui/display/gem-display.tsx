import React from 'react';
import { uiAssets } from './game-assets.ts'; // Assuming path is relative to component location

// Define the props for the GemDisplay component
interface GemDisplayProps {
  displayedGems: number;
}

// Placeholder URL for when the gem icon fails to load
const gemIconPlaceholderUrl = "https://placehold.co/16x16/a78bfa/ffffff?text=G";

// GemDisplay component
const GemDisplay: React.FC<GemDisplayProps> = ({ displayedGems }) => {
  return (
    // Gem Container - styled with a purple/indigo theme
    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Inline styles for animations, similar to CoinDisplay */}
      <style jsx>{`
        @keyframes number-change-gem {
          0% { color: #c4b5fd; text-shadow: 0 0 8px rgba(196, 181, 253, 0.8); transform: scale(1.1); }
          100% { color: #ddd6fe; text-shadow: none; transform: scale(1); }
        }
        .number-changing {
          animation: number-change-gem 0.3s ease-out;
        }
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      
      {/* Glossy shine effect on hover */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      
      {/* Gem Icon, using a direct <img> tag for self-containment */}
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src={uiAssets.gemIcon}
          alt="Tourmaline Gem Icon"
          className="w-4 h-4" // 16px
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = gemIconPlaceholderUrl;
          }}
        />
      </div>

      {/* Gem Count */}
      <div className="font-bold text-purple-200 text-xs tracking-wide">
        {displayedGems.toLocaleString()}
      </div>

      {/* "Add Gems" Plus Button */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span>
      </div>

      {/* Sparkle effects */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default GemDisplay;
