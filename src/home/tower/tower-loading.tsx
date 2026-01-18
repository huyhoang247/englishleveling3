import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* --- CSS Animations Optimized --- */}
      <style>{`
        /* Animation sóng lượn: Mượt mà, không giật, chạy vô tận êm dịu */
        @keyframes floating-wave {
            0%, 100% {
                transform: translateY(0) scale(0.8);
                opacity: 0.4;
            }
            50% {
                transform: translateY(-14px) scale(1.1);
                opacity: 1;
            }
        }

        .loader-dot {
            will-change: transform, opacity;
            /* Thời gian 1.6s + ease-in-out tạo nhịp thở đều đặn */
            animation: floating-wave 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* --- BACKGROUND LAYER (No Blur - High Performance) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat bg-center"
              style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
          />
          {/* Lớp phủ đen 85% để làm nổi bật dots */}
          <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* --- DOTS ONLY --- */}
      <div className="relative z-10 flex items-center gap-5">
              
          {/* Dot 1: Cyan */}
          <div 
              className="w-4 h-4 rounded-full bg-cyan-400 loader-dot" 
              style={{ animationDelay: '0s' }}
          ></div>

          {/* Dot 2: Sky */}
          <div 
              className="w-4 h-4 rounded-full bg-sky-500 loader-dot" 
              style={{ animationDelay: '0.2s' }}
          ></div>

          {/* Dot 3: Violet */}
          <div 
              className="w-4 h-4 rounded-full bg-violet-500 loader-dot" 
              style={{ animationDelay: '0.4s' }}
          ></div>

          {/* Dot 4: Fuchsia */}
          <div 
              className="w-4 h-4 rounded-full bg-fuchsia-500 loader-dot" 
              style={{ animationDelay: '0.6s' }}
          ></div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
