// --- START OF REFACTORED FILE coin-display.tsx ---

import React, { useState, useEffect, useRef } from 'react';

// Define the props for the CoinDisplay component
interface CoinDisplayProps {
  // Nhận vào giá trị cuối cùng mong muốn, thay vì giá trị đã được tính toán sẵn
  coins: number;
  isStatsFullscreen: boolean;
}

// Coin Icon Image URL
const coinIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png";
const coinIconPlaceholderUrl = "https://placehold.co/16x16/ffd700/000000?text=$"; // Placeholder

const CoinDisplay: React.FC<CoinDisplayProps> = ({ coins, isStatsFullscreen }) => {
  // State nội bộ để quản lý giá trị đang thực sự hiển thị trên UI
  const [displayedValue, setDisplayedValue] = useState(coins);
  // Ref để lưu trữ interval, giúp tránh re-render không cần thiết và dọn dẹp an toàn
  const intervalRef = useRef<number | null>(null);

  // Hook này sẽ chạy mỗi khi prop `coins` từ component cha thay đổi.
  useEffect(() => {
    // Nếu giá trị mục tiêu giống hệt giá trị đang hiển thị, không cần làm gì cả.
    if (coins === displayedValue) {
      return;
    }

    // Luôn dọn dẹp interval cũ trước khi tạo một cái mới để tránh memory leak.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const startValue = displayedValue;
    const endValue = coins;
    const duration = 500; // Animation kéo dài 0.5 giây
    const frameRate = 30; // 30 khung hình/giây
    const totalFrames = duration / (1000 / frameRate);
    const increment = (endValue - startValue) / totalFrames;

    let currentFrame = 0;

    // Bắt đầu animation
    intervalRef.current = window.setInterval(() => {
      currentFrame++;
      const newValue = Math.round(startValue + increment * currentFrame);

      // Điều kiện dừng: khi đã đạt hoặc vượt qua giá trị cuối cùng
      // Điều này xử lý được cả trường hợp tăng (increment > 0) và giảm (increment < 0)
      if ((increment > 0 && newValue >= endValue) || (increment < 0 && newValue <= endValue)) {
        setDisplayedValue(endValue); // Chốt giá trị cuối cùng để đảm bảo chính xác
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedValue(newValue);
      }
    }, 1000 / frameRate);

    // Hàm dọn dẹp: sẽ được gọi khi component unmount hoặc khi `coins` thay đổi lần nữa.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [coins]); // Dependency array: Chỉ chạy lại effect này khi `coins` thay đổi.

  if (isStatsFullscreen) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      <style jsx>{`
        @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src={coinIconUrl}
          alt="Dollar Coin Icon"
          className="w-4 h-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = coinIconPlaceholderUrl;
          }}
        />
      </div>
      {/* Hiển thị giá trị từ state nội bộ `displayedValue` */}
      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
        {displayedValue.toLocaleString()}
      </div>
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span>
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default CoinDisplay;
