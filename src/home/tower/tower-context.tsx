// --- START OF FILE tower-context.tsx ---

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import BOSS_DATA from './tower-data.ts';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor,
    ALL_SKILLS 
} from '../skill-game/skill-data.tsx';
import { useGame } from '../../GameContext.tsx';

// --- IMPORT SERVICE ---
import { calculateResourceRewards, claimTowerRewards, BattleRewards } from './tower-service.ts';

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
    
    // Danh sách kỹ năng kích hoạt trong lượt này
    playerActivatedSkills: { 
        id: string; 
        name: string; 
        rarity: string; 
        type: 'offensive' | 'defensive'; 
    }[];
    bossActivatedSkills: { 
        id: string; 
        name: string; 
        rarity: string; 
    }[]; 
    
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
    
    // State lưu phần thưởng cuối trận để hiển thị (khi đã thắng)
    lastRewards: BattleRewards | null; 
    
    // State lưu phần thưởng tiềm năng (tính trước để hiện Popup xem trước)
    potentialRewards: BattleRewards | null;
}

interface BossBattleActions {
    startGame: () => void;
    skipBattle: () => void;
    retryCurrentFloor: () => void;
    handleNextFloor: () => void;
    handleSweep: () => Promise<{ result: 'win' | 'lose'; rewards: BattleRewards | null }>;
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
    
    // State Rewards
    const [lastRewards, setLastRewards] = useState<BattleRewards | null>(null);
    const [potentialRewards, setPotentialRewards] = useState<BattleRewards | null>(null);

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
        
        // Khởi tạo Event Data cho lượt này
        let turnEvents: Omit<TurnEvents, 'timestamp'> = { 
            playerDmg: 0, 
            playerDmgHit1: 0, 
            playerDmgHit2: 0, 
            playerDmgHit3: 0,
            playerHeal: 0, 
            bossDmg: 0, 
            bossReflectDmg: 0,
            playerActivatedSkills: [],
            bossActivatedSkills: []
        };

