import React, { useState, useEffect } from 'react'; // Import React
import ResetStatsControl from './reset-points.tsx'; // Import component mới
import BackButton from '../footer-back.tsx'; // Import the new BackButton component
import CoinDisplay from '../coin-display.tsx'; // Import the CoinDisplay component
import { auth } from '../firebase.js'; // Import auth để lấy user ID
import HeaderBackground from '../header-background.tsx'; // Import HeaderBackground

// Custom Icon component using inline SVG (Kept here as it's used elsewhere in this component)
// This component will still be used for other icons like Sword, Shield, etc.
const Icon = ({ name, size = 24, className = '' }) => {
  const icons = {
    Shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
    Sword: <path d="M14.5 17.5L3 6 6 3l11.5 11.5L22 11l-3-3 3-3-3-3-3 3-3-3L6 6l11.5 11.5zM14.5 17.5l-3-3M14.5 17.5L11 21l3.5-3.5z"></path>,
    Heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>,
    Stars: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>,
    Brain: <path d="M12 15c.68-1.32 1-2.8 1-4.4C13 6.4 10.8 2 7.5 2 4.2 2 2 6.4 2 10.6c0 4.2 2.2 8.6 5.5 8.6 2.12 0 3.6-.8 4.5-2.4zM12 15c-.68-1.32-1-2.8-1-4.4C11 6.4 13.2 2 16.5 2c3.3 0 5.5 4.4 5.5 8.6 0 4.2-2.2 8.6-5.5 8.6-2.12 0-3.6-.8-4.5-2.4z"></path>,
    Trophy: <g><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14l2 2 2-2M12 17v5"></path><path d="M12 17a5 5 0 0 1-5-5V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7a5 5 0 0 1-5 5z"></path></g>,
    Zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
    Crosshair: <g><circle cx="12" cy="12" r="10"></circle><path d="M22 12h-4"></path><path d="M6 12H2"></path><path d="M12 6V2"></path><path d="M12 22v-4"></path></g>,
    Plus: <g><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></g>,
    Minus: <line x1="5" y1="12" x2="19" y2="12"></line>,
    AlertCircle: <g><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></g>,
    // Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>, // Removed inline Gem icon
    Coins: <g><circle cx="12" cy="12" r="10"/><circle cx="16" cy="8" r="6"/></g>,
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
  };

  if (!icons[name]) {
    console.warn(`Icon component: Icon with name "${name}" not found.`);
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-${name.toLowerCase()} ${className}`}
    >
      {icons[name]}
    </svg>
  );
};


// Define props interface, including the new onClose prop AND coin props
interface CharacterCardProps {
  onClose?: () => void; // Optional function to call when closing
  coins: number; // Added coins prop
  onUpdateCoins: (amount: number) => Promise<void>; // Added function to update coins
}


// Update component signature to accept onClose prop AND coin props
export default function CharacterCard({ onClose, coins, onUpdateCoins }: CharacterCardProps) {
  // State for character data (excluding coins, which comes from props)
  const [character, setCharacter] = useState({
    title: "Chiến Binh", // Giữ nguyên state nhưng không hiển thị
    level: 75, // Giữ nguyên state nhưng không hiển thị
    stats: {
      atk: 92,
      def: 78,
      hp: 1250,
      luck: 68,
      wit: 85,
      crt: 73
    },
    skills: ["Chém Nhanh", "Phòng Thủ", "Kỹ Năng Đặc Biệt"],
    elements: [], // Removed elements from state
    rank: "Cao Thủ", // Giữ nguyên state nhưng không hiển thị
    // coins: 3850 // REMOVED: Coins are now handled by props
  });

  // State for stat points allocation
  const [statPoints, setStatPoints] = useState(11);
  const [showPointsPanel, setShowPointsPanel] = useState(false);
  const [tempStats, setTempStats] = useState({...character.stats});
  const [glowEffect, setGlowEffect] = useState(false);

  // State for Coin and Point exchange modal
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(100);
  const [exchangeDirection, setExchangeDirection] = useState('coinToPoint'); // or 'pointToCoin'

  // REMOVED: State to control the visibility of the Reset Stats Modal
  // const [showResetModal, setShowResetModal] = useState(false);


  // Effect for card glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowEffect(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // State for stat point increase/decrease animation
  const [pointAnimation, setPointAnimation] = useState({
    active: false,
    stat: null
  });

  // State for badge pulse animations (kept state, removed pulsing effect)
  const [pointBadgePulse, setPointBadgePulse] = useState(false);
  const [coinBadgePulse, setCoinBadgePulse] = useState(false);

  // URL for the new points icon image
  const pointsIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/game.png";
  const pointsIconPlaceholderUrl = "https://placehold.co/16x16/800080/ffffff?text=P"; // Placeholder for points icon


  // Function to increase a stat value
  const increaseStat = (stat) => {
    if (statPoints > 0) {
      // Trigger animation effect
      setPointAnimation({
        active: true,
        stat: stat
      });

      setTimeout(() => {
        setPointAnimation({
          active: false,
          stat: null
        });
      }, 800); // Animation duration

      // Update temporary stats based on stat type
      const newTempStats = {...tempStats};
      if (stat === 'hp') {
        newTempStats[stat] += 25; // HP increases by 25 per point
      } else {
        newTempStats[stat] += 2; // Other stats increase by 2 per point
      }

      setTempStats(newTempStats);
      setStatPoints(statPoints - 1); // Decrease available points
    }
  };

  // Function to decrease a stat value
  const decreaseStat = (stat) => {
    const originalStat = character.stats[stat]; // Get the original stat value before allocation
    // Only allow decrease if the temporary stat is higher than the original
    if (tempStats[stat] > originalStat) {
      const newTempStats = {...tempStats};

      // Decrease stats based on the corresponding increase rate
      if (stat === 'hp') {
        newTempStats[stat] -= 25;
      } else {
        newTempStats[stat] -= 2;
      }

      setTempStats(newTempStats);
      setStatPoints(statPoints + 1); // Increase available points back
    }
  };

  // Function to apply the allocated stat changes
  const applyChanges = () => {
    // Update the main character stats with the temporary stats
    setCharacter({
      ...character,
      stats: {...tempStats}
    });
    // TODO: Implement Firestore update for stats here if needed
    setShowPointsPanel(false); // Hide the allocation panel
  };

  // Function to cancel the stat allocation process
  const cancelChanges = () => {
    // Calculate how many points were added temporarily
    const pointsAdded = Object.entries(tempStats).reduce((total, [key, value]) => {
        const originalValue = character.stats[key];
        if (key === 'hp') {
          // Calculate points added for HP (1 point per 25 HP)
          return total + Math.floor((value - originalValue) / 25);
        } else {
          // Calculate points added for other stats (1 point per 2 stat value)
          return total + Math.floor((value - originalValue) / 2);
        }
      }, 0);

    // Revert temporary stats to the original character stats
    setTempStats({...character.stats});
    // Add the temporarily used points back to the available points
    setStatPoints(statPoints + pointsAdded);
    setShowPointsPanel(false); // Hide the allocation panel
  };

  // Function to handle the actual state update after reset is confirmed in the child component
  const handleActualReset = (pointsRefunded: number) => {
     // Define base stats (all set to 0)
     const baseStats = {
       atk: 0,
       def: 0,
       hp: 0,
       luck: 0,
       wit: 0,
       crt: 0
     };

     // Update character stats to base stats
     setCharacter({
       ...character,
       stats: baseStats
     });

     // Update temporary stats to base stats
     setTempStats(baseStats);
     // Add the refunded points to the available stat points
     setStatPoints(statPoints + pointsRefunded);
     // TODO: Implement Firestore update for stats after reset if needed
     // REMOVED: Close the reset modal after successful reset (modal state removed)
     // setShowResetModal(false);
  };


  // Function to handle the coin/point exchange
  const handleExchange = async () => { // Made async because onUpdateCoins is async
    if (exchangeDirection === 'coinToPoint') {
      // Exchange Coins for Points (100 Coins = 1 Point)
      if (coins >= exchangeAmount) { // Check if enough coins (using coins prop)
        // Update coins in Firestore via the prop function
        if (auth.currentUser) {
            await onUpdateCoins(-exchangeAmount); // Deduct coins
        } else {
            console.error("User not authenticated for coin update.");
            // Handle error or inform user
            return; // Stop if not authenticated
        }

        setStatPoints(statPoints + Math.floor(exchangeAmount / 100)); // Add points
        // Trigger point badge pulse effect
        setPointBadgePulse(true);
        setTimeout(() => setPointBadgePulse(false), 1500);
      } else {
          console.log("Not enough coins for exchange.");
          // Optionally show an error message to the user
      }
    } else {
      // Exchange Points for Coins (1 Point = 100 Coins)
      if (statPoints >= exchangeAmount) { // Check if enough points
         // Update coins in Firestore via the prop function
         if (auth.currentUser) {
            await onUpdateCoins(exchangeAmount * 100); // Add coins
         } else {
            console.error("User not authenticated for coin update.");
            // Handle error or inform user
            return; // Stop if not authenticated
         }

        setStatPoints(statPoints - exchangeAmount); // Deduct points
        // Trigger coin badge pulse effect
        setCoinBadgePulse(true);
        setTimeout(() => setCoinBadgePulse(false), 1500);
      } else {
          console.log("Not enough points for exchange.");
          // Optionally show an error message to the user
      }
    }
    setShowExchangeModal(false); // Close the exchange modal
  };

  // Function to adjust the amount for exchange
  const adjustExchangeAmount = (amount) => {
    const newAmount = exchangeAmount + amount;
    // Ensure the amount doesn't go below 1
    if (newAmount >= 1) {
      setExchangeAmount(newAmount);
    }
  };


  // Function to render the stats display (view or edit mode)
  const renderStats = (isEditMode = false) => {
    // Use temporary stats if in edit mode, otherwise use character stats
    const stats = isEditMode ? tempStats : character.stats;
    // Define the list of stats to display
    const statsList = [
      { name: "ATK", value: stats.atk, icon: <Icon name="Sword" size={18} />, color: "rose", key: "atk" },
      { name: "DEF", value: stats.def, icon: <Icon name="Shield" size={18} />, color: "blue", key: "def" },
      { name: "HP", value: stats.hp, icon: <Icon name="Heart" size={18} />, color: "red", key: "hp" },
      { name: "LUCK", value: stats.luck, icon: <Icon name="Stars" size={18} />, color: "purple", key: "luck" },
      { name: "INT", value: stats.wit, icon: <Icon name="Brain" size={18} />, color: "emerald", key: "wit" },
      { name: "CRT", value: stats.crt, icon: <Icon name="Crosshair" size={18} />, color: "amber", key: "crt" }
    ];

    // Helper function to get color scheme based on stat type
    const getStatColor = (statColor) => {
      switch(statColor) {
        case "rose": return { bg: "bg-rose-500", text: "text-rose-500", light: "bg-rose-100" };
        case "blue": return { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-100" };
        case "red": return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-100" };
        case "purple": return { bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-100" };
        case "emerald": return { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-100" };
        case "amber": return { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-100" };
        default: return { bg: "bg-gray-500", text: "text-gray-500", light: "bg-gray-100" };
      }
    };

    return (
      <div className="grid grid-cols-2 gap-3">
        {statsList.map((stat, index) => {
          const colorScheme = getStatColor(stat.color);
          const isSpecial = stat.name === "HP"; // HP has different display/calculation
          // Check if the stat value has increased in edit mode
          const isIncreased = isEditMode && stats[stat.key] > character.stats[stat.key];
          // Check if icon is valid before cloning
          const statIconElement = stat.icon && React.isValidElement(stat.icon)
              ? React.cloneElement(stat.icon, { size: 16 })
              : null; // Render null if icon is invalid

          return (
            // MODIFIED: Reverted background and border colors for light mode
            <div key={stat.key} // Use stat key for more stable key
                 className={`${index >= 4 ? "col-span-1" : ""} bg-white rounded-xl shadow-sm border ${isIncreased ? 'border-green-200' : 'border-gray-100'} overflow-hidden relative transition-all duration-300`}>
              {/* Subtle background glow effect */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 ${colorScheme.bg}`}></div>

              {/* Animation overlay when stat increases */}
              {pointAnimation.active && pointAnimation.stat === stat.key && (
                <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse"></div>
              )}

              {/* Main content container */}
              <div className="p-3 flex flex-col relative">
                {/* Top row: Icon and Stat Name */}
                <div className="flex items-center justify-center mb-1">
                  {/* Icon container */}
                  {/* MODIFIED: Reverted light background color for light mode */}
                  <div className={`w-8 h-8 ${colorScheme.light} rounded-lg flex items-center justify-center mr-3 relative overflow-hidden`}>
                    <div className={`absolute -bottom-3 -right-3 w-6 h-6 ${colorScheme.bg} opacity-20 rounded-full`}></div>
                    {/* Render the validated icon element */}
                    {statIconElement && <span className={colorScheme.text}>{statIconElement}</span>}
                  </div>
                  {/* Stat name */}
                  {/* MODIFIED: Reverted text color for light mode */}
                  <h4 className="text-xs font-semibold text-gray-500">{stat.name}</h4>
                </div>

                {/* Bottom row: Stat Value and Edit Buttons (if applicable) */}
                {isEditMode ? (
                  // Edit Mode Layout: Minus Button - Value - Plus Button
                  <div className="flex items-center justify-around w-full">
                    {/* Decrease Button */}
                    {/* MODIFIED: Reverted colors for light mode */}
                    <button
                      onClick={() => decreaseStat(stat.key)}
                      disabled={stats[stat.key] <= character.stats[stat.key]} // Disable if value is at original or lower
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${stats[stat.key] <= character.stats[stat.key] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Icon name="Minus" size={16} />
                    </button>

                    {/* Stat Value Display */}
                    {/* MODIFIED: Reverted background and border colors for light mode */}
                    <div className="flex items-center justify-center">
                      <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                        {isSpecial ? stats[stat.key].toLocaleString() : stats[stat.key]} {/* Format HP with commas */}
                      </p>
                    </div>

                    {/* Increase Button */}
                    {/* MODIFIED: Reverted colors for light mode */}
                    <button
                      onClick={() => increaseStat(stat.key)}
                      disabled={statPoints <= 0} // Disable if no points available
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${statPoints <= 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                  </div>
                ) : (
                  // View Mode Layout: Centered Value
                  <div className="flex items-center justify-center">
                    {/* MODIFIED: Reverted background and border colors for light mode */}
                    <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                      {isSpecial ? stats[stat.key].toLocaleString() : stats[stat.key]} {/* Format HP with commas */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render a skill badge
  const renderSkillBadge = (skill, index) => {
    // Define color gradients for badges
    const colors = [
      "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
    ];
    // Get icon elements safely
    let skillIcon = null;
    if (index === 0) skillIcon = <Icon name="Sword" size={14} />;
    if (index === 1) skillIcon = <Icon name="Shield" size={14} />;
    if (index === 2) skillIcon = <Icon name="Zap" size={14} />;


    return (
      <span
        key={index}
        className={`${colors[index % colors.length]} px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        {/* Render the icon only if it's valid */}
        {skillIcon}
        {skill}
      </span>
    );
  };


  // Component for the Coin/Point Exchange Modal
  const ExchangeModal = () => {
    // Calculate the result of the exchange based on direction and amount
    const getResult = () => {
      if (exchangeDirection === 'coinToPoint') {
        return Math.floor(exchangeAmount / 100); // 100 Coins = 1 Point
      } else {
        return exchangeAmount * 100; // 1 Point = 100 Coins
      }
    };

    // Check if the user has enough resources for the selected exchange
    const hasEnoughResources = () => {
      if (exchangeDirection === 'coinToPoint') {
        return coins >= exchangeAmount; // Use coins prop
      } else {
        return statPoints >= exchangeAmount;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal Content Container */}
        {/* MODIFIED: Reverted background gradient and text colors for light mode */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all text-gray-800">

          {/* Exchange Direction Selection */}
          <div className="mb-5">
            {/* Toggle Buttons */}
            {/* MODIFIED: Reverted background colors for light mode */}
            <div className="bg-gray-100 p-1 rounded-lg flex mb-2">
              <button
                onClick={() => setExchangeDirection('coinToPoint')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  exchangeDirection === 'coinToPoint' ?
                  'bg-white shadow-sm text-indigo-600' : // Active style
                  'text-gray-500 hover:bg-gray-50' // Inactive style
                }`}
              >
                <Icon name="Coins" size={16} />
                Coin → Point
              </button>
              <button
                onClick={() => setExchangeDirection('pointToCoin')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  exchangeDirection === 'pointToCoin' ?
                  'bg-white shadow-sm text-amber-600' : // Active style
                  'text-gray-500 hover:bg-gray-50' // Inactive style
                }`}
              >
                {/* Use the image for the Point icon here */}
                 <img src={pointsIconUrl} alt="Point Icon" className="w-4 h-4" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }} />
                Point → Coin
              </button>
            </div>
            {/* Helper Text */}
            {/* MODIFIED: Reverted text color for light mode */}
            <div className="text-xs text-gray-500 italic text-center">
              Chọn loại tài nguyên bạn muốn chuyển đổi
            </div>
          </div>

          {/* Amount Selection */}
          <div className="mb-5">
            {/* Header with current resource amount */}
            {/* MODIFIED: Reverted text color for light mode */}
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span>Số lượng chuyển đổi</span>
              {/* MODIFIED: Reverted text color for light mode */}
              <div className="ml-auto text-xs text-gray-500">
                {exchangeDirection === 'coinToPoint' ?
                  `Hiện có: ${coins.toLocaleString()} Coin` : // Use coins prop
                  `Hiện có: ${statPoints} Point`
                }
              </div>
            </h4>
            {/* Input and Adjustment Buttons */}
            {/* MODIFIED: Reverted background and border colors for light mode */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
              {/* Decrease Button */}
              {/* MODIFIED: Reverted colors for light mode */}
              <button
                onClick={() => adjustExchangeAmount(-100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Minus" size={18} />
              </button>
              {/* Amount Input */}
              {/* MODIFIED: Reverted background, border, and text colors for light mode */}
              <div className="flex-1 mx-2">
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))} // Ensure value is at least 1
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-gray-700"
                />
              </div>
              {/* Increase Button */}
              {/* MODIFIED: Reverted colors for light mode */}
              <button
                onClick={() => adjustExchangeAmount(100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Plus" size={18} />
              </button>
            </div>
            {/* Exchange Rate Info */}
            {/* MODIFIED: Reverted text color for light mode */}
            <div className="text-xs text-gray-500 italic text-center mt-1">
              {exchangeDirection === 'coinToPoint' ?
                '100 Coin = 1 Point' :
                '1 Point = 100 Coin'
              }
            </div>
          </div>

          {/* Exchange Result Preview */}
          {/* MODIFIED: Reverted background color for light mode */}
          <div className="mb-5 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {/* Result Icon */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {exchangeDirection === 'coinToPoint' ? (
                  // Point Icon with pulse effect - Use the image here
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
                    {/* Use the image tag for the point icon */}
                    <img src={pointsIconUrl} alt="Point Icon" className="w-6 h-6 absolute inset-0 m-auto" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }} />
                  </div>
                ) : (
                  // Coin Icon with pulse effect
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 animate-pulse"></div>
                    <Icon name="Coins" size={24} className="absolute inset-0 m-auto text-white" />
                  </div>
                )}
              </div>
              {/* Result Text */}
              {/* MODIFIED: Reverted text color for light mode */}
              <div className="flex-1">
                <div className="text-sm text-gray-500">Bạn sẽ nhận được:</div>
                <div className="font-bold text-lg text-gray-800 flex items-center">
                  {getResult().toLocaleString()} {/* Format result with commas */}
                  <span className="ml-1 text-sm">
                    {exchangeDirection === 'coinToPoint' ? 'Point' : 'Coin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message (if not enough resources) */}
          {/* MODIFIED: Reverted background and border colors for light mode */}
          {!hasEnoughResources() && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex">
                <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" /> {/* Reverted text color */}
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Không đủ tài nguyên</h4> {/* Reverted text color */}
                  <p className="text-red-700 text-xs"> {/* Reverted text color */}
                    {exchangeDirection === 'coinToPoint' ?
                      `Bạn cần tối thiểu ${exchangeAmount.toLocaleString()} Coin để thực hiện chuyển đổi này.` :
                      `Bạn cần tối thiểu ${exchangeAmount.toLocaleString()} Point để thực hiện chuyển đổi này.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Cancel Button */}
            {/* MODIFIED: Reverted colors for light mode */}
            <button
              onClick={() => setShowExchangeModal(false)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            {/* Exchange Button */}
            {/* MODIFIED: Reverted disabled background color for light mode */}
            <button
              onClick={handleExchange}
              disabled={!hasEnoughResources()} // Disable if not enough resources
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                hasEnoughResources() ?
                'bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700' : // Enabled style
                'bg-gray-400 cursor-not-allowed' // Disabled style - Reverted color
              }`}
            >
              Chuyển Đổi
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    // Main container using flexbox to manage layout
    // h-screen makes it take full viewport height
    // REVISED: Added rounded-lg, overflow-hidden, relative, shadow-2xl to match game container
    // Added border-b, border-l, border-r, and border-slate-700/50 for the bottom border
    <div className="flex flex-col h-screen bg-white rounded-lg overflow-hidden relative shadow-2xl
                border-b border-l border-r border-slate-700/50"> {/* Added bottom borders */}
      {/* Added the glass-shadow-border CSS style - Keep if needed elsewhere */}
      {/* <style>{`
        .glass-shadow-border {
            box-shadow:
                0 2px 4px rgba(0, 0, 0, 0.4),
                0 4px 8px rgba(0, 0, 0, 0.3),
                inset 0 -1px 2px rgba(255, 255, 255, 0.15);
        }
      `}</style> */}
       {/* Add necessary styles for animations used here */}
      <style jsx>{`
        @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
         @keyframes glow {
            0%, 100% { text-shadow: 0 0 5px #a78bfa; } /* Purple glow */
            50% { text-shadow: 0 0 10px #c4b5fd, 0 0 12px #a78bfa; }
        }
        .animate-glow {
            animation: glow 3s infinite alternate;
        }
      `}</style>

      {/* Header section (fixed at the top) */}
      {/* flex-shrink-0 prevents it from shrinking */}
      {/* Position relative to allow absolute positioning of background and badges */}
      {/* Applied styling from background-game.tsx header for consistent look */}
      {/* Removed rounded-b-lg from header itself, as parent container handles overall rounding */}
      <div className="flex-shrink-0 relative h-12 flex items-center justify-end px-3 overflow-hidden
                  rounded-b-lg {/* <-- Added rounded-b-lg here */}
                  shadow-2xl
                  bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                  border-b border-l border-r border-slate-700/50"> {/* Kept top borders for header */}
        {/* Insert HeaderBackground here */}
        {/* Use absolute positioning to cover the header area */}
        <div className="absolute inset-0 z-0">
          <HeaderBackground />
        </div>

        {/* Left side of the header - Now empty as stats icon and health bar are removed */}
        {/* Keeping the div structure for flex layout, but it will be empty */}
        <div className="flex items-center relative z-10">
            {/* Removed Stats Icon */}
            {/* Removed Health Bar */}
        </div>


        {/* Right side of the header (Coin Display, Exchange Button, Points Badge) */}
        {/* Ensure z-index is higher than the background */}
        {/* Adjusted spacing and relative z-10 */}
        <div className="relative flex items-center space-x-2 overflow-hidden z-10"> {/* Removed justify-end */}

          {/* Use the CoinDisplay component here */}
          {/* Pass the coins prop to CoinDisplay */}
          {/* Adjusted text color for dark background */}
          <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} className="text-white" /> {/* Changed text color to white */}

          {/* Exchange Button */}
          {/* Adjusted colors for dark background */}
          <button
            onClick={() => setShowExchangeModal(true)} // Opens the exchange modal
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-medium transition-colors hover:bg-gray-600 flex items-center justify-center border border-gray-600" // Adjusted colors
            title="Chuyển đổi Coin/Point"
          >
            Exchange
          </button>

          {/* Points Badge - Styled to match Coin Display */}
          {/* Applied similar styling classes */}
          <div className={`bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${pointBadgePulse ? 'animate-pulse' : ''}`}>
             {/* Absolute positioned div for hover glow effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

            {/* Icon Container */}
            <div className="relative mr-0.5 flex items-center justify-center z-10"> {/* Added z-10 */}
               {/* Use the image for the Point icon here */}
              <img
                src={pointsIconUrl}
                alt="Point Icon"
                className="w-4 h-4" // Adjust size as needed
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = pointsIconPlaceholderUrl; // Placeholder image
                }}
              />
            </div>
            {/* Points Count */}
            {/* Applied text styling similar to coins */}
            <div className="font-bold text-purple-100 text-xs tracking-wide animate-glow z-10"> {/* Added z-10 and animate-glow */}
              {statPoints}
            </div>
            {/* Plus button next to Points badge (conditionally visible) */}
            {/* Styled to match Coin Display's plus button */}
            <button
              onClick={() => setShowPointsPanel(true)} // Opens the point allocation panel
              className={`ml-0.5 w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse z-10 ${!showPointsPanel && statPoints > 0 ? '' : 'invisible pointer-events-none'}`} // Added z-10 and visibility logic
              disabled={!(!showPointsPanel && statPoints > 0)}
            >
              <span className="text-white font-bold text-xs">+</span> {/* Text size remains xs */}
            </button>
             {/* Small absolute positioned divs for subtle animations */}
            <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast z-10"></div> {/* Added z-10 */}
            <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast z-10"></div> {/* Added z-10 */}
          </div>
        </div>
      </div>

      {/* Main content area - SCROLLABLE */}
      {/* flex-grow makes it take up remaining space */}
      {/* overflow-y-auto enables vertical scrolling */}
      {/* Added padding here */}
      <div className="flex-grow overflow-y-auto p-8">

        {/* Stats Section */}
        {/* Removed px-8 as padding is now on the parent */}
        <div className="mb-8">
            {/* Stats Header */}
            {/* Reverted text and border colors for light mode */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-sm uppercase tracking-wider font-bold text-gray-600 flex items-center">
                <Icon name="Trophy" size={16} className="mr-2 text-gray-500" /> STATS
              </h3>

              {/* "Allocate Points" button (visible if points > 0 and panel is closed) */}
              {statPoints > 0 && !showPointsPanel && (
                <button
                  onClick={() => setShowPointsPanel(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-1.5"
                >
                  <Icon name="Plus" size={14} />
                  Phân bổ {statPoints} điểm
                </button>
              )}

              {/* "Details" indicator (visible if no points or panel is open) */}
              {/* Reverted colors for light mode */}
              {!statPoints && !showPointsPanel && (
                <div className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="3"></circle>
                  </svg>
                  Chi tiết
                </div>
              )}
            </div>

            {/* Point Allocation Panel (conditionally rendered) */}
            {showPointsPanel ? (
              // Reverted background and border colors for light mode
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-4">
                {/* Panel Header */}
                {/* Reverted text color for light mode */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                     {/* Use the image for the Point icon here */}
                    <img src={pointsIconUrl} alt="Point Icon" className="w-6 h-6" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Còn lại: <span className="font-medium text-indigo-600">{statPoints} điểm</span></p>
                  </div> {/* Reverted text color */}
                </div>

                {/* Render stats in edit mode */}
                {renderStats(true)}

                {/* Allocation Tip */}
                {/* Reverted background and text colors for light mode */}
                <div className="bg-blue-50 rounded-lg p-3 mt-4 mb-4 flex items-start">
                  <Icon name="AlertCircle" size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" /> {/* Reverted text color */}
                  <div className="text-xs text-blue-800"> {/* Reverted text color */}
                    <p className="font-medium mb-1">Mẹo phân bổ điểm:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>ATK, DEF, LUCK, INT, CRT: +2 cho mỗi điểm</li>
                      <li>HP: +25 cho mỗi điểm</li>
                    </ul>
                  </div>
                </div>

                 {/* Action Buttons for Allocation Panel */}
                <div className="flex items-center justify-end space-x-2">
                   {/* Cancel Button */}
                   {/* Reverted colors for light mode */}
                   <button
                      onClick={cancelChanges}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                    {/* Apply Button */}
                    <button
                      onClick={applyChanges}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Áp dụng
                    </button>
                </div>
              </div>
            ) : (
              // Render stats in view mode (when allocation panel is closed)
              // Reverted background and border colors for light mode
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                {renderStats()}
              </div>
            )}
          </div>

        {/* Skills Section */}
        {/* Removed px-8 as padding is now on the parent */}
        <div className="mb-8">
          {/* Skills Header */}
          {/* Reverted text and border colors for light mode */}
          <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
            <Icon name="Zap" size={16} className="mr-2 text-gray-400" /> SKILLS
          </h3>
          {/* Skill Badges */}
          <div className="flex flex-wrap gap-3">
            {character.skills.map((skill, index) => renderSkillBadge(skill, index))}
          </div>
        </div>

         {/* Reset Stats Control - Placed back here */}
         {/* Removed px-8 as padding is now on the parent */}
         <div className="mb-8">
           <ResetStatsControl
              currentStats={character.stats} // Truyền chỉ số hiện tại
              onStatsReset={handleActualReset} // Truyền hàm xử lý reset thực tế
              // Assuming ResetStatsControl handles its own modal state internally
              // If it needs an onClose prop to hide itself, you might need to add it back here
              // onClose={() => setShowResetModal(false)} // Example if ResetStatsControl needs this
           />
         </div>


      </div> {/* End of main content area */}


      {/* Render Exchange Modal (conditionally) */}
      {showExchangeModal && <ExchangeModal />}

      {/* Render Reset Stats Modal (conditionally) - REMOVED */}
      {/* The component is now rendered directly in the main content */}
      {/*
      {showResetModal && (
        <ResetStatsControl
           currentStats={character.stats} // Pass current stats
           onStatsReset={handleActualReset} // Pass the actual reset handler
           onClose={() => setShowResetModal(false)} // Pass a function to close the modal
        />
      )}
      */}


      {/* Footer Section - Using the new BackButton component */}
      {/* This will be fixed at the bottom by its own component's styling */}
      {onClose && (
        <BackButton
          onClick={onClose}
          // REMOVED: The reset button is no longer passed as rightContent
          // rightContent={
          //    <button
          //       onClick={() => setShowResetModal(true)} // Set state to show the modal
          //       className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-md transition-colors flex items-center gap-1.5"
          //    >
          //       <Icon name="RotateCcw" size={14} />
          //       Reset Chỉ Số
          //    </button>
          // }
        />
      )}

    </div> // End of main CharacterCard container
  );
}
