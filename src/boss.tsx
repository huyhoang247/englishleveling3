// --- START OF FILE boss.tsx (UPDATED) ---

import React, { useState, useEffect, useRef } from 'react';
import BOSS_DATA from './boss/bossData.ts'; 

// --- SỬA LẠI PROPS INTERFACE ---
interface BossBattleProps {
  onClose: () => void;
  playerInitialStats: {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy: number;
    energy: number;
  };
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  // >>> THÊM PROPS MỚI <<<
  initialFloor: number;
  onFloorComplete: (newFloor: number) => void;
}

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

// --- Component Hiển thị Năng Lượng ---
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
  const formatDamageText = (num: number): string => {
    if (num >= 1000) return `${parseFloat((num / 1000).toFixed(1))}k`;
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

// --- Component Modal Chỉ Số ---
const StatsModal = ({ player, boss, onClose }: { player: any, boss: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-xl font-bold text-blue-300 text-shadow-sm tracking-wide">YOU</h3>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{player.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{player.def}</span></p>
            </div>
            <div className="h-16 w-px bg-slate-600/70"></div>
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide select-none">
                  BOSS
              </h3>
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
          <div className="p-4 border-b border-slate-700"><h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3></div>
          <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
            {log.length > 0 ? log.map((entry, index) => (<p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2">{entry}</p>)) : (<p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>)}
          </div>
        </div>
      </div>
    )
}

// --- Component Modal Phần Thưởng ---
const RewardsModal = ({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Potential Rewards</h3>
          <div className="flex flex-row flex-wrap justify-center gap-3">
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
              <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
              <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component Modal Chiến Thắng ---
const VictoryModal = ({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1834_C%C3%BAp%20V%C3%A0ng%20Kh%C3%B4ng%20Sao_remix_01k0kspc1wfjyamwcc0f3m8q6v.png" alt="Victory" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
                      <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
                      <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
                  </div>
              </div>
          </div>
          <hr className="w-full border-t border-yellow-500/20 my-5" />
          {!isLastBoss ? (
            <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Next Floor</button>
          ) : (
            <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500 hover:border-yellow-400 transition-all duration-200 active:scale-95">Play Again</button>
          )}
      </div>
    </div>
  );
}

// --- Component Modal Thất Bại ---
const DefeatModal = ({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl shadow-black/30 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1828_Bi%E1%BB%83u%20T%C6%B0%E1%BB%A3ng%20Th%E1%BA%A5t%20B%E1%BA%A1i_remix_01k0kscbkvfngrav0b2ypp55rs.png" alt="Defeat" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you. Rise again and reclaim your honor.</p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
  );
}

// --- Component Chính Của Game ---
export default function BossBattle({ 
  onClose, 
  playerInitialStats, 
  onBattleEnd, 
  // >>> NHẬN PROPS MỚI <<<
  initialFloor, 
  onFloorComplete 
}: BossBattleProps) {
  
  // >>> SỬ DỤNG initialFloor ĐỂ KHỞI TẠO STATE TẦNG HIỆN TẠI <<<
  const [currentBossIndex, setCurrentBossIndex] = useState(initialFloor);
  const currentBossData = BOSS_DATA[currentBossIndex];

  const [playerStats, setPlayerStats] = useState(playerInitialStats);
  const [bossStats, setBossStats] = useState(currentBossData.stats);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // >>> THÊM EFFECT ĐỂ ĐỒNG BỘ NẾU PROP THAY ĐỔI <<<
  useEffect(() => {
    setCurrentBossIndex(initialFloor);
  }, [initialFloor]);

  useEffect(() => {
    setPlayerStats(playerInitialStats);
  }, [playerInitialStats]);

  useEffect(() => {
    // Cập nhật lại boss stats mỗi khi tầng thay đổi
    setBossStats(BOSS_DATA[currentBossIndex].stats);
    addLog(`${BOSS_DATA[currentBossIndex].name} đã xuất hiện. Hãy chuẩn bị!`, 0);
  }, [currentBossIndex]);

  useEffect(() => {
    if (battleState === 'fighting') {
      battleIntervalRef.current = setInterval(runBattleTurn, 800);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, bossStats, playerStats]);

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
    const defenseConstant = 100;
    const damageReduction = defenderDef / (defenderDef + defenseConstant);
    const finalDamage = baseDamage * (1 - damageReduction);
    return Math.max(1, Math.floor(finalDamage));
  };

  const runBattleTurn = () => {
    if (gameOver) return;
    setTurnCounter(currentTurn => {
        const nextTurn = currentTurn + 1;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        setBossStats(prevBoss => {
            const newHp = prevBoss.hp - playerDmg;
            addLog(`Bạn tấn công, gây ${playerDmg} sát thương.`, nextTurn);
            showFloatingDamage(playerDmg, false);
            if (newHp <= 0) {
                endGame('win', nextTurn);
                return { ...prevBoss, hp: 0 };
            }
            return { ...prevBoss, hp: newHp };
        });
        setTimeout(() => {
            if (battleIntervalRef.current) {
                const bossDmg = calculateDamage(bossStats.atk, playerStats.def);
                setPlayerStats(prevPlayer => {
                    const newHp = prevPlayer.hp - bossDmg;
                    addLog(`${currentBossData.name} phản công, gây ${bossDmg} sát thương.`, nextTurn);
                    showFloatingDamage(bossDmg, true);
                    if (newHp <= 0) {
                        endGame('lose', nextTurn);
                        return { ...prevPlayer, hp: 0 };
                    }
                    return { ...prevPlayer, hp: newHp };
                });
            }
        }, 400);
        return nextTurn;
    });
  };

  const endGame = (result: 'win' | 'lose', finalTurn: number) => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    battleIntervalRef.current = null;
    setBattleState('finished');
    setGameOver(result);
    const rewards = currentBossData.rewards || { coins: 0, energy: 0 };
    if (result === 'win') {
      addLog(`${currentBossData.name} đã bị đánh bại!`, finalTurn);
      onBattleEnd('win', rewards);
      const newEnergy = Math.min(playerInitialStats.maxEnergy, playerStats.energy + rewards.energy);
      setPlayerStats(prev => ({...prev, energy: newEnergy}));
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", finalTurn);
      onBattleEnd('lose', { coins: 0, energy: 0 });
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

  const resetAllStateForNewBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
    setShowStats(false);
    setShowLogModal(false);
    setShowRewardsModal(false);
  }

  // >>> HÀM MỚI: THỬ LẠI TẦNG HIỆN TẠI KHI THUA <<<
  const retryCurrentFloor = () => {
    resetAllStateForNewBattle();
    // KHÔNG reset currentBossIndex, giữ nguyên tầng hiện tại
    setPlayerStats(playerInitialStats); 
    setBossStats(BOSS_DATA[currentBossIndex].stats); // Chỉ reset stats của boss hiện tại
    setTimeout(() => addLog(`${BOSS_DATA[currentBossIndex].name} đã xuất hiện. Hãy chuẩn bị!`, 0), 100);
  };
  
  // >>> ĐỔI TÊN HÀM NÀY CHO RÕ NGHĨA HƠN <<<
  // Hàm này chỉ dùng khi người chơi clear hết boss và muốn chơi lại từ đầu
  const restartFromBeginning = () => {
    resetAllStateForNewBattle();
    setCurrentBossIndex(0);
    onFloorComplete(0); // Báo cho parent biết để reset tiến trình
    setPlayerStats(playerInitialStats);
    setBossStats(BOSS_DATA[0].stats);
    setTimeout(() => addLog(`${BOSS_DATA[0].name} đã xuất hiện. Hãy chuẩn bị!`, 0), 100);
  }

  const handleNextFloor = () => {
    const nextIndex = currentBossIndex + 1;
    if(nextIndex < BOSS_DATA.length) {
      resetAllStateForNewBattle();
      setCurrentBossIndex(nextIndex);
      
      // >>> ĐÂY LÀ LÚC GỌI onFloorComplete ĐỂ LƯU TIẾN TRÌNH <<<
      onFloorComplete(nextIndex);

      // Hồi đầy máu cho người chơi, giữ nguyên chỉ số ATK/DEF đã nâng cấp
      // và năng lượng hiện tại (đã cộng thưởng).
      setPlayerStats(prev => ({
        ...playerInitialStats, // Lấy ATK/DEF... từ prop (đã được nâng cấp)
        hp: playerInitialStats.maxHp, // Hồi đầy máu
        energy: prev.energy // Giữ lại năng lượng hiện tại
      }));
    }
  }

  const skipBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    let tempPlayerHp = playerStats.hp;
    let tempBossHp = bossStats.hp;
    let tempTurn = turnCounter;
    let tempCombatLog: string[] = [...combatLog].reverse();
    let winner: 'win' | 'lose' | null = null;
    while (winner === null) {
        tempTurn++;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        tempBossHp -= playerDmg;
        tempCombatLog.push(`[Lượt ${tempTurn}] Bạn tấn công, gây ${playerDmg} sát thương.`);
        if (tempBossHp <= 0) { winner = 'win'; break; }
        const bossDmg = calculateDamage(bossStats.atk, playerStats.def);
        tempPlayerHp -= bossDmg;
        tempCombatLog.push(`[Lượt ${tempTurn}] ${currentBossData.name} phản công, gây ${bossDmg} sát thương.`);
        if (tempPlayerHp <= 0) { winner = 'lose'; break; }
    }
    setCombatLog(tempCombatLog.reverse());
    setPlayerStats(prev => ({ ...prev, hp: Math.max(0, tempPlayerHp) }));
    setBossStats(prev => ({ ...prev, hp: Math.max(0, tempBossHp) }));
    setTurnCounter(tempTurn);
    endGame(winner, tempTurn);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
      `}</style>

      {showStats && <StatsModal player={playerStats} boss={bossStats} onClose={() => setShowStats(false)} />}
      
      {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
      {showRewardsModal && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="fixed top-0 left-0 w-full z-20 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center gap-2">
                <div className="w-1/2"><h3 className="text-xl font-bold text-blue-300 text-shadow mb-1">{currentBossData.floor}</h3><HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" /></div>
                <div className="flex items-center justify-end gap-4 w-1/2">
                    <EnergyDisplay current={playerStats.energy} max={playerStats.maxEnergy} />
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-slate-800/70 hover:bg-red-500/80 rounded-full text-slate-300 hover:text-white transition-colors text-xl font-sans flex-shrink-0" aria-label="Thoát">
                        ✕
                    </button>
                </div>
            </div>
        </header>

        <main className="w-full h-full flex flex-col justify-center items-center pt-24 p-4">
            <div className="w-full flex justify-center items-center gap-4 mb-4 h-10">
                <button onClick={() => setShowStats(true)} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">View Stats</button>

                {battleState === 'idle' && (
                  <>
                    <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">View Log</button>
                    <button onClick={() => setShowRewardsModal(true)} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">Rewards</button>
                  </>
                )}

                {battleState === 'fighting' && (<button onClick={skipBattle} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300">Skip Battle</button>)}
            </div>

            {damages.map(d => (<FloatingDamage key={d.id} damage={d.damage} id={d.id} isPlayerHit={d.isPlayerHit} />))}

            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="relative group flex justify-center">
                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">
                      BOSS
                    </h2>
                    <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-900 text-sm text-center text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {currentBossData.name.toUpperCase()}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900"></div>
                    </div>
                  </div>
                  
                  <div className="w-40 h-40 md:w-56 md:h-56">
                    <img 
                      src={`/images/boss/${String(currentBossData.id).padStart(2, '0')}.webp`} 
                      alt={currentBossData.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {battleState === 'idle' && (
                <button onClick={startGame} disabled={playerStats.energy < 10} className="btn-shine relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg text-teal-300 border border-teal-500/40 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-lg tracking-widest uppercase">Fight</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80">
                            <span>10</span><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="" className="w-3 h-3"/>
                        </div>
                    </div>
                </button>
                )}
                {battleState !== 'idle' && (
                  <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (<p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse' : 'text-slate-300'}`}>{entry}</p>))}
                  </div>
                )}
            </div>

            {/* >>> CẬP NHẬT CÁC HÀM GỌI TRONG MODAL <<< */}
            {gameOver === 'win' && (<VictoryModal onRestart={restartFromBeginning} onNextFloor={handleNextFloor} isLastBoss={currentBossIndex === BOSS_DATA.length - 1} rewards={currentBossData.rewards} />)}
            {gameOver === 'lose' && (<DefeatModal onRestart={retryCurrentFloor} />)}
        </main>
      </div>
    </>
  );
}
