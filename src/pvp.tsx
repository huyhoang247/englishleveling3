// --- START OF FILE PvpPortal.tsx (All-In-One, No Shortening, Skip Battle Fix) ---

import React, { useState, useEffect, useRef } from 'react';

// ===================================================================================
// --- GLOBAL STYLES ---
// ===================================================================================
const PvpStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        .font-sans { font-family: sans-serif; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; }
        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; }
        .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; }
        .btn-shine:hover:not(:disabled)::before { left: 125%; }
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } } 
        .animate-pulse-turn { animation: pulse-fast 1.5s infinite; }
    `}</style>
);


// ===================================================================================
// --- TYPE DEFINITIONS & SHARED LOGIC ---
// ===================================================================================

// Giả lập các type từ file skill-data.tsx
type OwnedSkill = { id: string; level: number; };
type SkillBlueprint = { name: string; rarity: string; baseEffectValue?: number; effectValuePerLevel?: number; };

export type ActiveSkill = OwnedSkill & SkillBlueprint;

export type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
};

export type PlayerData = {
    userId: string;
    name: string;
    avatarUrl: string;
    coins: number; 
    initialStats: CombatStats;
    equippedSkills: ActiveSkill[];
    rankInfo: {
        rankName: string;
        rankPoints: number;
        rankMaxPoints: number;
    };
    invasionLog: {
        attacker: string;
        result: 'win' | 'loss';
        goldStolen: number;
        timestamp: string;
    }[];
};

export type OpponentData = Omit<PlayerData, 'userId' | 'rankInfo' | 'invasionLog'>;

// --- SHARED HELPER FUNCTIONS ---
const getActivationChance = (rarity: string) => ({ Common: 60, Uncommon: 45, Rare: 30, Epic: 20, Legendary: 10 }[rarity] || 0);
const getRarityTextColor = (rarity: string) => ({ Common: 'text-gray-300', Uncommon: 'text-green-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-yellow-400' }[rarity] || 'text-white');

// --- SHARED COMBAT LOGIC ---
export const executeTurn = (
    attacker: { data: PlayerData | OpponentData, stats: CombatStats },
    defender: { data: PlayerData | OpponentData, stats: CombatStats },
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
        newDefenderStats.hp = 0; 
        winner = 'attacker'; 
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

    if (totalReflectDmg > 0) { newAttackerStats.hp -= totalReflectDmg; turnEvents.attackerReflectDmg = totalReflectDmg; }
    if (newAttackerStats.hp <= 0) { newAttackerStats.hp = 0; winner = 'defender'; log(`<span class="font-bold text-cyan-300">${attacker.data.name}</span> đã gục ngã vì sát thương phản lại!`); }

    return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents };
};

// --- NEW FUNCTION: Simulates the entire battle instantly ---
const simulateFullBattle = (
    player1Data: PlayerData, 
    player1InitialStats: CombatStats, 
    player2Data: OpponentData, 
    player2InitialStats: CombatStats
) => {
    let p1Stats = { ...player1InitialStats };
    let p2Stats = { ...player2InitialStats };
    let turnCounter = 0;
    let currentPlayerTurn: 'player1' | 'player2' = 'player1';
    let battleWinner: 'player1' | 'player2' | 'draw' | null = null;
    const fullCombatLog: string[] = [];

    while (!battleWinner && turnCounter < 50) {
        turnCounter++;
        
        const isP1Turn = currentPlayerTurn === 'player1';
        const attacker = { data: isP1Turn ? player1Data : player2Data, stats: isP1Turn ? p1Stats : p2Stats };
        const defender = { data: isP1Turn ? player2Data : player1Data, stats: isP1Turn ? p2Stats : p1Stats };
        const attackerId = isP1Turn ? 'player1' : 'player2';
        
        // We only need logs and winner from executeTurn for simulation
        const { newAttackerStats, newDefenderStats, turnLogs, winner: turnWinner } = executeTurn(attacker, defender, turnCounter);

        if (isP1Turn) {
            p1Stats = newAttackerStats;
            p2Stats = newDefenderStats;
        } else {
            p2Stats = newAttackerStats;
            p1Stats = newDefenderStats;
        }

        fullCombatLog.push(...turnLogs.reverse());
        currentPlayerTurn = isP1Turn ? 'player2' : 'player1';

        if (turnWinner) {
            battleWinner = turnWinner === 'attacker' ? attackerId : (attackerId === 'player1' ? 'player2' : 'player1');
        }
    }

    if (!battleWinner) {
        battleWinner = 'draw';
    }

    return {
        finalP1Stats: p1Stats,
        finalP2Stats: p2Stats,
        combatLog: fullCombatLog,
        result: battleWinner
    };
};


// ===================================================================================
// --- MOCK DATA ---
// ===================================================================================
const mockSkills: ActiveSkill[] = [
    { id: 'damage_boost', name: 'Cuồng Nộ', rarity: 'Rare', level: 5, baseEffectValue: 10, effectValuePerLevel: 2 },
    { id: 'life_steal', name: 'Hút Máu', rarity: 'Epic', level: 3, baseEffectValue: 5, effectValuePerLevel: 1.5 },
    { id: 'thorns', name: 'Giáp Gai', rarity: 'Legendary', level: 1, baseEffectValue: 15, effectValuePerLevel: 5 },
];

const getMockPlayerData = (): PlayerData => ({
    userId: 'user-001',
    name: "Chiến Binh Rồng",
    avatarUrl: 'https://placehold.co/224x224/8b5cf6/ffffff?text=YOU',
    coins: 50000,
    initialStats: { maxHp: 10000, hp: 10000, atk: 850, def: 500 },
    equippedSkills: mockSkills,
    rankInfo: { rankName: "Vàng II", rankPoints: 1550, rankMaxPoints: 1800 },
    invasionLog: [
        { attacker: 'Kẻ Hủy Diệt', result: 'loss', goldStolen: 1250, timestamp: '2 giờ trước' },
        { attacker: 'Bóng Ma', result: 'win', goldStolen: 0, timestamp: '5 giờ trước' },
    ]
});

const getMockOpponent = (type: 'wager' | 'ranked' | 'invasion'): OpponentData => {
    if (type === 'ranked') {
        return {
            name: "Đối Thủ Xứng Tầm", avatarUrl: 'https://placehold.co/224x224/b91c1c/ffffff?text=RANKED', coins: 25000,
            initialStats: { maxHp: 9800, hp: 9800, atk: 880, def: 480 },
            equippedSkills: [mockSkills[0], mockSkills[2]],
        };
    }
    if (type === 'invasion') {
         return {
            name: "Mục Tiêu Béo Bở", avatarUrl: 'https://placehold.co/224x224/047857/ffffff?text=TARGET', coins: 15000,
            initialStats: { maxHp: 8000, hp: 8000, atk: 700, def: 600 },
            equippedSkills: [mockSkills[2]],
        };
    }
    return {
        name: "Tay Chơi Liều Lĩnh", avatarUrl: 'https://placehold.co/224x224/be123c/ffffff?text=WAGER', coins: 100000,
        initialStats: { maxHp: 11000, hp: 11000, atk: 800, def: 550 },
        equippedSkills: [mockSkills[1]],
    };
};


// ===================================================================================
// --- UI HELPER COMPONENTS ---
// ===================================================================================

// --- ICONS ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const RankedIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.25a1 1 0 0 1 .84.476l3.344 5.235 5.836.44a1 1 0 0 1 .565 1.732l-4.473 3.992 1.343 5.751a1 1 0 0 1-1.488 1.077L12 16.574l-5.068 3.08a1 1 0 0 1-1.488-1.078l1.343-5.75L2.313 8.922a1 1 0 0 1 .565-1.732l5.836-.44L11.16 1.726A1 1 0 0 1 12 1.25Z"/></svg>);
const WagerIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5a.75.75 0 0 0 0 1.5h1.562c.193 0 .381.02.562.06a2.25 2.25 0 0 1 1.812 2.12v1.562a.75.75 0 0 0 1.5 0v-1.562a3.75 3.75 0 0 0-3.312-3.68v-.188a.75.75 0 0 0-1.5 0v.188H9ZM12.75 15.75a.75.75 0 0 0 0 1.5h-.062a2.25 2.25 0 0 1-1.812-2.12v-1.562a.75.75 0 0 0-1.5 0v1.562a3.75 3.75 0 0 0 3.312 3.68v.188a.75.75 0 0 0 1.5 0v-.188h.188a.75.75 0 0 0 0-1.5h-.188v-1.5a.75.75 0 0 0-1.5 0v1.5h-.062Z" clipRule="evenodd" /></svg>);
const InvasionIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 1.85.53 3.597 1.448 5.095.342 1.24 1.519 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.672 3.672 3.672 9.568 0 13.24- .293.293-.767.293-1.06 0a.75.75 0 0 1 0-1.06c3.076-3.075 3.076-8.045 0-11.12a.75.75 0 0 1 0-1.06Z"/><path d="M20.932 2.758a.75.75 0 0 1 1.061 0c4.876 4.875 4.876 12.79 0 17.665a.75.75 0 0 1-1.06-1.06c4.279-4.278 4.279-11.265 0-15.543a.75.75 0 0 1 0-1.06Z"/></svg>);

// --- CORE UI ---
const CoinDisplay = ({ displayedCoins }: { displayedCoins: number }) => (
    <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-700 rounded-full px-4 py-1.5 text-yellow-300 font-sans font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
        <span>{displayedCoins.toLocaleString()}</span>
    </div>
);

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

const FloatingText = ({ text, id, positionClass, colorClass }: { text: string, id: number, positionClass: string, colorClass: string }) => (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${positionClass} ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
);

// --- MODALS ---
const WagerModal = ({ onClose, onConfirm, playerCoins }: { onClose: () => void, onConfirm: (amount: number) => void, playerCoins: number }) => {
    const [inputValue, setInputValue] = useState('100');
    const handleConfirm = () => {
        const amount = parseInt(inputValue, 10);
        if (!isNaN(amount) && amount > 0) onConfirm(amount);
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="relative w-80 bg-slate-900/90 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
                <div className="p-6 pt-10 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-yellow-300 text-shadow-sm tracking-wide mb-4">NẠP VÀNG CƯỢC</h3>
                    <p className="font-sans text-sm text-slate-400 mb-2">Vàng hiện có: <span className="font-bold text-yellow-200">{(playerCoins || 0).toLocaleString()}</span></p>
                    <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full text-center bg-slate-800/70 border border-slate-600 rounded-lg p-2 text-xl font-bold text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all" autoFocus/>
                    <button onClick={handleConfirm} className="mt-5 w-full px-8 py-3 bg-green-600/50 hover:bg-green-600 rounded-lg font-bold text-base text-green-50 tracking-wider uppercase border border-green-500 hover:border-green-400 transition-all duration-200 active:scale-95">Xác Nhận Nạp</button>
                </div>
            </div>
        </div>
    );
};

const MatchResultModal = ({ result, player1Name, player2Name, onSearchAgain, prizePool }: { result: 'player1' | 'player2' | 'draw', player1Name: string, player2Name: string, onSearchAgain: () => void, prizePool: number }) => {
  const isWinner = result === 'player1';
  const isDraw = result === 'draw';
  let title, message, textColor, borderColor, bgColor;
  if (isDraw) { title = "HÒA"; bgColor = "bg-slate-900/90"; borderColor = "border-slate-500/30"; textColor = "text-slate-300"; message = `Trận đấu ngang tài, bạn nhận lại tiền cược.`; } 
  else if (isWinner) { title = "VICTORY"; bgColor = "bg-slate-900/90"; borderColor = "border-yellow-500/30"; textColor = "text-yellow-300"; message = `Bạn đã đánh bại ${player2Name} và thắng ${prizePool.toLocaleString()} vàng!`; } 
  else { title = "DEFEAT"; bgColor = "bg-slate-900/90"; borderColor = "border-red-500/30"; textColor = "text-red-400"; message = `Bạn đã thua cược trước ${player2Name}.`; }
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
};

const RankedResultModal = ({ result, onSearchAgain, rpChange }: { result: 'player1' | 'player2' | 'draw', onSearchAgain: () => void, rpChange: number }) => {
    let title, message, textColor, borderColor, bgColor;
    if (result === 'draw') { title = "HÒA"; bgColor = "bg-slate-900/90"; borderColor = "border-slate-500/30"; textColor = "text-slate-300"; message = `Trận đấu ngang tài, không thay đổi điểm hạng.`; } 
    else if (result === 'player1') { title = "VICTORY"; bgColor = "bg-slate-900/90"; borderColor = "border-purple-500/30"; textColor = "text-purple-300"; message = `Bạn đã chiến thắng và nhận được +${rpChange} RP!`; } 
    else { title = "DEFEAT"; bgColor = "bg-slate-900/90"; borderColor = "border-red-500/30"; textColor = "text-red-400"; message = `Thất bại không phải là hết. Bạn bị trừ ${Math.abs(rpChange)} RP.`; }
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
};

const DefenseLogModal = ({ log, onClose }: { log: PlayerData['invasionLog'], onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 bg-slate-900/90 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans">✕</button>
            <div className="p-6 pt-10">
                <h3 className="text-2xl font-bold text-center text-sky-300 text-shadow-sm tracking-wide mb-4 font-lilita">NHẬT KÝ PHÒNG THỦ</h3>
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin font-sans">
                    {log.length === 0 ? <p className="text-slate-400 text-center">Chưa có ai tấn công bạn.</p> :
                        log.map((entry, index) => (
                            <div key={index} className="mb-3 p-3 bg-black/20 rounded-lg border border-slate-700">
                                <p>
                                    <span className="font-bold">{entry.attacker}</span> đã tấn công bạn.
                                    <span className="text-xs text-slate-400 float-right">{entry.timestamp}</span>
                                </p>
                                {entry.result === 'win' ?
                                    <p className="text-green-400 font-semibold">Phòng thủ thành công!</p> :
                                    <p className="text-red-400 font-semibold">Phòng thủ thất bại. Mất <span className="text-yellow-400">{entry.goldStolen.toLocaleString()}</span> vàng.</p>
                                }
                            </div>
                        ))}
                </div>
            </div>
        </div>
    </div>
);

const SearchingModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="flex flex-col items-center justify-center text-center gap-4 text-white font-lilita">
            <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"></div>
            <p className="text-2xl tracking-wider">SEARCHING...</p>
        </div>
    </div>
);


// ===================================================================================
// --- GAME MODE: WAGER (ĐẤU CƯỢC) ---
// ===================================================================================
interface PvpWagerProps {
  onClose: () => void;
  player1: PlayerData;
  onCoinChange: (amount: number) => void;
}

function PvpWager({ onClose, player1, onCoinChange }: PvpWagerProps) {
  const [battlePhase, setBattlePhase] = useState<'idle' | 'searching' | 'fighting' | 'finished'>('idle');
  const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
  const [player2, setPlayer2] = useState<OpponentData | null>(null);
  const [player2Stats, setPlayer2Stats] = useState<CombatStats | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
  const [matchResult, setMatchResult] = useState<null | 'player1' | 'player2' | 'draw'>(null);
  const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);
  const [goldPool, setGoldPool] = useState(0); 
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [error, setError] = useState('');
  const [showWagerModal, setShowWagerModal] = useState(false); 

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
  const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
    const id = Date.now() + Math.random();
    const positionClass = target === 'player1' ? 'left-[25%]' : 'right-[25%]'; 
    setDamages(prev => [...prev, { id, text, positionClass, colorClass }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  };
  
  const runBattleTurn = () => {
    if (!player2 || !player2Stats) return;
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
    
    if(isP1Turn) { setPlayer1Stats(newAttackerStats); setPlayer2Stats(newDefenderStats); } else { setPlayer2Stats(newAttackerStats); setPlayer1Stats(newDefenderStats); }
    
    setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
    setTurnCounter(nextTurn);
    setCurrentPlayerTurn(isP1Turn ? 'player2' : 'player1');
    
    if (winner) { const finalWinner = winner === 'attacker' ? attackerId : defenderId; endMatch(finalWinner); } 
    else if (nextTurn >= 50) { endMatch('draw'); }
  };
  
  const skipMatch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    if (!player2 || !player2Stats) return;
    
    const simulation = simulateFullBattle(player1, player1.initialStats, player2, player2.initialStats);

    setPlayer1Stats(simulation.finalP1Stats);
    setPlayer2Stats(simulation.finalP2Stats);
    setCombatLog(simulation.combatLog);
    
    endMatch(simulation.result);
  };

  const endMatch = (result: 'player1' | 'player2' | 'draw') => {
    if (matchResult) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

    if (result === 'player1') {
        addLog(`<b class="text-yellow-300">BẠN THẮNG!</b> Nhận được <b class="text-yellow-400">${totalPrizePool.toLocaleString()}</b> vàng.`);
        onCoinChange(totalPrizePool);
    } else if (result === 'player2') {
        addLog(`<b class="text-red-400">BẠN THUA!</b> Mất <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng đã cược.`);
    } else if (result === 'draw') {
        addLog(`<b class="text-slate-400">HÒA!</b> Nhận lại <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng đã cược.`);
        onCoinChange(goldPool);
    }
    setMatchResult(result);
    setBattlePhase('finished');
  };
  
  const handleSearch = () => {
    if (battlePhase !== 'idle' || goldPool <= 0) {
        setError('Bạn phải nạp vàng cược trước.');
        return;
    }
    setError('');
    addLog(`[Hệ thống] Đặt cược <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng. Đang tìm đối thủ...`);
    setBattlePhase('searching');
  };
  
  const resetForNewSearch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setCombatLog([]); setTurnCounter(0); setCurrentPlayerTurn('player1'); setMatchResult(null); 
    setBattlePhase('idle'); setDamages([]); setPlayer1Stats(player1.initialStats); setPlayer2(null); setPlayer2Stats(null);
    setGoldPool(0); setTotalPrizePool(0); setError('');
  };

  const handleDeposit = (amount: number) => {
    if (isNaN(amount) || amount <= 0) { setError('Số vàng không hợp lệ.'); return; }
    if (amount > player1.coins) { setError('Bạn không đủ vàng.'); return; }
    setError('');
    
    onCoinChange(-amount);
    setGoldPool(prev => prev + amount);
    setShowWagerModal(false);
    addLog(`[Hệ thống] Bạn đã nạp thêm <b class="text-yellow-400">${amount.toLocaleString()}</b> vàng vào bể cược.`);
  };

  useEffect(() => {
    if (battlePhase === 'searching') { 
        searchTimeoutRef.current = setTimeout(() => { 
            const opponent = getMockOpponent('wager');
            setPlayer2(opponent);
            setPlayer2Stats(opponent.initialStats);
            const prize = goldPool * 2;
            setTotalPrizePool(prize);
            addLog(`[Hệ thống] Bể cược tổng cộng là <b class="text-yellow-400">${prize.toLocaleString()}</b> vàng.`);
            addLog(`[Lượt 0] Đã tìm thấy đối thủ: ${opponent.name}. Trận đấu bắt đầu!`);
            setBattlePhase('fighting'); 
        }, 2500); 
    } else if (battlePhase === 'fighting' && !matchResult) { 
        battleIntervalRef.current = setInterval(runBattleTurn, 1500); 
    }
    return () => { 
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current); 
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); 
    };
  }, [battlePhase, matchResult]);

  return (
    <>
      {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}
      {showWagerModal && <WagerModal onClose={() => setShowWagerModal(false)} onConfirm={handleDeposit} playerCoins={player1.coins}/>}
      {battlePhase === 'searching' && <SearchingModal />}
      
      <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <HomeIcon className="w-5 h-5 text-slate-300" />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
                <h1 className="text-2xl font-bold text-red-400 text-shadow tracking-widest">ĐẤU CƯỢC</h1>
                <CoinDisplay displayedCoins={player1.coins} />
            </div>
        </header>

        <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col items-center">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                {(battlePhase === 'idle' || battlePhase === 'fighting' || battlePhase === 'finished') && (
                    <div className="w-full max-w-2xl mx-auto mb-4 flex flex-col items-center gap-3 mt-4">
                        <div className="w-1/2">
                            <HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                        </div>
                    </div>
                )}
                <div className="w-full flex justify-center items-center gap-3 mb-4">
                    {battlePhase === 'fighting' && !matchResult && (<button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 rounded-lg font-semibold text-xs border border-slate-600 hover:border-orange-400 text-orange-300">Skip Battle</button>)}
                </div>
                <div className="w-full flex justify-center items-center my-8">
                    {battlePhase === 'idle' && (
                        <div className="flex flex-col items-center gap-8">
                          <div className="w-40 h-40 md:w-56 md:h-56 bg-black/20 rounded-full flex items-center justify-center border-4 border-slate-700"><span className="text-8xl font-black text-slate-500 select-none">?</span></div>
                          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                              <div className="flex items-center justify-center gap-4 bg-slate-900/50 border border-slate-700 rounded-lg p-2 w-full">
                                  <span className="font-sans text-slate-300">Bể Cược:</span>
                                  <span className="font-bold text-lg text-yellow-300">{(goldPool || 0).toLocaleString()}</span>
                                  <button onClick={() => setShowWagerModal(true)} className="ml-auto font-sans text-xs bg-sky-600/50 hover:bg-sky-600 border border-sky-500 rounded px-3 py-1">Nạp</button>
                              </div>
                              {error && <p className="text-red-400 text-sm font-sans mt-1">{error}</p>}
                          </div>
                          <button onClick={handleSearch} disabled={goldPool <= 0} className="btn-shine relative overflow-hidden px-10 py-3 bg-red-800/80 rounded-lg text-red-100 border border-red-500/40 transition-all hover:border-red-400 hover:shadow-[0_0_20px_theme(colors.red.500/0.6)] disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed">
                              <span className="font-bold text-xl tracking-widest uppercase">Search</span>
                          </button>
                        </div>
                    )}
                    {(battlePhase === 'fighting' || battlePhase === 'finished') && player2 && player2Stats && (
                      <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 ${currentPlayerTurn === 'player2' && battlePhase === 'fighting' ? 'animate-pulse-turn' : ''}`}>
                        <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">{player2.name}</h2>
                        <div className="w-40 h-40 md:w-56 md:h-56">
                          <img src={player2.avatarUrl} alt={player2.name} className="w-full h-full object-cover rounded-lg border-2 border-slate-600" />
                        </div>
                        <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                      </div>
                    )}
                </div>
                {(battlePhase === 'fighting' || battlePhase === 'finished') && (
                  <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mb-4">
                      <div className="h-40 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm scrollbar-thin font-sans">
                          {combatLog.length > 0 && totalPrizePool > 0 && (
                              <div className="text-center mb-2 font-bold text-yellow-300 border-t border-b border-yellow-600/30 py-1">Bể cược: {totalPrizePool.toLocaleString()} Vàng</div>
                          )}
                          {combatLog.map((entry, index) => <p key={index} className={`mb-1 ${index === 0 ? 'opacity-100' : 'opacity-70'}`} dangerouslySetInnerHTML={{__html: entry}}></p>)}
                      </div>
                  </div>
                )}
                {battlePhase === 'finished' && matchResult && player2 && <MatchResultModal result={matchResult} player1Name={player1.name} player2Name={player2.name} onSearchAgain={resetForNewSearch} prizePool={totalPrizePool} />}
            </div>
        </main>
      </div>
    </>
  );
}


