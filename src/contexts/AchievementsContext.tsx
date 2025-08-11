// src/contexts/AchievementsContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  fetchOrCreateUserGameData,
  fetchAndSyncVocabularyData,
  updateAchievementData,
} from '../gameDataService.ts';

// --- Type Definitions ---
// Lấy type từ file thanh-tuu để tránh định nghĩa lại
export interface VocabularyItem {
  id: number;
  word: string;
  exp: number;
  level: number;
  maxExp: number;
}

interface AchievementsState {
  vocabulary: VocabularyItem[];
  masteryCardsCount: number;
  coins: number;
  isLoading: boolean;
  error: Error | null;
}

interface AchievementsActions {
  claimReward: (itemId: number) => Promise<void>;
  claimAllRewards: () => Promise<void>;
  forceRefresh: () => void;
}

type AchievementsContextType = AchievementsState & AchievementsActions;

// --- Context Creation ---

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

// --- Provider Component ---

interface AchievementsProviderProps {
  children: ReactNode;
  currentUser: User | null; // Nhận user object từ props
}

export const AchievementsProvider: React.FC<AchievementsProviderProps> = ({ children, currentUser }) => {
  const [state, setState] = useState<AchievementsState>({
    vocabulary: [],
    masteryCardsCount: 0,
    coins: 0,
    isLoading: true, // Bắt đầu với trạng thái loading
    error: null,
  });

  const fetchData = useCallback(async (userId: string) => {
    // Chỉ set loading=true nếu chưa có dữ liệu hoặc đang có lỗi
    if (!state.vocabulary.length || state.error) {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    }
    try {
      // Tải song song 2 nguồn dữ liệu
      const [gameData, vocabData] = await Promise.all([
        fetchOrCreateUserGameData(userId),
        fetchAndSyncVocabularyData(userId),
      ]);

      setState({
        coins: gameData.coins,
        masteryCardsCount: gameData.masteryCards,
        vocabulary: vocabData,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      console.error("Failed to fetch achievements data in context:", e);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: e instanceof Error ? e : new Error('An unknown error occurred'),
      }));
    }
  }, [state.vocabulary.length, state.error]);
  
  // Effect để tải dữ liệu khi người dùng đăng nhập
  useEffect(() => {
    if (currentUser?.uid) {
      fetchData(currentUser.uid);
    } else {
      // Reset state khi người dùng đăng xuất
      setState({
        vocabulary: [],
        masteryCardsCount: 0,
        coins: 0,
        isLoading: false, 
        error: null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Chỉ chạy khi currentUser thay đổi

  const claimReward = async (itemId: number): Promise<void> => {
    if (!currentUser?.uid) throw new Error("User not authenticated.");

    const originalItem = state.vocabulary.find(item => item.id === itemId);
    if (!originalItem || originalItem.exp < originalItem.maxExp) {
        throw new Error("Item not claimable.");
    }

    const goldReward = originalItem.level * 100;
    const masteryCardReward = 1;

    const updatedList = state.vocabulary.map(item => {
      if (item.id === itemId) {
        const expRemaining = item.exp - item.maxExp;
        const newLevel = item.level + 1;
        const newMaxExp = newLevel * 100;
        return { ...item, level: newLevel, exp: expRemaining, maxExp: newMaxExp };
      }
      return item;
    });

    try {
      const { newCoins, newMasteryCards } = await updateAchievementData(currentUser.uid, {
        coinsToAdd: goldReward,
        cardsToAdd: masteryCardReward,
        newVocabularyData: updatedList,
      });

      // Cập nhật state của context với dữ liệu chính xác từ server
      setState(prevState => ({
        ...prevState,
        vocabulary: updatedList,
        coins: newCoins,
        masteryCardsCount: newMasteryCards,
      }));
    } catch (error) {
      console.error("Claiming reward failed in context:", error);
      throw error; // Ném lỗi ra để component UI có thể xử lý
    }
  };

  const claimAllRewards = async (): Promise<void> => {
    if (!currentUser?.uid) throw new Error("User not authenticated.");

    const claimableItems = state.vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return;

    let totalGoldReward = 0;
    let totalMasteryCardReward = 0;
    const claimableIds = new Set(claimableItems.map(item => item.id));

    const updatedList = state.vocabulary.map(item => {
      if (claimableIds.has(item.id)) {
        totalGoldReward += item.level * 100;
        totalMasteryCardReward += 1;
        const expRemaining = item.exp - item.maxExp;
        const newLevel = item.level + 1;
        const newMaxExp = newLevel * 100;
        return { ...item, level: newLevel, exp: expRemaining, maxExp: newMaxExp };
      }
      return item;
    });
    
    try {
        const { newCoins, newMasteryCards } = await updateAchievementData(currentUser.uid, {
          coinsToAdd: totalGoldReward,
          cardsToAdd: totalMasteryCardReward,
          newVocabularyData: updatedList,
        });

        // Cập nhật state của context
        setState(prevState => ({
          ...prevState,
          vocabulary: updatedList,
          coins: newCoins,
          masteryCardsCount: newMasteryCards,
        }));
    } catch (error) {
       console.error("Claiming all rewards failed in context:", error);
       throw error; // Ném lỗi ra để component UI có thể xử lý
    }
  };

  const value: AchievementsContextType = {
    ...state,
    claimReward,
    claimAllRewards,
    forceRefresh: () => currentUser?.uid ? fetchData(currentUser.uid) : undefined,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

// --- Custom Hook ---

export const useAchievements = (): AchievementsContextType => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
