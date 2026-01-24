// --- START OF FILE energy-display.tsx ---

import React, { useMemo } from 'react';
import { bossBattleAssets } from '../../game-assets.ts';
import { useGame } from '../../GameContext.tsx'; // Import Context để lấy thời gian

// Define the props for the EnergyDisplay component
interface EnergyDisplayProps {
  currentEnergy: number; // The current amount of energy
  maxEnergy: number; // The maximum amount of energy
  isStatsFullscreen: boolean; // Flag to hide/show the display
}

// Placeholder URL for when the main icon fails to load
const energyIconPlaceholderUrl = "https://placehold.co/16x16/8b5cf6/ffffff?text=E"; // Placeholder màu tím

// EnergyDisplay component - Dark/Purple Theme
const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ currentEnergy, maxEnergy, isStatsFullscreen }) => {
  // Lấy thời gian đếm ngược từ Global Context
  const { timeUntilNextEnergy } = useGame();

  // Format giây thành dạng MM:SS
  const timerText = useMemo(() => {
    // Nếu năng lượng đầy, không hiện timer
    if (currentEnergy >= maxEnergy) return null;
    
    const m = Math.floor(timeUntilNextEnergy / 60);
    const s = Math.floor(timeUntilNextEnergy % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [timeUntilNextEnergy, currentEnergy, maxEnergy]);

  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Bọc trong div relative để chứa cả Thanh năng lượng và Timer Badge
    <div className="relative flex flex-col items-center">
        
        {/* --- START: GIAO DIỆN CŨ (GIỮ NGUYÊN) --- */}
        {/* Energy Container: Gradient tím đậm đến đen, viền tím sáng hơn. */}
        <div className="bg-gradient-to-br from-purple-800 to-slate-900 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-500/80 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
        <style jsx>{`
            @keyframes pulse-fast {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .animate-pulse-fast {
                animation: pulse-fast 1.5s infinite;
            }
        `}</style>
        
        {/* Hiệu ứng tỏa sáng khi hover, đặt ở lớp sau (z-0) để không che nội dung */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 z-0"></div>
        
        {/* Container cho nội dung, đặt ở lớp trên (z-10) để nổi lên trên hiệu ứng tỏa sáng */}
        <div className="relative z-10 flex items-center">
            {/* Energy Icon */}
            <div className="relative mr-1 flex items-center justify-center">
            <img
                src={bossBattleAssets.energyIcon}
                alt="Energy Orb Icon"
                className="w-4 h-4"
                onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = energyIconPlaceholderUrl;
                }}
            />
            </div>
            
            {/* Energy Text: Văn bản màu tím nhạt dễ đọc */}
            <div className="flex items-baseline font-bold text-purple-200 text-xs tracking-wide pr-1">
            <span>{currentEnergy.toLocaleString()}</span>
            <span className="text-purple-400/80 text-[10px] font-semibold">/{maxEnergy.toLocaleString()}</span>
            </div>

            {/* Nút Plus - Đồng bộ với theme mới */}
            <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-full flex items-center justify-center cursor-pointer border border-purple-400 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200">
            <span className="text-white font-bold text-xs">+</span>
            </div>
        </div>

        {/* Chi tiết trang trí: Chỉ giữ lại chấm nháy bên trái */}
        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div>
        </div>
        {/* --- END: GIAO DIỆN CŨ --- */}

        {/* --- START: PHẦN TIMER MỚI (Hiện bên dưới) --- */}
        {timerText && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-black/80 text-yellow-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-slate-600 shadow-sm flex items-center gap-1 whitespace-nowrap leading-none">
                    <svg className="w-2 h-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timerText}
                </div>
            </div>
        )}
        {/* --- END: PHẦN TIMER MỚI --- */}

    </div>
  );
};

export default EnergyDisplay;
