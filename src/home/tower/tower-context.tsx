// --- START OF FILE tower-context.tsx (MODIFIED) ---

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import BOSS_DATA from './tower-data.ts';
import { 
    ALL_SKILLS,
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from '../../home/skill-game/skill-data.tsx';
// --- MODIFICATION: Changed the import source ---
import { fetchBossBattlePrerequisites } from './tower-service.ts';
import { calculateTotalStatValue, statConfig } from '../../home/upgrade-stats/upgrade-ui.tsx';

// --- TYPE DEFINITIONS ---
export type ActiveSkill = OwnedSkill & SkillBlueprint;

export type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy?: number;
    energy?: number;
};

export interface BossBattleProps {
  userId: string;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// Dữ liệu sự kiện cho mỗi lượt đánh để UI có thể hiển thị hiệu ứng
export type TurnEvents = {
    playerDmg: number;
    playerHeal: number;
    bossDmg: number;
    bossReflectDmg: number;
    timestamp: number; // Để đảm bảo useEffect luôn chạy
};

// --- ĐỊNH NGHĨA STATE VÀ ACTIONS CHO CONTEXT ---
interface BossBattleState {
    isLoading: boolean;
    error: string | null;
    playerStats: CombatStats | null;
    bossStats: CombatStats | null;
    currentFloor: number;
    displayedCoins: number;
    combatLog: string[];
    previousCombatLog: string[];
    gameOver: 'win' | 'lose' | null;
    battleState: 'idle' | 'fighting' | 'finished';
    currentBossData: typeof BOSS_DATA[number] | null;
    lastTurnEvents: TurnEvents | null;
}

interface BossBattleActions {
    startGame: () => void;
    skipBattle: () => void;
    retryCurrentFloor: () => void;
    handleNextFloor: () => void;
    handleSweep: () => Promise<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } }>;
}

type BossBattleContextType = BossBattleState & BossBattleActions;

// --- TẠO CONTEXT ---
const BossBattleContext = createContext<BossBattleContextType | undefined>(undefined);

