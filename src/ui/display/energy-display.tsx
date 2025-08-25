import React from 'react';

// Define the props for the EnergyDisplay component
interface EnergyDisplayProps {
  currentEnergy: number; // The current amount of energy
  maxEnergy: number; // The maximum amount of energy
  isStatsFullscreen: boolean; // Flag to hide/show the display
}

// Placeholder URL for when the main icon fails to load
const energyIconPlaceholderUrl = "https://placehold.co/16x16/00ffff/000000?text=E";

// EnergyDisplay component - Sleek Dark/Cyan Theme
const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ currentEnergy, maxEnergy, isStatsFullscreen }) => {
  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Container: Nền gradient xanh đậm-đen, viền cyan sáng.
    <div className="bg-gradient-to-br from-sky-800 to-slate-900 rounded-lg p-0.5 flex items-center shadow-lg border border-cyan-500/70 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      <style jsx>{`
        @keyframes pulse-subtle {
            0%, 100% { box-shadow: 0 0 3px rgba(34, 211, 238, 0.5); }
            50% { box-shadow: 0 0 6px rgba(34, 211, 238, 0.8); }
        }
        .animate-pulse-subtle {
            animation: pulse-subtle 2s infinite;
        }
      `}</style>
      
      {/* Hiệu ứng tỏa sáng khi hover, màu cyan. */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      
      {/* Energy Icon: Giữ màu xanh gốc và thêm hiệu ứng phát sáng nhẹ. */}
      <div className="relative mr-1 flex items-center justify-center">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-27_08-51-26-493.png"
          alt="Energy Orb Icon"
          className="w-4 h-4 drop-shadow-[0_0_3px_rgba(34,211,238,0.7)]" // Sử dụng drop-shadow
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = energyIconPlaceholderUrl;
          }}
        />
      </div>
      
      {/* Energy Text: Giữ màu xanh cyan đặc trưng. */}
      <div className="flex items-baseline font-bold text-cyan-200 text-xs tracking-wide pr-1">
        <span>{currentEnergy.toLocaleString()}</span>
        <span className="text-cyan-400/80 text-[10px] font-semibold">/{maxEnergy.toLocaleString()}</span>
      </div>

      {/* Nút Plus: Đồng bộ với theme xanh/đen. */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-cyan-600 to-sky-800 rounded-full flex items-center justify-center cursor-pointer border border-cyan-400 shadow-inner hover:shadow-cyan-300/50 hover:scale-110 transition-all duration-200">
        <span className="text-white font-bold text-xs">+</span>
      </div>

      {/* Chỉ một chấm nháy tinh tế ở bên trái. */}
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse-subtle"></div>
    </div>
  );
};

export default EnergyDisplay;
