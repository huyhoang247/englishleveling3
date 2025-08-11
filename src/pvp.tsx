// --- START OF FILE pvp.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from './skill-data.tsx';

// --- TYPE DEFINITIONS ---
type ActiveSkill = OwnedSkill & SkillBlueprint;

type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
};

// Data structure for a player entering the arena
type PlayerData = {
    name: string;
    avatarUrl: string; // URL to player's avatar image
    initialStats: CombatStats;
    equippedSkills: ActiveSkill[];
};

interface PvpArenaProps {
  onClose: () => void;
  // Player 1 is assumed to be the local user
  player1: PlayerData; 
  // Player 2 is the opponent
  player2: PlayerData; 
  onMatchEnd: (result: { winner: 'player1' | 'player2' | 'draw', loser: 'player1' | 'player2' | null }) => void;
}


// --- UI HELPER COMPONENTS (Adapted from boss.tsx) ---

const HealthBar = ({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`} style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` }}></div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
};

const FloatingText = ({ text, id, positionClass, colorClass }: { text: string, id: number, positionClass: string, colorClass: string }) => {
  return (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${positionClass} ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

const MatchResultModal = ({ result, player1Name, player2Name, onRestart }: { result: 'player1' | 'player2' | 'draw', player1Name: string, player2Name: string, onRestart: () => void }) => {
  const isWinner = result === 'player1';
  const isDraw = result === 'draw';
  
  let title, bgColor, borderColor, textColor, message;

  if (isDraw) {
    title = "HÒA";
    bgColor = "bg-slate-900/90";
    borderColor = "border-slate-500/30";
    textColor = "text-slate-300";
    message = `Cả hai chiến binh đã chiến đấu ngang tài ngang sức.`;
  } else if (isWinner) {
    title = "VICTORY";
    bgColor = "bg-slate-900/90";
    borderColor = "border-yellow-500/30";
    textColor = "text-yellow-300";
    message = `Bạn đã đánh bại ${player2Name} và khẳng định sức mạnh của mình!`;
  } else {
    title = "DEFEAT";
    bgColor = "bg-slate-900/90";
    borderColor = "border-red-500/30";
    textColor = "text-red-400";
    message = `Bạn đã gục ngã trước ${player2Name}. Hãy luyện tập và trở lại mạnh mẽ hơn.`;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className={`relative w-80 ${bgColor} border ${borderColor} rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center`}>
          <h2 className={`text-5xl font-bold tracking-widest uppercase mb-4 ${textColor}`} style={{ textShadow: `0 0 10px currentColor` }}>{title}</h2>
          <p className="font-sans text-slate-300 text-sm leading-relaxed max-w-xs">{message}</p>
          <hr className={`w-full border-t ${borderColor} my-5`} />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Đấu Lại</button>
      </div>
    </div>
  );
}

// --- MAIN PVP ARENA COMPONENT ---
export default function PvpArena({ 
  onClose, 
  player1, 
  player2,
  onMatchEnd
}: PvpArenaProps) {
  
  // --- STATE MANAGEMENT ---
  const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
  const [player2Stats, setPlayer2Stats] = useState<CombatStats>(player2.initialStats);
  const [combatLog, setCombatLog] = useState<string[]>(['[Lượt 0] Trận đấu sắp bắt đầu. Cả hai đối thủ đã vào vị trí!']);
  const [turnCounter, setTurnCounter] = useState(0);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
  const [gameOver, setGameOver] = useState<null | 'player1' | 'player2' | 'draw'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);
  
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC HELPERS ---
  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
  const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
    const id = Date.now() + Math.random();
    const positionClass = target === 'player1' ? 'left-[20%]' : 'right-[20%]';
    setDamages(prev => [...prev, { id, text, positionClass, colorClass }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  };
  
  // --- CORE BATTLE LOGIC FUNCTION ---
  const executeTurn = (
    attacker: { data: PlayerData, stats: CombatStats }, 
    defender: { data: PlayerData, stats: CombatStats }, 
    turn: number
  ) => {
    const turnLogs: string[] = [];
    const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
    const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
    const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
    const calculateDamage = (atk: number, def: number) => Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
    
    let newAttackerStats = { ...attacker.stats };
    let newDefenderStats = { ...defender.stats };
    let winner: 'attacker' | 'defender' | null = null;
    let turnEvents = { attackerHeal: 0, attackerReflectDmg: 0, defenderDmg: 0 };
    
    // 1. Attacker's Pre-Attack Phase (Skill Activations)
    let atkMods = { boost: 1, armorPen: 0 };
    attacker.data.equippedSkills.forEach(skill => {
        if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
            const effect = getSkillEffect(skill);
            log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> kích hoạt <span class="${getRarityTextColor(skill.rarity)}">[${skill.name}]</span>!`);
            if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
            if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;
        }
    });
    
    // 2. Attacker's Attack
    const attackDmg = calculateDamage(newAttackerStats.atk * atkMods.boost, Math.max(0, newDefenderStats.def * (1 - atkMods.armorPen)));
    turnEvents.defenderDmg = attackDmg;
    log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> tấn công, gây <b class="text-red-400">${attackDmg}</b> sát thương lên <span class="font-bold text-orange-300">${defender.data.name}</span>.`);
    newDefenderStats.hp -= attackDmg;
    
    // 3. Attacker's Post-Attack Phase (Lifesteal)
    attacker.data.equippedSkills.forEach(skill => {
        if (skill.id === 'life_steal' && checkActivation(skill.rarity)) {
            const healed = Math.ceil(attackDmg * (getSkillEffect(skill) / 100));
            const actualHeal = Math.min(healed, newAttackerStats.maxHp - newAttackerStats.hp);
            if (actualHeal > 0) {
                turnEvents.attackerHeal = actualHeal;
                log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> hút <b class="text-green-400">${actualHeal}</b> Máu nhờ <span class="text-green-400">[${skill.name}]</span>.`);
                newAttackerStats.hp += actualHeal;
            }
        }
    });

    if (newDefenderStats.hp <= 0) {
        newDefenderStats.hp = 0; winner = 'attacker';
        log(`<span class="font-bold text-orange-300">${defender.data.name}</span> đã bị đánh bại!`);
        return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents };
    }
    
    // 4. Defender's Defensive Phase (Thorns)
    let totalReflectDmg = 0;
    defender.data.equippedSkills.forEach(skill => {
        if (skill.id === 'thorns' && checkActivation(skill.rarity)) {
            const reflectDmg = Math.ceil(attackDmg * (getSkillEffect(skill) / 100));
            totalReflectDmg += reflectDmg;
            log(`<span class="font-bold text-orange-300">${defender.data.name}</span> phản lại <b class="text-orange-400">${reflectDmg}</b> sát thương nhờ <span class="text-orange-400">[${skill.name}]</span>.`);
        }
    });
    if (totalReflectDmg > 0) {
      newAttackerStats.hp -= totalReflectDmg;
      turnEvents.attackerReflectDmg = totalReflectDmg;
    }

    if (newAttackerStats.hp <= 0) {
        newAttackerStats.hp = 0; winner = 'defender';
        log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> đã gục ngã vì sát thương phản lại!`);
    }

    return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents };
  };

  // --- BATTLE CONTROL FUNCTIONS ---
  
  const runBattleTurn = () => {
    const nextTurn = turnCounter + 1;
    
    const isP1Turn = currentPlayerTurn === 'player1';
    const attacker = { data: isP1Turn ? player1 : player2, stats: isP1Turn ? player1Stats : player2Stats };
    const defender = { data: isP1Turn ? player2 : player1, stats: isP1Turn ? player2Stats : player1Stats };
    const attackerId = isP1Turn ? 'player1' : 'player2';
    const defenderId = isP1Turn ? 'player2' : 'player1';

    const { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents } = executeTurn(attacker, defender, nextTurn);

    // Animate visuals
    if (turnEvents.defenderDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.defenderDmg)}`, 'text-red-500', defenderId);
    if (turnEvents.attackerHeal > 0) showFloatingText(`+${formatDamageText(turnEvents.attackerHeal)}`, 'text-green-400', attackerId);
    if (turnEvents.attackerReflectDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.attackerReflectDmg)}`, 'text-orange-400', attackerId);

    // Update states
    if(isP1Turn) {
      setPlayer1Stats(newAttackerStats);
      setPlayer2Stats(newDefenderStats);
    } else {
      setPlayer2Stats(newAttackerStats);
      setPlayer1Stats(newDefenderStats);
    }

    setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
    setTurnCounter(nextTurn);
    setCurrentPlayerTurn(isP1Turn ? 'player2' : 'player1');

    if (winner) {
      const finalWinner = winner === 'attacker' ? attackerId : defenderId;
      endMatch(finalWinner);
    } else if (nextTurn >= 50) { // Draw condition
      endMatch('draw');
    }
  };
  
  const skipMatch = () => {
    // This is a simplified skip. For a full instant result, a while loop would be used.
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    battleIntervalRef.current = setInterval(runBattleTurn, 100); // Speed up the battle
  };

  const endMatch = (result: 'player1' | 'player2' | 'draw') => {
    if (gameOver) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setGameOver(result);
    setBattleState('finished');
    const matchResult = {
      winner: result === 'draw' ? 'draw' : result,
      loser: result === 'draw' ? null : (result === 'player1' ? 'player2' : 'player1')
    };
    onMatchEnd(matchResult);
  };

  const startMatch = () => {
    if (battleState !== 'idle') return;
    setBattleState('fighting');
  };
  
  const resetForRematch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setCombatLog(['[Lượt 0] Tái đấu! Các chiến binh đã sẵn sàng!']);
    setTurnCounter(0);
    setCurrentPlayerTurn('player1'); // P1 always starts
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
    setPlayer1Stats(player1.initialStats);
    setPlayer2Stats(player2.initialStats);
  };

  // --- REACT HOOKS ---
  useEffect(() => {
    if (battleState === 'fighting' && !gameOver) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1500);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, gameOver, turnCounter]); // Re-run when turn changes

  // --- RENDER ---
  const PlayerCard = ({ player, stats, side }: { player: PlayerData, stats: CombatStats, side: 'left' | 'right' }) => (
    <div className={`flex flex-col items-center gap-3 w-[45%] md:w-2/5 animate-fade-in ${side === 'left' ? 'items-start' : 'items-end'}`}>
      <div className={`flex items-center gap-4 ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
          <img 
            src={player.avatarUrl || 'https://placehold.co/96x96/1e293b/a78bfa?text=P'} 
            alt={player.name} 
            className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-slate-700 shadow-lg bg-slate-800"
          />
          <h2 className={`text-xl md:text-2xl font-bold text-shadow tracking-wide ${side === 'left' ? 'text-blue-300' : 'text-red-400'}`}>{player.name}</h2>
      </div>
      <div className="w-full">
        <HealthBar current={stats.hp} max={stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } } 
        .animate-pulse-turn { animation: pulse-fast 1.5s infinite; }
      `}</style>
      
      {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}

      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 flex flex-col items-center p-4 font-lilita text-white overflow-hidden">
        <header className="w-full max-w-4xl mx-auto flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-yellow-300 text-shadow tracking-widest">ARENA</h1>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans text-xl"
              aria-label="Đóng"
            >
              ✕
            </button>
        </header>

        <main className="w-full h-full flex flex-col justify-start items-center">
            <div className={`w-full max-w-5xl mx-auto flex justify-between items-start gap-4 mb-8
              ${battleState === 'fighting' && !gameOver ? 
                 (currentPlayerTurn === 'player1' ? '[&>*:first-child]:animate-pulse-turn' : '[&>*:last-child]:animate-pulse-turn') 
                 : ''}`
            }>
                <PlayerCard player={player1} stats={player1Stats} side="left" />
                <div className="text-5xl font-black text-slate-500 self-center pt-8 select-none">VS</div>
                <PlayerCard player={player2} stats={player2Stats} side="right" />
            </div>
            
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {battleState === 'idle' && (
                  <button onClick={startMatch} className="btn-shine relative overflow-hidden px-10 py-3 bg-red-800/80 rounded-lg text-red-100 border border-red-500/40 transition-all duration-300 hover:text-white hover:border-red-400 hover:shadow-[0_0_20px_theme(colors.red.500/0.6)] active:scale-95">
                      <span className="font-bold text-xl tracking-widest uppercase">Bắt Đầu Trận Đấu</span>
                  </button>
                )}
                {battleState === 'fighting' && !gameOver && (
                  <button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300">
                    Tua Nhanh
                  </button>
                )}

                {battleState !== 'idle' && (
                  <div className="mt-4 h-48 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (
                        <p key={index} 
                           className={`mb-1 transition-opacity duration-500 ${index === 0 ? 'opacity-100 font-semibold' : 'opacity-70'}`} 
                           dangerouslySetInnerHTML={{__html: entry}}></p>
                      ))}
                  </div>
                )}
            </div>

            {gameOver && (<MatchResultModal result={gameOver} player1Name={player1.name} player2Name={player2.name} onRestart={resetForRematch} />)}
        </main>
      </div>
    </>
  );
}

// --- END OF FILE pvp.tsx ---
