// --- START OF FILE achievements-loading.tsx ---

import React from 'react';

const AchievementsLoadingSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white font-sans flex flex-col items-center">
      {/* --- Skeleton cho Header --- */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2.5 px-4 sticky top-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="h-9 w-32 sm:w-28 bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-9 w-24 bg-slate-800 rounded-lg animate-pulse"></div>
      </header>

      {/* --- Skeleton cho Main Content --- */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 pt-6">
        {/* Skeleton cho Thẻ thống kê */}
        <section className="mb-6 flex flex-row justify-center items-center gap-4">
          <div className="h-[76px] flex-1 sm:flex-none sm:w-52 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
          <div className="h-[76px] flex-1 sm:flex-none sm:w-52 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
        </section>

        {/* Skeleton cho nút "Nhận Tất Cả" */}
        <div className="mb-6 flex justify-center">
          <div className="h-[68px] w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-xl animate-pulse"></div>
        </div>

        {/* Skeleton cho danh sách thành tựu */}
        <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl border border-slate-700">
          {/* Skeleton cho Header của bảng (ẩn trên mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3">
             <div className="col-span-1 h-4 bg-slate-700 rounded animate-pulse"></div>
             <div className="col-span-3 h-4 bg-slate-700 rounded animate-pulse"></div>
             <div className="col-span-3 h-4 bg-slate-700 rounded animate-pulse"></div>
             <div className="col-span-3 h-4 bg-slate-700 rounded animate-pulse"></div>
             <div className="col-span-2 h-4 bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Skeleton cho các dòng thành tựu */}
          <div className="flex flex-col gap-2 md:mt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-3 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80">
                {/* Rank */}
                <div className="col-span-2 md:col-span-1 flex items-center justify-center"><div className="w-8 h-8 bg-slate-700 rounded-md animate-pulse"></div></div>
                {/* Word & Level */}
                <div className="col-span-10 md:col-span-3 space-y-2"><div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse"></div><div className="h-3 w-1/4 bg-slate-700 rounded animate-pulse"></div></div>
                {/* Progress Bar */}
                <div className="col-span-12 md:col-span-3 md:px-2 space-y-2"><div className="h-3 w-full bg-slate-700 rounded-full animate-pulse"></div><div className="h-3 w-1/3 bg-slate-700 rounded ml-auto animate-pulse"></div></div>
                {/* Reward */}
                <div className="col-span-6 md:col-span-3 flex justify-center"><div className="h-10 w-full max-w-[180px] bg-slate-700 rounded-xl animate-pulse"></div></div>
                {/* Claim Button */}
                <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center"><div className="h-10 w-24 bg-slate-700 rounded-lg animate-pulse"></div></div>
              </div>
            ))}
          </div>
        </main>
        
        {/* Skeleton cho Phân trang */}
        <div className="mt-6 mb-4 flex items-center justify-center gap-2">
            <div className="w-10 h-10 p-2 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 hidden sm:block bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 p-2 bg-slate-800/80 border border-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsLoadingSkeleton;
