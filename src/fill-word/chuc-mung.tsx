import React, { useRef, useEffect } from 'react';

// Định nghĩa kiểu cho một hạt confetti
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number; // Góc di chuyển
  rotation: number; // Góc xoay của hạt
  rotationSpeed: number; // Tốc độ xoay
}

// Hàm lấy màu ngẫu nhiên từ danh sách
const getRandomColor = () => {
  const colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ConfettiCanvas: React.FC = () => {
  // useRef để truy cập thẻ <canvas> mà không gây re-render
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // useRef để lưu trữ mảng các hạt và ID của animation frame
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();

  // Effect này chỉ chạy một lần khi component được mount
  useEffect(() => {
    const canvas = canvasRef.current;
    // Lấy context để vẽ, nếu không có thì thoát
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Thiết lập kích thước canvas bằng kích thước cửa sổ
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Hàm tạo các hạt confetti
    const createParticles = () => {
      const newParticles: Particle[] = [];
      // Tạo 150 hạt cho hiệu ứng dày dặn hơn (canvas xử lý dễ dàng)
      for (let i = 0; i < 150; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height, // Bắt đầu từ phía trên màn hình
          size: Math.random() * 8 + 4,
          color: getRandomColor(),
          speed: Math.random() * 2 + 1,
          direction: Math.random() * Math.PI * 2, // Hướng bay ngẫu nhiên (radian)
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10, // Xoay theo cả 2 chiều
        });
      }
      particlesRef.current = newParticles;
    };

    // Vòng lặp animation chính
    const animate = () => {
      // Xóa toàn bộ canvas trước mỗi khung hình
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lặp qua từng hạt để cập nhật và vẽ lại
      particlesRef.current.forEach(particle => {
        // Cập nhật vị trí
        particle.y += particle.speed;
        particle.x += Math.sin(particle.direction) * 0.5;
        particle.rotation += particle.rotationSpeed;

        // Vẽ hạt
        ctx.save(); // Lưu trạng thái context hiện tại
        ctx.translate(particle.x, particle.y); // Di chuyển gốc tọa độ đến vị trí hạt
        ctx.rotate(particle.rotation * Math.PI / 180); // Xoay context
        ctx.fillStyle = particle.color;
        // Vẽ hình chữ nhật, khi xoay sẽ tạo hiệu ứng confetti đẹp hơn
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore(); // Khôi phục lại trạng thái context
      });

      // Lọc bỏ những hạt đã rơi ra khỏi màn hình
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);
      
      // Nếu hết hạt, có thể tạo lại để hiệu ứng kéo dài
      if (particlesRef.current.length === 0) {
        // Bạn có thể dừng animation ở đây nếu chỉ muốn nó chạy 1 lần
        // Hoặc tạo lại hạt nếu muốn nó lặp lại
        // Ở đây, ta sẽ dừng lại
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
      }

      // Yêu cầu trình duyệt vẽ khung hình tiếp theo
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Bắt đầu quá trình
    createParticles();
    animate();

    // Hàm cleanup: Chạy khi component bị unmount
    return () => {
      // Hủy vòng lặp animation để tránh rò rỉ bộ nhớ
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Mảng dependencies rỗng đảm bảo effect chỉ chạy 1 lần

  return (
    // Container cố định, chiếm toàn màn hình và không cản trở tương tác
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Đổi tên export để phù hợp với file fill-word-home.tsx của bạn
export default ConfettiCanvas;
