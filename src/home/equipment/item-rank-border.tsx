// --- FILE: ui/item-rank-border.tsx ---

import React, { useRef, useEffect } from 'react';
import { type ItemRank } from './item-database.ts'; // Điều chỉnh đường dẫn import tùy dự án

// Định nghĩa màu sắc cho từng Rank
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

        // Lấy theme màu theo rank
        const theme = RANK_DATA[rank] || RANK_DATA['E'];
        let animationFrameId: number;
        let time = 0;

        // Hàm hỗ trợ vẽ hình chữ nhật bo góc
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
            // Tốc độ xoay: SSR xoay nhanh hơn
            time += rank === 'SSR' ? 0.04 : 0.02;

            const width = container.clientWidth;
            const height = container.clientHeight;
            // Xử lý màn hình Retina/High DPI
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
            }

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 12; // Độ bo góc
            const borderThickness = 3; // Độ dày viền

            // Xóa toàn bộ canvas để vẽ frame mới
            ctx.clearRect(0, 0, width, height);

            // 1. Vẽ hiệu ứng Glow (bóng đổ) phía sau
            if (showGlow) {
                ctx.save();
                ctx.shadowColor = theme.glow;
                ctx.shadowBlur = rank === 'SSR' ? 20 : 10;
                ctx.fillStyle = 'rgba(0,0,0,0)'; // Fill trong suốt, chỉ để lấy shadow
                roundedRect(ctx, 2, 2, width - 4, height - 4, radius);
                ctx.fill();
                ctx.restore();
            }

            // 2. Vẽ Gradient xoay (Conic Gradient)
            ctx.save();
            // Tạo vùng cắt (clip) hình chữ nhật bo góc
            roundedRect(ctx, 0, 0, width, height, radius);
            ctx.clip();

            // Di chuyển tâm để xoay
            ctx.translate(centerX, centerY);
            ctx.rotate(time);

            // Vẽ Gradient hình nón
            const gradientSize = Math.max(width, height) * 2;
            try {
                const conic = ctx.createConicGradient(0, 0, 0);
                conic.addColorStop(0, 'transparent'); // Trong suốt (đuôi)
                conic.addColorStop(0.2, theme.dark);  // Màu tối (chuyển tiếp)
                conic.addColorStop(0.4, theme.color); // Màu chính (sáng nhất)
                conic.addColorStop(0.6, theme.dark);  // Màu tối (chuyển tiếp)
                conic.addColorStop(0.8, 'transparent'); // Trong suốt (đầu)
                ctx.fillStyle = conic;
            } catch (e) {
                // Fallback cho trình duyệt cũ
                ctx.fillStyle = theme.color;
            }
            
            // Vẽ hình chữ nhật lớn chứa gradient xoay
            ctx.fillRect(-gradientSize / 2, -gradientSize / 2, gradientSize, gradientSize);
            ctx.restore();

            // 3. Vẽ phần nền bên trong (Mask) để che tâm gradient -> tạo thành viền
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Màu nền (Slate-900 opacity)
            roundedRect(
                ctx, 
                borderThickness, 
                borderThickness, 
                width - (borderThickness * 2), 
                height - (borderThickness * 2), 
                radius - 1
            );
            ctx.fill();
            
            // ĐÃ XÓA: Phần vẽ viền tĩnh (ctx.stroke) tại đây.
            // Giờ đây mép trong của viền sẽ hoàn toàn sạch và không có đường kẻ nào.

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
            {/* Canvas vẽ hiệu ứng nền và viền */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ width: '100%', height: '100%' }}
            />
            {/* Nội dung chính (Icon/Text) nằm đè lên trên */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default ItemRankBorder;
