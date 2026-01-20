// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { CombatStats } from './tower-context.tsx';

// --- TYPES ---
export type ActionState = 'idle' | 'attack' | 'hit' | 'dying' | 'appearing';

// --- 0. ANIMATION STYLES & CONFIG ---
// Component này chứa CSS Keyframes cho toàn bộ hiệu ứng nhân vật và Boss
const CharacterAnimations = () => (
    <style>{`
        /* Rung lắc + Chớp sáng khi bị đánh (Hit Reaction) */
        @keyframes shake-hit {
            0%, 100% { transform: translateX(0); filter: brightness(1) sepia(0) hue-rotate(0deg) saturate(1); }
            10%, 90% { transform: translateX(-5px); }
            20%, 80% { transform: translateX(5px); }
            30%, 50%, 70% { 
                transform: translateX(-5px); 
                /* Hiệu ứng Flash: Sáng rực + hơi đỏ/cam */
                filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3); 
            }
            40%, 60% { transform: translateX(5px); }
        }
        .animate-char-hit { 
            animation: shake-hit 0.5s cubic-bezier(.36,.07,.19,.97) both; 
        }

        /* Player tấn công: Lùi nhẹ lấy đà -> Lướt mạnh sang phải */
        @keyframes lunge-right {
            0% { transform: translateX(0) scale(1); }
            20% { transform: translateX(-20px) scale(0.95); } /* Windup */
            50% { transform: translateX(60px) scale(1.1); }   /* Strike */
            100% { transform: translateX(0) scale(1); }       /* Recovery */
        }
        .animate-char-attack-right { 
            animation: lunge-right 0.5s ease-in-out; 
        }

        /* Boss tấn công: Lùi nhẹ lấy đà -> Lướt mạnh sang trái */
        @keyframes lunge-left {
            0% { transform: translateX(0) scale(1); }
            20% { transform: translateX(20px) scale(0.95); }  /* Windup */
            50% { transform: translateX(-60px) scale(1.1); }  /* Strike */
            100% { transform: translateX(0) scale(1); }       /* Recovery */
        }
        .animate-char-attack-left { 
            animation: lunge-left 0.5s ease-in-out; 
        }

        /* --- BOSS DEATH ANIMATION --- */
        /* Thu nhỏ, xoay nhẹ, mờ dần và chuyển sang trắng đen */
        @keyframes boss-die {
            0% { transform: scale(1) rotate(0deg); opacity: 1; filter: grayscale(0); }
            20% { transform: scale(1.1) rotate(5deg); opacity: 1; filter: brightness(2) contrast(1.2); } /* Flash trước khi chết */
            100% { transform: scale(0) rotate(-45deg); opacity: 0; filter: grayscale(1); }
        }
        .animate-boss-die {
            animation: boss-die 1.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
            pointer-events: none; /* Không cho click khi đang chết */
        }

        /* --- BOSS APPEAR ANIMATION --- */
        /* Zoom từ 0 ra, nảy nhẹ (elastic effect) */
        @keyframes boss-appear {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-boss-appear {
            animation: boss-appear 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
    `}</style>
);

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

    // Chọn class animation dựa trên actionState
    let animClass = '';
    if (actionState === 'hit') animClass = 'animate-char-hit';
    if (actionState === 'attack') animClass = 'animate-char-attack-right';

    return (
        <div className="flex flex-col items-center justify-end h-full w-full relative">
             <CharacterAnimations />
             <style>{`
                .hero-sprite-wrapper {
                    /* 
                       Frame Size Grid 6x6 updated for 939x883 sheet 
                       Width: 939 / 6 = 156.5px
                       Height: 883 / 6 = 147.16px (approx 147.2px)
                    */
                    width: 156.5px;
                    height: 147.2px;
                    overflow: hidden;
                    position: relative;
                    
                    /* Scale 0.85 for Desktop */
                    transform: scale(0.85); 
                    transform-origin: bottom center;

                    /* Tối ưu render pixel art */
                    image-rendering: pixelated;
                    image-rendering: -webkit-optimize-contrast;
                }
                
                .hero-sprite-sheet {
                    width: 156.5px;
                    height: 147.2px;
                    background-image: url('${spriteUrl}');
                    background-size: 939px 883px;
                    background-repeat: no-repeat;
                    
                    animation: 
                        hero-idle-x 0.5s steps(6) infinite,
                        hero-idle-y 3.0s steps(6) infinite;
                }

                @keyframes hero-idle-x {
                    from { background-position-x: 0px; }
                    to { background-position-x: -939px; }
                }

                @keyframes hero-idle-y {
                    from { background-position-y: 0px; }
                    to { background-position-y: -883px; }
                }

                @media (max-width: 768px) {
                    .hero-sprite-wrapper {
                        /* Scale 1 cho điện thoại */
                        transform: scale(1); 
                    }
                }
            `}</style>
            
            {/* Container định vị vị trí đứng */}
            <div 
                className="relative cursor-pointer group flex flex-col items-center -translate-x-4 md:-translate-x-10"
                onClick={onStatsClick}
            >
                {/* WRAPPER ANIMATION */}
                <div className={animClass}>
                    
                    {/* HP Bar */}
                    <div className="w-32 md:w-48 z-20 translate-y-0 md:translate-y-8 translate-x-2 transition-transform duration-200 group-hover:scale-105">
                         <HealthBar 
                            current={stats.hp} 
                            max={stats.maxHp} 
                            colorGradient="bg-gradient-to-r from-green-500 to-lime-400" 
                            shadowColor="rgba(132, 204, 22, 0.5)"
                        />
                    </div>

                    {/* Sprite */}
                    <div className="hero-sprite-wrapper z-10">
                        <div className="hero-sprite-sheet"></div>
                    </div>
                </div>

                {/* Shadow */}
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

    // Xử lý Animation Logic
    // 1. Animation cho toàn bộ khối (bao gồm cả vòng tròn ma pháp)
    let wrapperAnimClass = ''; 
    if (actionState === 'dying') wrapperAnimClass = 'animate-boss-die';
    if (actionState === 'appearing') wrapperAnimClass = 'animate-boss-appear';

    // 2. Animation riêng cho Sprite (khi đánh nhau, chỉ sprite di chuyển, vòng tròn đứng yên)
    let spriteAnimClass = '';
    if (actionState === 'hit') spriteAnimClass = 'animate-char-hit';
    if (actionState === 'attack') spriteAnimClass = 'animate-char-attack-left';

    return (
        <div className="w-full flex flex-col items-center justify-end h-full">
            <style>{`
                .boss-render-optimize {
                    image-rendering: -webkit-optimize-contrast;
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

                /* --- DEFAULT BOSS --- */
                .boss-size-default { width: 469px; height: 486px; transform: scale(0.5); }
                .boss-anim-default {
                    width: 2814px; height: 2916px; background-size: 2814px 2916px;
                    animation: boss-x-def 0.4s steps(6) infinite, boss-y-def 2.4s steps(6) infinite;
                }
                @keyframes boss-x-def { from { background-position-x: 0; } to { background-position-x: -2814px; } }
                @keyframes boss-y-def { from { background-position-y: 0; } to { background-position-y: -2916px; } }

                /* --- BOSS 01 --- */
                .boss-size-01 { width: 165.33px; height: 165.66px; transform: scale(1); }
                .boss-anim-01 { 
                    width: 992px; height: 994px; background-size: 992px 994px; 
                    animation: boss-x-01 0.5s steps(6) infinite, boss-y-01 3s steps(6) infinite; 
                }
                @keyframes boss-x-01 { from { background-position-x: 0; } to { background-position-x: -992px; } }
                @keyframes boss-y-01 { from { background-position-y: 0; } to { background-position-y: -994px; } }

                /* --- BOSS 03 --- */
                .boss-size-03 { width: 513px; height: 399px; transform: scale(0.55); }
                .boss-anim-03 { width: 3078px; height: 2394px; background-size: 3078px 2394px; animation: boss-x-03 0.6s steps(6) infinite, boss-y-03 3.6s steps(6) infinite; }
                @keyframes boss-x-03 { from { background-position-x: 0; } to { background-position-x: -3078px; } }
                @keyframes boss-y-03 { from { background-position-y: 0; } to { background-position-y: -2394px; } }

                /* --- BOSS 04 --- */
                .boss-size-04 { width: 300.5px; height: 332px; transform: scale(0.9); }
                .boss-anim-04 { width: 1803px; height: 1992px; background-size: 1803px 1992px; animation: boss-x-04 0.6s steps(6) infinite, boss-y-04 3.6s steps(6) infinite; }
                @keyframes boss-x-04 { from { background-position-x: 0; } to { background-position-x: -1803px; } }
                @keyframes boss-y-04 { from { background-position-y: 0; } to { background-position-y: -1992px; } }

                /* --- BOSS 06 & 50 --- */
                .boss-size-06 { width: 186.17px; height: 161px; transform: scale(1.1); }
                .boss-anim-06 { 
                    width: 1117px; height: 966px; background-size: 1117px 966px; 
                    animation: boss-x-06 0.6s steps(6) infinite, boss-y-06 3.6s steps(6) infinite; 
                }
                @keyframes boss-x-06 { from { background-position-x: 0; } to { background-position-x: -1117px; } }
                @keyframes boss-y-06 { from { background-position-y: 0; } to { background-position-y: -966px; } }

                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .boss-size-default { transform: scale(0.35); }
                    .boss-size-01 { transform: scale(0.8); }
                    .boss-size-03 { transform: scale(0.35); }
                    .boss-size-04 { transform: scale(0.6); }
                    .boss-size-06 { transform: scale(1); }
                }
            `}</style>

            {/* Container định vị chính */}
            {/* Áp dụng wrapperAnimClass vào đây để CẢ vòng tròn ma pháp và Boss cùng thu nhỏ/biến mất */}
            <div 
                className={`relative bg-transparent flex flex-col items-center gap-0 cursor-pointer group z-10 ${wrapperAnimClass}`} 
                onClick={actionState !== 'dying' ? onStatsClick : undefined}
            >
                {/* Visual Anchor/Shadow at feet - Bóng đổ, giữ ở ngoài để không bị rotate theo boss khi chết */}
                <div className="absolute bottom-[2%] w-[120px] h-[30px] bg-black/40 blur-md rounded-[100%] z-0"></div>

                {/* Magic Circle - Sẽ bị ảnh hưởng bởi wrapperAnimClass (thu nhỏ cùng boss) */}
                <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-0 opacity-60 pointer-events-none scale-75 md:scale-100">
                    <MagicCircle elementKey={element} />
                </div>

                {/* WRAPPER SPRITE: Chỉ animation rung lắc/tấn công ở đây để không ảnh hưởng Magic Circle */}
                <div className={spriteAnimClass}>
                    
                    {/* HP Bar Boss - Ẩn khi đang chết */}
                    <div className="w-40 md:w-60 z-20 mb-6 md:mb-10 transition-transform duration-200 group-hover:scale-105">
                        <HealthBar 
                            current={hp} 
                            max={maxHp} 
                            colorGradient="bg-gradient-to-r from-blue-700 to-sky-400" 
                            shadowColor="rgba(56, 189, 248, 0.5)" 
                            heightClass="h-6 md:h-8"
                            isHidden={actionState === 'dying'}
                        />
                    </div>

                    {/* Sprite Render */}
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
