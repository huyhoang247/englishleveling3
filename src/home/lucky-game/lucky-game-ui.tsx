// --- START OF FILE lucky-game-ui.tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import HomeButton from '../../ui/home-button.tsx';
import { useGame } from '../../GameContext.tsx'; 
import { useAnimateValue } from '../../ui/useAnimateValue.ts'; 

// --- IMPORT COMPONENT MỚI TÁCH RA ---
import RateInfoPopup from './rate-info-popup.tsx';
import { AdsRewardUI, FormattedRewardItem } from '../../ui/ads-reward-ui.tsx';
import { bossBattleAssets } from '../../game-assets.ts';

// --- IMPORT DATA & HELPERS ---
import { 
    CoinsIcon, 
    Item, 
    BASE_ITEMS, 
    RARITY_WEIGHTS, 
    getCardStyle
} from './lucky-game-data.tsx';

// --- UI ICONS (Controls & Info) ---
const InfoIcon = ({ className }: { className?: string }) => ( 
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"> 
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> 
    </svg> 
);

// --- INTERFACES ---
interface StripItem extends Item {
  uniqueId: string;
}

interface LuckyChestGameProps {
  onClose: () => void;
  isStatsFullscreen?: boolean; 
}

interface LuckyAdsRewardModalProps {
  item: Item;
  multiplier: number;
  jackpotWon: boolean;
  onClaimX1: () => void;
  onClaimX2: () => void;
}

// --- CONFIG ---
const CARD_WIDTH = 110;
const CARD_GAP = 12;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 5;
const BASE_COST = 100;
const SPIN_DURATION_SEC = 6;

// --- CUSTOM HOOK: ADS COOLDOWN LOGIC ---
const useAdsCooldown = (adsData: any) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            // Nếu không có nextAvailableAt nghĩa là chưa xem hoặc đã hết thời gian chờ
            if (!adsData.nextAvailableAt) {
                setTimeRemaining(0);
                setIsAvailable(true);
                return;
            }

            const now = new Date().getTime();
            
            // Xử lý an toàn cho trường hợp nextAvailableAt là Firestore Timestamp hoặc Date string
            let availableAt = 0;
            if (adsData.nextAvailableAt && typeof adsData.nextAvailableAt.toDate === 'function') {
                availableAt = adsData.nextAvailableAt.toDate().getTime();
            } else {
                availableAt = new Date(adsData.nextAvailableAt).getTime();
            }

            const diff = Math.ceil((availableAt - now) / 1000);

            if (diff > 0) {
                setTimeRemaining(diff);
                setIsAvailable(false);
            } else {
                setTimeRemaining(0);
                setIsAvailable(true);
            }
        };

        // Chạy ngay lần đầu
        calculateTime();
        
        // Cập nhật mỗi giây
        const timer = setInterval(calculateTime, 1000);
        
        // Cleanup khi unmount
        return () => clearInterval(timer);
    }, [adsData.nextAvailableAt]);

    return { timeRemaining, isAvailable };
};

