// --- START OF FILE: src/home/achievements/achievement-store.ts ---

import { create } from 'zustand';
import {
  fetchOrCreateUserGameData,
  fetchAndSyncVocabularyData,
  updateAchievementData,
  VocabularyItem
} from '../../gameDataService.ts'; // Điều chỉnh đường dẫn nếu cần

// 1. Định nghĩa kiểu cho State và Actions
interface AchievementState {
  // --- State ---
  vocabulary: VocabularyItem[];
  coins: number;
  gems: number; // Thêm gems vào store để quản lý tập trung
  masteryCards: number;
  isInitialLoading: boolean;
  isUpdating: boolean;

  // --- Actions (các hàm cập nhật state) ---
  loadInitialData: (userId: string) => Promise<void>;
  claimAchievement: (userId: string, achievementId: number) => Promise<void>;
  claimAllAchievements: (userId: string) => Promise<void>;
  
  // --- Các actions cho phép component khác cập nhật state ---
  setCoins: (amount: number) => void;
  setGems: (amount: number) => void;
  setMasteryCards: (amount: number) => void;
  _setData: (data: Partial<AchievementState>) => void; // Hàm nội bộ để cập nhật state
}

// 2. Tạo store bằng hàm `create` của Zustand
export const useAchievementStore = create<AchievementState>((set, get) => ({
  // --- Giá trị khởi tạo của State ---
  vocabulary: [],
  coins: 0,
  gems: 0,
  masteryCards: 0,
  isInitialLoading: true,
  isUpdating: false,

  // --- Định nghĩa các Actions ---

  /**
   * Tải dữ liệu ban đầu cho màn hình thành tựu và state toàn cục.
   */
  loadInitialData: async (userId: string) => {
    if (!userId) {
      set({ isInitialLoading: false, vocabulary: [], coins: 0, gems: 0, masteryCards: 0 });
      return;
    }
    set({ isInitialLoading: true });
    try {
      const gameDataPromise = fetchOrCreateUserGameData(userId);
      const vocabDataPromise = fetchAndSyncVocabularyData(userId);
      const [gameData, vocabData] = await Promise.all([gameDataPromise, vocabDataPromise]);

      set({
        coins: gameData.coins,
        gems: gameData.gems,
        masteryCards: gameData.masteryCards,
        vocabulary: vocabData,
      });
    } catch (error) {
      console.error("Failed to load achievements data in store:", error);
      set({ vocabulary: [], coins: 0, gems: 0, masteryCards: 0 }); // Reset về trạng thái an toàn
    } finally {
      set({ isInitialLoading: false });
    }
  },

  /**
   * Nhận phần thưởng của một thành tựu cụ thể.
   */
  claimAchievement: async (userId: string, achievementId: number) => {
    const { isUpdating, vocabulary, loadInitialData } = get();
    if (isUpdating || !userId) return;

    const itemToClaim = vocabulary.find(item => item.id === achievementId);
    if (!itemToClaim || itemToClaim.exp < itemToClaim.maxExp) return;

    set({ isUpdating: true });
    
    const updatedList = vocabulary.map(item => {
      if (item.id === achievementId) {
        const newLevel = item.level + 1;
        return { ...item, level: newLevel, exp: item.exp - item.maxExp, maxExp: newLevel * 100 };
      }
      return item;
    });

    try {
      const { newCoins, newMasteryCards } = await updateAchievementData(userId, {
        coinsToAdd: itemToClaim.level * 100,
        cardsToAdd: 1,
        newVocabularyData: updatedList,
      });

      set({ vocabulary: updatedList, coins: newCoins, masteryCards: newMasteryCards });
    } catch (error) {
      console.error("Failed to claim single achievement, re-syncing data:", error);
      await loadInitialData(userId);
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Nhận tất cả phần thưởng có thể nhận.
   */
  claimAllAchievements: async (userId: string) => {
    const { isUpdating, vocabulary, loadInitialData } = get();
    if (isUpdating || !userId) return;

    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return;

    set({ isUpdating: true });

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
      const { newCoins, newMasteryCards } = await updateAchievementData(userId, {
        coinsToAdd: totalGoldReward,
        cardsToAdd: totalMasteryCardReward,
        newVocabularyData: updatedList,
      });

      set({ vocabulary: updatedList, coins: newCoins, masteryCards: newMasteryCards });
    } catch (error) {
      console.error("Failed to claim all achievements, re-syncing data:", error);
      await loadInitialData(userId);
    } finally {
      set({ isUpdating: false });
    }
  },

  // Các setter để component khác cập nhật
  setCoins: (amount) => set({ coins: amount }),
  setGems: (amount) => set({ gems: amount }),
  setMasteryCards: (amount) => set({ masteryCards: amount }),
  _setData: (data) => set(data),
}));
