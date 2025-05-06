import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
import CharacterCard from './stats/stats-main.tsx'; // Assuming stats.tsx is in the same directory

// Import DotLottieReact component
// Corrected import path for DotLottieReact
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// NEW: Import the TreasureChest component
import TreasureChest from './treasure.tsx';


// --- SVG Icon Components (Replacement for lucide-react) ---
// Only include icons still used in this file (e.g., for UI elements not in TreasureChest)

// X Icon SVG (for closing modal - kept here as it's a general UI element)
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

// NEW: Gem Icon Component using Image
// Replaced the SVG with an <img> tag using the provided URL
const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/tourmaline.png"
      alt="Biểu tượng Đá Tourmaline" // Added alt text
      className="w-full h-full object-contain" // Make image fit the container
      // Optional: Add onerror to handle broken image link
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop
        target.src = "https://placehold.co/24x24/8a2be2/ffffff?text=Gem"; // Placeholder image
      }}
    />
  </div>
);

// NEW: Key Icon Component using Image
const KeyIcon = ({ size = 24, className = '', ...props }) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
        <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
            alt="Biểu tượng Chìa khóa" // Alt text for key icon
            className="w-full h-full object-contain"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = `https://placehold.co/${size}x${size}/facc15/000000?text=Key`; // Placeholder
            }}
        />
    </div>
);


// --- NEW: Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback UI
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
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in CharacterCard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
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
  position: number; // Horizontal position in %
  type: string;
  height: number; // Height in Tailwind units (e.g., 8 for h-8)
  width: number; // Width in Tailwind units (e.g., 8 for w-8)
  color: string; // Tailwind gradient class or other identifier
  baseHealth: number; // Base health for this obstacle type
  health: number; // Current health of the obstacle
  maxHealth: number; // Maximum health of the obstacle
  damage: number; // Damage the obstacle deals on collision
  lottieSrc?: string; // Optional Lottie source URL for Lottie obstacles
  hasKey?: boolean; // NEW: True if this obstacle carries a key
  collided?: boolean; // Internal flag for collision handling
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
  collided?: boolean; // Internal flag for collection handling
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


