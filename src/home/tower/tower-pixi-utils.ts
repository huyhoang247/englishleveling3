// --- START OF FILE tower-pixi-utils.ts ---
import * as PIXI from 'pixi.js';

// Cấu hình kích thước Frame cho Boss (Logic chuyển từ CSS cũ)
export const BOSS_SPRITE_CONFIG: Record<number, { width: number; height: number; scale: number; cols: number; rows: number }> = {
    1: { width: 441, height: 442, scale: 0.6, cols: 6, rows: 6 },
    3: { width: 513, height: 399, scale: 0.55, cols: 6, rows: 6 },
    4: { width: 300.5, height: 332, scale: 0.9, cols: 6, rows: 6 },
    6: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    50: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    // Default
    0: { width: 469, height: 486, scale: 0.5, cols: 6, rows: 6 }, 
};

export const HERO_CONFIG = {
    width: 209,
    height: 196,
    cols: 6,
    rows: 6,
    scale: 0.85,
    url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/hero.webp"
};

export const SKILL_CONFIG = {
    'player-orb': {
        url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-1.webp",
        frameWidth: 83,
        frameHeight: 76,
        cols: 6,
        rows: 6,
        scale: 1.5 // Scale to match visual impact
    },
    'boss-orb': {
        url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-2.webp",
        frameWidth: 66,
        frameHeight: 59,
        cols: 6,
        rows: 6,
        scale: 1.5
    }
};

// Hàm tiện ích để cắt Sprite Sheet thành mảng Texture
export const getTexturesFromSheet = (baseTexture: PIXI.BaseTexture, frameWidth: number, frameHeight: number, cols: number, rows: number): PIXI.Texture[] => {
    const textures: PIXI.Texture[] = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            // Kiểm tra bounds để tránh lỗi nếu ảnh không khớp
            if (rect.x + rect.width <= baseTexture.width && rect.y + rect.height <= baseTexture.height) {
                textures.push(new PIXI.Texture(baseTexture, rect));
            }
        }
    }
    return textures;
};
// --- END OF FILE tower-pixi-utils.ts ---
