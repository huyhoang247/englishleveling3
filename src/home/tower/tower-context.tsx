// --- START OF FILE tower-context.tsx ---

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import BOSS_DATA from './tower-data.ts';
import { 
    OwnedSkill, 
    SkillBlueprint, 
    getActivationChance, 
    getRarityTextColor 
} from '../skill-game/skill-data.tsx';
// Import useGame để truy cập state toàn cục (Global Game State)
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

// Định nghĩa sự kiện cho từng cú đánh (từng quả cầu bay trúng)
export type HitEvent = {
    damage: number;   // Sát thương gây ra
    isCrit: boolean;  // Có chí mạng không (để hiển thị hiệu ứng nếu cần)
    heal: number;     // Hồi máu (nếu có hút máu)
    reflect: number;  // Phản đòn (nếu đối thủ có gai)
    source: 'player' | 'boss'; // Ai là người bắn quả cầu này
};

// Dữ liệu tính toán trước cho toàn bộ một lượt
export type TurnData = {
    turnNumber: number;
    playerHits: HitEvent[]; // Danh sách 3-10 quả cầu của người chơi
    bossHits: HitEvent[];   // Danh sách 3-10 quả cầu của boss
    logs: string[];         // Nhật ký chiến đấu của lượt này
};

// State quản lý trận đấu
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
    // Dữ liệu lượt hiện tại để UI render animation
    currentTurnData: TurnData | null; 
}

// Các hành động có thể thực hiện
interface BossBattleActions {
    startGame: () => void;
    skipBattle: () => void;
    retryCurrentFloor: () => void;
    handleNextFloor: () => void;
    handleSweep: () => Promise<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } }>;
    // Action mới: Gọi khi một quả cầu chạm đích để trừ máu
    applyHitDamage: (hit: HitEvent, target: 'player' | 'boss') => void; 
    // Action mới: Gọi khi toàn bộ animation của lượt kết thúc
    completeTurn: () => void; 
}

type BossBattleContextType = BossBattleState & BossBattleActions;

