// --- START OF FILE tower-ads-modal.tsx ---

import React, { memo } from 'react';
import { bossBattleAssets, resourceAssets } from '../../game-assets.ts'; // Đảm bảo đường dẫn đúng
import { BattleRewards } from './tower-service.ts';

interface AdsDoubleRewardModalProps {
    originalRewards: BattleRewards | null;
    onWatchAd: () => void;
    onSkip: () => void;
}

// Helper format số lượng (k, m, b)
const formatAmount = (num: number): string => {
    if (num >= 1_000_000_000) return parseFloat((num / 1_000_000_000).toFixed(1)) + 'b';
    if (num >= 1_000_000) return parseFloat((num / 1_000_000).toFixed(1)) + 'm';
    if (num >= 1_000) return parseFloat((num / 1_000).toFixed(1)) + 'k';
    return num.toString();
};

const RewardPreviewItem = ({ icon, amount, label }: { icon: string, amount: number, label: string }) => (
    <div className="flex flex-col items-center justify-center bg-black/40 p-2 rounded-lg border border-yellow-500/30 w-full relative overflow-hidden group">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <img src={icon} alt={label} className="w-8 h-8 object-contain mb-1 drop-shadow-md z-10" />
        <span className="text-sm font-bold text-yellow-100 text-shadow-sm z-10">+{formatAmount(amount)}</span>
    </div>
);

export const AdsDoubleRewardModal = memo(({ originalRewards, onWatchAd, onSkip }: AdsDoubleRewardModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] animate-fade-in font-lilita">
            {/* Main Card */}
            <div className="relative w-80 bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center p-6 animate-fade-in-scale-fast overflow-hidden">
                
                {/* Background Rays Effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_20deg,transparent_40deg,#fbbf24_60deg,transparent_80deg,#fbbf24_100deg,transparent_120deg)] animate-[spin_10s_linear_infinite]"></div>
                </div>

                {/* Badge X2 */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-300 to-orange-500 text-white px-6 py-1 rounded-full border-2 border-white shadow-lg z-20">
                    <span className="text-2xl font-black italic tracking-wider drop-shadow-md">X2 REWARDS</span>
                </div>

                <div className="mt-6 text-center z-10">
                    <h3 className="text-white text-lg leading-tight mb-1">Double Your Loot?</h3>
                    <p className="text-slate-400 font-sans text-xs">Watch a short video to claim extra rewards!</p>
                </div>

                {/* Rewards Grid Preview */}
                <div className="w-full bg-slate-800/80 rounded-xl p-3 mt-4 border border-slate-700 z-10">
                    <p className="text-center text-yellow-400/80 text-[10px] uppercase tracking-widest mb-2 font-sans font-bold">You will receive extra:</p>
                    <div className="grid grid-cols-2 gap-2">
                         {originalRewards && originalRewards.coins > 0 && (
                            <RewardPreviewItem 
                                icon={bossBattleAssets.coinIcon} 
                                amount={originalRewards.coins} 
                                label="Coins" 
                            />
                        )}
                        {originalRewards && originalRewards.resources && originalRewards.resources.map((res, idx) => {
                            const resKey = res.type as keyof typeof resourceAssets;
                            const img = resourceAssets[resKey] || bossBattleAssets.coinIcon;
                            return (
                                <RewardPreviewItem key={idx} icon={img} amount={res.amount} label={res.type} />
                            );
                        })}
                    </div>
                </div>

                {/* ADS Button */}
                <button 
                    onClick={onWatchAd}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 text-white py-3 rounded-xl flex items-center justify-center gap-3 transition-all group z-10 shadow-lg relative overflow-hidden"
                >
                    {/* Icon Play/Ads */}
                    <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white group-hover:scale-110 transition-transform">
                            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xs font-sans font-bold text-green-100 uppercase">Watch Ad</span>
                        <span className="text-xl font-bold tracking-wide">CLAIM X2</span>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </button>

                {/* Skip Button */}
                <button 
                    onClick={onSkip}
                    className="mt-3 text-slate-500 hover:text-white text-sm font-sans font-semibold underline decoration-slate-600 underline-offset-4 transition-colors z-10"
                >
                    No thanks, I hate free stuff
                </button>
            </div>
            
            {/* Styles for shine animation */}
            <style>{`
                @keyframes shine {
                    100% { left: 125%; }
                }
                .animate-shine {
                    animation: shine 1s;
                }
            `}</style>
        </div>
    );
});
