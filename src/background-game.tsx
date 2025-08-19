// --- START OF FILE background-game.tsx (FULL CODE) ---

import React, { useState, useEffect, useRef, Component } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './ui/display/coin-display.tsx';
import GemDisplay from './ui/display/gem-display.tsx';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import PvpArena from './pvp.tsx';
import DungeonCanvasBackground from './background-canvas.tsx';
import LuckyChestGame from './lucky-game.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import BossBattle from './boss.tsx';
import Shop from './shop.tsx';
import VocabularyChestScreen from './home/vocabulary-chest/voca-chest-ui.tsx';
import MinerChallenge from './bomb.tsx';
import UpgradeStatsScreen, { calculateTotalStatValue, statConfig } from './home/upgrade-stats/upgrade-ui.tsx';
import AchievementsScreen from './home/achievements/achievement-ui.tsx'; 
import AdminPanel from './admin.tsx';
import BaseBuildingScreen from './building.tsx';
import SkillScreen from './skill.tsx';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './skill-data.tsx';
import EquipmentScreen, { OwnedItem, EquippedItems } from './equipment.tsx';
import RateLimitToast from './thong-bao.tsx';

import { 
  fetchOrCreateUserGameData, 
  updateUserCoins, 
  updateUserGems,
  fetchJackpotPool,
  updateJackpotPool,
  updateUserBossFloor,
  updateUserPickaxes,
  processMinerChallengeResult,
  updateUserSkills,
  updateUserInventory,
  processShopPurchase
} from './gameDataService.ts';

// --- SVG Icon Components ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
interface GemIconProps { size?: number; color?: string; className?: string; [key: string]: any; }
const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img src={uiAssets.gemIcon} alt="Tourmaline Gem Icon" className="w-full h-full object-contain" />
  </div>
);
interface StatsIconProps { onClick: () => void; }
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => (
  <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10" onClick={onClick} title="Xem chỉ số nhân vật">
    <img src={uiAssets.statsIcon} alt="Award Icon" className="w-full h-full object-contain" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = "https://placehold.co/32x32/ffffff/000000?text=Icon"; }} />
  </div>
);

