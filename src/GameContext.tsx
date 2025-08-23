// --- START OF FILE src/GameContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase.js';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './skill-data.tsx';
import { OwnedItem, EquippedItems } from './equipment.tsx';
import { calculateTotalStatValue, statConfig, calculateUpgradeCost, getBonusForLevel } from './home/upgrade-stats/upgrade-ui.tsx';
// --- THÊM IMPORT MỚI TỪ EQUIPMENT VÀ ITEM-DATABASE ---
import { 
  getItemDefinition, 
  itemBlueprints, 
  generateItemDefinition, 
  getRandomRank, 
  getUpgradeCost as getEquipmentUpgradeCost,
  getTotalUpgradeCost,
  calculateForgeResult
} from './inventory/item-database.ts';
import { CRAFTING_COST, DISMANTLE_RETURN_PIECES, MAX_ITEMS_IN_STORAGE } from './inventory/item-database.ts';
import { ItemBlueprint } from './inventory/item-database.ts';


import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes, processMinerChallengeResult, processShopPurchase,
  // --- THÊM IMPORT MỚI ---
  upgradeUserStats,
  // --- THÊM IMPORT MỚI TỪ GAMEDATASERVICE ---
  updateUserInventory
} from './gameDataService.ts';

// Định nghĩa lại ForgeGroup ở đây để tránh circular dependency
export interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: string; 
    items: OwnedItem[]; 
    nextRank: string | null; 
    estimatedResult: { level: number; refundGold: number; }; 
}

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

    // --- THÊM STATE DÀNH RIÊNG CHO MÀN HÌNH UPGRADE ---
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
    // --- THÊM HÀM MỚI CHO LOGIC UPGRADE ---
    handleStatUpgrade: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
    // --- THÊM CÁC HÀM XỬ LÝ LOGIC TRANG BỊ ---
    handleEquipItem: (itemToEquip: OwnedItem) => Promise<void>;
    handleUnequipItem: (itemToUnequip: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<OwnedItem | null>;
    handleDismantleItem: (itemToDismantle: OwnedItem) => Promise<void>;
    handleUpgradeItem: (itemToUpgrade: OwnedItem, statKey: string, increase: number) => Promise<OwnedItem | null>;
    handleForgeItems: (group: ForgeGroup) => Promise<OwnedItem | null>;


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

  // --- THÊM STATE TỪ UPGRADE-CONTEXT VÀO ĐÂY ---
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

  // --- THÊM HÀM LOGIC NÂNG CẤP MỚI ---
  const handleStatUpgrade = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    const user = auth.currentUser;
    if (isUpgradingStats || !user) return;

    const currentLevel = userStats[statId];
    const upgradeCost = calculateUpgradeCost(currentLevel);

    if (coins < upgradeCost) {
      setUpgradeMessage('ko đủ vàng');
      setTimeout(() => setUpgradeMessage(''), 2000);
      return;
    }

    setIsUpgradingStats(true);
    setUpgradeMessage('');

    // Logic Toast
    const statDetails = statConfig[statId];
    const bonusGained = getBonusForLevel(currentLevel + 1, statDetails.baseUpgradeBonus);
    setUpgradeToastData({
      isVisible: true,
      icon: statDetails.icon,
      bonus: bonusGained,
      colorClasses: statDetails.toastColors,
    });
    setTimeout(() => setUpgradeToastData(null), 1500);

    // Cập nhật UI lạc quan (Optimistic Update)
    const oldCoins = coins;
    const oldStats = { ...userStats };
    setCoins(prev => prev - upgradeCost);
    const newStats = { ...userStats, [statId]: currentLevel + 1 };
    setUserStats(newStats);

    // Gọi API
    try {
      const { newCoins: serverCoins } = await upgradeUserStats(user.uid, upgradeCost, newStats);
      setCoins(serverCoins); // Đồng bộ lại với server
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setUpgradeMessage('Nâng cấp thất bại, vui lòng thử lại!');
      setCoins(oldCoins); // Rollback
      setUserStats(oldStats);
      setTimeout(() => setUpgradeMessage(''), 3000);
    } finally {
      setTimeout(() => setIsUpgradingStats(false), 300);
    }
  }, [isUpgradingStats, userStats, coins]);

  // --- TOÀN BỘ LOGIC CỦA EQUIPMENT SCREEN ĐƯỢC CHUYỂN VÀO ĐÂY ---

  const handleEquipItem = useCallback(async (itemToEquip: OwnedItem) => {
    const user = auth.currentUser;
    if (!user || isSyncingData) return;
    
    const itemDef = getItemDefinition(itemToEquip.itemId);
    if (!itemDef || !['weapon', 'armor', 'Helmet'].includes(itemDef.type)) throw new Error("Vật phẩm không hợp lệ.");
    const slotType = itemDef.type as 'weapon' | 'armor' | 'Helmet';

    setIsSyncingData(true);
    const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
    try {
      await updateUserInventory(user.uid, { newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
      setEquippedItems(newEquipped);
    } catch (error) {
      console.error("Lỗi khi trang bị vật phẩm:", error);
      throw error;
    } finally {
      setIsSyncingData(false);
    }
  }, [isSyncingData, equippedItems, ownedItems]);

  const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
    const user = auth.currentUser;
    if (!user || isSyncingData) return;

    const itemDef = getItemDefinition(itemToUnequip.itemId);
    if (!itemDef) throw new Error("Vật phẩm không tồn tại.");
    const slotType = itemDef.type as 'weapon' | 'armor' | 'Helmet';

    setIsSyncingData(true);
    const newEquipped = { ...equippedItems, [slotType]: null };
    try {
      await updateUserInventory(user.uid, { newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
      setEquippedItems(newEquipped);
    } catch (error) {
      console.error("Lỗi khi gỡ trang bị:", error);
      throw error;
    } finally {
      setIsSyncingData(false);
    }
  }, [isSyncingData, equippedItems, ownedItems]);

  const handleCraftItem = useCallback(async (): Promise<OwnedItem | null> => {
    const user = auth.currentUser;
    if (!user || isSyncingData) return null;
    if (equipmentPieces < CRAFTING_COST) throw new Error(`Không đủ Mảnh. Cần ${CRAFTING_COST}.`);
    const equippedIds = Object.values(equippedItems).filter(id => id !== null);
    const unequippedCount = ownedItems.filter(item => !equippedIds.includes(item.id)).length;
    if (unequippedCount >= MAX_ITEMS_IN_STORAGE) throw new Error("Kho chứa đã đầy.");

    setIsSyncingData(true);
    try {
        const randomBlueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
        const targetRank = getRandomRank();
        const finalItemDef = generateItemDefinition(randomBlueprint, targetRank, true);
        const newOwnedItem: OwnedItem = { id: `owned-${Date.now()}-${finalItemDef.id}`, itemId: finalItemDef.id, level: 1, stats: finalItemDef.stats || {} };
        
        const newOwnedList = [...ownedItems, newOwnedItem];
        await updateUserInventory(user.uid, { newOwned: newOwnedList, newEquipped: equippedItems, goldChange: 0, piecesChange: -CRAFTING_COST });

        setOwnedItems(newOwnedList);
        setEquipmentPieces(prev => prev - CRAFTING_COST);
        return newOwnedItem;
    } catch (error) {
      console.error("Lỗi khi chế tạo:", error);
      throw error;
    } finally {
      setIsSyncingData(false);
    }
  }, [isSyncingData, equipmentPieces, ownedItems, equippedItems]);

  const handleDismantleItem = useCallback(async (itemToDismantle: OwnedItem) => {
      const user = auth.currentUser;
      if (!user || isSyncingData) return;
      
      setIsSyncingData(true);
      try {
        const itemDef = getItemDefinition(itemToDismantle.itemId)!;
        const goldToReturn = getTotalUpgradeCost(itemDef, itemToDismantle.level);
        const newOwnedList = ownedItems.filter(s => s.id !== itemToDismantle.id);
        
        await updateUserInventory(user.uid, { newOwned: newOwnedList, newEquipped: equippedItems, goldChange: goldToReturn, piecesChange: DISMANTLE_RETURN_PIECES });
        
        setOwnedItems(newOwnedList);
        setEquipmentPieces(prev => prev + DISMANTLE_RETURN_PIECES);
        setCoins(prev => prev + goldToReturn);
      } catch (error) {
        console.error("Lỗi khi tái chế:", error);
        throw error;
      } finally {
        setIsSyncingData(false);
      }
  }, [isSyncingData, ownedItems, equippedItems]);

  const handleUpgradeItem = useCallback(async (itemToUpgrade: OwnedItem, statKey: string, increase: number): Promise<OwnedItem | null> => {
      const user = auth.currentUser;
      if (!user || isSyncingData) return null;
      const itemDef = getItemDefinition(itemToUpgrade.itemId)!;
      const cost = getEquipmentUpgradeCost(itemDef, itemToUpgrade.level);
      if (coins < cost) throw new Error(`Không đủ vàng. Cần ${cost.toLocaleString()}.`);
      
      setIsSyncingData(true);
      try {
        const newStats = { ...itemToUpgrade.stats, [statKey]: (itemToUpgrade.stats[statKey] || 0) + increase };
        const updatedItem = { ...itemToUpgrade, level: itemToUpgrade.level + 1, stats: newStats };
        const newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
        
        await updateUserInventory(user.uid, { newOwned: newOwnedList, newEquipped: equippedItems, goldChange: -cost, piecesChange: 0 });

        setOwnedItems(newOwnedList);
        setCoins(prev => prev - cost);
        return updatedItem;
      } catch (error) {
        console.error("Lỗi khi nâng cấp:", error);
        throw error;
      } finally {
        setIsSyncingData(false);
      }
  }, [isSyncingData, coins, ownedItems, equippedItems]);
  
  const handleForgeItems = useCallback(async (group: ForgeGroup): Promise<OwnedItem | null> => {
    const user = auth.currentUser;
    if (!user || isSyncingData) return null;
    if (group.items.length < 3 || !group.nextRank) throw new Error("Không đủ điều kiện hợp nhất.");
    
    setIsSyncingData(true);
    try {
        const itemsToConsume = group.items.slice(0, 3);
        const itemIdsToConsume = itemsToConsume.map(s => s.id);

        const baseItemDef = getItemDefinition(itemsToConsume[0].itemId)!;
        const { level: finalLevel, refundGold } = calculateForgeResult(itemsToConsume, baseItemDef);
        const upgradedItemDef = generateItemDefinition(group.blueprint, group.nextRank as any, true);

        const newForgedItem: OwnedItem = { 
            id: `owned-${Date.now()}-${upgradedItemDef.id}`, 
            itemId: upgradedItemDef.id, 
            level: finalLevel,
            stats: upgradedItemDef.stats || {}
        };
        const newOwnedList = ownedItems.filter(s => !itemIdsToConsume.includes(s.id)).concat(newForgedItem);
        
        await updateUserInventory(user.uid, { newOwned: newOwnedList, newEquipped: equippedItems, goldChange: refundGold, piecesChange: 0 });

        setOwnedItems(newOwnedList);
        setCoins(prev => prev + refundGold);
        return newForgedItem;
    } catch (error) {
        console.error("Lỗi khi hợp nhất:", error);
        throw error;
    } finally {
        setIsSyncingData(false);
    }
  }, [isSyncingData, ownedItems, equippedItems, coins]);

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
    isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen, isAnyOverlayOpen, isGamePaused,
    
    // --- THÊM STATE VÀO VALUE CỦA PROVIDER ---
    isUpgradingStats, upgradeMessage, upgradeToastData,

    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool,
    handleShopPurchase, getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, handleSkillScreenClose,
    
    // --- THÊM HÀM VÀO VALUE CỦA PROVIDER ---
    handleStatUpgrade,
    // --- THÊM CÁC HÀM XỬ LÝ TRANG BỊ VÀO VALUE ---
    handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem,
    handleUpgradeItem, handleForgeItems,

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
