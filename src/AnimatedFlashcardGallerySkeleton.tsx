import React from 'react';

// Tinh chỉnh lại các keyframes để phục vụ cho layout grid mới.
// Chúng ta sẽ dùng một animation slide-in thống nhất và áp dụng độ trễ khác nhau.
const CustomAnimations = () => (
  <style jsx global>{`
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    
    /* Animation trượt vào vị trí cho các item trong grid */
    @keyframes slide-in-item {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
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
    
    /* Class tiện ích cho animation, sẽ được dùng với inline style cho delay */
    .animate-slide-in-item {
      animation: slide-in-item 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
  `}</style>
);

// Component con cho một thẻ placeholder, giúp code gọn gàng hơn
const SkeletonCard: React.FC<{ delay: number }> = ({ delay }) => (
    <div 
      className="flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-hidden rounded-2xl opacity-0 animate-slide-in-item"
      style={{ animationDelay: `${delay}ms` }}
    >
        {/* Placeholder cho ảnh */}
        <div className="w-full bg-gray-300 dark:bg-gray-700 relative overflow-hidden" style={{ aspectRatio: '1024/1536' }}>
            <div className="animate-shimmer" style={{ animationDelay: `${delay + 100}ms` }}></div>
        </div>
    </div>
);


type SkeletonProps = {
  isExiting: boolean;
};

const AnimatedFlashcardGallerySkeleton: React.FC<SkeletonProps> = ({ isExiting }) => {
  return (
    <>
      <CustomAnimations />
      {/* 
        Container chính với background đã được đồng bộ hóa với trang thật.
        Hiệu ứng mờ dần khi thoát vẫn được giữ nguyên.
      */}
      <div 
        className={`
          flex flex-col h-screen w-screen overflow-hidden 
          bg-white dark:bg-gray-900
          transition-opacity duration-500 ease-in-out
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {/* --- Skeleton cho Header và Tabs --- */}
        <div className="w-full max-w-6xl mx-auto py-6 px-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-4 shadow-sm animate-pulse">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-10 w-32 ml-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>

        {/* --- Khu vực nội dung chính với layout Grid --- */}
        {/* 
          Mô phỏng layout grid của trang thật, hiển thị 4 thẻ đầu tiên.
          Mỗi thẻ có hiệu ứng trượt vào (staggered) để tạo cảm giác sống động.
        */}
        <div className="flex-grow min-h-0 overflow-hidden">
            <div className="w-full max-w-6xl mx-auto px-4">
                 <div className={`grid gap-4 grid-cols-2`}>
                    {[...Array(4)].map((_, index) => (
                        <SkeletonCard key={index} delay={index * 100} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedFlashcardGallerySkeleton;
