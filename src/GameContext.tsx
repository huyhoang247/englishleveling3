import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { auth, db } from './firebase.js'; 
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore'; 
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './home/skill-game/skill-data.tsx';
import { OwnedItem, EquippedItems } from './home/equipment/equipment-ui.tsx';
import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes
} from './gameDataService.ts';
import { SkillScreenExitData } from './home/skill-game/skill-context.tsx';

// --- Types cho Thương Hội ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number;
}

export interface TradeOption {
    id: string;
    title: string;
    ingredients: TradeIngredient[];
    receiveType: 'equipmentPiece';
    receiveAmount: number;
    description?: string;
}

// --- Interface chính của GameContext ---
interface IGameContext {
    // Trạng thái dữ liệu người dùng
    isLoadingUserData: boolean;
    isSyncingData: boolean;
    coins: number;
    displayedCoins: number;
    gems: number;
    masteryCards: number;
    pickaxes: number;
    minerChallengeHighestFloor: number;
    userStatsLevel: { hp: number; atk: number; def: number; };
    userStatsValue: { hp: number; atk: number; def: number; };
    jackpotPool: number;
    bossBattleHighestFloor: number;
    ancientBooks: number;
    ownedSkills: OwnedSkill[];
    equippedSkillIds: (string | null)[];
    totalVocabCollected: number;
    cardCapacity: number;
    
    // Tài nguyên (Thương Hội)
    wood: number;
    leather: number;
    ore: number;
    cloth: number;

    // Dữ liệu Trang bị
    equipmentPieces: number;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    stones: { low: number; medium: number; high: number };

    totalEquipmentStats: { hp: number; atk: number; def: number; };
    totalPlayerStats: { hp: number; atk: number; def: number; };
    loginStreak: number;
    lastCheckIn: Date | null;
    
    // Trạng thái VIP
    accountType: string;
    vipExpiresAt: Date | null;
    vipLuckySpinClaims: number;

    // Trạng thái UI (Modals)
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
    isCheckInOpen: boolean;
    isMailboxOpen: boolean;
    is777GameOpen: boolean; // Có thể giữ lại hoặc xoá tuỳ ý, ở đây tôi giữ biến nhưng sẽ dùng toggle mới
    isTradeModalOpen: boolean;
    isAnyOverlayOpen: boolean;
    isGamePaused: boolean;

    // Các hàm xử lý
    refreshUserData: () => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => void;
    handleUpdatePickaxes: (amountToAdd: number) => Promise<void>;
    handleUpdateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
    handleVipLuckySpinClaim: () => Promise<boolean>;
    getPlayerBattleStats: () => { maxHp: number; hp: number; atk: number; def: number; maxEnergy: number; energy: number; };
    getEquippedSkillsDetails: () => (OwnedSkill & SkillBlueprint)[];
    handleStateUpdateFromChest: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
    handleAchievementsDataUpdate: (updates: { coins?: number; masteryCards?: number }) => void;
    handleSkillScreenClose: (dataUpdated: boolean) => void;
    updateSkillsState: (data: SkillScreenExitData) => void;
    updateUserCurrency: (updates: { coins?: number; gems?: number; equipmentPieces?: number; ancientBooks?: number; cardCapacity?: number; }) => void;
    updateCoins: (amount: number) => Promise<void>;
    
    // Hàm xử lý Thương Hội
    handleExchangeResources: (option: TradeOption) => Promise<void>;

    // Các hàm đóng mở Modal
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
    toggleCheckIn: () => void;
    toggleMailbox: () => void;
    toggleBaseBuilding: () => void;
    toggle777Game: () => void;
    toggleTradeModal: () => void;

    setCoins: React.Dispatch<React.SetStateAction<number>>;
    setIsSyncingData: React.Dispatch<React.SetStateAction<boolean>>;
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

  // States dữ liệu người dùng
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [pickaxes, setPickaxes] = useState(0);
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  const [userStatsLevel, setUserStatsLevel] = useState({ hp: 0, atk: 0, def: 0 });
  const [userStatsValue, setUserStatsValue] = useState({ hp: 0, atk: 0, def: 0 });
  const [jackpotPool, setJackpotPool] = useState(0);
  const [bossBattleHighestFloor, setBossBattleHighestFloor] = useState(0);
  const [ancientBooks, setAncientBooks] = useState(0);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  
  // States Tài nguyên Thương Hội
  const [wood, setWood] = useState(0);
  const [leather, setLeather] = useState(0);
  const [ore, setOre] = useState(0);
  const [cloth, setCloth] = useState(0);

