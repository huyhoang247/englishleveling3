import React, { useState, useEffect } from 'react';

// Component Confetti để hiển thị hiệu ứng chúc mừng
const Confetti: React.FC = () => {
  // State để lưu trữ dữ liệu các hạt confetti
  const [particles, setParticles] = useState<any[]>([]);

  // Hàm tạo các hạt confetti ngẫu nhiên
  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) { // Tạo 50 hạt confetti
      newParticles.push({
        id: i, // ID duy nhất cho mỗi hạt
        // Vị trí ngang ngẫu nhiên (0% đến 100% chiều rộng container)
        x: Math.random() * 100,
        // Vị trí dọc ngẫu nhiên (0% đến 100% chiều cao container)
        y: Math.random() * 100,
        // Kích thước ngẫu nhiên cho hạt (từ 4px đến 12px)
        size: Math.random() * 8 + 4,
        // Màu ngẫu nhiên từ danh sách màu định sẵn
        color: getRandomColor(),
        // Tốc độ ngẫu nhiên cho chuyển động rơi (từ 1 đến 3 đơn vị mỗi chu kỳ)
        speed: Math.random() * 2 + 1,
        // Hướng ngẫu nhiên cho chuyển động ngang nhẹ (0 đến 360 độ)
        direction: Math.random() * 360
      });
    }
    // Cập nhật state với các hạt mới, gây render lại
    setParticles(newParticles);
  };

  // Hàm lấy màu ngẫu nhiên từ danh sách các màu định sẵn
  const getRandomColor = () => {
    const colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800']; // Danh sách màu
    // Trả về một màu ngẫu nhiên từ mảng
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Effect hook để xử lý animation của các hạt và thay đổi hiển thị
  useEffect(() => {
    // Tạo các hạt confetti khi component được render
    createParticles();

    // Thiết lập interval để cập nhật vị trí hạt định kỳ
    const interval = setInterval(() => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle, // Giữ nguyên các thuộc tính hiện tại của hạt
          // Cập nhật vị trí dọc dựa trên tốc độ (di chuyển xuống dưới)
          y: particle.y + particle.speed,
          // Cập nhật vị trí ngang dựa trên hướng (chuyển đổi độ sang radian cho Math.sin)
          // Điều này tạo ra chuyển động ngang nhẹ dựa trên hướng ngẫu nhiên
          x: particle.x + Math.sin(particle.direction * Math.PI / 180) * 0.5
        }))
        // Lọc bỏ các hạt đã di chuyển ra khỏi màn hình nếu cần thiết để cải thiện hiệu suất
        .filter(particle => particle.y < 110) // Loại bỏ hạt khi chúng di chuyển xuống dưới 110% chiều cao màn hình
      );
    }, 50); // Cập nhật mỗi 50 mili giây (điều khiển độ mượt và tốc độ animation)

    // Hàm cleanup: Chạy khi component bị unmount
    return () => {
      // Xóa interval để dừng cập nhật animation
      clearInterval(interval);
    };
  }, []); // Mảng dependencies rỗng: effect chỉ chạy một lần sau khi mount

  // Render hiệu ứng chúc mừng
  return (
    // Container cố định chiếm toàn màn hình, không nhận tương tác chuột, z-index cao để hiển thị trên cùng
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {/* Map qua mảng particles và render một div cho mỗi hạt */}
      {particles.map(particle => (
        <div
          key={particle.id} // Key duy nhất cho mỗi hạt, cần thiết cho việc render danh sách trong React
          className="absolute rounded-full" // Vị trí tuyệt đối và hình dạng tròn (class Tailwind)
          style={{
            left: `${particle.x}%`, // Đặt vị trí ngang sử dụng phần trăm
            top: `${particle.y}%`, // Đặt vị trí dọc sử dụng phần trăm
            width: `${particle.size}px`, // Đặt chiều rộng bằng giá trị pixel
            height: `${particle.size}px`, // Đặt chiều cao bằng giá trị pixel
            backgroundColor: particle.color, // Đặt màu nền sử dụng màu đã tạo
            // Thêm transition nhỏ để cập nhật hình ảnh mượt hơn khi các hạt di chuyển
            transition: 'all 0.05s linear',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti; // Export component để sử dụng ở nơi khác
