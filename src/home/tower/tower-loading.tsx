import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* --- CSS Animations Optimized (No Filters) --- */}
      <style>{`
        /* Animation: Biến thiên kích thước mượt mà */
        @keyframes liquid-pulse {
            0%, 100% {
                transform: scale(0.7) translateZ(0);
                opacity: 0.3;
            }
            50% {
                transform: scale(1.3) translateZ(0);
                opacity: 1;
            }
        }

        .loader-dot {
            /* Tối ưu hóa: Chỉ render lại transform và opacity */
            will-change: transform, opacity;
            
            /* Timing function: cubic-bezier giúp chuyển động có gia tốc thực tế (nhanh ở giữa, chậm ở 2 đầu) */
            animation: liquid-pulse 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite both;
        }
      `}</style>

      {/* --- BACKGROUND LAYER (Lag-free version) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Ảnh nền giữ nguyên độ sắc nét, không dùng blur để tránh lag */}
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat bg-center"
              style={{ 
                  backgroundImage: `url(${BACKGROUND_IMAGE})`,
              }}
          />
          {/* Lớp phủ màu tối đậm hơn để làm nổi bật loader mà không cần xử lý ảnh */}
          <div className="absolute inset-0 bg-black/80" />
          
          {/* Một gradient nhẹ ở trung tâm để tạo tiêu điểm (Vignette rẻ tiền về hiệu năng) */}
          <div className="absolute inset-0 bg-radial-gradient-center opacity-60" 
               style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)' }} 
          />
      </div>

      {/* --- LOADER CONTAINER --- */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-10">
          
          {/* THE DOTS */}
          <div className="flex items-center gap-6">
              
              {/* Dot 1: Cyan - Delay 0s */}
              <div 
                  className="w-4 h-4 rounded-full bg-cyan-400 loader-dot" 
                  style={{ animationDelay: '0s' }}
              ></div>

              {/* Dot 2: Sky - Delay 0.15s */}
              <div 
                  className="w-4 h-4 rounded-full bg-sky-500 loader-dot" 
                  style={{ animationDelay: '0.15s' }}
              ></div>

              {/* Dot 3: Violet - Delay 0.3s */}
              <div 
                  className="w-4 h-4 rounded-full bg-violet-500 loader-dot" 
                  style={{ animationDelay: '0.3s' }}
              ></div>

              {/* Dot 4: Fuchsia - Delay 0.45s */}
              <div 
                  className="w-4 h-4 rounded-full bg-fuchsia-500 loader-dot" 
                  style={{ animationDelay: '0.45s' }}
              ></div>

          </div>

          {/* Simple Loading Text */}
          <div className="text-white/50 text-xs tracking-[0.4em] uppercase font-medium">
             Loading Data...
          </div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
