// --- START OF FILE pvp.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from './skill-data.tsx';
// --- NEW ---
import CoinDisplay from './coin-display'; // Import component hiển thị vàng
import { updateUserCoins } from './gameDataService.ts'; // Import hàm cập nhật vàng

// --- TYPE DEFINITIONS ---
type ActiveSkill = OwnedSkill & SkillBlueprint;

type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
};

// Data structure for a player entering the arena
// --- MODIFIED ---: Thêm coins để quản lý việc cược
type PlayerData = {
    name: string;
    avatarUrl: string; // URL to player's avatar image
    coins: number; // --- NEW ---: Số vàng hiện tại của người chơi
    initialStats: CombatStats;
    equippedSkills: ActiveSkill[];
};

// --- MODIFIED ---: Thêm userId và onCoinChange
interface PvpArenaProps {
  onClose: () => void;
  userId: string; // --- NEW ---: ID người dùng để cập nhật dữ liệu
  onCoinChange: (newAmount: number) => void; // --- NEW ---: Callback để cập nhật vàng ở component cha
  // Player 1 is assumed to be the local user
  player1: PlayerData; 
  // Player 2 is the opponent
  player2: PlayerData; 
  onMatchEnd: (result: { winner: 'player1' | 'player2' | 'draw', loser: 'player1' | 'player2' | null }) => void;
}


// --- UI HELPER COMPONENTS (Adapted from boss.tsx) ---

// --- NEW ---: SVG Icon cho bể vàng
const GoldPotIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.25 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75zM9.75 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75zM11.25 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75zM12.75 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75zM14.25 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75zM15.75 7.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M5.25 2.25a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H5.25zM4.5 6.75a.75.75 0 00-.75.75v10.5c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75H4.5zM3 7.5a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V7.5z" clipRule="evenodd" />
  </svg>
);


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

const FloatingText = ({ text, id, positionClass, colorClass }: { text: string, id: number, positionClass: string, colorClass: string }) => {
  return (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${positionClass} ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

const PlayerStatsModal = ({ player, onClose }: { player: CombatStats, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-72 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-blue-300 text-shadow-sm tracking-wide mb-4">YOUR STATS</h3>
            <div className="flex flex-col items-start gap-2 text-lg">
                <p>HP: <span className="font-bold text-green-400">{player.maxHp}</span></p>
                <p>ATK: <span className="font-bold text-red-400">{player.atk}</span></p>
                <p>DEF: <span className="font-bold text-sky-400">{player.def}</span></p>
            </div>
        </div>
      </div>
    </div>
  )
}

const SearchingModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="flex flex-col items-center justify-center text-center gap-4 text-white font-lilita">
            <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"></div>
            <p className="text-2xl tracking-wider">SEARCHING...</p>
        </div>
    </div>
);

const MatchResultModal = ({ result, player1Name, player2Name, onSearchAgain }: { result: 'player1' | 'player2' | 'draw', player1Name: string, player2Name: string, onSearchAgain: () => void }) => {
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
          <button onClick={onSearchAgain} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Tìm Trận Mới</button>
      </div>
    </div>
  );
}

