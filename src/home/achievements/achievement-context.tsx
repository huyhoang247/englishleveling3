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
import { User } from 'firebase/auth';
import {
  fetchOrCreateUserGameData,
} from '../../gameDataService.ts';
// <<<--- THAY ĐỔI: Import từ file service mới
import {
  fetchAndSyncVocabularyData,
  updateAchievementData,
  VocabularyItem
} from './achievement-service.ts';

// Định nghĩa shape của Context
interface AchievementsContextState {
  // --- Dữ liệu ---
  vocabulary: VocabularyItem[];
  coins: number;
  masteryCards: number;
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

// <<<--- BƯỚC 3: NHẬN VÀ SỬ DỤNG CALLBACK TRONG PROVIDER ---

// Props cho Provider
interface AchievementsProviderProps {
  children: ReactNode;
  user: User | null; // Cần user để lấy dữ liệu
  // <<<--- THAY ĐỔI: Thêm prop onDataUpdate
  onDataUpdate: (updates: { coins?: number, masteryCards?: number }) => void;
}

// Component Provider
export const AchievementsProvider = ({ children, user, onDataUpdate }: AchievementsProviderProps) => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm tải/làm mới dữ liệu chính
  const loadData = useCallback(async (userId: string) => {
    try {
      const gameDataPromise = fetchOrCreateUserGameData(userId);
      const vocabDataPromise = fetchAndSyncVocabularyData(userId);

      const [gameData, vocabData] = await Promise.all([gameDataPromise, vocabDataPromise]);

      setCoins(gameData.coins);
      setMasteryCards(gameData.masteryCards);
      setVocabulary(vocabData);

    } catch (error) {
      console.error("Failed to load achievements data in context:", error);
      setVocabulary([]);
      setCoins(0);
      setMasteryCards(0);
    }
  }, []);

  // Effect để tải dữ liệu lần đầu khi user đăng nhập
  useEffect(() => {
    if (user && user.uid) {
      setIsInitialLoading(true);
      loadData(user.uid).finally(() => setIsInitialLoading(false));
    } else {
      setIsInitialLoading(true);
      setVocabulary([]);
      setCoins(0);
      setMasteryCards(0);
    }
  }, [user, loadData]);

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

      // Cập nhật state nội bộ
      setVocabulary(updatedList);
      setCoins(newCoins);
      setMasteryCards(newMasteryCards);

      // <<<--- THAY ĐỔI: Gọi callback để thông báo cho component cha
      onDataUpdate({ coins: newCoins, masteryCards: newMasteryCards });

    } catch (error) {
      console.error("Failed to claim single achievement, re-syncing data:", error);
      await loadData(user.uid);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, loadData, onDataUpdate]); // <<<--- THAY ĐỔI: Thêm onDataUpdate vào dependencies

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
      
      // Cập nhật state nội bộ
      setVocabulary(updatedList);
      setCoins(newCoins);
      setMasteryCards(newMasteryCards);

      // <<<--- THAY ĐỔI: Gọi callback để thông báo cho component cha
      onDataUpdate({ coins: newCoins, masteryCards: newMasteryCards });

    } catch (error) {
      console.error("Failed to claim all achievements, re-syncing data:", error);
      await loadData(user.uid);
    } finally {
      setIsUpdating(false);
    }
  }, [vocabulary, user, isUpdating, loadData, onDataUpdate]); // <<<--- THAY ĐỔI: Thêm onDataUpdate vào dependencies

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

  const value = useMemo(() => ({
    vocabulary,
    coins,
    masteryCards,
    isInitialLoading,
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    refreshData,
    totalClaimableRewards,
  }), [
    vocabulary,
    coins,
    masteryCards,
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
// --- END OF FILE achievement-context.tsx ---
