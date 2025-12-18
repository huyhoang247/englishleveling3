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

        // --- CẤU HÌNH HÌNH HỌC ---
        const size = 80; // Kích thước Cube to hơn chút
        // 8 đỉnh của khối lập phương
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 }, // Back
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }      // Front
        ];

        // Định nghĩa 6 mặt (mỗi mặt gồm 4 đỉnh theo thứ tự)
        // Màu sắc riêng cho từng mặt để tạo độ sâu giả
        const faces = [
            { indices: [0, 1, 2, 3], id: 'back' },
            { indices: [4, 5, 6, 7], id: 'front' },
            { indices: [0, 4, 7, 3], id: 'left' },
            { indices: [1, 5, 6, 2], id: 'right' },
            { indices: [0, 1, 5, 4], id: 'top' },
            { indices: [3, 2, 6, 7], id: 'bottom' }
        ];

        // Particles
        const particles: { x: number; y: number; z: number; speed: number; angle: number; radius: number }[] = [];
        for(let i = 0; i < 60; i++) {
            particles.push({
                x: 0, y: 0, z: 0,
                speed: 0.03 + Math.random() * 0.04,
                angle: Math.random() * Math.PI * 2,
                radius: 120 + Math.random() * 250 // Bán kính vòng ngoài
            });
        }

        let rotationX = 0;
        let rotationY = 0;
        let speed = 0.015;

        // Hàm chiếu 3D -> 2D
        const project = (v: { x: number, y: number, z: number }, rotX: number, rotY: number, scaleFactor: number) => {
            let x = v.x * scaleFactor;
            let y = v.y * scaleFactor;
            let z = v.z * scaleFactor;

            // Xoay quanh trục Y
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            // Xoay quanh trục X
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            // Phối cảnh (Perspective)
            const perspective = 800 / (800 + z2);
            return { 
                x: x1 * perspective + canvas.width / 2, 
                y: y2 * perspective + canvas.height / 2, 
                scale: perspective,
                zDepth: z2 // Lưu lại độ sâu để sắp xếp thứ tự vẽ
            };
        };

        const render = () => {
            frameRef.current++;
            // Tăng tốc dần
            if (speed < 0.08) speed += 0.0002;
            
            rotationX += speed;
            rotationY += speed * 0.7;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. VẼ PARTICLES (Nền sau)
            ctx.globalCompositeOperation = 'screen'; // Chế độ hòa trộn sáng
            particles.forEach(p => {
                p.angle += p.speed + (speed * 0.5);
                p.radius -= 2; // Hút nhanh vào tâm
                if (p.radius < 10) p.radius = 200 + Math.random() * 150;

                const px = Math.cos(p.angle) * p.radius;
                const pz = Math.sin(p.angle) * p.radius;
                const py = (Math.sin(frameRef.current * 0.05 + p.angle) * 30);
                
                // Project particle
                const proj = project({x: px/100, y: py/100, z: pz/100}, rotationX * 0.5, rotationY * 0.5, 100);
                
                const alpha = Math.min(1, p.radius / 150);
                ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`; // Cyan neon particles
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 1.5 * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // 2. TÍNH TOÁN VÀ VẼ CUBE LỚN (OUTER CUBE)
            // Tính vị trí 2D của tất cả các đỉnh
            const projectedVertices = vertices.map(v => project(v, rotationX, rotationY, size));

            // Tính độ sâu trung bình (Z-depth) của mỗi mặt để vẽ từ xa đến gần (Painter's Algorithm)
            const sortedFaces = faces.map(face => {
                let avgZ = 0;
                face.indices.forEach(i => avgZ += projectedVertices[i].zDepth);
                avgZ /= 4;
                return { ...face, z: avgZ };
            }).sort((a, b) => b.z - a.z); // Sắp xếp Z giảm dần (xa vẽ trước)

            // Vẽ từng mặt
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            
            sortedFaces.forEach(face => {
                const pts = face.indices.map(i => projectedVertices[i]);

                // Tạo Path cho mặt
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // Style cho mặt (Hiệu ứng kính công nghệ)
                // Gradient chéo cho mỗi mặt tạo cảm giác bóng bẩy
                const gradient = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');  // Cyan rất trong
                gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)'); // Đậm hơn ở giữa
                gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');

                ctx.fillStyle = gradient;
                
                // Glow cho viền
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#22d3ee';
                ctx.strokeStyle = 'rgba(165, 243, 252, 0.6)'; // Viền sáng màu cyan nhạt
                
                ctx.fill();
                ctx.stroke();
            });

            // 3. VẼ CORE CUBE (Khối nhỏ bên trong, xoay ngược chiều)
            // Tắt shadowBlur để core sắc nét hơn hoặc set màu khác
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#0891b2'; // Darker Cyan glow

            const coreSize = size * 0.4;
            // Dùng logic tương tự nhưng scale nhỏ hơn và xoay ngược
            const coreVertices = vertices.map(v => project(v, -rotationX * 1.5, -rotationY * 1.5, coreSize));
            
            // Vẽ core (đơn giản hóa: vẽ tất cả các cạnh hoặc vẽ solid như trên)
            // Để đẹp và nhanh, vẽ Core dạng Wireframe nhưng dày, sáng rực rỡ
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#cffafe'; // Trắng xanh
            ctx.beginPath();
            // Nối các cạnh của Core
            const edges = [
                [0,1], [1,2], [2,3], [3,0], // Back
                [4,5], [5,6], [6,7], [7,4], // Front
                [0,4], [1,5], [2,6], [3,7]  // Connectors
            ];
            edges.forEach(edge => {
                const p1 = coreVertices[edge[0]];
                const p2 = coreVertices[edge[1]];
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            });
            ctx.stroke();

            // Tô màu lõi core (một khối cầu năng lượng mờ ở giữa)
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            coreGradient.addColorStop(0.4, 'rgba(34, 211, 238, 0.5)');
            coreGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, coreSize * 1.2, 0, Math.PI * 2);
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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className="relative z-10 mt-64 font-bold text-cyan-300 tracking-[0.2em] animate-pulse text-xl uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                Crafting...
            </div>
        </div>
    );
});

export default CraftingEffectCanvas;
