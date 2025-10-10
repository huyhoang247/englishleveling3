// --- START OF FILE achievement-context.tsx (FULL CODE - FIXED) ---

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { useQuizApp } from '../../courses/course-context.tsx'; 
import { VocabularyItem } from '../../courses/course-data-service.ts'; 

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu (Lấy từ course-context) ---
  vocabulary: VocabularyItem[];
  coins: number;
  masteryCards: number;
  // --- Trạng thái ---
  isInitialLoading: boolean; 
  isUpdating: boolean;     
  // --- Hành động ---
  claimAchievement: (id: number) => Promise<void>;
  claimAllAchievements: () => Promise<void>;
  // --- Dữ liệu Phần thưởng có thể nhận ---
  totalClaimableRewards: { gold: number; masteryCards: number; };
}

const AchievementsContext = createContext<AchievementsContextState | undefined>(undefined);

interface AchievementsProviderProps {
  children: ReactNode;
}

export const AchievementsProvider = ({ children }: AchievementsProviderProps) => {
  const {
    userCoins: coins,
    masteryCount: masteryCards,
    user,
    updateAchievementData,
    vocabulary, 
    isVocabularyLoading: isInitialLoading,
    setVocabularyState, 
  } = useQuizApp();
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm nhận một phần thưởng
  const claimAchievement = useCallback(async (id: number) => {
    if (isUpdating || !user) return; 

    const itemToClaim = vocabulary.find(item => item.id === id);
    if (!itemToClaim || itemToClaim.exp < itemToClaim.maxExp) return;

    setIsUpdating(true);
    const goldReward = itemToClaim.level * 100;
    const masteryCardReward = 1;

    const updatedList = vocabulary.map(item => {
      if (item.id === id) {
        const newLevel = item.level + 1;
        return { ...item, level: newLevel, exp: item.exp - item.maxExp, maxExp: newLevel * 100 };
      }
      return item;
    });

    try {
      await updateAchievementData({
        coinsToAdd: goldReward,
        cardsToAdd: masteryCardReward,
        newVocabularyData: updatedList,
      });

      setVocabularyState(updatedList);

    } catch (error) {
      console.error("Failed to claim single achievement:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData, setVocabularyState]); 

  // Hàm nhận tất cả phần thưởng
  const claimAllAchievements = useCallback(async () => {
    if (isUpdating || !user) return;
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
        return { ...item, level: newLevel, exp: item.exp - item.maxExp, maxExp: newLevel * 100 };
      }
      return item;
    });

    try {
      await updateAchievementData({
        coinsToAdd: totalGoldReward,
        cardsToAdd: totalMasteryCardReward,
        newVocabularyData: updatedList,
      });
      
      setVocabularyState(updatedList);

    } catch (error) {
      console.error("Failed to claim all achievements:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData, setVocabularyState]);

  const totalClaimableRewards = useMemo(() => {
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  const value = useMemo(() => ({
    vocabulary,
    coins,
    masteryCards,
    isInitialLoading,
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    totalClaimableRewards,
  }), [
    vocabulary, coins, masteryCards, isInitialLoading, isUpdating,
    claimAchievement, claimAllAchievements, totalClaimableRewards
  ]);

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider> // <<< SỬA LỖI TẠI ĐÂY
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
// --- END OF FILE achievement-context.tsx (FULL CODE - FIXED) ---
