import React from 'react';

// Component Confetti để hiển thị hiệu ứng chúc mừng
const Confetti: React.FC = () => {
  // Tạo mảng 50 phần tử để render 50 hạt confetti
  const confettiPieces = Array(50).fill(0);

  return (
    // Container cố định chiếm toàn màn hình, không nhận tương tác chuột, z-index cao để hiển thị trên cùng
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((_, index) => {
        // Tính toán vị trí ngẫu nhiên theo chiều ngang (0% đến 100%)
        const left = `${Math.random() * 100}%`;
        // Tính toán thời gian animation ngẫu nhiên (2s đến 5s)
        const animationDuration = `${Math.random() * 3 + 2}s`;
        // Tính toán kích thước ngẫu nhiên (5px đến 15px)
        const size = `${Math.random() * 10 + 5}px`;
        // Chọn màu ngẫu nhiên từ danh sách các màu Tailwind
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return (
          // Mỗi hạt confetti là một div nhỏ
          <div
            key={index} // Key duy nhất cho mỗi phần tử trong map
            className={`absolute ${color} opacity-80 rounded-full`} // Vị trí tuyệt đối, màu, độ mờ, bo tròn
            style={{
              left, // Vị trí ngang
              top: '-10px', // Bắt đầu từ phía trên màn hình
              width: size, // Chiều rộng
              height: size, // Chiều cao
              animation: `fall ${animationDuration} linear forwards`, // Áp dụng animation 'fall'
            }}
          />
        );
      })}

      {/* Định nghĩa CSS keyframes cho animation rơi */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg); /* Bắt đầu từ trên, không xoay */
            opacity: 1; /* Độ mờ ban đầu */
          }
          100% {
            transform: translateY(100vh) rotate(720deg); /* Rơi xuống dưới màn hình, xoay 2 vòng */
            opacity: 0; /* Biến mất khi kết thúc */
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti; // Export component để sử dụng ở nơi khác
