// src/background-game.tsx

import React, { useState, useEffect, useRef, Component } from 'react';
import CharacterCard from './stats/stats-main.tsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './coin-display.tsx';
// <<< THAY ĐỔI 1: THÊM `collection` và `getDocs` >>>
import { getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { GemIcon } from './library/icon.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import GoldMine from './gold-miner.tsx';
import Inventory from './inventory.tsx';
import DungeonCanvasBackground from './DungeonCanvasBackground.tsx'; // Sử dụng background canvas mới
import LuckyChestGame from './lucky-game.tsx';
import Blacksmith from './blacksmith.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import TowerExplorerGame from './leo-thap.tsx';
import Shop from './shop.tsx';
import VocabularyChestScreen from './lat-the.tsx';
// --- Import component Thành Tựu và dữ liệu/type của nó ---
import AchievementsScreen, { VocabularyItem, initialVocabularyData } from './thanh-tuu.tsx';
import AdminPanel from './admin.tsx'; // NEW: Import Admin Panel

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

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div 
        className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"
    ></div>
    <p className="mt-5 text-lg font-medium text-gray-300">
      Loading...
    </p>
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
  // --- Thêm state để lưu dữ liệu thành tựu ---
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[] | null>(null);

  // States for UI and User Data
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(42);
  const [jackpotPool, setJackpotPool] = useState(0);

  // States for managing overlay visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isBlacksmithOpen, setIsBlacksmithOpen] = useState(false);
  const [isTowerGameOpen, setIsTowerGameOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVocabularyChestOpen, setIsVocabularyChestOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false); // NEW: State for Admin Panel

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const db = getFirestore();

  // Set body overflow and app height
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  // <<< THAY ĐỔI 2: VIẾT LẠI HOÀN TOÀN `fetchVocabularyData` ĐỂ ĐỒNG BỘ DỮ LIỆU >>>
  const fetchVocabularyData = async (userId: string) => {
    try {
        // --- BƯỚC 1: LẤY DỮ LIỆU SONG SONG ---
        const completedWordsCol = collection(db, 'users', userId, 'completedWords');
        const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');

        const [completedWordsSnap, achievementDocSnap] = await Promise.all([
            getDocs(completedWordsCol),
            getDoc(achievementDocRef),
        ]);

        // --- BƯỚC 2: XỬ LÝ DỮ LIỆU TỪ `completedWords` ---
        const wordToExpMap = new Map<string, number>();
        completedWordsSnap.forEach(wordDoc => {
            const word = wordDoc.id;
            const gameModes = wordDoc.data().gameModes || {};
            let totalCorrectCount = 0;
            Object.values(gameModes).forEach((mode: any) => {
                totalCorrectCount += mode.correctCount || 0;
            });
            wordToExpMap.set(word, totalCorrectCount * 100); // 1 lần đúng = 100 EXP
        });

        // --- BƯỚC 3: XỬ LÝ DỮ LIỆU TỪ `achievements` (dữ liệu đã lưu) ---
        const existingAchievements = achievementDocSnap.exists() ? achievementDocSnap.data().vocabulary || [] : [];
        const existingAchievementsMap = new Map<string, VocabularyItem>(
            existingAchievements.map((item: VocabularyItem) => [item.word, item])
        );

        // --- BƯỚC 4: TỔNG HỢP VÀ ĐỒNG BỘ DỮ LIỆU ---
        const syncedVocabularyData: VocabularyItem[] = [];
        let idCounter = 1;

        wordToExpMap.forEach((totalExp, word) => {
            const existingData = existingAchievementsMap.get(word);

            if (existingData) {
                // Từ này đã tồn tại, cập nhật EXP và giữ nguyên level đã claim
                syncedVocabularyData.push({
                    ...existingData,
                    exp: totalExp, // Cập nhật EXP mới nhất
                    maxExp: existingData.level * 100, // maxExp cho cấp hiện tại
                });
            } else {
                // Từ này mới, tạo dữ liệu mặc định cho nó
                // Tính level và exp ban đầu cho từ mới
                let level = 1;
                let expForNextLevel = 100;
                let expProgress = totalExp;
                while (expProgress >= expForNextLevel) {
                    expProgress -= expForNextLevel;
                    level++;
                    expForNextLevel = level * 100;
                }
                
                // Lưu ý: Chúng ta không tự động thăng cấp ở đây.
                // Chúng ta chỉ lưu level là 1 và EXP là tổng EXP.
                // Việc thăng cấp sẽ do người dùng chủ động "Claim".
                syncedVocabularyData.push({
                    id: idCounter++, // ID này chỉ dùng cho key của React, không quan trọng
                    word: word,
                    exp: totalExp, // Tổng EXP kiếm được
                    level: 1,      // Bắt đầu từ level 1
                    maxExp: 100,   // Cần 100 EXP để lên level 2
                });
            }
        });
        
        console.log("Vocabulary achievements data synced and processed.");
        setVocabularyData(syncedVocabularyData);

    } catch (error) {
        console.error("Error fetching and syncing vocabulary achievements data:", error);
        // Trong trường hợp lỗi, vẫn set dữ liệu mặc định để app không bị crash
        setVocabularyData(initialVocabularyData);
    }
  };


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
      } else {
        console.log("No user document found, creating default.");
        await setDoc(userDocRef, {
          coins: 0,
          gems: 0,
          createdAt: new Date(),
        });
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
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
            coins: coins, gems: gems, createdAt: new Date()
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
  
  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // --- Gọi cả hai hàm fetch khi có user ---
        fetchUserData(user.uid);
        fetchVocabularyData(user.uid); // <-- THAY ĐỔI 3: GỌI HÀM MỚI
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false); // NEW: Reset state
        setIsBackgroundPaused(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setJackpotPool(0);
        setIsLoadingUserData(false);
        setVocabularyData(null); // <-- THAY ĐỔI 4: Reset dữ liệu thành tựu
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

  const handleTap = () => {
    // This function is now empty as there's no gameplay to start/interact with
  };
  
  // --- THAY ĐỔI 5: Cập nhật điều kiện loading, thêm cả việc chờ dữ liệu thành tựu ---
  const isLoading = isLoadingUserData || !assetsLoaded || vocabularyData === null;

  // Animate coin number changes
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

  // <<-- THAY ĐỔI QUAN TRỌNG Ở ĐÂY -->>
  const renderCharacter = () => {
    const isAnyOverlayOpen = isStatsFullscreen || isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isTowerGameOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

    return (
      <div
        className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20"
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
            setIsShopOpen(false);
            setIsVocabularyChestOpen(false);
            setIsAchievementsOpen(false);
            setIsAdminPanelOpen(false);
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
             setIsShopOpen(false);
             setIsVocabularyChestOpen(false);
             setIsAchievementsOpen(false);
             setIsAdminPanelOpen(false);
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
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
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleShop = () => {
    if (isLoading) return;
    setIsShopOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleVocabularyChest = () => {
    if (isLoading) return;
    setIsVocabularyChestOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
        setIsShopOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleAchievements = () => {
    if (isLoading) return;
    setIsAchievementsOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAdminPanelOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };
  
  // NEW: Toggle function for Admin Panel screen
  const toggleAdminPanel = () => {
    if (isLoading) return;
    
    setIsAdminPanelOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        // Close all other overlays
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsTowerGameOpen(false);
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };


  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  const isAnyOverlayOpen = isStatsFullscreen || isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isTowerGameOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
  const isAdmin = auth.currentUser?.email === 'vanlongt309@gmail.com'; // Check if user is admin

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen}
          onShowRank={toggleRank}
          onShowGoldMine={toggleGoldMine}
          onShowLuckyGame={toggleLuckyGame}
          onShowAchievements={toggleAchievements}
          onShowAdmin={isAdmin ? toggleAdminPanel : undefined} // NEW: Pass handler only if user is admin
      >
        <DungeonCanvasBackground isPaused={isGamePaused} />

        {/* === MAIN LOBBY SCREEN === */}
        <div 
          style={{ 
            display: isAnyOverlayOpen ? 'none' : 'block',
            visibility: isLoading ? 'hidden' : 'visible'
          }} 
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

            {/* Left-side Action Buttons */}
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: <img src={uiAssets.towerIcon} alt="Leo Tháp Icon" className="w-full h-full object-contain" />, onClick: toggleTowerGame },
                { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop },
                { icon: <img src={uiAssets.inventoryIcon} alt="Inventory Icon" className="w-full h-full object-contain" />, onClick: toggleInventory }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}>
                      {item.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Right-side Action Buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000fe00622fb8cc4792a683dcb3.png" alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest },
                { icon: <img src={uiAssets.missionIcon} alt="Mission Icon" className="w-full h-full object-contain" /> },
                { icon: <img src={uiAssets.blacksmithIcon} alt="Blacksmith Icon" className="w-full h-full object-contain" />, onClick: toggleBlacksmith },
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

        {/* === OVERLAY SCREENS === */}
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isStatsFullscreen ? 'block' : 'none' }}>
            <ErrorBoundary>{auth.currentUser && (<CharacterCard onClose={toggleStatsFullscreen} coins={coins} onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}/>)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}>
             <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isGoldMineOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{auth.currentUser && (<GoldMine onClose={toggleGoldMine} currentCoins={coins} onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)} currentUserId={auth.currentUser!.uid} isGamePaused={isAnyOverlayOpen}/>)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isInventoryOpen ? 'block' : 'none' }}>
            <ErrorBoundary><Inventory onClose={toggleInventory} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{auth.currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} currentJackpotPool={jackpotPool} onUpdateJackpotPool={(amount, reset) => updateJackpotPoolInFirestore(amount, reset)} isStatsFullscreen={isStatsFullscreen}/>)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBlacksmithOpen ? 'block' : 'none' }}>
            <ErrorBoundary><Blacksmith onClose={toggleBlacksmith} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isTowerGameOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isTowerGameOpen && <TowerExplorerGame onClose={toggleTowerGame} />}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} />}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isVocabularyChestOpen && (<VocabularyChestScreen onClose={toggleVocabularyChest} currentUserId={currentUser ? currentUser.uid : null} onCoinReward={startCoinCountAnimation} onGemReward={handleGemReward}/>)}</ErrorBoundary>
        </div>
        
        {/* --- CẬP NHẬT RENDER CHO MÀN HÌNH THÀNH TỰU --- */}
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isAchievementsOpen && auth.currentUser && vocabularyData && (
                    <AchievementsScreen 
                        onClose={toggleAchievements} 
                        userId={auth.currentUser.uid}
                        initialData={vocabularyData}
                    />
                )}
            </ErrorBoundary>
        </div>
        
        {/* NEW: Render Admin Panel */}
        <div className="absolute inset-0 w-full h-full z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary>
        </div>
      </SidebarLayout>
      
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
            <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
