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
  const [particles, setParticles] = useState<any[]>([]); // Array of active particles (dust) - Changed to any[] for simplicity
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
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey' | 'collided'>[] = [ // Added 'collided' to Omit
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
            coins: coins + amount, // Start with current coins + new amount if doc is new
            gems: gems, 
            keys: keyCount,
            createdAt: new Date()
          });
           setCoins(prevCoins => Math.max(0, prevCoins + amount)); // Update local state immediately for new doc
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
      // Use a functional update for `displayedCoins` if it depends on `coins`
      // but `coins` itself will be updated via Firestore callback.
      // The animation should reflect the change towards the *expected* new total.
      const oldDisplayedCoins = displayedCoins;
      const targetDisplayedCoins = coins + reward; // Target for display animation

      let step = Math.ceil(reward / 30);
      if (reward === 0) return; // No animation if no reward
      if (reward < 0) step = Math.floor(reward / 30); // Handle negative rewards (spending)

      let currentAnimatedDisplay = oldDisplayedCoins;


      // Clear any existing coin count animation interval
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          currentAnimatedDisplay += step;
          if ((step > 0 && currentAnimatedDisplay >= targetDisplayedCoins) || (step < 0 && currentAnimatedDisplay <= targetDisplayedCoins)) {
              setDisplayedCoins(targetDisplayedCoins);
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
              setDisplayedCoins(currentAnimatedDisplay);
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
          transaction.set(userDocRef, {
            coins: coins,
            gems: gems,
            keys: Math.max(0, keyCount + amount), // Start with current keys + new amount if doc is new
            createdAt: new Date()
          });
          setKeyCount(prevKeys => Math.max(0, prevKeys + amount)); // Update local state
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
      // TODO: Implement Firestore update for gems if they need to be persistent
      // Example: if (auth.currentUser) { updateGemsInFirestore(auth.currentUser.uid, amount); }
  };

  // NEW: Function to handle key collection (called when obstacle with key is defeated)
  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // Firestore update will also update local state via its callback
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      } else {
        console.log("User not authenticated, skipping Firestore key update.");
        // Fallback to local update if needed, though ideally user should be auth for rewards
        setKeyCount(prev => prev + amount);
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
    setShieldCooldownStartTime(null); 
    setPausedShieldCooldownRemaining(null);

    // Reset states that don't use session storage
    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);

    // Game elements setup
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const hasKeyFirst = Math.random() < 0.2;

        initialObstacles.push({
          id: Date.now(),
          position: 105, 
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: hasKeyFirst,
        });

        for (let i = 1; i < 5; i++) {
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const spacing = i * (Math.random() * 10 + 10);
          const hasKey = Math.random() < 0.2;

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
        fetchUserData(user.uid); 
        setGameStarted(true); 
        setIsRunning(true); 
      } else {
        console.log("User logged out.");
        setGameStarted(false);
        setGameOver(true); // Set game over to true to stop game loops etc.
        setHealth(MAX_HEALTH); 
        setCharacterPos(0); 
        setObstacles([]); 
        setActiveCoins([]); 
        setIsShieldActive(false); 
        setShieldHealth(SHIELD_MAX_HEALTH); 
        setIsShieldOnCooldown(false); 
        setRemainingCooldown(0); 
        setShieldCooldownStartTime(null); 
        setPausedShieldCooldownRemaining(null); 

        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false); 
        setIsRankOpen(false); 
        setCoins(0); 
        setDisplayedCoins(0); 
        setGems(0); 
        setKeyCount(0); 
        setIsLoadingUserData(false); 

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

        if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        if(runAnimationRef.current) clearInterval(runAnimationRef.current);
        if(particleTimerRef.current) clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
        if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });
    return () => unsubscribe();
  }, []); // Removed auth from dependency array as onAuthStateChanged handles its own lifecycle.

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) { // Added !gameOver to prevent multiple triggers
      setGameOver(true);
      setIsRunning(false);
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted, gameOver]);

  // Generate initial cloud elements
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        x: Math.random() * 50 + 100, 
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
    if (!gameStarted || gameOver || isStatsFullscreen || isRankOpen) return; 

    const newParticles:any[] = []; // Define type for newParticles
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(), // Add Math.random for more unique ID
        x: 5 + Math.random() * 5,
        y: 0, // Start at character's feet approx
        size: Math.random() * 3 + 2, // Give particles a size
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
    if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) { 
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 15000) + 5000; // 5-20 seconds
    if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear previous before setting new
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) return; // Check again before creating

      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 10 + 10); 
            const hasKey = Math.random() < 0.2;

            newObstacles.push({
              id: Date.now() + i + Math.random(), // More unique ID
              position: 105 + spacing, 
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle(); // Schedule the next one
    }, randomTime);
  };

  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) { 
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000; // 1-5 seconds
    if (coinScheduleTimerRef.current) {
        clearTimeout(coinScheduleTimerRef.current);
    }
    coinScheduleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) return; // Check again

      const newCoin: GameCoin = {
        id: Date.now() + Math.random(), // More unique ID
        x: 105, 
        y: Math.random() * 60, // Random Y position within a range
        initialSpeedX: Math.random() * 0.5 + 0.5,
        initialSpeedY: Math.random() * 0.3, // Slight downward drift
        attractSpeed: Math.random() * 0.05 + 0.03,
        isAttracted: false
      };

      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin(); // Schedule next
    }, randomTime);
  };


  // Handle character jump action
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen && !isRankOpen) { 
      setJumping(true);
      setCharacterPos(80); // Jump height
      setTimeout(() => {
        // Check game state again before landing, in case game ended mid-jump
        if (gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen) { 
          setCharacterPos(0); // Land
          setTimeout(() => {
            setJumping(false);
          }, 100); // Short delay to reset jumping state
        } else {
             setCharacterPos(0); // Ensure character is on ground if game state changed
             setJumping(false);
        }
      }, 600); // Jump duration
    }
  };

  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData || isRankOpen) return; 

    if (!gameStarted && !gameOver) { // Only start if not started AND not game over
      startNewGame(); 
    } else if (gameOver) {
      startNewGame(); 
    } else {
        jump(); // Allow jump on tap if game is running
    }
  };


  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300); // Duration of the effect
  };

  // Trigger character damage effect and floating number
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);

      setTimeout(() => {
          setShowDamageNumber(false);
      }, 800); // Duration of floating number
  };

  // --- NEW: Function to activate Shield skill ---
  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen) { 
      console.log("Cannot activate Shield:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData, isRankOpen });
      return;
    }

    console.log("Activating Shield!");

    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);

    setIsShieldOnCooldown(true);
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000));

    const now = Date.now();
    setShieldCooldownStartTime(now); 
    console.log(`Shield activated at: ${now}. shieldCooldownStartTime state set to: ${now}`);
    setPausedShieldCooldownRemaining(null); 

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


  // Main game loop for movement and collision detection
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen) { 
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current && (!gameStarted || gameOver || isStatsFullscreen || isRankOpen)) { // Ensure particle timer stops if game stops
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    if (!particleTimerRef.current && gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen) { // Restart particle timer if needed
        particleTimerRef.current = setInterval(generateParticles, 300);
    }


    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Base speed for obstacles

            // Obstacle movement and collision
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character dimensions and position (approximate, adjust as needed)
                const characterWidth_px = (24 / 4) * 16; // Assuming character is w-24 (Tailwind scale)
                const characterHeight_px = (24 / 4) * 16; // Assuming character is h-24
                const characterXPercent = 5; // Character's fixed X position percentage
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                // Character's bounding box calculation
                const characterBottomFromTop_px = gameHeight - ((characterPos / gameHeight * 100) / 100 * gameHeight + groundLevelPx); // characterPos is in px from ground
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;


                return prevObstacles.map(obstacle => {
                        let newPosition = obstacle.position - speed;
                        let collisionDetectedThisFrame = false; // Renamed to avoid conflict with obstacle.collided

                        const obstacleX_px = (newPosition / 100) * gameWidth;
                        const obstacleWidth_px = (obstacle.width / 4) * 16; // Convert Tailwind units to px
                        const obstacleHeight_px = (obstacle.height / 4) * 16;

                        // Obstacle's bounding box calculation (assuming bottom aligned with ground)
                        const obstacleBottomFromTop_px = gameHeight - groundLevelPx;
                        const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;
                        
                        const collisionTolerance = 5; // Small tolerance for collision

                        if (
                            characterRight_px > obstacleX_px - collisionTolerance &&
                            characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                            characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance && // Y-axis check from top of screen
                            characterTopFromTop_px < obstacleBottomFromTop_px + collisionTolerance
                        ) {
                            collisionDetectedThisFrame = true;
                            if (isShieldActive) {
                                setShieldHealth(prev => {
                                    const damageToShield = obstacle.damage;
                                    const newShieldHealth = Math.max(0, prev - damageToShield);
                                    if (newShieldHealth <= 0) {
                                        setIsShieldActive(false); // Shield breaks
                                    }
                                    return newShieldHealth;
                                });
                            } else {
                                const damageTaken = obstacle.damage;
                                setHealth(prev => Math.max(0, prev - damageTaken));
                                triggerHealthDamageEffect();
                                triggerCharacterDamageEffect(damageTaken);
                            }

                            if (obstacle.hasKey) {
                                handleKeyCollect(1);
                            }
                            // Mark obstacle for removal or special handling due to collision
                            return { ...obstacle, position: newPosition, collided: true };
                        }
                        
                        // If obstacle moves off screen to the left
                        if (newPosition < -20 && !collisionDetectedThisFrame) { // -20% ensures it's well off-screen
                            if (Math.random() < 0.7 && obstacleTypes.length > 0) { // 70% chance to respawn
                                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                                const randomOffset = Math.floor(Math.random() * 20);
                                const hasKey = Math.random() < 0.2;
                                return {
                                    ...obstacle, // Keep ID for keying if needed, or generate new
                                    id: Date.now() + Math.random(), // New ID for new obstacle
                                    ...randomObstacleType,
                                    position: 105 + randomOffset, // Reposition to the right, off-screen
                                    health: randomObstacleType.baseHealth,
                                    maxHealth: randomObstacleType.baseHealth,
                                    hasKey: hasKey,
                                    collided: false, // Reset collided state
                                };
                            } else {
                                // Mark for removal by filtering if not respawned
                                return { ...obstacle, position: newPosition, toRemove: true };
                            }
                        }
                        return { ...obstacle, position: newPosition, collided: collisionDetectedThisFrame }; // Update position
                    })
                    .filter(obstacle => !obstacle.collided && !obstacle.toRemove && obstacle.position > -20); // Remove collided or marked for removal or too far left
            });

            // Cloud movement
            setClouds(prevClouds => {
                return prevClouds.map(cloud => {
                        const newX = cloud.x - cloud.speed;
                        if (newX < -50) { // Cloud moved off-screen left
                            const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                            return { // Respawn cloud
                                ...cloud,
                                id: Date.now() + Math.random(),
                                x: 100 + Math.random() * 30, // Reposition to the right, off-screen
                                y: Math.random() * 40 + 10,
                                size: Math.random() * 40 + 30,
                                speed: Math.random() * 0.3 + 0.15,
                                imgSrc: randomImgSrc
                            };
                        }
                        return { ...cloud, x: newX };
                    })
                    // Optional: filter clouds that are too far off-screen if not respawning all
                    .filter(cloud => cloud.x > -50); // Keep clouds that are still somewhat visible or about to be
            });

            // Particle movement and fade
            setParticles(prevParticles =>
                prevParticles.map(particle => ({
                        ...particle,
                        x: particle.x + particle.xVelocity,
                        y: particle.y + particle.yVelocity,
                        opacity: particle.opacity - 0.03, // Fade out
                        size: Math.max(0, particle.size - 0.1) // Shrink
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0) // Remove faded/shrunk particles
            );

            // Coin movement and collection
            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character's center for attraction (more accurate)
                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;
                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                
                // Recalculate character's current visual center based on `characterPos` (jump height)
                const characterVisualBottomY_px = gameHeight - groundLevelPx - characterPos;
                const characterVisualTopY_px = characterVisualBottomY_px - characterHeight_px;
                const characterCenterX_px = characterX_px + characterWidth_px / 2;
                const characterCenterY_px = characterVisualTopY_px + characterHeight_px / 2;


                return prevCoins.map(coin => {
                        const coinSize_px = 40; // Approximate coin size in px
                        const coinX_px = (coin.x / 100) * gameWidth;
                        const coinY_px = (coin.y / 100) * gameHeight;

                        let newX = coin.x;
                        let newY = coin.y;
                        let collisionDetectedThisFrame = false;
                        let shouldBeAttracted = coin.isAttracted;

                        // Initial collision check to start attraction (using character's bounding box)
                        const characterVisualLeft_px = characterX_px;
                        const characterVisualRight_px = characterX_px + characterWidth_px;

                        if (!shouldBeAttracted) {
                            if (
                                characterVisualRight_px > coinX_px &&
                                characterVisualLeft_px < coinX_px + coinSize_px &&
                                characterVisualBottomY_px > coinY_px && // Y from top of screen
                                characterVisualTopY_px < coinY_px + coinSize_px
                            ) {
                                shouldBeAttracted = true;
                            }
                        }

                        if (shouldBeAttracted) {
                            const dx = characterCenterX_px - coinX_px;
                            const dy = characterCenterY_px - coinY_px;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const moveStep = distance * coin.attractSpeed; // Proportional speed

                            const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                            const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;

                            newX = ((coinX_px + moveX_px) / gameWidth) * 100;
                            newY = ((coinY_px + moveY_px) / gameHeight) * 100;

                            // Check for collection (when coin is very close to character center)
                            if (distance < (characterWidth_px / 4 + coinSize_px / 4)) { // Smaller collection radius
                                collisionDetectedThisFrame = true;
                                const awardedCoins = Math.floor(Math.random() * 5) + 1;
                                startCoinCountAnimation(awardedCoins); // Animation triggers Firestore update
                                console.log(`Coin collected! Awarded: ${awardedCoins}`);
                            }
                        } else {
                            // Initial movement if not attracted
                            newX = coin.x - coin.initialSpeedX;
                            newY = coin.y + coin.initialSpeedY; // Slight drift
                        }

                        return {
                            ...coin,
                            x: newX,
                            y: newY,
                            isAttracted: shouldBeAttracted,
                            collided: collisionDetectedThisFrame
                        };
                    })
                    .filter(coin => {
                        const isOffScreen = coin.x < -20 || coin.y > 120 || coin.y < -20;
                        return !coin.collided && !isOffScreen;
                    });
            });


        }, 30); // Game loop interval (approx 33 FPS)
    }

    return () => { // Cleanup function for the effect
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Also clear particle timer on cleanup
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, characterPos, isShieldActive, isStatsFullscreen, isRankOpen, isLoadingUserData, coins, displayedCoins]); // Added more relevant dependencies


  // Effect to manage obstacle and coin scheduling timers
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || !gameStarted) {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Stop particles too
      } else { // Game is active and not paused by UI
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) particleTimerRef.current = setInterval(generateParticles, 300); // Restart particles
      }

      return () => { // Cleanup timers
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, isRankOpen]);

  // Effect for Shield Cooldown
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;
      const logPrefix = "ShieldCooldownEffect:";

      console.log(`${logPrefix} State:`, { isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, gameStarted, shieldCooldownStartTime, pausedShieldCooldownRemaining, isRankOpen });

      if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted || isRankOpen) {
          console.log(`${logPrefix} Pausing timers.`);
          if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) {
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              setPausedShieldCooldownRemaining(remainingTimeMs);
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log(`${logPrefix} Main cooldown PAUSED with ${remainingTimeMs}ms remaining.`);
          }
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log(`${logPrefix} Display countdown PAUSED.`);
          }
      } else if (isShieldOnCooldown) {
          console.log(`${logPrefix} Shield on cooldown, game active.`);
          if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
              console.log(`${logPrefix} Resuming main cooldown with ${pausedShieldCooldownRemaining}ms.`);
              const resumeTime = pausedShieldCooldownRemaining;
              shieldCooldownTimerRef.current = setTimeout(() => {
                  console.log(`${logPrefix} Cooldown ended (after pause).`);
                  setIsShieldOnCooldown(false);
                  setRemainingCooldown(0);
                  setShieldCooldownStartTime(null);
                  setPausedShieldCooldownRemaining(null);
              }, resumeTime);
              setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - resumeTime));
              setPausedShieldCooldownRemaining(null); // Clear paused state

              // Resume countdown display
              const initialRemainingSeconds = Math.ceil(resumeTime / 1000);
              setRemainingCooldown(initialRemainingSeconds);
              if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); // Clear old one
              cooldownCountdownTimerRef.current = setInterval(() => {
                  setRemainingCooldown(prev => {
                      const newRemaining = Math.max(0, prev - 1);
                      if (newRemaining === 0 && cooldownCountdownTimerRef.current) {
                          clearInterval(cooldownCountdownTimerRef.current);
                          cooldownCountdownTimerRef.current = null;
                      }
                      return newRemaining;
                  });
              }, 1000);

          } else if (shieldCooldownStartTime !== null && cooldownCountdownTimerRef.current === null) { // Start countdown display if not already running
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);

              if (initialRemainingSeconds > 0) {
                  console.log(`${logPrefix} Starting display countdown with ${initialRemainingSeconds}s.`);
                  setRemainingCooldown(initialRemainingSeconds);
                  cooldownCountdownTimerRef.current = setInterval(() => {
                      setRemainingCooldown(prev => {
                          const newRemaining = Math.max(0, prev - 1);
                          if (newRemaining === 0 && cooldownCountdownTimerRef.current) {
                              clearInterval(cooldownCountdownTimerRef.current);
                              cooldownCountdownTimerRef.current = null;
                          }
                          return newRemaining;
                      });
                  }, 1000);
              } else if (remainingTimeMs <= 0) { // Cooldown should have ended
                  setIsShieldOnCooldown(false);
                  setRemainingCooldown(0);
                  setShieldCooldownStartTime(null);
              }
          }
      } else { // Shield not on cooldown
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log(`${logPrefix} Shield not on cooldown. Display countdown stopped.`);
          }
          if (remainingCooldown !== 0) setRemainingCooldown(0);
      }

      return () => { // Cleanup
          console.log(`${logPrefix} Cleanup.`);
          if (countdownInterval) clearInterval(countdownInterval); // This was from original, ensure it's cleared if used
          if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
          // Main shieldCooldownTimerRef is cleared internally or when component unmounts
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted, isRankOpen]);


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      console.log("All timers cleared on unmount.");
    };
  }, []);

    // Effect for coin counter animation feedback (visual pulse)
  useEffect(() => {
    if (displayedCoins === coins && coins !== 0) return; // Only run if coins changed, and not initial load to 0

    const coinElement = document.querySelector('.coin-counter'); // Target the CoinDisplay component's counter
    if (coinElement) {
      coinElement.classList.add('number-changing'); // Add class for CSS animation
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
      };
      coinElement.addEventListener('animationend', animationEndHandler, { once: true }); // Auto-remove listener

      return () => { // Cleanup
        if (coinElement) { // Check if element still exists
            coinElement.removeEventListener('animationend', animationEndHandler);
            coinElement.classList.remove('number-changing'); // Ensure class is removed on cleanup
        }
      };
    }
     return () => {}; // Return empty cleanup if no element
  }, [displayedCoins]); // Depend only on displayedCoins for visual feedback


  // Calculate health percentage for the bar
  const healthPct = health > 0 ? health / MAX_HEALTH : 0; // Ensure healthPct is not negative

  // Determine health bar color based on health percentage
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // NEW: Calculate shield health percentage
  const shieldHealthPct = isShieldActive && shieldHealth > 0 ? shieldHealth / SHIELD_MAX_HEALTH : 0;


  // Render the character with animation and damage effect
  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out pointer-events-none" // Added pointer-events-none
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%', // Character's fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver} // Play only if game is active
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;

    const obstacleWidthPx = (obstacle.width / 4) * 16; // Convert Tailwind units to px (assuming 1 unit = 0.25rem = 4px)
    const obstacleHeightPx = (obstacle.height / 4) * 16;


    switch(obstacle.type) {
      // Removed 'rock' case as it's not in obstacleTypes, add back if needed
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2': // Common rendering for Lottie obstacles
        obstacleEl = (
          <div
            className="relative" // Ensure Lottie is positioned correctly within this div
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver}
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      default: // Fallback for unknown types, though ideally all types are handled
        obstacleEl = (
          <div 
            className={`bg-gradient-to-b ${obstacle.color || 'from-gray-400 to-gray-600'} rounded`} // Default color
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          ></div>
        );
    }

    const obstacleHealthPct = obstacle.health > 0 ? obstacle.health / obstacle.maxHealth : 0;

    return (
      <div
        key={obstacle.id}
        className="absolute pointer-events-none" // Added pointer-events-none
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Align bottom of obstacle with ground
          left: `${Math.min(100, Math.max(-20, obstacle.position))}%`, // Clip rendering position
          // Ensure transform origin is correct if scaling or rotating obstacles
        }}
      >
        {/* Health bar above obstacle */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
        </div>
        
        {/* Key icon above health bar if obstacle has key */}
        {obstacle.hasKey && (
          <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
            alt="Key"
            className="absolute w-4 h-4"
            style={{
                bottom: 'calc(100% + 10px)', // Position above health bar (h-2 + mb-1 = 8px + 4px = 12px approx)
                left: '50%',
                transform: 'translateX(-50%)',
            }}
          />
        )}
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
        className="absolute object-contain pointer-events-none" // Added pointer-events-none
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`, // Maintain aspect ratio
          top: `${cloud.y}%`,
          left: `${Math.min(120, Math.max(-50, cloud.x))}%`, 
          opacity: 0.8
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { // Typed event
          const target = e.target as HTMLImageElement; // Type assertion
          target.onerror = null; // Prevent infinite loop if fallback also fails
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud"; // Fallback placeholder
        }}
      />
    ));
  };

  // Render dust particles
  const renderParticles = () => {
    return particles.map(particle => (
      <div
        key={particle.id}
        className={`absolute rounded-full ${particle.color} pointer-events-none`} // Added pointer-events-none
        style={{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          // Position particles relative to the character's base on the ground
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, 
          left: `calc(5% + ${particle.x}px)`, // 5% is character's left offset
          opacity: particle.opacity,
          // transform: `translate(-50%, -50%)` // Center particle if x,y are center points
        }}
      ></div>
    ));
  };

  // --- NEW: Render Shield ---
  const renderShield = () => {
    if (!isShieldActive) return null;

    const shieldSizePx = 80; // Shield Lottie size

    return (
      <div
        key="character-shield"
        // Position shield around the character
        className="absolute flex flex-col items-center justify-center pointer-events-none z-20"
         style={{
          // Center shield on character, characterPos is jump height from ground
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + ${24/2*4}px - ${shieldSizePx/2}px)`, // (h-24 character)/2 - shieldSize/2
          left: `calc(5% + ${24/2*4}px - ${shieldSizePx/2}px)`, // (w-24 character)/2 - shieldSize/2
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
          // transition: 'bottom 0.3s ease-out, left 0.3s ease-out', // Smooth transition with character jump
        }}
      >
        {/* Shield Health Bar (optional, can be displayed above character or shield Lottie) */}
        {shieldHealth > 0 && (
            <div className="absolute -top-4 w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                    style={{ width: `${shieldHealthPct * 100}%` }}
                ></div>
            </div>
        )}

        <DotLottieReact
          src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
          loop
          autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver}
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
        className="absolute w-10 h-10 pointer-events-none" // Added pointer-events-none
        style={{
          top: `${Math.min(120, Math.max(-20, coin.y))}%`, 
          left: `${Math.min(120, Math.max(-20, coin.x))}%`, 
          transform: 'translate(-50%, -50%)', // Center coin Lottie on its x,y position
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver}
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
        if (newState) {
            hideNavBar(); 
            setIsRankOpen(false); 
        } else {
            showNavBar(); 
        }
        return newState;
    });
  };

  // NEW: Function to toggle Rank visibility
  const toggleRank = () => {
     if (gameOver || isLoadingUserData) return; 

     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar(); 
             setIsStatsFullscreen(false); 
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
      showNavBar(); 
  };


  // Handler to receive the sidebar toggle function from SidebarLayout
  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };


  // Show loading indicator if user data is being fetched
  if (isLoadingUserData && !auth.currentUser) { // Only show initial loading if no user yet
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
              {auth.currentUser && (
                  <CharacterCard
                      onClose={toggleStatsFullscreen} 
                      coins={coins} 
                      onUpdateCoins={(amount) => {
                        if (auth.currentUser) { // Ensure currentUser is not null
                           updateCoinsInFirestore(auth.currentUser.uid, amount);
                        }
                      }}
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
  } else {
      // Default game content
      mainContent = (
          <div
            ref={gameRef}
            // The className includes `overflow-hidden` which handles both x and y overflow.
            // `h-screen` makes this div attempt to take full viewport height.
            className={`${className ?? ''} relative w-full h-screen rounded-lg overflow-hidden shadow-2xl cursor-pointer`} // Added cursor-pointer for tap
            // Removed redundant style={{ overflowX: 'hidden' }} as `overflow-hidden` class covers it.
            onClick={handleTap} 
          >
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 pointer-events-none"></div>
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 pointer-events-none"></div>

            {renderClouds()}

            {/* Ground */}
            <div className="absolute bottom-0 w-full pointer-events-none" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600">
                    <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                    {/* Decorative elements on ground */}
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

            {/* Main header UI */}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 px-3 overflow-hidden rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-b border-l border-r border-slate-700/50">
                <HeaderBackground />
                <button
                    onClick={(e) => { e.stopPropagation(); sidebarToggleRef.current?.(); }} // Prevent tap propagation
                    className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20"
                    aria-label="Mở sidebar"
                    title="Mở sidebar"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png"
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Menu"; 
                        }}
                     />
                </button>

                {/* Health Bar and Damage Display */}
                <div className="flex items-center relative z-10">
                  <div className="w-32 relative"> {/* Container for health bar and damage number */}
                      <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                          <div className="h-full overflow-hidden"> {/* Inner div for smooth scaling */}
                              <div
                                  className={`${getColor()} h-full transform origin-left`}
                                  style={{
                                      transform: `scaleX(${healthPct})`,
                                      transition: 'transform 0.5s ease-out', // Smooth health change
                                  }}
                              >
                                  <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Highlight effect */}
                              </div>
                          </div>
                          {/* Animated gloss effect */}
                          <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                              style={{ animation: 'pulse 3s infinite' }} // CSS animation for pulse
                          />
                          {/* Health text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                  {Math.round(health)}/{MAX_HEALTH}
                              </span>
                          </div>
                      </div>
                      {/* Floating damage number */}
                      <div className="absolute -top-2 left-0 right-0 h-4 w-full overflow-visible pointer-events-none"> {/* Changed top to -top-2, overflow-visible */}
                          {showDamageNumber && (
                              <div
                                  className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-sm" // Increased text size
                                  style={{ animation: 'floatUp 0.8s ease-out forwards' }} // CSS animation for float up
                              >
                                  -{damageAmount}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              
               {/* Currency Display: Coins and Gems */}
               {(!isStatsFullscreen && !isRankOpen) && (
                  <div className="flex items-center space-x-1 currency-display-container relative z-10">
                      {/* Gem Display */}
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer" title="Số Gem bạn có">
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                          <div className="relative mr-0.5 flex items-center justify-center">
                              <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                          </div>
                          <div className="font-bold text-purple-200 text-xs tracking-wide">
                              {gems.toLocaleString()}
                          </div>
                          {/* Plus button (decorative or for future use) */}
                          <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                              <span className="text-white font-bold text-xs">+</span>
                          </div>
                          {/* Decorative pulse dots */}
                          <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                          <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                      </div>

                      {/* Coin Display Component */}
                      <CoinDisplay
                        displayedCoins={displayedCoins}
                        isStatsFullscreen={isStatsFullscreen} 
                      />
                  </div>
               )}
            </div>

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
                <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
                <button
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold transform transition hover:scale-105 shadow-lg" // Added text-white
                  onClick={(e) => { e.stopPropagation(); startNewGame(); }} // Prevent tap propagation
                >
                  Chơi Lại
                </button>
              </div>
            )}

            {/* Left Action Buttons (Shop, Inventory) */}
            {(!isStatsFullscreen && !isRankOpen && gameStarted && !gameOver) && ( 
              <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  { label: "Shop", iconType: "shop" },
                  { label: "Inventory", iconType: "inventory" }
                ].map((item, index) => (
                  <button 
                    key={index} 
                    onClick={(e) => e.stopPropagation()} // Prevent tap propagation
                    className="group cursor-pointer scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={item.label}
                  >
                    {/* Placeholder for actual icons */}
                    {item.iconType === "shop" && <span className="text-2xl">🛍️</span>}
                    {item.iconType === "inventory" && <span className="text-2xl">🎒</span>}
                    <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

             {/* Right Action Buttons (Shield, Mission, Blacksmith) */}
             {(!isStatsFullscreen && !isRankOpen && gameStarted && !gameOver) && ( 
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
                 {/* Shield Button */}
                 <button
                  className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative focus:outline-none focus:ring-2 focus:ring-sky-400 ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                  onClick={(e) => { e.stopPropagation(); activateShield(); }} // Prevent tap propagation
                  title={
                    !gameStarted || gameOver || isLoadingUserData || isRankOpen ? "Không khả dụng" :
                    isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                    isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                    "Kích hoạt Khiên chắn"
                  }
                  aria-label="Sử dụng Khiên chắn"
                  disabled={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen}
                >
                  <div className="w-10 h-10">
                     <DotLottieReact
                        src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                        loop
                        autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver}
                        className="w-full h-full"
                     />
                  </div>
                  {isShieldOnCooldown && remainingCooldown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold pointer-events-none">
                      {remainingCooldown}s
                    </div>
                  )}
                </button>

                {/* Other Right Buttons (Mission, Blacksmith) */}
                {[
                  { label: "Mission", iconType: "mission" },
                  { label: "Blacksmith", iconType: "blacksmith" },
                ].map((item, index) => (
                  <button 
                    key={index} 
                    onClick={(e) => e.stopPropagation()} // Prevent tap propagation
                    className="group cursor-pointer scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={item.label}
                  >
                     {/* Placeholder for actual icons */}
                    {item.iconType === "mission" && <span className="text-2xl">🎯</span>}
                    {item.iconType === "blacksmith" && <span className="text-2xl">⚔️</span>}
                    <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Treasure Chest Component */}
            <TreasureChest
              initialChests={3}
              keyCount={keyCount}
              onKeyCollect={(n) => {
                console.log(`Chest opened using ${n} key(s).`);
                if (auth.currentUser) {
                  updateKeysInFirestore(auth.currentUser.uid, -n); // Subtract keys
                } else {
                  console.log("User not authenticated, skipping Firestore key update.");
                  setKeyCount(prev => Math.max(0, prev - n)); // Local fallback
                }
              }}
              onCoinReward={startCoinCountAnimation}
              onGemReward={handleGemReward} 
              isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen} 
              isStatsFullscreen={isStatsFullscreen} 
              currentUserId={currentUser ? currentUser.uid : null} 
            />

          </div>
      );
  }

  // **FIX APPLIED HERE**: Wrap SidebarLayout in a div that constrains size and hides overflow.
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900"> {/* Added bg-gray-900 as a fallback page background */}
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen} 
          onShowRank={toggleRank} 
          onShowHome={showHome} 
      >
        {mainContent} {/* Render the determined main content as children */}
      </SidebarLayout>
    </div>
  );
}
