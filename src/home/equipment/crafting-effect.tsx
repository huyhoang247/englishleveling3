import React, { useEffect, memo, useRef } from 'react';

// --- CẤU HÌNH SPRITE SHEET ---
// URL ảnh Sprite Sheet
const SPRITE_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/crafting-effect.webp";

// Kích thước 1 khung hình (Frame Size) lấy từ thông số bạn cung cấp
const FRAME_WIDTH = 379;
const FRAME_HEIGHT = 328;

// Tốc độ Animation
// Canvas chạy 60fps. Chia cho 3 nghĩa là cứ 3 frame render thì đổi 1 frame ảnh.
// Số càng lớn thì animation càng chậm.
const ANIMATION_SPEED_DIVIDER = 3; 

const CraftingEffectCanvas = memo(({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const frameRef = useRef<number>(0);
    const spriteRef = useRef<HTMLImageElement | null>(null);

    // 1. Preload hình ảnh ngay khi component mount (để tránh bị nháy khi bật hiệu ứng)
    useEffect(() => {
        const img = new Image();
        img.src = SPRITE_URL;
        spriteRef.current = img;
    }, []);

    // 2. Xử lý logic vẽ Canvas
    useEffect(() => {
        // Nếu không active thì hủy animation và không làm gì cả
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Hàm xử lý khi đổi kích thước màn hình
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        // Gọi 1 lần đầu tiên và lắng nghe sự kiện resize
        handleResize();
        window.addEventListener('resize', handleResize);

        // --- KHỞI TẠO HỆ THỐNG HẠT (PARTICLES - TÀN LỬA) ---
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        // Tạo 80 hạt tàn lửa bay lên
        for (let i = 0; i < 80; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2, // Góc ngẫu nhiên xung quanh tâm
                radius: 30 + Math.random() * 100,   // Bán kính vùng bay
                height: Math.random() * 300,        // Độ cao ban đầu ngẫu nhiên
                speed: 1.5 + Math.random() * 3,     // Tốc độ bay lên
                life: Math.random(),
                colorVar: Math.random()             // Biến để random màu (Vàng/Cam)
            });
        }

        // --- HÀM VẼ VÒNG TRÒN MA THUẬT (MAGIC CIRCLE) ---
        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); // Ép dẹt trục Y để tạo hiệu ứng phối cảnh 3D (perspective)
            ctx.rotate(angle);  // Xoay vòng tròn

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            // Vẽ vòng chính
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Vẽ vòng phụ bên trong (nhỏ hơn, mờ hơn)
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace('0.6', '0.3').replace('0.5', '0.2'); 
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // --- HÀM RENDER CHÍNH (LOOP) ---
        const render = () => {
            frameRef.current++; // Tăng biến đếm frame
            
            // Xóa canvas để vẽ frame mới
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Tính toán vị trí "mặt đất" ảo để đặt vòng tròn và chân của cái búa
            // Dời xuống dưới tâm màn hình khoảng 120px
            const groundY = cy + 120;

            // --- LAYER 1: VẼ MAGIC CIRCLE (NỀN DƯỚI) ---
            drawMagicCircle(cx, groundY, 170, frameRef.current * 0.005, 'rgba(234, 88, 12, 0.6)'); // Màu Cam lửa
            drawMagicCircle(cx, groundY, 110, -frameRef.current * 0.008, 'rgba(220, 38, 38, 0.5)'); // Màu Đỏ

            // --- LAYER 2: VẼ PARTICLES (TÀN LỬA BAY LÊN) ---
            ctx.globalCompositeOperation = 'lighter'; // Chế độ hòa trộn làm sáng (glowing effect)
            particles.forEach(p => {
                p.angle += 0.01; // Xoay nhẹ
                p.height += p.speed; // Bay lên cao
                
                // Nếu bay quá cao thì reset về dưới đất
                if (p.height > 300) {
                    p.height = -50;
                    p.radius = 40 + Math.random() * 80;
                    p.speed = 1.5 + Math.random() * 3;
                }

                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                
                // Độ trong suốt giảm dần khi lên cao
                const alpha = Math.min(1, (1 - (p.height / 300))) * 0.8;
                
                // Pha màu: Chủ yếu là Đỏ (255, G, 0). G thay đổi để tạo ra màu Vàng hoặc Cam.
                const r = 255;
                const g = p.colorVar > 0.5 ? Math.floor(160 * (1 - p.height/300)) : 40; 
                const b = 0;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + Math.random(), 0, Math.PI * 2); // Kích thước hạt ngẫu nhiên
                ctx.fill();
            });

            // --- LAYER 3: VẼ SPRITE (BÚA RÈN) ---
            ctx.globalCompositeOperation = 'source-over'; // Trả về chế độ vẽ bình thường

            const img = spriteRef.current;
            if (img && img.complete && img.naturalWidth > 0) {
                // Tính toán số cột và dòng trong Sprite Sheet
                const cols = Math.floor(img.naturalWidth / FRAME_WIDTH);
                const rows = Math.floor(img.naturalHeight / FRAME_HEIGHT);
                const totalFrames = cols * rows;

                if (totalFrames > 0) {
                    // Tính toán frame hiện tại cần vẽ
                    const currentFrameIndex = Math.floor(frameRef.current / ANIMATION_SPEED_DIVIDER) % totalFrames;
                    
                    const col = currentFrameIndex % cols;
                    const row = Math.floor(currentFrameIndex / cols);

                    // Tọa độ cắt ảnh từ Sprite Sheet (Source X, Source Y)
                    const sx = col * FRAME_WIDTH;
                    const sy = row * FRAME_HEIGHT;

                    // Tỷ lệ hiển thị trên màn hình (Scale)
                    // Đã giảm từ 1.0 xuống 0.8 cho nhỏ hơn một chút
                    const displayScale = 0.8; 
                    const dWidth = FRAME_WIDTH * displayScale;
                    const dHeight = FRAME_HEIGHT * displayScale;

                    // Tạo bóng đổ (Glow) phía sau cái búa
                    ctx.shadowBlur = 35;
                    ctx.shadowColor = 'rgba(255, 100, 0, 0.5)'; // Màu cam rực

                    // Vẽ ảnh vào giữa màn hình
                    ctx.drawImage(
                        img, 
                        sx, sy, FRAME_WIDTH, FRAME_HEIGHT,       // Source Rectangle (cắt từ ảnh gốc)
                        cx - dWidth / 2, cy - dHeight / 2, dWidth, dHeight // Destination Rectangle (vẽ lên canvas)
                    );

                    ctx.shadowBlur = 0; // Reset shadow để không ảnh hưởng vòng lặp sau
                }
            }

            // Gọi frame tiếp theo
            requestRef.current = requestAnimationFrame(render);
        };

        // Bắt đầu vòng lặp animation
        render();

        // Cleanup function: Dọn dẹp khi component unmount hoặc isActive = false
        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isActive]); // Chạy lại khi isActive thay đổi

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/70 backdrop-blur-sm">
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Đã xóa dòng chữ Crafting... */}
        </div>
    );
});

export default CraftingEffectCanvas;
