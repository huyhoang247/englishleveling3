// --- START OF FILE boss.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import BOSS_DATA from './boss/bossData.ts';
import CoinDisplay from './ui/display/coin-display.tsx';
// IMPORT ENERGY DISPLAY MỚI
import EnergyDisplay from './ui/display/energy-display.tsx'; 
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from './home/skill-game/skill-data.tsx';
import { uiAssets, bossBattleAssets } from './game-assets.ts'; // IMPORT TÀI NGUYÊN
// --- THÊM IMPORT MỚI ---
import { fetchBossBattleData } from './gameDataService.ts';
import { auth } from './firebase'; // Cần để lấy userId

// --- TYPE DEFINITIONS ---
type ActiveSkill = OwnedSkill & SkillBlueprint;

type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy?: number;
    energy?: number;
};

// --- CẬP NHẬT PROPS ---
interface BossBattleProps {
  onClose: () => void;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// --- THÊM COMPONENT LOADING ---
const LoadingScreen = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#110f21] to-[#2c0f52]">
    <div className="w-16 h-16 border-4 border-slate-500 border-t-cyan-400 rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-300 font-sans text-lg">Loading Battle Data...</p>
  </div>
);


// --- UI HELPER COMPONENTS ---

const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

const WarriorIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0112.28 0C16.43 19.18 14.03 20 12 20z" /> </svg> );

const PlayerInfoDisplay = ({ stats, floor, onAvatarClick }: { stats: CombatStats, floor: string, onAvatarClick: () => void }) => {
    const percentage = Math.max(0, (stats.hp / stats.maxHp) * 100);
  
    return (
      <div className="w-64 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50 shadow-lg flex items-center gap-3 animate-fade-in">
          <div 
            onClick={onAvatarClick}
            className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:scale-110"
            title="View Your Stats"
          >
              <WarriorIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-grow flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md self-start border border-slate-700/80">
                <img src={bossBattleAssets.floorIcon} alt="Floor" className="w-3 h-3" />
                <h3 className="font-bold text-xs tracking-widest uppercase text-slate-300 select-none">
                    {floor}
                </h3>
            </div>
            <div className="relative w-full h-5 bg-black/40 rounded-full border border-slate-700/80 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-lime-400" 
                style={{ 
                  width: `${percentage}%`, 
                  boxShadow: `0 0 6px rgba(132, 204, 22, 0.5), 0 0 8px rgba(132, 204, 22, 0.5)` 
                }}
              ></div>
              <div className="absolute inset-0 flex justify-center items-center text-xs text-white text-shadow-sm font-bold">
                <span>{Math.ceil(stats.hp)} / {stats.maxHp}</span>
              </div>
            </div>
          </div>
      </div>
    );
};

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

