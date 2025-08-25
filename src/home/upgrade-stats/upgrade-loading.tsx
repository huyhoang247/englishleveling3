import React from 'react';

const UpgradeStatsSkeleton: React.FC = () => {
  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      {/* --- Skeleton Header (Đã chuẩn) --- */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 animate-pulse">
          <div className="w-5 h-5 bg-slate-700/80 rounded-sm"></div>
          <div className="hidden sm:inline h-4 w-20 bg-slate-700/80 rounded-sm"></div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-0.5 flex items-center border border-slate-700/60 animate-pulse">
          <div className="w-4 h-4 rounded-full bg-slate-700/80 mr-1"></div>
          <div className="h-4 w-12 sm:w-16 bg-slate-700/80 rounded-sm"></div>
          <div className="ml-0.5 w-3 h-3 bg-slate-700/80 rounded-full"></div>
        </div>
      </header>

      {/* --- Container Nội dung Chính (Giữ nguyên) --- */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          
          {/*
            --- Skeleton Hero Stone (Final Version) ---
            SỬA ĐỔI: Tái tạo cấu trúc wrapper của viên đá. Component thật dùng một div wrapper với `flex items-center justify-center` và một `img` bên trong.
            Ta sẽ sao chép cấu trúc đó để đảm bảo vị trí tuyệt đối chính xác.
          */}
          <div className="relative mb-4 w-40 h-40 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-800/50 animate-pulse"></div>
          </div>
          
          {/*
            --- Skeleton Stats Summary (Final Version) ---
            SỬA ĐỔI: Tái tạo cấu trúc của ô chỉ số tổng. Component thật có một div wrapper với các class layout cụ thể.
            Ta sao chép chính xác div wrapper này và đặt các placeholder vào bên trong. Thêm cả `backdrop-blur-sm` cho nhất quán.
          */}
          <div className="w-full max-w-xs bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center animate-pulse">
              <div className="h-6 w-20 bg-slate-700/80 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700/80 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700/80 rounded-md"></div>
          </div>

          {/* --- Skeleton Progress Bar (Giữ nguyên, đã khớp) --- */}
          <div className="w-full px-2 mb-8 animate-pulse">
              <div className="flex justify-between items-baseline mb-2 px-1">
                  <div className="h-5 w-24 bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-16 bg-slate-700 rounded-md"></div>
              </div>
              <div className="w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1">
                  <div className="h-full bg-slate-700 rounded-full w-2/5"></div>
              </div>
          </div>

          {/* --- Skeleton Stat Cards (Giữ nguyên, đã khớp) --- */}
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
