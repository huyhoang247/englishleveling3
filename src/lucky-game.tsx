import React, { useState, useEffect } from 'react';

// SVG Icons (remain the same)
const CoinsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
  </svg>
);

const GemIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 16.5l-6.5-6.5L10 3.5l6.5 6.5L10 16.5zM10 0.5L0.5 10l9.5 9.5 9.5-9.5L10 0.5z"></path>
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 00-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 00-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5V5.5c0-.828.672-1.5 1.5-1.5h10c.828 0 1.5.672 1.5 1.5v4.5c0 3.59-2.91 6.5-6.5 6.5z"></path>
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
  </svg>
);

const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path>
  </svg>
);

interface Item {
  icon: React.FC<{ className?: string }> | string; // icon can be a component or a string (URL)
  name: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
}

interface LuckyChestGameProps {
  onClose: () => void;
}

const LuckyChestGame = ({ onClose }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // For visual highlighting during spin
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1); // Actual item index won
  const [hasSpun, setHasSpun] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [jackpotPool, setJackpotPool] = useState(200); // Default jackpot pool to 200
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);

  // Danh sách các vật phẩm
  // Item at index 9 is replaced with Jackpot
  const items: Item[] = [
    { icon: CoinsIcon, name: 'Vàng', value: 100, rarity: 'common', color: 'text-yellow-500' },
    { icon: GemIcon, name: 'Ngọc quý', value: 300, rarity: 'rare', color: 'text-blue-500' },
    { icon: StarIcon, name: 'Sao may mắn', value: 500, rarity: 'epic', color: 'text-purple-500' },
    { icon: ZapIcon, name: 'Tia chớp', value: 200, rarity: 'uncommon', color: 'text-cyan-500' },
    { icon: ShieldIcon, name: 'Khiên bảo vệ', value: 400, rarity: 'rare', color: 'text-green-500' },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 800, rarity: 'legendary', color: 'text-orange-500' },
    { icon: HeartIcon, name: 'Trái tim', value: 250, rarity: 'uncommon', color: 'text-red-500' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 600, rarity: 'epic', color: 'text-pink-500' },
    { icon: CoinsIcon, name: 'Vàng+', value: 150, rarity: 'common', color: 'text-yellow-500' },
    // Index 9: Replaced "Ngọc xanh" with "JACKPOT!"
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: 'text-amber-400' },
    { icon: StarIcon, name: 'Sao bạc', value: 300, rarity: 'uncommon', color: 'text-gray-400' },
    { icon: ZapIcon, name: 'Sét đỏ', value: 450, rarity: 'rare', color: 'text-red-400' },
    // Items below index 11 are not on the wheel by default if NUM_WHEEL_SLOTS is 12
    { icon: ShieldIcon, name: 'Khiên ma thuật', value: 700, rarity: 'epic', color: 'text-indigo-500' },
    { icon: TrophyIcon, name: 'Cúp bạc', value: 400, rarity: 'rare', color: 'text-gray-500' },
    { icon: HeartIcon, name: 'Trái tim vàng', value: 500, rarity: 'epic', color: 'text-yellow-400' },
    { icon: GiftIcon, name: 'Hộp quà', value: 200, rarity: 'uncommon', color: 'text-violet-500' }
  ];

  const itemPositionsOnWheel = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
    { row: 1, col: 3 }, { row: 2, col: 3 },
    { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 }, // items[9] (Jackpot) is here
    { row: 2, col: 0 }, { row: 1, col: 0 }
  ];
  const NUM_WHEEL_SLOTS = itemPositionsOnWheel.length; // Should be 12

  const getRarityBg = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'uncommon': return 'bg-green-100 border-green-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-orange-100 border-orange-300';
      case 'jackpot': return 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-4 border-yellow-200 shadow-lg shadow-yellow-500/50';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const spinChest = () => {
    if (isSpinning || coins < 100) return;
    
    setCoins(prev => prev - 100);
    
    const jackpotContribution = Math.floor(Math.random() * 91) + 10;
    setJackpotPool(prev => prev + jackpotContribution);
    
    setIsSpinning(true);
    setSelectedIndex(-1); // Clear previous visual selection
    setFinalLandedItemIndex(-1); // Clear previous actual landed item
    setHasSpun(false);
    setJackpotWon(false);

    let targetLandedItemIndex: number;
    const jackpotItemArrayIndex = items.findIndex(item => item.rarity === 'jackpot');

    // Determine the landing index: 1% chance for Jackpot slot, 99% for others
    if (jackpotItemArrayIndex >= 0 && jackpotItemArrayIndex < NUM_WHEEL_SLOTS && Math.random() < 0.01) {
        targetLandedItemIndex = jackpotItemArrayIndex;
    } else {
        const otherItemIndicesOnWheel: number[] = [];
        for (let i = 0; i < NUM_WHEEL_SLOTS; i++) {
            if (i !== jackpotItemArrayIndex) {
                otherItemIndicesOnWheel.push(i);
            }
        }

        if (otherItemIndicesOnWheel.length > 0) {
            targetLandedItemIndex = otherItemIndicesOnWheel[Math.floor(Math.random() * otherItemIndicesOnWheel.length)];
        } else if (NUM_WHEEL_SLOTS === 1 && jackpotItemArrayIndex === 0) {
            // Edge case: Only jackpot item is on the wheel
            targetLandedItemIndex = jackpotItemArrayIndex;
        } else {
            // Fallback: if jackpot item isn't on wheel or no other items (should not happen in normal setup)
            // Pick any random item from the wheel.
            const allWheelIndices = Array.from(Array(NUM_WHEEL_SLOTS).keys());
             if (allWheelIndices.length > 0) {
                targetLandedItemIndex = allWheelIndices[Math.floor(Math.random() * allWheelIndices.length)];
            } else {
                targetLandedItemIndex = 0; // Absolute fallback
            }
        }
    }
    
    setFinalLandedItemIndex(targetLandedItemIndex); // Set the actual item that will be won

    const numFullRotations = 2;
    const totalVisualSteps = (NUM_WHEEL_SLOTS * numFullRotations) + targetLandedItemIndex;
    
    let currentVisualStepIndex = 0;  
    let currentSpeed = 50;
    const finalPauseDuration = 700;

    const spinAnimation = () => {
      const currentHighlightIndex = currentVisualStepIndex % NUM_WHEEL_SLOTS;
      setSelectedIndex(currentHighlightIndex); // Update visual highlight during spin

      if (currentVisualStepIndex < totalVisualSteps) {
        const remainingVisualSteps = totalVisualSteps - currentVisualStepIndex;

        const fastSpeed = 50;
        const moderateSpeed = 120;
        const finalSlowdownSpeeds = [650, 500, 400, 300, 220, 160];  

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
        // Animation finished
        setTimeout(() => {
          setIsSpinning(false);
          setHasSpun(true);
          setSelectedIndex(targetLandedItemIndex); // Ensure final selected visual matches landed item

          const wonItem = items[targetLandedItemIndex];
          setInventory(prev => [wonItem, ...prev]);
          
          // Handle winnings
          if (wonItem.rarity === 'jackpot') {
            setJackpotWon(true);
            setJackpotAnimation(true);
            setCoins(prev => prev + jackpotPool); // Add entire pool
            setJackpotPool(200); // Reset jackpot pool to 200
            
            setTimeout(() => {
              setJackpotAnimation(false);
            }, 3000);
          } else {
            setCoins(prev => prev + wonItem.value); // Add item's specific value
          }
        }, finalPauseDuration);  
      }
    };

    spinAnimation();
  };

  const renderGrid = () => {
    const grid: ({ item: Item; isWheelItem: boolean; isSelected: boolean } | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    
    itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
      // Ensure we only try to access items that exist for the wheel
      if (indexOnWheel < items.length && items[indexOnWheel]) {  
        grid[pos.row][pos.col] = {
          item: items[indexOnWheel], // items[0] to items[NUM_WHEEL_SLOTS-1] are on the wheel
          isWheelItem: true,  
          // isSelected uses `selectedIndex` for spinning animation, `finalLandedItemIndex` for final result
          isSelected: selectedIndex === indexOnWheel 
        };
      }
    });

    return (
      <div className="grid grid-cols-4 gap-2 p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl border-4 border-amber-300">
        {grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            if (rowIndex === 1 && colIndex === 1) {  
              return (
                <div  
                  key={`chest-${rowIndex}-${colIndex}`}
                  className="col-span-2 row-span-2 flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg border-4 border-yellow-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                  <div className={`text-6xl transform transition-all duration-500 ${isSpinning ? 'animate-bounce scale-110' : 'scale-100'}`}>
                    📦
                  </div>
                  <div className="absolute bottom-2 text-white font-bold text-sm bg-black/30 px-2 py-1 rounded">
                    RƯƠNG
                  </div>
                </div>
              );
            }
            if ((rowIndex === 1 && colIndex === 2) || 
                (rowIndex === 2 && colIndex === 1) || 
                (rowIndex === 2 && colIndex === 2)) {
              return null;  
            }
            
            if (cell && cell.isWheelItem) {
              const itemRarity = cell.item.rarity;
              // Determine if this specific cell is the final landed item
              const wheelIndexOfCurrentCell = itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
              const isTrulySelected = !isSpinning && hasSpun && finalLandedItemIndex === wheelIndexOfCurrentCell;
              
              // displaySelected is true if it's being highlighted during spin OR it's the final landed item
              const displaySelected = cell.isSelected || isTrulySelected;

              return (
                <div  
                  key={`item-${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 relative overflow-hidden
                    ${getRarityBg(itemRarity)}
                    ${displaySelected && itemRarity !== 'jackpot' ? 'shadow-[inset_0_0_0_3px_theme(\'colors.yellow.400\')] scale-110 bg-gradient-to-br from-yellow-200 to-orange-300 z-10' : ''}
                    ${displaySelected && itemRarity === 'jackpot' ? 'shadow-[inset_0_0_0_4px_theme(\'colors.amber.500\')] scale-110 z-20 animate-pulse' : ''}
                    ${isSpinning && cell.isSelected ? (itemRarity === 'jackpot' ? 'animate-none' : 'animate-pulse') : ''} 
                    ${isTrulySelected && itemRarity !== 'jackpot' ? 'animate-none shadow-[inset_0_0_0_3px_theme(\'colors.green.500\')] bg-green-200' : ''}
                    ${isTrulySelected && itemRarity === 'jackpot' ? 'animate-none shadow-[inset_0_0_0_4px_theme(\'colors.red.600\')] z-20' : ''}
                    hover:scale-105
                  `}
                >
                  {(displaySelected || (isSpinning && cell.isSelected)) && itemRarity !== 'jackpot' && (
                    <div className={`absolute inset-0 ${isTrulySelected ? 'bg-green-400/30' : 'bg-yellow-300/50'} ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}`}></div>
                  )}
                   {(displaySelected || (isSpinning && cell.isSelected)) && itemRarity === 'jackpot' && (
                    <div className={`absolute inset-0 ${isTrulySelected ? 'bg-red-500/50' : 'bg-amber-400/60'} ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}`}></div>
                  )}
                  {typeof cell.item.icon === 'string' ? (
                    <img src={cell.item.icon} alt={cell.item.name} className="w-10 h-10 relative z-10" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/000000?text=Error'; }} />
                  ) : (
                    <cell.item.icon className={`w-6 h-6 ${cell.item.color} relative z-10`} />
                  )}
                  {/* Hide text for Jackpot item completely */}
                  {itemRarity !== 'jackpot' && (
                    <span className={`text-xs font-semibold ${itemRarity === 'jackpot' ? 'text-red-700' : 'text-gray-700'} text-center mt-1 relative z-10`}>
                      {cell.item.name}
                    </span>
                  )}
                  {itemRarity !== 'jackpot' && (
                    <span className="text-xs text-gray-600 relative z-10">
                      {cell.item.value}💰
                    </span>
                  )}
                </div>
              );
            }
            
            return <div key={`empty-outer-${rowIndex}-${colIndex}`} className="aspect-square bg-transparent"></div>;
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center font-sans">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-red-500 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-200 hover:scale-110 shadow-md"
      >
        ✕
      </button>

      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            🎰 RƯƠNG MAY MẮN 🎰
          </h1>
          
          <div className={`my-4 p-4 rounded-xl border-4 transition-all duration-500 relative ${
            jackpotAnimation 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg'
          }`}>
            <div className="text-yellow-200 text-sm font-semibold mb-1 tracking-wider">
              💎 JACKPOT POOL 💎
            </div>
            <div className={`text-4xl font-black text-white drop-shadow-lg ${
              jackpotAnimation ? 'animate-bounce' : ''
            }`}>
              🏆 {jackpotPool.toLocaleString()} 💰
            </div>
            <div className="text-yellow-200 text-xs mt-2 opacity-90">
              Tỉ lệ quay trúng ô JACKPOT: 1%!
            </div>
            {jackpotAnimation && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div>
            )}
          </div>
          
          <div className="flex justify-center items-center gap-4 text-white text-sm sm:text-base">
            <div className="bg-yellow-600/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold shadow-md">
              💰 {coins.toLocaleString()} Xu
            </div>
            <div className="bg-purple-600/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold shadow-md">
              🎒 {inventory.length} Items
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          {renderGrid()}
        </div>

        <div className="text-center mb-6">
          <button
            onClick={spinChest}
            disabled={isSpinning || coins < 100}
            className={`
              px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-bold rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${isSpinning || coins < 100 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-inner' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg focus:ring-green-400'
              }
            `}
          >
            {isSpinning ? '🔄 Đang quay...' : `🎯 QUAY (${coins < 100 && !isSpinning ? 'Hết xu' : '100💰'})`}
          </button>
          {coins < 100 && !isSpinning && (
            <p className="text-red-400 text-sm mt-2 font-semibold">Bạn không đủ xu để quay!</p>
          )}
        </div>

        {hasSpun && finalLandedItemIndex >= 0 && items[finalLandedItemIndex] && (
          <div className="space-y-4 mb-6">
            {!jackpotWon && ( // Only show normal win if jackpot was NOT won
                 <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5 rounded-xl text-center text-white font-bold text-base sm:text-lg shadow-xl animate-fade-in-up">
                    🎉 Chúc mừng! Bạn nhận được {items[finalLandedItemIndex].name}
                    {items[finalLandedItemIndex].value > 0 && ` (+${items[finalLandedItemIndex].value.toLocaleString()} xu)`} 🎉
                 </div>
            )}
            
            {jackpotWon && (
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 p-5 sm:p-6 rounded-xl text-center text-white shadow-2xl border-4 border-yellow-200 relative overflow-hidden animate-celebrate">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-2">🎊💰🎊</div>
                  <div className="text-3xl font-black mb-2 uppercase tracking-wider">JACKPOT!</div>
                  <div className="text-xl font-semibold">Bạn đã trúng {jackpotPool.toLocaleString()} xu từ Pool!</div>
                  <div className="text-sm mt-3 opacity-90">🌟 Chúc mừng người chơi siêu may mắn! 🌟</div>
                </div>
              </div>
            )}
          </div>
        )}

        {inventory.length > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg">
            <h3 className="text-white font-bold mb-3 text-center sm:text-left text-lg">📦 Kho đồ (Mới nhất):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {inventory.slice(0, 8).map((item, index) => {
                const itemRarity = item.rarity;
                return (
                  <div key={index} className={`${getRarityBg(itemRarity)} p-2.5 rounded-lg text-center flex flex-col items-center justify-between aspect-square shadow-md hover:shadow-lg transition-shadow`}>
                    {typeof item.icon === 'string' ? (
                      <img src={item.icon} alt={item.name} className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1" onError={(e) => { e.currentTarget.src = 'https://placehold.co/28x28/cccccc/000000?text=Error'; }} />
                    ) : (
                      <item.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.color} mx-auto mb-1`} />
                    )}
                    <div className={`text-xs font-semibold ${itemRarity === 'jackpot' ? 'text-red-700' : 'text-gray-800'}`}>{item.name}</div>
                    {itemRarity !== 'jackpot' && <div className="text-xs text-gray-700">{item.value.toLocaleString()}💰</div>}
                    {itemRarity === 'jackpot' && <div className="text-xs font-bold text-red-600">POOL WIN!</div>}
                  </div>
                );
              })}
            </div>
            {inventory.length > 8 && <p className="text-xs text-center text-gray-300 mt-3">Hiển thị 8 item mới nhất.</p>}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }

        @keyframes celebrate {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(253, 224, 71, 0.3); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); }
        }
        .animate-celebrate { animation: celebrate 0.8s ease-in-out forwards; }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
        .animate-shine { animation: shine 1.5s linear infinite; }

        body {
          font-family: 'Inter', sans-serif; /* Example font */
        }
      `}</style>
    </div>
  );
};

// This App component is for standalone testing if needed.
// In a real app, you'd import LuckyChestGame and use it.
const App = () => {
  const [showGame, setShowGame] = useState(true);
  if (!showGame) {
    return <button onClick={() => setShowGame(true)} className="p-4 bg-blue-500 text-white">Open Lucky Chest Game</button>;
  }
  return <LuckyChestGame onClose={() => setShowGame(false)} />;
}

export default App; // Exporting App for testing, or LuckyChestGame directly if preferred
// export default LuckyChestGame;
