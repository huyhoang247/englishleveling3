import React from 'react';

const BossBattleLoader: React.FC = () => {
  return (
    <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col justify-center items-center font-lilita text-white overflow-hidden">
      
      {/* TỐI ƯU 1: Bỏ animate-pulse ở nền, giảm độ blur hoặc bỏ hẳn nếu cần */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[60px]"></div>

      {/* TỐI ƯU 2: Tăng độ đậm nền (bg-slate-900/80), BỎ backdrop-blur */}
      <div className="relative z-10 flex flex-col items-center p-8 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
        
        {/* Animated Dots: CSS Transform rất nhẹ, không gây lag */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-5 h-5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-5 h-5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-5 h-5 rounded-full bg-pink-500 animate-bounce"></div>
        </div>

        <h2 className="text-2xl tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
          Loading...
        </h2>
      </div>

    </div>
  );
};

export default BossBattleLoader;
