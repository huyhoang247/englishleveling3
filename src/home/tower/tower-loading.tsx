import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* --- CSS Animations --- */}
      <style>{`
        @keyframes flow-bloom {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.5);
                opacity: 1;
                box-shadow: 0 0 20px var(--dot-color);
            }
            100% {
                transform: scale(0);
                opacity: 0;
            }
        }

        .loader-dot {
            will-change: transform, opacity;
            animation: flow-bloom 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* --- BACKGROUND LAYER (NO FILTERS - HIGH PERFORMANCE) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Ảnh gốc - Không dùng filter blur/brightness để tránh lag */}
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat"
              style={{ 
                  backgroundImage: `url(${BACKGROUND_IMAGE})`,
                  backgroundPosition: 'center 30px'
              }}
          />
          {/* Lớp phủ đen đơn giản để làm tối nền */}
          <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* --- DOTS CONTAINER --- */}
      <div className="relative z-10 flex items-center gap-6">
          
          {/* Dot 1: Cyan */}
          <div 
              className="w-4 h-4 rounded-full bg-cyan-400 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(34, 211, 238, 0.6)',
                  animationDelay: '0s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 2: Sky */}
          <div 
              className="w-4 h-4 rounded-full bg-sky-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(14, 165, 233, 0.6)',
                  animationDelay: '0.2s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 3: Violet */}
          <div 
              className="w-4 h-4 rounded-full bg-violet-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(139, 92, 246, 0.6)',
                  animationDelay: '0.4s' 
              } as React.CSSProperties}
          ></div>

          {/* Dot 4: Fuchsia */}
          <div 
              className="w-4 h-4 rounded-full bg-fuchsia-500 loader-dot" 
              style={{ 
                  '--dot-color': 'rgba(217, 70, 239, 0.6)',
                  animationDelay: '0.6s' 
              } as React.CSSProperties}
          ></div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
