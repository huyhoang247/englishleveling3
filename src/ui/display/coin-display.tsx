import React from 'react';
import { uiAssets } from '../../game-assets.ts'; // Import from centralized assets file

// Define the props for the CoinDisplay component
interface CoinDisplayProps {
  displayedCoins: number; // The number of coins to display
  isStatsFullscreen: boolean; // Flag to hide/show the display when stats are fullscreen
}

// Placeholder URL for when the main icon fails to load
const coinIconPlaceholderUrl = "https://placehold.co/16x16/ffd700/000000?text=$"; // Placeholder

// CoinDisplay component
const CoinDisplay: React.FC<CoinDisplayProps> = ({ displayedCoins, isStatsFullscreen }) => {
  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Coins Container
    // Copied from background-game.tsx
    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Add necessary styles for animations used here */}
      <style jsx>{`
        @keyframes number-change {
          0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); }
          100% { color: #fff; text-shadow: none; transform: scale(1); }
        }
        .number-changing {
          animation: number-change 0.3s ease-out;
        }
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      {/* Replaced the old coin icon div with the new image tag */}
      <div className="relative mr-0.5 flex items-center justify-center"> {/* Container for the image */}
        <img // Using the icon from the centralized game-assets file
          src={uiAssets.goldIcon}
          alt="Dollar Coin Icon" // Add alt text
          className="w-4 h-4" // Adjust size as needed
           // Optional: Add onerror to handle broken image link
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = coinIconPlaceholderUrl; // Placeholder image
          }}
        />
      </div>
      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter"> {/* Text size remains xs */}
        {displayedCoins.toLocaleString()}
      </div>
      {/* Plus button for Coins - Functionality can be added later */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span> {/* Text size remains xs */}
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default CoinDisplay;