        // --- 0. TÍNH HỒI MÁU ĐẦU LƯỢT (SKILL HEALING) ---
        equippedSkills.forEach(skill => {
            if (skill.id === 'healing' && checkActivation(skill.rarity)) {
                const healPercent = getSkillEffect(skill);
                const healAmount = Math.ceil(player.maxHp * (healPercent / 100));
                const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
                
                if (actualHeal > 0) {
                    player.hp += actualHeal;
                    turnEvents.playerHeal += actualHeal;
                    log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> hồi phục <b class="text-green-400">${actualHeal}</b> HP.`);
                    
                    turnEvents.playerActivatedSkills.push({
                        id: skill.id,
                        name: skill.name,
                        rarity: skill.rarity,
                        type: 'offensive'
                    });
                }
            }
        });

        // --- 1. TÍNH DAMAGE PLAYER ---
        let atkMods = { boost: 1, armorPen: 0 };
        
        equippedSkills.forEach(skill => {
            if ((skill.id === 'damage_boost' || skill.id === 'armor_penetration') && checkActivation(skill.rarity)) {
                const effect = getSkillEffect(skill);
                log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> kích hoạt!`);
                
                if (skill.id === 'damage_boost') atkMods.boost += effect / 100;
                if (skill.id === 'armor_penetration') atkMods.armorPen += effect / 100;

                turnEvents.playerActivatedSkills.push({
                    id: skill.id,
                    name: skill.name,
                    rarity: skill.rarity,
                    type: 'offensive'
                });
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

        // --- XỬ LÝ KỸ NĂNG HÚT MÁU (LIFE STEAL) ---
        equippedSkills.forEach(skill => {
            if (skill.id === 'life_steal' && checkActivation(skill.rarity)) {
                const healed = Math.ceil(totalPlayerDmg * (getSkillEffect(skill) / 100));
                const actualHeal = Math.min(healed, player.maxHp - player.hp);
                if (actualHeal > 0) {
                    turnEvents.playerHeal += actualHeal;
                    log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> hút <b class="text-green-400">${actualHeal}</b> Máu.`);
                    player.hp += actualHeal;

                    turnEvents.playerActivatedSkills.push({
                        id: skill.id,
                        name: skill.name,
                        rarity: skill.rarity,
                        type: 'offensive'
                    });
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

        // --- XỬ LÝ PHẢN ĐÒN (THORNS) ---
        let totalReflectDmg = 0;
        equippedSkills.forEach(skill => {
            if (skill.id === 'thorns' && checkActivation(skill.rarity)) {
                const reflectDmg = Math.ceil(bossDmg * (getSkillEffect(skill) / 100));
                totalReflectDmg += reflectDmg;
                log(`<span class="${getRarityTextColor(skill.rarity)} font-bold">[Kỹ Năng] ${skill.name}</span> phản lại <b class="text-orange-400">${reflectDmg}</b> sát thương.`);
                boss.hp -= reflectDmg;

                turnEvents.playerActivatedSkills.push({
                    id: skill.id,
                    name: skill.name,
                    rarity: skill.rarity,
                    type: 'defensive'
                });
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

    // --- EFFECT: TÍNH TOÁN PHẦN THƯỞNG TIỀM NĂNG (ĐỒNG BỘ 1 LẦN KHI ĐỔI TẦNG) ---
    useEffect(() => {
        if (currentBossData) {
            // 1. Lấy Coins cố định từ Data
            const coins = currentBossData.rewards?.coins || 0;
            
            // 2. Tính Resources ngẫu nhiên NGAY LÚC NÀY
            const resources = calculateResourceRewards(currentFloor);
            
            // 3. Lưu vào State để dùng chung (Hiển thị Popup & Trả thưởng)
            setPotentialRewards({
                coins,
                resources
            });
        }
    }, [currentFloor, currentBossData]);

    // --- GAME CONTROL FUNCTIONS ---
    const endGame = useCallback(async (result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setGameOver(result);
        setBattleState('finished');

        // Lấy phần thưởng đã tính trước (potentialRewards)
        // Nếu vì lý do gì đó mà null (ít xảy ra), tính lại như fallback
        let finalRewards: BattleRewards = potentialRewards || { 
            coins: currentBossData?.rewards?.coins || 0, 
            resources: calculateResourceRewards(currentFloor) 
        };

        if (result === 'win') {
            setLastRewards(finalRewards);

            // Optimistic UI Update cho Coins
            if (finalRewards.coins > 0) {
                game.updateCoins(finalRewards.coins);
            }

            // Gọi Service để lưu Resources và Coins vào Firestore
            try {
                await claimTowerRewards(userId, finalRewards);
            } catch (err) {
                console.error("Error saving rewards:", err);
            }
        }
        
    }, [currentBossData, game, userId, currentFloor, potentialRewards]);

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
        
        // Reset rewards cũ khi bắt đầu trận mới
        setLastRewards(null); 
        
        setPlayerStats(prev => {
            if (!prev) return null;
            return { ...prev, energy: prev.energy - 10 };
        });
        
        game.handleUpdateEnergy(-10);
        setBattleState('fighting');
    }, [battleState, playerStats, game]);

    const resetAllStateForNewBattle = useCallback(() => {
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setPreviousCombatLog(combatLog);
        setCombatLog([]);
        setTurnCounter(0);
        setGameOver(null);
        setBattleState('idle');
        setLastTurnEvents(null);
        setLastRewards(null);
        isEndingGame.current = false;
        // LƯU Ý: Không reset potentialRewards ở đây, nó sẽ được update qua useEffect khi currentFloor thay đổi
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

    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        // 1. Reset state
        resetAllStateForNewBattle();
        
        // 2. Update Floor Index trong Game Context
        game.handleBossFloorUpdate(nextIndex);
        setCurrentFloor(nextIndex);
        
        // 3. Reset Player Stats
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
        
        // 4. Set Boss Stats explicitly
        const nextBossData = BOSS_DATA[nextIndex];
        if (nextBossData) {
             setBossStats(nextBossData.stats);
        }
    }, [currentFloor, resetAllStateForNewBattle, game]);

    const handleSweep = useCallback(async () => {
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose' as const, rewards: null };
        }
    
        // 1. Trừ năng lượng
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: prev.energy - 10 }
        });
        game.handleUpdateEnergy(-10);
    
        // 2. Lấy data boss tầng trước
        const previousFloorIndex = currentFloor - 1;
        const previousBossData = BOSS_DATA[previousFloorIndex];
        
        // 3. Tính phần thưởng (Sweep cần tính mới vì không phải tầng hiện tại)
        const earnedCoins = previousBossData.rewards?.coins || 0;
        const earnedResources = calculateResourceRewards(previousFloorIndex);

        const rewards: BattleRewards = {
            coins: earnedCoins,
            resources: earnedResources
        };
        
        // Lưu state để UI hiển thị
        setLastRewards(rewards);
        
        // 4. Cập nhật Coins
        if (rewards.coins > 0) {
            game.updateCoins(rewards.coins);
        }
    
        // 5. Lưu vào Firestore (FIRE AND FORGET)
        claimTowerRewards(userId, rewards)
            .catch(err => console.error("Background sweep save error:", err));
        
        // 6. Trả về kết quả
        return { result: 'win' as const, rewards: rewards };
    }, [playerStats, currentFloor, game, userId]);

    // --- REACT HOOKS & EFFECTS ---

    useEffect(() => {
        setDisplayedCoins(game.coins);
    }, [game.coins]);
    
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
                stats = {
                    maxHp: 1000,
                    hp: 1000,
                    atk: 50,
                    def: 10,
                    maxEnergy: 50,
                    energy: 50
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
            const remainingTime = 700 - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(() => setIsLoading(false), remainingTime);
            } else {
                setIsLoading(false);
            }
        }
    }, [game.isLoadingUserData, game.bossBattleHighestFloor]);

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
    
    // Interval Loop cho Battle
    useEffect(() => {
        if (battleState === 'fighting' && !gameOver) {
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
        lastRewards,
        potentialRewards, // Export state này để UI sử dụng
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
