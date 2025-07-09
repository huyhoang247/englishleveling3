// --- START OF FILE chuc-mung.tsx (PHIÊN BẢN PHÁO HOA) ---

import React, { useRef, useEffect, useCallback } from 'react';

// --- CÁC HẰNG SỐ CÓ THỂ TÙY CHỈNH CHO HIỆU ỨNG PHÁO HOA ---
const PARTICLE_COUNT = 300; // Tăng số lượng hạt cho vụ nổ lớn hơn
// Bảng màu rực rỡ, tươi sáng hơn cho pháo hoa
const COLORS = ['#FFD700', '#FF4500', '#FF69B4', '#1E90FF', '#32CD32', '#FFFFFF'];
const GRAVITY = 0.08; // Tăng trọng lực để hạt rơi nhanh hơn một chút
const DRAG = 0.97; // Lực cản không khí (số càng nhỏ cản càng mạnh, hạt dừng nhanh hơn)
const INITIAL_VELOCITY = 6; // Vận tốc ban đầu mạnh hơn để "vụ nổ" tỏa rộng hơn
const TRAIL_EFFECT_ALPHA = 0.15; // Độ mờ của hiệu ứng "đuôi" (càng nhỏ đuôi càng dài)

// --- ĐỊNH NGHĨA LỚP PARTICLE ĐỂ QUẢN LÝ TỪNG HẠT PHÁO HOA ---
class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number; // Vận tốc theo trục X
  vy: number; // Vận tốc theo trục Y
  alpha: number; // Độ trong suốt (để làm mờ dần)

  constructor(canvasWidth: number, canvasHeight: number) {
    // Bắt đầu từ giữa màn hình, phía trên - tâm của vụ nổ pháo hoa
    this.x = canvasWidth * 0.5;
    this.y = canvasHeight * 0.2;

    // Bán kính ngẫu nhiên cho các hạt tròn to nhỏ khác nhau
    this.radius = Math.random() * 3 + 2; // Bán kính từ 2px đến 5px

    // Màu ngẫu nhiên từ bảng màu
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Vận tốc ban đầu ngẫu nhiên theo mọi hướng, tạo thành vụ nổ tròn
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * INITIAL_VELOCITY;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 1; // Hơi hướng lên trên một chút ban đầu

    // Khởi tạo độ trong suốt
    this.alpha = 1;
  }

  // Cập nhật vị trí và trạng thái của hạt trong mỗi khung hình
  update() {
    this.vy += GRAVITY; // Áp dụng trọng lực
    this.vx *= DRAG;     // Áp dụng lực cản
    this.vy *= DRAG;

    this.x += this.vx;
    this.y += this.vy;
    
    this.alpha -= 0.01; // Giảm độ trong suốt để mờ dần, tốc độ mờ nhanh hơn một chút
  }

  // Vẽ hạt tròn lên canvas
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha; // Áp dụng độ trong suốt
    
    ctx.beginPath();
    ctx.fillStyle = this.color;
    // Vẽ hình tròn tại vị trí của hạt
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    
    ctx.restore();
  }
}

// --- COMPONENT PHÁO HOA SỬ DỤNG CANVAS ---
const FireworksEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sử dụng ref để lưu trữ mảng hạt và ID của animation frame
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
      // Tạo một vụ nổ pháo hoa mới mỗi khi thay đổi kích thước cửa sổ
      createParticles(canvas); 
    };
    
    setCanvasSize();

    // Vòng lặp animation
    const animate = () => {
      // Thay vì xóa hoàn toàn, vẽ một lớp nền bán trong suốt để tạo hiệu ứng "đuôi"
      // Màu nền tối giúp các hạt pháo hoa nổi bật
      ctx.fillStyle = `rgba(10, 10, 20, ${TRAIL_EFFECT_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lặp qua từng hạt để cập nhật và vẽ
      // Dùng vòng lặp ngược để có thể xóa phần tử an toàn
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];
        particle.update();
        particle.draw(ctx);

        // Loại bỏ hạt khi nó đã mờ hẳn để tối ưu hiệu năng
        if (particle.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', setCanvasSize);

    // Hàm dọn dẹp khi component bị unmount
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
      className="fixed inset-0 pointer-events-none z-50 bg-transparent"
      aria-hidden="true"
    />
  );
};

export default FireworksEffect;

// --- END OF FILE chuc-mung.tsx (PHIÊN BẢN PHÁO HOA) ---
