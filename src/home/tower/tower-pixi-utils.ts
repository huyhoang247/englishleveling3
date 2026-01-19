// --- START OF FILE tower-pixi-utils.ts ---
import * as PIXI from 'pixi.js';

// Cấu hình kích thước Frame cho Boss
// Dữ liệu này được lấy từ file CSS cũ để đảm bảo sprite cắt đúng khung hình
export const BOSS_SPRITE_CONFIG: Record<number, { width: number; height: number; scale: number; cols: number; rows: number }> = {
    // Boss ID 1
    1: { width: 441, height: 442, scale: 0.6, cols: 6, rows: 6 },
    // Boss ID 3
    3: { width: 513, height: 399, scale: 0.55, cols: 6, rows: 6 },
    // Boss ID 4
    4: { width: 300.5, height: 332, scale: 0.9, cols: 6, rows: 6 },
    // Boss ID 6 & 50
    6: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    50: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    // Default Boss (ID 0 hoặc không tìm thấy)
    0: { width: 469, height: 486, scale: 0.5, cols: 6, rows: 6 }, 
};

// Cấu hình cho Hero (Người chơi)
export const HERO_CONFIG = {
    width: 209,
    height: 196,
    cols: 6,
    rows: 6,
    scale: 0.85,
    url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/hero.webp"
};

// Cấu hình cho các Skill (Đạn bay)
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

/**
 * Hàm tiện ích để cắt Sprite Sheet thành mảng Texture
 * Đã cập nhật cho PixiJS v8 (Sử dụng TextureSource thay vì BaseTexture)
 * 
 * @param baseTexture - Texture gốc đã load (chứa toàn bộ sprite sheet)
 * @param frameWidth - Chiều rộng 1 frame
 * @param frameHeight - Chiều cao 1 frame
 * @param cols - Số cột
 * @param rows - Số hàng
 * @returns Mảng các Texture đã cắt
 */
export const getTexturesFromSheet = (
    baseTexture: PIXI.Texture, 
    frameWidth: number, 
    frameHeight: number, 
    cols: number, 
    rows: number
): PIXI.Texture[] => {
    const textures: PIXI.Texture[] = [];
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Tạo hình chữ nhật đại diện cho vị trí frame hiện tại
            const rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            
            // Cú pháp PixiJS v8: Tạo Texture mới từ Source của Texture gốc và Frame đã cắt
            const texture = new PIXI.Texture({
                source: baseTexture.source,
                frame: rect
            });

            textures.push(texture);
        }
    }
    return textures;
};
// --- END OF FILE tower-pixi-utils.ts ---
