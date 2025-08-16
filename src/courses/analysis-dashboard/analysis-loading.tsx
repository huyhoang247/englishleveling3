// src/components/AnalysisDashboardSkeleton.tsx

import React from 'react';

const AnalysisDashboardSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên cấu trúc và màu nền của dashboard
    <div className="bg-white flex flex-col h-full">
      {/* --- Skeleton cho Header --- */}
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 h-14 flex items-center justify-between px-4 z-10">
        {/* Nút Back/Home */}
        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
        {/* Các chỉ số: Coins, Mastery */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 rounded-md bg-white/20 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/20 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content (Phần hiển thị ngay lập tức) --- */}
      <main className="flex-grow overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          {/* --- Skeleton cho Milestone Cards --- */}
          <div className="space-y-6 my-6">
            {/* Voca Journey Card Skeleton */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-200"></div>
                  <div>
                    <div className="h-5 w-32 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full mt-4"></div>
            </div>
            {/* Daily Missions Card Skeleton */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-200"></div>
                  <div>
                    <div className="h-5 w-36 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full mt-4"></div>
            </div>
          </div>

          {/* --- Skeleton cho Activity Calendar --- */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded-md mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {/* Lặp 35 ô vuông cho lịch */}
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="w-full aspect-square rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* 
            Phần skeleton cho Charts và Table đã được lược bỏ 
            để giao diện loading không cần cuộn.
          */}
        </div>
      </main>
    </div>
  );
};

export default AnalysisDashboardSkeleton;
