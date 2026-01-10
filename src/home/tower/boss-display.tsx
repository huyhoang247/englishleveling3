import React, { memo } from 'react';
import MagicCircle, { ElementKey } from './thuoc-tinh.tsx';
import { bossBattleAssets } from '../../game-assets.ts';

// --- COMPONENT THANH MÁU ---
const HealthBar = memo(({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor: string }) => {
    const scale = Math.max(0, current / max);
    return (
        <div className="w-full">
            <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner overflow-hidden">
                <div
                    className={`h-full rounded-full transition-transform duration-500 ease-out origin-left ${colorGradient}`}
                    style={{
                        transform: `scaleX(${scale})`,
                        boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}`
                    }}>
                </div>
                <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
                    <span>{Math.ceil(current)} / {max}</span>
                </div>
            </div>
        </div>
    );
});

// --- COMPONENT SPRITE ANIMATION ---
const BossSprite = memo(({ bossId }: { bossId: number }) => {
    const idStr = String(bossId).padStart(2, '0');
    const spritePath = `/images/boss/${idStr}.webp`;
    const isBoss01 = bossId === 1;

    return (
        <div className="boss-sprite-wrapper">
            <div className={`boss-sprite-container boss-render-optimize ${isBoss01 ? 'boss-size-01' : 'boss-size-default'}`}>
                <div
                    className={`boss-sprite-sheet ${isBoss01 ? 'boss-anim-01' : 'boss-anim-default'}`}
                    style={{ backgroundImage: `url(${spritePath})` }}
                />
            </div>
        </div>
    );
});

// --- MAIN COMPONENT HIỂN THỊ BOSS ---
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
    // Danh sách các boss sử dụng sprite sheet
    const isSpriteBoss = [1, 8, 50].includes(bossId);

    return (
        <div className="w-full max-w-4xl flex justify-center items-center my-8">
            {/* CSS Scoped cho Boss Sprite */}
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

                /* --- THÔNG SỐ BOSS MẶC ĐỊNH (BOSS 08, 50...) --- */
                .boss-size-default { 
                    width: 469px; 
                    height: 486px; 
                    transform: scale(0.5); 
                }
                .boss-anim-default {
                    width: 2814px; 
                    height: 2916px; 
                    background-size: 2814px 2916px;
                    animation: boss-x-def 0.4s steps(6) infinite, boss-y-def 2.4s steps(6) infinite;
                }
                @keyframes boss-x-def { from { background-position-x: 0; } to { background-position-x: -2814px; } }
                @keyframes boss-y-def { from { background-position-y: 0; } to { background-position-y: -2916px; } }

                /* --- THÔNG SỐ BOSS 01 (CÁO LỬA XANH) --- */
                /* Frame size: 551x477 | Grid: 6x6 = 36 frames */
                .boss-size-01 { 
                    width: 551px; 
                    height: 477px; 
                    transform: scale(0.48); /* Kích thước nhỏ gọn trên Desktop */
                }
                
                .boss-anim-01 {
                    /* Width: 551 * 6 = 3306px | Height: 477 * 6 = 2862px */
                    width: 3306px; 
                    height: 2862px; 
                    background-size: 3306px 2862px;
                    /* Đồng bộ 2.4s toàn vòng lặp giống các boss khác */
                    animation: boss-x-01 0.4s steps(6) infinite, boss-y-01 2.4s steps(6) infinite;
                }
                @keyframes boss-x-01 { 
                    from { background-position-x: 0; } 
                    to { background-position-x: -3306px; } 
                }
                @keyframes boss-y-01 { 
                    from { background-position-y: 0; } 
                    to { background-position-y: -2862px; } 
                }

                /* Responsive cho thiết bị di động */
                @media (max-width: 768px) {
                    .boss-size-default { transform: scale(0.35); }
                    .boss-size-01 { transform: scale(0.35); }
                }
            `}</style>

            <div 
                className="relative bg-slate-900/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer group transition-transform duration-300 hover:border-red-500/50" 
                onClick={onStatsClick}
            >
                {/* Vòng tròn nguyên tố (Nằm dưới Boss) */}
                <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-[90%] h-[90%] z-0 opacity-80 pointer-events-none">
                    <MagicCircle elementKey={element} />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                    {/* Nhãn Boss & Tên Boss */}
                    <div className="relative group flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-red-400 text-shadow">BOSS</h2>
                        <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-slate-900 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700">
                            {name.toUpperCase()}
                        </div>
                    </div>

                    {/* Vùng hiển thị Sprite hoặc Hình ảnh tĩnh */}
                    <div className="w-40 h-40 md:w-80 md:h-80 relative mb-4 flex items-center justify-center">
                        {isSpriteBoss ? (
                            <BossSprite bossId={bossId} />
                        ) : (
                            <img 
                                src={imgSrc} 
                                alt={name} 
                                onError={onImgError}
                                className="w-full h-full object-contain drop-shadow-2xl boss-render-optimize" 
                            />
                        )}
                    </div>
                    
                    {/* Thanh máu Boss */}
                    <HealthBar 
                        current={hp} 
                        max={maxHp} 
                        colorGradient="bg-gradient-to-r from-red-600 to-orange-500" 
                        shadowColor="rgba(220, 38, 38, 0.5)" 
                    />
                </div>
            </div>
        </div>
    );
});

export default BossDisplay;
