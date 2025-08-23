// src/GameSkeletonLoader.tsx
import React, { useState, useEffect, useRef } from 'react';
import DungeonCanvasBackground from './background-canvas.tsx';

interface GameSkeletonLoaderProps {
  show: boolean;
}

const GameSkeletonLoader: React.FC<GameSkeletonLoaderProps> = ({ show }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const showTimeRef = useRef<number>(0);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    let unmountTimer: NodeJS.Timeout;

    const minDisplayTime = 700; // Thời gian hiển thị tối thiểu là 0.7 giây

    if (show) {
      // Bắt đầu chu trình hiển thị
      showTimeRef.current = Date.now();
      setIsMounted(true);
      // Một tick nhỏ để DOM cập nhật trước khi chạy transition
      const visibleTimer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(visibleTimer);
    } else if (isMounted) {
      // Bắt đầu chu trình ẩn đi
      const elapsedTime = Date.now() - showTimeRef.current;
      const delay = Math.max(0, minDisplayTime - elapsedTime);

      hideTimer = setTimeout(() => {
        setIsVisible(false); // Bắt đầu animation mờ dần
        // Đợi animation hoàn thành rồi mới gỡ component khỏi DOM
        unmountTimer = setTimeout(() => {
          setIsMounted(false);
        }, 300); // 300ms này phải khớp với duration của transition-opacity
      }, delay);
    }

    // Dọn dẹp tất cả các timer khi component unmount hoặc prop `show` thay đổi
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [show, isMounted]);

  // Không render gì nếu component không được yêu cầu mount
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-slate-950 z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Lớp 1: Background động */}
      <DungeonCanvasBackground isPaused={false} />

      {/* Lớp 2: Lớp phủ làm mờ background */}
      <div className="absolute inset-0 z-5 bg-slate-950/60"></div>

      {/* Lớp 3: Giao diện Skeleton */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between">
        {/* Skeleton Header */}
        <div className="w-full h-12 flex justify-between items-center px-3 bg-slate-900/20 backdrop-blur-sm border-b border-slate-700/30">
          <div className="w-7 h-7 bg-slate-800/50 rounded-lg animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-7 bg-slate-800/50 rounded-lg animate-pulse"></div>
            <div className="w-32 h-7 bg-slate-800/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* ========== START: PHẦN ĐƯỢC CẬP NHẬT ========== */}
        {/* Skeleton Thanh điều hướng dưới - ĐÃ ĐƯỢC CẬP NHẬT ĐỂ GIỐNG COMPONENT THẬT */}
        <div className="bg-black/85 backdrop-blur-md shadow-2xl rounded-t-2xl border-t border-gray-800 w-full">
          <div className="mx-2 my-2 flex justify-between items-center">
            {[...Array(5)].map((_, index) => (
              // Bỏ chiều cao cố định h-[44px] để chiều cao được quyết định bởi nội dung bên trong, tương tự component thật
              <div key={index} className="flex-1 relative flex justify-center items-center">
                {/* Đổi w-10 h-10 (40px) thành w-9 h-9 (36px) để khớp với kích thước icon thật (20px icon + p-2 padding) */}
                <div className="w-9 h-9 bg-slate-700/60 rounded-full animate-pulse"></div>
                
                {/* Đường kẻ phân cách, không hiển thị cho item cuối cùng */}
                {index < 4 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-800"></div>
                )}
              </div>
            ))}
          </div>

          {/* Thanh ngang nhỏ ở dưới cùng */}
          <div className="h-1 w-full bg-gray-900"></div>
        </div>
        {/* ========== END: PHẦN ĐƯỢC CẬP NHẬT ========== */}
        
      </div>
    </div>
  );
};

export default GameSkeletonLoader;
