// --- FILE: ui/item-rank-border.tsx ---

import React, { useRef, useEffect } from 'react';
import { type ItemRank } from '../data/item-database'; // Điều chỉnh đường dẫn import ItemRank tùy cấu trúc dự án của bạn

// Định nghĩa màu sắc dựa trên hieu-ung-rank.tsx
const RANK_DATA: Record<string, { color: string; glow: string; dark: string }> = {
    E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.6)', dark: '#4b5563' },     // Gray
    D: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)', dark: '#16a34a' },     // Green
    B: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', dark: '#2563eb' },     // Blue
    A: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', dark: '#9333ea' },    // Purple
    S: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', dark: '#ca8a04' },     // Gold
    SS: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.8)', dark: '#c2410c' },    // Orange
    SSR: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)', dark: '#7f1d1d' }     // Red
};

interface ItemRankBorderProps {
    rank: ItemRank;
    children: React.ReactNode;
    className?: string;
    showGlow?: boolean;
}

const ItemRankBorder: React.FC<ItemRankBorderProps> = ({ rank, children, className = '', showGlow = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const theme = RANK_DATA[rank] || RANK_DATA['E'];
        let animationFrameId: number;
        let time = 0;

        // Hàm vẽ hình chữ nhật bo góc
        const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        };

        const render = () => {
            // Tốc độ xoay
            time += rank === 'SSR' ? 0.04 : 0.02;

            const width = container.clientWidth;
            const height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;

            // Resize canvas nếu cần
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
            }

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 12; // Độ bo góc
            const borderThickness = 3; // Độ dày viền

            // Xóa canvas
            ctx.clearRect(0, 0, width, height);

            // 1. Vẽ hiệu ứng Glow nền (nếu bật)
            if (showGlow) {
                ctx.save();
                ctx.shadowColor = theme.glow;
                ctx.shadowBlur = rank === 'SSR' ? 20 : 10;
                ctx.fillStyle = 'rgba(0,0,0,0)'; // Transparent fill, chỉ lấy shadow
                roundedRect(ctx, 2, 2, width - 4, height - 4, radius);
                ctx.fill();
                ctx.restore();
            }

            // 2. Vẽ viền xoay (Spinning Gradient)
            ctx.save();
            // Tạo đường dẫn clip hình chữ nhật bo góc
            roundedRect(ctx, 0, 0, width, height, radius);
            ctx.clip();

            // Xoay quanh tâm
            ctx.translate(centerX, centerY);
            ctx.rotate(time);

            // Vẽ Gradient hình nón (Conic Gradient)
            const gradientSize = Math.max(width, height) * 2;
            try {
                const conic = ctx.createConicGradient(0, 0, 0);
                conic.addColorStop(0, 'transparent');
                conic.addColorStop(0.2, theme.dark);
                conic.addColorStop(0.4, theme.color); // Màu chính ở đây
                conic.addColorStop(0.6, theme.dark);
                conic.addColorStop(0.8, 'transparent');
                // Fallback màu nếu trình duyệt không hỗ trợ tốt
                ctx.fillStyle = conic;
            } catch (e) {
                ctx.fillStyle = theme.color;
            }
            
            ctx.fillRect(-gradientSize / 2, -gradientSize / 2, gradientSize, gradientSize);
            ctx.restore();

            // 3. Vẽ phần ruột bên trong (để che phần giữa của gradient, tạo cảm giác viền)
            // Màu nền bên trong (trùng với màu nền UI của bạn)
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Slate-900 with opacity
            roundedRect(
                ctx, 
                borderThickness, 
                borderThickness, 
                width - (borderThickness * 2), 
                height - (borderThickness * 2), 
                radius - 1
            );
            ctx.fill();
            
            // Vẽ thêm 1 viền mỏng tĩnh bên trong để sắc nét hơn
            ctx.strokeStyle = theme.glow;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [rank, showGlow]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Canvas nằm dưới cùng làm nền/viền */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ width: '100%', height: '100%' }}
            />
            {/* Nội dung (Icon) nằm đè lên trên */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default ItemRankBorder;
