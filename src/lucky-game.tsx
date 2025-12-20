import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import HomeButton from './ui//home-button.tsx';
import { useGame } from './GameContext.tsx'; // Import Hook
import { useAnimateValue } from './ui/useAnimateValue.ts'; // Import Hook Animate

// --- SVG Icons ---
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
  color?: string; // Giữ lại để tương thích, nhưng chủ yếu dùng style map mới
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

// --- NEW STYLE LOGIC (MATCHING EQUIPMENT-UI) ---
const getRarityStyles = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': // Rank E - Gray
        return { 
            border: 'border-gray-500', 
            text: 'text-gray-400', 
            bgGradient: 'from-gray-800/80 to-slate-900',
            rankName: 'Rank E'
        };
      case 'uncommon': // Rank D - Green
        return { 
            border: 'border-green-500', 
            text: 'text-green-400', 
            bgGradient: 'from-green-900/80 to-slate-900',
            rankName: 'Rank D'
        };
      case 'rare': // Rank B - Blue
        return { 
            border: 'border-blue-500', 
            text: 'text-blue-400', 
            bgGradient: 'from-blue-900/80 to-slate-900',
            rankName: 'Rank B'
        };
      case 'epic': // Rank A - Purple
        return { 
            border: 'border-purple-500', 
            text: 'text-purple-400', 
            bgGradient: 'from-purple-900/80 to-slate-900',
            rankName: 'Rank A'
        };
      case 'legendary': // Rank S - Yellow
        return { 
            border: 'border-yellow-400', 
            text: 'text-yellow-400', 
            bgGradient: 'from-yellow-900/80 to-slate-900',
            rankName: 'Rank S'
        };
      case 'jackpot': // Rank SSR - Red
        return { 
            border: 'border-red-500', 
            text: 'text-red-500', 
            bgGradient: 'from-red-900/80 to-slate-900',
            rankName: 'Rank SSR'
        };
      default: 
        return { 
            border: 'border-gray-600', 
            text: 'text-gray-500', 
            bgGradient: 'from-gray-900 to-slate-900',
            rankName: 'Unknown'
        };
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

