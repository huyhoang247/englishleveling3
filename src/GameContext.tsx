// --- START OF FILE src/GameContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase.js';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint, CRAFTING_COST, getRandomRarity, getTotalUpgradeCost, getUpgradeCost, Rarity, MergeGroup, calculateMergeResult } from './skill-data.tsx';
import { OwnedItem, EquippedItems } from './equipment.tsx';
import { calculateTotalStatValue, statConfig, calculateUpgradeCost, getBonusForLevel } from './home/upgrade-stats/upgrade-ui.tsx';

import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes, processMinerChallengeResult, processShopPurchase,
  upgradeUserStats,
  updateUserSkills
} from './gameDataService.ts';

// --- Define the shape of the context ---
interface IGameContext {
    // User Data States
    isLoadingUserData: boolean;
    isSyncingData: boolean;
    coins: number;
    displayedCoins: number;
    gems: number;
    masteryCards: number;
    pickaxes: number;
    minerChallengeHighestFloor: number;
    userStats: { hp: number; atk: number; def: number; };
    jackpotPool: number;
    bossBattleHighestFloor: number;
    ancientBooks: number;
    ownedSkills: OwnedSkill[];
    equippedSkillIds: (string | null)[];
    totalVocabCollected: number;
    cardCapacity: number;
    equipmentPieces: number;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;

    // --- STATE & DERIVED STATE TỪ SKILL_CONTEXT ---
    MAX_SKILLS_IN_STORAGE: number;
    equippedSkills: (OwnedSkill | null)[];
    unequippedSkillsSorted: OwnedSkill[];

    // UI States
    isBackgroundPaused: boolean;
    showRateLimitToast: boolean;
    isRankOpen: boolean;
    isPvpArenaOpen: boolean;
    isLuckyGameOpen: boolean;
    isMinerChallengeOpen: boolean;
    isBossBattleOpen: boolean;
    isShopOpen: boolean;
    isVocabularyChestOpen: boolean;
    isAchievementsOpen: boolean;
    isAdminPanelOpen: boolean;
    isUpgradeScreenOpen: boolean;
    isBaseBuildingOpen: boolean;
    isSkillScreenOpen: boolean;
    isEquipmentOpen: boolean;
    isAnyOverlayOpen: boolean;
    isGamePaused: boolean;

    // --- STATE DÀNH RIÊNG CHO MÀN HÌNH UPGRADE ---
    isUpgradingStats: boolean;
    upgradeMessage: ReactNode;
    upgradeToastData: {
      isVisible: boolean;
      icon: JSX.Element;
      bonus: number;
      colorClasses: { border: string; text: string; };
    } | null;

    // Functions
    refreshUserData: () => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => Promise<void>;
    handleUpdatePickaxes: (amountToAdd: number) => Promise<void>;
    handleUpdateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
    handleShopPurchase: (item: any, quantity: number) => Promise<void>;
    getPlayerBattleStats: () => { maxHp: number; hp: number; atk: number; def: number; maxEnergy: number; energy: number; };
    getEquippedSkillsDetails: () => (OwnedSkill & SkillBlueprint)[];
    handleStateUpdateFromChest: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
    handleAchievementsDataUpdate: (updates: { coins?: number; masteryCards?: number }) => void;
    handleSkillScreenClose: (dataUpdated: boolean) => void;
    handleStatUpgrade: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
    
    // --- CÁC HÀM LOGIC TỪ SKILL_CONTEXT ---
    handleEquipSkill: (skillToEquip: OwnedSkill) => Promise<boolean>;
    handleUnequipSkill: (skillToUnequip: OwnedSkill) => Promise<boolean>;
    handleCraftSkill: () => Promise<OwnedSkill | null>;
    handleDisenchantSkill: (skillToDisenchant: OwnedSkill) => Promise<{ success: boolean; returnedGold: number; returnedBooks: number; }>;
    handleUpgradeSkill: (skillToUpgrade: OwnedSkill) => Promise<OwnedSkill | null>;
    handleMergeSkills: (group: MergeGroup) => Promise<boolean>;

    // Toggles
    toggleRank: () => void;
    togglePvpArena: () => void;
    toggleLuckyGame: () => void;
    toggleMinerChallenge: () => void;
    toggleBossBattle: () => void;
    toggleShop: () => void;
    toggleVocabularyChest: () => void;
    toggleAchievements: () => void;
    toggleAdminPanel: () => void;
    toggleUpgradeScreen: () => void;
    toggleSkillScreen: () => void;
    toggleEquipmentScreen: () => void;
    toggleBaseBuilding: () => void;
    setCoins: React.Dispatch<React.SetStateAction<number>>; // For direct updates from components
}

