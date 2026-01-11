// --- START OF FILE boss-display.tsx ---

import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { CombatStats } from './tower-context.tsx';

// --- 1. HEALTH BAR COMPONENT (REDESIGNED) ---
export const HealthBar = memo(({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor: string }) => {
    // Tính toán phần trăm máu, giới hạn từ 0% đến 100%
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    
    return (
        <div className="w-full select-none pointer-events-none">
            {/* Khung viền ngoài: Đậm, nổi khối, đổ bóng */}
            <div className="relative w-full h-4 md:h-5 bg-slate-900 rounded-full border-2 border-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden box-border">
                
                {/* Background nền (phần máu đã mất) - texture sọc chéo mờ */}
                <div className="absolute inset-0 bg-slate-800 opacity-50" 
                     style={{ backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 50%, #1e293b 50%, #1e293b 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}>
                </div>

                {/* Thanh máu chính */}
                <div
                    className={`h-full relative transition-all duration-300 ease-out ${colorGradient}`}
                    style={{
                        width: `${percentage}%`,
                        boxShadow: `2px 0 10px ${shadowColor}` // Glow nhẹ ở đầu thanh máu
                    }}
                >
                    {/* Hiệu ứng bóng kính (Glossy effect) - Tạo cảm giác 3D */}
                    <div className="absolute top-0 left-0 right-0 h-[45%] bg-white/30 rounded-t-full"></div>
                    
                    {/* Hiệu ứng tối ở đáy (Depth) */}
                    <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-black/20 rounded-b-full"></div>

                    {/* Hiệu ứng lấp lánh nhẹ (Shine line) chạy dọc */}
                    <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/40 blur-[1px]"></div>
                </div>
            </div>
        </div>
    );
});

// --- 2. HERO DISPLAY COMPONENT ---
export const HeroDisplay = memo(({ stats, onStatsClick }: { stats: CombatStats, onStatsClick: () => void }) => {
    // URL ảnh Hero (Size gốc: 3132x2946 -> Resize: 1252x1178)
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/hero.webp";

    return (
        <div className="flex flex-col items-center justify-end h-full w-full" onClick={onStatsClick}>
             <style>{`
                .hero-sprite-wrapper {
                    /* Frame Size Grid 6x6 */
                    width: 209px;
                    height: 196px;
                    overflow: hidden;
                    position: relative;
                    
                    /* Scale 0.85 để ảnh nhỏ lại và sắc nét */
                    transform: scale(0.85); 
                    transform-origin: bottom center;

                    /* Tối ưu render */
                    image-rendering: -webkit-optimize-contrast;
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

                @media (max-width: 768px) {
                    .hero-sprite-wrapper {
                        transform: scale(0.65); 
                    }
                }
            `}</style>
            
            <div className="relative cursor-pointer group flex flex-col items-center">
                
                {/* 
                    HP Bar Hero
                    Vị trí: Dịch xuống dưới (translate-y dương) để lấp vào khoảng trống trên đầu Sprite
                */}
                <div className="w-32 md:w-48 z-20 translate-y-16 md:translate-y-24 transition-transform duration-200 group-hover:scale-105">
                     <HealthBar 
                        current={stats.hp} 
                        max={stats.maxHp} 
                        // Sử dụng gradient sáng hơn cho Hero (Xanh lá/Cyan)
                        colorGradient="bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300" 
                        shadowColor="rgba(16, 185, 129, 0.6)" 
                    />
                </div>

                {/* Sprite */}
                <div className="hero-sprite-wrapper z-10">
                    <div className="hero-sprite-sheet"></div>
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
}

export const BossDisplay = memo(({
    bossId,
    name,
    element,
    hp,
    maxHp,
    imgSrc,
    onImgError,
    onStatsClick
}: BossDisplayProps) => {
    const isSpriteBoss = [1, 3, 4, 6, 8, 50].includes(bossId);

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

                /* --- BOSS CONFIGURATIONS --- */
                .boss-size-01 { width: 441px; height: 442px; transform: scale(0.6); }
                .boss-anim-01 { width: 2646px; height: 2652px; background-size: 2646px 2652px; animation: boss-x-01 0.5s steps(6) infinite, boss-y-01 3s steps(6) infinite; }
                @keyframes boss-x-01 { from { background-position-x: 0; } to { background-position-x: -2646px; } }
                @keyframes boss-y-01 { from { background-position-y: 0; } to { background-position-y: -2652px; } }

                .boss-size-03 { width: 513px; height: 399px; transform: scale(0.55); }
                .boss-anim-03 { width: 3078px; height: 2394px; background-size: 3078px 2394px; animation: boss-x-03 0.6s steps(6) infinite, boss-y-03 3.6s steps(6) infinite; }
                @keyframes boss-x-03 { from { background-position-x: 0; } to { background-position-x: -3078px; } }
                @keyframes boss-y-03 { from { background-position-y: 0; } to { background-position-y: -2394px; } }

                .boss-size-04 { width: 300.5px; height: 332px; transform: scale(0.9); }
                .boss-anim-04 { width: 1803px; height: 1992px; background-size: 1803px 1992px; animation: boss-x-04 0.6s steps(6) infinite, boss-y-04 3.6s steps(6) infinite; }
                @keyframes boss-x-04 { from { background-position-x: 0; } to { background-position-x: -1803px; } }
                @keyframes boss-y-04 { from { background-position-y: 0; } to { background-position-y: -1992px; } }

                .boss-size-06 { width: 266px; height: 230px; transform: scale(1.1); }
                .boss-anim-06 { width: 1596px; height: 1380px; background-size: 1596px 1380px; animation: boss-x-06 0.6s steps(6) infinite, boss-y-06 3.6s steps(6) infinite; }
                @keyframes boss-x-06 { from { background-position-x: 0; } to { background-position-x: -1596px; } }
                @keyframes boss-y-06 { from { background-position-y: 0; } to { background-position-y: -1380px; } }

                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .boss-size-default { transform: scale(0.35); }
                    .boss-size-01 { transform: scale(0.4); }
                    .boss-size-03 { transform: scale(0.35); }
                    .boss-size-04 { transform: scale(0.6); }
                    .boss-size-06 { transform: scale(0.7); }
                }
            `}</style>

            <div 
                className="relative bg-transparent flex flex-col items-center gap-0 cursor-pointer group transition-transform duration-300 z-10" 
                onClick={onStatsClick}
            >
                {/* Visual Anchor/Shadow at feet */}
                <div className="absolute bottom-[2%] w-[120px] h-[30px] bg-black/40 blur-md rounded-[100%] z-0"></div>

                {/* Magic Circle - Positioned behind boss */}
                <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-0 opacity-60 pointer-events-none scale-75 md:scale-100">
                    <MagicCircle elementKey={element} />
                </div>

                {/* 
                    HP Bar Boss
                    Vị trí: Dịch lên trên (margin-bottom dương) để tách khỏi đầu Boss
                */}
                <div className="w-32 md:w-48 z-20 mb-8 md:mb-12 transition-transform duration-200 group-hover:scale-105">
                    <HealthBar 
                        current={hp} 
                        max={maxHp} 
                        // Gradient màu Đỏ/Cam hung hãn cho Boss
                        colorGradient="bg-gradient-to-r from-red-600 via-red-500 to-orange-500" 
                        shadowColor="rgba(239, 68, 68, 0.6)" 
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
    );
});

export default BossDisplay;
