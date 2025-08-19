import React from 'react';

const UpgradeStatsSkeleton: React.FC = () => {
  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      {/*
        --- Skeleton Header (Final Version) ---
        Lý do sử dụng h-8 (32px):
        1. Header thật có padding p-2.5 (10px top/bottom).
        2. Nút Home thật có padding py-1.5 (6px top/bottom) và icon h-5 (20px).
        3. Tổng chiều cao nội dung của nút thật = 6 + 20 + 6 = 32px.
        4. Vì vậy, placeholder bên trong header cũng phải cao 32px (tức là h-8) để khớp.
        5. Tổng chiều cao cuối cùng của cả 2 header sẽ là 32px (nội dung) + 20px (padding) = 52px.
      */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <div className="h-8 w-11 sm:w-36 rounded-lg bg-slate-800/80 animate-pulse"></div>
        <div className="h-8 w-24 sm:w-28 rounded-lg bg-slate-800/80 animate-pulse"></div>
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
