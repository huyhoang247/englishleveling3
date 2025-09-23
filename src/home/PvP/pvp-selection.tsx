// --- START OF FILE PvpSelection.tsx ---

import React from 'react';
import { PlayerData, CoinDisplay, HomeIcon, RankedIcon, WagerIcon, InvasionIcon } from './pvp/share.tsx';

interface PvpSelectionProps {
  onClose: () => void;
  playerData: PlayerData;
  onSelectMode: (mode: 'wager' | 'ranked' | 'invasion') => void;
}

export default function PvpSelection({ onClose, playerData, onSelectMode }: PvpSelectionProps) {
  return (
    <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
            <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
                <CoinDisplay displayedCoins={playerData.coins} />
            </div>
        </header>
        <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-shadow tracking-widest mb-4 text-center text-slate-200">ĐẤU TRƯỜNG</h1>
            <p className="font-sans text-slate-400 mb-12 text-center">Chọn một chế độ để bắt đầu cuộc chinh phạt của bạn.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Ranked Mode Card */}
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-purple-400/80 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-purple-900/50 group-hover:border-purple-400"><RankedIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-purple-300" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-purple-300">ĐẤU XẾP HẠNG</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Chiến đấu vì danh vọng. Khẳng định vị thế.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6">
                        <div className='flex justify-between items-baseline mb-1'><span className='font-bold text-lg text-slate-200'>{playerData.rankInfo.rankName}</span><span className='font-sans text-xs text-slate-400'>{playerData.rankInfo.rankPoints.toLocaleString()} / {playerData.rankInfo.rankMaxPoints.toLocaleString()} RP</span></div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${(playerData.rankInfo.rankPoints / playerData.rankInfo.rankMaxPoints) * 100}%` }}></div></div>
                    </div>
                    <button onClick={() => onSelectMode('ranked')} className="mt-auto w-full py-3 bg-purple-600/50 hover:bg-purple-600 rounded-lg font-bold tracking-wider uppercase border border-purple-500 hover:border-purple-400 transition-all">Tìm Trận</button>
                </div>
                {/* Wager Mode Card */}
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-red-500/80 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10">
                    <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-red-900/50 group-hover:border-red-500"><WagerIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-red-400" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-red-400">ĐẤU CƯỢC</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Liều ăn nhiều. Rủi ro càng cao, phần thưởng càng lớn.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6 flex flex-col items-center justify-center h-[76px]"><span className='font-sans text-xs text-slate-400'>VÀNG HIỆN CÓ</span><span className='font-bold text-2xl text-yellow-300 tracking-wider'>{playerData.coins.toLocaleString()}</span></div>
                    <button onClick={() => onSelectMode('wager')} className="mt-auto w-full py-3 bg-red-700/60 hover:bg-red-700 rounded-lg font-bold tracking-wider uppercase border border-red-600 hover:border-red-500 transition-all">Vào Sảnh</button>
                </div>
                {/* Invasion Mode Card */}
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-sky-500/80 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/10">
                     <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-sky-900/50 group-hover:border-sky-500"><InvasionIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-sky-400" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-sky-400">XÂM LƯỢC</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Tấn công người chơi khác, cướp tài nguyên, hoặc xây dựng phòng tuyến bất khả xâm phạm.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6 flex flex-col items-center justify-center h-[76px]"><span className='font-sans text-sm text-slate-300'>Phòng thủ gần nhất: {playerData.invasionLog[0] ? <span className={`font-bold ${playerData.invasionLog[0].result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{playerData.invasionLog[0].result === 'win' ? 'THẮNG' : 'THUA'}</span> : <span className='text-slate-400'>N/A</span>}</span><button onClick={() => alert("Mở nhật ký")} className="mt-2 text-xs font-sans text-slate-400 hover:text-white underline">Xem nhật ký</button></div>
                    <div className="mt-auto w-full flex gap-3">
                         <button onClick={() => onSelectMode('invasion')} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500 hover:border-sky-400 transition-all">Hành Động</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
// --- END OF FILE PvpSelection.tsx ---
