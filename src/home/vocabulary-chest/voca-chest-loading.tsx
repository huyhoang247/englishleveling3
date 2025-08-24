// --- START OF FILE voca-chest-loading.tsx (UPDATED) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng: Đã cập nhật để khớp với màu nền radial-gradient của màn hình gốc
    <div 
      className="w-full h-full absolute top-0 left-0 flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0a0a14',
        backgroundImage: 'radial-gradient(circle at center, #16213e, #0a0a14)'
      }}
    >
      
      {/* --- Skeleton cho Header (Giữ nguyên vì đã khá chuẩn) --- */}
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

      {/* --- Skeleton cho Main Content (Gallery các rương) --- */}
      {/* Cập nhật layout: Sử dụng flexbox + wrap để giống với component gốc */}
      <main className="flex-grow overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-[30px] w-full max-w-[1300px] mx-auto p-5 pb-[100px]">
          {/* Giữ nguyên số lượng skeleton là 2 theo yêu cầu */}
          {[...Array(2)].map((_, i) => (
            // Cập nhật Card Skeleton: Bỏ chiều cao cố định, sửa màu nền và cấu trúc bên trong
            <div key={i} className="w-full max-w-[380px] min-w-[300px] bg-[#1a1f36] rounded-2xl overflow-hidden flex flex-col animate-pulse border border-transparent">
              
              {/* Header của card: Cấu trúc riêng biệt, padding khớp với gốc */}
              <div className="p-3">
                 <div className="h-[25px] w-full bg-slate-700/60 rounded-md"></div>
              </div>
              
              {/* Body của card: Cấu trúc riêng biệt, padding, và flex-grow để đẩy nút xuống */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Phần level và số lượng còn lại */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700/60 rounded-full"></div>
                    <div className="h-6 w-24 bg-slate-700/60 rounded-xl"></div>
                  </div>
                  <div className="h-5 w-28 bg-slate-700/60 rounded-md"></div>
                </div>

                {/* Phần hình ảnh rương và ô thông tin: Tăng kích thước cho giống thật */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-[120px] h-[100px] bg-slate-700/60 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 h-[100px] bg-slate-700/60 rounded-lg"></div>
                </div>

                {/* Phần các nút bấm (dùng mt-auto để đẩy xuống dưới) */}
                <div className="flex items-center gap-2.5 mt-auto pt-4">
                  <div className="flex-1 h-12 bg-slate-700/60 rounded-lg"></div>
                  <div className="flex-1 h-12 bg-slate-700/60 rounded-lg"></div>
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

// --- END OF FILE voca-chest-loading.tsx (UPDATED) ---
