
import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* --- CSS Animations --- */}
      <style>{`
        @keyframes subtle-bounce {
            0%, 100% {
                transform: translateY(0) scale(0.85);
                opacity: 0.5;
                filter: brightness(1);
            }
            50% {
                transform: translateY(-16px) scale(1.15);
                opacity: 1;
                filter: brightness(1.3);
            }
        }
        .loader-dot {
            animation: subtle-bounce 1.5s infinite ease-in-out both;
        }
      `}</style>

      {/* --- BACKGROUND LAYER (Matches tower-ui.tsx) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
              className="absolute inset-0 bg-cover bg-no-repeat bg-slate-900"
              style={{ 
                  backgroundImage: `url(${BACKGROUND_IMAGE})`,
                  backgroundPosition: 'center 30px'
              }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* --- 3 COLORED DOTS --- */}
      <div className="relative z-10 flex items-center gap-6">
          
          {/* Dot 1: Cyan (Magic/Energy) */}
          <div 
              className="w-5 h-5 rounded-full bg-cyan-400 loader-dot shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-cyan-300/30" 
              style={{ animationDelay: '-0.32s' }}
          ></div>

          {/* Dot 2: Purple/Fuchsia (Mystery/Void) */}
          <div 
              className="w-5 h-5 rounded-full bg-fuchsia-500 loader-dot shadow-[0_0_20px_rgba(217,70,239,0.6)] border border-fuchsia-400/30" 
              style={{ animationDelay: '-0.16s' }}
          ></div>

          {/* Dot 3: Yellow/Amber (Power/Gold) */}
          <div 
              className="w-5 h-5 rounded-full bg-amber-400 loader-dot shadow-[0_0_20px_rgba(251,191,36,0.6)] border border-amber-300/30" 
              style={{ animationDelay: '0s' }}
          ></div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
