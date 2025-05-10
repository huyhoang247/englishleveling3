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
  const [shieldCooldownStartTime, setShieldCooldownStartTime] = useSessionStorage<number | null>('gameShieldCooldownStartTime', null);
  const [pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining] = useSessionStorage<number | null>('gamePausedShieldCooldownRemaining', null);
  
  // CORRECTED: Use useSessionStorage correctly for nextKeyIn
  const [nextKeyIn, setNextKeyIn] = useSessionStorage<number>('gameNextKeyIn', randomBetween(5, 10));


  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runFrame, setRunFrame] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, xVelocity: number, yVelocity: number, opacity: number, color: string, size: number }>>([]); // Specify particle type
  const [clouds, setClouds] = useState<GameCloud[]>([]);
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false);

  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  const SHIELD_MAX_HEALTH = 2000;
  const SHIELD_COOLDOWN_TIME = 200000; // 200 seconds
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gems, setGems] = useState(42);
  const [keyCount, setKeyCount] = useState(0);


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

  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins: Math.max(0, amount), gems, keys: keyCount, createdAt: new Date() });
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
      const oldCoins = displayedCoins; // Animate from displayed coins
      const targetCoinsAfterReward = coins + reward; // Target based on actual coins + reward
      let step = Math.ceil(Math.abs(reward) / 30) * Math.sign(reward); // Handle negative rewards too
      if (step === 0 && reward !== 0) step = Math.sign(reward); // Ensure step is at least 1 or -1 if reward is not 0

      let currentAnimatedCoins = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      // Update Firestore immediately
      if (auth.currentUser) {
        updateCoinsInFirestore(auth.currentUser.uid, reward);
        // Note: setCoins will be called inside updateCoinsInFirestore upon success
      } else {
         console.log("User not authenticated, skipping Firestore update for coins.");
         // If no user, update local coins state directly for animation
         setCoins(prevCoins => Math.max(0, prevCoins + reward));
      }


      const countInterval = setInterval(() => {
          currentAnimatedCoins += step;
          // Ensure animation stops correctly based on reward direction
          if ((reward > 0 && currentAnimatedCoins >= targetCoinsAfterReward) || (reward < 0 && currentAnimatedCoins <= targetCoinsAfterReward) || reward === 0) {
              setDisplayedCoins(targetCoinsAfterReward);
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null;
          } else {
              setDisplayedCoins(currentAnimatedCoins);
          }
      }, 30); // Reduced interval for smoother/faster animation
      coinCountAnimationTimerRef.current = countInterval;
  };


  const updateKeysInFirestore = async (userId: string, amount: number) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins, gems, keys: Math.max(0, amount), createdAt: new Date() });
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
    // setActiveCoins([]); // Keep active coins from previous session if any? Or reset? For now, reset.
    setActiveCoins([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    setShieldCooldownStartTime(null);
    setPausedShieldCooldownRemaining(null);

    // CORRECTED: Initialize a temporary counter for key logic for this game session
    let currentNextKeyCounter = randomBetween(5, 10);

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

        currentNextKeyCounter--; // Decrement for the first obstacle
        let hasKeyFirst = false;
        if (currentNextKeyCounter <= 0) {
            currentNextKeyCounter = randomBetween(5, 10); // Reset
            hasKeyFirst = true;
        }
        initialObstacles.push({
          id: Date.now(),
          position: 120,
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: hasKeyFirst,
        });

        for (let i = 1; i < 5; i++) { // Generates 4 more obstacles
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const spacing = i * (Math.random() * 10 + 10);

          currentNextKeyCounter--; // Decrement for each subsequent obstacle
          let hasKeyLoop = false;
          if (currentNextKeyCounter <= 0) {
              currentNextKeyCounter = randomBetween(5, 10); // Reset
              hasKeyLoop = true;
          }
          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50), // Ensure obstacles are spaced out
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKeyLoop,
          });
        }
    }
    setNextKeyIn(currentNextKeyCounter); // Set the final counter value to state/sessionStorage
    setObstacles(initialObstacles); // Set obstacles after key logic
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
        // Game state is loaded by useSessionStorage hooks automatically
        // Only set gameStarted if not already started from session
        if (!sessionStorage.getItem('gameHealth')) { // Simple check if a new session essentially
            setGameStarted(true); // Start game if user logs in and no prior game state in session
        } else if (health > 0) { // If there is health in session, game was ongoing
             setGameStarted(true);
        }
        setIsRunning(true);

      } else {
        setGameStarted(false);
        setGameOver(false); // Reset game over state on logout
        // Clear session storage states by setting them to initial values
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
        setNextKeyIn(randomBetween(5, 10)); // Reset key counter

        // Reset non-session states
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


        // Clear all session storage related to the game on logout (optional, as setters above handle it)
        // This is more of a safeguard or explicit cleanup
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('game')) {
                sessionStorage.removeItem(key);
            }
        });


        // Clear timers
        if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        if (runAnimationRef.current) clearInterval(runAnimationRef.current);
        if (particleTimerRef.current) clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
        if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
        if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
        gameLoopIntervalRef.current = null;

      }
    });
    return () => unsubscribe();
  }, [auth, db]); // Added db to dependencies as fetchUserData uses it.

  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) { // Ensure gameOver isn't already true
      setGameOver(true);
      setIsRunning(false);
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if (runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      gameLoopIntervalRef.current = null;
    }
  }, [health, gameStarted, gameOver]); // Added gameOver to dependencies

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

  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;
    const newParticles = [];
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + Math.random(), // More unique ID
        x: 5 + Math.random() * 5, // Character's general area
        y: Math.random() * 5, // Slightly above ground
        xVelocity: -Math.random() * 1 - 0.5, // Move left
        yVelocity: Math.random() * 0.5 - 0.25, // Slight vertical movement
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700',
        size: Math.random() * 3 + 2 // Particle size
      });
    }
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Limit particles
  };


  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted check
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 10000) + 3000; // Adjusted time
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear previous before setting new
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Re-check condition inside timeout

      const obstacleCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 obstacles
      const newObstaclesToAdd: GameObstacle[] = [];
      
      // CORRECTED: Use a temporary variable for key counter logic within this batch
      let currentNextKeyCounter = nextKeyIn;

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 20 + 30); // Increased spacing

            currentNextKeyCounter--;
            let hasKey = false;
            if (currentNextKeyCounter <= 0) {
              currentNextKeyCounter = randomBetween(5, 10);
              hasKey = true;
            }

            newObstaclesToAdd.push({
              id: Date.now() + i + Math.random(), // More unique ID
              position: 100 + spacing, // Start further off-screen
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
            });
          }
      }
      setNextKeyIn(currentNextKeyCounter); // Update state once after generating all obstacles in this batch
      setObstacles(prev => [...prev, ...newObstaclesToAdd]);
      scheduleNextObstacle(); // Schedule the next one
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
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    coinScheduleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Re-check

      const newCoin: GameCoin = {
        id: Date.now() + Math.random(),
        x: 110, // Start off-screen
        y: Math.random() * 50 + 10, // Random vertical position (avoiding very top/bottom)
        initialSpeedX: Math.random() * 0.3 + 0.3, // Slightly slower initial speed
        initialSpeedY: Math.random() * 0.1 - 0.05, // Slight vertical drift
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
        // Check game state again before resetting jump, in case game ended mid-jump
        if (gameStarted && !gameOver) {
            setCharacterPos(0); // Return to ground
        }
        setJumping(false); // Allow jumping again
      }, 500); // Jump duration
    }
  };

  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData) return;

    if (!gameStarted) {
      startNewGame();
    } else if (gameOver) {
      startNewGame();
    } else {
      jump(); // Allow tap to jump if game is running
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
        // Shield itself might still be active if its health > 0, this is just cooldown end
    }, SHIELD_COOLDOWN_TIME);
  };

  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        // Stop particle generation when game is not active
        if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    // Start particle generation if not already started
    if (!particleTimerRef.current && gameStarted && !gameOver && !isStatsFullscreen) {
        particleTimerRef.current = setInterval(generateParticles, 300);
    }


    if (!gameLoopIntervalRef.current) { // Only set interval if not already running
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Base speed for obstacles

            // Temporary variable for key counter updates within this game tick
            let tempNextKeyInForTick = nextKeyIn;
            let keyCounterChangedInTick = false;

            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character dimensions and position (example values, adjust as needed)
                const characterWidthPercent = 5; // Character width as percentage of game width
                const characterHeightPixels = 60; // Character height in pixels
                const characterXPercent = 5; // Character's fixed X position from left

                const characterX_px = (characterXPercent / 100) * gameWidth;
                const characterWidth_px = (characterWidthPercent / 100) * gameWidth;


                const groundPx = gameHeight * (1 - GROUND_LEVEL_PERCENT / 100);
                // characterPos is upward displacement from ground. So bottom is ground - characterPos. Top is ground - characterPos - height.
                // Let's use top-left coordinates for character bounding box
                // Y coordinates are from the top of the game area.
                // Character bottom Y = groundPx - characterPos
                // Character top Y = groundPx - characterPos - characterHeightPixels
                const characterTop_px = groundPx - characterPos - characterHeightPixels;
                const characterBottom_px = groundPx - characterPos;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;


                const updatedObstacles = prevObstacles.map(obstacle => {
                    let newPosition = obstacle.position - speed;
                    let collisionDetectedThisFrame = false; // Renamed to avoid conflict

                    const obstacleX_px = (newPosition / 100) * gameWidth;
                    // Obstacle dimensions (example, adjust based on your h-X, w-X Tailwind units)
                    const obstacleWidth_px = (obstacle.width / 4) * 16; // Assuming 1 unit = 4px, so w-16 is 64px
                    const obstacleHeight_px = (obstacle.height / 4) * 16;

                    // Obstacle Y coordinates (bottom is at ground level)
                    // Obstacle bottom Y = groundPx
                    // Obstacle top Y = groundPx - obstacleHeight_px
                    const obstacleTop_px = groundPx - obstacleHeight_px;
                    const obstacleBottom_px = groundPx;


                    // Collision detection logic
                    if (
                        characterRight_px > obstacleX_px &&
                        characterLeft_px < obstacleX_px + obstacleWidth_px &&
                        characterBottom_px > obstacleTop_px &&
                        characterTop_px < obstacleBottom_px
                    ) {
                        collisionDetectedThisFrame = true;
                        if (isShieldActive) {
                            setShieldHealth(prev => {
                                const damageToShield = obstacle.damage;
                                const newShieldHealth = Math.max(0, prev - damageToShield);
                                if (newShieldHealth <= 0) setIsShieldActive(false);
                                return newShieldHealth;
                            });
                        } else {
                            const damageTaken = obstacle.damage;
                            setHealth(prev => Math.max(0, prev - damageTaken));
                            triggerHealthDamageEffect();
                            triggerCharacterDamageEffect(damageTaken);
                        }

                        if (obstacle.hasKey) {
                            handleKeyCollect(1); // Collect key on collision
                             // Make obstacle non-collidable and remove key after collection
                            return { ...obstacle, position: newPosition, health: 0, hasKey: false, collided: true };
                        }
                         // Mark as collided to be filtered out if health drops to 0 or for other logic
                        return { ...obstacle, position: newPosition, health: obstacle.health - (isShieldActive ? 0 : obstacle.damage), collided: true }; // Example: reduce health on collision
                    }

                    // Recycle obstacle
                    if (newPosition < -20) { // Obstacle is off-screen
                        if (Math.random() < 0.7 && obstacleTypes.length > 0) { // 70% chance to recycle
                            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                            
                            tempNextKeyInForTick--;
                            let hasKeyOnRecycle = false;
                            if (tempNextKeyInForTick <= 0) {
                                tempNextKeyInForTick = randomBetween(5, 10);
                                hasKeyOnRecycle = true;
                            }
                            keyCounterChangedInTick = true;

                            return {
                                ...obstacle, // Keep ID for keying if necessary, or generate new
                                id: Date.now() + Math.random(), // Generate new ID to avoid key issues
                                position: 100 + Math.random() * 20, // Reset position to off-screen right
                                ...randomObstacleType, // Apply new type properties
                                health: randomObstacleType.baseHealth, // Reset health
                                maxHealth: randomObstacleType.baseHealth,
                                hasKey: hasKeyOnRecycle,
                                collided: false, // Reset collided state
                            };
                        } else {
                            // Don't recycle, mark for removal
                            return { ...obstacle, position: newPosition, health: 0 }; // Mark health as 0 to be filtered
                        }
                    }
                    return { ...obstacle, position: newPosition, collided: collisionDetectedThisFrame };
                })
                .filter(obstacle => obstacle.position > -20 && obstacle.health > 0 && !obstacle.collided); // Filter out off-screen, defeated, or just-collided obstacles

                // After processing all obstacles, if tempNextKeyInForTick has changed, update the state.
                if (keyCounterChangedInTick) {
                    setNextKeyIn(tempNextKeyInForTick);
                }
                return updatedObstacles;
            });


            setClouds(prevClouds =>
                prevClouds.map(cloud => {
                    const newX = cloud.x - cloud.speed;
                    if (newX < -cloud.size / ((gameRef.current?.offsetWidth || 100) / 100) - 20) { // Cloud is off-screen left
                        const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                        return {
                            ...cloud,
                            id: Date.now() + Math.random(),
                            x: 100 + Math.random() * 30, // Reset to off-screen right
                            y: Math.random() * 40 + 10,
                            size: Math.random() * 40 + 30,
                            speed: Math.random() * 0.3 + 0.15,
                            imgSrc: randomImgSrc
                        };
                    }
                    return { ...cloud, x: newX };
                }).filter(cloud => cloud.x > -50) // Keep clouds that are still somewhat visible or approaching
            );

            setParticles(prevParticles =>
                prevParticles.map(p => ({
                    ...p,
                    x: p.x + p.xVelocity,
                    y: p.y + p.yVelocity,
                    opacity: p.opacity - 0.02, // Slower fade
                    size: Math.max(0, p.size - 0.05) // Gradual shrink
                })).filter(p => p.opacity > 0 && p.size > 0)
            );

            setActiveCoins(prevCoinsList => { // Renamed to avoid conflict
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoinsList;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                const characterWidth_px = (5 / 100) * gameWidth; // Example: 5% of game width
                const characterHeight_px = 60; // Example: 60px
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;
                
                const groundPx = gameHeight * (1 - GROUND_LEVEL_PERCENT / 100);
                const characterTop_px = groundPx - characterPos - characterHeight_px;
                const characterLeft_px = characterX_px;

                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTop_px + characterHeight_px / 2;


                return prevCoinsList.map(coin => {
                    const coinSize_px = 30; // Example coin size

                    const coinX_px = (coin.x / 100) * gameWidth;
                    const coinY_px = (coin.y / 100) * gameHeight;

                    let newX = coin.x;
                    let newY = coin.y;
                    let collectedThisFrame = false; // Renamed
                    let shouldBeAttracted = coin.isAttracted;

                    // Check for initial attraction (collision with character)
                    if (!shouldBeAttracted) {
                        if (
                            characterLeft_px + characterWidth_px > coinX_px &&
                            characterLeft_px < coinX_px + coinSize_px &&
                            characterTop_px + characterHeight_px > coinY_px &&
                            characterTop_px < coinY_px + coinSize_px
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted) {
                        const dx = characterCenterX_px - coinX_px;
                        const dy = characterCenterY_px - coinY_px;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const moveStep = distance * coin.attractSpeed;

                        if (distance < (characterWidth_px / 4 + coinSize_px / 2)) { // Smaller collection radius
                            collectedThisFrame = true;
                            const awardedCoins = Math.floor(Math.random() * 3) + 1; // Smaller reward
                            startCoinCountAnimation(awardedCoins);
                        } else {
                            const moveX_percent = distance === 0 ? 0 : (dx / distance) * moveStep / gameWidth * 100;
                            const moveY_percent = distance === 0 ? 0 : (dy / distance) * moveStep / gameHeight * 100;
                            newX = coin.x + moveX_percent;
                            newY = coin.y + moveY_percent;
                        }
                    } else {
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY; // Allow vertical drift
                    }

                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collected: collectedThisFrame };
                }).filter(coin => !coin.collected && coin.x > -10 && coin.y < 110 && coin.y > -10); // Filter collected and off-screen
            });

        }, 30); // Game loop interval (approx 33 FPS)
    }

    return () => { // Cleanup on unmount or when dependencies change
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Also clear particle timer here
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, characterPos, nextKeyIn]); // Added nextKeyIn to dependencies


  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || !gameStarted) {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Ensure particles stop
          obstacleTimerRef.current = null; // Explicitly nullify
          coinScheduleTimerRef.current = null;
          particleTimerRef.current = null;
      } else { // Game is active
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) particleTimerRef.current = setInterval(generateParticles, 300);
      }
      // Cleanup function for this effect
      return () => {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]);


  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;
      if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted) {
          // Pause main shield cooldown timer
          if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) {
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              setPausedShieldCooldownRemaining(remainingTimeMs);
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
          }
          // Pause countdown display timer
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
          }
      } else if (isShieldOnCooldown) {
           // Resume main shield cooldown timer
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               shieldCooldownTimerRef.current = setTimeout(() => {
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null);
                   setPausedShieldCooldownRemaining(null);
               }, remainingTimeToResume);
               setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume));
               setPausedShieldCooldownRemaining(null); // Clear paused remaining time

               // Start/resume countdown display
                let currentRemainingSeconds = Math.ceil(remainingTimeToResume / 1000);
                setRemainingCooldown(currentRemainingSeconds); // Update immediately
                if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); // Clear existing before starting new
                countdownInterval = setInterval(() => {
                    currentRemainingSeconds--;
                    if (currentRemainingSeconds <= 0) {
                        setRemainingCooldown(0);
                        clearInterval(countdownInterval!);
                        cooldownCountdownTimerRef.current = null;
                    } else {
                        setRemainingCooldown(currentRemainingSeconds);
                    }
                }, 1000);
                cooldownCountdownTimerRef.current = countdownInterval;

           } else if (shieldCooldownStartTime !== null && cooldownCountdownTimerRef.current === null) {
                // If not paused, and countdown not running, start countdown display
                const now = Date.now();
                const elapsedTime = now - shieldCooldownStartTime;
                let currentRemainingSeconds = Math.ceil(Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime) / 1000);

                if (currentRemainingSeconds > 0) {
                    setRemainingCooldown(currentRemainingSeconds); // Update immediately
                    countdownInterval = setInterval(() => {
                        currentRemainingSeconds--;
                        if (currentRemainingSeconds <= 0) {
                            setRemainingCooldown(0);
                            clearInterval(countdownInterval!);
                            cooldownCountdownTimerRef.current = null;
                        } else {
                            setRemainingCooldown(currentRemainingSeconds);
                        }
                    }, 1000);
                    cooldownCountdownTimerRef.current = countdownInterval;
                } else { // Cooldown should have ended
                    setIsShieldOnCooldown(false);
                    setRemainingCooldown(0);
                    setShieldCooldownStartTime(null);
                }
           }
      } else { // Shield not on cooldown
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
          }
          if (remainingCooldown !== 0) setRemainingCooldown(0); // Ensure it's reset
      }

      return () => {
          if (countdownInterval) clearInterval(countdownInterval);
          // Main shieldCooldownTimerRef is managed by its own logic for pause/resume
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted]);

  useEffect(() => {
    return () => { // Cleanup all timers on component unmount
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if (runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
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
        if (coinElement) coinElement.removeEventListener('animationend', animationEndHandler);
      };
    }
    return () => {};
  }, [displayedCoins, coins]);


  const healthPct = health > 0 ? health / MAX_HEALTH : 0; // Ensure healthPct is not negative
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const shieldHealthPct = isShieldActive && shieldHealth > 0 ? shieldHealth / SHIELD_MAX_HEALTH : 0;

  const renderCharacter = () => (
    <div
      className="character-container absolute w-24 h-24 transition-all duration-100 ease-out" // Faster transition for jump
      style={{
        bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
        left: '5%', // Character's horizontal position
        // Transition for jump is handled by characterPos changes and CSS transition
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
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;
    const obstacleHealthPct = obstacle.health > 0 ? obstacle.health / obstacle.maxHealth : 0;

    return (
      <div
        key={obstacle.id}
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Obstacles are on the ground
          left: `${obstacle.position}%`,
          width: `${obstacleWidthPx}px`, // Set width for container
          height: `${obstacleHeightPx}px`, // Set height for container
        }}
      >
        {/* Health Bar and Key Icon Container */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-700 rounded-full overflow-visible border border-gray-500 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-400' : obstacleHealthPct > 0.3 ? 'bg-yellow-400' : 'bg-red-400'} rounded-full transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
            {/* Key Icon - Positioned relative to this health bar container */}
            {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Chìa khóa" // Vietnamese alt text
                className="absolute w-4 h-4 object-contain" // Added object-contain
                style={{
                    bottom: 'calc(100% + 2px)', // 2px above the health bar
                    left: '50%',
                    transform: 'translateX(-50%)', // Center horizontally
                }}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src="https://placehold.co/16x16/000000/ffffff?text=K";
                }}
              />
            )}
        </div>

        {/* Obstacle Visual */}
        {obstacle.lottieSrc ? (
            <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver}
                className="w-full h-full" // Lottie takes full size of its container
            />
        ) : (
            <div className={`w-full h-full ${obstacle.color} rounded-md`}></div> // Fallback basic div
        )}
      </div>
    );
  };


  const renderClouds = () => clouds.map(cloud => (
    <img
      key={cloud.id}
      src={cloud.imgSrc}
      alt="Đám mây" // Vietnamese alt text
      className="absolute object-contain"
      style={{
        width: `${cloud.size}px`,
        height: `${cloud.size * 0.6}px`, // Aspect ratio for clouds
        top: `${cloud.y}%`,
        left: `${cloud.x}%`,
        opacity: 0.7, // Slightly more transparent
        zIndex: 0 // Ensure clouds are behind other elements if needed
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "https://placehold.co/60x36/ffffff/000000?text=M"; // Placeholder
      }}
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
        zIndex: 1 // Above ground, below character potentially
      }}
    ></div>
  ));

  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSizePx = 80; // Shield Lottie size
    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none z-20" // Shield is above character
         style={{
          // Position shield around character - adjust offsets as needed
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 10px)`, // Centered vertically with character
          left: `calc(5% + 12px - ${shieldSizePx / 2}px + 48px )`, // Centered horizontally with character (w-24 character -> 48px center)
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
        }}
      >
        {shieldHealth > 0 && ( // Show health bar only if shield has health
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-500 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-blue-400' : shieldHealthPct > 0.3 ? 'bg-blue-300' : 'bg-blue-200'} transform origin-left transition-transform duration-200 ease-linear`}
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

  const renderCoins = () => activeCoins.map(coin => (
    <div
      key={coin.id}
      className="absolute w-8 h-8" // Slightly smaller coins
      style={{
        top: `${coin.y}%`,
        left: `${coin.x}%`,
        transform: 'translate(-50%, -50%)', // Center the coin Lottie
        pointerEvents: 'none',
        zIndex: 10 // Coins on top
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
        /* Tailwind base, components, and utilities are assumed to be loaded globally */
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 3px rgba(59, 130, 246, 0.4); } 50% { opacity: 1; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); } 70% { box-shadow: 0 0 0 4px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 5px rgba(255, 215, 0, 0.7); transform: scale(1.05); } 100% { color: inherit; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
        @keyframes pulse-opacity { 0% { opacity: 0; } 50% { opacity: 0.15; } 100% { opacity: 0; } }
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
        .glass-shadow-border { box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(255,255,255,0.1); }
      `}</style>
       <style jsx global>{`body { overflow: hidden; font-family: 'Inter', sans-serif; }`}</style>

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
          role="button" // Accessibility
          tabIndex={0} // Accessibility
          aria-label="Khu vực trò chơi" // Accessibility
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-600"></div>
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 -top-5 right-12 opacity-80"></div> {/* Sun/Moon */}

          {renderClouds()}

          {/* Ground */}
          <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-green-700 to-green-500"> {/* Grassy ground */}
                  <div className="w-full h-1 bg-green-800 absolute top-0 opacity-50"></div> {/* Darker top edge */}
                  {/* Ground details - example */}
                  <div className="w-3 h-3 bg-green-800 rounded-full absolute top-6 left-20 opacity-30"></div>
                  <div className="w-4 h-2 bg-green-800 rounded-full absolute top-10 left-40 opacity-30"></div>
              </div>
          </div>

          {renderCharacter()}
          {renderShield()}
          {obstacles.map(obstacle => renderObstacle(obstacle))}
          {renderCoins()}
          {renderParticles()}

          {/* Top UI Bar */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-50 shadow-lg z-30 glass-shadow-border">
            <div className="flex items-center space-x-2">
                <button // Changed to button for accessibility
                  onClick={toggleStatsFullscreen}
                  className="relative p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  title="Xem chỉ số nhân vật"
                  aria-label="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
                        alt="Biểu tượng chỉ số"
                        className="w-6 h-6 object-contain" // Adjusted size
                         onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/24x24/ffffff/000000?text=S";
                        }}
                      />
                </button>

                {/* Health Bar */}
                <div className="w-32 relative group">
                    <div className="h-4 bg-gray-700 rounded-md overflow-hidden border border-gray-500 shadow-inner">
                        <div className="h-full overflow-hidden">
                            <div
                                className={`${getColor()} h-full transform origin-left rounded-md`} // Added rounded-md here too
                                style={{
                                    width: `${healthPct * 100}%`, // Use width for health bar fill
                                    transition: 'width 0.3s ease-out, background-color 0.3s ease-out',
                                }}
                            >
                                <div className="w-full h-1/2 bg-white bg-opacity-25 rounded-t-md" /> {/* Subtle highlight */}
                            </div>
                        </div>
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                            style={{ animation: 'pulse-opacity 3s infinite ease-in-out' }} // Softer pulse
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-sm tracking-tight">
                                {Math.max(0, Math.round(health))}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    {/* Floating damage number */}
                    <div className="absolute top-full left-0 right-0 h-4 w-full overflow-hidden pointer-events-none mt-0.5">
                        {showDamageNumber && (
                            <div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-400 font-bold text-xs"
                                style={{ animation: 'floatUp 0.8s ease-out forwards' }}
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
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-1 flex items-center shadow-md border border-purple-400/50 group hover:scale-105 transition-transform duration-300 cursor-default">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-transform duration-1000 ease-out opacity-50 group-hover:opacity-100"></div>
                        <GemIcon size={14} color="#d8b4fe" className="relative z-10 mr-1" />
                        <div className="font-semibold text-purple-200 text-xs tracking-wide relative z-10">
                            {gems.toLocaleString()}
                        </div>
                        <button className="ml-1 w-3 h-3 bg-purple-500 hover:bg-purple-400 rounded-sm flex items-center justify-center cursor-pointer border border-purple-300/50 shadow-sm group-hover:add-button-pulse relative z-10" aria-label="Thêm đá quý">
                            <span className="text-white font-bold text-[0.6rem]">+</span>
                        </button>
                        <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse-fast opacity-70"></div>
                    </div>
                    <CoinDisplay
                      displayedCoins={displayedCoins}
                      isStatsFullscreen={isStatsFullscreen}
                    />
                </div>
             )}
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-40 p-4">
              <h2 className="text-4xl font-bold mb-3 text-red-500 drop-shadow-lg">Thua Rồi!</h2>
              <p className="text-gray-300 mb-6">Đừng bỏ cuộc, thử lại nhé!</p>
              <button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold transform transition hover:scale-105 shadow-xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                onClick={startNewGame}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Action Buttons (Left & Right Bottom) - Simplified for clarity */}
          {!isStatsFullscreen && !gameOver && (
            <>
            {/* Left Buttons */}
            <div className="absolute left-3 bottom-28 flex flex-col space-y-3 z-30">
              {[
                { label: "Cửa Hàng", iconLottie: "https://lottie.host/5a3e7c6a-1b2c-4d5e-8f6a-7b8c9d0e1f2a/SAMPLE.lottie" }, // Replace with actual Lottie
                { label: "Túi Đồ", iconLottie: "https://lottie.host/5a3e7c6a-1b2c-4d5e-8f6a-7b8c9d0e1f2a/SAMPLE.lottie" }, // Replace with actual Lottie
              ].map((item, index) => (
                <button key={index} className="bg-black/60 backdrop-blur-sm p-2 rounded-lg w-14 h-14 flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors shadow-md" title={item.label} aria-label={item.label}>
                  <div className="w-6 h-6 mb-0.5"><DotLottieReact src={item.iconLottie} loop autoplay /></div>
                  <span className="text-xs text-center block" style={{fontSize: '0.6rem'}}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Right Buttons */}
            <div className="absolute right-3 bottom-28 flex flex-col space-y-3 z-30">
               <button
                className={`w-14 h-14 bg-black/60 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center justify-center transition-all duration-200 border-2 ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? 'opacity-50 cursor-not-allowed border-gray-600' : 'hover:scale-105 cursor-pointer border-blue-500 hover:bg-blue-700/50'}`}
                onClick={activateShield}
                title={!gameStarted || gameOver || isLoadingUserData ? "Không khả dụng" : isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` : isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` : "Kích hoạt Khiên"}
                aria-label="Kích hoạt Khiên"
                disabled={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData}
              >
                <div className="w-8 h-8">
                   <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && gameStarted && !gameOver} className="w-full h-full" />
                </div>
                {isShieldOnCooldown && remainingCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg text-white text-sm font-bold pointer-events-none">
                    {remainingCooldown}s
                  </div>
                )}
                 {!isShieldOnCooldown && !isShieldActive && <span className="text-white text-[0.6rem] mt-0.5">Khiên</span>}
              </button>
              {[
                { label: "Nhiệm Vụ", iconLottie: "https://lottie.host/5a3e7c6a-1b2c-4d5e-8f6a-7b8c9d0e1f2a/SAMPLE.lottie" }, // Replace
                { label: "Rèn Đồ", iconLottie: "https://lottie.host/5a3e7c6a-1b2c-4d5e-8f6a-7b8c9d0e1f2a/SAMPLE.lottie" }, // Replace
              ].map((item, index) => (
                 <button key={index} className="bg-black/60 backdrop-blur-sm p-2 rounded-lg w-14 h-14 flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors shadow-md" title={item.label} aria-label={item.label}>
                  <div className="w-6 h-6 mb-0.5"><DotLottieReact src={item.iconLottie} loop autoplay /></div>
                  <span className="text-xs text-center block" style={{fontSize: '0.6rem'}}>{item.label}</span>
                </button>
              ))}
            </div>
            </>
          )}

          {/* Treasure Chest Component */}
          <TreasureChest
            initialChests={3} // Example
            keyCount={keyCount}
            onKeyCollect={(numKeysUsed) => {
              // Firestore update for keys is now negative
              if (auth.currentUser) updateKeysInFirestore(auth.currentUser.uid, -numKeysUsed);
              else setKeyCount(prev => Math.max(0, prev - numKeysUsed)); // Fallback for no user
            }}
            onCoinReward={startCoinCountAnimation}
            onGemReward={handleGemReward}
            isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen}
            isStatsFullscreen={isStatsFullscreen} // Already passed
            currentUserId={currentUser ? currentUser.uid : null}
          />
        </div>
      )}
    </div>
  );
}

