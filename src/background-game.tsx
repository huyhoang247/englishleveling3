import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
import CharacterCard from './stats/stats-main.tsx';
// Assuming stats.tsx is in the same directory

// Import DotLottieReact component
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// NEW: Import the TreasureChest component
import TreasureChest from './treasure.tsx';

// NEW: Import the CoinDisplay component
import CoinDisplay from './coin-display.tsx';

// NEW: Import Firestore functions
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase.js';
// Import auth from your firebase.js
// Import User type from firebase/auth
import { User } from 'firebase/auth';

// NEW: Import the custom useSessionStorage hook
import useSessionStorage from './bo-nho-tam.tsx';

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
    <line x1="6" y1="6" x2="18" y1="18" />
  </svg>
);
const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/tourmaline.png"
      alt="Tourmaline Gem Icon"
      className="w-full h-full object-contain"
      onError={(e) => {
        const target = e as any; // Cast to any to access target
        target.onerror = null;
        target.src = "https://placehold.co/24x24/8a2be2/ffffff?text=Gem";
      }}
    />
  </div>
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
      return this.props.fallback ||
        (
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
  collided?: boolean; // THÊM: Dùng để đánh dấu obstacle đã va chạm và chờ bị xóa
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
  collided?: boolean; // THÊM: Dùng để đánh dấu coin đã va chạm/thu thập và chờ bị xóa
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
    nextKeyIn: number; // THAY ĐỔI: Tên key trong session storage
    // Add other temporary game state you want to save
}


