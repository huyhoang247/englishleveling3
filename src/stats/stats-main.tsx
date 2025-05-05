import React, { useState, useEffect } from 'react'; // Import React
import ResetStatsControl from './reset-points.tsx'; // Import component mới

// Custom Icon component using inline SVG (Kept here as it's used elsewhere in this component)
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
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>,
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


// Define props interface, including the new onClose prop
interface CharacterCardProps {
  onClose?: () => void; // Optional function to call when closing
}


// Update component signature to accept onClose prop
export default function CharacterCard({ onClose }: CharacterCardProps) {
  // State for character data
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
    coins: 3850
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

  // NEW: Function to handle the actual state update after reset is confirmed in the child component
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
  };


  // Function to handle the coin/point exchange
  const handleExchange = () => {
    if (exchangeDirection === 'coinToPoint') {
      // Exchange Coins for Points (100 Coins = 1 Point)
      if (character.coins >= exchangeAmount) { // Check if enough coins
        setCharacter({
          ...character,
          coins: character.coins - exchangeAmount // Deduct coins
        });
        setStatPoints(statPoints + Math.floor(exchangeAmount / 100)); // Add points
        // Trigger point badge pulse effect
        setPointBadgePulse(true);
        setTimeout(() => setPointBadgePulse(false), 1500);
      }
    } else {
      // Exchange Points for Coins (1 Point = 100 Coins)
      if (statPoints >= exchangeAmount) { // Check if enough points
        setCharacter({
          ...character,
          coins: character.coins + (exchangeAmount * 100) // Add coins
        });
        setStatPoints(statPoints - exchangeAmount); // Deduct points
        // Trigger coin badge pulse effect
        setCoinBadgePulse(true);
        setTimeout(() => setCoinBadgePulse(false), 1500);
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
                  <div className={`w-8 h-8 ${colorScheme.light} rounded-lg flex items-center justify-center mr-3 relative overflow-hidden`}>
                    <div className={`absolute -bottom-3 -right-3 w-6 h-6 ${colorScheme.bg} opacity-20 rounded-full`}></div>
                    {/* Render the validated icon element */}
                    {statIconElement && <span className={colorScheme.text}>{statIconElement}</span>}
                  </div>
                  {/* Stat name */}
                  <h4 className="text-xs font-semibold text-gray-500">{stat.name}</h4>
                </div>

                {/* Bottom row: Stat Value and Edit Buttons (if applicable) */}
                {isEditMode ? (
                  // Edit Mode Layout: Minus Button - Value - Plus Button
                  <div className="flex items-center justify-around w-full">
                    {/* Decrease Button */}
                    <button
                      onClick={() => decreaseStat(stat.key)}
                      disabled={stats[stat.key] <= character.stats[stat.key]} // Disable if value is at original or lower
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${stats[stat.key] <= character.stats[stat.key] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Icon name="Minus" size={16} />
                    </button>

                    {/* Stat Value Display */}
                    <div className="flex items-center justify-center">
                      <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                        {isSpecial ? stats[stat.key].toLocaleString() : stats[stat.key]} {/* Format HP with commas */}
                      </p>
                    </div>

                    {/* Increase Button */}
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
        return character.coins >= exchangeAmount;
      } else {
        return statPoints >= exchangeAmount;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal Content Container */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">

          {/* Exchange Direction Selection */}
          <div className="mb-5">
            {/* Toggle Buttons */}
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
                <Icon name="Gem" size={16} />
                Point → Coin
              </button>
            </div>
            {/* Helper Text */}
            <div className="text-xs text-gray-500 italic text-center">
              Chọn loại tài nguyên bạn muốn chuyển đổi
            </div>
          </div>

          {/* Amount Selection */}
          <div className="mb-5">
            {/* Header with current resource amount */}
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span>Số lượng chuyển đổi</span>
              <div className="ml-auto text-xs text-gray-500">
                {exchangeDirection === 'coinToPoint' ?
                  `Hiện có: ${character.coins.toLocaleString()} Coin` :
                  `Hiện có: ${statPoints} Point`
                }
              </div>
            </h4>
            {/* Input and Adjustment Buttons */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
              {/* Decrease Button */}
              <button
                onClick={() => adjustExchangeAmount(-100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Minus" size={18} />
              </button>
              {/* Amount Input */}
              <div className="flex-1 mx-2">
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))} // Ensure value is at least 1
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-gray-700"
                />
              </div>
              {/* Increase Button */}
              <button
                onClick={() => adjustExchangeAmount(100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Plus" size={18} />
              </button>
            </div>
            {/* Exchange Rate Info */}
            <div className="text-xs text-gray-500 italic text-center mt-1">
              {exchangeDirection === 'coinToPoint' ?
                '100 Coin = 1 Point' :
                '1 Point = 100 Coin'
              }
            </div>
          </div>

          {/* Exchange Result Preview */}
          <div className="mb-5 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {/* Result Icon */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {exchangeDirection === 'coinToPoint' ? (
                  // Point Icon with pulse effect
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
                    <Icon name="Gem" size={24} className="absolute inset-0 m-auto text-white" />
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
          {!hasEnoughResources() && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex">
                <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Không đủ tài nguyên</h4>
                  <p className="text-red-700 text-xs">
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
            <button
              onClick={() => setShowExchangeModal(false)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            {/* Exchange Button */}
            <button
              onClick={handleExchange}
              disabled={!hasEnoughResources()} // Disable if not enough resources
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                hasEnoughResources() ?
                'bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700' : // Enabled style
                'bg-gray-400 cursor-not-allowed' // Disabled style
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
    // MODIFIED: Added fixed inset-0 for fullscreen display
    // Added z-50 for layering and bg-white p-4 overflow-auto for styling
    <div className="fixed inset-0 z-50 bg-white p-4 overflow-auto">

      {/* Container to limit the width of the content within the fullscreen view */}
      {/* MODIFIED: Added flex flex-col h-full to enable flex layout for fixed header/footer */}
      {/* Removed absolute positioning and full size from this inner container */}
      <div className="relative max-w-lg mx-auto w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header section with background pattern - FIXED TOP */}
        {/* MODIFIED: Added flex-shrink-0 */}
        <div className="h-20 relative bg-white flex-shrink-0"> {/* Added flex-shrink-0 to prevent header shrinking */}
          {/* Background pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4h-6z'/%3E3C/g%3E%3C/g%3E%3C/svg%3E')"
          }}></div>

          {/* Top right badges container with glassmorphism effect */}
          <div className="absolute top-2 right-4 flex items-center space-x-2 overflow-hidden
                      backdrop-filter backdrop-blur-lg bg-white bg-opacity-20
                      border border-white border-opacity-30 rounded-xl p-2 shadow-lg z-10">
            {/* Coin Badge */}
            <div className="overflow-hidden">
              <div className={`flex items-center p-1 pl-2 pr-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md ${coinBadgePulse ? 'animate-pulse' : ''}`}>
                <div className="w-4 h-4 mr-1.5 relative">
                  <Icon name="Coins" size={16} className="text-amber-100 absolute -top-0.5 -left-0.5" />
                  <div className="absolute inset-0 bg-yellow-200 blur-md opacity-30"></div>
                </div>
                <span className="text-xs font-bold text-white">{character.coins.toLocaleString()}</span>
                 {/* Plus button next to Coin badge (functionality removed) */}
                 <button
                    className="ml-1.5 w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                    title="Chuyển đổi Coin sang Point" // Tooltip remains
                  >
                    <Icon name="Plus" size={10} className="text-white" />
                  </button>
              </div>
            </div>

            {/* Exchange Button */}
            <button
              onClick={() => setShowExchangeModal(true)} // Opens the exchange modal
              className="px-3 py-1.5 rounded-lg bg-white bg-opacity-30 text-gray-800 text-xs font-medium transition-colors hover:bg-opacity-40 flex items-center justify-center border border-gray-300"
              title="Chuyển đổi Coin/Point"
            >
              Exchange
            </button>

            {/* Points Badge */}
            <div className="overflow-hidden">
              <div className={`flex items-center p-1 pl-2 pr-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md ${pointBadgePulse ? 'animate-pulse' : ''}`}>
                <div className="w-4 h-4 mr-1.5 relative">
                  <Icon name="Gem" size={16} className="text-yellow-300 absolute -top-0.5 -left-0.5" />
                  <div className="absolute inset-0 bg-yellow-300 blur-md opacity-30"></div>
                </div>
                <span className="text-xs font-bold text-white">{statPoints}</span>
                {/* Plus button next to Points badge (conditionally visible) */}
                <button
                  onClick={() => setShowPointsPanel(true)} // Opens the point allocation panel
                  className={`ml-1.5 w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors ${!showPointsPanel && statPoints > 0 ? '' : 'invisible pointer-events-none'}`} // Visible only if panel is closed and points > 0
                  disabled={!(!showPointsPanel && statPoints > 0)}
                >
                  <Icon name="Plus" size={10} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Gradient overlay at the bottom of the header */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Main content area - SCROLLABLE MIDDLE */}
        {/* Added overflow-y-auto and flex-grow to make this section scrollable */}
        {/* MODIFIED: Reduced padding top from pt-2 to pt-1 */}
        <div className="px-8 pt-1 overflow-y-auto flex-grow">
          {/* REMOVED: Empty div that previously had mb-2 */}
          {/* <div className="flex flex-col mb-2"></div> */}

          {/* Stats Section */}
          <div className="mb-8">
              {/* Stats Header */}
              <div className="flex items-center justify-between mb-4">
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
                <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-4">
                  {/* Panel Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                      <Icon name="Plus" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Còn lại: <span className="font-medium text-indigo-600">{statPoints} điểm</span></p>
                    </div>
                  </div>

                  {/* Render stats in edit mode */}
                  {renderStats(true)}

                  {/* Allocation Tip */}
                  <div className="bg-blue-50 rounded-lg p-3 mt-4 mb-4 flex items-start">
                    <Icon name="AlertCircle" size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
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
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                  {renderStats()}
                </div>
              )}
            </div>

          {/* Skills Section */}
          <div className="mb-8">
            {/* Skills Header */}
            <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
              <Icon name="Zap" size={16} className="mr-2 text-gray-400" /> SKILLS
            </h3>
            {/* Skill Badges */}
            <div className="flex flex-wrap gap-3">
              {character.skills.map((skill, index) => renderSkillBadge(skill, index))}
            </div>
          </div>
        </div>

        {/* Footer Section - FIXED BOTTOM */}
        {/* MODIFIED: Changed py-5 to py-3 to reduce bottom padding */}
        <div className="px-8 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0"> {/* Added flex-shrink-0 to prevent footer shrinking */}
          {/* MODIFIED: Added flex items-center space-x-4 to align items and add space */}
          <div className="flex items-center space-x-4">
            {/* Return Button - MOVED AND STYLED */}
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors p-1" // Adjusted size and padding
                aria-label="Quay lại" // Updated aria-label
                title="Quay lại" // Added tooltip
              >
                <img
                  src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/return.png"
                  alt="Return icon" // Added alt text for accessibility
                  className="w-full h-full object-contain" // Ensure image fits and maintains aspect ratio
                />
              </button>
            )}

            {/* NEW: Render the new ResetStatsControl component */}
            <ResetStatsControl
               currentStats={character.stats} // Truyền chỉ số hiện tại
               onStatsReset={handleActualReset} // Truyền hàm xử lý reset thực tế
            />

          </div>
        </div>

        {/* REMOVED: Render Reset Modal (conditionallly) - Handled by ResetStatsControl */}
        {/* {showResetModal && <ResetModal />} */}

        {/* Render Exchange Modal (conditionally) */}
        {showExchangeModal && <ExchangeModal />}

      </div> {/* End of content container */}
    </div> // End of main CharacterCard container
  );
}
