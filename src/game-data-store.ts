// --- START OF FILE: src/home/achievements/game-data-store.ts ---

import { create } from 'zustand';
import {
  fetchOrCreateUserGameData,
  fetchAndSyncVocabularyData,
  updateAchievementData,
  UserGameData,
  VocabularyItem
} from '../../gameDataService';

// Interface của store giờ sẽ chứa toàn bộ UserGameData và các state khác
interface GameDataState extends UserGameData {
  isInitialLoading: boolean;
  isUpdating: boolean;
  vocabulary: VocabularyItem[];

  // Actions
  loadInitialData: (userId: string) => Promise<void>;
  claimAchievement: (userId: string, achievementId: number) => Promise<void>;
  claimAllAchievements: (userId: string) => Promise<void>;
  
  setCoins: (amount: number) => void;
  setGems: (amount: number) => void;
  updateData: (data: Partial<GameDataState>) => void;
}

// Giá trị mặc định cho toàn bộ state, được export để dùng khi reset
export const initialState: Omit<GameDataState, 'loadInitialData' | 'claimAchievement' | 'claimAllAchievements' | 'setCoins' | 'setGems' | 'updateData'> = {
  coins: 0,
  gems: 0,
  masteryCards: 0,
  pickaxes: 50, // Giá trị mặc định ban đầu
  minerChallengeHighestFloor: 0,
  stats: { hp: 0, atk: 0, def: 0 },
  bossBattleHighestFloor: 0,
  ancientBooks: 0,
  skills: { owned: [], equipped: [null, null, null] },
  totalVocabCollected: 0,
  cardCapacity: 100,
  equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
  vocabulary: [],
  isInitialLoading: true,
  isUpdating: false,
};

export const useGameDataStore = create<GameDataState>((set, get) => ({
  ...initialState,

  loadInitialData: async (userId: string) => {
    if (!userId) {
      set({ ...initialState, isInitialLoading: false });
      return;
    }
    set({ isInitialLoading: true });
    try {
      const [gameData, vocabData] = await Promise.all([
        fetchOrCreateUserGameData(userId),
        fetchAndSyncVocabularyData(userId)
      ]);

      // Cập nhật toàn bộ state từ dữ liệu fetch được
      set({ ...gameData, vocabulary: vocabData, isInitialLoading: false });

    } catch (error) {
      console.error("Failed to load initial data in store:", error);
      set({ ...initialState, isInitialLoading: false });
    }
  },

  claimAchievement: async (userId, achievementId) => {
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

  claimAllAchievements: async (userId) => {
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
  
  setCoins: (amount) => set({ coins: amount }),
  setGems: (amount) => set({ gems: amount }),
  updateData: (data) => set(data),
}));

// --- END OF FILE: src/home/achievements/game-data-store.ts ---
