import React from 'react';
import { SidebarLayout } from './sidebar-story.tsx';

// Component skeleton cho một thẻ flashcard
// Đã được tối ưu hóa: không cần thay đổi gì ở đây, nó đã rất tốt.
const FlashcardSkeletonItem: React.FC = () => (
  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
    {/* Placeholder cho ảnh với hiệu ứng pulse */}
    <div 
      className="w-full bg-gray-200 dark:bg-gray-700 animate-pulse" 
      style={{ aspectRatio: '1024/1536' }}
    />
  </div>
);

// Component skeleton chính, đã được thiết kế lại để logic và đẹp hơn
const FlashcardGallerySkeleton: React.FC = () => {
  const dummyFunc = () => {}; // Hàm giả để truyền vào props

  return (
    // SidebarLayout vẫn là layout gốc, đảm bảo tính nhất quán
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
      {/* 
        THAY ĐỔI CHÍNH: Cấu trúc layout mới
        - Sử dụng flex-1 và overflow-hidden để container chính chiếm hết không gian còn lại mà không tạo thanh cuộn.
        - Bên trong, ta chia làm 2 phần: Header (cố định) và Lưới flashcard (sẽ cuộn nếu cần).
      */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        
        {/* --- Phần 1: Skeleton cho Header và Tabs (Không cuộn) --- */}
        <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            {/* Title */}
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse" />
            
            {/* Các nút điều khiển */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1 bg-gray-200/80 dark:bg-gray-800 rounded-lg w-fit">
            {/* Tab đang active (mô phỏng bằng màu sáng hơn) */}
            <div className="h-10 w-32 bg-white dark:bg-gray-700 rounded-md animate-pulse" />
            {/* Tab không active */}
            <div className="h-10 w-32 ml-1" /> 
          </div>
        </div>

        {/* --- Phần 2: Skeleton cho lưới Flashcards (Phần này sẽ cuộn nếu nội dung quá dài) --- */}
        {/*
          - flex-1: Chiếm hết không gian dọc còn lại.
          - overflow-y-auto: Chỉ tạo thanh cuộn cho khu vực này khi cần.
          - Với 8 thẻ skeleton, nó sẽ không cuộn trên hầu hết các màn hình, đúng với mục đích.
        */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-4 pb-6">
            {/* Cải thiện responsive grid: 1 cột trên mobile, 2 trên tablet, 3 trên desktop */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tạo ra 8 item để lấp đầy màn hình tốt hơn */}
              {Array.from({ length: 8 }).map((_, index) => (
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
