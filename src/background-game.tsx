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
    nextKeyIn: number; // CHANGED: This was the problematic name, now it's clear it's a number
    // Add other temporary game state you want to save
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
  const [runFrame, setRunFrame] = useState(0);
  const [particles, setParticles] = useState<any[]>([]); // Specify particle type if defined
  const [clouds, setClouds] = useState<GameCloud[]>([]);

  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  const SHIELD_MAX_HEALTH = 2000;
  const SHIELD_COOLDOWN_TIME = 200000; // 200 seconds
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [shieldCooldownStartTime, setShieldCooldownStartTime] = useSessionStorage<number | null>('gameShieldCooldownStartTime', null);
  const [pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining] = useSessionStorage<number | null>('gamePausedShieldCooldownRemaining', null);

  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gems, setGems] = useState(42);

  // --- KEY LOGIC CHANGE ---
  // Renamed from nextKeyInRef to nextKeyInCounter and use the state tuple correctly.
  // This state determines how many more obstacles will spawn before one carries a key.
  const [nextKeyInCounter, setNextKeyInCounter] = useSessionStorage<number>('gameNextKeyInCounter', randomBetween(5, 10));
  const [keyCount, setKeyCount] = useState(0); // Player's key count

  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  const GROUND_LEVEL_PERCENT = 45;

  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const db = getFirestore();

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

  const cloudImageUrls = [
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];

  function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const fetchUserData = async (userId: string) => {
    setIsLoadingUserData(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setCoins(userData.coins || 0);
        setDisplayedCoins(userData.coins || 0);
        setGems(userData.gems || 0);
        setKeyCount(userData.keys || 0);
      } else {
        await setDoc(userDocRef, { coins: 0, gems: 0, keys: 0, createdAt: new Date() });
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

  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins: Math.max(0, amount), gems: gems, keys: keyCount, createdAt: new Date() });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const finalCoins = Math.max(0, currentCoins + amount);
          transaction.update(userDocRef, { coins: finalCoins });
          setCoins(finalCoins); // Update local state after successful Firestore update
        }
      });
    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error);
    }
  };

  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30);
      let current = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null;
              if (auth.currentUser) {
                 updateCoinsInFirestore(auth.currentUser.uid, reward);
              }
          } else {
              setDisplayedCoins(current);
          }
      }, 50);
      coinCountAnimationTimerRef.current = countInterval;
  };

  const updateKeysInFirestore = async (userId: string, amount: number) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins: coins, gems: gems, keys: Math.max(0, amount), createdAt: new Date() });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const finalKeys = Math.max(0, currentKeys + amount);
          transaction.update(userDocRef, { keys: finalKeys });
          setKeyCount(finalKeys); // Update local state
        }
      });
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
    }
  };

  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      // TODO: Implement Firestore update for gems
  };

  const handleKeyCollect = (amount: number) => {
      setKeyCount(prev => prev + amount);
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount);
      }
  };

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
    
    // --- KEY LOGIC CHANGE ---
    // Correctly reset the counter for the next key
    let currentObstaclesUntilKey = randomBetween(5, 10);
    setNextKeyInCounter(currentObstaclesUntilKey); 

    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);

    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        // --- KEY LOGIC CHANGE ---
        // Determine if the first obstacle has a key
        currentObstaclesUntilKey -= 1;
        const hasKeyFirst = currentObstaclesUntilKey <= 0;
        if (hasKeyFirst) {
            currentObstaclesUntilKey = randomBetween(5, 10); // Reset for the next key cycle
        }
        
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
          
          // --- KEY LOGIC CHANGE ---
          // Determine if this obstacle in the loop has a key
          currentObstaclesUntilKey -= 1;
          const hasKeyLoop = currentObstaclesUntilKey <= 0;
          if (hasKeyLoop) {
            currentObstaclesUntilKey = randomBetween(5, 10); // Reset for the next key cycle
          }

          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50) + (Math.random() * 30), // Added some randomness to spacing
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKeyLoop,
          });
        }
        // --- KEY LOGIC CHANGE ---
        // Persist the final counter value after generating initial obstacles
        setNextKeyInCounter(currentObstaclesUntilKey);
    }

    setObstacles(initialObstacles);
    generateInitialClouds(5);

    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    particleTimerRef.current = setInterval(generateParticles, 300);

    scheduleNextObstacle();
    scheduleNextCoin();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
        setGameStarted(true);
        setIsRunning(true);
      } else {
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
        // --- KEY LOGIC CHANGE ---
        // Reset key counter on logout
        setNextKeyInCounter(randomBetween(5, 10)); 

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
        // --- KEY LOGIC CHANGE ---
        sessionStorage.removeItem('gameNextKeyInCounter'); // Clear specific session storage for key counter

        clearTimeout(obstacleTimerRef.current!);
        clearInterval(runAnimationRef.current!);
        clearInterval(particleTimerRef.current!);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        clearInterval(coinScheduleTimerRef.current!);
        clearInterval(coinCountAnimationTimerRef.current!);
        if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      }
    });
    return () => unsubscribe();
  }, []); // Removed auth from dependencies as onAuthStateChanged handles it.

  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      clearTimeout(obstacleTimerRef.current!);
      clearInterval(runAnimationRef.current!);
      clearInterval(particleTimerRef.current!);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      clearInterval(coinScheduleTimerRef.current!);
      clearInterval(coinCountAnimationTimerRef.current!);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    }
  }, [health, gameStarted]);

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

  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;
    const newParticles: any[] = []; // Define particle type if available
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(), // Ensure unique ID
        x: 5 + Math.random() * 5,
        y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        size: Math.random() * 3 + 2, // Give particles a size
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted check
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 10000) + 3000; // Adjusted timing
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Check again before spawning

      const obstacleCount = Math.floor(Math.random() * 2) + 1; // Max 1 or 2 obstacles at a time
      const newObstaclesToAdd: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            // --- KEY LOGIC CHANGE ---
            // Determine if this new obstacle has a key
            // Use functional update for setNextKeyInCounter to ensure it uses the latest state
            let hasKeyForThisObstacle = false;
            setNextKeyInCounter(prevCounter => {
                let currentCounter = prevCounter - 1;
                if (currentCounter <= 0) {
                    hasKeyForThisObstacle = true;
                    return randomBetween(5, 10); // Reset for the next cycle
                }
                return currentCounter; // Decrement
            });

            newObstaclesToAdd.push({
              id: Date.now() + i + Math.random(), // Ensure unique ID
              position: 100 + (i * (Math.random() * 20 + 20)), // Spacing
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKeyForThisObstacle, // Assign determined key status
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstaclesToAdd]);
      scheduleNextObstacle(); // Schedule the next batch
    }, randomTime);
  };

  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted check
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
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Check again

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

  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80); // Jump height
      setTimeout(() => {
        // Check game state before resetting position
        if (gameStarted && !gameOver && !isStatsFullscreen) {
          setCharacterPos(0); // Land
          setTimeout(() => {
            setJumping(false);
          }, 100); // Short delay before allowing another jump
        } else {
            // If game ended or paused mid-jump, ensure character is grounded and jumping is false
            setCharacterPos(0);
            setJumping(false);
        }
      }, 600); // Jump duration
    }
  };

  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData) return;
    if (!gameStarted) {
      startNewGame();
    } else if (gameOver) {
      startNewGame();
    } else {
      jump(); // Allow jump on tap if game is running
    }
  };

  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => setShowHealthDamageEffect(false), 300);
  };

  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);
      setTimeout(() => setShowDamageNumber(false), 800);
  };

  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) return;
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
    }, SHIELD_COOLDOWN_TIME);
  };

  // Main game loop for movement and collision
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        // No need to clear particle timer here, it's handled in its own effect or schedule function
        return;
    }

    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Obstacle and cloud movement speed

            // Obstacle movement and collision
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character dimensions and position (example, adjust as needed)
                const characterWidth_px = 60; // Approximate character visual width in pixels
                const characterHeight_px = 60; // Approximate character visual height
                const characterXPercent = 5; // Character's fixed X position percentage
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = ((100 - GROUND_LEVEL_PERCENT) / 100) * gameHeight; // Pixels from top to ground
                const characterBottomFromTop_px = groundLevelPx - characterPos; // Character's bottom edge from top of game area
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px; // Character's top edge
                
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                return prevObstacles.map(obstacle => {
                    let newPosition = obstacle.position - speed;
                    let collisionDetectedThisFrame = false;

                    const obstacleVisualWidthPx = (obstacle.width / 4) * 16; // e.g. w-16 -> 16 * 4 = 64px
                    const obstacleVisualHeightPx = (obstacle.height / 4) * 16; // e.g. h-16 -> 64px

                    const obstacleX_px = (newPosition / 100) * gameWidth; // Obstacle's left edge
                    
                    // Obstacle's vertical position (assuming bottom aligned with ground)
                    const obstacleBottomFromTop_px = groundLevelPx;
                    const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleVisualHeightPx;

                    // Collision detection logic
                    if (
                        characterRight_px > obstacleX_px &&
                        characterLeft_px < obstacleX_px + obstacleVisualWidthPx &&
                        characterBottomFromTop_px > obstacleTopFromTop_px &&
                        characterTopFromTop_px < obstacleBottomFromTop_px
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
                        // If collided, the obstacle will be marked and filtered out later
                    }
                    
                    // If obstacle is off-screen and NOT collided this frame, mark for removal or recycle
                    if (newPosition < -20 && !collisionDetectedThisFrame) {
                         // This obstacle is off-screen and wasn't hit. Mark it as collided to remove.
                         // Or, implement recycling logic here if preferred over simple removal.
                        return { ...obstacle, position: newPosition, collided: true, health: 0 }; // Mark to remove
                    }

                    if (collisionDetectedThisFrame) {
                        if (obstacle.hasKey) {
                            handleKeyCollect(1); // Collect key
                        }
                        // Mark obstacle as collided to be filtered out
                        return { ...obstacle, position: newPosition, collided: true, health: 0 }; // Mark to remove
                    }
                    return { ...obstacle, position: newPosition, collided: false }; // Keep moving
                }).filter(obstacle => obstacle.position > -20 && !obstacle.collided && obstacle.health > 0);
            });

            // Cloud movement
            setClouds(prevClouds => prevClouds.map(cloud => {
                const newX = cloud.x - cloud.speed;
                if (newX < -50) { // Cloud is off-screen
                    const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                    return { // Recycle cloud
                        ...cloud,
                        id: Date.now() + Math.random(),
                        x: 120 + Math.random() * 30, // Reset to right side
                        y: Math.random() * 40 + 10,
                        size: Math.random() * 40 + 30,
                        speed: Math.random() * 0.3 + 0.15,
                        imgSrc: randomImgSrc
                    };
                }
                return { ...cloud, x: newX };
            }));

            // Particle movement and fading
            setParticles(prevParticles => prevParticles.map(p => ({
                ...p,
                x: p.x + p.xVelocity,
                y: p.y + p.yVelocity,
                opacity: p.opacity - 0.03,
                size: Math.max(0, p.size - 0.1)
            })).filter(p => p.opacity > 0 && p.size > 0));

            // Coin movement and collection
            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;
                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const charWidthPx = 60; 
                const charHeightPx = 60;
                const charXPercent = 5;
                const charX_px = (charXPercent / 100) * gameWidth;
                const groundPx = ((100 - GROUND_LEVEL_PERCENT) / 100) * gameHeight;
                const charBottom_px = groundPx - characterPos;
                const charTop_px = charBottom_px - charHeightPx;
                const charLeft_px = charX_px;
                const charRight_px = charX_px + charWidthPx;
                const charCenterX_px = charLeft_px + charWidthPx / 2;
                const charCenterY_px = charTop_px + charHeightPx / 2;


                return prevCoins.map(coin => {
                    const coinSize_px = 40; // Visual size of coin
                    const coinX_px = (coin.x / 100) * gameWidth;
                    const coinY_px = (coin.y / 100) * gameHeight;

                    let newX = coin.x;
                    let newY = coin.y;
                    let collectedThisFrame = false;
                    let shouldBeAttracted = coin.isAttracted;

                    if (!shouldBeAttracted) { // Initial collision check to start attraction
                        if (
                            charRight_px > coinX_px &&
                            charLeft_px < coinX_px + coinSize_px &&
                            charBottom_px > coinY_px &&
                            charTop_px < coinY_px + coinSize_px
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted) {
                        const dx = charCenterX_px - coinX_px;
                        const dy = charCenterY_px - coinY_px;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const moveStep = distance * coin.attractSpeed;

                        if (distance < (charWidthPx / 2 + coinSize_px / 2) * 0.5) { // Collection threshold
                            collectedThisFrame = true;
                            const awardedCoins = Math.floor(Math.random() * 5) + 1;
                            startCoinCountAnimation(awardedCoins);
                        } else {
                            const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                            const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;
                            newX = ((coinX_px + moveX_px) / gameWidth) * 100;
                            newY = ((coinY_px + moveY_px) / gameHeight) * 100;
                        }
                    } else { // Initial movement before attraction
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY; // Assuming coins can fall slightly
                    }
                    
                    // Check if coin is off-screen
                    const isOffScreen = newX < -20 || newY > 120 || newY < -20;


                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collided: collectedThisFrame || isOffScreen };
                }).filter(coin => !coin.collided);
            });

        }, 30); // Game loop interval (approx 33 FPS)
    }

    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
    };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, characterPos]); // Dependencies for the main loop

  // Effect for scheduling obstacles and coins based on game state
  useEffect(() => {
      if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData) {
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) particleTimerRef.current = setInterval(generateParticles, 300);
      } else {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
          obstacleTimerRef.current = null;
          coinScheduleTimerRef.current = null;
          particleTimerRef.current = null;
      }
      // Cleanup function for this effect
      return () => {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]);


  // Effect for Shield Cooldown
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted) {
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
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               shieldCooldownTimerRef.current = setTimeout(() => {
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
                   countdownInterval = setInterval(() => {
                       setRemainingCooldown(prev => Math.max(0, prev - 1));
                   }, 1000);
                   cooldownCountdownTimerRef.current = countdownInterval;
               }
           } else if (shieldCooldownStartTime !== null) {
               if (cooldownCountdownTimerRef.current === null) {
                    const elapsedTime = Date.now() - shieldCooldownStartTime;
                    const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
                    const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);
                    if (initialRemainingSeconds > 0) {
                         setRemainingCooldown(initialRemainingSeconds);
                         countdownInterval = setInterval(() => {
                             setRemainingCooldown(prev => Math.max(0, prev - 1));
                         }, 1000);
                         cooldownCountdownTimerRef.current = countdownInterval;
                    } else {
                         setIsShieldOnCooldown(false);
                         setRemainingCooldown(0);
                         setShieldCooldownStartTime(null);
                         setPausedShieldCooldownRemaining(null);
                    }
               }
           } else { // shieldCooldownStartTime is null, but isShieldOnCooldown is true (should not happen)
                setIsShieldOnCooldown(false); // Correct the state
                setRemainingCooldown(0);
           }
      } else { // Not on cooldown
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
          }
          if (remainingCooldown !== 0) setRemainingCooldown(0);
      }

      return () => {
          if (countdownInterval) clearInterval(countdownInterval);
          // Main shield timer (shieldCooldownTimerRef) is cleared in other conditions or on unmount
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(obstacleTimerRef.current!);
      clearInterval(runAnimationRef.current!);
      clearInterval(particleTimerRef.current!);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      clearInterval(coinScheduleTimerRef.current!);
      clearInterval(coinCountAnimationTimerRef.current!);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    };
  }, []);

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

  const healthPct = health / MAX_HEALTH;
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const shieldHealthPct = isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;

  const renderCharacter = () => (
      <div
        className="character-container absolute w-24 h-24" // Adjusted size for consistency
        style={{
          // Character positioned relative to the visual ground line
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`, 
          left: '5%', // Fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
          // Ensure character is above obstacles if they overlap visually due to perspective
          zIndex: 10 
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

  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;

    switch(obstacle.type) {
      // Cases for different obstacle types (Lottie, simple divs, etc.)
      default: // Default rendering for Lottie obstacles or simple colored blocks
        if (obstacle.lottieSrc) {
          obstacleEl = (
            <div style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}>
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
                className="w-full h-full"
              />
            </div>
          );
        } else { // Fallback for non-Lottie if needed
          obstacleEl = <div className={`w-${obstacle.width} h-${obstacle.height} ${obstacle.color} rounded-lg`}></div>;
        }
    }

    const obstacleHealthPct = obstacle.health / obstacle.maxHealth;

    return (
      <div
        key={obstacle.id}
        className="absolute"
        style={{
          // Obstacles positioned relative to the visual ground line
          bottom: `${GROUND_LEVEL_PERCENT}%`, 
          left: `${obstacle.position}%`,
          zIndex: 5 // Ensure obstacles are generally behind character if overlap
        }}
      >
        {/* Health bar and Key Icon container */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-auto flex flex-col items-center">
            {/* Key Icon - Rendered if obstacle.hasKey is true */}
            {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Key"
                className="w-5 h-5 mb-0.5" // Slightly larger key, adjust as needed
              />
            )}
            {/* Health Bar */}
            <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm relative">
                <div
                    className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                    style={{ width: `${obstacleHealthPct * 100}%` }}
                ></div>
            </div>
        </div>
        {obstacleEl}
      </div>
    );
  };
  

  const renderClouds = () => clouds.map(cloud => (
    <img
      key={cloud.id}
      src={cloud.imgSrc}
      alt="Cloud Icon"
      className="absolute object-contain"
      style={{
        width: `${cloud.size}px`,
        height: `${cloud.size * 0.6}px`, // Maintain aspect ratio
        top: `${cloud.y}%`,
        left: `${cloud.x}%`,
        opacity: 0.8,
        zIndex: 0 // Clouds in the very back
      }}
      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x24/ffffff/000000?text=Cloud"; }}
    />
  ));

  const renderParticles = () => particles.map(particle => (
    <div
      key={particle.id}
      className={`absolute rounded-full ${particle.color}`}
      style={{
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`,
        left: `calc(5% + ${particle.x}px)`, // Relative to character area
        opacity: particle.opacity,
        zIndex: 15 // Particles in front of character
      }}
    ></div>
  ));

  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSizePx = 100; // Visual size of shield Lottie

    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none"
         style={{
          // Position shield around character
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px - ${shieldSizePx * 0.1}px)`, // Adjust vertical centering
          left: `calc(5% + 12px - ${shieldSizePx / 2}px)`, // Adjust horizontal centering (12px is half of character w-24)
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
          zIndex: 20 // Shield in front of character
        }}
      >
        {shieldHealth > 0 && ( // Shield health bar
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${shieldHealthPct * 100}%`, transition: 'width 0.2s linear' }}
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

  const renderCoins = () => activeCoins.map(coin => (
    <div
      key={coin.id}
      className="absolute w-10 h-10" // Coin visual size
      style={{
        top: `${coin.y}%`,
        left: `${coin.x}%`,
        transform: 'translate(-50%, -50%)', // Center the coin Lottie
        pointerEvents: 'none',
        zIndex: 25 // Coins in front of everything
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

  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return;
    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) hideNavBar(); else showNavBar();
        return newState;
    });
  };

  if (isLoadingUserData && !auth.currentUser) { // Show loading only if no user yet and still loading
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative font-['Inter',_sans-serif]">
      <style>{`
        /* Animations (fadeOutUp, pulse, floatUp, number-change, glass-shadow-border, etc.) */
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } }
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: #fff; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        .glass-shadow-border { box-shadow: 0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.15); }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
      `}</style>
       <style jsx global>{` body { overflow: hidden; font-family: 'Inter', sans-serif; } `}</style>

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
          className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} // Use h-full for game area
          onClick={handleTap}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 z-0"></div>
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 z-0"></div>
          
          {renderClouds()}

          {/* Ground */}
          <div className="absolute bottom-0 w-full z-1" style={{ height: `${100 - GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600">
                  {/* Ground details */}
                  <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                  <div className="w-3 h-3 bg-gray-900 rounded-full absolute top-6 left-20"></div>
              </div>
          </div>

          {renderCharacter()}
          {renderShield()}
          {obstacles.map(obstacle => renderObstacle(obstacle))}
          {renderCoins()}
          {renderParticles()}

          {/* Top UI Bar */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30 glass-shadow-border">
            <div className="flex items-center">
                <div
                  className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={toggleStatsFullscreen}
                  title="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
                        alt="Award Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/32x32/ffffff/000000?text=Stats";}}
                      />
                </div>
                {/* Health Bar */}
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
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none" style={{ animation: 'pulse 3s infinite' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    {/* Damage Number */}
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                            <div className="absolute top-0 left-1/2 text-red-500 font-bold text-xs animate-fadeOutUp">
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Currency Display */}
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 px-1 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center"> <GemIcon size={16} color="#a78bfa" className="relative z-10" /> </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide relative z-10"> {gems.toLocaleString()} </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse relative z-10">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                    </div>
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={isStatsFullscreen} />
                </div>
             )}
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-40">
              <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                onClick={startNewGame}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Action Buttons (Shop, Inventory, etc.) - Left Side */}
          {!isStatsFullscreen && !gameOver && ( // Hide when game over
            <div className="absolute left-4 bottom-1/2 transform translate-y-1/2 flex flex-col space-y-3 z-30">
              {/* Example buttons - replace with actual icons and functionality */}
              {[{label: "Shop"}, {label: "Inventory"}].map((item, index) => (
                <div key={index} className="group cursor-pointer bg-black bg-opacity-50 p-3 rounded-lg hover:bg-opacity-75 transition-all">
                  <span className="text-white text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skill Buttons & Other Actions - Right Side */}
           {!isStatsFullscreen && !gameOver && ( // Hide when game over
            <div className="absolute right-4 bottom-1/2 transform translate-y-1/2 flex flex-col space-y-3 z-30">
               {/* Shield Button */}
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-all duration-200 relative ${!gameStarted || isShieldActive || isShieldOnCooldown || isLoadingUserData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                onClick={activateShield}
                title={ /* Tooltip logic */ }
              >
                <div className="w-10 h-10"> {/* Lottie container */}
                   <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive} className="w-full h-full" />
                </div>
                {isShieldOnCooldown && remainingCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold">
                    {remainingCooldown}s
                  </div>
                )}
              </div>
              {/* Other action buttons */}
              {[{label: "Mission"}, {label: "Blacksmith"}].map((item, index) => (
                <div key={index} className="group cursor-pointer bg-black bg-opacity-50 p-3 rounded-lg hover:bg-opacity-75 transition-all">
                  <span className="text-white text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Treasure Chest Component */}
          <TreasureChest
            initialChests={3} // Or load dynamically
            keyCount={keyCount}
            onKeyCollect={(n) => {
              setKeyCount(prev => Math.max(0, prev - n));
              if (auth.currentUser) updateKeysInFirestore(auth.currentUser.uid, -n);
            }}
            onCoinReward={startCoinCountAnimation}
            onGemReward={handleGemReward}
            isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen}
            currentUserId={currentUser ? currentUser.uid : null}
          />
        </div>
      )}
    </div>
  );
}
