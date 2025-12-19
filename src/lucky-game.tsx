import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HomeButton from './ui/home-button.tsx';
import { useGame } from './GameContext.tsx'; 
import { useAnimateValue } from './ui/useAnimateValue.ts'; 

// --- 1. COMPONENT SỐ NHẢY RIÊNG BIỆT ---
// Tách biệt hoàn toàn để khi số nhảy, React không render lại cả game
const AnimatedNumber = React.memo(({ value, className }: { value: number, className?: string }) => {
    const animatedValue = useAnimateValue(value, 800);
    return <span className={className}>{animatedValue.toLocaleString()}</span>;
});

// --- 2. ICONS (ĐÃ TỐI ƯU) ---
// Sử dụng React.memo và decoding="async"
const CoinsIcon = React.memo(({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin"
        className={className}
        loading="eager" // Load ngay lập tức
        decoding="async" // Giải mã ảnh không chặn luồng chính
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }}
      />
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
});

const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';
const PickaxeIcon = React.memo(({ className }: { className?: string }) => <img src={pickaxeIconUrl} alt="Pickaxe" className={className} loading="eager" decoding="async" onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} />);
const ZapIcon = React.memo(({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> ));
const TrophyIcon = React.memo(({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path> </svg> ));
const HeartIcon = React.memo(({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path> </svg> ));
const GiftIcon = React.memo(({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path> </svg> ));
const PlayIcon = React.memo(({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"> <path d="M8 5v14l11-7z" /> </svg> ));


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

// --- UTILITY: Simplified Colors (Quan trọng) ---
// Thay vì trả về object chứa chuỗi shadow dài, ta trả về class Tailwind đơn giản
// Giúp giảm việc tính toán style động.
const getCardBg = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-slate-800 border-slate-600'; 
      case 'uncommon': return 'bg-[#064e3b] border-emerald-600'; // Dark Emerald Flat
      case 'rare': return 'bg-[#0e7490] border-cyan-600'; // Dark Cyan Flat
      case 'epic': return 'bg-[#701a75] border-fuchsia-600'; // Dark Fuchsia Flat
      case 'legendary': return 'bg-[#b45309] border-amber-500'; // Dark Amber Flat
      case 'jackpot': return 'bg-gradient-to-b from-red-700 to-slate-900 border-yellow-400'; // Chỉ giữ gradient cho Jackpot
      default: return 'bg-slate-800 border-slate-600';
    }
};

const getRarityTextColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'text-slate-400'; 
      case 'uncommon': return 'text-emerald-400'; 
      case 'rare': return 'text-cyan-400'; 
      case 'epic': return 'text-fuchsia-400'; 
      case 'legendary': return 'text-amber-400'; 
      case 'jackpot': return 'text-yellow-400'; 
      default: return 'text-slate-400';
    }
};

// --- 3. GAMECARD SIÊU NHẸ (QUAN TRỌNG NHẤT) ---
const GameCard = React.memo(({ item }: { item: StripItem }) => {
    const bgClass = getCardBg(item.rarity);
    const textClass = getRarityTextColor(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center will-change-transform"
            style={{ 
                width: 110, 
                marginRight: 12,
                // CSS Containment: Ngăn trình duyệt tính toán layout lan ra ngoài card
                // Đây là yếu tố then chốt giúp 40 cards chạy mượt
                contain: 'layout paint style' 
            }} 
        >
            <div className={`
                relative w-full aspect-[4/5] rounded-xl border
                ${bgClass}
                flex flex-col items-center justify-center gap-2
                // Tối ưu: Đã loại bỏ shadow-lg mặc định để giảm tải GPU
            `}>
                {/* Chỉ giữ hiệu ứng glow cho Jackpot (vì nó hiếm) */}
                {item.rarity === 'jackpot' && (
                    <div className="absolute inset-0 bg-yellow-400/10 blur-md rounded-xl animate-pulse"></div>
                )}

                <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                    {typeof item.icon === 'string' ? (
                        <img 
                            src={item.icon} 
                            alt="" 
                            className="w-9 h-9 object-contain" 
                            loading="eager"
                            decoding="async"
                        />
                    ) : (
                        <item.icon className={`w-9 h-9 ${item.color}`} />
                    )}
                </div>
                
                <div className="relative z-10 text-center w-full px-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wider opacity-90 truncate ${textClass}`}>
                        {item.name || item.rarity}
                    </div>
                    <div className="text-sm font-black text-white mt-0.5 font-lilita tracking-wide">
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

// --- REWARD POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityTextColor = getRarityTextColor(item.rarity);

    const handleWatchAds = () => {
        console.log("Watching Ads for x2 Reward...");
        onClose();
    };

    return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-[340px] bg-slate-900 border-2 rounded-3xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center mt-8
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
             <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-slate-800 border-4 shadow-xl ${jackpotWon ? 'border-yellow-400' : 'border-slate-600'}`}>
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
                    <h2 className="text-4xl font-black text-yellow-400 tracking-widest uppercase mb-1 drop-shadow-md animate-pulse">JACKPOT!</h2>
                    <p className="font-sans text-yellow-200/80 text-sm">Bạn đã trúng toàn bộ quỹ thưởng!</p>
                </>
            ) : (
                <>
                    <h2 className={`text-3xl font-bold uppercase tracking-wide drop-shadow-sm ${rarityTextColor}`}>{item.name || item.rarity}</h2>
                    <p className="font-sans text-slate-400 text-xs uppercase tracking-widest mt-1 font-semibold">{item.rarity} Reward</p>
                </>
            )}
        </div>

        <div className="flex flex-col gap-2 w-full my-6">
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-inner flex flex-col items-center justify-center">
                 <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-widest mb-1">BẠN NHẬN ĐƯỢC</span>
                 <div className="flex items-center gap-3">
                    {item.rewardType === 'coin' && (
                        <>
                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8 drop-shadow-md" />
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 drop-shadow-sm">{item.value.toLocaleString()}</span>
                        </>
                    )}
                    {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                        <>
                            {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-8 h-8 drop-shadow-md" />}
                            {item.rewardType === 'other' && typeof item.icon !== 'string' && <item.icon className={`w-8 h-8 ${item.color} drop-shadow-md`} />}
                            <span className="text-4xl font-black text-white drop-shadow-sm">x{item.rewardAmount?.toLocaleString()}</span>
                        </>
                    )}
                 </div>
            </div>
        </div>
        
        <div className="flex w-full gap-3 mt-1">
            <button 
                onClick={handleWatchAds}
                className="group relative flex-1"
            >
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative h-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl border-t border-white/20 shadow-lg flex flex-col items-center justify-center py-2.5 px-1 active:scale-95 transition-all">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="bg-black/20 p-1 rounded-full">
                            <PlayIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xl font-black text-white italic tracking-wide drop-shadow-md">x2</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-100 bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Watch Ads</span>
                </div>
            </button>

            <button
                onClick={onClose}
                className="flex-[0.8] bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all"
            >
                <span className="text-slate-200 font-bold text-lg uppercase tracking-wider">Claim</span>
            </button>
        </div>
      </div>
    </div>
    );
};

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen = false }: LuckyChestGameProps) => {
  const { 
    coins, 
    updateCoins, 
    handleUpdatePickaxes, 
    jackpotPool, 
    handleUpdateJackpotPool 
  } = useGame();

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinMultiplier, setSpinMultiplier] = useState<1 | 10>(1);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  // Base Items
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

  // Initial Strip
  useEffect(() => {
    if (isSpinning) return;
    if (wonRewardDetails) return; 
    
    const initStrip: StripItem[] = [];
    // Chỉ tạo đủ số card cần hiển thị (Visible + 2 để đệm)
    for(let i=0; i<VISIBLE_CARDS + 2; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${spinMultiplier}-${i}` });
    }
    setStrip(initStrip);
    setOffset(0);
  }, [getRandomFiller, spinMultiplier, isSpinning, wonRewardDetails]);

  // --- LOGIC QUAY TỐI ƯU ---
  const spinChest = useCallback(() => {
    const cost = BASE_COST * spinMultiplier;
    if (isSpinning || coins < cost) return;

    updateCoins(-cost);
    
    const randomCoinsToAdd = (Math.floor(Math.random() * (100 - 10 + 1)) + 10) * spinMultiplier;
    handleUpdateJackpotPool(randomCoinsToAdd);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    let winner: Item;
    if (Math.random() < 0.01) { 
        winner = displayItems.find(i => i.rarity === 'jackpot') || displayItems[0];
    } else {
        const others = displayItems.filter(i => i.rarity !== 'jackpot');
        winner = others[Math.floor(Math.random() * others.length)];
    }

    // TỐI ƯU: Chỉ sinh ra 40 items. Quá đủ cho 6s quay.
    const TARGET_INDEX = 40; 
    const newStrip: StripItem[] = [];

    // Anchor: Giữ lại card đang hiển thị để không bị nháy
    const startNode = wonRewardDetails 
        ? { ...wonRewardDetails, uniqueId: `anchor-prev-${Date.now()}` } 
        : (strip.length > 0 ? strip[0] : { ...getRandomFiller(), uniqueId: `anchor-init-${Date.now()}` });

    newStrip.push(startNode);

    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-mid-${Date.now()}-${i}` });
    }

    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });

    for (let i = 0; i < 4; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-end-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionDuration(0);
    setOffset(0);

    // KỸ THUẬT QUAN TRỌNG: Double requestAnimationFrame
    // Đảm bảo trình duyệt đã paint xong DOM mới ở vị trí 0 trước khi bắt đầu transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
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
        });
    });

  }, [isSpinning, coins, displayItems, updateCoins, handleUpdatePickaxes, handleUpdateJackpotPool, jackpotPool, getRandomFiller, spinMultiplier, wonRewardDetails, strip]);
  
  const currentCost = BASE_COST * spinMultiplier;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center font-sans overflow-hidden z-50">
      
      {/* Background Tĩnh (Static) để giảm tải GPU */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-black" />
        {/* Một đốm sáng tĩnh duy nhất */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER: Loại bỏ hiệu ứng backdrop-blur gây lag */}
      <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/95 border-b border-slate-700 z-[60] shadow-md">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
               <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5" />
               <AnimatedNumber value={coins} className="text-yellow-400 font-bold text-sm" />
            </div>
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 pt-[53px]">
        
        {/* JACKPOT UI: Giảm thiểu shadow tỏa */}
        <div className="text-center mb-10 -mt-12 w-full max-w-lg z-10">
            <div className={`
                relative p-4 rounded-2xl border-4 transition-colors duration-500 overflow-hidden
                ${ jackpotAnimation 
                    ? 'bg-red-900/90 border-yellow-400' // Animation đơn giản hóa
                    : 'bg-slate-900/90 border-slate-700' 
                }
            `}>
              <div className="text-yellow-400/90 text-sm font-bold tracking-[0.3em] mb-1 uppercase drop-shadow-sm"> JACKPOT POOL </div>
              <div className={`text-5xl font-lilita text-white drop-shadow-md flex items-center justify-center gap-2 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
                    <AnimatedNumber value={jackpotPool} />
                </span>
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 drop-shadow-md" />
              </div>
            </div>
        </div>
        
        {/* SPINNER UI */}
        <div className="relative w-full max-w-4xl mb-12">
            
            <div className="relative h-60 w-full bg-[#0a0a0a] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-70"></div>

                {/* THE STRIP: Sử dụng translate3d để dùng 100% GPU */}
                <div 
                    className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform"
                    style={{
                        transform: `translate3d(calc(${offset}px - ${CARD_WIDTH / 2}px), 0, 0)`, 
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item) => (
                        <GameCard key={item.uniqueId} item={item} />
                    ))}
                </div>
            </div>

            {/* CENTER TARGET: Bỏ bóng mờ nặng, dùng Border Solid */}
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                 <div className="relative w-[124px] h-[calc(100%-24px)] border-2 border-yellow-500/80 rounded-xl"></div>
                 {/* Mũi tên chỉ dẫn đơn giản */}
                 <div className="absolute top-0 transform -translate-y-1/2 z-40">
                    <div className="w-4 h-4 bg-yellow-500 rotate-45 border border-black/50"></div>
                 </div>
                 <div className="absolute bottom-0 transform translate-y-1/2 z-40">
                    <div className="w-4 h-4 bg-yellow-500 rotate-45 border border-black/50"></div>
                 </div>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center justify-center z-20">
              <div className="flex bg-slate-800/90 p-1 rounded-lg border border-slate-700 mb-4">
                 <button 
                   onClick={() => !isSpinning && setSpinMultiplier(1)}
                   className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-colors ${spinMultiplier === 1 ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   disabled={isSpinning}
                 >
                    x1
                 </button>
                 <button 
                   onClick={() => !isSpinning && setSpinMultiplier(10)}
                   className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-colors ${spinMultiplier === 10 ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   disabled={isSpinning}
                 >
                    x10
                 </button>
              </div>

              <button
                onClick={spinChest}
                disabled={isSpinning || coins < currentCost}
                className="group relative w-48 h-16 rounded-xl overflow-hidden transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           active:scale-95
                           border-2 bg-slate-900 border-cyan-600"
              >
                <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                    {isSpinning ? (
                         <span className="font-lilita text-lg text-slate-400 tracking-wider">SPINNING...</span>
                    ) : (
                        <>
                            <span className="font-lilita text-2xl uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">
                                SPIN
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 px-3 py-0.5">
                                <span className={`text-lg font-lilita tracking-wide leading-none ${coins < currentCost ? 'text-red-500' : 'text-slate-300'}`}>
                                    {currentCost}
                                </span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3.5 h-3.5" />
                            </div>
                        </>
                    )}
                </div>
              </button>
        </div>

      </div>
      
      {/* Error Message Toast */}
      {coins < currentCost && !isSpinning && (
          <div className="fixed bottom-3 right-3 z-[100] animate-fade-in pointer-events-none">
              <div className="bg-slate-900 border border-red-500/50 text-red-400 pl-2.5 pr-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
                   <svg className="w-4 h-4 text-red-500 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                   <span className="font-bold text-xs tracking-wide">Không đủ xu để quay!</span>
              </div>
          </div>
      )}

      {showRewardPopup && wonRewardDetails && ( <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
