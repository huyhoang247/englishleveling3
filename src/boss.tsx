// File: src/components/BossBattle.tsx

import React, a{ useState, useEffect, useRef } from 'react';

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

// --- [MỚI] Component Thanh Máu được thiết kế lại ---
const HealthBar = ({ current, max, colorGradient, shadowColor, label }: { current: number, max: number, colorGradient: string, shadowColor: string, label: string }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`}
          style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` }}
        ></div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{label}: {Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
};


// --- [MỚI] Component Số Sát Thương được thiết kế lại ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  return (
    <div
      key={id}
      className={`absolute top-1/2 font-lilita text-4xl animate-float-up text-red-500 pointer-events-none ${isPlayerHit ? 'left-1/4' : 'right-1/4'}`}
      style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}
    >
      -{damage}
    </div>
  );
};

// --- Component Chính Của Game ---
export default function BossBattle() {
  // --- State của game (Không thay đổi) ---
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
  
  // --- Logic game (Không thay đổi) ---
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
      battleIntervalRef.current = setInterval(runBattleTurn, 800);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, playerStats, bossStats, turnCounter]);

  const addLog = (message: string, turn: number) => {
    const logEntry = turn > 0 ? `[Lượt ${turn}] ${message}` : message;
    setCombatLog(prevLog => [logEntry, ...prevLog]);
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
    const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
    const newBossHp = bossStats.hp - playerDmg;
    addLog(`Anh Hùng tấn công, gây ${playerDmg} sát thương.`, turnCounter + 1);
    showFloatingDamage(playerDmg, false);
    
    if (newBossHp <= 0) {
      setBossStats(prev => ({ ...prev, hp: 0 }));
      endGame('win');
      return;
    }
    setBossStats(prev => ({ ...prev, hp: newBossHp }));
    
    setTimeout(() => {
      let bossDmg;
      const currentTurn = turnCounter + 1;
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
      const newPlayerHp = playerStats.hp - bossDmg;

      if (newPlayerHp <= 0) {
        setPlayerStats(prev => ({ ...prev, hp: 0 }));
        endGame('lose');
      } else {
        setPlayerStats(prev => ({ ...prev, hp: newPlayerHp }));
      }
    }, 400);

    setTurnCounter(prev => prev + 1);
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
    if (battleState === 'idle') {
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
    setTimeout(() => addLog(`Một ${BOSS_INITIAL_STATS.name} khổng lồ xuất hiện. Hãy chuẩn bị!`, 0), 100);
  };

  return (
    <>
      {/* --- CSS được lấy cảm hứng từ nang-chi-so.tsx --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }

        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        
        @keyframes screen-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-screen-shake { animation: screen-shake 0.5s linear; }

        .animate-breathing {
            animation: breathing 5s ease-in-out infinite;
        }
        @keyframes breathing {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2)); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));}
        }

        .main-bg::before, .main-bg::after {
            content: '';
            position: absolute;
            left: 50%;
            z-index: 0;
            pointer-events: none;
        }
        .main-bg::before {
             width: 150%; height: 150%; top: 50%;
             transform: translate(-50%, -50%);
             background-image: radial-gradient(circle, transparent 40%, #110f21 80%);
        }
        .main-bg::after {
             width: 100%; height: 100%; top: 0;
             transform: translateX(-50%);
             background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%);
        }
      `}</style>
      
      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
        <div className={`relative z-10 w-full max-w-4xl mx-auto ${isShaking ? 'animate-screen-shake' : ''}`}>
          {damages.map(d => (
            <FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} />
          ))}

          <h1 className="text-5xl font-bold text-center mb-8 text-shadow tracking-wider text-cyan-300">ĐẤU TRƯỜNG HUYỀN THOẠI</h1>

          {/* --- KHU VỰC HIỂN THỊ CHÍNH --- */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-6">
            {/* --- PANEL ANH HÙNG --- */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-300 text-shadow">ANH HÙNG</h2>
              <div className="w-32 h-32 animate-breathing">
                  <img src="https://i.ibb.co/L5Tj1Rq/player-knight.png" alt="Anh Hùng" className="w-full h-full object-contain" />
              </div>
              <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" label="HP" />
              {showStats && (
                 <div className="text-md text-center bg-black/30 p-2 rounded-md w-full text-shadow-sm">
                  <p>ATK: <span className="font-bold text-red-400">{playerStats.atk}</span></p>
                  <p>DEF: <span className="font-bold text-sky-400">{playerStats.def}</span></p>
                </div>
              )}
            </div>
            
            {/* --- ICON VS --- */}
            <div className="hidden md:flex justify-center items-center">
                 <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/versus.png" alt="VS" className="w-24 h-24 opacity-80" />
            </div>

            {/* --- PANEL BOSS --- */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold text-red-400 text-shadow">{bossStats.name.toUpperCase()}</h2>
              <div className="w-32 h-32 animate-breathing" style={{ animationDelay: '0.5s' }}>
                   <img src="https://i.ibb.co/h7n4w2B/demon-king.png" alt="Boss" className="w-full h-full object-contain" />
              </div>
              <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" label="HP" />
              {showStats && (
                <div className="text-md text-center bg-black/30 p-2 rounded-md w-full text-shadow-sm">
                  <p>ATK: <span className="font-bold text-red-400">{bossStats.atk}</span></p>
                  <p>DEF: <span className="font-bold text-sky-400">{bossStats.def}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* --- KHU VỰC ĐIỀU KHIỂN --- */}
          <div className="mb-6 flex flex-col items-center gap-4">
            {battleState === 'idle' && (
              <button
                onClick={startGame}
                className="px-10 py-4 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-lg font-bold text-xl transition-all duration-300 shadow-lg border-2 border-transparent hover:border-white/50 active:scale-95 text-shadow"
              >
                BẮT ĐẦU CHIẾN ĐẤU
              </button>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-md font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95"
            >
              {showStats ? 'Ẩn Chỉ Số' : 'Hiện Chỉ Số'}
            </button>
          </div>

          {/* --- NHẬT KÝ CHIẾN ĐẤU --- */}
          <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-3 text-slate-400 tracking-wider">NHẬT KÝ CHIẾN ĐẤU</h3>
            <div ref={logContainerRef} className="h-48 bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {combatLog.map((entry, index) => (
                <p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse' : 'text-slate-300'}`}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
          
          {/* --- MÀN HÌNH KẾT THÚC GAME --- */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <h2 className={`text-7xl font-extrabold mb-4 text-shadow-lg ${gameOver === 'win' ? 'text-yellow-300' : 'text-red-500'}`}
                  style={{ textShadow: `0 0 25px ${gameOver === 'win' ? 'rgba(252, 211, 77, 0.7)' : 'rgba(220, 38, 38, 0.7)'}` }}
              >
                {gameOver === 'win' ? "CHIẾN THẮNG!" : "THẤT BẠI"}
              </h2>
              <p className="text-xl mb-8 text-slate-200 text-shadow-sm">
                {gameOver === 'win' ? "Bóng tối đã bị đẩy lùi, vinh quang thuộc về bạn!" : "Thế giới chìm trong bóng tối vĩnh hằng..."}
              </p>
              <button
                onClick={resetGame}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-2xl transition-all duration-200 shadow-2xl hover:scale-105 active:scale-100 text-shadow"
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
