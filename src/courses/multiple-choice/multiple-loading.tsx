import React from 'react';

const QuizLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient của app
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      
      {/* --- Skeleton cho Header --- */}
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

      {/* --- Skeleton cho Main Content --- */}
      <main className="flex-grow overflow-y-auto flex justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
          {/* Skeleton cho phần đầu câu hỏi (phần màu gradient) */}
          <div className="bg-gray-200 p-6 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              {/* Số thứ tự câu hỏi */}
              <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
              {/* Đồng hồ đếm ngược */}
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
            {/* Thanh tiến trình */}
            <div className="w-full h-3 bg-gray-300 rounded-full mb-6"></div>
            {/* Khung câu hỏi */}
            <div className="w-full h-24 bg-gray-300 rounded-lg"></div>
          </div>

          {/* Skeleton cho các lựa chọn */}
          <div className="p-6">
            <div className="space-y-3">
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizLoadingSkeleton;
