import React, { useState, useEffect } from 'react';

// --- ICONS ---
const icons = {
  coin: (
    <img 
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" 
      alt="Gold Coin Icon" 
    />
  ),
  heart: (
    <img 
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000384c61f89f8572bc1cce6ca4.png" 
      alt="HP Icon" 
    />
  ),
  sword: (
    <img 
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000002e7061f7aa3134f2cd28f2f5.png" 
      alt="ATK Icon" 
    />
  ),
  shield: (
    <img 
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000255061f7915533f0d00520b8.png" 
      alt="DEF Icon" 
    />
  )
};

// --- LOGIC TÍNH TOÁN ---
const calculateUpgradeCost = (level) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  return baseCost * Math.pow(2, tier);
};

const getBonusForLevel = (level, baseBonus) => {
  if (level === 0) return 0;
  const tier = Math.floor((level - 1) / 10);
  return baseBonus * Math.pow(2, tier);
};

const calculateTotalStatValue = (currentLevel, baseBonus) => {
  if (currentLevel === 0) return 0;
  let totalValue = 0;
  const fullTiers = Math.floor(currentLevel / 10);
  const remainingLevelsInCurrentTier = currentLevel % 10;
  for (let i = 0; i < fullTiers; i++) {
    const bonusInTier = baseBonus * Math.pow(2, i);
    totalValue += 10 * bonusInTier;
  }
  const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers);
  totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier;
  return totalValue;
};

const formatNumber = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) {
      const thousands = num / 1000;
      return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }
  if (num < 1000000000) {
      const millions = num / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  const billions = num / 1000000000;
  return `${billions % 1 === 0 ? billions : billions.toFixed(1)}B`;
};


// --- COMPONENT STAT CARD ---
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseUpgradeBonus, color } = stat;
  const nextUpgradeBonus = getBonusForLevel(level + 1, baseUpgradeBonus);
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className={`relative group rounded-xl bg-gradient-to-r ${color} p-px 
                    transition-all duration-300 
                    hover:shadow-lg hover:shadow-cyan-500/10`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow"></div>
      
      <div className="relative bg-slate-900/95 rounded-[11px] p-4 h-full flex flex-col items-center justify-between gap-3 text-center text-white w-28 sm:w-32 md:w-36">
        <div className="w-10 h-10">{icon}</div>
        <div className="flex-grow flex flex-col items-center gap-1">
          <p className="text-lg uppercase font-bold tracking-wider">{name}</p>
          <p className="text-2xl font-black text-shadow-cyan">+{formatNumber(nextUpgradeBonus)}</p>
          <p className="text-xs text-slate-400">Level {level}</p>
        </div>
        <button
          onClick={() => onUpgrade(stat.id)}
          className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-lg py-2 px-1 flex items-center justify-center gap-1 shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="w-5 h-5 flex-shrink-0">{icons.coin}</div>
          <span className="text-base font-bold text-yellow-300">{formatNumber(upgradeCost)}</span>
        </button>
      </div>
    </div>
  );
};

interface UpgradeStatsScreenProps {
  onClose: () => void;
  initialGold: number;
  onUpdateGold: (amount: number) => void;
}

