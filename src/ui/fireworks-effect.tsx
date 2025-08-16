// --- START OF FILE chuc-mung.tsx (đã sửa lỗi) ---

import React, { useRef, useEffect, useCallback } from 'react';

// --- CÁC HẰNG SỐ CÓ THỂ TÙY CHỈNH CHO HIỆU ỨNG ---
const PARTICLE_COUNT = 70; // Số lượng hạt confetti
const COLORS = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
const GRAVITY = 0.05; // Lực hút làm hạt rơi nhanh dần
const DRAG = 0.98; // Lực cản không khí (số càng nhỏ cản càng mạnh)
const INITIAL_VELOCITY = 4; // Vận tốc ban đầu khi "bắn" ra

// --- ĐỊNH NGHĨA LỚP PARTICLE ĐỂ QUẢN LÝ TỪNG HẠT CONFETTI ---
class Particle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vx: number; // Vận tốc theo trục X
  vy: number; // Vận tốc theo trục Y
  alpha: number; // Độ trong suốt (để làm mờ dần)
  rotation: number; // Góc xoay hiện tại
  spin: number; // Tốc độ xoay

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth * 0.5;
    this.y = canvasHeight * 0.2;
    this.width = Math.random() * 8 + 4;
    this.height = Math.random() * 8 + 4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * INITIAL_VELOCITY;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;

    this.alpha = 1;
    this.rotation = Math.random() * 360;
    this.spin = (Math.random() - 0.5) * 10;
  }

  update() {
    this.vy += GRAVITY;
    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.spin;
    // Đảm bảo alpha không đi xuống giá trị âm, giúp logic đơn giản hơn
    this.alpha = Math.max(0, this.alpha - 0.005); 
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

// --- COMPONENT CONFETTI SỬ DỤNG CANVAS ---
const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number>();

  const createParticles = useCallback((canvas: HTMLCanvasElement) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push(new Particle(canvas.width, canvas.height));
    }
    particlesRef.current = newParticles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(canvas);
    };
    
    setCanvasSize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particlesToKeep = [];

      for (const particle of particlesRef.current) {
        particle.update();
        particle.draw(ctx);

        // --- SỬA LỖI LOGIC TẠI ĐÂY ---
        // Chỉ giữ lại những hạt vẫn còn nhìn thấy được (alpha > 0).
        // Điều này cho phép hạt rơi ra khỏi màn hình nhưng vẫn tiếp tục
        // mờ dần một cách tự nhiên cho đến khi biến mất hoàn toàn.
        if (particle.alpha > 0) {
          particlesToKeep.push(particle);
        }
      }

      particlesRef.current = particlesToKeep;
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', setCanvasSize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};

export default Confetti;