// Update component signature to accept className, hideNavBar, showNavBar, and currentUser props
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {
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
  const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; xVelocity: number; yVelocity: number; opacity: number; color: string; size: number }>>([]); // Array of active particles (dust) // SỬA ĐỔI: Thêm type cho size
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect

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
  // SỬA ĐỔI: Thay đổi cách khai báo và sử dụng nextKeyIn
  const [nextKeyIn, setNextKeyIn] = useSessionStorage<number>('gameNextKeyIn', randomBetween(5, 10));
  const [keyCount, setKeyCount] = useState(0); // Player's key count


  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // NEW: State to track user data loading

  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;
  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref for the main game container div - Specify type
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new obstacles - Specify type
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Timer for character run animation - Specify type
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for generating particles - Specify type

  // NEW: Ref for the main game loop interval
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Specify type


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
      if (step === 0 && reward > 0) step = 1; // Ensure step is at least 1 if there's a reward
      if (reward === 0) { // If no reward, no animation needed
          if (auth.currentUser) {
             updateCoinsInFirestore(auth.currentUser.uid, reward);
          }
          return;
      }
      let current = oldCoins;
      // Clear any existing coin count animation interval
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if ((step > 0 && current >= newCoins) || (step < 0 && current <= newCoins)) {
              setDisplayedCoins(newCoins);
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
            keys: amount, // Initialize keys with the current amount being added/subtracted
            createdAt: new Date()
          });
           setKeyCount(Math.max(0, amount)); // Update local state
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
      if (auth.currentUser) {
        // Example: Assuming you have an updateGemsInFirestore function
        // updateGemsInFirestore(auth.currentUser.uid, amount);
        // For now, let's just log it and update the local state
         const userDocRef = doc(db, 'users', auth.currentUser.uid);
         runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                 transaction.set(userDocRef, { gems: amount, coins: coins, keys: keyCount, createdAt: new Date() });
            } else {
                const currentGems = userDoc.data().gems || 0;
                transaction.update(userDocRef, { gems: currentGems + amount });
            }
         }).then(() => {
            console.log("Gems updated in Firestore.");
         }).catch(error => {
            console.error("Firestore transaction for gems failed:", error);
         });
      }
  };
  // NEW: Function to handle key collection (called when obstacle with key is hit AND DEFEATED - this logic needs adjustment)
  // SỬA ĐỔI: handleKeyCollect sẽ được gọi khi obstacle bị phá hủy, không phải khi va chạm.
  // Hiện tại, va chạm đã gọi handleKeyCollect, điều này cần được xem xét lại.
  // Tạm thời giữ nguyên, nhưng logic nên là chìa khóa rơi ra khi obstacle bị tiêu diệt.
  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // Update local state first for responsiveness (will be confirmed by Firestore update)
      // setKeyCount(prev => prev + amount); // Firestore update will set this
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
    setObstacles([]);
    setActiveCoins([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    setShieldCooldownStartTime(null); // Use the setter from the hook
    setPausedShieldCooldownRemaining(null); // Use the setter from the hook
    // SỬA ĐỔI: Cập nhật nextKeyIn bằng setNextKeyIn
    setNextKeyIn(randomBetween(5, 10));

    // Reset states that don't use session storage
    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);

    // Game elements setup
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        // SỬA ĐỔI: Logic gán hasKeyFirst
        const hasKeyFirst = (() => {
          let currentKeyValue = 0;
          setNextKeyIn(prev => {
            currentKeyValue = prev - 1;
            return currentKeyValue;
          });
          if (currentKeyValue <= 0) {
            setNextKeyIn(randomBetween(5, 10));
            return true;
          }
          return false;
        })();

        initialObstacles.push({
          id: Date.now(),
          position: 120,
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: hasKeyFirst,
        });
        for (let i = 1; i < 5; i++) {
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const spacing = i * (Math.random() * 10 + 10);
          // SỬA ĐỔI: Logic gán hasKey
          const hasKey = (() => {
            let currentKeyValue = 0;
            setNextKeyIn(prev => {
              currentKeyValue = prev - 1;
              return currentKeyValue;
            });
            if (currentKeyValue <= 0) {
              setNextKeyIn(randomBetween(5, 10));
              return true;
            }
            return false;
          })();
          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50),
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKey,
          });
        }
    }

    setObstacles(initialObstacles);
    generateInitialClouds(5);

    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    particleTimerRef.current = setInterval(generateParticles, 300);

    scheduleNextObstacle();
    scheduleNextCoin();
  };
  // Effect to fetch user data from Firestore on authentication state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User authenticated:", user.uid);
        fetchUserData(user.uid); // Fetch user data when authenticated
        // The useSessionStorage hook will automatically load game state if available
        // Only start game if not already started from session or user explicitly starts
        // setGameStarted(true); // Avoid auto-starting if loading from session
        setIsRunning(true); // Start running animation
      } else {
        console.log("User logged out.");
        // Reset all game states on logout, including clearing session storage
        setGameStarted(false);
        setGameOver(false); // Ensure game over is also set
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
        // SỬA ĐỔI: Cập nhật nextKeyIn bằng setNextKeyIn khi logout
        setNextKeyIn(randomBetween(5, 10));


        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
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
        sessionStorage.removeItem('gameNextKeyIn'); // THAY ĐỔI: Key trong session storage
        // Clear timers and intervals
        if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        if(runAnimationRef.current) clearInterval(runAnimationRef.current);
        if(particleTimerRef.current) clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current); // SỬA ĐỔI: clearTimeout
        if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current); // SỬA ĐỔI: clearInterval

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // THAY ĐỔI: Bỏ auth khỏi dependency array vì auth object thường không thay đổi. Nếu có vấn đề, thêm lại.

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) { // THÊM: !gameOver để tránh chạy nhiều lần
      setGameOver(true);
      setIsRunning(false);
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      // No need to reset session storage states here, the hook handles saving the current state (including null)
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current); // SỬA ĐỔI: clearTimeout
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current); // SỬA ĐỔI: clearInterval

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted, gameOver]); // THÊM: gameOver vào dependencies
  // Generate initial cloud elements
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        x: Math.random() * 120 + 100,
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
    if (!gameStarted || gameOver || isStatsFullscreen) return;
    const newParticles = [];
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(), // THÊM Math.random() để key duy nhất hơn
        x: 5 + Math.random() * 5,
        y: 0, // Sẽ được điều chỉnh tương đối với GROUND_LEVEL_PERCENT
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1, // Cho phép hạt bay lên hoặc xuống một chút
        opacity: 1,
        size: Math.random() * 3 + 2, // Kích thước hạt
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Giới hạn số lượng particles
  };
  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // THÊM !gameStarted
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 15000) + 5000; // SỬA ĐỔI: Có thể điều chỉnh thời gian này
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear previous timer
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Kiểm tra lại trước khi tạo obstacle

      const obstacleCount = Math.floor(Math.random() * 2) + 1; // Ít obstacle hơn một chút
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 20 + 30); // Tăng khoảng cách tối thiểu

            // SỬA ĐỔI: Logic gán hasKey
            const hasKey = (() => {
              let currentKeyValue = 0;
              setNextKeyIn(prev => {
                currentKeyValue = prev - 1;
                return currentKeyValue;
              });
              if (currentKeyValue <= 0) {
                setNextKeyIn(randomBetween(5, 10));
                return true;
              }
              return false;
            })();

            newObstacles.push({
              id: Date.now() + i + Math.random(), // Đảm bảo ID duy nhất
              position: 100 + spacing, // Xuất hiện từ ngoài màn hình
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle(); // Lên lịch cho obstacle tiếp theo
    }, randomTime);
  };
  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // THÊM !gameStarted
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
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Kiểm tra lại

      const newCoin: GameCoin = {
        id: Date.now() + Math.random(), // Đảm bảo ID duy nhất
        x: 110, // Xuất hiện từ ngoài màn hình bên phải
        y: Math.random() * (GROUND_LEVEL_PERCENT - 10) + 5, // Xuất hiện phía trên mặt đất
        initialSpeedX: Math.random() * 0.5 + 0.5,
        initialSpeedY: (Math.random() - 0.5) * 0.2, // Có thể bay lên hoặc xuống một chút ban đầu
        attractSpeed: Math.random() * 0.05 + 0.03,
        isAttracted: false
      };
      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin(); // Lên lịch cho coin tiếp theo
    }, randomTime);
  };


  // Handle character jump action
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80); // Độ cao nhảy
      setTimeout(() => {
        // Không cần kiểm tra gameStarted, gameOver nữa vì nếu game over thì jumping sẽ được reset
        setCharacterPos(0); // Quay lại mặt đất
        setTimeout(() => {
          setJumping(false);
        }, 100); // Thời gian ở trên không sau khi chạm đất (để hoàn thành animation nếu có)
      }, 600); // Thời gian nhảy lên
    }
  };
  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData) return; // Ignore taps if loading data or stats are fullscreen

    if (!gameStarted && !currentUser) { // Nếu chưa đăng nhập và chưa bắt đầu
        // Có thể hiển thị thông báo yêu cầu đăng nhập
        console.log("Please login to start the game.");
        return;
    }

    if (!gameStarted && currentUser) { // Đã đăng nhập, chưa bắt đầu
      startNewGame();
    } else if (gameOver) {
      startNewGame();
    } else if (gameStarted) {
      // Chỉ nhảy nếu game đã bắt đầu và không game over
      jump();
    }
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
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
      console.log("Cannot activate Shield:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData });
      return;
    }

    console.log("Activating Shield!");

    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH); // Reset shield health on activation

    setIsShieldOnCooldown(true);
    const now = Date.now();
    setShieldCooldownStartTime(now);
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000));
    setPausedShieldCooldownRemaining(null);

    console.log(`Shield activated at: ${now}. shieldCooldownStartTime state set to: ${now}`);

    if (shieldCooldownTimerRef.current) {
        clearTimeout(shieldCooldownTimerRef.current);
    }
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Shield cooldown ended.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        setShieldCooldownStartTime(null);
        setPausedShieldCooldownRemaining(null);
    }, SHIELD_COOLDOWN_TIME);
  };


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  // This useEffect is the main game loop for movement and collision detection
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        // Không clear particleTimerRef ở đây vì nó được quản lý ở useEffect khác
        return;
    }

    if (!gameLoopIntervalRef.current) { // Chỉ tạo interval nếu chưa có
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Tốc độ di chuyển của obstacle

            // Update Obstacles
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;
                const characterWidth_px = (24 / 4) * 16; // Giả sử nhân vật là 24 tailwind units, 1 unit = 4px
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5; // Vị trí X của nhân vật theo %
                const characterX_px = (characterXPercent / 100) * gameWidth;

                // Vị trí Y của nhân vật (tính từ dưới lên)
                // characterPos là độ cao nhảy (tính từ GROUND_LEVEL_PERCENT)
                // GROUND_LEVEL_PERCENT là mặt đất ảo (tính từ dưới lên)
                const characterBottom_px = ((characterPos / gameHeight) * 100 + GROUND_LEVEL_PERCENT) / 100 * gameHeight;
                const characterTop_px = characterBottom_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;


                return prevObstacles.map(obstacle => {
                    if (obstacle.collided) return obstacle; // Bỏ qua obstacle đã va chạm

                    let newPosition = obstacle.position - speed;
                    const obstacleX_px = (newPosition / 100) * gameWidth;
                    const obstacleWidth_px = (obstacle.width / 4) * 16;
                    const obstacleHeight_px = (obstacle.height / 4) * 16;

                    // Vị trí Y của obstacle (tính từ dưới lên)
                    // Obstacles nằm trên GROUND_LEVEL_PERCENT
                    const obstacleBottom_px = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                    const obstacleTop_px = obstacleBottom_px - obstacleHeight_px;

                    let collisionDetectedThisFrame = false;
                    const collisionTolerance = 5; // Độ dung sai cho va chạm

                    if (
                        characterRight_px > obstacleX_px - collisionTolerance &&
                        characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                        characterBottom_px > obstacleTop_px - collisionTolerance && // Nhân vật ở trên đáy obstacle
                        characterTop_px < obstacleBottom_px + collisionTolerance    // Nhân vật ở dưới đỉnh obstacle
                    ) {
                        collisionDetectedThisFrame = true;
                        if (isShieldActive) {
                            setShieldHealth(prev => {
                                const damageToShield = obstacle.damage;
                                const newShieldHealth = Math.max(0, prev - damageToShield);
                                if (newShieldHealth <= 0) {
                                    console.log("Shield health depleted.");
                                    setIsShieldActive(false); // Tắt khiên khi hết máu
                                }
                                return newShieldHealth;
                            });
                            // Obstacle cũng nên bị trừ máu hoặc biến mất khi va chạm khiên
                            // Tạm thời để obstacle biến mất
                             return { ...obstacle, position: newPosition, health: 0, collided: true };

                        } else {
                            const damageTaken = obstacle.damage;
                            setHealth(prev => Math.max(0, prev - damageTaken));
                            triggerHealthDamageEffect();
                            triggerCharacterDamageEffect(damageTaken);
                        }
                        // SỬA ĐỔI: Chìa khóa chỉ được thu thập khi obstacle bị phá hủy, không phải khi va chạm
                        // Việc gọi handleKeyCollect sẽ được chuyển xuống phần lọc obstacle health <= 0
                        // if (obstacle.hasKey) {
                        //     handleKeyCollect(1);
                        // }
                        // Đánh dấu obstacle đã va chạm và sẽ bị loại bỏ
                        return { ...obstacle, position: newPosition, health: 0, collided: true }; // Giảm health về 0 để bị lọc
                    }

                    // Nếu obstacle ra khỏi màn hình bên trái và chưa va chạm
                    if (newPosition < -20 && !obstacle.collided) { // -20% để đảm bảo obstacle hoàn toàn ra khỏi màn hình
                        // Logic tái tạo obstacle nếu cần (hiện tại đang được scheduleNextObstacle xử lý)
                        // Nếu muốn tái tạo ngay lập tức từ đây:
                        if (Math.random() < 0.7 && obstacleTypes.length > 0) { // Tỷ lệ tái tạo
                            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                            const randomOffset = Math.floor(Math.random() * 20);
                            // SỬA ĐỔI: Logic gán hasKey khi tái tạo obstacle
                            const hasKeyOnRespawn = (() => {
                                let currentKeyValue = 0;
                                setNextKeyIn(prev => {
                                  currentKeyValue = prev - 1;
                                  return currentKeyValue;
                                });
                                if (currentKeyValue <= 0) {
                                  setNextKeyIn(randomBetween(5, 10));
                                  return true;
                                }
                                return false;
                              })();
                            return {
                                ...obstacle, // Giữ lại ID cũ hoặc tạo ID mới nếu cần
                                id: Date.now() + Math.random(), // Tạo ID mới để tránh lỗi key
                                ...randomObstacleType,
                                position: 120 + randomOffset, // Vị trí xuất hiện mới
                                health: randomObstacleType.baseHealth, // Reset health
                                maxHealth: randomObstacleType.baseHealth,
                                hasKey: hasKeyOnRespawn,
                                collided: false, // Reset trạng thái va chạm
                            };
                        } else {
                             // Đánh dấu để xóa nếu không tái tạo
                            return { ...obstacle, position: newPosition, health: 0, collided: true };
                        }
                    }
                    return { ...obstacle, position: newPosition };
                }).filter(obstacle => {
                    // Giữ lại obstacle nếu nó chưa bị đánh dấu "collided" VÀ vẫn còn máu VÀ chưa hoàn toàn ra khỏi màn hình
                    // Nếu obstacle hết máu và có key, thì thu thập key
                    if(obstacle.health <= 0 && obstacle.hasKey && !obstacle.collided) { // !obstacle.collided để đảm bảo key chỉ được collect 1 lần
                        handleKeyCollect(1);
                        // Đánh dấu là đã xử lý key để tránh lặp lại
                        return { ...obstacle, hasKey: false, collided: true }; // Đánh dấu collided để bị xóa ở lần filter tiếp
                    }
                    return !obstacle.collided && obstacle.position > -20 && obstacle.health > 0;
                });
            });

            // Update Clouds
            setClouds(prevClouds => {
                return prevClouds.map(cloud => {
                    const newX = cloud.x - cloud.speed;
                    if (newX < -50) { // Cloud ra khỏi màn hình bên trái
                        const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                        return {
                            ...cloud,
                            id: Date.now() + Math.random(), // ID mới
                            x: 120 + Math.random() * 30, // Vị trí X mới (ngoài màn hình phải)
                            y: Math.random() * 40 + 10, // Vị trí Y ngẫu nhiên
                            size: Math.random() * 40 + 30,
                            speed: Math.random() * 0.3 + 0.15,
                            imgSrc: randomImgSrc
                        };
                    }
                    return { ...cloud, x: newX };
                });
            });

            // Update Particles
            setParticles(prevParticles =>
                prevParticles.map(particle => ({
                    ...particle,
                    x: particle.x + particle.xVelocity,
                    y: particle.y + particle.yVelocity,
                    opacity: particle.opacity - 0.03,
                    size: Math.max(0, particle.size - 0.1) // Đảm bảo size không âm
                })).filter(particle => particle.opacity > 0 && particle.size > 0)
            );

            // Update Active Coins
            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;
                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const characterBottom_px = ((characterPos / gameHeight) * 100 + GROUND_LEVEL_PERCENT) / 100 * gameHeight;
                const characterTop_px = characterBottom_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;
                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTop_px + characterHeight_px / 2; // Tâm nhân vật theo trục Y (từ dưới lên)

                return prevCoins.map(coin => {
                    if (coin.collided) return coin; // Bỏ qua coin đã thu thập

                    const coinSize_px = 40; // Kích thước coin (width/height)
                    let coinX_px = (coin.x / 100) * gameWidth;
                    let coinY_px = (coin.y / 100) * gameHeight; // Vị trí Y của coin (từ trên xuống)

                    let newX = coin.x;
                    let newY = coin.y;
                    let shouldBeAttracted = coin.isAttracted;

                    // Vùng va chạm của coin (tính từ tâm coin)
                    const coinHitboxRadius = coinSize_px / 2;

                    // Chuyển đổi Y của coin (từ trên xuống) sang Y (từ dưới lên) để so sánh với nhân vật
                    const coinBottom_px_from_bottom = gameHeight - coinY_px;
                    const coinTop_px_from_bottom = gameHeight - (coinY_px - coinSize_px); // Giả sử coin.y là đỉnh coin
                                                                                        // Nếu coin.y là tâm coin, thì coinTop_px_from_bottom = gameHeight - (coinY_px - coinHitboxRadius)
                                                                                        // và coinBottom_px_from_bottom = gameHeight - (coinY_px + coinHitboxRadius)
                                                                                        // Hiện tại đang giả sử coin.y là topleft của coin div

                    // Điều chỉnh: Giả sử coin.y là đỉnh của div chứa coin
                    const coinRenderTop_px = coinY_px; // Y từ trên xuống
                    const coinRenderBottom_px = coinY_px + coinSize_px; // Y từ trên xuống
                    const coinRenderLeft_px = coinX_px - coinSize_px / 2; // X là tâm
                    const coinRenderRight_px = coinX_px + coinSize_px / 2; // X là tâm


                    // Phát hiện va chạm để bắt đầu hút (isAttracted)
                    // Tăng vùng phát hiện hút coin một chút
                    const attractionRangeFactor = 2.5;
                    if (!shouldBeAttracted) {
                        if (
                            characterRight_px > coinRenderLeft_px - (coinSize_px * attractionRangeFactor) &&
                            characterLeft_px < coinRenderRight_px + (coinSize_px * attractionRangeFactor) &&
                            characterBottom_px > (gameHeight - coinRenderBottom_px) - (coinSize_px * attractionRangeFactor) && // Chuyển Y của coin sang hệ tọa độ từ dưới lên
                            characterTop_px < (gameHeight - coinRenderTop_px) + (coinSize_px * attractionRangeFactor)
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted) {
                        // Hút coin về tâm nhân vật
                        // characterCenterY_px là tâm Y của nhân vật tính từ dưới lên
                        // coinY_px là đỉnh Y của coin div tính từ trên xuống
                        // Cần chuyển coinY_px (tâm coin) sang hệ tọa độ từ dưới lên
                        const coinCenterY_px_from_top = coinY_px + coinSize_px / 2;
                        const coinCenterX_px_from_left = coinX_px; // coin.x là tâm X

                        const dx = characterCenterX_px - coinCenterX_px_from_left;
                        // dy là khoảng cách theo Y, characterCenterY_px (từ dưới lên) và (gameHeight - coinCenterY_px_from_top) (từ dưới lên)
                        const dy = characterCenterY_px - (gameHeight - coinCenterY_px_from_top);

                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const moveStep = distance * coin.attractSpeed; // Tốc độ hút

                        const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                        const moveY_px_towards_char_bottom_up = distance === 0 ? 0 : (dy / distance) * moveStep;

                        // coinX_px (tâm) và coinY_px (đỉnh)
                        let newCoinCenterX_px = coinCenterX_px_from_left + moveX_px;
                        // newCoinCenterY_px_from_top là tâm Y mới của coin, tính từ trên xuống
                        let newCoinCenterY_px_from_top = coinCenterY_px_from_top - moveY_px_towards_char_bottom_up;

                        newX = (newCoinCenterX_px / gameWidth) * 100;
                        newY = ((newCoinCenterY_px_from_top - coinSize_px/2) / gameHeight) * 100; // newY là đỉnh của div


                        // Kiểm tra va chạm thực sự để thu thập coin
                        const collectDistance = characterWidth_px / 2 + coinSize_px / 2; // Khoảng cách từ tâm đến tâm
                        if (distance < collectDistance * 0.8) { // Thu thập khi gần chạm
                            const awardedCoins = Math.floor(Math.random() * 5) + 1;
                            console.log(`Coin collected! Awarded: ${awardedCoins}. Calling startCoinCountAnimation.`);
                            startCoinCountAnimation(awardedCoins);
                            console.log(`Coin collected! Awarded: ${awardedCoins}`);
                            return { ...coin, x: newX, y: newY, isAttracted: true, collided: true }; // Đánh dấu đã thu thập
                        }
                    } else {
                        // Di chuyển bình thường nếu chưa được hút
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY;
                    }

                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collided: false };
                }).filter(coin => {
                    // Loại bỏ coin nếu đã thu thập hoặc ra khỏi màn hình
                    const isOffScreen = coin.x < -20 || coin.y > 120 || coin.y < -20;
                    return !coin.collided && !isOffScreen;
                });
            });

        }, 30); // Tần suất cập nhật game loop (ms)
    }

    return () => { // Cleanup khi component unmount hoặc dependencies thay đổi
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
    };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, characterPos, health, shieldHealth, isShieldActive, nextKeyIn]); // THÊM nextKeyIn vào dependencies
  // SỬA ĐỔI: Bỏ obstacles, activeCoins ra khỏi dependencies của game loop chính để tránh re-run không cần thiết khi chúng thay đổi bên trong loop.
  // Việc setObstacles, setActiveCoins sẽ tự trigger re-render.
  // Nếu có vấn đề về logic cập nhật, cần xem xét lại dependencies.


  // Effect to manage obstacle and coin scheduling timers based on game state and fullscreen state
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || !gameStarted) { // THÊM !gameStarted
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
           if (particleTimerRef.current) { // Dừng tạo hạt khi game paused
               clearInterval(particleTimerRef.current);
               particleTimerRef.current = null;
           }
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData) {
          if (!obstacleTimerRef.current) { // Chỉ schedule nếu chưa có timer
              scheduleNextObstacle();
          }
          if (!coinScheduleTimerRef.current) { // Chỉ schedule nếu chưa có timer
              scheduleNextCoin();
          }
           if (!particleTimerRef.current) { // Chỉ schedule nếu chưa có timer
               particleTimerRef.current = setInterval(generateParticles, 300);
           }
      }

      return () => { // Cleanup timers
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
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]);
  // Dependencies include loading state

  // *** MODIFIED Effect: Manage shield cooldown countdown display AND main cooldown timer pause/resume ***
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      console.log("Shield Cooldown Effect running:", {
          isShieldOnCooldown,
          gameOver,
          isStatsFullscreen,
          isLoadingUserData,
          gameStarted,
          shieldCooldownStartTime,
          pausedShieldCooldownRemaining,
          currentCooldownTimer: !!shieldCooldownTimerRef.current,
          currentCountdownTimer: !!cooldownCountdownTimerRef.current
      });

      // Clear timers if game is inactive or paused
      if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted) {
          console.log("Game inactive or paused. Clearing/Pausing shield timers.");
          if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) {
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              setPausedShieldCooldownRemaining(remainingTimeMs);
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log(`Main shield cooldown PAUSED with ${remainingTimeMs}ms remaining.`);
          }

          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield display countdown PAUSED.");
          }
      } else if (isShieldOnCooldown) { // Start/continue countdown if shield is on cooldown and game is active
           console.log("Shield is on cooldown and game is active.");
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) { // Resuming
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               console.log(`Resuming main shield cooldown with ${remainingTimeToResume}ms.`);
               setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume)); // Adjust start time
               setPausedShieldCooldownRemaining(null); // Clear paused time

               shieldCooldownTimerRef.current = setTimeout(() => {
                   console.log("Shield cooldown ended (after pause).");
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null);
               }, remainingTimeToResume);

               // Start/Resume countdown display
               const initialRemainingSeconds = Math.ceil(remainingTimeToResume / 1000);
               setRemainingCooldown(initialRemainingSeconds);
               if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); // Clear existing before starting new
               cooldownCountdownTimerRef.current = setInterval(() => {
                   setRemainingCooldown(prev => {
                       const newRemaining = Math.max(0, prev - 1);
                       if (newRemaining === 0) {
                           if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
                           cooldownCountdownTimerRef.current = null;
                           console.log("Shield display countdown finished (after resume).");
                       }
                       return newRemaining;
                   });
               }, 1000);


           } else if (shieldCooldownStartTime !== null && cooldownCountdownTimerRef.current === null) { // Starting new countdown
                const now = Date.now();
                const elapsedTime = now - shieldCooldownStartTime;
                const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
                const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);
                console.log(`Calculating remaining cooldown: now=${now}, startTime=${shieldCooldownStartTime}, elapsedTime=${elapsedTime}, remainingMs=${remainingTimeMs}, initialSeconds=${initialRemainingSeconds}`);

                if (initialRemainingSeconds > 0) {
                    setRemainingCooldown(initialRemainingSeconds);
                    if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); // Clear existing
                    cooldownCountdownTimerRef.current = setInterval(() => {
                        setRemainingCooldown(prev => {
                            const newRemaining = Math.max(0, prev - 1);
                            if (newRemaining === 0) {
                                if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
                                cooldownCountdownTimerRef.current = null;
                                console.log("Shield display countdown finished.");
                            }
                            return newRemaining;
                        });
                    }, 1000);
                } else if (isShieldOnCooldown) { // Cooldown should have ended
                    setIsShieldOnCooldown(false);
                    setRemainingCooldown(0);
                    setShieldCooldownStartTime(null);
                    console.log("Shield cooldown already ended based on start time during effect run.");
                }
           } else if (shieldCooldownStartTime === null && isShieldOnCooldown) {
               // This case indicates an inconsistent state, reset cooldown
               console.warn("Shield is on cooldown but shieldCooldownStartTime is null. Resetting cooldown state.");
               setIsShieldOnCooldown(false);
               setRemainingCooldown(0);
               setPausedShieldCooldownRemaining(null);
           }
      } else { // Shield is NOT on cooldown
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield not on cooldown. Stopping display countdown.");
          }
          if (remainingCooldown !== 0) { // Reset display if needed
              setRemainingCooldown(0);
          }
          if (pausedShieldCooldownRemaining !== null) { // Clear any paused state
                setPausedShieldCooldownRemaining(null);
          }
      }

      // Cleanup function
      return () => {
          console.log("Shield Cooldown Effect cleanup.");
          if (cooldownCountdownTimerRef.current) { // Changed from countdownInterval to the ref
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null; // Ensure ref is cleared on cleanup
              console.log("Cleanup: Cleared cooldownCountdownTimerRef.");
          }
          // Main shieldCooldownTimerRef is cleared/managed by the logic itself or on unmount
      };

  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted]);


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null; // SỬA ĐỔI: gán null cho ref
      }
      console.log("All timers cleared on unmount.");
    };
  }, []);
  // Effect for coin counter animation
  useEffect(() => {
    if (displayedCoins === coins) return;

    const coinElement = document.querySelector('.coin-counter'); // Class của CoinDisplay
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      coinElement.addEventListener('animationend', animationEndHandler);
      // Sửa đổi: Thêm return function để remove event listener khi component unmount hoặc effect chạy lại
      return () => {
        if (coinElement) {
            coinElement.removeEventListener('animationend', animationEndHandler);
            coinElement.classList.remove('number-changing'); // Đảm bảo class được xóa
        }
      };
    }
    return () => {}; // Trả về hàm rỗng nếu coinElement không tồn tại
  }, [displayedCoins, coins]);


  // Calculate health percentage for the bar
  const healthPct = MAX_HEALTH > 0 ? health / MAX_HEALTH : 0; // Tránh chia cho 0
  // Determine health bar color based on health percentage
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // NEW: Calculate shield health percentage
  const shieldHealthPct = SHIELD_MAX_HEALTH > 0 && isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;


  // Render the character with animation and damage effect
  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out pointer-events-none" // THÊM: pointer-events-none
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%', // Vị trí X cố định của nhân vật
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver} // Autoplay chỉ khi game đang chạy
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
      case 'rock': // Ví dụ nếu có type 'rock'
        obstacleEl = (
          <div className={`w-${obstacle.width} h-${obstacle.height} bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            {/* Thêm chi tiết cho rock */}
          </div>
        );
        break;
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2': // Gộp chung logic cho Lottie obstacles
        obstacleEl = (
          <div
            className="relative" // Giữ relative để Lottie được định vị đúng
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver} // Autoplay chỉ khi game đang chạy
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      default:
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color || 'from-gray-500 to-gray-700'} rounded`}></div> // Thêm màu mặc định
        );
    }

    const obstacleHealthPct = obstacle.maxHealth > 0 ? obstacle.health / obstacle.maxHealth : 0;
    return (
      <div
        key={obstacle.id}
        className="absolute pointer-events-none" // THÊM: pointer-events-none
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Obstacles nằm trên mặt đất
          left: `${obstacle.position}%`,
          // transition: 'left 0.05s linear' // Có thể thêm transition nếu muốn mượt hơn, nhưng game loop đã xử lý
        }}
      >
        {/* Thanh máu của obstacle */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
            {/* Hiển thị chìa khóa nếu có */}
            {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Key"
                className="absolute w-4 h-4" // Kích thước chìa khóa
                style={{
                    bottom: 'calc(100% + 2px)', // Vị trí phía trên thanh máu
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1 // Đảm bảo chìa khóa nổi lên trên
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
        className="absolute object-contain pointer-events-none" // THÊM: pointer-events-none
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`, // Giữ tỷ lệ mây
          top: `${cloud.y}%`,
          left: `${cloud.x}%`,
          opacity: 0.8,
          zIndex: -1 // Đảm bảo mây ở phía sau
        }}
        onError={(e) => { // Fallback nếu ảnh lỗi
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Tránh vòng lặp lỗi
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
        className={`absolute rounded-full ${particle.color} pointer-events-none`} // THÊM: pointer-events-none
        style={{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          // Particle Y is relative to character's feet at ground level
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`,
          left: `calc(5% + 20px + ${particle.x}px)`, // 5% là left của character, 20px là offset để hạt ở sau gót
          opacity: particle.opacity,
          zIndex: 0 // Đảm bảo hạt bụi ở trên mặt đất nhưng dưới nhân vật/obstacle
        }}
      ></div>
    ));
  };

  // --- NEW: Render Shield ---
  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSizePx = 96; // Kích thước Lottie của khiên (giả sử)

    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none z-20" // z-20 để khiên nổi trên nhân vật
         style={{
          // Định vị khiên quanh nhân vật
          // characterPos là độ cao nhảy từ GROUND_LEVEL_PERCENT
          // Cần tính toán vị trí tâm của character container
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + ${24*4/2 - shieldSizePx/2}px)`, // 24*4 là height của char Lottie
          left: `calc(5% + ${24*4/2 - shieldSizePx/2}px)`, // 5% là left của char, 24*4 là width của char Lottie
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
          // transition: 'bottom 0.3s ease-out, left 0.3s ease-out', // Bỏ transition để theo sát nhân vật
        }}
      >
        {/* Thanh máu của khiên (nếu cần) */}
        {shieldHealth > 0 && (
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-500 shadow-sm mb-1 absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-blue-400' : shieldHealthPct > 0.3 ? 'bg-yellow-400' : 'bg-red-400'} transform origin-left transition-transform duration-200 ease-linear`}
                    style={{ width: `${shieldHealthPct * 100}%` }}
                ></div>
            </div>
        )}

        <DotLottieReact
          src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
          loop
          autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
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
        className="absolute w-10 h-10 pointer-events-none z-10" // z-10 để coin nổi trên mặt đất, dưới nhân vật nếu cần
        style={{
          // coin.y là % từ trên xuống (đỉnh của div)
          // coin.x là % từ trái sang (tâm của div)
          top: `${coin.y}%`,
          left: `${coin.x}%`,
          transform: 'translateX(-50%)', // Để coin.x là tâm ngang
          // transition: 'top 0.05s linear, left 0.05s linear' // Có thể thêm nếu muốn mượt hơn
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
          className="w-full h-full"
        />
      </div>
    ));
  };


  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return;

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) { // Khi mở fullscreen stats
            hideNavBar();
            // Tạm dừng game loop và các timers khác đã được xử lý trong useEffect dựa trên isStatsFullscreen
        } else { // Khi đóng fullscreen stats
            showNavBar();
            // Khởi động lại game loop và timers đã được xử lý trong useEffect
        }
        return newState;
    });
  };

  // Show loading indicator if user data is being fetched OR if game hasn't started and user is not logged in
  if (isLoadingUserData || (!currentUser && !gameStarted)) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white">
        {isLoadingUserData && <p>Đang tải dữ liệu người dùng...</p>}
        {!currentUser && !gameStarted && !isLoadingUserData && (
            <>
                <p className="mb-4">Vui lòng đăng nhập để bắt đầu cuộc phiêu lưu!</p>
                {/* Có thể thêm nút Đăng nhập ở đây nếu bạn có component riêng */}
            </>
        )}
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative select-none"> {/* THÊM: select-none */}
      <style>{`
        // ... (các keyframes giữ nguyên) ...
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: #fff; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
        @keyframes pulse { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } }
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
        .glass-shadow-border { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -1px 2px rgba(255, 255, 255, 0.15); }
      `}</style>
       <style jsx global>{`
        body {
          overflow: hidden; /* Ngăn cuộn trang */
        }
      `}</style>


      {isStatsFullscreen ?
      (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            {currentUser && ( // Chỉ hiển thị CharacterCard nếu đã đăng nhập
                <CharacterCard
                    onClose={toggleStatsFullscreen}
                    coins={coins}
                    onUpdateCoins={(amount) => {
                        if (currentUser) { // Kiểm tra lại currentUser trước khi gọi
                           updateCoinsInFirestore(currentUser.uid, amount)
                        }
                    }}
                    gems={gems} // THÊM: gems
                    keys={keyCount} // THÊM: keys
                    // THÊM: các chỉ số khác nếu CharacterCard cần
                />
            )}
        </ErrorBoundary>
      ) : (
        <div
           ref={gameRef}
          className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} // THÊM: h-full, cursor-pointer
          onClick={handleTap}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 z-[-2]"></div>
          {/* Sun/Moon */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 z-[-1]"></div>

          {renderClouds()}

          {/* Ground */}
          <div className="absolute bottom-0 w-full z-[-1]" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600">
                  {/* Ground details */}
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

          {/* UI Overlay - Top Bar */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30 glass-shadow-border">
            <div className="flex items-center">
                {/* Stats Icon */}
                <div
                  className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={(e) => { e.stopPropagation(); toggleStatsFullscreen();}} // Ngăn sự kiện click lan ra div cha
                  title="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
                        alt="Award Icon"
                        className="w-full h-full object-contain"
                         onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/32x32/ffffff/000000?text=Stats";
                        }}
                      />
                </div>
                {/* Health Bar */}
                <div className="w-32 relative">
                    <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                        <div className="h-full overflow-hidden">
                            <div
                                 className={`${getColor()} h-full transform origin-left`}
                                style={{
                                    transform: `scaleX(${healthPct})`,
                                    transition: 'transform 0.5s ease-out, background-color 0.5s ease', // Thêm transition cho màu
                                }}
                            >
                                <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Highlight */}
                            </div>
                        </div>
                        <div
                             className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                            style={{ animation: 'pulse 3s infinite' }} // Hiệu ứng pulse cho thanh máu
                        />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    {/* Floating Damage Number */}
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                             <div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs animate-fadeOutUp" // Sử dụng animation đã định nghĩa
                            >
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Currency Display */}
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* Gem Display */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
                         onClick={(e) => {e.stopPropagation(); console.log("Gem display clicked"); /* TODO: Open gem shop? */}}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()}
                        </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>
                    {/* Coin Display Component */}
                    <CoinDisplay
                      displayedCoins={displayedCoins}
                      isStatsFullscreen={isStatsFullscreen}
                      onClick={(e) => { e.stopPropagation(); console.log("Coin display clicked"); /* TODO: Open coin shop? */}}
                    />
                    {/* Key Display */}
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-700 rounded-lg p-0.5 pl-1 pr-1 flex items-center shadow-lg border border-yellow-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
                         onClick={(e) => {e.stopPropagation(); console.log("Key display clicked"); /* TODO: Open key related UI? */}}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <KeyIcon />
                        <span className="font-bold text-yellow-100 text-xs tracking-wide ml-1">{keyCount}</span>
                    </div>
                </div>
             )}
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
              <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                onClick={(e) => { e.stopPropagation(); startNewGame(); }}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Left Action Buttons (Shop, Inventory) - Chỉ hiển thị khi game đang chạy */}
          {!isStatsFullscreen && gameStarted && !gameOver && (
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: ( <div className="relative"> {/* Icon Shop */} </div> ), label: "Shop", notification: true, special: true, centered: true, action: () => console.log("Open Shop") },
                { icon: ( <div className="relative"> {/* Icon Inventory */} </div> ), label: "Inventory", notification: true, special: true, centered: true, action: () => console.log("Open Inventory") }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer" onClick={(e) => { e.stopPropagation(); item.action(); }}>
                  {item.special && item.centered ?
                  ( <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0"> {item.icon} {item.label && ( <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span> )} </div>)
                  : ( <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}> {item.icon} <span className="text-white text-xs text-center block mt-1">{item.label}</span> </div> )}
                </div>
              ))}
            </div>
          )}

           {/* Right Action Buttons (Shield, Mission, Blacksmith) - Chỉ hiển thị khi game đang chạy */}
           {!isStatsFullscreen && gameStarted && !gameOver && (
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
               {/* Shield Button */}
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                onClick={(e) => { e.stopPropagation(); activateShield();}}
                title={ !gameStarted || gameOver || isLoadingUserData ? "Không khả dụng" : isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` : isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` : isStatsFullscreen ? "Không khả dụng" : "Kích hoạt Khiên chắn" }
                aria-label="Sử dụng Khiên chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? -1 : 0}
              >
                <div className="w-10 h-10">
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                      loop
                      autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
                      className="w-full h-full"
                   />
                </div>
                {isShieldOnCooldown && remainingCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold">
                    {remainingCooldown}s
                  </div>
                )}
              </div>
              {/* Other Right Buttons */}
              {[
                { icon: ( <div className="relative"> {/* Icon Mission */} </div> ), label: "Mission", notification: true, special: true, centered: true, action: () => console.log("Open Mission") },
                { icon: ( <div className="relative"> {/* Icon Blacksmith */} </div> ), label: "Blacksmith", notification: true, special: true, centered: true, action: () => console.log("Open Blacksmith") },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer" onClick={(e) => { e.stopPropagation(); item.action(); }}>
                  {item.special && item.centered ?
                  ( <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0"> {item.icon} {item.label && ( <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span> )} </div>)
                  : ( <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}> {item.icon} <span className="text-white text-xs text-center block mt-1">{item.label}</span> </div> )}
                </div>
              ))}
            </div>
          )}

          {/* Treasure Chest Component - Chỉ hiển thị khi game đang chạy */}
          {!isStatsFullscreen && gameStarted && !gameOver && currentUser && (
            <TreasureChest
                initialChests={3} // Số rương ban đầu
                keyCount={keyCount} // Số chìa khóa người chơi có
                onKeyCollect={(keysUsed) => { // Hàm callback khi mở rương tốn chìa khóa
                    // Không cần gọi updateKeysInFirestore ở đây vì TreasureChest đã gọi onKeyUpdate
                }}
                onCoinReward={startCoinCountAnimation} // Hàm callback khi nhận thưởng coin
                onGemReward={handleGemReward} // Hàm callback khi nhận thưởng gem
                isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen} // Trạng thái tạm dừng game
                isStatsFullscreen={isStatsFullscreen} // Trạng thái fullscreen của stats
                currentUserId={currentUser ? currentUser.uid : null} // ID người dùng hiện tại
                onKeyUpdate={(newKeyCount) => { // Hàm callback khi số lượng key thay đổi từ TreasureChest
                    // TreasureChest đã tự cập nhật Firestore, chỉ cần cập nhật local state nếu cần
                    // setKeyCount(newKeyCount); // Nếu TreasureChest không tự cập nhật local state thông qua onKeyCollect -> updateKeysInFirestore
                    // Tuy nhiên, updateKeysInFirestore đã bao gồm setKeyCount, nên có thể không cần dòng này.
                }}
            />
          )}
        </div>
      )}
    </div>
  );
}
