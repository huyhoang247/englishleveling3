// --- START OF FILE tower-ad-popup.tsx ---

import React, { useState, useMemo } from 'react';
import { BattleRewards } from './tower-service.ts';
import { bossBattleAssets, resourceAssets } from '../../game-assets.ts';

interface DoubleRewardsPopupProps {
    originalRewards: BattleRewards;
    onWatchAd: () => void;
    onSkip: () => void;
}

const formatAmount = (num: number): string => {
    if (num >= 1000) return parseFloat((num / 1000).toFixed(1)) + 'k';
    return num.toString();
};

export const DoubleRewardsPopup = ({ originalRewards, onWatchAd, onSkip }: DoubleRewardsPopupProps) => {
    const [isWatching, setIsWatching] = useState(false);

    // Tính toán reward sau khi x2
    const doubledRewards = useMemo(() => {
        return {
            coins: originalRewards.coins * 2,
            resources: originalRewards.resources.map(res => ({
                ...res,
                amount: res.amount * 2
            }))
        };
    }, [originalRewards]);

    const handleAdClick = () => {
        setIsWatching(true);
        // Giả lập thời gian xem quảng cáo hoặc gọi SDK quảng cáo ở đây
        // Sau khi xong gọi onWatchAd
        setTimeout(() => {
            setIsWatching(false);
            onWatchAd();
        }, 1000); // Giả lập delay 1s
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            {/* Main Container with Gold Glow */}
            <div className="relative w-[340px] bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)] p-1 animate-victory-pulse flex flex-col items-center">
                
                {/* Header Decoration */}
                <div className="absolute -top-10 w-full flex justify-center">
                    <div className="bg-gradient-to-b from-yellow-400 to-orange-600 text-white font-lilita text-2xl px-8 py-2 rounded-lg border-2 border-yellow-200 shadow-lg tracking-widest uppercase rotate-[-2deg] z-10">
                        Double It!
                    </div>
                </div>

                <div className="w-full bg-slate-800/80 rounded-xl p-5 pt-8 flex flex-col items-center gap-4 relative overflow-hidden">
                    {/* Background Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />

                    <h3 className="text-yellow-300 font-lilita text-lg tracking-wide uppercase text-shadow-sm">
                        Receive extra rewards?
                    </h3>

                    {/* Comparison Area */}
                    <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        
                        {/* Current Rewards (Grayed out slightly) */}
                        <div className="flex flex-col gap-2 opacity-60 scale-90 grayscale-[0.5]">
                            <span className="text-center font-lilita text-white/50 text-xs uppercase">Current</span>
                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-700 flex flex-col gap-1 items-center">
                                {originalRewards.coins > 0 && (
                                    <div className="flex items-center gap-1">
                                        <img src={bossBattleAssets.coinIcon} className="w-4 h-4" />
                                        <span className="text-xs font-bold text-white">{formatAmount(originalRewards.coins)}</span>
                                    </div>
                                )}
                                {originalRewards.resources.slice(0, 2).map((r, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <img src={resourceAssets[r.type as keyof typeof resourceAssets]} className="w-4 h-4" />
                                        <span className="text-xs font-bold text-white">{formatAmount(r.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex flex-col items-center justify-center text-yellow-400 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>

                        {/* Doubled Rewards (Highlighted) */}
                        <div className="flex flex-col gap-2 scale-105">
                            <span className="text-center font-lilita text-yellow-400 text-xs uppercase animate-bounce">Total X2</span>
                            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-2 rounded-lg border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] flex flex-col gap-1 items-center">
                                {doubledRewards.coins > 0 && (
                                    <div className="flex items-center gap-1">
                                        <img src={bossBattleAssets.coinIcon} className="w-5 h-5 drop-shadow-md" />
                                        <span className="text-sm font-bold text-yellow-100">{formatAmount(doubledRewards.coins)}</span>
                                    </div>
                                )}
                                {doubledRewards.resources.slice(0, 2).map((r, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <img src={resourceAssets[r.type as keyof typeof resourceAssets]} className="w-5 h-5 drop-shadow-md" />
                                        <span className="text-sm font-bold text-yellow-100">{formatAmount(r.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-3 mt-2">
                        {/* WATCH AD BUTTON */}
                        <button 
                            onClick={handleAdClick}
                            disabled={isWatching}
                            className="group relative w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg flex items-center justify-center gap-2 overflow-hidden"
                        >
                            {/* Shining effect */}
                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:animate-[shine_1s_infinite]" />
                            
                            {isWatching ? (
                                <span className="text-white font-lilita text-lg tracking-wide animate-pulse">Loading Ad...</span>
                            ) : (
                                <>
                                    <span className="bg-black/20 p-1.5 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                                        </svg>
                                    </span>
                                    <div className="flex flex-col items-start leading-none text-white font-lilita">
                                        <span className="text-lg uppercase text-shadow">WATCH AD</span>
                                        <span className="text-[10px] text-green-100 opacity-90">GET X2 REWARDS</span>
                                    </div>
                                </>
                            )}
                        </button>

                        {/* NO THANKS BUTTON */}
                        <button 
                            onClick={onSkip}
                            disabled={isWatching}
                            className="text-slate-400 hover:text-white font-sans text-xs font-bold tracking-wide uppercase py-2 transition-colors"
                        >
                            No Thanks, Just Claim
                        </button>
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }
            `}</style>
        </div>
    );
};
// --- END OF FILE tower-ad-popup.tsx ---
