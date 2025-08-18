import React from 'react';

/**
 * Skeleton cho một ô Chest đơn lẻ.
 */
const ChestUISkeleton: React.FC = () => (
  <div className="w-full max-w-[380px] min-w-[300px] bg-[#1a1f36] rounded-2xl overflow-hidden border border-slate-700/50">
    {/* Header */}
    <div className="h-[45px] bg-slate-800/60 p-3">
        <div className="h-4 w-1/3 bg-slate-700 rounded animate-pulse mx-auto"></div>
    </div>
    
    {/* Body */}
    <div className="p-5 animate-pulse">
        {/* Top section: Level + Remaining */}
        <div className="flex justify-between items-center mb-5">
            <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
            <div className="h-5 w-28 bg-slate-700 rounded"></div>
        </div>

        {/* Visual Row: Image + Info */}
        <div className="flex items-center gap-4 mb-5">
            <div className="w-24 h-24 bg-slate-700 rounded-lg flex-shrink-0"></div>
            <div className="flex-grow space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 mt-4">
            <div className="h-12 w-1/2 bg-slate-700 rounded-lg"></div>
            <div className="h-12 w-1/2 bg-slate-700 rounded-lg"></div>
        </div>
    </div>
  </div>
);


/**
 * Skeleton loading cho toàn bộ màn hình mở rương từ vựng.
 * Mô phỏng lại header và một vài ô Chest đang tải.
 */
const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền của màn hình
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#16213e] to-[#0a0a14] overflow-hidden">
      
      {/* --- Skeleton cho Header --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] px-4 flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        {/* Nút Back */}
        <div className="w-24 h-8 rounded-md bg-white/10 animate-pulse"></div>
        
        {/* Các chỉ số tài nguyên */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content --- */}
      <main className="flex-grow overflow-y-auto p-5">
        <div className="flex flex-wrap justify-center gap-[30px] w-full max-w-[1300px] mx-auto">
          {/* Lặp lại skeleton của ChestUI 3 lần để thể hiện danh sách */}
          {Array.from({ length: 3 }).map((_, index) => (
            <ChestUISkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default VocabularyChestLoadingSkeleton;
