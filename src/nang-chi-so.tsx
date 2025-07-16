import React, { useState } from 'react';

// --- ICONS (KHÔNG THAY ĐỔI LOGIC, CHỈ THÊM HIỆU ỨNG TRONG CSS) ---
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" strokeWidth="1">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" fontSize="14" fill="#8B4513" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#FF4F4F" stroke="#C00" strokeWidth="1">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="1">
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42zM7 17l-3 3l-1.5-1.5L4 17m3-3l4-4" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" width="48" height="48" viewBox="0 0 24 24" fill="#6495ED" stroke="#4169E1" strokeWidth="1">
      <path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12c.52-.13 1.03-.3 1.5-.5A10.46 10.46 0 0 1 12 22C6.48 20.74 4 15.55 4 11V6.3l8-2.4l8 2.4V11c0 1.82-.5 3.53-1.36 5.04L12 2z" />
      <path d="M12 22c5.16-1.26 9-6.45 9-12V5l-9-3l-9 3v6c0 5.55 3.84 10.74 9 12z" />
    </svg>
  )
};

// --- LOGIC (KHÔNG THAY ĐỔI) ---
const calculateUpgradeCost = (level) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  const cost = baseCost * Math.pow(2, tier);
  return cost;
};

// --- COMPONENT STATCARD ĐƯỢC NÂNG CẤP GIAO DIỆN ---
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseValue, upgradeBonus } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className="bg-gradient-to-br from-[#fdf6e3] to-[#eaddc7] w-28 sm:w-36 md:w-44 rounded-2xl border-4 border-[#6b4a2e] shadow-lg text-center font-bold text-[#5c381e] transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/20">
      {/* Header của thẻ */}
      <div className="bg-gradient-to-b from-[#8a5a3a] to-[#6b4a2e] py-1 px-4 rounded-t-lg -m-1 mb-3 border-b-4 border-[#6b4a2e] shadow-inner">
        <p className="text-amber-200 text-shadow-sm tracking-widest">LV.{level}</p>
      </div>
      <div className="p-2 sm:p-3 flex flex-col items-center gap-2">
        <div className="w-12 h-12 mb-1">{icon}</div>
        <p className="text-xl text-[#3d2512] drop-shadow-sm">+{totalValue.toLocaleString()}</p>
        <p className="text-lg uppercase text-[#7a4a2a]">{name}</p>
        
        {/* Nút nâng cấp được thiết kế lại */}
        <button
          onClick={() => onUpgrade(stat.id)}
          className="w-full bg-gradient-to-b from-amber-400 to-amber-600 text-amber-900 border-2 border-amber-700/80 rounded-lg py-2 px-3 flex items-center justify-center gap-2 shadow-md hover:from-amber-300 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 active:shadow-inner active:translate-y-px transition-all duration-150"
        >
          <div className="w-5 h-5">{icons.coin}</div>
          <span className="font-bold">{upgradeCost.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH CỦA ỨNG DỤNG VỚI GIAO DIỆN MỚI ---
export default function App() {
  const [gold, setGold] = useState(190600);
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 10, icon: icons.heart, baseValue: 0, upgradeBonus: 50 },
    { id: 'atk', name: 'ATK', level: 5, icon: icons.sword, baseValue: 0, upgradeBonus: 15 },
    { id: 'def', name: 'DEF', level: 8, icon: icons.shield, baseValue: 0, upgradeBonus: 5 },
  ]);
  const [message, setMessage] = useState('');

  const handleUpgrade = (statId) => {
    const statIndex = stats.findIndex(s => s.id === statId);
    if (statIndex === -1) return;

    const statToUpgrade = stats[statIndex];
    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (gold >= upgradeCost) {
      setGold(prevGold => prevGold - upgradeCost);
      const newStats = [...stats];
      newStats[statIndex] = { ...newStats[statIndex], level: newStats[statIndex].level + 1 };
      setStats(newStats);
      setMessage('');
    } else {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // --- LOGIC THANH TIẾN TRÌNH (KHÔNG THAY ĐỔI) ---
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
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
          .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
          .text-gradient {
            background-image: linear-gradient(to bottom, #fde047, #d97706);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          
          /* Animation cho thông báo */
          .alert-enter {
            opacity: 0;
            transform: translateY(-20px);
          }
          .alert-enter-active {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 300ms, transform 300ms;
          }
        `}
      </style>

      {/* Thông báo được thiết kế lại */}
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-red-700 to-red-900 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita border-2 border-red-500/50 alert-enter-active">
          {message}
        </div>
      )}

      {/* Nền được thiết kế lại với radial gradient */}
      <div className="w-full min-h-screen bg-[#2a1a0a] bg-[radial-gradient(circle_at_center,_#4a2a1a_0%,_#2a1a0a_70%)] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
        <div className="w-full max-w-lg mx-auto">
          
          {/* Header hiển thị vàng */}
          <header className="w-full flex justify-end mb-4">
              <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-full py-1.5 px-5 flex items-center gap-3 border-2 border-yellow-600/50 shadow-lg shadow-black/30">
                  <div className="w-6 h-6">{icons.coin}</div>
                  <span className="text-xl text-yellow-300 text-shadow-sm font-bold tracking-wider">{gold.toLocaleString()}</span>
              </div>
          </header>

          {/* Tiêu đề chính với hiệu ứng gradient */}
          <h1 className="text-5xl md:text-6xl text-center text-gradient drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] my-2">
            Warrior Stats
          </h1>

          {/* Khung hiển thị nhân vật */}
          <div className="my-6 flex justify-center">
            <div className="relative w-48 h-48 bg-slate-800/50 rounded-full flex items-center justify-center border-4 border-slate-600/70 shadow-inner shadow-black/50">
                <div className="absolute inset-0 rounded-full shadow-[0_0_25px_5px_rgba(253,224,71,0.25)] animate-pulse-slow"></div>
                <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.4)]">
                    <g transform="translate(0, 10)">
                        <path d="M 50,75 C 40,60 160,60 150,75 C 200,80 0,80 50,75" fill="#F0E68C" stroke="#D2B48C" strokeWidth="3"/>
                        <ellipse cx="100" cy="65" rx="40" ry="15" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="3"/>
                        <path d="M 40,90 C 10,140 190,140 160,90 C 170,70 30,70 40,90 Z" fill="#FFC0CB" stroke="#B38891" strokeWidth="3"/>
                        <circle cx="85" cy="100" r="5" fill="black"/>
                        <circle cx="115" cy="100" r="5" fill="black"/>
                        <ellipse cx="100" cy="115" rx="20" ry="12" fill="#FFA07A" stroke="#B38891" strokeWidth="2"/>
                        <circle cx="95" cy="115" r="3" fill="#8B4513"/>
                        <circle cx="105" cy="115" r="3" fill="#8B4513"/>
                        <g transform="rotate(45 150 50)">
                            <rect x="145" y="0" width="10" height="50" fill="#C0C0C0" stroke="#808080" strokeWidth="2"/>
                            <rect x="140" y="45" width="20" height="8" fill="#8B4513" stroke="#5C2E00" strokeWidth="2"/>
                            <circle cx="150" cy="60" r="5" fill="#FFD700"/>
                        </g>
                        <g transform="rotate(-15 40 120)">
                            <ellipse cx="40" cy="120" rx="15" ry="20" fill="#A0522D" stroke="#5C2E00" strokeWidth="2"/>
                            <circle cx="40" cy="120" r="5" fill="#FFD700"/>
                        </g>
                    </g>
                </svg>
            </div>
          </div>

          {/* Thanh tiến trình được thiết kế lại hoàn toàn */}
          <div className="w-full max-w-sm mx-auto px-2 mt-2 mb-8">
            <div className="text-center mb-2 text-lg text-amber-300 text-shadow-sm tracking-wider">
              Prestige {prestigeLevel} - Total Upgrades
            </div>
            <div className="relative w-full h-7 bg-slate-900/70 rounded-full border-2 border-slate-600/50 shadow-inner shadow-black/50">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out shadow-inner"
                style={{ width: `${progressPercent}%` }}
              >
                 <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_right,_rgba(255,255,255,0.2)_0%,_rgba(255,255,255,0)_60%)]"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm text-white text-shadow-sm tracking-wider">
                  {currentProgress} / {maxProgress}
                </span>
              </div>
            </div>
          </div>

          {/* Các thẻ chỉ số */}
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
