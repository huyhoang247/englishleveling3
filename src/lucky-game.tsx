import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- SVG Icons (Giữ nguyên hoặc làm mới nhẹ) ---
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) return <img src={src} alt="Coin" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=$'; }} />;
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';
const PickaxeIcon = ({ className }: { className?: string }) => <img src={pickaxeIconUrl} alt="Pickaxe" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} />;
const ZapIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> );
const TrophyIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path> </svg> );
const HeartIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path> </svg> );
const GiftIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path> </svg> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

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
  isStatsFullscreen: boolean;
  currentCoins: number;
  onUpdateCoins: (amount: number) => void;
  onUpdatePickaxes: (amount: number) => void;
  currentJackpotPool: number;
  onUpdateJackpotPool: (amount: number, resetToDefault?: boolean) => void;
}
interface RewardPopupProps {
  item: Item;
  jackpotWon: boolean;
  onClose: () => void;
}

// --- STYLING UTILS ---
// Màu sắc tinh chỉnh lại cho sang trọng hơn
const getRarityStyles = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': 
        return { 
            border: 'border-slate-600', 
            shadow: 'shadow-slate-500/20', 
            bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
            text: 'text-slate-400',
            glowColor: 'rgba(148, 163, 184, 0.5)'
        };
      case 'uncommon': 
        return { 
            border: 'border-emerald-500', 
            shadow: 'shadow-emerald-500/30', 
            bg: 'bg-gradient-to-br from-emerald-900/40 to-slate-900',
            text: 'text-emerald-400',
            glowColor: 'rgba(16, 185, 129, 0.5)'
        };
      case 'rare': 
        return { 
            border: 'border-cyan-500', 
            shadow: 'shadow-cyan-500/40', 
            bg: 'bg-gradient-to-br from-cyan-900/40 to-slate-900',
            text: 'text-cyan-400',
            glowColor: 'rgba(6, 182, 212, 0.6)'
        };
      case 'epic': 
        return { 
            border: 'border-purple-500', 
            shadow: 'shadow-purple-500/50', 
            bg: 'bg-gradient-to-br from-purple-900/40 to-slate-900',
            text: 'text-purple-400',
            glowColor: 'rgba(168, 85, 247, 0.6)'
        };
      case 'legendary': 
        return { 
            border: 'border-amber-400', 
            shadow: 'shadow-amber-500/50', 
            bg: 'bg-gradient-to-br from-amber-900/40 to-slate-900',
            text: 'text-amber-400',
            glowColor: 'rgba(245, 158, 11, 0.7)'
        };
      case 'jackpot': 
        return { 
            border: 'border-rose-500', 
            shadow: 'shadow-rose-500/60', 
            bg: 'bg-gradient-to-br from-rose-900/60 via-red-900/40 to-slate-900',
            text: 'text-rose-500',
            glowColor: 'rgba(244, 63, 94, 0.8)'
        };
      default: return { border: 'border-slate-700', shadow: '', bg: 'bg-slate-800', text: 'text-slate-500', glowColor: '' };
    }
};

