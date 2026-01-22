// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { CombatStats } from './tower-context.tsx';

// --- TYPES ---
export type ActionState = 'idle' | 'attack' | 'hit' | 'dying' | 'appearing';

// --- STYLES COMPONENTS (OPTIMIZED) ---
const BattleVisualStyles = memo(() => (
    <style>{`
        /* --- SHARED HIT & ATTACK EFFECTS --- */
        @keyframes shake-hit {
            0%, 100% { transform: translateX(0); filter: brightness(1) sepia(0) hue-rotate(0deg) saturate(1); }
            10%, 90% { transform: translateX(-5px); }
            20%, 80% { transform: translateX(5px); }
            30%, 50%, 70% { 
                transform: translateX(-5px); 
                filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(3); 
            }
            40%, 60% { transform: translateX(5px); }
        }
        .animate-char-hit { 
            animation: shake-hit 0.5s cubic-bezier(.36,.07,.19,.97) both; 
        }

        @keyframes lunge-right {
            0% { transform: translateX(0) scale(1); }
            40% { transform: translateX(100px) scale(1.1); }   
            100% { transform: translateX(0) scale(1); }       
        }
        .animate-char-attack-right { 
            animation: lunge-right 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
        }

        @keyframes lunge-left {
            0% { transform: translateX(0) scale(1); }
            40% { transform: translateX(-100px) scale(1.1); }  
            100% { transform: translateX(0) scale(1); }       
        }
        .animate-char-attack-left { 
            animation: lunge-left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
        }

        /* --- HERO IDLE (BREATHING) --- */
        @keyframes hero-breathe {
            0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
            50% { transform: scaleY(1.03) scaleX(0.98) translateY(1px); }
        }
        .animate-hero-idle {
            animation: hero-breathe 2.5s ease-in-out infinite;
            transform-origin: bottom center;
        }

        /* --- BOSS IDLE (FLOATING) --- */
        @keyframes boss-float {
            0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
            50% { transform: translateY(-12px) scale(1.02); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); }
        }
        .animate-boss-idle {
            animation: boss-float 3s ease-in-out infinite;
            will-change: transform;
        }

        /* --- BOSS DEATH & APPEAR --- */
        @keyframes boss-die {
            0% { transform: scale(1) rotate(0deg); opacity: 1; filter: grayscale(0); }
            20% { transform: scale(1.1) rotate(5deg); opacity: 1; filter: brightness(2); } 
            100% { transform: scale(0) rotate(-20deg); opacity: 0; filter: grayscale(1); }
        }
        .animate-boss-die {
            animation: boss-die 1.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
            pointer-events: none; 
        }

        @keyframes boss-appear {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-boss-appear {
            animation: boss-appear 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* --- UTILS --- */
        .render-crisp {
            image-rendering: -webkit-optimize-contrast; 
            /* Optional: pixelated if using pixel art assets */
            /* image-rendering: pixelated; */ 
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
    isHidden = false 
}: { 
    current: number, 
    max: number, 
    colorGradient: string, 
    shadowColor: string,
    heightClass?: string,
    isHidden?: boolean
}) => {
    const scale = Math.max(0, current / max);
    return (
        <div className={`w-full transition-all duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`relative w-full ${heightClass} bg-black/60 rounded-lg border border-slate-600 p-0.5 shadow-inner overflow-hidden`}>
                <div
                    className={`h-full rounded-md transition-transform duration-300 ease-out origin-left ${colorGradient}`}
                    style={{
                        transform: `scaleX(${scale})`,
                        boxShadow: `0 0 10px ${shadowColor}`
                    }}>
                </div>
                <div className="absolute inset-0 flex justify-center items-center text-xs md:text-sm text-white text-shadow font-bold z-10 font-sans tracking-wide">
                    <span>{Math.ceil(current)} / {max}</span>
                </div>
            </div>
        </div>
    );
});

// --- 2. HERO DISPLAY COMPONENT ---
interface HeroDisplayProps {
    stats: CombatStats;
    onStatsClick: () => void;
    actionState?: ActionState; 
    heroImage?: string; // Add prop for image source
}

