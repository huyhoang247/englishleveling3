// --- START OF FILE background-game.tsx (19).txt ---

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
import DungeonBackground from './background-dungeon.tsx';
import LuckyChestGame from './lucky-game.tsx';
import Blacksmith from './blacksmith.tsx'; // Import the Blacksmith component


// ==================================================================
// GIẢI PHÁP TẢI TRƯỚC: BƯỚC 1 - ĐỊNH NGHĨA TÀI NGUYÊN TẬP TRUNG
// ==================================================================
const imageAssets = {
  keyIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png",
  menuIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png",
  shopIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png",
  inventoryIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png",
  missionIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png",
  blacksmithIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png",
  // Đã xoá các tài sản hình ảnh đám mây
};

const lottieAssets = {
    characterRun: "https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie",
};

const allImageUrls = Object.values(imageAssets);


// ==================================================================
// GIẢI PHÁP TẢI TRƯỚC: BƯỚC 2 - HÀM HELPER ĐỂ TẢI TRƯỚC HÌNH ẢNH
// ==================================================================
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
        console.warn(`Failed to preload image, but continuing: ${src}`);
        resolve(); // Vẫn resolve để game không bị kẹt nếu một ảnh bị lỗi
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
    src={imageAssets.keyIcon} // THAY THẾ URL
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


// Define interface for component props
interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null; // Added currentUser prop
}

// Đã xoá interface GameCloud

// Define interface for session storage data (used by the hook internally now)
// We define it here as well for clarity on what's being saved/loaded
interface GameSessionData {
    health: number;
    characterPos: number;
    // Add other temporary game state you want to save
}


