// --- START OF FILE src/background-game.tsx (PHIÊN BẢN HOÀN CHỈNH) ---

import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
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
import SkillScreen from './home/skill-game/skill-ui.tsx';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './skill-data.tsx';
import EquipmentScreen, { OwnedItem, EquippedItems } from './equipment.tsx';
import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx'; 

import { GameDataProvider, useGameData } from './GameDataContext.tsx';

import { 
  updateJackpotPool,
  fetchJackpotPool,
  updateUserPickaxes,
} from './gameDataService.ts';


// --- SVG Icon Components & Error Boundary (giữ nguyên) ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}> <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /> </svg> );
interface GemIconProps { size?: number; color?: string; className?: string; [key: string]: any; }
const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}> <img src={uiAssets.gemIcon} alt="Tourmaline Gem Icon" className="w-full h-full object-contain" /> </div> );
interface StatsIconProps { onClick: () => void; }
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => ( <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10" onClick={onClick} title="Xem chỉ số nhân vật"> <img src={uiAssets.statsIcon} alt="Award Icon" className="w-full h-full object-contain" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = "https://placehold.co/32x32/ffffff/000000?text=Icon"; }} /> </div> );
interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> { constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; } static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error: error }; } componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error in component:", error, errorInfo); } render() { if (this.state.hasError) { return this.props.fallback || ( <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded"> <p>Có lỗi xảy ra khi hiển thị nội dung.</p> <p>Chi tiết lỗi: {this.state.error?.message}</p> <p>(Kiểm tra Console để biết thêm thêm thông tin)</p> </div> ); } return this.props.children; } }


interface ObstacleRunnerGameProps {
  className?: string; hideNavBar: () => void; showNavBar: () => void; currentUser: User | null; assetsLoaded: boolean;
}

