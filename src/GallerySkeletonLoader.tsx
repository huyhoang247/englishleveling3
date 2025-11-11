// --- START OF FILE GallerySkeletonLoader.tsx ---

import React from 'react';

interface GallerySkeletonLoaderProps {
  layoutMode: 'single' | 'double';
}

// Component con cho một thẻ skeleton
// Đã được cập nhật: Sử dụng h-full thay vì aspectRatio để nó lấp đầy không gian được cấp
const SkeletonCard: React.FC = () => (
  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden animate-pulse">
    {/* Container cho ảnh skeleton, giờ sẽ lấp đầy chiều cao của card */}
    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700">
      {/* Skeleton cho nút yêu thích */}
      <div className="absolute top-3 right-3 z-10 h-7 w-7 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
  </div>
);


const GallerySkeletonLoader: React.FC<GallerySkeletonLoaderProps> = ({ layoutMode }) => {
  // Hiển thị 4 thẻ skeleton là đủ để lấp đầy màn hình ban đầu mà không quá nhiều
  const skeletonCount = 4;

  // useEffect đã được gỡ bỏ vì layout mới sẽ không gây cuộn trang,
  // làm cho giải pháp gọn gàng hơn.

  return (
    // Đã cập nhật: Thêm `flex flex-col h-screen` để component chiếm toàn bộ chiều cao màn hình
    <div className="w-full max-w-6xl mx-auto animate-fadeIn flex flex-col h-screen">
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
      {/* Đã cập nhật: Thêm `flex-grow` và `overflow-hidden` để grid lấp đầy không gian còn lại và không bị tràn */}
      <div className={`flex-grow grid gap-4 px-4 pb-4 overflow-hidden ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default GallerySkeletonLoader;

// --- END OF FILE GallerySkeletonLoader.tsx ---
