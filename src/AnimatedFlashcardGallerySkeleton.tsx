import React from 'react';

// Giữ lại các keyframes và class animation tùy chỉnh vì chúng rất đẹp và hiệu quả.
// Trong một dự án thực tế, bạn nên đặt chúng trong file tailwind.config.js
const CustomAnimations = () => (
  <style jsx global>{`
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
      100% {
        transform: translateY(0px);
      }
    }

    @keyframes slide-in-and-settle-top {
      0% {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes slide-in-and-settle-middle {
      0% {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(0.95) rotate(-3deg);
      }
    }

    @keyframes slide-in-and-settle-bottom {
      0% {
        opacity: 0;
        transform: translateY(50px) scale(0.85);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(0.9) rotate(6deg);
      }
    }
    
    .animate-shimmer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(
        to right,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 20%,
        rgba(255, 255, 255, 0.2) 60%,
        transparent 100%
      );
      transform: translateX(-100%);
      animation: shimmer 2s infinite;
    }
    
    .dark .animate-shimmer::before {
       background-image: linear-gradient(
        to right,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 60%,
        transparent 100%
      );
    }
    
    /* Utility classes cho animation */
    .animate-float-slow {
      animation: float 6s ease-in-out infinite;
    }
    .animate-slide-top {
      animation: slide-in-and-settle-top 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
    }
    .animate-slide-middle {
      animation: slide-in-and-settle-middle 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s forwards;
    }
    .animate-slide-bottom {
      animation: slide-in-and-settle-bottom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
  `}</style>
);

type SkeletonProps = {
  isExiting: boolean;
};

const AnimatedFlashcardGallerySkeleton: React.FC<SkeletonProps> = ({ isExiting }) => {
  return (
    <>
      <CustomAnimations />
      {/* 
        Container chính được thiết kế lại để mô phỏng layout của trang thật.
        Nó bao gồm header, tabs, và khu vực nội dung chính.
      */}
      <div 
        className={`
          flex flex-col h-screen w-screen overflow-hidden 
          bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900
          transition-opacity duration-500 ease-in-out
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {/* --- Skeleton cho Header và Tabs (Lấy cảm hứng từ QuizLoadingSkeleton) --- */}
        <div className="w-full max-w-6xl mx-auto px-4 pt-6 flex-shrink-0">
          {/* Skeleton cho Header */}
          <div className="flex justify-between items-center mb-4 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
          {/* Skeleton cho Tabs */}
          <div className="flex space-x-2 animate-pulse">
            <div className="h-10 w-36 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-36 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>

        {/* --- Khu vực trung tâm cho Animation Thẻ bài --- */}
        {/* 
          flex-grow đảm bảo khu vực này chiếm hết không gian còn lại.
          items-center và justify-center để căn giữa chồng thẻ bài.
        */}
        <div className="flex-grow flex flex-col items-center justify-center relative">
          {/* 
            Wrapper của chồng thẻ được làm nhỏ gọn hơn.
            Hiệu ứng thu nhỏ khi thoát vẫn được giữ lại.
          */}
          <div className={`
            relative w-full max-w-[280px] h-[420px] animate-float-slow
            transition-transform duration-500 ease-in-out
            ${isExiting ? 'scale-95' : 'scale-100'}
          `}>
            
            {/* Thẻ thứ 3 (lớp dưới cùng) */}
            <div className="absolute inset-0 opacity-0 animate-slide-bottom">
                <div className="w-full h-full bg-white/60 dark:bg-gray-800/50 shadow-lg rounded-2xl">
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700/50 rounded-2xl relative overflow-hidden animate-shimmer"></div>
                </div>
            </div>
            
            {/* Thẻ thứ 2 (lớp giữa) */}
            <div className="absolute inset-0 opacity-0 animate-slide-middle">
                <div className="w-full h-full bg-white/80 dark:bg-gray-800/70 shadow-xl rounded-2xl">
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700/80 rounded-2xl relative overflow-hidden animate-shimmer" style={{ animationDelay: '250ms' }}></div>
                </div>
            </div>

            {/* Thẻ thứ 1 (lớp trên cùng, chi tiết nhất) */}
            <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col opacity-0 animate-slide-top overflow-hidden">
              {/* Placeholder cho ảnh với hiệu ứng shimmer */}
              <div className="relative overflow-hidden h-3/5 w-full bg-gray-300 dark:bg-gray-600">
                <div className="animate-shimmer"></div>
              </div>
              
              {/* Placeholder cho nội dung text */}
              <div className="flex-grow p-6 space-y-4">
                <div className="relative overflow-hidden h-7 w-3/4 bg-gray-400 dark:bg-gray-500 rounded-md animate-pulse"></div>
                <div className="space-y-2">
                  <div className="relative overflow-hidden h-4 w-full bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                  <div className="relative overflow-hidden h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedFlashcardGallerySkeleton;
