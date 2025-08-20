// --- START OF FILE skill-loading.tsx ---

import React from 'react';

const SkillScreenSkeleton = () => {
    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
             {/* --- Skeleton Header --- */}
            <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50">
                <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                    <div className="h-9 w-28 bg-slate-800/60 rounded-lg animate-pulse"></div>
                    <div className="h-9 w-32 bg-slate-800/60 rounded-lg animate-pulse"></div>
                </div>
            </header>

            {/* --- Skeleton Main Content --- */}
            <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8 animate-pulse">
                {/* Equipped Skills Skeleton */}
                <section className="flex-shrink-0 py-4">
                    <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-800/50"></div>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-800/50"></div>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-800/50"></div>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-800/50"></div>
                    </div>
                </section>
                
                {/* Crafting Section Skeleton */}
                <section className="flex-shrink-0 p-3 bg-black/20 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-800/50"></div>
                        <div className="h-6 w-20 bg-slate-800/50 rounded-md"></div>
                    </div>
                    <div className="h-12 w-28 bg-slate-700/80 rounded-lg"></div>
                </section>

                {/* Storage Section Skeleton */}
                <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 flex flex-col flex-grow min-h-0">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <div className="h-6 w-40 bg-slate-800/50 rounded-md"></div>
                        <div className="h-9 w-24 bg-slate-700/80 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
                        {Array.from({ length: 6 }).map((_, i) => (
                           <div key={i} className="w-full h-[88px] rounded-lg bg-slate-800/50"></div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SkillScreenSkeleton;

// --- END OF FILE skill-loading.tsx ---
