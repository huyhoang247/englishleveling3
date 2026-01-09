import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import BOSS_DATA from './tower-data.ts';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from '../skill-game/skill-data.tsx';
// Import useGame để truy cập và cập nhật dữ liệu người dùng toàn cục
import { useGame } from '../../GameContext.tsx';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES) ---

export type ActiveSkill = OwnedSkill & SkillBlueprint;

export type CombatStats = {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy: number; 
    energy: number;    
};

// Dữ liệu sự kiện cho mỗi lượt đánh để UI hiển thị hiệu ứng (như số nhảy lên)
export type TurnEvents = {
    playerDmg: number;
    playerHeal: number;
    bossDmg: number;
    bossReflectDmg: number;
    timestamp: number; 
};

// Cấu trúc State của Boss Battle
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

// Các hàm hành động có thể gọi từ UI
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

// --- PROVIDER COMPONENT ---
export const BossBattleProvider = ({ children }: { children: ReactNode }) => {
    // Truy cập context game chính
    const game = useGame();

    // --- QUẢN LÝ STATE ---
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

    // Refs để quản lý logic ngầm mà không kích hoạt re-render thừa
    const initialPlayerStatsRef = useRef<CombatStats | null>(null);
    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isEndingGame = useRef(false); 
    const savedCallback = useRef<() => void>();

    // Lấy dữ liệu Boss hiện tại dựa trên tầng
    const currentBossData = BOSS_DATA[currentFloor] || null;

    // Hàm phụ để thêm log nhanh
    const addLog = (message: string) => {
        setCombatLog(prev => [message, ...prev].slice(0, 50));
    };

    // --- CORE BATTLE LOGIC (HÀM TÍNH TOÁN TRẬN ĐẤU) ---
    // Hàm này tính toán kết quả của 1 lượt đánh duy nhất
    const executeFullTurn = useCallback((currentPlayer: CombatStats, currentBoss: CombatStats, turn: number) => {
        const turnLogs: string[] = [];
        const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
        
        // Hàm kiểm tra tỷ lệ kích hoạt kỹ năng
        const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
        
        // Hàm tính giá trị hiệu ứng kỹ năng dựa trên cấp độ
        const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
        
        // Hàm tính sát thương cơ bản (Công - Thủ, kèm biến động 20%)
        const calculateDamage = (atk: number, def: number) => {
            const base = atk * (0.8 + Math.random() * 0.4); // Biến động 0.8 đến 1.2
            const mitigation = 1 - (def / (def + 100)); // Công thức giảm sát thương theo giáp
            return Math.max(1, Math.floor(base * mitigation));
        };
        
        let player = { ...currentPlayer };
        let boss = { ...currentBoss };
        let winner: 'win' | 'lose' | null = null;
        let turnEvents: Omit<TurnEvents, 'timestamp'> = { playerDmg: 0, playerHeal: 0, bossDmg: 0, bossReflectDmg: 0 };

        // 1. NGƯỜI CHƠI TẤN CÔNG
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

        // 2. KỸ NĂNG HÚT MÁU (SAU KHI GÂY DAM)
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
        
        // Kiểm tra Boss chết chưa
        if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
            return { player, boss, turnLogs, winner, turnEvents };
        }

        // 3. BOSS PHẢN CÔNG
        const bossDmg = calculateDamage(boss.atk, player.def);
        turnEvents.bossDmg = bossDmg;
        log(`${currentBossData?.name} phản công, gây <b class="text-red-400">${bossDmg}</b> sát thương.`);
        player.hp -= bossDmg;

        // 4. KỸ NĂNG PHẢN ĐÒN (SAU KHI ĂN DAM)
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

        // 5. KIỂM TRA ĐIỀU KIỆN KẾT THÚC
        if (player.hp <= 0) {
            player.hp = 0; winner = 'lose';
            log("Bạn đã gục ngã... THẤT BẠI!");
        } else if (boss.hp <= 0) {
            boss.hp = 0; winner = 'win';
            log(`${currentBossData?.name} đã bị đánh bại!`);
        }

        return { player, boss, turnLogs, winner, turnEvents };
    }, [equippedSkills, currentBossData]);

    // --- HÀM KẾT THÚC TRẬN ĐẤU (TRAO THƯỞNG) ---
    const endGame = useCallback((result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        setGameOver(result);
        setBattleState('finished');

        const rewards = currentBossData?.rewards || { coins: 0, energy: 0 };
        const finalRewards = result === 'win' ? rewards : { coins: 0, energy: 0 };
        
        // Cập nhật tiền vào GameContext nếu thắng
        if (result === 'win' && finalRewards.coins > 0) {
            game.updateUserCurrency({ coins: game.coins + finalRewards.coins });
        }
        
        // Cập nhật hiển thị UI cục bộ
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

    // --- HÀM CHẠY TỪNG LƯỢT TRONG INTERVAL ---
    const runBattleTurn = useCallback(() => {
        if (!playerStats || !bossStats) return;

        const nextTurn = turnCounter + 1;
        const { player: newPlayer, boss: newBoss, turnLogs, winner, turnEvents } = executeFullTurn(playerStats, bossStats, nextTurn);
        
        // Cập nhật state (React sẽ tự động batching các cập nhật này)
        setPlayerStats(newPlayer);
        setBossStats(newBoss);
        setLastTurnEvents({ ...turnEvents, timestamp: Date.now() });
        setCombatLog(prev => [...turnLogs.reverse(), ...prev].slice(0, 50));
        setTurnCounter(nextTurn);

        if (winner) {
            endGame(winner);
        }
    }, [turnCounter, playerStats, bossStats, executeFullTurn, endGame]);

    // --- HÀM BỎ QUA TRẬN ĐẤU (SKIP) ---
    const skipBattle = useCallback(() => {
        if (!playerStats || !bossStats) return;
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

        setBattleState('finished');
        let tempPlayer = { ...playerStats };
        let tempBoss = { ...bossStats };
        let tempTurn = turnCounter;
        let finalWinner: 'win' | 'lose' | null = null;
        const fullLog: string[] = [];

        // Chạy vòng lặp tính toán nhanh cho đến khi có kết quả hoặc quá 500 lượt
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
        setCombatLog(prev => [...fullLog.reverse(), ...prev].slice(0, 50));
        setTurnCounter(tempTurn);
        endGame(finalWinner);
    }, [playerStats, bossStats, turnCounter, executeFullTurn, endGame]);
    
    // --- HÀM BẮT ĐẦU CHIẾN ĐẤU ---
    const startGame = useCallback(() => {
        if (battleState !== 'idle' || (playerStats?.energy || 0) < 10) return;
        isEndingGame.current = false;
        
        // Trừ 10 năng lượng mỗi trận
        setPlayerStats(prev => {
            if (!prev) return null;
            return { ...prev, energy: prev.energy - 10 };
        });
        setBattleState('fighting');
    }, [battleState, playerStats]);

    // --- HÀM RESET TRẠNG THÁI ---
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

    // --- HÀM CHƠI LẠI TẦNG HIỆN TẠI ---
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

    // --- HÀM SANG TẦNG TIẾP THEO ---
    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        resetAllStateForNewBattle();
        game.handleBossFloorUpdate(nextIndex); // Cập nhật tầng cao nhất trong GameContext
        setCurrentFloor(nextIndex);
        
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
    }, [currentFloor, resetAllStateForNewBattle, game]);

    // --- HÀM CÀN QUÉT (SWEEP) TẦNG TRƯỚC ---
    const handleSweep = useCallback(async () => {
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose' as const, rewards: { coins: 0, energy: 0 } };
        }
    
        // Trừ năng lượng
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: prev.energy - 10 }
        });
    
        const previousBossData = BOSS_DATA[currentFloor - 1];
        let simPlayer = { ...initialPlayerStatsRef.current };
        let simBoss = { ...previousBossData.stats };
        let simTurn = 0;
        let finalWinner: 'win' | 'lose' | null = null;
    
        // Giả lập trận đấu nhanh
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

    // --- REACT HOOKS QUẢN LÝ VÒNG ĐỜI ---

    // Cập nhật callback cho interval
    useEffect(() => {
        savedCallback.current = runBattleTurn;
    }, [runBattleTurn]);

    // Lấy dữ liệu khởi tạo từ GameContext
    useEffect(() => {
        if (game.isLoadingUserData) {
            setIsLoading(true);
            return;
        }
        const startTime = Date.now();
        try {
            // Lấy chỉ số chiến đấu của người chơi (Atk, Def, HP...)
            const playerBattleStats = game.getPlayerBattleStats();
            setPlayerStats(playerBattleStats);
            initialPlayerStatsRef.current = playerBattleStats;
    
            // Lấy danh sách kỹ năng đang trang bị
            const skillsDetails = game.getEquippedSkillsDetails();
            setEquippedSkills(skillsDetails as ActiveSkill[]);
    
            // Đồng bộ tầng và tiền
            setCurrentFloor(game.bossBattleHighestFloor);
            setDisplayedCoins(game.coins);
            setError(null);
        } catch (e) {
            console.error("Boss Battle Init Error:", e);
            setError("Không thể tải dữ liệu chiến đấu.");
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 700 - elapsedTime;
            setTimeout(() => setIsLoading(false), Math.max(0, remainingTime));
        }
    }, [game.isLoadingUserData, game.bossBattleHighestFloor, game.coins]);

    // Tự động load Boss khi đổi tầng
    useEffect(() => {
        if (!isLoading && currentBossData) {
          setBossStats(currentBossData.stats);
          setCombatLog([]);
          addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện. Hãy chuẩn bị!`);
        }
    }, [currentFloor, isLoading, currentBossData]);
    
    // Quản lý Interval chạy trận đấu
    useEffect(() => {
        if (battleState === 'fighting' && !gameOver) {
          battleIntervalRef.current = setInterval(() => {
              if(savedCallback.current) {
                savedCallback.current();
              }
          }, 1200); // 1.2 giây mỗi lượt
        }
        return () => {
          if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        };
    }, [battleState, gameOver]);


    // --- CUNG CẤP DỮ LIỆU ---
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

// Hook tùy chỉnh để sử dụng trong UI
export const useBossBattle = (): BossBattleContextType => {
    const context = useContext(BossBattleContext);
    if (context === undefined) {
        throw new Error('useBossBattle must be used within a BossBattleProvider');
    }
    return context;
};
