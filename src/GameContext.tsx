// --- START OF FILE GameContext.tsx (1).txt ---

// --- START OF FILE src/GameContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase.js';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint, CRAFTING_COST, getRandomRarity, getTotalUpgradeCost, getUpgradeCost, Rarity, getNextRarity } from './skill-data.tsx';
import { OwnedItem, EquippedItems } from './equipment.tsx';
import { calculateTotalStatValue, statConfig, calculateUpgradeCost, getBonusForLevel } from './home/upgrade-stats/upgrade-ui.tsx';

import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes, processMinerChallengeResult, processShopPurchase,
  upgradeUserStats,
  // --- THÊM IMPORT MỚI ---
  updateUserSkills
} from './gameDataService.ts';

// --- Thêm Type/Interface cần thiết từ skill-context ---
interface MergeResult { level: number; refundGold: number; }
export interface MergeGroup { skillId: string; rarity: Rarity; skills: OwnedSkill[]; blueprint: SkillBlueprint; nextRarity: Rarity | null; estimatedResult: MergeResult; }


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
    // --- THÊM STATE TỪ SKILL-CONTEXT ---
    MAX_SKILLS_IN_STORAGE: number;


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

    // States for background processing
    isProcessingSkillAction: boolean;

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

    // --- CÁC HÀM LOGIC TỪ SKILL-CONTEXT ---
    handleEquipSkill: (skillToEquip: OwnedSkill) => Promise<boolean>;
    handleUnequipSkill: (skillToUnequip: OwnedSkill) => Promise<boolean>;
    handleCraftSkill: () => Promise<{ success: boolean; newSkill: OwnedSkill | null; message: string }>;
    handleDisenchantSkill: (skillToDisenchant: OwnedSkill) => Promise<boolean>;
    handleUpgradeSkill: (skillToUpgrade: OwnedSkill) => Promise<{ success: boolean; updatedSkill: OwnedSkill | null }>;
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
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });
  // --- THÊM STATE TỪ SKILL-CONTEXT ---
  const MAX_SKILLS_IN_STORAGE = 50; // Constant, doesn't need state
  const [isProcessingSkillAction, setIsProcessingSkillAction] = useState(false);

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
  
  // States for data syncing and rate limiting UI
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);
  
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
        setOwnedSkills([]); setEquippedSkillIds([null, null, null]); setTotalVocabCollected(0); setEquipmentPieces(0); setOwnedItems([]);
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
  
  const handleBossFloorUpdate = async (newFloor: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error("Cannot update boss floor: User not authenticated."); return; }
    try {
        await updateUserBossFloor(userId, newFloor, bossBattleHighestFloor);
        if (newFloor > bossBattleHighestFloor) { setBossBattleHighestFloor(newFloor); }
    } catch (error) { console.error("Firestore update failed for boss floor via service: ", error); }
  };
  
  const handleMinerChallengeEnd = async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error("Cannot update game data: User not authenticated."); return; }
    if (result.finalPickaxes === pickaxes && result.coinsEarned === 0 && result.highestFloorCompleted <= minerChallengeHighestFloor) { return; }
    setIsSyncingData(true);
    try {
      const { newCoins, newPickaxes, newHighestFloor } = await processMinerChallengeResult(userId, result);
      setCoins(newCoins); setPickaxes(newPickaxes); setMinerChallengeHighestFloor(newHighestFloor);
    } catch (error) { console.error("Service call for Miner Challenge end failed: ", error); } finally { setIsSyncingData(false); }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    setPickaxes(await updateUserPickaxes(userId, pickaxes + amountToAdd));
  };
  
  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
      setJackpotPool(await updateJackpotPool(amount, reset));
  };
  
  const handleShopPurchase = async (item: any, quantity: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { throw new Error("Người dùng chưa được xác thực."); }
    if (!item || typeof item.price !== 'number' || !item.id || typeof quantity !== 'number' || quantity <= 0) { throw new Error("Dữ liệu vật phẩm hoặc số lượng không hợp lệ."); }
    setIsSyncingData(true);
    try {
      const { newCoins, newBooks, newCapacity } = await processShopPurchase(userId, item, quantity);
      setCoins(newCoins);
      if (item.id === 1009) { setAncientBooks(newBooks); } else if (item.id === 2001) { setCardCapacity(newCapacity); }
      alert(`Mua thành công x${quantity} ${item.name}!`);
    } catch (error) {
      console.error("Shop purchase transaction failed:", error);
      alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally { setIsSyncingData(false); }
  };
  
  const handleStatUpgrade = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    // This function is defined outside the main logic block. I'll move it here for consistency, but its logic remains the same.
    const user = auth.currentUser;
    if (isSyncingData || !user) return; // Use a general syncing flag for simplicity
    
    const currentLevel = userStats[statId];
    const upgradeCost = calculateUpgradeCost(currentLevel);
    if (coins < upgradeCost) {
      alert('Không đủ vàng');
      return;
    }
    setIsSyncingData(true);
    const oldCoins = coins;
    const oldStats = { ...userStats };
    setCoins(prev => prev - upgradeCost);
    const newStats = { ...userStats, [statId]: currentLevel + 1 };
    setUserStats(newStats);
    
    try {
      const { newCoins: serverCoins } = await upgradeUserStats(user.uid, upgradeCost, newStats);
      setCoins(serverCoins);
    } catch (error) {
      console.error("Upgrade failed, rolling back UI.", error);
      alert('Nâng cấp thất bại, vui lòng thử lại!');
      setCoins(oldCoins);
      setUserStats(oldStats);
    } finally {
      setIsSyncingData(false);
    }
  }, [isSyncingData, userStats, coins]);


  // --- LOGIC KỸ NĂNG (TỪ SKILL-CONTEXT) ---

  const handleUpdateUserSkillsInternal = useCallback(async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) return false;
      setIsProcessingSkillAction(true);
      try {
          const { newCoins, newBooks } = await updateUserSkills(userId, updates);
          setCoins(newCoins);
          setAncientBooks(newBooks);
          setOwnedSkills(updates.newOwned);
          setEquippedSkillIds(updates.newEquippedIds);
          return true;
      } catch (error: any) {
          alert(`Lỗi: ${error.message || 'Cập nhật kỹ năng thất bại'}`);
          // Rollback could be implemented here if needed
          await refreshUserData(); // Refresh data to ensure consistency after failure
          return false;
      } finally {
          setIsProcessingSkillAction(false);
      }
  }, [refreshUserData]);
  
  const handleEquipSkill = useCallback(async (skillToEquip: OwnedSkill) => {
      if (isProcessingSkillAction) return false;
      const firstEmptySlotIndex = equippedSkillIds.findIndex(slot => slot === null);
      if (firstEmptySlotIndex === -1) {
          return false; // UI should handle message
      }
      const newEquippedIds = [...equippedSkillIds];
      newEquippedIds[firstEmptySlotIndex] = skillToEquip.id;
      return await handleUpdateUserSkillsInternal({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
  }, [isProcessingSkillAction, equippedSkillIds, ownedSkills, handleUpdateUserSkillsInternal]);

  const handleUnequipSkill = useCallback(async (skillToUnequip: OwnedSkill) => {
      if (isProcessingSkillAction) return false;
      const slotIndex = equippedSkillIds.findIndex(id => id === skillToUnequip.id);
      if (slotIndex === -1) return false;

      const newEquippedIds = [...equippedSkillIds];
      newEquippedIds[slotIndex] = null;
      return await handleUpdateUserSkillsInternal({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
  }, [isProcessingSkillAction, equippedSkillIds, ownedSkills, handleUpdateUserSkillsInternal]);

  const handleCraftSkill = useCallback(async (): Promise<{ success: boolean; newSkill: OwnedSkill | null; message: string }> => {
      if (isProcessingSkillAction) return { success: false, newSkill: null, message: 'Processing...' };
      if (ancientBooks < CRAFTING_COST) return { success: false, newSkill: null, message: `Không đủ Sách Cổ. Cần ${CRAFTING_COST}.` };
      if (ownedSkills.length >= MAX_SKILLS_IN_STORAGE) return { success: false, newSkill: null, message: 'Kho kỹ năng đã đầy.' };

      const newSkillBlueprint = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
      const newRarity = getRandomRarity();
      const newOwnedSkill: OwnedSkill = { id: `owned-${Date.now()}-${newSkillBlueprint.id}-${Math.random()}`, skillId: newSkillBlueprint.id, level: 1, rarity: newRarity };
      const newOwnedList = [...ownedSkills, newOwnedSkill];

      const success = await handleUpdateUserSkillsInternal({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: -CRAFTING_COST });
      return { success, newSkill: success ? newOwnedSkill : null, message: success ? 'Success' : 'Failed' };
  }, [isProcessingSkillAction, ancientBooks, ownedSkills, equippedSkillIds, handleUpdateUserSkillsInternal]);

  const handleDisenchantSkill = useCallback(async (skillToDisenchant: OwnedSkill) => {
      if (isProcessingSkillAction || equippedSkillIds.includes(skillToDisenchant.id)) return false;

      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId)!;
      const booksToReturn = Math.floor(CRAFTING_COST / 2);
      const goldToReturn = getTotalUpgradeCost(skillBlueprint, skillToDisenchant.level);
      const newOwnedList = ownedSkills.filter(s => s.id !== skillToDisenchant.id);

      return await handleUpdateUserSkillsInternal({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: goldToReturn, booksChange: booksToReturn });
  }, [isProcessingSkillAction, equippedSkillIds, ownedSkills, handleUpdateUserSkillsInternal]);

  const handleUpgradeSkill = useCallback(async (skillToUpgrade: OwnedSkill): Promise<{ success: boolean; updatedSkill: OwnedSkill | null }> => {
      if (isProcessingSkillAction) return { success: false, updatedSkill: null };
      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
      if (!skillBlueprint || skillBlueprint.upgradeCost === undefined) return { success: false, updatedSkill: null };
      const cost = getUpgradeCost(skillBlueprint.upgradeCost, skillToUpgrade.level);
      if (coins < cost) return { success: false, updatedSkill: null };

      const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
      const newOwnedList = ownedSkills.map(s => s.id === skillToUpgrade.id ? updatedSkill : s);

      const success = await handleUpdateUserSkillsInternal({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: -cost, booksChange: 0 });
      if (success) {
          return { success: true, updatedSkill: updatedSkill };
      }
      return { success: false, updatedSkill: null };
  }, [isProcessingSkillAction, coins, ownedSkills, equippedSkillIds, handleUpdateUserSkillsInternal]);

  const calculateMergeResult = (skillsToMerge: OwnedSkill[], blueprint: SkillBlueprint): MergeResult => {
      if (skillsToMerge.length < 3 || !blueprint.upgradeCost) return { level: 1, refundGold: 0 };
      const totalInvestedGold = skillsToMerge.reduce((total, skill) => total + getTotalUpgradeCost(blueprint, skill.level), 0);
      let finalLevel = 1, remainingGold = totalInvestedGold;
      while (true) {
          const costForNextLevel = getUpgradeCost(blueprint.upgradeCost, finalLevel);
          if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
      }
      return { level: finalLevel, refundGold: remainingGold };
  };

  const handleMergeSkills = useCallback(async (group: MergeGroup) => {
      if (isProcessingSkillAction || group.skills.length < 3 || !group.nextRarity) return false;
      
      const skillsToConsume = group.skills.slice(0, 3);
      const skillIdsToConsume = skillsToConsume.map(s => s.id);
      const { level: finalLevel, refundGold } = calculateMergeResult(skillsToConsume, group.blueprint);
      const newUpgradedSkill: OwnedSkill = { id: `owned-${Date.now()}-${group.skillId}-${Math.random()}`, skillId: group.skillId, level: finalLevel, rarity: group.nextRarity };
      const newOwnedList = ownedSkills.filter(s => !skillIdsToConsume.includes(s.id)).concat(newUpgradedSkill);

      return await handleUpdateUserSkillsInternal({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: refundGold, booksChange: 0 });
  }, [isProcessingSkillAction, ownedSkills, equippedSkillIds, handleUpdateUserSkillsInternal]);
  
  // --- KẾT THÚC LOGIC KỸ NĂNG ---

  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      const isLoading = isLoadingUserData || !assetsLoaded;
      if (isLoading) return;
      if (isSyncingData) { setShowRateLimitToast(true); return; }
      setter(prev => {
          const newState = !prev;
          if (newState) {
              hideNavBar();
              [ setIsRankOpen, setIsPvpArenaOpen, setIsLuckyGameOpen, setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen, setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen ].forEach(s => { if (s !== setter) s(false); });
          } else { showNavBar(); }
          return newState;
      });
  };

  const getPlayerBattleStats = () => {
    const BASE_HP = 0, BASE_ATK = 0, BASE_DEF = 0;
    const bonusHp = calculateTotalStatValue(userStats.hp, statConfig.hp.baseUpgradeBonus);
    const bonusAtk = calculateTotalStatValue(userStats.atk, statConfig.atk.baseUpgradeBonus);
    const bonusDef = calculateTotalStatValue(userStats.def, statConfig.def.baseUpgradeBonus);
    let itemHpBonus = 0, itemAtkBonus = 0, itemDefBonus = 0;
    Object.values(equippedItems).forEach(item => { if (item) { itemHpBonus += item.stats.hp || 0; itemAtkBonus += item.stats.atk || 0; itemDefBonus += item.stats.def || 0; } });
    return { maxHp: BASE_HP + bonusHp + itemHpBonus, hp: BASE_HP + bonusHp + itemHpBonus, atk: BASE_ATK + bonusAtk + itemAtkBonus, def: BASE_DEF + bonusDef + itemDefBonus, maxEnergy: 50, energy: 50 };
  };

  const getEquippedSkillsDetails = () => {
    if (!ownedSkills || !equippedSkillIds) return [];
    return equippedSkillIds.map(equippedId => { if (!equippedId) return null; const owned = ownedSkills.find(s => s.id === equippedId); if (!owned) return null; const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId); if (!blueprint) return null; return { ...owned, ...blueprint }; }).filter((skill): skill is OwnedSkill & SkillBlueprint => skill !== null);
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
    toggleSkillScreen();
    if (dataUpdated) refreshUserData();
  };

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
  const isLoading = isLoadingUserData || !assetsLoaded;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

  const value: IGameContext = {
    isLoadingUserData: isLoading, isSyncingData, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, userStats, jackpotPool,
    bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, equippedItems,
    MAX_SKILLS_IN_STORAGE,
    isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen, isAnyOverlayOpen, isGamePaused,
    isProcessingSkillAction,
    
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool,
    handleShopPurchase, getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, handleSkillScreenClose,
    handleStatUpgrade,
    // --- THÊM HÀM VÀO VALUE CỦA PROVIDER ---
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
// --- END OF FILE src/GameContext.tsx ---
