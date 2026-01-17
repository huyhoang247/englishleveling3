

import React from 'react';

const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

const BossBattleLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center font-lilita overflow-hidden text-white">
      {/* Inject CSS for the specific loader animation to ensure smooth wave effect */}
      <style>{`
        @keyframes dot-wave {
            0%, 100% {
                transform: translateY(0) scale(1);
                opacity: 0.5;
                box-shadow: 0 0 0 rgba(34, 211, 238, 0);
            }
            50% {
                transform: translateY(-12px) scale(1.1);
                opacity: 1;
                box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
            }
        }
        .loader-dot {
            animation: dot-wave 1.4s infinite ease-in-out both;
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
          {/* Dark Overlay as requested */}
          <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        
        {/* Animated Dots */}
        <div className="flex items-center gap-4">
            <div 
                className="w-5 h-5 rounded-full bg-cyan-400 loader-dot" 
                style={{ animationDelay: '-0.32s' }}
            ></div>
            <div 
                className="w-5 h-5 rounded-full bg-cyan-400 loader-dot" 
                style={{ animationDelay: '-0.16s' }}
            ></div>
            <div 
                className="w-5 h-5 rounded-full bg-cyan-400 loader-dot" 
                style={{ animationDelay: '0s' }}
            ></div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-1">
            <p className="text-xl md:text-2xl tracking-[0.3em] uppercase text-cyan-100 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Loading
            </p>
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full opacity-60"></div>
        </div>

      </div>
    </div>
  );
};

export default BossBattleLoader;
