// --- START OF FILE vocabulary-chest-loading.tsx (UPDATED) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient tối của màn hình
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-[#16213e] to-[#0a0a14] flex flex-col overflow-hidden">
      
      {/* --- Skeleton cho Header --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        
        {/* Nút Back/Home - Sửa lại để mô phỏng cấu trúc thật */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 animate-pulse">
            {/* Skeleton cho Icon (20x20px) */}
            <div className="w-5 h-5 rounded-full bg-white/20"></div>
            {/* Skeleton cho Text ("Trang Chính"), ẩn trên mobile */}
            <div className="hidden sm:block h-4 w-16 rounded-md bg-white/20"></div>
        </div>

        {/* Các chỉ số tài nguyên */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content (Gallery các rương) --- */}
      {/* === THAY ĐỔI Ở ĐÂY: overflow-y-auto -> overflow-y-hidden === */}
      <main className="flex-grow overflow-y-hidden p-5">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {/* Tạo 4 skeleton card mẫu */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-2xl overflow-hidden border border-white/10 flex flex-col h-[320px]">
              {/* Header của card */}
              <div className="h-9 bg-white/10 animate-pulse m-3 rounded-md"></div>
              
              {/* Body của card */}
              <div className="p-5 pt-0 flex flex-col flex-grow">
                {/* Phần level và số lượng còn lại */}
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-24 bg-white/10 animate-pulse rounded-full"></div>
                  <div className="h-5 w-28 bg-white/10 animate-pulse rounded-md"></div>
                </div>

                {/* Phần hình ảnh rương và ô thông tin */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 bg-white/10 animate-pulse rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 h-24 bg-white/10 animate-pulse rounded-lg"></div>
                </div>

                {/* Phần các nút bấm (dùng mt-auto để đẩy xuống dưới) */}
                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="flex-1 h-12 bg-white/10 animate-pulse rounded-lg"></div>
                  <div className="flex-1 h-12 bg-white/10 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VocabularyChestLoadingSkeleton;

// --- END OF FILE vocabulary-chest-loading.tsx (UPDATED) ---
