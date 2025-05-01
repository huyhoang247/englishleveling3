import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for rendering

// --- SVG Icon Components (Replacement for lucide-react) ---

// Star Icon SVG
const StarIcon = ({ size = 24, color = 'currentColor', fill = 'none', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill === 'currentColor' ? color : fill} // Use color prop for fill if fill is 'currentColor'
    stroke={color} // Use color prop for stroke
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`} // Add a base class if needed + user className
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Sword Icon SVG
const SwordIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" x2="19" y1="19" y2="13" />
    <line x1="16" x2="20" y1="16" y2="20" />
    <line x1="19" x2="21" y1="21" y2="19" />
  </svg>
);

// Shield Icon SVG
const ShieldIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Crown Icon SVG
const CrownIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm18 16H4" />
    <path d="M12 4a2 2 0 0 1 2 2 2 2 0 0 1-4 0 2 2 0 0 1 2-2z" />
    <path d="M5 20a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v0z" />
  </svg>
);

// Gem Icon SVG
const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
    <path d="M12 22L2 9" />
    <path d="M12 22l10-13" />
    <path d="M2 9h20" />
  </svg>
);

// --- TreasureChestGame Component ---

const TreasureChestGame = () => {
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [coins, setCoins] = useState(357);
  // State to track displayed coins for animation
  const [displayedCoins, setDisplayedCoins] = useState(357); // Initial value same as coins
  const [gems, setGems] = useState(42);
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  // State to track remaining chests
  const [chestsRemaining, setChestsRemaining] = useState(3); // Assume 3 initial chests

  // State để lưu trữ phần thưởng coins tạm thời trước khi đếm
  const [pendingCoinReward, setPendingCoinReward] = useState(0);

  // Updated cards array to use SVG components
  const cards = [
    { id: 1, name: "Kiếm Sắt", rarity: "common", icon: <SwordIcon size={36} />, color: "#d4d4d8", background: "bg-gradient-to-br from-gray-200 to-gray-400" },
    { id: 2, name: "Khiên Ma Thuật", rarity: "rare", icon: <ShieldIcon size={36} />, color: "#4287f5", background: "bg-gradient-to-br from-blue-300 to-blue-500" },
    { id: 3, name: "Vương Miện", rarity: "epic", icon: <CrownIcon size={36} />, color: "#9932CC", background: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { id: 4, name: "Ngọc Rồng", rarity: "legendary", icon: <GemIcon size={36} />, color: "#FFD700", background: "bg-gradient-to-br from-yellow-300 to-amber-500" }
  ];

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case "common": return "text-gray-200";
      case "rare": return "text-blue-400";
      case "epic": return "text-purple-400";
      case "legendary": return "text-amber-400";
      default: return "text-white";
    }
  };

  // Hàm xử lý hiệu ứng đếm coins
  const startCoinCountAnimation = (reward) => {
      const oldCoins = coins; // Lấy giá trị coins hiện tại (trước khi cộng thưởng)
      const newCoins = oldCoins + reward; // Tính toán giá trị coins mới

      let step = Math.ceil(reward / 30); // Chia thành khoảng 30 bước
      let current = oldCoins;

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins); // Đảm bảo hiển thị đúng giá trị cuối cùng
              setCoins(newCoins); // Cập nhật giá trị coins thực tế sau khi đếm xong
              clearInterval(countInterval);
              setPendingCoinReward(0); // Reset pending reward
          } else {
              setDisplayedCoins(current);
          }
      }, 50); // Tăng thời gian interval lên 50ms
  };


  const openChest = () => {
    // Check if chests are remaining and chest is closed
    if (isChestOpen || chestsRemaining <= 0) return;

    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      // Add a golden dust effect when the chest opens
      setIsChestOpen(true);
      setShowShine(true); // Ensure showShine is set to true here

      // Decrease remaining chests
      setChestsRemaining(prev => prev - 1);

      setTimeout(() => {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        setCurrentCard(randomCard);
        setShowCard(true);

        // Determine coin reward based on rarity
        let coinReward = 0;
        switch(randomCard.rarity) {
          case "common": coinReward = 10; break;
          case "rare": coinReward = 25; break;
          case "epic": coinReward = 50; break;
          case "legendary": coinReward = 100; break;
        }

        // Lưu phần thưởng coins vào state tạm thời
        setPendingCoinReward(coinReward);

        if (randomCard.rarity === "legendary" || randomCard.rarity === "epic") {
          setGems(prev => prev + (randomCard.rarity === "legendary" ? 5 : 2));
        }
      }, 1500);
    }, 600);
  };

  const resetChest = () => {
    setIsChestOpen(false);
    setShowCard(false);
    setCurrentCard(null);
    setShowShine(false);

    // Bắt đầu hiệu ứng đếm coins khi đóng popup
    if (pendingCoinReward > 0) {
        startCoinCountAnimation(pendingCoinReward);
    }
  };

  // Effect to add sparkle effect when displayedCoins changes
  useEffect(() => {
    // Skip the first render and when displayedCoins equals coins (stable state)
    // Chỉ chạy hiệu ứng khi displayedCoins thay đổi VÀ coins đã được cập nhật
    if (displayedCoins === coins && pendingCoinReward === 0) return;


    // Thêm class hiệu ứng
    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      // Xóa class sau khi animation kết thúc
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      coinElement.addEventListener('animationend', animationEndHandler);
    }
    // Cleanup function to remove event listener if component unmounts before animation ends
    return () => {
      const coinElement = document.querySelector('.coin-counter');
      if (coinElement) {
        const animationEndHandler = () => {
          coinElement.classList.remove('number-changing');
          coinElement.removeEventListener('animationend', animationEndHandler);
        };
        coinElement.removeEventListener('animationend', animationEndHandler);
      }
    };
  }, [displayedCoins, coins, pendingCoinReward]); // Thêm pendingCoinReward vào dependency array


  return (
    // Main container - Added 'h-screen' to ensure it takes full height if needed, and 'overflow-hidden' on the container itself
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-blue-400 to-blue-600 relative overflow-hidden">

      {/* Header section */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg z-20"> {/* Added z-index */}
        {/* Left placeholder */}
        <div className="flex items-center">
           {/* Intentionally left empty */}
        </div>

        {/* Currency display */}
        <div className="flex items-center space-x-2 currency-display-container relative">
          {/* Gems Container */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-800 rounded-lg p-1 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
            <div className="relative mr-1">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-300 to-purple-600 transform rotate-45 border-2 border-purple-700 shadow-md relative z-10 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-1 h-1 bg-white/50 rounded-sm"></div>
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-purple-800/50 rounded-br-lg"></div>
              </div>
              <div className="absolute top-2 left-1 w-1 h-1 bg-purple-200/80 rotate-45 animate-pulse-fast z-20"></div>
            </div>
            <div className="font-bold text-purple-100 text-xs tracking-wide">{gems}</div>
            <div className="ml-1 w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
              <span className="text-white font-bold text-xs">+</span>
            </div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-pulse-fast"></div>
            <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
          </div>

          {/* Coins Container */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-1 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
            <div className="relative mr-1 flex">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-2 border-amber-600 shadow-md relative z-20 flex items-center justify-center">
                <div className="absolute inset-1 bg-yellow-200 rounded-full opacity-60"></div>
                <span className="text-amber-800 font-bold text-xs">$</span>
              </div>
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-2 border-amber-700 shadow-md absolute -left-1 top-0.5 z-10"></div>
            </div>
            <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
              {displayedCoins.toLocaleString()}
            </div>
            <div className="ml-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
              <span className="text-white font-bold text-xs">+</span>
            </div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-pulse-fast"></div>
            <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
          </div>
        </div>
      </div>

      {/* Left UI section */}
      <div className="absolute left-4 bottom-24 flex flex-col space-y-4 z-20"> {/* Added z-index */}
        {[
          // Shop Icon
          {
            icon: (
              <div className="relative">
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div>
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Shop",
            notification: true,
            special: true,
            centered: true
          },
          // Inventory icon
          {
            icon: (
              <div className="relative">
                <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600">
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full border-t border-amber-300"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-100/30 rounded-full animate-pulse-subtle"></div>
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Inventory",
            notification: true,
            special: true,
            centered: true
          }
        ].map((item, index) => (
          <div key={index} className="group">
            {item.special && item.centered ? (
              <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                {item.icon}
                {item.label && (
                  <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                )}
              </div>
            ) : (
              <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 relative shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 flex flex-col items-center justify-center`}>
                {item.icon}
                {item.label && (
                  <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right UI section */}
      <div className="absolute right-4 bottom-24 flex flex-col space-y-4 z-20"> {/* Added z-index */}
        {[
          // Mission icon
          {
            icon: (
              <div className="relative">
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600">
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                  <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center">
                    <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div>
                    <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div>
                    <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Mission",
            notification: true,
            special: true,
            centered: true
          },
          // Blacksmith icon
          {
            icon: (
              <div className="relative">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600">
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                  <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center">
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div>
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div>
                    <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div>
                    <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div>
                    <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div>
                    <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Blacksmith",
            notification: true,
            special: true,
            centered: true
          },
        ].map((item, index) => (
          <div key={index} className="group">
            {item.special && item.centered ? (
                <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                    {item.icon}
                    {item.label && (
                        <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                    )}
                </div>
            ) : (
              <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                {item.icon}
                <span className="text-white text-xs text-center block mt-1">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Treasure chest and remaining chests count */}
      {/* Added z-index to potentially place it above background effects if any */}
      <div className="absolute bottom-24 flex flex-col items-center justify-center w-full z-10">
        <div
          className={`cursor-pointer transition-all duration-300 relative ${isChestOpen ? 'scale-110' : ''} ${chestShake ? 'animate-chest-shake' : ''}`}
          onClick={!isChestOpen && chestsRemaining > 0 ? openChest : null}
          aria-label={chestsRemaining > 0 ? "Mở rương báu" : "Hết rương"}
          role="button"
          tabIndex={chestsRemaining > 0 ? 0 : -1}
        >
          <div className="flex items-center justify-center">
            {/* Chest main body */}
            <div className="flex flex-col items-center">
              {/* Chest top part */}
              <div className="bg-gradient-to-b from-amber-700 to-amber-900 w-32 h-24 rounded-t-xl relative shadow-2xl shadow-amber-950/70 overflow-hidden z-10 border-2 border-amber-600">
                {/* Gold decorative patterns */}
                <div className="absolute inset-x-0 top-0 h-full">
                  <div className="absolute left-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  <div className="absolute right-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                </div>
                {/* Decorative metal corners */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-br border-b border-r border-yellow-600"></div>
                <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-bl from-yellow-300 to-yellow-500 rounded-bl border-b border-l border-yellow-600"></div>
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-tr border-t border-r border-yellow-600"></div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>

                {/* Chest closed view */}
                <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="bg-gradient-to-b from-amber-600 to-amber-800 h-7 w-full absolute top-0 rounded-t-xl flex justify-center items-center overflow-hidden border-b-2 border-amber-500/80">
                    <div className="relative">
                      <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/50">
                        <div className="w-2 h-2 bg-yellow-100 rounded-full animate-pulse-subtle"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center h-full pt-7 pb-4">
                    <div className="bg-gradient-to-b from-amber-600 to-amber-800 w-16 h-14 rounded-lg flex justify-center items-center border-2 border-amber-500/80 relative shadow-inner shadow-amber-950/50">
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 w-full bg-gradient-to-r from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 w-7 h-7 rounded-md shadow-inner shadow-yellow-100/50 relative overflow-hidden transform rotate-45">
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/50 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 bg-yellow-600/40 w-full h-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chest open state */}
                <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="bg-gradient-to-b from-amber-700 to-amber-900 h-10 w-full absolute top-0 rounded-t-xl transform origin-bottom animate-lid-open flex justify-center items-center overflow-hidden border-2 border-amber-600">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-600/50 to-amber-800/50 flex justify-center items-center">
                      <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                    </div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-tr border-t border-r border-yellow-600"></div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>
                  </div>

                  {showShine && (
                    <div className="absolute inset-0 top-0 flex justify-center items-center overflow-hidden">
                      <div className="w-40 h-40 bg-gradient-to-b from-yellow-100 to-transparent rounded-full animate-pulse-fast opacity-60"></div>
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={`ray-${i}`}
                          className="absolute w-1.5 h-32 bg-gradient-to-t from-yellow-100/0 via-yellow-100/80 to-yellow-100/0 opacity-80 animate-ray-rotate"
                          style={{ transform: `rotate(${i * 22.5}deg)`, transformOrigin: 'center' }}
                        ></div>
                      ))}
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={`particle-${i}`}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-gold-particle"
                          style={{
                            left: '50%',
                            top: '50%',
                            animationDelay: `${i * 0.05}s`,
                            '--random-x': `${Math.random() * 200 - 100}px`,
                            '--random-y': `${Math.random() * 200 - 100}px`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  <div className="h-full flex justify-center items-center relative">
                    <div className="absolute inset-2 top-7 bottom-4 bg-gradient-to-b from-amber-600/30 to-amber-800/30 rounded-lg shadow-inner shadow-amber-950/50"></div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full shadow-md shadow-amber-950/50"></div>
                    <div className="absolute bottom-5 left-8 w-2 h-2 bg-yellow-300 rounded-full shadow-md shadow-amber-950/50"></div>
                    <div className="absolute bottom-4 right-6 w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-md shadow-amber-950/50"></div>

                    {showCard ? (
                      <div className={`w-16 h-22 mx-auto rounded-lg shadow-xl animate-float-card flex flex-col items-center justify-center relative z-10 ${currentCard?.background}`}>
                        <div className="text-3xl mb-2" style={{ color: currentCard?.color }}>
                          {currentCard?.icon}
                        </div>
                      </div>
                    ) : (
                      <div className="animate-bounce w-10 h-10 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 relative z-10">
                        <div className="absolute inset-1 bg-gradient-to-br from-white/80 to-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-500 to-amber-700 border-t-2 border-amber-600/80 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                </div>
              </div>

              {/* Chest base */}
              <div className="flex flex-col items-center relative -mt-1 z-0">
                {/* Base elements removed */}
              </div>
            </div>
          </div>


          {/* Display remaining chests count */}
          <div className="mt-4 flex flex-col items-center">
            <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
              {chestsRemaining > 0 && (
                <div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>
              )}
              <div className="flex items-center">
                <span className="text-amber-200 font-bold text-xs">{chestsRemaining}</span>
                <span className="text-amber-400/80 text-xs">/{3}</span>
              </div>
              {chestsRemaining > 0 && (
                <div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Card info popup */}
      {showCard && currentCard && (
        // Added z-index to ensure popup is on top
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700 relative"> {/* Added relative positioning */}
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>

            <div className="text-xl font-bold text-white mb-6">Bạn nhận được</div>

            <div
              className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative ${currentCard.background}`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
              </div>

              <div className="text-6xl mb-2" style={{ color: currentCard.color }}>
                 {currentCard.icon}
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
              <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>

              <div className="flex mt-3">
                {[...Array(
                  currentCard.rarity === "legendary" ? 5 :
                  currentCard.rarity === "epic" ? 4 :
                  currentCard.rarity === "rare" ? 3 : 2
                )].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={16}
                    className={getRarityColor(currentCard.rarity)}
                    fill="currentColor"
                    color="currentColor"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={resetChest}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-8 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      {/* Added global style to disable body scroll */}
      <style jsx global>{`
        body {
          overflow: hidden; /* Disable scrolling on the body */
        }
      `}</style>
      <style jsx>{`
        /* Add base styles for SVG icons if needed */
        .lucide-icon {
          display: inline-block;
          vertical-align: middle;
        }

        @keyframes float-card {
          0% { transform: translateY(0px) rotate(0deg); filter: brightness(1); }
          25% { transform: translateY(-15px) rotate(2deg); filter: brightness(1.2); }
          50% { transform: translateY(-20px) rotate(0deg); filter: brightness(1.3); }
          75% { transform: translateY(-15px) rotate(-2deg); filter: brightness(1.2); }
          100% { transform: translateY(0px) rotate(0deg); filter: brightness(1); }
        }
        @keyframes chest-shake {
          0% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-4px) rotate(-3deg); }
          20% { transform: translateX(4px) rotate(3deg); }
          30% { transform: translateX(-4px) rotate(-3deg); }
          40% { transform: translateX(4px) rotate(3deg); }
          50% { transform: translateX(-4px) rotate(-2deg); }
          60% { transform: translateX(4px) rotate(2deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ray-rotate {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
        @keyframes shine {
          0% { transform: translateX(-200px) rotate(45deg); }
          100% { transform: translateX(400px) rotate(45deg); }
        }
        @keyframes slide-down {
          0% { transform: translateY(-20px) translateX(-50%); opacity: 0; }
          10% { transform: translateY(0) translateX(-50%); opacity: 1; }
          90% { transform: translateY(0) translateX(-50%); opacity: 1; }
          100% { transform: translateY(-20px) translateX(-50%); opacity: 0; }
        }
        @keyframes gold-particle {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translate(
              calc(-50% + var(--random-x)),
              calc(-50% + var(--random-y))
            ) scale(0);
            opacity: 0;
          }
        }
        @keyframes lid-open {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-100%) rotate(60deg); }
        }
        .animate-float-card {
          animation: float-card 3s ease-in-out infinite;
        }
        .animate-chest-shake {
          animation: chest-shake 0.6s ease-in-out;
        }
        .animate-twinkle {
          animation: twinkle 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-ray-rotate {
          animation: ray-rotate 2s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine 2s linear infinite;
        }
        @keyframes slide-down {
          0% { transform: translateY(-20px) translateX(-50%); opacity: 0; }
          10% { transform: translateY(0) translateX(-50%); opacity: 1; }
          90% { transform: translateY(0) translateX(-50%); opacity: 1; }
          100% { transform: translateY(-20px) translateX(-50%); opacity: 0; }
        }
        .animate-gold-particle {
          animation: gold-particle 1.5s ease-out forwards;
        }
        .animate-lid-open {
          animation: lid-open 0.5s ease-out forwards;
        }
        .inventory-icon-text {
          font-size: 0.65rem;
          margin-top: 0.125rem;
        }
        @keyframes pulse-button {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .add-button-pulse {
          animation: pulse-button 1.5s infinite;
        }
        @keyframes number-change {
          0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); }
          100% { color: #fff; text-shadow: none; transform: scale(1); }
        }
        .number-changing {
          animation: number-change 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Standard App wrapper for rendering
const App = () => {
  return (
    <div className="App">
      <TreasureChestGame />
    </div>
  );
};

export default App;

// Add rendering logic for the browser environment
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
} else {
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    ReactDOM.render(<App />, newRoot);
}
