// --- START OF FILE tower-ads-modal.tsx ---

import React, { useState } from 'react';
import { bossBattleAssets, resourceAssets } from '../../game-assets.ts';
import { BattleRewards } from './tower-service.ts';

// --- HELPER FORMAT ---
const formatNum = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
};

interface AdsRewardModalProps {
    rewards: BattleRewards | null;
    onClaimX1: () => void;
    onClaimX2: () => void; // Trigger xem quảng cáo
}

export const AdsRewardModal = ({ rewards, onClaimX1, onClaimX2 }: AdsRewardModalProps) => {
    const [isWatchingAd, setIsWatchingAd] = useState(false);

    // Xử lý khi bấm nút xem quảng cáo (Giả lập)
    const handleAdClick = () => {
        setIsWatchingAd(true);
        // Ở đây bạn sẽ gọi SDK quảng cáo thực tế
        // Sau khi xem xong thì gọi onClaimX2
        setTimeout(() => {
            setIsWatchingAd(false);
            onClaimX2();
        }, 1500); // Giả lập loading 1.5s
    };

    if (!rewards) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in backdrop-blur-[2px]">
            {/* Main Container */}
            <div className="relative w-[360px] bg-[#1a1b26] border-2 border-slate-600 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center overflow-hidden animate-fade-in-scale-fast">
                
                {/* --- BACKGROUND EFFECTS --- */}
                {/* Top Glow */}
                <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-purple-600/20 blur-[60px] pointer-events-none" />
                
                {/* --- TITLE HEADER --- */}
                <div className="mt-8 z-10 flex flex-col items-center relative">
                    {/* Icon Trophy / Decoration */}
                    <div className="text-4xl mb-2 animate-bounce-small drop-shadow-lg">🏆</div>
                    <h2 className="text-3xl font-lilita text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 tracking-widest drop-shadow-sm">
                        VICTORY
                    </h2>
                    <div className="h-[2px] w-12 bg-purple-500 rounded-full mt-1 mb-1 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                </div>

                {/* --- REWARD COMPARISON LIST --- */}
                <div className="w-full px-5 py-4 z-10">
                    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-4 space-y-3 shadow-inner">
                        
                        {/* Header Labels (Optional) */}
                        <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Reward</span>
                            <span>With Ads</span>
                        </div>

                        {/* COINS */}
                        {rewards.coins > 0 && (
                            <RewardRow 
                                icon={bossBattleAssets.coinIcon} 
                                label="Coins" 
                                amount={rewards.coins} 
                            />
                        )}
                        
                        {/* RESOURCES */}
                        {rewards.resources.map((res, idx) => {
                            const resKey = res.type as keyof typeof resourceAssets;
                            const img = resourceAssets[resKey] || bossBattleAssets.coinIcon;
                            return (
                                <RewardRow 
                                    key={idx} 
                                    icon={img} 
                                    label={res.type} 
                                    amount={res.amount} 
                                />
                            );
                        })}
                    </div>
                </div>

                {/* --- ACTION BUTTONS (SIDE BY SIDE) --- */}
                <div className="w-full px-5 pb-6 z-10 flex gap-3 mt-auto">
                    
                    {/* BUTTON X1 (COLLECT) - SMALLER / SECONDARY */}
                    <button 
                        onClick={onClaimX1}
                        disabled={isWatchingAd}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center group"
                    >
                         <span className="text-slate-400 text-[10px] font-bold uppercase mb-[1px] group-hover:text-slate-300">No Thanks</span>
                         <span className="font-lilita text-slate-200 text-lg uppercase tracking-wide leading-none">Collect</span>
                    </button>

                    {/* BUTTON X2 (ADS) - LARGER / PRIMARY */}
                    <button 
                        onClick={handleAdClick}
                        disabled={isWatchingAd}
                        className="flex-[2] relative group py-3 bg-gradient-to-b from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 rounded-xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    >
                        {/* Shimmer Effect Animation */}
                        <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 z-20" />

                        {isWatchingAd ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="font-lilita text-white text-lg shadow-black drop-shadow-md">LOADING...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center leading-none z-10 w-full relative">
                                {/* HOT Badge */}
                                <div className="absolute -top-2.5 -right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm border border-red-400">
                                    HOT
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Video Icon */}
                                    <div className="bg-black/20 p-1.5 rounded-lg border border-white/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-100">
                                            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                                        </svg>
                                    </div>
                                    
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-1">
                                            <span className="font-lilita text-white text-2xl drop-shadow-md">GET X2</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-yellow-900/80 uppercase tracking-widest mt-1">Watch Ad</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB COMPONENT: REWARD ROW ---
// Hiển thị: Icon - Tên - Mũi tên - Giá trị x2
const RewardRow = ({ icon, label, amount }: { icon: string, label: string, amount: number }) => (
    <div className="relative flex items-center justify-between bg-[#15161e] p-2.5 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
        
        {/* Left: Normal Amount */}
        <div className="flex items-center gap-3">
            <div className="relative">
                <img src={icon} alt={label} className="w-9 h-9 object-contain drop-shadow-md" />
                {/* Small badge 1x */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center text-[8px] border border-slate-500 text-slate-300 font-bold">
                   1x
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-white font-lilita text-base tracking-wide">{formatNum(amount)}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{label}</span>
            </div>
        </div>
        
        {/* Center: Arrow Visual */}
        <div className="absolute left-1/2 -translate-x-1/2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
        </div>

        {/* Right: x2 Amount (Highlighted) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-900/40 to-green-800/20 px-3 py-1 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
            <span className="text-green-400 font-lilita text-lg drop-shadow-sm">
                {formatNum(amount * 2)}
            </span>
        </div>
    </div>
);
