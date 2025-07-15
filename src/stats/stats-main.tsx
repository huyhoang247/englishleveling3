import React, { useState, useEffect } from 'react';
import ResetStatsControl from './reset-points.tsx';
import BackButton from '../footer-back.tsx';
import CoinDisplay from '../coin-display.tsx';
import { auth } from '../firebase.js';
import HeaderBackground from '../header-background.tsx';

// Custom Icon component (Không thay đổi)
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
    Coins: <g><circle cx="12" cy="12" r="10"/><circle cx="16" cy="8" r="6"/></g>,
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
  };
  if (!icons[name]) { return null; }
  return ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-${name.toLowerCase()} ${className}`}> {icons[name]} </svg> );
};

interface CharacterCardProps {
  onClose?: () => void;
  coins: number;
  onUpdateCoins: (amount: number) => Promise<void>;
}

export default function CharacterCard({ onClose, coins, onUpdateCoins }: CharacterCardProps) {
  const [character, setCharacter] = useState({
    title: "Chiến Binh",
    level: 75,
    stats: { atk: 92, def: 78, hp: 1250, luck: 68, wit: 85, crt: 73 },
    skills: ["Chém Nhanh", "Phòng Thủ", "Kỹ Năng Đặc Biệt"],
    elements: [],
    rank: "Cao Thủ",
  });

  const [statPoints, setStatPoints] = useState(11);
  const [tempStats, setTempStats] = useState({...character.stats});

  // NEW: State to control allocation mode directly on the stats list
  const [isAllocating, setIsAllocating] = useState(false);
  
  // State for Coin and Point exchange modal
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(100);
  const [exchangeDirection, setExchangeDirection] = useState('coinToPoint');

  // NEW: Re-introducing state for the Reset Stats Modal, as it's now in the footer
  const [showResetModal, setShowResetModal] = useState(false);

  const [pointBadgePulse, setPointBadgePulse] = useState(false);
  
  const pointsIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/game.png";
  const pointsIconPlaceholderUrl = "https://placehold.co/16x16/800080/ffffff?text=P";
  const exchangeIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/exchange%20(1).png";
  const exchangeIconPlaceholderUrl = "https://placehold.co/16x16/008000/ffffff?text=E";

  // When allocation mode is activated, sync tempStats with character stats
  useEffect(() => {
    if (isAllocating) {
      setTempStats({ ...character.stats });
    }
  }, [isAllocating, character.stats]);

  const increaseStat = (stat: keyof typeof tempStats) => {
    if (statPoints > 0) {
      const newTempStats = {...tempStats};
      if (stat === 'hp') { newTempStats[stat] += 25; } 
      else { newTempStats[stat] += 2; }
      setTempStats(newTempStats);
      setStatPoints(statPoints - 1);
    }
  };

  const decreaseStat = (stat: keyof typeof tempStats) => {
    const originalStat = character.stats[stat];
    if (tempStats[stat] > originalStat) {
      const newTempStats = {...tempStats};
      if (stat === 'hp') { newTempStats[stat] -= 25; } 
      else { newTempStats[stat] -= 2; }
      setTempStats(newTempStats);
      setStatPoints(statPoints + 1);
    }
  };

  const applyChanges = () => {
    setCharacter({ ...character, stats: {...tempStats} });
    // TODO: Implement Firestore update for stats here if needed
    setIsAllocating(false); // Exit allocation mode
  };

  const cancelChanges = () => {
    const pointsAdded = Object.entries(tempStats).reduce((total, [key, value]) => {
      const originalValue = character.stats[key as keyof typeof character.stats];
      if (key === 'hp') { return total + Math.floor((value - originalValue) / 25); } 
      else { return total + Math.floor((value - originalValue) / 2); }
    }, 0);
    setStatPoints(statPoints + pointsAdded);
    setTempStats({ ...character.stats });
    setIsAllocating(false); // Exit allocation mode
  };

  const handleActualReset = (pointsRefunded: number) => {
     const baseStats = { atk: 0, def: 0, hp: 0, luck: 0, wit: 0, crt: 0 };
     setCharacter({ ...character, stats: baseStats });
     setTempStats(baseStats);
     setStatPoints(statPoints + pointsRefunded);
     setShowResetModal(false); // Close the reset modal
  };

  const handleExchange = async () => {
    if (exchangeDirection === 'coinToPoint') {
      if (coins >= exchangeAmount) {
        if (auth.currentUser) { await onUpdateCoins(-exchangeAmount); } 
        else { console.error("User not authenticated"); return; }
        setStatPoints(statPoints + Math.floor(exchangeAmount / 100));
        setPointBadgePulse(true);
        setTimeout(() => setPointBadgePulse(false), 1500);
      } else { console.log("Not enough coins"); }
    } else {
      if (statPoints >= exchangeAmount) {
         if (auth.currentUser) { await onUpdateCoins(exchangeAmount * 100); } 
         else { console.error("User not authenticated"); return; }
        setStatPoints(statPoints - exchangeAmount);
      } else { console.log("Not enough points"); }
    }
    setShowExchangeModal(false);
  };

  const adjustExchangeAmount = (amount: number) => {
    const newAmount = exchangeAmount + amount;
    if (newAmount >= 1) { setExchangeAmount(newAmount); }
  };

  // REFACTORED: renderStats is now a single, unified function
  const renderStats = () => {
    const statsList = [
      { name: "ATK", iconName: "Sword", color: "rose", key: "atk" as const, maxValue: 200 },
      { name: "DEF", iconName: "Shield", color: "blue", key: "def" as const, maxValue: 200 },
      { name: "HP", iconName: "Heart", color: "red", key: "hp" as const, maxValue: 3000 },
      { name: "LUCK", iconName: "Stars", color: "purple", key: "luck" as const, maxValue: 200 },
      { name: "INT", iconName: "Brain", color: "emerald", key: "wit" as const, maxValue: 200 },
      { name: "CRT", iconName: "Crosshair", color: "amber", key: "crt" as const, maxValue: 200 }
    ];

    const getStatColor = (statColor: string) => {
      switch(statColor) {
        case "rose": return { text: "text-rose-500", bg: "bg-rose-500", light: "bg-rose-100" };
        case "blue": return { text: "text-blue-500", bg: "bg-blue-500", light: "bg-blue-100" };
        case "red": return { text: "text-red-500", bg: "bg-red-500", light: "bg-red-100" };
        case "purple": return { text: "text-purple-500", bg: "bg-purple-500", light: "bg-purple-100" };
        case "emerald": return { text: "text-emerald-500", bg: "bg-emerald-500", light: "bg-emerald-100" };
        case "amber": return { text: "text-amber-500", bg: "bg-amber-500", light: "bg-amber-100" };
        default: return { text: "text-gray-500", bg: "bg-gray-500", light: "bg-gray-100" };
      }
    };
    
    const getBonus = (key: keyof typeof tempStats) => {
        if (!isAllocating) return 0;
        const bonus = tempStats[key] - character.stats[key];
        return bonus > 0 ? bonus : 0;
    };

    return (
      <div className="space-y-2">
        {statsList.map((stat) => {
          const colorScheme = getStatColor(stat.color);
          const baseValue = character.stats[stat.key];
          const bonusValue = getBonus(stat.key);
          const currentValue = baseValue + bonusValue;
          const progress = (currentValue / stat.maxValue) * 100;
          const baseProgress = (baseValue / stat.maxValue) * 100;

          return (
            <div key={stat.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 transition-all duration-300">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 ${colorScheme.light} rounded-lg flex items-center justify-center`}>
                        <Icon name={stat.iconName} size={20} className={colorScheme.text} />
                    </div>

                    {/* Stat Name & Progress Bar */}
                    <div className="flex-grow">
                        <h4 className="text-sm font-bold text-gray-700">{stat.name}</h4>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 relative">
                            <div className={`${colorScheme.bg} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${baseProgress}%` }}></div>
                            {isAllocating && bonusValue > 0 && (
                                <div className={`absolute top-0 h-1.5 rounded-full ${colorScheme.bg} opacity-50 transition-all duration-300`} style={{ left: `${baseProgress}%`, width: `${progress - baseProgress}%` }}></div>
                            )}
                        </div>
                    </div>

                    {/* Stat Value & Allocation Controls */}
                    <div className="flex items-center gap-3 w-32 justify-end">
                        {isAllocating ? (
                            <>
                                <button onClick={() => decreaseStat(stat.key)} disabled={currentValue <= baseValue} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors">
                                    <Icon name="Minus" size={16} />
                                </button>
                                <p className={`font-bold text-sm text-center w-14 ${bonusValue > 0 ? 'text-green-600' : colorScheme.text}`}>
                                    {baseValue.toLocaleString()}
                                    {bonusValue > 0 && <span className="font-semibold text-xs"> (+{bonusValue.toLocaleString()})</span>}
                                </p>
                                <button onClick={() => increaseStat(stat.key)} disabled={statPoints <= 0} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors">
                                    <Icon name="Plus" size={16} />
                                </button>
                            </>
                        ) : (
                            <p className={`font-bold text-base ${colorScheme.text}`}>{currentValue.toLocaleString()}</p>
                        )}
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderSkillBadge = (skill: string, index: number) => {
    const colors = ["from-blue-500 to-purple-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
    let skillIcon: React.ReactNode = null;
    if (index === 0) skillIcon = <Icon name="Sword" size={14} />;
    if (index === 1) skillIcon = <Icon name="Shield" size={14} />;
    if (index === 2) skillIcon = <Icon name="Zap" size={14} />;

    return (
      <span key={index} className={`bg-gradient-to-r ${colors[index % colors.length]} text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1.5 transition-all hover:scale-105`}>
        {skillIcon} {skill}
      </span>
    );
  };

  const ExchangeModal = () => {
    const getResult = () => {
      if (exchangeDirection === 'coinToPoint') return Math.floor(exchangeAmount / 100);
      else return exchangeAmount * 100;
    };
    const hasEnoughResources = () => {
      if (exchangeDirection === 'coinToPoint') return coins >= exchangeAmount;
      else return statPoints >= exchangeAmount;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all text-gray-800">
          <div className="mb-5">
            <div className="bg-gray-100 p-1 rounded-lg flex mb-2">
              <button onClick={() => setExchangeDirection('coinToPoint')} className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${exchangeDirection === 'coinToPoint' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Icon name="Coins" size={16} /> Coin → Point
              </button>
              <button onClick={() => setExchangeDirection('pointToCoin')} className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${exchangeDirection === 'pointToCoin' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                 <img src={pointsIconUrl} alt="Point Icon" className="w-4 h-4" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }} /> Point → Coin
              </button>
            </div>
            <div className="text-xs text-gray-500 italic text-center">Chọn loại tài nguyên bạn muốn chuyển đổi</div>
          </div>
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span>Số lượng chuyển đổi</span>
              <div className="ml-auto text-xs text-gray-500">{exchangeDirection === 'coinToPoint' ? `Hiện có: ${coins.toLocaleString()} Coin` : `Hiện có: ${statPoints} Point`}</div>
            </h4>
            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button onClick={() => adjustExchangeAmount(-100)} className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Icon name="Minus" size={18} /></button>
              <div className="flex-1 mx-2">
                <input type="number" value={exchangeAmount} onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-gray-700" />
              </div>
              <button onClick={() => adjustExchangeAmount(100)} className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Icon name="Plus" size={18} /></button>
            </div>
            <div className="text-xs text-gray-500 italic text-center mt-1">{exchangeDirection === 'coinToPoint' ? '100 Coin = 1 Point' : '1 Point = 100 Coin'}</div>
          </div>
          <div className="mb-5 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {exchangeDirection === 'coinToPoint' ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
                    <img src={pointsIconUrl} alt="Point Icon" className="w-6 h-6 absolute inset-0 m-auto" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }} />
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
                  {getResult().toLocaleString()} <span className="ml-1 text-sm">{exchangeDirection === 'coinToPoint' ? 'Point' : 'Coin'}</span>
                </div>
              </div>
            </div>
          </div>
          {!hasEnoughResources() && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex">
                <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Không đủ tài nguyên</h4>
                  <p className="text-red-700 text-xs">{exchangeDirection === 'coinToPoint' ? `Bạn cần tối thiểu ${exchangeAmount.toLocaleString()} Coin.` : `Bạn cần tối thiểu ${exchangeAmount.toLocaleString()} Point.`}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowExchangeModal(false)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors">Hủy</button>
            <button onClick={handleExchange} disabled={!hasEnoughResources()} className={`flex-1 px-3 py-2 rounded-lg font-medium text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${hasEnoughResources() ? 'bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700' : 'bg-gray-400 cursor-not-allowed'}`}>Chuyển Đổi</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 rounded-lg overflow-hidden relative shadow-2xl border-b border-l border-r border-slate-700/50">
      <style jsx>{`
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
        @keyframes glow { 0%, 100% { text-shadow: 0 0 5px #a78bfa; } 50% { text-shadow: 0 0 10px #c4b5fd, 0 0 12px #a78bfa; } }
        .animate-glow { animation: glow 3s infinite alternate; }
      `}</style>

      {/* Header Section */}
      <div className="flex-shrink-0 relative h-12 flex items-center justify-end px-3 overflow-hidden rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-b border-l border-r border-slate-700/50">
        <div className="absolute inset-0 z-0"><HeaderBackground /></div>
        <div className="flex items-center relative z-10"></div>
        <div className="relative flex items-center space-x-2 overflow-hidden z-10">
          <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} className="text-white" />
          <button onClick={() => setShowExchangeModal(true)} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-medium transition-colors hover:bg-gray-600 flex items-center justify-center border border-gray-600" title="Chuyển đổi Coin/Point">
            <img src={exchangeIconUrl} alt="Exchange Icon" className="w-4 h-4" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = exchangeIconPlaceholderUrl; }}/>
          </button>
          <div className={`bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${pointBadgePulse ? 'animate-pulse' : ''}`}>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
            <div className="relative mr-0.5 flex items-center justify-center z-10">
              <img src={pointsIconUrl} alt="Point Icon" className="w-4 h-4" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = pointsIconPlaceholderUrl; }}/>
            </div>
            <div className="font-bold text-purple-100 text-xs tracking-wide animate-glow z-10 pr-1">{statPoints}</div>
          </div>
        </div>
      </div>

      {/* Main content area - SCROLLABLE */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        {/* Stats Section */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold text-gray-600 flex items-center">
                <Icon name="Trophy" size={16} className="mr-2 text-gray-500" /> STATS
              </h3>
              
              {/* NEW: Unified control buttons */}
              <div className="flex items-center gap-2">
                {isAllocating ? (
                  <>
                    <button onClick={cancelChanges} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition-colors">
                      Hủy
                    </button>
                    <button onClick={applyChanges} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all">
                      Áp dụng
                    </button>
                  </>
                ) : (
                  statPoints > 0 && (
                    <button onClick={() => setIsAllocating(true)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-1.5">
                      <Icon name="Plus" size={14} />
                      Phân bổ {statPoints} điểm
                    </button>
                  )
                )}
              </div>
            </div>

            {renderStats()}

            {isAllocating && (
                <div className="bg-blue-50 rounded-lg p-3 mt-4 flex items-start">
                  <Icon name="AlertCircle" size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Mẹo phân bổ điểm:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>ATK, DEF, LUCK, INT, CRT: +2 cho mỗi điểm</li>
                      <li>HP: +25 cho mỗi điểm</li>
                    </ul>
                  </div>
                </div>
            )}
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
            <Icon name="Zap" size={16} className="mr-2 text-gray-400" /> SKILLS
          </h3>
          <div className="flex flex-wrap gap-3">
            {character.skills.map((skill, index) => renderSkillBadge(skill, index))}
          </div>
        </div>

      </div> {/* End of main content area */}

      {/* Render Exchange Modal (conditionally) */}
      {showExchangeModal && <ExchangeModal />}

      {/* Render Reset Stats Modal (conditionally) */}
      {showResetModal && (
        <ResetStatsControl
           currentStats={character.stats}
           onStatsReset={handleActualReset}
           onClose={() => setShowResetModal(false)}
        />
      )}

      {/* Footer Section with Reset button moved back */}
      {onClose && (
        <BackButton
          onClick={onClose}
          rightContent={
             <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-md transition-colors flex items-center gap-1.5"
             >
                <Icon name="RotateCcw" size={14} />
                Reset Chỉ Số
             </button>
          }
        />
      )}
    </div>
  );
}
