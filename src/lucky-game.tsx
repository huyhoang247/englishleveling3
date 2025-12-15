import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- SVG Icons (Giữ nguyên hoặc làm đẹp thêm một chút) ---
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
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';

interface Item {
  icon: React.FC<{ className?: string }> | string;
  name: string;
  value: number; 
  rarity: Rarity;
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

// --- CONFIG & UTILS ---
const CARD_WIDTH = 130; // Tăng kích thước thẻ một chút
const CARD_GAP = 16;
const VISIBLE_CARDS = 5;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const TARGET_INDEX = 45; // Số lượng thẻ chạy qua trước khi dừng

const getRarityConfig = (rarity: Rarity) => {
    switch(rarity) {
      case 'common': return { 
          color: '#9ca3af', 
          bg: 'bg-slate-800', 
          border: 'border-slate-600', 
          shadow: 'shadow-none',
          label: 'Common'
      };
      case 'uncommon': return { 
          color: '#34d399', 
          bg: 'bg-[#064e3b]', 
          border: 'border-emerald-500', 
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          label: 'Uncommon'
      };
      case 'rare': return { 
          color: '#38bdf8', 
          bg: 'bg-[#0c4a6e]', 
          border: 'border-cyan-400', 
          shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
          label: 'Rare'
      };
      case 'epic': return { 
          color: '#a78bfa', 
          bg: 'bg-[#4c1d95]', 
          border: 'border-purple-400', 
          shadow: 'shadow-[0_0_25px_rgba(167,139,250,0.4)]',
          label: 'Epic'
      };
      case 'legendary': return { 
          color: '#fbbf24', 
          bg: 'bg-[#78350f]', 
          border: 'border-amber-400', 
          shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
          label: 'Legendary'
      };
      case 'jackpot': return { 
          color: '#f59e0b', 
          bg: 'bg-gradient-to-br from-red-600 to-yellow-600', 
          border: 'border-yellow-200', 
          shadow: 'shadow-[0_0_40px_rgba(234,179,8,0.8)]',
          label: 'JACKPOT'
      };
      default: return { color: '#fff', bg: 'bg-slate-800', border: 'border-slate-700', shadow: '', label: '' };
    }
};

// --- COMPONENTS ---

// 1. Thẻ bài trong vòng quay
const SpinCard = ({ item }: { item: StripItem }) => {
    const config = getRarityConfig(item.rarity);
    
    return (
        <div 
            className="flex-shrink-0 flex items-center justify-center relative group"
            style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
        >
            <div className={`
                relative w-full aspect-[3/4] rounded-xl overflow-hidden
                flex flex-col items-center justify-between p-1
                border-2 ${config.border} bg-slate-900
                transition-transform duration-300
                ${config.shadow}
            `}>
                {/* Background Gradient & Glow */}
                <div className={`absolute inset-0 opacity-20 ${config.bg}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5"></div>
                
                {/* Top Label */}
                <div className="relative z-10 w-full text-center py-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm" style={{ color: config.color }}>
                        {config.label}
                    </span>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="relative">
                        {/* Glow behind icon */}
                        <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: config.color }}></div>
                        {typeof item.icon === 'string' ? (
                            <img src={item.icon} alt={item.name} className="relative w-12 h-12 object-contain drop-shadow-md transform group-hover:scale-110 transition-transform" />
                        ) : (
                            <item.icon className={`relative w-12 h-12 ${item.color} drop-shadow-md transform group-hover:scale-110 transition-transform`} />
                        )}
                    </div>
                </div>

                {/* Value / Bottom Plate */}
                <div className="relative z-10 w-full bg-slate-950/80 rounded-lg py-2 text-center border-t border-white/10 mt-1">
                    <div className="text-sm font-black text-white leading-none">
                        {item.rarity === 'jackpot' ? 'ALL IN' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                    </div>
                    {item.rarity !== 'jackpot' && (
                         <div className="text-[9px] text-slate-400 uppercase mt-0.5">{item.name}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. Popup Phần thưởng
const RewardPopup = ({ item, jackpotWon, onClose }: { item: Item; jackpotWon: boolean; onClose: () => void }) => {
    const config = getRarityConfig(item.rarity);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Có thể thêm âm thanh win ở đây
    }, []);

    return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-sm bg-[#0f172a] border-2 rounded-3xl shadow-2xl animate-bounce-in flex flex-col items-center p-8 text-center overflow-hidden
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.4)]' : `border-${config.color}`}`
        }
        style={{ borderColor: config.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Rays Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-white/10 to-transparent opacity-50 animate-spin-slow"></div>
        </div>

        {/* Title */}
        <div className="relative z-10">
            <h2 className="text-3xl font-black italic tracking-wider uppercase mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" style={{ color: jackpotWon ? '#facc15' : config.color }}>
                {jackpotWon ? 'JACKPOT WIN!' : 'CONGRATS!'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">Bạn đã nhận được phần thưởng</p>
        </div>

        {/* Big Icon */}
        <div className="relative z-10 my-8 animate-float">
             <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ backgroundColor: config.color }}></div>
             <div className={`w-32 h-32 rounded-3xl flex items-center justify-center bg-slate-800/50 border-4 shadow-2xl backdrop-blur-xl`} style={{ borderColor: config.color }}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-20 h-20 object-contain" />
                ) : (
                    <item.icon className={`w-20 h-20 ${item.color}`} />
                )}
             </div>
        </div>

        {/* Value Box */}
        <div className="relative z-10 bg-slate-800/80 w-full rounded-xl p-4 border border-slate-700 mb-6">
             <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Giá trị</div>
             <div className="flex items-center justify-center gap-2">
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
        
        <button
          onClick={onClose}
          className="relative z-10 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl font-bold text-white text-lg tracking-wider uppercase shadow-lg transform active:scale-95 transition-all"
        >
          Thu Nhập
        </button>
      </div>
    </div>
    );
};

