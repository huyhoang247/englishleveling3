import React, { useRef, useEffect } from 'react';

interface CanvasParticleOverlayProps {
  particleCount?: number;
}

const CanvasParticleOverlay = ({ particleCount = 50 }: CanvasParticleOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sử dụng ref để lưu trữ các hạt, tránh re-render không cần thiết
  const particlesRef = useRef<Particle[]>([]);

  // Định nghĩa class cho mỗi hạt
  class Particle {
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number; // Vận tốc x
    vy: number; // Vận tốc y
    alpha: number; // Độ trong suốt
    friction = 0.98; // Lực ma sát
    gravity = 0.05; // Trọng lực

    constructor(x: number, y: number, radius: number, color: string, velocity: { x: number; y: number }) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.vx = velocity.x;
      this.vy = velocity.y;
      this.alpha = 1;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    update(ctx: CanvasRenderingContext2D) {
      // Cập nhật vị trí
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.01; // Giảm độ trong suốt để hạt mờ dần

      this.draw(ctx);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Thiết lập kích thước canvas bằng kích thước cửa sổ
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Khởi tạo các hạt
    particlesRef.current = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const colors = ['#8b5cf6', '#a78bfa', '#ffffff', '#ddd6fe'];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 3 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      particlesRef.current.push(new Particle(
        centerX,
        centerY,
        radius,
        color,
        { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
      ));
    }

    let animationFrameId: number;

    // Vòng lặp animation
    const animate = () => {
      // Yêu cầu frame tiếp theo
      animationFrameId = requestAnimationFrame(animate);
      
      // Xóa canvas với hiệu ứng mờ dần
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'; // Màu nền của overlay
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cập nhật và vẽ lại từng hạt
      particlesRef.current.forEach((particle, index) => {
        if (particle.alpha > 0) {
          particle.update(ctx);
        } else {
          // Xóa hạt đã biến mất để tối ưu
          particlesRef.current.splice(index, 1);
        }
      });
    };

    animate();

    // Hàm dọn dẹp khi component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]); // Chạy lại hiệu ứng nếu particleCount thay đổi

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
    />
  );
};

// Bạn có thể export component này nếu đặt ở file riêng
// export default CanvasParticleOverlay;
