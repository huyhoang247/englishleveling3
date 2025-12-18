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

        // --- CONFIGURATION ---
        const cubeSize = 75; 
        
        // Cube Vertices
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        // Inner Core Vertices (Octahedron for the energy source)
        const coreVertices = [
            { x: 0, y: -0.5, z: 0 },  // Top
            { x: 0, y: 0.5, z: 0 },   // Bottom
            { x: -0.5, y: 0, z: 0 },  // Left
            { x: 0.5, y: 0, z: 0 },   // Right
            { x: 0, y: 0, z: -0.5 },  // Back
            { x: 0, y: 0, z: 0.5 },   // Front
        ];

        const coreEdges = [
            [0,2], [0,3], [0,4], [0,5], // Top to middle
            [1,2], [1,3], [1,4], [1,5], // Bottom to middle
            [2,4], [4,3], [3,5], [5,2]  // Middle ring
        ];

        const faces = [
            { indices: [0, 1, 2, 3], id: 'back' },
            { indices: [4, 5, 6, 7], id: 'front' },
            { indices: [0, 4, 7, 3], id: 'left' },
            { indices: [1, 5, 6, 2], id: 'right' },
            { indices: [0, 1, 5, 4], id: 'top' },
            { indices: [3, 2, 6, 7], id: 'bottom' }
        ];

        // Particle System: Embers
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

        // 3D Projection Helper
        const project = (v: { x: number, y: number, z: number }, rotX: number, rotY: number, transY: number, size: number) => {
            let x = v.x * size;
            let y = v.y * size;
            let z = v.z * size;

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
            
            const pulse = (Math.sin(frameRef.current * 0.05) + 1) * 0.5; // 0 to 1

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. MAGIC CIRCLE (Bottom)
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

            // 3. 3D OBJECTS PREPARATION
            ctx.globalCompositeOperation = 'source-over';
            
            // Project Outer Cube
            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, floatY, cubeSize));
            
            // Sort Faces (Painter's Algorithm)
            const sortedFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += projectedVertices[i].zDepth);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z); // Furthest first

            // Function to draw a single face
            const drawFace = (face: typeof sortedFaces[0], isFront: boolean) => {
                const pts = face.indices.map(i => projectedVertices[i]);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // GRADIENT FILL - 70% Opacity
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)'); 
                grad.addColorStop(0.4, 'rgba(26, 5, 5, 0.7)'); 
                grad.addColorStop(0.6, 'rgba(15, 5, 24, 0.7)'); 
                grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)'); 
                
                ctx.fillStyle = grad;
                ctx.fill();

                // STROKE & GLOW
                const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                
                if (isFront) {
                    const glowIntensity = 15 + (pulse * 10);
                    ctx.shadowBlur = glowIntensity;
                    ctx.shadowColor = '#dc2626'; 
                    strokeGrad.addColorStop(0, '#ef4444');
                    strokeGrad.addColorStop(1, '#a855f7');
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = strokeGrad;
                } else {
                    // Back faces are dimmer
                    ctx.shadowBlur = 0;
                    strokeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                    strokeGrad.addColorStop(1, 'rgba(168, 85, 247, 0.3)');
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = strokeGrad;
                }

                ctx.stroke();
                
                // GLASS SHINE
                ctx.shadowBlur = 0; 
                ctx.fillStyle = isFront ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)';
                ctx.fill();
            };

            // --- RENDER ORDER: Back Faces -> Core -> Front Faces ---

            // A. Draw Back Faces (indices 0, 1, 2)
            for (let i = 0; i < 3; i++) {
                drawFace(sortedFaces[i], false);
            }

            // B. Draw Energy Core (Lõi năng lượng)
            // Use lighter composition for intense glow
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            
            // Core Center Position
            const coreY = cy + floatY * 1.5; // Slightly parallax with cube
            
            // 1. Core Halo/Glow
            const coreRadius = 25 + pulse * 10;
            const coreGrad = ctx.createRadialGradient(cx, coreY, 5, cx, coreY, coreRadius * 2);
            coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            coreGrad.addColorStop(0.2, 'rgba(168, 85, 247, 0.8)'); // Purple
            coreGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.4)'); // Red
            coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, coreY, coreRadius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // 2. Core Inner Crystal (Rotating Octahedron)
            // Rotate contrary to main cube for visual interest
            const coreRotY = -rotationY * 2;
            const coreRotX = rotationX * 2;
            const projectedCore = coreVertices.map(v => project(v, coreRotX, coreRotY, floatY, 35)); // Size 35

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            coreEdges.forEach(edge => {
                const p1 = projectedCore[edge[0]];
                const p2 = projectedCore[edge[1]];
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            });
            ctx.stroke();
            
            // Bright white center dot
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, coreY, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // C. Draw Front Faces (indices 3, 4, 5)
            for (let i = 3; i < 6; i++) {
                drawFace(sortedFaces[i], true);
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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/60">
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
});

export default CraftingEffectCanvas;
