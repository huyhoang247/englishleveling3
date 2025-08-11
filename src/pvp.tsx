import React, { useState, useEffect, useRef } from 'react';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from './skill-data.tsx';
import CoinDisplay from './coin-display.tsx'; // Giả sử component này tồn tại và được import

// --- TYPE DEFINITIONS ---
type ActiveSkill = OwnedSkill & SkillBlueprint;

type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
};

type PlayerData = {
    name: string;
    avatarUrl: string;
    initialStats: CombatStats;
    equippedSkills: ActiveSkill[];
};

interface PvpArenaProps {
  onClose: () => void;
  player1: PlayerData; 
  player2: PlayerData; // Đối thủ sẽ được cung cấp
  onMatchEnd: (result: { winner: 'player1' | 'player2' | 'draw', rewards: { coins: number } }) => void;
  displayedCoins: number;
}


// --- UI HELPER COMPONENTS (Adapted from boss.tsx) ---

const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

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

const FloatingText = ({ text, id, colorClass, isPlayerSide }: { text: string, id: number, colorClass: string, isPlayerSide: boolean }) => {
  const position = isPlayerSide ? 'left-[5%]' : 'right-[5%]'
  return (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${position} ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

const StatsModal = ({ player, opponent, showOpponent, onClose }: { player: any, opponent: any, showOpponent: boolean, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
            <div className={`grid ${showOpponent ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1'} items-center gap-4`}>
                <div className="flex flex-col items-center gap-1.5">
                    <h3 className="text-xl font-bold text-blue-300 text-shadow-sm tracking-wide">YOU</h3>
                    <p className="text-lg">ATK: <span className="font-bold text-red-400">{player.atk}</span></p>
                    <p className="text-lg">DEF: <span className="font-bold text-sky-400">{player.def}</span></p>
                </div>
                {showOpponent && (
                    <>
                        <div className="h-16 w-px bg-slate-600/70"></div>
                        <div className="flex flex-col items-center gap-1.5">
                            <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide select-none">OPPONENT</h3>
                            <p className="text-lg">ATK: <span className="font-bold text-red-400">{opponent.atk}</span></p>
                            <p className="text-lg">DEF: <span className="font-bold text-sky-400">{opponent.def}</span></p>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

const SearchingModal = ({ onCancel }: { onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-8 gap-4">
            <h3 className="text-2xl font-bold text-cyan-300 text-shadow-sm tracking-wide animate-pulse">Searching...</h3>
            <p className="font-sans text-slate-400 text-sm">Finding a worthy opponent.</p>
            <button onClick={onCancel} className="mt-4 font-sans px-6 py-2 bg-red-800/70 hover:bg-red-700/80 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 border border-red-600/50 hover:border-red-500 active:scale-95 shadow-md">Cancel</button>
        </div>
    </div>
);


const MatchResultModal = ({ result, onRestart, rewards }: { result: 'player1' | 'player2' | 'draw', onRestart: () => void, rewards: { coins: number } }) => {
    const isWin = result === 'player1';
    const isDraw = result === 'draw';
    let title, titleColor, message, ModalIcon;

    if (isWin) {
        title = "VICTORY";
        titleColor = "text-yellow-300";
        message = "You have proven your strength in the arena!";
        ModalIcon = () => <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1834_C%C3%BAp%20V%C3%A0ng%20Kh%C3%B4ng%20Sao_remix_01k0kspc1wfjyamwcc0f3m8q6v.png" alt="Victory" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" />;
    } else if (isDraw) {
        title = "DRAW";
        titleColor = "text-slate-300";
        message = "A hard-fought battle with no clear winner. A worthy fight nonetheless.";
        ModalIcon = () => <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1828_Bi%E1%BB%83u%20T%C6%B0%E1%BB%A3ng%20Th%E1%BA%A5t%20B%E1%BA%A1i_remix_01k0kscbkvfngrav0b2ypp55rs.png" alt="Draw" className="w-16 h-16 object-contain mb-2 opacity-60" />;
    } else {
        title = "DEFEAT";
        titleColor = "text-slate-300";
        message = "You were overcome, but honor is found in the attempt. Rise again!";
        ModalIcon = () => <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1828_Bi%E1%BB%83u%20T%C6%B0%E1%BB%A3ng%20Th%E1%BA%A5t%20B%E1%BA%A1i_remix_01k0kscbkvfngrav0b2ypp55rs.png" alt="Defeat" className="w-16 h-16 object-contain mb-2" />;
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
            <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
                <ModalIcon />
                <h2 className={`text-4xl font-bold tracking-widest uppercase mb-3 ${titleColor}`} style={{ textShadow: `0 0 10px currentColor` }}>{title}</h2>
                <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs mb-4">{message}</p>
                
                {isWin && (
                    <div className="w-full flex flex-col items-center gap-3 mb-4">
                        <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
                        <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
                            <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                        </div>
                    </div>
                )}

                <hr className="w-full border-t border-slate-700/50 my-3" />
                <button onClick={onRestart} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Find New Match</button>
            </div>
        </div>
    );
}


// --- MAIN PVP ARENA COMPONENT ---
export default function PvpArena({ 
  onClose, 
  player1, 
  player2,
  onMatchEnd,
  displayedCoins
}: PvpArenaProps) {
  
  // --- STATE MANAGEMENT ---
  const [matchState, setMatchState] = useState<'idle' | 'searching' | 'found' | 'fighting' | 'finished'>('idle');
  
  const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
  const [player2Stats, setPlayer2Stats] = useState<CombatStats>(player2.initialStats);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
  const [gameOver, setGameOver] = useState<null | 'player1' | 'player2' | 'draw'>(null);
  const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string, isPlayerSide: boolean }[]>([]);
  const [showStats, setShowStats] = useState(false);

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // --- LOGIC HELPERS ---
  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
  const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
    const id = Date.now() + Math.random();
    setDamages(prev => [...prev, { id, text, colorClass, isPlayerSide: target === 'player1' }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  };
  
  // --- CORE BATTLE LOGIC (Similar to original PvP) ---
  const executeTurn = (attackerData: PlayerData, defenderData: PlayerData, attackerStats: CombatStats, defenderStats: CombatStats, turn: number) => {
    const turnLogs: string[] = [];
    const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
    const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
    const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
    const calculateDamage = (atk: number, def: number) => Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
    
    let newAttackerStats = { ...attackerStats };
    let newDefenderStats = { ...defenderStats };
    let winner: 'attacker' | 'defender' | null = null;
    let turnEvents = { attackerHeal: 0, attackerReflectDmg: 0, defenderDmg: 0 };
    
    // Attack phase
    let atkMods = { boost: 1, armorPen: 0 };
    attackerData.equippedSkills.forEach(skill => {
        if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
            const effect = getSkillEffect(skill);
            log(`<span class="font-bold text-cyan-300">${attackerData.name}</span> kích hoạt <span class="${getRarityTextColor(skill.rarity)}">[${skill.name}]</span>!`);
            if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
            if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;
        }
    });
    
    const attackDmg = calculateDamage(newAttackerStats.atk * atkMods.boost, Math.max(0, newDefenderStats.def * (1 - atkMods.armorPen)));
    turnEvents.defenderDmg = attackDmg;
    log(`<span class="font-bold text-cyan-300">${attackerData.name}</span> tấn công, gây <b class="text-red-400">${attackDmg}</b> sát thương.`);
    newDefenderStats.hp -= attackDmg;

    // Lifesteal phase
    attackerData.equippedSkills.forEach(skill => {
        if (skill.id === 'life_steal' && checkActivation(skill.rarity)) {
            const healed = Math.ceil(attackDmg * (getSkillEffect(skill) / 100));
            const actualHeal = Math.min(healed, newAttackerStats.maxHp - newAttackerStats.hp);
            if (actualHeal > 0) {
                turnEvents.attackerHeal = actualHeal;
                log(`<span class="font-bold text-cyan-300">${attackerData.name}</span> hút <b class="text-green-400">${actualHeal}</b> Máu.`);
                newAttackerStats.hp += actualHeal;
            }
        }
    });

    if (newDefenderStats.hp <= 0) {
        newDefenderStats.hp = 0; winner = 'attacker';
        log(`<span class="font-bold text-orange-300">${defenderData.name}</span> đã bị đánh bại!`);
        return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents };
    }
    
    // Thorns phase
    let totalReflectDmg = 0;
    defenderData.equippedSkills.forEach(skill => {
        if (skill.id === 'thorns' && checkActivation(skill.rarity)) {
            const reflectDmg = Math.ceil(attackDmg * (getSkillEffect(skill) / 100));
            totalReflectDmg += reflectDmg;
            log(`<span class="font-bold text-orange-300">${defenderData.name}</span> phản lại <b class="text-orange-400">${reflectDmg}</b> sát thương.`);
        }
    });
    if (totalReflectDmg > 0) {
      newAttackerStats.hp -= totalReflectDmg;
      turnEvents.attackerReflectDmg = totalReflectDmg;
    }

    if (newAttackerStats.hp <= 0) {
        newAttackerStats.hp = 0; winner = 'defender';
        log(`<span class="font-bold text-cyan-300">${attackerData.name}</span> đã gục ngã vì sát thương phản lại!`);
    }

    return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents };
  };

  // --- BATTLE CONTROL FUNCTIONS ---
  
  const runBattleTurn = () => {
    const nextTurn = turnCounter + 1;
    
    const isP1Turn = currentPlayerTurn === 'player1';
    const [attackerData, defenderData] = isP1Turn ? [player1, player2] : [player2, player1];
    const [attackerStats, defenderStats] = isP1Turn ? [player1Stats, player2Stats] : [player2Stats, player1Stats];
    const [attackerId, defenderId] = isP1Turn ? ['player1', 'player2'] : ['player2', 'player1'];

    const { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents } = executeTurn(attackerData, defenderData, attackerStats, defenderStats, nextTurn);

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

  const endMatch = (result: 'player1' | 'player2' | 'draw') => {
    if (gameOver) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setGameOver(result);
    setMatchState('finished');
    const rewards = { coins: result === 'player1' ? 100 : 10 }; // Example rewards
    onMatchEnd({ winner: result, rewards });
  };
  
  // --- MATCHMAKING & STATE TRANSITION ---
  const handleSearch = () => {
    setMatchState('searching');
    searchTimeoutRef.current = setTimeout(() => {
        setMatchState('found');
        addLog(`[Lượt 0] Đối thủ được tìm thấy: ${player2.name}! Hãy chuẩn bị!`);
    }, 2500); // Simulate 2.5 second search
  };
  
  const handleCancelSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setMatchState('idle');
  };

  const handleFight = () => {
    setMatchState('fighting');
  };
  
  const resetAndReturnToSearch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setCombatLog([]);
    setTurnCounter(0);
    setCurrentPlayerTurn('player1');
    setGameOver(null);
    setDamages([]);
    setPlayer1Stats(player1.initialStats);
    setPlayer2Stats(player2.initialStats);
    setMatchState('idle');
  };

  // --- REACT HOOKS ---
  useEffect(() => {
    if (matchState === 'fighting' && !gameOver) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1200);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [matchState, gameOver, turnCounter]); // Re-run when turn changes

  // --- RENDER ---
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } } 
        .animate-pulse-log { animation: pulse-fast 1.5s infinite; }
      `}</style>

      {showStats && <StatsModal player={player1Stats} opponent={player2Stats} showOpponent={matchState !== 'idle'} onClose={() => setShowStats(false)} />}
      {matchState === 'searching' && <SearchingModal onCancel={handleCancelSearch} />}
      
      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] via-[#3d1a38] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" title="Go Home">
                      <HomeIcon className="w-5 h-5 text-slate-300" />
                      <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                    <h3 className="text-xl font-bold text-red-400 text-shadow">PVP ARENA</h3>
                </div>
                <div className="flex items-center font-sans">
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                </div>
            </div>
        </header>

        <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
            {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} isPlayerSide={d.isPlayerSide} />))}

            {matchState !== 'idle' && matchState !== 'searching' && (
                <div className="w-full max-w-2xl mx-auto mb-4">
                     <HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                </div>
            )}

            <div className="w-full flex justify-center items-center gap-3 mb-4">
                <button onClick={() => setShowStats(true)} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">View Stats</button>
                {matchState === 'fighting' && !gameOver && (<button onClick={() => endMatch(currentPlayerTurn === 'player1' ? 'player2' : 'player1')} className="font-sans px-4 py-1.5 bg-red-800/70 backdrop-blur-sm hover:bg-red-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-red-600/50 hover:border-red-500 active:scale-95 shadow-md text-red-200">Forfeit</button>)}
            </div>
            
            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="relative group flex justify-center">
                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">
                        {matchState === 'idle' || matchState === 'searching' ? 'OPPONENT' : player2.name.toUpperCase()}
                    </h2>
                  </div>
                  
                  <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center">
                    {matchState === 'idle' || matchState === 'searching' ? (
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-28_10-53-06-691.png" alt="Unknown Opponent" className="w-full h-full object-contain opacity-50" />
                    ) : (
                        <img src={player2.avatarUrl} alt={player2.name} className="w-full h-full object-contain rounded-lg" />
                    )}
                  </div>
                  {(matchState !== 'idle' && matchState !== 'searching') && (
                    <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                  )}
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {matchState === 'idle' && (
                    <button onClick={handleSearch} className="btn-shine relative overflow-hidden px-10 py-3 bg-slate-900/80 rounded-lg text-teal-300 border border-teal-500/40 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)] active:scale-95">
                        <span className="font-bold text-lg tracking-widest uppercase">Search</span>
                    </button>
                )}
                {matchState === 'found' && (
                    <button onClick={handleFight} className="btn-shine relative overflow-hidden px-10 py-3 bg-red-800/80 rounded-lg text-red-100 border border-red-500/40 transition-all duration-300 hover:text-white hover:border-red-400 hover:shadow-[0_0_20px_theme(colors.red.500/0.6)] active:scale-95">
                         <span className="font-bold text-lg tracking-widest uppercase">Fight</span>
                    </button>
                )}
                {matchState === 'fighting' && (
                  <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (<p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse-log' : 'text-slate-300'}`} dangerouslySetInnerHTML={{__html: entry}}></p>))}
                  </div>
                )}
            </div>
            
            {gameOver && (<MatchResultModal result={gameOver} onRestart={resetAndReturnToSearch} rewards={{coins: gameOver === 'player1' ? 100 : 10}}/>)}
        </main>
      </div>
    </>
  );
}
