// --- START OF FILE tower-pixi-utils.ts ---
import * as PIXI from 'pixi.js';

// --- CONFIGURATION ---
// Đường dẫn gốc tới thư mục assets trên GitHub (Dạng Raw để Pixi tải trực tiếp)
const BASE_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/assets";

// Cấu hình kích thước Frame cho từng loại Boss
// Dữ liệu này khớp với file CSS cũ để đảm bảo cắt đúng sprite sheet
export const BOSS_SPRITE_CONFIG: Record<number, { width: number; height: number; scale: number; cols: number; rows: number }> = {
    // Boss ID 1: Fire Demon
    1: { width: 441, height: 442, scale: 0.6, cols: 6, rows: 6 },
    
    // Boss ID 3: Wind Demon
    3: { width: 513, height: 399, scale: 0.55, cols: 6, rows: 6 },
    
    // Boss ID 4: Skeleton King
    4: { width: 300.5, height: 332, scale: 0.9, cols: 6, rows: 6 },
    
    // Boss ID 6 & 50: Shadow/Final Boss
    6: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    50: { width: 266, height: 230, scale: 1.1, cols: 6, rows: 6 },
    
    // Default Boss (ID 0 hoặc không tìm thấy config)
    0: { width: 469, height: 486, scale: 0.5, cols: 6, rows: 6 }, 
};

// Cấu hình cho Hero (Người chơi)
export const HERO_CONFIG = {
    width: 209,
    height: 196,
    cols: 6,
    rows: 6,
    scale: 0.85,
    url: `${BASE_URL}/images/hero.webp`
};

// Cấu hình cho các Skill (Hiệu ứng đạn bay)
export const SKILL_CONFIG = {
    'player-orb': {
        url: `${BASE_URL}/effect/skill-1.webp`,
        frameWidth: 83,
        frameHeight: 76,
        cols: 6,
        rows: 6,
        scale: 1.5 // Scale lớn hơn một chút để tạo hiệu ứng lực
    },
    'boss-orb': {
        url: `${BASE_URL}/effect/skill-2.webp`,
        frameWidth: 66,
        frameHeight: 59,
        cols: 6,
        rows: 6,
        scale: 1.5
    }
};

/**
 * Hàm tiện ích để cắt Sprite Sheet thành mảng các Texture nhỏ.
 * Đã được cập nhật để tương thích với PixiJS v8.
 * 
 * @param baseTexture - Texture gốc chứa toàn bộ sprite sheet
 * @param frameWidth - Chiều rộng của 1 frame
 * @param frameHeight - Chiều cao của 1 frame
 * @param cols - Số cột trong sprite sheet
 * @param rows - Số hàng trong sprite sheet
 * @returns Mảng các PIXI.Texture để dùng cho AnimatedSprite
 */
export const getTexturesFromSheet = (
    baseTexture: PIXI.Texture, 
    frameWidth: number, 
    frameHeight: number, 
    cols: number, 
    rows: number
): PIXI.Texture[] => {
    const textures: PIXI.Texture[] = [];
    
    // Kiểm tra an toàn: Nếu texture chưa load xong hoặc bị lỗi kích thước
    if (!baseTexture.width || !baseTexture.height) {
        console.warn("getTexturesFromSheet: Texture chưa sẵn sàng hoặc kích thước = 0");
        return [PIXI.Texture.EMPTY];
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Xác định vùng cắt (Rectangle) cho frame hiện tại
            const rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            
            // PixiJS v8: Tạo Texture mới từ Source của texture gốc và Frame đã định nghĩa
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
