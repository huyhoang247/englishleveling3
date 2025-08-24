// --- START OF FILE src/background-game.tsx ---

import React, { useEffect, useRef, Component } from 'react';
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
import { SkillBlueprint } from './skill-data.tsx';
import type { SkillScreenExitData } from './home/skill-game/skill-context.tsx';

// --- THAY ĐỔI: Import EquipmentScreen và type mới ---
import EquipmentScreen, { type EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';

import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx'; 
import { useGame } from './GameContext.tsx';
import { updateUserCoins } from './gameDataService.ts';

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

interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar }: ObstacleRunnerGameProps) {
  
  // --- Consume the global game context ---
  const {
    // Data states
    isLoadingUserData, coins, displayedCoins, gems, masteryCards, pickaxes,
    minerChallengeHighestFloor, bossBattleHighestFloor, jackpotPool,
    // UI states
    isAnyOverlayOpen, isGamePaused, showRateLimitToast,
    isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen,
    isBossBattleOpen, isShopOpen, isVocabularyChestOpen, isAchievementsOpen,
    isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    // Functions
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes,
    handleUpdateJackpotPool, handleStatsUpdate, handleShopPurchase, getPlayerBattleStats,
    getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate,
    setCoins, updateSkillsState,
    // --- THÊM MỚI: Lấy hàm updateEquipmentData từ context ---
    updateEquipmentData,
    // Toggles
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge,
    toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleBaseBuilding,
  } = useGame();

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const currentUser = auth.currentUser; // Get current user for passing to components
  const isAdmin = currentUser?.email === 'vanlongt309@gmail.com';

  // Effect to manage page overflow, specific to the game screen
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

  const handleTap = () => { };

  const renderCharacter = () => {
    return (<div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20"><DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isGamePaused} className="w-full h-full" /></div>);
  };

  const handleSetToggleSidebar = (toggleFn: () => void) => { sidebarToggleRef.current = toggleFn; };

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowRank={toggleRank} onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge} onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen} onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}>
        <DungeonCanvasBackground isPaused={isGamePaused} />
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoadingUserData ? 'hidden' : 'visible' }} className="w-full h-full">
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
        <div className="fixed inset-0 z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isPvpArenaOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isPvpArenaOpen && currentUser && (<PvpArena onClose={togglePvpArena} userId={currentUser.uid} player1={{ name: currentUser.displayName || "You", avatarUrl: currentUser.photoURL || "", coins: coins, initialStats: getPlayerBattleStats(), equippedSkills: getEquippedSkillsDetails() }} player2={{ name: "Shadow Fiend", avatarUrl: "https://i.imgur.com/kQoG2Yd.png", initialStats: { maxHp: 1500, hp: 1500, atk: 120, def: 55 }, equippedSkills: [] }} onCoinChange={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} onMatchEnd={(result) => console.log(`Match ended. Winner: ${result.winner}`)} /> )}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> <ErrorBoundary>{currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={handleUpdateJackpotPool} />)}</ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isMinerChallengeOpen && currentUser && (<MinerChallenge onClose={toggleMinerChallenge} initialDisplayedCoins={displayedCoins} masteryCards={masteryCards} initialPickaxes={pickaxes} initialHighestFloor={minerChallengeHighestFloor} onGameEnd={handleMinerChallengeEnd} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBossBattleOpen && currentUser && (<BossBattle onClose={toggleBossBattle} playerInitialStats={getPlayerBattleStats()} onBattleEnd={async (result, rewards) => { if (result === 'win' && currentUser) setCoins(await updateUserCoins(currentUser.uid, rewards.coins)); }} initialFloor={bossBattleHighestFloor} onFloorComplete={handleBossFloorUpdate} equippedSkills={getEquippedSkillsDetails()} displayedCoins={displayedCoins} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} onPurchase={handleShopPurchase} currentUser={currentUser} />}</ErrorBoundary> </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>{isVocabularyChestOpen && currentUser && (<VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser.uid} onStateUpdate={handleStateUpdateFromChest} />)}</ErrorBoundary> 
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isAchievementsOpen && (<AchievementsScreen user={currentUser} onClose={toggleAchievements} onDataUpdate={handleAchievementsDataUpdate} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isUpgradeScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isUpgradeScreenOpen && currentUser && (<UpgradeStatsScreen onClose={toggleUpgradeScreen} onDataUpdated={handleStatsUpdate} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBaseBuildingOpen && currentUser && (<BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} />)}</ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isSkillScreenOpen && currentUser && (
                <SkillScreen 
                  onClose={(dataUpdated: boolean, data?: SkillScreenExitData) => {
                    toggleSkillScreen(); // Luôn đóng giao diện ngay lập tức
                    if (dataUpdated && data) {
                      updateSkillsState(data); // Cập nhật trạng thái "êm ái" mà không cần loader
                    }
                  }} 
                  userId={currentUser.uid} />)}</ErrorBoundary>
        </div>
        
        {/* --- THAY ĐỔI: Cập nhật cách gọi EquipmentScreen --- */}
        <div className="fixed inset-0 z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isEquipmentOpen && currentUser && (
                    <EquipmentScreen 
                        onClose={(exitData: EquipmentScreenExitData) => {
                            // 1. Đóng màn hình ngay lập tức
                            toggleEquipmentScreen(); 
                            // 2. Cập nhật "êm ái" GameContext với dữ liệu trả về
                            updateEquipmentData(exitData);
                            // refreshUserData() đã được loại bỏ để tránh loading
                        }} 
                        userId={currentUser.uid}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
      </SidebarLayout>
      <GameSkeletonLoader show={isLoadingUserData} />
    </div>
  );
}

// --- END OF FILE src/background-game.tsx ---
