import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- ICONS (Giữ nguyên) ---
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) { return <img src={src} alt="Coin Icon" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }} />; }
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path></svg>;
};
const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';
const PickaxeIcon = ({ className }: { className?: string }) => <img src={pickaxeIconUrl} alt="Pickaxe Icon" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} />;
const ZapIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> );
const TrophyIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path> </svg> );
const HeartIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path> </svg> );
const GiftIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path> </svg> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );


// --- INTERFACES (Giữ nguyên) ---
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

// --- UTILITY FUNCTIONS for STYLING (Giữ nguyên) ---
const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; case 'uncommon': return '#34d399'; case 'rare': return '#38bdf8'; case 'epic': return '#a78bfa'; case 'legendary': return '#fbbf24'; case 'jackpot': return '#f59e0b'; default: return '#9ca3af';
    }
};
const getRarityGlow = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'shadow-gray-500/50'; case 'uncommon': return 'shadow-emerald-500/50'; case 'rare': return 'shadow-sky-500/50'; case 'epic': return 'shadow-violet-500/50'; case 'legendary': return 'shadow-amber-400/60'; case 'jackpot': return 'shadow-yellow-400/80'; default: return 'shadow-gray-500/50';
    }
}
const getRarityBg = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-slate-800/60 border-slate-700'; case 'uncommon': return 'bg-emerald-800/50 border-emerald-700'; case 'rare': return 'bg-sky-800/50 border-sky-700'; case 'epic': return 'bg-violet-800/50 border-violet-700'; case 'legendary': return 'bg-amber-700/40 border-amber-600'; case 'jackpot': return 'bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600 border-4 border-yellow-300'; default: return 'bg-slate-800/60 border-slate-700';
    }
};

// --- Reward Popup Component (Giữ nguyên) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);
    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className={`relative w-80 bg-slate-900/80 border rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center ${jackpotWon ? 'border-yellow-500/30 shadow-yellow-500/10' : 'border-slate-600'}`} onClick={(e) => e.stopPropagation()}>
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
                {typeof item.icon === 'string' ? (<img src={item.icon} alt={item.name} className="w-20 h-20 mx-auto drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80/cccccc/000000?text=Lỗi'; }} />) : (<item.icon className={`w-20 h-20 ${item.color} mx-auto drop-shadow-lg`} />)}
            </div>
            <p className="font-sans text-sm uppercase font-bold tracking-widest my-2" style={{ color: rarityColor }}>{item.rarity}</p>
            {item.rewardType === 'coin' && item.value > 0 && (
                <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-40 py-1.5 rounded-lg border border-slate-700 mb-6">
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{item.value.toLocaleString()}</span>
                </div>
            )}
            {(item.rewardType === 'pickaxe' || item.rewardType === 'other') && item.rewardAmount && item.rewardAmount > 0 && (
                <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-40 py-1.5 rounded-lg border border-slate-700 mb-6">
                    {item.rewardType === 'pickaxe' ? <PickaxeIcon className="w-5 h-5" /> : null}
                    <span className="text-xl font-bold text-slate-200 text-shadow-sm">x{item.rewardAmount.toLocaleString()}</span>
                </div>
            )}
          </>
        )}
        <button onClick={onClose} className="w-full mt-auto px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Continue</button>
      </div>
    </div>
    );
};


// --- [MỚI] COMPONENT DẢI QUAY (SPINNING REEL) ---
const ITEM_WIDTH = 100; // Chiều rộng của 1 item (w-24)
const ITEM_GAP = 8; // Khoảng cách giữa các item (gap-2)
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_GAP;

interface SpinningReelProps {
  items: Item[];
  reelStyle: React.CSSProperties;
  onTransitionEnd: () => void;
  finalLandedItem: Item | null;
}

