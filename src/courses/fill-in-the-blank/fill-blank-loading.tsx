// --- START OF FILE: FillWordLoadingSkeleton.tsx ---

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

          {/* --- THAY ĐỔI Ở ĐÂY --- */}
          {/* Skeleton cho khu vực tương tác (Đã được đơn giản hóa) */}
          <div className="w-full mt-10 flex justify-center">
            {/* Placeholder chung cho khu vực nhập liệu, thay vì ô chữ và bàn phím chi tiết */}
            <div className="w-full max-w-sm h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          {/* --- KẾT THÚC THAY ĐỔI --- */}

        </div>
      </main>
    </div>
  );
};

export default FillWordLoadingSkeleton;
