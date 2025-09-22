// File: src/components/game/777/SlotLobbySkeleton.tsx

import React from 'react';

const SlotLobbySkeleton = () => {
    return (
        <div className="flex flex-col h-full w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans overflow-hidden">
            {/* --- Skeleton Header --- */}
            <div className="flex items-center justify-between h-[53px] px-4 border-b border-slate-700/50 shrink-0 bg-slate-950 z-10">
                <div className="h-8 w-8 bg-slate-800/70 rounded-lg animate-pulse"></div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-24 bg-slate-800/70 rounded-lg animate-pulse"></div>
                    <div className="h-8 w-24 bg-slate-800/70 rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* --- Skeleton Main Content --- */}
            <div className="flex-1 overflow-y-auto px-4 py-8 hide-scrollbar">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center text-center mb-8">
                        <svg className="animate-spin h-8 w-8 text-cyan-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <h2 className="text-xl font-bold text-slate-200">Đang kết nối đến sảnh chơi...</h2>
                        <p className="text-slate-400 mt-1">Vui lòng chờ trong giây lát.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-xl border-2 border-slate-700 p-4 h-48 flex flex-col bg-slate-900/70">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-20 bg-slate-800/80 rounded-full"></div>
                                    <div className="h-6 w-24 bg-slate-800/80 rounded-full"></div>
                                </div>
                                <div className="flex-grow"></div>
                                <div className="mt-auto h-20 w-full bg-black/20 rounded-lg border border-slate-700/50 p-3">
                                    <div className="flex items-center justify-around h-full">
                                        <div className="flex flex-col items-center gap-2"><div className="h-3 w-10 bg-slate-700 rounded"></div><div className="h-5 w-16 bg-slate-700 rounded"></div></div>
                                        <div className="w-px h-10 bg-slate-700/80"></div>
                                        <div className="flex flex-col items-center gap-2"><div className="h-3 w-12 bg-slate-700 rounded"></div><div className="h-5 w-14 bg-slate-700 rounded"></div></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotLobbySkeleton;
