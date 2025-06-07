// --- START OF FILE DungeonCanvasBackground.tsx (VỚI CHUYỂN ĐỘNG ORB MƯỢT MÀ) ---

import React, { useRef, useEffect } from 'react';

// === CÁC HẰNG SỐ CẤU HÌNH CHO HIỆU ỨNG ===
const PARTICLE_COUNT = 50;
const ORB_COUNT = 8; // Tăng nhẹ số lượng orb cho thêm phần sống động
const ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2004_19_40%20PM.png";
const ICON_FALLBACK_URL = "https://placehold.co/192x192/2D1B69/FFFFFF?text=🏰";

// === CÁC HÀM TIỆN ÍCH ===
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// === INTERFACES CHO CÁC PHẦN TỬ ĐỘNG ===
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

// THAY ĐỔI: Cấu trúc Orb được làm lại hoàn toàn để hỗ trợ chuyển động mượt mà
interface Orb {
  // Điểm neo trung tâm mà quả cầu sẽ trôi nổi xung quanh
  anchorX: number;
  anchorY: number;
  // Bán kính quỹ đạo (cho phép quỹ đạo hình elip)
  orbitRadiusX: number;
  orbitRadiusY: number;
  // Góc hiện tại trên quỹ đạo
  angle: number;
  // Tốc độ quay
  angleSpeed: number;
  // Kích thước cơ bản
  radius: number;
  // Màu sắc và độ mờ
  color: string;
  baseOpacity: number;
}


interface DungeonCanvasBackgroundProps {
  isPaused: boolean;
}

const DungeonCanvasBackground: React.FC<DungeonCanvasBackgroundProps> = ({ isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const dungeonIconRef = useRef<HTMLImageElement | null>(null);
  const iconLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Khởi tạo ảnh icon (giữ nguyên)
    const icon = new Image();
    icon.src = ICON_URL;
    icon.onload = () => { dungeonIconRef.current = icon; iconLoadedRef.current = true; };
    icon.onerror = () => {
      console.warn("Failed to load dungeon icon, using fallback.");
      const fallbackIcon = new Image();
      fallbackIcon.src = ICON_FALLBACK_URL;
      fallbackIcon.onload = () => { dungeonIconRef.current = fallbackIcon; iconLoadedRef.current = true; };
    };
    
    // Vòng lặp animation chính
    const animate = (time: number) => {
        if (!isPaused) {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ... (Phần vẽ nền, đuốc, icon giữ nguyên) ...
            // 1. Vẽ nền Gradient
            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, '#0f0f23');
            bgGradient.addColorStop(0.5, '#16213e');
            bgGradient.addColorStop(1, '#0f0f23');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);
            
            // 2. Vẽ ánh đuốc
            const flicker = Math.sin(time / 500) * 0.1;
            const flicker2 = Math.sin(time / 700 + 2) * 0.05;

            const torch1Radius = width * 0.2 + flicker * 40;
            const torch1Grad = ctx.createRadialGradient(width * 0.15, height * 0.1, 0, width * 0.15, height * 0.1, torch1Radius);
            torch1Grad.addColorStop(0, `rgba(255, 120, 0, ${0.15 + flicker})`);
            torch1Grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
            ctx.fillStyle = torch1Grad;
            ctx.fillRect(0, 0, width, height);

            const torch2Radius = width * 0.15 + flicker2 * 30;
            const torch2Grad = ctx.createRadialGradient(width * 0.85, height * 0.2, 0, width * 0.85, height * 0.2, torch2Radius);
            torch2Grad.addColorStop(0, `rgba(255, 100, 0, ${0.1 + flicker2})`);
            torch2Grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
            ctx.fillStyle = torch2Grad;
            ctx.fillRect(0, 0, width, height);
            
            // 3. Vẽ icon ở giữa
            if (iconLoadedRef.current && dungeonIconRef.current) {
                const iconSize = Math.min(width, height) * 0.25;
                const iconX = (width - iconSize) / 2;
                const iconY = height * 0.15;
                ctx.save();
                ctx.globalAlpha = 0.8;
                ctx.shadowColor = 'rgba(100, 150, 255, 0.5)';
                ctx.shadowBlur = 30;
                ctx.drawImage(dungeonIconRef.current, iconX, iconY, iconSize, iconSize);
                ctx.restore();
            }

            // 4. CẬP NHẬT VÀ VẼ CÁC QUẢ CẦU (LOGIC MỚI)
            orbsRef.current.forEach(orb => {
                // Cập nhật góc để tạo chuyển động quay
                orb.angle += orb.angleSpeed;

                // Tính toán vị trí x, y mới dựa trên quỹ đạo elip
                const x = orb.anchorX + Math.cos(orb.angle) * orb.orbitRadiusX;
                const y = orb.anchorY + Math.sin(orb.angle) * orb.orbitRadiusY;

                // Tạo hiệu ứng "thở" (pulsating) cho kích thước và độ mờ
                const pulse = (Math.sin(orb.angle * 2.5) + 1) / 2; // giá trị từ 0 đến 1
                const currentRadius = orb.radius + pulse * 5;
                const currentOpacity = orb.baseOpacity * (0.7 + pulse * 0.3);

                // Vẽ quả cầu
                ctx.beginPath();
                const grad = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                grad.addColorStop(0.6, orb.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.fillStyle = grad;
                ctx.globalAlpha = currentOpacity;
                ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1; // Reset global alpha
            });

            // 5. Cập nhật và vẽ các hạt bụi (giữ nguyên)
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        }
        animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Sửa lỗi méo hình và khởi tạo các đối tượng
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const logicalWidth = width;
        const logicalHeight = height;

        // Khởi tạo hạt bụi (giữ nguyên)
        particlesRef.current = [];
        const particleColors = ['rgba(253, 230, 138, 0.8)', 'rgba(100, 150, 255, 0.6)', 'rgba(150, 255, 100, 0.5)'];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particlesRef.current.push({ x: random(0, logicalWidth), y: random(0, logicalHeight), vx: random(-0.3, 0.3), vy: random(-0.3, 0.3), radius: random(1, 2.5), color: particleColors[Math.floor(random(0, particleColors.length))], opacity: random(0.3, 0.8) });
        }
        
        // THAY ĐỔI: Khởi tạo các quả cầu với thuộc tính mới
        orbsRef.current = [];
        const orbColors = ['rgba(100, 150, 255, 0.6)', 'rgba(255, 100, 150, 0.5)', 'rgba(150, 255, 100, 0.4)'];
        for (let i = 0; i < ORB_COUNT; i++) {
            orbsRef.current.push({
                anchorX: random(logicalWidth * 0.2, logicalWidth * 0.8),
                anchorY: random(logicalHeight * 0.2, logicalHeight * 0.8),
                orbitRadiusX: random(50, logicalWidth / 4),
                orbitRadiusY: random(50, logicalHeight / 4),
                angle: random(0, Math.PI * 2),
                angleSpeed: random(0.002, 0.008) * (Math.random() > 0.5 ? 1 : -1), // Quay theo 2 chiều
                radius: random(15, 30),
                color: orbColors[Math.floor(random(0, orbColors.length))],
                baseOpacity: random(0.2, 0.5),
            });
        }
      }
    });

    resizeObserver.observe(canvas);
    animate(0);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }}
    />
  );
};

export default React.memo(DungeonCanvasBackground);
