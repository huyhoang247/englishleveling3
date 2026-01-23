// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { CombatStats } from './tower-context.tsx';
import { characterAssets } from '../../game-assets.ts';

// --- TYPES ---
export type ActionState = 'idle' | 'attack' | 'hit' | 'dying' | 'appearing';

// --- 0. ANIMATION STYLES (PURE CSS TRANSFORMS) ---
const AnimationStyles = memo(() => (
    <style>{`
        /* --- Breathing (Idle - Hiệu ứng thở nhẹ) --- */
        @keyframes breathe-hero {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes breathe-boss {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.03) translateY(-4px); }
        }
        
        /* --- Floating (Hover - Hiệu ứng trôi nhẹ cho Boss) --- */
        @keyframes float-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        /* --- Hit/Shake (Hiệu ứng bị đánh) --- */
        @keyframes shake-hit {
            0%, 100% { transform: translateX(0); filter: brightness(1) sepia(0) hue-rotate(0deg) saturate(1); }
            10%, 90% { transform: translateX(-6px); }
            20%, 80% { transform: translateX(6px); }
            30%, 50%, 70% { 
                transform: translateX(-6px); 
                filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3); 
            }
            40%, 60% { transform: translateX(6px); }
        }

        /* --- Attack (Lunge - Hiệu ứng lao tới tấn công) --- */
        /* Hero lao sang phải */
        @keyframes lunge-right {
            0% { transform: translateX(0) scale(1) rotate(0); }
            20% { transform: translateX(-20px) scale(0.95) rotate(-5deg); } 
            50% { transform: translateX(60px) scale(1.1) rotate(2deg); }   
            100% { transform: translateX(0) scale(1) rotate(0); }       
        }
        /* Boss lao sang trái */
        @keyframes lunge-left {
            0% { transform: translateX(0) scale(1) rotate(0); }
            20% { transform: translateX(20px) scale(0.95) rotate(5deg); }  
            50% { transform: translateX(-60px) scale(1.1) rotate(-2deg); }  
            100% { transform: translateX(0) scale(1) rotate(0); }       
        }

        /* --- Death / Appear (Hiệu ứng Chết và Xuất hiện) --- */
        @keyframes boss-die {
            0% { transform: scale(1) rotate(0deg); opacity: 1; filter: grayscale(0); }
            20% { transform: scale(1.1) rotate(5deg); opacity: 1; filter: brightness(2); } 
            100% { transform: scale(0) rotate(-45deg); opacity: 0; filter: grayscale(1); }
        }
        @keyframes boss-appear {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }

        /* --- CLASSES MAPPING --- */
        .animate-breathe-hero { animation: breathe-hero 4s ease-in-out infinite; }
        .animate-breathe-boss { animation: breathe-boss 5s ease-in-out infinite; }
        .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
        
        .animate-char-hit { animation: shake-hit 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-char-attack-right { animation: lunge-right 0.5s ease-in-out; }
        .animate-char-attack-left { animation: lunge-left 0.5s ease-in-out; }
        
        .render-optimize {
            /* Tối ưu render, giữ ảnh sắc nét */
            -webkit-font-smoothing: antialiased;
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: transform;
        }
    `}</style>
));