function ObstacleRunnerGameContent({ className, hideNavBar, showNavBar, currentUser, assetsLoaded }: ObstacleRunnerGameProps) {

  const {
    isGlobalLoading, isSyncing, coins, gems, masteryCards, pickaxes, ancientBooks,
    equipmentPieces, userStats, bossBattleHighestFloor, ownedSkills, equippedSkillIds,
    ownedItems, equippedItems, minerChallengeHighestFloor,
    loadInitialData, resetGameData, refreshGameData, setCoins, handleBossFloorUpdate, handleShopPurchase,
    handleMinerChallengeEnd
  } = useGameData();

  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [jackpotPool, setJackpotPool] = useState(0);

  // States for managing overlay visibility (giữ nguyên)
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

  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);
  const sidebarToggleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadInitialData(user);
        const jackpotData = await fetchJackpotPool();
        setJackpotPool(jackpotData);
      } else {
        setIsRankOpen(false); setIsPvpArenaOpen(false); setIsLuckyGameOpen(false);
        setIsBossBattleOpen(false); setIsShopOpen(false); setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false); setIsAdminPanelOpen(false); setIsUpgradeScreenOpen(false);
        setJackpotPool(0);
        resetGameData();
      }
    });
    return () => unsubscribe();
  }, [loadInitialData, resetGameData]);

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
    const setAppHeight = () => { document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`); };
    window.addEventListener('resize', setAppHeight); setAppHeight();
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  useEffect(() => { if (showRateLimitToast) { const timer = setTimeout(() => { setShowRateLimitToast(false); }, 2500); return () => clearTimeout(timer); } }, [showRateLimitToast]);
  useEffect(() => { if (displayedCoins === coins) return; const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100); return () => clearTimeout(timeoutId); }, [coins]);
  useEffect(() => { const handleVisibilityChange = () => { if (document.hidden) setIsBackgroundPaused(true); else setIsBackgroundPaused(false); }; document.addEventListener('visibilitychange', handleVisibilityChange); return () => document.removeEventListener('visibilitychange', handleVisibilityChange); }, []);

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await updateUserPickaxes(userId, pickaxes + amountToAdd);
    await refreshGameData(); // Can refactor this into context later
  };
  const handleUpdateJackpotPool = async (amount: number, reset: boolean = false) => {
      const newPool = await updateJackpotPool(amount, reset);
      setJackpotPool(newPool);
  };
  
  const isLoading = isGlobalLoading || !assetsLoaded;

  const renderCharacter = () => {
    const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
    return (<div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20"><DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isPaused} className="w-full h-full" /></div>);
  };
  
  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return () => {
        if (isLoading) return;
        if (isSyncing) { setShowRateLimitToast(true); return; }
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
  
  const isAnyOverlayOpen = isRankOpen || isPvpArenaOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
  const isAdmin = auth.currentUser?.email === 'vanlongt309@gmail.com';
  
  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout setToggleSidebar={(fn) => {sidebarToggleRef.current = fn}} onShowRank={toggleRank} onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge} onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen} onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}>
        <DungeonCanvasBackground isPaused={isGamePaused} />
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoading ? 'hidden' : 'visible' }} className="w-full h-full">
            <div className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`}>
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

        {/* --- Overlays / Modals (đã được refactor để dùng actions từ context) --- */}
        <div className="fixed inset-0 z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isPvpArenaOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isPvpArenaOpen && auth.currentUser && (<PvpArena onClose={togglePvpArena} userId={auth.currentUser.uid} player1={{ name: auth.currentUser.displayName || "You", avatarUrl: auth.currentUser.photoURL || "", coins: coins, initialStats: getPlayerBattleStats(), equippedSkills: getEquippedSkillsDetails() }} player2={{ name: "Shadow Fiend", avatarUrl: "https://i.imgur.com/kQoG2Yd.png", initialStats: { maxHp: 1500, hp: 1500, atk: 120, def: 55 }, equippedSkills: [] }} onCoinChange={setCoins} onMatchEnd={(result) => console.log(`Match ended. Winner: ${result.winner}`)} /> )}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> <ErrorBoundary>{auth.currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={setCoins} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={handleUpdateJackpotPool} />)}</ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isMinerChallengeOpen && auth.currentUser && (<MinerChallenge onClose={toggleMinerChallenge} initialDisplayedCoins={displayedCoins} masteryCards={masteryCards} initialPickaxes={pickaxes} initialHighestFloor={minerChallengeHighestFloor} onGameEnd={handleMinerChallengeEnd} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBossBattleOpen && auth.currentUser && (<BossBattle onClose={toggleBossBattle} playerInitialStats={getPlayerBattleStats()} onBattleEnd={async (result, rewards) => { if (result === 'win') await setCoins(coins + rewards.coins); }} initialFloor={bossBattleHighestFloor} onFloorComplete={handleBossFloorUpdate} equippedSkills={getEquippedSkillsDetails()} displayedCoins={displayedCoins} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} onPurchase={handleShopPurchase} currentUser={auth.currentUser} />}</ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>{isVocabularyChestOpen && currentUser && (<VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser.uid} onStateUpdate={refreshGameData} />)}</ErrorBoundary> 
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isAchievementsOpen && (<AchievementsScreen user={auth.currentUser} onClose={toggleAchievements} onDataUpdate={refreshGameData} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isUpgradeScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isUpgradeScreenOpen && auth.currentUser && (<UpgradeStatsScreen onClose={toggleUpgradeScreen} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBaseBuildingOpen && auth.currentUser && (<BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={setCoins} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isSkillScreenOpen && auth.currentUser && (<SkillScreen onClose={() => { toggleSkillScreen(); refreshGameData(); }} userId={auth.currentUser.uid} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isEquipmentOpen && auth.currentUser && (<EquipmentScreen onClose={toggleEquipmentScreen} userId={auth.currentUser.uid} initialGold={coins} initialEquipmentPieces={equipmentPieces} initialOwnedItems={ownedItems} initialEquippedItems={equippedItems} onDataChange={refreshGameData} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
      </SidebarLayout>
      <GameSkeletonLoader show={isLoading} />
    </div>
  );
}

export default function ObstacleRunnerGame(props: ObstacleRunnerGameProps) {
  return ( <GameDataProvider> <ObstacleRunnerGameContent {...props} /> </GameDataProvider> );
}

// --- END OF FILE src/background-game.tsx ---
