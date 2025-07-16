// File: src/components/BossBattle.tsx (Nâng cấp)

import React, { useState, useEffect, useRef } from 'react';

// --- Cấu hình nhân vật và Boss ---
const PLAYER_INITIAL_STATS = {
  maxHp: 100,
  hp: 100,
  atk: 15,
  def: 5,
  name: "Anh Hùng Dũng Cảm",
  avatar: "🤺", // Emoji đại diện
};

const BOSS_INITIAL_STATS = {
  maxHp: 300,
  hp: 300,
  atk: 20,
  def: 8,
  name: "Quái Vương Hắc Ám",
  avatar: "👹", // Emoji đại diện
};

// --- Định nghĩa kiểu cho nhật ký ---
type LogType = 'system' | 'player_attack' | 'boss_attack' | 'boss_special' | 'win' | 'lose';
interface CombatLogEntry {
  id: number;
  message: string;
  type: LogType;
}

// --- Component Thanh Máu (Nâng cấp) ---
const HealthBar = ({ current, max, colorClass }: { current: number, max: number, colorClass: string }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full bg-gray-700 rounded-full h-6 shadow-inner overflow-hidden relative border-2 border-gray-600">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-md">
        {Math.ceil(current)} / {max}
      </span>
    </div>
  );
};

// --- Component Số Sát Thương Bay Lên ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  return (
    <div
      key={id}
      className={`absolute top-1/4 font-bold text-3xl animate-float-up text-red-500 pointer-events-none drop-shadow-lg ${isPlayerHit ? 'left-[25%]' : 'right-[25%]'}`}
    >
      -{damage}
    </div>
  );
};

