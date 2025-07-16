import React, 'react';
import { useState, useEffect, useRef } from 'react';

// --- Cấu hình nhân vật và Boss ---
const PLAYER_INITIAL_STATS = {
  maxHp: 100,
  hp: 100,
  atk: 15,
  def: 5,
};

const BOSS_INITIAL_STATS = {
  maxHp: 300,
  hp: 300,
  atk: 20,
  def: 8,
  name: "Quái Vương Hắc Ám",
};

// --- Component Thanh Máu (Giữ nguyên) ---
const HealthBar = ({ current, max, colorClass, label }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <p className="text-white text-sm font-semibold mb-1">{label}: {Math.ceil(current)} / {max}</p>
      <div className="w-full bg-gray-700 rounded-full h-5 shadow-inner overflow-hidden">
        <div
          className={`${colorClass} h-5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Component Số Sát Thương Bay Lên ---
const FloatingDamage = ({ damage, id, isPlayerHit }) => {
  // isPlayerHit = true -> Sát thương bay lên ở panel người chơi
  return (
    <div
      key={id}
      className={`absolute top-1/2 font-bold text-2xl animate-float-up text-red-500 pointer-events-none ${isPlayerHit ? 'left-1/4' : 'right-1/4'}`}
    >
      -{damage}
    </div>
  );
};

// --- Component Chính Của Game ---
export default function App() {
  // --- State của game ---
  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(BOSS_INITIAL_STATS);
  const [combatLog, setCombatLog] = useState([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState(null); // null, 'win', 'lose'
  const [battleState, setBattleState] = useState('idle'); // 'idle', 'fighting', 'finished'
  const [showStats, setShowStats] = useState(false);
  const [damages, setDamages] = useState([]); // Lưu trữ các số sát thương nổi
  const [isShaking, setIsShaking] = useState(false); // Hiệu ứng rung màn hình

  const logContainerRef = useRef(null);
  const battleIntervalRef = useRef(null);

  // --- Tự động cuộn nhật ký chiến đấu ---
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [combatLog]);

  // --- Khởi tạo game ---
  useEffect(() => {
    addLog(`Một ${bossStats.name} khổng lồ xuất hiện. Hãy chuẩn bị!`);
  }, []);

  // --- Vòng lặp chiến đấu tự động ---
  useEffect(() => {
    if (battleState === 'fighting') {
      battleIntervalRef.current = setInterval(runBattleTurn, 800); // Mỗi 0.8 giây một lượt
    }
    // Dọn dẹp interval khi component unmount hoặc trận đấu kết thúc
    return () => clearInterval(battleIntervalRef.current);
  }, [battleState]);

  // --- Hàm thêm tin nhắn vào nhật ký ---
  const addLog = (message) => {
    setCombatLog(prevLog => [`[Lượt ${turnCounter + 1}] ${message}`, ...prevLog]);
  };
  
  // --- Hàm thêm hiệu ứng số sát thương ---
  const showFloatingDamage = (damage, isPlayerHit) => {
    const id = Date.now() + Math.random();
    setDamages(prev => [...prev, { id, damage, isPlayerHit }]);
    // Tự động xóa số sau 1.5 giây
    setTimeout(() => {
      setDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  // --- Hàm tính sát thương ---
  const calculateDamage = (attackerAtk, defenderDef) => {
    const baseDamage = attackerAtk * (0.8 + Math.random() * 0.4); // Sát thương dao động từ 80% - 120%
    const finalDamage = Math.max(1, Math.floor(baseDamage - defenderDef));
    return finalDamage;
  };
  
  // --- Xử lý một lượt trong trận đấu ---
  const runBattleTurn = () => {
    setTurnCounter(prev => prev + 1);
    
    // Sử dụng functional update để đảm bảo luôn lấy state mới nhất trong interval
    setPlayerStats(currentPlayerStats => {
      setBossStats(currentBossStats => {
        // --- Lượt người chơi ---
        const playerDmg = calculateDamage(currentPlayerStats.atk, currentBossStats.def);
        const newBossHp = currentBossStats.hp - playerDmg;
        addLog(`Anh Hùng tấn công, gây ${playerDmg} sát thương.`);
        showFloatingDamage(playerDmg, false);

        if (newBossHp <= 0) {
          endGame('win');
          setBossStats({ ...currentBossStats, hp: 0 });
          return currentPlayerStats; // Dừng xử lý
        }
        
        let newPlayerHp = currentPlayerStats.hp;
        
        // --- Lượt Boss ---
        setTimeout(() => {
          let bossDmg;
          // Cứ 3 lượt, Boss sẽ dùng chiêu đặc biệt
          if ((turnCounter + 1) % 3 === 0) {
            bossDmg = calculateDamage(currentBossStats.atk * 1.5, currentPlayerStats.def);
            addLog(`${currentBossStats.name} tung [Hủy Diệt], gây ${bossDmg} sát thương!`);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500); // Tắt rung sau 0.5s
          } else {
            bossDmg = calculateDamage(currentBossStats.atk, currentPlayerStats.def);
            addLog(`${currentBossStats.name} phản công, gây ${bossDmg} sát thương.`);
          }
          
          showFloatingDamage(bossDmg, true);
          newPlayerHp = currentPlayerStats.hp - bossDmg;

          if (newPlayerHp <= 0) {
            endGame('lose');
            setPlayerStats({ ...currentPlayerStats, hp: 0 });
          } else {
            // Cập nhật máu của cả hai sau lượt của boss
            setPlayerStats({ ...currentPlayerStats, hp: newPlayerHp });
          }
        }, 400); // Boss ra đòn sau người chơi một chút

        return { ...currentBossStats, hp: newBossHp };
      });
      return currentPlayerStats; // Trả về state hiện tại, sẽ được cập nhật sau lượt của boss
    });
  };

  const endGame = (result) => {
    clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    setGameOver(result);
    if (result === 'win') {
      addLog(`${BOSS_INITIAL_STATS.name} đã bị đánh bại! BẠN ĐÃ CHIẾN THẮNG!`);
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!");
    }
  };
  
  const startGame = () => {
    if (battleState === 'idle') {
      setBattleState('fighting');
    }
  };

  const resetGame = () => {
    clearInterval(battleIntervalRef.current);
    setPlayerStats(PLAYER_INITIAL_STATS);
    setBossStats(BOSS_INITIAL_STATS);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setTimeout(() => addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`), 100);
  };

  return (
    <>
      {/* Thêm keyframes cho animation */}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        
        @keyframes screen-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-screen-shake { animation: screen-shake 0.5s linear; }
      `}</style>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-mono">
        <div className={`w-full max-w-4xl mx-auto bg-black bg-opacity-40 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-800 p-6 relative ${isShaking ? 'animate-screen-shake' : ''}`}>
          {/* Nơi hiển thị số sát thương */}
          {damages.map(d => (
            <FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} />
          ))}

          <h1 className="text-3xl font-bold text-center mb-6 text-purple-400 tracking-wider">ĐẤU TRƯỜNG TỰ ĐỘNG</h1>

          {/* --- Khu vực hiển thị nhân vật (Trái vs Phải) --- */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Panel Người Chơi (Trái) */}
            <div className="bg-gray-800 p-4 rounded-lg border border-blue-500 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-3 text-blue-300">ANH HÙNG</h2>
              <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorClass="bg-green-500" label="HP" />
              {showStats && (
                 <div className="mt-3 text-sm text-center bg-gray-900 p-2 rounded-md w-full">
                  <p>ATK: <span className="font-bold text-red-400">{playerStats.atk}</span></p>
                  <p>DEF: <span className="font-bold text-blue-400">{playerStats.def}</span></p>
                </div>
              )}
            </div>

            {/* Panel Boss (Phải) */}
            <div className="bg-gray-800 p-4 rounded-lg border border-red-500 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-3 text-red-300">{bossStats.name.toUpperCase()}</h2>
              <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorClass="bg-red-500" label="HP" />
              {showStats && (
                <div className="mt-3 text-sm text-center bg-gray-900 p-2 rounded-md w-full">
                  <p>ATK: <span className="font-bold text-red-400">{bossStats.atk}</span></p>
                  <p>DEF: <span className="font-bold text-blue-400">{bossStats.def}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* --- Khu vực điều khiển trung tâm --- */}
          <div className="mb-6 flex flex-col items-center gap-4">
            {battleState === 'idle' && (
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-md font-bold text-lg transition-all duration-200 shadow-lg"
              >
                Bắt đầu Tự Động
              </button>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold text-sm transition-all duration-200"
            >
              {showStats ? 'Ẩn Chỉ Số' : 'Hiện Chỉ Số'}
            </button>
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
    </>
  );
}
