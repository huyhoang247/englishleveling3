// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';

// --- TYPES ---
// Vẫn cần dùng type này để định nghĩa trạng thái cho Pixi Renderer
export type ActionState = 'idle' | 'attack' | 'hit' | 'dying';

// --- HEALTH BAR COMPONENT ---
// Component này là HTML/CSS thuần, nằm đè lên Canvas nên cần giữ lại
export const HealthBar = memo(({ 
    current, 
    max, 
    colorGradient, 
    shadowColor, 
    heightClass = "h-5 md:h-6" 
}: { 
    current: number, 
    max: number, 
    colorGradient: string, 
    shadowColor: string,
    heightClass?: string 
}) => {
    const scale = Math.max(0, current / max);
    return (
        <div className="w-full transition-all duration-300">
            <div className={`relative w-full ${heightClass} bg-black/60 rounded-lg border border-slate-600 p-0.5 shadow-inner overflow-hidden`}>
                <div
                    className={`h-full rounded-md transition-transform duration-300 ease-out origin-left ${colorGradient}`}
                    style={{
                        transform: `scaleX(${scale})`,
                        boxShadow: `0 0 10px ${shadowColor}`
                    }}>
                </div>
                <div className="absolute inset-0 flex justify-center items-center text-xs md:text-sm text-white text-shadow font-bold z-10">
                    <span>{Math.ceil(current)}</span>
                </div>
            </div>
        </div>
    );
});

// Các component hiển thị cũ (HeroDisplay, BossDisplay) đã bị xóa vì thay thế bằng PixiJS

export default HealthBar;
// --- END OF FILE boss-display.tsx ---
