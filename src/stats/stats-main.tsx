import React, { useState, useEffect } from 'react'; // Import React
import ResetStatsControl from './reset-points.tsx'; // Import component mới
import BackIcon from '../icon/back-icon.tsx'; // Import component BackIcon mới
import BackButton from '../footer-back.tsx'; // Import the new BackButton component
import { Icon } from './icon/icon.tsx'; // Assuming Icon component is in a separate file now

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
  const increaseStat = (stat: keyof typeof tempStats) => { // Use keyof typeof tempStats for type safety
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
  const decreaseStat = (stat: keyof typeof tempStats) => { // Use keyof typeof tempStats for type safety
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
        const originalValue = character.stats[key as keyof typeof character.stats]; // Type assertion
        if (key === 'hp') {
          // Calculate points added for HP (1 point per 25 HP)
          return total + Math.floor(((value as number) - originalValue) / 25); // Type assertion
        } else {
          // Calculate points added for other stats (1 point per 2 stat value)
          return total + Math.floor(((value as number) - originalValue) / 2); // Type assertion
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
  const adjustExchangeAmount = (amount: number) => { // Add type for amount
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
      { name: "ATK", value: stats.atk, iconName: "Sword", color: "rose", key: "atk" },
      { name: "DEF", value: stats.def, iconName: "Shield", color: "blue", key: "def" },
      { name: "HP", value: stats.hp, iconName: "Heart", color: "red", key: "hp" },
      { name: "LUCK", value: stats.luck, iconName: "Stars", color: "purple", key: "luck" },
      { name: "INT", value: stats.wit, iconName: "Brain", color: "emerald", key: "wit" },
      { name: "CRT", value: stats.crt, iconName: "Crosshair", color: "amber", key: "crt" }
    ];

    // Helper function to get color scheme based on stat type
    const getStatColor = (statColor: string) => { // Add type for statColor
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
          const isIncreased = isEditMode && stats[stat.key as keyof typeof stats] > character.stats[stat.key as keyof typeof character.stats]; // Type assertion

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
                    <Icon name={stat.iconName} size={16} className={colorScheme.text} /> {/* Use Icon component */}
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
                      onClick={() => decreaseStat(stat.key as keyof typeof tempStats)} // Type assertion
                      disabled={stats[stat.key as keyof typeof stats] <= character.stats[stat.key as keyof typeof character.stats]} // Disable if value is at original or lower
                      className={`flex items-center justify-center w-6 h-6 rounded-md ${stats[stat.key as keyof typeof stats] <= character.stats[stat.key as keyof typeof character.stats] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Icon name="Minus" size={16} />
                    </button>

                    {/* Stat Value Display */}
                    {/* MODIFIED: Reverted background and border colors for light mode */}
                    <div className="flex items-center justify-center">
                      <p className={`text-sm font-bold ${isIncreased ? 'text-green-600' : colorScheme.text} bg-gray-50 rounded-md px-2 py-0.5 border ${isIncreased ? 'border-green-100' : isSpecial ? 'border-red-100' : 'border-gray-200'}`}>
                        {isSpecial ? stats[stat.key as keyof typeof stats].toLocaleString() : stats[stat.key as keyof typeof stats]} {/* Format HP with commas */}
                      </p>
                    </div>

                    {/* Increase Button */}
                    {/* MODIFIED: Reverted colors for light mode */}
                    <button
                      onClick={() => increaseStat(stat.key as keyof typeof tempStats)} // Type assertion
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
                      {isSpecial ? stats[stat.key as keyof typeof stats].toLocaleString() : stats[stat.key as keyof typeof stats]} {/* Format HP with commas */}
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
  const renderSkillBadge = (skill: string, index: number) => { // Add types
    // Define color gradients for badges
    const colors = [
      "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
    ];
    // Get icon elements safely
    let skillIconName: string | null = null; // Use icon name string
    if (index === 0) skillIconName = "Sword";
    if (index === 1) skillIconName = "Shield";
    if (index === 2) skillIconName = "Zap";


    return (
      <span
        key={index}
        className={`${colors[index % colors.length]} px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        {/* Render the icon only if it's valid */}
        {skillIconName && <Icon name={skillIconName} size={14} />} {/* Use Icon component */}
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
                <Icon name="Gem" size={16} />
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
                  `Hiện có: ${character.coins.toLocaleString()} Coin` :
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
    // MODIFIED: Changed background back to white and used flexbox for layout
    // This main container will now be a flex column that fills the screen
    <div className="flex flex-col h-screen bg-white"> {/* Use flex-col and h-screen */}

      {/* Header section with background pattern - This will stay at the top */}
      {/* MODIFIED: Changed background back to white */}
      {/* MODIFIED: Removed px-8 */}
      <div className="h-20 relative bg-white flex-shrink-0"> {/* Added flex-shrink-0 to prevent header shrinking */}
        {/* Background pattern overlay */}
        {/* MODIFIED: Changed fill color in SVG back to light for white background */}
        <div className="absolute inset-0" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4h-6z'/%3E3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>

        {/* Top right badges container with glassmorphism effect */}
        {/* MODIFIED: Reverted border color for light mode */}
        <div className="absolute top-2 right-4 flex items-center space-x-2 overflow-hidden
                    backdrop-filter backdrop-blur-lg bg-white bg-opacity-20
                    border border-white border-opacity-30 rounded-xl p-2 shadow-lg z-10"> {/* Kept opacity for glassmorphism */}
          {/* Coin Badge */}
          <div className="overflow-hidden">
            <div className={`flex items-center p-1 pl-2 pr-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md ${coinBadgePulse ? 'animate-pulse' : ''}`}>
              <div className="w-4 h-4 mr-1.5 relative">
                <Icon name="Coins" size={16} className="text-amber-100 absolute -top-0.5 -left-0.5" />
                <div className="absolute inset-0 bg-yellow-200 blur-md opacity-30"></div>
              </div>
              <span className="text-xs font-bold text-white">{character.coins.toLocaleString()}</span>
               {/* Plus button next to Coin badge (functionality removed) */}
               {/* MODIFIED: Reverted background opacity for light mode */}
               <button
                  className="ml-1.5 w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                  title="Chuyển đổi Coin sang Point" // Tooltip remains
                >
                  <Icon name="Plus" size={10} className="text-white" />
                </button>
            </div>
          </div>

          {/* Exchange Button */}
          {/* MODIFIED: Reverted colors for light mode */}
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
              {/* MODIFIED: Reverted background opacity for light mode */}
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
        {/* MODIFIED: Reverted gradient colors for light mode */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Main content area - This will be the scrollable part */}
      {/* Added overflow-y-auto and flex-grow to make this section scrollable */}
      {/* MODIFIED: Removed px-8 from this container, added to inner sections */}
      <div className="overflow-y-auto flex-grow p-4"> {/* Added p-4 for padding */}
        {/* REMOVED: Empty div that previously had mb-2 */}
        {/* <div className="flex flex-col mb-2"></div> */}

        {/* Stats Section */}
        {/* MODIFIED: Added px-4 back to the stats section for inner padding */}
        <div className="mb-8 px-4"> {/* Changed px-8 to px-4 to account for parent padding */}
            {/* Stats Header */}
            {/* MODIFIED: Reverted text and border colors for light mode */}
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
              {/* MODIFIED: Reverted colors for light mode */}
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
              // MODIFIED: Reverted background and border colors for light mode
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-4">
                {/* Panel Header */}
                {/* MODIFIED: Reverted text color for light mode */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <Icon name="Plus" size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Còn lại: <span className="font-medium text-indigo-600">{statPoints} điểm</span></p>
                  </div> {/* Reverted text color */}
                </div>

                {/* Render stats in edit mode */}
                {renderStats(true)}

                {/* Allocation Tip */}
                {/* MODIFIED: Reverted background and text colors for light mode */}
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
                   {/* MODIFIED: Reverted colors for light mode */}
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
              // MODIFIED: Reverted background and border colors for light mode
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                {renderStats()}
              </div>
            )}
          </div>

        {/* Skills Section */}
        {/* MODIFIED: Added px-4 back to the skills section for inner padding */}
        <div className="mb-8 px-4"> {/* Changed px-8 to px-4 */}
          {/* Skills Header */}
          {/* MODIFIED: Reverted text and border colors for light mode */}
          <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
            <Icon name="Zap" size={16} className="mr-2 text-gray-400" /> SKILLS
          </h3>
          {/* Skill Badges */}
          <div className="flex flex-wrap gap-3">
            {character.skills.map((skill, index) => renderSkillBadge(skill, index))}
          </div>
        </div>

         {/* Reset Stats Control - Placed here, not in the footer */}
         {/* MODIFIED: Added px-4 back to the ResetStatsControl section for inner padding */}
         <div className="mb-8 px-4"> {/* Changed px-8 to px-4 */}
           <ResetStatsControl
              currentStats={character.stats} // Truyền chỉ số hiện tại
              onStatsReset={handleActualReset} // Truyền hàm xử lý reset thực tế
           />
         </div>

      </div> {/* End of main content area - This is the scrollable part */}


      {/* Render Exchange Modal (conditionally) */}
      {showExchangeModal && <ExchangeModal />}

      {/* Footer Section - Using the new BackButton component */}
      {/* This will be fixed at the bottom by the BackButton component's own styling */}
      {onClose && (
        <BackButton onClick={onClose} />
      )}

    </div> // End of main CharacterCard container (Flexbox column)
  );
}

