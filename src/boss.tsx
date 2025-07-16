// File: src/components/BossBattle.tsx

import React, { useState, useEffect, useRef } from 'react';

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

// --- COMPONENT THANH MÁU ĐƯỢC THIẾT KẾ LẠI HOÀN TOÀN ---
const HealthBar = ({ 
  current, 
  max, 
  colorGradient, 
  direction = 'right' 
}: { 
  current: number, 
  max: number, 
  colorGradient: string, 
  direction?: 'left' | 'right' 
}) => {
  const percentage = Math.max(0, (current / max) * 100);
  const clipPathStyle = direction === 'right' 
    ? 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' 
    : 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)';

  return (
    <div className="w-full h-8 relative" style={{ clipPath: clipPathStyle }}>
      {/* Lớp nền tối */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Lớp máu hiện tại */}
      <div
        className={`h-full transition-all duration-500 ease-out relative overflow-hidden ${colorGradient}`}
        style={{ width: `${percentage}%` }}
      >
        {/* Hiệu ứng bóng sáng bên trong */}
        <div className="absolute top-0 left-0 h-1/2 w-full bg-white/20 blur-sm"></div>
      </div>

      {/* Lớp text hiển thị */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <p 
          className="text-white font-bold tracking-wider text-base"
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
        >
          {Math.ceil(current)} / {max}
        </p>
      </div>
    </div>
  );
};

// --- Component Số Sát Thương Bay Lên ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  return (
    <div
      key={id}
      className={`absolute top-1/2 font-bold text-3xl animate-float-up text-red-400 pointer-events-none ${isPlayerHit ? 'left-1/4' : 'right-1/4'}`}
      style={{ textShadow: '0 0 5px #000' }}
    >
      -{damage}
    </div>
  );
};