// --- COMPONENT CHÍNH CỦA ỨNG DỤNG ---
export default function UpgradeStatsScreen({ onClose, initialGold, onUpdateGold }: UpgradeStatsScreenProps) {
  // Local state for stats and messages
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 0, icon: icons.heart, baseUpgradeBonus: 50, color: "from-red-600 to-pink-600" },
    { id: 'atk', name: 'ATK', level: 0, icon: icons.sword, baseUpgradeBonus: 5, color: "from-sky-500 to-cyan-500" },
    { id: 'def', name: 'DEF', level: 0, icon: icons.shield, baseUpgradeBonus: 5, color: "from-blue-500 to-indigo-500" },
  ]);
  const [message, setMessage] = useState('');

  // Handle the upgrade logic
  const handleUpgrade = (statId) => {
    const statIndex = stats.findIndex(s => s.id === statId);
    if (statIndex === -1) return;

    const statToUpgrade = stats[statIndex];
    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (initialGold >= upgradeCost) {
      onUpdateGold(-upgradeCost); // Send a negative value to deduct gold
      const newStats = [...stats];
      newStats[statIndex] = { ...newStats[statIndex], level: newStats[statIndex].level + 1 };
      setStats(newStats);
      setMessage('');
    } else {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Calculations for display
  const totalHp = calculateTotalStatValue(stats.find(s => s.id === 'hp').level, stats.find(s => s.id === 'hp').baseUpgradeBonus);
  const totalAtk = calculateTotalStatValue(stats.find(s => s.id === 'atk').level, stats.find(s => s.id === 'atk').baseUpgradeBonus);
  const totalDef = calculateTotalStatValue(stats.find(s => s.id === 'def').level, stats.find(s => s.id === 'def').baseUpgradeBonus);
  
  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
          .font-lilita { font-family: 'Lilita One', cursive; }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
          .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
          .text-shadow-cyan { text-shadow: 0 0 8px rgba(0, 246, 255, 0.7); }
          
          @keyframes animate-gradient-border {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-border-flow {
            background-size: 400% 400%;
            animation: animate-gradient-border 3s linear infinite;
          }

          .animate-breathing {
            animation: breathing 5s ease-in-out infinite;
          }
          @keyframes breathing {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4)); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.7));}
          }

          .main-bg::before, .main-bg::after {
            content: '';
            position: absolute;
            left: 50%;
            z-index: 0;
            pointer-events: none;
          }
          .main-bg::before {
             width: 150%;
             height: 150%;
             top: 50%;
             transform: translate(-50%, -50%);
             background-image: radial-gradient(circle, transparent 40%, #110f21 80%);
          }
           .main-bg::after {
             width: 100%;
             height: 100%;
             top: 0;
             transform: translateX(-50%);
             background-image: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          }
      `}</style>

      {/* --- HEADER MỚI --- */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-white bg-slate-800/50 hover:bg-red-500/60 transition-colors duration-300"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="bg-slate-900/60 border border-slate-700 rounded-lg py-1 px-3 flex items-center gap-2 shadow-lg">
          <div className="w-5 h-5">{icons.coin}</div>
          <span className="text-lg text-yellow-300 font-bold text-shadow-sm">{initialGold.toLocaleString()}</span>
        </div>
      </header>
      
      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600/90 border border-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">
          {message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-10">
          
          {/* --- HERO GRAPHIC --- */}
          <div className="mb-4 w-48 h-48 flex items-center justify-center animate-breathing">
            <img 
              src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-16_15-55-32-819.png" 
              alt="Hero Stone Icon"
              className="w-full h-full object-contain"
            />
          </div>

          {/* --- KHU VỰC HIỂN THỊ CHỈ SỐ TỔNG --- */}
          <div className="w-full max-w-xs bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">{icons.heart}</div>
              <span className="text-lg font-bold">{formatNumber(totalHp)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">{icons.sword}</div>
              <span className="text-lg font-bold">{formatNumber(totalAtk)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">{icons.shield}</div>
              <span className="text-lg font-bold">{formatNumber(totalDef)}</span>
            </div>
          </div>
          
          {/* --- THANH TIẾN TRÌNH --- */}
          <div className="w-full px-2 mb-8">
            <div className="flex justify-between items-baseline mb-2 px-1">
              <span className="text-md font-bold text-slate-400 tracking-wide text-shadow-sm">Stage {prestigeLevel + 1}</span>
              <span className="text-sm font-semibold text-slate-400">Lv. {totalLevels}</span>
            </div>
            <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_8px_rgba(0,246,255,0.45)] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute inset-0 flex justify-end items-center px-4 text-sm text-white text-shadow-sm font-bold">
                    <span>{currentProgress}<span className="text-slate-300">/{maxProgress}</span></span>
                </div>
            </div>
          </div>

          <div className="flex flex-row justify-center items-stretch gap-3 sm:gap-4">
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>
    </div>
  );
}
