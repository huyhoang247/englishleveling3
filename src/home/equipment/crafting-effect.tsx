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

        // Resize handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // --- CẤU HÌNH ---
        // Định nghĩa đỉnh cơ bản
        const baseVertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        // Định nghĩa các cạnh nối để vẽ khung dây
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Back face
            [4, 5], [5, 6], [6, 7], [7, 4], // Front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ];

        // Định nghĩa các mặt để tô màu (chỉ dùng cho lõi hoặc hiệu ứng mờ)
        const faces = [
            { indices: [0, 1, 2, 3] }, { indices: [4, 5, 6, 7] },
            { indices: [0, 4, 7, 3] }, { indices: [1, 5, 6, 2] },
            { indices: [0, 1, 5, 4] }, { indices: [3, 2, 6, 7] }
        ];

        // Hệ thống hạt: Tàn lửa (Embers)
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 40 + Math.random() * 100,
                height: Math.random() * 200,
                speed: 1 + Math.random() * 3,
                life: Math.random(),
                colorVar: Math.random()
            });
        }

        let rotY_Outer = 0;
        let rotX_Outer = 0;
        let rotY_Inner = 0;
        let rotX_Inner = 0;
        let floatTick = 0;

        // Hàm chiếu 3D sang 2D
        const project = (v: { x: number, y: number, z: number }, size: number, rotX: number, rotY: number, transY: number) => {
            let x = v.x * size;
            let y = v.y * size;
            let z = v.z * size;

            // Xoay Y
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            // Xoay X
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            const yFinal = y2 + transY;
            const scale = 1000 / (1000 + z2); // Perspective

            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                z: z2, // Độ sâu để sort
                scale: scale
            };
        };

        // Hàm vẽ tia sét (Lightning)
        const drawLightning = (x1: number, y1: number, x2: number, y2: number, displace: number, color: string) => {
            if (displace < 2) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                return;
            }
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const offsetX = (Math.random() - 0.5) * displace;
            const offsetY = (Math.random() - 0.5) * displace;
            
            drawLightning(x1, y1, midX + offsetX, midY + offsetY, displace / 2, color);
            drawLightning(midX + offsetX, midY + offsetY, x2, y2, displace / 2, color);
        };

        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string, segments: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); 
            ctx.rotate(angle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            // Vẽ các đa giác bên trong
            ctx.beginPath();
            for(let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = Math.cos(theta) * radius;
                const y = Math.sin(theta) * radius;
                if (i===0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        };

        const render = () => {
            frameRef.current++;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Animation vars
            rotY_Outer += 0.005; // Outer quay chậm
            rotX_Outer = Math.sin(frameRef.current * 0.01) * 0.2; 
            
            rotY_Inner -= 0.02; // Inner quay nhanh ngược chiều
            rotX_Inner = Math.cos(frameRef.current * 0.015) * 0.4;

            floatTick += 0.03;
            const floatY = Math.sin(floatTick) * 15 - 30; 
            const pulse = (Math.sin(frameRef.current * 0.1) + 1) * 0.5; // Nhịp đập nhanh

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // --- 1. MAGIC CIRCLES (Sàn) ---
            drawMagicCircle(cx, cy + 150, 160, frameRef.current * 0.005, 'rgba(220, 38, 38, 0.4)', 3); // Tam giác đỏ
            drawMagicCircle(cx, cy + 150, 100, -frameRef.current * 0.01, 'rgba(168, 85, 247, 0.5)', 6); // Lục giác tím

            // --- 2. PARTICLES (Lên trước để bị cube che nếu cần, hoặc dùng blend mode) ---
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.angle += 0.01;
                p.height += p.speed;
                if (p.height > 250) {
                    p.height = -50;
                    p.radius = 40 + Math.random() * 80;
                }
                const groundY = cy + 130;
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = groundY - p.height; 
                const alpha = Math.max(0, (1 - (p.height / 200)));
                
                // Màu lửa pha tím
                const r = 255;
                const g = p.colorVar > 0.5 ? 50 : 0; 
                const b = p.colorVar > 0.5 ? 50 : 150;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // --- 3. INNER CUBE (LÕI NĂNG LƯỢNG) ---
            const innerSize = 35 + pulse * 5; // Lõi đập
            const innerPoints = baseVertices.map(v => project(v, innerSize, rotX_Inner, rotY_Inner, floatY));
            
            // Vẽ lõi đặc
            const sortedInnerFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += innerPoints[i].z);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            sortedInnerFaces.forEach(face => {
                const pts = face.indices.map(i => innerPoints[i]);
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
                // Lõi sáng rực rỡ
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
                ctx.shadowColor = '#d8b4fe'; // Tím nhạt
                ctx.shadowBlur = 30;
                ctx.fill();
            });

            // --- 4. OUTER CUBE (VỎ BẢO VỆ & SÉT) ---
            const outerSize = 85;
            const outerPoints = baseVertices.map(v => project(v, outerSize, rotX_Outer, rotY_Outer, floatY));

            // Vẽ các cạnh tia sét (Lightning Edges)
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#dc2626'; // Đỏ
            edges.forEach(edge => {
                const p1 = outerPoints[edge[0]];
                const p2 = outerPoints[edge[1]];
                
                // Chỉ vẽ sét ngẫu nhiên để tạo hiệu ứng chập chờn (flicker)
                if (Math.random() > 0.1) {
                    // Màu chuyển từ Đỏ sang Tím
                    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad.addColorStop(0, '#ef4444');
                    grad.addColorStop(1, '#a855f7');
                    
                    // Vẽ đường thẳng mờ làm nền
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    // Vẽ sét chồng lên
                    drawLightning(p1.x, p1.y, p2.x, p2.y, 8, '#fca5a5'); 
                }
            });

            // Kết nối năng lượng từ Lõi ra Vỏ (Energy Arcs)
            if (frameRef.current % 3 === 0) { // Không vẽ mọi frame để đỡ rối
                for (let i = 0; i < 4; i++) {
                    const idxInner = Math.floor(Math.random() * 8);
                    const idxOuter = Math.floor(Math.random() * 8);
                    const pIn = innerPoints[idxInner];
                    const pOut = outerPoints[idxOuter];
                    
                    ctx.shadowColor = '#a855f7';
                    ctx.shadowBlur = 15;
                    drawLightning(pIn.x, pIn.y, pOut.x, pOut.y, 15, 'rgba(168, 85, 247, 0.6)');
                }
            }

            // Vẽ các mặt kính mờ cho Outer Cube (tạo khối)
            const sortedOuterFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += outerPoints[i].z);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            // Chỉ vẽ các mặt phía sau (để không che mất tia sét phía trước quá nhiều)
            // hoặc vẽ bán trong suốt
            ctx.globalCompositeOperation = 'source-over'; // Reset blend mode để vẽ mặt tối
            sortedOuterFaces.forEach(face => {
                const pts = face.indices.map(i => outerPoints[i]);
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // Gradient tối ma thuật
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                grad.addColorStop(0, 'rgba(0, 0, 0, 0.1)'); 
                grad.addColorStop(0.5, 'rgba(20, 0, 10, 0.4)'); 
                grad.addColorStop(1, 'rgba(0, 0, 0, 0.1)'); 
                
                ctx.fillStyle = grad;
                ctx.fill();
                
                // Viền mỏng
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none bg-black/70">
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Optional Text Overlay if needed */}
            <div className="absolute top-[65%] text-white/80 font-mono tracking-widest text-sm animate-pulse z-10">
                CONSTRUCTING ARTIFACT...
            </div>
        </div>
    );
});

export default CraftingEffectCanvas;
