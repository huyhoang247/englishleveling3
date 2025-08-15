import React from 'react';

// Spinner Icon SVG Component
const SpinnerIcon: React.FC = () => (
  <svg 
    className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    ></circle>
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


// Component Skeleton được thiết kế lại hoàn toàn
// Tập trung vào hiệu ứng thị giác và trải nghiệm người dùng khi chờ tải
const VerticalFlashcardGallerySkeletonV2: React.FC = () => {
  return (
    // Container chính: toàn màn hình, nền gradient và căn giữa mọi thứ
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      
      {/* Wrapper cho hiệu ứng chồng thẻ (card stack) */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-[500px] sm:h-[550px]">
        
        {/* Thẻ thứ 3 (lớp dưới cùng) */}
        <div 
          className="absolute inset-0 bg-white dark:bg-gray-800/50 shadow-lg rounded-2xl animate-pulse transform rotate-6 scale-90"
          style={{ animationDelay: '300ms' }}
        >
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
        
        {/* Thẻ thứ 2 (lớp giữa) */}
        <div 
          className="absolute inset-0 bg-white dark:bg-gray-800/70 shadow-xl rounded-2xl animate-pulse transform -rotate-3 scale-95"
          style={{ animationDelay: '150ms' }}
        >
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>

        {/* Thẻ thứ 1 (lớp trên cùng, chi tiết nhất) */}
        <div className="relative w-full h-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden animate-pulse flex flex-col">
          {/* Placeholder cho ảnh */}
          <div className="h-3/5 w-full bg-gray-300 dark:bg-gray-600" />
          
          {/* Placeholder cho nội dung text */}
          <div className="flex-grow p-6 space-y-4">
            <div className="h-7 w-3/4 bg-gray-400 dark:bg-gray-500 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded-md" />
              <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Thông điệp loading */}
      <div className="mt-12 flex items-center space-x-3 text-center">
        <SpinnerIcon />
        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Đang chuẩn bị bộ thẻ...
        </p>
      </div>

    </div>
  );
};

export default VerticalFlashcardGallerySkeletonV2;
