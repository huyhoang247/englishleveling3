import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import HomeButton from './ui//home-button.tsx';
import { useGame } from './GameContext.tsx'; // Import Hook

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

// Updated Props: Removed data props, kept UI control props
interface LuckyChestGameProps {
  onClose: () => void;
  isStatsFullscreen?: boolean; // Optional, defaults to false
}

interface RewardPopupProps {
  item: Item;
  jackpotWon: boolean;
  onClose: () => void;
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

// Style cho thẻ bài trong vòng quay
const getCardStyle = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return { bg: 'bg-gradient-to-br from-slate-800 to-slate-900', border: 'border-slate-600', glow: 'shadow-inner' };
      case 'uncommon': return { bg: 'bg-gradient-to-br from-emerald-900/60 to-slate-900', border: 'border-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' };
      case 'rare': return { bg: 'bg-gradient-to-br from-cyan-900/60 to-slate-900', border: 'border-cyan-500', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' };
      case 'epic': return { bg: 'bg-gradient-to-br from-fuchsia-900/60 to-slate-900', border: 'border-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(232,121,249,0.4)]' };
      case 'legendary': return { bg: 'bg-gradient-to-br from-amber-700/60 to-slate-900', border: 'border-amber-400', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.5)]' };
      case 'jackpot': return { bg: 'bg-gradient-to-br from-red-600 via-amber-600 to-slate-900', border: 'border-yellow-300', glow: 'shadow-[0_0_30px_rgba(252,211,77,0.7)]' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', glow: '' };
    }
};

// --- CONFIG ---
const CARD_WIDTH = 110;
const CARD_GAP = 12;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 5;
const BASE_COST = 100;

