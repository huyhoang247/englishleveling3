import React from 'react';

const UpgradeStatsSkeleton: React.FC = () => {
  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      {/* --- Skeleton Header (ĐỒNG BỘ HOÀN TOÀN KÍCH THƯỚC) --- */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        {/* Placeholder cho nút Home, có cấu trúc padding và gap giống hệt nút thật */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 animate-pulse">
          <div className="w-5 h-5 bg-slate-700 rounded"></div> {/* Placeholder cho icon */}
          <div className="hidden sm:inline h-5 w-[88px] bg-slate-700 rounded-md"></div> {/* Placeholder cho chữ "Trang Chính" */}
        </div>

        {/* Placeholder cho CoinDisplay, có cấu trúc tương tự để đảm bảo chiều cao đồng bộ */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 animate-pulse">
            <div className="w-5 h-5 bg-slate-700 rounded-full"></div> {/* Placeholder cho icon coin */}
            <div className="h-5 w-16 sm:w-20 bg-slate-700 rounded-md"></div> {/* Placeholder cho số vàng */}
        </div>
      </header>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          {/* --- Skeleton Hero Stone --- */}
          <div className="mb-4 w-40 h-40 rounded-full bg-slate-800/50 animate-pulse"></div>
          
          {/* --- Skeleton Stats Summary --- */}
          <div className="w-full max-w-xs bg-slate-900/50 border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center animate-pulse">
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
          </div>

          {/* --- Skeleton Progress Bar --- */}
          <div className="w-full px-2 mb-8 animate-pulse">
              <div className="flex justify-between items-baseline mb-2 px-1">
                  <div className="h-5 w-24 bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-16 bg-slate-700 rounded-md"></div>
              </div>
              <div className="w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1">
                  <div className="h-full bg-slate-700 rounded-full w-2/5"></div>
              </div>
          </div>

          {/* --- Skeleton Stat Cards --- */}
          <div className="flex flex-row justify-center items-stretch gap-2 sm:gap-4">
              {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-slate-900/95 border border-slate-800 rounded-xl w-28 sm:w-36 p-3 sm:p-4 flex flex-col items-center justify-between animate-pulse">
                      <div className="w-full flex flex-col items-center flex-grow gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700"></div>
                          <div className="w-full flex flex-col items-center gap-1">
                              <div className="h-5 w-16 bg-slate-700 rounded-md"></div>
                              <div className="h-6 w-12 bg-slate-700 rounded-md"></div>
                              <div className="h-4 w-20 bg-slate-700 rounded-md"></div>
                          </div>
                      </div>
                      <div className="w-full h-9 sm:h-10 bg-slate-700 rounded-lg mt-2 sm:mt-3"></div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default UpgradeStatsSkeleton;
