// --- START OF FILE skill-effect.tsx ---

import React, { memo } from 'react';

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
        spriteUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-1.webp",
        width: 83,
        height: 76,
        sheetWidth: 498,
        sheetHeight: 456,
        animSequenceClass: 'animate-orb-sequence',
        animSpinClass: 'animate-orb-spin'
    },
    'boss-orb': {
        spriteUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-2.webp",
        width: 66,
        height: 59,
        sheetWidth: 396,
        sheetHeight: 354,
        animSequenceClass: 'animate-boss-orb-sequence',
        animSpinClass: 'animate-boss-orb-spin'
    }
};

// --- CSS STYLES (Encapsulated) ---
// Chuyển toàn bộ CSS Keyframes liên quan đến Skill vào đây để file UI chính sạch sẽ
const SkillStyles = () => (
    <style>{`
        /* --- PLAYER ORB ANIMATIONS --- */
        @keyframes orb-spin-x { from { background-position-x: 0; } to { background-position-x: -498px; } }
        @keyframes orb-spin-y { from { background-position-y: 0; } to { background-position-y: -456px; } }
        
        .animate-orb-spin { 
            animation: orb-spin-x 0.4s steps(6) infinite, orb-spin-y 2.4s steps(6) infinite; 
        }

        @keyframes orb-sequence {
            0% { left: var(--start-left); top: var(--start-top); transform: scale(0); opacity: 0; }
            10% { opacity: 1; }
            20% { left: var(--start-left); top: var(--start-top); transform: scale(0.8); }
            76.66% { left: var(--start-left); top: var(--start-top); transform: scale(0.8); }
            95% { opacity: 1; }
            100% { left: 68%; top: 55%; transform: scale(0.8); opacity: 0; } /* Target: Boss Position */
        }

        .animate-orb-sequence { 
            animation-name: orb-sequence;
            animation-duration: 3s;
            animation-timing-function: linear;
            animation-fill-mode: both; 
            will-change: transform, left, top;
            transform: translateZ(0);
        }

        /* --- BOSS ORB ANIMATIONS --- */
        @keyframes boss-orb-spin-x { from { background-position-x: 0; } to { background-position-x: -396px; } }
        @keyframes boss-orb-spin-y { from { background-position-y: 0; } to { background-position-y: -354px; } }
        
        .animate-boss-orb-spin { 
            animation: boss-orb-spin-x 0.4s steps(6) infinite, boss-orb-spin-y 2.4s steps(6) infinite; 
        }

        @keyframes boss-orb-sequence {
            0% { left: var(--start-left); top: var(--start-top); transform: scale(0); opacity: 0; }
            10% { opacity: 1; }
            20% { left: var(--start-left); top: var(--start-top); transform: scale(0.7); }
            76.66% { left: var(--start-left); top: var(--start-top); transform: scale(0.7); }
            95% { opacity: 1; }
            100% { left: 25%; top: 60%; transform: scale(0.4); opacity: 0; } /* Target: Player Position */
        }

        .animate-boss-orb-sequence { 
            animation-name: boss-orb-sequence;
            animation-duration: 3s;
            animation-timing-function: linear;
            animation-fill-mode: both; 
            will-change: transform, left, top;
            transform: translateZ(0);
        }
    `}</style>
);

// --- COMPONENT ---
const SkillEffect = memo(({ id, type, delay, startPos }: SkillProps) => {
    const config = SKILL_DATA[type];

    if (!config) return null;

    const style = {
        '--start-left': startPos.left,
        '--start-top': startPos.top,
        animationDelay: `${delay}ms`, 
    } as React.CSSProperties;

    return (
        <>
            {/* Render styles once per mount is tricky in lists, but fine here or move to parent */}
            {/* Tốt nhất là render Styles ở component cha hoặc file global, 
                nhưng để tiện lợi (portable component), ta check id để chỉ render style 1 lần nếu cần, 
                hoặc đơn giản để React deduplicate (style tag is cheap) */}
            
            <div 
                key={id} 
                className={`absolute z-50 pointer-events-none origin-center ${config.animSequenceClass}`} 
                style={style}
            >
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

// Export Component Styles để dùng ở file cha (tránh render style tag lặp lại nhiều lần trong loop)
export { SkillStyles };
export default SkillEffect;
