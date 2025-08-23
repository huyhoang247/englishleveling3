// src/GameSkeletonLoader.tsx
import React, { useState, useEffect, useRef } from 'react';
import DungeonCanvasBackground from './background-canvas.tsx';

interface GameSkeletonLoaderProps {
  show: boolean;
}

const GameSkeletonLoader: React.FC<GameSkeletonLoaderProps> = ({ show }) => {
  const [isHiding, setIsHiding] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const showTimeRef = useRef<number>(0);

  useEffect(() => {
    if (show) {
      showTimeRef.current = Date.now();
      setIsHiding(false);
      setShouldRender(true);
    } else if (shouldRender) { // Chỉ chạy logic ẩn đi nếu đang được render
      const minDisplayTime = 700;
      const elapsedTime = Date.now() - showTimeRef.current;
      const delay = Math.max(0, minDisplayTime - elapsedTime);

      const hideTimer = setTimeout(() => {
        setIsHiding(true); // Bắt đầu animation mờ dần

        // Gỡ component sau khi animation hoàn thành
        const unmountTimer = setTimeout(() => {
          setShouldRender(false);
        }, 300); // Khớp với duration của transition

        return () => clearTimeout(unmountTimer);
      }, delay);

      return () => clearTimeout(hideTimer);
    }
  }, [show, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  // Nếu `show` là true, opacity là 100 ngay lập tức.
  // Nếu `isHiding` là true, opacity là 0 để bắt đầu mờ đi.
  const opacityClass = show && !isHiding ? 'opacity-100' : 'opacity-0';

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-slate-950 z-[100] transition-opacity duration-300 ${opacityClass}`}>
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
        
        {/* Skeleton Thanh điều hướng dưới */}
        <div className="bg-black/85 backdrop-blur-md shadow-2xl rounded-t-2xl border-t border-gray-800 w-full">
          <div className="mx-2 my-2 flex justify-between items-center">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-1 relative flex justify-center items-center">
                <div className="w-9 h-9 bg-slate-700/60 rounded-full animate-pulse"></div>
                {index < 4 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-800"></div>
                )}
              </div>
            ))}
          </div>
          <div className="h-1 w-full bg-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default GameSkeletonLoader;
