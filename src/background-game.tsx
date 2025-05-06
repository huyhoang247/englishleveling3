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
const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/tourmaline.png"
      alt="Biểu tượng Ngọc Tourmaline" // Added alt text
      className="w-full h-full object-contain" // Make image fit the container
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
            alt="Biểu tượng Chìa khóa" // Alt text in Vietnamese
            className="w-full h-full object-contain"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = `https://placehold.co/${size}x${size}/goldenrod/ffffff?text=Key`; // Placeholder
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
    console.error("Lỗi không bắt được trong CharacterCard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          <p>Có lỗi xảy ra khi hiển thị bảng chỉ số.</p>
          <p>Chi tiết lỗi: {this.state.error?.message}</p>
          <p>(Kiểm tra Console để biết thêm thông tin)</p>
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

// Define interface for Obstacle with health and key
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
  hasKey?: boolean; // NEW: Indicates if the obstacle carries a key
  collided?: boolean; // Optional: to mark if obstacle has collided, for filtering
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
  collided?: boolean; // Optional: to mark if coin has been collected
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
  const [obstacles, setObstacles] = useState<GameObstacle[]>([]); // Array of active obstacles with health
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [particles, setParticles] = useState<any[]>([]); // Array of active particles (dust) - Added 'any' for simplicity, can be typed better
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

  // NEW: Keys state
  const [keys, setKeys] = useState(1); // Player's key count, initialized to 1 for testing

  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers to manage intervals and timeouts
  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shieldCooldownStartTimeRef = useRef<number | null>(null);
  const pausedShieldCooldownRemainingRef = useRef<number | null>(null);

  // NEW: Ref for enemy counter for key spawning
  const enemiesSinceLastKeyRef = useRef(0);
  const nextKeySpawnCountRef = useRef(Math.floor(Math.random() * 6) + 5); // Random number between 5 and 10


  // Obstacle types with properties
  // Note: Omit 'collided' as it's a runtime state, not a type definition.
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey' | 'collided'>[] = [
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


  // Coin count animation function
  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30); // Ensure step is at least 1 if reward is small but > 0
      if (reward > 0 && step === 0) step = 1;
      let current = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      // Only start interval if there's a reward
      if (reward === 0) {
          setDisplayedCoins(newCoins); // Update immediately if no reward
          setCoins(newCoins);
          return;
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              setCoins(newCoins);
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null;
          } else {
              setDisplayedCoins(current);
          }
      }, 50);
      coinCountAnimationTimerRef.current = countInterval;
  };

  // Function to handle gem rewards
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Nhận được ${amount} gems từ rương.`);
  };

  // NEW: Function to handle key rewards (e.g., from chests, if implemented later)
  const addKeys = (amount: number) => {
    setKeys(prev => prev + amount);
    console.log(`Nhận được ${amount} chìa khóa.`);
  };


  // Function to start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setObstacles([]); // Start with empty obstacles, scheduleNextObstacle will populate
    setParticles([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    shieldCooldownStartTimeRef.current = null;
    pausedShieldCooldownRemainingRef.current = null;
    setActiveCoins([]);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);
    setCoins(357); // Reset coins or load from storage
    setDisplayedCoins(357);
    setGems(42);   // Reset gems or load from storage
    setKeys(1);    // Reset keys or load from storage
    enemiesSinceLastKeyRef.current = 0; // Reset key spawn counter
    nextKeySpawnCountRef.current = Math.floor(Math.random() * 6) + 5; // Reset next key spawn target


    // Initial obstacles are now primarily handled by scheduleNextObstacle
    // to ensure a continuous flow from the beginning.
    // However, you might want a few starting obstacles immediately.
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({
          id: Date.now(),
          position: 120, // Start off-screen
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: false,
        });

        // Optionally add a few more initial obstacles spaced out
        for (let i = 1; i < 3; i++) { // Reduced from 5 to 3 for a less crowded start
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          initialObstacles.push({
            id: Date.now() + i,
            position: 120 + (i * (Math.random()*20 + 30)), // Random spacing
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: false,
          });
        }
    }
    setObstacles(initialObstacles);

    generateInitialClouds(5);

    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    particleTimerRef.current = setInterval(generateParticles, 300);

    // Clear any existing timers before starting new ones
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
    obstacleTimerRef.current = null; // Ensure it's null so scheduleNextObstacle runs
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    coinScheduleTimerRef.current = null; // Ensure it's null

    scheduleNextObstacle();
    scheduleNextCoin();
  };

  // Call startGame when component mounts
  useEffect(() => {
    startGame();
    // Cleanup function for when the component unmounts
    return () => {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  useEffect(() => {
    if (health <= 0 && gameStarted && !gameOver) { // Added !gameOver to prevent multiple triggers
      setGameOver(true);
      setIsRunning(false);
      // Clear all game-related intervals and timeouts
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      obstacleTimerRef.current = null; // Important to allow restart
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      coinScheduleTimerRef.current = null; // Important to allow restart
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted, gameOver]); // gameOver added to dependencies

  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i + Math.random(), // Ensure unique ID
        x: Math.random() * 120 + 100, // Start off-screen
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
    const newParticles: any[] = []; // Can be typed better
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
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Keep particle count manageable
  };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    // Clear existing timer before setting a new one to prevent multiple timers
    if (obstacleTimerRef.current) {
        clearTimeout(obstacleTimerRef.current);
    }
    
    const randomTime = Math.floor(Math.random() * 15000) + 5000; // Between 5-20 seconds
    obstacleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Double check conditions before spawning

      const obstacleCount = Math.floor(Math.random() * 2) + 1; // Spawn 1 or 2 obstacles
      const newObstaclesBatch: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            // Ensure enough spacing for multiple obstacles in a batch
            const spacing = i * (Math.random() * 20 + 40); // Increased spacing

            enemiesSinceLastKeyRef.current++;
            let carriesKey = false;
            if (enemiesSinceLastKeyRef.current >= nextKeySpawnCountRef.current) {
                carriesKey = true;
                enemiesSinceLastKeyRef.current = 0;
                nextKeySpawnCountRef.current = Math.floor(Math.random() * 6) + 5;
            }

            newObstaclesBatch.push({
              id: Date.now() + i + Math.random(), // Ensure unique ID
              position: 100 + spacing, // Start off-screen to the right
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: carriesKey,
            });
          }
      }
      setObstacles(prev => [...prev, ...newObstaclesBatch]);
      scheduleNextObstacle(); // Recursively call to schedule the next batch
    }, randomTime);
  };

  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen || !gameStarted) { // Added !gameStarted
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    if (coinScheduleTimerRef.current) {
        clearTimeout(coinScheduleTimerRef.current);
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000; // Between 1-5 seconds
    coinScheduleTimerRef.current = setTimeout(() => {
      if (gameOver || isStatsFullscreen || !gameStarted) return; // Double check

      const newCoin: GameCoin = {
        id: Date.now() + Math.random(), // Ensure unique ID
        x: 110, // Start off-screen to the right
        y: Math.random() * 60, // Random vertical position
        initialSpeedX: Math.random() * 0.5 + 0.5,
        initialSpeedY: Math.random() * 0.3, // Slight downward drift
        attractSpeed: Math.random() * 0.05 + 0.03,
        isAttracted: false
      };
      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin(); // Recursively call
    }, randomTime);
  };

  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80); // Jump height
      setTimeout(() => {
        // Check game state again before resetting position, in case game ended mid-jump
        if (gameStarted && !gameOver && !isStatsFullscreen) {
          setCharacterPos(0); // Land
          setTimeout(() => {
            setJumping(false);
          }, 100); // Short delay to allow landing animation/state
        } else {
             // If game ended or paused, ensure character is reset properly without further state changes
             setCharacterPos(0);
             setJumping(false);
        }
      }, 600); // Jump duration
    }
  };

  const handleTap = () => {
    if (isStatsFullscreen) return; // Don't interact with game if stats are fullscreen

    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      startGame(); // Restart game on tap if game over
    } else {
      jump(); // Allow jump on tap if game is running
    }
  };

  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300); // Duration of the visual effect
  };

  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);
      setTimeout(() => {
          setShowDamageNumber(false);
      }, 800); // Duration of the damage number display
  };

  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen) {
      console.log("Không thể kích hoạt Khiên:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen });
      return;
    }
    console.log("Kích hoạt Khiên!");
    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH); // Reset shield health on activation
    setIsShieldOnCooldown(true);
    setRemainingCooldown(SHIELD_COOLDOWN_TIME / 1000);
    shieldCooldownStartTimeRef.current = Date.now();
    pausedShieldCooldownRemainingRef.current = null; // Clear any paused state

    if (shieldCooldownTimerRef.current) { // Clear any existing cooldown timer
        clearTimeout(shieldCooldownTimerRef.current);
    }
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Thời gian hồi chiêu Khiên kết thúc.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        shieldCooldownStartTimeRef.current = null;
        // Shield deactivates naturally when health is 0 or by player action, not by cooldown end.
    }, SHIELD_COOLDOWN_TIME);
  };


  // Main Game Loop Effect
  useEffect(() => {
    // If game not started, or is over, or stats are fullscreen, pause the game loop.
    if (!gameStarted || gameOver || isStatsFullscreen) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        // Also pause particle generation if it's running via its own timer
        if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return; // Exit the effect
    }

    // Start particle generation if not already running
    if (!particleTimerRef.current) {
        particleTimerRef.current = setInterval(generateParticles, 300);
    }

    // Start the main game loop if not already running
    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Base speed for obstacles

            // Update Obstacles
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles; // Should not happen if game started

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Character dimensions and position (simplified for collision logic)
                const characterWidth_px = (24 / 4) * 16; // Approx character width from Lottie size
                const characterHeight_px = (24 / 4) * 16; // Approx character height
                const characterXPercent = 5; // Character's fixed X position percentage
                const characterX_px = (characterXPercent / 100) * gameWidth;
                
                const groundPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                // Character's bounding box, Y is from top of screen
                const characterTop_px = gameHeight - groundPx - characterPos - characterHeight_px;
                const characterBottom_px = gameHeight - groundPx - characterPos;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;


                let newObstacles = prevObstacles.map(obstacle => {
                    if (obstacle.collided) return obstacle; // Already processed for removal

                    let newPosition = obstacle.position - speed;
                    let collisionDetectedThisFrame = false;

                    const obstacleWidth_px = (obstacle.width / 4) * 16; // Convert Tailwind units to approx px
                    const obstacleHeight_px = (obstacle.height / 4) * 16;
                    const obstacleX_px = (newPosition / 100) * gameWidth; // Current X of obstacle
                    
                    // Obstacle's bounding box, Y is from top of screen
                    const obstacleTop_px = gameHeight - groundPx - obstacleHeight_px;
                    const obstacleBottom_px = gameHeight - groundPx;

                    const collisionTolerance = 5; // px tolerance for collision

                    // Collision check
                    if (
                        characterRight_px > obstacleX_px - collisionTolerance &&
                        characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                        characterBottom_px > obstacleTop_px - collisionTolerance &&
                        characterTop_px < obstacleBottom_px + collisionTolerance
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
                            addKeys(1);
                            // Mark as no longer having a key to prevent multiple awards if somehow not removed
                            return { ...obstacle, position: newPosition, collided: true, hasKey: false };
                        }
                        return { ...obstacle, position: newPosition, collided: true }; // Mark for removal
                    }

                    // --- FIX: Obstacle Respawn Logic ---
                    if (newPosition < -20 && !collisionDetectedThisFrame) { // Obstacle is off-screen and did not collide this frame
                        if (obstacleTypes.length === 0) {
                             // Should not happen if obstacleTypes is populated. Mark for removal.
                            return { ...obstacle, position: newPosition, collided: true };
                        }
                        const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                        const randomOffset = Math.floor(Math.random() * 20) + 20; // e.g., 120 to 140

                        enemiesSinceLastKeyRef.current++;
                        let carriesKeyOnRespawn = false;
                        if (enemiesSinceLastKeyRef.current >= nextKeySpawnCountRef.current) {
                            carriesKeyOnRespawn = true;
                            enemiesSinceLastKeyRef.current = 0;
                            nextKeySpawnCountRef.current = Math.floor(Math.random() * 6) + 5;
                        }
                        // Return a NEW obstacle object to replace the old one
                        return {
                          // Base properties from the type
                          type: randomObstacleType.type,
                          height: randomObstacleType.height,
                          width: randomObstacleType.width,
                          color: randomObstacleType.color,
                          baseHealth: randomObstacleType.baseHealth,
                          damage: randomObstacleType.damage,
                          lottieSrc: randomObstacleType.lottieSrc,
                          // New instance properties
                          id: Date.now() + Math.random(), // Ensure unique ID
                          position: 100 + randomOffset,    // Start off-screen to the right
                          health: randomObstacleType.baseHealth,
                          maxHealth: randomObstacleType.baseHealth,
                          hasKey: carriesKeyOnRespawn,
                          collided: false, // Explicitly not collided for a new/recycled obstacle
                        };
                    }
                    // --- END FIX ---

                    return { ...obstacle, position: newPosition }; // Update position if still on screen or not recycled
                });

                // Filter out collided obstacles or those that somehow still ended up too far left without recycling
                // (though the fix above should prevent non-collided ones from being simply filtered out)
                return newObstacles.filter(obs => !obs.collided || obs.position > -25);
            });

            // Update Clouds
            setClouds(prevClouds => {
                return prevClouds.map(cloud => {
                    const newX = cloud.x - cloud.speed;
                    if (newX < -50) { // Cloud is off-screen
                        const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                        return { // Recycle cloud
                            ...cloud,
                            id: Date.now() + Math.random(), // New ID for recycled cloud
                            x: 120 + Math.random() * 30, // Reset position to the right
                            y: Math.random() * 40 + 10, // Random new Y
                            size: Math.random() * 40 + 30, // Random new size
                            speed: Math.random() * 0.3 + 0.15, // Random new speed
                            imgSrc: randomImgSrc
                        };
                    }
                    return { ...cloud, x: newX }; // Move existing cloud
                }).slice(0, 10); // Limit max clouds to prevent performance issues
            });

            // Update Particles
            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.xVelocity,
                        y: particle.y + particle.yVelocity,
                        opacity: particle.opacity - 0.03,
                        size: Math.max(0, particle.size - 0.1) // Ensure size doesn't go negative
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0) // Remove invisible/tiny particles
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
                const groundPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterTop_px = gameHeight - groundPx - characterPos - characterHeight_px;
                const characterBottom_px = gameHeight - groundPx - characterPos;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;
                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTop_px + characterHeight_px / 2;


                return prevCoins.map(coin => {
                    if (coin.collided) return coin; // Already collected

                    const coinSize_px = 40; // Approximate size of coin Lottie
                    const coinX_px = (coin.x / 100) * gameWidth;
                    const coinY_px = (coin.y / 100) * gameHeight;

                    let newX = coin.x;
                    let newY = coin.y;
                    let shouldBeAttracted = coin.isAttracted;
                    let collectedThisFrame = false;

                    // Check for initial attraction (player runs into coin's general area)
                    if (!shouldBeAttracted) {
                        // Wider attraction box than strict collision
                        const attractionBoxWidth = coinSize_px * 2;
                        const attractionBoxHeight = coinSize_px * 2;
                        if (
                            characterRight_px > coinX_px - attractionBoxWidth / 2 &&
                            characterLeft_px < coinX_px + coinSize_px + attractionBoxWidth / 2 &&
                            characterBottom_px > coinY_px - attractionBoxHeight / 2 &&
                            characterTop_px < coinY_px + coinSize_px + attractionBoxHeight / 2
                        ) {
                            shouldBeAttracted = true;
                        }
                    }

                    if (shouldBeAttracted) {
                        const dx = characterCenterX_px - coinX_px;
                        const dy = characterCenterY_px - coinY_px;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // If very close, collect it
                        if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.6) { // Tighter collection radius
                            collectedThisFrame = true;
                            const awardedCoins = Math.floor(Math.random() * 5) + 1; // 1 to 5 coins
                            startCoinCountAnimation(awardedCoins);
                        } else {
                            // Move towards character
                            const moveStep = distance * coin.attractSpeed; // Speed proportional to distance
                            const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                            const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;
                            const newCoinX_px = coinX_px + moveX_px;
                            const newCoinY_px = coinY_px + moveY_px;
                            newX = (newCoinX_px / gameWidth) * 100;
                            newY = (newCoinY_px / gameHeight) * 100;
                        }
                    } else {
                        // Move normally if not attracted
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY; // Optional: slight vertical drift
                    }
                    return {
                        ...coin,
                        x: newX,
                        y: newY,
                        isAttracted: shouldBeAttracted,
                        collided: collectedThisFrame
                    };
                })
                .filter(coin => { // Remove collected coins or those far off-screen
                    const isOffScreen = coin.x < -20 || coin.x > 120 || coin.y < -20 || coin.y > 120;
                    return !coin.collided && !isOffScreen;
                });
            });
        }, 30); // Game loop interval (approx 33 FPS)
    }
    // Cleanup function for this effect
    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Also clear particle timer if game stops
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, characterPos, isStatsFullscreen, coins, isShieldActive, health]); // Added health to deps for collision logic re-evaluation

  // Effect for managing obstacle and coin scheduling based on game state
  useEffect(() => {
      if (!gameStarted || gameOver || isStatsFullscreen) {
          // Game is paused or over, clear scheduling timers
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
      } else {
          // Game is active, ensure schedulers are running if not already
          if (!obstacleTimerRef.current) {
              scheduleNextObstacle();
          }
          if (!coinScheduleTimerRef.current) {
              scheduleNextCoin();
          }
      }
      // Cleanup for this effect (will also run if dependencies change)
      return () => {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen]); // Dependencies that control game activity

  // Effect for shield cooldown timer management
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      if (isStatsFullscreen || gameOver || !gameStarted) { // Pause cooldown if stats fullscreen, game over, or not started
          if (shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
              // Calculate remaining time and pause
              const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              pausedShieldCooldownRemainingRef.current = remainingTimeMs;
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
          }
          if (cooldownCountdownTimerRef.current) { // Clear the 1-second interval
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
          }
      } else if (isShieldOnCooldown) { // Shield is on cooldown and game is active
          let resumeTimeMs = SHIELD_COOLDOWN_TIME;
          if (pausedShieldCooldownRemainingRef.current !== null) { // Resuming from a paused state
              resumeTimeMs = pausedShieldCooldownRemainingRef.current;
              shieldCooldownStartTimeRef.current = Date.now() - (SHIELD_COoldown_TIME - resumeTimeMs); // Adjust start time
              pausedShieldCooldownRemainingRef.current = null; // Clear paused state
          } else if (shieldCooldownStartTimeRef.current) { // Normal continuation or initial start
              const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              resumeTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
          } else { // Should have a start time if on cooldown, but as a fallback:
              shieldCooldownStartTimeRef.current = Date.now();
          }


          if (resumeTimeMs > 0) {
              if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current); // Clear any old one
              shieldCooldownTimerRef.current = setTimeout(() => {
                  setIsShieldOnCooldown(false);
                  setRemainingCooldown(0);
                  shieldCooldownStartTimeRef.current = null; // Cooldown finished
              }, resumeTimeMs);

              // Countdown for display
              const initialRemainingSeconds = Math.ceil(resumeTimeMs / 1000);
              setRemainingCooldown(initialRemainingSeconds);

              if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = setInterval(() => {
                  setRemainingCooldown(prev => {
                      const newRemaining = Math.max(0, prev - 1);
                      if (newRemaining === 0) {
                          if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
                          cooldownCountdownTimerRef.current = null;
                      }
                      return newRemaining;
                  });
              }, 1000);
          } else { // Cooldown already finished
              setIsShieldOnCooldown(false);
              setRemainingCooldown(0);
              shieldCooldownStartTimeRef.current = null;
              if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
          }
      } else { // Shield is not on cooldown (or game not active for it)
            if (cooldownCountdownTimerRef.current) {
                clearInterval(cooldownCountdownTimerRef.current);
                cooldownCountdownTimerRef.current = null;
            }
            if (shieldCooldownTimerRef.current) {
                clearTimeout(shieldCooldownTimerRef.current);
                shieldCooldownTimerRef.current = null;
            }
      }
      return () => { // Cleanup for this effect
          if (countdownInterval) clearInterval(countdownInterval); // From old logic, ensure it's cleared if it was used
          if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
          if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, gameStarted]); // Dependencies for cooldown logic


  // Coin counter animation effect
  useEffect(() => {
    if (displayedCoins === coins) return; // No change needed

    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      // Use a timer to remove the class, as 'animationend' can be unreliable
      const timer = setTimeout(() => {
        coinElement.classList.remove('number-changing');
      }, 300); // Match animation duration

      return () => {
        clearTimeout(timer);
        if (coinElement) { // Check again in case element is gone
             coinElement.classList.remove('number-changing');
        }
      };
    }
     return () => {}; // Default return if element not found
  }, [displayedCoins, coins]); // Rerun when displayedCoins or actual coins change

  // Calculate health percentage for health bar
  const healthPct = Math.max(0, health / MAX_HEALTH); // Ensure not negative
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const shieldHealthPct = isShieldActive ? Math.max(0, shieldHealth / SHIELD_MAX_HEALTH) : 0;

  // Render Character Lottie
  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out z-10" // Added z-10
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '5%', // Character's horizontal position
          // Smooth transition for jumping and landing
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          autoplay={!isStatsFullscreen && gameStarted && !gameOver} // Autoplay only if game is active
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render individual obstacle
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;
    const obstacleWidthPx = (obstacle.width / 4) * 16; // Convert Tailwind units (w-X) to approx pixels
    const obstacleHeightPx = (obstacle.height / 4) * 16; // Convert Tailwind units (h-X) to approx pixels

    switch(obstacle.type) {
      case 'lottie-obstacle-1':
      case 'lottie-obstacle-2':
        obstacleEl = (
          <div
            className="relative" // For positioning health bar and key icon
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && gameStarted && !gameOver} // Autoplay Lottie
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      default: // Fallback for non-Lottie obstacles if any
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color} rounded`}
               style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}>
          </div>
        );
    }

    const obstacleHealthPct = Math.max(0, obstacle.health / obstacle.maxHealth);

    return (
      <div
        key={obstacle.id}
        className="absolute" // Positioned by left and bottom %
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Align with ground
          left: `${obstacle.position}%`, // Dynamic horizontal position
          // Add a transition for smoother movement if desired, though interval updates handle it
          // transition: 'left 0.05s linear',
        }}
      >
        {obstacleEl}
        {/* Health Bar for Obstacle */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-all duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
        </div>
        {/* Key Icon above health bar if obstacle has key */}
        {obstacle.hasKey && (
            <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 transform -translate-x-1/2 animate-bounce"> {/* Position above health bar, added bounce */}
                <KeyIcon size={16} />
            </div>
        )}
      </div>
    );
  };

  // Render Clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <img
        key={cloud.id}
        src={cloud.imgSrc}
        alt="Biểu tượng Đám mây"
        className="absolute object-contain" // Ensure image scales correctly
        style={{
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`, // Maintain aspect ratio for cloud images
          top: `${cloud.y}%`,
          left: `${cloud.x}%`,
          opacity: 0.8, // Slight transparency for clouds
          zIndex: 0 // Ensure clouds are behind other elements
        }}
        onError={(e) => { // Fallback for broken image links
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop on placeholder error
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud";
        }}
      />
    ));
  };

  // Render Dust Particles
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
          zIndex: 1 // Particles above ground, below character if needed
        }}
      ></div>
    ));
  };

  // Render Shield Lottie around character
  const renderShield = () => {
    if (!isShieldActive || shieldHealth <= 0) return null; // Don't render if not active or no health

    const shieldSizePx = 96; // Slightly larger than character Lottie (w-24 h-24)
    return (
      <div
        key="character-shield"
        className="absolute flex flex-col items-center justify-center pointer-events-none z-20" // Shield above character
         style={{
          // Center shield on character, characterPos is offset from ground
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + (${24*4 - shieldSizePx}/2)px)`, // 24*4 is character h-24 in px
          left: `calc(5% + (${24*4 - shieldSizePx}/2)px)`, // 5% is character left, 24*4 is character w-24 in px
          width: `${shieldSizePx}px`,
          height: `${shieldSizePx}px`,
          transition: 'bottom 0.3s ease-out, opacity 0.3s ease-out', // Smooth transition with jump
        }}
      >
        {/* Shield Health Bar (optional, can be above shield Lottie) */}
        <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
            <div
                className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-400' : shieldHealthPct > 0.3 ? 'bg-yellow-400' : 'bg-red-400'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${shieldHealthPct * 100}%` }}
            ></div>
        </div>
        <DotLottieReact
          src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
          loop
          autoplay={!isStatsFullscreen && gameStarted && !gameOver && isShieldActive} // Autoplay if shield is active and game running
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render Collectible Coins
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id}
        className="absolute w-10 h-10" // Size of the coin Lottie
        style={{
          top: `${coin.y}%`, // Dynamic position
          left: `${coin.x}%`,
          transform: 'translate(-50%, -50%)', // Center Lottie on its coordinates
          pointerEvents: 'none', // Coins don't block clicks
          zIndex: 5 // Coins above most elements but below UI
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && gameStarted && !gameOver} // Autoplay if game active
          className="w-full h-full"
        />
      </div>
    ));
  };

  // Toggle fullscreen stats view
  const toggleStatsFullscreen = () => {
    if (gameOver && !isStatsFullscreen) return; // Don't open stats if game over and not already open
    setIsStatsFullscreen(!isStatsFullscreen);
    // Game loop and schedulers will pause/resume based on isStatsFullscreen state via useEffect hooks
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative select-none"> {/* Added select-none */}
      {/* Embedded CSS for animations and global styles */}
      <style>{`
        @keyframes fadeOutUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }
        .animate-fadeOutUp { animation: fadeOutUp 0.5s ease-out forwards; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce { animation: bounce-subtle 1.5s ease-in-out infinite; } /* General bounce for icons like keys */
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: #fff; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
        @keyframes pulse { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } } /* For health bar shine */
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -20px); opacity: 0; } } /* For damage numbers */
      `}</style>
       <style jsx global>{` body { overflow: hidden; -webkit-user-select: none; -ms-user-select: none; user-select: none; } `}</style> {/* Prevent text selection globally */}

      {/* Conditional rendering for Stats Screen or Game Screen */}
      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            <CharacterCard onClose={toggleStatsFullscreen} />
        </ErrorBoundary>
      ) : (
        // Main Game Container
        <div
          ref={gameRef} // Ref for game area dimensions
          className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} // Use h-full, tap on whole screen
          onClick={handleTap} // Handle game interactions
          role="button" // Accessibility
          tabIndex={0} // Accessibility
          aria-label="Game Area"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600 z-0"></div> {/* Sky */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10 z-0"></div> {/* Sun */}
          {renderClouds()}

          {/* Ground Element */}
          <div className="absolute bottom-0 w-full z-0" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600"> {/* Ground gradient */}
                  {/* Decorative ground elements */}
                  <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                  <div className="w-3 h-3 bg-gray-900 rounded-full absolute top-6 left-20"></div>
                  <div className="w-4 h-2 bg-gray-900 rounded-full absolute top-10 left-40"></div>
                  <div className="w-6 h-3 bg-gray-900 rounded-full absolute top-8 right-10"></div>
                  <div className="w-3 h-1 bg-gray-900 rounded-full absolute top-12 right-32"></div>
              </div>
          </div>

          {/* Game Entities - Render order matters for layering */}
          {renderParticles()}
          {renderCharacter()}
          {renderShield()}
          {obstacles.map(obstacle => renderObstacle(obstacle))}
          {renderCoins()}


          {/* Top UI Bar: Stats, Health, Currency */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30">
            {/* Left side: Character Stats Button & Health Bar */}
            <div className="flex items-center">
                <div
                  className="relative mr-2 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); toggleStatsFullscreen(); }} // Prevent game tap
                  title="Xem chỉ số nhân vật"
                  role="button"
                  aria-label="Xem chỉ số nhân vật"
                >
                    <div className="w-8 h-8 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full flex items-center justify-center border-2 border-gray-800 overflow-hidden shadow-lg hover:scale-110 transition-transform">
                        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-full" />
                        <div className="relative z-10 flex items-center justify-center"> {/* Icon for stats */}
                            <div className="flex items-end">
                                <div className="w-1 h-2 bg-white rounded-sm mr-0.5" />
                                <div className="w-1 h-3 bg-white rounded-sm mr-0.5" />
                                <div className="w-1 h-1.5 bg-white rounded-sm" />
                            </div>
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-white bg-opacity-30 rounded-t-full" /> {/* Shine effect */}
                    </div>
                </div>
                {/* Health Bar */}
                <div className="w-32 relative"> {/* Container for health bar and damage numbers */}
                    <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner">
                        <div className="h-full overflow-hidden"> {/* Inner container for scaling */}
                            <div
                                className={`${getColor()} h-full transform origin-left`}
                                style={{
                                    transform: `scaleX(${healthPct})`,
                                    transition: 'transform 0.5s ease-out, background-color 0.5s ease-out', // Smooth transitions
                                }}
                            >
                                <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Subtle shine on health bar */}
                            </div>
                        </div>
                        {/* Pulsing shine effect on health bar */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                            style={{ animation: 'pulse 3s infinite' }}
                        />
                        {/* Health text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    {/* Damage Number Display Area */}
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                            <div
                                className="absolute top-0 left-1/2 text-red-500 font-bold text-xs animate-fadeOutUp" // Uses defined animation
                            >
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right side: Currency Display (Gems & Coins) */}
            {!isStatsFullscreen && ( // Hide currency if stats are fullscreen
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* Gems Display */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 pr-1.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer" title="Số Ngọc hiện có">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> {/* Shine on hover */}
                        <div className="relative mr-0.5 flex items-center justify-center p-0.5">
                            <GemIcon size={16} className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()}
                        </div>
                        {/* Placeholder for "add gems" button or interaction */}
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse opacity-50" title="Nạp Ngọc (chưa hoạt động)">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-50 group-hover:opacity-100"></div> {/* Subtle ping */}
                    </div>

                    {/* Coins Display */}
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 pr-1.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer" title="Số Vàng hiện có">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> {/* Shine on hover */}
                      <div className="relative mr-0.5 flex items-center justify-center p-0.5">
                        <img
                          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                          alt="Biểu tượng Đồng xu Đô la"
                          className="w-4 h-4" // Consistent icon size
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/16x16/ffd700/000000?text=$"; // Fallback
                          }}
                        />
                      </div>
                      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter"> {/* Class for animation target */}
                        {displayedCoins.toLocaleString()}
                      </div>
                       {/* Placeholder for "add coins" button or interaction */}
                      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse opacity-50" title="Nạp Vàng (chưa hoạt động)">
                        <span className="text-white font-bold text-xs">+</span>
                      </div>
                       <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-50 group-hover:opacity-100"></div> {/* Subtle ping */}
                    </div>
                </div>
             )}
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
              <h2 className="text-4xl font-bold mb-4 text-red-500 drop-shadow-lg">Game Over</h2>
              <button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg transform transition hover:scale-105 shadow-lg hover:shadow-blue-400/50 active:scale-95"
                onClick={(e) => { e.stopPropagation(); startGame(); }} // Prevent game tap, restart game
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Left Side Action Buttons (Shop, Inventory) - Example */}
          {!isStatsFullscreen && !gameOver && ( // Hide if stats are fullscreen or game over
            <div className="absolute left-4 bottom-32 flex flex-col space-y-3 z-30">
              {[
                { icon: "🛍️", label: "Shop", action: () => console.log("Open Shop") },
                { icon: "🎒", label: "Túi đồ", action: () => console.log("Open Inventory") },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); item.action(); }}
                  className="w-14 h-14 bg-black bg-opacity-60 p-1 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-200 flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95"
                  title={item.label}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs mt-0.5" style={{fontSize: '0.6rem'}}>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right Side Action Buttons (Shield, Mission, Blacksmith) - Example */}
          {!isStatsFullscreen && !gameOver && ( // Hide if stats are fullscreen or game over
            <div className="absolute right-4 bottom-32 flex flex-col space-y-3 z-30">
               {/* Shield Button */}
               <button
                className={`w-14 h-14 bg-gradient-to-br rounded-lg shadow-lg border-2 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden
                            ${!gameStarted || isShieldActive || isShieldOnCooldown
                                ? 'from-gray-600 to-gray-800 border-gray-500 opacity-60 cursor-not-allowed'
                                : 'from-blue-700 to-indigo-900 border-blue-600 hover:scale-105 active:scale-95 cursor-pointer'}`}
                onClick={(e) => { e.stopPropagation(); activateShield(); }}
                disabled={!gameStarted || isShieldActive || isShieldOnCooldown}
                title={
                  isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                  isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                  "Kích hoạt Khiên"
                }
                aria-label="Sử dụng Khiên chắn"
              >
                <div className="w-10 h-10"> {/* Lottie container */}
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                      loop
                      autoplay={isShieldActive && !isStatsFullscreen && gameStarted && !gameOver}
                      className="w-full h-full filter drop-shadow-lg" // Added filter for better visibility
                   />
                </div>
                {isShieldOnCooldown && ( // Cooldown timer text
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold pointer-events-none">
                    {remainingCooldown}s
                  </div>
                )}
                 {!isShieldActive && !isShieldOnCooldown && ( // "Ready" indicator
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
                 )}
              </button>
              {/* Other action buttons */}
              {[
                { icon: "🎯", label: "N.Vụ", action: () => console.log("Open Missions") },
                { icon: "🛠️", label: "Rèn", action: () => console.log("Open Blacksmith") },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); item.action(); }}
                  className="w-14 h-14 bg-black bg-opacity-60 p-1 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-200 flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95"
                  title={item.label}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs mt-0.5" style={{fontSize: '0.6rem'}}>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Treasure Chest Component - Positioned at bottom center */}
          {!gameOver && !isStatsFullscreen && gameStarted && ( // Only show if game active
            <TreasureChest
              initialChests={3} // Example: Max 3 chests per game or session
              initialKeys={keys} // Pass current keys from game state
              onCoinReward={startCoinCountAnimation}
              onGemReward={handleGemReward}
              onKeyUsed={() => setKeys(prev => Math.max(0, prev -1))} // Decrement keys in parent
              isGamePaused={gameOver || !gameStarted || isStatsFullscreen} // Pass paused state
              isStatsFullscreen={isStatsFullscreen} // To hide chest if stats are open
            />
          )}
        </div>
      )}
    </div>
  );
}
