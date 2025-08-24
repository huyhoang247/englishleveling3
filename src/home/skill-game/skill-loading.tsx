// --- START OF FILE skill-loading.tsx ---

import React from 'react';

const SkillScreenSkeleton = () => {
    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
             {/* --- Skeleton Header --- */}
            <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50">
                <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 animate-pulse">
                        <div className="w-5 h-5 bg-slate-700/80 rounded-sm" />
                        <div className="hidden sm:inline h-4 w-20 bg-slate-700/80 rounded-sm" />
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-0.5 flex items-center border border-slate-700/60 animate-pulse">
                        <div className="w-4 h-4 rounded-full bg-slate-700/80 mr-1"></div>
                        <div className="h-4 w-16 bg-slate-700/80 rounded-sm"></div>
                        <div className="ml-0.5 w-3 h-3 bg-slate-700/80 rounded-full border border-slate-700/60"></div>
                    </div>
                </div>
            </header>

            {/* --- Skeleton Main Content --- */}
            <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8 animate-pulse">
                {/* Equipped Skills Skeleton */}
                <section className="flex-shrink-0 py-4">
                    <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-800/50"></div>
                        ))}
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
                {/* SỬA ĐỔI: Section này được giữ nguyên các class flexbox để chiếm toàn bộ không gian còn lại */}
                <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 flex flex-col flex-grow min-h-0">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <div className="h-6 w-40 bg-slate-800/50 rounded-md"></div>
                        <div className="h-9 w-24 bg-slate-700/80 rounded-lg"></div>
                    </div>
                    {/* SỬA ĐỔI: Thêm một div bọc ngoài với class "flex-grow min-h-0" để khớp với cấu trúc của UI thật, cho phép lưới bên trong giãn nở và chiếm không gian. */}
                    <div className="flex-grow min-h-0">
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {/* Tăng số lượng item lên để đảm bảo lấp đầy màn hình trên hầu hết các độ phân giải */}
                            {Array.from({ length: 32 }).map((_, i) => (
                               <div key={i} className="aspect-square rounded-lg bg-slate-800/50"></div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SkillScreenSkeleton;
// --- END OF FILE skill-loading.tsx ---
