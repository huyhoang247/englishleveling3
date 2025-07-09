import React, { useRef, useEffect, useCallback } from 'react';

// --- Các hằng số vật lý để tinh chỉnh hiệu ứng ---
const GRAVITY = 0.3;
const FRICTION = 0.98;
const TERMINAL_VELOCITY = 8;
const FADE_OUT_SPEED = 0.015;

// --- Kiểu dữ liệu cho Component Props và Hạt Confetti ---
interface ConfettiProps {
  /** Khi được set là true, hiệu ứng sẽ bắt đầu. */
  show: boolean;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  width: number; height: number;
  rotation: number; rotationSpeed: number;
  color: string; opacity: number;
}

// --- Bảng màu tinh tế hơn ---
const colors = ['#FFD700', '#FF47AB', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4'];

// --- Component Confetti ---
const Confetti: React.FC<ConfettiProps> = ({ show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const previousShow = useRef(false); // Ref để theo dõi giá trị `show` trước đó

  // Hàm tạo một hạt confetti
  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const blastStrength = Math.random() * 8 + 4;

    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * blastStrength,
      vy: Math.sin(angle) * blastStrength - 5,
      width: Math.random() * 8 + 5,
      height: Math.random() * 15 + 8,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    };
  }, []);

  // Vòng lặp animation chính
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Dọn dẹp canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cập nhật và vẽ từng hạt
    particlesRef.current.forEach(p => {
      // Cập nhật vật lý
      p.vy += GRAVITY;
      if (p.vy > TERMINAL_VELOCITY) p.vy = TERMINAL_VELOCITY;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= FADE_OUT_SPEED;

      // Vẽ hạt
      if (p.opacity > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }
    });

    // Dọn dẹp những hạt đã biến mất
    particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);

    // Tiếp tục hoặc dừng animation
    if (particlesRef.current.length > 0) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
  }, []);

  // Effect chính để khởi tạo và điều khiển animation
  useEffect(() => {
    // Chỉ kích hoạt khi `show` chuyển từ `false` sang `true`
    if (show && !previousShow.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Nếu animation cũ vẫn đang chạy, hãy để nó tiếp tục, hoặc có thể reset ở đây
      // Ở đây, ta sẽ tạo thêm hạt mới để có hiệu ứng chồng chéo nếu click nhanh
      if (!animationFrameId.current) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Tạo các hạt mới và thêm vào danh sách hiện có
      const newParticles = Array.from({ length: 150 }, () => createParticle(canvas));
      particlesRef.current.push(...newParticles);
      
      // Bắt đầu vòng lặp animation nếu nó chưa chạy
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    }

    // Cập nhật giá trị `previousShow` cho lần render tiếp theo
    previousShow.current = show;

    // Hàm cleanup để đảm bảo dừng animation khi component bị unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [show, createParticle, animate]);
  
  // Render component chỉ khi `show` là true hoặc đang có animation chạy
  if (!show && particlesRef.current.length === 0 && !animationFrameId.current) {
    return null; // Không render gì cả để tối ưu
  }
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Confetti;
