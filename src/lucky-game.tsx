import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import HomeButton from './ui//home-button.tsx';
import { useGame } from './GameContext.tsx'; 
import { useAnimateValue } from './ui/useAnimateValue.ts'; 

// --- SVG Icons (Removed drop-shadows inside icons) ---
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin Icon"
        className={className}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }}
      />
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';
const PickaxeIcon = ({ className }: { className?: string }) => <img src={pickaxeIconUrl} alt="Pickaxe Icon" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} />;
const ZapIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> );
const TrophyIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path> </svg> );
const HeartIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path> </svg> );
const GiftIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path> </svg> );
const PlayIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"> <path d="M8 5v14l11-7z" /> </svg> );
const InfoIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg> );


// --- Interfaces ---
interface Item {
  icon: React.FC<{ className?: string }> | string;
  name: string;
  value: number; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  rewardType?: 'coin' | 'pickaxe' | 'other';
  rewardAmount?: number;
}
interface StripItem extends Item {
  uniqueId: string;
}

interface LuckyChestGameProps {
  onClose: () => void;
  isStatsFullscreen?: boolean; 
}

interface RewardPopupProps {
  item: Item;
  jackpotWon: boolean;
  onClose: () => void;
}

interface RateInfoPopupProps {
    items: Item[];
    onClose: () => void;
    getWeight: (rarity: string) => number;
}

// --- UTILITY FUNCTIONS ---
const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; 
      case 'uncommon': return '#34d399'; 
      case 'rare': return '#38bdf8'; 
      case 'epic': return '#a78bfa'; 
      case 'legendary': return '#fbbf24'; 
      case 'jackpot': return '#f59e0b'; 
      default: return '#9ca3af';
    }
};

// [OPTIMIZED] Removed heavy glow shadows, used borders instead
const getCardStyle = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400' };
      case 'uncommon': return { bg: 'bg-emerald-900/40', border: 'border-emerald-600', text: 'text-emerald-400' };
      case 'rare': return { bg: 'bg-cyan-900/40', border: 'border-cyan-600', text: 'text-cyan-400' };
      case 'epic': return { bg: 'bg-fuchsia-900/40', border: 'border-fuchsia-600', text: 'text-fuchsia-400' };
      case 'legendary': return { bg: 'bg-amber-900/40', border: 'border-amber-500', text: 'text-amber-400' };
      case 'jackpot': return { bg: 'bg-gradient-to-b from-red-900/60 to-amber-900/60', border: 'border-yellow-400', text: 'text-yellow-400' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400' };
    }
};

// --- WEIGHT CONFIGURATION ---
const RARITY_WEIGHTS = {
    'common': 2000,
    'uncommon': 800,
    'rare': 300,
    'epic': 80,
    'legendary': 20,
    'jackpot': 5
};

