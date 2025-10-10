// --- START OF FILE achievement-context.tsx ---

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import { useQuizApp } from './course-context.tsx'; // <<< THAY ĐỔI: Import context chính
import { VocabularyItem } from '../../courses/course-data-service.ts'; // <<< Vẫn giữ import type từ service

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu (Lấy từ course-context) ---
  vocabulary: VocabularyItem[];
  coins: number;
  masteryCards: number;
  // --- Trạng thái ---
  isInitialLoading: boolean; // Quản lý loading nội bộ
  isUpdating: boolean;     // True khi đang thực hiện hành động (nhận thưởng)
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
  // <<< THAY ĐỔI: Lấy dữ liệu và các hàm cập nhật từ useQuizApp thay vì useGame
  const {
    userCoins: coins, // Đổi tên để khớp với state hiện tại
    masteryCount: masteryCards, // Đổi tên để khớp
    user,
    fetchAndSyncVocabularyData,
    updateAchievementData,
  } = useQuizApp();
  
  // Quản lý state của vocabulary và loading tại đây
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Effect để tải dữ liệu vocabulary khi user thay đổi
  useEffect(() => {
    // <<< THAY ĐỔI: Dùng user từ context, không cần auth.currentUser
    if (!user) {
      setVocabulary([]);
      setIsInitialLoading(false);
      return;
    }
    
    setIsInitialLoading(true);
    // <<< THAY ĐỔI: Gọi hàm từ context, không cần truyền uid
    fetchAndSyncVocabularyData()
      .then(vocabData => {
        setVocabulary(vocabData);
      })
      .catch(error => {
        console.error("Failed to fetch vocabulary in AchievementsProvider:", error);
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, [user, fetchAndSyncVocabularyData]); // <<< THAY ĐỔI: Cập nhật dependency


  // Hàm nhận một phần thưởng
  const claimAchievement = useCallback(async (id: number) => {
    if (isUpdating || !user) return; // <<< THAY ĐỔI: Dùng user từ context

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
      // <<< THAY ĐỔI: Gọi hàm từ context
      await updateAchievementData({
        coinsToAdd: goldReward,
        cardsToAdd: masteryCardReward,
        newVocabularyData: updatedList,
      });

      // <<< THAY ĐỔI: Cập nhật state nội bộ. Không cần gọi handleAchievementsDataUpdate
      // State toàn cục (coins, masteryCards) sẽ tự cập nhật nhờ listener trong course-context.
      setVocabulary(updatedList);

    } catch (error) {
      console.error("Failed to claim single achievement:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData]); // <<< THAY ĐỔI: Cập nhật dependency

  // Hàm nhận tất cả phần thưởng
  const claimAllAchievements = useCallback(async () => {
    if (isUpdating || !user) return; // <<< THAY ĐỔI: Dùng user từ context
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
      // <<< THAY ĐỔI: Gọi hàm từ context
      await updateAchievementData({
        coinsToAdd: totalGoldReward,
        cardsToAdd: totalMasteryCardReward,
        newVocabularyData: updatedList,
      });
      
      // <<< THAY ĐỔI: Cập nhật state nội bộ. Không cần gọi handleAchievementsDataUpdate
      setVocabulary(updatedList);

    } catch (error) {
      console.error("Failed to claim all achievements:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData]); // <<< THAY ĐỔI: Cập nhật dependency

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
    isInitialLoading, // Dùng trạng thái loading nội bộ
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
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
// --- END OF FILE achievement-context.tsx ---
