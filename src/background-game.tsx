import React, { useState, useEffect, useRef, Component } from 'react';
import CharacterCard from './stats/stats-main.tsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import TreasureChest from './treasure.tsx';
import CoinDisplay from './coin-display.tsx';
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { GemIcon } from './library/icon.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import GoldMine from './gold-miner.tsx';
import Inventory from './inventory.tsx';
import DungeonCanvasBackground from './DungeonCanvasBackground.tsx';
import LuckyChestGame from './lucky-game.tsx';
import Blacksmith from './blacksmith.tsx';
import TowerExplorerGame from './leo-thap.tsx';
import { uiAssets, lottieAssets, allImageUrls } from './game-assets.ts';


// ==================================================================
// HÀM HELPER ĐỂ TẢI TRƯỚC HÌNH ẢNH
// ==================================================================
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
        console.warn(`Failed to preload image, but continuing: ${src}`);
        resolve();
    };
  });
}


// --- SVG Icon Components (Replacement for lucide-react) ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const KeyIcon = () => (
  <img
    src={uiAssets.keyIcon}
    alt="Key Icon"
    className="w-4 h-4 object-contain"
  />
);


// --- NEW: Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          <p>Có lỗi xảy ra khi hiển thị nội dung.</p>
          <p>Chi tiết lỗi: {this.state.error?.message}</p>
          <p>(Kiểm tra Console để biết thêm thêm thông tin)</p>
        </div>
      );
    }

    return this.props.children;
  }
}


interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // States for UI and User Data
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(42);
  const [keyCount, setKeyCount] = useState(0);
  const [jackpotPool, setJackpotPool] = useState(0);

  // States for managing overlay visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isBlacksmithOpen, setIsBlacksmithOpen] = useState(false);
  const [isTowerGameOpen, setIsTowerGameOpen] = useState(false);

  const GROUND_LEVEL_PERCENT = 45;

  const sidebarToggleRef = useRef<(() => void) | null>(null);

  const db = getFirestore();

  // Preload all image assets
  useEffect(() => {
    let isCancelled = false;
    async function preloadAssets() {
      console.log("Preloading ALL game assets...");
      await Promise.all(allImageUrls.map(preloadImage));
      if (!isCancelled) {
        console.log("All game assets preloaded and cached.");
        setImagesLoaded(true);
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, []);

  // Set body overflow to hidden
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

  // Fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    setIsLoadingUserData(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User data fetched:", userData);
        setCoins(userData.coins || 0);
        setDisplayedCoins(userData.coins || 0);
        setGems(userData.gems || 0);
        setKeyCount(userData.keys || 0);
      } else {
        console.log("No user document found, creating default.");
        await setDoc(userDocRef, {
          coins: 0,
          gems: 0,
          keys: 0,
          createdAt: new Date(),
        });
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Fetch global jackpot pool data
  const fetchJackpotPool = async () => {
    try {
        const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
        const jackpotDocSnap = await getDoc(jackpotDocRef);
        if (jackpotDocSnap.exists()) {
            const data = jackpotDocSnap.data();
            setJackpotPool(data.poolAmount || 200);
            console.log("Jackpot Pool fetched:", data.poolAmount);
        } else {
            console.log("No global jackpot pool document found, creating default.");
            await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
            setJackpotPool(200);
        }
    } catch (error) {
        console.error("Error fetching jackpot pool:", error);
    }
  };

  // Update coins in Firestore
  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    if (!userId) {
      console.error("Cannot update coins: User not authenticated.");
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, {
            coins: coins, gems: gems, keys: keyCount, createdAt: new Date()
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + amount;
          const finalCoins = Math.max(0, newCoins);
          transaction.update(userDocRef, { coins: finalCoins });
          console.log(`Coins updated in Firestore for user ${userId}: ${currentCoins} -> ${finalCoins}`);
          setCoins(finalCoins);
        }
      });
    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error);
    }
  };

  // Animate coin counter
   const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30);
      let current = oldCoins;
      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              clearInterval(countInterval);
              if (auth.currentUser) {
                 updateCoinsInFirestore(auth.currentUser.uid, reward);
              }
          } else {
              setDisplayedCoins(current);
          }
      }, 50);
  };

  // Update keys in Firestore
  const updateKeysInFirestore = async (userId: string, amount: number) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
           transaction.set(userDocRef, {
            coins: coins, gems: gems, keys: keyCount, createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          setKeyCount(finalKeys);
        }
      });
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
    }
  };
  
  // Update jackpot pool in Firestore
  const updateJackpotPoolInFirestore = async (amount: number, resetToDefault: boolean = false) => {
      const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
      try {
          await runTransaction(db, async (transaction) => {
              const jackpotDoc = await transaction.get(jackpotDocRef);
              let newJackpotPool;
              if (!jackpotDoc.exists()) {
                  newJackpotPool = resetToDefault ? 200 : 200 + amount;
                  transaction.set(jackpotDocRef, { poolAmount: newJackpotPool, lastUpdated: new Date() });
              } else {
                  let currentPool = jackpotDoc.data().poolAmount || 200;
                  newJackpotPool = resetToDefault ? 200 : currentPool + amount;
                  transaction.update(jackpotDocRef, { poolAmount: newJackpotPool, lastUpdated: new Date() });
              }
              setJackpotPool(newJackpotPool);
          });
      } catch (error) {
          console.error("Firestore Transaction failed for jackpot pool: ", error);
      }
  };

  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
  };

  const handleKeyCollect = (amount: number) => {
      setKeyCount(prev => Math.max(0, prev + amount));
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      }
  };
  
  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
        fetchJackpotPool();
      } else {
        // Reset all states on logout
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
        setIsBackgroundPaused(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setJackpotPool(0);
        setIsLoadingUserData(false);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  // Pause animations when tab is not visible
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              setIsBackgroundPaused(true);
          } else {
              setIsBackgroundPaused(false);
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTap = () => {};
  
  const isLoading = isLoadingUserData || !imagesLoaded;

  useEffect(() => {
    if (displayedCoins === coins) return;
    if (Math.abs(coins - displayedCoins) > 10) {
        setDisplayedCoins(coins);
        return;
    }
    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      coinElement.addEventListener('animationend', animationEndHandler);
      return () => {
        if (coinElement) {
            coinElement.removeEventListener('animationend', animationEndHandler);
             coinElement.classList.remove('number-changing');
        }
      };
    }
     return () => {};
  }, [displayedCoins, coins]);

  const renderCharacter = () => {
    const isAnyOverlayOpen = isStatsFullscreen || isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isTowerGameOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

    return (
      <div
        className="character-container absolute w-24 h-24"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`,
        }}
      >
        <DotLottieReact
          src={lottieAssets.characterRun}
          loop
          autoplay={!isPaused}
          className="w-full h-full"
        />
      </div>
    );
  };

  const toggleStatsFullscreen = () => {
    if (isLoading) return;
    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) {
            hideNavBar();
            setIsRankOpen(false);
            setIsGoldMineOpen(false);
            setIsInventoryOpen(false);
            setIsLuckyGameOpen(false);
            setIsBlacksmithOpen(false);
            setIsTowerGameOpen(false);
        } else {
            showNavBar();
        }
        return newState;
    });
  };

  const toggleRank = () => {
     if (isLoading) return;
     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar();
             setIsStatsFullscreen(false);
             setIsGoldMineOpen(false);
             setIsInventoryOpen(false);
             setIsLuckyGameOpen(false);
             setIsBlacksmithOpen(false);
             setIsTowerGameOpen(false);
         } else {
             showNavBar();
         }
         return newState;
         });
  };

  const toggleGoldMine = () => {
    if (isLoading) return;
    setIsGoldMineOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleInventory = () => {
    if (isLoading) return;
    setIsInventoryOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleLuckyGame = () => {
    if (isLoading) return;
    setIsLuckyGameOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleBlacksmith = () => {
    if (isLoading) return;
    setIsBlacksmithOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsTowerGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };
  
  const toggleTowerGame = () => {
    if (isLoading) return;
    setIsTowerGameOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-950 text-white">
        <div className="text-lg font-semibold">Đang tải...</div>
        <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
            <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: isLoadingUserData ? (imagesLoaded ? '50%' : '10%') : '100%' }}>
            </div>
        </div>
        <p className="mt-2 text-sm text-gray-400">
            {isLoadingUserData ? "Đang tải dữ liệu người dùng..." : "Đang chuẩn bị tài nguyên..."}
        </p>
      </div>
    );
  }

  const isAnyOverlayOpen = isStatsFullscreen || isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isTowerGameOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950">
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen}
          onShowRank={toggleRank}
          onShowGoldMine={toggleGoldMine}
          onShowLuckyGame={toggleLuckyGame}
          onShowTowerGame={toggleTowerGame} // <<<< SỬA Ở ĐÂY: Thêm prop này
      >
        <DungeonCanvasBackground isPaused={isGamePaused} />

        {/* === MAIN LOBBY SCREEN === */}
        <div 
          style={{ display: isAnyOverlayOpen ? 'none' : 'block' }} 
          className="w-full h-full"
        >
          <div
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`}
            onClick={handleTap}
          >
            {renderCharacter()}

            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden
                        rounded-b-lg shadow-2xl
                        bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                        border-b border-l border-r border-slate-700/50">

                <HeaderBackground />

                <button
                    onClick={() => sidebarToggleRef.current?.()}
                    className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20"
                    aria-label="Mở sidebar"
                    title="Mở sidebar"
                >
                     <img
                        src={uiAssets.menuIcon}
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain"
                     />
                </button>

                <div className="flex-1"></div>

                <div className="flex items-center space-x-1 currency-display-container relative z-10">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()}
                        </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={isStatsFullscreen} />
                </div>
            </div>

            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                {
                  icon: <img src={uiAssets.towerIcon} alt="Tháp" className="w-full h-full object-contain" />,
                  label: "Tháp",
                  special: true,
                  centered: true,
                  onClick: toggleTowerGame
                },
                {
                  icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />,
                  label: "",
                  special: true,
                  centered: true
                },
                {
                  icon: <img src={uiAssets.inventoryIcon} alt="Inventory Icon" className="w-full h-full object-contain" />,
                  label: "",
                  special: true,
                  centered: true,
                  onClick: toggleInventory
                }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div
                      className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                      onClick={item.onClick}
                      title={item.label}
                  >
                      {item.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                {
                  icon: <img src={uiAssets.missionIcon} alt="Mission Icon" className="w-full h-full object-contain" />,
                  label: "",
                  special: true,
                  centered: true
                },
                {
                  icon: <img src={uiAssets.blacksmithIcon} alt="Blacksmith Icon" className="w-full h-full object-contain" />,
                  label: "",
                  special: true,
                  centered: true,
                  onClick: toggleBlacksmith
                },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                    <div
                        className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                        onClick={item.onClick}
                    >
                        {item.icon}
                    </div>
                </div>
              ))}
            </div>

            <TreasureChest
              initialChests={3}
              keyCount={keyCount}
              onKeyCollect={(n) => {
                if (auth.currentUser) {
                  updateKeysInFirestore(auth.currentUser!.uid, -n);
                }
              }}
              onCoinReward={startCoinCountAnimation}
              onGemReward={handleGemReward}
              isGamePaused={isGamePaused}
              currentUserId={currentUser ? currentUser.uid : null}
            />
          </div>
        </div>

        {/* === OVERLAY SCREENS === */}
        <div className="absolute inset-0 w-full h-full" style={{ display: isStatsFullscreen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
                {auth.currentUser && (
                    <CharacterCard
                        onClose={toggleStatsFullscreen}
                        coins={coins}
                        onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                    />
                )}
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: isRankOpen ? 'block' : 'none' }}>
             <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng xếp hạng!</div>}>
                 <EnhancedLeaderboard onClose={toggleRank} />
             </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: isGoldMineOpen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị mỏ vàng!</div>}>
                {auth.currentUser && (
                    <GoldMine
                        onClose={toggleGoldMine}
                        currentCoins={coins}
                        onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                        onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)}
                        currentUserId={auth.currentUser!.uid}
                        isGamePaused={isAnyOverlayOpen}
                    />
                )}
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: isInventoryOpen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị túi đồ!</div>}>
                <Inventory onClose={toggleInventory} />
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị Lucky Game!</div>}>
                {auth.currentUser && (
                    <LuckyChestGame
                        onClose={toggleLuckyGame}
                        currentCoins={coins}
                        onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                        currentJackpotPool={jackpotPool}
                        onUpdateJackpotPool={(amount, reset) => updateJackpotPoolInFirestore(amount, reset)}
                        isStatsFullscreen={isStatsFullscreen}
                    />
                )}
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: isBlacksmithOpen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị lò rèn!</div>}>
                <Blacksmith onClose={toggleBlacksmith} />
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-40" style={{ display: isTowerGameOpen ? 'block' : 'none' }}>
            <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị Tháp Thử Thách!</div>}>
                <TowerExplorerGame onClose={toggleTowerGame} />
            </ErrorBoundary>
        </div>

      </SidebarLayout>
    </div>
  );
}
