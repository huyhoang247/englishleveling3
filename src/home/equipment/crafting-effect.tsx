// --- FILE: ui/crafting-effect.tsx ---

import React, { useEffect, memo } from 'react';

const CraftingEffectCanvas = memo(({ isActive }: { isActive: boolean }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>();
    const frameRef = React.useRef<number>(0);

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

        // --- CẤU HÌNH ---
        const cubeSize = 70;
        
        // Định nghĩa 8 đỉnh
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        // Định nghĩa các mặt để tô màu (Painter's Algorithm)
        const faces = [
            { indices: [0, 1, 2, 3], id: 'back' },
            { indices: [4, 5, 6, 7], id: 'front' },
            { indices: [0, 4, 7, 3], id: 'left' },
            { indices: [1, 5, 6, 2], id: 'right' },
            { indices: [0, 1, 5, 4], id: 'top' },
            { indices: [3, 2, 6, 7], id: 'bottom' }
        ];

        // Hệ thống hạt (Particles) bay từ dưới lên
        const particles: { angle: number; radius: number; height: number; speed: number; life: number }[] = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 50 + Math.random() * 100, // Bán kính vòng xoay
                height: Math.random() * 200, // Độ cao so với tâm
                speed: 0.5 + Math.random() * 1.5,
                life: Math.random()
            });
        }

        let rotationY = 0;
        let rotationX = 0;
        let floatTick = 0;

        // Hàm chiếu 3D -> 2D
        const project = (v: { x: number, y: number, z: number }, rotX: number, rotY: number, transY: number) => {
            let x = v.x * cubeSize;
            let y = v.y * cubeSize;
            let z = v.z * cubeSize;

            // Xoay Y
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            // Xoay X (Nghiêng nhẹ để nhìn thấy nắp)
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            // Dịch chuyển Y (hiệu ứng bay lơ lửng)
            const yFinal = y2 + transY;

            // Phối cảnh
            const scale = 1000 / (1000 + z2);
            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                zDepth: z2,
                scale: scale
            };
        };

        // Hàm vẽ Vòng Ma Pháp (Magic Circle)
        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string, segments: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            // Nghiêng vòng tròn để tạo cảm giác 3D nằm dưới đất
            ctx.scale(1, 0.3); 
            ctx.rotate(angle);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            // Vòng tròn chính
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Các họa tiết bên trong (Runes giả)
            ctx.beginPath();
            for(let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x1 = Math.cos(theta) * (radius * 0.85);
                const y1 = Math.sin(theta) * (radius * 0.85);
                const x2 = Math.cos(theta) * (radius * 1.15);
                const y2 = Math.sin(theta) * (radius * 1.15);
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();

            // Tam giác ma thuật bên trong
            ctx.beginPath();
            for(let i = 0; i < 3; i++) {
                const theta = (i / 3) * Math.PI * 2;
                const r = radius * 0.7;
                const x = Math.cos(theta) * r;
                const y = Math.sin(theta) * r;
                if (i===0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        };

        const render = () => {
            frameRef.current++;
            rotationY += 0.01;
            rotationX = Math.sin(frameRef.current * 0.02) * 0.1 - 0.2; // Nghiêng nhẹ
            floatTick += 0.03;
            const floatY = Math.sin(floatTick) * 15 - 50; // Bay lên xuống

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. VẼ VÒNG MA PHÁP (Dưới đáy)
            // Vòng lớn xoay chậm
            drawMagicCircle(cx, cy + 120, 160, frameRef.current * 0.005, 'rgba(168, 85, 247, 0.4)', 12); // Tím
            // Vòng nhỏ xoay nhanh ngược chiều
            drawMagicCircle(cx, cy + 120, 100, -frameRef.current * 0.01, 'rgba(34, 211, 238, 0.5)', 8); // Cyan

            // 2. VẼ PARTICLES (Xoắn ốc lên Cube)
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += 0.05;
                p.height += p.speed;
                p.radius -= 0.3; // Thu nhỏ bán kính khi bay lên

                // Reset particle
                if (p.height > 150 || p.radius < 10) {
                    p.height = -50;
                    p.radius = 100 + Math.random() * 50;
                    p.life = 1;
                }

                // Vị trí 3D giả lập: Xoắn ốc từ dưới đất (cy + 100) bay lên cube (cy)
                const groundY = cy + 100;
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                
                // Độ mờ giảm dần khi bay lên cao
                const alpha = Math.min(1, (1 - (p.height / 150))) * 0.7;
                
                ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. VẼ MYSTERIOUS BLACK CUBE
            ctx.globalCompositeOperation = 'source-over'; // Quay lại chế độ vẽ đè bình thường

            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, floatY));
            
            // Sắp xếp mặt xa gần
            const sortedFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += projectedVertices[i].zDepth);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            sortedFaces.forEach(face => {
                const pts = face.indices.map(i => projectedVertices[i]);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // --- STYLING: MYSTERIOUS BLACK ---
                
                // 1. Fill nền đen huyền bí (Void Black)
                // Gradient đen pha tím cực tối
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, '#020617'); // Black/Slate-950
                grad.addColorStop(0.5, '#0f0518'); // Very dark purple
                grad.addColorStop(1, '#020617');
                
                ctx.fillStyle = grad;
                ctx.fill();

                // 2. Viền phát sáng (Magical Glow)
                // Shadow blur tạo hào quang lan tỏa
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#a855f7'; // Purple Glow
                
                // Line gradient cho cạnh sang trọng hơn
                const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                strokeGrad.addColorStop(0, '#22d3ee'); // Cyan
                strokeGrad.addColorStop(1, '#d8b4fe'); // Light Purple

                ctx.lineWidth = 3;
                ctx.strokeStyle = strokeGrad;
                ctx.stroke();

                // 3. Highlight bóng loáng (Glossy Reflection)
                // Chỉ vẽ 1 lớp phủ nhẹ để tạo cảm giác bề mặt kính đen
                ctx.shadowBlur = 0; // Tắt blur cho reflection
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fill();
            });

            // Inner Pulsing Core (Chỉ là một điểm sáng le lói bên trong các kẽ hở nếu muốn, 
            // nhưng với solid black cube thì ta vẽ glow bao quanh là đủ đẹp)

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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0" />
            
            {/* Text Style: Ma mị hơn */}
            <div className="relative z-10 mt-72 flex flex-col items-center gap-2">
                <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 tracking-[0.3em] animate-pulse text-2xl uppercase drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                    Forging...
                </div>
                <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden border border-purple-900/50">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-[width_2s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
            </div>
        </div>
    );
});

export default CraftingEffectCanvas;