// --- Component Chính Của Game ---
export default function BossBattle() {
  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(BOSS_INITIAL_STATS);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [combatLog]);

  useEffect(() => {
    addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`, 0);
  }, []);

  useEffect(() => {
    if (battleState === 'fighting') {
      battleIntervalRef.current = setInterval(runBattleTurn, 1000);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, playerStats, bossStats, turnCounter]);

  const addLog = (message: string, turn: number) => {
    const logEntry = turn > 0 ? `[Lượt ${turn}] ${message}` : message;
    setCombatLog(prevLog => [logEntry, ...prevLog].slice(0, 50)); // Giới hạn log
  };
  
  const showFloatingDamage = (damage: number, isPlayerHit: boolean) => {
    const id = Date.now() + Math.random();
    setDamages(prev => [...prev, { id, damage, isPlayerHit }]);
    setTimeout(() => {
      setDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  const calculateDamage = (attackerAtk: number, defenderDef: number) => {
    const baseDamage = attackerAtk * (0.8 + Math.random() * 0.4);
    return Math.max(1, Math.floor(baseDamage - defenderDef));
  };
  
  const runBattleTurn = () => {
    const currentTurn = turnCounter + 1;
    setTurnCounter(currentTurn);

    // Lượt người chơi
    const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
    addLog(`Anh Hùng tấn công, gây ${playerDmg} sát thương.`, currentTurn);
    showFloatingDamage(playerDmg, false);
    setBossStats(prev => {
      const newHp = prev.hp - playerDmg;
      if (newHp <= 0) {
        endGame('win');
        return { ...prev, hp: 0 };
      }
      return { ...prev, hp: newHp };
    });
    
    // Dừng lại nếu game đã kết thúc
    if (bossStats.hp - playerDmg <= 0) return;

    // Lượt Boss
    setTimeout(() => {
      let bossDmg;
      if (currentTurn % 3 === 0) {
        bossDmg = calculateDamage(bossStats.atk * 1.5, playerStats.def);
        addLog(`${bossStats.name} tung [Hủy Diệt], gây ${bossDmg} sát thương!`, currentTurn);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      } else {
        bossDmg = calculateDamage(bossStats.atk, playerStats.def);
        addLog(`${bossStats.name} phản công, gây ${bossDmg} sát thương.`, currentTurn);
      }
      
      showFloatingDamage(bossDmg, true);
      setPlayerStats(prev => {
        const newHp = prev.hp - bossDmg;
        if (newHp <= 0) {
          endGame('lose');
          return { ...prev, hp: 0 };
        }
        return { ...prev, hp: newHp };
      });
    }, 500);
  };

  const endGame = (result: 'win' | 'lose') => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    setGameOver(result);
    if (result === 'win') {
      addLog(`${BOSS_INITIAL_STATS.name} đã bị đánh bại! BẠN ĐÃ CHIẾN THẮNG!`, turnCounter + 1);
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", turnCounter + 1);
    }
  };
  
  const startGame = () => {
    if (battleState === 'idle') setBattleState('fighting');
  };

  const resetGame = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPlayerStats(PLAYER_INITIAL_STATS);
    setBossStats(BOSS_INITIAL_STATS);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
    setTimeout(() => addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`, 0), 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&display=swap');
        
        body {
          background-color: #0F0A19;
          background-image: radial-gradient(circle, #1D162C 0%, #0F0A19 100%);
        }
        .font-russo { font-family: 'Russo One', sans-serif; }
        
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 2px); }
          20%, 40%, 60%, 80% { transform: translate(5px, -2px); }
        }
        .animate-screen-shake { animation: screen-shake 0.5s linear; }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(167, 139, 250, 0.3), 0 0 10px rgba(167, 139, 250, 0.2); }
          50% { box-shadow: 0 0 35px rgba(167, 139, 250, 0.5), 0 0 15px rgba(167, 139, 250, 0.4); }
        }
        .glow-container { animation: glow-pulse 4s infinite ease-in-out; }
      `}</style>
      
      <div className="text-white min-h-screen flex flex-col items-center justify-center p-4 font-russo">
        <div className={`w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-800/50 p-6 relative glow-container ${isShaking ? 'animate-screen-shake' : ''}`}>
          {damages.map(d => <FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} />)}

          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-8 text-purple-300 tracking-wider uppercase" style={{textShadow: '0 0 15px rgba(192, 132, 252, 0.5)'}}>
            Đấu Trường Tự Động
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Khung nhân vật */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg border-t-2 border-l-2 border-blue-400/50 shadow-lg">
              <h2 className="text-2xl font-bold mb-3 text-blue-300 text-center">ANH HÙNG</h2>
              <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-400 to-cyan-500" direction="right" />
              {showStats && (
                 <div className="mt-4 text-sm text-center bg-black/30 p-2 rounded-md w-full space-y-1">
                  <p>SỨC MẠNH: <span className="font-bold text-red-400">{playerStats.atk}</span></p>
                  <p>PHÒNG THỦ: <span className="font-bold text-sky-400">{playerStats.def}</span></p>
                </div>
              )}
            </div>

            {/* Khung Boss */}
            <div className="bg-gradient-to-bl from-gray-900 to-gray-800 p-4 rounded-lg border-t-2 border-r-2 border-red-400/50 shadow-lg">
              <h2 className="text-2xl font-bold mb-3 text-red-300 text-center">{bossStats.name.toUpperCase()}</h2>
              <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-500 to-orange-400" direction="left" />
              {showStats && (
                <div className="mt-4 text-sm text-center bg-black/30 p-2 rounded-md w-full space-y-1">
                  <p>SỨC MẠNH: <span className="font-bold text-red-400">{bossStats.atk}</span></p>
                  <p>PHÒNG THỦ: <span className="font-bold text-sky-400">{bossStats.def}</span></p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-col items-center gap-4">
            {battleState === 'idle' && (
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 rounded-md font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 transform hover:scale-105"
              >
                Bắt đầu
              </button>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-6 py-2 bg-transparent border-2 border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-500 text-purple-300 rounded-md font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            >
              {showStats ? 'Ẩn Chỉ Số' : 'Hiện Chỉ Số'}
            </button>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-center mb-3 text-gray-400 uppercase tracking-widest">Nhật Ký Chiến Đấu</h3>
            <div ref={logContainerRef} className="h-48 bg-black/40 p-3 rounded-lg border border-gray-700 overflow-y-auto flex flex-col-reverse text-sm font-sans leading-relaxed">
              {combatLog.map((entry, index) => (
                <p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
          
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <h2 className={`text-7xl font-extrabold mb-4 uppercase ${gameOver === 'win' ? 'text-yellow-400' : 'text-red-600'}`} style={{textShadow: `0 0 25px ${gameOver === 'win' ? 'rgba(250, 204, 21, 0.7)' : 'rgba(220, 38, 38, 0.7)'}`}}>
                {gameOver === 'win' ? "Chiến Thắng!" : "Thất Bại"}
              </h2>
              <p className="text-xl mb-8 font-sans">
                {gameOver === 'win' ? "Bóng tối đã bị đẩy lùi." : "Bóng tối đã nuốt chửng bạn."}
              </p>
              <button
                onClick={resetGame}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 rounded-lg font-bold text-2xl uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-105"
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
