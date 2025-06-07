// --- START OF FILE DungeonCanvasBackground.tsx ---

import React, { useRef, useEffect } from 'react';

// === CÁC HẰNG SỐ CẤU HÌNH CHO HIỆU ỨNG ===
const PARTICLE_COUNT = 50; // Tăng nhẹ so với bản DOM vì canvas xử lý rất tốt
const ORB_COUNT = 6;
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

interface Orb {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  // Cho hiệu ứng di chuyển mượt
  targetX: number;
  targetY: number;
  speed: number;
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

  // Chỉ chạy một lần để khởi tạo và chạy animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Khởi tạo ảnh icon
    const icon = new Image();
    icon.src = ICON_URL;
    icon.onload = () => {
      dungeonIconRef.current = icon;
      iconLoadedRef.current = true;
    };
    icon.onerror = () => {
      console.warn("Failed to load dungeon icon, using fallback.");
      const fallbackIcon = new Image();
      fallbackIcon.src = ICON_FALLBACK_URL;
      fallbackIcon.onload = () => {
        dungeonIconRef.current = fallbackIcon;
        iconLoadedRef.current = true;
      };
    };

    // Khởi tạo các hạt bụi
    particlesRef.current = [];
    const particleColors = [ 'rgba(253, 230, 138, 0.8)', 'rgba(100, 150, 255, 0.6)', 'rgba(150, 255, 100, 0.5)' ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.3, 0.3),
        vy: random(-0.3, 0.3),
        radius: random(1, 2.5),
        color: particleColors[Math.floor(random(0, particleColors.length))],
        opacity: random(0.3, 0.8),
      });
    }
    
    // Khởi tạo các quả cầu huyền ảo
    orbsRef.current = [];
    const orbColors = [ 'rgba(100, 150, 255, 0.6)', 'rgba(255, 100, 150, 0.5)', 'rgba(150, 255, 100, 0.4)' ];
    for (let i = 0; i < ORB_COUNT; i++) {
        const radius = random(10, 20);
        orbsRef.current.push({
            x: random(radius, width - radius),
            y: random(radius, height - radius),
            radius: radius,
            color: orbColors[Math.floor(random(0, orbColors.length))],
            opacity: random(0.2, 0.5),
            targetX: random(radius, width - radius),
            targetY: random(radius, height - radius),
            speed: random(0.005, 0.02),
        });
    }

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Vòng lặp animation
    const animate = (time: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      if (isPaused) {
        return; // Dừng vẽ khi game paused
      }
      
      ctx.clearRect(0, 0, width, height);

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

      // 4. Cập nhật và vẽ các quả cầu
      orbsRef.current.forEach(orb => {
        orb.x += (orb.targetX - orb.x) * orb.speed;
        orb.y += (orb.targetY - orb.y) * orb.speed;
        if (Math.abs(orb.targetX - orb.x) < 1 && Math.abs(orb.targetY - orb.y) < 1) {
          orb.targetX = random(orb.radius, width - orb.radius);
          orb.targetY = random(orb.radius, height - orb.radius);
        }
        ctx.beginPath();
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        grad.addColorStop(0.5, orb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.globalAlpha = orb.opacity;
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 5. Cập nhật và vẽ các hạt bụi
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
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []); // Chỉ chạy effect này một lần duy nhất khi component mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default React.memo(DungeonCanvasBackground);
