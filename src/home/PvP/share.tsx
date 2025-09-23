// --- START OF FILE pvp/shared.tsx ---

import React from 'react';

// ===================================================================================
// --- GLOBAL STYLES ---
// ===================================================================================
export const PvpStyles = () => (
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
// --- TYPE DEFINITIONS ---
// ===================================================================================
type OwnedSkill = { id: string; level: number; };
type SkillBlueprint = { name: string; rarity: string; baseEffectValue?: number; effectValuePerLevel?: number; };
export type ActiveSkill = OwnedSkill & SkillBlueprint;
export type CombatStats = { maxHp: number; hp: number; atk: number; def: number; };
export type PlayerData = {
    userId: string; name: string; avatarUrl: string; coins: number; 
    initialStats: CombatStats;
    equippedSkills: ActiveSkill[];
    rankInfo: { rankName: string; rankPoints: number; rankMaxPoints: number; };
    invasionLog: { attacker: string; result: 'win' | 'loss'; goldStolen: number; timestamp: string; }[];
};
export type OpponentData = Omit<PlayerData, 'userId' | 'rankInfo' | 'invasionLog'>;

// ===================================================================================
// --- SHARED COMBAT LOGIC ---
// ===================================================================================
const getActivationChance = (rarity: string) => ({ Common: 60, Uncommon: 45, Rare: 30, Epic: 20, Legendary: 10 }[rarity] || 0);
const getRarityTextColor = (rarity: string) => ({ Common: 'text-gray-300', Uncommon: 'text-green-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-yellow-400' }[rarity] || 'text-white');

export const executeTurn = (attacker: { data: PlayerData | OpponentData, stats: CombatStats }, defender: { data: PlayerData | OpponentData, stats: CombatStats }, turn: number) => {
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
    
    if (newDefenderStats.hp <= 0) { newDefenderStats.hp = 0; winner = 'attacker'; log(`<span class="font-bold text-orange-300">${defender.data.name}</span> đã bị đánh bại!`); return { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents }; }
    
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

export const simulateFullBattle = (player1Data: PlayerData, player1InitialStats: CombatStats, player2Data: OpponentData, player2InitialStats: CombatStats) => {
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
        const { newAttackerStats, newDefenderStats, turnLogs, winner: turnWinner } = executeTurn(attacker, defender, turnCounter);

        if (isP1Turn) { p1Stats = newAttackerStats; p2Stats = newDefenderStats; } else { p2Stats = newAttackerStats; p1Stats = newDefenderStats; }
        fullCombatLog.push(...turnLogs.reverse());
        currentPlayerTurn = isP1Turn ? 'player2' : 'player1';
        if (turnWinner) { battleWinner = turnWinner === 'attacker' ? attackerId : (attackerId === 'player1' ? 'player2' : 'player1'); }
    }
    if (!battleWinner) { battleWinner = 'draw'; }
    return { finalP1Stats: p1Stats, finalP2Stats: p2Stats, combatLog: fullCombatLog, result: battleWinner };
};

// ===================================================================================
// --- MOCK DATA ---
// ===================================================================================
const mockSkills: ActiveSkill[] = [
    { id: 'damage_boost', name: 'Cuồng Nộ', rarity: 'Rare', level: 5, baseEffectValue: 10, effectValuePerLevel: 2 },
    { id: 'life_steal', name: 'Hút Máu', rarity: 'Epic', level: 3, baseEffectValue: 5, effectValuePerLevel: 1.5 },
    { id: 'thorns', name: 'Giáp Gai', rarity: 'Legendary', level: 1, baseEffectValue: 15, effectValuePerLevel: 5 },
];

export const getMockPlayerData = (): PlayerData => ({
    userId: 'user-001', name: "Chiến Binh Rồng", avatarUrl: 'https://placehold.co/224x224/8b5cf6/ffffff?text=YOU',
    coins: 50000, initialStats: { maxHp: 10000, hp: 10000, atk: 850, def: 500 }, equippedSkills: mockSkills,
    rankInfo: { rankName: "Vàng II", rankPoints: 1550, rankMaxPoints: 1800 },
    invasionLog: [
        { attacker: 'Kẻ Hủy Diệt', result: 'loss', goldStolen: 1250, timestamp: '2 giờ trước' },
        { attacker: 'Bóng Ma', result: 'win', goldStolen: 0, timestamp: '5 giờ trước' },
    ]
});

export const getMockOpponent = (type: 'wager' | 'ranked' | 'invasion'): OpponentData => {
    if (type === 'ranked') {
        return { name: "Đối Thủ Xứng Tầm", avatarUrl: 'https://placehold.co/224x224/b91c1c/ffffff?text=RANKED', coins: 25000, initialStats: { maxHp: 9800, hp: 9800, atk: 880, def: 480 }, equippedSkills: [mockSkills[0], mockSkills[2]] };
    }
    if (type === 'invasion') {
         return { name: "Mục Tiêu Béo Bở", avatarUrl: 'https://placehold.co/224x224/047857/ffffff?text=TARGET', coins: 15000, initialStats: { maxHp: 8000, hp: 8000, atk: 700, def: 600 }, equippedSkills: [mockSkills[2]] };
    }
    return { name: "Tay Chơi Liều Lĩnh", avatarUrl: 'https://placehold.co/224x224/be123c/ffffff?text=WAGER', coins: 100000, initialStats: { maxHp: 11000, hp: 11000, atk: 800, def: 550 }, equippedSkills: [mockSkills[1]] };
};

// ===================================================================================
// --- UI HELPER COMPONENTS ---
// ===================================================================================
export const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
export const RankedIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.25a1 1 0 0 1 .84.476l3.344 5.235 5.836.44a1 1 0 0 1 .565 1.732l-4.473 3.992 1.343 5.751a1 1 0 0 1-1.488 1.077L12 16.574l-5.068 3.08a1 1 0 0 1-1.488-1.078l1.343-5.75L2.313 8.922a1 1 0 0 1 .565-1.732l5.836-.44L11.16 1.726A1 1 0 0 1 12 1.25Z"/></svg>);
export const WagerIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5a.75.75 0 0 0 0 1.5h1.562c.193 0 .381.02.562.06a2.25 2.25 0 0 1 1.812 2.12v1.562a.75.75 0 0 0 1.5 0v-1.562a3.75 3.75 0 0 0-3.312-3.68v-.188a.75.75 0 0 0-1.5 0v.188H9ZM12.75 15.75a.75.75 0 0 0 0 1.5h-.062a2.25 2.25 0 0 1-1.812-2.12v-1.562a.75.75 0 0 0-1.5 0v1.562a3.75 3.75 0 0 0 3.312 3.68v.188a.75.75 0 0 0 1.5 0v-.188h.188a.75.75 0 0 0 0-1.5h-.188v-1.5a.75.75 0 0 0-1.5 0v1.5h-.062Z" clipRule="evenodd" /></svg>);
export const InvasionIcon = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 1.85.53 3.597 1.448 5.095.342 1.24 1.519 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.672 3.672 3.672 9.568 0 13.24- .293.293-.767.293-1.06 0a.75.75 0 0 1 0-1.06c3.076-3.075 3.076-8.045 0-11.12a.75.75 0 0 1 0-1.06Z"/><path d="M20.932 2.758a.75.75 0 0 1 1.061 0c4.876 4.875 4.876 12.79 0 17.665a.75.75 0 0 1-1.06-1.06c4.279-4.278 4.279-11.265 0-15.543a.75.75 0 0 1 0-1.06Z"/></svg>);

export const CoinDisplay = ({ displayedCoins }: { displayedCoins: number }) => (
    <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-700 rounded-full px-4 py-1.5 text-yellow-300 font-sans font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
        <span>{displayedCoins.toLocaleString()}</span>
    </div>
);

export const HealthBar = ({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
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

export const FloatingText = ({ text, id, positionClass, colorClass }: { text: string, id: number, positionClass: string, colorClass: string }) => (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${positionClass} ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
);

// ===================================================================================
// --- MODALS ---
// ===================================================================================
export const WagerModal = ({ onClose, onConfirm, playerCoins }: { onClose: () => void, onConfirm: (amount: number) => void, playerCoins: number }) => {
    const [inputValue, setInputValue] = React.useState('100');
    const handleConfirm = () => { const amount = parseInt(inputValue, 10); if (!isNaN(amount) && amount > 0) onConfirm(amount); };
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

export const MatchResultModal = ({ result, player1Name, player2Name, onSearchAgain, prizePool }: { result: 'player1' | 'player2' | 'draw', player1Name: string, player2Name: string, onSearchAgain: () => void, prizePool: number }) => {
  const isWinner = result === 'player1'; const isDraw = result === 'draw';
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

export const RankedResultModal = ({ result, onSearchAgain, rpChange }: { result: 'player1' | 'player2' | 'draw', onSearchAgain: () => void, rpChange: number }) => {
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

export const DefenseLogModal = ({ log, onClose }: { log: PlayerData['invasionLog'], onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 bg-slate-900/90 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans">✕</button>
            <div className="p-6 pt-10">
                <h3 className="text-2xl font-bold text-center text-sky-300 text-shadow-sm tracking-wide mb-4 font-lilita">NHẬT KÝ PHÒNG THỦ</h3>
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin font-sans">
                    {log.length === 0 ? <p className="text-slate-400 text-center">Chưa có ai tấn công bạn.</p> :
                        log.map((entry, index) => (
                            <div key={index} className="mb-3 p-3 bg-black/20 rounded-lg border border-slate-700">
                                <p><span className="font-bold">{entry.attacker}</span> đã tấn công bạn.<span className="text-xs text-slate-400 float-right">{entry.timestamp}</span></p>
                                {entry.result === 'win' ? <p className="text-green-400 font-semibold">Phòng thủ thành công!</p> : <p className="text-red-400 font-semibold">Phòng thủ thất bại. Mất <span className="text-yellow-400">{entry.goldStolen.toLocaleString()}</span> vàng.</p> }
                            </div>
                        ))}
                </div>
            </div>
        </div>
    </div>
);

export const SearchingModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="flex flex-col items-center justify-center text-center gap-4 text-white font-lilita">
            <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"></div>
            <p className="text-2xl tracking-wider">SEARCHING...</p>
        </div>
    </div>
);
// --- END OF FILE pvp/shared.tsx ---
