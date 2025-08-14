import React from 'react';

const VocaMatchLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient của app
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* --- Skeleton cho Header (Tương tự QuizLoadingSkeleton) --- */}
      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        {/* Nút Back */}
        <div className="w-7 h-7 rounded-full bg-white/20 animate-pulse"></div>
        {/* Các chỉ số */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 rounded-md bg-white/20 animate-pulse"></div>
          <div className="h-6 w-16 rounded-md bg-white/20 animate-pulse"></div>
          <div className="h-6 w-16 rounded-md bg-white/20 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content của VocaMatch --- */}
      <div className="flex-grow p-4 sm:p-6 flex flex-col min-h-0">
        
        {/* Skeleton cho thẻ Tiến Độ */}
        <div className="bg-gray-200/80 p-4 rounded-xl shadow-lg mb-4 sm:mb-6 flex-shrink-0 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            {/* Skeleton cho bộ đếm tiến độ */}
            <div className="h-7 w-16 bg-gray-300 rounded-md"></div>
            {/* Skeleton cho chữ "Tiến Độ" */}
            <div className="h-5 w-20 bg-gray-300 rounded-md"></div>
          </div>
          {/* Skeleton cho thanh tiến trình */}
          <div className="w-full h-3 bg-gray-300 rounded-full"></div>
        </div>

        {/* Skeleton cho khu vực chơi game (2 cột) */}
        <main className="flex-grow grid grid-cols-2 gap-4 sm:gap-6">
          {/* Cột trái */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`left-skel-${index}`} className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          {/* Cột phải */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`right-skel-${index}`} className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </main>
        
        {/* Skeleton cho phần hiển thị định nghĩa (xuất hiện ở cuối) */}
        <div className="flex-shrink-0 pt-4"> {/* Giả lập khoảng trống ở trên */}
             <div className="bg-gray-200/80 rounded-xl p-4 shadow-md h-24 w-full animate-pulse">
                {/* Nội dung giả bên trong thẻ định nghĩa */}
                <div className="flex items-center mb-3">
                    <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
                    <div className="h-5 w-32 bg-gray-300 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-300 rounded mt-2"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded mt-1.5"></div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default VocaMatchLoadingSkeleton;
