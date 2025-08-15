import React from 'react';
import { SidebarLayout } from './sidebar-story.tsx';

// Component skeleton chính, mô phỏng toàn bộ giao diện của VerticalFlashcardGallery
// Phiên bản này được thiết kế để vừa vặn trong màn hình mà không cần cuộn.
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
      {/* Container chính: flex-col và h-screen để chiếm toàn bộ chiều cao, overflow-hidden để chặn cuộn */}
      <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">
        
        {/* Skeleton cho Header và Tabs (phần này không thay đổi nhiều) */}
        <div className="w-full max-w-6xl py-6 mx-auto animate-pulse px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-4">
            {/* Title */}
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded-md" />
            {/* Các nút điều khiển */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            <div className="h-10 w-36 bg-indigo-100 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700/50 rounded-lg ml-1" />
          </div>
        </div>

        {/* Skeleton cho một Flashcard duy nhất, chiếm phần còn lại của màn hình */}
        <div className="min-h-0 flex-grow flex justify-center items-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-xl flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden animate-pulse">
            {/* Placeholder cho ảnh với tỉ lệ hợp lý cho một thẻ chính */}
            <div 
              className="w-full bg-gray-200 dark:bg-gray-700" 
              style={{ aspectRatio: '4/3' }}
            />
            {/* Placeholder cho nội dung text và các nút bấm bên dưới */}
            <div className="p-6 space-y-4">
              {/* Dòng tiêu đề/thuật ngữ */}
              <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-md" />
              {/* Các dòng mô tả/định nghĩa */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
              {/* Placeholder cho các nút hành động */}
              <div className="flex justify-between pt-4">
                 <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                 <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
};

export default FlashcardGallerySkeleton;
