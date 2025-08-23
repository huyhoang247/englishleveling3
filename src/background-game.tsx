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
import EquipmentScreen from './equipment.tsx';
import RateLimitToast from './thong-bao.tsx';
import GameSkeletonLoader from './GameSkeletonLoader.tsx'; 
import { useGame } from './GameContext.tsx';
import { updateUserCoins } from './gameDataService.ts';

// --- SVG Icon Components ---
// ... (code không đổi)

// --- Error Boundary Component ---
// ... (code không đổi)

interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar }: ObstacleRunnerGameProps) {
  
  const {
    // Data states
    isLoadingUserData, coins, displayedCoins, gems, masteryCards, pickaxes,
    minerChallengeHighestFloor, bossBattleHighestFloor, jackpotPool,
    equipmentPieces, ownedItems, equippedItems,
    // UI states
    isAnyOverlayOpen, isGamePaused, showRateLimitToast,
    isRankOpen, isPvpArenaOpen, isLuckyGameOpen, isMinerChallengeOpen,
    isBossBattleOpen, isShopOpen, isVocabularyChestOpen, isAchievementsOpen,
    isAdminPanelOpen, isUpgradeScreenOpen, isBaseBuildingOpen, isSkillScreenOpen, isEquipmentOpen,
    // Functions
    refreshUserData, handleBossFloorUpdate, handleMinerChallengeEnd, handleUpdatePickaxes,
    handleUpdateJackpotPool, handleShopPurchase, getPlayerBattleStats,
    getEquippedSkillsDetails, handleStateUpdateFromChest, handleAchievementsDataUpdate,
    handleSkillScreenClose, setCoins,
    // Toggles
    toggleRank, togglePvpArena, toggleLuckyGame, toggleMinerChallenge,
    toggleBossBattle, toggleShop, toggleVocabularyChest, toggleAchievements,
    toggleAdminPanel, toggleUpgradeScreen, toggleSkillScreen, toggleEquipmentScreen, toggleBaseBuilding,
  } = useGame();

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === 'vanlongt309@gmail.com';

  useEffect(() => {
    // ... (code không đổi)
  }, []);

  const handleTap = () => { };
  const renderCharacter = () => { /* ... */ };
  const handleSetToggleSidebar = (toggleFn: () => void) => { /* ... */ };

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowRank={toggleRank} onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge} onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen} onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}>
        <DungeonCanvasBackground isPaused={isGamePaused} />
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoadingUserData ? 'hidden' : 'visible' }} className="w-full h-full">
            {/* ... (main game UI không đổi) ... */}
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
            <ErrorBoundary>
                {isUpgradeScreenOpen && currentUser && (<UpgradeStatsScreen onClose={toggleUpgradeScreen} />)}
            </ErrorBoundary>
        </div>
        <div className="fixed inset-0 z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isBaseBuildingOpen && currentUser && (<BaseBuildingScreen onClose={toggleBaseBuilding} coins={coins} gems={gems} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser!.uid, amount))} />)}</ErrorBoundary>
        </div>
        
        {/* --- THAY ĐỔI TẠI ĐÂY --- */}
        <div className="fixed inset-0 z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isSkillScreenOpen && <SkillScreen onClose={handleSkillScreenClose} />}</ErrorBoundary>
        </div>
        
        <div className="fixed inset-0 z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isEquipmentOpen && currentUser && (
                    <EquipmentScreen 
                        onClose={toggleEquipmentScreen} 
                        userId={currentUser.uid}
                        initialGold={coins} 
                        initialEquipmentPieces={equipmentPieces} 
                        initialOwnedItems={ownedItems} 
                        initialEquippedItems={equippedItems} 
                        onDataChange={refreshUserData}
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