// Update component signature to accept className prop
export default function ObstacleRunnerGame({ className }: ObstacleRunnerGameProps) {
  // Game states
  const [gameStarted, setGameStarted] = useState(false); // Tracks if the game has started
  const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useState(MAX_HEALTH); // Player's health, initialized to max
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [characterPos, setCharacterPos] = useState(0); // Vertical position of the character (0 is on the ground)
  // Updated obstacles state to use GameObstacle interface
  const [obstacles, setObstacles] = useState<GameObstacle[]>([]); // Array of active obstacles with health
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  // const [runFrame, setRunFrame] = useState(0); // Current frame for run animation - Not currently used with Lottie
  const [particles, setParticles] = useState<any[]>([]); // Array of active particles (dust)
  // Updated clouds state to use GameCloud interface
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect

  // State for Health Bar visual display (integrated from original HealthBar)
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number

  // --- NEW: Shield Skill States ---
  const SHIELD_MAX_HEALTH = 2000; // Base health for the shield
  const SHIELD_COOLDOWN_TIME = 200000; // Shield cooldown time in ms (200 seconds)
  const [isShieldActive, setIsShieldActive] = useState(false); // Tracks if the shield is active (có máu và đang hiển thị)
  const [shieldHealth, setShieldHealth] = useState(SHIELD_MAX_HEALTH); // Current shield health
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useState(false); // Tracks if the shield is on cooldown (timer 200s đang chạy)
  const [remainingCooldown, setRemainingCooldown, ] = useState(0); // Remaining cooldown time in seconds

  // --- NEW: Coin and Gem States (Kept in main game file) ---
  const [coins, setCoins] = useState(357); // Player's coin count
  const [displayedCoins, setDisplayedCoins] = useState(357); // Coins displayed with animation
  const [activeCoins, setActiveCoins] = useState<GameCoin[]>([]); // Array of active coins
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new coins
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for coin count animation

  // NEW: Gems state (Moved from TreasureChest)
  const [gems, setGems] = useState(42); // Player's gem count, initialized

  // --- NEW: Key States ---
  const [keys, setKeys] = useState(0); // Player's key count
  const [enemiesUntilKey, setEnemiesUntilKey] = useState(Math.floor(Math.random() * 6) + 5); // Enemies to defeat before a key drops (5-10)


  // UI States
  // NEW: State for full-screen stats visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers to manage intervals and timeouts
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref for the main game container div - Specify type
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new obstacles - Specify type
  // const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Timer for character run animation - Not currently used with Lottie
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for generating particles - Specify type
  // NEW: Shield timers
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for shield cooldown (200s) - Specify type
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for cooldown countdown display - Specify type

  // NEW: Ref for the main game loop interval
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Specify type

  // NEW: Ref to store the timestamp when shield cooldown started
  const shieldCooldownStartTimeRef = useRef<number | null>(null); // Specify type

  // *** NEW: Ref to store remaining cooldown time when paused ***
  const pausedShieldCooldownRemainingRef = useRef<number | null>(null);


  // Obstacle types with properties (added base health)
  // Note: `hasKey` is not part of the base type, it's assigned dynamically
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey' | 'collided'>[] = [
    // Lottie Obstacle Type 1 (from previous request)
    {
      type: 'lottie-obstacle-1', // Renamed type for clarity
      height: 16, // Approximate height in Tailwind units (h-16 = 64px)
      width: 16,  // Approximate width in Tailwind units (w-16 = 64px)
      color: 'transparent', // Color might not be used for Lottie, but keep a value
      baseHealth: 500, // Higher health for a potentially larger/more significant obstacle
      damage: 100, // Damage dealt on collision
      lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie" // Lottie source URL
    },
    // NEW: Lottie Obstacle Type 2 (from current request)
    {
      type: 'lottie-obstacle-2', // New type for the new Lottie
      height: 20, // Adjust height as needed for the new Lottie
      width: 20,  // Adjust width as needed for the new Lottie
      color: 'transparent',
      baseHealth: 700, // Adjust health as needed
      damage: 150, // Adjust damage as needed
      lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie" // New Lottie source URL
    },
  ];

  // --- NEW: Array of Cloud Image URLs ---
  const cloudImageUrls = [
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];


  // Coin count animation function (Kept in main game file)
  const startCoinCountAnimation = (reward: number) => { // Added type for reward
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30); // Ensure step is at least 1 if reward is small
      if (step === 0 && reward > 0) step = 1; // Handle small rewards
      let current = oldCoins;

      // Clear any existing coin count animation interval
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      if (reward === 0) { // If no reward, just ensure coins are set
        setDisplayedCoins(newCoins);
        setCoins(newCoins);
        return;
      }

      const countInterval = setInterval(() => {
          current += step;
          if ((step > 0 && current >= newCoins) || (step < 0 && current <= newCoins)) { // Handle negative rewards too if ever needed
              setDisplayedCoins(newCoins);
              setCoins(newCoins); // Ensure the actual coin count is updated at the end
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null; // Clear the ref after animation
          } else {
              setDisplayedCoins(current);
          }
      }, 50);

      // Store the interval ID in the dedicated ref
      coinCountAnimationTimerRef.current = countInterval;
  };

  // NEW: Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      // console.log(`Received ${amount} gems from chest.`);
      // You could add a visual effect for gem collection here if desired
  };


  // Function to start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH); // Start with max health
    setCharacterPos(0); // Character starts on the ground (0 is on the ground relative to ground level)
    setObstacles([]);
    setParticles([]);
    // NEW: Reset Shield states
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    shieldCooldownStartTimeRef.current = null;
    pausedShieldCooldownRemainingRef.current = null;

    setActiveCoins([]); // NEW: Reset active coins
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);
    setCoins(357);
    setDisplayedCoins(357);
    setGems(42);
    setKeys(0); // NEW: Reset keys
    setEnemiesUntilKey(Math.floor(Math.random() * 6) + 5); // NEW: Reset enemy key counter


    // Generate initial obstacles
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({
          id: Date.now(),
          position: 120,
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: false // Initial obstacles don't have keys
        });

        for (let i = 1; i < 3; i++) { // Fewer initial obstacles
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 60), // Increased spacing
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: false // Initial obstacles don't have keys
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

  // Auto-start the game as soon as component mounts
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      // if (runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;
      if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
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
    const newParticles: any[] = []; // Define type for newParticles if known, else any[]
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(), // Ensure unique ID
        x: 5 + Math.random() * 5,
        y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        size: Math.random() * 3 + 2, // Particle size
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
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

    const randomTime = Math.floor(Math.random() * 10000) + 3000; // Adjusted time (3-13 seconds)
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear existing before setting new
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 obstacles
      const newObstaclesToAdd: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          let currentEnemiesUntilKey = enemiesUntilKey; // Use a local copy for this batch

          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 20 + 15); // Spacing for grouped obstacles

            let willHaveKey = false;
            if (currentEnemiesUntilKey <= 0) {
                willHaveKey = true;
                currentEnemiesUntilKey = Math.floor(Math.random() * 6) + 5; // Reset for next key
            } else {
                currentEnemiesUntilKey--;
            }

            newObstaclesToAdd.push({
              id: Date.now() + i + Math.random(), // Ensure unique ID
              position: 100 + spacing,
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: willHaveKey, // Assign key status
            });
          }
          setEnemiesUntilKey(currentEnemiesUntilKey); // Update state for the next scheduling
      }

      setObstacles(prev => [...prev, ...newObstaclesToAdd]);
      scheduleNextObstacle();
    }, randomTime);
  };


  // --- NEW: Schedule the next coin to appear (Kept in main game file) ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen) {
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000;
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current); // Clear existing
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
    if (isStatsFullscreen) return;

    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      startGame();
    } else {
        jump(); // Allow jump if game is running
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
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen) {
      return;
    }
    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(true);
    setRemainingCooldown(SHIELD_COOLDOWN_TIME / 1000);
    shieldCooldownStartTimeRef.current = Date.now();
    pausedShieldCooldownRemainingRef.current = null;

    if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
    shieldCooldownTimerRef.current = setTimeout(() => {
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        shieldCooldownStartTimeRef.current = null;
        pausedShieldCooldownRemainingRef.current = null;
    }, SHIELD_COOLDOWN_TIME);
  };


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Also clear particle timer when paused by stats screen
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    if (!gameLoopIntervalRef.current) { // Start loop if not already running
        if (!particleTimerRef.current && gameStarted && !gameOver && !isStatsFullscreen) { // Restart particle timer if needed
            particleTimerRef.current = setInterval(generateParticles, 300);
        }

        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5;
            let keysCollectedThisFrame = 0;

            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;
                const characterWidth_px = 60; // Approximate
                const characterHeight_px = 60; // Approximate
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;
                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;
                const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;

                const updatedObstacles = prevObstacles.map(obstacle => {
                    let newPosition = obstacle.position - speed;
                    let collisionDetected = false;
                    const obstacleX_px = (newPosition / 100) * gameWidth;
                    const obstacleWidth_px = (obstacle.width / 4) * 16;
                    const obstacleHeight_px = (obstacle.height / 4) * 16;
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
                        // If collided and has key, mark for collection (will be handled in filter)
                    }

                    if (newPosition < -20 && !collisionDetected) {
                        if (Math.random() < 0.7 && obstacleTypes.length > 0) {
                            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                            const randomOffset = Math.floor(Math.random() * 20);
                            return {
                                ...obstacle,
                                ...randomObstacleType,
                                id: Date.now() + Math.random(),
                                position: 120 + randomOffset,
                                health: randomObstacleType.baseHealth,
                                maxHealth: randomObstacleType.baseHealth,
                                hasKey: false, // Recycled obstacles don't get keys this way
                                collided: false,
                            };
                        } else {
                            return { ...obstacle, position: newPosition, collided: obstacle.collided || collisionDetected };
                        }
                    }
                    return { ...obstacle, position: newPosition, collided: obstacle.collided || collisionDetected };
                });

                // Filter obstacles and collect keys
                const finalObstacles = updatedObstacles.filter(obstacle => {
                    const shouldRemove = obstacle.collided || obstacle.position <= -20 || obstacle.health <= 0;
                    if (shouldRemove && obstacle.hasKey) {
                        keysCollectedThisFrame++;
                    }
                    return !shouldRemove;
                });

                if (keysCollectedThisFrame > 0) {
                    setKeys(prevKeys => prevKeys + keysCollectedThisFrame);
                }
                return finalObstacles;
            });

            setClouds(prevClouds => {
                return prevClouds.map(cloud => {
                    const newX = cloud.x - cloud.speed;
                    if (newX < -50) {
                        const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                        return {
                            ...cloud,
                            id: Date.now() + Math.random(),
                            x: 120 + Math.random() * 30,
                            y: Math.random() * 40 + 10,
                            size: Math.random() * 40 + 30,
                            speed: Math.random() * 0.3 + 0.15,
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
                        size: particle.size - 0.1
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0)
            );

            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;
                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;
                const characterWidth_px = 60;
                const characterHeight_px = 60;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;
                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;
                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;

                const updatedCoins = prevCoins.map(coin => {
                    const coinSize_px = 40;
                    const coinX_px = (coin.x / 100) * gameWidth;
                    const coinY_px = (coin.y / 100) * gameHeight;
                    let newX = coin.x;
                    let newY = coin.y;
                    let collisionDetected = coin.collided || false; // Persist collision
                    let shouldBeAttracted = coin.isAttracted;

                    if (!shouldBeAttracted && !collisionDetected) {
                        if (
                            characterRight_px > coinX_px &&
                            characterLeft_px < coinX_px + coinSize_px &&
                            characterBottomFromTop_px > coinY_px &&
                            characterTopFromTop_px < coinY_px + coinSize_px
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted && !collisionDetected) {
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
                            startCoinCountAnimation(awardedCoins);
                        }
                    } else if (!collisionDetected) {
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY;
                    }
                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collided: collisionDetected };
                });
                return updatedCoins.filter(coin => !coin.collided && coin.x > -20 && coin.y < 120);
            });

        }, 30);
    }

    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Clean up particle timer on effect re-run or unmount
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver, isStatsFullscreen, characterPos, isShieldActive]); // Removed jumping, obstacleTypes, coins from deps as they don't directly control this loop's setup/cleanup logic in the same way.


  // Effect to manage obstacle and coin scheduling timers
  useEffect(() => {
      if (gameOver || isStatsFullscreen) {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current); // Also stop particles
      } else if (gameStarted) {
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) { // Restart particles if game running and not fullscreen
            particleTimerRef.current = setInterval(generateParticles, 300);
          }
      }
      return () => { // Cleanup on unmount or when deps change
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver, isStatsFullscreen]);

  // Effect for shield cooldown display and pause/resume
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      if (isStatsFullscreen) {
          if (shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
              const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              pausedShieldCooldownRemainingRef.current = remainingTimeMs;
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
          }
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
          }
      } else if (isShieldOnCooldown && !gameOver) {
          if (pausedShieldCooldownRemainingRef.current !== null) {
              const remainingTimeToResume = pausedShieldCooldownRemainingRef.current;
              shieldCooldownTimerRef.current = setTimeout(() => {
                  setIsShieldOnCooldown(false);
                  setRemainingCooldown(0);
                  shieldCooldownStartTimeRef.current = null;
                  pausedShieldCooldownRemainingRef.current = null;
              }, remainingTimeToResume);
              shieldCooldownStartTimeRef.current = Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume);
              pausedShieldCooldownRemainingRef.current = null;
          } else if (!shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
              const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              if (remainingTimeMs > 0) {
                   shieldCooldownTimerRef.current = setTimeout(() => {
                      setIsShieldOnCooldown(false);
                      setRemainingCooldown(0);
                      shieldCooldownStartTimeRef.current = null;
                   }, remainingTimeMs);
              } else {
                  setIsShieldOnCooldown(false);
                  setRemainingCooldown(0);
                  shieldCooldownStartTimeRef.current = null;
              }
          }

          if (!cooldownCountdownTimerRef.current && shieldCooldownStartTimeRef.current) {
              const currentElapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              const currentRemainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - currentElapsedTime);
              const initialRemainingSeconds = Math.ceil(currentRemainingTimeMs / 1000);

              if (initialRemainingSeconds > 0) {
                  setRemainingCooldown(initialRemainingSeconds);
                  countdownInterval = setInterval(() => {
                      if (isStatsFullscreen) { // Check again inside interval
                          if(countdownInterval) clearInterval(countdownInterval);
                          cooldownCountdownTimerRef.current = null;
                          return;
                      }
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
                  setRemainingCooldown(0);
              }
          }
      }

      return () => {
          if (countdownInterval) clearInterval(countdownInterval);
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen]);


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      // if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
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

  // Determine health bar color
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // NEW: Calculate shield health percentage
  const shieldHealthPct = isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;


  // Render the character
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
          autoplay={!isStatsFullscreen && gameStarted && !gameOver}
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

    switch(obstacle.type) {
      case 'lottie-obstacle-1':
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
                autoplay={!isStatsFullscreen && gameStarted && !gameOver}
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

    const obstacleHealthPct = obstacle.maxHealth > 0 ? obstacle.health / obstacle.maxHealth : 0;

    return (
      <div
        key={obstacle.id}
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          left: `${obstacle.position}%`
        }}
      >
        {obstacleEl}
        {/* Obstacle Health Bar */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
        </div>
        {/* NEW: Key Icon on Obstacle */}
        {obstacle.hasKey && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-5 h-5"> {/* Position above health bar */}
                <KeyIcon size={20} />
            </div>
        )}
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <img
        key={cloud.id}
        src={cloud.imgSrc}
        alt="Biểu tượng Đám mây"
        className="absolute object-contain"
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`,
          top: `${cloud.y}%`,
          left: `${cloud.x}%`,
          opacity: 0.8
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
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
          autoplay={isShieldActive && !isStatsFullscreen && gameStarted && !gameOver}
          className="w-full h-full"
        />
      </div>
    );
  };


  // --- NEW: Render Coins (Kept in main game file) ---
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id}
        className="absolute w-10 h-10"
        style={{
          top: `${coin.y}%`,
          left: `${coin.x}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && gameStarted && !gameOver}
          className="w-full h-full"
        />
      </div>
    ));
  };


  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    if (gameOver && !isStatsFullscreen) return; // Prevent opening if game over and not already open
    setIsStatsFullscreen(!isStatsFullscreen);
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      <style>{`
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: inherit; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes pulse { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } }
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } }
      `}</style>
       <style jsx global>{` body { overflow: hidden; } `}</style>

      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            <CharacterCard onClose={toggleStatsFullscreen} />
        </ErrorBoundary>
      ) : (
        <div
          ref={gameRef}
          className={`${className ?? ''} relative w-full h-screen rounded-lg overflow-hidden shadow-2xl`}
          onClick={handleTap}
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

          {/* Header section */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30">
            <div className="flex items-center">
                <div
                  className="relative mr-2 cursor-pointer"
                  onClick={toggleStatsFullscreen}
                  title="Xem chỉ số nhân vật"
                >
                    <div className="w-8 h-8 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full flex items-center justify-center border-2 border-gray-800 overflow-hidden shadow-lg hover:scale-110 transition-transform">
                        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-full" />
                        <div className="relative z-10 flex items-center justify-center">
                            <div className="flex items-end">
                                <div className="w-1 h-2 bg-white rounded-sm mr-0.5" />
                                <div className="w-1 h-3 bg-white rounded-sm mr-0.5" />
                                <div className="w-1 h-1.5 bg-white rounded-sm" />
                            </div>
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-white bg-opacity-30 rounded-t-full" />
                    </div>
                </div>
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
            {/* Currency display */}
            {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* Keys Container - NEW */}
                    <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-default">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <KeyIcon size={16} className="relative z-20" />
                        </div>
                        <div className="font-bold text-yellow-100 text-xs tracking-wide number-changing">
                            {keys.toLocaleString()}
                        </div>
                        {/* No plus button for keys for now */}
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
                    </div>

                    {/* Gems Container */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide number-changing">
                            {gems.toLocaleString()}
                        </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>

                    {/* Coins Container */}
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                      <div className="relative mr-0.5 flex items-center justify-center">
                        <img
                          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                          alt="Biểu tượng Tiền xu Đô la"
                          className="w-4 h-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/16x16/ffd700/000000?text=$";
                          }}
                        />
                      </div>
                      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter number-changing">
                        {displayedCoins.toLocaleString()}
                      </div>
                      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                        <span className="text-white font-bold text-xs">+</span>
                      </div>
                      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
                    </div>
                </div>
             )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
              <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                onClick={startGame}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {!isStatsFullscreen && (
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: ( <div className="relative"> <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600"> <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div> <div className="absolute top-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div> <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div> </div> <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div> </div> ), label: "Shop", notification: true, special: true, centered: true },
                { icon: ( <div className="relative"> <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600"> <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div> <div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center"> <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div> </div> </div> <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div> </div> ), label: "Inventory", notification: true, special: true, centered: true }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  {item.special && item.centered ? (
                      <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                          {item.icon}
                          {item.label && ( <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span> )}
                      </div>
                  ) : ( <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}> {item.icon} <span className="text-white text-xs text-center block mt-1">{item.label}</span> </div> )}
                </div>
              ))}
            </div>
          )}

          {!isStatsFullscreen && (
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                onClick={activateShield}
                title={ !gameStarted || gameOver ? "Không khả dụng" : isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` : isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` : isStatsFullscreen ? "Không khả dụng" : "Kích hoạt Khiên chắn" }
                aria-label="Sử dụng Khiên chắn" role="button" tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen ? -1 : 0}
              >
                <div className="w-10 h-10">
                   <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive && !isStatsFullscreen && gameStarted && !gameOver} className="w-full h-full" />
                </div>
                {isShieldOnCooldown && ( <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold"> {remainingCooldown}s </div> )}
              </div>
              {[
                { icon: ( <div className="relative"> <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600"> <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div> <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center"> <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div> <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div> <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div> </div> </div> <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div> </div> ), label: "Mission", notification: true, special: true, centered: true },
                { icon: ( <div className="relative"> <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600"> <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div> <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center"> <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div> <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div> <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div> <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div> <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div> <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div> </div> </div> <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div> </div> ), label: "Blacksmith", notification: true, special: true, centered: true },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  {item.special && item.centered ? (
                      <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                          {item.icon}
                          {item.label && ( <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span> )}
                      </div>
                  ) : ( <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}> {item.icon} <span className="text-white text-xs text-center block mt-1">{item.label}</span> </div> )}
                </div>
              ))}
            </div>
          )}

          <TreasureChest
            initialChests={3}
            onCoinReward={startCoinCountAnimation}
            onGemReward={handleGemReward}
            isGamePaused={gameOver || !gameStarted || isStatsFullscreen} // Game is also paused when stats are fullscreen
            isStatsFullscreen={isStatsFullscreen}
          />
        </div>
      )}
    </div>
  );
}