const FloatingText = ({ text, id, colorClass }: { text: string, id: number, colorClass: string }) => {
  return (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

const CharacterStatsModal = ({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  const StatItem = ({ label, icon, current, max }: { label: string, icon: string, current: number, max?: number }) => {
    const valueText = max ? `${Math.ceil(current)} / ${max}` : String(current);
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-24 h-10 bg-slate-800 rounded-lg flex items-center justify-center gap-2 border border-slate-700 p-2">
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm text-slate-300 tracking-wider">{label}</span>
        </div>
        <div className="flex-grow h-10 bg-black/40 rounded-lg flex items-center justify-center border border-slate-700/80">
          <span className="font-bold text-sm text-white text-shadow-sm tracking-wider">{valueText}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-4 border-b border-slate-700"><h3 className={`text-xl font-bold text-center ${titleColor} text-shadow-sm tracking-widest`}>{title}</h3></div>
        <div className="p-5 flex flex-col gap-4">
          <StatItem label="HP" icon={uiAssets.statHpIcon} current={character.hp} max={character.maxHp} />
          <StatItem label="ATK" icon={uiAssets.statAtkIcon} current={character.atk} />
          <StatItem label="DEF" icon={uiAssets.statDefIcon} current={character.def} />
        </div>
      </div>
    </div>
  )
}

const LogModal = ({ log, onClose }: { log: string[], onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
          <div className="p-4 border-b border-slate-700"><h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3></div>
          <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
            {log.length > 0 ? log.map((entry, index) => (<p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2" dangerouslySetInnerHTML={{__html: entry}}></p>)) : (<p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>)}
          </div>
        </div>
      </div>
    )
}

const RewardsModal = ({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Rewards</h3>
          <div className="flex flex-row flex-wrap justify-center gap-3">
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
              <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
              <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VictoryModal = ({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.victoryIcon} alt="Victory" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
                      <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
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

const DefeatModal = ({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl shadow-black/30 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.defeatIcon} alt="Defeat" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you. Rise again and reclaim your honor.</p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
  );
}

const SweepRewardsModal = ({ isSuccess, rewards, onClose }: { isSuccess: boolean; rewards: { coins: number; energy: number }; onClose: () => void; }) => {
  const title = isSuccess ? 'SWEEP SUCCESS' : 'SWEEP FAILED';
  const titleColor = isSuccess ? 'text-yellow-300' : 'text-slate-300';
  const iconSrc = isSuccess 
    ? bossBattleAssets.victoryIcon
    : bossBattleAssets.defeatIcon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
        <img src={iconSrc} alt={title} className="w-16 h-16 object-contain mb-2" />
        <h2 className={`text-3xl font-bold ${titleColor} tracking-widest uppercase mb-4 text-shadow`}>{title}</h2>

        {isSuccess ? (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="font-sans text-slate-300/80 text-sm tracking-wide uppercase">Rewards Received</p>
            <div className="flex flex-row flex-wrap justify-center gap-3">
              <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6" />
                <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">You were defeated and received no rewards. Try upgrading your stats.</p>
        )}

        <hr className="w-full border-t border-slate-700/50 my-5" />
        <button onClick={onClose} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">
          Close
        </button>
      </div>
    </div>
  );
};


// --- MAIN BOSS BATTLE COMPONENT ---
export default function BossBattle({ 
  onClose, 
  onBattleEnd, 
  onFloorComplete,
}: BossBattleProps) {
  
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(true);
  const [playerInitialStats, setPlayerInitialStats] = useState<CombatStats | null>(null);
  const [activeSkills, setActiveSkills] = useState<ActiveSkill[]>([]);
  const [initialFloor, setInitialFloor] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  
  const [currentBossIndex, setCurrentBossIndex] = useState(0);
  const [playerStats, setPlayerStats] = useState<CombatStats>({ maxHp: 1, hp: 1, atk: 0, def: 0, maxEnergy: 50, energy: 50 });
  const [bossStats, setBossStats] = useState<CombatStats>(BOSS_DATA[0].stats);
  
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string }[]>([]);
  const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  const [sweepResult, setSweepResult] = useState<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null>(null);

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC HELPERS ---
  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
  const showFloatingText = (text: string, colorClass: string, isPlayerSide: boolean) => {
    const id = Date.now() + Math.random();
    const position = isPlayerSide ? 'left-[5%]' : 'right-[5%]'
    setDamages(prev => [...prev, { id, text, colorClass: `${position} ${colorClass}` }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  };
  
  // --- CORE BATTLE LOGIC FUNCTION ---
  const executeFullTurn = (currentPlayer: CombatStats, currentBoss: CombatStats, turn: number) => {
    const turnLogs: string[] = [];
    const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
    const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
    const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
    const calculateDamage = (atk: number, def: number) => Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
    
    let player = { ...currentPlayer };
    let boss = { ...currentBoss };
    let winner: 'win' | 'lose' | null = null;
    let turnEvents = { playerDmg: 0, playerHeal: 0, bossDmg: 0, bossReflectDmg: 0 };

    let atkMods = { boost: 1, armorPen: 0 };
    activeSkills.forEach(skill => {
        if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
            const effect = getSkillEffect(skill);
            log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> kích hoạt!`);
            if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
            if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;
        }
    });
    const playerDmg = calculateDamage(player.atk * atkMods.boost, Math.max(0, boss.def * (1 - atkMods.armorPen)));
    turnEvents.playerDmg = playerDmg;
    log(`Bạn tấn công, gây <b class="text-red-400">${playerDmg}</b> sát thương.`);
    boss.hp -= playerDmg;

    activeSkills.forEach(skill => {
        if (skill.id === 'life_steal' && checkActivation(skill.rarity)) {
            const healed = Math.ceil(playerDmg * (getSkillEffect(skill) / 100));
            const actualHeal = Math.min(healed, player.maxHp - player.hp);
            if (actualHeal > 0) {
                turnEvents.playerHeal = actualHeal;
                log(`<span class="text-green-400 font-bold">[Kỹ Năng] ${skill.name}</span> hút <b class="text-green-400">${actualHeal}</b> Máu.`);
                player.hp += actualHeal;
            }
        }
    });
    
    if (boss.hp <= 0) {
        boss.hp = 0; winner = 'win';
        log(`${BOSS_DATA[currentBossIndex].name} đã bị đánh bại!`);
        return { player, boss, turnLogs, winner, turnEvents };
    }

    const bossDmg = calculateDamage(boss.atk, player.def);
    turnEvents.bossDmg = bossDmg;
    log(`${BOSS_DATA[currentBossIndex].name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
    player.hp -= bossDmg;

    let totalReflectDmg = 0;
    activeSkills.forEach(skill => {
        if (skill.id === 'thorns' && checkActivation(skill.rarity)) {
            const reflectDmg = Math.ceil(bossDmg * (getSkillEffect(skill) / 100));
            totalReflectDmg += reflectDmg;
            log(`<span class="text-orange-400 font-bold">[Kỹ Năng] ${skill.name}</span> phản lại <b class="text-orange-400">${reflectDmg}</b> sát thương.`);
            boss.hp -= reflectDmg;
        }
    });
    if (totalReflectDmg > 0) turnEvents.bossReflectDmg = totalReflectDmg;

    if (player.hp <= 0) {
        player.hp = 0; winner = 'lose';
        log("Bạn đã gục ngã... THẤT BẠI!");
        return { player, boss, turnLogs, winner, turnEvents };
    }
    if (boss.hp <= 0) {
        boss.hp = 0; winner = 'win';
        log(`${BOSS_DATA[currentBossIndex].name} đã bị đánh bại!`);
    }

    return { player, boss, turnLogs, winner, turnEvents };
  };

  // --- BATTLE CONTROL FUNCTIONS ---
  const runBattleTurn = () => {
    const nextTurn = turnCounter + 1;
    const { player: newPlayer, boss: newBoss, turnLogs, winner, turnEvents } = executeFullTurn(playerStats, bossStats, nextTurn);
    
    if (turnEvents.playerDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.playerDmg)}`, 'text-red-500', false);
    if (turnEvents.playerHeal > 0) showFloatingText(`+${formatDamageText(turnEvents.playerHeal)}`, 'text-green-400', true);
    setTimeout(() => {
      if (turnEvents.bossDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.bossDmg)}`, 'text-red-500', true);
      if (turnEvents.bossReflectDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.bossReflectDmg)}`, 'text-orange-400', false);
    }, 500);

    setPlayerStats(newPlayer);
    setBossStats(newBoss);
    setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
    setTurnCounter(nextTurn);
    if (winner) endGame(winner);
  };
  
  const skipBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    let tempPlayer = { ...playerStats };
    let tempBoss = { ...bossStats };
    let tempTurn = turnCounter;
    let finalWinner: 'win' | 'lose' | null = null;
    const fullLog: string[] = [];
    while (finalWinner === null && tempTurn < turnCounter + 500) {
        tempTurn++;
        const turnResult = executeFullTurn(tempPlayer, tempBoss, tempTurn);
        tempPlayer = turnResult.player;
        tempBoss = turnResult.boss;
        finalWinner = turnResult.winner;
        fullLog.push(...turnResult.turnLogs);
    }
    if (!finalWinner) finalWinner = 'lose';
    setPlayerStats(tempPlayer);
    setBossStats(tempBoss);
    setCombatLog(prev => [...fullLog.reverse(), ...prev]);
    setTurnCounter(tempTurn);
    endGame(finalWinner);
  };

  const endGame = (result: 'win' | 'lose') => {
    if (gameOver) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setGameOver(result);
    setBattleState('finished');
    const rewards = BOSS_DATA[currentBossIndex].rewards || { coins: 0, energy: 0 };
    onBattleEnd(result, result === 'win' ? rewards : { coins: 0, energy: 0 });
    
    if (result === 'win' && playerStats.energy !== undefined && playerStats.maxEnergy !== undefined) {
        setPlayerStats(prev => ({
            ...prev,
            energy: Math.min(prev.maxEnergy!, (prev.energy || 0) + rewards.energy)
        }));
    }
  };

  const startGame = () => {
    if (battleState !== 'idle' || (playerStats.energy || 0) < 10) return;
    setPlayerStats(prev => ({ ...prev, energy: (prev.energy || 0) - 10 }));
    setBattleState('fighting');
  };
  
  const handleSweep = () => {
    if (currentBossIndex <= 0 || (playerStats.energy || 0) < 10 || !playerInitialStats) return;

    setPlayerStats(prev => ({ ...prev, energy: (prev.energy || 0) - 10 }));

    const previousBossData = BOSS_DATA[currentBossIndex - 1];
    let simPlayer = { ...playerInitialStats };
    let simBoss = { ...previousBossData.stats };
    let simTurn = 0;
    let finalWinner: 'win' | 'lose' | null = null;

    while (finalWinner === null && simTurn < 500) { 
        simTurn++;
        const turnResult = executeFullTurn(simPlayer, simBoss, simTurn);
        simPlayer = turnResult.player;
        simBoss = turnResult.boss;
        finalWinner = turnResult.winner;
    }
    if (!finalWinner) finalWinner = 'lose';

    const rewards = previousBossData.rewards || { coins: 0, energy: 0 };
    onBattleEnd(finalWinner, finalWinner === 'win' ? rewards : { coins: 0, energy: 0 });

    setSweepResult({
      result: finalWinner,
      rewards: finalWinner === 'win' ? rewards : { coins: 0, energy: 0 }
    });
  };

  const resetAllStateForNewBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
  }

  const retryCurrentFloor = () => {
    if (!playerInitialStats) return;
    resetAllStateForNewBattle();
    setPlayerStats(playerInitialStats); 
    setBossStats(BOSS_DATA[currentBossIndex].stats);
    setTimeout(() => addLog(`[Lượt 0] ${BOSS_DATA[currentBossIndex].name} đã xuất hiện.`), 100);
  };
  
  const handleNextFloor = () => {
    if (!playerInitialStats) return;
    const nextIndex = currentBossIndex + 1;
    if(nextIndex >= BOSS_DATA.length) return;
    
    resetAllStateForNewBattle();
    setCurrentBossIndex(nextIndex);
    onFloorComplete(nextIndex);
    
    setPlayerStats(prev => ({
      ...playerInitialStats, 
      hp: playerInitialStats.maxHp,
      energy: prev.energy 
    }));
    
    const nextBoss = BOSS_DATA[nextIndex];
    setBossStats(nextBoss.stats);
    addLog(`[Lượt 0] ${nextBoss.name} đã xuất hiện. Hãy chuẩn bị!`);
  }

  // --- REACT HOOKS ---
  useEffect(() => {
    const loadData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("User not authenticated, cannot start boss battle.");
        onClose();
        return;
      }
      try {
        const data = await fetchBossBattleData(userId);
        setPlayerInitialStats(data.battleStats);
        setPlayerStats(data.battleStats);
        setActiveSkills(data.equippedSkills);
        setInitialFloor(data.initialFloor);
        setCurrentBossIndex(data.initialFloor);
        setDisplayedCoins(data.displayedCoins);
        
        const currentBoss = BOSS_DATA[data.initialFloor];
        setBossStats(currentBoss.stats);
        addLog(`[Lượt 0] ${currentBoss.name} đã xuất hiện. Hãy chuẩn bị!`);

      } catch (error) {
        console.error("Failed to fetch boss battle data:", error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [onClose]);

  useEffect(() => {
    if (battleState === 'fighting' && !gameOver) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1200);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, gameOver, turnCounter]);

  // --- RENDER ---
  if (isLoading || !playerInitialStats) {
    return <LoadingScreen />;
  }
  
  const currentBossData = BOSS_DATA[currentBossIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } 
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
      `}</style>
      
      {sweepResult && (
        <SweepRewardsModal
          isSuccess={sweepResult.result === 'win'}
          rewards={sweepResult.rewards}
          onClose={() => setSweepResult(null)}
        />
      )}

      {statsModalTarget && <CharacterStatsModal character={statsModalTarget === 'player' ? playerStats : bossStats} characterType={statsModalTarget} onClose={() => setStatsModalTarget(null)}/>}
      {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
      {showRewardsModal && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home" title="Go Home">
                      <HomeIcon className="w-5 h-5 text-slate-300" />
                      <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 font-sans">
                    {playerStats.energy !== undefined && playerStats.maxEnergy !== undefined && (<EnergyDisplay currentEnergy={playerStats.energy} maxEnergy={playerStats.maxEnergy} isStatsFullscreen={false}/>)}
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                </div>
            </div>
        </header>

        <div className="fixed top-16 left-4 z-20 flex flex-col items-start gap-2">
            <PlayerInfoDisplay stats={playerStats} floor={currentBossData.floor} onAvatarClick={() => setStatsModalTarget('player')} />
            {battleState === 'idle' && currentBossIndex > 0 && (
                <button 
                    onClick={handleSweep} 
                    disabled={(playerStats.energy || 0) < 10} 
                    title="Instantly clear the previous floor for rewards" 
                    className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-purple-400 active:scale-95 shadow-md text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-700 animate-fade-in"
                >
                    Sweep Previous
                </button>
            )}
            {battleState === 'fighting' && !gameOver && (
                <button onClick={skipBattle} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300 animate-fade-in">
                    Skip Battle
                </button>
            )}
        </div>

        <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
            <div className="w-full max-w-2xl mx-auto mb-4 flex justify-between items-start min-h-[5rem]">
                <div></div>
                <div className="flex flex-col items-end gap-2">
                    <div className="w-full flex justify-center gap-2">
                        <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length || battleState !== 'idle'} className="w-10 h-10 p-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-full transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" title="View Last Battle Log">
                            <img src={bossBattleAssets.historyIcon} alt="Log" className="w-full h-full object-contain" />
                        </button>
                        <button onClick={() => setShowRewardsModal(true)} disabled={battleState !== 'idle'} className="w-10 h-10 p-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-full transition-all duration-200 border border-slate-600 hover:border-yellow-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" title="View Potential Rewards">
                            <img src={bossBattleAssets.rewardsIcon} alt="Rewards" className="w-full h-full object-contain" />
                        </button>
                    </div>
                </div>
            </div>
            
            {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} />))}

            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setStatsModalTarget('boss')} title="View Boss Stats">
                  <div className="relative group flex justify-center">
                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">BOSS</h2>
                    <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-900 text-sm text-center text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {currentBossData.name.toUpperCase()}
                    </div>
                  </div>
                  <div className="w-40 h-40 md:w-56 md:h-56">
                    <img src={`/images/boss/${String(currentBossData.id).padStart(2, '0')}.webp`} alt={currentBossData.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {battleState === 'idle' && (
                <button onClick={startGame} disabled={(playerStats.energy || 0) < 10} className="btn-shine relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg text-teal-300 border border-teal-500/40 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-lg tracking-widest uppercase">Fight</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80">
                            <span>10</span><img src={bossBattleAssets.energyIcon} alt="" className="w-3 h-3"/>
                        </div>
                    </div>
                </button>
                )}
                {battleState !== 'idle' && (
                  <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (<p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse' : 'text-slate-300'}`} dangerouslySetInnerHTML={{__html: entry}}></p>))}
                  </div>
                )}
            </div>

            {gameOver === 'win' && (<VictoryModal onRestart={retryCurrentFloor} onNextFloor={handleNextFloor} isLastBoss={currentBossIndex === BOSS_DATA.length - 1} rewards={currentBossData.rewards} />)}
            {gameOver === 'lose' && (<DefeatModal onRestart={retryCurrentFloor} />)}
        </main>
      </div>
    </>
  );
}
// --- END OF FILE boss.tsx ---