  // States Trang bị
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, Helmet: null });
  const [stones, setStones] = useState({ low: 0, medium: 0, high: 0 });

  const [loginStreak, setLoginStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

  // States VIP
  const [accountType, setAccountType] = useState<string>('Normal');
  const [vipExpiresAt, setVipExpiresAt] = useState<Date | null>(null);
  const [vipLuckySpinClaims, setVipLuckySpinClaims] = useState(0);

  // States Modals UI
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
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [is777GameOpen, setIs777GameOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);

  // Hàm tải lại toàn bộ dữ liệu (Refresh)
  const refreshUserData = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setIsLoadingUserData(true);
    try {
      const gameData = await fetchOrCreateUserGameData(userId);
      setCoins(gameData.coins);
      setDisplayedCoins(gameData.coins);
      setGems(gameData.gems);
      setMasteryCards(gameData.masteryCards);
      setPickaxes(gameData.pickaxes);
      setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor);
      setUserStatsLevel(gameData.stats_level || gameData.stats || { hp: 0, atk: 0, def: 0 });
      setUserStatsValue(gameData.stats_value || { hp: 0, atk: 0, def: 0 });
      setBossBattleHighestFloor(gameData.bossBattleHighestFloor);
      setAncientBooks(gameData.ancientBooks);
      setOwnedSkills(gameData.skills?.owned || []);
      setEquippedSkillIds(gameData.skills?.equipped || [null, null, null]);
      setTotalVocabCollected(gameData.totalVocabCollected || 0);
      setCardCapacity(gameData.cardCapacity || 100);
      
      // Load Tài nguyên
      setWood(gameData.wood || 0);
      setLeather(gameData.leather || 0);
      setOre(gameData.ore || 0);
      setCloth(gameData.cloth || 0);

      // Load Trang bị
      setEquipmentPieces(gameData.equipment?.pieces || 0);
      setOwnedItems(gameData.equipment?.owned || []);
      setEquippedItems(gameData.equipment?.equipped || { weapon: null, armor: null, Helmet: null });
      setStones(gameData.equipment?.stones || { low: 0, medium: 0, high: 0 });

      setLoginStreak(gameData.loginStreak || 0);
      setLastCheckIn(gameData.lastCheckIn ? gameData.lastCheckIn.toDate() : null);
      
      setAccountType(gameData.accountType || 'Normal');
      setVipExpiresAt(gameData.vipExpiresAt ? gameData.vipExpiresAt.toDate() : null);
      setVipLuckySpinClaims(gameData.vipLuckySpinClaims || 0);

    } catch (error) { 
        console.error("Error refreshing user data:", error);
    } finally { 
        setIsLoadingUserData(false); 
    }
  }, []);

  // Lắng nghe dữ liệu thời gian thực từ Firestore
  useEffect(() => {
    let unsubscribeFromUserDoc = () => {};

    const unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
      unsubscribeFromUserDoc(); 

      if (user) {
        setIsLoadingUserData(true);
        const userDocRef = doc(db, 'users', user.uid);
        
        unsubscribeFromUserDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const gameData = docSnap.data();
                setCoins(gameData.coins ?? 0);
                setGems(gameData.gems ?? 0);
                setMasteryCards(gameData.masteryCards ?? 0);
                setPickaxes(gameData.pickaxes ?? 50);
                setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor ?? 0);
                setUserStatsLevel(gameData.stats_level ?? gameData.stats ?? { hp: 0, atk: 0, def: 0 });
                setUserStatsValue(gameData.stats_value ?? { hp: 0, atk: 0, def: 0 });
                setBossBattleHighestFloor(gameData.bossBattleHighestFloor ?? 0);
                setAncientBooks(gameData.ancientBooks ?? 0);
                setOwnedSkills(gameData.skills?.owned ?? []);
                setEquippedSkillIds(gameData.skills?.equipped ?? [null, null, null]);
                setTotalVocabCollected(gameData.totalVocabCollected ?? 0);
                setCardCapacity(gameData.cardCapacity ?? 100);
                
                // Real-time Resources
                setWood(gameData.wood ?? 0);
                setLeather(gameData.leather ?? 0);
                setOre(gameData.ore ?? 0);
                setCloth(gameData.cloth ?? 0);

                // Real-time Equipment
                setEquipmentPieces(gameData.equipment?.pieces ?? 0);
                setOwnedItems(gameData.equipment?.owned ?? []);
                setEquippedItems(gameData.equipment?.equipped ?? { weapon: null, armor: null, Helmet: null });
                setStones(gameData.equipment?.stones || { low: 0, medium: 0, high: 0 });

                setLoginStreak(gameData.loginStreak ?? 0);
                setLastCheckIn(gameData.lastCheckIn ? gameData.lastCheckIn.toDate() : null);
                setAccountType(gameData.accountType ?? 'Normal');
                setVipExpiresAt(gameData.vipExpiresAt ? gameData.vipExpiresAt.toDate() : null);
                setVipLuckySpinClaims(gameData.vipLuckySpinClaims ?? 0);
            }
            setIsLoadingUserData(false);
        });
        
        const jackpotData = await fetchJackpotPool();
        setJackpotPool(jackpotData);

      } else {
        // Reset khi Logout
        setCoins(0); setGems(0); setWood(0); setLeather(0); setOre(0); setCloth(0);
        setEquipmentPieces(0); setOwnedItems([]);
        setIsLoadingUserData(false);
      }
    });

    return () => {
      unsubscribeFromAuth();
      unsubscribeFromUserDoc();
    };
  }, []);

  // --- LOGIC XỬ LÝ THƯƠNG HỘI ---
  const handleExchangeResources = useCallback(async (option: TradeOption) => {
    const userId = auth.currentUser?.uid;
    if (!userId || isSyncingData) return;

    // 1. Kiểm tra tài nguyên nội bộ trước
    const currentResources = { wood, leather, ore, cloth };
    for (const ing of option.ingredients) {
        if ((currentResources as any)[ing.type] < ing.amount) {
            console.error("Không đủ tài nguyên!");
            return;
        }
    }

    setIsSyncingData(true);
    try {
        const userDocRef = doc(db, 'users', userId);
        
        // 2. Tạo object update cho Firestore
        const updates: any = {};
        option.ingredients.forEach(ing => {
            updates[ing.type] = increment(-ing.amount);
        });
        updates["equipment.pieces"] = increment(option.receiveAmount);

        await updateDoc(userDocRef, updates);
        // onSnapshot sẽ tự cập nhật lại UI
    } catch (error) {
        console.error("Lỗi khi trao đổi tài nguyên:", error);
    } finally {
        setIsSyncingData(false);
    }
  }, [isSyncingData, wood, leather, ore, cloth]);

  // --- CÁC HÀM CẬP NHẬT KHÁC ---
  const updateCoins = async (amount: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId || amount === 0) return;
    const previousCoins = coins;
    setCoins(prev => prev + amount);
    setDisplayedCoins(prev => prev + amount); 
    setIsSyncingData(true);
    try {
      const serverConfirmedCoins = await updateUserCoins(userId, amount);
      setCoins(serverConfirmedCoins);
    } catch (error) {
      setCoins(previousCoins);
      setDisplayedCoins(previousCoins);
    } finally {
      setIsSyncingData(false);
    }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    const nextVal = pickaxes + amountToAdd;
    setPickaxes(nextVal);
    try { await updateUserPickaxes(userId, nextVal); } catch(error) { setPickaxes(pickaxes); }
  };

  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
      setJackpotPool(await updateJackpotPool(amount, reset));
  };

  const handleVipLuckySpinClaim = async (): Promise<boolean> => {
      const userId = auth.currentUser?.uid;
      if (!userId || accountType !== 'VIP' || vipLuckySpinClaims >= 5) return false;
      const oldVal = vipLuckySpinClaims;
      setVipLuckySpinClaims(oldVal + 1);
      try {
          await updateDoc(doc(db, 'users', userId), { vipLuckySpinClaims: oldVal + 1 });
          return true;
      } catch (error) {
          setVipLuckySpinClaims(oldVal);
          return false;
      }
  };

  const handleBossFloorUpdate = async (newFloor: number) => {
    const userId = auth.currentUser?.uid;
    if (userId) await updateUserBossFloor(userId, newFloor, bossBattleHighestFloor);
  };

  const handleMinerChallengeEnd = (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    setCoins(prev => prev + result.coinsEarned);
    setPickaxes(result.finalPickaxes);
    setMinerChallengeHighestFloor(prev => Math.max(prev, result.highestFloorCompleted));
  };

  const getPlayerBattleStats = () => ({ 
    maxHp: userStatsValue.hp + totalEquipmentStats.hp, 
    hp: userStatsValue.hp + totalEquipmentStats.hp, 
    atk: userStatsValue.atk + totalEquipmentStats.atk, 
    def: userStatsValue.def + totalEquipmentStats.def, 
    maxEnergy: 50, energy: 50 
  });

  const getEquippedSkillsDetails = () => {
    return equippedSkillIds.map(id => {
        if (!id) return null;
        const owned = ownedSkills.find(s => s.id === id);
        if (!owned) return null;
        const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId);
        if (!blueprint) return null;
        return { ...owned, ...blueprint };
    }).filter((s): s is OwnedSkill & SkillBlueprint => s !== null);
  };

  const handleStateUpdateFromChest = (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => {
      setCoins(updates.newCoins); setGems(updates.newGems); setTotalVocabCollected(updates.newTotalVocab);
  };

  const handleAchievementsDataUpdate = (updates: { coins?: number; masteryCards?: number }) => {
      if (updates.coins !== undefined) setCoins(updates.coins);
      if (updates.masteryCards !== undefined) setMasteryCards(updates.masteryCards);
  };

  const updateSkillsState = (data: SkillScreenExitData) => {
    setCoins(data.gold); setDisplayedCoins(data.gold); setAncientBooks(data.ancientBooks);
    setOwnedSkills(data.ownedSkills); setEquippedSkillIds(data.equippedSkillIds);
  };

  const updateUserCurrency = (updates: { coins?: number; gems?: number; equipmentPieces?: number; ancientBooks?: number; cardCapacity?: number; }) => {
    if (updates.coins !== undefined) { setCoins(updates.coins); setDisplayedCoins(updates.coins); }
    if (updates.gems !== undefined) setGems(updates.gems);
    if (updates.equipmentPieces !== undefined) setEquipmentPieces(updates.equipmentPieces);
    if (updates.ancientBooks !== undefined) setAncientBooks(updates.ancientBooks);
    if (updates.cardCapacity !== undefined) setCardCapacity(updates.cardCapacity);
  };

  // Logic hỗ trợ hiển thị giá vàng chạy số
  useEffect(() => {
    if (displayedCoins === coins) return;
    const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100);
    return () => clearTimeout(timeoutId);
  }, [coins, displayedCoins]);

  // Tính toán chỉ số từ trang bị
  const totalEquipmentStats = useMemo(() => {
    const totals = { hp: 0, atk: 0, def: 0 };
    Object.values(equippedItems).forEach(itemId => { 
        if(itemId){
            const item = ownedItems.find(i => i.id === itemId);
            if (item && item.stats) { 
                totals.hp += item.stats.hp || 0; 
                totals.atk += item.stats.atk || 0; 
                totals.def += item.stats.def || 0; 
            }
        }
    });
    return totals;
  }, [ownedItems, equippedItems]);

  const totalPlayerStats = useMemo(() => ({
      hp: userStatsValue.hp + totalEquipmentStats.hp,
      atk: userStatsValue.atk + totalEquipmentStats.atk,
      def: userStatsValue.def + totalEquipmentStats.def,
  }), [userStatsValue, totalEquipmentStats]);

  // Helper tạo hàm Toggle Modals
  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      if (isLoadingUserData || !assetsLoaded) return;
      if (isSyncingData) { setShowRateLimitToast(true); return; }
      setter(prev => {
          const newState = !prev;
          if (newState) {
              hideNavBar();
              // Đóng tất cả các modal khác
              [ setIsRankOpen, setIsPvpArenaOpen, setIsLuckyGameOpen, setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen, setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen, setIsAuctionHouseOpen, setIsCheckInOpen, setIsMailboxOpen, setIs777GameOpen, setIsTradeModalOpen ].forEach(s => { if (s !== setter) s(false); });
          } else { 
              showNavBar(); 
          }
          return newState;
      });
  };

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
  const toggleCheckIn = createToggleFunction(setIsCheckInOpen);
  const toggleMailbox = createToggleFunction(setIsMailboxOpen);
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  const toggle777Game = createToggleFunction(setIs777GameOpen);
  const toggleTradeModal = createToggleFunction(setIsTradeModalOpen);

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen || isAuctionHouseOpen || isCheckInOpen || isMailboxOpen || is777GameOpen || isTradeModalOpen;
  const isGamePaused = isAnyOverlayOpen || isLoadingUserData || !assetsLoaded || isBackgroundPaused;

  const value: IGameContext = {
    isLoadingUserData: isLoadingUserData || !assetsLoaded, isSyncingData, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, 
    userStatsLevel, userStatsValue, jackpotPool, bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, 
    wood, leather, ore, cloth,
    equipmentPieces, ownedItems, equippedItems, stones,
    totalEquipmentStats, totalPlayerStats, loginStreak, lastCheckIn, 
    accountType, vipExpiresAt, vipLuckySpinClaims,
    isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    isAuctionHouseOpen, isCheckInOpen, isMailboxOpen, is777GameOpen, isTradeModalOpen, isAnyOverlayOpen, isGamePaused,
    
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool, 
    handleVipLuckySpinClaim, getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, 
    handleSkillScreenClose: toggleSkillScreen, updateSkillsState, updateUserCurrency, updateCoins, handleExchangeResources,

    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge, toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleAuctionHouse, toggleCheckIn, toggleMailbox,
    toggleBaseBuilding, toggle777Game, toggleTradeModal,
    setCoins, setIsSyncingData
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): IGameContext => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};
