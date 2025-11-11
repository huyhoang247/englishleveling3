// --- START OF FILE achievement-context.tsx ---

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
  useEffect // useEffect không còn cần thiết cho việc fetch, nhưng giữ lại để tham khảo
} from 'react';
import { useQuizApp } from '../../courses/course-context.tsx'; // Import context chính
import { VocabularyItem } from '../../courses/course-data-service.ts'; // Vẫn giữ import type

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu (Lấy trực tiếp từ course-context) ---
  vocabulary: VocabularyItem[]; // Luôn là một mảng, không bao giờ là null
  coins: number;
  masteryCards: number;
  // --- Trạng thái ---
  isInitialLoading: boolean; // Trạng thái loading, lấy từ course-context
  isUpdating: boolean;       // Trạng thái khi đang thực hiện hành động (nhận thưởng)
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
  // <<< THAY ĐỔI LỚN: Lấy trực tiếp dữ liệu đã được cache và trạng thái loading từ useQuizApp
  const {
    user,
    userCoins: coins,
    masteryCount: masteryCards,
    vocabularyData, // Lấy dữ liệu từ vựng đã được cache
    isVocabularyLoading, // Lấy trạng thái loading từ context cha
    updateAchievementData,
  } = useQuizApp();

  // <<< BỎ: Không cần state local cho vocabulary và loading nữa.
  // const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  // const [isInitialLoading, setIsInitialLoading] = useState(true);

  // <<< GIỮ LẠI: State `isUpdating` là state nội bộ của context này, quản lý riêng hành động claim.
  const [isUpdating, setIsUpdating] = useState(false);

  // <<< BỎ: Toàn bộ Effect để fetch dữ liệu đã được loại bỏ.
  // `course-context` đã làm việc này một lần duy nhất cho toàn bộ ứng dụng.

  // Chuẩn bị dữ liệu vocabulary, đảm bảo luôn là một mảng để tránh lỗi.
  const vocabulary = useMemo(() => vocabularyData || [], [vocabularyData]);


  // Hàm nhận một phần thưởng
  const claimAchievement = useCallback(async (id: number) => {
    if (isUpdating || !user) return;

    // <<< THAY ĐỔI: Sử dụng `vocabulary` được lấy từ context cha
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

      // <<< BỎ: Không cần gọi `setVocabulary` ở đây nữa.
      // `updateAchievementData` trong `course-context` đã tự cập nhật state toàn cục.
      // Component này sẽ tự re-render khi `vocabularyData` từ `useQuizApp` thay đổi.

    } catch (error) {
      console.error("Failed to claim single achievement:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData]); // Cập nhật dependency

  // Hàm nhận tất cả phần thưởng
  const claimAllAchievements = useCallback(async () => {
    if (isUpdating || !user) return;
    
    // <<< THAY ĐỔI: Sử dụng `vocabulary` được lấy từ context cha
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
      
      // <<< BỎ: Không cần gọi `setVocabulary` ở đây nữa.

    } catch (error) {
      console.error("Failed to claim all achievements:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, updateAchievementData]); // Cập nhật dependency

  const totalClaimableRewards = useMemo(() => {
    // <<< THAY ĐỔI: Sử dụng `vocabulary` được lấy từ context cha
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  const value = useMemo(() => ({
    vocabulary, // Cung cấp mảng vocabulary đã được xử lý
    coins,
    masteryCards,
    isInitialLoading: isVocabularyLoading, // <<< THAY ĐỔI: Lấy trạng thái loading từ context cha
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    totalClaimableRewards,
  }), [
    vocabulary, coins, masteryCards, isVocabularyLoading, isUpdating,
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
