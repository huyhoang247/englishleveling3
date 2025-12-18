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
        const cubeSize = 85; // Tăng nhẹ kích thước cube
        
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

        // Hệ thống hạt: Tàn lửa bị hút vào hố đen
        const particles: { angle: number; radius: number; speed: number; size: number; color: string }[] = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 40 + Math.random() * 100, // Bắt đầu từ xa
                speed: 0.02 + Math.random() * 0.04,
                size: Math.random() * 2,
                color: Math.random() > 0.5 ? '#a855f7' : '#ef4444'
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
            const scale = 1000 / (1000 + z2);
            
            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                zDepth: z2
            };
        };

        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string, segments: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); 
            ctx.rotate(angle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            // Vẽ đa giác bên trong
            ctx.beginPath();
            for(let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                if (i===0) ctx.moveTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
                else ctx.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        };

        const render = () => {
            frameRef.current++;
            
            // --- TILT & ROTATION ---
            rotationY += 0.01; // Xoay quanh trục Y
            // rotationX cố định khoảng 0.5 (nghiêng xuống) + rung nhẹ để tạo cảm giác trôi nổi
            rotationX = 0.5 + Math.sin(frameRef.current * 0.02) * 0.05; 
            
            floatTick += 0.03;
            const floatY = Math.sin(floatTick) * 8 - 20; 
            
            const pulse = (Math.sin(frameRef.current * 0.1) + 1) * 0.5; // Nhịp đập nhanh hơn cho hố đen

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. NỀN VÒNG TRÒN MA PHÁP (Dưới đất)
            drawMagicCircle(cx, cy + 150, 120, frameRef.current * 0.005, 'rgba(168, 85, 247, 0.3)', 6); 

            // 2. TÍNH TOÁN 3D CUBE
            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, floatY));
            
            // Sắp xếp mặt theo độ sâu (Painter's algorithm)
            const sortedFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += projectedVertices[i].zDepth);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            // Hàm vẽ mặt Cube
            const drawFace = (face: typeof sortedFaces[0], isFront: boolean) => {
                const pts = face.indices.map(i => projectedVertices[i]);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // Gradient kính tối màu (Glassy Dark)
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, 'rgba(10, 5, 15, 0.7)'); 
                grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.75)');
                grad.addColorStop(1, 'rgba(20, 5, 10, 0.7)'); 
                
                ctx.fillStyle = grad;
                ctx.fill();

                // Viền Neon
                const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                if (isFront) {
                    ctx.shadowBlur = 10 + pulse * 5;
                    ctx.shadowColor = '#a855f7';
                    strokeGrad.addColorStop(0, '#ef4444');
                    strokeGrad.addColorStop(1, '#a855f7');
                    ctx.lineWidth = 2;
                } else {
                    ctx.shadowBlur = 0;
                    strokeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                    strokeGrad.addColorStop(1, 'rgba(168, 85, 247, 0.3)');
                    ctx.lineWidth = 1;
                }
                ctx.strokeStyle = strokeGrad;
                ctx.stroke();

                // Hiệu ứng bóng kính (Highlight)
                if (isFront) {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fill();
                }
            };

            // A. VẼ MẶT SAU (BACK FACES)
            for (let i = 0; i < 3; i++) drawFace(sortedFaces[i], false);

            // B. VẼ HỐ ĐEN (BLACK HOLE CORE)
            // Vẽ ở giữa để nằm trong khối Cube
            ctx.save();
            ctx.translate(cx, cy + floatY); // Di chuyển theo độ nảy của cube
            
            // B1. Đĩa bồi tụ (Accretion Disk) - Xoáy năng lượng
            ctx.save();
            ctx.scale(1, 0.3); // Nén dẹt để trông 3D khớp với góc nghiêng
            ctx.rotate(frameRef.current * 0.05); // Xoay nhanh
            
            const diskRadius = 45 + pulse * 5;
            const diskGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, diskRadius);
            diskGrad.addColorStop(0, 'rgba(0,0,0,0)'); 
            diskGrad.addColorStop(0.4, 'rgba(147, 51, 234, 0.9)'); // Tím
            diskGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.8)'); // Đỏ
            diskGrad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = diskGrad;
            ctx.beginPath();
            ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // B2. Chân trời sự kiện (Event Horizon) - Lõi đen
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff'; // Hào quang trắng bao quanh lỗ đen
            ctx.fill();
            
            // Viền photon (Vòng sáng mỏng quanh lỗ đen)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // B3. Hạt bị hút vào (Suction Particles)
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += p.speed;
                p.radius -= 0.8; // Hút vào tâm
                
                if (p.radius < 10) {
                    p.radius = 60 + Math.random() * 40; // Reset ra xa
                    p.angle = Math.random() * Math.PI * 2;
                }

                const px = Math.cos(p.angle) * p.radius;
                const py = Math.sin(p.angle) * p.radius * 0.3; // Nén theo chiều dọc
                
                const alpha = Math.min(1, p.radius / 60);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            ctx.restore();

            // C. VẼ MẶT TRƯỚC (FRONT FACES)
            ctx.globalCompositeOperation = 'source-over';
            for (let i = 3; i < 6; i++) drawFace(sortedFaces[i], true);

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