// --- Error Boundary Component ---
interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error: error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error in component:", error, errorInfo); }
  render() { if (this.state.hasError) { return this.props.fallback || ( <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded"> <p>Có lỗi xảy ra khi hiển thị nội dung.</p> <p>Chi tiết lỗi: {this.state.error?.message}</p> <p>(Kiểm tra Console để biết thêm thêm thông tin)</p> </div> ); } return this.props.children; }
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"></div>
    <p className="mt-5 text-lg font-medium text-gray-300">Loading...</p>
  </div>
);

interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
  assetsLoaded: boolean;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser, assetsLoaded }: ObstacleRunnerGameProps) {

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

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const setAppHeight = () => { document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`); };
    window.addEventListener('resize', setAppHeight); setAppHeight();
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  useEffect(() => {
    if (showRateLimitToast) {
      const timer = setTimeout(() => { setShowRateLimitToast(false); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showRateLimitToast]);
  
  const handleBossFloorUpdate = async (newFloor: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error("Cannot update boss floor: User not authenticated."); return; }
    try {
        await updateUserBossFloor(userId, newFloor, bossBattleHighestFloor);
        if (newFloor > bossBattleHighestFloor) { setBossBattleHighestFloor(newFloor); }
        console.log(`Updated boss floor to ${newFloor} for user ${userId} via service.`);
    } catch (error) { console.error("Firestore update failed for boss floor via service: ", error); }
  };
  
  const handleMinerChallengeEnd = async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error("Cannot update game data: User not authenticated."); return; }
    if (result.finalPickaxes === pickaxes && result.coinsEarned === 0 && result.highestFloorCompleted <= minerChallengeHighestFloor) { console.log("No changes to update from Miner Challenge."); return; }
    setIsSyncingData(true);
    try {
      const { newCoins, newPickaxes, newHighestFloor } = await processMinerChallengeResult(userId, result);
      setCoins(newCoins); setPickaxes(newPickaxes); setMinerChallengeHighestFloor(newHighestFloor);
      console.log("Firestore updated successfully after Miner Challenge via service.");
    } catch (error) { console.error("Service call for Miner Challenge end failed: ", error); } finally { setIsSyncingData(false); }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const newTotal = await updateUserPickaxes(userId, pickaxes + amountToAdd);
    setPickaxes(newTotal);
  };
  
  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
      const newPool = await updateJackpotPool(amount, reset);
      setJackpotPool(newPool);
  };
  
  const handleStatsUpdate = (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => {
    setCoins(newCoins);
    setUserStats(newStats);
    console.log("Main game state updated from UpgradeStatsScreen.");
  };

  const handleSkillsUpdate = async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) { throw new Error("User not authenticated for skill update."); }
      setIsSyncingData(true);
      try {
          const { newCoins, newBooks } = await updateUserSkills(userId, updates);
          setCoins(newCoins); setAncientBooks(newBooks); setOwnedSkills(updates.newOwned); setEquippedSkillIds(updates.newEquippedIds);
          console.log("Skill data and resources updated successfully via service.");
      } catch (error) { console.error("Firestore transaction for skill update failed:", error); throw error; } finally { setIsSyncingData(false); }
  };
    
  const handleInventoryUpdate = async (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) { throw new Error("User not authenticated for inventory update."); }
      setIsSyncingData(true);
      try {
          const { newCoins, newPieces } = await updateUserInventory(userId, updates);
          setCoins(newCoins); setEquipmentPieces(newPieces); setOwnedItems(updates.newOwned); setEquippedItems(updates.newEquipped);
          console.log("Equipment data and resources updated successfully via service.");
      } catch (error) { console.error("Firestore transaction for equipment update failed:", error); throw error; } finally { setIsSyncingData(false); }
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
      console.log(`Purchase successful for ${quantity}x ${item.name}.`);
      alert(`Mua thành công x${quantity} ${item.name}!`);
    } catch (error) {
      console.error("Shop purchase transaction failed:", error);
      alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally { setIsSyncingData(false); }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoadingUserData(true);
        try {
          const [gameData, jackpotData] = await Promise.all([ fetchOrCreateUserGameData(user.uid), fetchJackpotPool() ]);
          setCoins(gameData.coins); setDisplayedCoins(gameData.coins); setGems(gameData.gems); setMasteryCards(gameData.masteryCards);
          setPickaxes(gameData.pickaxes); setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor); setUserStats(gameData.stats);
          setBossBattleHighestFloor(gameData.bossBattleHighestFloor); setAncientBooks(gameData.ancientBooks); setOwnedSkills(gameData.skills.owned);
          setEquippedSkillIds(gameData.skills.equipped); setTotalVocabCollected(gameData.totalVocabCollected); setCardCapacity(gameData.cardCapacity);
          setEquipmentPieces(gameData.equipment.pieces); setOwnedItems(gameData.equipment.owned); setEquippedItems(gameData.equipment.equipped);
          setJackpotPool(jackpotData);
        } catch (error) { console.error("Error fetching initial user/app data:", error); } finally { setIsLoadingUserData(false); }
      } else {
        setIsRankOpen(false); setIsPvpArenaOpen(false); setIsLuckyGameOpen(false); setIsBossBattleOpen(false); setIsShopOpen(false); setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false); setIsAdminPanelOpen(false); setIsUpgradeScreenOpen(false); setIsBackgroundPaused(false); setCoins(0); setDisplayedCoins(0); setGems(0); setMasteryCards(0);
        setPickaxes(0); setMinerChallengeHighestFloor(0); setUserStats({ hp: 0, atk: 0, def: 0 }); setBossBattleHighestFloor(0); setAncientBooks(0);
        setOwnedSkills([]); setEquippedSkillIds([null, null, null]); setTotalVocabCollected(0); setEquipmentPieces(0); setOwnedItems([]);
        setEquippedItems({ weapon: null, armor: null, accessory: null }); setCardCapacity(100); setJackpotPool(0); setIsLoadingUserData(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const handleVisibilityChange = () => { if (document.hidden) { setIsBackgroundPaused(true); } else { setIsBackgroundPaused(false); } };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTap = () => { };
  const isLoading = isLoadingUserData || !assetsLoaded;
  useEffect(() => { if (displayedCoins === coins) return; const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100); return () => clearTimeout(timeoutId); }, [coins]);

  const renderCharacter = () => {
    const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
    return (<div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20"><DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isPaused} className="w-full h-full" /></div>);
  };

  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return () => {
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
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  const handleSetToggleSidebar = (toggleFn: () => void) => { sidebarToggleRef.current = toggleFn; };

  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
  const isAdmin = auth.currentUser?.email === 'vanlongt309@gmail.com';

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

  const handleStateUpdateFromChest = (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => { setCoins(updates.newCoins); setGems(updates.newGems); setTotalVocabCollected(updates.newTotalVocab); console.log("Main game state updated from vocabulary chest:", updates); };
  const handleAchievementsDataUpdate = (updates: { coins?: number; masteryCards?: number }) => { if (updates.coins !== undefined) setCoins(updates.coins); if (updates.masteryCards !== undefined) setMasteryCards(updates.masteryCards); console.log("Main game state updated from achievements:", updates); };

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowRank={toggleRank} onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge} onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen} onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}>
        <DungeonCanvasBackground isPaused={isGamePaused} />
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoading ? 'hidden' : 'visible' }} className="w-full h-full">
          <div className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`} onClick={handleTap}>
            {renderCharacter()}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-b border-l border-r border-slate-700/50">
                <HeaderBackground />
                <button onClick={() => sidebarToggleRef.current?.()} className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20" aria-label="Mở sidebar" title="Mở sidebar"><img src={uiAssets.menuIcon} alt="Menu Icon" className="w-5 h-5 object-contain" /></button>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-1 currency-display-container relative z-10"><GemDisplay displayedGems={gems} /><CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} /></div>
            </div>
            <RateLimitToast show={showRateLimitToast} />
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.towerIcon} alt="Boss Battle Icon" className="w-full h-full object-contain" />, onClick: toggleBossBattle }, { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop }, { icon: <img src={uiAssets.pvpIcon} alt="PvP Arena Icon" className="w-full h-full object-contain" />, onClick: togglePvpArena } ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
            </div>
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.vocabularyChestIcon} alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest }, { icon: <img src={uiAssets.missionIcon} alt="Mission Icon" className="w-full h-full object-contain" />, onClick: toggleEquipmentScreen }, { icon: <img src={uiAssets.skillIcon} alt="Skill Icon" className="w-full h-full object-contain" />, onClick: toggleSkillScreen }, ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
            </div>
          </div>
        </div>

        {/* --- Overlays / Modals --- */}
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isPvpArenaOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isPvpArenaOpen && auth.currentUser && (<PvpArena onClose={togglePvpArena} userId={auth.currentUser.uid} player1={{ name: auth.currentUser.displayName || "You", avatarUrl: auth.currentUser.photoURL || "", coins: coins, initialStats: getPlayerBattleStats(), equippedSkills: getEquippedSkillsDetails() }} player2={{ name: "Shadow Fiend", avatarUrl: "https://i.imgur.com/kQoG2Yd.png", initialStats: { maxHp: 1500, hp: 1500, atk: 120, def: 55 }, equippedSkills: [] }} onCoinChange={async (amount) => setCoins(await updateUserCoins(auth.currentUser!.uid, amount))} onMatchEnd={(result) => console.log(`Match ended. Winner: ${result.winner}`)} /> )}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> <ErrorBoundary>{auth.currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(auth.currentUser!.uid, amount))} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={handleUpdateJackpotPool} />)}</ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isMinerChallengeOpen && auth.currentUser && (<MinerChallenge onClose={toggleMinerChallenge} initialDisplayedCoins={displayedCoins} masteryCards={masteryCards} initialPickaxes={pickaxes} initialHighestFloor={minerChallengeHighestFloor} onGameEnd={handleMinerChallengeEnd} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBossBattleOpen && auth.currentUser && (<BossBattle onClose={toggleBossBattle} playerInitialStats={getPlayerBattleStats()} onBattleEnd={async (result, rewards) => { if (result === 'win' && auth.currentUser) setCoins(await updateUserCoins(auth.currentUser.uid, rewards.coins)); }} initialFloor={bossBattleHighestFloor} onFloorComplete={handleBossFloorUpdate} equippedSkills={getEquippedSkillsDetails()} displayedCoins={displayedCoins} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} onPurchase={handleShopPurchase} currentUser={auth.currentUser} />}</ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>{isVocabularyChestOpen && currentUser && (<VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser.uid} onStateUpdate={handleStateUpdateFromChest} />)}</ErrorBoundary> 
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isAchievementsOpen && (<AchievementsScreen user={auth.currentUser} onClose={toggleAchievements} onDataUpdate={handleAchievementsDataUpdate} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isUpgradeScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isUpgradeScreenOpen && auth.currentUser && (<UpgradeStatsScreen onClose={toggleUpgradeScreen} onDataUpdated={handleStatsUpdate} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBaseBuildingOpen && auth.currentUser && (<BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(auth.currentUser!.uid, amount))} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isSkillScreenOpen && auth.currentUser && (<SkillScreen onClose={toggleSkillScreen} gold={coins} ancientBooks={ancientBooks} ownedSkills={ownedSkills} equippedSkillIds={equippedSkillIds} onSkillsUpdate={handleSkillsUpdate} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isEquipmentOpen && auth.currentUser && (<EquipmentScreen onClose={toggleEquipmentScreen} gold={coins} equipmentPieces={equipmentPieces} ownedItems={ownedItems} equippedItems={equippedItems} onInventoryUpdate={handleInventoryUpdate} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
      </SidebarLayout>
      {isLoading && ( <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"> <LoadingSpinner /> </div> )}
    </div>
  );
}
// --- END OF FILE background-game.tsx ---
