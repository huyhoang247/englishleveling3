// --- START OF FILE chuc-mung.tsx (CANVAS & OPTIMIZED) ---

import React, { useRef, useEffect, useCallback } from 'react';

// --- CÁC HẰNG SỐ CÓ THỂ TÙY CHỈNH CHO HIỆU ỨNG ---
const PARTICLE_COUNT = 70; // Số lượng hạt confetti (đã giảm xuống)
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
    // Bắt đầu từ giữa màn hình, phía trên
    this.x = canvasWidth * 0.5;
    this.y = canvasHeight * 0.2;

    // Kích thước ngẫu nhiên
    this.width = Math.random() * 8 + 4;
    this.height = Math.random() * 8 + 4;

    // Màu ngẫu nhiên
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Vận tốc ban đầu ngẫu nhiên theo mọi hướng
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * INITIAL_VELOCITY;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2; // Thêm -2 để có xu hướng bắn lên trên một chút

    // Khởi tạo các thuộc tính vật lý
    this.alpha = 1;
    this.rotation = Math.random() * 360;
    this.spin = (Math.random() - 0.5) * 10;
  }

  // Cập nhật vị trí và trạng thái của hạt trong mỗi khung hình
  update() {
    this.vy += GRAVITY; // Áp dụng trọng lực
    this.vx *= DRAG; // Áp dụng lực cản
    this.vy *= DRAG;

    this.x += this.vx;
    this.y += this.vy;
    
    this.rotation += this.spin; // Cập nhật góc xoay
    this.alpha -= 0.005; // Giảm độ trong suốt để mờ dần
  }

  // Vẽ hạt lên canvas
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save(); // Lưu trạng thái canvas hiện tại
    ctx.globalAlpha = this.alpha; // Áp dụng độ trong suốt
    ctx.translate(this.x, this.y); // Di chuyển gốc tọa độ đến vị trí của hạt
    ctx.rotate(this.rotation * Math.PI / 180); // Xoay canvas
    ctx.fillStyle = this.color;
    // Vẽ hình chữ nhật tại gốc tọa độ mới (đã được di chuyển và xoay)
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore(); // Khôi phục lại trạng thái canvas ban đầu
  }
}

// --- COMPONENT CONFETTI SỬ DỤNG CANVAS ---
const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sử dụng ref để lưu trữ mảng hạt và ID của animation frame
  // Điều này ngăn việc re-render không cần thiết và giữ trạng thái animation
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
    
    // Hàm để thiết lập kích thước canvas bằng kích thước cửa sổ
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(canvas); // Tạo lại hạt confetti khi thay đổi kích thước
    };
    
    setCanvasSize();

    // Vòng lặp animation
    const animate = () => {
      // Xóa toàn bộ canvas trước khi vẽ khung hình mới
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lặp qua từng hạt để cập nhật và vẽ
      particlesRef.current.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);

        // Loại bỏ hạt khi nó đã mờ hẳn hoặc rơi ra khỏi màn hình
        if (particle.alpha <= 0 || particle.y > canvas.height + 20) {
          particlesRef.current.splice(index, 1);
        }
      });
      
      // Tiếp tục vòng lặp animation cho khung hình tiếp theo
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Bắt đầu animation
    animate();

    // Lắng nghe sự kiện thay đổi kích thước cửa sổ
    window.addEventListener('resize', setCanvasSize);

    // Hàm dọn dẹp (cleanup) khi component bị unmount
    return () => {
      // Dừng vòng lặp animation
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // Gỡ bỏ trình lắng nghe sự kiện
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [createParticles]); // Dependency array đảm bảo effect chỉ chạy lại nếu createParticles thay đổi

  return (
    // Render một canvas duy nhất, cố định trên màn hình
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};

export default Confetti;

// --- END OF FILE chuc-mung.tsx (CANVAS & OPTIMIZED) ---
