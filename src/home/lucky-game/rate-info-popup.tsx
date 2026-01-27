import React, { useMemo } from 'react';
import { 
    Item, 
    getRarityColor, 
    getCardStyle 
} from './lucky-game-data.tsx';

// --- INTERFACES ---
export interface RateInfoPopupProps {
    items: Item[];
    onClose: () => void;
    getWeight: (rarity: string) => number;
}

// --- COMPONENT ---
const RateInfoPopup = React.memo(({ items, onClose, getWeight }: RateInfoPopupProps) => {
    const rarityOrder: Record<string, number> = { 'jackpot': 0, 'legendary': 1, 'epic': 2, 'rare': 3, 'uncommon': 4, 'common': 5 };
    
    const { sortedItems, totalWeight } = useMemo(() => {
        let total = 0;
        const itemsWithWeight = items.map(item => {
            const w = getWeight(item.rarity);
            total += w;
            return { ...item, weight: w };
        });

        const sorted = itemsWithWeight.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        return { sortedItems: sorted, totalWeight: total };
    }, [items, getWeight]);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-xl flex flex-col max-h-[80vh] animate-fade-in-scale-fast"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-2xl">
                    <div className="flex items-center">
                         {/* Đã xóa icon ở đây */}
                         <h3 className="text-xl font-lilita text-white tracking-wide uppercase">Drop Rate</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Class [&::-webkit-scrollbar]:hidden ẩn scrollbar trên Chrome/Safari/Edge */}
                {/* Class [scrollbar-width:none] ẩn scrollbar trên Firefox */}
                <div className="overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {sortedItems.map((item, idx) => {
                        const isJackpot = item.rarity === 'jackpot';
                        const rate = (item.weight / totalWeight) * 100;
                        let displayRate = rate < 0.01 ? '< 0.01' : rate.toFixed(2);
                        if (rate >= 1 && rate % 1 === 0) displayRate = rate.toFixed(0);

                        const style = getCardStyle(item.rarity);
                        return (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border bg-slate-800 ${isJackpot ? 'border-yellow-500/50' : 'border-slate-700/50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${style.bg} border ${style.border} shadow-sm`}>
                                         {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                                        ) : (
                                            <item.icon className={`w-8 h-8 ${item.color}`} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-200">{item.name || 'Item'}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: getRarityColor(item.rarity) }}>
                                            {item.rarity}
                                            {!isJackpot && <span className="text-slate-500 ml-1">• {item.rewardAmount ? `x${item.rewardAmount}` : item.value}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-lilita text-lg ${isJackpot ? 'text-yellow-400' : 'text-white'}`}>
                                        {displayRate}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default RateInfoPopup;
