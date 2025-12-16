// --- FILE: ui/item-rank-border.tsx ---

import React, { useRef, useEffect } from 'react';
import { type ItemRank } from './item-database.ts';

const RANK_DATA: Record<string, { color: string; glow: string; dark: string }> = {
    E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.6)', dark: '#4b5563' },
    D: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)', dark: '#16a34a' },
    B: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', dark: '#2563eb' },
    A: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', dark: '#9333ea' },
    S: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', dark: '#ca8a04' },
    SS: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.8)', dark: '#c2410c' },
    SSR: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)', dark: '#7f1d1d' }
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
    // Lưu kích thước vào ref để không trigger render lại component
    const sizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: true }); // alpha: true để tối ưu trong suốt
        if (!ctx) return;

        const theme = RANK_DATA[rank] || RANK_DATA['E'];
        let animationFrameId: number;
        let time = 0;

        // --- TỐI ƯU 1: ResizeObserver ---
        // Chỉ cập nhật kích thước khi thực sự thay đổi, không đo trong vòng lặp render
        const updateSize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            
            sizeRef.current = { width, height };

            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
            }
        };

        const resizeObserver = new ResizeObserver(() => updateSize());
        resizeObserver.observe(container);
        updateSize(); // Gọi lần đầu

        // Hàm vẽ path bo góc (tái sử dụng)
        const roundedRectPath = (ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) => {
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, radius); // Sử dụng API native mới nếu trình duyệt hỗ trợ (nhanh hơn)
        };
        
        // Fallback nếu trình duyệt cũ chưa hỗ trợ roundRect
        const manualRoundedRect = (ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) => {
             ctx.beginPath();
             ctx.moveTo(radius, 0);
             ctx.lineTo(width - radius, 0);
             ctx.quadraticCurveTo(width, 0, width, radius);
             ctx.lineTo(width, height - radius);
             ctx.quadraticCurveTo(width, height, width - radius, height);
             ctx.lineTo(radius, height);
             ctx.quadraticCurveTo(0, height, 0, height - radius);
             ctx.lineTo(0, radius);
             ctx.quadraticCurveTo(0, 0, radius, 0);
             ctx.closePath();
        };

        const drawRect = ctx.roundRect ? roundedRectPath : manualRoundedRect;

        const render = () => {
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            time += rank === 'SSR' ? 0.04 : 0.02;

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 12; 
            const borderThickness = 3; 

            ctx.clearRect(0, 0, width, height);

            // --- TỐI ƯU 2: Bỏ phần vẽ Glow bằng Canvas ở đây ---
            // (Chúng ta sẽ dùng CSS box-shadow ở thẻ div cha để nhẹ hơn)

            // 1. Vẽ Gradient xoay
            ctx.save();
            drawRect(ctx, width, height, radius);
            ctx.clip();

            ctx.translate(centerX, centerY);
            ctx.rotate(time);

            const gradientSize = Math.max(width, height) * 2; // Tính 1 lần nếu cần siêu tối ưu, nhưng ở đây ok
            
            // Vẽ gradient
            try {
                const conic = ctx.createConicGradient(0, 0, 0);
                conic.addColorStop(0, 'transparent');
                conic.addColorStop(0.2, theme.dark);
                conic.addColorStop(0.4, theme.color);
                conic.addColorStop(0.6, theme.dark);
                conic.addColorStop(0.8, 'transparent');
                ctx.fillStyle = conic;
            } catch (e) {
                ctx.fillStyle = theme.color;
            }
            
            ctx.fillRect(-gradientSize / 2, -gradientSize / 2, gradientSize, gradientSize);
            ctx.restore();

            // 2. Vẽ phần nền bên trong (Mask)
            ctx.save();
            // Điều chỉnh tọa độ để trừ đi độ dày viền
            ctx.translate(borderThickness, borderThickness);
            
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Màu nền
            drawRect(ctx, width - borderThickness * 2, height - borderThickness * 2, radius - 1);
            ctx.fill();
            
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [rank]); // Bỏ showGlow khỏi dependency vì dùng CSS

    // Lấy theme cho CSS shadow
    const theme = RANK_DATA[rank] || RANK_DATA['E'];
    // Style cho box-shadow (Hiệu năng tốt hơn canvas shadow)
    const glowStyle = showGlow ? {
        boxShadow: `0 0 ${rank === 'SSR' ? '20px' : '10px'} ${theme.glow}`
    } : {};

    return (
        <div 
            ref={containerRef} 
            className={`relative overflow-hidden rounded-xl ${className}`}
            style={{ 
                ...glowStyle,
                transition: 'box-shadow 0.3s ease' // Thêm hiệu ứng chuyển mượt
            }}
        >
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default ItemRankBorder;
