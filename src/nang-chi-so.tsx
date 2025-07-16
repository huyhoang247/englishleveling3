import React, { useState } from 'react';

// --- ICONS (Điều chỉnh drop-shadow cho nền sáng) ---
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" strokeWidth="1">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" fontSize="14" fill="#8B4513" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#FF4F4F" stroke="#C00" strokeWidth="0.8">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#64748B" stroke="#475569" strokeWidth="0.8">
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42zM7 17l-3 3l-1.5-1.5L4 17m3-3l4-4" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#60A5FA" stroke="#3B82F6" strokeWidth="0.8">
      <path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12c.52-.13 1.03-.3 1.5-.5A10.46 10.46 0 0 1 12 22C6.48 20.74 4 15.55 4 11V6.3l8-2.4l8 2.4V11c0 1.82-.5 3.53-1.36 5.04L12 2z" />
      <path d="M12 22c5.16-1.26 9-6.45 9-12V5l-9-3l-9 3v6c0 5.55 3.84 10.74 9 12z" />
    </svg>
  )
};

const calculateUpgradeCost = (level) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  const cost = baseCost * Math.pow(2, tier);
  return cost;
};

// --- COMPONENT STATCARD VỚI GIAO DIỆN ĐÁ CHẠM KHẮC ---
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseValue, upgradeBonus } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className="relative bg-white/70 backdrop-blur-sm rounded-xl w-32 sm:w-36 md:w-40 text-center font-bold transform transition-all duration-300
                    border border-slate-200/80 shadow-lg shadow-slate-300/60 hover:shadow-xl hover:shadow-slate-400/50 hover:scale-[1.03]">
        
        {/* Header thẻ - được khắc lõm */}
        <div className="bg-slate-100/80 py-1 px-4 rounded-t-xl border-b border-slate-200 shadow-inner">
          <p className="text-slate-500 tracking-widest">LV.{level}</p>
        </div>

        <div className="p-3 flex flex-col items-center gap-2">
          <div className="w-12 h-12 mb-1">{icon}</div>
          <p className="text-xl text-slate-800 drop-shadow-sm">+{totalValue.toLocaleString()}</p>
          <p className="text-lg uppercase text-slate-500 font-semibold">{name}</p>
          
          {/* Nút nâng cấp - Kim loại đồng */}
          <button
            onClick={() => onUpgrade(stat.id)}
            className="w-full bg-gradient-to-b from-amber-400 to-orange-500 text-amber-900 font-bold border border-amber-500/50 rounded-lg py-2 px-3 flex items-center justify-center gap-2 shadow-md hover:from-amber-300 hover:to-orange-400 active:shadow-inner active:translate-y-px transition-all duration-200"
          >
            <div className="w-5 h-5">{icons.coin}</div>
            <span>{upgradeCost.toLocaleString()}</span>
          </button>
        </div>
    </div>
  );
};

// --- COMPONENT CHÍNH VỚI GIAO DIỆN STONE FORGERY ---
export default function App() {
  const [gold, setGold] = useState(190600);
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 10, icon: icons.heart, baseValue: 0, upgradeBonus: 50 },
    { id: 'atk', name: 'ATK', level: 5, icon: icons.sword, baseValue: 0, upgradeBonus: 15 },
    { id: 'def', name: 'DEF', level: 8, icon: icons.shield, baseValue: 0, upgradeBonus: 5 },
  ]);
  const [message, setMessage] = useState('');

  const handleUpgrade = (statId) => {
    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;
    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (gold >= upgradeCost) {
      setGold(prevGold => prevGold - upgradeCost);
      setStats(prevStats => prevStats.map(stat => stat.id === statId ? { ...stat, level: stat.level + 1 } : stat));
    } else {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
          
          .font-lilita { font-family: 'Lilita One', cursive; }
          .text-shadow-subtle { text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }

          /* Nền đá xám nhạt */
          .stone-bg {
             background-color: #f1f5f9; /* slate-100 */
             background-image: radial-gradient(circle at top, #f8fafc, #e2e8f0);
          }
        `}
      </style>

      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg shadow-red-500/20 z-50 font-lilita border border-red-600/50">
          {message}
        </div>
      )}

      {/* Container chính với nền đá sáng */}
      <div className="w-full min-h-screen stone-bg p-4 flex flex-col items-center justify-center font-lilita overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          
          <header className="w-full flex justify-end mb-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-full py-1.5 px-5 flex items-center gap-3 border border-slate-300 shadow-md shadow-slate-200/80">
                  <div className="w-6 h-6">{icons.coin}</div>
                  <span className="text-xl text-amber-700 font-bold tracking-wider">{gold.toLocaleString()}</span>
              </div>
          </header>

          <h1 className="text-5xl md:text-6xl text-center text-slate-700 drop-shadow-md my-4">
            Warrior Stats
          </h1>

          <div className="my-6 flex justify-center">
            <div className="relative w-48 h-48 bg-white/50 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-inner shadow-slate-300">
                <div className="absolute inset-0 rounded-full shadow-[0_0_25px_8px_rgba(100,116,139,0.1)] animate-pulse"></div>
                {/* SVG nhân vật không đổi */}
                <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.15)]">
                    <g transform="translate(0, 10)"><path d="M 50,75 C 40,60 160,60 150,75 C 200,80 0,80 50,75" fill="#F0E68C" stroke="#D2B48C" strokeWidth="3"/><ellipse cx="100" cy="65" rx="40" ry="15" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="3"/><path d="M 40,90 C 10,140 190,140 160,90 C 170,70 30,70 40,90 Z" fill="#FFC0CB" stroke="#B38891" strokeWidth="3"/><circle cx="85" cy="100" r="5" fill="black"/><circle cx="115" cy="100" r="5" fill="black"/><ellipse cx="100" cy="115" rx="20" ry="12" fill="#FFA07A" stroke="#B38891" strokeWidth="2"/><circle cx="95" cy="115" r="3" fill="#8B4513"/><circle cx="105" cy="115" r="3" fill="#8B4513"/><g transform="rotate(45 150 50)"><rect x="145" y="0" width="10" height="50" fill="#C0C0C0" stroke="#808080" strokeWidth="2"/><rect x="140" y="45" width="20" height="8" fill="#8B4513" stroke="#5C2E00" strokeWidth="2"/><circle cx="150" cy="60" r="5" fill="#FFD700"/></g><g transform="rotate(-15 40 120)"><ellipse cx="40" cy="120" rx="15" ry="20" fill="#A0522D" stroke="#5C2E00" strokeWidth="2"/><circle cx="40" cy="120" r="5" fill="#FFD700"/></g></g>
                </svg>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto px-2 mt-4 mb-10">
            <div className="text-center mb-2 text-lg text-slate-600 tracking-wider">
              Prestige {prestigeLevel}
            </div>
            {/* Thanh tiến trình kim loại đồng */}
            <div className="relative w-full h-6 bg-slate-200 rounded-full border border-slate-300/70 shadow-inner shadow-slate-300 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm text-slate-800 text-shadow-subtle tracking-wider">
                  {currentProgress} / {maxProgress}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-center items-start gap-3 sm:gap-4">
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
