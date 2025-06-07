import React, { useRef, useEffect } from 'react';

// === CÁC HẰNG SỐ CẤU HÌNH CHO HIỆU ỨNG ===
const PARTICLE_COUNT = 25; // Giảm xuống để match với CSS version
const ORB_COUNT = 4; // Giảm xuống để match với CSS version
const FLOATING_MOTES_COUNT = 6;
const GOD_RAYS_COUNT = 4;
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
  baseOpacity: number;
  phase: number;
}

interface Orb {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  targetX: number;
  targetY: number;
  speed: number;
  phase: number;
}

interface FloatingMote {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  phase: number;
  speed: number;
  path: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };
}

interface GodRay {
  x: number;
  width: number;
  opacity: number;
  baseOpacity: number;
  phase: number;
  speed: number;
  skew: number;
}

interface DungeonCanvasBackgroundProps {
  isPaused: boolean;
}

const DungeonCanvasBackground: React.FC<DungeonCanvasBackgroundProps> = ({ isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const motesRef = useRef<FloatingMote[]>([]);
  const godRaysRef = useRef<GodRay[]>([]);
  const dungeonIconRef = useRef<HTMLImageElement | null>(null);
  const iconLoadedRef = useRef<boolean>(false);

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

    // Khởi tạo các hạt bụi (particles)
    particlesRef.current = [];
    const particleColors = [ 
      'rgba(253, 230, 138, 0.8)', 
      'rgba(100, 150, 255, 0.6)', 
      'rgba(255, 100, 150, 0.7)',
      'rgba(150, 255, 100, 0.5)', 
      'rgba(255, 200, 100, 0.9)' 
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.5, 0.5),
        vy: random(-0.5, 0.5),
        radius: random(1, 3),
        color: particleColors[Math.floor(random(0, particleColors.length))],
        opacity: random(0.2, 0.8),
        baseOpacity: random(0.2, 0.8),
        phase: random(0, Math.PI * 2),
      });
    }
    
    // Khởi tạo các quả cầu huyền ảo (mystical orbs)
    orbsRef.current = [];
    const orbColors = [ 
      'rgba(100, 150, 255, 0.6)', 
      'rgba(255, 100, 150, 0.5)', 
      'rgba(150, 255, 100, 0.4)',
      'rgba(255, 200, 100, 0.7)' 
    ];
    for (let i = 0; i < ORB_COUNT; i++) {
        const radius = random(10, 25);
        orbsRef.current.push({
            x: random(radius, width - radius),
            y: random(radius, height - radius),
            radius: radius,
            color: orbColors[Math.floor(random(0, orbColors.length))],
            opacity: random(0.3, 0.7),
            targetX: random(radius, width - radius),
            targetY: random(radius, height - radius),
            speed: random(0.003, 0.015),
            phase: random(0, Math.PI * 2),
        });
    }

    // Khởi tạo floating motes
    motesRef.current = [];
    const moteColors = [
      'rgba(255, 204, 153, 0.7)',
      'rgba(153, 204, 255, 0.6)',
      'rgba(204, 153, 255, 0.5)',
      'rgba(255, 153, 204, 0.6)'
    ];
    for (let i = 0; i < FLOATING_MOTES_COUNT; i++) {
      motesRef.current.push({
        x: random(0, width),
        y: random(0, height),
        radius: random(2, 6),
        color: moteColors[Math.floor(random(0, moteColors.length))],
        opacity: random(0.4, 0.9),
        baseOpacity: random(0.4, 0.9),
        phase: random(0, Math.PI * 2),
        speed: random(0.02, 0.08),
        path: {
          x1: random(-30, 30),
          y1: random(-30, 30),
          x2: random(-40, 40),
          y2: random(-40, 40),
          x3: random(-20, 20),
          y3: random(-20, 20)
        }
      });
    }

    // Khởi tạo god rays
    godRaysRef.current = [];
    for (let i = 0; i < GOD_RAYS_COUNT; i++) {
      godRaysRef.current.push({
        x: random(width * 0.1, width * 0.9),
        width: random(40, 100),
        opacity: 0,
        baseOpacity: random(0.1, 0.8),
        phase: random(0, Math.PI * 2),
        speed: random(0.01, 0.03),
        skew: random(-20, -10)
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

      // 1. Vẽ nền Gradient phức tạp (giống CSS)
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(0.25, '#1a1a2e');
      bgGradient.addColorStop(0.5, '#16213e');
      bgGradient.addColorStop(1, '#0f0f23');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 1.1 Thêm radial gradients (giống CSS)
      const radial1 = ctx.createRadialGradient(width * 0.3, height * 0.2, 0, width * 0.3, height * 0.2, width * 0.5);
      radial1.addColorStop(0, 'rgba(30, 17, 83, 0.4)');
      radial1.addColorStop(1, 'transparent');
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, width, height);

      const radial2 = ctx.createRadialGradient(width * 0.7, height * 0.8, 0, width * 0.7, height * 0.8, width * 0.5);
      radial2.addColorStop(0, 'rgba(83, 17, 30, 0.3)');
      radial2.addColorStop(1, 'transparent');
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, width, height);

      // 2. Vẽ God Rays
      godRaysRef.current.forEach(ray => {
        ray.phase += ray.speed;
        ray.opacity = ray.baseOpacity * (0.5 + 0.5 * Math.sin(ray.phase));
        
        ctx.save();
        ctx.globalAlpha = ray.opacity;
        ctx.translate(ray.x, 0);
        ctx.skewX(ray.skew * Math.PI / 180);
        
        const rayGradient = ctx.createLinearGradient(0, 0, 0, height);
        rayGradient.addColorStop(0, 'transparent');
        rayGradient.addColorStop(0.2, 'rgba(255, 204, 153, 0.1)');
        rayGradient.addColorStop(0.8, 'rgba(255, 204, 153, 0.05)');
        rayGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = rayGradient;
        ctx.fillRect(-ray.width/2, -height * 0.2, ray.width, height * 1.4);
        ctx.restore();
      });

      // 3. Vẽ ánh đuốc với flicker effect
      const flicker = Math.sin(time / 500) * 0.1;
      const flicker2 = Math.sin(time / 700 + 2) * 0.05;

      // Torch trái
      const torch1Radius = width * 0.25 + flicker * 40;
      const torch1Grad = ctx.createRadialGradient(width * 0.15, height * 0.15, 0, width * 0.15, height * 0.15, torch1Radius);
      torch1Grad.addColorStop(0, `rgba(255, 120, 0, ${0.4 + flicker})`);
      torch1Grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = torch1Grad;
      ctx.fillRect(0, 0, width, height);

      // Torch phải
      const torch2Radius = width * 0.2 + flicker2 * 30;
      const torch2Grad = ctx.createRadialGradient(width * 0.85, height * 0.2, 0, width * 0.85, height * 0.2, torch2Radius);
      torch2Grad.addColorStop(0, `rgba(255, 100, 0, ${0.2 + flicker2})`);
      torch2Grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = torch2Grad;
      ctx.fillRect(0, 0, width, height);

      // 4. Vẽ floating motes
      motesRef.current.forEach(mote => {
        mote.phase += mote.speed;
        
        // Tính toán vị trí theo đường path phức tạp (giống CSS animation)
        const t = (Math.sin(mote.phase) + 1) / 2; // 0 to 1
        let offsetX = 0, offsetY = 0;
        
        if (t < 0.25) {
          const localT = t / 0.25;
          offsetX = mote.path.x1 * localT;
          offsetY = mote.path.y1 * localT;
        } else if (t < 0.5) {
          const localT = (t - 0.25) / 0.25;
          offsetX = mote.path.x1 + (mote.path.x2 - mote.path.x1) * localT;
          offsetY = mote.path.y1 + (mote.path.y2 - mote.path.y1) * localT;
        } else if (t < 0.75) {
          const localT = (t - 0.5) / 0.25;
          offsetX = mote.path.x2 + (mote.path.x3 - mote.path.x2) * localT;
          offsetY = mote.path.y2 + (mote.path.y3 - mote.path.y2) * localT;
        } else {
          const localT = (t - 0.75) / 0.25;
          offsetX = mote.path.x3 * (1 - localT);
          offsetY = mote.path.y3 * (1 - localT);
        }

        mote.opacity = mote.baseOpacity * (0.4 + 0.5 * Math.sin(mote.phase * 0.5));
        
        ctx.save();
        ctx.globalAlpha = mote.opacity;
        ctx.beginPath();
        
        const moteGrad = ctx.createRadialGradient(
          mote.x + offsetX, mote.y + offsetY, 0,
          mote.x + offsetX, mote.y + offsetY, mote.radius
        );
        moteGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        moteGrad.addColorStop(0.8, mote.color);
        moteGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = moteGrad;
        ctx.arc(mote.x + offsetX, mote.y + offsetY, mote.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Thêm shadow effect
        ctx.shadowColor = mote.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.restore();
      });

      // 5. Vẽ icon ở vị trí đúng (25% từ trên như CSS)
      if (iconLoadedRef.current && dungeonIconRef.current) {
        const iconSize = Math.min(width, height) * 0.25;
        const iconX = (width - iconSize) / 2;
        const iconY = height * 0.25 - iconSize / 2; // Đặt ở 25% từ trên
        
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = 'rgba(100, 150, 255, 0.3)';
        ctx.shadowBlur = 30;
        
        // Thêm hiệu ứng float nhẹ
        const floatOffset = Math.sin(time / 4000) * 5;
        ctx.drawImage(
          dungeonIconRef.current, 
          iconX, 
          iconY + floatOffset, 
          iconSize, 
          iconSize
        );
        ctx.restore();
      }

      // 6. Cập nhật và vẽ các quả cầu huyền ảo
      orbsRef.current.forEach(orb => {
        orb.x += (orb.targetX - orb.x) * orb.speed;
        orb.y += (orb.targetY - orb.y) * orb.speed;
        
        if (Math.abs(orb.targetX - orb.x) < 1 && Math.abs(orb.targetY - orb.y) < 1) {
          orb.targetX = random(orb.radius, width - orb.radius);
          orb.targetY = random(orb.radius, height - orb.radius);
        }

        orb.phase += 0.02;
        orb.opacity = 0.3 + 0.4 * Math.sin(orb.phase);
        
        ctx.save();
        ctx.globalAlpha = orb.opacity;
        ctx.beginPath();
        
        const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        orbGrad.addColorStop(0.7, orb.color);
        orbGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = orbGrad;
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Thêm outer glow
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        
        ctx.restore();
      });

      // 7. Cập nhật và vẽ các hạt bụi
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        p.phase += 0.05;
        p.opacity = p.baseOpacity * (0.3 + 0.5 * Math.sin(p.phase));
        
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        
        const particleGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        particleGrad.addColorStop(0, p.color);
        particleGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = particleGrad;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // 8. Vẽ ambient glow overlay
      const ambientGlow1 = ctx.createRadialGradient(width * 0.25, height * 0.25, 0, width * 0.25, height * 0.25, width * 0.6);
      ambientGlow1.addColorStop(0, 'rgba(255, 120, 0, 0.08)');
      ambientGlow1.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGlow1;
      ctx.fillRect(0, 0, width, height);

      const ambientGlow2 = ctx.createRadialGradient(width * 0.75, height * 0.75, 0, width * 0.75, height * 0.75, width * 0.6);
      ambientGlow2.addColorStop(0, 'rgba(100, 150, 255, 0.06)');
      ambientGlow2.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGlow2;
      ctx.fillRect(0, 0, width, height);
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
