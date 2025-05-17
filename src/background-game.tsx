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

// --- SVG Icon Components ---
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

// --- Error Boundary Component ---
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
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Interfaces ---
interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}
interface GameObstacle {
  id: number;
  position: number;
  type: string;
  height: number;
  width: number;
  color: string;
  baseHealth: number;
  health: number;
  maxHealth: number;
  damage: number;
  lottieSrc?: string;
  hasKey?: boolean;
  collided?: boolean; // Added for filtering logic
  toRemove?: boolean; // Added for filtering logic
}
interface GameCoin {
  id: number;
  x: number;
  y: number;
  initialSpeedX: number;
  initialSpeedY: number;
  attractSpeed: number;
  isAttracted: boolean;
  collided?: boolean; // Added for filtering logic
}
interface GameCloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  imgSrc: string;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {
  // --- Global Overflow Control ---
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

  // Game states
  const MAX_HEALTH = 3000;
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH);
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0);
  const [obstacles, setObstacles] = useSessionStorage<GameObstacle[]>('gameObstacles', []);
  const [activeCoins, setActiveCoins] = useSessionStorage<GameCoin[]>('gameActiveCoins', []);
  const [isShieldActive, setIsShieldActive] = useSessionStorage<boolean>('gameIsShieldActive', false);
  const [shieldHealth, setShieldHealth] = useSessionStorage<number>('gameShieldHealth', 2000);
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useSessionStorage<boolean>('gameIsShieldOnCooldown', false);
  const [remainingCooldown, setRemainingCooldown] = useSessionStorage<number>('gameRemainingCooldown', 0);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  // const [runFrame, setRunFrame] = useState(0); // Not currently used, can be removed if not planned
  const [particles, setParticles] = useState<any[]>([]);
  const [clouds, setClouds] = useState<GameCloud[]>([]);
  // const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // Not directly used, triggerHealthDamageEffect directly modifies CSS or state for it

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

  const [gems, setGems] = useState(42); // Initial gem count
  const [keyCount, setKeyCount] = useState(0);

  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isRankOpen, setIsRankOpen] = useState(false);

  const GROUND_LEVEL_PERCENT = 45;

  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  // const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Not currently used for run animation logic
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarToggleRef = useRef<(() => void) | null>(null);

  const db = getFirestore();

  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey' | 'collided' | 'toRemove'>[] = [
    { type: 'lottie-obstacle-1', height: 16, width: 16, color: 'transparent', baseHealth: 500, damage: 100, lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie" },
    { type: 'lottie-obstacle-2', height: 20, width: 20, color: 'transparent', baseHealth: 700, damage: 150, lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie" },
  ];

  const cloudImageUrls = [
    "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
    "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
    "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];

  // --- Firestore Functions ---
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
        setCoins(0); setDisplayedCoins(0); setGems(0); setKeyCount(0);
      }
    } catch (error) { console.error("Error fetching user data:", error); }
    finally { setIsLoadingUserData(false); }
  };

  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    if (!userId) { console.error("User not authenticated for coin update."); return; }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        let finalCoins = amount;
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins: Math.max(0, amount), gems, keys: keyCount, createdAt: new Date() });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          finalCoins = Math.max(0, currentCoins + amount);
          transaction.update(userDocRef, { coins: finalCoins });
        }
        setCoins(finalCoins); // Update local state after successful transaction
      });
    } catch (error) { console.error("Firestore coin transaction failed: ", error); }
  };

  const startCoinCountAnimation = (reward: number) => {
    if (reward === 0) return;
    const oldDisplayedCoins = displayedCoins;
    const targetDisplayedCoins = coins + reward; // Target based on current coins + reward
    let step = Math.ceil(Math.abs(reward) / 30) * Math.sign(reward);
    if (step === 0 && reward !== 0) step = Math.sign(reward); // Ensure step is at least 1 or -1

    let currentAnimatedDisplay = oldDisplayedCoins;

    if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
    coinCountAnimationTimerRef.current = setInterval(() => {
      currentAnimatedDisplay += step;
      if ((step > 0 && currentAnimatedDisplay >= targetDisplayedCoins) || (step < 0 && currentAnimatedDisplay <= targetDisplayedCoins)) {
        setDisplayedCoins(targetDisplayedCoins); // Snap to target
        if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
        coinCountAnimationTimerRef.current = null;
        if (auth.currentUser) {
          updateCoinsInFirestore(auth.currentUser.uid, reward);
        }
      } else {
        setDisplayedCoins(currentAnimatedDisplay);
      }
    }, 30); // Faster animation
  };

  const updateKeysInFirestore = async (userId: string, amount: number) => {
    if (!userId) { console.error("User not authenticated for key update."); return; }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        let finalKeys = amount;
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { coins, gems, keys: Math.max(0, amount), createdAt: new Date() });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          finalKeys = Math.max(0, currentKeys + amount);
          transaction.update(userDocRef, { keys: finalKeys });
        }
        setKeyCount(finalKeys); // Update local state
      });
    } catch (error) { console.error("Firestore key transaction failed: ", error); }
  };

  const handleGemReward = (amount: number) => {
    setGems(prev => prev + amount);
    // TODO: Firestore update for gems if persistent
  };

  const handleKeyCollect = (amount: number) => {
    if (auth.currentUser) {
      updateKeysInFirestore(auth.currentUser.uid, amount);
    } else {
      setKeyCount(prev => prev + amount); // Local fallback
    }
  };

  // --- Game Lifecycle Functions ---
  const clearAllGameTimers = () => {
    if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
    if(particleTimerRef.current) clearInterval(particleTimerRef.current);
    if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
    if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
    if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
    if(gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    obstacleTimerRef.current = null;
    particleTimerRef.current = null;
    shieldCooldownTimerRef.current = null;
    cooldownCountdownTimerRef.current = null;
    coinScheduleTimerRef.current = null;
    coinCountAnimationTimerRef.current = null;
    gameLoopIntervalRef.current = null;
  };

  const resetGameStates = (isLogout = false) => {
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

    setGameStarted(isLogout ? false : true);
    setGameOver(isLogout ? true : false); // On logout, consider game over to stop loops
    setIsRunning(isLogout ? false : true);
    // setShowHealthDamageEffect(false); // Not directly used
    setDamageAmount(0);
    setShowDamageNumber(false);

    if (isLogout) {
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setIsLoadingUserData(false); // Ensure loading is false on logout

        // Clear session storage on logout
        ['gameHealth', 'gameCharacterPos', 'gameObstacles', 'gameActiveCoins', 'gameIsShieldActive', 'gameShieldHealth', 'gameIsShieldOnCooldown', 'gameRemainingCooldown', 'gameShieldCooldownStartTime', 'gamePausedShieldCooldownRemaining']
            .forEach(key => sessionStorage.removeItem(key));
    }
  };


  const startNewGame = () => {
    resetGameStates(); // Reset core game states

    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
      const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      initialObstacles.push({
        id: Date.now(), position: 105, ...firstObstacleType,
        health: firstObstacleType.baseHealth, maxHealth: firstObstacleType.baseHealth,
        hasKey: Math.random() < 0.2,
      });
      for (let i = 1; i < 3; i++) { // Fewer initial obstacles
        const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({
          id: Date.now() + i + Math.random(), position: 150 + (i * 70), ...obstacleType, // Increased spacing
          health: obstacleType.baseHealth, maxHealth: obstacleType.baseHealth,
          hasKey: Math.random() < 0.2,
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      clearAllGameTimers(); // Clear timers on auth state change
      if (user) {
        fetchUserData(user.uid);
        // Game state will be loaded by useSessionStorage or startNewGame if no session
        // Check if there's existing game state in session, otherwise start new.
        const storedHealth = sessionStorage.getItem('gameHealth');
        if (storedHealth !== null && parseInt(storedHealth) > 0) {
            setGameStarted(true); // Resume game if valid session data exists
            setIsRunning(true);
        } else {
            startNewGame(); // Start fresh if no valid session
        }
      } else {
        resetGameStates(true); // Full reset on logout
      }
    });
    return () => {
        unsubscribe();
        clearAllGameTimers(); // Cleanup on component unmount
    };
  }, []); // Firebase auth listener

  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) {
      setGameOver(true);
      setIsRunning(false);
      clearAllGameTimers();
    }
  }, [health, gameStarted, gameOver]);

  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.random() * 70 + 100, // Start further off-screen
      y: Math.random() * 30 + 5,  // Higher up
      size: Math.random() * 30 + 20, // Smaller clouds
      speed: Math.random() * 0.2 + 0.1, // Slower clouds
      imgSrc: cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)]
    }));
    setClouds(newClouds);
  };

  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen || isRankOpen) return;
    const newParticles: any[] = Array.from({ length: 1 }, (_, i) => ({ // Fewer particles
      id: Date.now() + i + Math.random(),
      x: 5 + Math.random() * 5, y: 0, size: Math.random() * 2 + 1, // Smaller particles
      xVelocity: -Math.random() * 0.5 - 0.2, yVelocity: Math.random() * 1 - 0.5,
      opacity: 1, color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
    }));
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Limit max particles
  };

  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      obstacleTimerRef.current = null;
      return;
    }
    const randomTime = Math.floor(Math.random() * 10000) + 4000; // 4-14 seconds
    if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) return;
      const newObstacles: GameObstacle[] = [];
      if (obstacleTypes.length > 0) {
        const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        newObstacles.push({
          id: Date.now() + Math.random(), position: 105, ...randomObstacleType,
          health: randomObstacleType.baseHealth, maxHealth: randomObstacleType.baseHealth,
          hasKey: Math.random() < 0.2,
        });
      }
      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle();
    }, randomTime);
  };

  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) {
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      coinScheduleTimerRef.current = null;
      return;
    }
    const randomTime = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
    if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    coinScheduleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || isRankOpen || !gameStarted) return;
      setActiveCoins(prev => [...prev, {
        id: Date.now() + Math.random(), x: 105, y: Math.random() * 50 + 10, // Higher spawn
        initialSpeedX: Math.random() * 0.4 + 0.3, initialSpeedY: Math.random() * 0.2,
        attractSpeed: Math.random() * 0.04 + 0.02, isAttracted: false
      }]);
      scheduleNextCoin();
    }, randomTime);
  };

  // --- Player Actions ---
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen && !isRankOpen) {
      setJumping(true); setCharacterPos(80);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen) setCharacterPos(0);
        else { setCharacterPos(0); setJumping(false); } // Ensure reset if game state changed
        setTimeout(() => setJumping(false), 100);
      }, 500); // Shorter jump
    }
  };

  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData || isRankOpen) return;
    if (!gameStarted && !gameOver) startNewGame();
    else if (gameOver) startNewGame();
    else jump();
  };

  const triggerHealthDamageEffect = () => { /* Placeholder for visual effect */ };
  const triggerCharacterDamageEffect = (amount: number) => {
    setDamageAmount(amount); setShowDamageNumber(true);
    setTimeout(() => setShowDamageNumber(false), 800);
  };

  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData || isRankOpen) return;
    setIsShieldActive(true); setShieldHealth(SHIELD_MAX_HEALTH); setIsShieldOnCooldown(true);
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000));
    const now = Date.now();
    setShieldCooldownStartTime(now);
    setPausedShieldCooldownRemaining(null);
    if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    shieldCooldownTimerRef.current = setTimeout(() => {
      setIsShieldOnCooldown(false); setRemainingCooldown(0);
      setShieldCooldownStartTime(null); setPausedShieldCooldownRemaining(null);
    }, SHIELD_COOLDOWN_TIME);
  };

  // --- Main Game Loop ---
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen) {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      gameLoopIntervalRef.current = null;
      if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Stop particles when game loop stops
      particleTimerRef.current = null;
      return;
    }

    if (!particleTimerRef.current) { // Restart particle timer if game loop is running
        particleTimerRef.current = setInterval(generateParticles, 300);
    }

    if (!gameLoopIntervalRef.current) {
      gameLoopIntervalRef.current = setInterval(() => {
        const speed = 0.5;
        const gameContainer = gameRef.current;
        if (!gameContainer) return;

        const gameWidth = gameContainer.offsetWidth;
        const gameHeight = gameContainer.offsetHeight;
        const charWidthPx = (24 / 4) * 16; const charHeightPx = (24 / 4) * 16;
        const charXPercent = 5; const charXPx = (charXPercent / 100) * gameWidth;
        const groundLvlPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;

        const charBottomFromTopPx = gameHeight - ((characterPos / gameHeight * 100) / 100 * gameHeight + groundLvlPx);
        const charTopFromTopPx = charBottomFromTopPx - charHeightPx;
        const charLeftPx = charXPx; const charRightPx = charXPx + charWidthPx;

        // Obstacles
        setObstacles(prev => prev.map(obs => {
          let newPos = obs.position - speed;
          let collision = false;
          const obsXPx = (newPos / 100) * gameWidth;
          const obsWidthPx = (obs.width / 4) * 16; const obsHeightPx = (obs.height / 4) * 16;
          const obsBottomFromTopPx = gameHeight - groundLvlPx;
          const obsTopFromTopPx = obsBottomFromTopPx - obsHeightPx;

          if (charRightPx > obsXPx && charLeftPx < obsXPx + obsWidthPx &&
              charBottomFromTopPx > obsTopFromTopPx && charTopFromTopPx < obsBottomFromTopPx) {
            collision = true;
            if (isShieldActive) {
              setShieldHealth(sh => {
                const newSh = Math.max(0, sh - obs.damage);
                if (newSh <= 0) setIsShieldActive(false);
                return newSh;
              });
            } else {
              setHealth(h => Math.max(0, h - obs.damage));
              triggerCharacterDamageEffect(obs.damage);
            }
            if (obs.hasKey) handleKeyCollect(1);
            return { ...obs, collided: true };
          }
          if (newPos < -20 && !collision) { // Off-screen left
            if (Math.random() < 0.7 && obstacleTypes.length > 0) { // Respawn
                const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                return { ...obs, id: Date.now() + Math.random(), ...randomType, position: 105 + Math.random() * 20, health: randomType.baseHealth, maxHealth: randomType.baseHealth, hasKey: Math.random() < 0.2, collided: false };
            }
            return { ...obs, toRemove: true }; // Mark for removal
          }
          return { ...obs, position: newPos, collided: collision };
        }).filter(obs => !obs.collided && !obs.toRemove && obs.position > -20));

        // Clouds
        setClouds(prev => prev.map(c => {
          const newX = c.x - c.speed;
          if (newX < -50) { // Off-screen left, respawn
            return { ...c, id: Date.now() + Math.random(), x: 100 + Math.random() * 30, y: Math.random() * 30 + 5, size: Math.random() * 30 + 20, speed: Math.random() * 0.2 + 0.1, imgSrc: cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)] };
          }
          return { ...c, x: newX };
        }).filter(c => c.x > -50));

        // Particles
        setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.xVelocity, y: p.y + p.yVelocity, opacity: p.opacity - 0.03, size: Math.max(0, p.size - 0.1) })).filter(p => p.opacity > 0 && p.size > 0).slice(-50));

        // Coins
        const charCenterX = charLeftPx + charWidthPx / 2;
        const charCenterY = charTopFromTopPx + charHeightPx / 2;
        setActiveCoins(prev => prev.map(cn => {
          const coinSizePx = 30; // Smaller coin target
          const cnXPx = (cn.x / 100) * gameWidth; const cnYPx = (cn.y / 100) * gameHeight;
          let newX = cn.x; let newY = cn.y; let collision = false; let attracted = cn.isAttracted;

          if (!attracted && charRightPx > cnXPx && charLeftPx < cnXPx + coinSizePx && charBottomFromTopPx > cnYPx && charTopFromTopPx < cnYPx + coinSizePx) {
            attracted = true;
          }
          if (attracted) {
            const dx = charCenterX - cnXPx; const dy = charCenterY - cnYPx;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const moveStep = dist * cn.attractSpeed;
            newX = ((cnXPx + (dist === 0 ? 0 : (dx / dist) * moveStep)) / gameWidth) * 100;
            newY = ((cnYPx + (dist === 0 ? 0 : (dy / dist) * moveStep)) / gameHeight) * 100;
            if (dist < charWidthPx / 3) { // Closer collection
              collision = true; startCoinCountAnimation(Math.floor(Math.random() * 3) + 1); // Fewer coins
            }
          } else {
            newX = cn.x - cn.initialSpeedX; newY = cn.y + cn.initialSpeedY;
          }
          return { ...cn, x: newX, y: newY, isAttracted: attracted, collided: collision };
        }).filter(cn => !cn.collided && cn.x > -20 && cn.y < 120 && cn.y > -20));

      }, 30); // Approx 33 FPS
    }
    return () => {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      gameLoopIntervalRef.current = null;
      if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Ensure particle timer is also cleared
      particleTimerRef.current = null;
    };
  }, [gameStarted, gameOver, characterPos, isShieldActive, isStatsFullscreen, isRankOpen, isLoadingUserData, coins, displayedCoins]); // Dependencies

  // --- UI Effects (Timers for scheduling obstacles, coins, shield cooldown) ---
  useEffect(() => {
    const shouldPauseTimers = gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || !gameStarted;
    if (shouldPauseTimers) {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); obstacleTimerRef.current = null;
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current); coinScheduleTimerRef.current = null;
      // Particle timer is handled by game loop effect
    } else {
      if (!obstacleTimerRef.current) scheduleNextObstacle();
      if (!coinScheduleTimerRef.current) scheduleNextCoin();
    }
    // Shield cooldown timer management
    let countdownInterval: NodeJS.Timeout | null = null;
    if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted || isRankOpen) {
        if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) {
            const elapsedTime = Date.now() - shieldCooldownStartTime;
            const remainingMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
            setPausedShieldCooldownRemaining(remainingMs);
            clearTimeout(shieldCooldownTimerRef.current); shieldCooldownTimerRef.current = null;
        }
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); cooldownCountdownTimerRef.current = null;
    } else if (isShieldOnCooldown) {
        if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
            const resumeTime = pausedShieldCooldownRemaining;
            shieldCooldownTimerRef.current = setTimeout(() => {
                setIsShieldOnCooldown(false); setRemainingCooldown(0); setShieldCooldownStartTime(null); setPausedShieldCooldownRemaining(null);
            }, resumeTime);
            setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - resumeTime));
            setPausedShieldCooldownRemaining(null);
            const initialSeconds = Math.ceil(resumeTime / 1000);
            setRemainingCooldown(initialSeconds);
            if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
            cooldownCountdownTimerRef.current = setInterval(() => setRemainingCooldown(prev => Math.max(0, prev - 1)), 1000);
        } else if (shieldCooldownStartTime !== null && cooldownCountdownTimerRef.current === null) {
            const elapsed = Date.now() - shieldCooldownStartTime;
            const remainingMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsed);
            const initialSeconds = Math.ceil(remainingMs / 1000);
            if (initialSeconds > 0) {
                setRemainingCooldown(initialSeconds);
                cooldownCountdownTimerRef.current = setInterval(() => setRemainingCooldown(prev => Math.max(0, prev - 1)), 1000);
            } else if (remainingMs <= 0) {
                setIsShieldOnCooldown(false); setRemainingCooldown(0); setShieldCooldownStartTime(null);
            }
        }
    } else { // Shield not on cooldown
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current); cooldownCountdownTimerRef.current = null;
        if (remainingCooldown !== 0) setRemainingCooldown(0);
    }
    return () => { // Cleanup for this effect
        if(countdownInterval) clearInterval(countdownInterval); // Though not directly set here, good practice
        if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        // obstacleTimerRef and coinScheduleTimerRef are managed by their own scheduling logic or the top part of this effect
    };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, isRankOpen, isShieldOnCooldown, shieldCooldownStartTime, pausedShieldCooldownRemaining]);


  useEffect(() => { // Coin counter visual feedback
    if (displayedCoins === coins && coins !== 0) return;
    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const handler = () => coinElement.classList.remove('number-changing');
      coinElement.addEventListener('animationend', handler, { once: true });
      return () => coinElement.removeEventListener('animationend', handler);
    }
    return () => {};
  }, [displayedCoins]);

  // --- Render Helpers ---
  const healthPct = health > 0 ? health / MAX_HEALTH : 0;
  const shieldHealthPct = isShieldActive && shieldHealth > 0 ? shieldHealth / SHIELD_MAX_HEALTH : 0;
  const getHealthColor = () => healthPct > 0.6 ? 'bg-green-500' : healthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500';

  const renderCharacter = () => (
    <div className="character-container absolute w-24 h-24 pointer-events-none" style={{ bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`, left: '5%', transition: jumping ? 'bottom 0.5s cubic-bezier(0.2,0.8,0.4,1)' : 'bottom 0.3s ease-out' }}>
      <DotLottieReact src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie" loop autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver} className="w-full h-full" />
    </div>
  );

  const renderObstacle = (obstacle: GameObstacle) => {
    const obsW = (obstacle.width / 4) * 16; const obsH = (obstacle.height / 4) * 16;
    const obsHealthPct = obstacle.health > 0 ? obstacle.health / obstacle.maxHealth : 0;
    return (
      <div key={obstacle.id} className="absolute pointer-events-none" style={{ bottom: `${GROUND_LEVEL_PERCENT}%`, left: `${Math.min(100, Math.max(-20, obstacle.position))}%` }}>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-10 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm"> {/* Smaller health bar */}
          <div className={`h-full ${obsHealthPct > 0.6 ? 'bg-green-500' : obsHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${obsHealthPct * 100}%`, transition: 'width 0.2s linear' }}></div>
        </div>
        {obstacle.hasKey && <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png" alt="Key" className="absolute w-3 h-3" style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }} />} {/* Smaller key */}
        <div style={{ width: `${obsW}px`, height: `${obsH}px` }}>
          {obstacle.lottieSrc && <DotLottieReact src={obstacle.lottieSrc} loop autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver} className="w-full h-full" />}
        </div>
      </div>
    );
  };
  
  const renderClouds = () => clouds.map(cloud => <img key={cloud.id} src={cloud.imgSrc} alt="Cloud" className="absolute object-contain pointer-events-none" style={{ width: `${cloud.size}px`, height: `${cloud.size * 0.6}px`, top: `${cloud.y}%`, left: `${Math.min(120, Math.max(-50, cloud.x))}%`, opacity: 0.7 }} onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src="https://placehold.co/30x18/ffffff/000000?text=C"; }} />);
  const renderParticles = () => particles.map(p => <div key={p.id} className={`absolute rounded-full ${p.color} pointer-events-none`} style={{ width: `${p.size}px`, height: `${p.size}px`, bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${p.y}px)`, left: `calc(5% + ${p.x}px)`, opacity: p.opacity }} />);
  
  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSize = 70; // Smaller shield
    return (
      <div className="absolute flex flex-col items-center justify-center pointer-events-none z-20" style={{ bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + ${12*4/2}px - ${shieldSize/2}px)`, left: `calc(5% + ${12*4/2}px - ${shieldSize/2}px)`, width: `${shieldSize}px`, height: `${shieldSize}px` }}>
        {shieldHealth > 0 && (
          <div className="absolute -top-3 w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm"> {/* Smaller shield bar */}
            <div className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${shieldHealthPct * 100}%`, transition: 'width 0.2s linear' }}></div>
          </div>
        )}
        <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && gameStarted && !gameOver} className="w-full h-full" />
      </div>
    );
  };

  const renderCoins = () => activeCoins.map(cn => <div key={cn.id} className="absolute w-8 h-8 pointer-events-none" style={{ top: `${Math.min(120, Math.max(-20, cn.y))}%`, left: `${Math.min(120, Math.max(-20, cn.x))}%`, transform: 'translate(-50%, -50%)' }}><DotLottieReact src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie" loop autoplay className="w-full h-full" /></div>);

  // --- UI Toggles ---
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return;
    setIsStatsFullscreen(prev => {
      const newState = !prev;
      if (newState) { hideNavBar(); setIsRankOpen(false); } else { showNavBar(); }
      return newState;
    });
  };
  const toggleRank = () => {
    if (gameOver || isLoadingUserData) return;
    setIsRankOpen(prev => {
      const newState = !prev;
      if (newState) { hideNavBar(); setIsStatsFullscreen(false); } else { showNavBar(); }
      return newState;
    });
  };
  const showHome = () => { setIsStatsFullscreen(false); setIsRankOpen(false); showNavBar(); };
  const handleSetToggleSidebar = (toggleFn: () => void) => { sidebarToggleRef.current = toggleFn; };

  // --- Main Render ---
  if (isLoadingUserData && !auth.currentUser) {
    return <div className="flex items-center justify-center w-screen h-screen bg-gray-900 text-white">Đang tải...</div>;
  }

  let mainContent;
  if (isStatsFullscreen) {
    mainContent = <ErrorBoundary>{auth.currentUser && <CharacterCard onClose={toggleStatsFullscreen} coins={coins} onUpdateCoins={(amount) => auth.currentUser && updateCoinsInFirestore(auth.currentUser.uid, amount)} />}</ErrorBoundary>;
  } else if (isRankOpen) {
    mainContent = <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary>;
  } else {
    mainContent = (
      // **MODIFIED HERE**: Changed h-screen to h-full
      <div ref={gameRef} className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} onClick={handleTap}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-700 pointer-events-none"></div> {/* Sky */}
        <div className="absolute w-12 h-12 rounded-full bg-yellow-300 -top-3 right-12 pointer-events-none opacity-80"></div> {/* Sun */}
        {renderClouds()}
        <div className="absolute bottom-0 w-full pointer-events-none" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}> {/* Ground */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-700 to-green-500"></div>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2338a169\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}}></div> {/* Grass texture */}
        </div>

        {renderCharacter()}
        {renderShield()}
        {obstacles.map(renderObstacle)}
        {renderCoins()}
        {renderParticles()}

        {/* Header UI */}
        <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 px-2 md:px-3 overflow-hidden rounded-b-lg shadow-xl bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
            <HeaderBackground />
            <button onClick={(e) => { e.stopPropagation(); sidebarToggleRef.current?.(); }} className="p-1.5 rounded-full hover:bg-slate-700/70 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label="Mở menu">
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png" alt="Menu" className="w-5 h-5 object-contain" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {(e.target as HTMLImageElement).src="https://placehold.co/20x20/fff/000?text=M"}}/>
            </button>
            <div className="flex items-center relative z-10"> {/* Health Bar */}
                <div className="w-28 md:w-32 relative">
                    <div className="h-3.5 bg-slate-700 rounded-md overflow-hidden border border-slate-600 shadow-inner">
                        <div className={`${getHealthColor()} h-full transform origin-left transition-transform duration-300 ease-out`} style={{ transform: `scaleX(${healthPct})` }}>
                            <div className="w-full h-1/2 bg-white/20"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-[10px] md:text-xs font-bold drop-shadow-sm tracking-tight">{Math.round(health)}/{MAX_HEALTH}</span>
                        </div>
                    </div>
                    {showDamageNumber && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-red-400 font-bold text-xs md:text-sm" style={{ animation: 'floatUp 0.8s ease-out forwards' }}>-{damageAmount}</div>}
                </div>
            </div>
            {(!isStatsFullscreen && !isRankOpen) && ( /* Currency */
                <div className="flex items-center space-x-1 md:space-x-2 currency-display-container relative z-10">
                    <div className="bg-purple-600/80 rounded-md p-1 flex items-center shadow-md border border-purple-500/70 group hover:scale-105 transition-transform duration-200 cursor-pointer" title={`Gems: ${gems}`}>
                        <GemIcon size={14} color="#e9d5ff" className="relative z-10 mr-1" />
                        <div className="font-semibold text-purple-100 text-[10px] md:text-xs tracking-tight">{gems.toLocaleString()}</div>
                        <div className="ml-1 w-2.5 h-2.5 bg-purple-400/70 rounded-full flex items-center justify-center shadow-inner group-hover:bg-purple-300/70 transition-colors"><span className="text-white font-bold text-[8px]">+</span></div>
                    </div>
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={isStatsFullscreen} />
                </div>
            )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-40 p-4">
            <h2 className="text-3xl font-bold mb-3 text-red-500 drop-shadow-lg">Game Over!</h2>
            <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold transform transition hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75" onClick={(e) => { e.stopPropagation(); startNewGame(); }}>Chơi Lại</button>
          </div>
        )}

        {/* Action Buttons (Left & Right) - only show if game is active */}
        {(!isStatsFullscreen && !isRankOpen && gameStarted && !gameOver) && (
            <> {/* Using Fragment to group left and right buttons */}
            <div className="absolute left-2 md:left-3 bottom-28 md:bottom-32 flex flex-col space-y-3 z-30">
                {[{ label: "Shop", icon: "🛍️" }, { label: "Inventory", icon: "🎒" }].map(item => (
                    <button key={item.label} onClick={e => e.stopPropagation()} className="group w-12 h-12 md:w-14 md:h-14 bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-slate-600/80 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200 flex flex-col items-center justify-center" title={item.label}>
                        <span className="text-xl md:text-2xl">{item.icon}</span>
                        <span className="text-white text-[9px] md:text-[10px] mt-0.5">{item.label}</span>
                    </button>
                ))}
            </div>
            <div className="absolute right-2 md:right-3 bottom-28 md:bottom-32 flex flex-col space-y-3 z-30">
                <button onClick={e => { e.stopPropagation(); activateShield(); }} disabled={isShieldActive || isShieldOnCooldown} className={`group w-12 h-12 md:w-14 md:h-14 bg-sky-600/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-sky-500/90 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-200 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`} title={isShieldActive ? `Khiên: ${shieldHealth}` : isShieldOnCooldown ? `Hồi: ${remainingCooldown}s` : "Khiên"}>
                    <div className="w-7 h-7 md:w-8 md:h-8 relative">
                        <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive} className="w-full h-full filter drop-shadow-lg" />
                        {isShieldOnCooldown && remainingCooldown > 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md text-white text-xs md:text-sm font-bold">{remainingCooldown}s</div>}
                    </div>
                </button>
                {[{ label: "Mission", icon: "🎯" }, { label: "Forge", icon: "⚔️" }].map(item => (
                     <button key={item.label} onClick={e => e.stopPropagation()} className="group w-12 h-12 md:w-14 md:h-14 bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-slate-600/80 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200 flex flex-col items-center justify-center" title={item.label}>
                        <span className="text-xl md:text-2xl">{item.icon}</span>
                        <span className="text-white text-[9px] md:text-[10px] mt-0.5">{item.label}</span>
                    </button>
                ))}
            </div>
            </>
        )}
        <TreasureChest initialChests={3} keyCount={keyCount} onKeyCollect={n => auth.currentUser && updateKeysInFirestore(auth.currentUser.uid, -n)} onCoinReward={startCoinCountAnimation} onGemReward={handleGemReward} isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen} isStatsFullscreen={isStatsFullscreen} currentUserId={currentUser?.uid || null} />
      </div>
    );
  }

  return (
    // Outermost container that strictly controls viewport size and overflow
    <div className="w-screen h-screen overflow-hidden bg-gray-950"> {/* Fallback background for the entire page */}
      <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowStats={toggleStatsFullscreen} onShowRank={toggleRank} onShowHome={showHome}>
        {mainContent}
      </SidebarLayout>
    </div>
  );
}
