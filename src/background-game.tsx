import React, { useEffect, useRef, Component, lazy, Suspense, useCallback, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './ui/display/coin-display.tsx';
import GemDisplay from './ui/display/gem-display.tsx';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import StickGame from './home/stick-game.tsx';
import DungeonCanvasBackground from './background-canvas.tsx';
import LuckyChestGame from './lucky-game.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import BossBattle from './home/tower/tower-ui.tsx';
import Shop from './home/shop/shop-ui.tsx';
import VocabularyChestScreen from './home/vocabulary-chest/voca-chest-ui.tsx';
import MinerChallenge from './home/miner-challenge/miner-ui.tsx';
import UpgradeStatsScreen from './home/upgrade-stats/upgrade-ui.tsx';
import AchievementsScreen from './home/achievements/achievement-ui.tsx'; 
import AdminPanel from './admin2.tsx';
import BaseBuildingScreen from './building.tsx';
import SkillScreen from './home/skill-game/skill-ui.tsx';
import type { SkillScreenExitData } from './home/skill-game/skill-context.tsx';
import EquipmentScreen, { type EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';
import AuctionHouse from './home/auction/auction-house-ui.tsx';
import DailyCheckIn from './home/check-in/check-in-ui.tsx';
import Mailbox from './home/mail/mail.tsx'; 
import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx'; 
import { useGame } from './GameContext.tsx';

// IMPORT MODAL THƯƠNG HỘI
import TradeAssociationModal from './home/equipment/trade-association-modal.tsx';

const SystemCheckScreen = lazy(() => import('./SystemCheckScreen.tsx'));
const SlotMachineGame = lazy(() => import('./777.tsx'));

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

interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error: error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error in component:", error, errorInfo); }
  render() { if (this.state.hasError) { return this.props.fallback || ( <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded"> <p>Có lỗi xảy ra.</p> </div> ); } return this.props.children; }
}

interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar }: ObstacleRunnerGameProps) {
  
  const {
    isLoadingUserData, coins, displayedCoins, gems, masteryCards, pickaxes,
    minerChallengeHighestFloor, bossBattleHighestFloor, jackpotPool,
    isAnyOverlayOpen, isGamePaused, showRateLimitToast,
    isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen,
    isBossBattleOpen, isShopOpen, isVocabularyChestOpen, isAchievementsOpen,
    isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    isAuctionHouseOpen,
    isCheckInOpen,
    isMailboxOpen,
    is777GameOpen,
    isTradeModalOpen, // [NEW]
    wood, leather, ore, cloth, // [NEW] Resources
    isSyncingData, // [NEW] 
    handleExchangeResources, // [NEW]
    ownedItems, equippedItems, refreshUserData,
    handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes,
    handleUpdateJackpotPool, handleStatsUpdate,
    handleStateUpdateFromChest, handleAchievementsDataUpdate,
    setCoins, updateSkillsState,
    updateEquipmentData,
    updateUserCurrency,
    updateCoins,
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge,
    toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, 
    toggleAuctionHouse,
    toggleCheckIn,
    toggleMailbox, 
    toggleBaseBuilding,
    toggle777Game,
    toggleTradeModal // [NEW]
  } = useGame();

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === 'vanlongt309@gmail.com';
  
  const [isSystemCheckOpen, setIsSystemCheckOpen] = useState(false);
  const toggleSystemCheck = useCallback(() => {
    setIsSystemCheckOpen(p => !p);
  }, []);

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

  const SuspenseLoader = () => (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-lg animate-pulse">Đang tải công cụ...</div>
      </div>
  );

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout 
        setToggleSidebar={handleSetToggleSidebar} 
        onShowRank={toggleRank} 
        onShowLuckyGame={toggleLuckyGame} 
        onShowMinerChallenge={toggleMinerChallenge} 
        onShowAchievements={toggleAchievements} 
        onShowUpgrade={toggleUpgradeScreen} 
        onShowBaseBuilding={toggleBaseBuilding}
        onShowSystemCheck={toggleSystemCheck}
        onShowAdmin={isAdmin ? toggleAdminPanel : undefined}
      >
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
            
            {/* --- LEFT SIDEBAR ICONS --- */}
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ 
                { icon: <img src={uiAssets.towerIcon} alt="Boss Battle Icon" className="w-full h-full object-contain" />, onClick: toggleBossBattle }, 
                { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop }, 
                { icon: <img src={uiAssets.pvpIcon} alt="PvP Arena Icon" className="w-full h-full object-contain" />, onClick: togglePvpArena }, 
                { icon: <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/mail-icon.webp" alt="Mailbox Icon" className="w-full h-full object-contain p-1" />, onClick: toggleMailbox },
                // THAY THẾ 777 BẰNG TRADE ASSOCIATION (THƯƠNG HỘI)
                { 
                    icon: <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shop-icon.webp" alt="Trade Association" className="w-full h-full object-contain" />, 
                    onClick: toggleTradeModal 
                } 
              ].map((item, index) => ( 
                <div key={index} className="group cursor-pointer"> 
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> 
                    {item.icon} 
                  </div> 
                </div> 
              ))}
            </div>

            {/* --- RIGHT SIDEBAR ICONS --- */}
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ 
                { icon: <img src={uiAssets.vocabularyChestIcon} alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest }, 
                { icon: <img src={uiAssets.missionIcon} alt="Equipment Icon" className="w-full h-full object-contain" />, onClick: toggleEquipmentScreen }, 
                { icon: <img src={uiAssets.skillIcon} alt="Skill Icon" className="w-full h-full object-contain" />, onClick: toggleSkillScreen }, 
                { icon: <img src={uiAssets.gavelIcon} alt="Auction House Icon" className="w-full h-full object-contain p-1" />, onClick: toggleAuctionHouse }, 
                { icon: <img src={uiAssets.checkInIcon} alt="Check In Icon" className="w-full h-full object-contain" />, onClick: toggleCheckIn } 
              ].map((item, index) => ( 
                <div key={index} className="group cursor-pointer"> 
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> 
                    {item.icon} 
                  </div> 
                </div> 
              ))}
            </div>
          </div>
        </div>

        {/* --- Overlays / Modals --- */}
        <div className="fixed inset-0 z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary>{isRankOpen && currentUser && <EnhancedLeaderboard onClose={toggleRank} currentUserId={currentUser.uid} />}</ErrorBoundary> </div>
        
        <div className="fixed inset-0 z-[60]" style={{ display: isPvpArenaOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isPvpArenaOpen && currentUser && (
                    <StickGame onClose={togglePvpArena} /> 
                )}
            </ErrorBoundary>
        </div>
        
        <div className="fixed inset-0 z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>
                {currentUser && (
                    <LuckyChestGame onClose={toggleLuckyGame} />
                )}
            </ErrorBoundary> 
        </div>
        
        <div className="fixed inset-0 z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isMinerChallengeOpen && currentUser && (
                    <MinerChallenge 
                        onClose={toggleMinerChallenge} 
                        onGameEnd={handleMinerChallengeEnd} 
                    />
                )}
            </ErrorBoundary>
        </div>
        
        <div className="fixed inset-0 z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isBossBattleOpen && currentUser && (
                    <BossBattle 
                        userId={currentUser.uid}
                        onClose={toggleBossBattle}
                        onBattleEnd={async (result, rewards) => { 
                            if (result === 'win' && rewards.coins) {
                                updateCoins(rewards.coins);
                            }
                        }}
                        onFloorComplete={handleBossFloorUpdate}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>
                {isShopOpen && 
                    <Shop onClose={toggleShop} onCurrencyUpdate={updateUserCurrency} />
                }
            </ErrorBoundary> 
        </div>

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
            <ErrorBoundary>
                {isBaseBuildingOpen && currentUser && (
                    <BaseBuildingScreen 
                        onClose={toggleBaseBuilding} 
                        coins={coins} 
                        gems={gems} 
                        onUpdateCoins={updateCoins}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isSkillScreenOpen && currentUser && (
                <SkillScreen 
                  onClose={(dataUpdated: boolean, data?: SkillScreenExitData) => {
                    toggleSkillScreen();
                    if (dataUpdated && data) {
                      updateSkillsState(data);
                    }
                  }} 
                  userId={currentUser.uid} />)}</ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isEquipmentOpen && currentUser && (
                    <EquipmentScreen 
                        onClose={(exitData: EquipmentScreenExitData) => {
                            toggleEquipmentScreen(); 
                            updateEquipmentData(exitData);
                        }} 
                        userId={currentUser.uid}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[60]" style={{ display: isAuctionHouseOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isAuctionHouseOpen && currentUser && (
                    <AuctionHouse 
                        userId={currentUser.uid}
                        userName={currentUser.displayName || 'Player'}
                        ownedItems={ownedItems}
                        equippedItems={equippedItems}
                        onClose={toggleAuctionHouse}
                        onAuctionAction={refreshUserData}
                    />
                )}
            </ErrorBoundary>
        </div>
        
        {isCheckInOpen && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm">
                <ErrorBoundary>
                    <DailyCheckIn onClose={toggleCheckIn} />
                </ErrorBoundary>
            </div>
        )}

        {isMailboxOpen && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <ErrorBoundary>
                    <Mailbox onClose={toggleMailbox} />
                </ErrorBoundary>
            </div>
        )}

        {/* [NEW] MODAL THƯƠNG HỘI OVERLAY */}
        {isTradeModalOpen && (
            <ErrorBoundary>
                <TradeAssociationModal 
                    isOpen={isTradeModalOpen}
                    onClose={toggleTradeModal}
                    resources={{ wood, leather, ore, cloth }}
                    onExchange={handleExchangeResources}
                    isProcessing={isSyncingData}
                />
            </ErrorBoundary>
        )}

        {isSystemCheckOpen && (
            <ErrorBoundary fallback={<div className="fixed inset-0 bg-black/70 flex items-center justify-center text-red-400">Lỗi khi tải công cụ System Check.</div>}>
                <Suspense fallback={<SuspenseLoader />}>
                    <SystemCheckScreen onClose={toggleSystemCheck} />
                </Suspense>
            </ErrorBoundary>
        )}
        
        {is777GameOpen && (
            <ErrorBoundary fallback={<div className="fixed inset-0 bg-black/70 flex items-center justify-center text-red-400">Lỗi khi tải Slot Game.</div>}>
                <Suspense fallback={<SuspenseLoader />}>
                    {currentUser && <SlotMachineGame />}
                </Suspense>
            </ErrorBoundary>
        )}

        {isAdminPanelOpen && ( <div className="fixed inset-0 z-[70]"> <ErrorBoundary><AdminPanel onClose={toggleAdminPanel} /></ErrorBoundary> </div> )}

      </SidebarLayout>
      <GameSkeletonLoader show={isLoadingUserData} />
    </div>
  );
}