// --- Create the context ---
const GameContext = createContext<IGameContext | undefined>(undefined);

// --- Create the Provider component ---
interface GameProviderProps {
    children: ReactNode;
    hideNavBar: () => void;
    showNavBar: () => void;
    assetsLoaded: boolean;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, hideNavBar, showNavBar, assetsLoaded }) => {
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // States for UI and User Data
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [pickaxes, setPickaxes] = useState(0);
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  const [userStats, setUserStats] = useState({ hp: 0, atk: 0, def: 0 });
  const [jackpotPool, setJackpotPool] = useState(0);
  const [bossBattleHighestFloor, setBossBattleHighestFloor] = useState(0);
  const [ancientBooks, setAncientBooks] = useState(0);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });
  
  const MAX_SKILLS_IN_STORAGE = 50;

  // States for managing overlay visibility
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isPvpArenaOpen, setIsPvpArenaOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isMinerChallengeOpen, setIsMinerChallengeOpen] = useState(false);
  const [isBossBattleOpen, setIsBossBattleOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVocabularyChestOpen, setIsVocabularyChestOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUpgradeScreenOpen, setIsUpgradeScreenOpen] = useState(false);
  const [isBaseBuildingOpen, setIsBaseBuildingOpen] = useState(false);
  const [isSkillScreenOpen, setIsSkillScreenOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);

  const [isUpgradingStats, setIsUpgradingStats] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<ReactNode>('');
  const [upgradeToastData, setUpgradeToastData] = useState<any | null>(null);
  
  const refreshUserData = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    console.log("Refreshing all user data triggered...");
    setIsLoadingUserData(true);
    try {
      const gameData = await fetchOrCreateUserGameData(userId);
      setCoins(gameData.coins);
      setDisplayedCoins(gameData.coins);
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
    } catch (error) { console.error("Error refreshing user data:", error);
    } finally { setIsLoadingUserData(false); }
  }, []);

  // --- DERIVED STATE TỪ SKILL_CONTEXT ---
  const equippedSkills = useMemo(() => {
      return equippedSkillIds.map(id => ownedSkills.find(s => s.id === id) || null);
  }, [equippedSkillIds, ownedSkills]);

  const unequippedSkillsSorted = useMemo(() => {
      return ownedSkills
          .filter(ownedSkill => !equippedSkillIds.includes(ownedSkill.id))
          .sort((a, b) => {
              const rarityOrder = ['E', 'D', 'B', 'A', 'S', 'SR'];
              const rarityIndexA = rarityOrder.indexOf(a.rarity);
              const rarityIndexB = rarityOrder.indexOf(b.rarity);
              if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
              if (a.level !== b.level) return b.level - a.level;
              const skillA = ALL_SKILLS.find(s => s.id === a.skillId)!;
              const skillB = ALL_SKILLS.find(s => s.id === b.skillId)!;
              return skillA.name.localeCompare(skillB.name);
          });
  }, [ownedSkills, equippedSkillIds]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoadingUserData(true);
        try {
            const [_, jackpotData] = await Promise.all([ refreshUserData(), fetchJackpotPool() ]);
            setJackpotPool(jackpotData);
        } catch (error) { console.error("Error fetching initial user/app data:", error); setIsLoadingUserData(false); }
      } else {
        setIsRankOpen(false); setIsPvpArenaOpen(false); setIsLuckyGameOpen(false); setIsBossBattleOpen(false); setIsShopOpen(false); setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false); setIsAdminPanelOpen(false); setIsUpgradeScreenOpen(false); setIsBackgroundPaused(false); setCoins(0); setDisplayedCoins(0); setGems(0); setMasteryCards(0);
        setPickaxes(0); setMinerChallengeHighestFloor(0); setUserStats({ hp: 0, atk: 0, def: 0 }); setBossBattleHighestFloor(0); setAncientBooks(0);
        setOwnedSkills([]); setEquippedSkillIds([]); setTotalVocabCollected(0); setEquipmentPieces(0); setOwnedItems([]);
        setEquippedItems({ weapon: null, armor: null, accessory: null }); setCardCapacity(100); setJackpotPool(0); setIsLoadingUserData(true);
      }
    });
    return () => unsubscribe();
  }, [refreshUserData]);

  useEffect(() => {
      const handleVisibilityChange = () => { setIsBackgroundPaused(document.hidden); };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  useEffect(() => { if (showRateLimitToast) { const timer = setTimeout(() => { setShowRateLimitToast(false); }, 2500); return () => clearTimeout(timer); } }, [showRateLimitToast]);
  useEffect(() => { if (displayedCoins === coins) return; const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100); return () => clearTimeout(timeoutId); }, [coins]);
  
  const handleUpdateDatabaseSkills = useCallback(async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) return false;
      setIsSyncingData(true);
      try {
          const { newCoins, newBooks } = await updateUserSkills(userId, updates);
          setCoins(newCoins);
          setAncientBooks(newBooks);
          setOwnedSkills(updates.newOwned);
          setEquippedSkillIds(updates.newEquippedIds);
          return true;
      } catch (error: any) {
          console.error("Lỗi:", error.message || 'Cập nhật thất bại');
          return false;
      } finally {
          setIsSyncingData(false);
      }
  }, []);

  const handleBossFloorUpdate = async (newFloor: number) => {
    // ... logic giữ nguyên
  };
  
  const handleMinerChallengeEnd = async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    // ... logic giữ nguyên
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    // ... logic giữ nguyên
  };
  
  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
    // ... logic giữ nguyên
  };
  
  const handleShopPurchase = async (item: any, quantity: number) => {
    // ... logic giữ nguyên
  };

  const handleStatUpgrade = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    // ... logic giữ nguyên
  }, [isUpgradingStats, userStats, coins]);

  // --- CÁC HÀM LOGIC TỪ SKILL_CONTEXT ---
  const handleEquipSkill = useCallback(async (skillToEquip: OwnedSkill) => {
      if (isSyncingData) return false;
      const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);
      if (firstEmptySlotIndex === -1) return false; // UI will show error

      const newEquippedIds = [...equippedSkillIds];
      newEquippedIds[firstEmptySlotIndex] = skillToEquip.id;

      return await handleUpdateDatabaseSkills({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
  }, [isSyncingData, equippedSkills, equippedSkillIds, ownedSkills, handleUpdateDatabaseSkills]);

  const handleUnequipSkill = useCallback(async (skillToUnequip: OwnedSkill) => {
      if (isSyncingData) return false;
      const slotIndex = equippedSkillIds.findIndex(id => id === skillToUnequip.id);
      if (slotIndex === -1) return false;

      const newEquippedIds = [...equippedSkillIds];
      newEquippedIds[slotIndex] = null;

      return await handleUpdateDatabaseSkills({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
  }, [isSyncingData, equippedSkillIds, ownedSkills, handleUpdateDatabaseSkills]);

  const handleCraftSkill = useCallback(async (): Promise<OwnedSkill | null> => {
      if (isSyncingData || ancientBooks < CRAFTING_COST || ownedSkills.length >= MAX_SKILLS_IN_STORAGE) {
          return null; // UI will show error based on state
      }

      const newSkillBlueprint = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
      const newRarity = getRandomRarity();
      const newOwnedSkill: OwnedSkill = { id: `owned-${Date.now()}-${newSkillBlueprint.id}-${Math.random()}`, skillId: newSkillBlueprint.id, level: 1, rarity: newRarity };
      const newOwnedList = [...ownedSkills, newOwnedSkill];

      const success = await handleUpdateDatabaseSkills({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: -CRAFTING_COST });
      return success ? newOwnedSkill : null;
  }, [isSyncingData, ancientBooks, ownedSkills, equippedSkillIds, handleUpdateDatabaseSkills]);

  const handleDisenchantSkill = useCallback(async (skillToDisenchant: OwnedSkill) => {
      if (isSyncingData || equippedSkills.some(s => s?.id === skillToDisenchant.id)) {
          return { success: false, returnedGold: 0, returnedBooks: 0 };
      }

      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId)!;
      const booksToReturn = Math.floor(CRAFTING_COST / 2);
      const goldToReturn = getTotalUpgradeCost(skillBlueprint, skillToDisenchant.level);
      const newOwnedList = ownedSkills.filter(s => s.id !== skillToDisenchant.id);

      const success = await handleUpdateDatabaseSkills({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: goldToReturn, booksChange: booksToReturn });
      return { success, returnedGold: goldToReturn, returnedBooks: booksToReturn };
  }, [isSyncingData, equippedSkills, ownedSkills, equippedSkillIds, handleUpdateDatabaseSkills]);

  const handleUpgradeSkill = useCallback(async (skillToUpgrade: OwnedSkill) => {
      if (isSyncingData) return null;
      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
      if (!skillBlueprint || skillBlueprint.upgradeCost === undefined) return null;

      const cost = getUpgradeCost(skillBlueprint.upgradeCost, skillToUpgrade.level);
      if (coins < cost) return null;

      const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
      const newOwnedList = ownedSkills.map(s => s.id === skillToUpgrade.id ? updatedSkill : s);

      const success = await handleUpdateDatabaseSkills({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: -cost, booksChange: 0 });
      return success ? updatedSkill : null;
  }, [isSyncingData, coins, ownedSkills, equippedSkillIds, handleUpdateDatabaseSkills]);

  const handleMergeSkills = useCallback(async (group: MergeGroup) => {
      if (isSyncingData || group.skills.length < 3 || !group.nextRarity) return false;

      const skillsToConsume = group.skills.slice(0, 3);
      const skillIdsToConsume = skillsToConsume.map(s => s.id);
      const { level: finalLevel, refundGold } = calculateMergeResult(skillsToConsume, group.blueprint);
      const newUpgradedSkill: OwnedSkill = { id: `owned-${Date.now()}-${group.skillId}-${Math.random()}`, skillId: group.skillId, level: finalLevel, rarity: group.nextRarity };
      const newOwnedList = ownedSkills.filter(s => !skillIdsToConsume.includes(s.id)).concat(newUpgradedSkill);

      return await handleUpdateDatabaseSkills({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: refundGold, booksChange: 0 });
  }, [isSyncingData, ownedSkills, equippedSkillIds, handleUpdateDatabaseSkills]);

  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      // ... logic giữ nguyên
  };

  const getPlayerBattleStats = () => {
    // ... logic giữ nguyên
  };

  const getEquippedSkillsDetails = () => {
    // ... logic giữ nguyên
  };
  
  const handleStateUpdateFromChest = (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => { setCoins(updates.newCoins); setGems(updates.newGems); setTotalVocabCollected(updates.newTotalVocab); };
  const handleAchievementsDataUpdate = (updates: { coins?: number; masteryCards?: number }) => { if (updates.coins !== undefined) setCoins(updates.coins); if (updates.masteryCards !== undefined) setMasteryCards(updates.masteryCards); };
  
  const toggleRank = createToggleFunction(setIsRankOpen);
  const togglePvpArena = createToggleFunction(setIsPvpArenaOpen);
  const toggleLuckyGame = createToggleFunction(setIsLuckyGameOpen);
  const toggleMinerChallenge = createToggleFunction(setIsMinerChallengeOpen);
  const toggleBossBattle = createToggleFunction(setIsBossBattleOpen);
  const toggleShop = createToggleFunction(setIsShopOpen);
  const toggleVocabularyChest = createToggleFunction(setIsVocabularyChestOpen);
  const toggleAchievements = createToggleFunction(setIsAchievementsOpen);
  const toggleAdminPanel = createToggleFunction(setIsAdminPanelOpen);
  const toggleUpgradeScreen = createToggleFunction(setIsUpgradeScreenOpen);
  const toggleSkillScreen = createToggleFunction(setIsSkillScreenOpen);
  const toggleEquipmentScreen = createToggleFunction(setIsEquipmentOpen);
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  
  const handleSkillScreenClose = (dataUpdated: boolean) => {
    setIsSkillScreenOpen(false);
    showNavBar();
    if (dataUpdated) {
        refreshUserData();
    }
  };

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
  const isLoading = isLoadingUserData || !assetsLoaded;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

  const value: IGameContext = {
    isLoadingUserData: isLoading, isSyncingData, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, userStats, jackpotPool,
    bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, equippedItems,
    MAX_SKILLS_IN_STORAGE, equippedSkills, unequippedSkillsSorted,
    isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen, isAnyOverlayOpen, isGamePaused,
    isUpgradingStats, upgradeMessage, upgradeToastData,
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool,
    handleShopPurchase, getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, handleSkillScreenClose,
    handleStatUpgrade,
    handleEquipSkill, handleUnequipSkill, handleCraftSkill, handleDisenchantSkill, handleUpgradeSkill, handleMergeSkills,
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge, toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleBaseBuilding, setCoins
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// --- Create a custom hook for easy context access ---
export const useGame = (): IGameContext => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
