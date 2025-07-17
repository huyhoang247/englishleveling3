import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoinDisplay from './coin-display.tsx';

// SVG Icons
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
  value: number; // For coins or general value display in history
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  timestamp?: number;
  rewardType?: 'coin' | 'pickaxe' | 'other';
  rewardAmount?: number; // The actual amount of the reward type
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

// --- UTILITY FUNCTIONS for STYLING ---
const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; // gray-400
      case 'uncommon': return '#34d399'; // emerald-400
      case 'rare': return '#38bdf8'; // sky-400
      case 'epic': return '#a78bfa'; // violet-400
      case 'legendary': return '#fbbf24'; // amber-400
      case 'jackpot': return '#f59e0b'; // amber-500
      default: return '#9ca3af';
    }
};
const getRarityGlow = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'shadow-gray-500/50';
      case 'uncommon': return 'shadow-emerald-500/50';
      case 'rare': return 'shadow-sky-500/50';
      case 'epic': return 'shadow-violet-500/50';
      case 'legendary': return 'shadow-amber-400/60';
      case 'jackpot': return 'shadow-yellow-400/80';
      default: return 'shadow-gray-500/50';
    }
}
const getRarityBg = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-slate-800/60 border-slate-700';
      case 'uncommon': return 'bg-emerald-800/50 border-emerald-700';
      case 'rare': return 'bg-sky-800/50 border-sky-700';
      case 'epic': return 'bg-violet-800/50 border-violet-700';
      case 'legendary': return 'bg-amber-700/40 border-amber-600';
      case 'jackpot': return 'bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600 border-4 border-yellow-300';
      default: return 'bg-slate-800/60 border-slate-700';
    }
};

// --- Reward Popup Component (REDESIGNED) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-80 bg-slate-900/80 border rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center
            ${jackpotWon ? 'border-yellow-500/30 shadow-yellow-500/10' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        
        {jackpotWon ? (
          <>
            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png" alt="Jackpot" className="w-20 h-20 mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)] animate-bounce-subtle" />
            <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-2 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>JACKPOT!</h2>
            <p className="font-sans text-yellow-100/80 text-base mb-4">Bạn đã trúng toàn bộ Jackpot Pool!</p>
            
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-full py-2.5 rounded-lg border border-slate-700 mb-6">
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
                <span className="text-3xl font-bold text-yellow-300 text-shadow-sm">{item.value.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold uppercase mb-4 text-shadow" style={{ color: rarityColor }}>You got</h2>

            <div className="mb-4">
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-20 h-20 mx-auto drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80/cccccc/000000?text=Lỗi'; }} />
                ) : (
                    <item.icon className={`w-20 h-20 ${item.color} mx-auto drop-shadow-lg`} />
                )}
            </div>

            <p className="text-2xl font-bold text-slate-100 mb-1 tracking-wide min-h-[32px]">{item.name}</p>
            <p className="font-sans text-sm uppercase font-bold tracking-widest mb-4" style={{ color: rarityColor }}>
                {item.rarity}
            </p>

            {item.rewardType === 'coin' && item.value > 0 && (
                <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-40 py-1.5 rounded-lg border border-slate-700 mb-6">
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-300 text-shadow-sm">+{item.value.toLocaleString()}</span>
                </div>
            )}
            {item.rewardType === 'pickaxe' && item.rewardAmount && item.rewardAmount > 0 && (
                <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-40 py-1.5 rounded-lg border border-slate-700 mb-6">
                    <PickaxeIcon className="w-5 h-5" />
                    <span className="text-xl font-bold text-slate-200 text-shadow-sm">+{item.rewardAmount.toLocaleString()}</span>
                </div>
            )}
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-auto px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
    );
};


