// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { CombatStats } from './tower-context.tsx';

// --- TYPES ---
export type ActionState = 'idle' | 'attack' | 'hit' | 'dying';

// --- 0. ANIMATION STYLES & CONFIG ---
const CharacterAnimations = () => (
    <style>{`
        /* Rung lắc + Chớp sáng khi bị đánh (Hit Reaction) */
        @keyframes shake-hit {
            0%, 100% { transform: translateX(0); filter: brightness(1) sepia(0) hue-rotate(0deg) saturate(1); }
            10%, 90% { transform: translateX(-5px); }
            20%, 80% { transform: translateX(5px); }
            30%, 50%, 70% { 
                transform: translateX(-5px); 
                filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3); 
            }
            40%, 60% { transform: translateX(5px); }
        }
        .animate-char-hit { 
            animation: shake-hit 0.5s cubic-bezier(.36,.07,.19,.97) both; 
        }

        /* Player tấn công */
        @keyframes lunge-right {
            0% { transform: translateX(0) scale(1); }
            20% { transform: translateX(-20px) scale(0.95); }
            50% { transform: translateX(60px) scale(1.1); }
            100% { transform: translateX(0) scale(1); }
        }
        .animate-char-attack-right { 
            animation: lunge-right 0.5s ease-in-out; 
        }

        /* Boss tấn công */
        @keyframes lunge-left {
            0% { transform: translateX(0) scale(1); }
            20% { transform: translateX(20px) scale(0.95); }
            50% { transform: translateX(-60px) scale(1.1); }
            100% { transform: translateX(0) scale(1); }
        }
        .animate-char-attack-left { 
            animation: lunge-left 0.5s ease-in-out; 
        }
    `}</style>
);

// --- 1. HEALTH BAR COMPONENT ---
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

// --- 2. HERO DISPLAY COMPONENT ---
interface HeroDisplayProps {
    stats: CombatStats;
    onStatsClick: () => void;
    actionState?: ActionState;
}

export const HeroDisplay = memo(({ stats, onStatsClick, actionState = 'idle' }: HeroDisplayProps) => {
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/hero.webp";

    let animClass = '';
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-right';

    return (
        <div className="flex flex-col items-center justify-end h-full w-full relative">
             <CharacterAnimations />
             <style>{`
                .hero-sprite-wrapper {
                    /* Frame Size Grid 6x6 */
                    width: 209px;
                    height: 196px;
                    overflow: hidden;
                    position: relative;
                    
                    /* Desktop Scale */
                    transform: scale(0.85); 
                    transform-origin: bottom center;

                    /* Tối ưu render pixel art: Pixelated giúp scale 0.5 cực nét */
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                }
                
                .hero-sprite-sheet {
                    width: 209px;
                    height: 196px;
                    background-image: url('${spriteUrl}');
                    background-size: 1252px 1178px;
                    background-repeat: no-repeat;
                    
                    animation: 
                        hero-idle-x 0.5s steps(6) infinite,
                        hero-idle-y 3.0s steps(6) infinite;
                }

                @keyframes hero-idle-x {
                    from { background-position-x: 0px; }
                    to { background-position-x: -1252px; }
                }

                @keyframes hero-idle-y {
                    from { background-position-y: 0px; }
                    to { background-position-y: -1178px; }
                }

                /* --- MOBILE CONFIG: SCALE 0.5 --- */
                @media (max-width: 768px) {
                    .hero-sprite-wrapper {
                        transform: scale(0.5); /* Scale chuẩn để nét trên mobile */
                    }
                }
            `}</style>
            
            <div 
                className="relative cursor-pointer group flex flex-col items-center -translate-x-4 md:-translate-x-10"
                onClick={onStatsClick}
            >
                <div className={animClass}>
                    <div className="w-32 md:w-48 z-20 translate-y-16 md:translate-y-24 translate-x-6 transition-transform duration-200 group-hover:scale-105">
                         <HealthBar 
                            current={stats.hp} 
                            max={stats.maxHp} 
                            colorGradient="bg-gradient-to-r from-green-500 to-lime-400" 
                            shadowColor="rgba(132, 204, 22, 0.5)"
                        />
                    </div>

                    <div className="hero-sprite-wrapper z-10">
                        <div className="hero-sprite-sheet"></div>
                    </div>
                </div>

                <div className="absolute bottom-[2%] w-[80px] h-[20px] bg-black/40 blur-md rounded-[100%] z-0"></div>
            </div>
        </div>
    )
});


// --- 3. BOSS SPRITE ANIMATION HELPER ---
const BossSprite = memo(({ bossId }: { bossId: number }) => {
    const idStr = String(bossId).padStart(2, '0');
    const spritePath = `/images/boss/${idStr}.webp`;

    let sizeClass = 'boss-size-default';
    let animClass = 'boss-anim-default';

    if (bossId === 1) {
        sizeClass = 'boss-size-01';
        animClass = 'boss-anim-01';
    } else if (bossId === 3) {
        sizeClass = 'boss-size-03';
        animClass = 'boss-anim-03';
    } else if (bossId === 4) {
        sizeClass = 'boss-size-04';
        animClass = 'boss-anim-04';
    } else if (bossId === 6 || bossId === 50) {
        sizeClass = 'boss-size-06';
        animClass = 'boss-anim-06';
    }

    return (
        <div className="boss-sprite-wrapper">
            <div className={`boss-sprite-container boss-render-optimize ${sizeClass}`}>
                <div
                    className={`boss-sprite-sheet ${animClass}`}
                    style={{ backgroundImage: `url(${spritePath})` }}
                />
            </div>
        </div>
    );
});

