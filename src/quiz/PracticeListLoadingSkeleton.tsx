// PracticeListLoadingSkeleton.tsx
import React from 'react';

/**
 * Skeleton cho một PracticeCard đơn lẻ.
 * Mô phỏng cấu trúc của card thật với hiệu ứng pulse.
 */
const PracticeCardSkeleton: React.FC = () => (
  <div className="w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col">
    {/* Phần nội dung chính (trên) */}
    <div className="flex justify-between items-center">
      <div className="flex items-center flex-grow animate-pulse">
        {/* Skeleton cho CircularProgress */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-4"></div>
        
        {/* Skeleton cho Title & Description */}
        <div className="text-left flex-grow space-y-2.5">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Skeleton cho phần trăm/icon completed */}
      <div className="flex items-center gap-3 sm:gap-4 pl-2 animate-pulse">
        <div className="h-6 w-14 bg-gray-200 rounded-md"></div>
      </div>
    </div>
    
    {/* Đường kẻ ngang giữ nguyên để duy trì cấu trúc */}
    <div className="border-t border-gray-200 my-3"></div>

    {/* Phần nút bấm (dưới) */}
    <div className="flex justify-between items-center animate-pulse">
        <div className="h-5 w-24 bg-gray-200 rounded"></div>
        <div className="h-5 w-28 bg-gray-200 rounded"></div>
    </div>
  </div>
);

/**
 * Component chính chứa danh sách các skeleton card.
 * Lặp lại skeleton card để tạo cảm giác danh sách đang tải.
 */
const PracticeListLoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4 w-full pt-2">
        <PracticeCardSkeleton />
        <PracticeCardSkeleton />
        <PracticeCardSkeleton />
        <PracticeCardSkeleton />
      </div>
    </div>
  );
};

export default PracticeListLoadingSkeleton;
