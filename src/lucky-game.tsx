import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- ICONS and INTERFACES (Không thay đổi) ---
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

interface Item { icon: React.FC<{ className?: string }> | string; name: string; value: number; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot'; color: string; rewardType?: 'coin' | 'pickaxe' | 'other'; rewardAmount?: number; }
interface LuckyChestGameProps { onClose: () => void; isStatsFullscreen: boolean; currentCoins: number; onUpdateCoins: (amount: number) => void; onUpdatePickaxes: (amount: number) => void; currentJackpotPool: number; onUpdateJackpotPool: (amount: number, resetToDefault?: boolean) => void; }
interface RewardPopupProps { item: Item; jackpotWon: boolean; onClose: () => void; }
const getRarityColor = (rarity: Item['rarity']) => { switch(rarity) { case 'common': return '#9ca3af'; case 'uncommon': return '#34d399'; case 'rare': return '#38bdf8'; case 'epic': return '#a78bfa'; case 'legendary': return '#fbbf24'; case 'jackpot': return '#f59e0b'; default: return '#9ca3af'; } };
const getRarityGlow = (rarity: Item['rarity']) => { switch(rarity) { case 'common': return 'shadow-gray-500/50'; case 'uncommon': return 'shadow-emerald-500/50'; case 'rare': return 'shadow-sky-500/50'; case 'epic': return 'shadow-violet-500/50'; case 'legendary': return 'shadow-amber-400/60'; case 'jackpot': return 'shadow-yellow-400/80'; default: return 'shadow-gray-500/50'; } }

// --- REWARD POPUP (Không thay đổi) ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => { /* ... giữ nguyên code ... */ };

// --- SPINNING WHEEL GRID (ĐÃ TÁI CẤU TRÚC) ---
interface SpinningWheelGridProps {
  items: Item[];
  itemPositionsOnWheel: { row: number; col: number }[];
  isSpinning: boolean;
  hasSpun: boolean;
  finalLandedItemIndex: number;
  onCellRef: (el: HTMLDivElement | null, index: number) => void; // MỚI: Prop để nhận ref
}

const SpinningWheelGrid = React.memo(({
  items,
  itemPositionsOnWheel,
  isSpinning,
  hasSpun,
  finalLandedItemIndex,
  onCellRef,
}: SpinningWheelGridProps) => {
  const grid: ({ item: Item; isWheelItem: boolean } | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
    if (indexOnWheel < items.length && items[indexOnWheel]) {
      grid[pos.row][pos.col] = { item: items[indexOnWheel], isWheelItem: true, };
    }
  });

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (rowIndex === 1 && colIndex === 1) {
            return (
              <div key={`chest-pedestal`} className="col-span-2 row-span-2 flex items-center justify-center rounded-full bg-slate-800/80 relative shadow-inner-strong">
                <div className="absolute inset-0 bg-radial-glow animate-glow-pulse z-0"></div>
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest.png" alt="Treasure Chest" className={`w-24 h-24 transform transition-transform duration-500 z-10 drop-shadow-2xl ${isSpinning ? 'animate-bounce-subtle' : ''}`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/cccccc/000000?text=Lỗi'; }}/>
              </div>
            );
          }
          if ((rowIndex === 1 && colIndex === 2) || (rowIndex === 2 && colIndex === 1) || (rowIndex === 2 && colIndex === 2)) { return null; }

          if (cell && cell.isWheelItem) {
            const item = cell.item;
            const wheelIndexOfCurrentCell = itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
            // MỚI: Chỉ dùng state cuối cùng để render, không dùng selectedIndex nữa
            const isLandedOn = !isSpinning && hasSpun && finalLandedItemIndex === wheelIndexOfCurrentCell;
            const rarityColor = getRarityColor(item.rarity);

            return (
              <div 
                key={`item-border-${wheelIndexOfCurrentCell}`}
                // MỚI: Gắn ref và data-index để JS có thể tìm thấy
                ref={(el) => onCellRef(el, wheelIndexOfCurrentCell)}
                data-index={wheelIndexOfCurrentCell}
                style={{ '--rarity-color': rarityColor } as React.CSSProperties}
                // MỚI: Class "is-landed" sẽ được thêm vào bằng state CUỐI CÙNG
                className={`item-container group item-cell-shape aspect-square p-[2px] shadow-lg relative transition-all duration-200 bg-gradient-to-br from-slate-600 to-slate-800 ${isLandedOn ? 'is-landed' : 'hover:scale-105 hover:z-20'}`}
              >
                <div className="item-cell-shape w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-1 relative overflow-hidden">
                    {isLandedOn && ( <div className={`absolute inset-0 z-20 animate-landed-flash`} style={{ background: `radial-gradient(circle, ${rarityColor}33 0%, transparent 70%)` }}></div> )}
                    {isLandedOn && item.rarity === 'jackpot' && ( <div className="absolute inset-0 z-20 animate-jackpot-celebrate" style={{'--jackpot-color': rarityColor}}></div> )}
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                        {typeof item.icon === 'string' ? ( <img src={item.icon} alt={item.name} className="w-8 h-8 drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'https://placehold.co/32x32/cccccc/000000?text=Lỗi'; }} /> ) : ( <item.icon className={`w-8 h-8 ${item.color} drop-shadow-lg`} /> )}
                        {item.rarity !== 'jackpot' && typeof item.rewardAmount === 'number' && ( <span className="text-xs font-bold text-center text-amber-300"> {item.rewardType === 'coin' ? item.rewardAmount : `x${item.rewardAmount}`} </span> )}
                        {item.rarity === 'jackpot' && ( <span className="text-xs font-black uppercase text-yellow-300">JACKPOT</span> )}
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


// --- MAIN PARENT COMPONENT (LOGIC CHÍNH ĐÃ THAY ĐỔI) ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  // selectedIndex không còn dùng để render nữa, chỉ dùng cho logic cuối cùng
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1);
  const [hasSpun, setHasSpun] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // MỚI: Các refs để thao tác DOM trực tiếp
  const animationFrameId = useRef<number>();
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ... (items, itemPositionsOnWheel, NUM_WHEEL_SLOTS không đổi)
    const items: Item[] = useMemo(() => [ /* ... giữ nguyên ... */ ], []);
    const itemPositionsOnWheel = useMemo(() => [ /* ... giữ nguyên ... */ ], []);
    const NUM_WHEEL_SLOTS = itemPositionsOnWheel.length;

  useEffect(() => {
    // Đảm bảo mảng refs có đúng độ dài
    cellRefs.current = cellRefs.current.slice(0, NUM_WHEEL_SLOTS);
    // Dọn dẹp animation frame khi component unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [NUM_WHEEL_SLOTS]);

  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100) return;

    onUpdateCoins(-100);
    onUpdateJackpotPool(Math.floor(Math.random() * 91) + 10);
    
    // Reset trạng thái
    setIsSpinning(true);
    setHasSpun(false);
    setFinalLandedItemIndex(-1);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // MỚI: Xóa class highlight của lần quay trước
    cellRefs.current.forEach(cell => cell?.classList.remove('is-selected', 'is-landed'));

    let targetLandedItemIndex: number;
    const jackpotItemArrayIndex = items.findIndex(item => item.rarity === 'jackpot');
    if (jackpotItemArrayIndex !== -1 && Math.random() < 0.01) { // 1%
      targetLandedItemIndex = jackpotItemArrayIndex;
    } else {
      const otherIndices = Array.from({ length: NUM_WHEEL_SLOTS }, (_, i) => i).filter(i => i !== jackpotItemArrayIndex);
      targetLandedItemIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
    }
    
    const numRotations = 3;
    const totalSteps = (NUM_WHEEL_SLOTS * numRotations) + targetLandedItemIndex;
    const totalDuration = 5000; // 5 giây
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 4); // Dùng ease mạnh hơn (t^4)

    let lastHighlightedIndex = -1;

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / totalDuration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentStep = Math.floor(easedProgress * totalSteps);
      const currentHighlightIndex = currentStep % NUM_WHEEL_SLOTS;

      // MỚI: Thao tác DOM trực tiếp, không setState
      if (lastHighlightedIndex !== currentHighlightIndex) {
        if (cellRefs.current[lastHighlightedIndex]) {
          cellRefs.current[lastHighlightedIndex]?.classList.remove('is-selected');
        }
        if (cellRefs.current[currentHighlightIndex]) {
          cellRefs.current[currentHighlightIndex]?.classList.add('is-selected');
        }
        lastHighlightedIndex = currentHighlightIndex;
      }

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Animation kết thúc, bây giờ mới cập nhật state
        if (cellRefs.current[lastHighlightedIndex]) {
            cellRefs.current[lastHighlightedIndex]?.classList.remove('is-selected');
        }
        
        setFinalLandedItemIndex(targetLandedItemIndex); // Cập nhật state để render hiệu ứng landed-on
        setIsSpinning(false);
        setHasSpun(true);
        
        setTimeout(() => {
          // Xử lý logic phần thưởng
          const wonItem = { ...items[targetLandedItemIndex] };
          let actualWonValue = 0;
          if (wonItem.rewardType === 'pickaxe' && wonItem.rewardAmount) {
            onUpdatePickaxes(wonItem.rewardAmount);
            actualWonValue = wonItem.rewardAmount;
          } else if (wonItem.rarity === 'jackpot') {
            actualWonValue = currentJackpotPool;
            setJackpotWon(true);
            setJackpotAnimation(true);
            onUpdateCoins(actualWonValue);
            onUpdateJackpotPool(0, true);
            setTimeout(() => setJackpotAnimation(false), 3000);
          } else { // coin và other
            onUpdateCoins(wonItem.value);
            actualWonValue = wonItem.value;
          }
          const finalWonItem = { ...wonItem, value: actualWonValue, name: wonItem.rarity === 'jackpot' ? wonItem.name : '' };
          setWonRewardDetails(finalWonItem);
          setShowRewardPopup(true);
        }, 500); // Chờ 0.5s
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  }, [isSpinning, currentCoins, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, items, NUM_WHEEL_SLOTS, currentJackpotPool]);
  
  return (
    <div className="min-h-screen bg-slate-900 bg-grid-pattern flex flex-col items-center font-sans pb-4">
      {/* --- HEADER (Không thay đổi) --- */}
      <header className="relative w-full flex items-center justify-between py-2 px-4 bg-black/40 backdrop-blur-md">
         {/* ... giữ nguyên code ... */}
      </header>

      <div className="max-w-lg w-full px-4 pt-6">
        {/* --- JACKPOT POOL (Không thay đổi) --- */}
        <div className="text-center mb-6">
           {/* ... giữ nguyên code ... */}
        </div>
        
          <>
            <div className="flex justify-center mb-6">
              <SpinningWheelGrid
                items={items}
                itemPositionsOnWheel={itemPositionsOnWheel}
                isSpinning={isSpinning}
                hasSpun={hasSpun}
                finalLandedItemIndex={finalLandedItemIndex}
                // MỚI: Truyền callback để lấy refs
                onCellRef={(el, index) => { cellRefs.current[index] = el; }}
              />
            </div>
            {/* --- SPIN BUTTON (Không thay đổi) --- */}
            <div className="flex flex-col items-center justify-center mb-6">
               {/* ... giữ nguyên code ... */}
            </div>
          </>
      </div>
      
      {/* --- REWARD POPUP (Không thay đổi) --- */}
      {showRewardPopup && wonRewardDetails && ( <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> )}

      <style jsx global>{`
        /* --- TẤT CẢ CSS CŨ (Không thay đổi) --- */
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        .bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 2rem 2rem; }
        .item-cell-shape { clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%); }
        .shadow-inner-strong { box-shadow: inset 0 0 20px 0 rgba(0,0,0,0.5); }
        .bg-radial-glow { background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(15, 23, 42, 0) 65%); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
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
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #a855f7 #3b0764; }
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(59, 7, 100, 0.5); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 10px; border: 2px solid rgba(59, 7, 100, 0.5); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* --- MỚI: CSS CHO HIỆU ỨNG HIGHLIGHT --- */
        .item-container.is-selected {
          transform: scale(1.1);
          z-index: 20;
          background-image: linear-gradient(to bottom right, var(--rarity-color), #d1d5db, var(--rarity-color));
          animation: pulse-bright 1s ease-in-out infinite;
        }

        .item-container.is-landed {
          transform: scale(1.1);
          z-index: 30;
          background-image: linear-gradient(to bottom right, var(--rarity-color), #d1d5db, var(--rarity-color));
        }

      `}</style>
    </div>
  );
};

export default LuckyChestGame;