const SpinningReel = ({ items, reelStyle, onTransitionEnd, finalLandedItem }: SpinningReelProps) => {
  return (
    <div className="relative w-full h-32 overflow-hidden bg-slate-900/50 rounded-2xl border border-slate-700/50 shadow-inner-strong">
      {/* Lớp phủ mờ ở 2 bên */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-slate-900 via-slate-900/50 to-transparent z-10 pointer-events-none"></div>
      
      {/* Vạch chỉ thị ở giữa */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-cyan-400 z-20 shadow-lg shadow-cyan-500/50"></div>
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-28 h-28 border-2 border-cyan-400/80 rounded-2xl z-20 pointer-events-none opacity-50"></div>

      {/* Dải vật phẩm */}
      <div
        className="flex items-center h-full absolute top-0 left-0"
        style={reelStyle}
        onTransitionEnd={onTransitionEnd}
      >
        {items.map((item, index) => {
          const isLanded = finalLandedItem === item && reelStyle.transitionDuration !== '0s';
          return (
            <div key={index} className="flex-shrink-0" style={{ width: `${TOTAL_ITEM_WIDTH}px`, paddingLeft: `${ITEM_GAP / 2}px`, paddingRight: `${ITEM_GAP / 2}px` }}>
              <div className={`w-24 h-24 flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-300
                ${isLanded ? `scale-110 shadow-2xl ${getRarityGlow(item.rarity)}` : 'scale-90 opacity-60'} 
                ${getRarityBg(item.rarity)}`
              }>
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.name} className="w-10 h-10 drop-shadow-lg" />
                ) : (
                  <item.icon className={`w-10 h-10 ${item.color} drop-shadow-lg`} />
                )}
                {item.rarity !== 'jackpot' && typeof item.rewardAmount === 'number' && (
                  <span className="text-sm font-bold text-center text-amber-300 mt-1">
                    {item.rewardType === 'coin' ? item.rewardAmount : `x${item.rewardAmount}`}
                  </span>
                )}
                {item.rarity === 'jackpot' && (
                  <span className="text-sm font-black uppercase text-yellow-300 mt-1">JACKPOT</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- MAIN PARENT COMPONENT (ĐÃ CẬP NHẬT) ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);
  const [reelStyle, setReelStyle] = useState<React.CSSProperties>({ transform: 'translateX(0px)', transition: 'none' });
  const [finalLandedItem, setFinalLandedItem] = useState<Item | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const baseItems: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Tia chớp', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: '', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: '', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: '', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Trái tim', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  const reelItems = useMemo(() => {
    // Lặp lại danh sách vật phẩm để tạo cảm giác "vô tận"
    const repeated = [];
    for (let i = 0; i < 10; i++) {
        repeated.push(...baseItems);
    }
    return repeated;
  }, [baseItems]);
  
  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100 || !containerRef.current) return;

    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);
    setWonRewardDetails(null);
    setFinalLandedItem(null);

    // Xác định vật phẩm trúng thưởng
    let targetBaseItemIndex: number;
    const jackpotItemIndex = baseItems.findIndex(item => item.rarity === 'jackpot');
    if (jackpotItemIndex !== -1 && Math.random() < 0.01) { // 1% chance for jackpot
        targetBaseItemIndex = jackpotItemIndex;
    } else {
        const nonJackpotIndices = baseItems.map((_, i) => i).filter(i => i !== jackpotItemIndex);
        targetBaseItemIndex = nonJackpotIndices[Math.floor(Math.random() * nonJackpotIndices.length)];
    }

    // Chọn một mục tiêu ở giữa dải băng (ví dụ: ở vòng lặp thứ 5) để có đủ không gian quay
    const targetReelIndex = (5 * baseItems.length) + targetBaseItemIndex;
    const containerWidth = containerRef.current.offsetWidth;
    
    // Tính toán vị trí cuối cùng để vật phẩm trúng thưởng nằm chính giữa
    const targetPosition = (targetReelIndex * TOTAL_ITEM_WIDTH) + (TOTAL_ITEM_WIDTH / 2) - (containerWidth / 2);
    
    // Thêm một chút ngẫu nhiên vào vị trí cuối cùng để trông tự nhiên hơn
    const randomOffset = (Math.random() - 0.5) * (ITEM_WIDTH * 0.6);
    const finalPosition = targetPosition + randomOffset;
    
    setFinalLandedItem(reelItems[targetReelIndex]);

    // Áp dụng CSS để bắt đầu animation
    setReelStyle({
        transform: `translateX(-${finalPosition}px)`,
        transition: `transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)`,
    });

  }, [isSpinning, currentCoins, onUpdateCoins, onUpdateJackpotPool, baseItems, reelItems]);

  const handleTransitionEnd = () => {
      if (!isSpinning) return;
      
      const wonItem = finalLandedItem;
      if (!wonItem) {
        setIsSpinning(false);
        return;
      }
      
      let actualWonValue = 0;
      
      if (wonItem.rewardType === 'pickaxe' && wonItem.rewardAmount) {
        onUpdatePickaxes(wonItem.rewardAmount);
        actualWonValue = wonItem.rewardAmount;
      } else if (wonItem.rarity === 'jackpot') {
        actualWonValue = currentJackpotPool;
        setJackpotWon(true); setJackpotAnimation(true);
        onUpdateCoins(actualWonValue);
        onUpdateJackpotPool(0, true);
        setTimeout(() => setJackpotAnimation(false), 3000);
      } else if (wonItem.rewardType === 'coin' && wonItem.value) {
        onUpdateCoins(wonItem.value);
        actualWonValue = wonItem.value;
      } else {
        actualWonValue = wonItem.value;
      }
      
      const finalWonItem = {
          ...wonItem,
          value: actualWonValue,
          name: wonItem.rarity === 'jackpot' ? wonItem.name : ''
      };

      setWonRewardDetails(finalWonItem);
      setShowRewardPopup(true);

      // Reset silently for next spin
      const targetBaseItemIndex = baseItems.findIndex(item => item === finalLandedItem);
      const resetReelIndex = (2 * baseItems.length) + targetBaseItemIndex; // Reset to an early position
      const containerWidth = containerRef.current?.offsetWidth ?? 0;
      const resetPosition = (resetReelIndex * TOTAL_ITEM_WIDTH) + (TOTAL_ITEM_WIDTH / 2) - (containerWidth / 2);
      
      setTimeout(() => {
        setReelStyle({
            transform: `translateX(-${resetPosition}px)`,
            transition: 'none',
        });
        setIsSpinning(false);
      }, 500); // Delay to allow popup to show
  };
  
  return (
    <div className="min-h-screen bg-slate-900 bg-grid-pattern flex flex-col items-center font-sans pb-4">
      
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

      <div ref={containerRef} className="max-w-xl w-full px-4 pt-6">
        <div className="text-center mb-6">
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
        
          <>
            <div className="flex justify-center mb-6">
              <SpinningReel
                items={reelItems}
                reelStyle={reelStyle}
                onTransitionEnd={handleTransitionEnd}
                finalLandedItem={finalLandedItem}
              />
            </div>
            <div className="flex flex-col items-center justify-center mb-6">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className="group w-48 h-20 rounded-xl bg-slate-900/60 border-2 border-cyan-500/60 backdrop-blur-sm
                           flex flex-col items-center justify-center p-1 transition-all duration-200
                           hover:enabled:border-cyan-400 hover:enabled:bg-slate-900/80 hover:enabled:scale-105
                           active:enabled:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-500/50
                           disabled:cursor-not-allowed"
              >
                {isSpinning ? (
                  <div className="flex flex-col items-center font-lilita text-slate-400">
                    <span className="text-xl tracking-wider uppercase">Đang quay...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-lilita text-3xl uppercase text-cyan-400 drop-shadow-[0_0_6px_rgba(100,220,255,0.7)] group-disabled:text-slate-500 group-disabled:drop-shadow-none">
                      QUAY
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
        .shadow-inner-strong { box-shadow: inset 0 0 20px 0 rgba(0,0,0,0.5); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
        
        /* Animations */
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
