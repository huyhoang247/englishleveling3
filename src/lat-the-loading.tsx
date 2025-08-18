// --- START OF FILE lat-the-loading.tsx (FULL CODE - SYNCED) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-[#16213e] to-[#0a0a14] flex flex-col overflow-hidden">
      
      <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-white/20"></div>
            <div className="hidden sm:block h-4 w-16 rounded-md bg-white/20"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-7 w-20 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-5 pt-5 pb-[100px]">
        <div className="w-full max-w-[1300px] mx-auto flex flex-wrap justify-center gap-[30px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full max-w-[380px] min-w-[300px] bg-slate-800/50 rounded-2xl overflow-hidden border border-white/10 flex flex-col h-[320px]">
              <div className="h-9 bg-white/10 animate-pulse m-3 rounded-md"></div>
              <div className="p-5 pt-0 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-24 bg-white/10 animate-pulse rounded-full"></div>
                  <div className="h-5 w-28 bg-white/10 animate-pulse rounded-md"></div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 bg-white/10 animate-pulse rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 h-24 bg-white/10 animate-pulse rounded-lg"></div>
                </div>
                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="flex-1 h-12 bg-white/10 animate-pulse rounded-lg"></div>
                  <div className="flex-1 h-12 bg-white/10 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VocabularyChestLoadingSkeleton;
// --- END OF FILE lat-the-loading.tsx (FULL CODE - SYNCED) ---
