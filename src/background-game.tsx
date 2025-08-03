// --- START OF FILE background-game.tsx (Đã sửa đổi hoàn chỉnh) ---

import React, { useState, useEffect, useRef, Component } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './coin-display.tsx';
import { useGameData } from './contexts/GameDataProvider.tsx'; // <- IMPORT QUAN TRỌNG
import HeaderBackground from './header-background.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import Inventory from './inventory.tsx';
import DungeonCanvasBackground from './background-canvas.tsx';
import LuckyChestGame from './lucky-game.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import BossBattle from './boss.tsx';
import Shop from './shop.tsx';
import VocabularyChestScreen from './lat-the.tsx';
import MinerChallenge from './bomb.tsx';
import UpgradeStatsScreen, { calculateTotalStatValue, statConfig } from './upgrade-stats.tsx';
import AchievementsScreen, { VocabularyItem } from './thanh-tuu.tsx';
import AdminPanel from './admin.tsx';
import BaseBuildingScreen from './building.tsx';
import SkillScreen from './skill.tsx';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './skill-data.tsx';
import EquipmentScreen, { OwnedItem, EquippedItems } from './equipment.tsx';
import RateLimitToast from './thong-bao.tsx';

// --- Các component nhỏ như XIcon, GemIcon, StatsIcon, ErrorBoundary, LoadingSpinner giữ nguyên ---
// (Code của các component này nên được đặt ở đây hoặc import từ file khác)

const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}>
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
interface GemIconProps { size?: number; color?: string; className?: string; [key: string]: any; }
const GemIcon: React.FC<GemIconProps> = ({ size = 24, className = '', ...props }) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
        <img src={uiAssets.gemIcon} alt="Gem Icon" className="w-full h-full object-contain" />
    </div>
);
interface StatsIconProps { onClick: () => void; }
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => (
    <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10" onClick={onClick} title="Xem chỉ số">
        <img src={uiAssets.statsIcon} alt="Stats Icon" className="w-full h-full object-contain" />
    </div>
);
class ErrorBoundary extends Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean, error: Error | null}> {
    constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div><p>Error: {this.state.error?.message}</p></div>;
        }
        return this.props.children;
    }
}
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"></div>
        <p className="mt-5 text-lg font-medium text-gray-300">Loading...</p>
    </div>
);
// --- Kết thúc các component nhỏ ---


interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  assetsLoaded: boolean;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, assetsLoaded }: ObstacleRunnerGameProps) {
    
    // --- LẤY TOÀN BỘ DATA TỪ CONTEXT ---
    const gameData = useGameData();
    const { 
      isLoading, currentUser, isSyncingData, coins, gems, masteryCards, pickaxes,
      userStats, jackpotPool, bossBattleHighestFloor, ancientBooks, ownedSkills, 
      equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, 
      equippedItems, vocabularyData, minerChallengeHighestFloor,
      // Lấy các hàm cập nhật
      updateCoinsInFirestore, updateGemsInFirestore, updateJackpotPoolInFirestore,
      handleMinerChallengeEnd, handleBossFloorUpdate, handleConfirmStatUpgrade,
      handleSkillsUpdate, handleInventoryUpdate, handleShopPurchase, 
      handleRewardClaim, updatePickaxes, updateTotalVocabCollected
    } = gameData;
    
    // --- State Cục bộ cho UI ---
    const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
    const [displayedCoins, setDisplayedCoins] = useState(0);
    const [showRateLimitToast, setShowRateLimitToast] = useState(false);
    const [isRankOpen, setIsRankOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
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

    const sidebarToggleRef = useRef<(() => void) | null>(null);
    const isAdmin = currentUser?.email === 'vanlongt309@gmail.com';

    // Set body overflow and app height
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

    // Effect to hide the "too fast" toast after a delay
    useEffect(() => {
        if (showRateLimitToast) {
            const timer = setTimeout(() => setShowRateLimitToast(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [showRateLimitToast]);
    
    // Effect to smoothly update displayed coins
    useEffect(() => {
        if (displayedCoins === coins) return;
        const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100);
        return () => clearTimeout(timeoutId);
    }, [coins]);

    // Effect for window visibility
    useEffect(() => {
        const handleVisibilityChange = () => setIsBackgroundPaused(document.hidden);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const isAnyOverlayOpen = isRankOpen || isInventoryOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
    const isGameLoading = isLoading || !assetsLoaded;
    const isGamePaused = isAnyOverlayOpen || isGameLoading || isBackgroundPaused;

    const renderCharacter = () => (
      <div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20">
        <DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isGamePaused} className="w-full h-full" />
      </div>
    );

    const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return () => {
          if (isGameLoading) return;
          if (isSyncingData) {
              setShowRateLimitToast(true);
              return;
          }
          setter(prev => {
              const newState = !prev;
              if (newState) {
                  hideNavBar();
                  [ setIsRankOpen, setIsInventoryOpen, setIsLuckyGameOpen, 
                    setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen,
                    setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen
                  ].forEach(s => { if (s !== setter) s(false); });
              } else { showNavBar(); }
              return newState;
          });
      };
    };

    const toggleRank = createToggleFunction(setIsRankOpen);
    const toggleInventory = createToggleFunction(setIsInventoryOpen);
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

    const getPlayerBattleStats = () => {
        const bonusHp = calculateTotalStatValue(userStats.hp, statConfig.hp.baseUpgradeBonus);
        const bonusAtk = calculateTotalStatValue(userStats.atk, statConfig.atk.baseUpgradeBonus);
        const bonusDef = calculateTotalStatValue(userStats.def, statConfig.def.baseUpgradeBonus);
        return { maxHp: bonusHp, hp: bonusHp, atk: bonusAtk, def: bonusDef, maxEnergy: 50, energy: 50 };
    };

    const getEquippedSkillsDetails = () => {
        if (!ownedSkills || !equippedSkillIds) return [];
        return equippedSkillIds
            .map(ownedId => {
                if (!ownedId) return null;
                const owned = ownedSkills.find(s => s.id === ownedId);
                if (!owned) return null;
                const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId);
                if (!blueprint) return null;
                return { ...owned, ...blueprint };
            })
            .filter(Boolean) as (OwnedSkill & SkillBlueprint)[];
    };

    return (
        <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
            <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowRank={toggleRank}
                onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge}
                onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen}
                onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}
            >
                <DungeonCanvasBackground isPaused={isGamePaused} />
                <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isGameLoading ? 'hidden' : 'visible' }} className="w-full h-full">
                    <div className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`}>
                        {renderCharacter()}
                        <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-b border-l border-r border-slate-700/50">
                            <HeaderBackground />
                            <button onClick={() => sidebarToggleRef.current?.()} className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20" aria-label="Mở sidebar" title="Mở sidebar">
                                <img src={uiAssets.menuIcon} alt="Menu Icon" className="w-5 h-5 object-contain" />
                            </button>
                            <div className="flex-1"></div>
                            <div className="flex items-center space-x-1 currency-display-container relative z-10">
                                {/* Gem Display */}
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                                    <div className="relative mr-0.5 flex items-center justify-center"><GemIcon size={16} className="relative z-20" /></div>
                                    <div className="font-bold text-purple-200 text-xs tracking-wide">{gems.toLocaleString()}</div>
                                    <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                                </div>
                                <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                            </div>
                        </div>
                        <RateLimitToast show={showRateLimitToast} />
                        {/* Left Action Buttons */}
                        <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                            <div className="group cursor-pointer" onClick={toggleBossBattle}><div className="w-14 h-14 p-1.5"><img src={uiAssets.towerIcon} alt="Boss Battle" /></div></div>
                            <div className="group cursor-pointer" onClick={toggleShop}><div className="w-14 h-14 p-1.5"><img src={uiAssets.shopIcon} alt="Shop" /></div></div>
                            <div className="group cursor-pointer" onClick={toggleInventory}><div className="w-14 h-14 p-1.5"><img src={uiAssets.inventoryIcon} alt="Inventory" /></div></div>
                        </div>
                        {/* Right Action Buttons */}
                        <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
                            <div className="group cursor-pointer" onClick={toggleVocabularyChest}><div className="w-14 h-14 p-1.5"><img src={uiAssets.vocabularyChestIcon} alt="Vocab Chest" /></div></div>
                            <div className="group cursor-pointer" onClick={toggleEquipmentScreen}><div className="w-14 h-14 p-1.5"><img src={uiAssets.missionIcon} alt="Equipment" /></div></div>
                            <div className="group cursor-pointer" onClick={toggleSkillScreen}><div className="w-14 h-14 p-1.5"><img src={uiAssets.skillIcon} alt="Skills" /></div></div>
                        </div>
                    </div>
                </div>

                {/* --- Overlays / Modals --- */}
                <div className="absolute inset-0 z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary> </div>
                <div className="absolute inset-0 z-[60]" style={{ display: isInventoryOpen ? 'block' : 'none' }}> <ErrorBoundary><Inventory onClose={toggleInventory} /></ErrorBoundary> </div>
                <div className="absolute inset-0 z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> <ErrorBoundary>{currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={updateCoinsInFirestore} onUpdatePickaxes={updatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={updateJackpotPoolInFirestore} />)}</ErrorBoundary> </div>
                <div className="absolute inset-0 z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}><ErrorBoundary>{isMinerChallengeOpen && (<MinerChallenge onClose={toggleMinerChallenge} initialDisplayedCoins={displayedCoins} masteryCards={masteryCards} initialPickaxes={pickaxes} initialHighestFloor={minerChallengeHighestFloor} onGameEnd={handleMinerChallengeEnd} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}><ErrorBoundary>{isBossBattleOpen && (<BossBattle onClose={toggleBossBattle} playerInitialStats={getPlayerBattleStats()} onBattleEnd={(result, rewards) => { if (result === 'win') updateCoinsInFirestore(rewards.coins); }} initialFloor={bossBattleHighestFloor} onFloorComplete={handleBossFloorUpdate} equippedSkills={getEquippedSkillsDetails()} displayedCoins={displayedCoins} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} onPurchase={handleShopPurchase} currentUser={currentUser} />}</ErrorBoundary> </div>
                <div className="absolute inset-0 z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}><ErrorBoundary>{isVocabularyChestOpen && currentUser && (<VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser.uid} onUpdateCoins={updateCoinsInFirestore} onUpdateGems={updateGemsInFirestore} onGemReward={updateGemsInFirestore} displayedCoins={displayedCoins} gems={gems} totalVocabCollected={totalVocabCollected} cardCapacity={cardCapacity} onVocabUpdate={updateTotalVocabCollected} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}><ErrorBoundary>{isAchievementsOpen && currentUser && Array.isArray(vocabularyData) && (<AchievementsScreen onClose={toggleAchievements} userId={currentUser.uid} initialData={vocabularyData} onClaimReward={handleRewardClaim} masteryCardsCount={masteryCards} displayedCoins={displayedCoins} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isUpgradeScreenOpen ? 'block' : 'none' }}><ErrorBoundary>{isUpgradeScreenOpen && (<UpgradeStatsScreen onClose={toggleUpgradeScreen} initialGold={coins} initialStats={userStats} onConfirmUpgrade={handleConfirmStatUpgrade} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}><ErrorBoundary>{isBaseBuildingOpen && currentUser && (<BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={updateCoinsInFirestore} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}><ErrorBoundary>{isSkillScreenOpen && (<SkillScreen onClose={toggleSkillScreen} gold={coins} ancientBooks={ancientBooks} ownedSkills={ownedSkills} equippedSkillIds={equippedSkillIds} onSkillsUpdate={handleSkillsUpdate} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}><ErrorBoundary>{isEquipmentOpen && (<EquipmentScreen onClose={toggleEquipmentScreen} gold={coins} equipmentPieces={equipmentPieces} ownedItems={ownedItems} equippedItems={equippedItems} onInventoryUpdate={handleInventoryUpdate} />)}</ErrorBoundary></div>
                <div className="absolute inset-0 z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
            </SidebarLayout>

            {isGameLoading && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
}

// --- END OF FILE background-game.tsx ---