// --- Component Hiển thị nhân vật ---
const CharacterDisplay = ({ name, avatar, hp, maxHp, barColor, isHit, isActiveTurn }: { name: string, avatar: string, hp: number, maxHp: number, barColor: string, isHit: boolean, isActiveTurn: boolean }) => {
  return (
    <div className={`flex flex-col items-center gap-4 p-4 transition-all duration-300 ${isActiveTurn ? 'scale-105' : ''}`}>
       <div className={`relative transition-transform duration-100 ${isHit ? 'animate-hit' : ''}`}>
         <span className="text-8xl">{avatar}</span>
         {isActiveTurn && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-[12px] border-l-transparent border-r-transparent border-b-yellow-400 animate-pulse"></div>}
       </div>
       <h2 className="text-2xl font-bold text-white">{name}</h2>
       <div className="w-full max-w-xs">
         <HealthBar current={hp} max={maxHp} colorClass={barColor} />
       </div>
    </div>
  );
}

// --- Component Chính Của Game (Đại tu) ---
export default function BossBattle() {
  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(BOSS_INITIAL_STATS);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);
  
  // States cho hiệu ứng
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [playerIsHit, setPlayerIsHit] = useState(false);
  const [bossIsHit, setBossIsHit] = useState(false);
  const [activeTurn, setActiveTurn] = useState<'player' | 'boss' | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);
  
  useEffect(() => {
    addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`, 'system');
  }, []);

  useEffect(() => {
    if (battleState === 'fighting' && !gameOver) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1500); // Tăng thời gian để xem hiệu ứng rõ hơn
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, playerStats, bossStats, gameOver]); // Phụ thuộc vào gameOver để dừng interval

  const addLog = (message: string, type: LogType) => {
    const logEntry = { id: Date.now() + Math.random(), message, type };
    setCombatLog(prevLog => [...prevLog, logEntry]);
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
    setTurnCounter(prev => prev + 1);
    const currentTurn = turnCounter + 1;

    // --- Lượt người chơi ---
    setActiveTurn('player');
    setTimeout(() => {
      const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
      const newBossHp = bossStats.hp - playerDmg;
      addLog(`[Lượt ${currentTurn}] ${playerStats.name} tấn công, gây ${playerDmg} sát thương.`, 'player_attack');
      showFloatingDamage(playerDmg, false);
      setBossIsHit(true);
      setTimeout(() => setBossIsHit(false), 300);

      if (newBossHp <= 0) {
        setBossStats(prev => ({ ...prev, hp: 0 }));
        endGame('win');
        return;
      }
      setBossStats(prev => ({ ...prev, hp: newBossHp }));

      // --- Lượt Boss (sau 750ms) ---
      setTimeout(() => {
        if (gameOver) return; // Kiểm tra lại nếu game đã kết thúc
        setActiveTurn('boss');

        setTimeout(() => {
            let bossDmg;
            let logType: LogType = 'boss_attack';

            if (currentTurn > 0 && currentTurn % 3 === 0) {
              bossDmg = calculateDamage(bossStats.atk * 1.5, playerStats.def);
              addLog(`[Lượt ${currentTurn}] ${bossStats.name} tung [Hủy Diệt], gây ${bossDmg} sát thương!`, 'boss_special');
              logType = 'boss_special';
              setIsScreenShaking(true);
              setTimeout(() => setIsScreenShaking(false), 500);
            } else {
              bossDmg = calculateDamage(bossStats.atk, playerStats.def);
              addLog(`[Lượt ${currentTurn}] ${bossStats.name} phản công, gây ${bossDmg} sát thương.`, 'boss_attack');
            }
            
            showFloatingDamage(bossDmg, true);
            setPlayerIsHit(true);
            setTimeout(() => setPlayerIsHit(false), 300);
            const newPlayerHp = playerStats.hp - bossDmg;

            if (newPlayerHp <= 0) {
              setPlayerStats(prev => ({ ...prev, hp: 0 }));
              endGame('lose');
            } else {
              setPlayerStats(prev => ({ ...prev, hp: newPlayerHp }));
            }
            setActiveTurn(null);
        }, 300); // Delay nhỏ để thấy rõ lượt boss
      }, 750);
    }, 300); // Delay nhỏ để thấy rõ lượt player
  };
  
  const endGame = (result: 'win' | 'lose') => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    setActiveTurn(null);
    setTimeout(() => { // Delay hiển thị màn hình game over
      setGameOver(result);
      if (result === 'win') {
        addLog(`${bossStats.name} đã bị đánh bại! BẠN ĐÃ CHIẾN THẮNG!`, 'win');
      } else {
        addLog("Bạn đã gục ngã... THẤT BẠI!", 'lose');
      }
    }, 800);
  };
  
  const startGame = () => {
    if (battleState === 'idle') {
      setCombatLog([]);
      addLog(`Trận đấu bắt đầu!`, 'system');
      setBattleState('fighting');
    }
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
    setTimeout(() => addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`, 'system'), 100);
  };

  const getLogColor = (type: LogType) => {
    switch (type) {
      case 'system': return 'text-purple-300';
      case 'player_attack': return 'text-blue-300';
      case 'boss_attack': return 'text-red-300';
      case 'boss_special': return 'text-red-400 font-bold animate-pulse';
      case 'win': return 'text-green-400 font-bold';
      case 'lose': return 'text-gray-400 font-bold';
      default: return 'text-gray-300';
    }
  };
  
  return (
    <>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 4px) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translate(8px, -4px) rotate(1deg); }
        }
        .animate-screen-shake { animation: screen-shake 0.5s linear; }
        
        @keyframes hit-effect {
            0% { transform: translateX(0) scale(1); filter: brightness(1); }
            30% { transform: translateX(-10px) scale(1.05); filter: brightness(1.5); }
            60% { transform: translateX(10px) scale(1.05); filter: brightness(1.5); }
            100% { transform: translateX(0) scale(1); filter: brightness(1); }
        }
        .animate-hit { animation: hit-effect 0.3s ease-out; }

        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-mono bg-[url('/path/to/your/background.svg')] bg-cover bg-center">
        <div className={`w-full max-w-5xl mx-auto bg-black bg-opacity-60 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-800 p-6 relative backdrop-blur-sm ${isScreenShaking ? 'animate-screen-shake' : ''}`}>
          
          {damages.map(d => <FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} id={d.id} />)}

          <h1 className="text-4xl font-bold text-center mb-4 text-purple-400 tracking-wider [text-shadow:0_0_10px_#9333ea]">ĐẤU TRƯỜNG HUYỀN THOẠI</h1>

          {/* Sân khấu đối đầu */}
          <div className="flex justify-around items-start mb-4">
              <CharacterDisplay 
                name={playerStats.name}
                avatar={playerStats.avatar}
                hp={playerStats.hp}
                maxHp={playerStats.maxHp}
                barColor="bg-gradient-to-r from-green-400 to-green-600"
                isHit={playerIsHit}
                isActiveTurn={activeTurn === 'player'}
              />
              <div className="self-center text-5xl font-black text-gray-500">VS</div>
              <CharacterDisplay 
                name={bossStats.name}
                avatar={bossStats.avatar}
                hp={bossStats.hp}
                maxHp={bossStats.maxHp}
                barColor="bg-gradient-to-r from-red-500 to-red-700"
                isHit={bossIsHit}
                isActiveTurn={activeTurn === 'boss'}
              />
          </div>
          
          {/* Khu vực điều khiển và nhật ký */}
          <div className="flex flex-col items-center gap-4">
             {battleState === 'idle' && (
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-md font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 border-2 border-red-400"
              >
                BẮT ĐẦU CHIẾN ĐẤU
              </button>
            )}

            <div className="w-full max-w-2xl">
              <h3 className="text-lg font-semibold text-center mb-2 text-gray-400">NHẬT KÝ CHIẾN ĐẤU</h3>
              <div ref={logContainerRef} className="h-48 bg-gray-900 bg-opacity-70 p-3 rounded-lg border border-gray-700 overflow-y-auto text-sm leading-relaxed scroll-smooth">
                {combatLog.map((entry) => (
                  <p key={entry.id} className={`mb-1 transition-all duration-300 ${getLogColor(entry.type)}`}>
                    {entry.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-fade-in">
              <h2 className={`text-7xl font-extrabold mb-4 ${gameOver === 'win' ? 'text-yellow-400' : 'text-red-600'} [text-shadow:0_0_20px_var(--tw-shadow-color)]`}>
                {gameOver === 'win' ? "CHIẾN THẮNG!" : "THẤT BẠI"}
              </h2>
              <p className="text-xl mb-8 text-gray-200">
                {gameOver === 'win' ? "Bóng tối đã bị đẩy lùi, vinh quang thuộc về bạn." : "Hãy đứng lên và thử lại, hỡi Anh Hùng."}
              </p>
              <button
                onClick={resetGame}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-2xl transition-all duration-200 shadow-2xl transform hover:scale-105 border-2 border-purple-400"
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
