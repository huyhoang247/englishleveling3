import React, { useState, useCallback, useMemo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- SVG ICONS (Giữ nguyên logic cũ nhưng style lại class nếu cần) ---
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin"
        className={className}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=$'; }}
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

// --- COLOR UTILS ---
const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#94a3b8'; // slate-400
      case 'uncommon': return '#2dd4bf'; // teal-400
      case 'rare': return '#38bdf8'; // sky-400
      case 'epic': return '#a78bfa'; // violet-400
      case 'legendary': return '#fbbf24'; // amber-400
      case 'jackpot': return '#f59e0b'; // amber-500
      default: return '#94a3b8';
    }
};

const getRarityGradient = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'from-slate-700 to-slate-800';
      case 'uncommon': return 'from-teal-900/80 to-slate-800';
      case 'rare': return 'from-sky-900/80 to-slate-800';
      case 'epic': return 'from-violet-900/80 to-slate-800';
      case 'legendary': return 'from-amber-900/80 to-slate-800';
      case 'jackpot': return 'from-red-900/80 via-yellow-700/50 to-slate-800';
      default: return 'from-slate-700 to-slate-800';
    }
};

// --- COMPONENTS ---

// 1. Popup nhận thưởng (Được làm mới, backdrop blur mạnh hơn, icon to hơn)
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);
    const isJackpot = jackpotWon || item.rarity === 'jackpot';

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ perspective: '1000px' }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-sm bg-[#121218] border-2 rounded-2xl shadow-2xl animate-pop-in flex flex-col items-center p-8 text-center overflow-hidden
            ${isJackpot ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 'border-slate-700 shadow-xl'}`
        }
      >
        {/* Background rays effect */}
        <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r ${isJackpot ? 'from-yellow-500 to-red-600' : 'from-indigo-500 to-purple-600'} rounded-full blur-3xl animate-pulse-slow`}></div>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all z-20">✕</button>
        
        {isJackpot ? (
          <>
            <div className="relative z-10 mb-4">
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png" alt="Jackpot" className="w-32 h-32 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce-subtle" />
            </div>
            <h2 className="relative z-10 text-4xl font-lilita text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-1 uppercase drop-shadow-sm">JACKPOT!</h2>
            <p className="relative z-10 font-medium text-yellow-100/80 text-sm mb-6">Bạn đã trúng toàn bộ quỹ thưởng!</p>
            
            <div className="relative z-10 flex flex-col items-center justify-center bg-black/40 w-full py-4 rounded-xl border border-yellow-500/30 mb-6">
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Tổng Nhận</span>
                <div className="flex items-center gap-2">
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                    <span className="text-4xl font-lilita text-yellow-300 drop-shadow-md">{item.value.toLocaleString()}</span>
                </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="relative z-10 text-xl font-bold uppercase mb-6 tracking-widest" style={{ color: rarityColor }}>Chúc mừng!</h2>

            <div className="relative z-10 mb-6 group">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="relative w-28 h-28 mx-auto drop-shadow-2xl animate-float" />
                ) : (
                    <item.icon className={`relative w-28 h-28 ${item.color} mx-auto drop-shadow-2xl animate-float`} />
                )}
            </div>
            
            <p className="relative z-10 font-lilita text-2xl uppercase tracking-wide mb-2 text-white">
               {item.name || 'Phần Thưởng'}
            </p>
            <p className="relative z-10 text-sm font-bold uppercase tracking-widest opacity-80 mb-6" style={{ color: rarityColor }}>
                {item.rarity}
            </p>

            <div className="relative z-10 flex items-center justify-center gap-2 bg-white/5 w-full py-3 rounded-xl border border-white/10 mb-6">
                 {item.rewardType === 'coin' ? (
                    <>
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-6 h-6" />
                        <span className="text-2xl font-lilita text-yellow-400">{item.value.toLocaleString()}</span>
                    </>
                 ) : (
                    <>
                        <span className="text-xl text-slate-300 font-bold">Số lượng:</span>
                        <span className="text-2xl font-lilita text-white">x{item.rewardAmount?.toLocaleString()}</span>
                    </>
                 )}
            </div>
          </>
        )}
        
        <button
          onClick={onClose}
          className="relative z-10 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/50 transform transition-all active:scale-95"
        >
          TIẾP TỤC
        </button>
      </div>
    </div>
    );
};

