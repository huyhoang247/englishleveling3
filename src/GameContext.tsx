// --- START OF FILE src/GameContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase.js';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './home/skill-game/skill-data.tsx';
import { OwnedItem, EquippedItems, EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';
import { calculateTotalStatValue, statConfig } from './home/upgrade-stats/upgrade-ui.tsx';

import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes, processMinerChallengeResult, processShopPurchase
} from './gameDataService.ts';
import { SkillScreenExitData } from './home/skill-game/skill-context.tsx';

// --- Define the shape of the context ---
interface IGameContext {
    // User Data States
    isLoadingUserData: boolean;
    isSyncingData: boolean;
    userName: string;
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
    isAuctionHouseOpen: boolean;
    isAnyOverlayOpen: boolean;
    isGamePaused: boolean;

    // Functions
    refreshUserData: () => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => Promise<void>;
    handleUpdatePickaxes: (amountToAdd: number) => Promise<void>;
    handleUpdateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
    handleStatsUpdate: (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => void;
    handleShopPurchase: (item: any, quantity: number) => Promise<void>;
    getPlayerBattleStats: () => { maxHp: number; hp: number; atk: number; def: number; maxEnergy: number; energy: number; };
    getEquippedSkillsDetails: () => (OwnedSkill & SkillBlueprint)[];
    handleStateUpdateFromChest: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
    handleAchievementsDataUpdate: (updates: { coins?: number; masteryCards?: number }) => void;
    handleSkillScreenClose: (dataUpdated: boolean) => void;
    updateSkillsState: (data: SkillScreenExitData) => void;
    updateEquipmentData: (data: EquipmentScreenExitData) => void;
    updateUserCurrency: (updates: { coins?: number; gems?: number }) => void;


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
    toggleAuctionHouse: () => void;
    toggleBaseBuilding: () => void;
    setCoins: React.Dispatch<React.SetStateAction<number>>; // For direct updates from components
}

const GameContext = createContext<IGameContext | undefined>(undefined);

interface GameProviderProps {
    children: ReactNode;
    hideNavBar: () => void;
    showNavBar: () => void;
    assetsLoaded: boolean;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, hideNavBar, showNavBar, assetsLoaded }) => {
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userName, setUserName] = useState("Player");

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
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, Helmet: null });

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
  const [isAuctionHouseOpen, setIsAuctionHouseOpen] = useState(false);
  
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);
  
  const refreshUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setUserName(user.displayName || "Player");
    setIsLoadingUserData(true);
    try {
      const gameData = await fetchOrCreateUserGameData(user.uid);
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoadingUserData(true);
        try {
            await refreshUserData();
            const jackpotData = await fetchJackpotPool();
            setJackpotPool(jackpotData);
        } catch (error) { console.error("Error fetching initial user/app data:", error); setIsLoadingUserData(false); }
      } else {
        setIsLoadingUserData(true); // Reset state
        setUserName("Player"); setCoins(0); setGems(0); //... reset all states
      }
    });
    return () => unsubscribe();
  }, [refreshUserData]);

  useEffect(() => { if (showRateLimitToast) { const timer = setTimeout(() => setShowRateLimitToast(false), 2500); return () => clearTimeout(timer); } }, [showRateLimitToast]);
  useEffect(() => { if (displayedCoins !== coins) { const id = setTimeout(() => setDisplayedCoins(coins), 100); return () => clearTimeout(id); } }, [coins, displayedCoins]);
  
  const handleBossFloorUpdate = async (newFloor: number) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    try {
        await updateUserBossFloor(userId, newFloor, bossBattleHighestFloor);
        if (newFloor > bossBattleHighestFloor) setBossBattleHighestFloor(newFloor);
    } catch (error) { console.error("Error updating boss floor:", error); }
  };
  
  const handleMinerChallengeEnd = async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    setIsSyncingData(true);
    try {
      const { newCoins, newPickaxes, newHighestFloor } = await processMinerChallengeResult(userId, result);
      setCoins(newCoins); setPickaxes(newPickaxes); setMinerChallengeHighestFloor(newHighestFloor);
    } catch (error) { console.error("Error processing miner challenge result:", error); } finally { setIsSyncingData(false); }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    setPickaxes(await updateUserPickaxes(userId, pickaxes + amountToAdd));
  };
  
  const handleUpdateJackpotPool = async (amount: number, reset = false) => {
      setJackpotPool(await updateJackpotPool(amount, reset));
  };
  
  const handleStatsUpdate = (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => {
    setCoins(newCoins); setUserStats(newStats);
  };
  
  const handleShopPurchase = async (item: any, quantity: number) => {
    const userId = auth.currentUser?.uid; if (!userId) throw new Error("User not authenticated.");
    setIsSyncingData(true);
    try {
      const { newCoins, newBooks, newCapacity } = await processShopPurchase(userId, item, quantity);
      setCoins(newCoins);
      if (item.id === 1009) setAncientBooks(newBooks);
      else if (item.id === 2001) setCardCapacity(newCapacity);
      alert(`Mua thành công x${quantity} ${item.name}!`);
    } catch (error: any) { alert(`Mua thất bại: ${error.message}`); throw error;
    } finally { setIsSyncingData(false); }
  };

  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      if (isLoadingUserData || !assetsLoaded || isSyncingData) return;
      setter(prev => {
          const newState = !prev;
          if (newState) {
              hideNavBar();
              [ setIsRankOpen, setIsPvpArenaOpen, setIsLuckyGameOpen, setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen, setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen, setIsAuctionHouseOpen ].forEach(s => { if (s !== setter) s(false); });
          } else { showNavBar(); }
          return newState;
      });
  };

  const getPlayerBattleStats = () => {
    const bonusHp = calculateTotalStatValue(userStats.hp, statConfig.hp.baseUpgradeBonus);
    const bonusAtk = calculateTotalStatValue(userStats.atk, statConfig.atk.baseUpgradeBonus);
    const bonusDef = calculateTotalStatValue(userStats.def, statConfig.def.baseUpgradeBonus);
    let itemHpBonus = 0, itemAtkBonus = 0, itemDefBonus = 0;
    Object.values(equippedItems).forEach(itemId => { if(itemId){ const item = ownedItems.find(i => i.id === itemId); if (item) { itemHpBonus += item.stats.hp || 0; itemAtkBonus += item.stats.atk || 0; itemDefBonus += item.stats.def || 0; } } });
    return { maxHp: bonusHp + itemHpBonus, hp: bonusHp + itemHpBonus, atk: bonusAtk + itemAtkBonus, def: bonusDef + itemDefBonus, maxEnergy: 50, energy: 50 };
  };

  const getEquippedSkillsDetails = () => {
    return equippedSkillIds.map(id => { if (!id) return null; const o = ownedSkills.find(s => s.id === id); const b = ALL_SKILLS.find(b => b.id === o?.skillId); return o && b ? { ...o, ...b } : null; }).filter(Boolean) as (OwnedSkill & SkillBlueprint)[];
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
  const toggleAuctionHouse = createToggleFunction(setIsAuctionHouseOpen);
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  
  const handleSkillScreenClose = (dataUpdated: boolean) => { toggleSkillScreen(); if (dataUpdated) refreshUserData(); };
  const updateSkillsState = (data: SkillScreenExitData) => { setCoins(data.gold); setAncientBooks(data.ancientBooks); setOwnedSkills(data.ownedSkills); setEquippedSkillIds(data.equippedSkillIds); };
  const updateEquipmentData = (data: EquipmentScreenExitData) => { setCoins(data.gold); setEquipmentPieces(data.equipmentPieces); setOwnedItems(data.ownedItems); setEquippedItems(data.equippedItems); };
  const updateUserCurrency = (updates: { coins?: number; gems?: number }) => { if (updates.coins !== undefined) setCoins(updates.coins); if (updates.gems !== undefined) setGems(updates.gems); };

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen || isAuctionHouseOpen;
  const isLoading = isLoadingUserData || !assetsLoaded;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

  const value: IGameContext = {
    isLoadingUserData: isLoading, isSyncingData, userName, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, userStats, jackpotPool,
    bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, equippedItems,
    isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen, isAuctionHouseOpen, isAnyOverlayOpen, isGamePaused,
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool, handleStatsUpdate,
    handleShopPurchase, getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, handleSkillScreenClose, updateSkillsState,
    updateEquipmentData, updateUserCurrency,
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge, toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleAuctionHouse, toggleBaseBuilding, setCoins
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): IGameContext => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};
// --- END OF FILE src/GameContext.tsx ---