// --- MAIN GAME COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  // State
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);
  const [history, setHistory] = useState<Item[]>([]); // Lưu lịch sử quay gần đây

  // Spinner Logic State
  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionTime, setTransitionTime] = useState(0);
  
  // Refs
  const spinnerRef = useRef<HTMLDivElement>(null);

  // Items Database
  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Big Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Pickaxe', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 3 },
    { icon: pickaxeIconUrl, name: 'Pickaxe Box', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'common', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
  ], []);

  // Helpers
  const getRandomFiller = useCallback(() => {
    const fillerItems = items.filter(i => i.rarity !== 'jackpot' && i.rarity !== 'legendary');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [items]);

  // Init Strip
  useEffect(() => {
    const initStrip: StripItem[] = [];
    for(let i=0; i<VISIBLE_CARDS + 2; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${i}` });
    }
    setStrip(initStrip);
  }, [getRandomFiller]);

  // Spin Function
  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100) return;

    // 1. Deduct Cost & Update Pool
    onUpdateCoins(-100);
    const poolContribution = Math.floor(Math.random() * 20) + 10;
    onUpdateJackpotPool(poolContribution);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // 2. Determine Winner (Weighted Probability)
    const rand = Math.random();
    let winner: Item;
    
    if (rand < 0.005) winner = items.find(i => i.rarity === 'jackpot')!; // 0.5%
    else if (rand < 0.02) winner = items.find(i => i.rarity === 'legendary')!; // 1.5%
    else if (rand < 0.10) winner = items.filter(i => i.rarity === 'epic')[Math.floor(Math.random() * items.filter(i => i.rarity === 'epic').length)];
    else if (rand < 0.30) winner = items.filter(i => i.rarity === 'rare')[Math.floor(Math.random() * items.filter(i => i.rarity === 'rare').length)];
    else winner = items.filter(i => ['common', 'uncommon'].includes(i.rarity))[Math.floor(Math.random() * items.filter(i => ['common', 'uncommon'].includes(i.rarity)).length)];

    if (!winner) winner = items[0]; // Fallback

    // 3. Build Strip
    const newStrip: StripItem[] = [];
    // Pre-winner items
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `pre-${Date.now()}-${i}` });
    }
    // Winner
    newStrip.push({ ...winner, uniqueId: `WINNER-${Date.now()}` });
    // Post-winner items
    for (let i = 0; i < 10; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `post-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionTime(0);
    setOffset(0); // Reset position instantly

    // 4. Trigger Animation
    // Wait a frame for DOM to update with new strip at 0px
    requestAnimationFrame(() => {
        setTimeout(() => {
            // Calculate pixel offset
            // We want the winner (index: TARGET_INDEX) to be centered.
            // Center of Container
            // Assuming the container is roughly flexible, but let's base it on card widths.
            // Logic: Move Strip Left so that Winner Center aligns with Viewport Center.
            
            // X position of Winner Center relative to start of strip
            const winnerCenterX = (TARGET_INDEX * ITEM_FULL_WIDTH) + (CARD_WIDTH / 2);
            
            // Viewport Center (Assume Viewport shows VISIBLE_CARDS)
            // But usually we just center the spinner via CSS flexbox, so "center" is 0 if we translate relative to center?
            // Let's stick to the absolute offset method.
            // Viewport Width approx = VISIBLE_CARDS * ITEM_FULL_WIDTH.
            const viewportCenter = (VISIBLE_CARDS * ITEM_FULL_WIDTH) / 2; 

            // Final Offset = -(WinnerCenter - ViewportCenter)
            // Add a tiny random jitter within the card width (-40% to +40%) to make it look organic
            const jitter = (Math.random() - 0.5) * (CARD_WIDTH * 0.6);
            
            const finalOffset = -(winnerCenterX - viewportCenter) + jitter;

            setTransitionTime(4.5); // Spin duration
            setOffset(finalOffset);

            // 5. Handle Finish
            setTimeout(() => {
                setIsSpinning(false);
                handleWin(winner);
            }, 4600); // Slightly longer than transition to be safe
        }, 50);
    });

  }, [isSpinning, currentCoins, items, onUpdateCoins, onUpdateJackpotPool, getRandomFiller]);

  const handleWin = (winner: Item) => {
      let actualValue = winner.value;
      
      if (winner.rarity === 'jackpot') {
          actualValue = currentJackpotPool;
          setJackpotWon(true);
          onUpdateCoins(actualValue);
          onUpdateJackpotPool(0, true);
      } else if (winner.rewardType === 'pickaxe' && winner.rewardAmount) {
          onUpdatePickaxes(winner.rewardAmount);
          actualValue = winner.rewardAmount;
      } else if (winner.rewardType === 'coin') {
          onUpdateCoins(winner.value);
      }

      setWonRewardDetails({ ...winner, value: actualValue });
      setHistory(prev => [winner, ...prev].slice(0, 3)); // Keep last 3
      setShowRewardPopup(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] font-sans flex flex-col overflow-hidden">
      
      {/* --- Background VFX --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_80%)] opacity-80" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* --- HEADER --- */}
      <header className="relative w-full flex items-center justify-between py-4 px-6 bg-slate-950/50 backdrop-blur-md border-b border-white/5 z-20">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
          <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-white" />
          <span className="text-sm font-semibold text-slate-400 group-hover:text-white">Thoát</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      {/* --- GAME AREA --- */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* JACKPOT DISPLAY */}
        <div className="mb-10 w-full max-w-lg z-10 text-center transform transition-transform hover:scale-105">
            <div className="relative group">
                {/* Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                
                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-4 overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                     
                     <div className="text-yellow-500 text-xs font-bold tracking-[0.2em] mb-1 uppercase">Community Jackpot</div>
                     <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2 drop-shadow-xl font-lilita">
                        {currentJackpotPool.toLocaleString()}
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10" />
                     </div>
                </div>
            </div>
        </div>
        
        {/* --- THE SPINNER MACHINE --- */}
        <div className="relative w-full max-w-5xl mb-12">
            
            {/* Machine Frame Top */}
            <div className="flex justify-between items-end px-4 pb-1">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                    <div className="text-[10px] text-red-400 font-mono">LIVE</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">RNG CERTIFIED</div>
            </div>

            {/* Spinner Window */}
            <div className="relative h-64 w-full bg-[#020617] rounded-xl border-y-4 border-slate-800 shadow-2xl overflow-hidden group">
                
                {/* Side Fade Gradients (Masks) */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none"></div>
                
                {/* The Strip Container */}
                <div 
                    ref={spinnerRef}
                    className="absolute top-0 bottom-0 flex items-center pl-[50%] will-change-transform"
                    style={{
                        transform: `translateX(calc(${offset}px - ${ITEM_FULL_WIDTH/2}px))`, // Subtract half item width to center first item visually if needed
                        transition: isSpinning ? `transform ${transitionTime}s cubic-bezier(0.1, 0.7, 0.1, 1)` : 'none',
                    }}
                >
                    {strip.map((item) => (
                        <SpinCard key={item.uniqueId} item={item} />
                    ))}
                </div>

                {/* --- CENTER POINTER (THE LASER) --- */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 z-30 pointer-events-none">
                    <div className="h-full w-full bg-yellow-400 shadow-[0_0_15px_#facc15] opacity-80"></div>
                    {/* Top Triangle */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-20%] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-500 drop-shadow-md"></div>
                    {/* Bottom Triangle */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-yellow-500 drop-shadow-md"></div>
                </div>

                {/* Glass Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20 rounded-xl"></div>
            </div>

            {/* Machine Frame Bottom */}
            <div className="flex justify-center mt-2">
                 <div className="h-1 w-1/3 bg-slate-800 rounded-full"></div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center gap-6 z-20">
            {/* History Bar */}
            {history.length > 0 && (
                <div className="flex items-center gap-3 animate-fade-in">
                    <span className="text-xs text-slate-500 font-bold uppercase mr-2">Gần đây:</span>
                    {history.map((h, i) => (
                        <div key={i} className={`w-8 h-8 rounded border flex items-center justify-center bg-slate-800 ${getRarityConfig(h.rarity).border}`}>
                            {typeof h.icon === 'string' ? <img src={h.icon} className="w-5 h-5" /> : <h.icon className={`w-5 h-5 ${h.color}`} />}
                        </div>
                    ))}
                </div>
            )}

            {/* Spin Button */}
            <button
            onClick={spinChest}
            disabled={isSpinning || currentCoins < 100}
            className="group relative w-64 h-20 rounded-2xl bg-slate-900 overflow-hidden transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:enabled:scale-105 active:enabled:scale-95 shadow-2xl"
            >
            {/* Button Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 transition-opacity duration-300 ${isSpinning ? 'opacity-20' : 'opacity-100'}`}></div>
            
            {/* Scanning Line Effect */}
            <div className={`absolute top-0 bottom-0 w-2 bg-white/30 blur-md transform -skew-x-12 transition-transform duration-1000 ${isSpinning ? 'translate-x-64' : '-translate-x-10 group-hover:translate-x-72'}`}></div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                {isSpinning ? (
                        <span className="font-lilita text-xl tracking-widest animate-pulse">QUAY...</span>
                ) : (
                    <>
                        <span className="font-lilita text-3xl uppercase tracking-widest drop-shadow-md">QUAY NGAY</span>
                        <div className="flex items-center gap-1.5 bg-black/30 px-3 py-0.5 rounded-full mt-1 border border-white/10">
                            <span className={`text-sm font-bold ${currentCoins < 100 ? 'text-red-300' : 'text-yellow-300'}`}>100</span>
                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                        </div>
                    </>
                )}
            </div>
            </button>
            
            {/* Error Message */}
            {currentCoins < 100 && !isSpinning && (
                <div className="text-red-400 text-sm font-semibold bg-red-950/40 px-4 py-2 rounded-lg border border-red-500/30 animate-bounce">
                    Không đủ xu! Cần 100 xu để quay.
                </div>
            )}
        </div>

      </div>

      {showRewardPopup && wonRewardDetails && ( 
          <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> 
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        
        @keyframes bounce-in { 
            0% { opacity: 0; transform: scale(0.3); } 
            50% { opacity: 1; transform: scale(1.05); } 
            70% { transform: scale(0.9); }
            100% { transform: scale(1); } 
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @keyframes spin-slow { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