export const HeroDisplay = memo(({ stats, onStatsClick, actionState = 'idle', heroImage = "/images/hero-static.png" }: HeroDisplayProps) => {
    
    // Logic Animation Class
    let animClass = 'animate-hero-idle'; // Default breathing
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-right';

    return (
        <div className="flex flex-col items-center justify-end h-full w-full relative">
            <BattleVisualStyles />
            
            <div 
                className="relative cursor-pointer group flex flex-col items-center -translate-x-4 md:-translate-x-10 z-20"
                onClick={onStatsClick}
            >
                {/* HP Bar */}
                <div className="w-32 md:w-48 z-30 mb-2 md:translate-y-8 translate-x-2 transition-transform duration-200 group-hover:scale-105">
                     <HealthBar 
                        current={stats.hp} 
                        max={stats.maxHp} 
                        colorGradient="bg-gradient-to-r from-green-500 to-lime-400" 
                        shadowColor="rgba(132, 204, 22, 0.5)"
                    />
                </div>

                {/* Character Wrapper */}
                <div className="relative z-20">
                    <img 
                        src={heroImage}
                        alt="Hero"
                        // Fallback to a placeholder if image fails
                        onError={(e) => {e.currentTarget.src = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/hero.webp'}} 
                        className={`w-[180px] md:w-[240px] h-auto object-contain render-crisp drop-shadow-xl ${animClass}`}
                        style={{ maxHeight: '300px' }}
                    />
                </div>

                {/* Shadow */}
                <div className="absolute -bottom-2 w-[100px] h-[25px] bg-black/50 blur-md rounded-[100%] z-10 transition-transform duration-1000"></div>

            </div>
        </div>
    )
});

// --- 3. BOSS DISPLAY COMPONENT ---
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
    bossId, // kept for potential future use or specific scaling logic
    name,
    element,
    hp,
    maxHp,
    imgSrc,
    onImgError,
    onStatsClick,
    actionState = 'idle'
}: BossDisplayProps) => {

    // Logic Animation Class
    let animClass = 'animate-boss-idle';
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-left';
    
    // Wrapper Animation (Appear/Die affects everything including the wrapper)
    let wrapperAnimClass = ''; 
    if (actionState === 'dying') wrapperAnimClass = 'animate-boss-die';
    if (actionState === 'appearing') wrapperAnimClass = 'animate-boss-appear';

    return (
        <div className="w-full flex flex-col items-center justify-end h-full">
            {/* Styles are included in HeroDisplay already, but safe to include if used standalone, memo prevents dupes */}
            
            <div 
                className={`relative bg-transparent flex flex-col items-center gap-0 cursor-pointer group z-10 ${wrapperAnimClass}`} 
                onClick={actionState !== 'dying' ? onStatsClick : undefined}
            >
                {/* Magic Circle (Static on ground, scales slightly with idle) */}
                <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] z-0 opacity-70 pointer-events-none scale-75 md:scale-110">
                    <MagicCircle elementKey={element} />
                </div>

                {/* Shadow */}
                <div className="absolute bottom-[2%] w-[140px] h-[35px] bg-black/50 blur-lg rounded-[100%] z-0"></div>

                {/* HP Bar */}
                <div className="w-40 md:w-60 z-30 mb-4 transition-transform duration-200 group-hover:scale-105">
                    <HealthBar 
                        current={hp} 
                        max={maxHp} 
                        colorGradient="bg-gradient-to-r from-red-600 to-orange-500" 
                        shadowColor="rgba(239, 68, 68, 0.5)" 
                        heightClass="h-6 md:h-8"
                        isHidden={actionState === 'dying'}
                    />
                </div>

                {/* Boss Image Wrapper */}
                <div className="relative z-20 flex items-end justify-center h-[200px] md:h-[280px] w-[200px] md:w-[280px]">
                    <img 
                        src={imgSrc} 
                        alt={name} 
                        onError={onImgError}
                        className={`max-w-full max-h-full object-contain drop-shadow-2xl render-crisp ${animClass}`} 
                    />
                </div>
                
            </div>
        </div>
    );
});

export default BossDisplay;
