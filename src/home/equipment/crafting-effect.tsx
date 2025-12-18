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
        // Lưới 3x3x3 = 27 khối nhỏ
        const gridSize = 3; 
        const subCubeSize = 22; // Kích thước mỗi khối nhỏ
        const spacing = 2; // Khoảng cách giữa các khối khi đã ghép chặt

        // Định nghĩa 8 đỉnh cơ bản cho 1 khối lập phương đơn vị
        const baseVertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        // Các mặt của 1 khối cube
        const faces = [
            { indices: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 } }, // Back
            { indices: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 } },  // Front
            { indices: [0, 4, 7, 3], normal: { x: -1, y: 0, z: 0 } }, // Left
            { indices: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 } },  // Right
            { indices: [0, 1, 5, 4], normal: { x: 0, y: -1, z: 0 } }, // Top
            { indices: [3, 2, 6, 7], normal: { x: 0, y: 1, z: 0 } }   // Bottom
        ];

        // Tạo danh sách 27 vị trí trong lưới (x, y, z từ -1 đến 1)
        const gridPositions: {x: number, y: number, z: number}[] = [];
        const offset = Math.floor(gridSize / 2);
        for(let x = -offset; x <= offset; x++) {
            for(let y = -offset; y <= offset; y++) {
                for(let z = -offset; z <= offset; z++) {
                    gridPositions.push({x, y, z});
                }
            }
        }

        let rotationY = 0;
        let rotationX = 0;

        // Hàm chiếu 3D -> 2D
        const project = (x: number, y: number, z: number, rotX: number, rotY: number, transY: number) => {
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

            // Phối cảnh
            const scale = 1000 / (1000 + z2);
            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                zDepth: z2,
                scale: scale
            };
        };

        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); // Dẹt hơn chút
            ctx.rotate(angle);
            
            // Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            // Vòng tròn
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Hình vuông xoay bên trong
            ctx.beginPath();
            const r = radius * 0.7;
            for(let i=0; i<=4; i++) {
                const a = (i * Math.PI / 2);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.stroke();

            ctx.restore();
        };

        const render = () => {
            frameRef.current++;
            rotationY += 0.015;
            rotationX = Math.sin(frameRef.current * 0.015) * 0.2 - 0.3; // Nghiêng để nhìn từ trên xuống

            // Hiệu ứng "Thở" / Lắp ghép
            // gapFactor đi từ 0 (khép kín) đến 2.5 (bung ra)
            // Dùng hàm sin để tạo nhịp: Bung ra -> Hút vào -> Giữ chặt -> Bung ra
            const time = frameRef.current * 0.03;
            let gapFactor = (Math.sin(time) + 1) * 1.2; // 0 -> 2.4
            
            // Làm cho giai đoạn "khép kín" lâu hơn một chút để cảm thấy chắc chắn
            if (gapFactor < 0.3) gapFactor = 0; 

            // Khoảng cách thực tế giữa các tâm khối
            const currentSpread = (subCubeSize * 2 + spacing) + (gapFactor * 15);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. VẼ MAGIC CIRCLE (Đáy)
            drawMagicCircle(cx, cy + 180, 150, frameRef.current * 0.01, '#a855f7'); // Purple
            drawMagicCircle(cx, cy + 180, 90, -frameRef.current * 0.02, '#22d3ee'); // Cyan

            // 2. VẼ CÁC KHỐI CON (SUB-CUBES)
            // Để vẽ đúng thứ tự (khối xa vẽ trước, khối gần vẽ sau), ta cần tính Z-depth của tâm mỗi khối
            const cubesToDraw = gridPositions.map(pos => {
                // Tính vị trí tâm của sub-cube trong không gian 3D
                const worldX = pos.x * currentSpread;
                const worldY = pos.y * currentSpread;
                const worldZ = pos.z * currentSpread;

                // Chiếu tâm để lấy Z-depth dùng cho sorting
                const projectedCenter = project(worldX, worldY, worldZ, rotationX, rotationY, 0);
                
                return {
                    gridPos: pos,
                    worldPos: { x: worldX, y: worldY, z: worldZ },
                    zDepth: projectedCenter.zDepth,
                    // Tính độ rung nhẹ cho mỗi khối để tạo cảm giác năng lượng không ổn định
                    jitter: gapFactor > 0.5 ? {
                        x: (Math.random() - 0.5) * gapFactor * 2,
                        y: (Math.random() - 0.5) * gapFactor * 2
                    } : {x:0, y:0}
                };
            });

            // Sort: Xa (zDepth lớn) vẽ trước
            cubesToDraw.sort((a, b) => b.zDepth - a.zDepth);

            // Vẽ từng khối
            cubesToDraw.forEach(cube => {
                // Tính tọa độ 8 đỉnh của khối con này
                const projectedVerts = baseVertices.map(v => {
                    const vx = cube.worldPos.x + v.x * subCubeSize + cube.jitter.x;
                    const vy = cube.worldPos.y + v.y * subCubeSize + cube.jitter.y;
                    const vz = cube.worldPos.z + v.z * subCubeSize;
                    return project(vx, vy, vz, rotationX, rotationY, -30); // -30 để nâng toàn bộ cụm lên cao chút
                });

                // Vẽ các mặt của khối con
                // Một bản tối ưu hóa đơn giản: Chỉ vẽ mặt nếu nó hướng về phía camera (Back-face culling)
                // Tuy nhiên với cube bán trong suốt hoặc stroke, vẽ hết cũng đẹp. 
                // Ở đây ta dùng thuật toán Painter cho các mặt của khối con luôn.
                
                // Sort faces của khối con
                const sortedFaces = faces.map(face => {
                    let z = 0;
                    face.indices.forEach(i => z += projectedVerts[i].zDepth);
                    return { ...face, z: z/4 };
                }).sort((a, b) => b.z - a.z);

                sortedFaces.forEach(face => {
                    const pts = face.indices.map(i => projectedVerts[i]);

                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.closePath();

                    // --- STYLE CHO KHỐI CON ---
                    // Màu đen bóng (Obsidian)
                    ctx.fillStyle = `rgba(10, 10, 20, 0.95)`; 
                    
                    // Nếu các khối đang tách ra, cho lõi phát sáng
                    if (cube.gridPos.x === 0 && cube.gridPos.y === 0 && cube.gridPos.z === 0) {
                        ctx.fillStyle = `rgba(34, 211, 238, 0.8)`; // Lõi trung tâm sáng Cyan
                    }

                    ctx.fill();

                    // Viền Neon
                    ctx.lineWidth = 1.5;
                    // Đổi màu viền dựa trên vị trí để tạo gradient tổng thể cho khối lớn
                    // Trên tím, dưới xanh
                    const gradientStroke = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
                    gradientStroke.addColorStop(0, '#22d3ee'); // Cyan
                    gradientStroke.addColorStop(1, '#a855f7'); // Purple
                    
                    ctx.strokeStyle = gradientStroke;
                    
                    // Glow nhẹ cho viền
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = '#22d3ee';
                    
                    ctx.stroke();
                });
            });

            // 3. CORE GLOW (Khi hợp nhất)
            // Khi các khối chụm lại (gapFactor ~ 0), vẽ một luồng sáng chói lòa ở giữa
            if (gapFactor < 0.1) {
                const centerProj = project(0, 0, 0, rotationX, rotationY, -30);
                const pulse = 1 + Math.sin(frameRef.current * 0.2) * 0.2;
                
                const grad = ctx.createRadialGradient(centerProj.x, centerProj.y, 10, centerProj.x, centerProj.y, 150 * pulse);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.2, 'rgba(34, 211, 238, 0.6)');
                grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
                
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(centerProj.x, centerProj.y, 150 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
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
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0" />
            
            <div className="relative z-10 mt-80 flex flex-col items-center gap-2">
                <div className="font-black text-4xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-500 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse">
                    Crafting
                </div>
                <div className="flex gap-1">
                     <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                     <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300"></span>
                </div>
            </div>
        </div>
    );
});

export default CraftingEffectCanvas;
