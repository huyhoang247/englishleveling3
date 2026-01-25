// --- START OF FILE lucky-game.tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import HomeButton from './ui//home-button.tsx';
import { useGame } from './GameContext.tsx'; 
import { useAnimateValue } from './ui/useAnimateValue.ts'; 

// --- IMPORT DATA & HELPERS ---
// Đảm bảo bạn đã tạo file lucky-game-data.tsx cùng thư mục
import { 
    CoinsIcon, 
    PickaxeIcon, 
    Item, 
    BASE_ITEMS, 
    RARITY_WEIGHTS, 
    getRarityColor, 
    getCardStyle 
} from './lucky-game-data.tsx';

// --- UI ICONS (Controls & Info - Giữ lại ở đây vì thuộc về UI điều khiển) ---
const InfoIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg> );
const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
  </svg>
);
const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C9.23858 1.5 7 3.73858 7 6.5V9H6C4.89543 9 4 9.89543 4 11V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V11C20 9.89543 19.1046 9 18 9H17V6.5C17 3.73858 14.7614 1.5 12 1.5ZM12 3.5C13.6569 3.5 15 4.84315 15 6.5V9H9V6.5C9 4.84315 10.3431 3.5 12 3.5Z" />
  </svg>
);

// --- INTERFACES EXTENDED ---
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

// --- CONFIG ---
const CARD_WIDTH = 110;
const CARD_GAP = 12;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 5;
const BASE_COST = 100;
const SPIN_DURATION_SEC = 6;

