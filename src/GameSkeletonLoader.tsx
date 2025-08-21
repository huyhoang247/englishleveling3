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

        {/* Skeleton các nút hành động */}
        <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
          {[...Array(3)].map((_, i) => (<div key={i} className="w-14 h-14 bg-slate-800/50 rounded-lg animate-pulse"></div>))}
        </div>
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
          {[...Array(3)].map((_, i) => (<div key={i} className="w-14 h-14 bg-slate-800/50 rounded-lg animate-pulse"></div>))}
        </div>
        
        {/* Skeleton Thanh điều hướng dưới */}
        <div className="w-full h-[60px] md:h-[70px] bg-black/30 backdrop-blur-sm border-t border-gray-700/50 flex justify-around items-center p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center w-12 h-12 animate-pulse">
              <div className="w-7 h-7 bg-slate-700/60 rounded-md"></div>
              <div className="w-10 h-2 mt-2 bg-slate-700/60 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSkeletonLoader;
