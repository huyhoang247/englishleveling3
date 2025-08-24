// --- START OF FILE vocabulary-chest-loading.tsx (UPDATED) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient tối của màn hình
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-[#16213e] to-[#0a0a14] flex flex-col overflow-hidden">
      
      {/* --- Skeleton cho Header (Giữ nguyên) --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        
        {/* Nút Back/Home */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-white/20"></div>
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
      {/* THAY ĐỔI: Sử dụng flexbox và gap để khớp với layout thật, thay vì grid */}
      <main className="flex-grow overflow-y-auto p-5">
        <div className="w-full max-w-7xl mx-auto flex flex-wrap justify-center gap-7">
          
          {/* === THAY ĐỔI: Cấu trúc card skeleton được làm lại hoàn toàn để khớp với component thật === */}
          {[...Array(2)].map((_, i) => (
            // Container card chính, min-width/max-width để khớp với ChestUI, không còn chiều cao cố định
            <div key={i} className="bg-slate-800/50 rounded-2xl overflow-hidden border border-white/10 flex flex-col w-full max-w-[380px] min-w-[300px] flex-shrink-0">
              
              {/* === THAY ĐỔI: Header của card, mô phỏng <header class="chest-header"> === */}
              <div className="py-3 px-5 bg-black/20 flex justify-center items-center h-[48px]">
                  <div className="h-4 w-48 bg-white/10 animate-pulse rounded-md"></div>
              </div>
              
              {/* === THAY ĐỔI: Body của card, mô phỏng <main class="chest-body"> === */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Phần level và số lượng còn lại */}
                <div className="flex justify-between items-center mb-5">
                  <div className="h-6 w-24 bg-white/10 animate-pulse rounded-full"></div>
                  <div className="h-5 w-28 bg-white/10 animate-pulse rounded-md"></div>
                </div>

                {/* Phần hình ảnh rương và ô thông tin - TĂNG KÍCH THƯỚC */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-24 h-24 bg-white/10 animate-pulse rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 h-24 bg-white/10 animate-pulse rounded-lg"></div>
                </div>

                {/* Phần các nút bấm (dùng mt-auto để đẩy xuống dưới) */}
                <div className="flex items-center gap-2.5 mt-auto pt-4">
                  <div className="flex-1 h-10 bg-white/10 animate-pulse rounded-lg"></div>
                  <div className="flex-1 h-10 bg-white/10 animate-pulse rounded-lg"></div>
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
