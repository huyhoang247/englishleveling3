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
// Import the new GemIcon component. Removed MenuIcon and StatsIcon import.
import { GemIcon } from './library/icon.tsx';

// NEW: Import SidebarLayout and EnhancedLeaderboard
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import GoldMine from './gold-miner.tsx'; // NEW: Import GoldMine component
import Inventory from './inventory.tsx'; // NEW: Import Inventory component

// NEW: Import DungeonBackground from its new file
import DungeonBackground from './dungeon-background.tsx';


// --- SVG Icon Components (Replacement for lucide-react) ---
// Keeping these here for now, but ideally should be in library/icon.tsx
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
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
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

// --- NEW: Define interface for Cloud with image source ---
interface GameCloud {
  id: number;
  x: number; // Horizontal position in %
  y: number; // Vertical position in %
  size: number; // Size of the cloud (in pixels)
  speed: number; // Speed of the cloud
  imgSrc: string; // Source URL for the cloud image
}

// Define interface for session storage data (used by the hook internally now)
// We define it here as well for clarity on what's being saved/loaded
interface GameSessionData {
    health: number;
    characterPos: number;
    // Add other temporary game state you want to save
}


// Update component signature to accept className, hideNavBar, showNavBar, and currentUser props
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {

  // --- Global Overflow Control ---
  // CHÈN BƯỚC 1 VÀO ĐÂY: useEffect cho global overflow
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore original overflow styles
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  // Game states - Now using useSessionStorage for states that should persist in session
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH); // Use hook for health
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0); // Use hook for char position

  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false); // Tracks if the game has started
  const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect
  // NEW: State to track if the game is paused due to being in the background
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);


  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number


  // --- Coin and Gem States (Persisted in Firestore) ---
  const [coins, setCoins] = useState(0); // Initialize with 0, will load from Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Coins displayed with animation

  const [gems, setGems] = useState(42); // Player's gem count, initialized

  // NEW: Key state and ref for key drop interval
  const [keyCount, setKeyCount] = useState(0); // Player's key count


  // UI States
  // Keep isStatsFullscreen here, it controls the CharacterCard visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false); // Trạng thái kiểm soát hiển thị bảng thống kê/xếp hạng
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // NEW: State to track user data loading
  // NEW: State to track if the Rank component is open
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false); // NEW: State to track if Gold Mine is open
  const [isInventoryOpen, setIsInventoryOpen] = useState(false); // NEW: State to track if Inventory is open


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref for the main game container div - Specify type
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Timer for character run animation - Specify type

  // NEW: Ref for the main game loop interval
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Specify type

  // NEW: Ref to store the sidebar toggle function from SidebarLayout
  const sidebarToggleRef = useRef<(() => void) | null>(null);

  // NEW: Firestore instance
  const db = getFirestore();

  // --- NEW: Array of Cloud Image URLs ---
  const cloudImageUrls = [
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];

  // NEW: Helper function to generate random number between min and max (inclusive)
  function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // --- NEW: Function to fetch user data from Firestore ---
  const fetchUserData = async (userId: string) => {
    setIsLoadingUserData(true); // Start loading
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User data fetched:", userData);
        // Update states with fetched data
        setCoins(userData.coins || 0); // Use fetched coins or default to 0
        setDisplayedCoins(userData.coins || 0); // Update displayed coins immediately
        setGems(userData.gems || 0); // Fetch gems as well if stored
        setKeyCount(userData.keys || 0); // Fetch keys if stored
        // You can fetch other user-specific data here
      } else {
        // If user document doesn't exist, create it with default values
        console.log("No user document found, creating default.");
        await setDoc(userDocRef, {
          coins: 0,
          gems: 0,
          keys: 0,
          createdAt: new Date(), // Optional: add a creation timestamp
        });
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle error, maybe show a message to the user
    } finally {
      setIsLoadingUserData(false); // End loading
    }
  };

  // --- NEW: Function to update user's coin count in Firestore using a transaction ---
  // This function is now the central place for coin updates.
  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    console.log("updateCoinsInFirestore called with amount:", amount); // Debug Log 4
    if (!userId) {
      console.error("Cannot update coins: User not authenticated.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      console.log("Attempting Firestore transaction for coins..."); // Debug Log 5
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("User document does not exist for coin transaction.");
          // Optionally create the document here if it's missing, though fetchUserData should handle this
          // Ensure all necessary fields are set if creating
          transaction.set(userDocRef, {
            coins: coins, // Use current local coins state for new doc
            gems: gems, // Use current local gems state for new doc
            keys: keyCount, // Use current local keys state for new doc
            createdAt: new Date()
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + amount;
          // Ensure coins don't go below zero if deducting
          const finalCoins = Math.max(0, newCoins);
          transaction.update(userDocRef, { coins: finalCoins });
          console.log(`Coins updated in Firestore for user ${userId}: ${currentCoins} -> ${finalCoins}`);
          // Update local state after successful Firestore update
          setCoins(finalCoins);
        }
      });
      console.log("Firestore transaction for coins successful."); // Debug Log 6

    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error); // Debug Log 8
      // Handle the error, maybe retry or inform the user
    }
  };

   // Coin count animation function (Kept in main game file)
   // This function now only handles the animation, the Firestore update is separate.
  const startCoinCountAnimation = (reward: number) => {
      console.log("startCoinCountAnimation called with reward:", reward); // Debug Log 2
      const oldCoins = coins; // Use the state value
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30);
      let current = oldCoins;

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              clearInterval(countInterval);
              console.log("Coin count animation finished."); // Debug Log 3

              // NEW: Trigger Firestore update AFTER the animation finishes
              if (auth.currentUser) {
                 updateCoinsInFirestore(auth.currentUser.uid, reward); // Update Firestore with the reward amount
              } else {
                 console.log("User not authenticated, skipping Firestore update.");
              }

          } else {
              setDisplayedCoins(current);
          }
      }, 50);
  };

  // --- NEW: Function to update user's key count in Firestore using a transaction ---
  const updateKeysInFirestore = async (userId: string, amount: number) => {
    console.log("updateKeysInFirestore called with amount:", amount);
    if (!userId) {
      console.error("Cannot update keys: User not authenticated.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      console.log("Attempting Firestore transaction for keys...");
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("User document does not exist for key transaction.");
           // Optionally create the document here if it's missing, though fetchUserData should handle this
          // Ensure all necessary fields are set if creating
          transaction.set(userDocRef, {
            coins: coins, // Use current local coins state for new doc
            gems: gems, // Use current local gems state for new doc
            keys: keyCount, // Use current local keys state for new doc
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          // Ensure keys don't go below zero if deducting
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          console.log(`Keys updated in Firestore for user ${userId}: ${currentKeys} -> ${finalKeys}`);
          // Update local state after successful Firestore update
          setKeyCount(finalKeys);
        }
      });
      console.log("Firestore transaction for keys successful.");
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
      // Handle the error, maybe retry or inform the user
    }
  };


  // NEW: Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Received ${amount} gems from chest.`);
      // TODO: Implement Firestore update for gems
  };

  // NEW: Function to handle key collection (called when obstacle with key is defeated)
  // This function now only handles key consumption from TreasureChest.
  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // Update local state first (deduct keys)
      setKeyCount(prev => Math.max(0, prev + amount)); // Use +amount because TreasureChest passes negative amount
      // Then update Firestore
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      } else {
        console.log("User not authenticated, skipping Firestore key update.");
      }
  };


  // Function to start a NEW game (resets session storage states)
  const startNewGame = () => {
    // Reset session storage states to initial values
    setHealth(MAX_HEALTH);
    setCharacterPos(0);

    // Reset states that don't use session storage
    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsBackgroundPaused(false); // Ensure background pause state is false on new game
    // Keep isStatsFullscreen and isRankOpen as is, they are not reset by starting a new game
    setIsGoldMineOpen(false); // NEW: Ensure Gold Mine is closed on new game
    setIsInventoryOpen(false); // NEW: Ensure Inventory is closed on new game


    // Game elements setup
    generateInitialClouds(5);

    // Only schedule obstacles and coins if not paused
    if (!isBackgroundPaused) {
    }
  };


  // Effect to fetch user data from Firestore on authentication state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User authenticated:", user.uid);
        fetchUserData(user.uid); // Fetch user data when authenticated
        // The useSessionStorage hook will automatically load game state if available
        setGameStarted(true); // Assume game can start if user is authenticated
        setIsRunning(true); // Start running animation
      } else {
        console.log("User logged out.");
        // Reset all game states on logout, including clearing session storage
        setGameStarted(false);
        setGameOver(false);
        setHealth(MAX_HEALTH); // Reset session storage state
        setCharacterPos(0); // Reset session storage state

        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false); // Reset stats fullscreen on logout
        setIsRankOpen(false); // Reset rank open state on logout
        setIsGoldMineOpen(false); // NEW: Reset gold mine open state on logout
        setIsInventoryOpen(false); // NEW: Reset inventory open state on logout
        setIsBackgroundPaused(false); // Reset background pause state on logout
        setCoins(0); // Reset local state
        setDisplayedCoins(0); // Reset local state
        setGems(0); // Reset local state
        setKeyCount(0); // Reset local state
        setIsLoadingUserData(false); // Stop loading if user logs out

        // Clear all session storage related to the game on logout
        sessionStorage.removeItem('gameHealth');
        sessionStorage.removeItem('gameCharacterPos');

        // Clear timers and intervals
        if(runAnimationRef.current) clearInterval(runAnimationRef.current);

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [auth, db]); // Depend on auth and db object

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted]);

  // NEW: Effect to handle tab visibility changes (pause/resume game)
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              console.log("Tab is hidden. Pausing game.");
              setIsBackgroundPaused(true);
          } else {
              console.log("Tab is visible. Resuming game.");
              setIsBackgroundPaused(false);
          }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function to remove the event listener
      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []); // Empty dependency array means this effect runs only on mount and unmount


  // Generate initial cloud elements
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        // FIXED: Limited initial cloud x position to a more reasonable range
        x: Math.random() * 50 + 100, // Changed from 120 + 100 to 50 + 100 (100 to 150)
        y: Math.random() * 40 + 10,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 0.3 + 0.15,
        imgSrc: randomImgSrc
      });
    }
    setClouds(newClouds);
  };


  // Handle character jump action
  const jump = () => {
    // Chỉ cho phép nhảy khi game bắt đầu, chưa kết thúc, bảng thống kê/xếp hạng/rank không mở VÀ game KHÔNG tạm dừng do chạy nền
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen) { // Added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen check
      setCharacterPos(80);
      setJumping(true); // Set jumping to true immediately
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen) { // Added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen check
          setCharacterPos(0);
          setTimeout(() => {
            setJumping(false);
          }, 100);
        } else {
             setCharacterPos(0);
             setJumping(false);
        }
      }, 600);
    }
  };

  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    // Bỏ qua thao tác chạm/click nếu đang tải dữ liệu, bảng thống kê/xếp hạng/rank đang mở HOẶC game đang tạm dừng do chạy nền
    if (isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen) return; // Added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen check

    if (!gameStarted) {
      startNewGame(); // Start a new game on first tap if not started
    } else if (gameOver) {
      startNewGame(); // Start a new game on tap if game over
    }
    // Jump logic is triggered by key press or a dedicated jump button if you add one
  };


  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300);
  };

  // Trigger character damage effect and floating number
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);

      setTimeout(() => {
          setShowDamageNumber(false);
      }, 800);
  };


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  // This useEffect is the main game loop for movement and collision detection
  useEffect(() => {
    // Dừng vòng lặp game khi game chưa bắt đầu, kết thúc, bảng thống kê/xếp hạng/rank đang mở, đang tải dữ liệu HOẶC game đang tạm dừng do chạy nền
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen) { // Added isLoadingUserData, isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen checks
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        return;
    }

    // Bắt đầu vòng lặp game nếu chưa chạy VÀ game KHÔNG tạm dừng do chạy nền
    if (!gameLoopIntervalRef.current && !isBackgroundPaused) {
        gameLoopIntervalRef.current = setInterval(() => {
            setClouds(prevClouds => {
                return prevClouds
                    .map(cloud => {
                        const newX = cloud.x - cloud.speed;

                        // FIXED: Adjusted cloud repositioning when it moves off-screen to the left
                        if (newX < -50) { // Keep the -50 threshold
                            const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                            return {
                                ...cloud,
                                id: Date.now() + Math.random(),
                                // Reposition slightly off-screen to the right
                                x: 100 + Math.random() * 30, // Changed from 120 + random to 100 + random (100 to 130)
                                y: Math.random() * 40 + 10,
                                size: Math.random() * 40 + 30,
                                speed: Math.random() * 0.3 + 0.15,
                                imgSrc: randomImgSrc
                            };
                        }

                        // Apply clipping logic to cloud position if needed (optional, but good practice)
                        return { ...cloud, x: Math.min(120, Math.max(-50, newX)) }; // Keep clouds within -50% to 120%
                    });
            });

        }, 30); // Tốc độ cập nhật vòng lặp game (khoảng 30ms)
    }

    // Hàm cleanup: Xóa vòng lặp game khi component unmount hoặc dependencies thay đổi
    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
    };
  }, [gameStarted, gameOver, jumping, characterPos, isStatsFullscreen, isRankOpen, coins, isLoadingUserData, isBackgroundPaused, isGoldMineOpen, isInventoryOpen]); // Dependencies updated, removed obstacles and activeCoins

  // Effect to manage obstacle and coin scheduling timers based on game state and fullscreen state
  useEffect(() => {
      // Dừng hẹn giờ tạo vật cản và xu khi game kết thúc, bảng thống kê/xếp hạng/rank đang mở, đang tải dữ liệu HOẶC game đang tạm dừng do chạy nền
      if (gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen) { // Added isLoadingUserData, isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen check
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen) { // Tiếp tục/Bắt đầu hẹn giờ khi game hoạt động bình thường (added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen check)
      }

      // Hàm cleanup: Xóa hẹn giờ khi effect re-run hoặc component unmount
      return () => {
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, isRankOpen, isBackgroundPaused, isGoldMineOpen, isInventoryOpen]); // Dependencies updated, removed obstacle and coin related states


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
      console.log("All timers cleared on unmount.");
    };
  }, []);

    // Effect for coin counter animation
  useEffect(() => {
    // Only trigger animation if the displayed coins need to catch up to the actual coins state
    // AND the change is not coming from GoldMine (which updates 'coins' directly)
    if (displayedCoins === coins) return;

    // If the difference is large (e.g., from GoldMine collection), update displayedCoins immediately
    // Otherwise, run the animation for small increments (from game collection)
    if (Math.abs(coins - displayedCoins) > 10) { // Threshold for immediate update vs. animation
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
  }, [displayedCoins, coins]); // Depend on both displayedCoins and coins state


  // Calculate health percentage for the bar
  const healthPct = health / MAX_HEALTH;

  // Determine health bar color based on health percentage
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };


  // Render the character with animation and damage effect
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
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          // Tự động chạy animation khi bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu VÀ game KHÔNG tạm dừng do chạy nền
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen} // Added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <img
        key={cloud.id}
        src={cloud.imgSrc}
        alt="Cloud Icon"
        className="absolute object-contain"
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`,
          top: `${cloud.y}%`,
          // FIXED: Applied clipping logic to cloud rendering position
          left: `${Math.min(120, Math.max(-50, cloud.x))}%`, // Ensure cloud is rendered within a reasonable range
          opacity: 0.8
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
          target.onerror = null;
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud";
        }}
      />
    ));
  };


  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    // Ngăn mở bảng thống kê/xếp hạng nếu game over hoặc đang tải dữ liệu
    if (gameOver || isLoadingUserData) return; // Prevent opening if game over or loading data

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) {
            hideNavBar(); // Ẩn navbar khi mở bảng thống kê/xếp hạng
            setIsRankOpen(false); // Ensure Rank is closed when Stats opens
            setIsGoldMineOpen(false); // NEW: Ensure Gold Mine is closed when Stats opens
            setIsInventoryOpen(false); // NEW: Ensure Inventory is closed when Stats opens
        } else {
            showNavBar(); // Hiện navbar khi đóng bảng thống kê/xếp hạng
        }
        return newState;
    });
  };

  // NEW: Function to toggle Rank visibility
  const toggleRank = () => {
     // Ngăn mở bảng xếp hạng nếu game over hoặc đang tải dữ liệu
     if (gameOver || isLoadingUserData) return; // Prevent opening if game over or loading data

     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar(); // Ẩn navbar khi mở bảng xếp hạng
             setIsStatsFullscreen(false); // Ensure Stats is closed when Rank opens
             setIsGoldMineOpen(false); // NEW: Ensure Gold Mine is closed when Rank opens
             setIsInventoryOpen(false); // NEW: Ensure Inventory is closed when Rank opens
         } else {
             showNavBar(); // Hiện navbar khi đóng bảng xếp hạng
         }
         return newState;
         });
  };

  // NEW: Function to toggle Gold Mine visibility
  const toggleGoldMine = () => {
    if (gameOver || isLoadingUserData) return;

    setIsGoldMineOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsInventoryOpen(false); // NEW: Ensure Inventory is closed when Gold Mine opens
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // NEW: Function to toggle Inventory visibility
  const toggleInventory = () => {
    if (gameOver || isLoadingUserData) return;

    setIsInventoryOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false); // Ensure Gold Mine is closed when Inventory opens
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // NEW: Function to show Home content (close any fullscreen overlays)
  const showHome = () => {
      setIsStatsFullscreen(false);
      setIsRankOpen(false);
      setIsGoldMineOpen(false); // NEW: Close Gold Mine when showing Home
      setIsInventoryOpen(false); // NEW: Close Inventory when showing Home
      showNavBar(); // Ensure navbar is visible
  };


  // Handler to receive the sidebar toggle function from SidebarLayout
  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };


  // Show loading indicator if user data is being fetched
  if (isLoadingUserData) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  // Determine which content to render inside SidebarLayout based on state
  let mainContent;
  if (isStatsFullscreen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
              {/* Pass coins and updateCoinsInFirestore to CharacterCard */}
              {auth.currentUser && (
                  <CharacterCard
                      onClose={toggleStatsFullscreen} // Pass the toggle function to close the stats screen
                      coins={coins} // Pass the coin state
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} // Pass the update function
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isRankOpen) {
       mainContent = (
           <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng xếp hạng!</div>}>
               <EnhancedLeaderboard onClose={toggleRank} /> {/* Render Rank component and pass toggleRank as onClose */}
           </ErrorBoundary>
       );
  } else if (isGoldMineOpen) { // NEW: Render GoldMine when isGoldMineOpen is true
      // MODIFIED: isGamePaused prop for GoldMine component
      // We explicitly remove isGoldMineOpen from this calculation
      // so that GoldMine can run its real-time mining even when its own screen is open.
      const isGoldMineGamePaused = gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen || isBackgroundPaused || isInventoryOpen;

      console.log("Rendering GoldMine. Current isGamePaused prop (for GoldMine):", isGoldMineGamePaused);
      console.log("GoldMine paused factors (for GoldMine): gameOver:", gameOver, "gameStarted:", gameStarted, "isLoadingUserData:", isLoadingUserData, "isStatsFullscreen:", isStatsFullscreen, "isRankOpen:", isRankOpen, "isBackgroundPaused:", isBackgroundPaused, "isInventoryOpen:", isInventoryOpen);
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị mỏ vàng!</div>}>
              {auth.currentUser && (
                  <GoldMine
                      onClose={toggleGoldMine}
                      currentCoins={coins}
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                      onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)} // NEW: Pass the setter for displayedCoins
                      currentUserId={auth.currentUser!.uid}
                      isGamePaused={isGoldMineGamePaused} // Use the new calculation here
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isInventoryOpen) { // NEW: Render Inventory when isInventoryOpen is true
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị túi đồ!</div>}>
              <Inventory onClose={toggleInventory} /> {/* Pass toggleInventory to Inventory's onClose */}
          </ErrorBoundary>
      );
  }
  else {
      // Default game content
      mainContent = (
          <div
            ref={gameRef}
            // THAY ĐỔI BƯỚC 2 Ở ĐÂY: className từ h-screen thành h-full
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer bg-neutral-800`} // Added a fallback background
            // Đã bỏ style={{ overflowX: 'hidden' }} vì overflow-hidden đã bao gồm
            onClick={handleTap} // Handle tap for start/restart
          >
            {/* NEW: DungeonBackground as the first child */}
            <DungeonBackground />

            {renderClouds()} {/* Mây vẫn được giữ lại */}

            {renderCharacter()}

            {/* Main header container */}
            {/* MODIFIED: Added HeaderBackground component here and the new Menu Button */}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden
                        rounded-b-lg shadow-2xl
                        bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                        border-b border-l border-r border-slate-700/50">

                {/* Use the HeaderBackground component */}
                <HeaderBackground />

                {/* NEW Menu Button - Placed before the HP bar container */}
                <button
                    onClick={() => sidebarToggleRef.current?.()} // Call the stored toggle function
                    className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20" // Added z-20 to ensure it's above background
                    aria-label="Mở sidebar"
                    title="Mở sidebar"
                >
                    {/* Use the provided image URL for the icon */}
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png"
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain" // Adjust size as needed
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Menu"; // Fallback image
                        }}
                     />
                </button>


                <div className="flex items-center relative z-10"> {/* Added relative and z-10 to bring content above background layers */}
                  <div className="w-32 relative">
                      <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                          <div className="h-full overflow-hidden">
                              <div
                                  className={`${getColor()} h-full transform origin-left`}
                                  style={{
                                      transform: `scaleX(${healthPct})`,
                                      transition: 'transform 0.5s ease-out',
                                  }}
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
               {/* Chỉ hiển thị thông tin tiền tệ khi bảng thống kê/xếp hạng và rank KHÔNG mở */}
               {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen) && ( // Only show currency display when stats, rank, gold mine, and inventory are NOT fullscreen (added isGoldMineOpen and isInventoryOpen)
                  <div className="flex items-center space-x-1 currency-display-container relative z-10"> {/* Added relative and z-10 */}
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                          <div className="relative mr-0.5 flex items-center justify-center">
                              {/* Sử dụng GemIcon từ file mới */}
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

                      <CoinDisplay
                        displayedCoins={displayedCoins}
                        isStatsFullscreen={isStatsFullscreen} // Truyền trạng thái isStatsFullscreen
                      />
                  </div>
               )}
            </div>

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
                <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
                <button
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                  onClick={startNewGame} // Call startNewGame on button click
                >
                  Chơi Lại
                </button>
              </div>
            )}

            {/* Keep these buttons, they are not part of the main header or sidebar */}
            {/* Chỉ hiển thị các nút này khi bảng thống kê/xếp hạng và rank KHÔNG mở */}
            {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen) && ( // Added isRankOpen, isGoldMineOpen, and isInventoryOpen check
              <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  {
                    icon: (
                      // MODIFIED: Changed Shop icon to the new image URL
                      <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png"
                        alt="Shop Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Shop";
                        }}
                      />
                    ),
                    label: "", // Set label to empty string to hide it
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      // MODIFIED: Changed Inventory icon to the new image URL
                      <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png"
                        alt="Inventory Icon"
                        className="w-full h-full object-contain" // Ensure it fits the container
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Inv"; // Fallback image
                        }}
                      />
                    ),
                    // MODIFIED: Hidden the "Inventory" label
                    label: "", // Set label to empty string to hide it
                    notification: true,
                    special: true,
                    centered: true,
                    onClick: toggleInventory // NEW: Add onClick handler
                  }
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            // MODIFIED: Added background, padding, and rounded-lg classes
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick} // Apply onClick if it exists
                        >
                            {item.icon}
                            {/* MODIFIED: Conditionally render label only if it's not empty */}
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

             {/* Chỉ hiển thị nút khiên khi bảng thống kê/xếp hạng và rank KHÔNG mở */}
             {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen) && ( // Added isRankOpen, isGoldMineOpen, and isInventoryOpen check
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">

                {[
                  {
                    icon: (
                      // MODIFIED: Changed Mission icon to the new image URL
                      <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png"
                        alt="Mission Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Mission";
                        }}
                      />
                    ),
                    label: "", // Set label to empty string to hide it
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      // MODIFIED: Changed Blacksmith icon to the new image URL
                      <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png"
                        alt="Blacksmith Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Blacksmith";
                        }}
                      />
                    ),
                    label: "", // Set label to empty string to hide it
                    notification: true,
                    special: true,
                    centered: true
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            // MODIFIED: Added background, padding, and rounded-lg classes
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick} // Apply onClick if it exists
                        >
                            {item.icon}
                            {/* MODIFIED: Conditionally render label only if it's not empty */}
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
              keyCount={keyCount} // Pass the keyCount state
              onKeyCollect={(n) => {
                console.log(`Chest opened using ${n} key(s).`);
                if (auth.currentUser) {
                  updateKeysInFirestore(auth.currentUser.uid, -n); // Subtract keys
                } else {
                  console.log("User not authenticated, skipping Firestore key update.");
                }
              }}
              // Use startCoinCountAnimation to handle coin rewards from chests
              onCoinReward={startCoinCountAnimation}
              onGemReward={handleGemReward} // NEW: Pass the gem reward handler
              // Truyền trạng thái tạm dừng game (bao gồm cả khi bảng thống kê/xếp hạng/rank mở VÀ game đang tạm dừng do chạy nền)
              isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen} // Added isRankOpen, isBackgroundPaused, isGoldMineOpen, and isInventoryOpen
              isStatsFullscreen={isStatsFullscreen} // Truyền trạng thái isStatsFullscreen
              currentUserId={currentUser ? currentUser.uid : null} // Pass currentUserId here
            />

          </div>
      );
  }


  return (
    // THAY ĐỔI BƯỚC 3 Ở ĐÂY: Bọc SidebarLayout trong div mới
    // Outermost container that strictly controls viewport size and overflow
    <div className="w-screen h-screen overflow-hidden bg-gray-950"> {/* Fallback background for the entire page */}
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen} // Pass the toggleFullscreen function here
          onShowRank={toggleRank} // Pass the toggleRank function here
          onShowHome={showHome} // Pass the new showHome function
          onShowGoldMine={toggleGoldMine} // NEW: Pass the toggleGoldMine function here
          // Add handlers for other menu items here if needed
      >
        {mainContent} {/* Render the determined main content as children */}
      </SidebarLayout>
    </div>
  );
}
