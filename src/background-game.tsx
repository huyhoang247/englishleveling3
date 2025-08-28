// --- START OF FILE background-game.tsx ---

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
import { SkillBlueprint } from './home/skill-game/skill-data.tsx';
import type { SkillScreenExitData } from './home/skill-game/skill-context.tsx';

// --- THAY ĐỔI: Import EquipmentScreen và type mới ---
import EquipmentScreen, { type EquipmentScreenExitData } from './home/equipment/equipment-ui.tsx';

import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx'; 
import { useGame } from './GameContext.tsx';
import { updateUserCoins } from './gameDataService.ts';

// --- SVG Icon Components ---
// XIcon đã được định nghĩa trong SystemCheckScreen mới, không cần định nghĩa lại ở đây
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


// --- BẮT ĐẦU PHẦN NÂNG CẤP: SystemCheckScreen đã được thay thế hoàn toàn ---
// ==================================================================
// COMPONENT NÂNG CẤP: SystemCheckScreen
// (Toàn diện hơn, chính xác hơn và giao diện tốt hơn)
// ==================================================================

// --- Helper Icons (tự chứa, không cần import) ---
const MemoryIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 13h2"/><path d="M20 13h2"/><path d="M12 2v2"/><path d="M12 20v2"/><rect width="14" height="14" x="5" y="5" rx="2"/><path d="M9 5v14"/><path d="M15 5v14"/></svg>;
const HardDriveIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>;
const WifiIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>;
const CpuIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>;
const RefreshCwIcon = ({ size = 16, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}> <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /> </svg> );


const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface SystemCheckScreenProps {
  onClose: () => void;
}

const SystemCheckScreen: React.FC<SystemCheckScreenProps> = ({ onClose }) => {
  const [systemInfo, setSystemInfo] = React.useState<any>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSystemData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data: any = {};

      // 1. Memory Info (Non-standard)
      if ('performance' in window && 'memory' in (window.performance as any)) {
        data.memory = (window.performance as any).memory;
      }

      // 2. Storage Info (Standard)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        data.storage = await navigator.storage.estimate();
      }

      // 3. Network Info (Standard)
      if ('connection' in navigator) {
        data.network = navigator.connection;
      }

      // 4. CPU Info (Standard)
      if ('hardwareConcurrency' in navigator) {
        data.cpuCores = navigator.hardwareConcurrency;
      }
      
      setSystemInfo(data);
    } catch (error) {
      console.error("Error fetching system info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; notSupported?: boolean }> = ({ icon, title, children, notSupported }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <div className="flex items-center mb-3">
        <div className="text-cyan-400 mr-3">{icon}</div>
        <h3 className="text-md font-semibold text-gray-200">{title}</h3>
      </div>
      {notSupported 
        ? <p className="text-sm text-gray-500 italic">API không được trình duyệt này hỗ trợ.</p>
        : children
      }
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl text-white font-sans animate-fade-in-scale-fast">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-cyan-300 tracking-wide">System Status</h2>
          <div className="flex items-center space-x-2">
            <button onClick={fetchSystemData} disabled={isLoading} className="p-1.5 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Refresh Data">
              <RefreshCwIcon className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors">
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-300">Đang tải dữ liệu hệ thống...</div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            <InfoCard icon={<HardDriveIcon />} title="Local Storage">
              {!systemInfo.storage ? (
                 <p className="text-sm text-gray-500 italic">Không thể lấy thông tin lưu trữ.</p>
              ) : (
                <>
                  <div className="w-full bg-slate-700 rounded-full h-2.5 my-1">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" style={{ width: `${((systemInfo.storage.usage / systemInfo.storage.quota) * 100).toFixed(2)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatBytes(systemInfo.storage.usage)} đã dùng</span>
                    <span>Tổng: {formatBytes(systemInfo.storage.quota)}</span>
                  </div>
                </>
              )}
            </InfoCard>

            <InfoCard icon={<CpuIcon />} title="Hardware" notSupported={!systemInfo.cpuCores}>
               <p className="text-sm"><span className="font-semibold text-cyan-300">CPU Logical Cores:</span> {systemInfo.cpuCores || 'N/A'}</p>
            </InfoCard>
            
            <InfoCard icon={<WifiIcon />} title="Network Connection" notSupported={!systemInfo.network}>
              <ul className="text-sm space-y-1">
                <li><span className="font-semibold text-cyan-300">Type:</span> {systemInfo.network?.type || 'N/A'}</li>
                <li><span className="font-semibold text-cyan-300">Effective Speed:</span> {systemInfo.network?.effectiveType || 'N/A'}</li>
                <li><span className="font-semibold text-cyan-300">Downlink:</span> {systemInfo.network?.downlink ? `${systemInfo.network.downlink} Mbps` : 'N/A'}</li>
              </ul>
            </InfoCard>

            <InfoCard icon={<MemoryIcon />} title="JavaScript Heap Memory" notSupported={!systemInfo.memory}>
              <ul className="text-sm space-y-1">
                <li><span className="font-semibold text-cyan-300">Used:</span> {formatBytes(systemInfo.memory?.usedJSHeapSize)}</li>
                <li><span className="font-semibold text-cyan-300">Allocated:</span> {formatBytes(systemInfo.memory?.totalJSHeapSize)}</li>
                <li><span className="font-semibold text-cyan-300">Limit:</span> {formatBytes(systemInfo.memory?.jsHeapSizeLimit)}</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2 italic">*Chỉ số tham khảo cho dev, không phải tổng RAM.</p>
            </InfoCard>
          </div>
        )}
      </div>
    </div>
  );
};
// --- KẾT THÚC PHẦN NÂNG CẤP ---


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
  // --- THÊM MỚI: State và handler cho màn hình System Check ---
  const [isSystemCheckOpen, setIsSystemCheckOpen] = React.useState(false);
  const toggleSystemCheck = () => setIsSystemCheckOpen(p => !p);
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
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.towerIcon} alt="Boss Battle Icon" className="w-full h-full object-contain" />, onClick: toggleBossBattle }, { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop }, { icon: <img src={uiAssets.pvpIcon} alt="PvP Arena Icon" className="w-full h-full object-contain" />, onClick: togglePvpArena } ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
            </div>
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.vocabularyChestIcon} alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest }, { icon: <img src={uiAssets.missionIcon} alt="Equipment Icon" className="w-full h-full object-contain" />, onClick: toggleEquipmentScreen }, { icon: <img src={uiAssets.skillIcon} alt="Skill Icon" className="w-full h-full object-contain" />, onClick: toggleSkillScreen }, ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
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
            <ErrorBoundary>
                {isBossBattleOpen && currentUser && (
                    <BossBattle 
                        userId={currentUser.uid}
                        onClose={toggleBossBattle}
                        onBattleEnd={async (result, rewards) => { if (result === 'win' && currentUser) setCoins(await updateUserCoins(currentUser.uid, rewards.coins)); }}
                        onFloorComplete={handleBossFloorUpdate}
                    />
                )}
            </ErrorBoundary>
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

        {/* --- THÊM MỚI: Overlay cho System Check --- */}
        <div className="fixed inset-0 z-[60]" style={{ display: isSystemCheckOpen ? 'block' : 'none' }}>
            <ErrorBoundary><SystemCheckScreen onClose={toggleSystemCheck} /></ErrorBoundary>
        </div>

        <div className="fixed inset-0 z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
      </SidebarLayout>
      <GameSkeletonLoader show={isLoadingUserData} />
    </div>
  );
}
// --- END OF FILE background-game.tsx ---
