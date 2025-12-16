// --- FILE: ui/item-rank-border.tsx ---

import React, { useRef, useEffect } from 'react';
import { type ItemRank } from './item-database.ts';

// --- TỐI ƯU MÀU SẮC: GIẢM OPACITY CỦA 'glow' ĐỂ TINH TẾ HƠN ---
const RANK_DATA: Record<string, { color: string; glow: string; dark: string }> = {
    // Rank thấp: Glow rất nhẹ (0.2 - 0.3)
    E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.2)', dark: '#4b5563' },
    D: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.25)', dark: '#16a34a' },
    B: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.3)', dark: '#2563eb' },
    
    // Rank trung bình: Glow vừa phải (0.4)
    A: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)', dark: '#9333ea' },
    S: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.45)', dark: '#ca8a04' },
    
    // Rank cao: Glow rõ hơn nhưng không quá gắt (0.5 - 0.6)
    SS: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', dark: '#c2410c' },
    SSR: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', dark: '#7f1d1d' }
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
    const sizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const theme = RANK_DATA[rank] || RANK_DATA['E'];
        let animationFrameId: number;
        let time = 0;

        // ResizeObserver để tối ưu hiệu năng
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
        updateSize();

        // Polyfill vẽ bo góc
        const roundedRectPath = (ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) => {
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, width, height, radius);
            } else {
                // Fallback thủ công
                ctx.moveTo(radius, 0);
                ctx.lineTo(width - radius, 0);
                ctx.quadraticCurveTo(width, 0, width, radius);
                ctx.lineTo(width, height - radius);
                ctx.quadraticCurveTo(width, height, width - radius, height);
                ctx.lineTo(radius, height);
                ctx.quadraticCurveTo(0, height, 0, height - radius);
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
            }
            ctx.closePath();
        };

        const render = () => {
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            // Tốc độ xoay
            time += rank === 'SSR' ? 0.04 : 0.02;

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 12; 
            const borderThickness = 3; 

            ctx.clearRect(0, 0, width, height);

            // 1. Vẽ Gradient xoay
            ctx.save();
            roundedRectPath(ctx, width, height, radius);
            ctx.clip();

            ctx.translate(centerX, centerY);
            ctx.rotate(time);

            const gradientSize = Math.max(width, height) * 2;
            
            try {
                const conic = ctx.createConicGradient(0, 0, 0);
                conic.addColorStop(0, 'transparent');
                conic.addColorStop(0.2, theme.dark);
                conic.addColorStop(0.4, theme.color); // Màu chính
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
            ctx.translate(borderThickness, borderThickness);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // Tăng độ đặc nền lên 0.95 để contrast tốt hơn với viền mỏng
            roundedRectPath(ctx, width - borderThickness * 2, height - borderThickness * 2, radius - 1);
            ctx.fill();
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [rank]);

    const theme = RANK_DATA[rank] || RANK_DATA['E'];

    // --- TỐI ƯU SHADOW: GIẢM SIZE VÀ THÊM SPREAD ÂM ĐỂ GỌN HƠN ---
    const glowStyle: React.CSSProperties = showGlow ? {
        // SSR: 12px (cũ 20px), Các rank khác: 6px (cũ 10px)
        // Thêm spread radius (tham số thứ 4) là 0 hoặc -1px để bóng ôm sát hơn
        boxShadow: `0 0 ${rank === 'SSR' ? '12px' : '6px'} ${theme.glow}`,
        border: `1px solid ${theme.glow}`, // Thêm viền border thật cực mờ cùng màu glow để tạo khuôn
        borderColor: 'rgba(255,255,255,0.05)' // Hoặc viền trắng siêu mờ để bắt sáng
    } : {};

    return (
        <div 
            ref={containerRef} 
            className={`relative overflow-hidden rounded-xl ${className}`}
            style={{ 
                ...glowStyle,
                // Ghi đè borderColor bằng theme màu nhưng rất nhạt để tạo viền giới hạn tinh tế
                borderColor: theme.dark, 
                borderWidth: '0px', // Nếu muốn hoàn toàn không có viền cứng thì để 0px, hoặc 1px solid theme.dark
                transition: 'box-shadow 0.3s ease'
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
