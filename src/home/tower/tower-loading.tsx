import React from 'react';

const BossBattleLoader: React.FC = () => {
  return (
    <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden animate-pulse">
      
      {/* --- Skeleton Header (Correct) --- */}
      <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 h-14">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="w-5 h-5 bg-slate-700/80 rounded-sm"></div>
            <div className="hidden sm:inline h-4 w-16 bg-slate-700/80 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2 font-sans">
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
              <div className="w-4 h-4 rounded-full bg-slate-700/80"></div>
              <div className="h-4 w-12 bg-slate-700/80 rounded-sm"></div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
              <div className="w-4 h-4 rounded-full bg-slate-700/80"></div>
              <div className="h-4 w-12 bg-slate-700/80 rounded-sm"></div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Skeleton Player Info & Sweep Button (Top-Left) --- */}
      <div className="fixed top-16 left-4 z-20 flex flex-col items-start gap-2">
        <div className="w-64 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50 shadow-lg flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-600"></div>
          <div className="flex-grow flex flex-col gap-1.5">
            {/* START OF CORRECTION: Removed fixed height/width from container and matched placeholder height to line-height */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md self-start border border-slate-700/80">
                <div className="w-3 h-3 bg-slate-700/80 rounded-sm"></div>
                <div className="h-4 w-16 bg-slate-700/80 rounded-sm"></div>
            </div>
            {/* END OF CORRECTION */}
            <div className="w-full h-5 bg-black/40 rounded-full border border-slate-700/80 p-0.5">
              <div className="h-full w-3/4 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/70 rounded-lg border border-slate-600 px-4 py-1.5">
            <div className="h-[14px] w-20 bg-slate-700/80 rounded-sm"></div>
        </div>
      </div>
      
      {/* --- Main Content Area --- */}
      <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
        
        {/* --- Skeleton for Top-Right Buttons & Spacing (Correct Positioning) --- */}
        <div className="w-full max-w-2xl mx-auto mb-4 flex justify-between items-start min-h-[5rem]">
            <div></div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex justify-center gap-2">
                    <div className="w-10 h-10 bg-slate-800/70 rounded-full border border-slate-600"></div>
                    <div className="w-10 h-10 bg-slate-800/70 rounded-full border border-slate-600"></div>
                </div>
            </div>
        </div>
        
        {/* --- Skeleton Boss Area (Center) --- */}
        <div className="w-full max-w-4xl flex justify-center items-center my-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                <div className="h-8 w-20 bg-slate-700/80 rounded-md"></div>
                <div className="w-40 h-40 md:w-56 md:h-56 bg-slate-800/60 rounded-lg"></div>
                <div className="w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1">
                    <div className="h-full bg-slate-700 rounded-full w-full"></div>
                </div>
            </div>
        </div>

        {/* --- Skeleton Action Button (Bottom) (Correct) --- */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg border border-slate-700/40">
                <div className="flex flex-col items-center gap-0.5">
                    <div className="h-5 w-20 bg-slate-700 rounded-md"></div>
                    <div className="h-3 w-12 bg-slate-700 rounded-md"></div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default BossBattleLoader;
