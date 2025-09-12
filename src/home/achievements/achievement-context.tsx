// --- START OF FILE achievement-context.tsx (UPDATED) ---

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useMemo
} from 'react';
import { auth } from '../../firebase.js';
// <<<--- THAY ĐỔI: Import useGame để lấy dữ liệu và hàm cập nhật toàn cục
import { useGame } from '../../GameContext.tsx';
import {
  fetchAndSyncVocabularyData,
  updateAchievementData,
  VocabularyItem
} from './achievement-service.ts';

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu ---
  vocabulary: VocabularyItem[];
  coins: number; // Vẫn cung cấp, nhưng giờ lấy từ GameContext
  masteryCards: number; // Vẫn cung cấp, nhưng giờ lấy từ GameContext
  // --- Trạng thái ---
  isInitialLoading: boolean; // Chỉ true trong lần tải đầu tiên
  isUpdating: boolean; // True khi đang thực hiện hành động (nhận thưởng)
  // --- Hành động ---
  claimAchievement: (id: number) => Promise<void>;
  claimAllAchievements: () => Promise<void>;
  refreshData: () => Promise<void>;
  // --- Dữ liệu Phần thưởng có thể nhận ---
  totalClaimableRewards: { gold: number; masteryCards: number; };
}

// Tạo Context với giá trị mặc định
const AchievementsContext = createContext<AchievementsContextState | undefined>(undefined);

// <<<--- THAY ĐỔI: Props của Provider được đơn giản hóa, không cần truyền user hay callback nữa
interface AchievementsProviderProps {
  children: ReactNode;
}

// Component Provider
export const AchievementsProvider = ({ children }: AchievementsProviderProps) => {
  // <<<--- THAY ĐỔI: Lấy dữ liệu tiền tệ và hàm cập nhật trực tiếp từ GameContext
  const { coins, masteryCards, handleAchievementsDataUpdate } = useGame();
  const user = auth.currentUser; // Lấy user hiện tại từ auth service

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  // <<<--- THAY ĐỔI: Bỏ state `coins` và `masteryCards` cục bộ, vì chúng được quản lý bởi GameContext
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // <<<--- THAY ĐỔI: Hàm loadData chỉ cần fetch dữ liệu vocabulary chuyên biệt
  const loadData = useCallback(async (userId: string) => {
    try {
      // Chỉ cần fetch dữ liệu của achievement, không cần fetch gameData chung nữa
      const vocabData = await fetchAndSyncVocabularyData(userId);
      setVocabulary(vocabData);
    } catch (error) {
      console.error("Failed to load vocabulary data in context:", error);
      setVocabulary([]);
    }
  }, []);

  // Effect để tải dữ liệu lần đầu khi user đăng nhập
  useEffect(() => {
    if (user?.uid) {
      setIsInitialLoading(true);
      loadData(user.uid).finally(() => setIsInitialLoading(false));
    } else {
      // Nếu không có user, reset state của context này
      setIsInitialLoading(true);
      setVocabulary([]);
    }
    // <<<--- THAY ĐỔI: Phụ thuộc vào user.uid để tránh re-run không cần thiết
  }, [user?.uid, loadData]);

  // Hàm nhận một phần thưởng
  const claimAchievement = useCallback(async (id: number) => {
    if (isUpdating || !user?.uid) return;

    const itemToClaim = vocabulary.find(item => item.id === id);
    if (!itemToClaim || itemToClaim.exp < itemToClaim.maxExp) return;

    setIsUpdating(true);
    const goldReward = itemToClaim.level * 100;
    const masteryCardReward = 1;

    const updatedList = vocabulary.map(item => {
      if (item.id === id) {
        const newLevel = item.level + 1;
        return {
          ...item,
          level: newLevel,
          exp: item.exp - item.maxExp,
          maxExp: newLevel * 100
        };
      }
      return item;
    });

    try {
      const { newCoins, newMasteryCards } = await updateAchievementData(user.uid, {
        coinsToAdd: goldReward,
        cardsToAdd: masteryCardReward,
        newVocabularyData: updatedList,
      });

      // Cập nhật state vocabulary nội bộ
      setVocabulary(updatedList);
      
      // <<<--- THAY ĐỔI: Gọi hàm cập nhật của GameContext để đồng bộ state toàn cục
      handleAchievementsDataUpdate({ coins: newCoins, masteryCards: newMasteryCards });

    } catch (error) {
      console.error("Failed to claim single achievement, re-syncing data:", error);
      await loadData(user.uid);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, loadData, handleAchievementsDataUpdate]);

  // Hàm nhận tất cả phần thưởng
  const claimAllAchievements = useCallback(async () => {
    if (isUpdating || !user?.uid) return;

    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return;

    setIsUpdating(true);

    let totalGoldReward = 0;
    let totalMasteryCardReward = 0;
    const claimableIds = new Set(claimableItems.map(item => item.id));

    const updatedList = vocabulary.map(item => {
      if (claimableIds.has(item.id)) {
        totalGoldReward += item.level * 100;
        totalMasteryCardReward += 1;
        const newLevel = item.level + 1;
        return {
          ...item,
          level: newLevel,
          exp: item.exp - item.maxExp,
          maxExp: newLevel * 100
        };
      }
      return item;
    });

    try {
      const { newCoins, newMasteryCards } = await updateAchievementData(user.uid, {
        coinsToAdd: totalGoldReward,
        cardsToAdd: totalMasteryCardReward,
        newVocabularyData: updatedList,
      });
      
      // Cập nhật state vocabulary nội bộ
      setVocabulary(updatedList);

      // <<<--- THAY ĐỔI: Gọi hàm cập nhật của GameContext để đồng bộ state toàn cục
      handleAchievementsDataUpdate({ coins: newCoins, masteryCards: newMasteryCards });

    } catch (error) {
      console.error("Failed to claim all achievements, re-syncing data:", error);
      await loadData(user.uid);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, loadData, handleAchievementsDataUpdate]);

  const refreshData = useCallback(async () => {
    if (user?.uid && !isUpdating) {
        setIsUpdating(true);
        await loadData(user.uid);
        setIsUpdating(false);
    }
  }, [user, isUpdating, loadData]);

  const totalClaimableRewards = useMemo(() => {
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  // <<<--- THAY ĐỔI: `coins` và `masteryCards` trong `value` giờ được lấy trực tiếp từ useGame
  const value = useMemo(() => ({
    vocabulary,
    coins, // từ useGame
    masteryCards, // từ useGame
    isInitialLoading,
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    refreshData,
    totalClaimableRewards,
  }), [
    vocabulary,
    coins, // từ useGame
    masteryCards, // từ useGame
    isInitialLoading,
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    refreshData,
    totalClaimableRewards
  ]);

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

// Custom Hook để sử dụng Context
export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
