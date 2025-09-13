// --- START OF FILE GameContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
// <<< THAY ĐỔI: Import onSnapshot, doc, và db để lắng nghe thời gian thực
import { auth, db } from './firebase.js'; 
import { doc, onSnapshot } from 'firebase/firestore';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './home/skill-game/skill-data.tsx';
import { OwnedItem, EquippedItems, EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';

import { 
  fetchOrCreateUserGameData, updateUserCoins, updateUserGems, fetchJackpotPool, updateJackpotPool,
  updateUserBossFloor, updateUserPickaxes
} from './gameDataService.ts';
import { SkillScreenExitData } from './home/skill-game/skill-context.tsx';

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
    // SỬA ĐỔI: Tách stats thành level và value để tối ưu
    userStatsLevel: { hp: number; atk: number; def: number; }; // Dành riêng cho màn hình nâng cấp
    userStatsValue: { hp: number; atk: number; def: number; }; // Dữ liệu global cho toàn bộ game
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
    loginStreak: number;
    lastCheckIn: Date | null;

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
    isCheckInOpen: boolean;
    isMailboxOpen: boolean;
    isAnyOverlayOpen: boolean;
    isGamePaused: boolean;

    // Functions
    refreshUserData: () => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => void;
    handleUpdatePickaxes: (amountToAdd: number) => Promise<void>;
    handleUpdateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
    // SỬA ĐỔI: Xóa handleStatsUpdate vì onSnapshot sẽ tự động cập nhật state
    getPlayerBattleStats: () => { maxHp: number; hp: number; atk: number; def: number; maxEnergy: number; energy: number; };
    getEquippedSkillsDetails: () => (OwnedSkill & SkillBlueprint)[];
    handleStateUpdateFromChest: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
    handleAchievementsDataUpdate: (updates: { coins?: number; masteryCards?: number }) => void;
    handleSkillScreenClose: (dataUpdated: boolean) => void;
    updateSkillsState: (data: SkillScreenExitData) => void;
    updateEquipmentData: (data: EquipmentScreenExitData) => void;
    updateUserCurrency: (updates: { coins?: number; gems?: number; equipmentPieces?: number; ancientBooks?: number; cardCapacity?: number; }) => void;


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
    toggleCheckIn: () => void;
    toggleMailbox: () => void;
    toggleBaseBuilding: () => void;
    setCoins: React.Dispatch<React.SetStateAction<number>>; // For direct updates from components
    setIsSyncingData: React.Dispatch<React.SetStateAction<boolean>>;
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
  // SỬA ĐỔI: Tách state của stats
  const [userStatsLevel, setUserStatsLevel] = useState({ hp: 0, atk: 0, def: 0 });
  const [userStatsValue, setUserStatsValue] = useState({ hp: 0, atk: 0, def: 0 });
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
  const [loginStreak, setLoginStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

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
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  
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
      // SỬA ĐỔI: Cập nhật hàm refreshUserData để đọc cấu trúc mới (dù ít dùng hơn)
      setUserStatsLevel(gameData.stats_level || { hp: 0, atk: 0, def: 0 });
      setUserStatsValue(gameData.stats_value || { hp: 0, atk: 0, def: 0 });
      setBossBattleHighestFloor(gameData.bossBattleHighestFloor);
      setAncientBooks(gameData.ancientBooks);
      setOwnedSkills(gameData.skills.owned);
      setEquippedSkillIds(gameData.skills.equipped);
      setTotalVocabCollected(gameData.totalVocabCollected);
      setCardCapacity(gameData.cardCapacity);
      setEquipmentPieces(gameData.equipment.pieces);
      setOwnedItems(gameData.equipment.owned);
      setEquippedItems(gameData.equipment.equipped);
      setLoginStreak(gameData.loginStreak || 0);
      setLastCheckIn(gameData.lastCheckIn ? gameData.lastCheckIn.toDate() : null);
    } catch (error) { console.error("Error refreshing user data:", error);
    } finally { setIsLoadingUserData(false); }
  }, []);

  // <<< THAY ĐỔI LỚN: Sử dụng onSnapshot để lắng nghe dữ liệu người dùng theo thời gian thực
  useEffect(() => {
    let unsubscribeFromUserDoc = () => {}; // Hàm để hủy đăng ký listener khi không cần nữa

    const unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
      // Luôn hủy listener cũ trước khi tạo listener mới để tránh memory leak
      unsubscribeFromUserDoc(); 

      if (user) {
        setIsLoadingUserData(true);
        const userDocRef = doc(db, 'users', user.uid);
        
        // Bắt đầu lắng nghe thay đổi trên document của user
        unsubscribeFromUserDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const gameData = docSnap.data();
                console.log("Real-time data received from Firestore, updating context state.");

                // Cập nhật tất cả state mỗi khi có thay đổi từ Firestore
                setCoins(gameData.coins ?? 0);
                setGems(gameData.gems ?? 0);
                setMasteryCards(gameData.masteryCards ?? 0);
                setPickaxes(gameData.pickaxes ?? 50);
                setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor ?? 0);

                // --- ĐÂY LÀ THAY ĐỔI QUAN TRỌNG NHẤT ---
                // Lấy level của stats, dùng cho màn hình nâng cấp
                setUserStatsLevel(gameData.stats_level ?? { hp: 0, atk: 0, def: 0 });
                // Lấy giá trị cuối cùng của stats, dùng cho toàn bộ game
                setUserStatsValue(gameData.stats_value ?? { hp: 0, atk: 0, def: 0 });
                // --- KẾT THÚC THAY ĐỔI QUAN TRỌNG ---
                
                setBossBattleHighestFloor(gameData.bossBattleHighestFloor ?? 0);
                setAncientBooks(gameData.ancientBooks ?? 0);
                setOwnedSkills(gameData.skills?.owned ?? []);
                setEquippedSkillIds(gameData.skills?.equipped ?? [null, null, null]);
                setTotalVocabCollected(gameData.totalVocabCollected ?? 0);
                setCardCapacity(gameData.cardCapacity ?? 100);
                setEquipmentPieces(gameData.equipment?.pieces ?? 0);
                setOwnedItems(gameData.equipment?.owned ?? []);
                setEquippedItems(gameData.equipment?.equipped ?? { weapon: null, armor: null, Helmet: null });
                setLoginStreak(gameData.loginStreak ?? 0);
                setLastCheckIn(gameData.lastCheckIn ? gameData.lastCheckIn.toDate() : null);
            } else {
                // Nếu user đã đăng nhập nhưng document chưa có, tiến hành tạo mới.
                console.warn("User document not found, attempting to create one.");
                fetchOrCreateUserGameData(user.uid);
            }
            setIsLoadingUserData(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            setIsLoadingUserData(false);
        });
        
        // Vẫn fetch jackpot pool một lần vì nó là dữ liệu chung
        try {
            const jackpotData = await fetchJackpotPool();
            setJackpotPool(jackpotData);
        } catch(error) {
             console.error("Error fetching initial jackpot data:", error);
        }

      } else {
        // User đăng xuất, reset tất cả state về giá trị ban đầu
        setIsRankOpen(false); setIsPvpArenaOpen(false); setIsLuckyGameOpen(false); setIsBossBattleOpen(false); setIsShopOpen(false); setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false); setIsAdminPanelOpen(false); setIsUpgradeScreenOpen(false); setIsBackgroundPaused(false); setCoins(0); setDisplayedCoins(0); setGems(0); setMasteryCards(0);
        setPickaxes(0); setMinerChallengeHighestFloor(0); 
        // SỬA ĐỔI: Reset cả hai state stats
        setUserStatsLevel({ hp: 0, atk: 0, def: 0 }); 
        setUserStatsValue({ hp: 0, atk: 0, def: 0 });
        setBossBattleHighestFloor(0); setAncientBooks(0);
        setOwnedSkills([]); setEquippedSkillIds([null, null, null]); setTotalVocabCollected(0); setEquipmentPieces(0); setOwnedItems([]); setLoginStreak(0); setLastCheckIn(null);
        setEquippedItems({ weapon: null, armor: null, Helmet: null }); setCardCapacity(100); setJackpotPool(0); setIsLoadingUserData(true);
        setIsMailboxOpen(false);
      }
    });

    // Hàm dọn dẹp (cleanup function) sẽ được gọi khi GameProvider unmount
    return () => {
      unsubscribeFromAuth();
      unsubscribeFromUserDoc();
    };
  }, []); // Mảng rỗng đảm bảo useEffect này chỉ chạy một lần duy nhất

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
    } catch (error) { console.error("Firestore update failed for boss floor via service: ", error); }
  };
  
  const handleMinerChallengeEnd = (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    if (result.finalPickaxes === pickaxes && result.coinsEarned === 0 && result.highestFloorCompleted <= minerChallengeHighestFloor) { 
        return; 
    }
    const newCoins = coins + result.coinsEarned;
    const newPickaxes = result.finalPickaxes;
    const newHighestFloor = Math.max(minerChallengeHighestFloor, result.highestFloorCompleted);
    setCoins(newCoins);
    setPickaxes(newPickaxes);
    setMinerChallengeHighestFloor(newHighestFloor);
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid; if (!userId) return;
    const originalPickaxes = pickaxes;
    setPickaxes(prev => prev + amountToAdd);
    try {
        await updateUserPickaxes(userId, originalPickaxes + amountToAdd);
    } catch(error) {
        console.error("Failed to update pickaxes on server:", error);
        setPickaxes(originalPickaxes);
    }
  };
  
  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
      setJackpotPool(await updateJackpotPool(amount, reset));
  };
  
  // SỬA ĐỔI: Xóa hàm handleStatsUpdate vì không còn cần thiết. onSnapshot đã thay thế vai trò của nó.
  // const handleStatsUpdate = (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => {
  //   setCoins(newCoins); setUserStats(newStats);
  // };
  
  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      const isLoading = isLoadingUserData || !assetsLoaded;
      if (isLoading) return;
      if (isSyncingData) { setShowRateLimitToast(true); return; }
      setter(prev => {
          const newState = !prev;
          if (newState) {
              hideNavBar();
              [ setIsRankOpen, setIsPvpArenaOpen, setIsLuckyGameOpen, setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen, setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen, setIsAuctionHouseOpen, setIsCheckInOpen, setIsMailboxOpen ].forEach(s => { if (s !== setter) s(false); });
          } else { showNavBar(); }
          return newState;
      });
  };

  // <<< THAY ĐỔI LỚN: Tối ưu hóa hàm getPlayerBattleStats để sử dụng userStatsValue
  const getPlayerBattleStats = () => {
    const BASE_HP = 0, BASE_ATK = 0, BASE_DEF = 0;
    
    // Lấy thẳng giá trị đã tính toán sẵn từ state, không cần tính lại
    const bonusHp = userStatsValue.hp;
    const bonusAtk = userStatsValue.atk;
    const bonusDef = userStatsValue.def;

    let itemHpBonus = 0, itemAtkBonus = 0, itemDefBonus = 0;
    Object.values(equippedItems).forEach(itemId => { 
        if(itemId){
            const item = ownedItems.find(i => i.id === itemId);
            if (item) { 
                itemHpBonus += item.stats.hp || 0; 
                itemAtkBonus += item.stats.atk || 0; 
                itemDefBonus += item.stats.def || 0; 
            }
        }
    });
    return { 
        maxHp: BASE_HP + bonusHp + itemHpBonus, 
        hp: BASE_HP + bonusHp + itemHpBonus, 
        atk: BASE_ATK + bonusAtk + itemAtkBonus, 
        def: BASE_DEF + bonusDef + itemDefBonus, 
        maxEnergy: 50, 
        energy: 50 
    };
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
  const toggleAuctionHouse = createToggleFunction(setIsAuctionHouseOpen);
  const toggleCheckIn = createToggleFunction(setIsCheckInOpen);
  const toggleMailbox = createToggleFunction(setIsMailboxOpen);
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  
  const handleSkillScreenClose = (dataUpdated: boolean) => {
    toggleSkillScreen();
  };

  const updateSkillsState = (data: SkillScreenExitData) => {
    setCoins(data.gold);
    setDisplayedCoins(data.gold);
    setAncientBooks(data.ancientBooks);
    setOwnedSkills(data.ownedSkills);
    setEquippedSkillIds(data.equippedSkillIds);
  };

  const updateEquipmentData = (data: EquipmentScreenExitData) => {
    setCoins(data.gold);
    setDisplayedCoins(data.gold);
    setEquipmentPieces(data.equipmentPieces);
    setOwnedItems(data.ownedItems);
    setEquippedItems(data.equippedItems);
  };

  const updateUserCurrency = (updates: { coins?: number; gems?: number; equipmentPieces?: number; ancientBooks?: number; cardCapacity?: number; }) => {
    if (updates.coins !== undefined) {
        setCoins(updates.coins);
        setDisplayedCoins(updates.coins);
    }
    if (updates.gems !== undefined) {
        setGems(updates.gems);
    }
    if (updates.equipmentPieces !== undefined) {
        setEquipmentPieces(updates.equipmentPieces);
    }
    if (updates.ancientBooks !== undefined) {
        setAncientBooks(updates.ancientBooks);
    }
    if (updates.cardCapacity !== undefined) {
        setCardCapacity(updates.cardCapacity);
    }
  };

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen || isAuctionHouseOpen || isCheckInOpen || isMailboxOpen;
  const isLoading = isLoadingUserData || !assetsLoaded;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

  const value: IGameContext = {
    isLoadingUserData: isLoading, isSyncingData, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, 
    // SỬA ĐỔI: Cung cấp 2 state mới ra context
    userStatsLevel, 
    userStatsValue,
    jackpotPool,
    bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, equippedItems,
    loginStreak, lastCheckIn, isBackgroundPaused, showRateLimitToast, isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen, isBossBattleOpen, isShopOpen,
    isVocabularyChestOpen, isAchievementsOpen, isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    isAuctionHouseOpen,
    isCheckInOpen,
    isMailboxOpen,
    isAnyOverlayOpen, isGamePaused,
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes, handleUpdateJackpotPool, 
    // SỬA ĐỔI: Xóa handleStatsUpdate khỏi value
    getPlayerBattleStats, getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate, handleSkillScreenClose, updateSkillsState,
    updateEquipmentData,
    updateUserCurrency,
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge, toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, 
    toggleAuctionHouse,
    toggleCheckIn,
    toggleMailbox,
    toggleBaseBuilding, setCoins,
    setIsSyncingData
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
// --- END OF FILE GameContext.tsx ---