// Update component signature to accept className, hideNavBar, showNavBar, and currentUser props
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {

  // ==================================================================
  // GIẢI PHÁP TẢI TRƯỚC: BƯỚC 3 - TÍCH HỢP LOGIC TẢI TRƯỚC VÀO COMPONENT
  // ==================================================================
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    async function preloadAssets() {
      console.log("Preloading game assets...");
      await Promise.all(allImageUrls.map(preloadImage));
      if (!isCancelled) {
        console.log("All game assets preloaded and cached.");
        setImagesLoaded(true);
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, []); // Mảng rỗng đảm bảo chỉ chạy một lần duy nhất

  // --- Global Overflow Control ---
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


  // Game states - Now using useSessionStorage for states that should persist in session
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH); // Use hook for health
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0); // Use hook for char position

  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runFrame, setRunFrame] = useState(0);
  // Đã xoá state [clouds, setClouds]
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false);
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);


  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);


  // --- Coin and Gem States (Persisted in Firestore) ---
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(42);
  const [keyCount, setKeyCount] = useState(0);
  const [jackpotPool, setJackpotPool] = useState(0);


  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isBlacksmithOpen, setIsBlacksmithOpen] = useState(false);


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null);
  // Đã xoá gameLoopIntervalRef
  const sidebarToggleRef = useRef<(() => void) | null>(null);

  // NEW: Firestore instance
  const db = getFirestore();

  // Đã xoá mảng cloudImageUrls

  // NEW: Helper function to generate random number between min and max (inclusive)
  function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // --- NEW: Function to fetch user data from Firestore ---
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

  // --- NEW: Function to fetch global jackpotPool from Firestore ---
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

  // --- NEW: Function to update user's coin count in Firestore using a transaction ---
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

   // Coin count animation function
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

  // --- NEW: Function to update user's key count in Firestore using a transaction ---
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

  // --- NEW: Function to update the GLOBAL jackpot pool in Firestore using a transaction ---
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

  // NEW: Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      // TODO: Implement Firestore update for gems
  };

  // NEW: Function to handle key collection
  const handleKeyCollect = (amount: number) => {
      setKeyCount(prev => Math.max(0, prev + amount));
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      }
  };

  // Function to start a NEW game
  const startNewGame = () => {
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsBackgroundPaused(false);
    setIsGoldMineOpen(false);
    setIsInventoryOpen(false);
    setIsLuckyGameOpen(false);
    setIsBlacksmithOpen(false);
    // Đã xoá lời gọi generateInitialClouds
  };

  // Effect to fetch user data and global jackpot pool
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
        fetchJackpotPool();
        setGameStarted(true);
        setIsRunning(true);
      } else {
        setGameStarted(false);
        setGameOver(false);
        setHealth(MAX_HEALTH);
        setCharacterPos(0);
        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBackgroundPaused(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setJackpotPool(0);
        setIsLoadingUserData(false);
        sessionStorage.removeItem('gameHealth');
        sessionStorage.removeItem('gameCharacterPos');
        if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  // Effect to handle game over
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
    };
  }, [health, gameStarted]);

  // Effect to handle tab visibility changes
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

  // Đã xoá hàm generateInitialClouds

  // Handle character jump action
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) {
      setCharacterPos(80);
      setJumping(true);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) {
          setCharacterPos(0);
          setTimeout(() => setJumping(false), 100);
        } else {
             setCharacterPos(0);
             setJumping(false);
        }
      }, 600);
    }
  };
  
  // ==================================================================
  // GIẢI PHÁP TẢI TRƯỚC: BƯỚC 4 - TẠO TRẠNG THÁI LOADING TỔNG HỢP
  // ==================================================================
  const isLoading = isLoadingUserData || !imagesLoaded;

  // Handle tap/click on the game area
  const handleTap = () => {
    if (isStatsFullscreen || isLoading || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen) return;
    if (!gameStarted || gameOver) {
      startNewGame();
    }
  };

  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => setShowHealthDamageEffect(false), 300);
  };

  // Trigger character damage effect and floating number
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);
      setTimeout(() => setShowDamageNumber(false), 800);
  };

  // Đã xoá useEffect của vòng lặp game (game loop for movement)

  // Effect to manage scheduling timers
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoading || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen) {
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoading && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) {
      }
      return () => {};
  }, [gameStarted, gameOver, isStatsFullscreen, isLoading, isRankOpen, isBackgroundPaused, isGoldMineOpen, isInventoryOpen, isLuckyGameOpen, isBlacksmithOpen]);


  // Effect to clean up all timers on unmount
  useEffect(() => {
    return () => {
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
    };
  }, []);

    // Effect for coin counter animation
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


  const healthPct = health / MAX_HEALTH;
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out"
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%',
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <DotLottieReact
          src={lottieAssets.characterRun} // THAY THẾ URL
          loop
          autoplay={!isStatsFullscreen && !isLoading && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen}
          className="w-full h-full"
        />
      </div>
    );
  };

  // Đã xoá hàm renderClouds

  const toggleStatsFullscreen = () => {
    if (gameOver || isLoading) return;
    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) {
            hideNavBar();
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

  const toggleRank = () => {
     if (gameOver || isLoading) return;
     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar();
             setIsStatsFullscreen(false);
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

  const toggleGoldMine = () => {
    if (gameOver || isLoading) return;
    setIsGoldMineOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleInventory = () => {
    if (gameOver || isLoading) return;
    setIsInventoryOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleLuckyGame = () => {
    if (gameOver || isLoading) return;
    setIsLuckyGameOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsBlacksmithOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleBlacksmith = () => {
    if (gameOver || isLoading) return;
    setIsBlacksmithOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  // Show loading indicator if assets or user data are being fetched
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

  // Determine which content to render
  let mainContent;
  if (isStatsFullscreen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
              {auth.currentUser && (
                  <CharacterCard
                      onClose={toggleStatsFullscreen}
                      coins={coins}
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isRankOpen) {
       mainContent = (
           <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng xếp hạng!</div>}>
               <EnhancedLeaderboard onClose={toggleRank} />
           </ErrorBoundary>
       );
  } else if (isGoldMineOpen) {
      const isGoldMineGamePaused = gameOver || !gameStarted || isLoading || isStatsFullscreen || isRankOpen || isBackgroundPaused || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen;
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị mỏ vàng!</div>}>
              {auth.currentUser && (
                  <GoldMine
                      onClose={toggleGoldMine}
                      currentCoins={coins}
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                      onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)}
                      currentUserId={auth.currentUser!.uid}
                      isGamePaused={isGoldMineGamePaused}
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isInventoryOpen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị túi đồ!</div>}>
              <Inventory onClose={toggleInventory} />
          </ErrorBoundary>
      );
  } else if (isLuckyGameOpen) {
      mainContent = (
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
      );
  } else if (isBlacksmithOpen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị lò rèn!</div>}>
              <Blacksmith onClose={toggleBlacksmith} />
          </ErrorBoundary>
      );
  }
  else {
      // Default game content
      mainContent = (
          <div
            ref={gameRef}
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer bg-neutral-800`}
            onClick={handleTap}
          >
            <DungeonBackground />
            {/* Đã xoá lời gọi renderClouds() */}
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
                        src={imageAssets.menuIcon} // THAY THẾ URL
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Menu";
                        }}
                     />
                </button>


                <div className="flex items-center relative z-10">
                  <div className="w-32 relative">
                      <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                          <div className="h-full overflow-hidden">
                              <div
                                  className={`${getColor()} h-full transform origin-left`}
                                  style={{ transform: `scaleX(${healthPct})`, transition: 'transform 0.5s ease-out' }}
                              >
                                  <div className="w-full h-1/2 bg-white bg-opacity-20" />
                              </div>
                          </div>
                          <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                              style={{ animation: 'pulse 3s infinite' }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                  {Math.round(health)}/{MAX_HEALTH}
                              </span>
                          </div>
                      </div>
                      <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                          {showDamageNumber && (
                              <div
                                  className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs"
                                  style={{ animation: 'floatUp 0.8s ease-out forwards' }}
                              >
                                  -{damageAmount}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
               {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) && (
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
               )}
            </div>

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
                <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
                <button
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                  onClick={startNewGame}
                >
                  Chơi Lại
                </button>
              </div>
            )}

            {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) && (
              <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  {
                    icon: (
                      <img
                        src={imageAssets.shopIcon} // THAY THẾ URL
                        alt="Shop Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Shop";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <img
                        src={imageAssets.inventoryIcon} // THAY THẾ URL
                        alt="Inventory Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Inv";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true,
                    onClick: toggleInventory
                  }
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick}
                        >
                            {item.icon}
                            {item.label && (
                                <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                            )}
                        </div>
                    ) : (
                      <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                        {item.icon}
                        <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

             {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen && !isBlacksmithOpen) && (
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  {
                    icon: (
                      <img
                        src={imageAssets.missionIcon} // THAY THẾ URL
                        alt="Mission Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Mission";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <img
                        src={imageAssets.blacksmithIcon} // THAY THẾ URL
                        alt="Blacksmith Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Blacksmith";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true,
                    onClick: toggleBlacksmith
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick}
                        >
                            {item.icon}
                            {item.label && (
                                <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                            )}
                        </div>
                    ) : (
                      <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                        {item.icon}
                        <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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
              isGamePaused={gameOver || !gameStarted || isLoading || isStatsFullscreen || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen}
              isStatsFullscreen={isStatsFullscreen}
              currentUserId={currentUser ? currentUser.uid : null}
            />
          </div>
      );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950">
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen}
          onShowRank={toggleRank}
          onShowGoldMine={toggleGoldMine}
          onShowLuckyGame={toggleLuckyGame}
      >
        {mainContent}
      </SidebarLayout>
    </div>
  );
}
