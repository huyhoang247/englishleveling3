import React from 'react';

const TowerBattleSkeleton: React.FC = () => {
  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden animate-pulse">
      
      {/* --- Skeleton Header --- */}
      <header className="absolute top-0 left-0 right-0 z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 h-14">
          <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <div className="w-5 h-5 bg-slate-700/80 rounded-sm"></div>
                  <div className="hidden sm:inline h-4 w-20 bg-slate-700/80 rounded-sm"></div>
              </div>
              <div className="flex items-center gap-2 font-sans">
                  {/* Energy Display Skeleton */}
                  <div className="bg-slate-800/80 rounded-lg p-0.5 flex items-center border border-slate-700/60">
                      <div className="w-4 h-4 rounded-full bg-slate-700/80 mr-1"></div>
                      <div className="h-4 w-12 sm:w-16 bg-slate-700/80 rounded-sm"></div>
                      <div className="ml-0.5 w-3 h-3 bg-slate-700/80 rounded-full"></div>
                  </div>
                  {/* Coin Display Skeleton */}
                  <div className="bg-slate-800/80 rounded-lg p-0.5 flex items-center border border-slate-700/60">
                      <div className="w-4 h-4 rounded-full bg-slate-700/80 mr-1"></div>
                      <div className="h-4 w-12 sm:w-16 bg-slate-700/80 rounded-sm"></div>
                      <div className="ml-0.5 w-3 h-3 bg-slate-700/80 rounded-full"></div>
                  </div>
              </div>
          </div>
      </header>

      {/* --- Skeleton Player Info (Top-left) --- */}
      <div className="absolute top-16 left-4 z-20 flex flex-col items-start gap-2">
        <div className="w-64 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50 shadow-lg flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-600"></div>
            <div className="flex-grow flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md self-start border border-slate-700/80">
                    <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                    <div className="h-3 w-16 bg-slate-700 rounded-sm"></div>
                </div>
                <div className="relative w-full h-5 bg-black/40 rounded-full border border-slate-700/80 p-0.5">
                    <div className="h-full bg-slate-700 rounded-full w-4/5"></div>
                </div>
            </div>
        </div>
      </div>
      
      {/* --- Skeleton Action Buttons (Top-right) --- */}
      <div className="absolute top-16 right-4 z-20 flex justify-center gap-2">
          <div className="w-10 h-10 bg-slate-800/70 rounded-full border border-slate-600"></div>
          <div className="w-10 h-10 bg-slate-800/70 rounded-full border border-slate-600"></div>
      </div>
      

      {/* --- Main Content Area --- */}
      <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
        
        {/* Placeholder for spacing */}
        <div className="w-full max-w-2xl mx-auto mb-4 min-h-[5rem]"></div>
  
        {/* --- Skeleton Boss Area --- */}
        <div className="w-full max-w-4xl flex justify-center items-center my-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                <div className="h-8 w-24 bg-slate-700 rounded-md mb-1"></div>
                <div className="w-40 h-40 md:w-56 md:h-56 bg-slate-800/50 rounded-lg"></div>
                <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 mt-1">
                    <div className="h-full bg-slate-700 rounded-full w-full"></div>
                </div>
            </div>
        </div>
        
        {/* --- Skeleton Fight Button --- */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="h-[52px] w-40 bg-slate-900/80 rounded-lg border border-slate-700/60"></div>
        </div>
      </main>
    </div>
  );
};

export default TowerBattleSkeleton;
