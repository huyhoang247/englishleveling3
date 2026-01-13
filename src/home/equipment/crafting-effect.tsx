import React, { useEffect, memo, useRef } from 'react';

// --- CẤU HÌNH SPRITE SHEET ---
const SPRITE_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/crafting-effect.webp";

// Kích thước 1 khung hình (Frame Size)
const FRAME_WIDTH = 379;
const FRAME_HEIGHT = 328;

// Tốc độ Animation
const ANIMATION_SPEED_DIVIDER = 3; 

const CraftingEffectCanvas = memo(({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const frameRef = useRef<number>(0);
    const spriteRef = useRef<HTMLImageElement | null>(null);

    // 1. Preload hình ảnh
    useEffect(() => {
        const img = new Image();
        img.src = SPRITE_URL;
        spriteRef.current = img;
    }, []);

    // 2. Logic vẽ Canvas
    useEffect(() => {
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // --- HỆ THỐNG HẠT (PARTICLES) ---
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 100,
                height: Math.random() * 300,
                speed: 1.5 + Math.random() * 3,
                life: Math.random(),
                colorVar: Math.random()
            });
        }

        // --- HÀM VẼ MAGIC CIRCLE ---
        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); // Ép dẹt (Perspective)
            ctx.rotate(angle);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace('0.6', '0.3').replace('0.5', '0.2'); 
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // --- RENDER LOOP ---
        const render = () => {
            frameRef.current++;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const groundY = cy + 120; // Mặt đất ảo

            // --- LAYER 1: MAGIC CIRCLE ---
            drawMagicCircle(cx, groundY, 170, frameRef.current * 0.005, 'rgba(234, 88, 12, 0.6)'); 
            drawMagicCircle(cx, groundY, 110, -frameRef.current * 0.008, 'rgba(220, 38, 38, 0.5)');

            // --- LAYER 2: PARTICLES ---
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += 0.01;
                p.height += p.speed;
                
                if (p.height > 300) {
                    p.height = -50;
                    p.radius = 40 + Math.random() * 80;
                    p.speed = 1.5 + Math.random() * 3;
                }

                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                const alpha = Math.min(1, (1 - (p.height / 300))) * 0.8;
                
                const r = 255;
                const g = p.colorVar > 0.5 ? Math.floor(160 * (1 - p.height/300)) : 40; 
                const b = 0;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            });

            // --- LAYER 3: SPRITE (BÚA RÈN) ---
            ctx.globalCompositeOperation = 'source-over';

            const img = spriteRef.current;
            if (img && img.complete && img.naturalWidth > 0) {
                const cols = Math.floor(img.naturalWidth / FRAME_WIDTH);
                const rows = Math.floor(img.naturalHeight / FRAME_HEIGHT);
                const totalFrames = cols * rows;

                if (totalFrames > 0) {
                    const currentFrameIndex = Math.floor(frameRef.current / ANIMATION_SPEED_DIVIDER) % totalFrames;
                    
                    const col = currentFrameIndex % cols;
                    const row = Math.floor(currentFrameIndex / cols);

                    const sx = col * FRAME_WIDTH;
                    const sy = row * FRAME_HEIGHT;

                    const displayScale = 0.8; 
                    const dWidth = FRAME_WIDTH * displayScale;
                    const dHeight = FRAME_HEIGHT * displayScale;

                    // *** ĐIỀU CHỈNH VỊ TRÍ Ở ĐÂY ***
                    // Thêm +30px để dịch toàn bộ sprite sang phải
                    const xOffset = 30; 

                    ctx.shadowBlur = 35;
                    ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';

                    ctx.drawImage(
                        img, 
                        sx, sy, FRAME_WIDTH, FRAME_HEIGHT, 
                        cx - dWidth / 2 + xOffset, // Đã cộng thêm offset
                        cy - dHeight / 2, 
                        dWidth, dHeight
                    );

                    ctx.shadowBlur = 0;
                }
            }

            requestRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        // Overlay nền đen 80% (không dùng blur để tiết kiệm GPU)
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/80">
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
});

export default CraftingEffectCanvas;
