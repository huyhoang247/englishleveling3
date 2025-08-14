import React from 'react';
import { SidebarLayout } from './sidebar-story.tsx';

// Component skeleton cho một thẻ flashcard
const FlashcardSkeletonItem: React.FC = () => (
  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
    {/* Placeholder cho ảnh với đúng tỉ lệ */}
    <div 
      className="w-full bg-gray-200 dark:bg-gray-700 animate-pulse" 
      style={{ aspectRatio: '1024/1536' }}
    />
  </div>
);

// Component skeleton chính, mô phỏng toàn bộ giao diện của VerticalFlashcardGallery
const FlashcardGallerySkeleton: React.FC = () => {
  const dummyFunc = () => {}; // Hàm giả để truyền vào props của SidebarLayout

  return (
    // Sử dụng SidebarLayout để đảm bảo cấu trúc trang nhất quán
    <SidebarLayout
      setToggleSidebar={dummyFunc}
      onShowHome={dummyFunc}
      onShowStats={dummyFunc}
      onShowRank={dummyFunc}
      onShowGoldMine={dummyFunc}
      onShowTasks={dummyFunc}
      onShowPerformance={dummyFunc}
      onShowSettings={dummyFunc}
      onShowHelp={dummyFunc}
      activeScreen="home"
    >
      <div className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        
        {/* Skeleton cho Header và Tabs */}
        <div className="w-full max-w-6xl py-6 mx-auto animate-pulse">
          <div className="flex justify-between items-center mb-4 px-4">
            {/* Title */}
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded-md" />
            {/* Các nút điều khiển */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1 mb-4 mx-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            {/* Tab đang active */}
            <div className="h-10 w-36 bg-indigo-100 dark:bg-gray-700 rounded-lg" />
            {/* Tab không active */}
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700/50 rounded-lg ml-1" />
          </div>
        </div>

        {/* Skeleton cho lưới Flashcards */}
        <div className="min-h-0 flex-grow">
          <div className="w-full max-w-6xl mx-auto">
            {/* Lưới sẽ có 1 cột trên màn hình nhỏ và 2 cột trên màn hình lớn hơn */}
            <div className="grid gap-4 px-4 grid-cols-1 sm:grid-cols-2">
              {/* Tạo ra 6 item để lấp đầy màn hình ban đầu */}
              {Array.from({ length: 6 }).map((_, index) => (
                <FlashcardSkeletonItem key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FlashcardGallerySkeleton;