// --- CONFIG ---
const CARD_WIDTH = 130; // Thẻ to hơn một chút
const CARD_GAP = 16;
const VISIBLE_CARDS = 5;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// --- REWARD POPUP (Nâng cấp visual) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const styles = getRarityStyles(item.rarity);
    
    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
      
      {/* Light Burst Background */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className={`w-[800px] h-[800px] bg-gradient-to-r ${jackpotWon ? 'from-yellow-500/20' : 'from-blue-500/20'} to-transparent rounded-full blur-3xl animate-pulse`}></div>
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
      </div>

      <div 
        className={`relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl animate-fade-in-scale-fast flex flex-col items-center p-8 text-center overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 50px ${styles.glowColor}` }}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        {/* Floating Icon Container */}
        <div className="relative mb-6">
             <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${styles.bg}`}></div>
             <div className={`relative w-28 h-28 rounded-full flex items-center justify-center bg-[#151515] border-4 ${styles.border} shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10`}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-16 h-16 object-contain drop-shadow-lg" />
                ) : (
                    <item.icon className={`w-16 h-16 ${item.color}`} />
                )}
             </div>
             {/* Sparkles for High Rarity */}
             {(item.rarity === 'legendary' || item.rarity === 'jackpot' || item.rarity === 'epic') && (
                <div className="absolute -inset-4 animate-spin-slow opacity-60">
                     <svg viewBox="0 0 100 100" className="w-full h-full fill-white/20">
                         <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" />
                     </svg>
                </div>
             )}
        </div>

        <div className="relative z-10 mb-8 space-y-2">
            {jackpotWon ? (
                <>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-tighter uppercase drop-shadow-sm">JACKPOT!</h2>
                    <p className="text-yellow-200/80 font-medium">Bạn đã trúng toàn bộ quỹ thưởng!</p>
                </>
            ) : (
                <>
                    <h2 className={`text-3xl font-black uppercase tracking-wide ${styles.text}`} style={{ textShadow: `0 0 20px ${styles.glowColor}` }}>
                        {item.name || item.rarity}
                    </h2>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                        {item.rarity} Reward
                    </div>
                </>
            )}
        </div>

        {/* Reward Value Box */}
        <div className="relative w-full bg-[#111] rounded-2xl p-4 border border-white/5 mb-8 flex flex-col items-center justify-center gap-1 group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
             <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Bạn nhận được</span>
             <div className="flex items-center gap-3 mt-1">
                {item.rewardType === 'coin' && (
                    <>
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                        <span className="text-4xl font-black text-white tracking-tight">{item.value.toLocaleString()}</span>
                    </>
                )}
                {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                    <>
                        {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-8 h-8" />}
                        {item.rewardType === 'other' && typeof item.icon !== 'string' && <item.icon className={`w-8 h-8 ${item.color}`} />}
                        <span className="text-4xl font-black text-white tracking-tight">x{item.rewardAmount?.toLocaleString()}</span>
                    </>
                )}
             </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-black tracking-wider uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] transform active:scale-95 transition-all duration-200"
        >
          Nhận Quà
        </button>
      </div>
    </div>
    );
};

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // Spinner State
  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '150 Coins', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: '5 Pickaxes', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '300 Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: '10 Pickaxes', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: '15 Pickaxes', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '500 Coins', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '100 Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  const getRandomFiller = useCallback(() => {
    const fillerItems = items.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [items]);

  // Initial Strip
  useEffect(() => {
    const initStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS + 5; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${i}` });
    }
    setStrip(initStrip);
  }, [getRandomFiller]);

  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100) return;

    // Logic Cost
    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // Winner Logic
    let winner: Item;
    if (Math.random() < 0.01) { // 1% Jackpot
        winner = items.find(i => i.rarity === 'jackpot')!;
    } else {
        const others = items.filter(i => i.rarity !== 'jackpot');
        winner = others[Math.floor(Math.random() * others.length)];
    }

    // Prepare Spin Strip
    const TARGET_INDEX = 40; // Giảm một chút để quay nhanh hơn
    const newStrip: StripItem[] = [];
    
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-pre-${Date.now()}-${i}` });
    }
    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });
    for (let i = 0; i < 10; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-post-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionDuration(0);
    setOffset(0);

    // Animation Trigger
    setTimeout(() => {
        // Randomize vị trí dừng một chút để không bị cứng
        const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.4)) - (CARD_WIDTH * 0.2); 
        const CONTAINER_WIDTH = (VISIBLE_CARDS * ITEM_FULL_WIDTH) - CARD_GAP;
        const CENTER_OFFSET = CONTAINER_WIDTH / 2;
        const targetX = (TARGET_INDEX * ITEM_FULL_WIDTH) + (CARD_WIDTH / 2);
        const finalOffset = -(targetX - CENTER_OFFSET) + jitter;

        setTransitionDuration(5.5); // Thời gian quay
        setOffset(finalOffset);
        
        setTimeout(() => {
            setIsSpinning(false);
            
            let actualValue = winner.value;
            if (winner.rewardType === 'pickaxe' && winner.rewardAmount) {
                onUpdatePickaxes(winner.rewardAmount);
                actualValue = winner.rewardAmount;
            } else if (winner.rarity === 'jackpot') {
                actualValue = currentJackpotPool;
                setJackpotWon(true);
                setJackpotAnimation(true);
                onUpdateCoins(actualValue);
                onUpdateJackpotPool(0, true);
                setTimeout(() => setJackpotAnimation(false), 3000);
            } else if (winner.rewardType === 'coin') {
                onUpdateCoins(winner.value);
            }

            setWonRewardDetails({ ...winner, value: actualValue });
            setShowRewardPopup(true);
        }, 5600); // Đợi quay xong + 100ms
    }, 50);

  }, [isSpinning, currentCoins, items, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, currentJackpotPool, getRandomFiller]);
  
  return (
    <div className="fixed inset-0 z-50 bg-[#050505] font-sans flex flex-col items-center overflow-hidden">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial Gradient Center */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b]/40 via-[#000000] to-black" />
        {/* Grid Pattern mờ ảo */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        {/* Spotlight Effect từ trên xuống */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="relative w-full flex items-center justify-between py-4 px-6 z-20">
        <button 
            onClick={onClose} 
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
        >
          <div className="bg-slate-800 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <HomeIcon className="w-4 h-4 text-slate-300" />
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-slate-300 group-hover:text-white">Quay lại</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      {/* --- MAIN GAME AREA --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-4 relative z-10">
        
        {/* JACKPOT DISPLAY */}
        <div className="mb-12 relative group cursor-default">
            <div className={`
                relative px-12 py-5 rounded-2xl border transition-all duration-500 flex flex-col items-center
                ${jackpotAnimation 
                    ? 'bg-gradient-to-b from-red-900/90 to-black border-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.5)] scale-110' 
                    : 'bg-black/40 backdrop-blur-md border-white/10 hover:border-white/20 shadow-2xl'
                }
            `}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl pointer-events-none"></div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 text-sm font-black tracking-[0.2em] mb-1 uppercase">
                    Jackpot Pool
                </div>
                <div className={`text-6xl font-lilita text-white drop-shadow-2xl flex items-center gap-3 ${jackpotAnimation ? 'animate-bounce' : ''}`}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        {currentJackpotPool.toLocaleString()}
                    </span>
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 drop-shadow-md" />
                </div>
                
                {/* Decorative particles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full blur-[2px] animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-red-500 rounded-full blur-[2px] animate-pulse delay-75"></div>
            </div>
        </div>
        
        {/* SPINNER MACHINE */}
        <div className="w-full mb-16 relative">
            {/* Machine Frame */}
            <div className="relative h-64 w-full bg-[#080808] rounded-2xl border border-slate-800 shadow-[inset_0_0_40px_rgba(0,0,0,1)] overflow-hidden">
                
                {/* Inner Shadows/Vignette */}
                <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] rounded-2xl"></div>
                
                {/* Left/Right Fade Mask */}
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-90"></div>

                {/* Top/Bottom Glow Lines */}
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20"></div>
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20"></div>

                {/* THE STRIP */}
                <div 
                    className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform z-10"
                    style={{
                        transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, 
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item, index) => {
                        const styles = getRarityStyles(item.rarity);
                        return (
                            <div 
                                key={item.uniqueId} 
                                className="flex-shrink-0 flex items-center justify-center transition-opacity duration-300"
                                style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                            >
                                {/* Card Body */}
                                <div className={`
                                    relative w-full aspect-[3/4] rounded-xl 
                                    flex flex-col items-center justify-center gap-3
                                    border-[1.5px] ${styles.border}
                                    ${styles.bg}
                                    shadow-lg ${styles.shadow}
                                    group
                                `}>
                                    {/* Inner Shine */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                                    {/* Icon Box */}
                                    <div className="relative p-2.5 rounded-xl bg-black/40 ring-1 ring-white/5 w-16 h-16 flex items-center justify-center shadow-inner">
                                        {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow-sm transition-transform group-hover:scale-110" />
                                        ) : (
                                            <item.icon className={`w-10 h-10 ${item.color} drop-shadow-sm transition-transform group-hover:scale-110`} />
                                        )}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div className="text-center w-full px-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider opacity-80 truncate ${styles.text}`}>
                                            {item.name || item.rarity}
                                        </div>
                                        <div className="text-sm font-black text-white drop-shadow-md mt-0.5 font-lilita tracking-wide">
                                            {item.rarity === 'jackpot' ? 'JACKPOT' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                                        </div>
                                    </div>
                                    
                                    {/* Rarity Indicator Line */}
                                    {/* <div className={`absolute bottom-2 w-8 h-1 rounded-full ${styles.border.replace('border', 'bg')}`}></div> */}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* CENTER TARGET (Scanner Style) */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 z-30 pointer-events-none">
                    {/* The Laser Line */}
                    <div className="absolute inset-y-4 left-1/2 w-[2px] bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] rounded-full"></div>
                    
                    {/* Top Marker */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                            <path d="M12 17L7 10H17L12 17Z" />
                        </svg>
                    </div>
                    {/* Bottom Marker */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500 drop-shadow-[0_-4px_4px_rgba(0,0,0,0.5)]">
                            <path d="M12 7L17 14H7L12 7Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex flex-col items-center justify-center z-20 mt-4">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className={`
                    group relative w-64 h-20 rounded-2xl overflow-hidden transition-all duration-200
                    transform active:scale-[0.98] active:translate-y-1
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0
                    shadow-[0_8px_0_rgb(15,23,42)] active:shadow-none
                    bg-slate-900 border-2 border-slate-700
                `}
              >
                {/* Animated Gradient Background for Button */}
                <div className={`absolute inset-0 bg-gradient-to-b from-indigo-600 to-indigo-800 transition-opacity ${isSpinning ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className={`absolute inset-0 bg-slate-800 transition-opacity ${isSpinning ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {/* Button Shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                    {isSpinning ? (
                         <div className="flex items-center gap-2">
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                             <span className="font-black text-lg text-slate-400 tracking-wider uppercase">Đang quay...</span>
                         </div>
                    ) : (
                        <>
                            <span className="font-lilita text-3xl text-white uppercase tracking-[0.15em] drop-shadow-md group-hover:text-indigo-100">
                                SPIN
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-0.5 bg-black/30 rounded-full border border-white/10">
                                <span className={`text-sm font-bold ${currentCoins < 100 ? 'text-red-400' : 'text-yellow-400'}`}>100</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                            </div>
                        </>
                    )}
                </div>
              </button>
              
              {currentCoins < 100 && !isSpinning && (
                  <div className="mt-4 animate-bounce">
                      <span className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                          Không đủ xu để quay!
                      </span>
                  </div>
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
        
        @keyframes fade-in-scale-fast { 
            from { opacity: 0; transform: scale(0.8); } 
            to { opacity: 1; transform: scale(1); } 
        }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        .group-hover\:animate-shimmer:hover {
            animation: shimmer 1.5s infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