// --- REFINED CHILD COMPONENT: SpinningWheelGrid ---
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
  const grid: ({ item: Item; isWheelItem: boolean } | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));

  itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
    if (indexOnWheel < items.length && items[indexOnWheel]) {
      grid[pos.row][pos.col] = {
        item: items[indexOnWheel],
        isWheelItem: true,
      };
    }
  });

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Center Piece
          if (rowIndex === 1 && colIndex === 1) {
            return (
              <div key={`chest-pedestal`} className="col-span-2 row-span-2 flex items-center justify-center rounded-full bg-slate-800/80 relative shadow-inner-strong">
                <div className="absolute inset-0 bg-radial-glow animate-glow-pulse z-0"></div>
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest.png" alt="Treasure Chest" className={`w-24 h-24 transform transition-transform duration-500 z-10 drop-shadow-2xl ${isSpinning ? 'animate-bounce-subtle' : ''}`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/cccccc/000000?text=Lỗi'; }}/>
              </div>
            );
          }
          if ((rowIndex === 1 && colIndex === 2) || (rowIndex === 2 && colIndex === 1) || (rowIndex === 2 && colIndex === 2)) {
            return null;
          }

          if (cell && cell.isWheelItem) {
            const item = cell.item;
            const wheelIndexOfCurrentCell = itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
            const isSelected = isSpinning && selectedIndex === wheelIndexOfCurrentCell;
            const isLandedOn = !isSpinning && hasSpun && finalLandedItemIndex === wheelIndexOfCurrentCell;

            const rarityColor = getRarityColor(item.rarity);
            const rarityGlow = getRarityGlow(item.rarity);
            
            const isHighlighted = isSelected || isLandedOn;

            return (
              <div key={`item-border-${rowIndex}-${colIndex}`} style={{ '--rarity-color': rarityColor } as React.CSSProperties} className={`group item-cell-shape aspect-square p-[2px] shadow-lg relative transition-all duration-200 ${isSelected ? `scale-110 z-20 shadow-2xl ${rarityGlow} animate-pulse-bright` : ''} ${isLandedOn ? 'scale-110 z-30' : 'hover:scale-105 hover:z-20'} ${isHighlighted ? 'bg-gradient-to-br from-[var(--rarity-color)] via-slate-500 to-[var(--rarity-color)]' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}>
                <div className="item-cell-shape w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-1 relative overflow-hidden">
                    {isLandedOn && ( <div className={`absolute inset-0 z-20 animate-landed-flash`} style={{ background: `radial-gradient(circle, ${rarityColor}33 0%, transparent 70%)` }}></div> )}
                    {isLandedOn && item.rarity === 'jackpot' && ( <div className="absolute inset-0 z-20 animate-jackpot-celebrate" style={{'--jackpot-color': rarityColor}}></div> )}
                    
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                        {typeof item.icon === 'string' ? (
                            <img src={item.icon} alt={item.name} className="w-8 h-8 drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'https://placehold.co/32x32/cccccc/000000?text=Lỗi'; }} />
                        ) : (
                            <item.icon className={`w-8 h-8 ${item.color} drop-shadow-lg`} />
                        )}

                        {item.rarity !== 'jackpot' && typeof item.rewardAmount === 'number' && (
                            <span className="text-xs font-bold text-center text-amber-300">
                                {item.rewardType === 'coin' ? item.rewardAmount : `x${item.rewardAmount}`}
                            </span>
                        )}
                        {item.rarity === 'jackpot' && (
                            <span className="text-xs font-black uppercase text-yellow-300">JACKPOT</span>
                        )}
                    </div>

                    <div className="absolute inset-0 item-cell-shape opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 50%, ${rarityColor}20, transparent 70%)` }}></div>
                </div>
              </div>
            );
          }

          return <div key={`empty-outer-${rowIndex}-${colIndex}`} className="aspect-square bg-transparent"></div>;
        })
      )}
    </div>
  );
});