// --- COMPONENT: GameCard (Redesigned) ---
const GameCard = React.memo(({ item }: { item: StripItem }) => {
    const style = getRarityStyles(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center transform"
            style={{ width: 110, marginRight: 12 }} 
        >
            <div className={`
                relative w-full aspect-[4/5] rounded-xl 
                bg-gradient-to-br ${style.bgGradient}
                border-2 ${style.border}
                flex flex-col items-center justify-center gap-3
                shadow-lg
            `}>
                {/* Background Pattern - Subtle */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-xl" />

                {/* Rank Badge */}
                <div className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 ${style.text} rounded border border-slate-600/50 z-20`}>
                    {style.rankName.split(' ')[1]}
                </div>

                {/* Icon Container */}
                <div className={`relative z-10 w-14 h-14 flex items-center justify-center bg-black/40 rounded-xl border ${style.border} shadow-inner`}>
                    {typeof item.icon === 'string' ? (
                        <img src={item.icon} alt={item.name} loading="lazy" className="w-10 h-10 object-contain" />
                    ) : (
                        <item.icon className={`w-10 h-10 ${style.text}`} />
                    )}
                </div>
                
                {/* Text Info */}
                <div className="relative z-10 text-center w-full px-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wider opacity-90 truncate text-slate-300`}>
                        {item.name}
                    </div>
                    <div className={`text-sm font-black mt-0.5 font-lilita tracking-wide ${style.text}`}>
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
const RateInfoPopup = ({ items, onClose, getWeight }: RateInfoPopupProps) => {
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-scale-fast"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
                    <div className="flex items-center gap-2">
                         <InfoIcon className="w-5 h-5 text-cyan-400" />
                         <h3 className="text-lg font-bold text-white uppercase tracking-wide">Drop Rates</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content List */}
                <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {sortedItems.map((item, idx) => {
                        const isJackpot = item.rarity === 'jackpot';
                        const rate = (item.weight / totalWeight) * 100;
                        let displayRate = rate < 0.01 ? '< 0.01' : rate.toFixed(2);
                        if (rate >= 1 && rate % 1 === 0) displayRate = rate.toFixed(0);

                        const style = getRarityStyles(item.rarity);
                        
                        return (
                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border bg-slate-900/50 ${style.border}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 flex items-center justify-center bg-black/40 rounded-lg border ${style.border}`}>
                                         {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
                                        ) : (
                                            <item.icon className={`w-6 h-6 ${style.text}`} />
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${style.text}`}>{item.name}</div>
                                        <div className="text-[10px] uppercase font-semibold text-slate-500">
                                            {style.rankName}
                                            {!isJackpot && <span className="ml-1">• {item.rewardAmount ? `x${item.rewardAmount}` : item.value}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-lilita text-base ${style.text}`}>
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
};

// --- REWARD POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const style = getRarityStyles(item.rarity);

    const handleWatchAds = () => {
        console.log("Watching Ads for x2 Reward...");
        onClose();
    };

    return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-[320px] bg-gradient-to-br ${style.bgGradient} p-6 rounded-xl border-2 ${style.border} shadow-2xl text-center flex flex-col items-center gap-4 animate-fade-in-scale-fast`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-wider uppercase text-white title-glow">
            {jackpotWon ? 'JACKPOT WON!' : 'Congratulations'}
        </h2>

        {/* Item Icon Box */}
        <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${style.border} shadow-inner`}>
            {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.name} className="w-20 h-20 object-contain" />
            ) : (
                <item.icon className={`w-20 h-20 ${style.text}`} />
            )}
        </div>

        {/* Info Box */}
        <div className="w-full p-4 bg-black/25 rounded-lg border border-slate-700/50 text-center flex flex-col gap-1">
            <h3 className={`text-xl font-bold ${style.text}`}>{item.name}</h3>
            <p className={`font-semibold ${style.text} opacity-80 uppercase text-xs`}>{style.rankName}</p>
            
            <hr className="border-slate-700/50 my-2" />
            
            <div className="flex items-center justify-center gap-2">
                 <span className="text-slate-300 text-sm">You received:</span>
                 <div className="flex items-center gap-1">
                    {item.rewardType === 'coin' && (
                        <>
                            <span className={`text-xl font-black ${style.text}`}>{item.value.toLocaleString()}</span>
                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5" />
                        </>
                    )}
                    {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                        <span className={`text-xl font-black ${style.text}`}>x{item.rewardAmount?.toLocaleString()}</span>
                    )}
                 </div>
            </div>
        </div>
        
        {/* Buttons */}
        <div className="flex w-full gap-3 mt-2">
            <button onClick={handleWatchAds} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-500 text-white py-2.5 rounded-lg shadow-lg flex flex-col items-center justify-center active:scale-95 transition-all">
                <div className="flex items-center gap-1">
                    <PlayIcon className="w-3 h-3" />
                    <span className="font-bold text-sm">x2 Reward</span>
                </div>
                <span className="text-[9px] opacity-80 uppercase tracking-wide">Watch Ad</span>
            </button>
            <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-bold py-2.5 rounded-lg shadow-lg active:scale-95 transition-all uppercase text-sm">
                Claim
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
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);
  const [showRatePopup, setShowRatePopup] = useState(false);

  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  const getItemWeight = useCallback((rarity: string) => {
      return RARITY_WEIGHTS[rarity as keyof typeof RARITY_WEIGHTS] || 50;
  }, []);

  const baseItems: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 150, rarity: 'common', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'uncommon', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 300, rarity: 'uncommon', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'rare', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'epic', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 500, rarity: 'rare', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'uncommon', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 100, rarity: 'common', rewardType: 'coin', rewardAmount: 100 },
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
    if (isSpinning) return;
    if (wonRewardDetails) return; 
    
    const initStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS + 5; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${spinMultiplier}-${i}` });
    }
    setStrip(initStrip);
    setOffset(0);
  }, [getRandomFiller, spinMultiplier, isSpinning, wonRewardDetails]);

  const spinChest = useCallback(() => {
    const cost = BASE_COST * spinMultiplier;
    if (isSpinning || coins < cost) return;

    updateCoins(-cost);
    
    const randomCoinsToAdd = (Math.floor(Math.random() * (100 - 10 + 1)) + 10) * spinMultiplier;
    handleUpdateJackpotPool(randomCoinsToAdd);

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

        const startNode = wonRewardDetails 
            ? { ...wonRewardDetails, uniqueId: `anchor-prev-${Date.now()}` } 
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
                    handleUpdatePickaxes(winner.rewardAmount);
                    actualValue = winner.rewardAmount;
                } else if (winner.rarity === 'jackpot') {
                    actualValue = jackpotPool;
                    setJackpotWon(true);
                    setJackpotAnimation(true);
                    updateCoins(actualValue);
                    handleUpdateJackpotPool(0, true);
                    setTimeout(() => setJackpotAnimation(false), 3000);
                } else if (winner.rewardType === 'coin') {
                    updateCoins(winner.value);
                }

                setWonRewardDetails({ ...winner, value: actualValue });
                setShowRewardPopup(true);
            }, (SPIN_DURATION_SEC * 1000) + 100); 
        }, 50);
    }, 10);

  }, [isSpinning, coins, displayItems, updateCoins, handleUpdatePickaxes, handleUpdateJackpotPool, jackpotPool, getRandomFiller, spinMultiplier, wonRewardDetails, strip, getItemWeight]);
  
  const currentCost = BASE_COST * spinMultiplier;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center font-sans overflow-hidden z-50">
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_80%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/10 blur-[100px] rounded-full"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/90 border-b border-slate-700 z-[60] shadow-lg">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-3">
            <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={isStatsFullscreen} />
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 pt-[53px]">
        
        {/* --- JACKPOT UI --- */}
        <div className="text-center mb-10 -mt-12 w-full max-w-lg z-10">
            <div className={`
                relative p-4 rounded-xl border-2 transition-all duration-500 overflow-hidden
                ${ jackpotAnimation ? 'bg-gradient-to-r from-red-900 via-orange-900 to-red-900 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)]' : 'bg-gradient-to-br from-red-900/80 to-slate-900 border-red-500 shadow-xl' }
            `}>
              
              {/* INFO BUTTON */}
              <button 
                onClick={() => setShowRatePopup(true)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-md z-20"
                title="View Drop Rates"
              >
                  <InfoIcon className="w-4 h-4" />
              </button>

              <div className="text-red-400 text-sm font-bold tracking-[0.3em] mb-1 uppercase drop-shadow-sm"> JACKPOT POOL </div>
              <div className={`text-4xl font-lilita text-white drop-shadow-md flex items-center justify-center gap-2 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-200">{animatedJackpot.toLocaleString()}</span>
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8 drop-shadow-md" />
              </div>
              
              {(() => {
                  const jackpotWeight = RARITY_WEIGHTS['jackpot'];
                  let total = 0;
                  baseItems.forEach(i => total += RARITY_WEIGHTS[i.rarity as keyof typeof RARITY_WEIGHTS] || 50);
                  const jackpotRate = (jackpotWeight / total) * 100;
                  return (
                    <div className="text-slate-400 text-[10px] mt-2 font-medium tracking-wide opacity-80"> Jackpot Chance: <span className="text-red-400 font-bold">{jackpotRate.toFixed(2)}%</span> </div>
                  );
              })()}
            </div>
        </div>
        
        {/* --- SPINNER UI --- */}
        <div className="relative w-full max-w-4xl mb-12">
            <div className="relative h-60 w-full bg-black/60 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-black via-transparent to-black opacity-90"></div>
                
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent z-20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent z-20"></div>

                <div className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform z-10"
                    style={{
                        transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, 
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item) => ( <GameCard key={item.uniqueId} item={item} /> ))}
                </div>
            </div>

            {/* TARGET UI - Clean & Technical */}
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                 {/* Center Highlight */}
                 <div className="absolute h-full w-[130px] bg-white/5 border-x border-yellow-500/30"></div>
                 
                 {/* Indicator Triangle Top */}
                 <div className="absolute top-[-10px] transform z-40">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-yellow-400 filter drop-shadow-md"></div>
                 </div>
                 
                 {/* Indicator Triangle Bottom */}
                 <div className="absolute bottom-[-10px] transform z-40">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-yellow-400 filter drop-shadow-md"></div>
                 </div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center z-20">
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-4 shadow-lg">
                 <button onClick={() => !isSpinning && setSpinMultiplier(1)} className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 1 ? 'bg-cyan-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`} disabled={isSpinning}>x1</button>
                 <button onClick={() => !isSpinning && setSpinMultiplier(10)} className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 10 ? 'bg-cyan-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`} disabled={isSpinning}>x10</button>
              </div>

              <button
                onClick={spinChest}
                disabled={isSpinning || coins < currentCost}
                className="group relative w-48 h-16 rounded-lg overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border-2 bg-slate-800 border-cyan-600 hover:border-cyan-400 hover:bg-slate-700 shadow-lg"
              >
                <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                    {isSpinning ? ( <span className="font-lilita text-lg text-slate-500 tracking-wider">SPINNING...</span> ) : (
                        <>
                            <span className="font-lilita text-2xl uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">SPIN</span>
                            <div className="flex items-center gap-1.5 mt-0.5 px-3 py-0.5 rounded bg-black/30">
                                <span className={`text-sm font-bold tracking-wide ${coins < currentCost ? 'text-red-500' : 'text-white'}`}>{currentCost}</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3 h-3" />
                            </div>
                        </>
                    )}
                </div>
              </button>
        </div>
      </div>
      
      {coins < currentCost && !isSpinning && (
          <div className="fixed bottom-3 right-3 z-[100] animate-fade-in pointer-events-none">
              <div className="bg-slate-900 border border-red-500 text-red-400 pl-2.5 pr-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
                   <span className="font-bold text-xs tracking-wide">Not enough coins!</span>
              </div>
          </div>
      )}

      {/* RENDER RATE POPUP */}
      {showRatePopup && <RateInfoPopup items={baseItems} onClose={() => setShowRatePopup(false)} getWeight={getItemWeight} />}
      
      {showRewardPopup && wonRewardDetails && ( <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> )}

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
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
