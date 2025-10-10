// --- START OF FILE achievement-context.tsx (FULL CODE - MODIFIED) ---

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
  // <<< THAY ĐỔI: useEffect không còn cần thiết nữa >>>
} from 'react';
// <<< THAY ĐỔI: useQuizApp giờ là nguồn dữ liệu chính >>>
import { useQuizApp } from '../../courses/course-context.tsx'; 
import { VocabularyItem } from '../../courses/course-data-service.ts'; 

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu (Lấy từ course-context) ---
  vocabulary: VocabularyItem[];
  coins: number;
  masteryCards: number;
  // --- Trạng thái ---
  isInitialLoading: boolean; // Giờ sẽ lấy từ course-context
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
  // <<< THAY ĐỔI: Lấy tất cả state và hàm cập nhật cần thiết từ useQuizApp >>>
  const {
    userCoins: coins,
    masteryCount: masteryCards,
    user,
    updateAchievementData,
    // Dữ liệu và trình quản lý state mới từ context cha
    vocabulary, 
    isVocabularyLoading: isInitialLoading, // Đổi tên để khớp với interface của context này
    setVocabularyState, // Hàm để cập nhật state toàn cục ở context cha
  } = useQuizApp();
  
  // <<< THAY ĐỔI: Chỉ giữ lại state isUpdating cục bộ. Xóa bỏ state vocabulary và isInitialLoading >>>
  const [isUpdating, setIsUpdating] = useState(false);

  // <<< THAY ĐỔI QUAN TRỌNG: XÓA BỎ TOÀN BỘ `useEffect` dùng để tải dữ liệu ở đây >>>
  // Dữ liệu 'vocabulary' và 'isInitialLoading' đã được `QuizAppProvider` cung cấp sẵn.
  // Không cần tải lại, giúp tiết kiệm N document reads mỗi khi vào màn hình.

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

      // <<< THAY ĐỔI QUAN TRỌNG: Cập nhật state toàn cục thông qua hàm từ context cha >>>
      setVocabularyState(updatedList);

    } catch (error) {
      console.error("Failed to claim single achievement:", error);
    } finally {
      setIsUpdating(false);
    }
    // <<< THAY ĐỔI: Cập nhật dependency array, thêm `setVocabularyState`
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
      
      // <<< THAY ĐỔI QUAN TRỌNG: Cập nhật state toàn cục thông qua hàm từ context cha >>>
      setVocabularyState(updatedList);

    } catch (error) {
      console.error("Failed to claim all achievements:", error);
    } finally {
      setIsUpdating(false);
    }
    // <<< THAY ĐỔI: Cập nhật dependency array, thêm `setVocabularyState`
  }, [vocabulary, user, isUpdating, updateAchievementData, setVocabularyState]);

  const totalClaimableRewards = useMemo(() => {
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  // <<< THAY ĐỔI: Dùng isInitialLoading từ context cha >>>
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
    </Achievements-context.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
// --- END OF FILE achievement-context.tsx (FULL CODE - MODIFIED) ---
