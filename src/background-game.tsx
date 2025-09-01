// --- START OF FILE src/background-game.tsx ---

import React, { useEffect, useRef, Component, lazy, Suspense, useCallback, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './ui/display/coin-display.tsx';
import GemDisplay from './ui/display/gem-display.tsx';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { SidebarLayout } from './sidebar.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx';
import { useGame } from './GameContext.tsx';
import { updateUserCoins, fetchAuctionHouseData } from './gameDataService.ts';
import type { SkillScreenExitData } from './home/skill-game/skill-context.tsx';
import type { EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';
import type { AuctionHouseExitData } from './home/auction/auction-house-ui.tsx';

// --- Lazy Load Components for better performance ---
const SystemCheckScreen = lazy(() => import('./SystemCheckScreen.tsx'));
const EnhancedLeaderboard = lazy(() => import('./rank.tsx'));
const PvpArena = lazy(() => import('./pvp.tsx'));
const DungeonCanvasBackground = lazy(() => import('./background-canvas.tsx'));
const LuckyChestGame = lazy(() => import('./lucky-game.tsx'));
const BossBattle = lazy(() => import('./home/tower/tower-ui.tsx'));
const Shop = lazy(() => import('./home/shop/shop-ui.tsx'));
const VocabularyChestScreen = lazy(() => import('./home/vocabulary-chest/voca-chest-ui.tsx'));
const MinerChallenge = lazy(() => import('./bomb.tsx'));
const UpgradeStatsScreen = lazy(() => import('./home/upgrade-stats/upgrade-ui.tsx'));
const AchievementsScreen = lazy(() => import('./home/achievements/achievement-ui.tsx'));
const AdminPanel = lazy(() => import('./admin.tsx'));
const BaseBuildingScreen = lazy(() => import('./building.tsx'));
const SkillScreen = lazy(() => import('./home/skill-game/skill-ui.tsx'));
const EquipmentScreen = lazy(() => import('./home/equipment/equipment-ui.tsx'));
const AuctionHouseScreen = lazy(() => import('./home/auction/auction-house-ui.tsx'));

// --- Icon Components (Re-added from your original file) ---
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

// --- ErrorBoundary Class (Re-added from your original file) ---
interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error: error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error in component:", error, errorInfo); }
  render() { if (this.state.hasError) { return this.props.fallback || ( <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-red-400 p-4"> <p>Có lỗi xảy ra khi tải chức năng này.</p> </div> ); } return this.props.children; }
}

const SuspenseLoader = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="text-white text-lg animate-pulse">Đang tải...</div>
    </div>
);

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar }: { className?: string; hideNavBar: () => void; showNavBar: () => void; }) {
  
  const {
    isLoadingUserData, coins, displayedCoins, gems, masteryCards, pickaxes, jackpotPool,
    ownedItems, equippedItems,
    isAnyOverlayOpen, isGamePaused, showRateLimitToast,
    isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen,
    isBossBattleOpen, isShopOpen, isVocabularyChestOpen, isAchievementsOpen,
    isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    isAuctionHouseOpen,
    handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes,
    handleUpdateJackpotPool, handleStatsUpdate, getPlayerBattleStats,
    getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate,
    setCoins, updateSkillsState, updateEquipmentData, updateAuctionHouseData,
    updateUserCurrency,
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge,
    toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleBaseBuilding,
    toggleAuctionHouse,
  } = useGame();

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === 'vanlongt309@gmail.com';
  
  const [isSystemCheckOpen, setIsSystemCheckOpen] = useState(false);
  const [auctionData, setAuctionData] = useState<{ allAuctions: any[], myAuctions: any[] } | null>(null);

  const toggleSystemCheck = useCallback(() => setIsSystemCheckOpen(p => !p), []);

  const handleToggleAuctionHouse = async () => {
    if (!isAuctionHouseOpen) {
        if (!currentUser) return;
        try {
            const data = await fetchAuctionHouseData(currentUser.uid);
            setAuctionData(data);
            toggleAuctionHouse();
        } catch (error) {
            console.error("Failed to load auction data:", error);
            alert("Không thể tải Sàn Đấu Giá lúc này.");
        }
    } else {
        toggleAuctionHouse();
    }
  };

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);
  
  const unequippedItems = ownedItems.filter(item => !Object.values(equippedItems).includes(item.id));
  const renderCharacter = () => (<div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20"><DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isGamePaused} className="w-full h-full" /></div>);

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout 
        setToggleSidebar={(fn) => { sidebarToggleRef.current = fn; }} 
        onShowRank={toggleRank} 
        onShowLuckyGame={toggleLuckyGame} 
        onShowMinerChallenge={toggleMinerChallenge} 
        onShowAchievements={toggleAchievements} 
        onShowUpgrade={toggleUpgradeScreen} 
        onShowBaseBuilding={toggleBaseBuilding}
        onShowSystemCheck={toggleSystemCheck}
        onShowAdmin={isAdmin ? toggleAdminPanel : undefined}
      >
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <DungeonCanvasBackground isPaused={isGamePaused} />
        </Suspense>
        
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoadingUserData ? 'hidden' : 'visible' }} className="w-full h-full">
           <div className={`${className ?? ''} relative w-full h-full bg-transparent`}>
            {renderCharacter()}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-b border-l border-r border-slate-700/50">
                <HeaderBackground />
                <button onClick={() => sidebarToggleRef.current?.()} className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20" aria-label="Mở sidebar"><img src={uiAssets.menuIcon} alt="Menu Icon" className="w-5 h-5 object-contain" /></button>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-1 currency-display-container relative z-10"><GemDisplay displayedGems={gems} /><CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} /></div>
            </div>
            <RateLimitToast show={showRateLimitToast} />
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: uiAssets.towerIcon, onClick: toggleBossBattle }, { icon: uiAssets.shopIcon, onClick: toggleShop }, { icon: uiAssets.pvpIcon, onClick: togglePvpArena }, { icon: uiAssets.gavelIcon, onClick: handleToggleAuctionHouse } ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> <img src={item.icon} alt="" className="w-full h-full object-contain" /> </div> </div> ))}
            </div>
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: uiAssets.vocabularyChestIcon, onClick: toggleVocabularyChest }, { icon: uiAssets.missionIcon, onClick: toggleEquipmentScreen }, { icon: uiAssets.skillIcon, onClick: toggleSkillScreen }, ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> <img src={item.icon} alt="" className="w-full h-full object-contain" /> </div> </div> ))}
            </div>
          </div>
        </div>

        {/* --- Overlays / Modals --- */}
        <Suspense fallback={<SuspenseLoader />}>
            {isRankOpen && <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary>}
            {isPvpArenaOpen && currentUser && <ErrorBoundary><PvpArena onClose={togglePvpArena} userId={currentUser.uid} player1={{ name: currentUser.displayName || "You", avatarUrl: currentUser.photoURL || "", coins: coins, initialStats: getPlayerBattleStats(), equippedSkills: getEquippedSkillsDetails() }} player2={{ name: "Shadow Fiend", avatarUrl: "https://i.imgur.com/kQoG2Yd.png", initialStats: { maxHp: 1500, hp: 1500, atk: 120, def: 55 }, equippedSkills: [] }} onCoinChange={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} onMatchEnd={() => {}} /></ErrorBoundary>}
            {isLuckyGameOpen && currentUser && <ErrorBoundary><LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={handleUpdateJackpotPool} /></ErrorBoundary>}
            {isMinerChallengeOpen && currentUser && <ErrorBoundary><MinerChallenge onClose={toggleMinerChallenge} initialDisplayedCoins={displayedCoins} masteryCards={masteryCards} initialPickaxes={pickaxes} initialHighestFloor={0} onGameEnd={handleMinerChallengeEnd} /></ErrorBoundary>}
            {isBossBattleOpen && currentUser && <ErrorBoundary><BossBattle userId={currentUser.uid} onClose={toggleBossBattle} onBattleEnd={async (result, rewards) => { if (result === 'win' && currentUser) setCoins(await updateUserCoins(currentUser.uid, rewards.coins)); }} onFloorComplete={handleBossFloorUpdate} /></ErrorBoundary>}
            {isShopOpen && <ErrorBoundary><Shop onClose={toggleShop} onCurrencyUpdate={updateUserCurrency} /></ErrorBoundary>}
            {isVocabularyChestOpen && currentUser && <ErrorBoundary><VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser.uid} onStateUpdate={handleStateUpdateFromChest} /></ErrorBoundary>}
            {isAchievementsOpen && currentUser && <ErrorBoundary><AchievementsScreen user={currentUser} onClose={toggleAchievements} onDataUpdate={handleAchievementsDataUpdate} /></ErrorBoundary>}
            {isUpgradeScreenOpen && currentUser && <ErrorBoundary><UpgradeStatsScreen onClose={toggleUpgradeScreen} onDataUpdated={handleStatsUpdate} /></ErrorBoundary>}
            {isBaseBuildingOpen && currentUser && <ErrorBoundary><BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} /></ErrorBoundary>}
            {isSkillScreenOpen && currentUser && <ErrorBoundary><SkillScreen onClose={(dataUpdated, data) => { toggleSkillScreen(); if (dataUpdated && data) updateSkillsState(data); }} userId={currentUser.uid} /></ErrorBoundary>}
            {isEquipmentOpen && currentUser && <ErrorBoundary><EquipmentScreen onClose={(data) => { toggleEquipmentScreen(); updateEquipmentData(data); }} userId={currentUser.uid} /></ErrorBoundary>}
            {isAuctionHouseOpen && currentUser && auctionData && <ErrorBoundary><AuctionHouseScreen onClose={(data) => { toggleAuctionHouse(); if(data) updateAuctionHouseData(data); }} user={currentUser} initialData={{ gold: coins, gems, unequippedItems, ...auctionData }} /></ErrorBoundary>}
            {isSystemCheckOpen && <ErrorBoundary><SystemCheckScreen onClose={toggleSystemCheck} /></ErrorBoundary>}
            {isAdminPanelOpen && <ErrorBoundary><AdminPanel onClose={toggleAdminPanel} /></ErrorBoundary>}
        </Suspense>

      </SidebarLayout>
      <GameSkeletonLoader show={isLoadingUserData} />
    </div>
  );
}

// --- END OF FILE src/background-game.tsx ---
