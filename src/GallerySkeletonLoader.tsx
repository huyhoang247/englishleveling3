// --- START OF FILE GallerySkeletonLoader.tsx ---

import React, { useEffect } from 'react';

interface GallerySkeletonLoaderProps {
  layoutMode: 'single' | 'double';
}

// Component con cho một thẻ skeleton
const SkeletonCard: React.FC = () => (
  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden animate-pulse">
    <div className="relative w-full bg-gray-200 dark:bg-gray-700" style={{ aspectRatio: '1024 / 1536' }}>
      {/* Skeleton cho nút yêu thích */}
      <div className="absolute top-3 right-3 z-10 h-7 w-7 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
  </div>
);


const GallerySkeletonLoader: React.FC<GallerySkeletonLoaderProps> = ({ layoutMode }) => {
  // Hiển thị 8 thẻ skeleton để lấp đầy màn hình ban đầu
  const skeletonCount = 8;

  // Thêm useEffect để ngăn cuộn trang khi skeleton đang hiển thị
  useEffect(() => {
    // Khi component được mount, thêm class 'overflow-hidden' vào body để vô hiệu hóa scroll
    document.body.classList.add('overflow-hidden');

    // Trả về một cleanup function để gỡ bỏ class khi component unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần khi mount và cleanup khi unmount

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn">
      {/* Skeleton cho Tabs */}
      <div className="px-4 py-6">
        <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-md m-0.5"></div>
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-md m-0.5"></div>
        </div>
        {/* Skeleton cho Pills (có thể thêm nếu muốn) */}
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
      
      {/* Skeleton cho Grid */}
      <div className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default GallerySkeletonLoader;

// --- END OF FILE GallerySkeletonLoader.tsx ---
