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
      case 'common': return '#94a3b8'; // Slate 400
      case 'uncommon': return '#34d399'; // Emerald 400
      case 'rare': return '#38bdf8'; // Sky 400
      case 'epic': return '#c084fc'; // Purple 400
      case 'legendary': return '#fbbf24'; // Amber 400
      case 'jackpot': return '#f59e0b'; // Amber 500 (Deep)
      default: return '#94a3b8';
    }
};

const getCardStyle = (rarity: Item['rarity']) => {
    // Updated styles for a more "Glass/Holographic" look
    switch(rarity) {
      case 'common': return { 
          bg: 'bg-slate-800/80', 
          border: 'border-slate-600', 
          shadow: 'shadow-slate-900/50',
          text: 'text-slate-300'
      };
      case 'uncommon': return { 
          bg: 'bg-emerald-900/40', 
          border: 'border-emerald-500/50', 
          shadow: 'shadow-emerald-500/20',
          text: 'text-emerald-300'
      };
      case 'rare': return { 
          bg: 'bg-cyan-900/40', 
          border: 'border-cyan-500/50', 
          shadow: 'shadow-cyan-500/20',
          text: 'text-cyan-300'
      };
      case 'epic': return { 
          bg: 'bg-purple-900/40', 
          border: 'border-purple-500/50', 
          shadow: 'shadow-purple-500/20',
          text: 'text-purple-300'
      };
      case 'legendary': return { 
          bg: 'bg-amber-900/40', 
          border: 'border-amber-400/60', 
          shadow: 'shadow-amber-500/30',
          text: 'text-amber-300'
      };
      case 'jackpot': return { 
          bg: 'bg-gradient-to-br from-red-900/60 via-amber-700/40 to-red-900/60', 
          border: 'border-yellow-300', 
          shadow: 'shadow-yellow-500/40',
          text: 'text-yellow-200'
      };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', shadow: '', text: 'text-gray-400' };
    }
};