// --- CREATE CONTEXT ---
const BossBattleContext = createContext<BossBattleContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const BossBattleProvider = ({ children }: { children: ReactNode }) => {
    // Truy cập dữ liệu từ GameContext chính
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
    
    // State mới: Lưu trữ kế hoạch cho lượt hiện tại
    const [currentTurnData, setCurrentTurnData] = useState<TurnData | null>(null);

    const initialPlayerStatsRef = useRef<CombatStats | null>(null);
    const isEndingGame = useRef(false); 

    const currentBossData = BOSS_DATA[currentFloor] || null;

    // --- LOGIC HELPERS ---
    const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));

    // --- CORE LOGIC: TÍNH TOÁN DỮ LIỆU LƯỢT ĐẤU (GENERATE TURN DATA) ---
    // Hàm này không thay đổi State, nó chỉ trả về một object mô tả chuyện gì sẽ xảy ra trong lượt
    const generateTurnData = useCallback((currentPlayer: CombatStats, currentBoss: CombatStats, turn: number): TurnData => {
        const turnLogs: string[] = [];
        const log = (msg: string) => turnLogs.push(`[Lượt ${turn}] ${msg}`);
        
        const checkActivation = (rarity: string) => Math.random() * 100 < getActivationChance(rarity);
        const getSkillEffect = (skill: ActiveSkill) => (skill.baseEffectValue || 0) + (skill.level - 1) * (skill.effectValuePerLevel || 0);
        
        // Công thức tính sát thương cơ bản
        const calculateBaseDamage = (atk: number, def: number) => 
            Math.max(1, Math.floor(atk * (0.8 + Math.random() * 0.4) * (1 - def / (def + 100))));
        
        // --- 1. TÍNH TOÁN LƯỢT NGƯỜI CHƠI ---
        let atkMods = { boost: 1, armorPen: 0 };
        let lifeStealPercent = 0;

        equippedSkills.forEach(skill => {
            if (checkActivation(skill.rarity)) {
                const effect = getSkillEffect(skill);
                if (skill.id === 'damage_boost') {
                    atkMods.boost += effect / 100;
                    log(`<span class="${getRarityTextColor(skill.rarity)}">[Kỹ Năng] ${skill.name}</span> tăng sát thương!`);
                }
                if (skill.id === 'armor_penetration') {
                    atkMods.armorPen += effect / 100;
                    log(`<span class="${getRarityTextColor(skill.rarity)}">[Kỹ Năng] ${skill.name}</span> xuyên giáp!`);
                }
                if (skill.id === 'life_steal') {
                    lifeStealPercent += effect;
                }
            }
        });

        // Tổng sát thương dự kiến của Player
        const totalPlayerDmg = calculateBaseDamage(
            currentPlayer.atk * atkMods.boost, 
            Math.max(0, currentBoss.def * (1 - atkMods.armorPen))
        );

        // Chia nhỏ thành 3-10 quả cầu (Theo yêu cầu)
        const playerOrbCount = Math.floor(Math.random() * 8) + 3; // Random 3 -> 10
        const playerHits: HitEvent[] = [];
        let remainingPlayerDmg = totalPlayerDmg;
        
        for (let i = 0; i < playerOrbCount; i++) {
            let dmg = 0;
            // Nếu là quả cuối cùng, dồn hết dam còn lại
            if (i === playerOrbCount - 1) {
                dmg = remainingPlayerDmg;
            } else {
                // Chia đều tương đối
                dmg = Math.floor(remainingPlayerDmg / (playerOrbCount - i));
                remainingPlayerDmg -= dmg;
            }
            
            // Tính hút máu cho quả cầu này
            const heal = lifeStealPercent > 0 ? Math.ceil(dmg * (lifeStealPercent / 100)) : 0;
            if (heal > 0 && i === 0) log(`[Kỹ năng] Hút máu kích hoạt.`); 

            playerHits.push({ 
                damage: dmg, 
                isCrit: false, 
                heal, 
                reflect: 0, 
                source: 'player' 
            });
        }
        log(`Bạn tung ra <b>${playerOrbCount}</b> quả cầu năng lượng!`);

        // --- 2. TÍNH TOÁN LƯỢT BOSS ---
        // (Lưu ý: Boss vẫn tính toán hit, nhưng UI sẽ kiểm tra nếu Boss chết trước thì không chạy animation)
        const bossDmg = calculateBaseDamage(currentBoss.atk, currentPlayer.def);
        
        let thornsPercent = 0;
        equippedSkills.forEach(skill => {
            if (skill.id === 'thorns' && checkActivation(skill.rarity)) {
                thornsPercent += getSkillEffect(skill);
            }
        });

        // Chia nhỏ thành 3-10 quả cầu cho Boss
        const bossOrbCount = Math.floor(Math.random() * 8) + 3; // Random 3 -> 10
        const bossHits: HitEvent[] = [];
        let remainingBossDmg = bossDmg;

        for (let i = 0; i < bossOrbCount; i++) {
            let dmg = 0;
            if (i === bossOrbCount - 1) {
                dmg = remainingBossDmg;
            } else {
                dmg = Math.floor(remainingBossDmg / (bossOrbCount - i));
                remainingBossDmg -= dmg;
            }

            // Tính phản đòn (Thorns) của người chơi lên Boss
            const reflect = thornsPercent > 0 ? Math.ceil(dmg * (thornsPercent / 100)) : 0;
            if (reflect > 0 && i === 0) log(`[Kỹ năng] Phản đòn kích hoạt.`);

            bossHits.push({ 
                damage: dmg, 
                isCrit: false, 
                heal: 0, 
                reflect, 
                source: 'boss' 
            });
        }
        
        return {
            turnNumber: turn,
            playerHits,
            bossHits,
            logs: turnLogs
        };
    }, [equippedSkills]);

    // --- ACTION: KẾT THÚC GAME ---
    const endGame = useCallback((result: 'win' | 'lose') => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;

        setGameOver(result);
        setBattleState('finished');
        setCurrentTurnData(null); // Ngừng sinh lượt mới

        const rewards = currentBossData?.rewards || { coins: 0, energy: 0 };
        const finalRewards = result === 'win' ? rewards : { coins: 0, energy: 0 };
        
        // Cập nhật Global Game State
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

    // --- ACTION: UI GỌI HÀM NÀY KHI QUẢ CẦU CHẠM ĐÍCH (APPLY DAMAGE) ---
    const applyHitDamage = useCallback((hit: HitEvent, target: 'player' | 'boss') => {
        if (target === 'boss') {
            // Player bắn trúng Boss
            setBossStats(prev => {
                if (!prev) return null;
                const newHp = Math.max(0, prev.hp - hit.damage);
                return { ...prev, hp: newHp };
            });
            // Hồi máu cho Player (Life Steal)
            if (hit.heal > 0) {
                setPlayerStats(prev => {
                    if (!prev) return null;
                    return { ...prev, hp: Math.min(prev.maxHp, prev.hp + hit.heal) };
                });
            }
        } else {
            // Boss bắn trúng Player
            setPlayerStats(prev => {
                if (!prev) return null;
                const newHp = Math.max(0, prev.hp - hit.damage);
                return { ...prev, hp: newHp };
            });
            // Phản đòn lên Boss (Thorns)
            if (hit.reflect > 0) {
                 setBossStats(prev => {
                    if (!prev) return null;
                    const newHp = Math.max(0, prev.hp - hit.reflect);
                    return { ...prev, hp: newHp };
                });
            }
        }
    }, []);

    // --- ACTION: UI GỌI HÀM NÀY KHI HOÀN THÀNH ANIMATION CỦA CẢ LƯỢT (COMPLETE TURN) ---
    const completeTurn = useCallback(() => {
        if (battleState !== 'fighting' || gameOver) return;

        // 1. Kiểm tra điều kiện thắng/thua dựa trên HP hiện tại (đã trừ xong damage)
        if (bossStats && bossStats.hp <= 0) {
            endGame('win');
            return;
        }
        if (playerStats && playerStats.hp <= 0) {
            endGame('lose');
            return;
        }

        // 2. Chuẩn bị lượt tiếp theo
        const nextTurn = turnCounter + 1;
        setTurnCounter(nextTurn);
        
        if (playerStats && bossStats) {
            // Tính toán trước dữ liệu cho lượt tiếp theo
            const turnData = generateTurnData(playerStats, bossStats, nextTurn);
            setCurrentTurnData(turnData);
            setCombatLog(prev => [...turnData.logs.reverse(), ...prev]);
        }

    }, [battleState, gameOver, bossStats, playerStats, turnCounter, generateTurnData, endGame]);


    // --- ACTION: BẮT ĐẦU TRẬN ĐẤU (START GAME) ---
    const startGame = useCallback(() => {
        if (battleState !== 'idle' || (playerStats?.energy || 0) < 10) return;
        isEndingGame.current = false;
        
        // Trừ năng lượng vào trận
        setPlayerStats(prev => {
            if (!prev) return null;
            return { ...prev, energy: prev.energy - 10 };
        });
        setBattleState('fighting');
        setTurnCounter(1);
        setGameOver(null);
        
        // Sinh lượt đầu tiên ngay lập tức
        if (playerStats && bossStats) {
            // Lưu ý: dùng playerStats hiện tại (đã trừ năng lượng ở trên chưa kịp update thì React batching sẽ lo, 
            // nhưng an toàn thì logic generate không phụ thuộc energy)
            const turnData = generateTurnData(playerStats, bossStats, 1);
            setCurrentTurnData(turnData);
            setCombatLog(prev => [...turnData.logs.reverse(), ...prev]);
        }
    }, [battleState, playerStats, bossStats, generateTurnData]);


    // --- ACTION: BỎ QUA TRẬN ĐẤU (SKIP BATTLE) ---
    // Mô phỏng nhanh kết quả mà không cần chờ animation
    const skipBattle = useCallback(() => {
        if (!playerStats || !bossStats) return;
        setBattleState('finished');
        setCurrentTurnData(null); // Xóa animation

        let tempPlayer = { ...playerStats };
        let tempBoss = { ...bossStats };
        let tempTurn = turnCounter;
        let finalWinner: 'win' | 'lose' | null = null;
        const fullLog: string[] = [];

        // Vòng lặp mô phỏng (tối đa 500 lượt để tránh treo)
        while (finalWinner === null && tempTurn < turnCounter + 500) {
            tempTurn++;
            
            // Logic damage đơn giản hóa cho Skip
            const pDmg = Math.floor(tempPlayer.atk * (0.8 + Math.random() * 0.4) * (1 - tempBoss.def / (tempBoss.def + 100)));
            tempBoss.hp -= Math.max(1, pDmg);
            if(tempBoss.hp <= 0) { 
                tempBoss.hp = 0;
                finalWinner = 'win'; 
                break; 
            }
            
            const bDmg = Math.floor(tempBoss.atk * (0.8 + Math.random() * 0.4) * (1 - tempPlayer.def / (tempPlayer.def + 100)));
            tempPlayer.hp -= Math.max(1, bDmg);
            if(tempPlayer.hp <= 0) { 
                tempPlayer.hp = 0;
                finalWinner = 'lose'; 
                break; 
            }
        }
        if (!finalWinner) finalWinner = 'lose';

        setPlayerStats(tempPlayer);
        setBossStats(tempBoss);
        setTurnCounter(tempTurn);
        endGame(finalWinner);
    }, [playerStats, bossStats, turnCounter, endGame]);


    // --- HELPER: RESET STATE ---
    const resetAllStateForNewBattle = useCallback(() => {
        setPreviousCombatLog(combatLog);
        setCombatLog([]);
        setTurnCounter(0);
        setGameOver(null);
        setBattleState('idle');
        setCurrentTurnData(null);
        isEndingGame.current = false;
    }, [combatLog]);


    // --- ACTION: THỬ LẠI TẦNG HIỆN TẠI ---
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


    // --- ACTION: LÊN TẦNG TIẾP THEO ---
    const handleNextFloor = useCallback(() => {
        if (!initialPlayerStatsRef.current) return;
        const nextIndex = currentFloor + 1;
        if(nextIndex >= BOSS_DATA.length) return;
        
        resetAllStateForNewBattle();
        game.handleBossFloorUpdate(nextIndex); // Cập nhật context global
        setCurrentFloor(nextIndex);
        
        // Reset máu player về đầy, giữ nguyên energy
        setPlayerStats(prev => ({
            ...initialPlayerStatsRef.current!, 
            hp: initialPlayerStatsRef.current!.maxHp,
            energy: prev!.energy 
        }));
    }, [currentFloor, resetAllStateForNewBattle, game]);


    // --- ACTION: QUÉT (SWEEP) ---
    const handleSweep = useCallback(async () => {
        if (!initialPlayerStatsRef.current || currentFloor <= 0 || (playerStats?.energy || 0) < 10) {
            return { result: 'lose', rewards: { coins: 0, energy: 0 } };
        }
        setPlayerStats(prev => {
            if(!prev) return null;
            return { ...prev, energy: prev.energy - 10 }
        });
    
        // Logic Sweep đơn giản: Luôn thắng nếu đã qua tầng trước (hoặc có thể thêm logic tính chỉ số)
        // Ở đây giả định quét tầng trước đó (floor - 1)
        const previousBossIdx = currentFloor - 1;
        const rewardData = BOSS_DATA[previousBossIdx].rewards;
        
        const finalWinner = 'win'; // Sweep luôn thắng tầng cũ
        
        if (finalWinner === 'win') {
            game.updateUserCurrency({ coins: game.coins + rewardData.coins });
            setDisplayedCoins(prev => prev + rewardData.coins);
            setPlayerStats(prev => {
                if(!prev) return null;
                return {
                    ...prev,
                    energy: Math.min(prev.maxEnergy, prev.energy + rewardData.energy)
                }
            });
        }
        return { result: finalWinner, rewards: rewardData };
    }, [playerStats, currentFloor, game]);


    // --- INIT DATA FROM GAME CONTEXT ---
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
            // Giả lập loading nhẹ để tránh giật UI
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;
            if (remainingTime > 0) {
                setTimeout(() => setIsLoading(false), remainingTime);
            } else {
                setIsLoading(false);
            }
        }
    }, [game.isLoadingUserData, game.bossBattleHighestFloor, game.coins]);

    // Khi Boss mới load xong, hiển thị log chào mừng
    useEffect(() => {
        if (!isLoading && currentBossData) {
          setBossStats(currentBossData.stats);
          setCombatLog([]);
          addLog(`[Lượt 0] ${currentBossData.name} đã xuất hiện. Hãy chuẩn bị!`);
        }
    }, [currentFloor, isLoading, currentBossData]);


    // --- EXPOSE CONTEXT VALUES ---
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
        currentTurnData, // Quan trọng: Dữ liệu để UI vẽ orb
        
        startGame,
        skipBattle,
        retryCurrentFloor,
        handleNextFloor,
        handleSweep,
        
        applyHitDamage, // UI gọi khi orb chạm
        completeTurn,   // UI gọi khi hết animation
    };
    
    return (
        <BossBattleContext.Provider value={value}>
            {children}
        </BossBattleContext.Provider>
    );
};

// --- CUSTOM HOOK ---
export const useBossBattle = (): BossBattleContextType => {
    const context = useContext(BossBattleContext);
    if (context === undefined) {
        throw new Error('useBossBattle must be used within a BossBattleProvider');
    }
    return context;
};

// --- END OF FILE tower-context.tsx ---
