// --- START OF FILE src/contexts/GameDataContext.tsx (PHIÊN BẢN HOÀN CHỈNH) ---

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase.js';
import { 
  fetchOrCreateUserGameData, 
  upgradeUserStats,
  updateUserCoins,
  updateUserGems,
  updateUserBossFloor,
  processShopPurchase,
  processMinerChallengeResult,
  // Thêm các service khác khi cần
} from '../gameDataService.ts';
import { calculateUpgradeCost } from '../home/upgrade-stats/upgrade-ui.tsx';

// --- Định nghĩa "hình dạng" của tất cả dữ liệu game (giữ nguyên) ---
interface GameDataState {
  coins: number; gems: number; masteryCards: number; pickaxes: number; ancientBooks: number;
  equipmentPieces: number; cardCapacity: number; userStats: { hp: number; atk: number; def: number; };
  minerChallengeHighestFloor: number; bossBattleHighestFloor: number; totalVocabCollected: number;
  ownedSkills: any[]; equippedSkillIds: (string | null)[]; ownedItems: any[];
  equippedItems: { weapon: any; armor: any; accessory: any; };
}

// --- Định nghĩa "hình dạng" của Context ---
interface GameDataContextType extends GameDataState {
  isGlobalLoading: boolean; isSyncing: boolean;
  loadInitialData: (user: User) => Promise<void>;
  resetGameData: () => void;
  refreshGameData: () => Promise<void>;
  
  // --- ACTIONS CHI TIẾT ---
  upgradeStat: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
  setCoins: (newAmount: number) => Promise<void>;
  setGems: (newAmount: number) => Promise<void>;
  handleBossFloorUpdate: (newFloor: number) => Promise<void>;
  handleShopPurchase: (item: any, quantity: number) => Promise<void>;
  handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => Promise<void>;
  // ... Thêm các actions khác ở đây
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialGameState: GameDataState = {
    coins: 0, gems: 0, masteryCards: 0, pickaxes: 0, ancientBooks: 0,
    equipmentPieces: 0, cardCapacity: 100, userStats: { hp: 0, atk: 0, def: 0 },
    minerChallengeHighestFloor: 0, bossBattleHighestFloor: 0, totalVocabCollected: 0,
    ownedSkills: [], equippedSkillIds: [null, null, null], ownedItems: [],
    equippedItems: { weapon: null, armor: null, accessory: null },
  };
  const [gameState, setGameState] = useState<GameDataState>(initialGameState);

  // --- ACTIONS ---
  const loadInitialData = useCallback(async (user: User) => {
    setIsGlobalLoading(true);
    try {
      const data = await fetchOrCreateUserGameData(user.uid);
      setGameState({
        coins: data.coins, gems: data.gems, masteryCards: data.masteryCards, pickaxes: data.pickaxes,
        userStats: data.stats, bossBattleHighestFloor: data.bossBattleHighestFloor,
        minerChallengeHighestFloor: data.minerChallengeHighestFloor, ancientBooks: data.ancientBooks,
        ownedSkills: data.skills.owned, equippedSkillIds: data.skills.equipped,
        totalVocabCollected: data.totalVocabCollected, cardCapacity: data.cardCapacity,
        equipmentPieces: data.equipment.pieces, ownedItems: data.equipment.owned,
        equippedItems: data.equipment.equipped,
      });
    } catch (error) { console.error("Lỗi khi tải dữ liệu game:", error); } 
    finally { setIsGlobalLoading(false); }
  }, []);

  const refreshGameData = useCallback(async () => {
      const user = auth.currentUser;
      if (user) {
          await loadInitialData(user);
      }
  }, [loadInitialData]);

  const resetGameData = useCallback(() => { setGameState(initialGameState); setIsGlobalLoading(true); }, []);

  const setCoins = useCallback(async (newAmount: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    const updatedCoins = await updateUserCoins(user.uid, newAmount - gameState.coins);
    setGameState(prev => ({ ...prev, coins: updatedCoins }));
  }, [gameState.coins]);
  
  const setGems = useCallback(async (newAmount: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    const updatedGems = await updateUserGems(user.uid, newAmount - gameState.gems);
    setGameState(prev => ({ ...prev, gems: updatedGems }));
  }, [gameState.gems]);

  const upgradeStat = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    // Logic upgradeStat đã đúng từ trước, giữ nguyên
    const user = auth.currentUser;
    if (!user) throw new Error("Người dùng chưa đăng nhập.");
    if (isSyncing) throw new Error("Hành động khác đang xử lý.");
    const currentLevel = gameState.userStats[statId];
    const cost = calculateUpgradeCost(currentLevel);
    if (gameState.coins < cost) throw new Error("Không đủ vàng");
    setIsSyncing(true);
    const oldState = { ...gameState };
    const newStats = { ...gameState.userStats, [statId]: currentLevel + 1 };
    setGameState(prev => ({ ...prev, coins: prev.coins - cost, userStats: newStats }));
    try {
      const { newCoins } = await upgradeUserStats(user.uid, cost, newStats);
      setGameState(prev => ({ ...prev, coins: newCoins }));
    } catch (error) { setGameState(oldState); throw error; } 
    finally { setIsSyncing(false); }
  }, [gameState, isSyncing]);

  const handleBossFloorUpdate = useCallback(async (newFloor: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    await updateUserBossFloor(user.uid, newFloor, gameState.bossBattleHighestFloor);
    if (newFloor > gameState.bossBattleHighestFloor) {
      setGameState(prev => ({ ...prev, bossBattleHighestFloor: newFloor }));
    }
  }, [gameState.bossBattleHighestFloor]);

  const handleShopPurchase = useCallback(async (item: any, quantity: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    if (isSyncing) throw new Error("Hành động khác đang xử lý.");
    setIsSyncing(true);
    try {
      const { newCoins, newBooks, newCapacity } = await processShopPurchase(user.uid, item, quantity);
      setGameState(prev => ({
        ...prev,
        coins: newCoins,
        ancientBooks: newBooks !== undefined ? newBooks : prev.ancientBooks,
        cardCapacity: newCapacity !== undefined ? newCapacity : prev.cardCapacity
      }));
       alert(`Mua thành công x${quantity} ${item.name}!`);
    } catch (error) {
       alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`);
       throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);
  
  const handleMinerChallengeEnd = useCallback(async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    setIsSyncing(true);
    try {
        const { newCoins, newPickaxes, newHighestFloor } = await processMinerChallengeResult(user.uid, result);
        setGameState(prev => ({
            ...prev,
            coins: newCoins,
            pickaxes: newPickaxes,
            minerChallengeHighestFloor: newHighestFloor
        }));
    } catch (error) {
        console.error("Lỗi xử lý kết quả Miner Challenge:", error);
        throw error;
    } finally {
        setIsSyncing(false);
    }
  }, []);

  const value: GameDataContextType = {
    ...gameState, isGlobalLoading, isSyncing,
    loadInitialData, resetGameData, refreshGameData,
    upgradeStat, setCoins, setGems, handleBossFloorUpdate, handleShopPurchase, handleMinerChallengeEnd
  };

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
};

export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (context === undefined) throw new Error('useGameData must be used within a GameDataProvider');
  return context;
};

// --- END OF FILE src/contexts/GameDataContext.tsx ---