// --- TẠO PROVIDER COMPONENT ---
export const BossBattleProvider = ({ 
    children,
    userId,
    onBattleEnd,
    onFloorComplete
}: { children: ReactNode } & Omit<BossBattleProps, 'onClose'>) => {

    // --- STATE MANAGEMENT ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playerStats, setPlayerStats] = useState<CombatStats | null>(null);
    const [bossStats, setBossStats] = useState<CombatStats | null>(null);
    const [equippedSkills, setEquippedSkills] = useState<ActiveSkill[]>([]);
    const [currentFloor, setCurrentFloor] = useState(0);
    const [displayedCoins, setDisplayedCoins] = useState(0);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
    const [turnCounter, setTurnCounter] = useState(0);
    const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
    const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
    const [lastTurnEvents, setLastTurnEvents] = useState<TurnEvents | null>(null);

    const initialPlayerStatsRef = useRef<CombatStats | null>(null);
    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isEndingGame = useRef(false); // Ref để tránh gọi endGame nhiều lần
    
    // --- FIX: Create a ref to hold the latest version of the battle turn callback ---
    const savedCallback = useRef<() => void>();

    const currentBossData = BOSS_DATA[currentFloor] || null;

    // --- LOGIC HELPERS ---
    const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));

    // --- CORE BATTLE LOGIC FUNCTION ---
    const executeFullTurn = useCallback((currentPlayer: CombatStats, currentBoss: CombatStats, turn: number) => {
        const turnLogs: string[] = [];
        const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
        const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
        const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
        const calculateDamage = (atk: number, def: number) => Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
        
        let player = { ...currentPlayer };
        let boss = { ...currentBoss };
        let winner: 'win' | 'lose' | null = null;
        let turnEvents: Omit<TurnEvents, 'timestamp'> = { playerDmg: 0, playerHeal: 0, bossDmg: 0, bossReflectDmg: 0 };

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
            log(`${currentBossData?.name} đã bị đánh bại!`);
            return { player, boss, turnLogs, winner, turnEvents };
        }

        const bossDmg = calculateDamage(boss.atk, player.def);
        turnEvents.bossDmg = bossDmg;
        log(`${currentBossData?.name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
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
            log(`${currentBossData?.name} đã bị đánh bại!`);
        }

        return { player, boss, turnLogs, winner, turnEvents };
    }, [equippedSkills, currentBossData]);

    const endGame = useCallback((result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setGameOver(result);
        setBattleState('finished');

        const rewards = currentBossData?.rewards || { coins: 0, energy: 0 };
        const finalRewards = result === 'win' ? rewards : { coins: 0, energy: 0 };
        
        onBattleEnd(result, finalRewards);
        
        if (result === 'win') {
            setDisplayedCoins(prev => prev + finalRewards.coins);
            setPlayerStats(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    energy: Math.min(prev.maxEnergy!, (prev.energy || 0) + finalRewards.energy)
                };
            });
        }
    }, [currentBossData, onBattleEnd]);

    const runBattleTurn = useCallback(() => {
        if (!playerStats || !bossStats) return;

        const nextTurn = turnCounter + 1;
        const { player: newPlayer, boss: newBoss, turnLogs, winner, turnEvents } = executeFullTurn(playerStats, bossStats, nextTurn);
        
        setPlayerStats(newPlayer);
        setBossStats(newBoss);
        setLastTurnEvents({ ...turnEvents, timestamp: Date.now() });
        setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
        setTurnCounter(nextTurn);
        if (winner) {
            endGame(winner);
        }
    }, [turnCounter, playerStats, bossStats, executeFullTurn, endGame]);

    const skipBattle = useCallback(() => {
        if (!playerStats || !bossStats) return;
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

        setBattleState('finished');
        let tempPlayer = { ...playerStats };
        let tempBoss = { ...bossStats };
        let tempTurn = turnCounter;
        let finalWinner: 'win' | 'lose' | null = null;
        const fullLog: string[] = [];

        while (finalWinner === null && tempTurn < turnCounter + 500) {
            tempTurn++;
            const { player, boss, winner, turnLogs } = executeFullTurn(tempPlayer, tempBoss, tempTurn);
            tempPlayer = player;
            tempBoss = boss;
            finalWinner = winner;
            fullLog.push(...turnLogs);
        }
        if (!finalWinner) finalWinner = 'lose';

        setPlayerStats(tempPlayer);
        setBossStats(tempBoss);
        setCombatLog(prev => [...fullLog.reverse(), ...prev]);
        setTurnCounter(tempTurn);
        endGame(finalWinner);
    }, [playerStats, bossStats, turnCounter, executeFullTurn, endGame]);
    
    const startGame = useCallback(() => {
        if (battleState !== 'idle' || (playerStats?.energy || 0) < 10) return;
        isEndingGame.current = false;
        setPlayerStats(prev => {
            if (!prev) return null;
            return { ...prev, energy: (prev.energy || 0) - 10 };
        });
        setBattleState('fighting');
    }, [battleState, playerStats]);

    const resetAllStateForNewBattle = useCallback(() => {
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setPreviousCombatLog(combatLog);
        setCombatLog([]);
        setTurnCounter(0);
        setGameOver(null);
        setBattleState('idle');
        setLastTurnEvents(null);
        isEndingGame.current = false;
    }, [combatLog]);

    const retryCurrentFloor = useCallback(() => {
        resetAllStateForNewBattle();
        if (initialPlayerStatsRef.current) {
            setPlayerStats(prev => ({
                ...initialPlayerStatsRef.current!,
                energy: prev?.energy ?? initialPlayerStatsRef.current!.energy
            }));
        }
        if(currentBossData) {
            setBossStats(currentBossData.stats);
            setTimeout(() => addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện.`), 100);
        }
    }, [resetAllStateForNewBattle, currentBossData]);

    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        resetAllStateForNewBattle();
        onFloorComplete(nextIndex);
        setCurrentFloor(nextIndex);
        
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
    }, [currentFloor, resetAllStateForNewBattle, onFloorComplete]);

    const handleSweep = useCallback(async () => {
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose', rewards: { coins: 0, energy: 0 } };
        }
    
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: (prev.energy || 0) - 10 }
        });
    
        const previousBossData = BOSS_DATA[currentFloor - 1];
        let simPlayer = { ...initialPlayerStatsRef.current };
        let simBoss = { ...previousBossData.stats };
        let simTurn = 0;
        let finalWinner: 'win' | 'lose' | null = null;
    
        while (finalWinner === null && simTurn < 500) { 
            simTurn++;
            const { player, boss, winner } = executeFullTurn(simPlayer, simBoss, simTurn);
            simPlayer = player;
            simBoss = boss;
            finalWinner = winner;
        }
        if (!finalWinner) finalWinner = 'lose';
    
        const rewards = previousBossData.rewards || { coins: 0, energy: 0 };
        const finalRewards = finalWinner === 'win' ? rewards : { coins: 0, energy: 0 };
        onBattleEnd(finalWinner, finalRewards);
    
        if (finalWinner === 'win') {
          setDisplayedCoins(prev => prev + finalRewards.coins);
          setPlayerStats(prev => {
              if(!prev) return null;
              return {
                  ...prev!,
                  energy: Math.min(prev!.maxEnergy!, (prev!.energy || 0) + finalRewards.energy)
              }
          });
        }
        return { result: finalWinner, rewards: finalRewards };
    }, [playerStats, currentFloor, executeFullTurn, onBattleEnd]);

    // --- REACT HOOKS ---

    // --- FIX: Store the latest callback in the ref ---
    useEffect(() => {
        savedCallback.current = runBattleTurn;
    }, [runBattleTurn]);

    useEffect(() => {
        const loadData = async () => {
          const startTime = Date.now(); // Record start time for minimum loading
          try {
            setIsLoading(true);
            const data = await fetchBossBattlePrerequisites(userId);
    
            const BASE_HP = 0, BASE_ATK = 0, BASE_DEF = 0;
            const bonusHp = calculateTotalStatValue(data.baseStats.hp, statConfig.hp.baseUpgradeBonus);
            const bonusAtk = calculateTotalStatValue(data.baseStats.atk, statConfig.atk.baseUpgradeBonus);
            const bonusDef = calculateTotalStatValue(data.baseStats.def, statConfig.def.baseUpgradeBonus);
            let itemHpBonus = 0, itemAtkBonus = 0, itemDefBonus = 0;
    
            Object.values(data.equipment.equipped).forEach(itemId => { 
                if(itemId){
                    const item = data.equipment.owned.find(i => i.id === itemId);
                    if (item) { 
                        itemHpBonus += item.stats.hp || 0; 
                        itemAtkBonus += item.stats.atk || 0; 
                        itemDefBonus += item.stats.def || 0; 
                    }
                }
            });
            const calculatedStats: CombatStats = { maxHp: BASE_HP + bonusHp + itemHpBonus, hp: BASE_HP + bonusHp + itemHpBonus, atk: BASE_ATK + bonusAtk + itemAtkBonus, def: BASE_DEF + bonusDef + itemDefBonus, maxEnergy: 50, energy: 50 };
            setPlayerStats(calculatedStats);
            initialPlayerStatsRef.current = calculatedStats;
    
            const skillsDetails = data.skills.equipped.map(equippedId => { if (!equippedId) return null; const owned = data.skills.owned.find(s => s.id === equippedId); if (!owned) return null; const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId); if (!blueprint) return null; return { ...owned, ...blueprint }; }).filter((skill): skill is ActiveSkill => skill !== null);
            setEquippedSkills(skillsDetails);
    
            setCurrentFloor(data.bossBattleHighestFloor);
            setDisplayedCoins(data.coins);
    
          } catch (e) {
            console.error("Failed to load boss battle data:", e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
          } finally {
            // --- MODIFIED: Ensure minimum loading time of 0.7s ---
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 700 - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(() => setIsLoading(false), remainingTime);
            } else {
                setIsLoading(false);
            }
          }
        };
    
        loadData();
    }, [userId]);

    useEffect(() => {
        if (!isLoading && currentBossData) {
          setBossStats(currentBossData.stats);
          setCombatLog([]);
          addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện. Hãy chuẩn bị!`);
        }
    }, [currentFloor, isLoading, currentBossData]);
    
    // --- FIX: Modified useEffect to use the ref, preventing stale closure ---
    useEffect(() => {
        if (battleState === 'fighting' && !gameOver) {
          // The interval calls the function from the ref, which is always up-to-date.
          battleIntervalRef.current = setInterval(() => {
              if(savedCallback.current) {
                savedCallback.current();
              }
          }, 1200);
        }
        return () => {
          if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        };
    }, [battleState, gameOver]); // Removed `runBattleTurn` from dependencies


    // --- CUNG CẤP VALUE CHO CONTEXT ---
    const value: BossBattleContextType = {
        isLoading,
        error,
        playerStats,
        bossStats,
        currentFloor,
        displayedCoins,
        combatLog,
        previousCombatLog,
        gameOver,
        battleState,
        currentBossData,
        lastTurnEvents,
        startGame,
        skipBattle,
        retryCurrentFloor,
        handleNextFloor,
        handleSweep,
    };
    
    return (
        <BossBattleContext.Provider value={value}>
            {children}
        </BossBattleContext.Provider>
    );
};

// --- CUSTOM HOOK ĐỂ SỬ DỤNG CONTEXT ---
export const useBossBattle = (): BossBattleContextType => {
    const context = useContext(BossBattleContext);
    if (context === undefined) {
        throw new Error('useBossBattle must be used within a BossBattleProvider');
    }
    return context;
};

// --- END OF FILE tower-context.tsx (MODIFIED) ---