// --- 4. BOSS DISPLAY COMPONENT ---
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
    const isSpriteBoss = [1, 3, 4, 6, 8, 50].includes(bossId);

    let animClass = '';
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-left';

    return (
        <div className="w-full flex flex-col items-center justify-end h-full">
            <style>{`
                .boss-render-optimize {
                    /* QUAN TRỌNG: Dùng pixelated để scale 0.5 vẫn nét căng */
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                    transform: translateZ(0);
                }
                .boss-sprite-wrapper {
                    padding-bottom: 8px; 
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    height: 100%;
                }
                .boss-sprite-container {
                    overflow: hidden;
                    position: relative;
                    transform-origin: bottom center;
                }

                /* --- DEFAULT BOSS (Desktop) --- */
                .boss-size-default { width: 469px; height: 486px; transform: scale(0.5); }
                .boss-anim-default {
                    width: 2814px; height: 2916px; background-size: 2814px 2916px;
                    animation: boss-x-def 0.4s steps(6) infinite, boss-y-def 2.4s steps(6) infinite;
                }
                @keyframes boss-x-def { from { background-position-x: 0; } to { background-position-x: -2814px; } }
                @keyframes boss-y-def { from { background-position-y: 0; } to { background-position-y: -2916px; } }

                /* --- BOSS 01 (Desktop) --- */
                .boss-size-01 { width: 220.5px; height: 221px; transform: scale(1); }
                .boss-anim-01 { 
                    width: 1323px; height: 1326px; background-size: 1323px 1326px; 
                    animation: boss-x-01 0.5s steps(6) infinite, boss-y-01 3s steps(6) infinite; 
                }
                @keyframes boss-x-01 { from { background-position-x: 0; } to { background-position-x: -1323px; } }
                @keyframes boss-y-01 { from { background-position-y: 0; } to { background-position-y: -1326px; } }

                /* --- BOSS 03 (Desktop) --- */
                .boss-size-03 { width: 513px; height: 399px; transform: scale(0.55); }
                .boss-anim-03 { width: 3078px; height: 2394px; background-size: 3078px 2394px; animation: boss-x-03 0.6s steps(6) infinite, boss-y-03 3.6s steps(6) infinite; }
                @keyframes boss-x-03 { from { background-position-x: 0; } to { background-position-x: -3078px; } }
                @keyframes boss-y-03 { from { background-position-y: 0; } to { background-position-y: -2394px; } }

                /* --- BOSS 04 (Desktop) --- */
                .boss-size-04 { width: 300.5px; height: 332px; transform: scale(0.9); }
                .boss-anim-04 { width: 1803px; height: 1992px; background-size: 1803px 1992px; animation: boss-x-04 0.6s steps(6) infinite, boss-y-04 3.6s steps(6) infinite; }
                @keyframes boss-x-04 { from { background-position-x: 0; } to { background-position-x: -1803px; } }
                @keyframes boss-y-04 { from { background-position-y: 0; } to { background-position-y: -1992px; } }

                /* --- BOSS 06 (Desktop) --- */
                .boss-size-06 { width: 266px; height: 230px; transform: scale(1.1); }
                .boss-anim-06 { width: 1596px; height: 1380px; background-size: 1596px 1380px; animation: boss-x-06 0.6s steps(6) infinite, boss-y-06 3.6s steps(6) infinite; }
                @keyframes boss-x-06 { from { background-position-x: 0; } to { background-position-x: -1596px; } }
                @keyframes boss-y-06 { from { background-position-y: 0; } to { background-position-y: -1380px; } }

                /* --- MOBILE CONFIG: ALL BOSSES SCALE 0.5 --- */
                @media (max-width: 768px) {
                    .boss-size-default { transform: scale(0.5); }
                    .boss-size-01 { transform: scale(0.5); }
                    .boss-size-03 { transform: scale(0.5); }
                    .boss-size-04 { transform: scale(0.5); }
                    .boss-size-06 { transform: scale(0.5); }
                }
            `}</style>

            <div 
                className="relative bg-transparent flex flex-col items-center gap-0 cursor-pointer group z-10" 
                onClick={onStatsClick}
            >
                <div className="absolute bottom-[2%] w-[120px] h-[30px] bg-black/40 blur-md rounded-[100%] z-0"></div>

                <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-0 opacity-60 pointer-events-none scale-75 md:scale-100">
                    <MagicCircle elementKey={element} />
                </div>

                <div className={animClass}>
                    <div className="w-40 md:w-60 z-20 mb-6 md:mb-10 transition-transform duration-200 group-hover:scale-105">
                        <HealthBar 
                            current={hp} 
                            max={maxHp} 
                            colorGradient="bg-gradient-to-r from-blue-700 to-sky-400" 
                            shadowColor="rgba(56, 189, 248, 0.5)" 
                            heightClass="h-6 md:h-8"
                        />
                    </div>

                    <div className="w-40 h-40 md:w-64 md:h-64 relative flex items-end justify-center z-10">
                        {isSpriteBoss ? (
                            <BossSprite bossId={bossId} />
                        ) : (
                            <img 
                                src={imgSrc} 
                                alt={name} 
                                onError={onImgError}
                                className="max-w-full max-h-full object-contain drop-shadow-2xl boss-render-optimize animate-pulse-slow" 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default BossDisplay;
