import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
// Ensure the path is correct relative to this file
// Assuming stats-main.tsx is in a 'stats' subfolder and exports a default component
import CharacterCard from './stats/stats-main.tsx'; // Updated import path

// Import DotLottieReact component
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// --- SVG Icon Components (Replacement for lucide-react) ---

// Star Icon SVG
const StarIcon = ({ size = 24, color = 'currentColor', fill = 'none', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill === 'currentColor' ? color : fill}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Sword Icon SVG
const SwordIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" x2="19" y1="19" y2="13" />
    <line x1="16" x2="20" y1="16" y2="20" />
    <line x1="19" x2="21" y1="21" y2="19" />
  </svg>
);

// Shield Icon SVG
const ShieldIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Crown Icon SVG
const CrownIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm18 16H4" />
    <path d="M12 4a2 2 0 0 1 2 2 2 2 0 0 1-4 0 2 2 0 0 1 2-2z" />
    <path d="M5 20a1 1 0 0 1 1-1h12a1 0 0 1 1 1v0a1 0 0 1-1 1H6a1 0 0 1-1-1v0z" />
  </svg>
);

// Gem Icon SVG
const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
    <path d="M12 22L2 9" />
    <path d="M12 22l10-13" />
    <path d="M2 9h20" />
  </svg>
);

// X Icon SVG (for closing modal)
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
    console.error("Uncaught error in CharacterCard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          <p>Có lỗi xảy ra khi hiển thị bảng chỉ số.</p>
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
}

// Define interface for Obstacle with health
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
  collided?: boolean; // Added collided flag
}

// Define interface for Coin
interface GameCoin {
  id: number;
  x: number;
  y: number;
  initialSpeedX: number;
  initialSpeedY: number;
  attractSpeed: number;
  isAttracted: boolean;
  collided?: boolean; // Added collided flag
}

// Define interface for CharacterCard Props (assuming it takes an onClose function)
interface CharacterCardProps {
    onClose: () => void;
    // Add any other props CharacterCard might need
}

// Define interface for Particle
interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    xVelocity: number;
    yVelocity: number;
    opacity: number;
    color: string;
}

// Define interface for Cloud
interface Cloud {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
}


