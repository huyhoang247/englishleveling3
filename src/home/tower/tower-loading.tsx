import React from 'react';

const TowerLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient của màn hình battle
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
      
      {/* --- Skeleton cho Header --- */}
      <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 h-14">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
          {/* Nút Home */}
          <div className="w-24 h-8 rounded-lg bg-slate-700/50 animate-pulse"></div>
          {/* Các chỉ số (Coin, Energy) */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 rounded-lg bg-slate-700/50 animate-pulse"></div>
            <div className="h-8 w-28 rounded-lg bg-slate-700/50 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* --- Skeleton cho Player Info (Top-Left) --- */}
      <div className="fixed top-16 left-4 z-20">
        <div className="w-64 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50 flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
          <div className="flex-grow flex flex-col gap-1.5">
            {/* Tên tầng */}
            <div className="h-5 w-20 bg-slate-700 rounded-md animate-pulse"></div>
            {/* Thanh máu */}
            <div className="h-5 w-full bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* --- Skeleton cho Main Content --- */}
      <main className="w-full h-full flex flex-col justify-center items-center pt-[72px] p-4">
        
        {/* Skeleton cho khu vực Boss */}
        <div className="w-full max-w-4xl flex justify-center items-center my-8">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 w-72">
            {/* Tiêu đề "BOSS" */}
            <div className="h-7 w-20 bg-slate-700 rounded-md animate-pulse mb-1"></div>
            {/* Ảnh Boss */}
            <div className="w-48 h-48 bg-slate-700 rounded-lg animate-pulse"></div>
            {/* Thanh máu Boss */}
            <div className="w-full h-7 bg-slate-700 rounded-full animate-pulse mt-2"></div>
          </div>
        </div>

        {/* Skeleton cho nút Fight */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mt-4">
          <div className="w-40 h-12 bg-slate-800/60 rounded-lg animate-pulse border border-slate-700"></div>
        </div>
      </main>
    </div>
  );
};

export default TowerLoadingSkeleton;
