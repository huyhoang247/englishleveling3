import React from 'react';
import { uiAssets } from '../../game-assets.ts'; // Giả sử bạn cũng thêm energyIcon vào đây

// Define the props for the EnergyDisplay component
interface EnergyDisplayProps {
  currentEnergy: number; // The current amount of energy
  maxEnergy: number; // The maximum amount of energy
  isStatsFullscreen: boolean; // Flag to hide/show the display
}

// Placeholder URL for when the main icon fails to load
const energyIconPlaceholderUrl = "https://placehold.co/16x16/00ffff/000000?text=E"; // Placeholder

// EnergyDisplay component
const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ currentEnergy, maxEnergy, isStatsFullscreen }) => {
  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Energy Container - Styled to be consistent with CoinDisplay
    <div className="bg-gradient-to-br from-cyan-500 to-sky-700 rounded-lg p-0.5 flex items-center shadow-lg border border-sky-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Add necessary styles for animations */}
      <style jsx>{`
        @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      {/* Shine effect on hover, consistent with CoinDisplay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      
      {/* Energy Icon */}
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-27_08-51-26-493.png"
          alt="Energy Orb Icon"
          className="w-4 h-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = energyIconPlaceholderUrl;
          }}
        />
      </div>
      
      {/* Energy Text: current / max */}
      <div className="flex items-baseline font-bold text-cyan-100 text-xs tracking-wide px-1">
        <span>{currentEnergy.toLocaleString()}</span>
        <span className="text-sky-300/80 text-[10px]">/{maxEnergy.toLocaleString()}</span>
      </div>

      {/* Plus button for Energy - consistent styling */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-cyan-400 to-sky-600 rounded-full flex items-center justify-center cursor-pointer border border-sky-300 shadow-inner hover:shadow-cyan-300/50 hover:scale-110 transition-all duration-200">
        <span className="text-white font-bold text-xs">+</span>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default EnergyDisplay;
