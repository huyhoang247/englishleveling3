import React, { useState, useEffect } from 'react';
// Thay thế import từ lucide-react bằng các icon tùy chỉnh
import { BellIcon, CalendarIcon, ChevronRightIcon, ClockIcon, MapPinIcon, PenIcon, SwordIcon, ShieldIcon, CrownIcon, GemIcon, StarIcon, ShoppingBagIcon, AwardIcon, AlertTriangleIcon, UserIcon, HomeIcon, GiftIcon } from "./icons";
import ReactDOM from 'react-dom'; // Import ReactDOM for rendering

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
  // Removed showNotification state
  // const [showNotification, setShowNotification] = useState(false);
  // State to track remaining chests
  const [chestsRemaining, setChestsRemaining] = useState(3); // Assume 3 initial chests

  // State để lưu trữ phần thưởng coins tạm thời trước khi đếm
  const [pendingCoinReward, setPendingCoinReward] = useState(0);

  const cards = [
    // Sử dụng các icon tùy chỉnh
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

      // Cập nhật giá trị coins thực tế sau khi hiệu ứng đếm kết thúc
      // setCoins(newCoins); // Tạm thời không cập nhật ở đây nữa, sẽ cập nhật khi animation kết thúc

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

        // --- Đã xóa phần code thêm hiệu ứng đếm và thông báo +coin tại đây ---
        // const oldCoins = coins;
        // const newCoins = oldCoins + coinReward;
        // setCoins(newCoins); // Update actual coins value

        // let step = Math.ceil(coinReward / 30);
        // let current = oldCoins;
        // const countInterval = setInterval(() => {
        //   current += step;
        //   if (current >= newCoins) {
        //     setDisplayedCoins(newCoins);
        //     clearInterval(countInterval);
        //   } else {
        //     setDisplayedCoins(current);
        //   }
        // }, 50);
        // ------------------------------------------------------------


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

    // Removed setShowNotification(true);
    // setTimeout(() => setShowNotification(false), 2000);

    // Bắt đầu hiệu ứng đếm coins khi đóng popup
    if (pendingCoinReward > 0) {
        startCoinCountAnimation(pendingCoinReward);
    }

    // If you want to reload chests (e.g., after a period or when the player buys more)
    // You can add logic here
    // e.g.: if (chestsRemaining === 0) setChestsRemaining(3);
    // Note: We are not automatically resetting the number of chests here as requested.
  };

  // Removed useEffect for auto-hiding notification
  // useEffect(() => {
  //   // Auto-hide notification after 2 seconds
  //   if (showNotification) {
  //     const timer = setTimeout(() => setShowNotification(false), 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showNotification]);

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
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-blue-400 to-blue-600 relative overflow-hidden">
      {/* Add Tailwind CSS script - This will be added in the HTML wrapper */}
      {/* <script src="https://cdn.tailwindcss.com"></script> */}

      {/* Removed Background sparkles */}
      {/*
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          ></div>
        ))}
      </div>
      */}

      {/* Header section */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg">
        <div className="flex items-center">
          {/* Removed the green shopping bag icon (Shop icon) from Header */}
          {/* Removed Arena challenge section */}
          {/* Removed Quest section */}
        </div>

        {/* Currency display - Compact design */}
<div className="flex items-center space-x-2 currency-display-container relative">
  {/* Gems Container (Moved first) */}
  <div className="bg-gradient-to-br from-purple-500 to-purple-800 rounded-lg p-1 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300">
    {/* Background shine effect */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

    {/* Gem icon improved */}
    <div className="relative mr-1">
      <div className="w-4 h-4 bg-gradient-to-br from-purple-300 to-purple-600 transform rotate-45 border-2 border-purple-700 shadow-md relative z-10 flex items-center justify-center">
        {/* Light reflection */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-white/50 rounded-sm"></div>
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-purple-800/50 rounded-br-lg"></div>
      </div>
      <div className="absolute top-2 left-1 w-1 h-1 bg-purple-200/80 rotate-45 animate-pulse-fast z-20"></div>
    </div>

    {/* Counter simplified */}
    <div className="font-bold text-purple-100 text-xs tracking-wide">{gems}</div>

    {/* Add button */}
    <div className="ml-1 w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
      <span className="text-white font-bold text-xs">+</span>
    </div>

    {/* Sparkle effects */}
    <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
  </div>

  {/* Coins Container */}
  <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-1 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300">
    {/* Background shine effect */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

    {/* Simplified coin stack */}
    <div className="relative mr-1 flex">
      {/* Main coin */}
      <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-2 border-amber-600 shadow-md relative z-20 flex items-center justify-center">
        <div className="absolute inset-1 bg-yellow-200 rounded-full opacity-60"></div>
        <span className="text-amber-800 font-bold text-xs">$</span>
      </div>
      {/* Coin behind */}
      <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-2 border-amber-700 shadow-md absolute -left-1 top-0.5 z-10"></div>
    </div>

    {/* Counter simplified */}
    {/* Update the display of coins */}
    <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
      {displayedCoins.toLocaleString()}
    </div>

    {/* Add button */}
    <div className="ml-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
      <span className="text-white font-bold text-xs">+</span>
    </div>

    {/* Sparkle effects */}
    <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-pulse-fast"></div>
    <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
  </div>
</div>
      </div>

      {/* Left UI section */}
      <div className="absolute left-4 bottom-24 flex flex-col space-y-4">
        {[
          // START: Updated Shop Icon Code - Moved to Left UI section
          {
            icon: (
              <div className="relative">
                {/* Shop Icon with similar size to Inventory */}
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                  {/* Light reflection on shop icon */}
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>

                  {/* Shop icon details */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>

                  {/* Sparkle effect */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div>
                </div>

                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Shop",
            notification: true,
            special: true,
            centered: true // Set centered: true to apply the same style as Inventory
          },
          // END: Updated Shop Icon Code
          // New Inventory icon with nice effect - Adjusted size and effect
          {
            icon: (
              <div className="relative">
                {/* Inventory icon size reduced from w-6 h-6 to w-5 h-5 */}
                <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600">
                  {/* Light reflection on the bag - Adjusted size according to icon */}
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>

                  {/* Bag strap - Adjusted size according to icon */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full border-t border-amber-300"></div>

                  {/* Item sticking out of the bag - Adjusted size according to icon */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div>

                  {/* Sparkle effect of items in the bag - Adjusted size according to icon */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-100/30 rounded-full animate-pulse-subtle"></div>
                </div>

                {/* New item notification badge - Adjusted size according to icon */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Inventory",
            notification: true,
            special: true,
            centered: true // This item needs centering
          }
        ].map((item, index) => (
          <div key={index} className="group">
            {/* Adjusted class for Inventory item to add black background, opacity, padding, and rounded corners */}
            {item.special && item.centered ? (
              // Wrapper div with black background, opacity, padding, and rounded corners - Adjusted width, height, and padding
              <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0"> {/* Increased height to h-14 */}
                {item.icon}
                {item.label && (
                  // Font size and margin top have been made smaller
                  <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span> // Font size 0.65rem, margin top 0.5
                )}
              </div>
            ) : (
              <div className={`${item.special ? 'scale-110 relative transition-all duration-300' : 'bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 relative shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 flex flex-col items-center justify-center'}`}>
                {item.icon}
                {item.notification && !item.special && ( // Only show notification dot for non-special icons
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs shadow-md">1</div>
                )}
                {/* Display label for all items */}
                {item.label && (
                  <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                )}
                {item.special && ( // Add pulse effect for special icons
                  <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-pulse opacity-75 -z-10"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right UI section */}
      <div className="absolute right-4 bottom-24 flex flex-col space-y-4">
        {[
          // This is where the Mission icon is added
          {
            icon: (
              <div className="relative">
                {/* Mission icon with similar style to Inventory/Shop */}
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600">
                  {/* Light reflection on icon */}
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>

                  {/* Mission scroll/map details */}
                  <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center">
                    {/* Mission map lines */}
                    <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div>
                    <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div>

                    {/* Mission target marker */}
                    <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div>
                  </div>
                </div>

                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Mission",
            notification: true,
            special: true,
            centered: true // Set centered: true to apply the same style as other special icons
          },
          // Start adding Blacksmith icon
          {
            icon: (
              <div className="relative">
                {/* Blacksmith icon with similar style to Mission */}
                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600">
                  {/* Light reflection on icon */}
                  <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>

                  {/* Anvil and hammer details */}
                  <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center">
                    {/* Anvil base */}
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div>

                    {/* Anvil top */}
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div>

                    {/* Hammer */}
                    <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div>

                    {/* Hammer handle */}
                    <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div>

                    {/* Sparks effect */}
                    <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div>
                    <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div>
                  </div>
                </div>

                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
              </div>
            ),
            label: "Blacksmith",
            notification: true,
            special: true,
            centered: true
          },
          // End adding Blacksmith icon
          // Removed Pass and Special Offer icons
        ].map((item, index) => (
          <div key={index} className="group">
            {/* Adjusted class for special items in the right section */}
            {item.special && item.centered ? (
                // Wrapper div with black background, opacity, padding, and rounded corners
                <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                    {item.icon}
                    {item.label && (
                        <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                    )}
                </div>
            ) : (
              <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center ${item.glow ? 'animate-pulse-subtle' : ''}`}>
                {item.glow && <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>}
                {item.icon}
                <span className="text-white text-xs text-center block mt-1">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Treasure chest and remaining chests count */}
      <div className="absolute bottom-24 flex flex-col items-center justify-center w-full">
        <div
          className={`cursor-pointer transition-all duration-300 relative ${isChestOpen ? 'scale-110' : ''} ${chestShake ? 'animate-chest-shake' : ''}`}
          // Only allow opening if chests are remaining and the chest is closed
          onClick={!isChestOpen && chestsRemaining > 0 ? openChest : null}
        >
          <div className="flex items-center justify-center">
            {/* Outer glow effect when chest is active - Removed */}
            {/* {!isChestOpen && (
              <div className="absolute w-48 h-48 bg-yellow-500/30 rounded-full animate-pulse-slow blur-md"></div>
            )} */}

            {/* Chest main body */}
            <div className="flex flex-col items-center">
              {/* Chest top part */}
              <div className="bg-gradient-to-b from-amber-700 to-amber-900 w-32 h-24 rounded-t-xl relative shadow-2xl shadow-amber-950/70 overflow-hidden z-10 border-2 border-amber-600">
                {/* Gold decorative patterns */}
                <div className="absolute inset-x-0 top-0 h-full">
                  {/* Vertical bands */}
                  <div className="absolute left-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  <div className="absolute right-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>

                  {/* Horizontal bands */}
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
                    {/* Lock plate with glow */}
                    <div className="relative">
                      <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/50">
                        <div className="w-2 h-2 bg-yellow-100 rounded-full animate-pulse-subtle"></div>
                      </div>
                    </div>
                  </div>

                  {/* Chest front design */}
                  <div className="flex justify-center items-center h-full pt-7 pb-4">
                    <div className="bg-gradient-to-b from-amber-600 to-amber-800 w-16 h-14 rounded-lg flex justify-center items-center border-2 border-amber-500/80 relative shadow-inner shadow-amber-950/50">
                      {/* Decorative cross patterns */}
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 w-full bg-gradient-to-r from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                      </div>

                      {/* Center gem */}
                      <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 w-7 h-7 rounded-md shadow-inner shadow-yellow-100/50 relative overflow-hidden transform rotate-45">
                        {/* Light reflection on gem */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/50 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 bg-yellow-600/40 w-full h-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chest open state */}
                <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Open lid */}
                  {/* Updated lid div with new animation */}
                  <div className="bg-gradient-to-b from-amber-700 to-amber-900 h-10 w-full absolute top-0 rounded-t-xl transform origin-bottom animate-lid-open flex justify-center items-center overflow-hidden border-2 border-amber-600">
                    {/* Inside of lid texture */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-600/50 to-amber-800/50 flex justify-center items-center">
                      <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                    </div>

                    {/* Metal lid corners */}
                    <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-tr border-t border-r border-yellow-600"></div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>
                  </div>

                  {/* Light effects when chest opens */}
                  {/* Updated light effects div position */}
                  {showShine && (
                    <div className="absolute inset-0 top-0 flex justify-center items-center overflow-hidden">
                      {/* Central glow */}
                      <div className="w-40 h-40 bg-gradient-to-b from-yellow-100 to-transparent rounded-full animate-pulse-fast opacity-60"></div>

                      {/* Light rays */}
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={`ray-${i}`} // Added unique key
                          className="absolute w-1.5 h-32 bg-gradient-to-t from-yellow-100/0 via-yellow-100/80 to-yellow-100/0 opacity-80 animate-ray-rotate"
                          style={{ transform: `rotate(${i * 22.5}deg)`, transformOrigin: 'center' }}
                        ></div>
                      ))}

                      {/* Gold particle effects */}
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={`particle-${i}`}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-gold-particle"
                          style={{
                            left: '50%',
                            top: '50%',
                            animationDelay: `${i * 0.05}s`,
                            // Adjust the random range for particle spread if needed
                            '--random-x': `${Math.random() * 200 - 100}px`,
                            '--random-y': `${Math.random() * 200 - 100}px`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Inside chest content area */}
                  {/* Ensured this div remains as specified */}
                  <div className="h-full flex justify-center items-center relative">
                    {/* Interior velvet texture */}
                    <div className="absolute inset-2 top-7 bottom-4 bg-gradient-to-b from-amber-600/30 to-amber-800/30 rounded-lg shadow-inner shadow-amber-950/50"></div>

                    {/* Gold coins scattered in the bottom */}
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full shadow-md shadow-amber-950/50"></div>
                    <div className="absolute bottom-5 left-8 w-2 h-2 bg-yellow-300 rounded-full shadow-md shadow-amber-950/50"></div>
                    <div className="absolute bottom-4 right-6 w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-md shadow-amber-950/50"></div>

                    {/* Content - either card or waiting animation */}
                    {showCard ? (
                      <div className={`w-16 h-22 mx-auto rounded-lg shadow-xl animate-float-card flex flex-col items-center justify-center relative z-10 ${currentCard?.background}`}>
                        <div className="text-3xl mb-2" style={{ color: currentCard?.color }}>
                          {/* Sử dụng icon tùy chỉnh */}
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

                {/* Bottom decorative band (visible in both states) */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-500 to-amber-700 border-t-2 border-amber-600/80 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                </div>
              </div>

              {/* Chest base with 3D effect layers - Updated */}
              {/* Removed the two horizontal div elements */}
              <div className="flex flex-col items-center relative -mt-1 z-0">
                {/* <div className="bg-gradient-to-b from-amber-600 to-amber-700 w-36 h-3 rounded-md shadow-md border-2 border-amber-500"></div> */}
                {/* <div className="bg-gradient-to-b from-amber-700 to-amber-800 w-38 h-4 rounded-md -mt-1 shadow-md border-x-2 border-b-2 border-amber-600"></div> */}
                {/* Removed the last horizontal div */}
                {/* <div className="bg-gradient-to-b from-amber-800 to-amber-900 w-40 h-3 rounded-md -mt-1 shadow-lg border-x-2 border-b-2 border-amber-700"></div> */}
              </div>
            </div>
          </div>


          {/* Display remaining chests count - New design - Moved below the chest */}
          {/* Updated rounded class from rounded-full to rounded-lg */}
          <div className="mt-4 flex flex-col items-center">
            <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
              {/* Background shine effect - Adjusted opacity */}
              {chestsRemaining > 0 && (
                <div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>
              )}

              {/* Mini chest icon - Removed this section */}
              {/* <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Chest top */}
                {/* <div className="absolute top-0 left-0 right-0 h-2 bg-amber-300/50"></div> */}
                {/* Chest lock */}
                {/* <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-amber-200 rounded-sm"></div>
              </div> */}

              {/* Counter */}
              <div className="flex items-center">
                {/* Text colors remain for contrast */}
                <span className="text-amber-200 font-bold text-xs">{chestsRemaining}</span>
                <span className="text-amber-400/80 text-xs">/{3}</span>
              </div>

              {/* Glow effect for emphasis - Adjusted color/opacity */}
              {chestsRemaining > 0 && (
                <div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>
              )}
            </div>

            {/* Warning when out of chests - Removed this section */}
            {/* {chestsRemaining === 0 && !isChestOpen && (
              <div className="whitespace-nowrap mt-1 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                <span className="inline-block animate-pulse mr-1">⏱️</span> Đợi nạp
              </div>
            )} */}
          </div>
        </div>
      </div>


      {/* Card info popup */}
      {showCard && currentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700">
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>

            <div className="text-xl font-bold text-white mb-6">Bạn nhận được</div> {/* Updated text */}

            <div
              className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative ${currentCard.background}`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
              </div>

              <div className="text-6xl mb-2" style={{ color: currentCard.color }}>
                {/* Sử dụng icon tùy chỉnh */}
                {currentCard?.icon}
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
              <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>

              {/* Rarity stars */}
              <div className="flex mt-3">
                {[...Array(
                  currentCard.rarity === "legendary" ? 5 :
                  currentCard.rarity === "epic" ? 4 :
                  currentCard.rarity === "rare" ? 3 : 2
                )].map((_, i) => (
                  // Sử dụng icon tùy chỉnh
                  <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" />
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

      {/* Removed Settings button */}
      {/*
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-700 p-3 rounded-full shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-110 cursor-pointer">
        <Settings size={24} className="text-white" />
      </div>
      */}

      {/* Removed Notification */}
      {/*
      {showNotification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-50% bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 rounded-lg shadow-lg animate-slide-down text-white font-medium">
          Item added to inventory!
        </div>
      )}
      */}

      {/* CSS Styles */}
      <style jsx>{`
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
        /* New lid open animation */
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
        /* Class to apply the new lid open animation */
        .animate-lid-open {
          animation: lid-open 0.5s ease-out forwards;
        }
        /* Added new class for smaller Inventory text */
        .inventory-icon-text {
          font-size: 0.65rem;
          margin-top: 0.125rem;
        }
        /* Removed CSS for +coin notification */
        /*
        @keyframes coin-notification {
          0% { transform: translateY(0); opacity: 0; }
          10% { transform: translateY(-5px); opacity: 1; }
          90% { transform: translateY(-25px); opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .coin-notification {
          position: absolute;
          top: 0;
          right: 0;
          color: #FFD700;
          font-weight: bold;
          font-size: 0.875rem;
          animation: coin-notification 2.5s ease-out forwards;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
        }
        */
        /* New pulse effect for add button on hover */
        @keyframes pulse-button {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .add-button-pulse {
          animation: pulse-button 1.5s infinite;
        }

        /* Add sparkle effect when number changes */
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
// This part is typically handled by a framework like Create React App or Next.js
// but is included here for standalone preview purposes.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
} else {
    // If no root element exists, create one (useful for simple previews)
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    ReactDOM.render(<App />, newRoot);
}

