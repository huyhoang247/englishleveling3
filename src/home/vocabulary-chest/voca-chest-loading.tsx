// --- START OF FILE voca-chest-loading.tsx (UPDATED FOR SIZE ACCURACY) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên nền radial-gradient đã sửa
    <div 
      className="w-full h-full absolute top-0 left-0 flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0a0a14',
        backgroundImage: 'radial-gradient(circle at center, #16213e, #0a0a14)'
      }}
    >
      
      {/* --- Skeleton cho Header (Giữ nguyên) --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-white/20"></div>
            <div className="hidden sm:block h-4 w-16 rounded-md bg-white/20"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content (Gallery) --- */}
      <main className="flex-grow overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-[30px] w-full max-w-[1300px] mx-auto p-5 pb-[100px]">
          {/* Lặp qua 2 card skeleton */}
          {[...Array(2)].map((_, i) => (
            // --- CẬP NHẬT QUAN TRỌNG CHO CARD SKELETON ---
            // Bỏ chiều cao cố định, sử dụng flexbox để card tự tính toán chiều cao
            <div key={i} className="w-full max-w-[380px] min-w-[300px] bg-[#1a1f36] rounded-2xl overflow-hidden flex flex-col animate-pulse border border-transparent">
              
              {/* Header của card: Padding khớp với gốc (12px 20px) */}
              <header className="px-5 py-3">
                 <div className="h-6 w-3/4 bg-slate-700/60 rounded-md mx-auto"></div>
              </header>
              
              {/* Body của card: Sử dụng flex-grow để nó chiếm hết không gian còn lại */}
              <main className="p-5 flex flex-col flex-grow">
                {/* 1. Top Section: mb-5 (20px) */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700/60 rounded-full flex-shrink-0"></div>
                    <div className="h-6 w-24 bg-slate-700/60 rounded-xl"></div>
                  </div>
                  <div className="h-5 w-28 bg-slate-700/60 rounded-md"></div>
                </div>

                {/* 2. Visual Row: mb-5 (20px). Chiều cao được xác định tự nhiên */}
                <div className="flex items-center gap-4 mb-5">
                  {/* flex-[1] cho ảnh và flex-[2] cho info, khớp với CSS gốc */}
                  <div className="flex-[1] h-24 bg-slate-700/60 rounded-lg"></div>
                  <div className="flex-[2] h-24 bg-slate-700/60 rounded-lg"></div>
                </div>

                {/* 3. Action Buttons: mt-auto để đẩy xuống dưới cùng, pt-4 (16px) */}
                <div className="flex items-center gap-2.5 mt-auto pt-4">
                  {/* Chiều cao h-11 (44px) mô phỏng chính xác nút thật (padding + font-size) */}
                  <div className="flex-1 h-11 bg-slate-700/60 rounded-lg"></div>
                  <div className="flex-1 h-11 bg-slate-700/60 rounded-lg"></div>
                </div>
              </main>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VocabularyChestLoadingSkeleton;

// --- END OF FILE voca-chest-loading.tsx (UPDATED FOR SIZE ACCURACY) ---
