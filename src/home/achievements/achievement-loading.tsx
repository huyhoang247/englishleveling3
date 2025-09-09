import React from 'react';

// --- Skeleton cho một dòng từ vựng ---
const SkeletonRow = () => (
  <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80">
    {/* Hạng */}
    <div className="col-span-2 md:col-span-1 flex items-center justify-center">
      <div className="w-8 h-8 bg-slate-700 rounded-md animate-pulse"></div>
    </div>
    {/* Từ vựng & Cấp */}
    <div className="col-span-10 md:col-span-3 space-y-2">
      <div className="h-5 w-3/4 bg-slate-700 rounded-md animate-pulse"></div>
      <div className="h-3 w-1/2 bg-slate-700 rounded-md animate-pulse"></div>
    </div>
    {/* Tiến trình */}
    <div className="col-span-12 md:col-span-3 md:px-2 space-y-2">
      <div className="h-3 w-full bg-slate-700 rounded-full animate-pulse"></div>
      <div className="h-3 w-1/3 bg-slate-700 rounded-md animate-pulse ml-auto"></div>
    </div>
    {/* Thưởng cấp */}
    <div className="col-span-6 md:col-span-3 flex items-center justify-center">
      <div className="h-10 w-full max-w-[180px] bg-slate-700 rounded-xl animate-pulse"></div>
    </div>
    {/* Nút hành động */}
    <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center">
      <div className="h-9 w-24 bg-slate-700 rounded-lg animate-pulse"></div>
    </div>
  </div>
);


// --- Component Skeleton chính cho toàn màn hình Thành Tựu ---
const AchievementsLoadingSkeleton: React.FC = () => {
  return (
    // Container ngoài cùng, giữ nguyên nền của màn hình chính
    <div className="fixed inset-0 z-50 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white font-sans flex flex-col items-center">
      
      {/* --- Skeleton cho Header --- */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2.5 px-4 sticky top-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <div className="w-5 h-5 bg-slate-700 rounded animate-pulse"></div>
          <div className="hidden sm:block h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
             <div className="w-5 h-5 bg-slate-700 rounded-full animate-pulse"></div>
             <div className="h-4 w-12 bg-slate-700 rounded animate-pulse"></div>
           </div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content --- */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 pt-6">
        
        {/* --- START OF UPDATED BLOCK --- */}
        {/* Skeleton chi tiết cho các thẻ Stats để tránh lệch layout */}
        <section className="mb-6 flex flex-row justify-center items-center gap-4">
          {/* Card Skeleton 1 */}
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg animate-pulse">
            <div className="w-7 h-7 bg-slate-700 rounded-md flex-shrink-0"></div>
            <div className="w-full space-y-2">
              <div className="h-5 w-10 bg-slate-700 rounded-md"></div>
              <div className="h-4 w-20 bg-slate-700 rounded-md"></div>
            </div>
          </div>
          {/* Card Skeleton 2 */}
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg animate-pulse">
            <div className="w-7 h-7 bg-slate-700 rounded-md flex-shrink-0"></div>
            <div className="w-full space-y-2">
              <div className="h-5 w-10 bg-slate-700 rounded-md"></div>
              <div className="h-4 w-16 bg-slate-700 rounded-md"></div>
            </div>
          </div>
        </section>
        {/* --- END OF UPDATED BLOCK --- */}

        {/* Skeleton cho nút "Claim All" */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-md"></div>
                  <div className="h-5 w-24 bg-slate-700 rounded-md"></div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-slate-700 rounded-md"></div>
                      <div className="h-4 w-6 bg-slate-700 rounded-md"></div>
                  </div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                      <div className="h-4 w-10 bg-slate-700 rounded-md"></div>
                  </div>
              </div>
          </div>
        </div>

        {/* Skeleton cho bảng danh sách */}
        <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl border border-slate-700">
          <div className="grid-cols-12 gap-4 px-4 py-3 hidden md:grid">
            <div className="col-span-1 h-4 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="col-span-3 h-4 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="col-span-3 h-4 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="col-span-3 h-4 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="col-span-2 h-4 bg-slate-700 rounded-md animate-pulse"></div>
          </div>

          <div className="flex flex-col gap-2 mt-0 md:mt-2">
            {Array(2).fill(0).map((_, index) => (
                <SkeletonRow key={index} />
            ))}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default AchievementsLoadingSkeleton;
