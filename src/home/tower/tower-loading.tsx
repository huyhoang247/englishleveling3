import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* --- CSS Animations Optimized --- */}
      <style>{`
        @keyframes flow-bloom {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            40% {
                transform: scale(1.4); /* Phóng to cực đại */
                opacity: 1;
                filter: brightness(1.3);
                box-shadow: 0 0 20px var(--dot-color);
            }
            80%, 100% {
                transform: scale(0); /* Thu nhỏ lại về 0 để tạo vòng lặp mượt */
                opacity: 0;
                box-shadow: 0 0 0px var(--dot-color);
            }
        }

        .loader-dot {
            will-change: transform, opacity, box-shadow;
            /* Animation chạy một chiều từ trái qua phải liên tục */
            animation: flow-bloom 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat bg-slate-900"
              style={{ 
                  backgroundImage: `url(${BACKGROUND_IMAGE})`,
                  backgroundPosition: 'center 30px',
                  filter: 'blur(2px) brightness(0.6)' // Làm mờ nhẹ background để nổi bật loading
              }}
          />
          {/* Overlay gradient để tạo chiều sâu */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/60" />
      </div>

      {/* --- DOTS CONTAINER --- */}
      <div className="relative z-10 flex items-center gap-6">
          
          {/* Dot 1: Cyan */}
          <div 
              className="w-4 h-4 rounded-full bg-cyan-400 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(34, 211, 238, 0.8)',
                  animationDelay: '0s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 2: Sky */}
          <div 
              className="w-4 h-4 rounded-full bg-sky-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(14, 165, 233, 0.8)',
                  animationDelay: '0.2s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 3: Violet */}
          <div 
              className="w-4 h-4 rounded-full bg-violet-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(139, 92, 246, 0.8)',
                  animationDelay: '0.4s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 4: Fuchsia */}
          <div 
              className="w-4 h-4 rounded-full bg-fuchsia-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(217, 70, 239, 0.8)',
                  animationDelay: '0.6s' 
              } as React.CSSProperties}
          ></div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