// --- COMPONENT: GameCard ---
const GameCard = React.memo(({ item }: { item: StripItem }) => {
    const style = getCardStyle(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center transform will-change-transform" 
            style={{ width: 110, marginRight: 12 }} 
        >
            <div className={`
                relative w-full aspect-[4/5] rounded-xl 
                ${style.bg} border ${style.border}
                flex flex-col items-center justify-center gap-2
                shadow-sm 
            `}> 
                
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
                    <div className="text-sm font-black text-white mt-1 font-lilita tracking-wide">
                        {item.rarity === 'jackpot' ? 'JACKPOT' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                    </div>
                </div>
            </div>
        </div>
    );
});

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
                         <h3 className="text-xl font-lilita text-white tracking-wide uppercase">Drop Rate</h3>
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

// --- REWARD POPUP (MODIFIED FOR VIP & NO ADS) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    // Lấy data từ Context
    const { accountType, vipLuckySpinClaims, handleVipLuckySpinClaim, updateCoins, handleUpdatePickaxes, handleUpdateJackpotPool } = useGame();
    
    const isVip = accountType === 'VIP';
    const vipMaxClaims = 5;
    const vipClaimsLeft = Math.max(0, vipMaxClaims - vipLuckySpinClaims);
    const canUseVipClaim = isVip && vipClaimsLeft > 0;

    const rarityColor = getRarityColor(item.rarity);

    const handleClaim = async (isDouble: boolean) => {
        if (isDouble) {
             // Chỉ cho phép VIP và còn lượt mới được gọi hàm này
             const success = await handleVipLuckySpinClaim();
             if (!success) return; 
             
             // Logic x2
             if (item.rarity === 'jackpot') {
                 updateCoins(item.value * 2); 
                 handleUpdateJackpotPool(0, true);
             } else {
                 // Đã nhận x1 gốc ở parent logic (thông qua onClose), 
                 // ở đây ta cộng thêm 1 lần giá trị nữa để thành x2.
                 if (item.rewardType === 'coin') {
                     updateCoins(item.value); 
                 } else if (item.rewardType === 'pickaxe' && item.rewardAmount) {
                     handleUpdatePickaxes(item.rewardAmount);
                 }
             }
        }
        // Nếu không x2, parent component sẽ lo phần claim mặc định khi đóng popup
        onClose(); 
    };

    const handleLockedClick = () => {
        alert("Tính năng x2 chỉ dành cho VIP! Hãy nâng cấp ngay để nhận x2 quà tặng mỗi ngày!");
        // Ở đây có thể thay bằng logic mở Shop VIP
    };

    return (
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
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 blur-2xl rounded-full"></div>
                 <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-widest mb-1 relative z-10">BẠN NHẬN ĐƯỢC</span>
                 <div className="flex items-center gap-3 relative z-10">
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
        
        {/* --- BUTTON AREA (NEW DESIGN) --- */}
        <div className="flex w-full gap-3 mt-1 h-14">
            
            {/* BUTTON 1: VIP X2 CLAIM */}
            {canUseVipClaim && (
                <button 
                    onClick={() => handleClaim(true)} 
                    className="group relative flex-1 overflow-hidden rounded-xl active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] border border-yellow-300/50"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/30 skew-x-[-20deg] animate-[shine_2s_infinite]"></div>

                    <div className="relative h-full flex flex-col items-center justify-center py-1">
                        <div className="flex items-center gap-1.5">
                            <CrownIcon className="w-5 h-5 text-yellow-100 drop-shadow-sm" />
                            <span className="text-xl font-black text-white italic tracking-wide drop-shadow-md">VIP x2</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 bg-black/20 px-2 py-0.5 rounded-full">
                            <div className="flex gap-0.5">
                                {[...Array(vipMaxClaims)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < vipClaimsLeft ? 'bg-white shadow-[0_0_4px_white]' : 'bg-black/30'}`} />
                                ))}
                            </div>
                            <span className="text-[9px] font-bold text-yellow-100 ml-1 leading-none">{vipClaimsLeft}/{vipMaxClaims}</span>
                        </div>
                    </div>
                </button>
            )}

            {/* BUTTON 1 (DISABLED): VIP OUT OF CLAIMS */}
            {isVip && vipClaimsLeft === 0 && (
                <button disabled className="relative flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center justify-center opacity-70 cursor-not-allowed">
                     <span className="text-slate-500 font-bold text-sm uppercase">VIP Limit Reached</span>
                     <span className="text-slate-600 text-[10px]">Reset tomorrow</span>
                </button>
            )}

            {/* BUTTON 1 (LOCKED): NORMAL USER - UPSELL */}
            {!isVip && (
                <button 
                    onClick={handleLockedClick}
                    className="group relative flex-1 overflow-hidden rounded-xl active:scale-95 transition-all border border-yellow-500/30 hover:border-yellow-400/60"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-800 group-hover:to-yellow-900/20 transition-colors"></div>
                    <div className="relative h-full flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <CrownIcon className="w-5 h-5 text-yellow-500" />
                            <span className="text-xl font-black text-yellow-500/50 group-hover:text-yellow-400 italic tracking-wide">VIP x2</span>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                            <LockIcon className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Locked</span>
                        </div>
                    </div>
                </button>
            )}

            {/* BUTTON 2: NORMAL CLAIM */}
            <button 
                onClick={() => handleClaim(false)} 
                className="flex-[0.8] bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-xl shadow-md flex items-center justify-center active:scale-95 transition-all"
            >
                <span className="text-slate-200 font-bold text-lg uppercase tracking-wider">Claim</span>
            </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes shine {
            0% { left: -100%; opacity: 0; }
            40% { opacity: 0.5; }
            100% { left: 200%; opacity: 0; }
        }
      `}</style>
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

  // --- PREPARE ITEMS ---
  // displayItems tính toán dựa trên BASE_ITEMS nhập từ file data, nhân với multiplier
  const displayItems = useMemo(() => {
    return BASE_ITEMS.map(item => {
        if (item.rarity === 'jackpot') return item;
        return {
            ...item,
            value: item.value * spinMultiplier,
            rewardAmount: item.rewardAmount ? item.rewardAmount * spinMultiplier : undefined
        };
    });
  }, [spinMultiplier]);

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
      
      {/* --- BACKGROUND --- */}
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
        
        {/* --- JACKPOT UI --- */}
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
                  BASE_ITEMS.forEach(i => total += RARITY_WEIGHTS[i.rarity as keyof typeof RARITY_WEIGHTS] || 50);
                  const jackpotRate = (jackpotWeight / total) * 100;
                  return (
                    <div className="text-slate-400 text-xs mt-2 font-medium tracking-wide"> Tỉ lệ quay trúng ô JACKPOT: <span className="text-yellow-400 font-bold">{jackpotRate.toFixed(2)}%</span> </div>
                  );
              })()}
            </div>
        </div>
        
        {/* --- SPINNER UI --- */}
        <div className="relative w-full max-w-4xl mb-12">
            <div className="relative h-60 w-full bg-[#0a0a0a] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
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
              items={BASE_ITEMS} 
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
