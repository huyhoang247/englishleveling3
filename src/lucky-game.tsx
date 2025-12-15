import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

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

const getCardStyle = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return { bg: 'bg-gradient-to-b from-slate-800 to-slate-900', border: 'border-slate-600', glow: '' };
      case 'uncommon': return { bg: 'bg-gradient-to-b from-emerald-900/50 to-slate-900', border: 'border-emerald-600', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' };
      case 'rare': return { bg: 'bg-gradient-to-b from-cyan-900/50 to-slate-900', border: 'border-cyan-500', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]' };
      case 'epic': return { bg: 'bg-gradient-to-b from-fuchsia-900/50 to-slate-900', border: 'border-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(232,121,249,0.5)]' };
      case 'legendary': return { bg: 'bg-gradient-to-b from-amber-700/50 to-slate-900', border: 'border-amber-400', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]' };
      case 'jackpot': return { bg: 'bg-gradient-to-b from-red-600 via-amber-600 to-slate-900', border: 'border-yellow-300', glow: 'shadow-[0_0_40px_rgba(252,211,77,0.8)]' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', glow: '' };
    }
};

// --- CONFIG ---
const CARD_WIDTH = 110;
const CARD_GAP = 12;
const VISIBLE_CARDS = 5;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// --- REWARD POPUP (Design của phiên bản trước - Icon nổi lên trên) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-80 bg-slate-900 border-2 rounded-2xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center mt-8
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-slate-800 border-4 shadow-lg ${jackpotWon ? 'border-yellow-400' : 'border-slate-600'}`}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-14 h-14 object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56/cccccc/000000?text=Lỗi'; }} />
                ) : (
                    <item.icon className={`w-14 h-14 ${item.color}`} />
                )}
             </div>
        </div>

        <div className="mt-12 mb-2">
            {jackpotWon ? (
                <>
                    <h2 className="text-4xl font-black text-yellow-400 tracking-widest uppercase mb-1 drop-shadow-md animate-pulse">JACKPOT!</h2>
                    <p className="font-sans text-yellow-200/80 text-sm">Bạn đã trúng toàn bộ quỹ thưởng!</p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold uppercase tracking-wide" style={{ color: rarityColor }}>{item.name || item.rarity}</h2>
                    <p className="font-sans text-slate-400 text-xs uppercase tracking-widest mt-1">{item.rarity} Reward</p>
                </>
            )}
        </div>

        <div className="flex flex-col gap-2 w-full my-6">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex flex-col items-center justify-center">
                 <span className="text-slate-400 text-xs font-sans mb-1">PHẦN THƯỞNG</span>
                 <div className="flex items-center gap-2">
                    {item.rewardType === 'coin' && (
                        <>
                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-6 h-6" />
                            <span className="text-2xl font-bold text-yellow-400">{item.value.toLocaleString()}</span>
                        </>
                    )}
                    {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                        <>
                            {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-6 h-6" />}
                            {item.rewardType === 'other' && typeof item.icon !== 'string' && <item.icon className={`w-6 h-6 ${item.color}`} />}
                            <span className="text-2xl font-bold text-white">x{item.rewardAmount?.toLocaleString()}</span>
                        </>
                    )}
                 </div>
            </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white tracking-wider uppercase shadow-lg transform active:scale-95 transition-all"
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

  const getRandomFiller = useCallback(() => {
    const fillerItems = items.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [items]);

  // Initial Strip (Visual only)
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
    const TARGET_INDEX = 50; 
    const newStrip: StripItem[] = [];
    
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-pre-${Date.now()}-${i}` });
    }
    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });
    for (let i = 0; i < 15; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-post-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionDuration(0);
    setOffset(0);

    // Animation Trigger
    setTimeout(() => {
        const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.4)) - (CARD_WIDTH * 0.2); 
        const CONTAINER_WIDTH = (VISIBLE_CARDS * ITEM_FULL_WIDTH) - CARD_GAP;
        const CENTER_OFFSET = CONTAINER_WIDTH / 2;
        const targetX = (TARGET_INDEX * ITEM_FULL_WIDTH) + (CARD_WIDTH / 2);
        const finalOffset = -(targetX - CENTER_OFFSET) + jitter;

        setTransitionDuration(5);
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
        }, 5100);
    }, 50);

  }, [isSpinning, currentCoins, items, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, currentJackpotPool, getRandomFiller]);
  
  return (
    <div className="min-h-screen bg-[#050505] bg-grid-pattern flex flex-col items-center font-sans pb-4 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_70%)] opacity-60" />
      </div>

      <header className="relative w-full flex items-center justify-between py-2 px-4 bg-black/40 backdrop-blur-md z-20 border-b border-slate-800">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Quay lại</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      <div className="w-full max-w-5xl px-4 pt-8 flex-1 flex flex-col items-center justify-center">
        
        {/* --- JACKPOT UI (GIỮ NGUYÊN TỪ FILE GỐC) --- */}
        <div className="text-center mb-10 w-full max-w-lg z-10">
            <div className={`mt-2 p-3 rounded-xl border-4 transition-all duration-500 relative ${ jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg' }`}>
              <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider"> JACKPOT POOL </div>
              <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                {currentJackpotPool.toLocaleString()}
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
              </div>
              <div className="text-yellow-200 text-xs mt-2 opacity-90"> Tỉ lệ quay trúng ô JACKPOT: 1%! </div>
              {jackpotAnimation && ( <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div> )}
            </div>
        </div>
        
        {/* --- SPINNER UI (STYLE vong-quay.tsx) --- */}
        <div className="relative w-full max-w-4xl mb-12">
            
            {/* Decorative Rails */}
            <div className="absolute -top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent opacity-50"></div>
            <div className="absolute -bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent opacity-50"></div>

            {/* Main Window */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-950/80 backdrop-blur-sm border-y border-slate-800 shadow-2xl"
                 style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                
                {/* The Strip */}
                <div 
                    className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform"
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
                                className="flex-shrink-0 flex items-center justify-center"
                                style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                            >
                                <div className={`
                                    relative w-full aspect-[4/5] rounded-lg 
                                    bg-gradient-to-b ${style.bg}
                                    border ${style.border}
                                    flex flex-col items-center justify-center gap-2
                                    ${style.glow}
                                    shadow-lg
                                    ${isSpinning ? 'opacity-90' : 'opacity-100'}
                                `}>
                                    {/* Inner Highlight */}
                                    <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                                    {/* Icon Container */}
                                    <div className="relative z-10 p-2 rounded-full bg-slate-950/40 ring-1 ring-white/10 w-12 h-12 flex items-center justify-center">
                                        {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain drop-shadow-md" />
                                        ) : (
                                            <item.icon className={`w-8 h-8 ${item.color} drop-shadow-md`} />
                                        )}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div className="relative z-10 text-center w-full px-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider opacity-90 truncate ${item.rarity === 'jackpot' ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {item.name || item.rarity}
                                        </div>
                                        <div className="text-xs font-black text-white drop-shadow-sm mt-0.5">
                                            {item.rarity === 'jackpot' ? '$$$' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                                        </div>
                                    </div>
                                    
                                    {/* Rarity Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg" style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- CENTER TARGET (Pointer) --- */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[140px] pointer-events-none z-20">
                {/* Top Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-yellow-500 drop-shadow-lg"></div>
                {/* Bottom Arrow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-yellow-500 drop-shadow-lg"></div>
                {/* Center Line */}
                <div className="absolute top-2 bottom-2 left-1/2 w-[2px] bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
            </div>
        </div>

        {/* --- CONTROLS (NÚT SPIN CỦA PHIÊN BẢN TRƯỚC) --- */}
        <div className="flex flex-col items-center justify-center z-20">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className="group relative w-48 h-16 rounded-xl bg-slate-900 border-2 border-cyan-600 overflow-hidden transition-all duration-200
                           disabled:border-slate-700 disabled:opacity-70 disabled:cursor-not-allowed
                           active:scale-95 hover:enabled:shadow-[0_0_20px_rgba(8,145,178,0.5)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 transition-transform duration-1000 ${isSpinning ? 'translate-x-full' : 'translate-x-0'}`}></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    {isSpinning ? (
                         <span className="font-lilita text-lg text-slate-400 tracking-wider animate-pulse">ROLLING...</span>
                    ) : (
                        <>
                            <span className="font-lilita text-2xl text-cyan-400 uppercase tracking-widest drop-shadow-md group-hover:text-cyan-300">SPIN</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-sm font-bold ${currentCoins < 100 ? 'text-red-500' : 'text-slate-300'}`}>100</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                            </div>
                        </>
                    )}
                </div>
              </button>
              
              {currentCoins < 100 && !isSpinning && (
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
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
