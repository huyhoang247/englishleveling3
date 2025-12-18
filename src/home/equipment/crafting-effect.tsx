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

        // Resize canvas to full screen
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // 3D Cube Logic
        const size = 60;
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Back face
            [4, 5], [5, 6], [6, 7], [7, 4], // Front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
        ];

        // Particle System
        const particles: { x: number; y: number; z: number; speed: number; angle: number; radius: number }[] = [];
        for(let i = 0; i < 50; i++) {
            particles.push({
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                z: (Math.random() - 0.5) * 400,
                speed: 0.02 + Math.random() * 0.05,
                angle: Math.random() * Math.PI * 2,
                radius: 100 + Math.random() * 200
            });
        }

        let rotationX = 0;
        let rotationY = 0;
        let speed = 0.02;

        const render = () => {
            frameRef.current++;
            // Tăng tốc độ xoay theo thời gian để tạo cảm giác "charge"
            if (speed < 0.15) speed += 0.0005;
            
            rotationX += speed;
            rotationY += speed * 0.6;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Gradient Background tối dần
            const gradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, 400);
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Projection Function
            const project = (v: { x: number, y: number, z: number }) => {
                let x = v.x * size;
                let y = v.y * size;
                let z = v.z * size;

                // Rotate Y
                const cosY = Math.cos(rotationY);
                const sinY = Math.sin(rotationY);
                const x1 = x * cosY - z * sinY;
                const z1 = z * cosY + x * sinY;

                // Rotate X
                const cosX = Math.cos(rotationX);
                const sinX = Math.sin(rotationX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = z1 * cosX + y * sinX;

                // Perspective
                const scale = 800 / (800 + z2);
                return { x: x1 * scale + cx, y: y2 * scale + cy, scale };
            };

            // Draw Particles (Energy sucking in)
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += p.speed + (speed * 0.5);
                p.radius -= 0.5; // Hút vào tâm
                if (p.radius < 20) p.radius = 200 + Math.random() * 100; // Reset

                const px = Math.cos(p.angle) * p.radius;
                const pz = Math.sin(p.angle) * p.radius;
                // Rotate particle view similar to cube
                const proj = project({ x: px/size, y: (Math.sin(frameRef.current * 0.05) * 50)/size, z: pz/size });
                
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2 * proj.scale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 255, ${Math.min(1, p.radius / 100)})`;
                ctx.fill();
            });

            // Draw Connections (Vertices)
            const projectedVertices = vertices.map(project);

            // Glow Effect
            ctx.shadowBlur = 20 + Math.sin(frameRef.current * 0.1) * 10;
            ctx.shadowColor = '#06b6d4'; // Cyan-500
            ctx.strokeStyle = '#22d3ee'; // Cyan-400
            ctx.lineWidth = 2;

            ctx.beginPath();
            edges.forEach(edge => {
                const v1 = projectedVertices[edge[0]];
                const v2 = projectedVertices[edge[1]];
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
            });
            ctx.stroke();

            // Inner Cube (Core)
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#a855f7'; // Purple glow
            ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.beginPath();
            // Vẽ đại diện một tâm sáng
            ctx.arc(cx, cy, 15 + Math.sin(frameRef.current * 0.2) * 5, 0, Math.PI * 2);
            ctx.fill();

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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className="relative z-10 mt-64 font-bold text-cyan-300 tracking-[0.2em] animate-pulse text-lg uppercase">
                Crafting Equipment...
            </div>
        </div>
    );
});

export default CraftingEffectCanvas;
