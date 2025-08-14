// --- START OF FILE VerticalFlashcardGallerySkeleton.tsx ---

import React from 'react';

// Component con cho một flashcard skeleton, giúp tái sử dụng dễ dàng
const FlashcardItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-hidden animate-pulse">
      {/* Skeleton cho phần hình ảnh */}
      <div 
        className="w-full bg-gray-200 dark:bg-gray-700" 
        style={{ aspectRatio: '1024/1536' }}
      ></div>
    </div>
  );
};

const VerticalFlashcardGallerySkeleton: React.FC = () => {
  return (
    // Container chính, giữ màu nền và cấu trúc chung
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">
      <div className="w-full max-w-6xl py-6 mx-auto">
        
        {/* --- Skeleton cho Header --- */}
        <div className="flex justify-between items-center mb-4 px-4">
          {/* Title giả */}
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
          {/* Các nút điều khiển giả */}
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* --- Skeleton cho Tabs --- */}
        <div className="inline-flex rounded-lg p-1 mb-4 mx-4 animate-pulse">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg mr-2"></div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        
        {/* --- Skeleton cho Playlist Pills (giả định) --- */}
        <div className="px-4 mb-6">
           <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded-md mb-3 animate-pulse"></div>
           <div className="flex items-center space-x-2">
               <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
               <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
               <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
           </div>
        </div>

        {/* --- Skeleton cho Grid Flashcards --- */}
        {/* Sử dụng grid 2 cột để trông đẹp hơn khi loading */}
        <div className="min-h-0">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid gap-4 px-4 grid-cols-2">
              {/* Lặp lại component FlashcardItemSkeleton để lấp đầy màn hình */}
              {Array.from({ length: 6 }).map((_, index) => (
                <FlashcardItemSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalFlashcardGallerySkeleton;
// --- END OF FILE VerticalFlashcardGallerySkeleton.tsx ---
