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

// Dữ liệu sự kiện cho mỗi lượt đánh để UI có thể hiển thị hiệu ứng
export type TurnEvents = {
    playerDmg: number;      // Tổng sát thương (Hit 1 + Hit 2 + Hit 3)
    playerDmgHit1: number;  // Sát thương quả cầu 1 (100%)
    playerDmgHit2: number;  // Sát thương quả cầu 2 (50-100% của hit 1)
    playerDmgHit3: number;  // Sát thương quả cầu 3 (25-50% của hit 1)
    playerHeal: number;
    bossDmg: number;
    bossReflectDmg: number;
    timestamp: number;      // Để đảm bảo useEffect luôn chạy
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
export const BossBattleProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
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
    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isEndingGame = useRef(false); 
    const savedCallback = useRef<() => void>();

    // --- FIX AN TOÀN: Đảm bảo luôn lấy được Boss Data hợp lệ ---
    const safeIndex = Math.min(Math.max(0, currentFloor), BOSS_DATA.length - 1);
    const currentBossData = BOSS_DATA[safeIndex] || BOSS_DATA[0];

    // --- LOGIC HELPERS ---
    const addLog = useCallback((message: string) => {
        setCombatLog(prev => [message, ...prev].slice(0, 50));
    }, []);

    // --- CORE BATTLE LOGIC FUNCTION ---
    const executeFullTurn = useCallback((currentPlayer: CombatStats, currentBoss: CombatStats, turn: number) => {
        const turnLogs: string[] = [];
        const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
        const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
        const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
        
        // Công thức damage có tính ngẫu nhiên (80% - 120%)
        const calculateDamage = (atk: number, def: number) => Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
        
        let player = { ...currentPlayer };
        let boss = { ...currentBoss };
        let winner: 'win' | 'lose' | null = null;
        
        let turnEvents: Omit<TurnEvents, 'timestamp'> = { 
            playerDmg: 0, 
            playerDmgHit1: 0, 
            playerDmgHit2: 0, 
            playerDmgHit3: 0,
            playerHeal: 0, 
            bossDmg: 0, 
            bossReflectDmg: 0 
        };

        // --- 1. TÍNH DAMAGE PLAYER ---
        let atkMods = { boost: 1, armorPen: 0 };
        equippedSkills.forEach(skill => {
            if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
                const effect = getSkillEffect(skill);
                log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> kích hoạt!`);
                if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
                if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;
            }
        });

        // Hit 1: Sát thương cơ bản
        const baseDmg = calculateDamage(player.atk * atkMods.boost, Math.max(0, boss.def * (1 - atkMods.armorPen)));
        
        // Hit 2: Random từ 50% đến 100% của Hit 1
        const bonusFactor2 = 0.5 + (Math.random() * 0.5); 
        const dmgHit2 = Math.floor(baseDmg * bonusFactor2);

        // Hit 3: Random từ 25% đến 50% của Hit 1
        const bonusFactor3 = 0.25 + (Math.random() * 0.25);
        const dmgHit3 = Math.floor(baseDmg * bonusFactor3);

        const totalPlayerDmg = baseDmg + dmgHit2 + dmgHit3;

        turnEvents.playerDmg = totalPlayerDmg;
        turnEvents.playerDmgHit1 = baseDmg;
        turnEvents.playerDmgHit2 = dmgHit2;
        turnEvents.playerDmgHit3 = dmgHit3;

        log(`Bạn tấn công 3 lần, tổng gây <b class="text-red-400">${totalPlayerDmg}</b> sát thương.`);
        boss.hp -= totalPlayerDmg;

        // --- XỬ LÝ KỸ NĂNG HÚT MÁU ---
        equippedSkills.forEach(skill => {
            if (skill.id === 'life_steal' && checkActivation(skill.rarity)) {
                const healed = Math.ceil(totalPlayerDmg * (getSkillEffect(skill) / 100));
                const actualHeal = Math.min(healed, player.maxHp - player.hp);
                if (actualHeal > 0) {
                    turnEvents.playerHeal = actualHeal;
                    log(`<span class="text-green-400 font-bold">[Kỹ Năng] ${skill.name}</span> hút <b class="text-green-400">${actualHeal}</b> Máu.`);
                    player.hp += actualHeal;
                }
            }
        });
        
        // --- KIỂM TRA BOSS CHẾT ---
        if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
            return { player, boss, turnLogs, winner, turnEvents };
        }

        // --- BOSS TẤN CÔNG LẠI ---
        const bossDmg = calculateDamage(boss.atk, player.def);
        turnEvents.bossDmg = bossDmg;
        log(`${currentBossData?.name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
        player.hp -= bossDmg;

        // --- XỬ LÝ PHẢN ĐÒN ---
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

        // --- KIỂM TRA KẾT QUẢ CUỐI CÙNG ---
        if (player.hp <= 0) {
            player.hp = 0; winner = 'lose';
            log("Bạn đã gục ngã... THẤT BẠI!");
        } else if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
        }

        return { player, boss, turnLogs, winner, turnEvents };
    }, [equippedSkills, currentBossData]);

    // --- GAME CONTROL FUNCTIONS ---
    const endGame = useCallback((result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setGameOver(result);
        setBattleState('finished');

        const rewards = currentBossData?.rewards || { coins: 0, energy: 0 };
        const finalRewards = result === 'win' ? rewards : { coins: 0, energy: 0 };
        
        // --- SỬA LỖI Ở ĐÂY: DÙNG updateCoins thay vì updateUserCurrency ---
        if (result === 'win' && finalRewards.coins > 0) {
            // Sử dụng updateCoins để đồng bộ lên server
            game.updateCoins(finalRewards.coins);
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

        // Chạy vòng lặp giả lập cho đến khi có kết quả hoặc hết 500 lượt
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
            return { ...prev, energy: prev.energy - 10 };
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
    }, [resetAllStateForNewBattle, currentBossData, addLog]);

    // --- LOGIC CHUYỂN TẦNG MỚI ---
    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        // 1. Reset state (bao gồm setGameOver về null)
        resetAllStateForNewBattle();
        
        // 2. Update Floor Index trong Game Context
        game.handleBossFloorUpdate(nextIndex);
        setCurrentFloor(nextIndex);
        
        // 3. Reset Player Stats (Hồi đầy HP, giữ nguyên Energy hiện tại)
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
        
        // 4. Set Boss Stats explicitly cho tầng mới ngay lập tức
        const nextBossData = BOSS_DATA[nextIndex];
        if (nextBossData) {
             setBossStats(nextBossData.stats);
        }
    }, [currentFloor, resetAllStateForNewBattle, game]);

    // --- LOGIC SWEEP (QUÉT) MỚI: AUTO WIN ---
    const handleSweep = useCallback(async () => {
        // Validation: Cần data gốc, không ở tầng 1, và đủ năng lượng
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose', rewards: { coins: 0, energy: 0 } };
        }
    
        // 1. Trừ năng lượng trước
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: prev.energy - 10 }
        });
    
        // 2. Lấy data boss tầng trước (Vì sweep là quét tầng đã qua)
        // Chú ý: Ở đây ta lấy phần thưởng của tầng trước (currentFloor - 1)
        const previousBossData = BOSS_DATA[currentFloor - 1];
        
        // 3. FORCE WIN: Mặc định là thắng và nhận thưởng
        const finalWinner = 'win';
        const rewards = previousBossData.rewards || { coins: 0, energy: 0 };
        
        // 4. Cập nhật Coins cho User
        if (rewards.coins > 0) {
            // --- SỬA LỖI Ở ĐÂY: Gọi updateCoins và await kết quả ---
            await game.updateCoins(rewards.coins);
        }
    
        // 5. Cập nhật UI và Player Stats
        setDisplayedCoins(prev => prev + rewards.coins);
        setPlayerStats(prev => {
            if(!prev) return null;
            return {
                ...prev,
                // Giữ nguyên các stats khác, chỉ cộng thêm energy (nếu có thưởng energy)
                energy: Math.min(prev.maxEnergy, prev.energy + rewards.energy)
            }
        });
        
        // 6. Trả về kết quả thắng ngay lập tức
        return { result: finalWinner, rewards: rewards };
    }, [playerStats, currentFloor, game]);

    // --- REACT HOOKS & EFFECTS ---
    
    // Lưu callback mới nhất để dùng trong interval
    useEffect(() => {
        savedCallback.current = runBattleTurn;
    }, [runBattleTurn]);

    // Init Data khi vào màn chơi
    useEffect(() => {
        if (game.isLoadingUserData) {
            setIsLoading(true);
            return;
        }
        
        const startTime = Date.now();
        
        try {
            let safeFloor = game.bossBattleHighestFloor;
            if (safeFloor >= BOSS_DATA.length) {
                safeFloor = BOSS_DATA.length - 1;
            }
            setCurrentFloor(safeFloor);

            let stats = game.getPlayerBattleStats();
            if (!stats) {
                // Fallback nếu chưa có stats
                stats = {
                    maxHp: 1000,
                    hp: 1000,
                    atk: 50,
                    def: 10,
                    maxEnergy: 100,
                    energy: 100
                };
            }
            
            setPlayerStats(stats);
            initialPlayerStatsRef.current = stats;
    
            const skillsDetails = game.getEquippedSkillsDetails();
            setEquippedSkills(skillsDetails as ActiveSkill[]);
    
            const initialBossData = BOSS_DATA[safeFloor];
            if (initialBossData) {
                setBossStats(initialBossData.stats);
            }

            setDisplayedCoins(game.coins);
            setError(null);

        } catch (e) {
            console.error("Failed to initialize boss battle from context:", e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 700 - elapsedTime; // Minimum loading time

            if (remainingTime > 0) {
                setTimeout(() => setIsLoading(false), remainingTime);
            } else {
                setIsLoading(false);
            }
        }
    }, [game.isLoadingUserData, game.bossBattleHighestFloor, game.coins]);

    // Update Boss Stats khi đổi tầng
    useEffect(() => {
        if (!isLoading && currentBossData) {
          setBossStats(prev => {
              if (battleState === 'idle') return currentBossData.stats;
              return prev;
          });
          setCombatLog([]);
          addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện. Hãy chuẩn bị!`);
        }
    }, [currentFloor, isLoading, currentBossData, battleState, addLog]);
    
    // Interval Loop cho Battle (5500ms)
    useEffect(() => {
        if (battleState === 'fighting' && !gameOver) {
          // Chạy ngay lượt đầu tiên
          if(savedCallback.current) {
            savedCallback.current();
          }

          battleIntervalRef.current = setInterval(() => {
              if(savedCallback.current) {
                savedCallback.current();
              }
          }, 5500); 
        }
        return () => {
          if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        };
    }, [battleState, gameOver]);


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

// --- END OF FILE tower-context.tsx ---