// --- MAIN PARENT COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1);
  const [hasSpun, setHasSpun] = useState(false);
  const [rewardHistory, setRewardHistory] = useState<Item[]>([]);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'spin' | 'history'>('spin');
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '150', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Tia chớp', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: '5', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '300', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: '10', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: '15', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '500', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Trái tim', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '100', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
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
    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);
    setIsSpinning(true);
    setSelectedIndex(-1);
    setFinalLandedItemIndex(-1);
    setHasSpun(false);
    setJackpotWon(false);
    setShowRewardPopup(false);
    let targetLandedItemIndex: number;
    const jackpotItemArrayIndex = items.findIndex(item => item.rarity === 'jackpot');
    if (jackpotItemArrayIndex >= 0 && jackpotItemArrayIndex < NUM_WHEEL_SLOTS && Math.random() < 0.01) {
        targetLandedItemIndex = jackpotItemArrayIndex;
    } else {
        const otherItemIndicesOnWheel = Array.from({ length: NUM_WHEEL_SLOTS }, (_, i) => i).filter(i => i !== jackpotItemArrayIndex);
        if (otherItemIndicesOnWheel.length > 0) {
            targetLandedItemIndex = otherItemIndicesOnWheel[Math.floor(Math.random() * otherItemIndicesOnWheel.length)];
        } else {
            targetLandedItemIndex = 0;
        }
    }
    setFinalLandedItemIndex(targetLandedItemIndex);
    const numFullRotations = 2;
    const totalVisualSteps = (NUM_WHEEL_SLOTS * numFullRotations) + targetLandedItemIndex;
    let currentVisualStepIndex = 0;
    const finalPauseDuration = 700;
    const spinAnimation = () => {
      const currentHighlightIndex = currentVisualStepIndex % NUM_WHEEL_SLOTS;
      setSelectedIndex(currentHighlightIndex);
      if (currentVisualStepIndex < totalVisualSteps) {
        const remainingVisualSteps = totalVisualSteps - currentVisualStepIndex;
        const fastSpeed = 50; const moderateSpeed = 120; const finalSlowdownSpeeds = [650, 500, 400, 300, 220, 160];
        let currentSpeed;
        if (remainingVisualSteps <= finalSlowdownSpeeds.length) {
          currentSpeed = finalSlowdownSpeeds[remainingVisualSteps - 1];
        } else if (remainingVisualSteps <= NUM_WHEEL_SLOTS + Math.floor(NUM_WHEEL_SLOTS / 2)) {
          currentSpeed = moderateSpeed;
        } else {
          currentSpeed = fastSpeed;
        }
        currentVisualStepIndex++;
        setTimeout(spinAnimation, currentSpeed);
      } else {
        setTimeout(() => {
          setIsSpinning(false); setHasSpun(true);
          const wonItem = { ...items[targetLandedItemIndex], timestamp: Date.now() };
          setRewardHistory(prev => [wonItem, ...prev].slice(0, 10)); 
          
          let actualWonValue = 0;
          let popupDisplayName = wonItem.name;

          if (wonItem.rewardType === 'pickaxe' && wonItem.rewardAmount) {
            onUpdatePickaxes(wonItem.rewardAmount);
            actualWonValue = wonItem.rewardAmount;
            popupDisplayName = ""; // Hide name in popup
          } else if (wonItem.rarity === 'jackpot') {
            actualWonValue = currentJackpotPool;
            setJackpotWon(true); setJackpotAnimation(true);
            onUpdateCoins(actualWonValue);
            onUpdateJackpotPool(0, true);
            setTimeout(() => setJackpotAnimation(false), 3000);
          } else if (wonItem.rewardType === 'coin') {
            onUpdateCoins(wonItem.value);
            actualWonValue = wonItem.value;
            popupDisplayName = ""; // Hide name in popup
          } else { // Other item types
            actualWonValue = wonItem.value;
          }
          
          setWonRewardDetails({ ...wonItem, name: popupDisplayName, value: actualWonValue });
          setShowRewardPopup(true);
        }, finalPauseDuration);
      }
    };
    spinAnimation();
  }, [isSpinning, currentCoins, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, items, NUM_WHEEL_SLOTS, currentJackpotPool]);
  
  return (
    <div className="min-h-screen bg-slate-900 bg-grid-pattern flex flex-col items-center font-sans pb-24">
      
      <header className="relative w-full flex items-center justify-between py-2 px-4 bg-black/40 backdrop-blur-md">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại Trang Chính" title="Quay lại Trang Chính">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
      </header>

      <div className="max-w-lg w-full px-4 pt-6">
        <div className="text-center mb-6">
          {activeTab === 'spin' && (
            <div className={`mt-2 p-3 rounded-xl border-4 transition-all duration-500 relative ${ jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg' }`}>
              <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider"> JACKPOT POOL </div>
              <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                {currentJackpotPool.toLocaleString()}
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
              </div>
              <div className="text-yellow-200 text-xs mt-2 opacity-90"> Tỉ lệ quay trúng ô JACKPOT: 1%! </div>
              {jackpotAnimation && ( <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div> )}
            </div>
          )}
        </div>

        {activeTab === 'spin' && (
          <>
            <div className="flex justify-center mb-6">
              <SpinningWheelGrid
                items={items}
                itemPositionsOnWheel={itemPositionsOnWheel}
                selectedIndex={selectedIndex}
                isSpinning={isSpinning}
                hasSpun={hasSpun}
                finalLandedItemIndex={finalLandedItemIndex}
              />
            </div>
            <div className="flex flex-col items-center justify-center mb-6">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className="group w-36 h-20 rounded-xl bg-slate-900/60 border-2 border-cyan-500/60 backdrop-blur-sm
                           flex flex-col items-center justify-center p-1
                           transition-all duration-200
                           hover:enabled:border-cyan-400 hover:enabled:bg-slate-900/80 hover:enabled:scale-105
                           active:enabled:scale-[0.98]
                           focus:outline-none focus:ring-4 focus:ring-cyan-500/50
                           disabled:cursor-not-allowed"
              >
                {isSpinning ? (
                  <div className="flex flex-col items-center font-lilita text-slate-400">
                    <svg className="animate-spin h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                    <span className="text-base tracking-wider uppercase">Spinning...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-lilita text-3xl uppercase text-cyan-400 drop-shadow-[0_0_6px_rgba(100,220,255,0.7)] group-disabled:text-slate-500 group-disabled:drop-shadow-none">
                      SPIN
                    </span>
                    <div className="flex items-center mt-1 group-disabled:opacity-50">
                      {currentCoins < 100 ? (
                        <span className="font-lilita text-base text-red-400/80 tracking-wide">Hết xu</span>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-lilita text-lg text-sky-400">100</span>
                          <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4 ml-1.5 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </button>
              {currentCoins < 100 && !isSpinning && (<p className="text-red-400 text-sm mt-3 font-semibold">Bạn không đủ xu để quay!</p>)}
            </div>
          </>
        )}

        {activeTab === 'history' && (
            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg animate-fade-in">
                <h3 className="text-white font-bold mb-4 text-lg text-center">📜 Lịch sử nhận thưởng 📜</h3>
                {rewardHistory.length > 0 ? (
                    <>
                        <div className="flex overflow-x-auto space-x-3 pb-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-800/50">
                            {rewardHistory.map((item, index) => (
                                <div key={`${item.name}-${item.timestamp}-${index}`} className={`flex-shrink-0 w-28 h-32 ${getRarityBg(item.rarity)} p-2.5 rounded-lg text-center flex flex-col items-center justify-around shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                                    {typeof item.icon === 'string' ? (<img src={item.icon} alt={item.name} className="w-10 h-10 mx-auto mb-1" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/000000?text=Lỗi'; }} />) : (<item.icon className={`w-10 h-10 ${item.color} mx-auto mb-1`} />)}
                                    <div className={`text-xs font-semibold ${item.rarity === 'jackpot' ? 'text-yellow-300' : 'text-slate-200'} leading-tight line-clamp-2`}>
                                        {item.rewardType === 'other' ? item.name : item.rewardAmount}
                                    </div>
                                    
                                    {item.rewardType === 'coin' && item.value > 0 && <div className="text-xs text-yellow-300 mt-0.5 flex items-center">{item.value.toLocaleString()}<CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3 h-3 inline-block ml-1" /></div>}
                                    {item.rewardType === 'pickaxe' && item.rewardAmount > 0 && <div className="text-xs text-slate-200 mt-0.5 flex items-center">{item.rewardAmount.toLocaleString()}<PickaxeIcon className="w-3 h-3 inline-block ml-1" /></div>}
                                    {item.rarity === 'jackpot' && <div className="text-xs font-bold text-red-400 mt-0.5">POOL WIN!</div>}
                                </div>
                            ))}
                        </div>
                        {rewardHistory.length > 10 && <p className="text-xs text-center text-gray-400 mt-3">Hiển thị 10 phần thưởng mới nhất.</p>}
                    </>
                ) : (
                    <div className="text-center text-white"> <p className="text-lg">Chưa có phần thưởng nào trong lịch sử.</p> <p className="text-sm opacity-80 mt-2">Hãy quay để bắt đầu nhận thưởng!</p> </div>
                )}
            </div>
        )}
      </div>

      {showRewardPopup && wonRewardDetails && ( <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-auto">
        <div className="flex bg-black/30 backdrop-blur-sm rounded-full p-1.5 shadow-lg ring-1 ring-white/10">
          <button onClick={() => setActiveTab('spin')} className={`px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${ activeTab === 'spin' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white' }`}> Quay </button>
          <button onClick={() => setActiveTab('history')} className={`px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${ activeTab === 'history' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white' }`}> Lịch sử </button>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        .item-cell-shape {
          clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
        }
        .shadow-inner-strong { box-shadow: inset 0 0 20px 0 rgba(0,0,0,0.5); }
        .bg-radial-glow { background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(15, 23, 42, 0) 65%); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
        
        /* Animations */
        @keyframes glow-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        .animate-glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        @keyframes pulse-bright { 0%, 100% { box-shadow: 0 0 20px 5px var(--rarity-color); } 50% { box-shadow: 0 0 35px 10px var(--rarity-color); } }
        .animate-pulse-bright { animation: pulse-bright 1s ease-in-out infinite; }
        @keyframes landed-flash { 0% { transform: scale(0); opacity: 0.7; } 80% { transform: scale(1.5); opacity: 0.2; } 100% { transform: scale(2); opacity: 0; } }
        .animate-landed-flash { animation: landed-flash 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes jackpot-celebrate { 0% { box-shadow: inset 0 0 0 0px var(--jackpot-color); } 25% { box-shadow: inset 0 0 0 4px var(--jackpot-color), 0 0 20px 5px var(--jackpot-color); } 100% { box-shadow: inset 0 0 0 0px var(--jackpot-color); } }
        .animate-jackpot-celebrate { animation: jackpot-celebrate 0.8s ease-in-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        
        /* Scrollbar */
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #a855f7 #3b0764; }
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(59, 7, 100, 0.5); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 10px; border: 2px solid rgba(59, 7, 100, 0.5); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
