import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  fetchOrCreateUserGameData,
  fetchAndSyncVocabularyData,
  updateAchievementData,
  VocabularyItem
} from '../../gameDataService.ts';

// 1. Định nghĩa State và Actions
interface AchievementState {
  // --- State ---
  vocabulary: VocabularyItem[];
  coins: number;
  masteryCards: number;
  isInitialLoading: boolean;
  isUpdating: boolean;
  
  // --- Actions ---
  // Khởi tạo và tải dữ liệu ban đầu
  initialize: (user: User) => Promise<void>;
  // Nhận một thành tựu
  claimAchievement: (id: number, user: User) => Promise<{ newCoins: number; newMasteryCards: number } | null>;
  // Nhận tất cả thành tựu
  claimAllAchievements: (user: User) => Promise<{ newCoins: number; newMasteryCards: number } | null>;
  // Reset state về ban đầu khi component unmount hoặc user thay đổi
  reset: () => void;
}

// 2. Tạo Store
const initialState = {
  vocabulary: [],
  coins: 0,
  masteryCards: 0,
  isInitialLoading: true,
  isUpdating: false,
};

export const useAchievementStore = create<AchievementState>((set, get) => ({
  ...initialState,

  initialize: async (user) => {
    if (!user || !user.uid) {
      console.log("Achievement store: No user, resetting.");
      get().reset();
      return;
    }

    set({ isInitialLoading: true });
    try {
      const gameDataPromise = fetchOrCreateUserGameData(user.uid);
      const vocabDataPromise = fetchAndSyncVocabularyData(user.uid);
      const [gameData, vocabData] = await Promise.all([gameDataPromise, vocabDataPromise]);
      
      set({
        coins: gameData.coins,
        masteryCards: gameData.masteryCards,
        vocabulary: vocabData,
      });
    } catch (error) {
      console.error("Failed to initialize achievement store:", error);
      get().reset(); // Reset to clean state on error
    } finally {
      set({ isInitialLoading: false });
    }
  },

  claimAchievement: async (id, user) => {
    const { isUpdating, vocabulary } = get();
    if (isUpdating || !user?.uid) return null;

    const itemToClaim = vocabulary.find(item => item.id === id);
    if (!itemToClaim || itemToClaim.exp < itemToClaim.maxExp) return null;

    set({ isUpdating: true });
    
    // Logic tính toán và cập nhật lạc quan (optimistic update)
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

      // Cập nhật state của store sau khi thành công
      set({
        vocabulary: updatedList,
        coins: newCoins,
        masteryCards: newMasteryCards,
      });
      // Trả về dữ liệu mới để component có thể gọi onDataUpdate
      return { newCoins, newMasteryCards };
    } catch (error) {
      console.error("Failed to claim single achievement, re-syncing data:", error);
      // Nếu lỗi, tải lại toàn bộ dữ liệu để đảm bảo đồng bộ
      await get().initialize(user);
      return null;
    } finally {
      set({ isUpdating: false });
    }
  },

  claimAllAchievements: async (user) => {
    const { isUpdating, vocabulary } = get();
    if (isUpdating || !user?.uid) return null;

    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return null;

    set({ isUpdating: true });

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
      
      set({
        vocabulary: updatedList,
        coins: newCoins,
        masteryCards: newMasteryCards,
      });
      // Trả về dữ liệu mới để component có thể gọi onDataUpdate
      return { newCoins, newMasteryCards };
    } catch (error) {
      console.error("Failed to claim all achievements, re-syncing data:", error);
      await get().initialize(user);
      return null;
    } finally {
      set({ isUpdating: false });
    }
  },

  reset: () => set(initialState),
}));
