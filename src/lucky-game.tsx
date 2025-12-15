import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- SVG & Icon Components (Giữ nguyên từ file gốc) ---
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

// Interface mở rộng để dùng cho strip (dải băng chuyền)
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

const getRarityBgGradient = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'from-slate-800 to-slate-900 border-slate-700';
      case 'uncommon': return 'from-emerald-900/60 to-slate-900 border-emerald-600';
      case 'rare': return 'from-sky-900/60 to-slate-900 border-sky-600';
      case 'epic': return 'from-violet-900/60 to-slate-900 border-violet-600';
      case 'legendary': return 'from-amber-800/60 to-slate-900 border-amber-500';
      case 'jackpot': return 'from-red-900/80 via-amber-700/50 to-slate-900 border-yellow-400';
      default: return 'from-slate-800 to-slate-900 border-slate-700';
    }
};

// --- CONFIG FOR SPINNER ---
const CARD_WIDTH = 100;
const CARD_GAP = 12;
const VISIBLE_CARDS_ON_SCREEN = 5; // Used for container sizing
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// --- Reward Popup Component ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-80 bg-slate-900 border-2 rounded-2xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-slate-800 border-4 shadow-lg ${jackpotWon ? 'border-yellow-400' : 'border-slate-600'}`}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-12 h-12" onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/cccccc/000000?text=Lỗi'; }} />
                ) : (
                    <item.icon className={`w-12 h-12 ${item.color}`} />
                )}
             </div>
        </div>

        <div className="mt-10 mb-2">
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
  // Logic State
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // Visual State
  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0); // translateX value in pixels
  const [transitionDuration, setTransitionDuration] = useState(0); // CSS transition time in seconds

  // --- DATA DEFINITION ---
  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '150 Coins', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Tia chớp', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: '5 Pickaxes', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '300 Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: '10 Pickaxes', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: '15 Pickaxes', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '500 Coins', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Trái tim', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '100 Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  // Helper to get random item excluding jackpot (for fillers)
  const getRandomFiller = useCallback(() => {
    const fillerItems = items.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [items]);

  // Initial strip generation (visual only)
  useEffect(() => {
    const initialStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS_ON_SCREEN + 2; i++) {
        initialStrip.push({ ...getRandomFiller(), uniqueId: `init-${i}` });
    }
    setStrip(initialStrip);
  }, [getRandomFiller]);

  // --- LOGIC: DETERMINE WINNER ---
  const determineWinner = useCallback(() => {
      // 1% chance for Jackpot
      if (Math.random() < 0.01) {
          const jackpotItem = items.find(i => i.rarity === 'jackpot');
          if (jackpotItem) return jackpotItem;
      }
      // Otherwise random weighted by logic in array (here just equal probability among non-jackpot for simplicity based on provided code)
      // Or you can implement weights. For now, picking random non-jackpot.
      const normalItems = items.filter(i => i.rarity !== 'jackpot');
      return normalItems[Math.floor(Math.random() * normalItems.length)];
  }, [items]);

  // --- SPIN ACTION ---
  const handleSpin = () => {
    if (isSpinning || currentCoins < 100) return;

    // 1. Transaction
    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);

    // 2. State Prep
    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // 3. Determine Result
    const winner = determineWinner();
    
    // 4. Generate Spin Strip
    // Logic: Create a long list. Place winner at a specific index (e.g. 50).
    // Start visual at index 0. Animate to index 50.
    const TARGET_INDEX = 50; // The index in the array where the winner sits
    const TOTAL_ITEMS = TARGET_INDEX + 10; // Add some buffer after
    
    const newStrip: StripItem[] = [];
    
    // Generate fillers before winner
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-${Date.now()}-${i}` });
    }
    // Push Winner
    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });
    // Generate fillers after
    for (let i = TARGET_INDEX + 1; i < TOTAL_ITEMS; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `tail-${Date.now()}-${i}` });
    }

    setStrip(newStrip);

    // 5. Animation Execution
    // Step A: Instant reset to 0 (since we replaced the array, we start at left)
    setTransitionDuration(0);
    setOffset(0);

    // Step B: Force Reflow & Start Animation (use setTimeout to allow DOM to update)
    // We want the winner (index 50) to end up in the center of the viewport.
    // Offset calculation: -(ItemPosition) + (CenterOfViewport) - (HalfItemWidth)
    // Add a tiny random jitter to make it look organic (landing slightly left/right of dead center)
    const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.4)) - (CARD_WIDTH * 0.2);
    
    // Assume container width is roughly calculated or fixed. 
    // Container is: VISIBLE_CARDS_ON_SCREEN * ITEM_FULL_WIDTH - CARD_GAP
    // Center is roughly half of that.
    const CONTAINER_WIDTH = (VISIBLE_CARDS_ON_SCREEN * ITEM_FULL_WIDTH) - CARD_GAP;
    const CENTER_OFFSET = CONTAINER_WIDTH / 2;
    
    // The center of the target card needs to be at CENTER_OFFSET.
    // Position of target card left edge = TARGET_INDEX * ITEM_FULL_WIDTH
    // Center of target card = Position + CARD_WIDTH/2
    const targetPositionX = (TARGET_INDEX * ITEM_FULL_WIDTH) + (CARD_WIDTH / 2);
    
    const finalOffset = -(targetPositionX - CENTER_OFFSET) + jitter;

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
             setTransitionDuration(5); // 5 seconds spin time
             setOffset(finalOffset);
        });
    });

    // 6. Handle Completion
    setTimeout(() => {
        setIsSpinning(false);
        
        // Calculate Logic Rewards
        let actualWonValue = 0;
        if (winner.rewardType === 'pickaxe' && winner.rewardAmount) {
            onUpdatePickaxes(winner.rewardAmount);
            actualWonValue = winner.rewardAmount;
        } else if (winner.rarity === 'jackpot') {
            actualWonValue = currentJackpotPool;
            setJackpotWon(true);
            onUpdateCoins(actualWonValue);
            onUpdateJackpotPool(0, true);
        } else if (winner.rewardType === 'coin') {
            onUpdateCoins(winner.value);
            actualWonValue = winner.value;
        } else {
            actualWonValue = winner.value;
        }

        const finalWonItem = {
            ...winner,
            value: actualWonValue
        };
        setWonRewardDetails(finalWonItem);
        setShowRewardPopup(true);

    }, 5100); // 5s + buffer
  };
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center font-sans pb-4 relative overflow-hidden">
       {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative w-full flex items-center justify-between py-3 px-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-20">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Quay lại</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      <div className="w-full max-w-4xl px-4 flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* Jackpot Pool Banner */}
        <div className="text-center mb-8 relative group">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full group-hover:bg-yellow-500/30 transition-all"></div>
            <div className={`relative p-4 rounded-2xl border-2 bg-gradient-to-r from-red-900/80 via-slate-900 to-red-900/80 backdrop-blur-sm transition-all duration-300 ${jackpotWon ? 'border-yellow-400 scale-110' : 'border-yellow-600/50 hover:border-yellow-500'}`}>
              <div className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase mb-1">JACKPOT POOL</div>
              <div className="text-5xl font-black text-white drop-shadow-lg flex items-center justify-center gap-2 font-lilita">
                {currentJackpotPool.toLocaleString()}
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 drop-shadow-md" />
              </div>
              <div className="text-slate-400 text-xs mt-2 font-mono">1% CHANCE TO WIN ALL</div>
            </div>
        </div>
        
        {/* --- HORIZONTAL SPINNER --- */}
        <div className="w-full max-w-3xl relative mb-10">
            {/* Top/Bottom Decorative Lines */}
            <div className="absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            {/* Spinner Window (Overflow Hidden) */}
            <div className="relative h-40 w-full bg-slate-900/50 border-y border-slate-800 overflow-hidden shadow-inner-strong">
                {/* The Strip */}
                <div 
                    className="absolute top-0 bottom-0 left-0 flex items-center h-full pl-[calc(50%-50px)]" /* Initial padding to center first item roughly if offset is 0 */
                    style={{
                        transform: `translateX(${offset}px)`,
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                        willChange: 'transform'
                    }}
                >
                    {strip.map((item, index) => {
                         const bgClass = getRarityBgGradient(item.rarity);
                         const rarityColor = getRarityColor(item.rarity);
                         
                         return (
                            <div 
                                key={item.uniqueId}
                                className="flex-shrink-0 flex flex-col items-center justify-center relative"
                                style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                            >
                                {/* Card Body */}
                                <div className={`w-full aspect-[3/4] rounded-lg bg-gradient-to-b ${bgClass} border relative group overflow-hidden shadow-lg flex flex-col items-center justify-center p-2`}>
                                    
                                    {/* Jackpot Glow Effect */}
                                    {item.rarity === 'jackpot' && (
                                        <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
                                    )}

                                    {/* Icon */}
                                    <div className="relative z-10 w-12 h-12 mb-2 flex items-center justify-center drop-shadow-md transform group-hover:scale-110 transition-transform">
                                         {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                                         ) : (
                                            <item.icon className={`w-full h-full ${item.color}`} />
                                         )}
                                    </div>
                                    
                                    {/* Value/Text */}
                                    <div className="relative z-10 text-center">
                                        {item.rarity === 'jackpot' ? (
                                            <span className="text-[10px] font-black text-yellow-300 uppercase block leading-tight">JACKPOT</span>
                                        ) : (
                                            <>
                                                {item.rewardAmount && item.rewardAmount > 0 ? (
                                                     <span className="text-sm font-bold text-white drop-shadow-sm">x{item.rewardAmount}</span>
                                                ) : (
                                                     <span className="text-sm font-bold text-white drop-shadow-sm">{item.value}</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Rarity Bar at Bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor }}></div>
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>

            {/* --- CENTER MARKER (The Pointer) --- */}
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                 {/* Vertical Line */}
                 <div className="h-full w-[2px] bg-yellow-400 shadow-[0_0_10px_#fbbf24]"></div>
                 
                 {/* Top Triangle */}
                 <div className="absolute top-0 w-6 h-6 bg-slate-900 border-b-2 border-r-2 border-yellow-400 transform rotate-45 -translate-y-1/2 shadow-lg"></div>
                 {/* Bottom Triangle */}
                 <div className="absolute bottom-0 w-6 h-6 bg-slate-900 border-t-2 border-l-2 border-yellow-400 transform rotate-45 translate-y-1/2 shadow-lg"></div>
                 
                 {/* Side Fade Gradients (to hide edges) */}
                 <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent"></div>
                 <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent"></div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center">
              <button
                onClick={handleSpin}
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
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        .shadow-inner-strong { box-shadow: inset 0 0 30px 0 rgba(0,0,0,0.8); }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