// ===================================================================================
// --- GAME MODE: RANKED (ĐẤU XẾP HẠNG) ---
// ===================================================================================
interface PvpRankedProps {
  onClose: () => void;
  player1: PlayerData;
  onRankChange: (rpChange: number) => void;
}

function PvpRanked({ onClose, player1, onRankChange }: PvpRankedProps) {
    const [battlePhase, setBattlePhase] = useState<'idle' | 'searching' | 'fighting' | 'finished'>('idle');
    const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
    const [player2, setPlayer2] = useState<OpponentData | null>(null);
    const [player2Stats, setPlayer2Stats] = useState<CombatStats | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [turnCounter, setTurnCounter] = useState(0);
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
    const [matchResult, setMatchResult] = useState<null | 'player1' | 'player2' | 'draw'>(null);
    const [rpChange, setRpChange] = useState(0);
    const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);

    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
    const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
    const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
        const id = Date.now() + Math.random();
        const positionClass = target === 'player1' ? 'left-[25%]' : 'right-[25%]'; 
        setDamages(prev => [...prev, { id, text, positionClass, colorClass }]);
        setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
    };

    const runBattleTurn = () => {
        if (!player2 || !player2Stats) return;
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
        
        if(isP1Turn) { setPlayer1Stats(newAttackerStats); setPlayer2Stats(newDefenderStats); } else { setPlayer2Stats(newAttackerStats); setPlayer1Stats(newDefenderStats); }
        
        setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
        setTurnCounter(nextTurn);
        setCurrentPlayerTurn(isP1Turn ? 'player2' : 'player1');
        
        if (winner) { const finalWinner = winner === 'attacker' ? attackerId : defenderId; endMatch(finalWinner); } 
        else if (nextTurn >= 50) { endMatch('draw'); }
    };

    const skipMatch = () => {
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        if (!player2 || !player2Stats) return;

        const simulation = simulateFullBattle(player1, player1.initialStats, player2, player2.initialStats);

        setPlayer1Stats(simulation.finalP1Stats);
        setPlayer2Stats(simulation.finalP2Stats);
        setCombatLog(simulation.combatLog);
        
        endMatch(simulation.result);
    };

    const handleSearch = () => {
        setBattlePhase('searching');
        addLog("Đang tìm đối thủ xứng tầm...");
        setTimeout(() => {
            const opponent = getMockOpponent('ranked');
            setPlayer2(opponent);
            setPlayer2Stats(opponent.initialStats);
            setBattlePhase('fighting');
            addLog(`Đã tìm thấy: ${opponent.name}! Trận đấu bắt đầu.`);
        }, 2000);
    };

    const endMatch = (result: 'player1' | 'player2' | 'draw') => {
        if (matchResult) return;
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

        const rpWin = 25;
        const rpLoss = -15;
        let change = 0;

        if (result === 'player1') {
            change = rpWin;
            addLog(`VICTORY! Bạn nhận được <b class="text-purple-400">${rpWin} RP</b>.`);
        } else if (result === 'player2') {
            change = rpLoss;
            addLog(`DEFEAT! Bạn bị trừ <b class="text-red-500">${Math.abs(rpLoss)} RP</b>.`);
        } else {
            addLog(`HÒA! Không có thay đổi về RP.`);
        }
        setRpChange(change);
        if (change !== 0) onRankChange(change);
        setMatchResult(result);
        setBattlePhase('finished');
    };
    
    const resetForNewSearch = () => {
        setBattlePhase('idle');
        setPlayer1Stats(player1.initialStats);
        setPlayer2(null);
        setPlayer2Stats(null);
        setCombatLog([]);
        setMatchResult(null);
        setTurnCounter(0);
        setCurrentPlayerTurn('player1');
        setRpChange(0);
        setDamages([]);
    };
    
    useEffect(() => {
        if (battlePhase === 'fighting' && !matchResult) { 
            battleIntervalRef.current = setInterval(runBattleTurn, 1500); 
        }
        return () => { if (battleIntervalRef.current) clearInterval(battleIntervalRef.current); };
    }, [battlePhase, matchResult]);

    return (
        <>
            {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}
            {battlePhase === 'searching' && <SearchingModal />}

            <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
                <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                            <HomeIcon className="w-5 h-5 text-slate-300" />
                            <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                        </button>
                        <h1 className="text-2xl font-bold text-purple-400 text-shadow tracking-widest">ĐẤU XẾP HẠNG</h1>
                        <CoinDisplay displayedCoins={player1.coins} />
                    </div>
                </header>

                <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col items-center">
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                        {battlePhase === 'idle' ? (
                            <div className="flex flex-col items-center gap-8 animate-fade-in mt-16">
                                <h2 className="text-3xl font-bold text-shadow text-yellow-300">Thông Tin Mùa Giải</h2>
                                <div className="w-full max-w-sm bg-black/30 p-4 rounded-lg border border-slate-700">
                                    <div className='flex justify-between items-baseline mb-1'><span className='font-bold text-xl text-slate-200'>{player1.rankInfo.rankName}</span><span className='font-sans text-sm text-slate-400'>{player1.rankInfo.rankPoints.toLocaleString()} / {player1.rankInfo.rankMaxPoints.toLocaleString()} RP</span></div>
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${(player1.rankInfo.rankPoints / player1.rankInfo.rankMaxPoints) * 100}%` }}></div></div>
                                </div>
                                <button onClick={handleSearch} className="btn-shine relative overflow-hidden px-10 py-3 bg-purple-800/80 rounded-lg text-purple-100 border border-purple-500/40 transition-all hover:border-purple-400 hover:shadow-[0_0_20px_theme(colors.purple.500/0.6)]">
                                    <span className="font-bold text-xl tracking-widest uppercase">Tìm Trận</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-full max-w-2xl mx-auto mb-4 mt-4"><div className="w-1/2 mx-auto"><HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" /></div></div>
                                
                                <div className="w-full flex justify-center items-center gap-3 mb-4">
                                    {battlePhase === 'fighting' && !matchResult && (
                                        <button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 rounded-lg font-semibold text-xs border border-slate-600 hover:border-purple-400 text-purple-300">
                                            Skip Battle
                                        </button>
                                    )}
                                </div>

                                <div className="w-full flex justify-center items-center my-8">
                                    {player2 && player2Stats && (
                                        <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 ${currentPlayerTurn === 'player2' && battlePhase === 'fighting' ? 'animate-pulse-turn' : ''}`}>
                                            <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">{player2.name}</h2>
                                            <div className="w-40 h-40 md:w-56 md:h-56"><img src={player2.avatarUrl} alt={player2.name} className="w-full h-full object-cover rounded-lg border-2 border-slate-600" /></div>
                                            <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                                        </div>
                                    )}
                                </div>
                                <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mb-4">
                                    <div className="h-40 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm scrollbar-thin font-sans">
                                        {combatLog.map((entry, index) => <p key={index} className={`mb-1 ${index === 0 ? 'opacity-100' : 'opacity-70'}`} dangerouslySetInnerHTML={{__html: entry}}></p>)}
                                    </div>
                                </div>
                            </>
                        )}
                        {battlePhase === 'finished' && matchResult && <RankedResultModal result={matchResult} onSearchAgain={resetForNewSearch} rpChange={rpChange} />}
                    </div>
                </main>
            </div>
        </>
    );
}

