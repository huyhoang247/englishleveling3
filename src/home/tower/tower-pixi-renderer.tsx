// --- START OF FILE tower-pixi-renderer.tsx ---
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { BOSS_SPRITE_CONFIG, HERO_CONFIG, SKILL_CONFIG, getTexturesFromSheet } from './tower-pixi-utils.ts';
import { ActionState } from './boss-display.tsx';
import { SkillProps } from './skill-effect.tsx';

// --- TYPES ---
interface BattleRendererProps {
    bossId: number;
    bossImgSrc: string;
    heroState: ActionState;
    bossState: ActionState;
    orbEffects: SkillProps[];
}

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 450;
const GROUND_Y = 380;

const BattleRenderer = ({ bossId, bossImgSrc, heroState, bossState, orbEffects }: BattleRendererProps) => {
    // Ref để gắn Canvas vào DOM
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    
    // Refs để lưu trữ các object của Pixi nhằm cập nhật sau này
    const appRef = useRef<PIXI.Application | null>(null);
    const heroRef = useRef<PIXI.AnimatedSprite | null>(null);
    const bossRef = useRef<PIXI.AnimatedSprite | null>(null);
    const projectilesRef = useRef<Map<number, PIXI.AnimatedSprite>>(new Map()); // Map lưu các skill đang bay

    // --- 1. INIT PIXI APP (Chạy 1 lần) ---
    useEffect(() => {
        if (!canvasContainerRef.current) return;

        // Khởi tạo App
        const app = new PIXI.Application({
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            backgroundAlpha: 0, // Trong suốt
            antialias: true,
        });

        // Gắn vào DOM
        canvasContainerRef.current.appendChild(app.view as HTMLCanvasElement);
        appRef.current = app;

        // --- SETUP HERO ---
        const heroTex = PIXI.BaseTexture.from(HERO_CONFIG.url);
        const loadHero = () => {
            const frames = getTexturesFromSheet(heroTex, HERO_CONFIG.width, HERO_CONFIG.height, HERO_CONFIG.cols, HERO_CONFIG.rows);
            const hero = new PIXI.AnimatedSprite(frames);
            hero.anchor.set(0.5, 1);
            hero.x = 200;
            hero.y = GROUND_Y;
            hero.animationSpeed = 0.2;
            hero.scale.set(HERO_CONFIG.scale);
            hero.play();
            
            // Shadow Hero
            const shadow = PIXI.Sprite.from("https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shadow.png");
            shadow.anchor.set(0.5);
            shadow.y = -10; // Relative to hero feet
            shadow.scale.set(0.5, 0.2);
            shadow.alpha = 0.4;
            shadow.tint = 0x000000;
            
            // Container để chứa shadow + hero
            const container = new PIXI.Container();
            container.x = 200; 
            container.y = GROUND_Y;
            container.addChild(shadow); 
            // Reset local pos của hero trong container
            hero.x = 0; hero.y = 0; 
            container.addChild(hero);

            app.stage.addChild(container);
            heroRef.current = hero; // Lưu ref để update animation
            // Hack: Lưu container vào ref của hero để di chuyển cả cụm
            (heroRef.current as any).parentContainer = container; 
        };
        if (heroTex.valid) loadHero(); else heroTex.once('loaded', loadHero);

        // --- SETUP BOSS (Placeholder container) ---
        const bossContainer = new PIXI.Container();
        bossContainer.x = 600;
        bossContainer.y = GROUND_Y;
        app.stage.addChild(bossContainer);
        // Lưu tạm vào ref để useEffect sau xử lý load texture boss
        (bossRef as any).container = bossContainer;

        // --- CLEANUP ---
        return () => {
            app.destroy(true, { children: true, texture: false, baseTexture: false });
            appRef.current = null;
        };
    }, []);

    // --- 2. UPDATE BOSS TEXTURE & ID ---
    useEffect(() => {
        if (!appRef.current || !(bossRef as any).container) return;
        const container = (bossRef as any).container as PIXI.Container;
        
        // Xóa boss cũ
        container.removeChildren();
        
        // Config boss
        const bConf = BOSS_SPRITE_CONFIG[bossId] || BOSS_SPRITE_CONFIG[0];
        
        // Load Texture Boss
        const tex = PIXI.BaseTexture.from(bossImgSrc);
        const setupBossSprite = () => {
            const frames = getTexturesFromSheet(tex, bConf.width, bConf.height, bConf.cols, bConf.rows);
            const sprite = new PIXI.AnimatedSprite(frames);
            sprite.anchor.set(0.5, 1);
            sprite.scale.set(-bConf.scale, bConf.scale); // Lật mặt boss sang trái
            sprite.animationSpeed = 0.2;
            sprite.play();
            
            // Shadow Boss
            const shadow = PIXI.Sprite.from("https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shadow.png");
            shadow.anchor.set(0.5);
            shadow.scale.set(0.7, 0.25);
            shadow.alpha = 0.4;
            shadow.tint = 0x000000;

            container.addChild(shadow);
            container.addChild(sprite);
            bossRef.current = sprite;
        };

        if (tex.valid) setupBossSprite(); else tex.once('loaded', setupBossSprite);

    }, [bossId, bossImgSrc]);

    // --- 3. HANDLE ANIMATION STATES (Hit/Attack) ---
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        // Hàm xử lý hiệu ứng lắc/tấn công mỗi khung hình
        const animateTick = () => {
            // --- HERO ---
            if (heroRef.current && (heroRef.current as any).parentContainer) {
                const container = (heroRef.current as any).parentContainer;
                const baseX = 200;

                if (heroState === 'hit') {
                    container.x = baseX + (Math.random() * 10 - 5);
                    container.filters = [new PIXI.ColorMatrixFilter()];
                    (container.filters[0] as PIXI.ColorMatrixFilter).brightness(1.5, false);
                } else if (heroState === 'attack') {
                     container.x += ((baseX + 60) - container.x) * 0.2; // Lướt tới
                     container.filters = [];
                } else {
                     container.x += (baseX - container.x) * 0.1; // Về chỗ cũ
                     container.filters = [];
                }
            }

            // --- BOSS ---
            if ((bossRef as any).container) {
                const container = (bossRef as any).container;
                const baseX = 600;

                if (bossState === 'hit') {
                    container.x = baseX + (Math.random() * 10 - 5);
                    // Flash effect logic...
                } else if (bossState === 'attack') {
                    container.x += ((baseX - 60) - container.x) * 0.2; // Lướt tới (sang trái)
                } else {
                    container.x += (baseX - container.x) * 0.1;
                }
            }
        };

        app.ticker.add(animateTick);
        return () => {
            app.ticker.remove(animateTick);
        };
    }, [heroState, bossState]); // Re-bind ticker khi state đổi

    // --- 4. HANDLE SKILLS/PROJECTILES ---
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        // Kiểm tra xem có orb mới nào chưa được render không
        orbEffects.forEach(orb => {
            if (!projectilesRef.current.has(orb.id)) {
                // Tạo mới Orb
                const config = SKILL_CONFIG[orb.type];
                const tex = PIXI.BaseTexture.from(config.url);
                
                const createOrb = () => {
                    const frames = getTexturesFromSheet(tex, config.frameWidth, config.frameHeight, config.cols, config.rows);
                    const sprite = new PIXI.AnimatedSprite(frames);
                    sprite.anchor.set(0.5);
                    sprite.animationSpeed = 0.5;
                    sprite.play();
                    
                    // Tính toán vị trí
                    const startX = (parseFloat(orb.startPos.left) / 100) * STAGE_WIDTH;
                    const startY = (parseFloat(orb.startPos.top) / 100) * STAGE_HEIGHT;
                    const targetX = orb.type === 'player-orb' ? 600 : 200;
                    const targetY = 300;

                    sprite.x = startX;
                    sprite.y = startY;

                    // Lưu dữ liệu để animate
                    (sprite as any).customData = {
                        startX, startY, targetX, targetY,
                        progress: 0,
                        type: orb.type
                    };

                    app.stage.addChild(sprite);
                    projectilesRef.current.set(orb.id, sprite);
                };

                if (tex.valid) createOrb(); else tex.once('loaded', createOrb);
            }
        });

        // Loop animation cho đạn
        const projectileTick = (delta: number) => {
            const toRemove: number[] = [];

            projectilesRef.current.forEach((sprite, id) => {
                const data = (sprite as any).customData;
                data.progress += 0.025 * delta; // Tốc độ bay

                if (data.progress >= 1) {
                    data.progress = 1;
                    toRemove.push(id);
                    sprite.alpha = 0;
                }

                // Bezier Logic
                const t = data.progress;
                const p0 = { x: data.startX, y: data.startY };
                const p2 = { x: data.targetX, y: data.targetY };
                const p1 = { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - 100 };

                sprite.x = Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + Math.pow(t, 2) * p2.x;
                sprite.y = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;
                
                // Scale Effect
                const scaleBase = SKILL_CONFIG[data.type as keyof typeof SKILL_CONFIG].scale;
                if (t < 0.1) sprite.scale.set(t * 10 * scaleBase);
                else if (t > 0.9) sprite.scale.set((1 + (t-0.9)*5) * scaleBase);
                else sprite.scale.set(scaleBase);
            });

            // Cleanup xong animation
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
            app.ticker.remove(projectileTick);
        };
    }, [orbEffects]);

    // Render 1 cái thẻ div để chứa canvas
    return <div ref={canvasContainerRef} className="w-full h-full" />;
};

export default BattleRenderer;
// --- END OF FILE tower-pixi-renderer.tsx ---
