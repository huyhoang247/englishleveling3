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
        // UPDATE: Giảm kích thước cube để trông tinh tế hơn
        const cubeSize = 45; 
        
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        const faces = [
            { indices: [0, 1, 2, 3], id: 'back' },
            { indices: [4, 5, 6, 7], id: 'front' },
            { indices: [0, 4, 7, 3], id: 'left' },
            { indices: [1, 5, 6, 2], id: 'right' },
            { indices: [0, 1, 5, 4], id: 'top' },
            { indices: [3, 2, 6, 7], id: 'bottom' }
        ];

        // Hệ thống hạt: Tàn lửa (Embers)
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 40 + Math.random() * 80,
                height: Math.random() * 200,
                speed: 0.8 + Math.random() * 2,
                life: Math.random(),
                colorVar: Math.random()
            });
        }

        let rotationY = 0;
        let rotationX = 0;
        let floatTick = 0;

        const project = (v: { x: number, y: number, z: number }, rotX: number, rotY: number, transY: number) => {
            let x = v.x * cubeSize;
            let y = v.y * cubeSize;
            let z = v.z * cubeSize;

            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            const yFinal = y2 + transY;
            const scale = 1000 / (1000 + z2); // Perspective scaling
            
            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                zDepth: z2,
                scale: scale
            };
        };

        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string, segments: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); 
            ctx.rotate(angle);

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Trang trí thêm vòng trong
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace('0.5', '0.2');
            ctx.stroke();

            ctx.restore();
        };

        // Hàm vẽ lõi năng lượng (Black Hole Core)
        const drawCore = (x: number, y: number, pulse: number, scale: number) => {
            const coreSize = 25 * scale;
            
            // Glow ngoài
            const gradGlow = ctx.createRadialGradient(x, y, coreSize * 0.2, x, y, coreSize * 2.5);
            gradGlow.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); // Purple center
            gradGlow.addColorStop(0.4, 'rgba(220, 38, 38, 0.4)'); // Red mid
            gradGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradGlow;
            ctx.beginPath();
            ctx.arc(x, y, coreSize * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Lõi đen (Hố đen)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x, y, coreSize * (0.8 + pulse * 0.1), 0, Math.PI * 2);
            ctx.fill();

            // Viền năng lượng cực mạnh (Accretion disk)
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#d8b4fe';
            ctx.beginPath();
            ctx.arc(x, y, coreSize * (0.8 + pulse * 0.1), 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset
        };

        const render = () => {
            frameRef.current++;
            rotationY += 0.01; 
            // UPDATE: Nghiêng nhiều hơn để tạo cảm giác 3D rõ (base 0.4 rad)
            rotationX = 0.4 + Math.sin(frameRef.current * 0.02) * 0.1; 
            
            floatTick += 0.025;
            const floatY = Math.sin(floatTick) * 8 - 40; 
            
            const pulse = (Math.sin(frameRef.current * 0.08) + 1) * 0.5;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. MAGIC CIRCLE
            drawMagicCircle(cx, cy + 130, 150, frameRef.current * 0.003, 'rgba(220, 38, 38, 0.5)', 6); 
            drawMagicCircle(cx, cy + 130, 90, -frameRef.current * 0.008, 'rgba(147, 51, 234, 0.4)', 5); 

            // 2. PARTICLES
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += 0.02;
                p.height += p.speed;
                p.radius -= 0.1;
                if (p.height > 180 || p.radius < 5) {
                    p.height = -60;
                    p.radius = 80 + Math.random() * 60;
                    p.life = 1;
                }
                const groundY = cy + 110;
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                const alpha = Math.min(1, (1 - (p.height / 180))) * 0.8;
                const r = 255;
                const g = p.colorVar > 0.5 ? Math.floor(100 * (1 - p.height/180)) : 0; 
                const b = p.height > 100 ? 50 : 0;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. CUBE & CORE
            ctx.globalCompositeOperation = 'source-over';

            // Tính toán vị trí các đỉnh
            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, floatY));
            // Tính toán vị trí tâm (cho core)
            const centerProjected = project({x:0, y:0, z:0}, rotationX, rotationY, floatY);

            // Sắp xếp mặt theo độ sâu (xa vẽ trước, gần vẽ sau)
            const sortedFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += projectedVertices[i].zDepth);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            // UPDATE: Vẽ 3 mặt ở xa trước (Back faces)
            const backFaces = sortedFaces.slice(0, 3);
            const frontFaces = sortedFaces.slice(3);

            const drawFace = (face: typeof faces[0]) => {
                const pts = face.indices.map(i => projectedVertices[i]);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // UPDATE: Gradient trong suốt (Opacity ~70%)
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, 'rgba(5, 5, 10, 0.7)');    // Đen tím nhạt
                grad.addColorStop(0.5, 'rgba(20, 5, 20, 0.6)');  // Hơi đỏ
                grad.addColorStop(1, 'rgba(5, 5, 10, 0.7)');     // Đen lại

                ctx.fillStyle = grad;
                ctx.fill();

                // Hiệu ứng viền Neon
                const glowIntensity = 10 + (pulse * 5);
                ctx.shadowBlur = glowIntensity;
                ctx.shadowColor = '#a855f7'; // Purple glow
                
                const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                strokeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)'); // Red
                strokeGrad.addColorStop(1, 'rgba(168, 85, 247, 0.8)'); // Purple

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = strokeGrad;
                ctx.stroke();
                
                // Reset shadow cho lần vẽ tiếp
                ctx.shadowBlur = 0; 
                
                // Highlight bề mặt (Glass effect)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
            };

            // A. Vẽ các mặt sau
            backFaces.forEach(drawFace);

            // B. Vẽ Lõi Năng Lượng (nằm giữa mặt sau và mặt trước)
            drawCore(centerProjected.x, centerProjected.y, pulse, centerProjected.scale);

            // C. Vẽ các mặt trước (đè lên lõi nhưng trong suốt nên vẫn thấy lõi)
            frontFaces.forEach(drawFace);

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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/60">
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
});

export default CraftingEffectCanvas;