// ===================================================================================
// --- GAME MODE: INVASION (XÂM LƯỢC) ---
// ===================================================================================
interface PvpInvasionProps {
  onClose: () => void;
  player1: PlayerData;
  onCoinChange: (amount: number) => void;
}

function PvpInvasion({ onClose, player1, onCoinChange }: PvpInvasionProps) {
    const [view, setView] = useState<'main' | 'scouting' | 'battle'>('main');
    const [opponents, setOpponents] = useState<OpponentData[]>([]);
    const [currentTarget, setCurrentTarget] = useState<OpponentData | null>(null);
    const [battleResult, setBattleResult] = useState<{ result: 'win' | 'loss', goldStolen: number } | null>(null);
    const [showLogModal, setShowLogModal] = useState(false);

    const handleScout = () => {
        setView('scouting');
        setTimeout(() => {
            setOpponents([getMockOpponent('invasion'), getMockOpponent('invasion'), getMockOpponent('invasion')]);
        }, 1000);
    };

    const handleAttack = (target: OpponentData) => {
        setCurrentTarget(target);
        setView('battle');
        
        setTimeout(() => {
            const playerPower = player1.initialStats.atk * 1.5 + player1.initialStats.def;
            const targetPower = target.initialStats.atk * 1.5 + target.initialStats.def;
            
            if (playerPower > targetPower * (0.8 + Math.random() * 0.4)) {
                const goldStolen = Math.floor(target.coins * (0.1 + Math.random() * 0.05));
                onCoinChange(goldStolen);
                setBattleResult({ result: 'win', goldStolen });
            } else {
                setBattleResult({ result: 'loss', goldStolen: 0 });
            }
        }, 2000);
    };

    const reset = () => {
        setView('main');
        setOpponents([]);
        setCurrentTarget(null);
        setBattleResult(null);
    };

    return (
        <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
            {showLogModal && <DefenseLogModal log={player1.invasionLog} onClose={() => setShowLogModal(false)} />}
            <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                        <HomeIcon className="w-5 h-5 text-slate-300" />
                        <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                    <h1 className="text-2xl font-bold text-sky-400 text-shadow tracking-widest">XÂM LƯỢC</h1>
                    <CoinDisplay displayedCoins={player1.coins} />
                </div>
            </header>
            <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
                {view === 'main' && (
                    <div className="text-center animate-fade-in-scale-fast">
                        <h2 className="text-4xl">Chuẩn bị Xâm Lược</h2>
                        <p className="font-sans text-slate-400 mt-2 mb-8">Tấn công người chơi khác để cướp vàng hoặc củng cố phòng tuyến.</p>
                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button onClick={handleScout} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500">Dò Tìm Mục Tiêu</button>
                            <button onClick={() => alert("Tính năng đang phát triển!")} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Thiết Lập Phòng Thủ</button>
                            <button onClick={() => setShowLogModal(true)} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Nhật Ký Phòng Thủ</button>
                        </div>
                    </div>
                )}
                {view === 'scouting' && (
                    <div className="w-full max-w-4xl animate-fade-in">
                        <h2 className="text-3xl text-center mb-6">Chọn Mục Tiêu Tấn Công</h2>
                        {opponents.length === 0 ? <SearchingModal /> : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {opponents.map((op, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 flex flex-col items-center gap-3">
                                        <img src={op.avatarUrl} alt={op.name} className="w-24 h-24 rounded-full border-2 border-slate-600" />
                                        <h3 className="text-xl font-bold">{op.name}</h3>
                                        <p className="font-sans text-sm text-slate-400">Vàng có thể cướp:</p>
                                        <p className="font-bold text-lg text-yellow-300">~{(op.coins * 0.12).toLocaleString()}</p>
                                        <button onClick={() => handleAttack(op)} className="mt-2 w-full py-2 bg-red-600/50 hover:bg-red-600 rounded-lg font-bold border border-red-500">Tấn Công</button>
                                    </div>
                                ))}
                            </div>
                        )}
                         <div className="text-center mt-8">
                             <button onClick={reset} className="font-sans text-slate-400 hover:text-white underline">Hủy và quay lại</button>
                         </div>
                    </div>
                )}
                {view === 'battle' && (
                    <div className="text-center animate-fade-in-scale-fast">
                        {!battleResult ? <SearchingModal /> :
                         battleResult.result === 'win' ? (
                            <div>
                                <h2 className="text-5xl text-green-400">THẮNG LỢI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã cướp được <span className="font-bold text-yellow-300">{battleResult.goldStolen.toLocaleString()}</span> vàng từ {currentTarget?.name}.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         ) : (
                            <div>
                                <h2 className="text-5xl text-red-400">THẤT BẠI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã bị phòng tuyến của {currentTarget?.name} đánh bại.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         )
                        }
                    </div>
                )}
            </main>
        </div>
    );
}