// --- OPTIMIZED COMPONENT: GameCard ---
// Removed drop-shadows, simplified rendering structure
const GameCard = React.memo(({ item }: { item: StripItem }) => {
    const style = getCardStyle(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center transform will-change-transform" // added will-change-transform
            style={{ width: 110, marginRight: 12 }} 
        >
            <div className={`
                relative w-full aspect-[4/5] rounded-xl 
                ${style.bg} border ${style.border}
                flex flex-col items-center justify-center gap-2
                shadow-sm 
            `}> 
                {/* Removed internal glow divs and heavy gradients */}
                
                <div className="relative z-10 p-2 rounded-xl bg-slate-900/50 w-14 h-14 flex items-center justify-center">
                    {typeof item.icon === 'string' ? (
                        <img src={item.icon} alt={item.name} loading="lazy" className="w-9 h-9 object-contain" />
                    ) : (
                        <item.icon className={`w-9 h-9 ${item.color}`} />
                    )}
                </div>
                
                <div className="relative z-10 text-center w-full px-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wider opacity-90 truncate ${item.rarity === 'jackpot' ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {item.name || item.rarity}
                    </div>
                    {/* Removed drop-shadow from text */}
                    <div className="text-sm font-black text-white mt-1 font-lilita tracking-wide">
                        {item.rarity === 'jackpot' ? 'JACKPOT' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- CONFIG ---
const CARD_WIDTH = 110;
const CARD_GAP = 12;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 5;
const BASE_COST = 100;
const SPIN_DURATION_SEC = 6;

// --- RATE INFO POPUP ---
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
                    <div className="flex items-center gap-2">
                         <div className="bg-cyan-900/30 p-1.5 rounded-lg">
                            <InfoIcon className="w-5 h-5 text-cyan-400" />
                         </div>
                         <h3 className="text-xl font-lilita text-white tracking-wide uppercase">Tỷ lệ rơi vật phẩm</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {sortedItems.map((item, idx) => {
                        const isJackpot = item.rarity === 'jackpot';
                        const rate = (item.weight / totalWeight) * 100;
                        let displayRate = rate < 0.01 ? '< 0.01' : rate.toFixed(2);
                        if (rate >= 1 && rate % 1 === 0) displayRate = rate.toFixed(0);

                        const style = getCardStyle(item.rarity);
                        return (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border bg-slate-800 ${isJackpot ? 'border-yellow-500/50' : 'border-slate-700/50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg} border ${style.border} shadow-sm`}>
                                         {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
                                        ) : (
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
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

// --- REWARD POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    const handleWatchAds = () => {
        console.log("Watching Ads for x2 Reward...");
        onClose();
    };

    return (
    // [OPTIMIZED] bg-black/95 instead of blur
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-[340px] bg-slate-900 border-2 rounded-3xl shadow-xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center mt-8
            ${jackpotWon ? 'border-yellow-400' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
             <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-slate-800 border-4 shadow-lg ${jackpotWon ? 'border-yellow-400' : 'border-slate-600'}`}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-16 h-16 object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56/cccccc/000000?text=Lỗi'; }} />
                ) : (
                    <item.icon className={`w-16 h-16 ${item.color}`} />
                )}
             </div>
        </div>

        <div className="mt-14 mb-2">
            {jackpotWon ? (
                <>
                    <h2 className="text-4xl font-black text-yellow-400 tracking-widest uppercase mb-1 animate-pulse">JACKPOT!</h2>
                    <p className="font-sans text-yellow-200/80 text-sm">Bạn đã trúng toàn bộ quỹ thưởng!</p>
                </>
            ) : (
                <>
                    <h2 className="text-3xl font-bold uppercase tracking-wide" style={{ color: rarityColor }}>{item.name || item.rarity}</h2>
                    <p className="font-sans text-slate-400 text-xs uppercase tracking-widest mt-1 font-semibold">{item.rarity} Reward</p>
                </>
            )}
        </div>

        <div className="flex flex-col gap-2 w-full my-6">
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center">
                 <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-widest mb-1">BẠN NHẬN ĐƯỢC</span>
                 <div className="flex items-center gap-3">
                    {item.rewardType === 'coin' && (
                        <>
                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                            <span className="text-4xl font-black text-yellow-400">{item.value.toLocaleString()}</span>
                        </>
                    )}
                    {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                        <>
                            {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-8 h-8" />}
                            {item.rewardType === 'other' && typeof item.icon !== 'string' && <item.icon className={`w-8 h-8 ${item.color}`} />}
                            <span className="text-4xl font-black text-white">x{item.rewardAmount?.toLocaleString()}</span>
                        </>
                    )}
                 </div>
            </div>
        </div>
        
        <div className="flex w-full gap-3 mt-1">
            <button onClick={handleWatchAds} className="group relative flex-1">
                <div className="relative h-full bg-emerald-600 hover:bg-emerald-500 rounded-xl border-t border-white/20 shadow-md flex flex-col items-center justify-center py-2.5 px-1 active:scale-95 transition-all">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="bg-black/20 p-1 rounded-full"><PlayIcon className="w-3.5 h-3.5 text-white" /></div>
                        <span className="text-xl font-black text-white italic tracking-wide">x2</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-100 bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Watch Ads</span>
                </div>
            </button>
            <button onClick={onClose} className="flex-[0.8] bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-xl shadow-md flex items-center justify-center active:scale-95 transition-all">
                <span className="text-slate-200 font-bold text-lg uppercase tracking-wider">Claim</span>
            </button>
        </div>
      </div>
    </div>
    );
};

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen = false }: LuckyChestGameProps) => {
  const { coins, updateCoins, handleUpdatePickaxes, jackpotPool, handleUpdateJackpotPool } = useGame();
  const animatedCoins = useAnimateValue(coins, 800);
  const animatedJackpot = useAnimateValue(jackpotPool, 800);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinMultiplier, setSpinMultiplier] = useState<1 | 10>(1);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  
  // UI Popup States
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);
  const [showRatePopup, setShowRatePopup] = useState(false);
  
  // Game Logic States
  const [pendingContribution, setPendingContribution] = useState(0);
  const [lastWinItem, setLastWinItem] = useState<StripItem | null>(null);

  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  // Helper function to get weight
  const getItemWeight = useCallback((rarity: string) => {
      return RARITY_WEIGHTS[rarity as keyof typeof RARITY_WEIGHTS] || 50;
  }, []);

  const handleCloseRatePopup = useCallback(() => {
    setShowRatePopup(false);
  }, []);

  const baseItems: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  const displayItems = useMemo(() => {
    return baseItems.map(item => {
        if (item.rarity === 'jackpot') return item;
        return {
            ...item,
            value: item.value * spinMultiplier,
            rewardAmount: item.rewardAmount ? item.rewardAmount * spinMultiplier : undefined
        };
    });
  }, [baseItems, spinMultiplier]);

  const getRandomFiller = useCallback(() => {
    const fillerItems = displayItems.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [displayItems]);

  useEffect(() => {
    setLastWinItem(null); 
    const initStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS + 5; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${spinMultiplier}-${i}` });
    }
    setStrip(initStrip);
    setOffset(0);
  }, [getRandomFiller, spinMultiplier]); 

  const spinChest = useCallback(() => {
    const cost = BASE_COST * spinMultiplier;
    if (isSpinning || coins < cost) return;

    updateCoins(-cost);
    
    const contribution = (Math.random() * (100 - 10) + 10) * spinMultiplier;
    setPendingContribution(Math.floor(contribution)); 

    setTimeout(() => {
        setIsSpinning(true);
        setJackpotWon(false);
        setShowRewardPopup(false);

        let totalWeight = 0;
        const weightedPool = displayItems.map(item => {
            const weight = getItemWeight(item.rarity);
            totalWeight += weight;
            return { ...item, weight };
        });

        let randomValue = Math.random() * totalWeight;
        let winner = weightedPool[0];
        for (const item of weightedPool) {
            if (randomValue < item.weight) {
                winner = item;
                break;
            }
            randomValue -= item.weight;
        }

        const TARGET_INDEX = 50; 
        const newStrip: StripItem[] = [];

        const startNode = lastWinItem 
            ? { ...lastWinItem, uniqueId: `anchor-prev-${Date.now()}` } 
            : (strip.length > 0 ? strip[0] : { ...getRandomFiller(), uniqueId: `anchor-init-${Date.now()}` });

        newStrip.push(startNode);

        for (let i = 0; i < TARGET_INDEX; i++) {
            newStrip.push({ ...getRandomFiller(), uniqueId: `spin-mid-${Date.now()}-${i}` });
        }

        newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });

        for (let i = 0; i < 5; i++) {
            newStrip.push({ ...getRandomFiller(), uniqueId: `spin-end-${Date.now()}-${i}` });
        }

        setStrip(newStrip);
        setTransitionDuration(0);
        setOffset(0);

        setTimeout(() => {
            const distanceToIndex = 1 + TARGET_INDEX; 
            const finalOffset = -(distanceToIndex * ITEM_FULL_WIDTH);

            setTransitionDuration(SPIN_DURATION_SEC);
            setOffset(finalOffset);
            
            setTimeout(() => {
                setIsSpinning(false);
                
                let actualValue = winner.value;
                if (winner.rewardType === 'pickaxe' && winner.rewardAmount) {
                    actualValue = winner.rewardAmount;
                } else if (winner.rarity === 'jackpot') {
                    actualValue = jackpotPool; 
                    setJackpotWon(true);
                    setJackpotAnimation(true);
                    setTimeout(() => setJackpotAnimation(false), 3000);
                }
                
                setLastWinItem(winner);
                setWonRewardDetails({ ...winner, value: actualValue });
                setShowRewardPopup(true);
            }, (SPIN_DURATION_SEC * 1000) + 100); 
        }, 50);
    }, 10);

  }, [isSpinning, coins, displayItems, updateCoins, jackpotPool, getRandomFiller, spinMultiplier, lastWinItem, strip, getItemWeight]);
  
  const handleClaimReward = useCallback(() => {
      if (!wonRewardDetails) {
          setShowRewardPopup(false);
          return;
      }

      if (wonRewardDetails.rarity === 'jackpot') {
          updateCoins(wonRewardDetails.value); 
          handleUpdateJackpotPool(0, true);
      } else {
          handleUpdateJackpotPool(pendingContribution);
          if (wonRewardDetails.rewardType === 'coin') {
              updateCoins(wonRewardDetails.value);
          } else if (wonRewardDetails.rewardType === 'pickaxe' && wonRewardDetails.rewardAmount) {
              handleUpdatePickaxes(wonRewardDetails.rewardAmount);
          }
      }

      setShowRewardPopup(false);
      setWonRewardDetails(null);
      setJackpotWon(false);

  }, [wonRewardDetails, pendingContribution, updateCoins, handleUpdateJackpotPool, handleUpdatePickaxes]);

  const currentCost = BASE_COST * spinMultiplier;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center font-sans overflow-hidden z-50">
      
      {/* --- BACKGROUND (Removed heavy noise overlay and blur) --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/10 blur-[80px] rounded-full"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 z-[60] shadow-sm">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-3">
            <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={isStatsFullscreen} />
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 pt-[53px]">
        
        {/* --- JACKPOT UI (Reduced Shadows) --- */}
        <div className="text-center mb-10 -mt-12 w-full max-w-lg z-10 transform hover:scale-105 transition-transform duration-300">
            <div className={`
                relative p-4 rounded-2xl border-4 transition-all duration-500 overflow-hidden
                ${ jackpotAnimation ? 'bg-gradient-to-r from-yellow-600 to-red-600 border-yellow-300' : 'bg-slate-900 border-slate-700 shadow-md' }
            `}>
              <button 
                onClick={() => setShowRatePopup(true)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-sm z-20 group"
              >
                  <InfoIcon className="w-4 h-4" />
              </button>

              <div className="text-yellow-400/90 text-sm font-bold tracking-[0.3em] mb-1 uppercase"> JACKPOT POOL </div>
              <div className={`text-5xl font-lilita text-white flex items-center justify-center gap-2 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                <span className="text-white">{animatedJackpot.toLocaleString()}</span>
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10" />
              </div>
              
              {(() => {
                  const jackpotWeight = RARITY_WEIGHTS['jackpot'];
                  let total = 0;
                  baseItems.forEach(i => total += RARITY_WEIGHTS[i.rarity as keyof typeof RARITY_WEIGHTS] || 50);
                  const jackpotRate = (jackpotWeight / total) * 100;
                  return (
                    <div className="text-slate-400 text-xs mt-2 font-medium tracking-wide"> Tỉ lệ quay trúng ô JACKPOT: <span className="text-yellow-400 font-bold">{jackpotRate.toFixed(2)}%</span> </div>
                  );
              })()}
            </div>
        </div>
        
        {/* --- SPINNER UI (Optimized shadows) --- */}
        <div className="relative w-full max-w-4xl mb-12">
            <div className="relative h-60 w-full bg-[#0a0a0a] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
                {/* Removed heavy inset shadow div */}
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-80"></div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent z-20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent z-20"></div>

                <div className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform z-10"
                    style={{
                        transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, 
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item) => ( <GameCard key={item.uniqueId} item={item} /> ))}
                </div>
            </div>

            {/* TARGET UI */}
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                 <div className="absolute h-full w-[130px] bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>
                 <div className="relative w-[124px] h-[calc(100%-24px)] border border-yellow-500/30 rounded-xl"></div>
                 <div className="absolute inset-0 flex justify-center"><div className="h-full w-[1px] bg-yellow-500/50"></div></div>
                 <div className="absolute top-0 transform -translate-y-1/2 z-40"><div className="w-4 h-4 bg-yellow-500 rotate-45 border border-yellow-900"></div></div>
                 <div className="absolute bottom-0 transform translate-y-1/2 z-40"><div className="w-4 h-4 bg-yellow-500 rotate-45 border border-yellow-900"></div></div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center z-20">
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mb-4 shadow-md">
                 <button onClick={() => !isSpinning && setSpinMultiplier(1)} className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 1 ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} disabled={isSpinning}>x1</button>
                 <button onClick={() => !isSpinning && setSpinMultiplier(10)} className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 10 ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} disabled={isSpinning}>x10</button>
              </div>

              <button
                onClick={spinChest}
                disabled={isSpinning || coins < currentCost}
                className="group relative w-48 h-16 rounded-xl overflow-hidden transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 border-2 bg-slate-900 border-cyan-700"
              >
                <div className={`absolute inset-0 transition-transform duration-1000 ${isSpinning ? 'translate-x-full' : 'translate-x-0'} bg-cyan-900/30`}></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                    {isSpinning ? ( <span className="font-lilita text-lg text-slate-400 tracking-wider">SPINNING...</span> ) : (
                        <>
                            <span className="font-lilita text-2xl uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">SPIN</span>
                            <div className="flex items-center gap-1.5 mt-0.5 bg-black/40 px-3 py-0.5 rounded-md border border-white/5">
                                <span className={`text-lg font-lilita tracking-wide leading-none ${coins < currentCost ? 'text-red-500' : 'text-slate-200'}`}>{currentCost}</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3.5 h-3.5" />
                            </div>
                        </>
                    )}
                </div>
              </button>
        </div>
      </div>
      
      {coins < currentCost && !isSpinning && (
          <div className="fixed bottom-3 right-3 z-[100] animate-fade-in pointer-events-none">
              <div className="bg-slate-900 border border-red-500/40 text-red-400 pl-2.5 pr-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
                   <span className="font-bold text-xs tracking-wide">Không đủ xu để quay!</span>
              </div>
          </div>
      )}

      {/* POPUPS */}
      {showRatePopup && (
          <RateInfoPopup 
              items={baseItems} 
              onClose={handleCloseRatePopup} 
              getWeight={getItemWeight} 
          />
      )}
      
      {showRewardPopup && wonRewardDetails && ( 
          <RewardPopup 
            item={wonRewardDetails} 
            jackpotWon={jackpotWon} 
            onClose={handleClaimReward} 
          /> 
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
