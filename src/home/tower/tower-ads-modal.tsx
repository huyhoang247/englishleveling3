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
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            {/* Main Container */}
            <div className="relative w-[340px] bg-slate-900 border-2 border-slate-600 rounded-3xl shadow-2xl flex flex-col items-center overflow-hidden animate-fade-in-scale-fast">
                
                {/* --- HEADER GLOW EFFECT --- */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-600/30 to-transparent pointer-events-none" />
                
                {/* --- TITLE --- */}
                <div className="mt-6 z-10 flex flex-col items-center">
                    <h2 className="text-3xl font-lilita text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        BATTLE END
                    </h2>
                    <span className="text-xs font-sans text-purple-300 uppercase tracking-[0.2em] font-bold">
                        Rewards Ready
                    </span>
                </div>

                {/* --- REWARD LIST --- */}
                <div className="w-full px-6 py-4 z-10">
                    <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 space-y-2">
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

                {/* --- ACTION BUTTONS --- */}
                <div className="w-full px-6 pb-6 z-10 flex flex-col gap-3 mt-2">
                    
                    {/* BUTTON X2 (ADS) */}
                    <button 
                        onClick={handleAdClick}
                        disabled={isWatchingAd}
                        className="relative group w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-xl border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />

                        {isWatchingAd ? (
                            <span className="font-lilita text-white text-lg animate-pulse">LOADING AD...</span>
                        ) : (
                            <>
                                <div className="bg-black/30 rounded px-2 py-0.5 text-xs font-bold text-yellow-100 flex items-center gap-1 border border-yellow-300/30">
                                    <span className="text-[10px]">▶</span> ADS
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-lilita text-white text-xl uppercase tracking-wide text-shadow-sm">Claim x2</span>
                                </div>
                            </>
                        )}
                    </button>

                    {/* BUTTON X1 (NORMAL) */}
                    <button 
                        onClick={onClaimX1}
                        disabled={isWatchingAd}
                        className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all"
                    >
                         <span className="font-lilita text-slate-300 text-base uppercase tracking-wide">Collect Normal</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB COMPONENT: REWARD ROW ---
// Hiển thị: Icon - Tên - Mũi tên xanh -> Giá trị x2
const RewardRow = ({ icon, label, amount }: { icon: string, label: string, amount: number }) => (
    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-white/5">
        <div className="flex items-center gap-3">
            <img src={icon} alt={label} className="w-8 h-8 object-contain drop-shadow-md" />
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                <span className="text-white font-lilita text-sm">{formatNum(amount)}</span>
            </div>
        </div>
        
        {/* Visual x2 Indicator */}
        <div className="flex items-center gap-1 opacity-90">
            <span className="text-slate-500 text-xs">➜</span>
            <span className="text-yellow-400 font-lilita text-base ml-1 drop-shadow-sm">
                {formatNum(amount * 2)}
            </span>
        </div>
    </div>
);

// --- END OF FILE tower-ads-modal.tsx ---
