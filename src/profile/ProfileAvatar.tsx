import React, { useRef, useEffect, useState } from 'react';

// --- Rank Configuration System (Lấy từ hieu-ung-rank.tsx) ---
export const RANK_DATA = {
  E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.6)', label: 'COMMON' },     // Gray
  D: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)', label: 'UNCOMMON' },  // Green
  B: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', label: 'RARE' },      // Blue
  A: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', label: 'EPIC' },       // Purple
  S: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', label: 'LEGENDARY' },    // Gold
  SS: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.8)', label: 'MYTHIC' },      // Orange
  SSR: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)', label: 'GODLY' }      // Red
};

interface ProfileAvatarProps {
    avatarUrl: string;
    rank?: keyof typeof RANK_DATA; // E, D, B, A, S, SS, SSR
    size?: number; // Kích thước hiển thị (width/height)
    className?: string;
    onClick?: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
    avatarUrl, 
    rank = 'D', 
    size = 120, 
    className = "",
    onClick 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Load hình ảnh avatar trước
    useEffect(() => {
        const img = new Image();
        img.src = avatarUrl;
        img.crossOrigin = "Anonymous"; // Xử lý CORS nếu cần
        img.onload = () => {
            imgRef.current = img;
            setImageLoaded(true);
        };
    }, [avatarUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded || !imgRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;
        
        // Cấu hình Rank
        const theme = RANK_DATA[rank] || RANK_DATA['D'];
        
        // Thiết lập kích thước Canvas (High DPI support)
        const dpr = window.devicePixelRatio || 1;
        // Canvas thực tế cần lớn hơn size hiển thị để chứa hiệu ứng glow bên ngoài
        const padding = 40; 
        const canvasSize = size + padding * 2;
        
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        
        // Scale context theo DPR
        ctx.scale(dpr, dpr);

        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const avatarRadius = size / 2; 

        // --- Helper Functions ---

        const drawRunes = (ctx: CanvasRenderingContext2D, radius: number, count: number, rotation: number) => {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.font = '10px monospace';
            ctx.fillStyle = theme.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.8;
            for (let i = 0; i < count; i++) {
                const angle = (i * 2 * Math.PI) / count;
                ctx.save();
                ctx.rotate(angle);
                ctx.translate(0, -radius);
                const char = String.fromCharCode(0x0391 + (i % 24)); // Các ký tự Hy Lạp giả lập Rune
                ctx.fillText(char, 0, 0);
                ctx.restore();
            }
            ctx.restore();
        };

        const render = () => {
            // Tốc độ animation dựa trên rank
            const speedMultiplier = rank === 'SSR' || rank === 'SS' ? 0.03 : 0.015;
            time += speedMultiplier;

            // Xóa canvas
            ctx.clearRect(0, 0, canvasSize, canvasSize);

            // 1. Vẽ Ánh sáng nền (Glow Background)
            ctx.save();
            ctx.translate(centerX, centerY);
            const grad = ctx.createRadialGradient(0, 0, avatarRadius * 0.8, 0, 0, avatarRadius * 1.5);
            grad.addColorStop(0, theme.glow.replace(/[\d.]+\)$/g, '0.1)'));
            grad.addColorStop(0.5, theme.glow.replace(/[\d.]+\)$/g, '0.3)'));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, avatarRadius + 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Vẽ Vòng tròn nét đứt xoay (Magic Ring Outer)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(time * 0.2);
            ctx.beginPath();
            ctx.setLineDash([15, 10]); 
            ctx.strokeStyle = theme.color;
            ctx.globalAlpha = 0.6;
            ctx.lineWidth = 1.5;
            // Bán kính vòng rune lớn hơn avatar một chút
            ctx.arc(0, 0, avatarRadius + 12, 0, Math.PI * 2); 
            ctx.stroke();
            
            // Vẽ 4 viên ngọc nhỏ trên vòng tròn
            ctx.setLineDash([]);
            for(let i=0; i<4; i++) {
               ctx.rotate(Math.PI / 2);
               ctx.save();
               ctx.translate(0, -(avatarRadius + 12));
               ctx.shadowColor = theme.color;
               ctx.shadowBlur = 10;
               ctx.fillStyle = theme.color;
               ctx.beginPath();
               ctx.arc(0, 0, 3, 0, Math.PI * 2);
               ctx.fill();
               ctx.restore();
            }
            ctx.restore();

            // 3. Vẽ Ký tự cổ ngữ (Runes)
            // Bán kính rune nằm giữa avatar và vòng tròn nét đứt
            drawRunes(ctx, avatarRadius + 5, 20, -time * 0.1);

            // 4. Vẽ Avatar (Clipped Circle)
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, avatarRadius - 4, 0, Math.PI * 2); // Avatar nhỏ hơn vòng tròn một chút để tạo viền
            ctx.clip(); // Cắt ảnh theo hình tròn
            
            // Vẽ ảnh
            if (imgRef.current) {
                ctx.drawImage(imgRef.current, centerX - avatarRadius + 4, centerY - avatarRadius + 4, (avatarRadius - 4) * 2, (avatarRadius - 4) * 2);
            }
            ctx.restore();

            // 5. Vẽ Viền Avatar (Inner Border)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.beginPath();
            ctx.arc(0, 0, avatarRadius - 4, 0, Math.PI * 2);
            ctx.strokeStyle = theme.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = theme.glow;
            ctx.shadowBlur = 10; // Hiệu ứng phát sáng viền ảnh
            ctx.stroke();
            ctx.restore();

            // 6. Hiệu ứng hạt năng lượng bay lên (Particles) - Chỉ cho Rank cao
            if (['S', 'SS', 'SSR'].includes(rank)) {
                const particleCount = rank === 'SSR' ? 4 : 2;
                for(let i = 0; i < particleCount; i++) {
                    const pAngle = time * (1 + i) + (i * Math.PI / 2);
                    const pRadius = avatarRadius + 12;
                    const px = centerX + Math.cos(pAngle) * pRadius;
                    const py = centerY + Math.sin(pAngle) * pRadius;
                    
                    ctx.save();
                    ctx.shadowColor = theme.color;
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [rank, size, imageLoaded]);

    return (
        <div 
            className={`relative flex items-center justify-center ${className}`} 
            style={{ width: size, height: size }}
            onClick={onClick}
        >
            {/* Nếu ảnh chưa load xong, hiện placeholder đơn giản */}
            {!imageLoaded && (
                 <div className="absolute inset-0 rounded-full bg-slate-800 animate-pulse border-2 border-slate-700"></div>
            )}
            
            {/* Canvas vẽ hiệu ứng + Avatar */}
            <canvas 
                ref={canvasRef} 
                style={{ 
                    width: size + 80, // Cộng thêm padding để không bị cắt glow
                    height: size + 80,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none' // Để click event xuyên qua div cha nếu cần
                }} 
            />
            
            {/* Icon máy ảnh đè lên trên cùng (nếu muốn giữ nút edit) - Sẽ được handle bởi parent component, 
                nhưng ở đây ta để trống để logic canvas không bị che */}
        </div>
    );
};

export default ProfileAvatar;
