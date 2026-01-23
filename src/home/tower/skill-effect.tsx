// --- START OF FILE skill-effect.tsx ---

import React, { memo } from 'react';
import { effectAssets } from '../../game-assets.ts';

// --- TYPES ---
export type SkillType = 'player-orb' | 'boss-orb';

export interface SkillProps {
    id: number;
    type: SkillType;
    delay: number;
    startPos: { left: string; top: string };
}

// --- CONFIGURATION ---
// Dễ dàng thêm skill mới bằng cách thêm vào object này
const SKILL_DATA: Record<SkillType, {
    spriteUrl: string;
    width: number;
    height: number;
    sheetWidth: number;
    sheetHeight: number;
    animSequenceClass: string; // Class điều khiển đường bay (path)
    animSpinClass: string;     // Class điều khiển frame ảnh (sprite sheet)
}> = {
    'player-orb': {
        spriteUrl: effectAssets.playerSkillOrb,
        width: 83,
        height: 76,
        sheetWidth: 498,
        sheetHeight: 456,
        animSequenceClass: 'animate-orb-sequence',
        animSpinClass: 'animate-orb-spin'
    },
    'boss-orb': {
        spriteUrl: effectAssets.bossSkillOrb,
        width: 66,
        height: 59,
        sheetWidth: 396,
        sheetHeight: 354,
        animSequenceClass: 'animate-boss-orb-sequence',
        animSpinClass: 'animate-boss-orb-spin'
    }
};

// --- CSS STYLES (Encapsulated & Optimized) ---
// Chứa toàn bộ logic chuyển động. Được bọc trong memo để tránh re-calc style không cần thiết.
const SkillStyles = memo(() => (
    <style>{`
        /* --- 1. SPIN ANIMATIONS (Xoay tròn quả cầu) --- */
        
        /* Player Orb Spin */
        @keyframes orb-spin-x { from { background-position-x: 0; } to { background-position-x: -498px; } }
        @keyframes orb-spin-y { from { background-position-y: 0; } to { background-position-y: -456px; } }
        
        .animate-orb-spin { 
            animation: orb-spin-x 0.4s steps(6) infinite, orb-spin-y 2.4s steps(6) infinite; 
        }

        /* Boss Orb Spin */
        @keyframes boss-orb-spin-x { from { background-position-x: 0; } to { background-position-x: -396px; } }
        @keyframes boss-orb-spin-y { from { background-position-y: 0; } to { background-position-y: -354px; } }
        
        .animate-boss-orb-spin { 
            animation: boss-orb-spin-x 0.4s steps(6) infinite, boss-orb-spin-y 2.4s steps(6) infinite; 
        }

        /* --- 2. SEQUENCE ANIMATIONS (Đường bay & Va chạm) --- */

        /* Player Attack Path */
        @keyframes orb-sequence {
            /* Giai đoạn 1: Xuất hiện */
            0% { 
                left: var(--start-left); 
                top: var(--start-top); 
                transform: scale(0); 
                opacity: 0; 
            }
            10% { 
                opacity: 1; 
                transform: scale(0.8); 
            }
            
            /* Giai đoạn 2: Lấy đà (Giữ nguyên vị trí một chút) */
            30% { 
                left: var(--start-left); 
                top: var(--start-top); 
                transform: scale(1); 
            }
            
            /* Giai đoạn 3: Bay cực nhanh đến đích (Impact Point) */
            90% { 
                left: 68%; 
                top: 55%; 
                transform: scale(0.8); 
                opacity: 1; 
            }
            
            /* Giai đoạn 4: IMPACT (Nổ/Phóng to/Chớp sáng) */
            95% { 
                transform: scale(1.5); 
                opacity: 0.8; 
                filter: brightness(2); /* Chớp sáng */
            } 
            100% { 
                left: 68%; 
                top: 55%; 
                transform: scale(2); 
                opacity: 0; 
            }
        }

        .animate-orb-sequence { 
            animation-name: orb-sequence;
            animation-duration: 0.8s; /* Rút ngắn thời gian để có lực */
            animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1); /* Gia tốc: Chậm -> Nhanh */
            animation-fill-mode: both; 
            will-change: transform, left, top;
            transform: translateZ(0);
        }

        /* Boss Attack Path */
        @keyframes boss-orb-sequence {
            /* Giai đoạn 1: Xuất hiện */
            0% { 
                left: var(--start-left); 
                top: var(--start-top); 
                transform: scale(0); 
                opacity: 0; 
            }
            10% { 
                opacity: 1; 
                transform: scale(0.7); 
            }
            
            /* Giai đoạn 2: Lấy đà */
            30% { 
                left: var(--start-left); 
                top: var(--start-top); 
                transform: scale(0.8); 
            }
            
            /* Giai đoạn 3: Bay đến đích */
            90% { 
                left: 25%; 
                top: 60%; 
                transform: scale(0.4); 
                opacity: 1; 
            }
            
            /* Giai đoạn 4: IMPACT */
            95% { 
                transform: scale(1); 
                opacity: 0.8; 
                filter: brightness(2) hue-rotate(90deg); /* Chớp sáng màu lạ */
            }
            100% { 
                left: 25%; 
                top: 60%; 
                transform: scale(1.5); 
                opacity: 0; 
            }
        }

        .animate-boss-orb-sequence { 
            animation-name: boss-orb-sequence;
            animation-duration: 0.8s;
            animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1);
            animation-fill-mode: both; 
            will-change: transform, left, top;
            transform: translateZ(0);
        }
    `}</style>
));

// --- COMPONENT ---
const SkillEffect = memo(({ id, type, delay, startPos }: SkillProps) => {
    const config = SKILL_DATA[type];

    if (!config) return null;

    // CSS Variables cho vị trí bắt đầu
    const style = {
        '--start-left': startPos.left,
        '--start-top': startPos.top,
        animationDelay: `${delay}ms`, 
    } as React.CSSProperties;

    return (
        <>
            {/* Wrapper div: Chịu trách nhiệm di chuyển từ A -> B (animate-sequence) */}
            <div 
                key={id} 
                className={`absolute z-50 pointer-events-none origin-center ${config.animSequenceClass}`} 
                style={style}
            >
                 {/* Inner div: Chịu trách nhiệm xoay animation sprite (animate-spin) */}
                 <div 
                    className={config.animSpinClass}
                    style={{
                        width: `${config.width}px`,
                        height: `${config.height}px`,
                        backgroundImage: `url(${config.spriteUrl})`,
                        backgroundSize: `${config.sheetWidth}px ${config.sheetHeight}px`,
                        backgroundRepeat: 'no-repeat',
                        willChange: 'background-position'
                    }}
                 />
            </div>
        </>
    );
});

// Export Component Styles để dùng ở file cha
export { SkillStyles };
export default SkillEffect;