// ===================================================================================
// --- SELECTION SCREEN ---
// ===================================================================================
interface PvpSelectionProps {
  onClose: () => void;
  playerData: PlayerData;
  onSelectMode: (mode: 'wager' | 'ranked' | 'invasion') => void;
}

function PvpSelection({ onClose, playerData, onSelectMode }: PvpSelectionProps) {
  return (
    <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
            <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
                <CoinDisplay displayedCoins={playerData.coins} />
            </div>
        </header>
        <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-shadow tracking-widest mb-4 text-center text-slate-200">ĐẤU TRƯỜNG</h1>
            <p className="font-sans text-slate-400 mb-12 text-center">Chọn một chế độ để bắt đầu cuộc chinh phạt của bạn.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-purple-400/80 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-purple-900/50 group-hover:border-purple-400"><RankedIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-purple-300" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-purple-300">ĐẤU XẾP HẠNG</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Chiến đấu vì danh vọng. Khẳng định vị thế.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6">
                        <div className='flex justify-between items-baseline mb-1'><span className='font-bold text-lg text-slate-200'>{playerData.rankInfo.rankName}</span><span className='font-sans text-xs text-slate-400'>{playerData.rankInfo.rankPoints.toLocaleString()} / {playerData.rankInfo.rankMaxPoints.toLocaleString()} RP</span></div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${(playerData.rankInfo.rankPoints / playerData.rankInfo.rankMaxPoints) * 100}%` }}></div></div>
                    </div>
                    <button onClick={() => onSelectMode('ranked')} className="mt-auto w-full py-3 bg-purple-600/50 hover:bg-purple-600 rounded-lg font-bold tracking-wider uppercase border border-purple-500 hover:border-purple-400 transition-all">Tìm Trận</button>
                </div>
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-red-500/80 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10">
                    <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-red-900/50 group-hover:border-red-500"><WagerIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-red-400" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-red-400">ĐẤU CƯỢC</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Liều ăn nhiều. Rủi ro càng cao, phần thưởng càng lớn.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6 flex flex-col items-center justify-center h-[76px]"><span className='font-sans text-xs text-slate-400'>VÀNG HIỆN CÓ</span><span className='font-bold text-2xl text-yellow-300 tracking-wider'>{playerData.coins.toLocaleString()}</span></div>
                    <button onClick={() => onSelectMode('wager')} className="mt-auto w-full py-3 bg-red-700/60 hover:bg-red-700 rounded-lg font-bold tracking-wider uppercase border border-red-600 hover:border-red-500 transition-all">Vào Sảnh</button>
                </div>
                <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-sky-500/80 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/10">
                     <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-sky-900/50 group-hover:border-sky-500"><InvasionIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-sky-400" /></div>
                    <h2 className="text-3xl font-bold mt-8 text-shadow text-sky-400">XÂM LƯỢC</h2>
                    <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Tấn công người chơi khác, cướp tài nguyên, hoặc xây dựng phòng tuyến bất khả xâm phạm.</p>
                    <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6 flex flex-col items-center justify-center h-[76px]"><span className='font-sans text-sm text-slate-300'>Phòng thủ gần nhất: {playerData.invasionLog[0] ? <span className={`font-bold ${playerData.invasionLog[0].result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{playerData.invasionLog[0].result === 'win' ? 'THẮNG' : 'THUA'}</span> : <span className='text-slate-400'>N/A</span>}</span><button onClick={() => alert("Mở nhật ký")} className="mt-2 text-xs font-sans text-slate-400 hover:text-white underline">Xem nhật ký</button></div>
                    <div className="mt-auto w-full flex gap-3">
                         <button onClick={() => onSelectMode('invasion')} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500 hover:border-sky-400 transition-all">Hành Động</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

// ===================================================================================
// --- MAIN PORTAL COMPONENT ---
// ===================================================================================
export default function PvpPortal() {
  const [playerData, setPlayerData] = useState<PlayerData>(getMockPlayerData());
  const [mode, setMode] = useState<'selection' | 'wager' | 'ranked' | 'invasion'>('selection');

  const handleCoinChange = (amount: number) => {
    setPlayerData(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  };

  const handleRankChange = (rpChange: number) => {
    setPlayerData(prev => ({
        ...prev,
        rankInfo: { 
            ...prev.rankInfo, 
            rankPoints: Math.max(0, prev.rankInfo.rankPoints + rpChange) 
        }
    }));
  };

  const handleReturnToSelection = () => {
    setMode('selection');
  };

  const renderContent = () => {
    switch (mode) {
      case 'wager':
        return <PvpWager player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      case 'ranked':
        return <PvpRanked player1={playerData} onClose={handleReturnToSelection} onRankChange={handleRankChange} />;
      case 'invasion':
        return <PvpInvasion player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      default:
        return <PvpSelection playerData={playerData} onSelectMode={setMode} onClose={() => console.log("Close Portal")} />;
    }
  }

  return (
    <>
        <PvpStyles />
        {renderContent()}
    </>
  );
}
// --- END OF FILE PvpPortal.tsx (All-In-One, No Shortening, Skip Battle Fix) ---
