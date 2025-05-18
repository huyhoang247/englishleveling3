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

// NEW: Import the GameUnlockModal component
import GameUnlockModal from './unlock.tsx';


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

// Define interface for Obstacle with health
interface GameObstacle {
  id: number;
  position: number; // Horizontal position in %
  type: string;
  height: number; // Height in Tailwind units (e.g., 8 for h-8)
  width: number; // Width in Tailwind units (e.g., w-8)
  color: string; // Tailwind gradient class or other identifier
  baseHealth: number; // Base health for this obstacle type
  health: number; // Current health of the obstacle
  maxHealth: number; // Maximum health of the obstacle
  damage: number; // Damage the obstacle deals on collision
  lottieSrc?: string; // Optional Lottie source URL for Lottie obstacles
  hasKey?: boolean; // Flag to indicate if the obstacle drops a key
}

// --- NEW: Define interface for Coin ---
interface GameCoin {
  id: number;
  x: number; // Horizontal position in %
  y: number; // Vertical position in %
  initialSpeedX: number; // Speed for initial horizontal movement (left)
  initialSpeedY: number; // Speed for initial vertical movement (down)
  attractSpeed: number; // Speed factor for moving towards the character after collision
  isAttracted: boolean; // Flag to indicate if the coin is moving towards the character
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
    obstacles: GameObstacle[];
    activeCoins: GameCoin[];
    isShieldActive: boolean;
    shieldHealth: number;
    isShieldOnCooldown: boolean;
    remainingCooldown: number;
    shieldCooldownStartTime: number | null;
    pausedShieldCooldownRemaining: number | null;
    // Removed nextKeyIn from session data interface
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
  const [obstacles, setObstacles] = useSessionStorage<GameObstacle[]>('gameObstacles', []); // Use hook for obstacles
  const [activeCoins, setActiveCoins] = useSessionStorage<GameCoin[]>('gameActiveCoins', []); // Use hook for active coins
  const [isShieldActive, setIsShieldActive] = useSessionStorage<boolean>('gameIsShieldActive', false); // Use hook for shield active
  const [shieldHealth, setShieldHealth] = useSessionStorage<number>('gameShieldHealth', 2000); // Use hook for shield health
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useSessionStorage<boolean>('gameIsShieldOnCooldown', false); // Use hook for shield cooldown
  const [remainingCooldown, setRemainingCooldown] = useSessionStorage<number>('gameRemainingCooldown', 0); // Use hook for remaining cooldown

  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false); // Tracks if the game has started
  // REMOVED: gameOver state is no longer needed
  // const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [particles, setParticles] = useState([]); // Array of active particles (dust)
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect
  // NEW: State to track if the game is paused due to being in the background
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);

  // NEW: State to control the visibility of the revive heart icon
  const [showReviveIcon, setShowReviveIcon] = useState(false);
  // NEW: State to control the visibility of the Unlock Modal
  const [showUnlockModal, setShowUnlockModal] = useState(false);


  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number

  // Shield Timers (Refs are better for timers as they don't trigger re-renders)
  const SHIELD_MAX_HEALTH = 2000; // Base health for the shield
  const SHIELD_COOLDOWN_TIME = 200000; // Shield cooldown time in ms (200 seconds)
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for shield cooldown (200s) - Specify type
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for cooldown countdown display - Specify type

  // CORRECTED: Use state directly from useSessionStorage, not a ref structure
  const [shieldCooldownStartTime, setShieldCooldownStartTime] = useSessionStorage<number | null>('gameShieldCooldownStartTime', null);
  const [pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining] = useSessionStorage<number | null>('gamePausedShieldCooldownRemaining', null);


  // --- Coin and Gem States (Persisted in Firestore) ---
  const [coins, setCoins] = useState(0); // Initialize with 0, will load from Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Coins displayed with animation
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new coins
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for coin count animation

  const [gems, setGems] = useState(42); // Player's gem count, initialized

  // NEW: Key state and ref for key drop interval
  // Removed nextKeyIn from state and its hook
  const [keyCount, setKeyCount] = useState(0); // Player's key count


  // UI States
  // Keep isStatsFullscreen here, it controls the CharacterCard visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false); // Trạng thái kiểm soát hiển thị bảng thống kê/xếp hạng
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // NEW: State to track user data loading
  // NEW: State to track if the Rank component is open
  const [isRankOpen, setIsRankOpen] = useState(false);


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref for the main game container div - Specify type
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new obstacles - Specify type
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Timer for character run animation - Specify type
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for generating particles - Specify type

  // NEW: Ref for the main game loop interval
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Specify type

  // NEW: Ref to store the sidebar toggle function from SidebarLayout
  const sidebarToggleRef = useRef<(() => void) | null>(null);

  // NEW: Firestore instance
  const db = getFirestore();

  // Obstacle types with properties (added base health)
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey'>[] = [
    {
      type: 'lottie-obstacle-1',
      height: 16,
      width: 16,
      color: 'transparent',
      baseHealth: 500,
      damage: 100,
      lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie"
    },
    {
      type: 'lottie-obstacle-2',
      height: 20,
      width: 20,
      color: 'transparent',
      baseHealth: 700,
      damage: 150,
      lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie"
    },
  ];

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
      // REMOVED: Set state to show "OK" text after successful transaction
      // setShowCoinUpdateSuccess(true);
      // console.log("setShowCoinUpdateSuccess(true) called."); // Debug Log 7

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

      // Clear any existing coin count animation interval
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              // setCoins(newCoins); // REMOVED: Local state update is handled by Firestore transaction callback
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null; // Clear the ref after animation
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

      coinCountAnimationTimerRef.current = countInterval;
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
  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // Update local state first
      setKeyCount(prev => prev + amount);
      // Then update Firestore
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      } else {
        console.log("User not authenticated, skipping Firestore key update.");
      }
  };


  // Function to start a NEW game (resets session storage states)
  const startNewGame = () => {
    console.log("Starting new game...");
    // Reset session storage states to initial values
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setObstacles([]);
    setActiveCoins([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    setShieldCooldownStartTime(null); // Use the setter from the hook
    setPausedShieldCooldownRemaining(null); // Use the setter from the hook
    // Removed reset for nextKeyIn

    // Reset states that don't use session storage
    setGameStarted(true);
    // REMOVED: setGameOver(false);
    setJumping(false); // Ensure jumping is false
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsBackgroundPaused(false); // Ensure background pause state is false on new game
    // NEW: Reset revive icon and unlock modal states
    setShowReviveIcon(false);
    setShowUnlockModal(false);

    // Game elements setup
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        // 20% chance để có chìa khóa
        const hasKeyFirst = Math.random() < 0.2;

        initialObstacles.push({
          id: Date.now(),
          // FIXED: Adjusted initial obstacle position to be slightly off-screen but not excessively
          position: 105, // Changed from 120 to 105
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: hasKeyFirst,
        });

        for (let i = 1; i < 5; i++) {
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const spacing = i * (Math.random() * 10 + 10);

          // 20% chance để có chìa khóa
          const hasKey = Math.random() < 0.2;

          initialObstacles.push({
            id: Date.now() + i,
            // FIXED: Adjusted initial obstacle position to be slightly off-screen but not excessively
            position: 150 + (i * 50), // This is still quite far, but the filtering logic will handle it
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKey,
          });
        }
    }

    setObstacles(initialObstacles);
    generateInitialClouds(5);

    // Clear existing timers before starting new ones
    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);


    // Only start particle timer if not paused
    if (!isBackgroundPaused) {
      particleTimerRef.current = setInterval(generateParticles, 300);
    }

    // Only schedule obstacles and coins if not paused AND health is above zero
    if (!isBackgroundPaused && health > 0) {
        scheduleNextObstacle();
        scheduleNextCoin();
        // Start the main game loop
        if (!gameLoopIntervalRef.current) {
             startGameLoop();
        }
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
        // REMOVED: setGameOver(false);
        setHealth(MAX_HEALTH); // Reset session storage state
        setCharacterPos(0); // Reset session storage state
        setObstacles([]); // Reset session storage state
        setActiveCoins([]); // Reset session storage state
        setIsShieldActive(false); // Reset session storage state
        setShieldHealth(SHIELD_MAX_HEALTH); // Reset session storage state
        setIsShieldOnCooldown(false); // Reset session storage state
        setRemainingCooldown(0); // Reset session storage state
        setShieldCooldownStartTime(null); // Reset session storage state
        setPausedShieldCooldownRemaining(null); // Reset session storage state
        // Removed reset for nextKeyIn

        // NEW: Reset revive icon and unlock modal states
        setShowReviveIcon(false);
        setShowUnlockModal(false);


        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false); // Reset stats fullscreen on logout
        setIsRankOpen(false); // Reset rank open state on logout
        setIsBackgroundPaused(false); // Reset background pause state on logout
        setCoins(0); // Reset local state
        setDisplayedCoins(0); // Reset local state
        setGems(0); // Reset local state
        setKeyCount(0); // Reset local state
        setIsLoadingUserData(false); // Stop loading if user logs out

        // Clear all session storage related to the game on logout
        sessionStorage.removeItem('gameHealth');
        sessionStorage.removeItem('gameCharacterPos');
        sessionStorage.removeItem('gameObstacles');
        sessionStorage.removeItem('gameActiveCoins');
        sessionStorage.removeItem('gameIsShieldActive');
        sessionStorage.removeItem('gameShieldHealth');
        sessionStorage.removeItem('gameIsShieldOnCooldown');
        sessionStorage.removeItem('gameRemainingCooldown');
        sessionStorage.removeItem('gameShieldCooldownStartTime');
        sessionStorage.removeItem('gamePausedShieldCooldownRemaining');
        // Removed session storage key for nextKeyIn

        // Clear timers and intervals
        clearTimeout(obstacleTimerRef.current);
        clearInterval(runAnimationRef.current);
        clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        clearInterval(coinScheduleTimerRef.current);
        clearInterval(coinCountAnimationTimerRef.current);

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [auth]); // Depend on auth object

  // *** MODIFIED Effect: Handle health reaching zero ***
  useEffect(() => {
    // When health reaches zero and game is started
    if (health <= 0 && gameStarted) {
      console.log("Health reached zero. Showing revive icon.");
      // REMOVED: setGameOver(true);
      setIsRunning(false); // Stop character running animation
      setShowReviveIcon(true); // Show the revive heart icon

      // Pause game elements (obstacles, coins, particles, main game loop)
      clearTimeout(obstacleTimerRef.current);
      obstacleTimerRef.current = null;
      clearInterval(particleTimerRef.current);
      particleTimerRef.current = null;
      clearTimeout(coinScheduleTimerRef.current);
      coinScheduleTimerRef.current = null;
      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
      // Shield cooldown timers should pause based on isBackgroundPaused or modal open state, handled in their own effect.

    } else if (health > 0 && showReviveIcon) {
        // If health becomes positive again (e.g., after reviving), hide the icon and resume game elements
        console.log("Health is positive. Hiding revive icon and resuming game.");
        setShowReviveIcon(false);
        setShowUnlockModal(false); // Also hide the modal if open

        // Resume game elements if not otherwise paused (e.g., by background, stats, rank)
        if (!isBackgroundPaused && !isStatsFullscreen && !isRankOpen) {
            setIsRunning(true); // Resume character running animation
            if (!obstacleTimerRef.current) scheduleNextObstacle();
            if (!particleTimerRef.current) particleTimerRef.current = setInterval(generateParticles, 300);
            if (!coinScheduleTimerRef.current) scheduleNextCoin();
             if (!gameLoopIntervalRef.current) startGameLoop(); // Resume main game loop
        }
    }
     // Note: No cleanup needed here for timers as they are cleared/managed by other effects based on state changes.
  }, [health, gameStarted, showReviveIcon, isBackgroundPaused, isStatsFullscreen, isRankOpen]); // Dependencies updated


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

  // Generate dust particles for visual effect
  const generateParticles = () => {
    // Dừng tạo hạt khi game chưa bắt đầu, kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
    if (!gameStarted || showReviveIcon || isStatsFullscreen || isRankOpen || isBackgroundPaused || showUnlockModal) return; // Added showReviveIcon and showUnlockModal check

    const newParticles = [];
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 5 + Math.random() * 5,
        y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    // Dừng hẹn giờ tạo vật cản khi game kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
    if (showReviveIcon || isStatsFullscreen || isRankOpen || isBackgroundPaused || showUnlockModal) { // Added showReviveIcon and showUnlockModal check
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 10 + 10);

            // 20% chance để có chìa khóa
            const hasKey = Math.random() < 0.2;

            newObstacles.push({
              id: Date.now() + i,
              // FIXED: Adjusted initial obstacle position for scheduled obstacles
              position: 105 + spacing, // Changed from 100 + spacing to 105 + spacing
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle();
    }, randomTime);
  };

  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    // Dừng hẹn giờ tạo xu khi game kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
    if (showReviveIcon || isStatsFullscreen || isRankOpen || isBackgroundPaused || showUnlockModal) { // Added showReviveIcon and showUnlockModal check
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000;
    if (coinScheduleTimerRef.current) {
        clearTimeout(coinScheduleTimerRef.current);
    }
    coinScheduleTimerRef.current = setTimeout(() => {
      const newCoin: GameCoin = {
        id: Date.now(),
        // FIXED: Adjusted initial coin x position
        x: 105, // Changed from 110 to 105
        y: Math.random() * 60,
        initialSpeedX: Math.random() * 0.5 + 0.5,
        initialSpeedY: Math.random() * 0.3,
        attractSpeed: Math.random() * 0.05 + 0.03,
        isAttracted: false
      };

      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin();
    }, randomTime);
  };


  // Handle character jump action
  const jump = () => {
    // Chỉ cho phép nhảy khi game bắt đầu, chưa kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank không mở, modal unlock không mở VÀ game KHÔNG tạm dừng do chạy nền
    if (!jumping && gameStarted && !showReviveIcon && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !showUnlockModal) { // Added showReviveIcon and showUnlockModal check
      setJumping(true);
      setCharacterPos(80);
      setTimeout(() => {
        // Kiểm tra lại trạng thái trước khi hạ xuống để tránh hạ xuống khi game đã kết thúc (thay bằng showReviveIcon) hoặc UI overlay đang mở
        if (gameStarted && !showReviveIcon && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !showUnlockModal) { // Added showReviveIcon and showUnlockModal check
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
    // Bỏ qua thao tác chạm/click nếu đang tải dữ liệu, bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
    if (isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showUnlockModal) return; // Added showUnlockModal check

    // Nếu game chưa bắt đầu, bắt đầu game mới
    if (!gameStarted) {
      startNewGame();
    } else if (showReviveIcon) {
        // Nếu icon hồi sinh đang hiển thị, không làm gì khi tap vào màn hình game (chỉ tap vào icon mới mở modal)
        return;
    }
    // Logic nhảy được kích hoạt bởi phím hoặc nút nhảy riêng biệt
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

  // --- NEW: Function to activate Shield skill ---
  const activateShield = () => {
    // Chỉ cho phép kích hoạt khiên khi game bắt đầu, chưa kết thúc (thay bằng showReviveIcon), khiên chưa active, chưa hồi chiêu, bảng thống kê/xếp hạng/rank không mở, modal unlock không mở, không đang tải dữ liệu VÀ game KHÔNG tạm dừng do chạy nền
    if (!gameStarted || showReviveIcon || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showUnlockModal) { // Added showReviveIcon and showUnlockModal checks
      console.log("Cannot activate Shield:", { gameStarted, showReviveIcon, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData, isRankOpen, isBackgroundPaused, showUnlockModal });
      return;
    }

    console.log("Activating Shield!");

    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);

    setIsShieldOnCooldown(true);
    // Calculate initial remaining cooldown in seconds and set the state
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000));

    const now = Date.now();
    setShieldCooldownStartTime(now); // Use the setter from the hook

    // Log the value immediately after setting it
    console.log(`Shield activated at: ${now}. shieldCooldownStartTime state set to: ${now}`);


    setPausedShieldCooldownRemaining(null); // Use the setter from the hook

    // Set the main shield cooldown timer
    if (shieldCooldownTimerRef.current) {
        clearTimeout(shieldCooldownTimerRef.current);
    }
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Shield cooldown ended.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        setShieldCooldownStartTime(null); // Use the setter from the hook
        setPausedShieldCooldownRemaining(null); // Use the setter from the hook
    }, SHIELD_COOLDOWN_TIME);

  };


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  // This useEffect is the main game loop for movement and collision detection
  // *** MODIFIED Effect: Game Loop ***
  useEffect(() => {
    // Dừng vòng lặp game khi game chưa bắt đầu, kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở, đang tải dữ liệu HOẶC game đang tạm dừng do chạy nền
    const shouldPauseGameLoop = !gameStarted || showReviveIcon || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showUnlockModal; // Added showReviveIcon and showUnlockModal

    if (shouldPauseGameLoop) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
            console.log("Game loop paused.");
        }
         // Dừng tạo hạt khi game chưa bắt đầu, kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
        if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    // Bắt đầu vòng lặp game nếu chưa chạy VÀ game KHÔNG tạm dừng do các yếu tố trên
    if (!gameLoopIntervalRef.current && !shouldPauseGameLoop) {
        console.log("Starting game loop.");
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5;

            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;


                return prevObstacles
                    .map(obstacle => {
                        let newPosition = obstacle.position - speed;

                        let collisionDetected = false;
                        const obstacleX_px = (newPosition / 100) * gameWidth;

                        let obstacleWidth_px, obstacleHeight_px;
                        obstacleWidth_px = (obstacle.width / 4) * 16;
                        obstacleHeight_px = (obstacle.height / 4) * 16;

                        const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;

                        const collisionTolerance = 5;
                        if (
                            characterRight_px > obstacleX_px - collisionTolerance &&
                            characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                            characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance &&
                            characterTopFromTop_px < obstacleBottomFromTop_px + collisionTolerance
                        ) {
                            collisionDetected = true;
                            if (isShieldActive) {
                                setShieldHealth(prev => {
                                    const damageToShield = obstacle.damage;
                                    const newShieldHealth = Math.max(0, prev - damageToShield);
                                    if (newShieldHealth <= 0) {
                                        console.log("Shield health depleted.");
                                        setIsShieldActive(false);
                                    }
                                    return newShieldHealth;
                                });
                            } else {
                                const damageTaken = obstacle.damage;
                                // Only take damage if health is above zero
                                if (health > 0) {
                                    setHealth(prev => Math.max(0, prev - damageTaken));
                                    triggerHealthDamageEffect();
                                    triggerCharacterDamageEffect(damageTaken);
                                }
                            }
                        }

                        // FIXED: Applied clipping logic to obstacle position when it moves off-screen
                        // Also adjusted the repositioning logic to use a position slightly off-screen
                        if (newPosition < -20 && !collisionDetected) {
                             if (Math.random() < 0.7) {
                                if (obstacleTypes.length === 0) return obstacle;

                                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                                const randomOffset = Math.floor(Math.random() * 20);

                                // 20% chance để có chìa khóa
                                const hasKey = Math.random() < 0.2;

                                return {
                                    ...obstacle,
                                    ...randomObstacleType,
                                    id: Date.now(),
                                    // Reposition slightly off-screen
                                    position: 105 + randomOffset, // Changed from 120 + randomOffset to 105 + randomOffset
                                    health: randomObstacleType.baseHealth,
                                    maxHealth: randomObstacleType.baseHealth,
                                    hasKey: hasKey,
                                };
                            } else {
                                // Apply clipping logic even if not repositioning, though filtering handles this
                                return { ...obstacle, position: Math.min(100, Math.max(-20, newPosition)) };
                            }
                        }

                        if (collisionDetected) {
                            if (obstacle.hasKey) {
                                handleKeyCollect(1); // Call handleKeyCollect when obstacle with key is hit
                            }
                            return { ...obstacle, position: newPosition, collided: true };
                        }

                        // Apply clipping logic during normal movement
                        return { ...obstacle, position: Math.min(100, Math.max(-20, newPosition)) };
                    })
                    // Filter out collided obstacles and those far off-screen
                    .filter(obstacle => {
                        // Keep obstacles that haven't collided AND are within a reasonable range
                        return !obstacle.collided && obstacle.position > -20;
                    });
            });

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

            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.xVelocity,
                        y: particle.y + particle.yVelocity,
                        opacity: particle.opacity - 0.03,
                        size: particle.size - 0.1
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0)
            );

            // --- NEW: Move coins and detect collisions ---
            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


                return prevCoins
                    .map(coin => {
                        const coinSize_px = 40;

                        const coinX_px = (coin.x / 100) * gameWidth;
                        const coinY_px = (coin.y / 100) * gameHeight;

                        let newX = coin.x;
                        let newY = coin.y;
                        let collisionDetected = false;
                        let shouldBeAttracted = coin.isAttracted;


                        if (!shouldBeAttracted) {
                            if (
                                characterRight_px > coinX_px &&
                                characterLeft_px < coinX_px + coinSize_px &&
                                characterBottomFromTop_px > coinY_px &&
                                characterTopFromTop_px < coinY_px + coinSize_px
                            ) {
                                shouldBeAttracted = true;
                            }
                        }


                        if (shouldBeAttracted) {
                            const dx = characterCenterX_px - coinX_px;
                            const dy = characterCenterY_px - coinY_px;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            const moveStep = distance * coin.attractSpeed;

                            const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                            const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;

                            const newCoinX_px = coinX_px + moveX_px;
                            const newCoinY_px = coinY_px + moveY_px;

                            newX = (newCoinX_px / gameWidth) * 100;
                            newY = (newCoinY_px / gameHeight) * 100;

                            if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.8) {
                                collisionDetected = true;
                                const awardedCoins = Math.floor(Math.random() * 5) + 1;
                                console.log(`Coin collected! Awarded: ${awardedCoins}. Calling startCoinCountAnimation.`); // Debug Log 1
                                // startCoinCountAnimation(awardedCoins); // This now triggers Firestore update internally
                                // Call the animation first, then the Firestore update will happen after animation
                                startCoinCountAnimation(awardedCoins);

                                console.log(`Coin collected! Awarded: ${awardedCoins}`);
                            }

                        } else {
                            newX = coin.x - coin.initialSpeedX;
                            newY = coin.y + coin.initialSpeedY;
                        }

                        return {
                            ...coin,
                            x: newX,
                            y: newY,
                            isAttracted: shouldBeAttracted,
                            collided: collisionDetected
                        };
                    })
                    .filter(coin => {
                        // FIXED: Adjusted coin filtering logic to keep coins within a reasonable range
                        const isOffScreen = coin.x < -20 || coin.y > 120 || coin.y < -20; // Added check for top off-screen
                        return !coin.collided && !isOffScreen;
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
         if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, jumping, characterPos, obstacles, activeCoins, isShieldActive, isStatsFullscreen, isRankOpen, coins, isLoadingUserData, isBackgroundPaused, showReviveIcon, showUnlockModal]); // Dependencies updated, added showReviveIcon and showUnlockModal


  // Effect to manage obstacle and coin scheduling timers based on game state and fullscreen state
  // *** MODIFIED Effect: Obstacle and Coin Scheduling ***
  useEffect(() => {
      // Dừng hẹn giờ tạo vật cản và xu khi game kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở, đang tải dữ liệu HOẶC game đang tạm dừng do chạy nền
      const shouldPauseScheduling = showReviveIcon || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showUnlockModal; // Added showReviveIcon and showUnlockModal check

      if (shouldPauseScheduling) {
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
           // Dừng tạo hạt khi game chưa bắt đầu, kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
           if (particleTimerRef.current) {
               clearInterval(particleTimerRef.current);
               particleTimerRef.current = null;
           }
      } else if (gameStarted && !shouldPauseScheduling) { // Tiếp tục/Bắt đầu hẹn giờ khi game hoạt động bình thường
          if (!obstacleTimerRef.current) {
              scheduleNextObstacle();
          }
          if (!coinScheduleTimerRef.current) {
              scheduleNextCoin();
          }
           if (!particleTimerRef.current) {
               particleTimerRef.current = setInterval(generateParticles, 300);
           }
      }

      // Hàm cleanup: Xóa hẹn giờ khi effect re-run hoặc component unmount
      return () => {
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
           if (particleTimerRef.current) {
               clearInterval(particleTimerRef.current);
               particleTimerRef.current = null;
           }
      };
  }, [gameStarted, isStatsFullscreen, isLoadingUserData, isRankOpen, isBackgroundPaused, showReviveIcon, showUnlockModal]); // Dependencies updated, added showReviveIcon and showUnlockModal

  // *** MODIFIED Effect: Manage shield cooldown countdown display AND main cooldown timer pause/resume ***
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      // CORRECTED: Use state variables directly
      console.log("Shield Cooldown Effect running:", {
          isShieldOnCooldown,
          // REMOVED: gameOver,
          isStatsFullscreen, // Kiểm tra trạng thái bảng thống kê/xếp hạng
          isLoadingUserData,
          gameStarted,
          shieldCooldownStartTime, // Use the state variable
          pausedShieldCooldownRemaining, // Use the state variable
          currentCooldownTimer: !!shieldCooldownTimerRef.current,
          currentCountdownTimer: !!cooldownCountdownTimerRef.current,
          isRankOpen, // Added isRankOpen to log
          isBackgroundPaused, // Added isBackgroundPaused to log
          showReviveIcon, // Added showReviveIcon to log
          showUnlockModal // Added showUnlockModal to log
      });


      // Dừng/Tạm dừng bộ đếm thời gian khi game không hoạt động, kết thúc (thay bằng showReviveIcon), bảng thống kê/xếp hạng/rank đang mở, modal unlock đang mở HOẶC game đang tạm dừng do chạy nền
      const shouldPauseShieldTimers = isStatsFullscreen || isLoadingUserData || !gameStarted || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal; // Added showReviveIcon and showUnlockModal

      if (shouldPauseShieldTimers) {
          console.log("Game inactive or paused. Clearing shield timers.");
          // Tạm dừng bộ đếm thời gian hồi chiêu chính nếu đang chạy
          if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) { // Check for null before calculating remaining time
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              setPausedShieldCooldownRemaining(remainingTimeMs); // Use the setter from the hook
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log(`Main shield cooldown PAUSED with ${remainingTimeMs}ms remaining.`);
          }

          // Tạm dừng bộ đếm thời gian hiển thị hồi chiêu nếu đang chạy
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield display countdown PAUSED.");
          }
      } else if (isShieldOnCooldown) { // Bắt đầu/Tiếp tục đếm ngược nếu khiên đang hồi chiêu và game hoạt động
           console.log("Shield is on cooldown and game is active.");
           // Tiếp tục bộ đếm thời gian hồi chiêu chính nếu đã tạm dừng
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               console.log(`Resuming main shield cooldown with ${remainingTimeToResume}ms.`);
               shieldCooldownTimerRef.current = setTimeout(() => {
                   console.log("Shield cooldown ended (after pause).");
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null); // Use the setter from the hook
                   setPausedShieldCooldownRemaining(null); // Use the setter from the hook
               }, remainingTimeToResume);

               // Adjust the start time to reflect the resumed state
               setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume)); // Use the setter from the hook
               setPausedShieldCooldownRemaining(null); // Clear the paused remaining time

               // Start countdown display immediately upon resuming
               const initialRemainingSeconds = Math.ceil(remainingTimeToResume / 1000);
               setRemainingCooldown(initialRemainingSeconds);
               if (cooldownCountdownTimerRef.current === null) {
                   console.log(`Starting shield display countdown upon resume with ${initialRemainingSeconds}s.`);
                   countdownInterval = setInterval(() => {
                       setRemainingCooldown(prev => {
                           const newRemaining = Math.max(0, prev - 1);
                           if (newRemaining === 0) {
                               clearInterval(countdownInterval!);
                               cooldownCountdownTimerRef.current = null;
                               console.log("Shield display countdown finished.");
                           }
                           return newRemaining;
                       });
                   }, 1000); // Update every 1 second
                   cooldownCountdownTimerRef.current = countdownInterval;
               }


           } else if (shieldCooldownStartTime !== null) { // If not paused, ensure main timer is running (should be set in activateShield)
               // This block is primarily for ensuring the countdown display starts if it wasn't already
               if (cooldownCountdownTimerRef.current === null) { // Only start countdown display if not already running
                    const now = Date.now();
                    const elapsedTime = now - shieldCooldownStartTime;
                    const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
                    const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);

                    console.log(`Calculating remaining cooldown: now=${now}, startTime=${shieldCooldownStartTime}, elapsedTime=${elapsedTime}, remainingMs=${remainingTimeMs}, initialSeconds=${initialRemainingSeconds}`);


                    if (initialRemainingSeconds > 0) {
                        console.log(`Starting shield display countdown from start time with ${initialRemainingSeconds}s.`);
                         setRemainingCooldown(initialRemainingSeconds);
                         countdownInterval = setInterval(() => {
                             setRemainingCooldown(prev => {
                                 const newRemaining = Math.max(0, prev - 1);
                                 if (newRemaining === 0) {
                                     clearInterval(countdownInterval!);
                                     cooldownCountdownTimerRef.current = null;
                                     console.log("Shield display countdown finished.");
                                 }
                                 return newRemaining;
                             });
                         }, 1000); // Update every 1 second
                         cooldownCountdownTimerRef.current = countdownInterval;
                    } else {
                         // If remaining time is 0 or less, cooldown should end
                         setIsShieldOnCooldown(false);
                         setRemainingCooldown(0);
                         setShieldCooldownStartTime(null);
                         setPausedShieldCooldownRemaining(null);
                         console.log("Shield cooldown already ended based on start time.");
                    }

               } else {
                   // Explicitly handle the case where shieldCooldownStartTime is null/undefined
                   console.warn("Shield is on cooldown but shieldCooldownStartTime is null/undefined. This should not happen if activateShield ran correctly.");
                   // Potentially reset cooldown state here if this state is invalid
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null);
                   setPausedShieldCooldownRemaining(null);
               }
           }
      } else {
          // Nếu khiên KHÔNG hồi chiêu, đảm bảo bộ đếm ngược hiển thị đã dừng và reset
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield not on cooldown. Stopping display countdown.");
          }
          if (remainingCooldown !== 0) {
              setRemainingCooldown(0);
          }
      }


      // Cleanup function to clear intervals when the effect re-runs or component unmounts
      return () => {
          console.log("Shield Cooldown Effect cleanup.");
          if (countdownInterval) {
              clearInterval(countdownInterval);
              console.log("Cleanup: Cleared countdownInterval.");
          }
          // Note: The main shieldCooldownTimerRef is managed within the effect's logic,
          // clearing it here in the cleanup might interfere with the pause/resume logic.
          // We rely on the effect's internal logic to clear shieldCooldownTimerRef.
      };

  }, [isShieldOnCooldown, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted, isRankOpen, isBackgroundPaused, showReviveIcon, showUnlockModal]); // Dependencies updated, added showReviveIcon and showUnlockModal


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      // No need to clear session storage states here, the hook handles saving the current state

      clearInterval(coinScheduleTimerRef.current);
      clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
      console.log("All timers cleared on unmount.");
    };
  }, []);

    // Effect for coin counter animation
  useEffect(() => {
    // Only trigger animation if the displayed coins need to catch up to the actual coins state
    if (displayedCoins === coins) return;

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

  // NEW: Calculate shield health percentage
  const shieldHealthPct = isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;


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
          // Tự động chạy animation khi bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;

    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;


    switch(obstacle.type) {
      case 'rock':
        obstacleEl = (
          <div className={`w-${obstacle.width} h-${obstacle.height} bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            <div className="w-2 h-1 bg-gray-600 rounded-full absolute top-1 left-0.5"></div>
            <div className="w-1.5 h-0.5 bg-gray-600 rounded-full absolute top-3 right-1"></div>
          </div>
        );
        break;
      case 'lottie-obstacle-1':
        obstacleEl = (
          <div
            className="relative"
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                // Tự động chạy animation khi bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
                autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      case 'lottie-obstacle-2':
        obstacleEl = (
          <div
            className="relative"
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                // Tự động chạy animation khi bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
                autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
                className="w-full h-full"
              />
              )}
          </div>
        );
        break;
      default:
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color} rounded`}></div>
        );
    }

    const obstacleHealthPct = obstacle.health / obstacle.maxHealth;

    return (
      <div
        key={obstacle.id}
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          // FIXED: Applied clipping logic to obstacle rendering position
          left: `${Math.min(100, Math.max(-20, obstacle.position))}%` // Ensure obstacle is rendered within a reasonable range
        }}
      >
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-visible border border-gray-600 shadow-sm relative">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>

             {/* CORRECTED: hasKey logic is now correct, icon will render when true */}
             {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Key"
                className="absolute w-4 h-4"
                style={{
                    bottom: 'calc(100% + 4px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
              />
            )}
        </div>

        {obstacleEl}
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
          const target = e as any; // Cast to any to access target
          target.onerror = null;
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud";
        }}
      />
    ));
  };

  // Render dust particles
  const renderParticles = () => {
    return particles.map(particle => (
      <div
        key={particle.id}
        className={`absolute rounded-full ${particle.color}`}
        style={{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`,
          left: `calc(5% + ${particle.x}px)`,
          opacity: particle.opacity
        }}
      ></div>
    ));
  };

  // --- NEW: Render Shield ---
  const renderShield = () => {
    if (!isShieldActive) return null;

    const shieldSizePx = 80;

    return (
      <div
        key="character-shield"
        className="absolute w-20 h-20 flex flex-col items-center justify-center pointer-events-none z-20"
         style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 96px)`,
          left: '13%',
          transform: 'translate(-50%, -50%)',
          transition: 'bottom 0.3s ease-out, left 0.3s ease-out',
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
        }}
      >
        {shieldHealth > 0 && (
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                    style={{ width: `${shieldHealthPct * 100}%` }}
                ></div>
            </div>
        )}

        <DotLottieReact
          src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
          loop
          // Tự động chạy animation khi khiên active, bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
          autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
          className="w-full h-full"
        />
      </div>
    );
  };


  // --- NEW: Render Coins ---
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id}
        className="absolute w-10 h-10"
        style={{
          // FIXED: Applied clipping logic to coin rendering position
          top: `${Math.min(120, Math.max(-20, coin.y))}%`, // Ensure coin is rendered within a reasonable range
          left: `${Math.min(120, Math.max(-20, coin.x))}%`, // Ensure coin is rendered within a reasonable range
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
           // Tự động chạy animation khi bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
          className="w-full h-full"
        />
      </div>
    ));
  };


  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    // Ngăn mở bảng thống kê/xếp hạng nếu đang tải dữ liệu hoặc icon hồi sinh đang hiển thị hoặc modal unlock đang mở
    if (isLoadingUserData || showReviveIcon || showUnlockModal) return; // Added showReviveIcon and showUnlockModal

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) {
            hideNavBar(); // Ẩn navbar khi mở bảng thống kê/xếp hạng
            setIsRankOpen(false); // Ensure Rank is closed when Stats opens
        } else {
            showNavBar(); // Hiện navbar khi đóng bảng thống kê/xếp hạng
        }
        return newState;
    });
  };

  // NEW: Function to toggle Rank visibility
  const toggleRank = () => {
     // Ngăn mở bảng xếp hạng nếu đang tải dữ liệu hoặc icon hồi sinh đang hiển thị hoặc modal unlock đang mở
     if (isLoadingUserData || showReviveIcon || showUnlockModal) return; // Added showReviveIcon and showUnlockModal

     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar(); // Ẩn navbar khi mở bảng xếp hạng
             setIsStatsFullscreen(false); // Ensure Stats is closed when Rank opens
         } else {
             showNavBar(); // Hiện navbar khi đóng bảng xếp hạng
         }
         return newState;
         });
  };

  // NEW: Function to show Home content (close any fullscreen overlays)
  const showHome = () => {
      setIsStatsFullscreen(false);
      setIsRankOpen(false);
      setShowUnlockModal(false); // Also close the unlock modal
      showNavBar(); // Ensure navbar is visible
  };


  // Handler to receive the sidebar toggle function from SidebarLayout
  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  // NEW: Function to handle closing the unlock modal
  const handleCloseUnlockModal = () => {
      setShowUnlockModal(false);
      // Optionally, resume game elements here if needed, but the main health effect should handle it.
      // If the user doesn't revive, the revive icon remains.
  };

  // NEW: Function to handle successful revive from the modal
  const handleRevive = () => {
      console.log("Player revived!");
      setHealth(MAX_HEALTH / 2); // Example: Revive with half health
      setShowUnlockModal(false); // Close the modal
      setShowReviveIcon(false); // Hide the revive icon
      // The health effect will detect health > 0 and resume game elements
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
  // Prioritize modal unlock if open
  if (showUnlockModal) {
      mainContent = (
          <GameUnlockModal
              isOpen={showUnlockModal}
              onClose={handleCloseUnlockModal}
              onRevive={handleRevive} // Pass the revive handler to the modal
          />
      );
  } else if (isStatsFullscreen) {
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
  } else {
      // Default game content
      mainContent = (
          <div
            ref={gameRef}
            // THAY ĐỔI BƯỚC 2 Ở ĐÂY: className từ h-screen thành h-full
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`}
            // Đã bỏ style={{ overflowX: 'hidden' }} vì overflow-hidden đã bao gồm
            onClick={handleTap} // Handle tap for start/restart (only if game not started or revive icon not shown)
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div>

            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div>

            {renderClouds()}

            <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600">
                    <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                    <div className="w-3 h-3 bg-gray-900 rounded-full absolute top-6 left-20"></div>
                    <div className="w-4 h-2 bg-gray-900 rounded-full absolute top-10 left-40"></div>
                    <div className="w-6 h-3 bg-gray-900 rounded-full absolute top-8 right-10"></div>
                    <div className="w-3 h-1 bg-gray-900 rounded-full absolute top-12 right-32"></div>
                </div>
            </div>

            {renderCharacter()}

            {renderShield()}

            {obstacles.map(obstacle => renderObstacle(obstacle))}

            {renderCoins()}

            {renderParticles()}

            {/* Main header container */}
            {/* MODIFIED: Added HeaderBackground component here and the new Menu Button */}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden
                        rounded-b-lg shadow-2xl
                        bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                        border-b border-l border-r border-slate-700/50">

                {/* Use the HeaderBackground component */}
                <HeaderBackground />

                {/* NEW Menu Button - Placed before the HP bar container */}
                {/* Chỉ hiển thị nút menu khi không hiển thị icon hồi sinh và modal unlock */}
                {!showReviveIcon && !showUnlockModal && (
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
                                const target = e as any; // Cast to any to access target
                                target.onerror = null;
                                target.src = "https://placehold.co/20x20/ffffff/000000?text=Menu"; // Fallback image
                            }}
                         />
                    </button>
                )}


                <div className="flex items-center relative z-10"> {/* Added relative and z-10 to bring content above background layers */}
                  {/* REMOVED: StatsIcon is moved to the sidebar */}
                  {/* <StatsIcon onClick={toggleStatsFullscreen} /> */}

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
               {/* Chỉ hiển thị thông tin tiền tệ khi bảng thống kê/xếp hạng và rank KHÔNG mở VÀ KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở*/}
               {(!isStatsFullscreen && !isRankOpen && !showReviveIcon && !showUnlockModal) && ( // Added showReviveIcon and showUnlockModal checks
                  <div className="flex items-center space-x-1 currency-display-container relative z-10"> {/* Added relative and z-10 */}
                      {/* REMOVED: Display "OK" text */}
                      {/*
                      {showCoinUpdateSuccess && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-lg animate-fadeInOut pointer-events-none z-50">
                              OK
                          </div>
                      )}
                      */}
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
                        // Truyền trạng thái tạm dừng game (bao gồm cả khi bảng thống kê/xếp hạng/rank mở, icon hồi sinh hiển thị, modal unlock mở VÀ game đang tạm dừng do chạy nền)
                        isGamePaused={isStatsFullscreen || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal} // Added showReviveIcon and showUnlockModal
                      />
                  </div>
               )}
            </div>

            {/* REMOVED: Game Over Screen */}
            {/*
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
            */}

            {/* NEW: Revive Heart Icon */}
            {showReviveIcon && !showUnlockModal && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/heart.png"
                        alt="Revive Icon"
                        className="w-24 h-24 cursor-pointer animate-pulse"
                        onClick={() => setShowUnlockModal(true)} // Open the modal on click
                    />
                </div>
            )}


            {/* Keep these buttons, they are not part of the main header or sidebar */}
            {/* Chỉ hiển thị các nút này khi bảng thống kê/xếp hạng và rank KHÔNG mở VÀ KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở */}
            {(!isStatsFullscreen && !isRankOpen && !showReviveIcon && !showUnlockModal) && ( // Added showReviveIcon and showUnlockModal checks
              <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  {
                    icon: (
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                          <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                          <div className="absolute top-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                      </div>
                    ),
                    label: "Shop",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600">
                          <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                          <div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center">
                            <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                      </div>
                    ),
                    label: "Inventory",
                    notification: true,
                    special: true,
                    centered: true
                  }
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
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

             {/* Chỉ hiển thị nút khiên khi bảng thống kê/xếp hạng và rank KHÔNG mở VÀ KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở */}
             {(!isStatsFullscreen && !isRankOpen && !showReviveIcon && !showUnlockModal) && ( // Added showReviveIcon and showUnlockModal checks
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">

                 <div
                  className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`} // Added showReviveIcon and showUnlockModal checks
                  onClick={activateShield}
                  title={
                    !gameStarted || isLoadingUserData || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal ? "Không khả dụng" : // Added showReviveIcon and showUnlockModal checks
                    isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                    isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                    isStatsFullscreen ? "Không khả dụng" :
                    "Kích hoạt Khiên chắn"
                  }
                  aria-label="Sử dụng Khiên chắn"
                  role="button"
                  tabIndex={!gameStarted || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal ? -1 : 0} // Added showReviveIcon and showUnlockModal checks
                >
                  <div className="w-10 h-10">
                     <DotLottieReact
                        src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                        loop
                        // Tự động chạy animation khi khiên active, bảng thống kê/xếp hạng/rank KHÔNG mở, KHÔNG đang tải dữ liệu, KHÔNG hiển thị icon hồi sinh, modal unlock KHÔNG mở VÀ game KHÔNG tạm dừng do chạy nền
                        autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !showReviveIcon && !showUnlockModal} // Added showReviveIcon and showUnlockModal
                        className="w-full h-full"
                     />
                  </div>
                  {/* MODIFIED: Conditional rendering for cooldown text */}
                  {isShieldOnCooldown && remainingCooldown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold">
                      {remainingCooldown}s
                    </div>
                  )}
                </div>

                {[
                  {
                    icon: (
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600">
                          <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                          <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center">
                            <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div>
                            <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div>
                            <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                      </div>
                    ),
                    label: "Mission",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600">
                          <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                          <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center">
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div>
                            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div>
                            <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div>
                            <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div>
                            <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div>
                            <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                      </div>
                    ),
                    label: "Blacksmith",
                    notification: true,
                    special: true,
                    centered: true
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
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
                console.log(`Chest opened using ${n} key(s).`);
                // Update local state first
                setKeyCount(prev => Math.max(0, prev - n));
                // Then update Firestore
                if (auth.currentUser) {
                  updateKeysInFirestore(auth.currentUser.uid, -n); // Subtract keys
                } else {
                  console.log("User not authenticated, skipping Firestore key update.");
                }
              }}
              // Use startCoinCountAnimation to handle coin rewards from chests
              onCoinReward={startCoinCountAnimation}
              onGemReward={handleGemReward} // NEW: Pass the gem reward handler
              // Truyền trạng thái tạm dừng game (bao gồm cả khi bảng thống kê/xếp hạng/rank mở, icon hồi sinh hiển thị, modal unlock mở VÀ game đang tạm dừng do chạy nền)
              isGamePaused={isStatsFullscreen || isRankOpen || isBackgroundPaused || showReviveIcon || showUnlockModal} // Added showReviveIcon and showUnlockModal
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
          onShowStats={toggleStatsFullscreen} // Pass the toggleStatsFullscreen function here
          onShowRank={toggleRank} // Pass the toggleRank function here
          onShowHome={showHome} // Pass the new showHome function
          // Add handlers for other menu items here if needed
      >
        {mainContent} {/* Render the determined main content as children */}
      </SidebarLayout>
    </div>
  );
}