// --- REWARD POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    const handleWatchAds = () => {
        // Logic xem quảng cáo sẽ ở đây
        console.log("Watching Ads for x2 Reward...");
        // Sau khi xem xong, có thể gọi callback để x2 reward và đóng popup
        onClose();
    };

    return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-[340px] bg-slate-900 border-2 rounded-3xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center mt-8
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Icon */}
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
                    <h2 className="text-3xl font-bold uppercase tracking-wide drop-shadow-sm" style={{ color: rarityColor }}>{item.name || item.rarity}</h2>
                    <p className="font-sans text-slate-400 text-xs uppercase tracking-widest mt-1 font-semibold">{item.rarity} Reward</p>
                </>
            )}
        </div>

        {/* Reward Box */}
        <div className="flex flex-col gap-2 w-full my-6">
            <div className="bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-inner flex flex-col items-center justify-center">
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
        
        {/* Buttons Action Area */}
        <div className="flex w-full gap-3 mt-1">
            
            {/* Watch Ads Button (Highlight) */}
            <button 
                onClick={handleWatchAds}
                className="group relative flex-1"
            >
                {/* Glow Effect */}
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

            {/* Claim Button (Secondary) */}
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
  // Use Context Hook
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

  // Spinner State
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

  // Compute items based on multiplier
  const displayItems = useMemo(() => {
    return baseItems.map(item => {
        // Don't multiply Jackpot value here (it's dynamic) or rarity text
        if (item.rarity === 'jackpot') return item;
        
        return {
            ...item,
            // Scale Value (for Coins)
            value: item.value * spinMultiplier,
            // Scale Reward Amount (for Pickaxes, Coins, Items)
            rewardAmount: item.rewardAmount ? item.rewardAmount * spinMultiplier : undefined
        };
    });
  }, [baseItems, spinMultiplier]);

  const getRandomFiller = useCallback(() => {
    const fillerItems = displayItems.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [displayItems]);

  // Regenerate Initial Strip when Multiplier changes to show updated values immediately
  useEffect(() => {
    if (isSpinning) return; // Don't reset mid-spin
    const initStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS + 5; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${spinMultiplier}-${i}` });
    }
    setStrip(initStrip);
    setOffset(0); // Reset offset visually
  }, [getRandomFiller, spinMultiplier, isSpinning]);

  const spinChest = useCallback(() => {
    const cost = BASE_COST * spinMultiplier;
    // Check cost against context coins
    if (isSpinning || coins < cost) return;

    // Logic Cost (Use context function)
    updateCoins(-cost);
    // Add to pool (more contribution for higher bet)
    const randomCoinsToAdd = (Math.floor(Math.random() * (100 - 10 + 1)) + 10) * spinMultiplier;
    handleUpdateJackpotPool(randomCoinsToAdd);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // Winner Logic
    let winner: Item;
    if (Math.random() < 0.01) { // 1% Jackpot (fixed chance)
        winner = displayItems.find(i => i.rarity === 'jackpot')!;
    } else {
        const others = displayItems.filter(i => i.rarity !== 'jackpot');
        winner = others[Math.floor(Math.random() * others.length)];
    }

    // Prepare Spin Strip
    const TARGET_INDEX = 100; 
    const newStrip: StripItem[] = [];
    
    // Fill pre-spin buffer with current multiplier items
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-pre-${Date.now()}-${i}` });
    }
    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });
    for (let i = 0; i < 5; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-post-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionDuration(0);
    setOffset(0);

    // Animation Trigger
    setTimeout(() => {
        const finalOffset = -(TARGET_INDEX * ITEM_FULL_WIDTH);

        setTransitionDuration(8); 
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
            } else if (winner.rewardType === 'other' && winner.rewardAmount) {
                // Handle logic for other items (Energy, Trophy etc.) here if needed
            }

            setWonRewardDetails({ ...winner, value: actualValue });
            setShowRewardPopup(true);
        }, 8100); 
    }, 50);

  }, [isSpinning, coins, displayItems, updateCoins, handleUpdatePickaxes, handleUpdateJackpotPool, jackpotPool, getRandomFiller, spinMultiplier]);
  
  const currentCost = BASE_COST * spinMultiplier;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center font-sans overflow-hidden z-50">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial Gradient nền */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_80%)]" />
        {/* Lưới sáng mờ */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {/* Ánh sáng Spotlight phía sau máy quay */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/20 blur-[100px] rounded-full"></div>
      </div>

      {/* --- HEADER (FLAT COLOR) --- */}
      <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900 border-b border-slate-700 backdrop-blur-md z-[60] shadow-lg">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-3">
            <CoinDisplay 
              displayedCoins={coins} // Use context coins
              isStatsFullscreen={isStatsFullscreen}
            />
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 pt-[53px]">
        
        {/* --- JACKPOT UI --- */}
        <div className="text-center mb-10 -mt-12 w-full max-w-lg z-10 transform hover:scale-105 transition-transform duration-300">
            <div className={`
                relative p-4 rounded-2xl border-4 transition-all duration-500 overflow-hidden
                ${ jackpotAnimation 
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 border-yellow-300 shadow-[0_0_50px_rgba(250,204,21,0.6)] animate-pulse' 
                    : 'bg-gradient-to-br from-slate-900/90 to-black border-slate-700 shadow-2xl backdrop-blur-md' 
                }
            `}>
              {/* Decorative Header */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="text-yellow-400/90 text-sm font-bold tracking-[0.3em] mb-1 uppercase drop-shadow-sm"> JACKPOT POOL </div>
              <div className={`text-5xl font-lilita text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
                    {jackpotPool.toLocaleString()}
                </span>
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 drop-shadow-md" />
              </div>
              <div className="text-slate-400 text-xs mt-2 font-medium tracking-wide"> Tỉ lệ quay trúng ô JACKPOT: <span className="text-yellow-400 font-bold">1%</span> </div>
              
              {/* Shine effect */}
              {jackpotAnimation && ( <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div> )}
            </div>
        </div>
        
        {/* --- SPINNER UI --- */}
        <div className="relative w-full max-w-4xl mb-12">
            
            {/* Máy quay hiện đại */}
            <div className="relative h-60 w-full bg-[#0a0a0a] rounded-xl border border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                
                {/* Bóng đổ bên trong (Inset Shadow) */}
                <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] rounded-xl"></div>
                
                {/* Lớp mờ 2 bên (Fade Mask) */}
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-80"></div>

                {/* Đường line trang trí trên dưới */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20"></div>

                {/* The Strip */}
                <div 
                    className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform z-10"
                    style={{
                        transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, 
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.12, 0.8, 0.3, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item, index) => {
                        const style = getCardStyle(item.rarity);
                        return (
                            <div 
                                key={item.uniqueId} 
                                className="flex-shrink-0 flex items-center justify-center transform transition-transform"
                                style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                            >
                                <div className={`
                                    relative w-full aspect-[4/5] rounded-xl 
                                    bg-gradient-to-b ${style.bg}
                                    border ${style.border}
                                    flex flex-col items-center justify-center gap-2
                                    ${style.glow}
                                    shadow-lg
                                    group
                                    ${isSpinning ? 'opacity-90' : 'opacity-100'}
                                `}>
                                    {/* Inner Highlight */}
                                    <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                                    {/* Icon Container */}
                                    <div className="relative z-10 p-2 rounded-xl bg-black/40 ring-1 ring-white/5 w-14 h-14 flex items-center justify-center backdrop-blur-sm shadow-inner">
                                        {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-9 h-9 object-contain drop-shadow-md transition-transform group-hover:scale-110" />
                                        ) : (
                                            <item.icon className={`w-9 h-9 ${item.color} drop-shadow-md transition-transform group-hover:scale-110`} />
                                        )}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div className="relative z-10 text-center w-full px-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider opacity-80 truncate ${item.rarity === 'jackpot' ? 'text-yellow-400' : 'text-slate-300'}`}>
                                            {item.name || item.rarity}
                                        </div>
                                        <div className="text-sm font-black text-white drop-shadow-sm mt-1 font-lilita tracking-wide">
                                            {item.rarity === 'jackpot' ? 'JACKPOT' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                                        </div>
                                    </div>
                                    
                                    {/* Rarity Glow Bar at Bottom */}
                                    <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full opacity-50" style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- CENTER TARGET (Scanner Style) --- */}
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                 
                 {/* 1. Focus Area Highlight */}
                 <div className="absolute h-full w-[130px] bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>

                 {/* 2. The Frame */}
                 <div className="relative w-[124px] h-[calc(100%-24px)] border border-yellow-500/20 rounded-xl">
                    <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-yellow-400 rounded-tl-md drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"></div>
                    <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-yellow-400 rounded-tr-md drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"></div>
                    <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-yellow-400 rounded-bl-md drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-yellow-400 rounded-br-md drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"></div>
                 </div>

                 {/* 3. The Central Line */}
                 <div className="absolute inset-0 flex justify-center">
                    <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-yellow-300/80 to-transparent shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                 </div>

                 {/* 4. Indicators */}
                 <div className="absolute top-0 transform -translate-y-1/2 z-40">
                     <div className="relative flex flex-col items-center">
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 rotate-45 border border-yellow-100 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400/40 blur-md rounded-full"></div>
                     </div>
                 </div>
                 <div className="absolute bottom-0 transform translate-y-1/2 z-40">
                     <div className="relative flex flex-col items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400/40 blur-md rounded-full"></div>
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 rotate-45 border border-yellow-100 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]"></div>
                     </div>
                 </div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center z-20">
              
              {/* Spin Multiplier Toggles */}
              <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700 mb-4 shadow-lg backdrop-blur-sm">
                 <button 
                   onClick={() => !isSpinning && setSpinMultiplier(1)}
                   className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 1 ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                   disabled={isSpinning}
                 >
                    x1
                 </button>
                 <button 
                   onClick={() => !isSpinning && setSpinMultiplier(10)}
                   className={`px-6 py-1.5 rounded-md font-lilita text-sm tracking-wide transition-all ${spinMultiplier === 10 ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                   disabled={isSpinning}
                 >
                    x10
                 </button>
              </div>

              <button
                onClick={spinChest}
                disabled={isSpinning || coins < currentCost} // Use context coins
                className="group relative w-48 h-16 rounded-xl overflow-hidden transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           active:scale-95 hover:enabled:shadow-[0_0_20px_rgba(8,145,178,0.5)]
                           border-2 bg-slate-900 border-cyan-600"
              >
                {/* Background Animation */}
                <div className={`absolute inset-0 transition-transform duration-1000 ${isSpinning ? 'translate-x-full' : 'translate-x-0'} 
                    bg-gradient-to-r from-cyan-600/20 to-blue-600/20
                `}></div>
                
                {/* CHANGED: Added pb-1 and used justify-center with flex-col to better position content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                    {isSpinning ? (
                         <span className="font-lilita text-lg text-slate-400 tracking-wider animate-pulse">SPINNING...</span>
                    ) : (
                        <>
                            {/* CHANGED: Removed {spinMultiplier === 10 ? 'x10' : ''} */}
                            <span className="font-lilita text-2xl uppercase tracking-widest drop-shadow-md text-cyan-400 group-hover:text-cyan-300">
                                SPIN
                            </span>
                            
                            {/* Cost Box - CHANGED: Reduced mt-1 to mt-0.5 */}
                            <div className="flex items-center gap-1.5 mt-0.5 bg-black/40 px-3 py-0.5 rounded-md border border-white/5 shadow-inner">
                                <span className={`text-lg font-lilita tracking-wide leading-none ${coins < currentCost ? 'text-red-500' : 'text-slate-200'}`}>
                                    {currentCost}
                                </span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3.5 h-3.5" />
                            </div>
                        </>
                    )}
                </div>
              </button>
              
              {/* Error Message */}
              {coins < currentCost && !isSpinning && (
                  <p className="text-red-500 text-sm mt-3 font-semibold bg-red-950/30 px-3 py-1 rounded-full border border-red-900/50">
                      Không đủ xu để quay!
                  </p>
              )}
        </div>

      </div>

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
