import React, { useState, useEffect, useRef } from 'react';

// --- Cấu hình nhân vật và Boss ---
const PLAYER_INITIAL_STATS = {
  maxHp: 100,
  hp: 100,
  atk: 15,
  def: 5,
  maxHeals: 3,
  healsLeft: 3,
};

const BOSS_INITIAL_STATS = {
  maxHp: 300,
  hp: 300,
  atk: 20,
  def: 8,
  name: "Quái Vương Hắc Ám",
};

// --- Component Thanh Máu ---
const HealthBar = ({ current, max, colorClass, label }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <p className="text-white text-sm font-semibold mb-1">{label}: {current} / {max}</p>
      <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
        <div
          className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Component Chính Của Game ---
export default function App() {
  // --- State của game ---
  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(BOSS_INITIAL_STATS);
  const [combatLog, setCombatLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isDefending, setIsDefending] = useState(false);
  const [bossTurnCounter, setBossTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState(null); // null, 'win', 'lose'

  const logContainerRef = useRef(null);

  // --- Tự động cuộn nhật ký chiến đấu ---
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [combatLog]);
  
  // --- Khởi tạo game ---
  useEffect(() => {
    addLog(`Một ${bossStats.name} khổng lồ xuất hiện chặn đường!`);
  }, []);

  // --- Hàm thêm tin nhắn vào nhật ký ---
  const addLog = (message) => {
    setCombatLog(prevLog => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prevLog]);
  };

  // --- Hàm tính sát thương ---
  const calculateDamage = (attackerAtk, defenderDef) => {
    const baseDamage = attackerAtk * (0.8 + Math.random() * 0.4); // Sát thương dao động từ 80% - 120%
    const finalDamage = Math.max(1, Math.floor(baseDamage - defenderDef));
    return finalDamage;
  };

  // --- Xử lý lượt của Boss ---
  const handleBossTurn = (playerCurrentDef) => {
    setTimeout(() => {
      let message = "";
      let playerDamageTaken = 0;

      // Cứ 3 lượt, Boss sẽ dùng chiêu đặc biệt
      if ((bossTurnCounter + 1) % 3 === 0) {
        addLog(`${bossStats.name} gồng năng lượng, chuẩn bị tung chiêu đặc biệt!`);
        const specialDamage = calculateDamage(bossStats.atk * 1.5, playerCurrentDef);
        playerDamageTaken = specialDamage;
        message = `${bossStats.name} tung [Hủy Diệt], nghiền nát bạn và gây ${specialDamage} sát thương!`;
      } else {
        playerDamageTaken = calculateDamage(bossStats.atk, playerCurrentDef);
        message = `${bossStats.name} vung móng vuốt, gây ${playerDamageTaken} sát thương.`;
      }

      const newPlayerHp = playerStats.hp - playerDamageTaken;
      
      setTimeout(() => {
        addLog(message);
        if (isDefending) {
          addLog("Tư thế phòng thủ của bạn đã kết thúc.");
        }
        setPlayerStats(prev => ({ ...prev, hp: newPlayerHp }));
        setIsDefending(false); // Reset phòng thủ sau khi bị tấn công

        if (newPlayerHp <= 0) {
          setGameOver('lose');
          addLog("Bạn đã gục ngã...");
        } else {
          setIsPlayerTurn(true);
          addLog("Đến lượt của bạn!");
        }
      }, 1000);
      
      setBossTurnCounter(c => c + 1);

    }, 1500); // Boss "suy nghĩ" 1.5 giây
  };

  // --- Hành động của người chơi ---
  const playerAttack = () => {
    if (!isPlayerTurn || gameOver) return;
    setIsPlayerTurn(false);

    const damage = calculateDamage(playerStats.atk, bossStats.def);
    const newBossHp = bossStats.hp - damage;

    addLog(`Bạn vung kiếm, gây ${damage} sát thương cho ${bossStats.name}.`);
    setBossStats(prev => ({ ...prev, hp: newBossHp }));

    if (newBossHp <= 0) {
      setGameOver('win');
      addLog(`${bossStats.name} gầm lên một tiếng cuối cùng rồi đổ sụp. Bạn đã chiến thắng!`);
    } else {
      handleBossTurn(playerStats.def);
    }
  };

  const playerDefend = () => {
    if (!isPlayerTurn || gameOver) return;
    setIsPlayerTurn(false);
    setIsDefending(true);

    addLog("Bạn vào tư thế phòng thủ, tăng cường khả năng chống chịu cho lượt tấn công tiếp theo.");
    
    // Khi phòng thủ, DEF sẽ được tăng gấp đôi cho lượt tấn công tiếp theo của boss
    const boostedDef = playerStats.def * 2;
    handleBossTurn(boostedDef);
  };

  const playerHeal = () => {
    if (!isPlayerTurn || gameOver || playerStats.healsLeft <= 0) return;
    setIsPlayerTurn(false);

    const healAmount = Math.floor(playerStats.maxHp * 0.4); // Hồi 40% máu tối đa
    const newPlayerHp = Math.min(playerStats.maxHp, playerStats.hp + healAmount);

    addLog(`Bạn sử dụng [Bình Máu]. Một luồng sinh lực ấm áp lan tỏa, hồi ${newPlayerHp - playerStats.hp} HP.`);
    setPlayerStats(prev => ({
      ...prev,
      hp: newPlayerHp,
      healsLeft: prev.healsLeft - 1,
    }));

    handleBossTurn(playerStats.def);
  };
  
  const resetGame = () => {
    setPlayerStats(PLAYER_INITIAL_STATS);
    setBossStats(BOSS_INITIAL_STATS);
    setCombatLog([]);
    setIsPlayerTurn(true);
    setIsDefending(false);
    setBossTurnCounter(0);
    setGameOver(null);
    setTimeout(() => addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện chặn đường!`), 100);
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl mx-auto bg-black bg-opacity-40 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-800 p-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-purple-400 tracking-wider">TRẬN CHIẾN ĐỊNH MỆNH</h1>

        {/* --- Khu vực hiển thị nhân vật --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Panel Người Chơi */}
          <div className="bg-gray-800 p-4 rounded-lg border border-blue-500">
            <h2 className="text-xl font-bold mb-3 text-blue-300">ANH HÙNG</h2>
            <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorClass="bg-green-500" label="HP" />
            <div className="mt-3 text-sm">
              <p>ATK: <span className="font-bold text-red-400">{playerStats.atk}</span></p>
              <p>DEF: <span className="font-bold text-blue-400">{isDefending ? `${playerStats.def} (x2)` : playerStats.def}</span></p>
            </div>
          </div>

          {/* Panel Boss */}
          <div className="bg-gray-800 p-4 rounded-lg border border-red-500">
            <h2 className="text-xl font-bold mb-3 text-red-300">{bossStats.name.toUpperCase()}</h2>
            <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorClass="bg-red-500" label="HP" />
             <div className="mt-3 text-sm">
              <p>ATK: <span className="font-bold text-red-400">{bossStats.atk}</span></p>
              <p>DEF: <span className="font-bold text-blue-400">{bossStats.def}</span></p>
            </div>
          </div>
        </div>

        {/* --- Khu vực hành động --- */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">HÀNH ĐỘNG</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={playerAttack}
              disabled={!isPlayerTurn || gameOver}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-bold transition-all duration-200 shadow-lg"
            >
              Tấn Công
            </button>
            <button
              onClick={playerDefend}
              disabled={!isPlayerTurn || gameOver}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-bold transition-all duration-200 shadow-lg"
            >
              Phòng Thủ
            </button>
            <button
              onClick={playerHeal}
              disabled={!isPlayerTurn || gameOver || playerStats.healsLeft <= 0}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-bold transition-all duration-200 shadow-lg"
            >
              Hồi Máu ({playerStats.healsLeft}/{playerStats.maxHeals})
            </button>
          </div>
        </div>

        {/* --- Nhật ký chiến đấu --- */}
        <div>
          <h3 className="text-lg font-semibold text-center mb-3 text-gray-400">NHẬT KÝ CHIẾN ĐẤU</h3>
          <div ref={logContainerRef} className="h-48 bg-gray-900 bg-opacity-70 p-3 rounded-lg border border-gray-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed">
            {combatLog.map((entry, index) => (
              <p key={index} className={`mb-1 ${index === 0 ? 'text-yellow-300 animate-pulse' : 'text-gray-300'}`}>
                {entry}
              </p>
            ))}
          </div>
        </div>
        
        {/* --- Màn hình kết thúc game --- */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-10">
            <h2 className={`text-6xl font-extrabold mb-4 ${gameOver === 'win' ? 'text-yellow-400' : 'text-red-600'}`}>
              {gameOver === 'win' ? "CHIẾN THẮNG!" : "THẤT BẠI"}
            </h2>
            <p className="text-xl mb-8">
              {gameOver === 'win' ? "Bóng tối đã bị đẩy lùi." : "Bóng tối đã nuốt chửng bạn."}
            </p>
            <button
              onClick={resetGame}
              className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-2xl transition-all duration-200 shadow-2xl"
            >
              Chơi Lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
