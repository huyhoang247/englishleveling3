// --- START OF FILE PvpInvasion.tsx ---

import React, { useState } from 'react';
import {
    PlayerData, OpponentData, getMockOpponent,
    DefenseLogModal, SearchingModal, HomeIcon, CoinDisplay
} from './share.tsx';

interface PvpInvasionProps {
  onClose: () => void;
  player1: PlayerData;
  onCoinChange: (amount: number) => void;
}

export default function PvpInvasion({ onClose, player1, onCoinChange }: PvpInvasionProps) {
    const [view, setView] = useState<'main' | 'scouting' | 'battle'>('main');
    const [opponents, setOpponents] = useState<OpponentData[]>([]);
    const [currentTarget, setCurrentTarget] = useState<OpponentData | null>(null);
    const [battleResult, setBattleResult] = useState<{ result: 'win' | 'loss', goldStolen: number } | null>(null);
    const [showLogModal, setShowLogModal] = useState(false);

    const handleScout = () => {
        setView('scouting');
        setTimeout(() => {
            setOpponents([getMockOpponent('invasion'), getMockOpponent('invasion'), getMockOpponent('invasion')]);
        }, 1000);
    };

    const handleAttack = (target: OpponentData) => {
        setCurrentTarget(target);
        setView('battle');
        
        setTimeout(() => {
            const playerPower = player1.initialStats.atk * 1.5 + player1.initialStats.def;
            const targetPower = target.initialStats.atk * 1.5 + target.initialStats.def;
            
            if (playerPower > targetPower * (0.8 + Math.random() * 0.4)) {
                const goldStolen = Math.floor(target.coins * (0.1 + Math.random() * 0.05));
                onCoinChange(goldStolen);
                setBattleResult({ result: 'win', goldStolen });
            } else {
                setBattleResult({ result: 'loss', goldStolen: 0 });
            }
        }, 2000);
    };

    const reset = () => {
        setView('main');
        setOpponents([]);
        setCurrentTarget(null);
        setBattleResult(null);
    };

    return (
        <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
            {showLogModal && <DefenseLogModal log={player1.invasionLog} onClose={() => setShowLogModal(false)} />}
            <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                        <HomeIcon className="w-5 h-5 text-slate-300" />
                        <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                    <h1 className="text-2xl font-bold text-sky-400 text-shadow tracking-widest">XÂM LƯỢC</h1>
                    <CoinDisplay displayedCoins={player1.coins} />
                </div>
            </header>
            <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
                {view === 'main' && (
                    <div className="text-center animate-fade-in-scale-fast">
                        <h2 className="text-4xl">Chuẩn bị Xâm Lược</h2>
                        <p className="font-sans text-slate-400 mt-2 mb-8">Tấn công người chơi khác để cướp vàng hoặc củng cố phòng tuyến.</p>
                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button onClick={handleScout} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500">Dò Tìm Mục Tiêu</button>
                            <button onClick={() => alert("Tính năng đang phát triển!")} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Thiết Lập Phòng Thủ</button>
                            <button onClick={() => setShowLogModal(true)} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Nhật Ký Phòng Thủ</button>
                        </div>
                    </div>
                )}
                {view === 'scouting' && (
                    <div className="w-full max-w-4xl animate-fade-in">
                        <h2 className="text-3xl text-center mb-6">Chọn Mục Tiêu Tấn Công</h2>
                        {opponents.length === 0 ? <SearchingModal /> : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {opponents.map((op, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 flex flex-col items-center gap-3">
                                        <img src={op.avatarUrl} alt={op.name} className="w-24 h-24 rounded-full border-2 border-slate-600" />
                                        <h3 className="text-xl font-bold">{op.name}</h3>
                                        <p className="font-sans text-sm text-slate-400">Vàng có thể cướp:</p>
                                        <p className="font-bold text-lg text-yellow-300">~{(op.coins * 0.12).toLocaleString()}</p>
                                        <button onClick={() => handleAttack(op)} className="mt-2 w-full py-2 bg-red-600/50 hover:bg-red-600 rounded-lg font-bold border border-red-500">Tấn Công</button>
                                    </div>
                                ))}
                            </div>
                        )}
                         <div className="text-center mt-8">
                             <button onClick={reset} className="font-sans text-slate-400 hover:text-white underline">Hủy và quay lại</button>
                         </div>
                    </div>
                )}
                {view === 'battle' && (
                    <div className="text-center animate-fade-in-scale-fast">
                        {!battleResult ? <SearchingModal /> :
                         battleResult.result === 'win' ? (
                            <div>
                                <h2 className="text-5xl text-green-400">THẮNG LỢI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã cướp được <span className="font-bold text-yellow-300">{battleResult.goldStolen.toLocaleString()}</span> vàng từ {currentTarget?.name}.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         ) : (
                            <div>
                                <h2 className="text-5xl text-red-400">THẤT BẠI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã bị phòng tuyến của {currentTarget?.name} đánh bại.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         )
                        }
                    </div>
                )}
            </main>
        </div>
    );
}
// --- END OF FILE PvpInvasion.tsx ---
