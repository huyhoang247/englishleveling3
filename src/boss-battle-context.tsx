import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useRef, 
    useCallback, 
    ReactNode 
} from 'react';
import BOSS_DATA from './boss/bossData.ts';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from './home/skill-game/skill-data.tsx';

// --- TYPE DEFINITIONS ---
type ActiveSkill = OwnedSkill & SkillBlueprint;

export type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy?: number;
    energy?: number;
};

export interface BossBattleProps {
  onClose: () => void;
  playerInitialStats: CombatStats;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  initialFloor: number;
  onFloorComplete: (newFloor: number) => void;
  equippedSkills: ActiveSkill[];
  displayedCoins: number;
}

// --- CONTEXT TYPE DEFINITION ---
interface BossBattleContextType {
  // State
  playerStats: CombatStats;
  bossStats: CombatStats;
  combatLog: string[];
  previousCombatLog: string[];
  gameOver: 'win' | 'lose' | null;
  battleState: 'idle' | 'fighting' | 'finished';
  damages: { id: number; text: string; colorClass: string }[];
  statsModalTarget: 'player' | 'boss' | null;
  showLogModal: boolean;
  showRewardsModal: boolean;
  sweepResult: { result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null;
  currentBossData: typeof BOSS_DATA[0];
  isLastBoss: boolean;

  // Actions
  startGame: () => void;
  skipBattle: () => void;
  handleSweep: () => void;
  retryCurrentFloor: () => void;
  handleNextFloor: () => void;
  setStatsModalTarget: (target: 'player' | 'boss' | null) => void;
  setShowLogModal: (show: boolean) => void;
  setShowRewardsModal: (show: boolean) => void;
  setSweepResult: (result: { result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null) => void;
  handleClose: () => void;
  
  // Props passed down
  displayedCoins: number;
}

// --- BATTLE LOGIC HELPER (Pure function) ---
const executeFullTurn = (
    currentPlayer: CombatStats,
    currentBoss: CombatStats,
    turn: number,
    equippedSkills: ActiveSkill[],
    currentBossData: typeof BOSS_DATA[0]
) => {
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

    equippedSkills.forEach(skill => {
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

    equippedSkills.forEach(skill => {
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
        log(`${currentBossData.name} đã bị đánh bại!`);
        return { player, boss, turnLogs, winner, turnEvents };
    }

    const bossDmg = calculateDamage(boss.atk, player.def);
    turnEvents.bossDmg = bossDmg;
    log(`${currentBossData.name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
    player.hp -= bossDmg;

    let totalReflectDmg = 0;
    equippedSkills.forEach(skill => {
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
    } else if (boss.hp <= 0) {
        boss.hp = 0; winner = 'win';
        log(`${currentBossData.name} đã bị đánh bại!`);
    }

    return { player, boss, turnLogs, winner, turnEvents };
};

// --- CREATE CONTEXT ---
const BossBattleContext = createContext<BossBattleContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface BossBattleProviderProps extends BossBattleProps {
  children: ReactNode;
}

export const BossBattleProvider = ({ 
    children, 
    onClose, 
    playerInitialStats, 
    onBattleEnd, 
    initialFloor, 
    onFloorComplete, 
    equippedSkills, 
    displayedCoins 
}: BossBattleProviderProps) => {
  
  const [currentBossIndex, setCurrentBossIndex] = useState(initialFloor);
  const currentBossData = BOSS_DATA[currentBossIndex];
  const [playerStats, setPlayerStats] = useState<CombatStats>(playerInitialStats);
  const [bossStats, setBossStats] = useState<CombatStats>(currentBossData.stats);
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

  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  
  const addLog = useCallback((message: string) => {
    setCombatLog(prev => [message, ...prev].slice(0, 50));
  }, []);
  
  const showFloatingText = useCallback((text: string, colorClass: string, isPlayerSide: boolean) => {
    const id = Date.now() + Math.random();
    const position = isPlayerSide ? 'left-[5%]' : 'right-[5%]'
    setDamages(prev => [...prev, { id, text, colorClass: `${position} ${colorClass}` }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
  }, []);

  const endGame = useCallback((result: 'win' | 'lose') => {
    if (gameOver) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setGameOver(result);
    setBattleState('finished');
    const rewards = currentBossData.rewards || { coins: 0, energy: 0 };
    onBattleEnd(result, result === 'win' ? rewards : { coins: 0, energy: 0 });
    
    if (result === 'win' && playerStats.energy !== undefined && playerStats.maxEnergy !== undefined) {
        setPlayerStats(prev => ({
            ...prev,
            energy: Math.min(prev.maxEnergy!, (prev.energy || 0) + rewards.energy)
        }));
    }
  }, [gameOver, currentBossData.rewards, onBattleEnd, playerStats.energy, playerStats.maxEnergy]);
  
  const runBattleTurn = useCallback(() => {
    setTurnCounter(prevTurn => {
        const nextTurn = prevTurn + 1;
        setPlayerStats(prevPlayer => {
            setBossStats(prevBoss => {
                const { player: newPlayer, boss: newBoss, turnLogs, winner, turnEvents } = executeFullTurn(prevPlayer, prevBoss, nextTurn, equippedSkills, currentBossData);
    
                if (turnEvents.playerDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.playerDmg)}`, 'text-red-500', false);
                if (turnEvents.playerHeal > 0) showFloatingText(`+${formatDamageText(turnEvents.playerHeal)}`, 'text-green-400', true);
                setTimeout(() => {
                  if (turnEvents.bossDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.bossDmg)}`, 'text-red-500', true);
                  if (turnEvents.bossReflectDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.bossReflectDmg)}`, 'text-orange-400', false);
                }, 500);

                setCombatLog(prevLog => [...turnLogs.reverse(), ...prevLog]);
                if (winner) endGame(winner);
                setBossStats(newBoss);
                return newPlayer;
            });
            return prevPlayer; // This immediate return is temporary, the state update is async
        });
        return nextTurn;
    });
  }, [equippedSkills, currentBossData, showFloatingText, endGame]);
  
  const skipBattle = useCallback(() => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setBattleState('finished');
    let tempPlayer = { ...playerStats };
    let tempBoss = { ...bossStats };
    let tempTurn = turnCounter;
    let finalWinner: 'win' | 'lose' | null = null;
    const fullLog: string[] = [];
    while (finalWinner === null && tempTurn < turnCounter + 500) {
        tempTurn++;
        const turnResult = executeFullTurn(tempPlayer, tempBoss, tempTurn, equippedSkills, currentBossData);
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
  }, [playerStats, bossStats, turnCounter, equippedSkills, currentBossData, endGame]);

  const startGame = useCallback(() => {
    if (battleState !== 'idle' || (playerStats.energy || 0) < 10) return;
    setPlayerStats(prev => ({ ...prev, energy: (prev.energy || 0) - 10 }));
    setBattleState('fighting');
  }, [battleState, playerStats.energy]);
  
  const handleSweep = useCallback(() => {
    if (currentBossIndex <= 0 || (playerStats.energy || 0) < 10) return;
    setPlayerStats(prev => ({ ...prev, energy: (prev.energy || 0) - 10 }));
    const previousBossData = BOSS_DATA[currentBossIndex - 1];
    let simPlayer = { ...playerInitialStats };
    let simBoss = { ...previousBossData.stats };
    let simTurn = 0;
    let finalWinner: 'win' | 'lose' | null = null;
    while (finalWinner === null && simTurn < 500) { 
        simTurn++;
        const turnResult = executeFullTurn(simPlayer, simBoss, simTurn, equippedSkills, previousBossData);
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
  }, [currentBossIndex, playerStats.energy, playerInitialStats, equippedSkills, onBattleEnd]);

  const resetAllStateForNewBattle = useCallback(() => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
  }, [combatLog]);

  const retryCurrentFloor = useCallback(() => {
    resetAllStateForNewBattle();
    setPlayerStats(playerInitialStats); 
    setBossStats(BOSS_DATA[currentBossIndex].stats);
    setTimeout(() => addLog(`[Lượt 0] ${BOSS_DATA[currentBossIndex].name} đã xuất hiện.`), 100);
  }, [resetAllStateForNewBattle, playerInitialStats, currentBossIndex, addLog]);
  
  const handleNextFloor = useCallback(() => {
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
  }, [currentBossIndex, resetAllStateForNewBattle, onFloorComplete, playerInitialStats]);

  useEffect(() => { setCurrentBossIndex(initialFloor); }, [initialFloor]);
  useEffect(() => { setPlayerStats(playerInitialStats); }, [playerInitialStats]);
  useEffect(() => {
    setBossStats(BOSS_DATA[currentBossIndex].stats);
    addLog(`[Lượt 0] ${BOSS_DATA[currentBossIndex].name} đã xuất hiện. Hãy chuẩn bị!`);
  }, [currentBossIndex, addLog]);

  useEffect(() => {
    if (battleState === 'fighting' && !gameOver) {
      battleIntervalRef.current = setInterval(runBattleTurn, 1200);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, gameOver, runBattleTurn]);

  const value: BossBattleContextType = {
    playerStats, bossStats, combatLog, previousCombatLog, gameOver, battleState, damages, statsModalTarget, showLogModal, showRewardsModal, sweepResult, currentBossData,
    isLastBoss: currentBossIndex === BOSS_DATA.length - 1,
    startGame, skipBattle, handleSweep, retryCurrentFloor, handleNextFloor, setStatsModalTarget, setShowLogModal, setShowRewardsModal, setSweepResult,
    handleClose: onClose,
    displayedCoins,
  };

  return (
    <BossBattleContext.Provider value={value}>
      {children}
    </BossBattleContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useBossBattle = () => {
  const context = useContext(BossBattleContext);
  if (context === undefined) {
    throw new Error('useBossBattle must be used within a BossBattleProvider');
  }
  return context;
};
