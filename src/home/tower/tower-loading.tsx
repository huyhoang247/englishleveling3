

import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* --- CSS Animations Optimized --- */}
      <style>{`
        @keyframes wave-gradient {
            0%, 100% {
                transform: translateY(0) scale(1);
                opacity: 0.5;
            }
            50% {
                transform: translateY(-14px) scale(1.15);
                opacity: 1;
            }
        }
        .loader-dot {
            /* Báo cho trình duyệt tối ưu hóa riêng cho transform */
            will-change: transform, opacity; 
            animation: wave-gradient 1.2s infinite ease-in-out both;
        }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat bg-slate-900"
              style={{ 
                  backgroundImage: `url(${BACKGROUND_IMAGE})`,
                  backgroundPosition: 'center 30px'
              }}
          />
          <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* --- 4 DOTS --- */}
      <div className="relative z-10 flex items-center gap-5">
          
          {/* Dot 1: Cyan */}
          <div 
              className="w-3.5 h-3.5 rounded-full bg-cyan-400 loader-dot shadow-[0_0_12px_rgba(34,211,238,0.6)]" 
              style={{ animationDelay: '-0.45s' }}
          ></div>

          {/* Dot 2: Sky */}
          <div 
              className="w-3.5 h-3.5 rounded-full bg-sky-500 loader-dot shadow-[0_0_12px_rgba(14,165,233,0.6)]" 
              style={{ animationDelay: '-0.3s' }}
          ></div>

          {/* Dot 3: Violet */}
          <div 
              className="w-3.5 h-3.5 rounded-full bg-violet-500 loader-dot shadow-[0_0_12px_rgba(139,92,246,0.6)]" 
              style={{ animationDelay: '-0.15s' }}
          ></div>

          {/* Dot 4: Fuchsia */}
          <div 
              className="w-3.5 h-3.5 rounded-full bg-fuchsia-500 loader-dot shadow-[0_0_12px_rgba(217,70,239,0.6)]" 
              style={{ animationDelay: '0s' }}
          ></div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
