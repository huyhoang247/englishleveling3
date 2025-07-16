import React, { useState } from 'react';

// --- ICONS (Được tinh chỉnh để phù hợp với chủ đề lửa) ---
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" strokeWidth="1">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" fontSize="14" fill="#8B4513" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_3px_rgba(220,38,38,0.7)]" width="48" height="48" viewBox="0 0 24 24" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_3px_rgba(209,213,219,0.5)]" width="48" height="48" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.8">
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42zM7 17l-3 3l-1.5-1.5L4 17m3-3l4-4" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_3px_rgba(59,130,246,0.5)]" width="48" height="48" viewBox="0 0 24 24" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8">
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

// --- COMPONENT STATCARD VỚI GIAO DIỆN LÕI DUNG NHAM ---
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseValue, upgradeBonus } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl w-32 sm:w-36 md:w-40 text-center font-bold text-slate-300 transform transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5),_inset_0_1px_2px_rgba(255,255,255,0.1)] border border-gray-700/50
                     hover:shadow-[0_0_25px_rgba(234,88,12,0.4),_0_0_40px_rgba(234,88,12,0.3),_inset_0_1px_2px_rgba(255,255,255,0.1)]">
        
        {/* Header của thẻ - Tấm kim loại được rèn */}
        <div className="bg-gradient-to-b from-gray-800 to-black/80 py-1 px-4 rounded-t-xl border-b border-gray-600">
          <p className="text-orange-400 text-shadow-sm tracking-widest">LV.{level}</p>
        </div>

        <div className="p-3 flex flex-col items-center gap-2">
          <div className="w-12 h-12 mb-1">{icon}</div>
          <p className="text-xl text-white drop-shadow-md">+{totalValue.toLocaleString()}</p>
          <p className="text-lg uppercase text-slate-400">{name}</p>
          
          {/* Nút nâng cấp - Nút dung nham */}
          <button
            onClick={() => onUpgrade(stat.id)}
            className="w-full bg-gradient-to-b from-amber-500 to-orange-600 text-white border border-amber-400/50 rounded-lg py-2 px-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-amber-500/40 hover:from-amber-400 hover:to-orange-500 active:shadow-inner active:translate-y-px transition-all duration-200"
          >
            <div className="w-5 h-5">{icons.coin}</div>
            <span className="font-bold">{upgradeCost.toLocaleString()}</span>
          </button>
        </div>
    </div>
  );
};

// --- COMPONENT CHÍNH VỚI GIAO DIỆN MOLTEN CORE ---
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
          
          body { background-color: #000; }
          
          .font-lilita { font-family: 'Lilita One', cursive; }
          .text-shadow { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); }
          .text-shadow-fire { text-shadow: 0 0 8px rgba(255, 165, 0, 0.7), 0 0 10px rgba(220, 38, 38, 0.5); }

          .text-gradient-fire {
            background-image: linear-gradient(to bottom, #fcd34d, #fb923c, #ea580c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          /* Nền chính - Lõi núi lửa */
          .molten-core-bg {
             background-color: #111827;
             background-image: 
                radial-gradient(ellipse at center, rgba(124, 45, 18, 0.3) 0%, transparent 60%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
             background-blend-mode: color-dodge;
             opacity: 0.8;
          }

          /* Animation cho thanh dung nham */
          @keyframes molten-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .lava-bar {
            background: linear-gradient(-45deg, #f59e0b, #ea580c, #fcd34d, #dc2626);
            background-size: 400% 400%;
            animation: molten-flow 8s ease infinite;
          }
        `}
      </style>

      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-red-600 to-red-800 text-white py-2 px-6 rounded-lg shadow-lg shadow-red-500/30 z-50 font-lilita border-2 border-red-500/50">
          {message}
        </div>
      )}

      {/* Container chính với nền dung nham */}
      <div className="w-full min-h-screen p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden relative">
        <div className="absolute inset-0 molten-core-bg z-[-1]"></div>
        
        <div className="w-full max-w-md mx-auto z-10">
          
          <header className="w-full flex justify-end mb-4">
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-full py-1.5 px-5 flex items-center gap-3 border border-gray-700 shadow-lg shadow-black/50">
                  <div className="w-6 h-6">{icons.coin}</div>
                  <span className="text-xl text-yellow-300 text-shadow-fire font-bold tracking-wider">{gold.toLocaleString()}</span>
              </div>
          </header>

          <h1 className="text-5xl md:text-6xl text-center text-gradient-fire drop-shadow-[0_2px_10px_rgba(234,88,12,0.5)] my-4">
            Warrior Forge
          </h1>

          <div className="my-6 flex justify-center">
            <div className="relative w-48 h-48 bg-black/30 rounded-full flex items-center justify-center border-2 border-orange-900/70 shadow-inner shadow-black/50">
                <div className="absolute inset-0 rounded-full shadow-[0_0_30px_8px_rgba(251,146,60,0.3)] animate-pulse"></div>
                {/* SVG nhân vật không đổi */}
                <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)]">
                    <g transform="translate(0, 10)"><path d="M 50,75 C 40,60 160,60 150,75 C 200,80 0,80 50,75" fill="#F0E68C" stroke="#D2B48C" strokeWidth="3"/><ellipse cx="100" cy="65" rx="40" ry="15" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="3"/><path d="M 40,90 C 10,140 190,140 160,90 C 170,70 30,70 40,90 Z" fill="#FFC0CB" stroke="#B38891" strokeWidth="3"/><circle cx="85" cy="100" r="5" fill="black"/><circle cx="115" cy="100" r="5" fill="black"/><ellipse cx="100" cy="115" rx="20" ry="12" fill="#FFA07A" stroke="#B38891" strokeWidth="2"/><circle cx="95" cy="115" r="3" fill="#8B4513"/><circle cx="105" cy="115" r="3" fill="#8B4513"/><g transform="rotate(45 150 50)"><rect x="145" y="0" width="10" height="50" fill="#C0C0C0" stroke="#808080" strokeWidth="2"/><rect x="140" y="45" width="20" height="8" fill="#8B4513" stroke="#5C2E00" strokeWidth="2"/><circle cx="150" cy="60" r="5" fill="#FFD700"/></g><g transform="rotate(-15 40 120)"><ellipse cx="40" cy="120" rx="15" ry="20" fill="#A0522D" stroke="#5C2E00" strokeWidth="2"/><circle cx="40" cy="120" r="5" fill="#FFD700"/></g></g>
                </svg>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto px-2 mt-4 mb-10">
            <div className="text-center mb-2 text-lg text-orange-300 text-shadow-fire tracking-wider">
              Prestige {prestigeLevel}
            </div>
            {/* Thanh tiến trình dung nham */}
            <div className="relative w-full h-6 bg-black/70 rounded-full border border-gray-800 shadow-inner shadow-black/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out lava-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm text-white text-shadow tracking-wider">
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
