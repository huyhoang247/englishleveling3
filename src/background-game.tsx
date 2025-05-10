import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
import CharacterCard from './stats/stats-main.tsx'; // Assuming stats.tsx is in the same directory

// Import DotLottieReact component
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// NEW: Import the TreasureChest component
import TreasureChest from './treasure.tsx';

// NEW: Import the CoinDisplay component
import CoinDisplay from './coin-display.tsx';

// NEW: Import Firestore functions
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase.js'; // Import auth from your firebase.js
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
    nextKeyIn: number; // This is the state we are correcting
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
  const [particles, setParticles] = useState<any[]>([]); // Array of active particles (dust) - Consider defining a type for particles
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
  // CORRECTED: Destructure the value and setter from useSessionStorage
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
      let current = oldCoins;

      // Clear any existing coin count animation interval
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
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
          transaction.set(userDocRef, {
            coins: coins,
            gems: gems,
            keys: amount,
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          console.log(`Keys updated in Firestore for user ${userId}: ${currentKeys} -> ${finalKeys}`);
          setKeyCount(finalKeys);
        }
      });
      console.log("Firestore transaction for keys successful.");
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
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
      setKeyCount(prev => prev + amount);
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
    setShieldCooldownStartTime(null);
    setPausedShieldCooldownRemaining(null);
    // CORRECTED: Reset nextKeyIn using its setter
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

        // CORRECTED: Logic for determining if the first obstacle has a key
        let hasKeyFirst = false;
        setNextKeyIn(prevNextKeyIn => {
            const updatedNextKeyIn = prevNextKeyIn - 1;
            if (updatedNextKeyIn <= 0) {
                hasKeyFirst = true;
                return randomBetween(5, 10); // Reset for the next cycle
            }
            return updatedNextKeyIn;
        });


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

          // CORRECTED: Logic for determining if subsequent obstacles have a key
          let hasKeyCurrent = false;
          setNextKeyIn(prevNextKeyIn => {
              const updatedNextKeyIn = prevNextKeyIn - 1;
              if (updatedNextKeyIn <= 0) {
                  hasKeyCurrent = true;
                  return randomBetween(5, 10); // Reset for the next cycle
              }
              return updatedNextKeyIn;
          });

          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50), // Ensure unique positions
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKeyCurrent,
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
        setGameOver(false);
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
        // CORRECTED: Reset nextKeyIn on logout
        setNextKeyIn(randomBetween(5, 10));


        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
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
        sessionStorage.removeItem('gameNextKeyIn'); // Clear this as well

        if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        if (runAnimationRef.current) clearInterval(runAnimationRef.current);
        if (particleTimerRef.current) clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        if (coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
        if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });

    return () => unsubscribe();
  }, [auth, setNextKeyIn]); // Added setNextKeyIn to dependencies

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if (runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted]);

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

    const newParticles: any[] = []; // Consider defining a type for particles
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 5 + Math.random() * 5,
        y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700',
        size: Math.random() * 3 + 2 // Added size for particles
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen) {
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear previous timer
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

            // CORRECTED: Logic for determining if the new obstacle has a key
            let hasKeyCurrent = false;
            setNextKeyIn(prevNextKeyIn => {
                const updatedNextKeyIn = prevNextKeyIn - 1;
                if (updatedNextKeyIn <= 0) {
                    hasKeyCurrent = true;
                    return randomBetween(5, 10); // Reset for the next cycle
                }
                return updatedNextKeyIn;
            });

            newObstacles.push({
              id: Date.now() + i + Math.random(), // Ensure more unique ID
              position: 100 + (i * (Math.random() * 10 + 20)), // Ensure spacing
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKeyCurrent,
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle();
    }, randomTime);
  };

  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen) {
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
        id: Date.now() + Math.random(), // Ensure unique ID
        x: 110,
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
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen) {
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
    if (isStatsFullscreen || isLoadingUserData) return;

    if (!gameStarted) {
      startNewGame();
    } else if (gameOver) {
      startNewGame();
    }
    // Jump logic can be triggered by other means, e.g., a dedicated button or spacebar
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
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) {
      console.log("Cannot activate Shield:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData });
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


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5;

            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const characterWidth_px = (24 / 4) * 16; // Assuming character is w-24 (Tailwind)
                const characterHeight_px = (24 / 4) * 16; // Assuming character is h-24 (Tailwind)
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                // Character's bottom Y coordinate from the top of the game container
                const characterBottomFromTop_px = gameHeight - groundLevelPx - characterPos;
                // Character's top Y coordinate from the top of the game container
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;


                return prevObstacles
                    .map(obstacle => {
                        let newPosition = obstacle.position - speed;
                        let collisionDetectedThisFrame = false; // Renamed for clarity

                        const obstacleX_px = (newPosition / 100) * gameWidth;
                        const obstacleWidth_px = (obstacle.width / 4) * 16; // Convert Tailwind units to px
                        const obstacleHeight_px = (obstacle.height / 4) * 16; // Convert Tailwind units to px

                        // Obstacle's bottom Y coordinate from the top of the game container
                        const obstacleBottomFromTop_px = gameHeight - groundLevelPx;
                        // Obstacle's top Y coordinate from the top of the game container
                        const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;


                        const collisionTolerance = 5; // Small tolerance for better feel
                        if (
                            characterRight_px > obstacleX_px - collisionTolerance &&
                            characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                            characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance &&
                            characterTopFromTop_px < obstacleBottomFromTop_px + collisionTolerance
                        ) {
                            collisionDetectedThisFrame = true;
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
                                setHealth(prev => Math.max(0, prev - damageTaken));
                                triggerHealthDamageEffect();
                                triggerCharacterDamageEffect(damageTaken);
                            }
                        }

                        // Recycle obstacle if it goes off-screen AND was not collided with in this frame
                        if (newPosition < -20 && !collisionDetectedThisFrame) {
                            if (Math.random() < 0.7) { // 70% chance to recycle
                                if (obstacleTypes.length === 0) return { ...obstacle, position: newPosition }; // Should not happen

                                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                                const randomOffset = Math.floor(Math.random() * 20);

                                // CORRECTED: Logic for determining if the recycled obstacle has a key
                                let hasKeyRecycled = false;
                                setNextKeyIn(prevNextKeyIn => {
                                    const updatedNextKeyIn = prevNextKeyIn - 1;
                                    if (updatedNextKeyIn <= 0) {
                                        hasKeyRecycled = true;
                                        return randomBetween(5, 10);
                                    }
                                    return updatedNextKeyIn;
                                });

                                return {
                                    ...obstacle, // Keep ID for key stability if needed, or generate new
                                    id: Date.now() + Math.random(), // Generate new ID to avoid key issues
                                    ...randomObstacleType,
                                    position: 120 + randomOffset,
                                    health: randomObstacleType.baseHealth,
                                    maxHealth: randomObstacleType.baseHealth,
                                    hasKey: hasKeyRecycled,
                                    collided: false // Reset collision state
                                };
                            } else {
                                // If not recycled, let it continue off-screen to be filtered out
                                return { ...obstacle, position: newPosition, collided: false };
                            }
                        }

                        // If collided in this frame, mark it for removal
                        if (collisionDetectedThisFrame) {
                            if (obstacle.hasKey) {
                                handleKeyCollect(1);
                            }
                            // Mark as collided so it gets filtered out
                            return { ...obstacle, position: newPosition, collided: true };
                        }

                        return { ...obstacle, position: newPosition, collided: false };
                    })
                    // Filter out obstacles that are off-screen (and not recycled) OR collided
                    .filter(obstacle => !obstacle.collided && obstacle.position > -20 && obstacle.health > 0);
            });

            setClouds(prevClouds => {
                return prevClouds
                    .map(cloud => {
                        const newX = cloud.x - cloud.speed;
                        if (newX < -50) { // Cloud is off-screen
                            const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                            return {
                                ...cloud,
                                id: Date.now() + Math.random(), // New ID for recycled cloud
                                x: 120 + Math.random() * 30, // Reset position to the right
                                y: Math.random() * 40 + 10, // Random Y
                                size: Math.random() * 40 + 30, // Random size
                                speed: Math.random() * 0.3 + 0.15, // Random speed
                                imgSrc: randomImgSrc
                            };
                        }
                        return { ...cloud, x: newX };
                    });
            });

            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.xVelocity,
                        y: particle.y + particle.yVelocity,
                        opacity: particle.opacity - 0.03,
                        size: Math.max(0, particle.size - 0.1) // Ensure size doesn't go negative
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0)
            );

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
                const characterBottomFromTop_px = gameHeight - groundLevelPx - characterPos;
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


                return prevCoins
                    .map(coin => {
                        const coinSize_px = 40; // Assuming coin is w-10 h-10 (Tailwind)

                        const coinX_px = (coin.x / 100) * gameWidth;
                        const coinY_px = (coin.y / 100) * gameHeight;

                        let newX = coin.x;
                        let newY = coin.y;
                        let collisionDetected = false;
                        let shouldBeAttracted = coin.isAttracted;


                        if (!shouldBeAttracted) {
                            // Check for collision to start attraction
                            if (
                                characterRight_px > coinX_px &&
                                characterLeft_px < coinX_px + coinSize_px &&
                                characterBottomFromTop_px > coinY_px && // Check Y from top
                                characterTopFromTop_px < coinY_px + coinSize_px // Check Y from top
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

                            // Check for collection (close enough to character center)
                            if (distance < (characterWidth_px / 4 + coinSize_px / 4)) { // Reduced collection radius
                                collisionDetected = true;
                                const awardedCoins = Math.floor(Math.random() * 5) + 1;
                                console.log(`Coin collected! Awarded: ${awardedCoins}. Calling startCoinCountAnimation.`);
                                startCoinCountAnimation(awardedCoins);
                                console.log(`Coin collected! Awarded: ${awardedCoins}`);
                            }

                        } else {
                            // Initial movement if not attracted
                            newX = coin.x - coin.initialSpeedX;
                            newY = coin.y + coin.initialSpeedY; // Assuming coins can fall slightly
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
                        const isOffScreen = coin.x < -20 || coin.y > 120 || coin.y < -20; // Check top boundary too
                        return !coin.collided && !isOffScreen;
                    });
            });


        }, 30); // Game loop interval
    }

    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Ensure particle timer is also cleared
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, characterPos, isShieldActive, isStatsFullscreen, isLoadingUserData, setNextKeyIn]); // Added setNextKeyIn and other relevant states


  // Effect to manage obstacle and coin scheduling timers
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || !gameStarted) {
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
      } else { // Game is active
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

      return () => { // Cleanup on unmount or when dependencies change
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]);

  // Effect for shield cooldown
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;
      console.log("Shield Cooldown Effect running:", { isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, gameStarted, shieldCooldownStartTime, pausedShieldCooldownRemaining });

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
      } else if (isShieldOnCooldown) {
           console.log("Shield is on cooldown and game is active.");
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               console.log(`Resuming main shield cooldown with ${remainingTimeToResume}ms.`);
               if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current); // Clear any existing
               shieldCooldownTimerRef.current = setTimeout(() => {
                   console.log("Shield cooldown ended (after pause).");
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null);
                   setPausedShieldCooldownRemaining(null);
               }, remainingTimeToResume);
               setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume));
               setPausedShieldCooldownRemaining(null);

               const initialRemainingSeconds = Math.ceil(remainingTimeToResume / 1000);
               setRemainingCooldown(initialRemainingSeconds);
               if (cooldownCountdownTimerRef.current === null) {
                   console.log(`Starting shield display countdown upon resume with ${initialRemainingSeconds}s.`);
                   if(countdownInterval) clearInterval(countdownInterval); // Clear previous if any
                   countdownInterval = setInterval(() => {
                       setRemainingCooldown(prev => {
                           const newRemaining = Math.max(0, prev - 1);
                           if (newRemaining === 0) {
                               if(countdownInterval) clearInterval(countdownInterval);
                               cooldownCountdownTimerRef.current = null;
                           }
                           return newRemaining;
                       });
                   }, 1000);
                   cooldownCountdownTimerRef.current = countdownInterval;
               }
           } else if (shieldCooldownStartTime !== null) {
               if (cooldownCountdownTimerRef.current === null) {
                    const now = Date.now();
                    const elapsedTime = now - shieldCooldownStartTime;
                    const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
                    const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);
                    console.log(`Calculating remaining cooldown (no pause): now=${now}, startTime=${shieldCooldownStartTime}, elapsedTime=${elapsedTime}, remainingMs=${remainingTimeMs}, initialSeconds=${initialRemainingSeconds}`);

                    if (initialRemainingSeconds > 0) {
                        console.log(`Starting shield display countdown from start time with ${initialRemainingSeconds}s.`);
                         setRemainingCooldown(initialRemainingSeconds);
                         if(countdownInterval) clearInterval(countdownInterval); // Clear previous if any
                         countdownInterval = setInterval(() => {
                             setRemainingCooldown(prev => {
                                 const newRemaining = Math.max(0, prev - 1);
                                 if (newRemaining === 0) {
                                     if(countdownInterval) clearInterval(countdownInterval);
                                     cooldownCountdownTimerRef.current = null;
                                 }
                                 return newRemaining;
                             });
                         }, 1000);
                         cooldownCountdownTimerRef.current = countdownInterval;
                    } else {
                         setIsShieldOnCooldown(false);
                         setRemainingCooldown(0);
                         setShieldCooldownStartTime(null);
                         setPausedShieldCooldownRemaining(null);
                         console.log("Shield cooldown already ended based on start time (no pause).");
                    }
               }
           } else {
               console.warn("Shield is on cooldown but shieldCooldownStartTime is null and no pausedRemainingTime. Resetting cooldown.");
               setIsShieldOnCooldown(false);
               setRemainingCooldown(0);
               setShieldCooldownStartTime(null);
               setPausedShieldCooldownRemaining(null);
           }
      } else { // Shield is NOT on cooldown
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield not on cooldown. Stopping display countdown.");
          }
          if (remainingCooldown !== 0) {
              setRemainingCooldown(0); // Ensure display is 0
          }
          // Ensure main cooldown timer is also cleared if it somehow exists
          if (shieldCooldownTimerRef.current) {
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log("Cleared main shield timer as shield is not on cooldown.");
          }
      }

      return () => {
          console.log("Shield Cooldown Effect cleanup.");
          if (countdownInterval) clearInterval(countdownInterval);
          // The main shieldCooldownTimerRef is managed within the effect's logic.
          // Clearing it here might be redundant or interfere if not handled carefully.
          // The primary goal is to ensure the countdown display interval is cleared.
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, gameStarted, shieldCooldownStartTime, pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining, setRemainingCooldown, setShieldCooldownStartTime, setIsShieldOnCooldown]);


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if (runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      console.log("All timers cleared on unmount.");
    };
  }, []);

  // Effect for coin counter animation
  useEffect(() => {
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
  }, [displayedCoins, coins]);


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
          autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;

    const obstacleWidthPx = (obstacle.width / 4) * 16; // Convert Tailwind units to px
    const obstacleHeightPx = (obstacle.height / 4) * 16; // Convert Tailwind units to px


    switch(obstacle.type) {
      // Removed 'rock' as it's not in obstacleTypes
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2': // Combined similar Lottie rendering
        obstacleEl = (
          <div
            className="relative" // Ensure Lottie is positioned correctly
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      default: // Fallback for any undefined types
        obstacleEl = (
          <div
            className={`bg-gradient-to-b ${obstacle.color || 'from-gray-400 to-gray-600'} rounded`}
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          ></div>
        );
    }

    const obstacleHealthPct = obstacle.maxHealth > 0 ? obstacle.health / obstacle.maxHealth : 0;

    return (
      <div
        key={obstacle.id} // Ensure unique key for each obstacle
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Position relative to ground
          left: `${obstacle.position}%`,
          // transform: 'translateY(50%)', // Adjust vertical alignment if needed
        }}
      >
        {/* Health bar for obstacle */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
            {/* Key icon on top of health bar if obstacle has a key */}
            {obstacle.hasKey && (
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <KeyIcon />
              </div>
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
        alt="Cloud Icon" // Mô tả hình ảnh đám mây
        className="absolute object-contain"
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`, // Maintain aspect ratio
          top: `${cloud.y}%`,
          left: `${cloud.x}%`,
          opacity: 0.8
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Ép kiểu target
          target.onerror = null; // Ngăn lặp vô hạn nếu placeholder cũng lỗi
          target.src = `https://placehold.co/${cloud.size}x${Math.round(cloud.size * 0.6)}/ADD8E6/FFFFFF?text=Mây`; // Placeholder đám mây
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
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, // Relative to ground
          left: `calc(5% + ${particle.x}px)`, // Relative to character's general area
          opacity: particle.opacity,
          transform: 'translateY(50%)' // Adjust vertical alignment if needed
        }}
      ></div>
    ));
  };

  // --- NEW: Render Shield ---
  const renderShield = () => {
    if (!isShieldActive) return null;

    const shieldVisualSizePx = 80; // Kích thước hiển thị của khiên

    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none z-20" // z-20 để khiên ở trên nhân vật
         style={{
          // Căn giữa khiên với nhân vật, có thể cần điều chỉnh offset
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 10px)`, // Điều chỉnh Y offset nếu cần
          left: `calc(5% + 12px - ${shieldVisualSizePx / 2}px + 48px)`, // Căn giữa X với w-24 của nhân vật (48px là 1/2 của w-24)
          width: `${shieldVisualSizePx}px`,
          height: `${shieldVisualSizePx}px`,
          transition: 'bottom 0.3s ease-out, left 0.3s ease-out', // Thêm transition cho mượt mà
        }}
      >
        {/* Thanh máu của khiên */}
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
        className="absolute w-10 h-10" // Kích thước của coin
        style={{
          top: `${coin.y}%`,
          left: `${coin.x}%`,
          transform: 'translate(-50%, -50%)', // Căn giữa coin
          pointerEvents: 'none' // Để không cản click vào game
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie" // Lottie cho coin
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
        if (newState) {
            hideNavBar();
        } else {
            showNavBar();
        }
        return newState;
    });
  };

  // Show loading indicator if user data is being fetched
  if (isLoadingUserData && !auth.currentUser) { // Chỉ hiển thị loading nếu chưa có user và đang load
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      <style>{`
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
       <style jsx global>{` body { overflow: hidden; } `}</style>

      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            {auth.currentUser && (
                <CharacterCard
                    onClose={toggleStatsFullscreen}
                    coins={coins}
                    onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                />
            )}
        </ErrorBoundary>
      ) : (
        <div
          ref={gameRef}
          className={`${className ?? ''} relative w-full h-screen rounded-lg overflow-hidden shadow-2xl`}
          onClick={handleTap}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div> {/* Bầu trời */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div> {/* Mặt trời/Mặt trăng */}

          {renderClouds()}

          {/* Mặt đất */}
          <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600"> {/* Màu đất */}
                  {/* Các chi tiết nhỏ trên mặt đất */}
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

          {/* Thanh thông tin trên cùng */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30 glass-shadow-border">
            <div className="flex items-center">
                <div
                  className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={toggleStatsFullscreen}
                  title="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
                        alt="Biểu tượng chỉ số" // Mô tả biểu tượng
                        className="w-full h-full object-contain"
                         onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/32x32/ffffff/000000?text=Stats";
                        }}
                      />
                </div>
                {/* Thanh máu nhân vật */}
                <div className="w-32 relative"> {/* Container cho thanh máu và hiệu ứng sát thương */}
                    <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                        <div className="h-full overflow-hidden"> {/* Che đi phần máu đã mất */}
                            <div
                                className={`${getColor()} h-full transform origin-left`}
                                style={{
                                    transform: `scaleX(${healthPct})`,
                                    transition: 'transform 0.5s ease-out', // Animation khi máu thay đổi
                                }}
                            >
                                <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Hiệu ứng bóng trên thanh máu */}
                            </div>
                        </div>
                        {/* Hiệu ứng pulse nhẹ cho thanh máu */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                            style={{ animation: 'pulse 3s infinite' }}
                        />
                        {/* Text hiển thị máu */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    {/* Hiển thị số sát thương mất đi */}
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                            <div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs animate-fadeOutUp"
                            >
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Hiển thị tiền tệ (Gems và Coins) */}
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* Gems */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> {/* Hiệu ứng lướt qua */}
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()}
                        </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        {/* Hiệu ứng trang trí nhỏ */}
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>
                    {/* Coins - Sử dụng component CoinDisplay */}
                    <CoinDisplay
                      displayedCoins={displayedCoins}
                      isStatsFullscreen={isStatsFullscreen} // Truyền trạng thái fullscreen
                    />
                </div>
             )}
          </div>

          {/* Màn hình Game Over */}
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

          {/* Các nút chức năng bên trái (Shop, Inventory) */}
          {!isStatsFullscreen && (
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { label: "Shop", notification: true, special: true, centered: true, iconSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/shopping-bag.png", placeholderText: "Shop" },
                { label: "Inventory", notification: true, special: true, centered: true, iconSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/backpack.png", placeholderText: "Túi" }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                      <img src={item.iconSrc} alt={item.label} className="w-5 h-5 object-contain mb-0.5" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror=null; t.src=`https://placehold.co/20x20/777/fff?text=${item.placeholderText}`}}/>
                      <span className="text-white text-xs text-center block" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Các nút chức năng bên phải (Khiên, Mission, Blacksmith) */}
           {!isStatsFullscreen && (
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
               {/* Nút Khiên */}
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                onClick={activateShield}
                title={
                  !gameStarted || gameOver || isLoadingUserData ? "Không khả dụng" :
                  isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                  isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                  isStatsFullscreen ? "Không khả dụng" :
                  "Kích hoạt Khiên chắn"
                }
                aria-label="Sử dụng Khiên chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? -1 : 0}
              >
                <div className="w-10 h-10">
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" // Lottie cho khiên
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
              {/* Các nút khác (Mission, Blacksmith) */}
              {[
                { label: "Mission", notification: true, special: true, centered: true, iconSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/mission.png", placeholderText: "NV" },
                { label: "Blacksmith", notification: true, special: true, centered: true, iconSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/anvil.png", placeholderText: "Rèn" }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                   <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                      <img src={item.iconSrc} alt={item.label} className="w-5 h-5 object-contain mb-0.5" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror=null; t.src=`https://placehold.co/20x20/777/fff?text=${item.placeholderText}`}}/>
                      <span className="text-white text-xs text-center block" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Component Rương Báu */}
          <TreasureChest
            initialChests={3}
            keyCount={keyCount} // Truyền số chìa khóa hiện tại
            onKeyCollect={(n) => { // Hàm xử lý khi mở rương bằng chìa khóa
              console.log(`Chest opened using ${n} key(s).`);
              setKeyCount(prev => Math.max(0, prev - n)); // Giảm số chìa khóa local
              if (auth.currentUser) {
                updateKeysInFirestore(auth.currentUser.uid, -n); // Cập nhật Firestore
              }
            }}
            onCoinReward={startCoinCountAnimation} // Hàm xử lý khi nhận thưởng coin
            onGemReward={handleGemReward} // Hàm xử lý khi nhận thưởng gem
            isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen} // Trạng thái tạm dừng game
            isStatsFullscreen={isStatsFullscreen} // Trạng thái màn hình chỉ số
            currentUserId={currentUser ? currentUser.uid : null} // ID người dùng hiện tại
          />

        </div>
      )}
    </div>
  );
}
