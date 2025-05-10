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

// KeyIcon không còn được sử dụng trực tiếp ở đây, thay vào đó là img tag trong renderObstacle
// const KeyIcon = () => (
//   <img
//     src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
//     alt="Key Icon"
//     className="w-4 h-4 object-contain"
//   />
// );


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
    nextKeyIn: number; // This corresponds to the state variable `nextKeyIn`
}


// Update component signature to accept className, hideNavBar, showNavBar, and currentUser props
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {
  // Game states - Now using useSessionStorage for states that should persist in session
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH);
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0);
  const [obstacles, setObstacles] = useSessionStorage<GameObstacle[]>('gameObstacles', []);
  const [activeCoins, setActiveCoins] = useSessionStorage<GameCoin[]>('gameActiveCoins', []);
  const [isShieldActive, setIsShieldActive] = useSessionStorage<boolean>('gameIsShieldActive', false);
  const [shieldHealth, setShieldHealth] = useSessionStorage<number>('gameShieldHealth', 2000);
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useSessionStorage<boolean>('gameIsShieldOnCooldown', false);
  const [remainingCooldown, setRemainingCooldown] = useSessionStorage<number>('gameRemainingCooldown', 0);

  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  // const [runFrame, setRunFrame] = useState(0); // runFrame is not used
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, xVelocity: number, yVelocity: number, opacity: number, color: string, size: number }>>([]); // Specify particle type
  const [clouds, setClouds] = useState<GameCloud[]>([]);
  // const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // showHealthDamageEffect is not used

  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  // Shield Timers
  const SHIELD_MAX_HEALTH = 2000;
  const SHIELD_COOLDOWN_TIME = 200000; // 200 seconds
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [shieldCooldownStartTime, setShieldCooldownStartTime] = useSessionStorage<number | null>('gameShieldCooldownStartTime', null);
  const [pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining] = useSessionStorage<number | null>('gamePausedShieldCooldownRemaining', null);


  // --- Coin and Gem States (Persisted in Firestore) ---
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gems, setGems] = useState(0); // Initialize with 0, will load from Firestore

  // NEW: Key state and ref for key drop interval
  // CORRECTED: Changed from nextKeyInRef to [nextKeyIn, setNextKeyIn]
  const [nextKeyIn, setNextKeyIn] = useSessionStorage<number>('gameNextKeyIn', randomBetween(5, 10));
  const [keyCount, setKeyCount] = useState(0);


  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Although not used for runFrame, might be used for clearing
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // NEW: Ref for the main game loop interval
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // NEW: Firestore instance
  const db = getFirestore();

  // Obstacle types with properties
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
          console.error("User document does not exist for coin transaction.");
          transaction.set(userDocRef, {
            coins: Math.max(0, amount), // Initialize with the current amount if new
            gems: gems,
            keys: keyCount,
            createdAt: new Date()
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + amount;
          const finalCoins = Math.max(0, newCoins);
          transaction.update(userDocRef, { coins: finalCoins });
          // Update local state after successful Firestore update
          // This will be handled by startCoinCountAnimation's completion
        }
      });
      console.log(`Coins updated in Firestore for user ${userId} by ${amount}.`);
    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error);
    }
  };

   // Coin count animation function
  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = displayedCoins; // Animate from currently displayed coins
      const targetCoins = coins + reward; // Target is current Firestore coins + reward
      let step = Math.ceil(Math.abs(reward) / 30); // Step based on reward magnitude
      if (reward < 0) step = -step; // Handle deduction animation
      let currentAnimatedCoins = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          currentAnimatedCoins += step;
          let animationFinished = false;
          if ((reward > 0 && currentAnimatedCoins >= targetCoins) || (reward < 0 && currentAnimatedCoins <= targetCoins)) {
              currentAnimatedCoins = targetCoins;
              animationFinished = true;
          }

          setDisplayedCoins(currentAnimatedCoins);

          if (animationFinished) {
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null;
              setCoins(targetCoins); // Sync main coin state after animation

              if (auth.currentUser) {
                 updateCoinsInFirestore(auth.currentUser.uid, reward);
              } else {
                 console.log("User not authenticated, skipping Firestore update for coins.");
              }
          }
      }, 50);
      coinCountAnimationTimerRef.current = countInterval;
  };

  // --- NEW: Function to update user's key count in Firestore using a transaction ---
  const updateKeysInFirestore = async (userId: string, amount: number) => {
    if (!userId) {
      console.error("Cannot update keys: User not authenticated.");
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("User document does not exist for key transaction.");
          transaction.set(userDocRef, {
            coins: coins,
            gems: gems,
            keys: Math.max(0, amount), // Initialize with current amount
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          // Update local state after successful Firestore update
          setKeyCount(finalKeys);
        }
      });
      console.log(`Keys updated in Firestore for user ${userId} by ${amount}.`);
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
    }
  };


  // NEW: Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Received ${amount} gems from chest.`);
      // TODO: Implement Firestore update for gems if they need to be persistent
      // For now, gems are local to the session unless fetched/saved via fetchUserData
      if (auth.currentUser) {
        // Example: updateGemsInFirestore(auth.currentUser.uid, amount);
      }
  };

  // NEW: Function to handle key collection (called when obstacle with key is defeated)
  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // Local state update is now handled by updateKeysInFirestore's callback
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      } else {
        console.log("User not authenticated, skipping Firestore key update.");
      }
  };

  // CORRECTED: Helper function to decide if an obstacle has a key and update the counter
  const decideAndDecrementKeyCounter = (): boolean => {
    let currentCounterVal = nextKeyIn; // Read current state value
    currentCounterVal--;
    const dropsKey = currentCounterVal <= 0;
    if (dropsKey) {
      currentCounterVal = randomBetween(5, 10); // Reset counter for the next cycle
    }
    setNextKeyIn(currentCounterVal); // Update the state for the next obstacle
    return dropsKey; // Return whether *this* obstacle gets a key
  };


  // Function to start a NEW game (resets session storage states)
  const startNewGame = () => {
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    // setObstacles([]); // Obstacles will be set below
    setActiveCoins([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    setShieldCooldownStartTime(null);
    setPausedShieldCooldownRemaining(null);
    // CORRECTED: Reset nextKeyIn state directly
    setNextKeyIn(randomBetween(5, 10));

    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    // setShowHealthDamageEffect(false); // Not used
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);

    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({
          id: Date.now(),
          position: 120, // Initial position further to the right
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: decideAndDecrementKeyCounter(), // CORRECTED
        });

        for (let i = 1; i < 5; i++) { // Create a few initial obstacles
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          initialObstacles.push({
            id: Date.now() + i,
            position: 120 + (i * (50 + randomBetween(0,20))), // Spread them out
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: decideAndDecrementKeyCounter(), // CORRECTED
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
        setGameOver(true); // Effectively end the game
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
        // CORRECTED: Reset nextKeyIn state directly
        setNextKeyIn(randomBetween(5, 10));

        setIsRunning(false);
        // setShowHealthDamageEffect(false); // Not used
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setIsLoadingUserData(false);

        // Clear relevant session storage items manually if needed, though useSessionStorage handles its own keys.
        // This ensures a full reset beyond what useSessionStorage might do on initial load if keys persist.
        const gameKeys = [
            'gameHealth', 'gameCharacterPos', 'gameObstacles', 'gameActiveCoins',
            'gameIsShieldActive', 'gameShieldHealth', 'gameIsShieldOnCooldown',
            'gameRemainingCooldown', 'gameShieldCooldownStartTime', 'gamePausedShieldCooldownRemaining',
            'gameNextKeyIn'
        ];
        gameKeys.forEach(key => sessionStorage.removeItem(key));


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
  }, []); // Removed auth from dependency array as onAuthStateChanged handles its lifecycle.

  // Effect to handle game over state
  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) { // Added !gameOver to prevent multiple triggers
      setGameOver(true);
      setIsRunning(false);
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current); // if it were used
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
  }, [health, gameStarted, gameOver]);

  // Generate initial cloud elements
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        x: Math.random() * 120 + 100, // Start off-screen to the right
        y: Math.random() * 40 + 10,  // Random vertical position
        size: Math.random() * 40 + 30, // Random size
        speed: Math.random() * 0.3 + 0.15, // Random speed
        imgSrc: randomImgSrc
      });
    }
    setClouds(newClouds);
  };

  // Generate dust particles for visual effect
  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    const newParticleArray: typeof particles = []; // Use defined type
    for (let i = 0; i < 2; i++) {
      newParticleArray.push({
        id: Date.now() + Math.random(), // More unique ID
        x: 5 + Math.random() * 5, // Character's general foot area
        y: 0, // Start at ground level relative to character's feet container
        xVelocity: -Math.random() * 1 - 0.5, // Move left and slightly up/down
        yVelocity: Math.random() * 0.5 - 0.25, // Slight vertical movement
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700',
        size: Math.random() * 3 + 2 // Particle size
      });
    }
    setParticles(prev => [...prev, ...newParticleArray].slice(-50)); // Keep max 50 particles
  };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted check
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 10000) + 4000; // Adjusted timing
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear existing before setting new
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Check again before creating

      const obstacleCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 obstacles
      const newObstaclesToAdd: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 20 + 30); // Ensure some spacing if multiple

            newObstaclesToAdd.push({
              id: Date.now() + i + Math.random(), // More unique ID
              position: 100 + spacing, // Start off-screen
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: decideAndDecrementKeyCounter(), // CORRECTED
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstaclesToAdd]);
      scheduleNextObstacle(); // Schedule the next one
    }, randomTime);
  };

  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted check
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000;
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current); // Clear existing
    coinScheduleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Check again

      const newCoin: GameCoin = {
        id: Date.now() + Math.random(),
        x: 110, // Start off-screen right
        y: Math.random() * 50 + 10, // Random height, avoiding very top/bottom
        initialSpeedX: Math.random() * 0.4 + 0.3, // Slightly slower horizontal
        initialSpeedY: Math.random() * 0.2 - 0.1, // Slight vertical drift
        attractSpeed: Math.random() * 0.06 + 0.04, // Attraction speed
        isAttracted: false
      };

      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin(); // Schedule next
    }, randomTime);
  };


  // Handle character jump action
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80); // Jump height
      setTimeout(() => {
        // Check game state again before resetting position, in case game ended mid-jump
        if (gameStarted && !gameOver && !isStatsFullscreen) {
          setCharacterPos(0); // Return to ground
        } else if (!gameStarted || gameOver) { // If game ended or not started, ensure grounded
            setCharacterPos(0);
        }
        // Always reset jumping state after jump duration, regardless of game over
        setTimeout(() => {
            setJumping(false);
        }, 100); // Short delay to allow landing animation if any
      }, 600); // Jump duration
    }
  };

  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData) return;

    if (!gameStarted) {
      startNewGame();
    } else if (gameOver) {
      startNewGame();
    } else {
      jump(); // Allow jumping on tap if game is running
    }
  };


  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      // This function can be used to add a visual effect to the health bar itself,
      // e.g., a quick flash or shake. For now, it's not implemented visually
      // but called when damage occurs.
      // setShowHealthDamageEffect(true); // If a visual effect state is used
      // setTimeout(() => setShowHealthDamageEffect(false), 300);
  };

  // Trigger character damage effect and floating number
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);
      setTimeout(() => setShowDamageNumber(false), 800);
  };

  // --- NEW: Function to activate Shield skill ---
  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) {
      return;
    }
    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(true);
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000));
    const now = Date.now();
    setShieldCooldownStartTime(now);
    setPausedShieldCooldownRemaining(null);

    if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    shieldCooldownTimerRef.current = setTimeout(() => {
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        setShieldCooldownStartTime(null);
        setPausedShieldCooldownRemaining(null);
        setIsShieldActive(false); // Shield deactivates when cooldown ends if not broken
    }, SHIELD_COOLDOWN_TIME);
  };


  // Main game loop: Move obstacles, clouds, particles, coins, and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        // No need to clear particle timer here, handled by its own scheduling logic
        return;
    }

    if (!gameLoopIntervalRef.current) { // Start loop if not already running
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Base speed for obstacles

            // Obstacle logic
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character dimensions and position (simplified for collision)
                const characterWidth_px = (24 / 4) * 10; // Approx w-10 (40px)
                const characterHeight_px = (24 / 4) * 12; // Approx h-12 (48px)
                const characterXPercent = 5; // Character's fixed X position
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                // Character's bottom Y position from the top of the game container
                const characterBottom_absY_px = gameHeight - groundPx - characterPos;
                const characterTop_absY_px = characterBottom_absY_px - characterHeight_px;


                return prevObstacles.map(obstacle => {
                    let newPosition = obstacle.position - speed;
                    let collisionDetectedThisFrame = false;

                    const obstacleCurrentX_px = (newPosition / 100) * gameWidth;
                    const obstacleWidth_px = (obstacle.width / 4) * 16; // Convert Tailwind units to px
                    const obstacleHeight_px = (obstacle.height / 4) * 16;

                    // Obstacle's Y position (bottom edge is at ground level)
                    const obstacleBottom_absY_px = gameHeight - groundPx;
                    const obstacleTop_absY_px = obstacleBottom_absY_px - obstacleHeight_px;

                    // Collision detection logic
                    if (
                        characterX_px < obstacleCurrentX_px + obstacleWidth_px &&
                        characterX_px + characterWidth_px > obstacleCurrentX_px &&
                        characterTop_absY_px < obstacleBottom_absY_px &&
                        characterBottom_absY_px > obstacleTop_absY_px
                    ) {
                        collisionDetectedThisFrame = true;
                        if (isShieldActive) {
                            setShieldHealth(prev => {
                                const newShieldHealth = Math.max(0, prev - obstacle.damage);
                                if (newShieldHealth <= 0) setIsShieldActive(false);
                                return newShieldHealth;
                            });
                        } else {
                            setHealth(prev => Math.max(0, prev - obstacle.damage));
                            triggerHealthDamageEffect();
                            triggerCharacterDamageEffect(obstacle.damage);
                        }

                        // If obstacle has a key and collision occurs, player gets the key
                        if (obstacle.hasKey) {
                            handleKeyCollect(1); // Award 1 key
                            // Make the obstacle lose its key so it's not awarded again
                            return { ...obstacle, position: newPosition, collided: true, hasKey: false };
                        }
                        return { ...obstacle, position: newPosition, collided: true }; // Mark as collided to be filtered
                    }

                    // Recycle obstacle if it goes off-screen
                    if (newPosition < -20 && !collisionDetectedThisFrame) { // -20% to ensure fully off-screen
                        if (obstacleTypes.length > 0) {
                            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                            const randomOffset = Math.floor(Math.random() * 20);
                            return {
                                ...obstacle, // Retain ID for keying if necessary, or generate new
                                id: Date.now() + Math.random(), // New ID for recycled obstacle
                                position: 100 + randomOffset, // Reset position to the right
                                ...randomObstacleType, // Reset type and other properties
                                health: randomObstacleType.baseHealth,
                                maxHealth: randomObstacleType.baseHealth,
                                hasKey: decideAndDecrementKeyCounter(), // CORRECTED
                                collided: false, // Reset collided state
                            };
                        }
                    }
                    return { ...obstacle, position: newPosition, collided: collisionDetectedThisFrame };
                }).filter(obstacle => !obstacle.collided && obstacle.position > -25); // Keep if not collided and on screen
            });

            // Cloud movement
            setClouds(prevClouds => prevClouds.map(cloud => {
                const newX = cloud.x - cloud.speed;
                if (newX < -50) { // Cloud moved off screen
                    const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                    return {
                        ...cloud,
                        id: Date.now() + Math.random(),
                        x: 120 + Math.random() * 30, // Reset to the right
                        y: Math.random() * 40 + 10,
                        size: Math.random() * 40 + 30,
                        speed: Math.random() * 0.3 + 0.15,
                        imgSrc: randomImgSrc
                    };
                }
                return { ...cloud, x: newX };
            }).filter(cloud => cloud.x > -50)); // Filter out clouds far off-screen

            // Particle movement
            setParticles(prevParticles => prevParticles.map(p => ({
                ...p,
                x: p.x + p.xVelocity,
                y: p.y + p.yVelocity,
                opacity: p.opacity - 0.02, // Fade out
                size: Math.max(0, p.size - 0.05) // Shrink
            })).filter(p => p.opacity > 0 && p.size > 0));

            // Coin movement and collection
            setActiveCoins(prevActiveCoins => {
                 const gameContainer = gameRef.current;
                if (!gameContainer) return prevActiveCoins;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const characterWidth_px = (24 / 4) * 10;
                const characterHeight_px = (24 / 4) * 12;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottom_absY_px = gameHeight - groundPx - characterPos;
                const characterTop_absY_px = characterBottom_absY_px - characterHeight_px;
                const characterCenterX_px = characterX_px + characterWidth_px / 2;
                const characterCenterY_px = characterTop_absY_px + characterHeight_px / 2;


                return prevActiveCoins.map(coin => {
                    const coinSize_px = 40; // Approx visual size of coin lottie
                    const coinCurrentX_px = (coin.x / 100) * gameWidth;
                    const coinCurrentY_px = (coin.y / 100) * gameHeight;
                    let newX = coin.x;
                    let newY = coin.y;
                    let collectedThisFrame = false;
                    let shouldBeAttracted = coin.isAttracted;

                    // Initial collision check to start attraction
                    if (!shouldBeAttracted) {
                        if (
                            characterX_px < coinCurrentX_px + coinSize_px &&
                            characterX_px + characterWidth_px > coinCurrentX_px &&
                            characterTop_absY_px < coinCurrentY_px + coinSize_px &&
                            characterBottom_absY_px > coinCurrentY_px
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted) {
                        const dx = characterCenterX_px - coinCurrentX_px;
                        const dy = characterCenterY_px - coinCurrentY_px;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.5) { // Closer threshold for collection
                            collectedThisFrame = true;
                            const awardedCoins = randomBetween(1, 5);
                            startCoinCountAnimation(awardedCoins); // Handles animation and Firestore
                        } else if (distance > 1) { // Move if not yet collected and not too close
                            const moveStep = distance * coin.attractSpeed;
                            const moveX_px = (dx / distance) * moveStep;
                            const moveY_px = (dy / distance) * moveStep;
                            newX = ((coinCurrentX_px + moveX_px) / gameWidth) * 100;
                            newY = ((coinCurrentY_px + moveY_px) / gameHeight) * 100;
                        }
                    } else {
                        // Initial movement if not attracted
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY; // Can drift up/down
                    }

                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collected: collectedThisFrame };
                }).filter(coin => !coin.collected && coin.x > -10 && coin.y < 110 && coin.y > -10); // Filter if collected or off-screen
            });

        }, 30); // Game loop interval (approx 33 FPS)
    }

    return () => { // Cleanup on effect re-run or unmount
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
    };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, characterPos, nextKeyIn]); // Added nextKeyIn as it's read in decideAndDecrementKeyCounter called from this loop's effects


  // Effect to manage obstacle and coin scheduling timers
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || !gameStarted) {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Stop generating new particles
          obstacleTimerRef.current = null;
          coinScheduleTimerRef.current = null;
          particleTimerRef.current = null;
      } else { // Game is active
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) {
            particleTimerRef.current = setInterval(generateParticles, 300);
          }
      }
      // Cleanup timers when dependencies change or component unmounts
      return () => {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]);

  // Effect for shield cooldown management
  useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout | null = null;

    if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted) {
        // Pause logic
        if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) {
            const elapsedTime = Date.now() - shieldCooldownStartTime;
            const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
            setPausedShieldCooldownRemaining(remainingTimeMs);
            clearTimeout(shieldCooldownTimerRef.current);
            shieldCooldownTimerRef.current = null;
        }
        if (cooldownCountdownTimerRef.current) {
            clearInterval(cooldownCountdownTimerRef.current);
            cooldownCountdownTimerRef.current = null;
        }
    } else if (isShieldOnCooldown) {
        // Resume or start logic
        let resumeTimeMs = SHIELD_COOLDOWN_TIME;
        if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
            resumeTimeMs = pausedShieldCooldownRemaining;
            setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - resumeTimeMs));
            setPausedShieldCooldownRemaining(null); // Clear paused state
        } else if (shieldCooldownStartTime !== null) {
             const elapsedTime = Date.now() - shieldCooldownStartTime;
             resumeTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
        }


        if (resumeTimeMs > 0) {
            if (!shieldCooldownTimerRef.current) { // Ensure main timer is running or restarted
                 shieldCooldownTimerRef.current = setTimeout(() => {
                    setIsShieldOnCooldown(false);
                    setRemainingCooldown(0);
                    setShieldCooldownStartTime(null);
                    setIsShieldActive(false); // Shield off when cooldown ends
                }, resumeTimeMs);
            }

            if (!cooldownCountdownTimerRef.current) { // Start/resume countdown display
                setRemainingCooldown(Math.ceil(resumeTimeMs / 1000));
                countdownIntervalId = setInterval(() => {
                    setRemainingCooldown(prev => {
                        const newRemaining = Math.max(0, prev - 1);
                        if (newRemaining === 0) {
                            if(countdownIntervalId) clearInterval(countdownIntervalId);
                            cooldownCountdownTimerRef.current = null;
                        }
                        return newRemaining;
                    });
                }, 1000);
                cooldownCountdownTimerRef.current = countdownIntervalId;
            }
        } else { // Cooldown should have ended
            setIsShieldOnCooldown(false);
            setRemainingCooldown(0);
            setShieldCooldownStartTime(null);
            setIsShieldActive(false);
        }

    } else { // Not on cooldown, game active
        if (cooldownCountdownTimerRef.current) {
            clearInterval(cooldownCountdownTimerRef.current);
            cooldownCountdownTimerRef.current = null;
        }
        if (remainingCooldown !== 0) setRemainingCooldown(0);
        // Shield main timer should not be running if not on cooldown
        if (shieldCooldownTimerRef.current) {
            clearTimeout(shieldCooldownTimerRef.current);
            shieldCooldownTimerRef.current = null;
        }
    }

    return () => {
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        // Main shield timer (shieldCooldownTimerRef) is cleared by its own logic or above
    };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, gameStarted, shieldCooldownStartTime, pausedShieldCooldownRemaining, setRemainingCooldown, setIsShieldOnCooldown, setShieldCooldownStartTime, setPausedShieldCooldownRemaining, setIsShieldActive]);


  // Effect to clean up all timers on unmount
  useEffect(() => {
    return () => {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    };
  }, []);

    // Effect for coin counter animation visual cue
  useEffect(() => {
    if (displayedCoins === coins) return; // No change, no animation needed

    const coinElement = document.querySelector('.coin-counter-value'); // Target specific span
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
      };
      coinElement.addEventListener('animationend', animationEndHandler, { once: true });
      return () => coinElement.removeEventListener('animationend', animationEndHandler);
    }
    return () => {};
  }, [displayedCoins, coins]);


  // Calculate health percentage for the bar
  const healthPct = Math.max(0, health / MAX_HEALTH); // Ensure pct is not negative

  // Determine health bar color
  const getHealthBarColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate shield health percentage
  const shieldHealthPct = isShieldActive ? Math.max(0, shieldHealth / SHIELD_MAX_HEALTH) : 0;


  // Render the character
  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24" // Adjusted size for consistency
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%', // Character's fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
          zIndex: 10 // Ensure character is above ground elements
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

  // Render obstacles
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;

    // Common style for Lottie wrapper
    const lottieWrapperStyle = { width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` };

    switch(obstacle.type) {
      // Removed 'rock' as it's not in obstacleTypes, add if needed
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2': // Assuming similar rendering for both Lottie types
        obstacleEl = (
          <div className="relative" style={lottieWrapperStyle}>
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
      default: // Fallback for unknown types
        obstacleEl = (
          <div
            className={`bg-gradient-to-b ${obstacle.color || 'from-gray-400 to-gray-600'} rounded`}
            style={lottieWrapperStyle} // Use calculated dimensions
          ></div>
        );
    }

    const obstacleHealthPct = Math.max(0, obstacle.health / obstacle.maxHealth);

    return (
      <div
        key={obstacle.id}
        className="absolute" // Positioned by left and bottom
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Align bottom with ground
          left: `${obstacle.position}%`,
          zIndex: 5 // Obstacles above ground, below character if overlap
        }}
      >
        {/* Health bar container, positioned above the obstacle */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-500 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-400' : obstacleHealthPct > 0.3 ? 'bg-yellow-400' : 'bg-red-400'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
            {/* Key icon display, positioned above the health bar */}
            {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Chìa khóa" // CORRECTED: Vietnamese alt text
                className="absolute w-4 h-4" // Adjust size as needed
                style={{
                    bottom: 'calc(100% + 2px)', // 2px above the health bar's top edge
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1 // Ensure key is above health bar fill
                }}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop if placeholder also fails
                    target.src="https://placehold.co/16x16/000000/ffffff?text=K"; // Simple placeholder
                }}
              />
            )}
        </div>
        {obstacleEl} {/* The visual representation of the obstacle */}
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <img
        key={cloud.id}
        src={cloud.imgSrc}
        alt="Đám mây" // Vietnamese alt text
        className="absolute object-contain"
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`, // Maintain aspect ratio
          top: `${cloud.y}%`,
          left: `${cloud.x}%`,
          opacity: 0.8,
          zIndex: 1 // Clouds in the background
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Mây";
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
          // Position particles relative to character's feet area, adjusted for GROUND_LEVEL_PERCENT
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`,
          left: `calc(5% + 20px + ${particle.x}px)`, // Approx character center + particle offset
          opacity: particle.opacity,
          zIndex: 11 // Particles above character
        }}
      ></div>
    ));
  };

  // Render Shield
  const renderShield = () => {
    if (!isShieldActive) return null;

    const shieldSizePx = 80; // Visual size of the shield Lottie

    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none"
         style={{
          // Position shield around the character
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + ${24 / 2}px)`, // Centered vertically on character
          left: `calc(5% + ${24 / 2}px)`, // Centered horizontally on character
          transform: 'translate(-50%, -50%)', // Adjust for centering based on shield size
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
          zIndex: 20 // Shield above character
        }}
      >
        {shieldHealth > 0 && ( // Shield health bar (optional, can be part of Lottie)
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1 absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-blue-400' : shieldHealthPct > 0.3 ? 'bg-yellow-400' : 'bg-red-400'} transition-transform duration-200 ease-linear`}
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


  // Render Coins
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id}
        className="absolute" // Size will be determined by Lottie
        style={{
          top: `${coin.y}%`,
          left: `${coin.x}%`,
          transform: 'translate(-50%, -50%)', // Center Lottie on position
          pointerEvents: 'none', // Coins are not directly interactive
          zIndex: 15 // Coins above obstacles, potentially above character when collecting
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
          className="w-10 h-10" // Explicit size for the Lottie player
        />
      </div>
    ));
  };


  // Toggle full-screen stats
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return;

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) hideNavBar(); else showNavBar();
        return newState;
    });
  };

  // Loading indicator
  if (isLoadingUserData && !auth.currentUser) { // Show loading only if no user yet and loading
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative font-['Inter',_sans-serif]">
      <style>{`
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: inherit; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
        @keyframes pulse-glimmer { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } } /* Renamed from pulse */
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
        .glass-shadow-border { box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(255,255,255,0.1); }
      `}</style>
       <style jsx global>{` body { overflow: hidden; font-family: 'Inter', sans-serif; } `}</style>

      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            {auth.currentUser && (
                <CharacterCard
                    onClose={toggleStatsFullscreen}
                    coins={coins}
                    onUpdateCoins={(amount) => { // Ensure startCoinCountAnimation handles Firestore update
                        startCoinCountAnimation(amount);
                    }}
                />
            )}
        </ErrorBoundary>
      ) : (
        <div
          ref={gameRef}
          className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} // Use h-full, ensure parent has height
          onClick={handleTap}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 z-0"></div>
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 z-1"></div> {/* Sun */}
          {renderClouds()}

          {/* Ground */}
          <div className="absolute bottom-0 w-full z-2" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600">
                  {/* Ground details */}
                  <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                  {[...Array(5)].map((_, i) => ( // Add more ground details
                      <React.Fragment key={i}>
                          <div className="w-3 h-3 bg-gray-900 rounded-full absolute" style={{ top: `${10 + Math.random()*20}%`, left: `${10 + i * 18 + Math.random()*5}%` }}></div>
                          <div className="w-4 h-2 bg-gray-900 rounded-full absolute" style={{ top: `${30 + Math.random()*20}%`, left: `${15 + i * 18 + Math.random()*5}%` }}></div>
                      </React.Fragment>
                  ))}
              </div>
          </div>

          {/* Game Elements */}
          {gameStarted && !gameOver && renderCharacter()}
          {gameStarted && !gameOver && renderShield()}
          {gameStarted && obstacles.map(obstacle => renderObstacle(obstacle))}
          {gameStarted && renderCoins()}
          {gameStarted && !gameOver && renderParticles()}


          {/* UI Overlay - Top Bar */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-50 shadow-lg z-30 glass-shadow-border">
            <div className="flex items-center space-x-2">
                <div
                  className="relative cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={toggleStatsFullscreen}
                  title="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
                        alt="Biểu tượng chỉ số"
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
                    <div className={`h-4 ${getHealthBarColor()} rounded-md overflow-hidden border border-gray-600 shadow-inner transition-all duration-300`}
                         style={{ width: `${healthPct * 100}%` }}>
                        <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Highlight */}
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                            {Math.round(health)}/{MAX_HEALTH}
                        </span>
                    </div>
                    {/* Damage Number */}
                    {showDamageNumber && (
                        <div
                            className="absolute -top-4 left-1/2 text-red-500 font-bold text-sm animate-fadeOutUp"
                        >
                            -{damageAmount}
                        </div>
                    )}
                </div>
            </div>
            {/* Currency Display */}
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-2 currency-display-container relative">
                    {/* Gems */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-lg p-1 px-2 flex items-center shadow-lg border border-purple-400/50 group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <GemIcon size={16} color="#e9d5ff" className="relative z-10 mr-1.5" />
                        <span className="font-bold text-purple-200 text-xs tracking-wide relative z-10">{gems.toLocaleString()}</span>
                        <div className="ml-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center cursor-pointer border border-purple-300/70 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse relative z-10">
                            <span className="text-white font-bold text-[0.6rem]">+</span>
                        </div>
                    </div>
                    {/* Coins - Using CoinDisplay component */}
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={isStatsFullscreen} />
                     {/* Key Count Display */}
                    <div className="bg-gradient-to-br from-yellow-600 to-orange-800 rounded-lg p-1 px-2 flex items-center shadow-lg border border-yellow-400/50 group hover:scale-105 transition-all duration-300">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png" alt="Chìa khóa" className="w-4 h-4 mr-1.5 relative z-10"/>
                        <span className="font-bold text-yellow-200 text-xs tracking-wide relative z-10">{keyCount.toLocaleString()}</span>
                    </div>
                </div>
             )}
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-40">
              <h2 className="text-4xl font-bold mb-4 text-red-500 drop-shadow-lg">Game Over</h2>
              <button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg transform transition hover:scale-105 shadow-xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                onClick={startNewGame}
              >
                Chơi Lại
              </button>
            </div>
          )}
          {/* Start Game Prompt */}
          {!gameStarted && !isLoadingUserData && !gameOver && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-40">
                <h2 className="text-3xl font-bold mb-4 text-yellow-400 drop-shadow-lg">Nhấn để Bắt Đầu!</h2>
             </div>
          )}


          {/* Action Buttons - Bottom Right (Shield, etc.) */}
           {!isStatsFullscreen && gameStarted && !gameOver && (
            <div className="absolute right-4 bottom-4 flex flex-col space-y-3 z-30">
               <div
                className={`w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl shadow-xl border-2 border-blue-500/70 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden group
                            ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData
                                ? 'opacity-60 cursor-not-allowed filter grayscale'
                                : 'hover:scale-105 hover:shadow-blue-400/50 cursor-pointer'}`}
                onClick={activateShield}
                title={ /* More descriptive titles */
                  isLoadingUserData ? "Đang tải..." :
                  !gameStarted ? "Bắt đầu game để dùng" :
                  gameOver ? "Game đã kết thúc" :
                  isStatsFullscreen ? "Đóng bảng chỉ số để dùng" :
                  isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                  isShieldOnCooldown ? `Khiên hồi chiêu: ${remainingCooldown}s` :
                  "Kích hoạt Khiên Chắn"
                }
                aria-label="Kích hoạt Khiên Chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? -1 : 0}
              >
                <div className="w-10 h-10 relative z-10 flex items-center justify-center">
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                      loop
                      autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
                      className="w-full h-full filter group-hover:brightness-110 transition-all"
                   />
                </div>
                {isShieldOnCooldown && remainingCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-lg font-bold z-20">
                    {remainingCooldown}s
                  </div>
                )}
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md animate-pulse-fast -z-10"></div>
              </div>
              {/* Placeholder for other action buttons */}
            </div>
          )}

          {/* Decorative/Placeholder Buttons - Bottom Left */}
           {!isStatsFullscreen && gameStarted && !gameOver && (
            <div className="absolute left-4 bottom-4 flex flex-col space-y-3 z-30">
              {[
                { label: "Cửa Hàng", iconLottie: "https://lottie.host/59b48399-9695-49db-8b32-395735969939/x3yS09N1zS.lottie" }, // Example Shop Lottie
                { label: "Nhiệm Vụ", iconLottie: "https://lottie.host/e9a43a90-1196-4f53-9f0d-a0a3a0da0a86/j22jB0Qb0M.lottie" }, // Example Mission Lottie
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg border-2 border-slate-600/70 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-slate-500/50 relative overflow-hidden">
                    <div className="w-8 h-8 mb-0.5 relative z-10">
                        <DotLottieReact src={item.iconLottie} loop autoplay className="w-full h-full filter group-hover:brightness-110"/>
                    </div>
                    <span className="text-white text-[0.6rem] font-semibold text-center block relative z-10">{item.label}</span>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-sm animate-pulse-fast -z-10"></div>
                </div>
              ))}
            </div>
          )}


          <TreasureChest
            initialChests={3}
            keyCount={keyCount}
            onKeyCollect={(keysToUse) => {
              if (auth.currentUser) {
                updateKeysInFirestore(auth.currentUser.uid, -keysToUse); // Deduct keys
              }
            }}
            onCoinReward={startCoinCountAnimation} // Handles animation and Firestore
            onGemReward={handleGemReward}
            isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen}
            isStatsFullscreen={isStatsFullscreen} // Pass this prop if TreasureChest needs to know
            currentUserId={currentUser ? currentUser.uid : null}
          />

        </div>
      )}
    </div>
  );
}

