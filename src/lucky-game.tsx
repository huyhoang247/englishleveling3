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
const GemIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 16.5l-6.5-6.5L10 3.5l6.5 6.5L10 16.5zM10 0.5L0.5 10l9.5 9.5 9.5-9.5L10 0.5z"></path> </svg> );
const StarIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path> </svg> );
const ZapIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> );
const ShieldIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a8 8 0 00-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 00-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5V5.5c0-.828.672-1.5 1.5-1.5h10c.828 0 1.5.672 1.5 1.5v4.5c0 3.59-2.91 6.5-6.5 6.5z"></path> </svg> );
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
  timestamp?: number;
}
interface LuckyChestGameProps {
  onClose: () => void;
  isStatsFullscreen: boolean;
  currentCoins: number;
  onUpdateCoins: (amount: number) => void;
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
      case 'common': return '#9ca3af';
      case 'uncommon': return '#34d399';
      case 'rare': return '#38bdf8';
      case 'epic': return '#a78bfa';
      case 'legendary': return '#fbbf24';
      case 'jackpot': return '#f59e0b';
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

// Reward Popup Component
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const getPopupRarityBgClass = (rarity: Item['rarity']) => {
        switch(rarity) {
          case 'common': return 'bg-gray-100 border-gray-300 text-gray-800';
          case 'uncommon': return 'bg-green-100 border-green-300 text-green-800';
          case 'rare': return 'bg-blue-100 border-blue-300 text-blue-800';
          case 'epic': return 'bg-purple-100 border-purple-300 text-purple-800';
          case 'legendary': return 'bg-orange-100 border-orange-300 text-orange-800';
          case 'jackpot': return 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-4 border-yellow-200 shadow-lg shadow-yellow-500/50 text-white';
          default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };
    return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`relative p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full transform transition-all duration-300 scale-100 animate-pop-in ${getPopupRarityBgClass(item.rarity)}`}>
        {jackpotWon ? (
          <>
            <div className="text-5xl mb-4 animate-bounce-once">🎊💰🎊</div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-wider text-white drop-shadow">JACKPOT!</h2>
            <p className="text-xl font-semibold mb-4 text-white">Bạn đã trúng {item.value.toLocaleString()} xu từ Pool!</p>
            <p className="text-sm mt-3 opacity-90 text-yellow-100">🌟 Chúc mừng người chơi siêu may mắn! 🌟</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">🎉 Chúc mừng! 🎉</h2>
            {typeof item.icon === 'string' ? (
              <img src={item.icon} alt={item.name} className="w-24 h-24 mx-auto mb-4 animate-float" onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/cccccc/000000?text=Lỗi'; }} />
            ) : (
              <item.icon className={`w-24 h-24 ${item.color} mx-auto mb-4 animate-float`} />
            )}
            <p className="text-2xl font-semibold mb-2">Bạn nhận được <span className="font-bold">{item.name}</span></p>
            {item.value > 0 && (
              <p className="text-xl font-bold text-green-600">+{item.value.toLocaleString()} xu</p>
            )}
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Tiếp tục
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
    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Center Piece
          if (rowIndex === 1 && colIndex === 1) {
            return (
              <div key={`chest-pedestal`} className="col-span-2 row-span-2 flex items-center justify-center rounded-full bg-slate-800 relative shadow-inner-strong">
                <div className="absolute inset-0 bg-radial-glow animate-glow-pulse z-0"></div>
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest.png" alt="Treasure Chest" className={`w-28 h-28 transform transition-transform duration-500 z-10 drop-shadow-2xl ${isSpinning ? 'animate-bounce-subtle' : ''}`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/112x112/cccccc/000000?text=Lỗi'; }}/>
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
                <div className="item-cell-shape w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                    {isLandedOn && ( <div className={`absolute inset-0 z-20 animate-landed-flash`} style={{ background: `radial-gradient(circle, ${rarityColor}33 0%, transparent 70%)` }}></div> )}
                    {isLandedOn && item.rarity === 'jackpot' && ( <div className="absolute inset-0 z-20 animate-jackpot-celebrate" style={{'--jackpot-color': rarityColor}}></div> )}
                    {/* CHANGE: Added py-1 and removed h-full to prevent content from being clipped by the parent's clip-path. */}
                    <div className="relative z-10 flex flex-col items-center justify-center py-1">
                        {typeof item.icon === 'string' ? (
                          <img src={item.icon} alt={item.name} className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg transition-transform" onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56/cccccc/000000?text=Lỗi'; }} />
                        ) : (
                          <item.icon className={`w-12 h-12 md:w-14 md:h-14 ${item.color} drop-shadow-lg transition-transform`} />
                        )}
                        {item.value > 0 && (
                            // CHANGE: Adjusted margin-top for better spacing.
                            <div className="flex items-center mt-1.5 bg-black/50 rounded-full px-2.5 py-1">
                                <span className="text-sm font-bold text-yellow-300">{item.value.toLocaleString()}</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4 ml-1.5" />
                            </div>
                        )}
                        {item.rarity === 'jackpot' && ( <span className="mt-1.5 text-sm font-black text-white uppercase tracking-wider drop-shadow-lg animate-pulse"> Jackpot </span> )}
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
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
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
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '150 Xu', value: 150, rarity: 'common', color: '' },
    { icon: ZapIcon, name: 'Tia chớp', value: 0, rarity: 'uncommon', color: 'text-cyan-400' },
    { icon: GemIcon, name: 'Ngọc quý', value: 0, rarity: 'rare', color: 'text-blue-400' },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '300 Xu', value: 300, rarity: 'uncommon', color: '' },
    { icon: ShieldIcon, name: 'Khiên bảo vệ', value: 0, rarity: 'rare', color: 'text-green-400' },
    { icon: StarIcon, name: 'Sao may mắn', value: 0, rarity: 'epic', color: 'text-purple-400' },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '500 Xu', value: 500, rarity: 'rare', color: '' },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 0, rarity: 'legendary', color: 'text-orange-400' },
    { icon: HeartIcon, name: 'Trái tim', value: 0, rarity: 'uncommon', color: 'text-red-400' },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: '' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 0, rarity: 'epic', color: 'text-pink-400' },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '100 Xu', value: 100, rarity: 'common', color: '' },
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
          let actualWonAmount = wonItem.value;
          if (wonItem.rarity === 'jackpot') {
            actualWonAmount = currentJackpotPool;
            setJackpotWon(true); setJackpotAnimation(true);
            onUpdateCoins(actualWonAmount);
            onUpdateJackpotPool(0, true);
            setTimeout(() => setJackpotAnimation(false), 3000);
          } else {
            onUpdateCoins(wonItem.value);
          }
          setWonRewardDetails({ ...wonItem, value: actualWonAmount });
          setShowRewardPopup(true);
        }, finalPauseDuration);
      }
    };
    spinAnimation();
  }, [isSpinning, currentCoins, onUpdateCoins, onUpdateJackpotPool, items, NUM_WHEEL_SLOTS, currentJackpotPool]);
  
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
              <button onClick={spinChest} disabled={isSpinning || currentCoins < 100} className={` px-3 py-2 text-sm rounded-full transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-75 inline-flex items-center justify-center relative group ${isSpinning || currentCoins < 100 ? 'bg-gray-500 text-gray-300 cursor-not-allowed shadow-inner opacity-80' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:ring-green-400' }`}>
                {isSpinning ? ( <span className="flex items-center"> <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Đang quay... </span> ) : ( <div className="flex items-center justify-center"> <span className="font-semibold tracking-wide"> QUAY </span> <span className={`h-4 w-px mx-1.5 transition-colors duration-200 ${currentCoins < 100 ? 'bg-gray-400/60' : 'bg-white/40 group-hover:bg-white/60'}`}></span> <span className="flex items-center"> {currentCoins < 100 ? (<span className="font-medium">Hết xu</span>) : (<> <span className="font-medium">100</span> <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4 inline-block ml-1"/> </> )} </span> </div> )}
              </button>
              {currentCoins < 100 && !isSpinning && (<p className="text-red-400 text-sm mt-2 font-semibold">Bạn không đủ xu để quay!</p>)}
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
                                    <div className={`text-xs font-semibold ${item.rarity === 'jackpot' ? 'text-yellow-300' : 'text-slate-200'} leading-tight line-clamp-2`}>{item.name}</div>
                                    {item.rarity !== 'jackpot' && item.value > 0 && <div className="text-xs text-yellow-300 mt-0.5 flex items-center">{item.value.toLocaleString()}<CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3 h-3 inline-block ml-1" /></div>}
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
        body { font-family: 'Inter', sans-serif; }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        .item-cell-shape {
          clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
        }
        .shadow-inner-strong { box-shadow: inset 0 0 20px 0 rgba(0,0,0,0.5); }
        .bg-radial-glow { background: radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(15, 23, 42, 0) 70%); }
        @keyframes glow-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        .animate-glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        @keyframes pulse-bright { 0%, 100% { box-shadow: 0 0 20px 5px var(--rarity-color); } 50% { box-shadow: 0 0 35px 10px var(--rarity-color); } }
        .animate-pulse-bright { animation: pulse-bright 1s ease-in-out infinite; }
        @keyframes landed-flash { 0% { transform: scale(0); opacity: 0.7; } 80% { transform: scale(1.5); opacity: 0.2; } 100% { transform: scale(2); opacity: 0; } }
        .animate-landed-flash { animation: landed-flash 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes jackpot-celebrate { 0% { box-shadow: inset 0 0 0 0px var(--jackpot-color); } 25% { box-shadow: inset 0 0 0 4px var(--jackpot-color), 0 0 20px 5px var(--jackpot-color); } 100% { box-shadow: inset 0 0 0 0px var(--jackpot-color); } }
        .animate-jackpot-celebrate { animation: jackpot-celebrate 0.8s ease-in-out; }
        
        /* Other required animations */
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes pop-in { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { translateY(0px); } }
        .animate-float { animation: float 2s ease-in-out infinite; }
        @keyframes bounce-once { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-15px); } 60% { transform: translateY(-7px); } }
        .animate-bounce-once { animation: bounce-once 0.8s ease-in-out; }
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
