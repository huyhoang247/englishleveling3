// --- START OF FILE src/game-data-context.tsx ---

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { auth } from './firebase.js';
import { fetchOrCreateUserGameData } from './gameDataService.ts';
// Giả sử bạn có các type này định nghĩa ở đâu đó, nếu không có thể định nghĩa trực tiếp ở đây
import { OwnedSkill, OwnedItem, EquippedItems } from './equipment.tsx'; 

// --- INTERFACES ---
interface UserStats {
  hp: number;
  atk: number;
  def: number;
}

interface GameDataContextType {
  // States
  isLoadingData: boolean;
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  userStats: UserStats;
  bossBattleHighestFloor: number;
  ancientBooks: number;
  ownedSkills: OwnedSkill[];
  equippedSkillIds: (string | null)[];
  totalVocabCollected: number;
  cardCapacity: number;
  equipmentPieces: number;
  ownedItems: OwnedItem[];
  equippedItems: EquippedItems;
  
  // Actions
  refreshUserData: () => Promise<void>;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  setGems: React.Dispatch<React.SetStateAction<number>>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};

// --- PROVIDER COMPONENT ---
export function GameDataProvider({ children }: { children: ReactNode }) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Toàn bộ state của game được quản lý tại đây
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [pickaxes, setPickaxes] = useState(0);
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({ hp: 0, atk: 0, def: 0 });
  const [bossBattleHighestFloor, setBossBattleHighestFloor] = useState(0);
  const [ancientBooks, setAncientBooks] = useState(0);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });

  const refreshUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user found, skipping data refresh.");
      setIsLoadingData(false);
      return;
    }
    
    setIsLoadingData(true);
    try {
      console.log("GameDataProvider: Refreshing user data...");
      const gameData = await fetchOrCreateUserGameData(user.uid);
      
      setCoins(gameData.coins);
      setGems(gameData.gems);
      setMasteryCards(gameData.masteryCards);
      setPickaxes(gameData.pickaxes);
      setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor);
      setUserStats(gameData.stats);
      setBossBattleHighestFloor(gameData.bossBattleHighestFloor);
      setAncientBooks(gameData.ancientBooks);
      setOwnedSkills(gameData.skills.owned);
      setEquippedSkillIds(gameData.skills.equipped);
      setTotalVocabCollected(gameData.totalVocabCollected);
      setCardCapacity(gameData.cardCapacity);
      setEquipmentPieces(gameData.equipment.pieces);
      setOwnedItems(gameData.equipment.owned);
      setEquippedItems(gameData.equipment.equipped);

    } catch (error) {
      console.error("Error refreshing user data in GameDataContext:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
              refreshUserData();
          } else {
              // Reset state khi người dùng logout
              setIsLoadingData(false);
              setCoins(0);
              setGems(0);
              setMasteryCards(0);
              setPickaxes(0);
              setMinerChallengeHighestFloor(0);
              setUserStats({ hp: 0, atk: 0, def: 0 });
              setBossBattleHighestFloor(0);
              setAncientBooks(0);
              setOwnedSkills([]);
              setEquippedSkillIds([null, null, null]);
              setTotalVocabCollected(0);
              setCardCapacity(100);
              setEquipmentPieces(0);
              setOwnedItems([]);
              setEquippedItems({ weapon: null, armor: null, accessory: null });
          }
      });
      return () => unsubscribe();
  }, [refreshUserData]);

  const value: GameDataContextType = {
    isLoadingData,
    coins,
    gems,
    masteryCards,
    pickaxes,
    minerChallengeHighestFloor,
    userStats,
    bossBattleHighestFloor,
    ancientBooks,
    ownedSkills,
    equippedSkillIds,
    totalVocabCollected,
    cardCapacity,
    equipmentPieces,
    ownedItems,
    equippedItems,
    refreshUserData,
    setCoins,
    setGems,
  };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}
// --- END OF FILE src/game-data-context.tsx ---