// 2. Wheel Grid - Phần quan trọng nhất
interface SpinningWheelGridProps {
  items: Item[];
  itemPositionsOnWheel: { row: number; col: number }[];
  selectedIndex: number;
  isSpinning: boolean;
  hasSpun: boolean;
  finalLandedItemIndex: number;
}

const SpinningWheelGrid = React.memo(({
  items,
  itemPositionsOnWheel,
  selectedIndex,
  isSpinning,
  hasSpun,
  finalLandedItemIndex,
}: SpinningWheelGridProps) => {
  // Tạo mảng lưới 4x4
  const grid: ({ item: Item; isWheelItem: boolean } | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
    if (indexOnWheel < items.length && items[indexOnWheel]) {
      grid[pos.row][pos.col] = { item: items[indexOnWheel], isWheelItem: true };
    }
  });

  return (
    <div className="relative p-3 rounded-[2rem] bg-[#1a1b26] shadow-2xl border-4 border-[#2e2f3e]">
      {/* Decorative screws/lights */}
      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-600 shadow-inner"></div>
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-600 shadow-inner"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-600 shadow-inner"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-600 shadow-inner"></div>

      <div className="grid grid-cols-4 gap-2 bg-[#0f0f13] p-2 rounded-2xl shadow-inner-black">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Center Piece (Chest)
            if (rowIndex === 1 && colIndex === 1) {
              return (
                <div key={`chest-center`} className="col-span-2 row-span-2 relative flex items-center justify-center">
                   {/* Pedestal effect */}
                   <div className="absolute inset-2 bg-gradient-to-b from-[#2a2b3d] to-[#151620] rounded-full border border-slate-700/50 shadow-lg"></div>
                   <div className={`absolute inset-0 bg-blue-500/20 rounded-full filter blur-xl animate-pulse-slow ${isSpinning ? 'opacity-80' : 'opacity-30'}`}></div>
                   
                   <img 
                      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest.png" 
                      alt="Chest" 
                      className={`relative w-28 h-28 z-10 drop-shadow-2xl transition-transform duration-300 ${isSpinning ? 'animate-shake scale-105' : 'hover:scale-105'}`}
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/cccccc/000000?text=Chest'; }}
                   />
                </div>
              );
            }
            if ((rowIndex === 1 && colIndex === 2) || (rowIndex === 2 && colIndex === 1) || (rowIndex === 2 && colIndex === 2)) return null;

            // Render Item Cells
            if (cell && cell.isWheelItem) {
              const item = cell.item;
              const wheelIndex = itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
              const isSelected = isSpinning && selectedIndex === wheelIndex;
              const isLandedOn = !isSpinning && hasSpun && finalLandedItemIndex === wheelIndex;
              const rarityColor = getRarityColor(item.rarity);
              const bgGradient = getRarityGradient(item.rarity);

              // Classes for active/inactive states
              const activeClass = isSelected 
                ? 'scale-[1.05] z-20 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.6)] brightness-110' 
                : 'scale-100 opacity-90 hover:opacity-100 hover:scale-[1.02]';
              
              const landedClass = isLandedOn 
                ? 'scale-110 z-30 ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-winner-pulse brightness-125' 
                : '';

              return (
                <div key={`${rowIndex}-${colIndex}`} className="relative aspect-square">
                    <div 
                        className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-150 ease-out border border-white/5 
                        bg-gradient-to-br ${bgGradient} ${activeClass} ${landedClass}`}
                    >
                        {/* Glow effect for Rare+ items */}
                        {['epic', 'legendary', 'jackpot'].includes(item.rarity) && (
                            <div className="absolute inset-0 bg-white/5 rounded-xl animate-pulse-slow" />
                        )}

                        <div className="relative z-10 flex flex-col items-center gap-1">
                            {typeof item.icon === 'string' ? (
                                <img src={item.icon} alt={item.name} className="w-9 h-9 drop-shadow-md object-contain" />
                            ) : (
                                <item.icon className={`w-9 h-9 ${item.color} drop-shadow-md`} />
                            )}

                            {item.rarity === 'jackpot' ? (
                                <span className="text-[10px] font-black text-yellow-300 uppercase tracking-tighter">JACKPOT</span>
                            ) : (
                                <span className={`text-xs font-bold font-lilita ${item.rewardType === 'coin' ? 'text-yellow-400' : 'text-slate-200'}`}>
                                    {item.rewardType === 'coin' ? item.value : `x${item.rewardAmount}`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
              );
            }
            return <div key={`empty-${rowIndex}-${colIndex}`} className="aspect-square"></div>;
          })
        )}
      </div>
    </div>
  );
});

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1);
  const [hasSpun, setHasSpun] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // Config Items
  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Vàng nhỏ', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Năng lượng', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Cúp gỗ', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Vàng vừa', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: 'Cúp đá', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: 'Cúp sắt', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Vàng lớn', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Mạng sống', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Bí ẩn', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Vàng tí hon', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  const itemPositionsOnWheel = useMemo(() => [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
    { row: 1, col: 3 }, { row: 2, col: 3 },
    { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
    { row: 2, col: 0 }, { row: 1, col: 0 }
  ], []);

  const NUM_WHEEL_SLOTS = itemPositionsOnWheel.length;

  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100) return;
    
    // Deduct & Update Pool
    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * 91) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);

    // Reset States
    setIsSpinning(true);
    setSelectedIndex(0); // Start from 0
    setFinalLandedItemIndex(-1);
    setHasSpun(false);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // Determine Result
    const jackpotItemIndex = items.findIndex(item => item.rarity === 'jackpot');
    let targetIndex: number;
    
    // 1% Chance for Jackpot (Simulated)
    if (jackpotItemIndex !== -1 && Math.random() < 0.01) {
        targetIndex = jackpotItemIndex;
    } else {
        const otherIndices = Array.from({ length: NUM_WHEEL_SLOTS }, (_, i) => i).filter(i => i !== jackpotItemIndex);
        targetIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
    }
    
    setFinalLandedItemIndex(targetIndex);

    // Animation Logic
    const fullRotations = 3; 
    const totalSteps = (NUM_WHEEL_SLOTS * fullRotations) + targetIndex;
    let currentStep = 0;

    const runStep = () => {
        // Calculate speed curve
        const stepsRemaining = totalSteps - currentStep;
        let speed = 50; // Fast base speed
        
        if (stepsRemaining < 20) speed += (20 - stepsRemaining) * 15; // Slow down gradually
        if (stepsRemaining < 5) speed += (5 - stepsRemaining) * 50; // Super slow at end

        setSelectedIndex(currentStep % NUM_WHEEL_SLOTS);

        if (currentStep < totalSteps) {
            currentStep++;
            setTimeout(runStep, speed);
        } else {
             // Finished
             setTimeout(() => {
                setIsSpinning(false);
                setHasSpun(true);
                
                const resultItem = items[targetIndex];
                let finalValue = resultItem.value;

                if (resultItem.rarity === 'jackpot') {
                    finalValue = currentJackpotPool;
                    setJackpotWon(true);
                    onUpdateJackpotPool(0, true);
                }
                
                if (resultItem.rewardType === 'coin' || resultItem.rarity === 'jackpot') {
                    onUpdateCoins(finalValue);
                } else if (resultItem.rewardType === 'pickaxe' && resultItem.rewardAmount) {
                    onUpdatePickaxes(resultItem.rewardAmount);
                }

                setWonRewardDetails({ ...resultItem, value: finalValue });
                setShowRewardPopup(true);
            }, 500); // Small pause before popup
        }
    };

    runStep();

  }, [isSpinning, currentCoins, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, items, NUM_WHEEL_SLOTS, currentJackpotPool]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101018] to-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="z-10 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/5">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-slate-300">
          <HomeIcon className="w-4 h-4" /> <span>Trang chủ</span>
        </button>
        <CoinDisplay displayedCoins={currentCoins} isStatsFullscreen={isStatsFullscreen} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* Jackpot Display - Style LED Neon */}
        <div className="w-full max-w-md mb-8 relative group">
             <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500"></div>
             <div className="relative bg-gradient-to-r from-red-900 via-slate-900 to-red-900 border-2 border-yellow-600/50 rounded-xl p-4 flex flex-col items-center shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-yellow-600 rounded-full border border-yellow-400 shadow-lg z-10">
                    <span className="text-xs font-black text-yellow-950 uppercase tracking-widest">Jackpot Pool</span>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-10 h-10 drop-shadow-md animate-bounce-subtle" />
                    <span className="font-lilita text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{textShadow: '0 0 20px rgba(234,179,8,0.4)'}}>
                        {currentJackpotPool.toLocaleString()}
                    </span>
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             </div>
        </div>

        {/* Wheel Grid */}
        <div className="mb-8 scale-95 sm:scale-100">
            <SpinningWheelGrid
                items={items}
                itemPositionsOnWheel={itemPositionsOnWheel}
                selectedIndex={selectedIndex}
                isSpinning={isSpinning}
                hasSpun={hasSpun}
                finalLandedItemIndex={finalLandedItemIndex}
            />
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-2 z-10">
            <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className="group relative w-48 h-16 active:h-[3.8rem] active:mt-[0.2rem] transition-all duration-75 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {/* 3D Button Structure */}
                <div className="absolute inset-0 bg-[#0f172a] rounded-2xl translate-y-2 group-hover:translate-y-2.5 transition-transform shadow-xl"></div>
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center border-b-4 border-r-2 
                    ${currentCoins >= 100 
                        ? 'bg-gradient-to-b from-cyan-500 to-blue-600 border-blue-900 group-hover:translate-y-1 group-active:translate-y-2' 
                        : 'bg-slate-700 border-slate-900 grayscale'}
                     transition-all duration-75`}
                >
                    {isSpinning ? (
                         <div className="flex items-center gap-2">
                             <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <span className="font-bold text-white uppercase tracking-wider">Đang quay...</span>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center leading-none mt-1">
                            <span className="font-lilita text-2xl text-white tracking-widest drop-shadow-md">QUAY NGAY</span>
                            <div className="flex items-center gap-1 opacity-90">
                                <span className="text-sm font-bold text-blue-100">100</span>
                                <CoinsIcon className="w-3 h-3 text-yellow-300" />
                            </div>
                        </div>
                    )}
                </div>
            </button>
            
            {currentCoins < 100 && !isSpinning && (
                <div className="px-3 py-1 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-xs font-bold animate-pulse">
                    Không đủ vàng!
                </div>
            )}
        </div>

      </main>

      {showRewardPopup && wonRewardDetails && (
        <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} />
      )}

      {/* Global CSS Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        
        .shadow-inner-black { box-shadow: inset 0 2px 10px 0 rgba(0,0,0,0.8); }
        
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        @keyframes pop-in { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        @keyframes winner-pulse { 0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(250, 204, 21, 0); } 100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); } }
        .animate-winner-pulse { animation: winner-pulse 1.5s infinite; }
        
        @keyframes shake { 0% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