// --- MAIN PVP ARENA COMPONENT ---
export default function PvpArena({ 
  onClose, 
  userId, // --- NEW ---
  onCoinChange, // --- NEW ---
  player1, 
  player2,
  onMatchEnd
}: PvpArenaProps) {
  
  // --- STATE MANAGEMENT ---
  const [battlePhase, setBattlePhase] = useState<'idle' | 'searching' | 'fighting' | 'finished'>('idle');
  const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
  const [player2Stats, setPlayer2Stats] = useState<CombatStats>(player2.initialStats);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
  const [matchResult, setMatchResult] = useState<null | 'player1' | 'player2' | 'draw'>(null);
  const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // --- NEW STATES FOR WAGER POOL ---
  const [wagerAmount, setWagerAmount] = useState('100');
  const [goldPool, setGoldPool] = useState(0);
  const [player1Coins, setPlayer1Coins] = useState(player1.coins);
  const [error, setError] = useState('');

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC HELPERS ---
  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
  const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
    const id = Date.now() + Math.random();
    // Adjusted positions to center around the combatants
    const positionClass = target === 'player1' ? 'left-[25%]' : 'right-[25%]'; 
    setDamages(prev => [...prev, { id, text, positionClass, colorClass }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  };
  
  // --- CORE BATTLE LOGIC FUNCTION (Unchanged) ---
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
    
    let atkMods = { boost: 1, armorPen: 0 };
    attacker.data.equippedSkills.forEach(skill => {
        if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
            const effect = getSkillEffect(skill);
            log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> kích hoạt <span class="${getRarityTextColor(skill.rarity)}">[${skill.name}]</span>!`);
            if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
            if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;
        }
    });
    
    const attackDmg = calculateDamage(newAttackerStats.atk * atkMods.boost, Math.max(0, newDefenderStats.def * (1 - atkMods.armorPen)));
    turnEvents.defenderDmg = attackDmg;
    log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> tấn công, gây <b class="text-red-400">${attackDmg}</b> sát thương lên <span class="font-bold text-orange-300">${defender.data.name}</span>.`);
    newDefenderStats.hp -= attackDmg;
    
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

    if (turnEvents.defenderDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.defenderDmg)}`, 'text-red-500', defenderId);
    if (turnEvents.attackerHeal > 0) showFloatingText(`+${formatDamageText(turnEvents.attackerHeal)}`, 'text-green-400', attackerId);
    if (turnEvents.attackerReflectDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.attackerReflectDmg)}`, 'text-orange-400', attackerId);

    if(isP1Turn) {
      setPlayer1Stats(newAttackerStats); setPlayer2Stats(newDefenderStats);
    } else {
      setPlayer2Stats(newAttackerStats); setPlayer1Stats(newDefenderStats);
    }

    setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
    setTurnCounter(nextTurn);
    setCurrentPlayerTurn(isP1Turn ? 'player2' : 'player1');

    if (winner) {
      const finalWinner = winner === 'attacker' ? attackerId : defenderId;
      endMatch(finalWinner);
    } else if (nextTurn >= 50) {
      endMatch('draw');
    }
  };
  
  const skipMatch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    battleIntervalRef.current = setInterval(runBattleTurn, 100);
  };

  // --- MODIFIED ---: Updated to handle wager payout
  const endMatch = async (result: 'player1' | 'player2' | 'draw') => {
    if (matchResult) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    
    const wager = parseInt(wagerAmount, 10) || 0;
    
    if (result === 'player1') {
        addLog(`<b class="text-yellow-300">BẠN THẮNG!</b> Nhận được <b class="text-yellow-400">${goldPool}</b> vàng từ bể cược.`);
        const newTotalCoins = player1Coins + goldPool;
        setPlayer1Coins(newTotalCoins);
        onCoinChange(newTotalCoins);
        await updateUserCoins(userId, goldPool);
    } else if (result === 'player2') {
        addLog(`<b class="text-red-400">BẠN THUA!</b> Mất <b class="text-yellow-400">${wager}</b> vàng đã cược.`);
        // Vàng đã bị trừ trước đó, không cần làm gì thêm
    } else if (result === 'draw') {
        addLog(`<b class="text-slate-400">HÒA!</b> Nhận lại <b class="text-yellow-400">${wager}</b> vàng đã cược.`);
        const newTotalCoins = player1Coins + wager;
        setPlayer1Coins(newTotalCoins);
        onCoinChange(newTotalCoins);
        await updateUserCoins(userId, wager); // Hoàn lại tiền cược
    }

    setMatchResult(result);
    setBattlePhase('finished');
    const matchEndPayload = {
      winner: result === 'draw' ? 'draw' : result,
      loser: result === 'draw' ? null : (result === 'player1' ? 'player2' : 'player1')
    };
    onMatchEnd(matchEndPayload);
  };
  
  // --- NEW ---: Handles wager validation and starts the search
  const handleWagerAndSearch = async () => {
    if (battlePhase !== 'idle') return;
    
    const wager = parseInt(wagerAmount, 10);
    
    if (isNaN(wager) || wager <= 0) {
      setError('Số vàng cược không hợp lệ.');
      return;
    }
    if (wager > player1Coins) {
      setError('Bạn không đủ vàng để cược.');
      return;
    }
    
    setError('');

    // Deduct coins from player
    const newPlayerCoins = player1Coins - wager;
    setPlayer1Coins(newPlayerCoins);
    onCoinChange(newPlayerCoins);
    
    try {
        await updateUserCoins(userId, -wager);
        // Set up the gold pool (player's wager + opponent's matched wager)
        setGoldPool(wager * 2);
        
        addLog(`[Hệ thống] Bạn đã cược <b class="text-yellow-400">${wager}</b> vàng. Đang tìm đối thủ...`);
        setBattlePhase('searching');
    } catch (e) {
        console.error("Failed to update user coins for wager:", e);
        setError("Lỗi khi đặt cược. Vui lòng thử lại.");
        // Revert local state if backend call fails
        setPlayer1Coins(player1Coins);
        onCoinChange(player1Coins);
    }
  };
  
  const resetForNewSearch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    setCombatLog([]);
    setTurnCounter(0);
    setCurrentPlayerTurn('player1');
    setMatchResult(null);
    setBattlePhase('idle');
    setDamages([]);
    setPlayer1Stats(player1.initialStats);
    setPlayer2Stats(player2.initialStats);

    // --- NEW ---: Reset wager state
    setGoldPool(0);
    setWagerAmount('100');
    setError('');
  };

  // --- REACT HOOKS ---
  useEffect(() => {
    if (battlePhase === 'searching') {
      searchTimeoutRef.current = setTimeout(() => {
        // Match "found"
        addLog(`[Lượt 0] Đã tìm thấy đối thủ: ${player2.name}. Trận đấu bắt đầu!`);
        setBattlePhase('fighting');
      }, 2500); // Simulate 2.5 second search time
    } else if (battlePhase === 'fighting' && !matchResult) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1500);
    }
    
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [battlePhase, matchResult, turnCounter]); // Re-run effect based on phase changes

  // --- RENDER ---
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } } 
        .animate-pulse-turn { animation: pulse-fast 1.5s infinite; }
      `}</style>
      
      {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}
      {showStatsModal && <PlayerStatsModal player={player1.initialStats} onClose={() => setShowStatsModal(false)} />}
      {battlePhase === 'searching' && <SearchingModal />}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
                  aria-label="Go Home"
                  title="Go Home"
                >
                  <HomeIcon className="w-5 h-5 text-slate-300" />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
                <h1 className="text-2xl font-bold text-yellow-300 text-shadow tracking-widest">PVP</h1>
                {/* --- MODIFIED ---: Added CoinDisplay here */}
                <div className="w-fit flex justify-end">
                    <CoinDisplay displayedCoins={player1Coins} isStatsFullscreen={false} />
                </div>
            </div>
        </header>

        <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
            {(battlePhase === 'idle' || battlePhase === 'fighting' || battlePhase === 'finished') && (
                <div className="w-full max-w-2xl mx-auto mb-4 flex flex-col items-center gap-3">
                    <div className="w-1/2">
                        <HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                    </div>
                    {battlePhase === 'idle' && (
                        <button onClick={() => setShowStatsModal(true)} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">View Stats</button>
                    )}
                </div>
            )}

            <div className="w-full flex justify-center items-center gap-3 mb-4">
                {battlePhase === 'fighting' && !matchResult && (<button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300">Skip Battle</button>)}
            </div>

            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                {/* --- MODIFIED ---: Replaced idle display with Wager Pool UI */}
                {battlePhase === 'idle' && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm bg-slate-900/50 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                      <h2 className="text-3xl text-yellow-300 tracking-wider text-shadow">WAGER POOL</h2>
                      <GoldPotIcon className="w-24 h-24 text-yellow-400/80" />
                      
                      <div className="w-full flex flex-col items-center gap-2">
                          <label htmlFor="wager-input" className="font-sans text-sm text-slate-400">Nhập số vàng bạn muốn cược:</label>
                          <input 
                            id="wager-input"
                            type="number"
                            value={wagerAmount}
                            onChange={(e) => setWagerAmount(e.target.value)}
                            className="w-full text-center bg-slate-800/70 border border-slate-600 rounded-lg p-2 text-xl font-bold text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                          />
                          {error && <p className="text-red-400 text-sm font-sans mt-1">{error}</p>}
                      </div>
                      
                      <button onClick={handleWagerAndSearch} className="btn-shine relative overflow-hidden w-full px-10 py-3 bg-red-800/80 rounded-lg text-red-100 border border-red-500/40 transition-all duration-300 hover:text-white hover:border-red-400 hover:shadow-[0_0_20px_theme(colors.red.500/0.6)] active:scale-95">
                          <span className="font-bold text-xl tracking-widest uppercase">Cược & Tìm Trận</span>
                      </button>
                    </div>
                )}
                {(battlePhase === 'fighting' || battlePhase === 'finished') && (
                  <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 ${currentPlayerTurn === 'player2' && battlePhase === 'fighting' ? 'animate-pulse-turn' : ''}`}>
                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">{player2.name}</h2>
                    <div className="w-40 h-40 md:w-56 md:h-56">
                      <img src={player2.avatarUrl || 'https://placehold.co/224x224/1e293b/a78bfa?text=?'} alt={player2.name} className="w-full h-full object-cover rounded-lg border-2 border-slate-600" />
                    </div>
                    <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                  </div>
                )}
            </div>
            
            {(battlePhase === 'fighting' || battlePhase === 'finished') && (
              <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                  <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.length > 0 && goldPool > 0 && (
                          <div className="text-center mb-2 font-bold text-yellow-300 border-t border-b border-yellow-600/30 py-1">
                            Bể cược: {goldPool.toLocaleString()} Vàng
                          </div>
                      )}
                      {combatLog.map((entry, index) => (
                        <p key={index} 
                           className={`mb-1 transition-opacity duration-500 ${index === 0 ? 'opacity-100 font-semibold' : 'opacity-70'}`} 
                           dangerouslySetInnerHTML={{__html: entry}}></p>
                      ))}
                  </div>
              </div>
            )}

            {battlePhase === 'finished' && matchResult && (
                <MatchResultModal result={matchResult} player1Name={player1.name} player2Name={player2.name} onSearchAgain={resetForNewSearch} />
            )}
        </main>
      </div>
    </>
  );
}
// --- END OF FILE pvp.tsx ---
