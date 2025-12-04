// --- START OF FILE phrase-loading.tsx ---

import React from 'react';

// --- STYLES & SKELETON (DESIGN FOR DARK MODE) ---
const styles = `
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
`;

// Skeleton for a single phrase item
const PhraseSkeletonItem = () => (
  <div className="relative bg-gray-900/70 p-4 rounded-xl border border-gray-800 overflow-hidden min-h-[100px]">
    {/* Shimmer Effect Layer (Optimized for Dark Mode) */}
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>

    {/* Header & Button Placeholder */}
    <div className="flex justify-between items-start mb-3">
      {/* English Text Lines Placeholder */}
      <div className="space-y-2 w-full pr-12">
        <div className="h-5 bg-gray-800 rounded-md w-3/4"></div>
        <div className="h-5 bg-gray-800 rounded-md w-1/2"></div>
      </div>
      
      {/* Audio Button Placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0"></div>
    </div>

    {/* Vietnamese Text Placeholder */}
    <div className="h-4 bg-gray-800/50 rounded-md w-2/3 mt-2"></div>
  </div>
);

// Skeleton List to show multiple items
export const PhraseSkeletonList = () => (
  <>
    <style>{styles}</style>
    <div className="h-full w-full bg-slate-900 flex flex-col p-4 sm:p-6 space-y-4">
        {/* Fake Header for smooth transition */}
        <div className="h-14 w-full bg-slate-800/50 rounded-lg animate-pulse mb-4 opacity-50"></div>
        
        <div className="max-w-4xl mx-auto space-y-4 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
            <PhraseSkeletonItem key={i} />
            ))}
        </div>
    </div>
  </>
);

export default PhraseSkeletonList;