// --- COMPONENT: GameCard ---
const GameCard = React.memo(({ item }: { item: StripItem }) => {
    const style = getCardStyle(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center transform will-change-transform" 
            style={{ width: CARD_WIDTH, marginRight: CARD_GAP }} 
        >
            <div className={`
                relative w-full aspect-[4/5] rounded-xl 
                ${style.bg} border ${style.border}
                flex flex-col items-center justify-center gap-2
                shadow-sm 
            `}> 
                
                {/* Icon Container */}
                <div className="relative z-10 p-2 rounded-xl bg-slate-900/50 w-16 h-16 flex items-center justify-center">
                    {typeof item.icon === 'string' ? (
                        <img src={item.icon} alt={item.name} loading="lazy" className="w-11 h-11 object-contain" />
                    ) : (
                        <item.icon className={`w-11 h-11 ${item.color}`} />
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

// --- NEW REWARD MODAL (USING ADS UI) ---
const LuckyAdsRewardModal = ({ item, multiplier, jackpotWon, onClaimX1, onClaimX2 }: LuckyAdsRewardModalProps) => {
    const { adsData, handleRegisterAdWatch } = useGame();
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const { timeRemaining, isAvailable } = useAdsCooldown(adsData);

    const handleAdClick = async () => {
        // Kiểm tra giới hạn
        if (!isAvailable || adsData.watchedToday >= 30) return;
        
        setIsWatchingAd(true);
        
        // Giả lập xem quảng cáo (Thay bằng gọi SDK thực tế ở đây)
        setTimeout(async () => {
            const success = await handleRegisterAdWatch();
            setIsWatchingAd(false);
            
            if (success) {
                onClaimX2();
            } else {
                console.error("Ad watch failed or cancelled");
                // Có thể thêm toast lỗi ở đây
            }
        }, 3000);
    };

    // Helper: AdsRewardUI cần icon dạng string URL.
    // Nếu item.icon là React Component (SVG), fallback về icon mặc định.
    const resolveIcon = (i: Item): string => {
        if (typeof i.icon === 'string') return i.icon;
        
        // Fallback logic cho các icon SVG dựa trên rewardType
        if (i.rewardType === 'coin') return bossBattleAssets.coinIcon;
        // Có thể mở rộng thêm mapping cho các resource khác nếu cần
        
        return bossBattleAssets.coinIcon; // Default fallback
    };

    // Chuẩn bị data hiển thị
    // Lưu ý: Giá trị hiển thị là giá trị BASE * MULTIPLIER (đã tính ở parent component)
    const displayValue = jackpotWon 
        ? item.value // Jackpot pool value
        : (item.rewardAmount || item.value);

    const formattedRewards: FormattedRewardItem[] = [{
        icon: resolveIcon(item),
        label: jackpotWon ? "JACKPOT" : (item.name || item.id),
        amount: displayValue
    }];

    // Nếu trúng Jackpot, thường game không cho x2 (hoặc tùy logic game)
    // Ở đây ta disable ads nếu là jackpot để tránh lạm phát quá lớn
    const disableAds = jackpotWon; 

    return (
        <AdsRewardUI 
            rewards={formattedRewards}
            adsStatus={{
                watchedToday: adsData.watchedToday,
                dailyLimit: 30,
                isAvailable: isAvailable && !disableAds,
                isWatching: isWatchingAd,
                timeRemaining: timeRemaining
            }}
            onClaimX1={onClaimX1}
            onWatchAdX2={handleAdClick}
        />
    );
};

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen = false }: LuckyChestGameProps) => {
  const { 
      coins, 
      jackpotPool, 
      handleLuckySpin, 
  } = useGame();

  const animatedCoins = useAnimateValue(coins, 800);
  const animatedJackpot = useAnimateValue(jackpotPool, 800);

  const [isSpinning, setIsSpinning] = useState(false);
  
  // Update state type to include 100
  const [spinMultiplier, setSpinMultiplier] = useState<1 | 10 | 100>(1);
  
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);
  const [showRatePopup, setShowRatePopup] = useState(false);
  
  const [lastWinItem, setLastWinItem] = useState<StripItem | null>(null);

  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  const getItemWeight = useCallback((rarity: string) => {
      return RARITY_WEIGHTS[rarity as keyof typeof RARITY_WEIGHTS] || 50;
  }, []);

  const handleCloseRatePopup = useCallback(() => {
    setShowRatePopup(false);
  }, []);

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

    setTimeout(() => {
        setIsSpinning(true);
        setJackpotWon(false);
        setShowRewardPopup(false);

        // --- Logic chọn winner visual ---
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

        // --- Tạo Strip cho Animation ---
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
            
            // --- KẾT THÚC QUAY ---
            setTimeout(() => {
                setIsSpinning(false);
                
                let actualValue = winner.value;
                if (winner.rewardAmount) {
                    actualValue = winner.rewardAmount; 
                } else if (winner.rarity === 'jackpot') {
                    actualValue = jackpotPool; 
                    setJackpotWon(true);
                    setJackpotAnimation(true);
                    setTimeout(() => setJackpotAnimation(false), 3000);
                }
                
                // GỌI CONTEXT ĐỂ XỬ LÝ GIAO DỊCH (Lần 1 - Base Reward)
                handleLuckySpin(cost, winner, spinMultiplier);

                setLastWinItem(winner);
                setWonRewardDetails({ ...winner, value: actualValue });
                setShowRewardPopup(true);

            }, (SPIN_DURATION_SEC * 1000) + 100); 
        }, 50);
    }, 10);

  }, [isSpinning, coins, displayItems, jackpotPool, getRandomFiller, spinMultiplier, lastWinItem, strip, getItemWeight, handleLuckySpin]);
  
  // --- HANDLER CHO ADS POPUP (SỬA LỖI) ---
  const handleClaimReward = useCallback(async (isDouble: boolean) => {
      // Nếu người chơi chọn x2 và có thông tin phần thưởng
      if (isDouble && wonRewardDetails) {
          
          if (wonRewardDetails.rarity === 'jackpot') {
               // Jackpot thường không được nhân đôi (tùy logic game, ở đây bỏ qua)
          } else {
               // Ta gọi lại hàm handleLuckySpin với giá 0 (Free) để hệ thống tự cộng quà thêm 1 lần nữa.
               // wonRewardDetails đã chứa số lượng sau khi nhân (VD: base*100).
               // Nên ta truyền multiplier = 1 để giữ nguyên giá trị đó.
               
               console.log("Processing x2 reward via transaction...");
               await handleLuckySpin(0, wonRewardDetails, 1);
          }
      }

      // Đóng popup và reset trạng thái
      setShowRewardPopup(false);
      setWonRewardDetails(null);
      setJackpotWon(false);

  }, [wonRewardDetails, handleLuckySpin]);

  const currentCost = BASE_COST * spinMultiplier;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center font-sans overflow-hidden z-50">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/10 blur-[80px] rounded-full"></div>
      </div>

      <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 z-[60] shadow-sm">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-3">
            <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={isStatsFullscreen} />
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 pt-[53px]">
        
        {/* JACKPOT DISPLAY */}
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
                <CoinsIcon className="w-10 h-10" />
              </div>
              
              <div className="text-slate-400 text-xs mt-2 font-medium tracking-wide">
                 Xác suất JACKPOT: <span className="text-yellow-400 font-bold">0.02%</span>
              </div>
            </div>
        </div>
        
        {/* SPIN STRIP */}
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

            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                 <div className="absolute h-full w-[130px] bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>
                 <div className="relative w-[124px] h-[calc(100%-24px)] border border-yellow-500/30 rounded-xl"></div>
                 <div className="absolute inset-0 flex justify-center"><div className="h-full w-[1px] bg-yellow-500/50"></div></div>
                 <div className="absolute top-0 transform -translate-y-1/2 z-40"><div className="w-4 h-4 bg-yellow-500 rotate-45 border border-yellow-900"></div></div>
                 <div className="absolute bottom-0 transform translate-y-1/2 z-40"><div className="w-4 h-4 bg-yellow-500 rotate-45 border border-yellow-900"></div></div>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center justify-center z-20">
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mb-4 shadow-md gap-1">
                 <button onClick={() => !isSpinning && setSpinMultiplier(1)} className={`px-5 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 1 ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} disabled={isSpinning}>x1</button>
                 <button onClick={() => !isSpinning && setSpinMultiplier(10)} className={`px-5 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 10 ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} disabled={isSpinning}>x10</button>
                 <button onClick={() => !isSpinning && setSpinMultiplier(100)} className={`px-5 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 100 ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} disabled={isSpinning}>x100</button>
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
                                <CoinsIcon className="w-3.5 h-3.5" />
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
                   <span className="font-bold text-xs tracking-wide">Không đủ xu!</span>
              </div>
          </div>
      )}

      {showRatePopup && (
          <RateInfoPopup 
              items={BASE_ITEMS} 
              onClose={handleCloseRatePopup} 
              getWeight={getItemWeight} 
          />
      )}
      
      {/* REWARD MODAL */}
      {showRewardPopup && wonRewardDetails && ( 
          <LuckyAdsRewardModal 
            item={wonRewardDetails}
            multiplier={spinMultiplier}
            jackpotWon={jackpotWon}
            onClaimX1={() => handleClaimReward(false)}
            onClaimX2={() => handleClaimReward(true)}
          /> 
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400..900&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