// --- CONFIG ---
const CARD_WIDTH = 120; // Slightly wider for better presentation
const CARD_GAP = 16;    // More breathing room
const VISIBLE_CARDS = 5;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// --- REWARD POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-80 bg-[#121212] rounded-3xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-1
            ${jackpotWon ? 'shadow-[0_0_80px_rgba(250,204,21,0.6)]' : 'shadow-[0_0_50px_rgba(0,0,0,0.8)]'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Border */}
        <div className={`absolute inset-0 rounded-3xl opacity-50 blur-xl ${jackpotWon ? 'bg-yellow-500' : 'bg-slate-600'} `}></div>
        
        <div className="relative w-full h-full bg-slate-900/90 rounded-[22px] p-6 flex flex-col items-center border border-white/10 overflow-hidden">
            
            {/* Rays Effect for high rarity */}
            {['legendary', 'epic', 'jackpot'].includes(item.rarity) && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-conic from-transparent via-white/10 to-transparent animate-spin-slow pointer-events-none"></div>
            )}

            {/* Floating Icon */}
            <div className="mt-4 mb-6 relative">
                 <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-[#1a1a1a] border-[6px] shadow-2xl ${jackpotWon ? 'border-yellow-400 animate-bounce' : 'border-slate-700'}`}
                      style={{ borderColor: jackpotWon ? undefined : rarityColor }}
                 >
                    {typeof item.icon === 'string' ? (
                        <img src={item.icon} alt={item.name} className="w-16 h-16 object-contain drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56/cccccc/000000?text=Lỗi'; }} />
                    ) : (
                        <item.icon className={`w-16 h-16 ${item.color} drop-shadow-lg`} />
                    )}
                 </div>
            </div>

            <div className="mb-6 text-center z-10">
                {jackpotWon ? (
                    <>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest uppercase mb-2 drop-shadow-sm animate-pulse">JACKPOT!</h2>
                        <p className="font-sans text-yellow-100/70 text-sm">Bạn đã hốt trọn quỹ thưởng!</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold uppercase tracking-wide drop-shadow-md" style={{ color: rarityColor }}>{item.name || item.rarity}</h2>
                        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <p className="font-sans text-slate-300 text-[10px] uppercase tracking-[0.2em]">{item.rarity} Reward</p>
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full mb-6 z-10">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <span className="text-slate-500 text-[10px] font-sans font-bold uppercase mb-1 tracking-wider">BẠN NHẬN ĐƯỢC</span>
                     <div className="flex items-center gap-3 scale-110">
                        {item.rewardType === 'coin' && (
                            <>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8 drop-shadow-md" />
                                <span className="text-3xl font-black text-white drop-shadow-md">{item.value.toLocaleString()}</span>
                            </>
                        )}
                        {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && (
                            <>
                                {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-8 h-8 drop-shadow-md" />}
                                {item.rewardType === 'other' && typeof item.icon !== 'string' && <item.icon className={`w-8 h-8 ${item.color} drop-shadow-md`} />}
                                <span className="text-3xl font-black text-white drop-shadow-md">x{item.rewardAmount?.toLocaleString()}</span>
                            </>
                        )}
                     </div>
                </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl font-black text-white tracking-widest uppercase shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-[4px] transition-all z-10"
            >
              Thu thập
            </button>
        </div>
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

        setTransitionDuration(5.5); // Slightly longer for dramatic effect
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
        }, 5600);
    }, 50);

  }, [isSpinning, currentCoins, items, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, currentJackpotPool, getRandomFiller]);
  
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center font-sans pb-4 overflow-hidden relative">
      
      {/* Background Ambience - Cyberpunk Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-900/10 blur-[80px] rounded-full mix-blend-screen"></div>
      </div>

      <header className="relative w-full flex items-center justify-between py-3 px-6 z-20">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700 backdrop-blur-md transition-all group">
          <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="hidden sm:inline text-sm font-bold text-slate-400 group-hover:text-white transition-colors">QUAY LẠI</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      <div className="w-full max-w-6xl px-4 flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* --- JACKPOT UI --- */}
        <div className="text-center mb-8 w-full max-w-lg z-10 scale-90 sm:scale-100">
            <div className={`
                relative px-8 py-5 rounded-2xl border transition-all duration-500 overflow-hidden
                ${ jackpotAnimation 
                    ? 'bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 border-yellow-300 shadow-[0_0_60px_rgba(234,179,8,0.6)] animate-pulse' 
                    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl' 
                }
            `}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shine"></div>
              
              <div className="flex flex-col items-center gap-1">
                  <div className={`text-xs font-black tracking-[0.3em] uppercase mb-1 ${jackpotAnimation ? 'text-white' : 'text-slate-400'}`}>
                      Jackpot Pool
                  </div>
                  <div className={`text-5xl sm:text-6xl font-black flex items-center justify-center gap-3 drop-shadow-2xl font-lilita
                      ${ jackpotAnimation ? 'text-white scale-110 transition-transform' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' }`
                  }>
                    {currentJackpotPool.toLocaleString()}
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
                  </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <span className="text-yellow-500/80 text-xs font-bold uppercase tracking-widest">Cơ hội trúng: 1%</span>
            </div>
        </div>
        
        {/* --- SPINNER MACHINE --- */}
        <div className="relative w-full max-w-[800px] mb-12 group">
            
            {/* Machine Case (The metal frame) */}
            <div className="relative p-3 bg-slate-800 rounded-[20px] shadow-2xl border-t border-slate-600 border-b-4 border-b-black">
                {/* Metallic gradient overlay */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 pointer-events-none"></div>
                
                {/* Bolts */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>

                {/* The "Glass" Window */}
                <div className="relative h-60 w-full overflow-hidden bg-black rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-slate-900">
                    
                    {/* Background Grid inside Spinner */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                    {/* The Moving Strip */}
                    <div 
                        className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform"
                        style={{
                            transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, 
                            transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` : 'none',
                        }}
                    >
                        {strip.map((item) => {
                            const style = getCardStyle(item.rarity);
                            return (
                                <div 
                                    key={item.uniqueId} 
                                    className="flex-shrink-0 flex items-center justify-center transform transition-transform"
                                    style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                                >
                                    <div className={`
                                        relative w-full aspect-[3/4] rounded-xl overflow-hidden
                                        flex flex-col items-center justify-between py-3
                                        border ${style.border} ${style.bg} ${style.shadow}
                                        backdrop-blur-sm
                                    `}>
                                        {/* Top shine */}
                                        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                                        {/* Rarity Text */}
                                        <div className={`text-[9px] font-black uppercase tracking-wider opacity-80 ${style.text}`}>
                                            {item.name}
                                        </div>

                                        {/* Icon */}
                                        <div className="flex-1 flex items-center justify-center z-10 scale-110">
                                            {typeof item.icon === 'string' ? (
                                                <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow-md" />
                                            ) : (
                                                <item.icon className={`w-10 h-10 ${item.color} drop-shadow-md`} />
                                            )}
                                        </div>
                                        
                                        {/* Value Pill */}
                                        <div className="bg-black/40 px-2 py-1 rounded-md border border-white/5 w-[90%] flex justify-center">
                                            <div className="text-xs font-bold text-white drop-shadow-sm">
                                                {item.rarity === 'jackpot' ? 'JACKPOT' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Side Shadows (Vignette) */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10"></div>

                    {/* Glass Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20 rounded-xl"></div>
                </div>

                {/* --- CENTER TARGET SCOPE (Holographic Overlay) --- */}
                <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-[140px] pointer-events-none z-30">
                    {/* Top Bracket */}
                    <div className="absolute top-0 left-0 w-full h-4 border-t-2 border-l-2 border-r-2 border-yellow-500/80 rounded-t-lg shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                    {/* Bottom Bracket */}
                    <div className="absolute bottom-0 left-0 w-full h-4 border-b-2 border-l-2 border-r-2 border-yellow-500/80 rounded-b-lg shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                    
                    {/* Center Marker Triangle */}
                    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400"></div>
                    
                    {/* Vertical Glow Line */}
                    <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent"></div>
                </div>

            </div>
            
            {/* Base/Stand of the machine */}
            <div className="mx-auto w-[90%] h-4 bg-slate-900 rounded-b-xl border-t border-slate-800 opacity-80"></div>
        </div>

        {/* --- SPIN BUTTON CONTROL --- */}
        <div className="flex flex-col items-center justify-center z-20">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className="group relative w-64 h-20 bg-transparent perspective-1000 border-none outline-none focus:outline-none"
              >
                 <div className={`
                    absolute inset-0 rounded-2xl transition-all duration-100 ease-out
                    flex items-center justify-center
                    ${isSpinning || currentCoins < 100 
                        ? 'bg-slate-800 border-b-4 border-slate-950 translate-y-[4px]' 
                        : 'bg-gradient-to-b from-cyan-500 to-blue-600 border-b-[6px] border-blue-900 shadow-[0_10px_20px_rgba(8,145,178,0.4)] hover:-translate-y-1 hover:border-b-[8px] active:translate-y-[2px] active:border-b-[2px]'
                    }
                 `}>
                    {isSpinning ? (
                         <div className="flex items-center gap-2">
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                             <span className="font-lilita text-xl text-slate-400 tracking-wider">ĐANG QUAY...</span>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="font-lilita text-3xl text-white uppercase tracking-[0.2em] drop-shadow-md group-hover:scale-105 transition-transform">
                                SPIN
                            </span>
                            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-0.5 rounded-full mt-1">
                                <span className={`text-sm font-black ${currentCoins < 100 ? 'text-red-300' : 'text-yellow-300'}`}>100</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                 </div>
              </button>
              
              {currentCoins < 100 && !isSpinning && (
                  <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm animate-pulse">
                      <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Không đủ xu để quay!
                      </p>
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
            0% { opacity: 0; transform: scale(0.9) translateY(20px); } 
            100% { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes shine {
            100% { transform: translateX(100%) skewX(12deg); }
        }
        .animate-shine { animation: shine 2.5s infinite linear; }
        
        @keyframes spin-slow { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }

        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
