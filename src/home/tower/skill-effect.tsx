// --- START OF FILE skill-effect.tsx ---

// --- TYPES ---
export type SkillType = 'player-orb' | 'boss-orb';

// Interface này được dùng ở cả tower-ui.tsx (logic game) và tower-pixi-renderer.tsx (vẽ)
export interface SkillProps {
    id: number;
    type: SkillType;
    delay: number;
    startPos: { left: string; top: string };
}

// Config URL và Animation CSS cũ đã được chuyển sang 'tower-pixi-utils.ts' 
// và 'tower-pixi-renderer.tsx', nên ta có thể xóa sạch ở đây.

// Component SkillEffect và SkillStyles cũng không còn cần thiết.

// --- END OF FILE skill-effect.tsx ---
