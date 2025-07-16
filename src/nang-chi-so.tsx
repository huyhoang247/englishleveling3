import React, 'useState } from 'react';

// --- ICONS ĐƯỢC NÂNG CẤP ---
// Helper component cho các icon SVG được thiết kế lại với gradient để có chiều sâu
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#gold-gradient)" stroke="#B8860B" strokeWidth="1">
      <defs>
        <radialGradient id="gold-gradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFF7B2" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FDB813" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="17" fontSize="14" fill="#8B4513" textAnchor="middle" fontWeight="bold">★</text>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="url(#heart-gradient)" stroke="#990000" strokeWidth="1">
       <defs>
        <radialGradient id="heart-gradient" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#FF8A8A" />
          <stop offset="100%" stopColor="#FF4F4F" />
        </radialGradient>
      </defs>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="url(#steel-gradient)" stroke="#555" strokeWidth="1">
       <defs>
        <linearGradient id="steel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="100%" stopColor="#A0A0A0" />
        </linearGradient>
      </defs>
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42zM7 17l-3 3l-1.5-1.5L4 17m3-3l4-4" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="url(#shield-gradient)" stroke="#2C5282" strokeWidth="1">
      <defs>
        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A0A0FF" />
          <stop offset="100%" stopColor="#4A90E2" />
        </linearGradient>
      </defs>
      <path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12c.52-.13 1.03-.3 1.5-.5A10.46 10.46 0 0 1 12 22C6.48 20.74 4 15.55 4 11V6.3l8-2.4l8 2.4V11c0 1.82-.5 3.53-1.36 5.04L12 2z" />
      <path d="M12 22c5.16-1.26 9-6.45 9-12V5l-9-3l-9 3v6c0 5.55 3.84 10.74 9 12z" />
    </svg>
  )
};

// Hàm tính toán chi phí nâng cấp (giữ nguyên)
const calculateUpgradeCost = (level) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  const cost = baseCost * Math.pow(2, tier);
  return cost;
};

// --- COMPONENT CARD ĐƯỢC THIẾT KẾ LẠI HOÀN TOÀN ---
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseValue, upgradeBonus } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className="relative bg-[#2d203f] w-32 sm:w-36 md:w-44 rounded-2xl border-2 border-purple-400/30 shadow-lg text-center font-bold text-slate-200 transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/30">
      {/* Phần trang trí đầu card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-b from-slate-600 to-slate-800 border-2 border-slate-400 rounded-md flex items-center justify-center shadow-md">
        <p className="text-yellow-300 text-shadow-md">Lv.{level}</p>
      </div>

      <div className="pt-8 pb-3 px-3 flex flex-col items-center gap-3">
        <div className="w-12 h-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{icon}</div>
        <p className="text-2xl text-white text-shadow-md">+{totalValue.toLocaleString()}</p>
        <p className="text-lg uppercase tracking-widest text-purple-300">{name}</p>
        <button
          onClick={() => onUpgrade(stat.id)}
          className="w-full bg-gradient-to-b from-yellow-400 to-amber-600 hover:from-yellow-300 hover:to-amber-500 text-slate-800 border-2 border-yellow-600 rounded-lg py-2 px-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/20 transition-all duration-200 active:shadow-inner active:translate-y-px active:from-yellow-500 active:to-amber-700"
        >
          <div className="w-5 h-5">{icons.coin}</div>
          <span className="font-sans font-semibold">{upgradeCost.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

// Component chính của ứng dụng
export default function App() {
  const [gold, setGold] = useState(190600);
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 12, icon: icons.heart, baseValue: 100, upgradeBonus: 50 },
    { id: 'atk', name: 'ATK', level: 8, icon: icons.sword, baseValue: 20, upgradeBonus: 15 },
    { id: 'def', name: 'DEF', level: 5, icon: icons.shield, baseValue: 10, upgradeBonus: 5 },
  ]);
  const [message, setMessage] = useState('');

  const handleUpgrade = (statId) => {
    const statIndex = stats.findIndex(s => s.id === statId);
    const statToUpgrade = { ...stats[statIndex] };
    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (gold >= upgradeCost) {
      setGold(prevGold => prevGold - upgradeCost);
      const newStats = [...stats];
      newStats[statIndex].level += 1;
      setStats(newStats);
      setMessage('');
    } else {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Logic thanh tiến trình (giữ nguyên)
  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;


  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Roboto:wght@500;700&display=swap');
          .font-lilita { font-family: 'Lilita One', cursive; }
          .font-sans { font-family: 'Roboto', sans-serif; }
          .text-shadow-md { text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
          .text-shadow-lg { text-shadow: 3px 3px 6px rgba(0,0,0,0.7); }

          /* Hiệu ứng shimmer cho thanh tiến trình */
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .progress-shimmer {
            background: linear-gradient(to right, 
              transparent 0%, 
              rgba(255, 255, 255, 0.3) 50%, 
              transparent 100%);
            background-size: 1000px 100%;
            animation: shimmer 3s infinite linear;
          }

          /* Hiệu ứng nền */
          .bg-hero {
            background-color: #1a0933;
            background-image: 
              radial-gradient(circle at 100% 100%, #3a0ca3 0%, transparent 30%),
              radial-gradient(circle at 0% 0%, #7209b7 0%, transparent 40%);
          }
        `}
      </style>

      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600/90 text-white py-2 px-6 rounded-xl shadow-lg z-50 font-lilita animate-bounce border-2 border-red-400">
          {message}
        </div>
      )}

      <div className="w-full min-h-screen bg-hero p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
        {/* Khung giao diện chính */}
        <div className="w-full max-w-lg mx-auto bg-black/30 rounded-2xl p-4 sm:p-6 border-2 border-purple-400/20 shadow-2xl shadow-purple-900/50">
          
          <header className="w-full flex justify-end mb-4">
              <div className="bg-slate-800/50 rounded-full py-2 px-5 flex items-center gap-3 border-2 border-amber-400/50 shadow-md">
                  <div className="w-7 h-7">{icons.coin}</div>
                  <span className="text-2xl text-yellow-300 text-shadow-md font-sans font-bold tracking-wider">{gold.toLocaleString()}</span>
              </div>
          </header>

          <h1 className="text-5xl sm:text-6xl text-center text-shadow-lg my-2 bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 to-amber-500">
            Warrior Stats
          </h1>

          <div className="my-6 flex justify-center drop-shadow-[0_8px_16px_rgba(180,83,245,0.4)]">
            {/* Giữ nguyên SVG nhân vật */}
            <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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

          {/* --- THANH TIẾN TRÌNH ĐƯỢC NÂNG CẤP --- */}
          <div className="w-full px-2 mt-4 mb-8">
            <div className="text-center mb-2 text-xl text-yellow-300 text-shadow-md tracking-wider">
              Prestige Lvl. {prestigeLevel}
            </div>
            <div className="relative w-full h-8 bg-black/50 rounded-full border-2 border-purple-500/50 shadow-inner shadow-black">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Lớp hiệu ứng shimmer */}
                <div className="absolute inset-0 progress-shimmer"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-base text-white text-shadow-md">
                  {currentProgress} / {maxProgress}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-center items-start gap-4 sm:gap-6">
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
