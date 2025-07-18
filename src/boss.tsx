// File: src/components/BossBattle.tsx

import React, { useState, useEffect, useRef } from 'react';

// --- Cấu hình nhân vật ---
const PLAYER_INITIAL_STATS = {
  maxHp: 50000,
  hp: 50000,
  atk: 1500,
  def: 5,
  maxEnergy: 50,
  energy: 50,
};

// --- Cấu trúc dữ liệu cho các Boss theo tầng ---
const BOSS_DATA = [
  {
    id: 1,
    floor: "FLOOR 1",
    name: "Slime",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 30000, hp: 30000, atk: 1000, def: 8 }
  },
  {
    id: 2,
    floor: "FLOOR 2",
    name: "Dragon",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 80000, hp: 80000, atk: 2500, def: 12 }
  },
];

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
const StatsModal = ({ player, boss, bossName, onClose }: { player: any, boss: any, bossName: string, onClose: () => void }) => {
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
              <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide">{bossName.toUpperCase()}</h3>
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

// --- Component Modal Phần Thưởng (ĐƯỢC THÊM LẠI) ---
const RewardsModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Potential Rewards</h3>
          <div className="flex flex-row flex-wrap justify-center gap-3">
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.287 15.584c-1.42.368-2.92.516-4.287.395V16.6c1.077.105 2.13.045 3.129-.169a1 1 0 0 0 .87-1.119l-.547-3.284a1 1 0 0 0-1.119-.87c-.394.065-.806.11-1.229.136V9.4c.319-.016.634-.042.946-.078a1 1 0 0 0 .973-1.018l-.138-1.65a1 1 0 0 0-1.017-.973c-.886.074-1.78.11-2.664.11S9.334 5.863 8.448 5.79a1 1 0 0 0-1.017.973l-.138 1.65a1 1 0 0 0 .973 1.018c.312.036.627.062.946.078v1.896c-.423-.026-.835-.071-1.229-.136a1 1 0 0 0-1.119.87l-.547 3.284a1 1 0 0 0 .87 1.119c1.131.238 2.306.31 3.522.188v1.376c-1.385.01-2.858-.171-4.22-.656a1 1 0 1 0-.604 1.9c1.73.613 3.598.819 5.324.793 1.726.026 3.594-.18 5.324-.793a1 1 0 1 0-.604-1.9z"></path></svg>
              <span className="text-xl font-bold text-yellow-300 text-shadow-sm">300</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
              <span className="text-xl font-bold text-cyan-300 text-shadow-sm">5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component Modal Chiến Thắng ---
const VictoryModal = ({ onRestart, onNextFloor, isLastBoss }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2H8C4.691 2 2 4.691 2 8v8c0 3.309 2.691 6 6 6h8c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm-4 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"></path><path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"></path><path d="M15 2.05A8.956 8.956 0 0 0 12 1a9 9 0 0 0-9 9c0 1.948.624 3.738 1.666 5.176l1.321-1.321A6.96 6.96 0 0 1 5 9a7 7 0 0 1 14 0c0 1.294-.361 2.49-1.025 3.518l1.321 1.321C20.376 12.738 21 10.948 21 9a8.956 8.956 0 0 0-2.05-5.95z"></path></svg>
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.287 15.584c-1.42.368-2.92.516-4.287.395V16.6c1.077.105 2.13.045 3.129-.169a1 1 0 0 0 .87-1.119l-.547-3.284a1 1 0 0 0-1.119-.87c-.394.065-.806.11-1.229.136V9.4c.319-.016.634-.042.946-.078a1 1 0 0 0 .973-1.018l-.138-1.65a1 1 0 0 0-1.017-.973c-.886.074-1.78.11-2.664.11S9.334 5.863 8.448 5.79a1 1 0 0 0-1.017.973l-.138 1.65a1 1 0 0 0 .973 1.018c.312.036.627.062.946.078v1.896c-.423-.026-.835-.071-1.229-.136a1 1 0 0 0-1.119.87l-.547 3.284a1 1 0 0 0 .87 1.119c1.131.238 2.306.31 3.522.188v1.376c-1.385.01-2.858-.171-4.22-.656a1 1 0 1 0-.604 1.9c1.73.613 3.598.819 5.324.793 1.726.026 3.594-.18 5.324-.793a1 1 0 1 0-.604-1.9z"></path></svg>
                      <span className="text-xl font-bold text-yellow-300 text-shadow-sm">300</span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
                      <span className="text-xl font-bold text-cyan-300 text-shadow-sm">5</span>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-500 mb-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M13.293 14.707a.999.999 0 0 1-1.414 0L9.464 12.293a.999.999 0 0 1 0-1.414l2.414-2.414a.999.999 0 1 1 1.414 1.414L11.586 12l2.293 2.293a.999.999 0 0 1 0 1.414zM8.5 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></svg>
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you. Rise again and reclaim your honor.</p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
  );
}

// --- Component Chính Của Game ---
interface BossBattleProps {
  onClose: () => void;
}

export default function BossBattle({ onClose }: BossBattleProps) {
  const [currentBossIndex, setCurrentBossIndex] = useState(0);
  const currentBossData = BOSS_DATA[currentBossIndex];

  const [playerStats, setPlayerStats] = useState(PLAYER_INITIAL_STATS);
  const [bossStats, setBossStats] = useState(currentBossData.stats);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  // Thêm lại state cho Rewards Modal
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
    return Math.max(1, Math.floor(baseDamage - defenderDef));
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
    if (result === 'win') {
      addLog(`${currentBossData.name} đã bị đánh bại!`, finalTurn);
      const newEnergy = Math.min(PLAYER_INITIAL_STATS.maxEnergy, playerStats.energy + 5);
      setPlayerStats(prev => ({...prev, energy: newEnergy}));
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", finalTurn);
    }
  };

  const startGame = () => {
    if (battleState === 'idle' && playerStats.energy >= 10) {
      set
