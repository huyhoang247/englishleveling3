// --- START OF FILE tower-context.tsx ---

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import BOSS_DATA from './tower-data.ts';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from '../skill-game/skill-data.tsx';
import { useGame } from '../../GameContext.tsx';

// --- TYPE DEFINITIONS ---
export type ActiveSkill = OwnedSkill & SkillBlueprint;

export type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy: number; 
    energy: number;    
};

export type TurnEvents = {
    playerDmg: number;
    playerHeal: number;
    bossDmg: number;
    bossReflectDmg: number;
    timestamp: number; 
};

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
    triggerNextTurn: () => void; // Hàm mới để UI gọi khi hết animation
}

type BossBattleContextType = BossBattleState & BossBattleActions;

const BossBattleContext = createContext<BossBattleContextType | undefined>(undefined);

export const BossBattleProvider = ({ children }: { children: ReactNode }) => {
    const game = useGame();

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
    const isEndingGame = useRef(false); 

    const currentBossData = BOSS_DATA[currentFloor] || null;

    // --- LOGIC HELPERS ---
    const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));

    // --- CORE BATTLE CALCULATION (Tính toán 1 lượt) ---
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

        // 1. Player Attack Phase
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

        // Life Steal
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
        
        // Check Boss Death
        if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
            return { player, boss, turnLogs, winner, turnEvents };
        }

        // 2. Boss Attack Phase
        const bossDmg = calculateDamage(boss.atk, player.def);
        turnEvents.bossDmg = bossDmg;
        log(`${currentBossData?.name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
        player.hp -= bossDmg;

        // Thorns (Reflect)
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

        // Final Check
        if (player.hp <= 0) {
            player.hp = 0; winner = 'lose';
            log("Bạn đã gục ngã... THẤT BẠI!");
        } else if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
        }

        return { player, boss, turnLogs, winner, turnEvents };
    }, [equippedSkills, currentBossData]);

    // --- END GAME HANDLER ---
    const endGame = useCallback((result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        setGameOver(result);
        setBattleState('finished');

        const rewards = currentBossData?.rewards || { coins: 0, energy: 0 };
        const finalRewards = result === 'win' ? rewards : { coins: 0, energy: 0 };
        
        if (result === 'win' && finalRewards.coins > 0) {
            game.updateUserCurrency({ coins: game.coins + finalRewards.coins });
        }
        
        if (result === 'win') {
            setDisplayedCoins(prev => prev + finalRewards.coins);
            setPlayerStats(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    energy: Math.min(prev.maxEnergy, prev.energy + finalRewards.energy)
                };
            });
        }
    }, [currentBossData, game]);

    // --- PROCESS TURN (Hàm xử lý logic, không lặp) ---
    const processTurn = useCallback(() => {
        if (!playerStats || !bossStats || gameOver) return;

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
    }, [turnCounter, playerStats, bossStats, executeFullTurn, endGame, gameOver]);

    // --- PUBLIC ACTIONS ---

    // 1. Skip Battle: Tính toán nhanh kết quả
    const skipBattle = useCallback(() => {
        if (!playerStats || !bossStats) return;

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
    
    // 2. Start Game: Trừ energy và chạy turn đầu tiên
    const startGame = useCallback(() => {
        if (battleState !== 'idle' || (playerStats?.energy || 0) < 10) return;
        isEndingGame.current = false;
        setPlayerStats(prev => {
            if (!prev) return null;
            return { ...prev, energy: prev.energy - 10 };
        });
        setBattleState('fighting');
        // Gọi turn đầu tiên ngay lập tức để UI có dữ liệu render
        processTurn(); 
    }, [battleState, playerStats, processTurn]);

    // 3. Trigger Next Turn: UI gọi hàm này khi animation xong
    const triggerNextTurn = useCallback(() => {
        if (battleState === 'fighting' && !gameOver) {
            processTurn();
        }
    }, [battleState, gameOver, processTurn]);

    // 4. Retry
    const resetAllStateForNewBattle = useCallback(() => {
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

    // 5. Next Floor
    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        resetAllStateForNewBattle();
        game.handleBossFloorUpdate(nextIndex); 
        setCurrentFloor(nextIndex);
        
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
    }, [currentFloor, resetAllStateForNewBattle, game]);

    // 6. Sweep
    const handleSweep = useCallback(async () => {
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose', rewards: { coins: 0, energy: 0 } };
        }
    
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: prev.energy - 10 }
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
        
        if (finalWinner === 'win' && finalRewards.coins > 0) {
            game.updateUserCurrency({ coins: game.coins + finalRewards.coins });
        }
    
        if (finalWinner === 'win') {
          setDisplayedCoins(prev => prev + finalRewards.coins);
          setPlayerStats(prev => {
              if(!prev) return null;
              return {
                  ...prev,
                  energy: Math.min(prev.maxEnergy, prev.energy + finalRewards.energy)
              }
          });
        }
        return { result: finalWinner, rewards: finalRewards };
    }, [playerStats, currentFloor, executeFullTurn, game]);

    // --- INITIALIZATION ---
    useEffect(() => {
        if (game.isLoadingUserData) {
            setIsLoading(true);
            return;
        }
        const startTime = Date.now();
        try {
            const playerBattleStats = game.getPlayerBattleStats();
            setPlayerStats(playerBattleStats);
            initialPlayerStatsRef.current = playerBattleStats;
    
            const skillsDetails = game.getEquippedSkillsDetails();
            setEquippedSkills(skillsDetails as ActiveSkill[]);
    
            setCurrentFloor(game.bossBattleHighestFloor);
            setDisplayedCoins(game.coins);
            setError(null);
        } catch (e) {
            console.error("Failed to initialize boss battle from context:", e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 700 - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(() => setIsLoading(false), remainingTime);
            } else {
                setIsLoading(false);
            }
        }
    }, [game.isLoadingUserData, game.bossBattleHighestFloor, game.coins]);

    useEffect(() => {
        if (!isLoading && currentBossData) {
          setBossStats(currentBossData.stats);
          setCombatLog([]);
          addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện. Hãy chuẩn bị!`);
        }
    }, [currentFloor, isLoading, currentBossData]);

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
        triggerNextTurn,
    };
    
    return (
        <BossBattleContext.Provider value={value}>
            {children}
        </BossBattleContext.Provider>
    );
};

export const useBossBattle = (): BossBattleContextType => {
    const context = useContext(BossBattleContext);
    if (context === undefined) {
        throw new Error('useBossBattle must be used within a BossBattleProvider');
    }
    return context;
};
