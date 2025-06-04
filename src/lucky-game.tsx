import React, { useState, useEffect } from 'react';

// Định nghĩa các biểu tượng SVG nội tuyến
const CoinsIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
  </svg>
);

const GemIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 16.5l-6.5-6.5L10 3.5l6.5 6.5L10 16.5zM10 0.5L0.5 10l9.5 9.5 9.5-9.5L10 0.5z"></path>
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
  </svg>
);

const ZapIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path>
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 00-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 00-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5V5.5c0-.828.672-1.5 1.5-1.5h10c.828 0 1.5.672 1.5 1.5v4.5c0 3.59-2.91 6.5-6.5 6.5z"></path>
  </svg>
);

const TrophyIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path>
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
  </svg>
);

const GiftIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path>
  </svg>
);

interface LuckyChestGameProps {
  onClose: () => void; // NEW: Add onClose prop
}

const LuckyChestGame = ({ onClose }: LuckyChestGameProps) => { // NEW: Destructure onClose
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // Index đang được highlight trên vòng quay
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1); // Index thực tế của item trúng thưởng
  const [hasSpun, setHasSpun] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [inventory, setInventory] = useState([]);

  // Danh sách các vật phẩm với các biểu tượng SVG nội tuyến hoặc biểu tượng cảm xúc
  const items = [
    { icon: CoinsIcon, name: 'Vàng', value: 100, rarity: 'common', color: 'text-yellow-500' },
    { icon: GemIcon, name: 'Ngọc quý', value: 300, rarity: 'rare', color: 'text-blue-500' },
    { icon: StarIcon, name: 'Sao may mắn', value: 500, rarity: 'epic', color: 'text-purple-500' },
    { icon: ZapIcon, name: 'Tia chớp', value: 200, rarity: 'uncommon', color: 'text-cyan-500' },
    { icon: ShieldIcon, name: 'Khiên bảo vệ', value: 400, rarity: 'rare', color: 'text-green-500' },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 800, rarity: 'legendary', color: 'text-orange-500' },
    { icon: HeartIcon, name: 'Trái tim', value: 250, rarity: 'uncommon', color: 'text-red-500' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 600, rarity: 'epic', color: 'text-pink-500' },
    { icon: CoinsIcon, name: 'Vàng+', value: 150, rarity: 'common', color: 'text-yellow-500' },
    { icon: GemIcon, name: 'Ngọc xanh', value: 350, rarity: 'rare', color: 'text-emerald-500' },
    { icon: StarIcon, name: 'Sao bạc', value: 300, rarity: 'uncommon', color: 'text-gray-400' },
    { icon: ZapIcon, name: 'Sét đỏ', value: 450, rarity: 'rare', color: 'text-red-400' },
    // Các item này (12-15) không nằm trên vòng quay nếu chỉ dùng 12 ô
    { icon: ShieldIcon, name: 'Khiên ma thuật', value: 700, rarity: 'epic', color: 'text-indigo-500' },
    { icon: TrophyIcon, name: 'Cúp bạc', value: 400, rarity: 'rare', color: 'text-gray-500' },
    { icon: HeartIcon, name: 'Trái tim vàng', value: 500, rarity: 'epic', color: 'text-yellow-400' },
    { icon: GiftIcon, name: 'Hộp quà', value: 200, rarity: 'uncommon', color: 'text-violet-500' }
  ];

  const itemPositionsOnWheel = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
    { row: 1, col: 3 }, { row: 2, col: 3 },
    { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
    { row: 2, col: 0 }, { row: 1, col: 0 }
  ];
  const NUM_WHEEL_SLOTS = itemPositionsOnWheel.length;

  // Hàm trả về màu nền dựa trên độ hiếm
  const getRarityBg = (rarity) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'uncommon': return 'bg-green-100 border-green-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Hàm xử lý khi quay rương
  const spinChest = () => {
    if (isSpinning || coins < 100) return;
    
    setCoins(prev => prev - 100); // Trừ xu khi quay
    setIsSpinning(true); // Bắt đầu quay
    setSelectedIndex(-1); // Đặt lại index được chọn
    setHasSpun(false); // Đặt lại trạng thái đã quay

    const landedItemIdx = Math.floor(Math.random() * NUM_WHEEL_SLOTS); // Chọn ngẫu nhiên vật phẩm trúng thưởng
    setFinalLandedItemIndex(landedItemIdx); // Lưu lại index trúng thưởng

    const numFullRotations = 2; // Số vòng quay đầy đủ trước khi bắt đầu chậm lại
    const totalVisualSteps = (NUM_WHEEL_SLOTS * numFullRotations) + landedItemIdx;
    
    let currentVisualStepIndex = 0; 
    let currentSpeed = 50; // Tốc độ ban đầu
    const finalPauseDuration = 700; // Thời gian dừng ở ô trúng thưởng cuối cùng

    // Hàm thực hiện animation quay
    const spinAnimation = () => {
      // Index được highlight trên vòng quay
      const currentHighlightIndex = currentVisualStepIndex % NUM_WHEEL_SLOTS;
      setSelectedIndex(currentHighlightIndex);

      if (currentVisualStepIndex < totalVisualSteps) {
        const remainingVisualSteps = totalVisualSteps - currentVisualStepIndex;

        // Các mức tốc độ (thời gian chờ, ms)
        const fastSpeed = 50;
        const moderateSpeed = 120;
        // Tốc độ cho 6 ô cuối cùng (index 0 là cho ô CÁCH ô trúng thưởng 1 bước,...)
        // Tức là remainingVisualSteps = 1 (ô cuối trước khi dừng hẳn) sẽ có tốc độ cao nhất (chậm nhất)
        const finalSlowdownSpeeds = [
          650, // Ô ngay trước ô trúng thưởng (remainingVisualSteps = 1)
          500, // remainingVisualSteps = 2
          400, // remainingVisualSteps = 3
          300, // remainingVisualSteps = 4
          220, // remainingVisualSteps = 5
          160  // remainingVisualSteps = 6
        ]; 

        if (remainingVisualSteps <= finalSlowdownSpeeds.length) {
          // Áp dụng tốc độ chậm dần cho các ô cuối
          currentSpeed = finalSlowdownSpeeds[remainingVisualSteps - 1];
        } else if (remainingVisualSteps <= NUM_WHEEL_SLOTS + Math.floor(NUM_WHEEL_SLOTS / 2)) {
          // Giai đoạn chậm vừa (khoảng 1.5 vòng cuối trước khi vào final slowdown)
          currentSpeed = moderateSpeed;
        } else {
          // Giai đoạn quay nhanh
          currentSpeed = fastSpeed;
        }
        
        currentVisualStepIndex++;
        setTimeout(spinAnimation, currentSpeed);
      } else {
        // Đã dừng ở ô trúng thưởng (selectedIndex lúc này === landedItemIdx)
        // Chờ một chút để người dùng thấy rõ ô trúng thưởng rồi mới kết thúc hẳn
        setTimeout(() => {
          setIsSpinning(false); // Dừng quay
          setHasSpun(true); // Đặt trạng thái đã quay
          
          // Đảm bảo selectedIndex là ô trúng thưởng cuối cùng
          setSelectedIndex(landedItemIdx); 

          const wonItem = items[landedItemIdx];
          setInventory(prev => [wonItem, ...prev]); // Thêm vật phẩm vào kho đồ
          setCoins(prev => prev + wonItem.value); // Cộng xu cho vật phẩm trúng thưởng
        }, finalPauseDuration); 
      }
    };

    spinAnimation(); // Bắt đầu animation
  };

  // Hàm render lưới vật phẩm
  const renderGrid = () => {
    const grid = Array(4).fill(null).map(() => Array(4).fill(null));
    
    itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
      if (items[indexOnWheel]) { 
        grid[pos.row][pos.col] = {
          item: items[indexOnWheel],
          isWheelItem: true, 
          // selectedIndex là index đang được highlight trong quá trình quay
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
                    📦 {/* Biểu tượng rương */}
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
              const IconComponent = cell.item.icon;
              // Khi dừng hẳn, đảm bảo ô trúng thưởng cuối cùng được highlight mạnh mẽ
              const isTrulySelected = !isSpinning && hasSpun && finalLandedItemIndex === itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
              const displaySelected = cell.isSelected || isTrulySelected;

              return (
                <div 
                  key={`item-${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 relative overflow-hidden
                    ${getRarityBg(cell.item.rarity)}
                    ${displaySelected ? 'ring-4 ring-yellow-400 ring-offset-2 scale-110 shadow-2xl bg-gradient-to-br from-yellow-200 to-orange-300 z-10' : 'hover:scale-105'}
                    ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}
                    ${isTrulySelected ? 'animate-none ring-green-500' : ''} 
                  `}
                >
                  {(displaySelected || (isSpinning && cell.isSelected)) && (
                    <div className={`absolute inset-0 ${isTrulySelected ? 'bg-green-400/50' : 'bg-gradient-to-br from-yellow-300/70 to-orange-400/70'} ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}`}></div>
                  )}
                  <IconComponent className={`w-6 h-6 ${cell.item.color} relative z-10`} />
                  <span className="text-xs font-semibold text-gray-700 text-center mt-1 relative z-10">
                    {cell.item.name}
                  </span>
                  <span className="text-xs text-gray-600 relative z-10">
                    {cell.item.value}💰
                  </span>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-transform transform hover:scale-105 z-50"
      >
        Đóng
      </button>

      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎰 RƯƠNG MAY MẮN 🎰
          </h1>
          <div className="flex justify-center items-center gap-4 text-white text-sm sm:text-base">
            <div className="bg-yellow-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold">
              💰 {coins} Xu
            </div>
            <div className="bg-purple-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold">
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
              px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-bold rounded-xl transition-all duration-300 transform
              ${isSpinning || coins < 100 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg'
              }
            `}
          >
            {isSpinning ? '🔄 Đang quay...' : `🎯 QUAY (${coins < 100 && !isSpinning ? 'Hết xu' : '100💰'})`}
          </button>
            {coins < 100 && !isSpinning && (
            <p className="text-red-400 text-sm mt-2">Bạn không đủ xu để quay!</p>
          )}
        </div>

        {hasSpun && finalLandedItemIndex >= 0 && items[finalLandedItemIndex] && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 sm:p-6 rounded-xl text-center text-white font-bold text-base sm:text-xl shadow-xl animate-bounce mb-6">
            🎉 Chúc mừng! Bạn nhận được {items[finalLandedItemIndex].name} (+{items[finalLandedItemIndex].value} xu) 🎉
          </div>
        )}

        {inventory.length > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4">
            <h3 className="text-white font-bold mb-3 text-center sm:text-left">📦 Kho đồ (Mới nhất):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {inventory.slice(0, 8).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className={`${getRarityBg(item.rarity)} p-2 rounded text-center flex flex-col items-center justify-center aspect-square`}>
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color} mx-auto`} />
                    <div className="text-xs font-semibold mt-1">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.value}💰</div>
                  </div>
                );
              })}
            </div>
              {inventory.length > 8 && <p className="text-xs text-center text-gray-300 mt-2">Hiển thị 8 item mới nhất.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyChestGame;

