// --- FILE: ui/crafting-effect.tsx ---

import React, { useEffect, memo } from 'react';

const CraftingEffectCanvas = memo(({ isActive }: { isActive: boolean }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>();
    const frameRef = React.useRef<number>(0);

    useEffect(() => {
        // Nếu không active thì hủy animation và thoát
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Xử lý Resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // --- CẤU HÌNH HÌNH HỌC (GEOMETRY) ---
        
        // Các đỉnh của hình lập phương (Vertices)
        const vertices = [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        // Các mặt của hình lập phương (Faces)
        const faces = [
            { indices: [0, 1, 2, 3], id: 'back' },
            { indices: [4, 5, 6, 7], id: 'front' },
            { indices: [0, 4, 7, 3], id: 'left' },
            { indices: [1, 5, 6, 2], id: 'right' },
            { indices: [0, 1, 5, 4], id: 'top' },
            { indices: [3, 2, 6, 7], id: 'bottom' }
        ];

        // --- HỆ THỐNG HẠT (PARTICLES) ---
        // Tạo ra các đốm lửa/năng lượng bay lên từ dưới
        const particles: { angle: number; radius: number; height: number; speed: number; life: number; colorVar: number }[] = [];
        for (let i = 0; i < 120; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,     // Góc xoay quanh tâm
                radius: 40 + Math.random() * 80,        // Khoảng cách từ tâm
                height: Math.random() * 200,            // Độ cao
                speed: 0.8 + Math.random() * 2,         // Tốc độ bay lên
                life: Math.random(),                    // Tuổi thọ hạt
                colorVar: Math.random()                 // Biến thể màu sắc
            });
        }

        // Biến trạng thái chuyển động
        let rotationMain = 0;
        let floatTick = 0;

        // --- HÀM CHIẾU 3D SANG 2D (PROJECTION) ---
        // Chuyển đổi tọa độ x,y,z sang x,y trên màn hình dựa trên kích thước và góc xoay
        const project = (v: { x: number, y: number, z: number }, rotX: number, rotY: number, transY: number, currentSize: number) => {
            // Áp dụng kích thước
            let x = v.x * currentSize;
            let y = v.y * currentSize;
            let z = v.z * currentSize;

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

            // Thêm hiệu ứng bay lên xuống (Float)
            const yFinal = y2 + transY;

            // Phối cảnh (Perspective): Vật ở xa (z lớn) sẽ nhỏ lại
            const scale = 1000 / (1000 + z2);
            
            return {
                x: x1 * scale + canvas.width / 2,
                y: yFinal * scale + canvas.height / 2,
                zDepth: z2,
                scale: scale
            };
        };

        // --- HÀM VẼ VÒNG TRÒN MA THUẬT DƯỚI ĐÁY ---
        const drawMagicCircle = (cx: number, cy: number, radius: number, angle: number, color: string, segments: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, 0.35); // Nén hình tròn thành hình elip để tạo phối cảnh mặt đất
            ctx.rotate(angle);

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            // Vẽ vòng tròn chính
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Vẽ các họa tiết bên trong (tam giác/đa giác xoay)
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

        // --- HÀM VẼ KHỐI LẬP PHƯƠNG (MESH) ---
        const drawCubeMesh = (
            size: number, 
            rX: number, 
            rY: number, 
            floatY: number,
            pulse: number,
            type: 'inner' | 'outer'
        ) => {
            // 1. Tính toán vị trí các đỉnh sau khi xoay
            const projectedVertices = vertices.map(v => project(v, rX, rY, floatY, size));
            
            // 2. Sắp xếp các mặt theo độ sâu Z (Painter's Algorithm) để mặt xa vẽ trước, mặt gần vẽ sau
            const sortedFaces = faces.map(face => {
                let zSum = 0;
                face.indices.forEach(i => zSum += projectedVertices[i].zDepth);
                return { ...face, z: zSum / 4 };
            }).sort((a, b) => b.z - a.z);

            // 3. Vẽ từng mặt
            sortedFaces.forEach(face => {
                const pts = face.indices.map(i => projectedVertices[i]);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                // --- STYLING (Màu sắc & Hiệu ứng) ---
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);

                if (type === 'inner') {
                    // CUBE TRONG: Lõi năng lượng, Đặc, Nóng (Đỏ đậm/Đen)
                    grad.addColorStop(0, '#3f0000'); 
                    grad.addColorStop(0.5, '#7f1d1d'); 
                    grad.addColorStop(1, '#000000');
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Glow mạnh cho lõi
                    ctx.shadowBlur = 20 + (pulse * 15);
                    ctx.shadowColor = '#ef4444'; 
                    ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
                    ctx.lineWidth = 2;
                } else {
                    // CUBE NGOÀI: Vỏ bảo vệ, Trong suốt, Huyền bí (Tím/Đen nhạt)
                    grad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
                    grad.addColorStop(0.5, 'rgba(20, 0, 30, 0.1)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Glow viền nhẹ
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#a855f7'; 
                    
                    // Viền Gradient đẹp
                    const strokeGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                    strokeGrad.addColorStop(0, '#dc2626'); // Đỏ
                    strokeGrad.addColorStop(1, '#9333ea'); // Tím
                    ctx.strokeStyle = strokeGrad;
                    ctx.lineWidth = 1.5;
                }
                
                ctx.stroke();
                ctx.shadowBlur = 0; // Reset shadow sau khi vẽ xong
            });
        };

        // --- VÒNG LẶP RENDER CHÍNH ---
        const render = () => {
            frameRef.current++;
            
            // Cập nhật các biến chuyển động
            rotationMain += 0.01; 
            floatTick += 0.02;
            const floatY = Math.sin(floatTick) * 12 - 40; // Bay lên xuống nhẹ nhàng
            
            // Nhịp đập (Pulse) cho hiệu ứng sáng
            const pulse = (Math.sin(frameRef.current * 0.05) + 1) * 0.5;

            // Xóa canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. VẼ MAGIC CIRCLE (Nền)
            drawMagicCircle(cx, cy + 130, 160, frameRef.current * 0.003, 'rgba(220, 38, 38, 0.5)', 6); 
            drawMagicCircle(cx, cy + 130, 100, -frameRef.current * 0.008, 'rgba(147, 51, 234, 0.4)', 5); 

            // 2. VẼ PARTICLES (Hạt bay lên)
            ctx.globalCompositeOperation = 'lighter'; // Chế độ hòa trộn làm sáng
            particles.forEach(p => {
                p.angle += 0.02;
                p.height += p.speed;
                p.radius -= 0.1;

                // Reset hạt khi bay quá cao hoặc quá nhỏ
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

            // 3. VẼ CUBES (Chính)
            ctx.globalCompositeOperation = 'source-over'; // Quay lại chế độ vẽ đè bình thường
            
            // Góc nghiêng chung cho cả 2 khối để nhìn thấy mặt trên
            const baseTilt = Math.sin(frameRef.current * 0.015) * 0.15 - 0.1;

            // -- INNER CUBE (Lõi) --
            // Nhỏ hơn (size 40), quay cùng chiều kim đồng hồ
            drawCubeMesh(40, baseTilt, rotationMain, floatY, pulse, 'inner');

            // -- OUTER CUBE (Vỏ) --
            // Lớn hơn (size 85), quay NGƯỢC chiều kim đồng hồ, lệch pha một chút
            drawCubeMesh(85, baseTilt, -rotationMain * 0.6 + Math.PI/4, floatY, pulse, 'outer');

            requestRef.current = requestAnimationFrame(render);
        };

        // Bắt đầu render
        render();

        // Cleanup function khi component unmount
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
