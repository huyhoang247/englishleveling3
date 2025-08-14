// --- START OF NEW FILE: FillWordLoadingSkeleton.tsx ---

import React from 'react';

const FillWordLoadingSkeleton: React.FC = () => {
  return (
    // Container chính, giữ nguyên style của app
    <div className="flex flex-col h-full w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl font-sans">
      
      {/* --- Skeleton cho Header (Tương tự Quiz) --- */}
      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-white/20 animate-pulse"></div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 rounded-md bg-white/20 animate-pulse"></div>
          <div className="h-6 w-16 rounded-md bg-white/20 animate-pulse"></div>
          <div className="h-6 w-16 rounded-md bg-white/20 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content --- */}
      <main className="flex-grow px-4 sm:px-8 pt-8 pb-8 w-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          
          {/* Skeleton cho khung thông tin câu hỏi (phần màu gradient) */}
          <div className="bg-gray-200 p-6 relative w-full rounded-xl animate-pulse">
            <div className="flex justify-between items-center mb-4">
              {/* Số thứ tự câu hỏi */}
              <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
              {/* Các nút chức năng + Đồng hồ */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            {/* Thanh tiến trình */}
            <div className="w-full h-3 bg-gray-300 rounded-full mb-4"></div>
            {/* Khung gợi ý/câu hỏi */}
            <div className="w-full h-16 bg-gray-300 rounded-lg mt-4"></div>
          </div>

          {/* Skeleton cho khu vực tương tác */}
          <div className="w-full mt-8 space-y-8">
            {/* Skeleton cho các ô nhập từ (WordSquaresInput) */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-12 h-14 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
            
            {/* Skeleton cho Bàn phím ảo (VirtualKeyboard) */}
            <div className="w-full max-w-sm mx-auto space-y-2">
              {/* Hàng phím trên */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-8 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
              {/* Hàng phím giữa */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-8 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
              {/* Hàng phím dưới */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FillWordLoadingSkeleton;
