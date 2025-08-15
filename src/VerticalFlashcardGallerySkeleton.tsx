import React from 'react';

// Thêm các keyframes và class animation tùy chỉnh.
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


const AnimatedFlashcardGallerySkeleton: React.FC = () => {
  return (
    <>
      <CustomAnimations />
      {/* Container chính: toàn màn hình, nền gradient và căn giữa mọi thứ */}
      <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        
        {/* Wrapper cho hiệu ứng chồng thẻ và floating */}
        <div className="relative w-full max-w-xs sm:max-w-sm h-[500px] sm:h-[550px] animate-float-slow">
          
          {/* Thẻ thứ 3 (lớp dưới cùng) - Sẽ trượt vào đầu tiên */}
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

          {/* Thẻ thứ 1 (lớp trên cùng, chi tiết nhất) - Trượt vào cuối cùng */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col opacity-0 animate-slide-top">
            {/* Placeholder cho ảnh với hiệu ứng shimmer */}
            <div className="relative overflow-hidden h-3/5 w-full bg-gray-300 dark:bg-gray-600">
              <div className="animate-shimmer"></div>
            </div>
            
            {/* Placeholder cho nội dung text */}
            <div className="flex-grow p-6 space-y-4">
              {/* Shimmer container */}
              <div className="relative overflow-hidden h-7 w-3/4 bg-gray-400 dark:bg-gray-500 rounded-md">
                 <div className="animate-shimmer" style={{ animationDelay: '350ms' }}></div>
              </div>
              <div className="space-y-2">
                <div className="relative overflow-hidden h-4 w-full bg-gray-300 dark:bg-gray-600 rounded-md">
                  <div className="animate-shimmer" style={{ animationDelay: '450ms' }}></div>
                </div>
                <div className="relative overflow-hidden h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-md">
                   <div className="animate-shimmer" style={{ animationDelay: '550ms' }}></div>
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
