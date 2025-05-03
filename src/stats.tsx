import { useState, useEffect } from 'react';

// Custom Icon component using inline SVG
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
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M2 9l10 13 10-13"></path><path d="M12 2v20"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path></g>,
    Coins: <g><circle cx="8" cy="16" r="6"></circle><path d="M18 9.5a6 6 0 0 0-6-6c-1.7 0-3.4.6-4.4 1.7"></path><path d="M17.5 16H18a2 2 0 0 0 0-4h-.5"></path><path d="M15 22a6 6 0 0 0 6-6c0-1.7-.6-3.4-1.7-4.4"></path><path d="M8.5 22H8a2 2 0 0 1 0-4h.5"></path><path d="M12 12v10"></path></g>,
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
  };

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


export default function CharacterCard() {
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

  // State for stat points
  const [statPoints, setStatPoints] = useState(11);
  const [showPointsPanel, setShowPointsPanel] = useState(false);
  const [tempStats, setTempStats] = useState({...character.stats});
  const [glowEffect, setGlowEffect] = useState(false);

  // State for Reset Stats modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAnimation, setResetAnimation] = useState(false);

  // State for Coin and Point exchange modal
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(100);
  const [exchangeDirection, setExchangeDirection] = useState('coinToPoint'); // or 'pointToCoin'

  // Effect for glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowEffect(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // State for stat point animation
  const [pointAnimation, setPointAnimation] = useState({
    active: false,
    stat: null
  });

  // Effect for Points Badge pulse (removed pulsing)
  const [pointBadgePulse, setPointBadgePulse] = useState(false);
  // Effect for Coin Badge pulse (removed pulsing)
  const [coinBadgePulse, setCoinBadgePulse] = useState(false);


  // Function to increase a stat
  const increaseStat = (stat) => {
    if (statPoints > 0) {
      // Trigger animation
      setPointAnimation({
        active: true,
        stat: stat
      });

      setTimeout(() => {
        setPointAnimation({
          active: false,
          stat: null
        });
      }, 800);

      // Update stats
      const newTempStats = {...tempStats};

      // Increase stats at different rates
      if (stat === 'hp') {
        newTempStats[stat] += 25; // HP increases more
      } else {
        newTempStats[stat] += 2; // Other stats increase less
      }

      setTempStats(newTempStats);
      setStatPoints(statPoints - 1);
    }
  };

  // Function to decrease a stat
  const decreaseStat = (stat) => {
    const originalStat = character.stats[stat];
    if (tempStats[stat] > originalStat) {
      const newTempStats = {...tempStats};

      // Decrease stats at corresponding rates
      if (stat === 'hp') {
        newTempStats[stat] -= 25;
      } else {
        newTempStats[stat] -= 2;
      }

      setTempStats(newTempStats);
      setStatPoints(statPoints + 1);
    }
  };

  // Function to apply changes
  const applyChanges = () => {
    setCharacter({
      ...character,
      stats: {...tempStats}
    });
    setShowPointsPanel(false);
  };

  // Function to cancel changes
  const cancelChanges = () => {
    setTempStats({...character.stats});
    setStatPoints(statPoints + Object.entries(tempStats).reduce((total, [key, value]) => {
        const originalValue = character.stats[key];
        if (key === 'hp') {
          return total + Math.floor((value - originalValue) / 25);
        } else {
          return total + Math.floor((value - originalValue) / 2);
        }
      }, 0)
    );
    setShowPointsPanel(false);
  };

  // Function to perform stats reset
  const resetStats = () => {
    setResetAnimation(true);

    setTimeout(() => {
      // Calculate total current stat points
      const currentTotal = Object.entries(character.stats).reduce((total, [key, value]) => {
        if (key === 'hp') {
          return total + Math.floor(value / 25); // 1 point for every 25 HP
        } else {
          return total + Math.floor(value / 2); // 1 point for every 2 stat points
        }
      }, 0);

      // Reset stats to 0 instead of 50
      const baseStats = {
        atk: 0,
        def: 0,
        hp: 0,
        luck: 0,
        wit: 0,
        crt: 0
      };

      setCharacter({
        ...character,
        stats: baseStats
      });

      setTempStats(baseStats);
      setStatPoints(statPoints + currentTotal);
      setShowResetModal(false);
      setResetAnimation(false);
    }, 1500);
  };

  // Calculate points to receive upon reset
  const calculateResetPoints = () => {
    return Object.entries(character.stats).reduce((total, [key, value]) => {
      if (key === 'hp') {
        return total + Math.floor(value / 25); // 1 point for every 25 HP
      } else {
        return total + Math.floor(value / 2); // 1 point for every 2 stat points
      }
    }, 0);
  };

  // Function to handle exchange
  const handleExchange = () => {
    if (exchangeDirection === 'coinToPoint') {
      // Check if enough coins
      if (character.coins >= exchangeAmount) {
        setCharacter({
          ...character,
          coins: character.coins - exchangeAmount
        });
        setStatPoints(statPoints + Math.floor(exchangeAmount / 100));
        // Trigger point receive effect
        setPointBadgePulse(true);
        setTimeout(() => setPointBadgePulse(false), 1500);
      }
    } else {
      // Check if enough points
      if (statPoints >= exchangeAmount) {
        setCharacter({
          ...character,
          coins: character.coins + (exchangeAmount * 100)
        });
        setStatPoints(statPoints - exchangeAmount);
        // Trigger coin receive effect
        setCoinBadgePulse(true);
        setTimeout(() => setCoinBadgePulse(false), 1500);
      }
    }
    // Close modal after completion
    setShowExchangeModal(false);
  };

  // Function to adjust exchange amount
  const adjustExchangeAmount = (amount) => {
    const newAmount = exchangeAmount + amount;
    if (newAmount >= 1) {
      setExchangeAmount(newAmount);
    }
  };


  // Render stats section
  const renderStats = (isEditMode = false) => {
    const stats = isEditMode ? tempStats : character.stats;
    const statsList = [
      { name: "ATK", value: stats.atk, icon: <Icon name="Sword" size={18} />, color: "rose", key: "atk" },
      { name: "DEF", value: stats.def, icon: <Icon name="Shield" size={18} />, color: "blue", key: "def" },
      { name: "HP", value: stats.hp, icon: <Icon name="Heart" size={18} />, color: "red", key: "hp" },
      { name: "LUCK", value: stats.luck, icon: <Icon name="Stars" size={18} />, color: "purple", key: "luck" },
      { name: "INT", value: stats.wit, icon: <Icon name="Brain" size={18} />, color: "emerald", key: "wit" },
      { name: "CRT", value: stats.crt, icon: <Icon name="Crosshair" size={18} />, color: "amber", key: "crt" }
    ];

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
          const isSpecial = stat.name === "HP";
          const isIncreased = isEditMode && stats[stat.key] > character.stats[stat.key];

          return (
            <div key={index} className={`${index >= 4 ? "col-span-1" : ""} bg-white rounded-xl shadow-sm border ${isIncreased ? 'border-green-200' : 'border-gray-100'} overflow-hidden relative transition-all duration-300`}>
              {/* Glow effect in corner */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 ${colorScheme.bg}`}></div>

              {/* Stat increase animation */}
              {pointAnimation.active && pointAnimation.stat === stat.key && (
                <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse"></div>
              )}

              {/* Main container for Icon/Name and Value/Buttons */}
              <div className="p-3 flex flex-col relative">
                {/* Top row: Icon and Name - Added justify-center */}
                <div className="flex items-center justify-center mb-1"> {/* Added mb-1 for spacing */}
                  <div className={`w-8 h-8 ${colorScheme.light} rounded-lg flex items-center justify-center mr-3 relative overflow-hidden`}>
                    <div className={`absolute -bottom-3 -right-3 w-6 h-6 ${colorScheme.bg} opacity-20 rounded-full`}></div>
                    <span className={colorScheme.text}>{React.cloneElement(stat.icon, { size: 16 })}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500">{stat.name}</h4>
                </div>

                {/* Bottom row: Value and Buttons */}
                {isEditMode ? (
                  // Layout for edit mode: Minus - Value - Plus
                  <div className="flex items-center justify-around w-full"> {/* Use justify-around for spacing */}
                    <button
                      onClick={() => decreaseStat(stat.key)}
                      disabled={stats[stat.key] <= character.stats[stat.key]}
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${stats[stat.key] <= character.stats[stat.key] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`} // Set fixed size and added flex centering
                    >
                      <Icon name="Minus" size={16} /> {/* Increased icon size slightly for better touch target */}
                    </button>

                    {/* Wrapper div for stat value to ensure centering */}
                    <div className="flex items-center justify-center">
                      <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                        {isSpecial ? stats[stat.key].toLocaleString() : stats[stat.key]}
                      </p>
                    </div>


                    <button
                      onClick={() => increaseStat(stat.key)}
                      disabled={statPoints <= 0}
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${statPoints <= 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`} // Set fixed size and added flex centering
                    >
                      <Icon name="Plus" size={16} /> {/* Increased icon size slightly */}
                    </button>
                  </div>
                ) : (
                  // Original layout for view mode (centered value)
                  <div className="flex items-center justify-center">
                    <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                      {isSpecial ? stats[stat.key].toLocaleString() : stats[stat.key]}
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

  // Render skill badge
  const renderSkillBadge = (skill, index) => {
    const colors = [
      "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
    ];

    return (
      <span
        key={index}
        className={`${colors[index % colors.length]} px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        {index === 0 && <Icon name="Sword" size={14} />}
        {index === 1 && <Icon name="Shield" size={14} />}
        {index === 2 && <Icon name="Zap" size={14} />}
        {skill}
      </span>
    );
  };

  // Reset Stats Modal component
  const ResetModal = () => {
    // Calculate actual points to receive upon reset
    const pointsToReceive = calculateResetPoints();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all ${resetAnimation ? 'animate-pulse' : ''}`}>
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-4 rounded-xl mb-4 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                <Icon name="RotateCcw" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Reset Chỉ Số</h3>
                <p className="text-blue-100 text-sm">Lấy lại điểm phân bổ</p>
              </div>
            </div>
          </div>

          <div className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex">
              <Icon name="AlertCircle" size={20} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">Lưu ý quan trọng</h4>
                <p className="text-amber-700 text-sm">
                  Reset sẽ đưa tất cả chỉ số về 0 và hoàn trả điểm tiềm năng.
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-5">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Bạn sẽ nhận được:</h4>
            <div className="flex items-center bg-white p-3 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                <Icon name="Gem" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">Điểm Tiềm Năng</p>
                <p className="text-xs text-gray-500">Dùng để nâng cấp chỉ số</p>
              </div>
              <div className="bg-indigo-100 px-3 py-1 rounded-lg text-indigo-600 font-bold">
                +{pointsToReceive}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowResetModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={resetStats}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 ${resetAnimation ? 'bg-purple-600 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} transition-all`}
            >
              {resetAnimation ?
                'Đang reset...' :
                <>
                  <Icon name="RotateCcw" size={16} />
                  Reset
                </>
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Coin and Point Exchange Modal component
  const ExchangeModal = () => {
    // Calculate the result of the exchange
    const getResult = () => {
      if (exchangeDirection === 'coinToPoint') {
        return Math.floor(exchangeAmount / 100);
      } else {
        return exchangeAmount * 100;
      }
    };

    // Check if there are enough resources for the exchange
    const hasEnoughResources = () => {
      if (exchangeDirection === 'coinToPoint') {
        return character.coins >= exchangeAmount;
      } else {
        return statPoints >= exchangeAmount;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Changed modal content background */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">

          {/* Select exchange direction */}
          <div className="mb-5">
            <div className="bg-gray-100 p-1 rounded-lg flex mb-2">
              <button
                onClick={() => setExchangeDirection('coinToPoint')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  exchangeDirection === 'coinToPoint' ?
                  'bg-white shadow-sm text-indigo-600' :
                  'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon name="Coins" size={16} />
                Coin → Point
              </button>
              <button
                onClick={() => setExchangeDirection('pointToCoin')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  exchangeDirection === 'pointToCoin' ?
                  'bg-white shadow-sm text-amber-600' :
                  'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon name="Gem" size={16} />
                Point → Coin
              </button>
            </div>

            <div className="text-xs text-gray-500 italic text-center">
              Chọn loại tài nguyên bạn muốn chuyển đổi
            </div>
          </div>

          {/* Select amount */}
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span>Số lượng chuyển đổi</span>
              <div className="ml-auto text-xs text-gray-500">
                {exchangeDirection === 'coinToPoint' ?
                  `Hiện có: ${character.coins.toLocaleString()} Coin` :
                  `Hiện có: ${statPoints} Point`
                }
              </div>
            </h4>

            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => adjustExchangeAmount(-100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Minus" size={18} />
              </button>

              <div className="flex-1 mx-2">
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-gray-700"
                />
              </div>

              <button
                onClick={() => adjustExchangeAmount(100)}
                className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Icon name="Plus" size={18} />
              </button>
            </div>

            <div className="text-xs text-gray-500 italic text-center mt-1">
              {exchangeDirection === 'coinToPoint' ?
                '100 Coin = 1 Point' :
                '1 Point = 100 Coin'
              }
            </div>
          </div>

          {/* Exchange result */}
          <div className="mb-5 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {exchangeDirection === 'coinToPoint' ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
                    <Icon name="Gem" size={24} className="absolute inset-0 m-auto text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 animate-pulse"></div>
                    <Icon name="Coins" size={24} className="absolute inset-0 m-auto text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500">Bạn sẽ nhận được:</div>
                <div className="font-bold text-lg text-gray-800 flex items-center">
                  {getResult().toLocaleString()}
                  <span className="ml-1 text-sm">
                    {exchangeDirection === 'coinToPoint' ? 'Point' : 'Coin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning if not enough resources */}
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

          {/* Action buttons - Made smaller */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowExchangeModal(false)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors" // Adjusted padding and text size
            >
              Hủy
            </button>
            <button
              onClick={handleExchange}
              disabled={!hasEnoughResources()}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${ // Adjusted padding and text size
                hasEnoughResources() ?
                'bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700' :
                'bg-gray-400 cursor-not-allowed'
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
    <div className={`max-w-lg mx-auto rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${glowEffect ? 'shadow-purple-200' : 'shadow-blue-100'}`}
          style={{background: "linear-gradient(to bottom, #ffffff, #f8f9fa)"}}>
      {/* Premium Banner Header */}
      <div className="h-32 relative bg-white">
        <div className="absolute inset-0" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>

        {/* Coin and Points Badges container with glassmorphism */}
        {/* Adjusted top position from top-4 to top-2 */}
        <div className="absolute top-2 right-4 flex items-center space-x-2 overflow-hidden
                    backdrop-filter backdrop-blur-lg bg-white bg-opacity-20
                    border border-white border-opacity-30 rounded-xl p-2 shadow-lg z-10"> {/* Added glassmorphism classes and z-10 */}
          {/* Coin Badge */}
          <div className="overflow-hidden">
            <div className={`flex items-center p-1 pl-2 pr-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md ${coinBadgePulse ? 'animate-pulse' : ''}`}> {/* Added pulse class */}
              <div className="w-4 h-4 mr-1.5 relative">
                <Icon name="Coins" size={16} className="text-amber-100 absolute -top-0.5 -left-0.5" />
                <div className="absolute inset-0 bg-yellow-200 blur-md opacity-30"></div>
              </div>
              <span className="text-xs font-bold text-white">{character.coins.toLocaleString()}</span>
               {/* The Plus button next to Coin badge is kept but its onClick is removed */}
               <button
                  // Removed onClick={() => { setShowExchangeModal(true); setExchangeDirection('coinToPoint'); }}
                  className="ml-1.5 w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                  title="Chuyển đổi Coin sang Point"
                >
                  <Icon name="Plus" size={10} className="text-white" />
                </button>
            </div>
          </div>

          {/* Exchange Button with text and border */}
          <button
            onClick={() => setShowExchangeModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white bg-opacity-30 text-gray-800 text-xs font-medium transition-colors hover:bg-opacity-40 flex items-center justify-center border border-gray-300" // Adjusted padding and text styles, changed text color, added border
            title="Chuyển đổi Coin/Point"
          >
            Exchange {/* Replaced SVG with text */}
          </button>

          {/* Points Badge */}
          <div className="overflow-hidden"> {/* Wrapped Points Badge in div */}
            <div className={`flex items-center p-1 pl-2 pr-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md ${pointBadgePulse ? 'animate-pulse' : ''}`}> {/* Added pulse class */}
              <div className="w-4 h-4 mr-1.5 relative">
                <Icon name="Gem" size={16} className="text-yellow-300 absolute -top-0.5 -left-0.5" />
                <div className="absolute inset-0 bg-yellow-300 blur-md opacity-30"></div>
              </div>
              <span className="text-xs font-bold text-white">{statPoints}</span>
              {/* Modified the button to always be present but conditionally invisible */}
              <button
                onClick={() => setShowPointsPanel(true)}
                className={`ml-1.5 w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors ${!showPointsPanel && statPoints > 0 ? '' : 'invisible pointer-events-none'}`} // Added invisible and pointer-events-none
                disabled={!(!showPointsPanel && statPoints > 0)} // Disable when invisible
              >
                <Icon name="Plus" size={10} className="text-white" />
              </button>
            </div>
          </div>
        </div>


        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Character Info */}
      <div className="px-8 pt-4"> {/* Reverted top padding to pt-4 */}
        <div className="flex flex-col mb-2">
           {/* This div is now empty after removing title and small indicators */}
        </div>

        {/* Stats Section */} {/* Moved Stats section up */}
        <div className="mb-8"> {/* Reverted bottom margin to mb-8 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold text-gray-600 flex items-center">
                <Icon name="Trophy" size={16} className="mr-2 text-gray-500" /> STATS
              </h3>

              {statPoints > 0 && !showPointsPanel && (
                <button
                  onClick={() => setShowPointsPanel(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-1.5"
                >
                  <Icon name="Plus" size={14} />
                  Phân bổ {statPoints} điểm
                </button>
              )}

              {!statPoints && !showPointsPanel && (
                <div className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium flex items-center">
                  {/* Replaced SVG with a simple circle/dot representation */}
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="3"></circle>
                  </svg>
                  Chi tiết
                </div>
              )}
            </div>

            {/* Point Allocation Panel */}
            {showPointsPanel ? (
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-4">
                {/* Header with icon and remaining points */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <Icon name="Plus" size={20} className="text-white" />
                  </div>
                  <div>
                     {/* Removed "Phân Bổ Điểm Kỹ Năng" title */}
                    <p className="text-sm text-gray-500">Còn lại: <span className="font-medium text-indigo-600">{statPoints} điểm</span></p>
                  </div>
                </div>

                {/* Render stats for editing */}
                {renderStats(true)}

                {/* Tip */}
                <div className="bg-blue-50 rounded-lg p-3 mt-4 mb-4 flex items-start"> {/* Added mt-4 */}
                  <Icon name="AlertCircle" size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Mẹo phân bổ điểm:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>ATK, DEF, LUCK, INT, CRT: +2 cho mỗi điểm</li>
                      <li>HP: +25 cho mỗi điểm</li>
                    </ul>
                  </div>
                </div>

                 {/* Action buttons */}
                <div className="flex items-center justify-end space-x-2"> {/* Added justify-end */}
                   <button
                      onClick={cancelChanges}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={applyChanges}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Áp dụng
                    </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                {renderStats()}
              </div>
            )}
          </div>


        {/* Skills */}
        <div className="mb-8"> {/* Reverted bottom margin to mb-8 */}
          <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
            <Icon name="Zap" size={16} className="mr-2 text-gray-400" /> SKILLS
          </h3>
          <div className="flex flex-wrap gap-3">
            {character.skills.map((skill, index) => renderSkillBadge(skill, index))}
          </div>
        </div>
      </div>


      {/* Footer */}
      <div className="px-8 py-5 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">ID: #LEGEND-{Math.floor(Math.random() * 10000)}</span>

          {/* Replace "Upgrade Character" button with "Reset Stats" */}
          <button
            onClick={() => setShowResetModal(true)}
            className="group px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 relative overflow-hidden"
          >
            {/* Background glow effect */}
            <div className="absolute top-0 left-0 h-full w-16 bg-white opacity-20 skew-x-30 transform -translate-x-20 transition-transform group-hover:translate-x-64 duration-1000"></div>

            <div className="flex items-center gap-2 relative">
              <Icon name="RotateCcw" size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Reset Chỉ Số</span>
              <Icon name="ArrowRight" size={14} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              Thu hồi điểm tiềm năng
            </div>
          </button>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && <ResetModal />}

      {/* Exchange Modal */}
      {showExchangeModal && <ExchangeModal />}
    </div>
  );
}
