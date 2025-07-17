// File: src/components/BossBattle.tsx

import React, { useState, useEffect, useRef } from 'react';

// --- Cấu hình nhân vật và Boss ---
const PLAYER_INITIAL_STATS = {
  maxHp: 10000,
  hp: 10000,
  atk: 1500,
  def: 5,
  maxEnergy: 50,
  energy: 50,
};

const BOSS_INITIAL_STATS = {
  maxHp: 30000,
  hp: 30000,
  atk: 2000,
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

// --- Component Hiển thị Năng Lượng - Thiết kế lại cho nhỏ gọn ---
const EnergyDisplay = ({ current, max }: { current: number, max: number }) => {
    return (
      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-cyan-500/30">
          <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" 
            alt="Energy" 
            className="w-5 h-5"
          />
          <span className="font-bold text-base text-cyan-300 text-shadow-sm tracking-wider">
              {current}/{max}
          </span>
      </div>
    );
};

// --- Component Số Sát Thương ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  // Hàm định dạng số sát thương: nếu lớn hơn hoặc bằng 1000, chuyển sang dạng "k"
  const formatDamageText = (num: number): string => {
    if (num >= 1000) {
      // Chia cho 1000, làm tròn đến 1 chữ số thập phân và thêm "k"
      // parseFloat sẽ tự động bỏ đi ".0" nếu có (ví dụ: 1000 -> 1k, 1234 -> 1.2k)
      return `${parseFloat((num / 1000).toFixed(1))}k`;
    }
    return String(num);
  };

  return (
    <div
      key={id}
      className={`absolute top-1/3 font-lilita text-2xl animate-float-up text-red-500 pointer-events-none ${isPlayerHit ? 'left-[5%]' : 'right-[5%]'}`}
      style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}
    >
      -{formatDamageText(damage)}
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
              <h3 className="text-xl font-bold text-blue-300 text-shadow-sm tracking-wide">YOU</h3>
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

// --- Component Modal Phần Thưởng (Thiết kế ô riêng biệt) ---
const RewardsModal = ({ onClose }: { onClose: () => void }) => {
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
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Rewards</h3>
          
          {/* Container cho các ô phần thưởng */}
          <div className="flex flex-col gap-3">

            {/* Ô phần thưởng Vàng */}
            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.287 15.584c-1.42.368-2.92.516-4.287.395V16.6c1.077.105 2.13.045 3.129-.169a1 1 0 0 0 .87-1.119l-.547-3.284a1 1 0 0 0-1.119-.87c-.394.065-.806.11-1.229.136V9.4c.319-.016.634-.042.946-.078a1 1 0 0 0 .973-1.018l-.138-1.65a1 1 0 0 0-1.017-.973c-.886.074-1.78.11-2.664.11S9.334 5.863 8.448 5.79a1 1 0 0 0-1.017.973l-.138 1.65a1 1 0 0 0 .973 1.018c.312.036.627.062.946.078v1.896c-.423-.026-.835-.071-1.229-.136a1 1 0 0 0-1.119.87l-.547 3.284a1 1 0 0 0 .87 1.119c1.131.238 2.306.31 3.522.188v1.376c-1.385.01-2.858-.171-4.22-.656a1 1 0 1 0-.604 1.9c1.73.613 3.598.819 5.324.793 1.726.026 3.594-.18 5.324-.793a1 1 0 1 0-.604-1.9z"></path></svg>
              <span className="text-2xl font-bold text-yellow-300 text-shadow-sm">+300</span>
            </div>

            {/* Ô phần thưởng Năng lượng */}
            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png"
                alt="Energy"
                className="w-8 h-8 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]"
              />
              <span className="text-2xl font-bold text-cyan-300 text-shadow-sm">+5</span>
            </div>

            {/* Thêm các vật phẩm khác ở đây theo cùng cấu trúc */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component Modal Chiến Thắng ---
const VictoryModal = ({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div
        className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center"
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 2H8C4.691 2 2 4.691 2 8v8c0 3.309 2.691 6 6 6h8c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm-4 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"></path><path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"></path><path d="M15 2.05A8.956 8.956 0 0 0 12 1a9 9 0 0 0-9 9c0 1.948.624 3.738 1.666 5.176l1.321-1.321A6.96 6.96 0 0 1 5 9a7 7 0 0 1 14 0c0 1.294-.361 2.49-1.025 3.518l1.321 1.321C20.376 12.738 21 10.948 21 9a8.956 8.956 0 0 0-2.05-5.95z"></path>
          </svg>
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-3 text-shadow"
              style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>
              VICTORY
          </h2>
          <p className="font-sans text-slate-300 text-sm leading-relaxed max-w-xs">
            The darkness has been vanquished. Your bravery will be remembered.
          </p>
          <hr className="w-full border-t border-yellow-500/20 my-5" />
          <button
              onClick={onRestart}
              className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500 hover:border-yellow-400 transition-all duration-200 active:scale-95"
          >
              Play Again
          </button>
      </div>
    </div>
  );
}

// --- Component Modal Thất Bại ---
const DefeatModal = ({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div
        className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl shadow-black/30 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center"
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-500 mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M13.293 14.707a.999.999 0 0 1-1.414 0L9.464 12.293a.999.999 0 0 1 0-1.414l2.414-2.414a.999.999 0 1 1 1.414 1.414L11.586 12l2.293 2.293a.999.999 0 0 1 0 1.414zM8.5 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path>
          </svg>
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">
              DEFEAT
          </h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">
            The darkness has consumed you. Rise again and reclaim your honor.
          </p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button
              onClick={onRestart}
              className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95"
          >
              Try Again
          </button>
      </div>
    </div>
  );
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
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);

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
        
        setBossStats(prevBossStats => {
            const playerDmg = calculateDamage(playerStats.atk, prevBossStats.def);
            const newBossHp = prevBossStats.hp - playerDmg;
            addLog(`Bạn tấn công, gây ${playerDmg} sát thương.`, nextTurn);
            showFloatingDamage(playerDmg, false);

            if (newBossHp <= 0) {
                endGame('win', nextTurn);
                return { ...prevBossStats, hp: 0 };
            }

            setTimeout(() => {
                setPlayerStats(prevPlayerStats => {
                    const bossDmg = calculateDamage(bossStats.atk, prevPlayerStats.def);
                    addLog(`${bossStats.name} phản công, gây ${bossDmg} sát thương.`, nextTurn);
                    
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
      addLog(`${BOSS_INITIAL_STATS.name} đã bị đánh bại!`, finalTurn);
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", finalTurn);
    }
  };

  const startGame = () => {
    if (battleState === 'idle' && playerStats.energy >= 10) {
      setPlayerStats(prev => ({ ...prev, energy: prev.energy - 10 }));
      setBattleState('fighting');
    } else if (battleState === 'idle') {
      addLog("Không đủ năng lượng.", 0);
    }
  };

  const resetGame = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);
    const newEnergy = Math.min(PLAYER_INITIAL_STATS.maxEnergy, playerStats.energy + 20);
    setPlayerStats({...PLAYER_INITIAL_STATS, energy: newEnergy});
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
        tempCombatLog.unshift(`[Lượt ${tempTurn}] Bạn tấn công, gây ${playerDmg} sát thương.`);
        if (tempBossHp <= 0) {
            winner = 'win';
            break;
        }

        const bossDmg = calculateDamage(bossStats.atk, playerStats.def);
        tempCombatLog.unshift(`[Lượt ${tempTurn}] ${bossStats.name} phản công, gây ${bossDmg} sát thương.`);
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
        .btn-shine:hover:not(:disabled)::before { left: 125%; }
      `}</style>

      {showStats && <StatsModal player={playerStats} boss={bossStats} onClose={() => setShowStats(false)} />}
      {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
      {showRewardsModal && <RewardsModal onClose={() => setShowRewardsModal(false)} />}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        
        <header className="fixed top-0 left-0 w-full z-20 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center gap-2">
                <div className="w-1/2">
                    <h3 className="text-xl font-bold text-blue-300 text-shadow mb-1">FLOOR 1</h3>
                    <HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                </div>
                <div className="flex items-center justify-end gap-2 w-1/2">
                    <EnergyDisplay current={playerStats.energy} max={playerStats.maxEnergy} />
                </div>
            </div>
        </header>

        <main className="w-full h-full flex flex-col justify-center items-center pt-24 p-4">
            
            <div className="w-full flex justify-center items-center gap-4 mb-4 h-10">
                <button
                    onClick={() => setShowStats(true)}
                    className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md"
                >
                    View Stats
                </button>

                {battleState === 'idle' && (
                  <>
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md"
                    >
                        View Log
                    </button>
                    <button
                        onClick={() => setShowRewardsModal(true)}
                        className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md"
                    >
                        Rewards
                    </button>
                  </>
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
                    disabled={playerStats.energy < 10}
                    className="btn-shine relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg
                               text-teal-300
                               border border-teal-500/40
                               transition-all duration-300
                               hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)]
                               active:scale-95
                               disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-lg tracking-widest uppercase">
                            Fight
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80">
                            <span>10</span>
                            <img
                                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png"
                                alt=""
                                className="w-3 h-3"
                            />
                        </div>
                    </div>
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
          
            {gameOver === 'win' && (
                <VictoryModal onRestart={resetGame} />
            )}
            {gameOver === 'lose' && (
                <DefeatModal onRestart={resetGame} />
            )}
        </main>
      </div>
    </>
  );
}
