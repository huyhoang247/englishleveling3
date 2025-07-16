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
  name: "BOSS",
};

// --- Component Thanh Máu ---
const HealthBar = ({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`}
          style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` }}
        ></div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
};

// --- Component Hiển thị Coin ---
const CoinDisplay = ({ coins }: { coins: number }) => {
  return (
    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.8)]">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        <span className="font-bold text-lg text-yellow-300 text-shadow-sm tracking-wider">
            {coins}
        </span>
    </div>
  );
};

// --- Component Số Sát Thương ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  return (
    <div
      key={id}
      // [CẬP NHẬT] Điều chỉnh vị trí sát thương theo yêu cầu mới
      className={`absolute top-1/3 font-lilita text-4xl animate-float-up text-red-500 pointer-events-none ${isPlayerHit ? 'left-[5%]' : 'right-[10%]'}`}
      style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}
    >
      -{damage}
    </div>
  );
};

// --- Component Modal Chỉ Số (với Overlay và Nút Đóng) ---
const StatsModal = ({ player, boss, onClose }: { player: typeof PLAYER_INITIAL_STATS, boss: typeof BOSS_INITIAL_STATS, onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans"
          aria-label="Đóng"
        >
          ✕
        </button>
        <div className="p-5 pt-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-xl font-bold text-blue-300 text-shadow-sm tracking-wide">HERO</h3>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{player.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{player.def}</span></p>
            </div>
            <div className="h-16 w-px bg-slate-600/70"></div>
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide">BOSS</h3>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{boss.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{boss.def}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Component Modal Lịch Sử Chiến Đấu ---
const LogModal = ({ log, onClose }: { log: string[], onClose: () => void }) => {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans"
            aria-label="Đóng"
          >
            ✕
          </button>
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3>
          </div>
          <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
            {log.length > 0 ? log.map((entry, index) => (
              <p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2">
                {entry}
              </p>
            )) : (
              <p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

// --- Component Chính Của Game ---
export default function BossBattle() {
  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(BOSS_INITIAL_STATS);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [playerCoins, setPlayerCoins] = useState(0);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [combatLog]);

  useEffect(() => {
    addLog(`${BOSS_INITIAL_STATS.name} đã xuất hiện. Hãy chuẩn bị!`, 0);
  }, []);

  useEffect(() => {
    if (battleState === 'fighting') {
      battleIntervalRef.current = setInterval(runBattleTurn, 800);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState]);

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
    setTurnCounter(currentTurn => {
        const nextTurn = currentTurn + 1;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        
        setBossStats(prevBossStats => {
            const newBossHp = prevBossStats.hp - playerDmg;
            addLog(`Anh Hùng tấn công, gây ${playerDmg} sát thương.`, nextTurn);
            showFloatingDamage(playerDmg, false);

            if (newBossHp <= 0) {
                endGame('win', nextTurn);
                return { ...prevBossStats, hp: 0 };
            }

            setTimeout(() => {
                setPlayerStats(prevPlayerStats => {
                    const currentBossAtk = bossStats.atk; // Lấy atk của boss từ state bên ngoài timeout
                    const currentHeroDef = prevPlayerStats.def;

                    let bossDmg;
                    if (nextTurn % 3 === 0) {
                        bossDmg = calculateDamage(currentBossAtk * 1.5, currentHeroDef);
                        addLog(`${bossStats.name} tung [Hủy Diệt], gây ${bossDmg} sát thương!`, nextTurn);
                        setIsShaking(true);
                        setTimeout(() => setIsShaking(false), 500);
                    } else {
                        bossDmg = calculateDamage(currentBossAtk, currentHeroDef);
                        addLog(`${bossStats.name} phản công, gây ${bossDmg} sát thương.`, nextTurn);
                    }
                    
                    const newPlayerHp = prevPlayerStats.hp - bossDmg;
                    showFloatingDamage(bossDmg, true);
                    if (newPlayerHp <= 0) {
                        endGame('lose', nextTurn);
                        return { ...prevPlayerStats, hp: 0 };
                    }
                    return { ...prevPlayerStats, hp: newPlayerHp };
                });

            }, 400);

            return { ...prevBossStats, hp: newBossHp };
        });

        return nextTurn;
    });
  };
  
  const endGame = (result: 'win' | 'lose', finalTurn: number) => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    setGameOver(result);
    if (result === 'win') {
      const coinsEarned = 100 + Math.floor(Math.random() * 51);
      addLog(`${BOSS_INITIAL_STATS.name} đã bị đánh bại! Bạn nhận được ${coinsEarned} coin!`, finalTurn);
      setPlayerCoins(prevCoins => prevCoins + coinsEarned);
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", finalTurn);
    }
  };

  const startGame = () => {
    if (battleState === 'idle') {
      setBattleState('fighting');
    }
  };

  const resetGame = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);

    setPlayerStats(PLAYER_INITIAL_STATS);
    setBossStats(BOSS_INITIAL_STATS);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
    setShowStats(false);
    setShowLogModal(false);
    setTimeout(() => addLog(`${BOSS_INITIAL_STATS.name} đã xuất hiện. Hãy chuẩn bị!`, 0), 100);
  };

  const skipBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

    let tempPlayerHp = playerStats.hp;
    let tempBossHp = bossStats.hp;
    let tempTurn = turnCounter;
    let tempCombatLog: string[] = []; 
    let winner: 'win' | 'lose' | null = null;

    while (winner === null) {
        tempTurn++;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        tempBossHp -= playerDmg;
        tempCombatLog.unshift(`[Lượt ${tempTurn}] Anh Hùng tấn công, gây ${playerDmg} sát thương.`);
        if (tempBossHp <= 0) {
            winner = 'win';
            break;
        }

        let bossDmg;
        if (tempTurn % 3 === 0) {
            bossDmg = calculateDamage(bossStats.atk * 1.5, playerStats.def);
            tempCombatLog.unshift(`[Lượt ${tempTurn}] ${bossStats.name} tung [Hủy Diệt], gây ${bossDmg} sát thương!`);
        } else {
            bossDmg = calculateDamage(bossStats.atk, playerStats.def);
            tempCombatLog.unshift(`[Lượt ${tempTurn}] ${bossStats.name} phản công, gây ${bossDmg} sát thương.`);
        }
        tempPlayerHp -= bossDmg;
        if (tempPlayerHp <= 0) {
            winner = 'lose';
            break;
        }
    }

    setCombatLog(prevLog => [...tempCombatLog, ...prevLog]);
    setPlayerStats(prev => ({ ...prev, hp: Math.max(0, tempPlayerHp) }));
    setBossStats(prev => ({ ...prev, hp: Math.max(0, tempBossHp) }));
    setTurnCounter(tempTurn);
    endGame(winner, tempTurn);
  }


  return (
    <>
      <style>{`
        /* ... CSS không thay đổi ... */
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        .font-sans { font-family: sans-serif; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-screen-shake { animation: screen-shake 0.5s linear; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; }
        .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); }
        .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); }
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; }
        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; }
        .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; }
        .btn-shine:hover::before { left: 125%; }
      `}</style>

      {showStats && <StatsModal player={playerStats} boss={bossStats} onClose={() => setShowStats(false)} />}
      {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        
        <header className="fixed top-0 left-0 w-full z-20 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center gap-4">
                <div className="w-full max-w-xs">
                    <h3 className="text-xl font-bold text-blue-300 text-shadow mb-1">HERO</h3>
                    <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                </div>
                <div className="flex items-center">
                    <CoinDisplay coins={playerCoins} />
                </div>
            </div>
        </header>

        <main className={`w-full h-full flex flex-col justify-center items-center pt-24 p-4 ${isShaking ? 'animate-screen-shake' : ''}`}>
            
            <div className="w-full flex justify-center items-center gap-4 mb-4 h-10">
                <button
                    onClick={() => setShowStats(true)}
                    className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md"
                >
                    View Stats
                </button>

                {battleState === 'idle' && (
                  <button
                      onClick={() => setShowLogModal(true)}
                      className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md"
                  >
                      View Log
                  </button>
                )}

                {battleState === 'fighting' && (
                  <button
                      onClick={skipBattle}
                      className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300"
                  >
                      Skip Battle
                  </button>
                )}
            </div>

            {damages.map(d => (
                <FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} />
            ))}

            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <h2 className="text-2xl font-bold text-red-400 text-shadow">{bossStats.name.toUpperCase()}</h2>
                  <div className="w-40 h-40 md:w-56 md:h-56">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png" alt="Boss" className="w-full h-full object-contain" />
                  </div>
                  <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {battleState === 'idle' && (
                <button
                    onClick={startGame}
                    className="btn-shine relative overflow-hidden px-10 py-3 bg-slate-900/80 rounded-lg
                               font-bold text-lg text-teal-300 tracking-widest uppercase
                               border border-teal-500/40
                               transition-all duration-300
                               hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)]
                               active:scale-95"
                >
                    Fight
                </button>
                )}

                {battleState !== 'idle' && (
                  <div ref={logContainerRef} className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (
                          <p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse' : 'text-slate-300'}`}>
                          {entry}
                          </p>
                      ))}
                  </div>
                )}
            </div>
          
            {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <h2 className={`text-7xl font-extrabold mb-4 text-shadow-lg ${gameOver === 'win' ? 'text-yellow-300' : 'text-red-500'}`}
                    style={{ textShadow: `0 0 25px ${gameOver === 'win' ? 'rgba(252, 211, 77, 0.7)' : 'rgba(220, 38, 38, 0.7)'}` }}
                >
                    {gameOver === 'win' ? "CHIẾN THẮNG!" : "THẤT BẠI"}
                </h2>
                <p className="text-xl mb-8 text-slate-200 text-shadow-sm font-sans">
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
        </main>
      </div>
    </>
  );
}
