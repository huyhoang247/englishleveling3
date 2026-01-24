// --- START OF FILE energy-display.tsx ---

import React, { useMemo } from 'react';
import { useGame } from '../../GameContext.tsx'; // Import Context để lấy timeUntilNextEnergy
import { bossBattleAssets } from '../../game-assets.ts';

// Define the props for the EnergyDisplay component
interface EnergyDisplayProps {
  currentEnergy: number; // The current amount of energy
  maxEnergy: number; // The maximum amount of energy
  isStatsFullscreen: boolean; // Flag to hide/show the display
}

// Placeholder URL for when the main icon fails to load
const energyIconPlaceholderUrl = "https://placehold.co/16x16/8b5cf6/ffffff?text=E";

// EnergyDisplay component - Dark/Purple Theme with Real-time Timer
const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ currentEnergy, maxEnergy, isStatsFullscreen }) => {
  // Lấy thời gian đếm ngược từ Global Context
  const { timeUntilNextEnergy } = useGame(); 

  // Format giây thành dạng MM:SS (Ví dụ: 04:59)
  const timerText = useMemo(() => {
    // Nếu đầy năng lượng, không cần hiện giờ
    if (currentEnergy >= maxEnergy) return "FULL";
    
    const m = Math.floor(timeUntilNextEnergy / 60);
    const s = Math.floor(timeUntilNextEnergy % 60);
    
    // Thêm số 0 đằng trước nếu giây < 10
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [timeUntilNextEnergy, currentEnergy, maxEnergy]);

  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  // Tính phần trăm để hiển thị thanh Progress Bar
  const progressPercent = Math.min(100, Math.max(0, (currentEnergy / maxEnergy) * 100));

  return (
    <div className="relative group flex flex-col items-center">
      
      {/* Container chính của thanh năng lượng */}
      {/* Sử dụng overflow-hidden để bo tròn thanh progress bar bên trong */}
      <div className="bg-slate-900/95 rounded-full px-2 py-1 flex items-center gap-2 border border-slate-600 shadow-lg relative overflow-hidden min-w-[95px] h-9 cursor-pointer transition-transform active:scale-95 hover:border-purple-400">
        
        {/* Progress Bar Background (Fill màu tím gradient) */}
        {/* Absolute positioning để nằm dưới text */}
        <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 transition-all duration-500 ease-out opacity-80"
            style={{ width: `${progressPercent}%` }}
        />
        
        {/* Hiệu ứng bóng sáng chạy qua (Shimmer effect) khi hover */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <style jsx>{`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
        `}</style>

        {/* Nút Plus (Trang trí - Visual cue để nạp năng lượng) */}
        <div className="absolute right-1 w-6 h-6 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform border border-purple-300 shadow-sm z-20 group-hover:shadow-purple-500/50">
             <span className="text-white font-bold text-xs leading-none pb-0.5">+</span>
        </div>

        {/* Layer chứa Icon và Text (z-10 để nổi lên trên thanh bar) */}
        <div className="flex items-center gap-1.5 relative z-10 pr-6 pl-1"> 
            {/* Energy Icon */}
            <div className="relative">
                <img
                    src={bossBattleAssets.energyIcon}
                    alt="Energy"
                    className={`w-5 h-5 object-contain filter drop-shadow-md ${currentEnergy < 10 ? 'animate-pulse' : ''}`}
                    onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = energyIconPlaceholderUrl; 
                    }}
                />
            </div>
            
            {/* Text Value */}
            <div className="flex flex-col items-start justify-center h-full select-none">
                <div className="flex items-baseline leading-none">
                    <span className={`font-lilita text-base tracking-wide ${currentEnergy < 10 ? 'text-red-300' : 'text-white'} drop-shadow-sm`}>
                        {currentEnergy}
                    </span>
                    <span className="text-[10px] text-slate-300 font-sans font-bold ml-0.5 opacity-80">
                        /{maxEnergy}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* TIMER BADGE (Hiển thị bên dưới thanh năng lượng) */}
      {/* Chỉ hiện khi năng lượng chưa đầy */}
      {currentEnergy < maxEnergy && (
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-black/80 backdrop-blur-sm text-yellow-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-slate-600 shadow-md flex items-center gap-1 whitespace-nowrap">
                  {/* Small Clock Icon SVG */}
                  <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{timerText}</span>
              </div>
          </div>
      )}
      
      {/* Keyframes cho animation xuất hiện */}
      <style jsx>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -5px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

    </div>
  );
};

export default EnergyDisplay;

// --- END OF FILE energy-display.tsx ---
