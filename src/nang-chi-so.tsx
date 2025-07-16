import React, { useState } from 'react';

// --- ICONS ĐƯỢC CẬP NHẬT ---
// Sử dụng "currentColor" để dễ dàng thay đổi màu sắc bằng Tailwind's text-color classes
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"></circle>
      <path d="M12 18V6"></path>
      <path d="M16 14c-2 0-3-1-3-3s1-3 3-3"></path>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42z" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  )
};

// Hàm tính toán chi phí nâng cấp dựa trên level hiện tại
const calculateUpgradeCost = (level) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  const cost = baseCost * Math.pow(2, tier);
  return cost;
};

// --- COMPONENT STAT CARD VỚI HIỆU ỨNG VIỀN CHUYỂN ĐỘNG KHI HOVER ---
const StatCard = ({ stat, onUpgrade }) => {
  const { id, name, level, icon, baseValue, upgradeBonus, color } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    // Div cha này sẽ tạo ra viền gradient. Nó có padding nhỏ và nền gradient.
    // Animation viền sẽ được kích hoạt khi hover lên group này.
    <div className={`relative group rounded-xl bg-gradient-to-r ${color} p-px 
                    transition-all duration-300 
                    hover:shadow-lg hover:shadow-cyan-500/10`}>
        {/* Lớp nền cho animation viền */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow"></div>
        
        {/* Div con này là nội dung của card. Nó có màu nền riêng để che đi gradient. */}
        <div className="relative bg-slate-900/95 rounded-[11px] p-4 h-full flex flex-col items-center justify-between gap-3 text-center text-white w-28 sm:w-32 md:w-36">
            <div className={`w-10 h-10 ${id === 'hp' ? 'text-red-500' : 'text-cyan-400'}`}>{icon}</div>
            <div className="flex-grow flex flex-col items-center gap-1">
            <p className="text-lg uppercase font-bold tracking-wider">{name}</p>
            <p className="text-2xl font-black text-shadow-cyan">+{totalValue.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Level {level}</p>
            </div>
            <button
            onClick={() => onUpgrade(stat.id)}
            className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-lg py-2 px-2 flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-95"
            >
            <div className="w-5 h-5 text-yellow-400">{icons.coin}</div>
            <span className="font-bold text-yellow-300">{upgradeCost.toLocaleString()}</span>
            </button>
        </div>
    </div>
  );
};


// --- COMPONENT CHÍNH CỦA ỨNG DỤNG ---
export default function App() {
  const [gold, setGold] = useState(190600);
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 0, icon: icons.heart, baseValue: 0, upgradeBonus: 50, color: "from-red-600 to-pink-600" },
    { id: 'atk', name: 'ATK', level: 0, icon: icons.sword, baseValue: 0, upgradeBonus: 15, color: "from-sky-500 to-cyan-500" },
    { id: 'def', name: 'DEF', level: 0, icon: icons.shield, baseValue: 0, upgradeBonus: 5, color: "from-blue-500 to-indigo-500" },
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
          .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
          .text-shadow-cyan { text-shadow: 0 0 8px rgba(0, 246, 255, 0.7); }
          
          /* --- HIỆU ỨNG VIỀN GRADIENT CHUYỂN ĐỘNG --- */
          @keyframes animate-gradient-border {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animate-border-flow {
            background-size: 400% 400%;
            animation: animate-gradient-border 3s linear infinite;
          }

          /* Hiệu ứng thở cho hero */
          .animate-breathing {
            animation: breathing 5s ease-in-out infinite;
          }
          @keyframes breathing {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 246, 255, 0.4)); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(0, 246, 255, 0.7));}
          }

          /* Vignette & Glow Background */
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
             background-image: radial-gradient(ellipse at top, rgba(100, 108, 255, 0.15) 0%, transparent 50%);
          }
        `}
      </style>

      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600/90 border border-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">
          {message}
        </div>
      )}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
        <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
          
          <header className="w-full flex justify-end mb-4">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg py-2 px-4 flex items-center gap-2 shadow-lg">
                  <div className="w-6 h-6 text-yellow-400">{icons.coin}</div>
                  <span className="text-xl text-yellow-300 text-shadow-sm">{gold.toLocaleString()}</span>
              </div>
          </header>

          <h1 className="text-4xl sm:text-5xl text-center text-shadow my-2">NÂNG CẤP CHỈ SỐ</h1>

          {/* --- HERO GRAPHIC --- */}
          <div className="my-4 w-48 h-48 flex items-center justify-center animate-breathing">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                  <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1e40af', stopOpacity: 1}} />
                  </linearGradient>
                  <filter id="glow">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur"></feGaussianBlur>
                      <feMerge>
                          <feMergeNode in="coloredBlur"></feMergeNode>
                          <feMergeNode in="SourceGraphic"></feMergeNode>
                      </feMerge>
                  </filter>
              </defs>
              <g transform="translate(0, 10)">
                  <path d="M 100,20 L 150,70 L 140,150 L 60,150 L 50,70 Z" fill="url(#helmetGrad)" stroke="#60a5fa" strokeWidth="3" />
                  <path d="M 100,50 L 130,75 L 100,85 L 70,75 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" filter="url(#glow)" />
                  <path d="M 60,150 Q 100,170 140,150" fill="none" stroke="#60a5fa" strokeWidth="3" />
                  <rect x="95" y="20" width="10" height="30" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5"/>
              </g>
            </svg>
          </div>

          {/* --- THANH TIẾN TRÌNH (ĐÃ ĐƯỢC THIẾT KẾ LẠI) --- */}
          <div className="w-full px-2 mt-2 mb-8">
            {/* Cấp độ tổng */}
            <div className="flex justify-end items-baseline mb-2 px-1">
              <span className="text-sm font-semibold text-slate-400">Lv. {totalLevels}</span>
            </div>

            {/* Thanh tiến trình được thiết kế lại */}
            <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
                {/* Lớp nền lấp đầy */}
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_12px_rgba(0,246,255,0.6)] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                >
                </div>

                {/* Lớp văn bản */}
                <div className="absolute inset-0 flex justify-between items-center px-4 text-sm text-white text-shadow-sm font-bold">
                    <span>Stage {prestigeLevel + 1}</span>
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
    </>
  );
}