// --- 1. HEALTH BAR COMPONENT ---
export const HealthBar = memo(({ 
    current, 
    max, 
    colorGradient, 
    shadowColor, 
    heightClass = "h-5 md:h-6",
    textSizeClass = "text-xs md:text-sm", // Default text size
    isHidden = false 
}: { 
    current: number, 
    max: number, 
    colorGradient: string, 
    shadowColor: string,
    heightClass?: string,
    textSizeClass?: string,
    isHidden?: boolean
}) => {
    const scale = Math.max(0, current / max);
    return (
        <div className={`w-full transition-all duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`relative w-full ${heightClass} bg-black/60 rounded-lg border border-slate-600 p-0.5 shadow-inner overflow-hidden`}>
                {/* Thanh máu chính */}
                <div
                    className={`h-full rounded-md transition-transform duration-300 ease-out origin-left ${colorGradient}`}
                    style={{
                        transform: `scaleX(${scale})`,
                        boxShadow: `0 0 10px ${shadowColor}`
                    }}>
                </div>
                {/* Text hiển thị số máu - Chỉ hiện Current HP */}
                <div className={`absolute inset-0 flex justify-center items-center ${textSizeClass} text-white text-shadow font-bold z-10 font-lilita tracking-wider`}>
                    <span>{Math.ceil(current)}</span>
                </div>
            </div>
        </div>
    );
});

// --- 2. HERO DISPLAY COMPONENT (STATIC WEBP) ---
interface HeroDisplayProps {
    stats: CombatStats;
    onStatsClick: () => void;
    actionState?: ActionState; 
}

export const HeroDisplay = memo(({ stats, onStatsClick, actionState = 'idle' }: HeroDisplayProps) => {
    let animClass = 'animate-breathe-hero'; 
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-right';

    return (
        <div className="flex flex-col items-center justify-end h-full w-full relative">
            <AnimationStyles />
            
            <div 
                className="relative cursor-pointer group flex flex-col items-center -translate-x-4 md:-translate-x-10"
                onClick={onStatsClick}
            >
                {/* HP Bar - Chữ nhỏ hơn cho Hero */}
                <div className="w-32 md:w-48 z-20 -translate-y-2 md:-translate-y-4 translate-x-2 transition-transform duration-200 group-hover:scale-105">
                     <HealthBar 
                        current={stats.hp} 
                        max={stats.maxHp} 
                        colorGradient="bg-gradient-to-r from-green-500 to-lime-400" 
                        shadowColor="rgba(132, 204, 22, 0.5)"
                        textSizeClass="text-[10px] md:text-xs" // Size chữ nhỏ hơn
                    />
                </div>

                {/* HERO IMAGE (STATIC WEBP) */}
                <div className={`z-10 render-optimize ${animClass}`}>
                    <img 
                        src={characterAssets.heroStatic} 
                        alt="Hero" 
                        className="w-[140px] md:w-[180px] h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* Bóng dưới chân */}
                <div className="absolute bottom-[2%] w-[80px] h-[15px] bg-black/40 blur-md rounded-[100%] z-0 animate-breathe-hero opacity-80"></div>

            </div>
        </div>
    )
});


// --- 3. BOSS DISPLAY COMPONENT (STATIC WEBP) ---
interface BossDisplayProps {
    bossId: number;
    name: string;
    element: ElementKey;
    hp: number;
    maxHp: number;
    imgSrc: string;
    onImgError: () => void;
    onStatsClick: () => void;
    actionState?: ActionState;
}

export const BossDisplay = memo(({
    bossId,
    name,
    element,
    hp,
    maxHp,
    imgSrc,
    onImgError,
    onStatsClick,
    actionState = 'idle'
}: BossDisplayProps) => {
    
    // Animation Wrapper (Chết, Xuất hiện, Bay)
    let wrapperAnimClass = 'animate-float-gentle'; 
    if (actionState === 'dying') wrapperAnimClass = 'animate-boss-die';
    if (actionState === 'appearing') wrapperAnimClass = 'animate-boss-appear';

    // Animation Image (Đánh, Bị đánh, Thở)
    let imageAnimClass = 'animate-breathe-boss';
    if (actionState === 'hit') imageAnimClass = 'animate-char-hit';
    if (actionState === 'attack') imageAnimClass = 'animate-char-attack-left';

    return (
        <div className="w-full flex flex-col items-center justify-end h-full">
            <AnimationStyles />

            <div 
                className={`relative bg-transparent flex flex-col items-center gap-0 cursor-pointer group z-10 ${wrapperAnimClass}`} 
                onClick={actionState !== 'dying' ? onStatsClick : undefined}
            >
                {/* Bóng dưới chân */}
                <div className="absolute bottom-[2%] w-[120px] h-[25px] bg-black/40 blur-lg rounded-[100%] z-0"></div>

                {/* Vòng tròn ma pháp */}
                <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-0 opacity-60 pointer-events-none scale-75 md:scale-100">
                    <MagicCircle elementKey={element} />
                </div>

                {/* Boss Container */}
                <div className="flex flex-col items-center">
                    
                    {/* HP Bar */}
                    <div className="w-40 md:w-60 z-20 mb-2 md:mb-4 transition-transform duration-200 group-hover:scale-105">
                        <HealthBar 
                            current={hp} 
                            max={maxHp} 
                            colorGradient="bg-gradient-to-r from-blue-700 to-sky-400" 
                            shadowColor="rgba(56, 189, 248, 0.5)" 
                            heightClass="h-6 md:h-8"
                            isHidden={actionState === 'dying'}
                        />
                    </div>

                    {/* BOSS IMAGE (STATIC WEBP) */}
                    <div className={`relative flex items-end justify-center z-10 render-optimize ${imageAnimClass}`}>
                        <img 
                            src={imgSrc} 
                            alt={name} 
                            onError={onImgError}
                            className="w-auto h-[160px] md:h-[240px] max-w-[280px] object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
                        />
                    </div>
                </div>
                
            </div>
        </div>
    );
});

export default BossDisplay;
