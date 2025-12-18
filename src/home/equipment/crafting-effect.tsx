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
        const cubeSize = 75; 
        
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
            const scale = 1000 / (1000 + z2);
            
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

            ctx.beginPath();
            for(let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                ctx.moveTo(Math.cos(theta) * (radius * 0.9), Math.sin(theta) * (radius * 0.9));
                ctx.lineTo(Math.cos(theta) * (radius * 1.1), Math.sin(theta) * (radius * 1.1));
                
                const nextTheta = ((i + 2) / segments) * Math.PI * 2;
                ctx.moveTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
                ctx.lineTo(Math.cos(nextTheta) * radius, Math.sin(nextTheta) * radius);
            }
            ctx.stroke();
            ctx.restore();
        };

        const render = () => {
            frameRef.current++;
            rotationY += 0.008; 
            rotationX = Math.sin(frameRef.current * 0.015) * 0.15 - 0.1; 
            floatTick += 0.02;
            const floatY = Math.sin(floatTick) * 10 - 40; 
            
            const pulse = (Math.sin(frameRef.current * 0.05) + 1) * 0.5;

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

            // 3. DARK CUBE
            ctx.globalCompositeOperation = 'source-over';

            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, floatY));
            
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

                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, '#000000'); 
                grad.addColorStop(0.4, '#1a0505'); 
                grad.addColorStop(0.6, '#0f0518'); 
                grad.addColorStop(1, '#000000'); 
                
                ctx.fillStyle = grad;
                ctx.fill();

                const glowIntensity = 15 + (pulse * 10);
                ctx.shadowBlur = glowIntensity;
                ctx.shadowColor = '#dc2626'; 
                
                const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                strokeGrad.addColorStop(0, '#ef4444');
                strokeGrad.addColorStop(1, '#a855f7');

                ctx.lineWidth = 2;
                ctx.strokeStyle = strokeGrad;
                ctx.stroke();
                
                ctx.shadowBlur = 0; 
                ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                ctx.fill();
            });

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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/40 backdrop-blur-[1px]">
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Đã xóa text và loading bar */}
        </div>
    );
});

export default CraftingEffectCanvas;
