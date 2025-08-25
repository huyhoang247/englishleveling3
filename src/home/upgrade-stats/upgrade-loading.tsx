// --- START OF FILE upgrade-loading.tsx.txt (ĐÃ SỬA) ---

import React from 'react';

const UpgradeStatsSkeleton: React.FC = () => {
  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      {/* Header đã khớp, giữ nguyên */}
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

      {/* 
        --- Bắt đầu sửa đổi phần Body ---
        Container chính của body đã khớp, giữ nguyên
      */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          
          {/* 
            --- Skeleton Hero Stone ---
            SỬA ĐỔI: Tái tạo cấu trúc container `relative` và `flex` của component thật để đảm bảo vị trí và căn chỉnh chính xác.
          */}
          <div className="relative mb-4 w-40 h-40 flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-slate-800/50 rounded-full"></div>
          </div>
          
          {/* 
            --- Skeleton Stats Summary --- 
            SỬA ĐỔI: Thêm class `backdrop-blur-sm` để khớp với hiệu ứng của component thật.
          */}
          <div className="w-full max-w-xs bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center animate-pulse">
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-700 rounded-md"></div>
          </div>

          {/* 
            --- Skeleton Progress Bar ---
            SỬA ĐỔI: Thêm `relative`, `shadow-inner`, và `backdrop-blur-sm` vào container của thanh progress bar để khớp 100% với style của component thật.
          */}
          <div className="w-full px-2 mb-8 animate-pulse">
              <div className="flex justify-between items-baseline mb-2 px-1">
                  <div className="h-5 w-24 bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-16 bg-slate-700 rounded-md"></div>
              </div>
              <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
                  <div className="h-full bg-slate-700 rounded-full w-2/5"></div>
              </div>
          </div>

          {/* 
            --- Skeleton Stat Cards ---
            SỬA ĐỔI (QUAN TRỌNG): Tái tạo cấu trúc 2 lớp div của StatCard thật để mô phỏng hiệu ứng "gradient border".
            - Div ngoài: Dùng để tạo viền, có `p-px` và bo góc `rounded-xl`.
            - Div trong: Là nội dung chính của card, bo góc `rounded-[11px]` (nhỏ hơn 1px so với div ngoài).
            Điều này đảm bảo kích thước, padding và hình dáng của card skeleton khớp tuyệt đối với card thật.
          */}
          <div className="flex flex-row justify-center items-stretch gap-2 sm:gap-4">
              {[...Array(3)].map((_, index) => (
                  <div key={index} className="relative rounded-xl bg-slate-800 p-px animate-pulse">
                    <div className="relative bg-slate-900/95 rounded-[11px] h-full flex flex-col items-center justify-between text-center w-28 sm:w-36 p-3 sm:p-4 gap-2 sm:gap-3">
                      {/* Cấu trúc bên trong card đã khá chuẩn, chỉ cần đặt vào container mới */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700"></div>
                      <div className="flex-grow flex flex-col items-center gap-1 w-full">
                          <div className="h-5 w-16 bg-slate-700 rounded-md"></div>
                          <div className="h-6 w-12 bg-slate-700 rounded-md"></div>
                          <div className="h-4 w-20 bg-slate-700 rounded-md"></div>
                      </div>
                      <div className="w-full h-9 sm:h-10 bg-slate-700 rounded-lg"></div>
                    </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default UpgradeStatsSkeleton;
