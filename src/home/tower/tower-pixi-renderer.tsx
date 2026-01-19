// --- START OF FILE tower-pixi-renderer.tsx ---
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { BOSS_SPRITE_CONFIG, HERO_CONFIG, SKILL_CONFIG, getTexturesFromSheet } from './tower-pixi-utils.ts';
import { ActionState } from './boss-display.tsx';
import { SkillProps } from './skill-effect.tsx';

// --- CONSTANTS ---
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 450;
const GROUND_Y = 380; // Vị trí chân nhân vật

// Đường dẫn gốc giống trong utils để xử lý ảnh Boss động
const BASE_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/assets";

// --- TYPES ---
interface BattleRendererProps {
    bossId: number;
    bossImgSrc: string;
    heroState: ActionState;
    bossState: ActionState;
    orbEffects: SkillProps[];
}

// Interface mở rộng để gắn dữ liệu tùy chỉnh vào Sprite
interface CustomSprite extends PIXI.AnimatedSprite {
    customData?: {
        startX: number;
        startY: number;
        targetX: number;
        targetY: number;
        progress: number;
        type: string;
    };
    parentContainer?: PIXI.Container;
}

const BattleRenderer = ({ bossId, bossImgSrc, heroState, bossState, orbEffects }: BattleRendererProps) => {
    // Ref để gắn Canvas vào DOM
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    
    // Refs để lưu trữ các object của Pixi nhằm cập nhật sau này
    const appRef = useRef<PIXI.Application | null>(null);
    const heroRef = useRef<CustomSprite | null>(null);
    const bossRef = useRef<CustomSprite | null>(null);
    
    // Map lưu các skill đang bay để quản lý animation
    const projectilesRef = useRef<Map<number, CustomSprite>>(new Map());

    // --- 1. INIT PIXI APP (Chạy 1 lần khi mount) ---
    useEffect(() => {
        if (!canvasContainerRef.current) return;

        // Cờ kiểm tra component còn mount không
        let isMounted = true;

        // Tạo Application
        const app = new PIXI.Application();

        const initApp = async () => {
            // PixiJS v8 Init
            await app.init({
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                backgroundAlpha: 0, // Nền trong suốt
                antialias: true,
                preference: 'webgl', // Ưu tiên WebGL
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (!isMounted || !canvasContainerRef.current) {
                app.destroy(true);
                return;
            }

            // --- FIX RESPONSIVE MOBILE ---
            // Thiết lập CSS cho thẻ Canvas để nó tự co giãn theo container cha
            app.canvas.style.width = "100%";
            app.canvas.style.height = "100%";
            app.canvas.style.objectFit = "contain"; // Quan trọng: Giữ tỷ lệ ảnh, không bị méo
            app.canvas.style.display = "block";

            // Gắn Canvas vào thẻ DIV
            canvasContainerRef.current.appendChild(app.canvas as HTMLCanvasElement);
            appRef.current = app;

            // --- SETUP HERO (NGƯỜI CHƠI) ---
            try {
                // Load Texture
                const heroTex = await PIXI.Assets.load(HERO_CONFIG.url);
                const frames = getTexturesFromSheet(heroTex, HERO_CONFIG.width, HERO_CONFIG.height, HERO_CONFIG.cols, HERO_CONFIG.rows);
                
                // Tạo Sprite
                const hero = new PIXI.AnimatedSprite(frames) as CustomSprite;
                hero.anchor.set(0.5, 1);
                hero.x = 200;
                hero.y = GROUND_Y;
                hero.animationSpeed = 0.2;
                hero.scale.set(HERO_CONFIG.scale);
                hero.play();
                
                // Tạo Shadow (Bóng đổ)
                const shadowTex = await PIXI.Assets.load(`${BASE_URL}/images/hero.webp`);
                const shadow = new PIXI.Sprite(shadowTex);
                shadow.anchor.set(0.5);
                shadow.y = -10;
                shadow.scale.set(0.5, 0.2);
                shadow.alpha = 0.4;
                shadow.tint = 0x000000;
                
                // Gom nhóm vào Container để di chuyển cả bóng lẫn người
                const container = new PIXI.Container();
                container.x = 200; 
                container.y = GROUND_Y;
                container.addChild(shadow); 
                // Reset vị trí local của hero trong container về 0
                hero.x = 0; hero.y = 0; 
                container.addChild(hero);

                app.stage.addChild(container);
                
                heroRef.current = hero; 
                // Lưu tham chiếu container vào hero để dễ truy cập khi animate
                hero.parentContainer = container; 

                // --- SETUP BOSS CONTAINER (Placeholder) ---
                const bossContainer = new PIXI.Container();
                bossContainer.x = 600;
                bossContainer.y = GROUND_Y;
                app.stage.addChild(bossContainer);
                
                // Lưu container boss vào ref tạm thời
                (bossRef as any).container = bossContainer;

            } catch (e) {
                console.error("Failed to load Hero assets:", e);
            }
        };

        initApp();

        // Cleanup function
        return () => {
            isMounted = false;
            if (appRef.current) {
                // Hủy app và toàn bộ children, texture
                appRef.current.destroy(true, { children: true, texture: false, textureSource: false });
                appRef.current = null;
            }
        };
    }, []);

    // --- 2. UPDATE BOSS (Khi ID hoặc Ảnh thay đổi) ---
    useEffect(() => {
        if (!appRef.current || !(bossRef as any).container) return;
        
        const updateBoss = async () => {
             const container = (bossRef as any).container as PIXI.Container;
             // Xóa boss cũ
             container.removeChildren();
             
             // Xử lý URL boss: Nếu là đường dẫn tương đối (ví dụ /images/boss/01.webp), thêm BASE_URL vào
             let finalBossUrl = bossImgSrc;
             if (bossImgSrc.startsWith('/')) {
                 // Loại bỏ dấu / ở đầu để nối chuỗi cho đẹp nếu cần, hoặc nối trực tiếp
                 finalBossUrl = `${BASE_URL}${bossImgSrc.replace('/src/assets', '')}`; 
                 // Fix trường hợp đường dẫn trong bossImgSrc là /images/boss/... mà BASE_URL đã trỏ tới assets
                 if (bossImgSrc.startsWith('/images')) {
                     finalBossUrl = `${BASE_URL}${bossImgSrc}`;
                 }
             }

             // Config cho từng loại boss
             const bConf = BOSS_SPRITE_CONFIG[bossId] || BOSS_SPRITE_CONFIG[0];
             
             try {
                // Load ảnh Boss mới
                const tex = await PIXI.Assets.load(finalBossUrl);
                const frames = getTexturesFromSheet(tex, bConf.width, bConf.height, bConf.cols, bConf.rows);
                
                const sprite = new PIXI.AnimatedSprite(frames) as CustomSprite;
                sprite.anchor.set(0.5, 1);
                // Lật ngược sprite (scale X âm) để boss quay mặt sang trái
                sprite.scale.set(-bConf.scale, bConf.scale);
                sprite.animationSpeed = 0.2;
                sprite.play();
                
                // Shadow Boss
                const shadowTex = await PIXI.Assets.load(`${BASE_URL}/images/shadow.png`);
                const shadow = new PIXI.Sprite(shadowTex);
                shadow.anchor.set(0.5);
                shadow.scale.set(0.7, 0.25);
                shadow.alpha = 0.4;
                shadow.tint = 0x000000;
    
                container.addChild(shadow);
                container.addChild(sprite);
                
                bossRef.current = sprite;
             } catch (e) {
                 console.error("Failed to load Boss assets:", finalBossUrl, e);
                 // Fallback: Nếu không load được sprite, vẽ hình chữ nhật đỏ để debug
                 const graphics = new PIXI.Graphics().rect(0, 0, 100, 100).fill(0xff0000);
                 graphics.x = -50; graphics.y = -100;
                 container.addChild(graphics);
             }
        };
        updateBoss();

    }, [bossId, bossImgSrc]);

    // --- 3. ANIMATION LOOP (Xử lý rung lắc, tấn công) ---
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        const animateTick = () => {
            // --- HERO ANIMATION ---
            if (heroRef.current && heroRef.current.parentContainer) {
                const container = heroRef.current.parentContainer;
                const baseX = 200;

                if (heroState === 'hit') {
                    // Rung lắc ngẫu nhiên
                    container.x = baseX + (Math.random() * 10 - 5);
                } else if (heroState === 'attack') {
                     // Lướt tới (Interpolation)
                     container.x += ((baseX + 60) - container.x) * 0.2;
                } else {
                     // Trở về vị trí cũ
                     container.x += (baseX - container.x) * 0.1;
                }
            }

            // --- BOSS ANIMATION ---
            if ((bossRef as any).container) {
                const container = (bossRef as any).container;
                const baseX = 600;

                if (bossState === 'hit') {
                    container.x = baseX + (Math.random() * 10 - 5);
                } else if (bossState === 'attack') {
                    // Lướt sang trái (trừ X)
                    container.x += ((baseX - 60) - container.x) * 0.2;
                } else {
                    container.x += (baseX - container.x) * 0.1;
                }
            }
        };

        // Thêm hàm vào vòng lặp Pixi Ticker
        app.ticker.add(animateTick);

        // Cleanup khi state thay đổi hoặc unmount
        return () => {
            if (app && app.ticker) app.ticker.remove(animateTick);
        };
    }, [heroState, bossState]);

    // --- 4. PROJECTILES (KỸ NĂNG/ĐẠN BAY) ---
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        // A. TẠO ĐẠN MỚI
        orbEffects.forEach(orb => {
            // Nếu ID chưa tồn tại trong Map thì tạo mới
            if (!projectilesRef.current.has(orb.id)) {
                const config = SKILL_CONFIG[orb.type];
                
                const createOrb = async () => {
                    try {
                        const tex = await PIXI.Assets.load(config.url);
                        const frames = getTexturesFromSheet(tex, config.frameWidth, config.frameHeight, config.cols, config.rows);
                        
                        const sprite = new PIXI.AnimatedSprite(frames) as CustomSprite;
                        sprite.anchor.set(0.5);
                        sprite.animationSpeed = 0.5;
                        sprite.play();
                        
                        // Tính toán tọa độ Pixel
                        const startX = (parseFloat(orb.startPos.left) / 100) * STAGE_WIDTH;
                        const startY = (parseFloat(orb.startPos.top) / 100) * STAGE_HEIGHT;
                        
                        // Xác định mục tiêu (Player bắn Boss, Boss bắn Player)
                        const targetX = orb.type === 'player-orb' ? 600 : 200;
                        const targetY = 300; // Ngang bụng

                        sprite.x = startX;
                        sprite.y = startY;

                        // Gắn dữ liệu để tính toán quỹ đạo
                        sprite.customData = {
                            startX, startY, targetX, targetY,
                            progress: 0,
                            type: orb.type
                        };

                        app.stage.addChild(sprite);
                        projectilesRef.current.set(orb.id, sprite);
                    } catch (e) {
                        console.error("Failed load orb", e);
                    }
                };
                createOrb();
            }
        });

        // B. CẬP NHẬT VỊ TRÍ ĐẠN (BAY)
        const projectileTick = (ticker: PIXI.Ticker) => {
            const delta = ticker.deltaTime; // Pixi v8 cung cấp delta time
            const toRemove: number[] = [];

            projectilesRef.current.forEach((sprite, id) => {
                const data = sprite.customData;
                if (!data) return;

                // Tăng tiến độ (Tốc độ bay)
                data.progress += 0.025 * delta;

                if (data.progress >= 1) {
                    data.progress = 1;
                    toRemove.push(id);
                    sprite.alpha = 0; // Ẩn ngay khi đến đích
                }

                // TÍNH TOÁN QUỸ ĐẠO BEZIER (Đường cong)
                const t = data.progress;
                const p0 = { x: data.startX, y: data.startY }; // Điểm đầu
                const p2 = { x: data.targetX, y: data.targetY }; // Điểm cuối
                // Điểm điều khiển (ở giữa và cao hơn để tạo đường vòng cung)
                const p1 = { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - 100 };

                // Công thức Quadratic Bezier
                sprite.x = Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + Math.pow(t, 2) * p2.x;
                sprite.y = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;
                
                // HIỆU ỨNG SCALE (Zoom in lúc đầu, Zoom out/Impact lúc cuối)
                const scaleBase = SKILL_CONFIG[data.type as keyof typeof SKILL_CONFIG].scale;
                if (t < 0.1) {
                    sprite.scale.set(t * 10 * scaleBase);
                } else if (t > 0.9) {
                    sprite.scale.set((1 + (t-0.9)*5) * scaleBase);
                } else {
                    sprite.scale.set(scaleBase);
                }
            });

            // Xóa các đạn đã bay xong
            toRemove.forEach(id => {
                const sprite = projectilesRef.current.get(id);
                if (sprite) {
                    app.stage.removeChild(sprite);
                    sprite.destroy();
                    projectilesRef.current.delete(id);
                }
            });
        };

        app.ticker.add(projectileTick);
        return () => {
            if (app && app.ticker) app.ticker.remove(projectileTick);
        };
    }, [orbEffects]);

    // Trả về thẻ DIV để chứa Canvas
    return <div ref={canvasContainerRef} className="w-full h-full flex items-center justify-center" />;
};

export default BattleRenderer;
// --- END OF FILE tower-pixi-renderer.tsx ---
