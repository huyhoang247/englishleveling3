import React, { useEffect, memo, useRef } from 'react';

// --- CẤU HÌNH SPRITE SHEET ---
// URL ảnh Sprite Sheet
const SPRITE_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/crafting-effect.webp";

// Kích thước 1 khung hình (Frame Size)
const FRAME_WIDTH = 379;
const FRAME_HEIGHT = 328;

// Tốc độ Animation
// Canvas chạy 60fps. Chia cho 3 nghĩa là cứ 3 frame render thì đổi 1 frame ảnh.
const ANIMATION_SPEED_DIVIDER = 3; 

const CraftingEffectCanvas = memo(({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const frameRef = useRef<number>(0);
    const spriteRef = useRef<HTMLImageElement | null>(null);

    // 1. Preload hình ảnh ngay khi component mount
    useEffect(() => {
        const img = new Image();
        img.src = SPRITE_URL;
        spriteRef.current = img;
    }, []);

    // 2. Xử lý logic vẽ Canvas
    useEffect(() => {
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize Canvas full màn hình
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // --- KHỞI TẠO HỆ THỐNG HẠT (PARTICLES) ---
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        // Tạo 80 hạt tàn lửa
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

        // --- HÀM VẼ VÒNG TRÒN MA THUẬT (MAGIC CIRCLE) ---
        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); // Ép dẹt trục Y (Perspective)
            ctx.rotate(angle);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            // Vòng chính
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Vòng phụ
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace('0.6', '0.3').replace('0.5', '0.2'); 
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // --- HÀM RENDER CHÍNH ---
        const render = () => {
            frameRef.current++;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const groundY = cy + 120; // Vị trí mặt đất ảo

            // --- LAYER 1: VẼ MAGIC CIRCLE (NỀN DƯỚI) ---
            drawMagicCircle(cx, groundY, 170, frameRef.current * 0.005, 'rgba(234, 88, 12, 0.6)'); // Cam lửa
            drawMagicCircle(cx, groundY, 110, -frameRef.current * 0.008, 'rgba(220, 38, 38, 0.5)'); // Đỏ

            // --- LAYER 2: VẼ PARTICLES (TÀN LỬA) ---
            ctx.globalCompositeOperation = 'lighter'; // Cộng màu
            particles.forEach(p => {
                p.angle += 0.01;
                p.height += p.speed;
                
                // Reset hạt khi bay quá cao
                if (p.height > 300) {
                    p.height = -50;
                    p.radius = 40 + Math.random() * 80;
                    p.speed = 1.5 + Math.random() * 3;
                }

                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                const alpha = Math.min(1, (1 - (p.height / 300))) * 0.8;
                
                // Màu lửa (Đỏ -> Vàng)
                const r = 255;
                const g = p.colorVar > 0.5 ? Math.floor(160 * (1 - p.height/300)) : 40; 
                const b = 0;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            });

            // --- LAYER 3: VẼ SPRITE (BÚA RÈN) ---
            ctx.globalCompositeOperation = 'source-over'; // Chế độ vẽ thường

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

                    // Scale hiển thị: 0.8 (Nhỏ hơn chút theo yêu cầu)
                    const displayScale = 0.8; 
                    const dWidth = FRAME_WIDTH * displayScale;
                    const dHeight = FRAME_HEIGHT * displayScale;

                    // Glow effect
                    ctx.shadowBlur = 35;
                    ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';

                    ctx.drawImage(
                        img, 
                        sx, sy, FRAME_WIDTH, FRAME_HEIGHT, 
                        cx - dWidth / 2, cy - dHeight / 2, dWidth, dHeight
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

    // --- RENDER COMPONENT ---
    // Đã loại bỏ 'backdrop-blur-sm'
    // Sử dụng 'bg-black/80' để tối nền, chi phí render cực thấp
    return (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/80">
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
});

export default CraftingEffectCanvas;
