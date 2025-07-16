import React, { useState } from 'react';

// Helper component cho các icon SVG
const icons = {
  coin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" strokeWidth="1">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" fontSize="14" fill="#8B4513" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#FF4F4F" stroke="#C00" strokeWidth="1">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  sword: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="1">
        <path d="M21.71 3.29a1 1 0 0 0-1.42 0l-4.58 4.58a3 3 0 0 0-4.24 4.24l-6 6a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a3 3 0 0 0 4.24-4.24l4.58-4.58a1 1 0 0 0 0-1.42zM7 17l-3 3l-1.5-1.5L4 17m3-3l4-4" />
        <path d="M5 19l-2 2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#6495ED" stroke="#4169E1" strokeWidth="1">
      <path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12c.52-.13 1.03-.3 1.5-.5A10.46 10.46 0 0 1 12 22C6.48 20.74 4 15.55 4 11V6.3l8-2.4l8 2.4V11c0 1.82-.5 3.53-1.36 5.04L12 2z" />
      <path d="M12 22c5.16-1.26 9-6.45 9-12V5l-9-3l-9 3v6c0 5.55 3.84 10.74 9 12z" />
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

// Component Card Nâng cấp
const StatCard = ({ stat, onUpgrade }) => {
  const { name, level, icon, baseValue, upgradeBonus } = stat;
  const totalValue = baseValue + level * upgradeBonus;
  const upgradeCost = calculateUpgradeCost(level);

  return (
    <div className="bg-[#FDF3D9] w-28 sm:w-36 md:w-48 rounded-2xl border-4 border-[#7a4a2a] shadow-lg text-center font-bold text-[#5c381e] transform transition-transform hover:scale-105">
      <div className="bg-[#E6A356] py-1 px-4 rounded-t-lg -m-1 mb-2 border-b-4 border-[#7a4a2a]">
        <p className="text-white text-shadow-sm">Lv.{level}</p>
      </div>
      <div className="p-3 flex flex-col items-center gap-2">
        <div className="w-12 h-12">{icon}</div>
        <p className="text-xl">+{totalValue.toLocaleString()}</p>
        <p className="text-lg uppercase">{name}</p>
        <button
          onClick={() => onUpgrade(stat.id)}
          className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-yellow-900 border-2 border-yellow-700 rounded-lg py-2 px-4 flex items-center justify-center gap-2 shadow-md active:shadow-inner active:translate-y-px"
        >
          <div className="w-5 h-5">{icons.coin}</div>
          <span>{upgradeCost.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

// Component chính của ứng dụng
export default function App() {
  const [gold, setGold] = useState(190600);
  const [stats, setStats] = useState([
    { id: 'hp', name: 'HP', level: 0, icon: icons.heart, baseValue: 0, upgradeBonus: 50 },
    { id: 'atk', name: 'ATK', level: 0, icon: icons.sword, baseValue: 0, upgradeBonus: 15 },
    { id: 'def', name: 'DEF', level: 0, icon: icons.shield, baseValue: 0, upgradeBonus: 5 },
  ]);
  const [message, setMessage] = useState('');

  const handleUpgrade = (statId) => {
    const statIndex = stats.findIndex(s => s.id === statId);
    const statToUpgrade = stats[statIndex];
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

  // --- LOGIC MỚI CHO THANH TIẾN TRÌNH ---
  // Tính tổng số level đã nâng cấp
  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  // Mỗi thanh tiến trình chứa 50 điểm (level)
  const maxProgress = 50;
  // Cấp độ "Uy tín", cho biết đã hoàn thành bao nhiêu thanh 50 điểm
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  // Điểm tiến trình hiện tại trên thanh (0-49)
  const currentProgress = totalLevels % maxProgress;
  // Tỷ lệ phần trăm để vẽ thanh tiến trình
  const progressPercent = (currentProgress / maxProgress) * 100;


  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
          .font-lilita { font-family: 'Lilita One', cursive; }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.4); }
          .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        `}
      </style>

      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">
          {message}
        </div>
      )}

      <div className="w-full min-h-screen bg-gradient-to-b from-[#4a1a8a] via-[#3a136c] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          
          <header className="w-full flex justify-end mb-4">
              <div className="bg-black/30 rounded-full py-1 px-4 flex items-center gap-2 border-2 border-yellow-600">
                  <div className="w-6 h-6">{icons.coin}</div>
                  <span className="text-xl text-yellow-300 text-shadow-sm">{gold.toLocaleString()}</span>
              </div>
          </header>

          <h1 className="text-5xl text-center text-shadow my-4">Warrior - 1-10</h1>

          <div className="my-6 flex justify-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]">
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

          {/* --- THANH TIẾN TRÌNH ĐƯỢC THIẾT KẾ LẠI --- */}
          <div className="w-full px-2 mt-4 mb-8">
            <div className="text-center mb-2 text-xl text-yellow-300 text-shadow-sm tracking-wider">
              Prestige Lvl. {prestigeLevel}
            </div>
            <div className="relative w-full h-8 bg-black/40 rounded-full border-2 border-purple-400/50 shadow-inner">
              {/* Lớp nền của thanh tiến trình */}
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
              {/* Lớp văn bản hiển thị đè lên trên */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm text-white text-shadow-sm">
                  {currentProgress} / {maxProgress}
                </span>
              </div>
            </div>
          </div>


          <div className="flex flex-row justify-center items-start gap-4">
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