// Main Game Component
export default function ObstacleRunnerGame({ className }: ObstacleRunnerGameProps) {
  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const MAX_HEALTH = 3000;
  const [health, setHealth] = useState(MAX_HEALTH);
  const [jumping, setJumping] = useState(false);
  const [characterPos, setCharacterPos] = useState(0);
  const [obstacles, setObstacles] = useState<GameObstacle[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  // const [runFrame, setRunFrame] = useState(0); // Removed as Lottie handles animation
  const [particles, setParticles] = useState<Particle[]>([]); // Use Particle interface
  const [clouds, setClouds] = useState<Cloud[]>([]); // Use Cloud interface
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false);

  // Health Bar display states
  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  // Shield Skill States
  const SHIELD_MAX_HEALTH = 2000;
  const SHIELD_COOLDOWN_TIME = 200000; // 200 seconds
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldHealth, setShieldHealth] = useState(SHIELD_MAX_HEALTH);
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Coin States
  const [coins, setCoins] = useState(357);
  const [displayedCoins, setDisplayedCoins] = useState(357);
  const [activeCoins, setActiveCoins] = useState<GameCoin[]>([]);
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Coin Effect States
  const [isChestCoinEffectActive, setIsChestCoinEffectActive] = useState(false);
  const chestCoinEffectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // UI States
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [showCard, setShowCard] = useState<any | null>(null); // Type 'any' for simplicity
  const [currentCard, setCurrentCard] = useState<any | null>(null); // Type 'any'
  const [gems, setGems] = useState(42);
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  const [chestsRemaining, setChestsRemaining] = useState(3);
  const [pendingCoinReward, setPendingCoinReward] = useState(0);

  // Full-screen stats visibility state
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);

  // Constants
  const GROUND_LEVEL_PERCENT = 45;

  // Refs
  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  // const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Removed as Lottie handles animation
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Obstacle types configuration
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'collided'>[] = [
    { type: 'lottie-obstacle-1', height: 16, width: 16, color: 'transparent', baseHealth: 500, damage: 100, lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie" },
    { type: 'lottie-obstacle-2', height: 20, width: 20, color: 'transparent', baseHealth: 700, damage: 150, lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie" },
  ];

  // Card data configuration
  const cards = [
    { id: 1, name: "Kiếm Sắt", rarity: "common", icon: <SwordIcon size={36} />, color: "#d4d4d8", background: "bg-gradient-to-br from-gray-200 to-gray-400" },
    { id: 2, name: "Khiên Ma Thuật", rarity: "rare", icon: <ShieldIcon size={36} />, color: "#4287f5", background: "bg-gradient-to-br from-blue-300 to-blue-500" },
    { id: 3, name: "Vương Miện", rarity: "epic", icon: <CrownIcon size={36} />, color: "#9932CC", background: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { id: 4, name: "Ngọc Rồng", rarity: "legendary", icon: <GemIcon size={36} />, color: "#FFD700", background: "bg-gradient-to-br from-yellow-300 to-amber-500" }
  ];

  // Helper function to get rarity color class
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case "common": return "text-gray-200";
      case "rare": return "text-blue-400";
      case "epic": return "text-purple-400";
      case "legendary": return "text-amber-400";
      default: return "text-white";
    }
  };

  // Coin count animation function
  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.max(1, Math.ceil(reward / 30));
      let current = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
          coinCountAnimationTimerRef.current = null;
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              setCoins(newCoins);
              clearInterval(countInterval);
              setPendingCoinReward(0);
              coinCountAnimationTimerRef.current = null;
          } else {
              setDisplayedCoins(current);
          }
      }, 50);

      coinCountAnimationTimerRef.current = countInterval;
  };


  // Function to start/restart the game
  const startGame = () => {
    console.log("Starting game...");
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setObstacles([]);
    setParticles([]);
    setClouds([]);
    setActiveCoins([]);

    // Reset Shield
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
    shieldCooldownTimerRef.current = null;
    cooldownCountdownTimerRef.current = null;

    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);

    // Reset UI
    setIsChestOpen(false);
    setShowCard(null);
    setCurrentCard(null);
    setShowShine(false);
    setChestShake(false);
    setChestsRemaining(3);
    setPendingCoinReward(0);
    setIsChestCoinEffectActive(false);
    if (chestCoinEffectTimerRef.current) clearTimeout(chestCoinEffectTimerRef.current);
    chestCoinEffectTimerRef.current = null;

    // Reset currency
    setCoins(357);
    setDisplayedCoins(357);
    setGems(42);

    // Ensure fullscreen stats is closed
    setIsStatsFullscreen(false);

    // Generate initial obstacles
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({ id: Date.now(), position: 120, ...firstObstacleType, health: firstObstacleType.baseHealth, maxHealth: firstObstacleType.baseHealth });
        for (let i = 1; i < 5; i++) {
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          initialObstacles.push({ id: Date.now() + i, position: 150 + (i * 50), ...obstacleType, health: obstacleType.baseHealth, maxHealth: obstacleType.baseHealth });
        }
    }
    setObstacles(initialObstacles);

    // Generate initial clouds
    generateInitialClouds(5);

    // Clear existing timers before starting new ones
    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    particleTimerRef.current = null;
    obstacleTimerRef.current = null;
    coinScheduleTimerRef.current = null;

    // Start timers
    particleTimerRef.current = setInterval(generateParticles, 300);
    scheduleNextObstacle();
    scheduleNextCoin();
  };

  // Auto-start game on mount
  useEffect(() => {
    startGame();
    // Cleanup timers on unmount
    return () => {
      console.log("Cleaning up game timers on unmount.");
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      // if (runAnimationRef.current) clearInterval(runAnimationRef.current); // Removed
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (chestCoinEffectTimerRef.current) clearTimeout(chestCoinEffectTimerRef.current);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Game over effect
  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) {
      console.log("Game Over triggered.");
      setGameOver(true);
      setIsRunning(false);

      // Clear all timers
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      // if (runAnimationRef.current) clearInterval(runAnimationRef.current); // Removed
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if (coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (chestCoinEffectTimerRef.current) clearTimeout(chestCoinEffectTimerRef.current);

      // Nullify refs
      obstacleTimerRef.current = null;
      // runAnimationRef.current = null; // Removed
      particleTimerRef.current = null;
      shieldCooldownTimerRef.current = null;
      cooldownCountdownTimerRef.current = null;
      coinScheduleTimerRef.current = null;
      coinCountAnimationTimerRef.current = null;
      chestCoinEffectTimerRef.current = null;
    }
  }, [health, gameStarted, gameOver]);

  // Generate initial clouds
  const generateInitialClouds = (count: number) => {
    const newClouds: Cloud[] = []; // Use Cloud interface
    for (let i = 0; i < count; i++) {
      newClouds.push({
        id: Date.now() + i + Math.random(),
        x: Math.random() * 120 + 100,
        y: Math.random() * 40 + 10,
        size: Math.random() * 20 + 30,
        speed: Math.random() * 0.2 + 0.1
      });
    }
    setClouds(newClouds);
  };

  // Generate dust particles
  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;
    const newParticles: Particle[] = []; // Use Particle interface
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: 5 + Math.random() * 5,
        y: 0,
        size: Math.random() * 4 + 2,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Limit total particles
  };

  // Schedule next obstacle group
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen) return;
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);

    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen) return;
      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = [];
      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 10 + 10);
            newObstacles.push({ id: Date.now() + i + Math.random(), position: 100 + spacing, ...randomObstacleType, health: randomObstacleType.baseHealth, maxHealth: randomObstacleType.baseHealth });
          }
          setObstacles(prev => [...prev, ...newObstacles]);
      }
      scheduleNextObstacle();
    }, randomTime);
  };

  // Schedule next coin
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen) return;
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);

    const randomTime = Math.floor(Math.random() * 4000) + 1000;
    coinScheduleTimerRef.current = setTimeout(() => {
       if (gameOver || isStatsFullscreen) return;
      const newCoin: GameCoin = {
        id: Date.now() + Math.random(),
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


  // Handle character jump
  const jump = () => {
    if (!jumping && gameStarted && !gameOver && !showCard && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen) {
          setCharacterPos(0);
          setTimeout(() => setJumping(false), 100);
        } else {
           setJumping(false); // Ensure jumping is false if game ended/paused mid-jump
        }
      }, 600);
    }
  };

  // Handle tap on game area
  const handleTap = () => {
    if (isStatsFullscreen || showCard) return;
    if (!gameStarted) startGame();
    else if (!gameOver) jump();
    else startGame();
  };


  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => setShowHealthDamageEffect(false), 300);
  };

  // Trigger floating damage number
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);
      setTimeout(() => setShowDamageNumber(false), 800);
  };

  // Activate Shield skill
  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || showCard || isStatsFullscreen) {
      console.log("Cannot activate Shield. Conditions:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, showCard, isStatsFullscreen });
      return;
    }

    console.log("Activating Shield!");
    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(true);
    setRemainingCooldown(SHIELD_COOLDOWN_TIME / 1000);

    // Clear existing timers
    if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);

    // Cooldown duration timer
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Shield cooldown finished.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        shieldCooldownTimerRef.current = null;
    }, SHIELD_COOLDOWN_TIME);

    // Cooldown display timer
    cooldownCountdownTimerRef.current = setInterval(() => {
        setRemainingCooldown(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
                cooldownCountdownTimerRef.current = null;
                return 0;
            }
            return newTime;
        });
    }, 1000);
  };


  // Main game loop effect (movement, collisions)
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    const speed = 0.5;
    const intervalTime = 30;

    const moveInterval = setInterval(() => {
      const gameContainer = gameRef.current;
      if (!gameContainer) return;

      const gameWidth = gameContainer.offsetWidth;
      const gameHeight = gameContainer.offsetHeight;

      // Character Bounding Box
      const characterWidth_px = 96; // w-24
      const characterHeight_px = 96; // h-24
      const characterXPercent = 5;
      const characterX_px = (characterXPercent / 100) * gameWidth;
      const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
      const characterBottomFromTop_px = gameHeight - (groundLevelPx + characterPos);
      const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
      const characterLeft_px = characterX_px;
      const characterRight_px = characterX_px + characterWidth_px;
      const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
      const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


      // Move Obstacles & Detect Collisions
      setObstacles(prevObstacles => {
        return prevObstacles
          .map(obstacle => {
            if (obstacle.collided) return obstacle; // Skip already collided obstacles
            let newPosition = obstacle.position - speed;

            // Obstacle Bounding Box
            const obstacleWidth_px = (obstacle.width / 4) * 16;
            const obstacleHeight_px = (obstacle.height / 4) * 16;
            const obstacleX_px = (newPosition / 100) * gameWidth;
            const obstacleBottomFromTop_px = gameHeight - groundLevelPx;
            const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;

            let collisionDetected = false;
            const collisionTolerance = 5;

            // Collision Check
            if (
              characterRight_px > obstacleX_px - collisionTolerance &&
              characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
              characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance &&
              characterTopFromTop_px < obstacleBottomFromTop_px + collisionTolerance
            ) {
              collisionDetected = true;
              // Handle Damage
              if (isShieldActive && shieldHealth > 0) {
                  setShieldHealth(prev => {
                      const newShieldHealth = Math.max(0, prev - obstacle.damage);
                      if (newShieldHealth <= 0) {
                          console.log("Shield broken by obstacle.");
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

            return { ...obstacle, position: newPosition, collided: obstacle.collided || collisionDetected };
          })
          .filter(obstacle => !obstacle.collided && obstacle.position > -20); // Filter collided or off-screen
      });

      // Move Clouds
      setClouds(prevClouds => {
        return prevClouds.map(cloud => {
            let newX = cloud.x - cloud.speed;
            if (newX < -50) { // Recycle cloud
              return { ...cloud, id: Date.now() + Math.random(), x: 120 + Math.random() * 30, y: Math.random() * 40 + 10, size: Math.random() * 20 + 30, speed: Math.random() * 0.2 + 0.1 };
            }
            return { ...cloud, x: newX };
          });
      });

      // Update Particles
      setParticles(prevParticles =>
        prevParticles
          .map(particle => ({ ...particle, x: particle.x + particle.xVelocity, y: particle.y + particle.yVelocity, opacity: particle.opacity - 0.03, size: Math.max(0, particle.size - 0.1) }))
          .filter(particle => particle.opacity > 0 && particle.size > 0) // Remove faded/shrunk particles
      );

      // Move Coins & Detect Collection
      setActiveCoins(prevCoins => {
          const coinSize_px = 40; // Approximate coin size
          return prevCoins
              .map(coin => {
                  if (coin.collided) return coin; // Skip collected coins

                  // Coin position in pixels
                  const coinX_px = (coin.x / 100) * gameWidth;
                  const coinY_px = (coin.y / 100) * gameHeight;

                  let newX = coin.x;
                  let newY = coin.y;
                  let collectionDetected = false;
                  let shouldBeAttracted = coin.isAttracted;

                  // Initial Collision Check (if not already attracted)
                  if (!shouldBeAttracted) {
                      if ( characterRight_px > coinX_px && characterLeft_px < coinX_px + coinSize_px && characterBottomFromTop_px > coinY_px && characterTopFromTop_px < coinY_px + coinSize_px ) {
                          shouldBeAttracted = true; // Start attracting
                      }
                  }

                  // Movement Logic
                  if (shouldBeAttracted) {
                      // Move towards character center
                      const dx = characterCenterX_px - coinX_px;
                      const dy = characterCenterY_px - coinY_px;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      const moveStep = distance * coin.attractSpeed; // Move faster when further away

                      if (distance > 1) { // Avoid division by zero and jittering
                        const moveX_px = (dx / distance) * moveStep;
                        const moveY_px = (dy / distance) * moveStep;
                        // Update position in pixels
                        const newCoinX_px = coinX_px + moveX_px;
                        const newCoinY_px = coinY_px + moveY_px;
                        // Convert back to percentage
                        newX = (newCoinX_px / gameWidth) * 100;
                        newY = (newCoinY_px / gameHeight) * 100;
                      }

                      // Collection Check (close proximity to character center)
                      if (distance < (characterWidth_px / 3 + coinSize_px / 3)) { // Adjusted collection radius
                           collectionDetected = true;
                           const awardedCoins = Math.floor(Math.random() * 5) + 1; // Award 1-5 coins
                           startCoinCountAnimation(awardedCoins); // Start animation
                           console.log(`Coin collected! +${awardedCoins}`);

                           // Trigger Coin Collection Effect near Chest
                           if (chestCoinEffectTimerRef.current) clearTimeout(chestCoinEffectTimerRef.current);
                           setIsChestCoinEffectActive(true);
                           chestCoinEffectTimerRef.current = setTimeout(() => {
                               setIsChestCoinEffectActive(false);
                               chestCoinEffectTimerRef.current = null;
                           }, 800); // Effect duration
                       }

                  } else {
                      // Initial movement (left and slightly down)
                      newX = coin.x - coin.initialSpeedX;
                      newY = coin.y + coin.initialSpeedY;
                  }
                  return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collided: collectionDetected }; // Mark for removal if collected
              })
              .filter(coin => !coin.collided && coin.x > -10 && coin.y < 110 && coin.y > -10); // Filter collected or off-screen
      });

    }, intervalTime);

    return () => clearInterval(moveInterval);
  }, [ gameStarted, gameOver, isStatsFullscreen, characterPos, isShieldActive, shieldHealth ]); // Dependencies for the game loop


  // Effect for coin counter animation class
  useEffect(() => {
    if (displayedCoins === coins && pendingCoinReward === 0) return;
    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        // Check if element still exists before removing class/listener
        if (document.contains(coinElement)) {
            coinElement.classList.remove('number-changing');
            coinElement.removeEventListener('animationend', animationEndHandler);
        }
      };
      coinElement.addEventListener('animationend', animationEndHandler);
      // Cleanup: remove listener if component unmounts or effect re-runs
      return () => {
         if (document.contains(coinElement)) {
            coinElement.removeEventListener('animationend', animationEndHandler);
            coinElement.classList.remove('number-changing'); // Ensure class is removed
         }
      };
    }
    return () => {}; // Return empty cleanup if element not found
  }, [displayedCoins, coins, pendingCoinReward]);


  // Calculate health percentage
  const healthPct = Math.max(0, health / MAX_HEALTH); // Ensure not negative

  // Determine health bar color
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate shield health percentage
  const shieldHealthPct = isShieldActive ? Math.max(0, shieldHealth / SHIELD_MAX_HEALTH) : 0;


  // Render the character
  const renderCharacter = () => (
      <div
        className="character-container absolute w-24 h-24" // Base container size
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%', // Fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
          zIndex: 10 // Ensure character is above ground/some background elements
        }}
      >
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          autoplay
          className="w-full h-full"
        />
      </div>
    );

  // Render a single obstacle
  const renderObstacle = (obstacle: GameObstacle) => {
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;
    const obstacleHealthPct = Math.max(0, obstacle.health / obstacle.maxHealth);
    let obstacleEl;

    // Render based on obstacle type
    switch(obstacle.type) {
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2': // Both Lottie types use the same rendering logic
        obstacleEl = (
          <div
            className="relative" // For potential absolute positioning within if needed
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      default: // Fallback rendering (removed 'rock' case as it's not generated)
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color || 'from-gray-500 to-gray-700'} rounded`}></div>
        );
    }

    return (
      <div
        key={obstacle.id} // Unique key for React
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          left: `${obstacle.position}%`, // Horizontal position
          zIndex: 5 // Ensure obstacles are above ground but below character/UI
        }}
      >
        {/* Render the obstacle visual element */}
        {obstacleEl}

        {/* --- Obstacle Health Bar --- */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }} // Width based on health %
            ></div>
        </div>
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => clouds.map(cloud => (
      <div key={cloud.id} className="absolute bg-white rounded-full opacity-60" style={{ width: `${cloud.size}px`, height: `${cloud.size * 0.6}px`, top: `${cloud.y}%`, left: `${cloud.x}%`, zIndex: 1 }}>
        {/* Cloud details */}
        <div className="absolute bg-white rounded-full" style={{ width: `${cloud.size * 0.7}px`, height: `${cloud.size * 0.7}px`, top: `-${cloud.size * 0.1}px`, left: `${cloud.size * 0.1}px` }}></div>
        <div className="absolute bg-white rounded-full" style={{ width: `${cloud.size * 0.8}px`, height: `${cloud.size * 0.8}px`, top: `-${cloud.size * 0.15}px`, left: `${cloud.size * 0.3}px` }}></div>
      </div>
    ));

  // Render dust particles
  const renderParticles = () => particles.map(particle => (
      <div key={particle.id} className={`absolute rounded-full ${particle.color}`} style={{ width: `${particle.size}px`, height: `${particle.size}px`, bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, left: `calc(5% + ${particle.x}px)`, opacity: particle.opacity, zIndex: 11 }}></div>
    ));

  // Render Shield visual
  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSizePx = 80;
    return (
      <div key="character-shield" className="absolute w-20 h-20 flex flex-col items-center justify-center pointer-events-none" style={{ bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 96px)`, left: '13%', transform: 'translate(-50%, -50%)', transition: 'bottom 0.3s ease-out, left 0.3s ease-out', width: `${shieldSizePx}px`, height: `${shieldSizePx}px`, zIndex: 20 }}>
        {/* Shield Health Bar */}
        {shieldHealth > 0 && (
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`} style={{ width: `${shieldHealthPct * 100}%` }}></div>
            </div>
        )}
        {/* Shield Lottie */}
        <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay className="w-full h-full" />
      </div>
    );
  };


  // Render Coins
  const renderCoins = () => activeCoins.map(coin => (
      <div key={coin.id} className="absolute w-10 h-10" style={{ top: `${coin.y}%`, left: `${coin.x}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 15 }}>
        <DotLottieReact src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie" loop autoplay className="w-full h-full" />
      </div>
    ));


  // Open treasure chest
  const openChest = () => {
    if (isChestOpen || chestsRemaining <= 0 || isStatsFullscreen) return;
    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      setIsChestOpen(true);
      setShowShine(true);
      setChestsRemaining(prev => prev - 1);
      setTimeout(() => {
        if (isStatsFullscreen) return; // Don't reveal if stats opened during animation
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        setCurrentCard(randomCard);
        setShowCard(randomCard);
        // Determine rewards
        let coinReward = 0;
        let gemReward = 0;
        switch(randomCard.rarity) {
          case "common": coinReward = 10; break;
          case "rare": coinReward = 25; break;
          case "epic": coinReward = 50; gemReward = 2; break;
          case "legendary": coinReward = 100; gemReward = 5; break;
        }
        setPendingCoinReward(coinReward);
        if (gemReward > 0) setGems(prev => prev + gemReward);
      }, 1500); // Delay before card appears
    }, 600); // Shake duration
  };

  // Reset chest state after closing card popup
  const resetChest = () => {
    setIsChestOpen(false);
    setShowCard(null);
    setCurrentCard(null);
    setShowShine(false);
    if (pendingCoinReward > 0) {
        startCoinCountAnimation(pendingCoinReward);
        // pendingCoinReward is reset inside startCoinCountAnimation
    }
  };

  // Toggle fullscreen stats view
  const toggleStatsFullscreen = () => {
    if (gameOver || showCard) return; // Prevent opening if game over or card shown
    const nextState = !isStatsFullscreen;
    console.log(`Toggling fullscreen stats to: ${nextState}`);
    setIsStatsFullscreen(nextState);
    // Game loop pause/resume is handled by the useEffect dependency array
  };


  // --- Main Render ---
  return (
    // Outermost container - Ensure this takes full screen height
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">

      {/* Tailwind CSS Custom Animations */}
      <style>{`
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
        .animate-floatUp { animation: floatUp 0.8s ease-out forwards; }
        @keyframes chest-shake { 0% { transform: translateX(0) rotate(0deg); } 10% { transform: translateX(-4px) rotate(-3deg); } 20% { transform: translateX(4px) rotate(3deg); } 30% { transform: translateX(-4px) rotate(-3deg); } 40% { transform: translateX(4px) rotate(3deg); } 50% { transform: translateX(-4px) rotate(-2deg); } 60% { transform: translateX(4px) rotate(2deg); } 70% { transform: translateX(0) rotate(0deg); } 100% { transform: translateX(0) rotate(0deg); } }
        .animate-chest-shake { animation: chest-shake 0.6s ease-in-out; }
        @keyframes lid-open { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-110deg); } } /* Simple lid rotation */
        .animate-lid-open { transform-origin: bottom; animation: lid-open 0.5s ease-out forwards; }
        @keyframes shine { 0% { transform: translateX(-150%) skewX(-30deg); opacity: 0.5; } 100% { transform: translateX(150%) skewX(-30deg); opacity: 0; } }
        .animate-shine::after { content: ''; position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); animation: shine 1.5s forwards; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: inherit; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes ray-rotate { 0% { opacity: 0.3; transform: rotate(0deg) scaleY(1); } 50% { opacity: 0.7; transform: rotate(180deg) scaleY(1.1); } 100% { opacity: 0.3; transform: rotate(360deg) scaleY(1); } }
        .animate-ray-rotate { animation: ray-rotate 4s linear infinite; }
        @keyframes gold-particle { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 50% { opacity: 0.7; } 100% { transform: translate( calc(-50% + var(--random-x)), calc(-50% + var(--random-y)) ) scale(1); opacity: 0; } }
        .animate-gold-particle { animation: gold-particle 1.5s ease-out forwards; }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 1.5s ease-in-out infinite; }
      `}</style>
       {/* Global style to prevent body scrolling */}
       <style jsx global>{`
        body { overflow: hidden; }
      `}</style>


      {/* Main Game Container - Takes full width/height of its parent */}
      <div
        ref={gameRef}
        className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl`}
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label="Game Area"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 z-0"></div>
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 z-1"></div>
        {renderClouds()}
        <div className="absolute bottom-0 left-0 w-full z-2" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-green-700">
                {/* Ground details */}
                <div className="w-full h-1 bg-green-800 absolute top-0"></div>
                <div className="w-3 h-3 bg-green-800 rounded-full absolute top-6 left-20"></div>
                <div className="w-4 h-2 bg-green-800 rounded-full absolute top-10 left-40"></div>
                <div className="w-6 h-3 bg-green-800 rounded-full absolute top-8 right-10"></div>
                <div className="w-3 h-1 bg-green-800 rounded-full absolute top-12 right-32"></div>
            </div>
        </div>

        {/* Render Game Objects */}
        {renderCharacter()}
        {renderShield()}
        {obstacles.map(obstacle => renderObstacle(obstacle))}
        {renderCoins()}
        {renderParticles()}

        {/* --- Top UI Header (Hidden when stats are fullscreen) --- */}
        {!isStatsFullscreen && (
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30">
              {/* Left: Health */}
              <div className="flex items-center">
                  {/* Character Icon */}
                  <div className="relative mr-2 cursor-pointer group" onClick={toggleStatsFullscreen} title="Xem chỉ số nhân vật" role="button" tabIndex={0} aria-label="Mở bảng chỉ số nhân vật">
                      <div className="w-8 h-8 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full flex items-center justify-center border-2 border-gray-800 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                          <div className="absolute inset-0 bg-black bg-opacity-10 rounded-full" />
                          <div className="relative z-10 flex items-center justify-center"><div className="flex items-end"><div className="w-1 h-2 bg-white rounded-sm mr-0.5" /><div className="w-1 h-3 bg-white rounded-sm mr-0.5" /><div className="w-1 h-1.5 bg-white rounded-sm" /></div></div>
                          <div className="absolute top-0 left-0 right-0 h-1/3 bg-white bg-opacity-30 rounded-t-full" />
                      </div>
                  </div>
                  {/* Health Bar */}
                  <div className="w-32 relative">
                      <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                          <div className="h-full overflow-hidden">
                              <div className={`${getColor()} h-full transform origin-left`} style={{ transform: `scaleX(${healthPct})`, transition: 'transform 0.5s ease-out' }}>
                                  <div className="w-full h-1/2 bg-white bg-opacity-20" />
                              </div>
                          </div>
                          {/* Health text */}
                          <div className="absolute inset-0 flex items-center justify-center"><span className="text-white text-xs font-bold drop-shadow-md tracking-wider">{Math.round(health)}/{MAX_HEALTH}</span></div>
                      </div>
                      {/* Damage Number */}
                      <div className="absolute -bottom-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                          {showDamageNumber && (<div className="absolute top-0 left-1/2 text-red-500 font-bold text-xs animate-floatUp">-{damageAmount}</div>)}
                      </div>
                  </div>
              </div>
              {/* Right: Currency */}
              <div className="flex items-center space-x-1 currency-display-container relative">
                {/* Gems */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-800 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                  <div className="relative mr-0.5"><div className="w-3 h-3 bg-gradient-to-br from-purple-300 to-purple-600 transform rotate-45 border-2 border-purple-700 shadow-md relative z-10 flex items-center justify-center"><div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute bottom-0 right-0 w-1 h-1 bg-purple-800/50 rounded-br-lg"></div></div></div>
                  <div className="font-bold text-purple-100 text-xs tracking-wide">{gems}</div>
                  <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                </div>
                {/* Coins */}
                <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                  <div className="relative mr-0.5 flex"><div className="w-3 h-3 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-2 border-amber-600 shadow-md relative z-20 flex items-center justify-center"><div className="absolute inset-0.5 bg-yellow-200 rounded-full opacity-60"></div><span className="text-amber-800 font-bold text-xs">$</span></div></div>
                  <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">{displayedCoins.toLocaleString()}</div>
                  <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                </div>
              </div>
            </div>
        )}


        {/* --- Game Over Screen --- */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
            <h2 className="text-3xl font-bold mb-4 text-red-500 drop-shadow-lg">Game Over</h2>
            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold transform transition hover:scale-105 shadow-lg hover:shadow-blue-400/50" onClick={startGame}>Chơi Lại</button>
          </div>
        )}

        {/* --- Full-screen Stats Display --- */}
        {isStatsFullscreen && (
            // *** MODIFIED HERE ***
            // Added w-full h-full and removed p-4 to make the container truly fullscreen
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 backdrop-blur-md w-full h-full">
                 <ErrorBoundary fallback={
                    // Fallback UI if CharacterCard fails
                    <div className="text-center p-6 bg-red-900 text-white rounded-lg shadow-xl">
                        <h3 className="text-xl font-bold mb-2">Lỗi Giao Diện</h3>
                        <p className="mb-4">Không thể hiển thị bảng chỉ số nhân vật.</p>
                        <button onClick={toggleStatsFullscreen} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition">Đóng</button>
                    </div>
                 }>
                    {/* Render CharacterCard - Ensure CharacterCard itself can expand */}
                    <CharacterCard onClose={toggleStatsFullscreen} />
                </ErrorBoundary>
            </div>
        )}


      </div> {/* End of Main Game Container */}

      {/* --- Bottom UI Elements (Hidden when stats are fullscreen) --- */}
      {!isStatsFullscreen && (
        <>
            {/* Left Buttons */}
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: (<div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div><div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>), label: "Shop", centered: true },
                { icon: (<div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center"><div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>), label: "Inventory", centered: true }
              ].map((item, index) => (
                <div key={`left-icon-${index}`} className="group cursor-pointer" title={item.label}>
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0 hover:bg-opacity-80 hover:shadow-lg">
                      {item.icon}
                      <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {/* Shield Skill */}
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-all duration-200 relative group ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || showCard || isStatsFullscreen ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 cursor-pointer hover:border-blue-400 hover:shadow-blue-500/50'}`}
                onClick={activateShield}
                title={ !gameStarted || gameOver ? "Không khả dụng" : isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` : isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` : showCard || isStatsFullscreen ? "Không khả dụng" : "Kích hoạt Khiên chắn" }
                aria-label="Sử dụng Khiên chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || showCard || isStatsFullscreen ? -1 : 0}
              >
                <div className="w-10 h-10"><DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive} className="w-full h-full"/></div>
                {isShieldOnCooldown && (<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold pointer-events-none">{remainingCooldown}s</div>)}
              </div>
              {/* Other Icons */}
              {[
                { icon: (<div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center"><div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div><div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div><div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>), label: "Mission", centered: true },
                { icon: (<div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center"><div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div><div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div><div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div><div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div><div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div><div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>), label: "Blacksmith", centered: true },
              ].map((item, index) => (
                <div key={`right-icon-${index}`} className="group cursor-pointer" title={item.label}>
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0 hover:bg-opacity-80 hover:shadow-lg">
                      {item.icon}
                      <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Treasure Chest */}
            <div className="absolute bottom-4 flex flex-col items-center justify-center w-full z-20 pointer-events-none"> {/* Container non-interactive */}
              <div
                className={`cursor-pointer transition-all duration-300 relative ${chestShake ? 'animate-chest-shake' : ''} ${chestsRemaining <= 0 || isChestOpen ? 'opacity-70 grayscale' : 'hover:scale-105'} pointer-events-auto`} // Chest interactive
                onClick={openChest} // Open chest on click (logic inside handles conditions)
                aria-label={chestsRemaining > 0 ? "Mở rương báu" : "Hết rương"}
                role="button"
                tabIndex={chestsRemaining > 0 && !isChestOpen ? 0 : -1} // Focusable only when usable
              >
                {/* Chest Visual Container */}
                <div className="flex flex-col items-center justify-center relative w-32 h-28"> {/* Fixed size container */}
                  {/* Chest Base */}
                   <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-amber-800 to-amber-600 rounded-b-lg border-x-2 border-b-2 border-amber-700 shadow-md">
                     {/* Base decorations */}
                     <div className="absolute inset-x-2 bottom-1 h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-800 to-yellow-600 rounded-full"></div>
                   </div>

                   {/* Chest Lid */}
                   <div className={`absolute top-0 w-full h-20 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-2 border-amber-700 shadow-lg z-10 ${isChestOpen ? 'animate-lid-open' : ''}`}>
                      {/* Lid decorations */}
                      <div className="absolute inset-x-2 top-1 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500 rounded-full"></div>
                      {/* Lock */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-6 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full border-2 border-yellow-700 flex items-center justify-center shadow-md">
                        <div className="w-2 h-3 bg-gray-700 rounded-sm"></div>
                      </div>
                   </div>

                  {/* --- Coin Collection Effect Lottie near Chest --- */}
                  {isChestCoinEffectActive && (
                      <div
                          className="absolute w-20 h-20 pointer-events-none z-50" // Size and above everything
                          style={{ top: '-30px', left: '50%', transform: 'translate(-50%, -50%)' }} // Position above chest
                      >
                          <DotLottieReact
                              src="https://lottie.host/07b8de00-e2ad-4d17-af12-9cbb13149269/vjmhfykbUL.lottie"
                              loop={false}
                              autoplay
                              className="w-full h-full"
                          />
                      </div>
                  )}
                </div> {/* End Chest Visual Container */}
              </div> {/* End Chest Clickable Area */}

              {/* Display remaining chests count */}
              <div className="mt-2 flex flex-col items-center pointer-events-auto"> {/* Count interactive */}
                <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
                  {chestsRemaining > 0 && (<div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>)}
                  <div className="flex items-center">
                    <span className="text-amber-200 font-bold text-xs">{chestsRemaining}</span>
                    <span className="text-amber-400/80 text-xs">/3</span>
                  </div>
                  {chestsRemaining > 0 && (<div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>)}
                </div>
              </div>
            </div> {/* End Treasure Chest Area */}
        </>
      )}


      {/* --- Card Info Popup --- */}
      {showCard && currentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 max-w-xs w-full text-center shadow-xl shadow-blue-500/30 border border-slate-700 relative animate-bounce-subtle">
            {/* Decorative element */}
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>

            <div className="text-xl font-bold text-white mb-4">Bạn nhận được</div>

            {/* Card Display */}
            <div className={`w-40 h-52 mx-auto rounded-xl shadow-lg mb-5 flex flex-col items-center justify-center relative overflow-hidden ${currentCard.background} animate-shine`}>
              {/* Icon */}
              <div className="text-6xl mb-2" style={{ color: currentCard.color }}>{currentCard?.icon}</div>
              {/* Name */}
              <h3 className="text-xl font-bold text-white mt-2 drop-shadow-md">{currentCard.name}</h3>
              {/* Rarity Text */}
              <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-1 font-medium text-sm`}>{currentCard.rarity}</p>
              {/* Rarity Stars */}
              <div className="flex mt-2">
                {[...Array(currentCard.rarity === "legendary" ? 5 : currentCard.rarity === "epic" ? 4 : currentCard.rarity === "rare" ? 3 : 2)].map((_, i) => (
                  <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" color="currentColor"/>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
                onClick={resetChest} // Close popup, reset chest state, start coin animation
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-6 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

    </div> // End of Outermost container
  );
}
