import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
import CharacterCard from './stats/stats-main.tsx'; // Assuming stats.tsx is in the same directory

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
    fill={fill === 'currentColor' ? color : fill} // Use color prop for fill if fill is 'currentColor'
    stroke={color} // Use color prop for stroke
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`} // Add a base class if needed + user className
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

// --- NEW: Simple SVG Icons for Obstacles ---

// Simple Rock Icon SVG
const RockIcon = ({ size = 32, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32" // Adjusted viewBox
    fill={color} // Use fill for solid shape
    className={className}
    {...props}
  >
    <path d="M16 2C9.373 2 4 7.373 4 14c0 4.243 2.121 8.096 5.314 10.243L16 30l6.686-5.757C25.879 22.096 28 18.243 28 14c0-6.627-5.373-12-12-12zM16 4c5.514 0 10 4.486 10 10 0 3.182-1.406 6.07-3.657 8.05L16 26.121l-6.343-4.07C7.406 20.07 6 17.182 6 14c0-5.514 4.486-10 10-10z" />
    <circle cx="10" cy="12" r="2" fill="#fff" fillOpacity="0.2"/> {/* Highlight */}
    <circle cx="22" cy="16" r="1.5" fill="#fff" fillOpacity="0.2"/> {/* Highlight */}
    <circle cx="16" cy="18" r="1" fill="#fff" fillOpacity="0.2"/> {/* Highlight */}
  </svg>
);

// Simple Cactus Icon SVG
const CactusIcon = ({ size = 32, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32" // Adjusted viewBox
    fill={color} // Use fill for solid shape
    className={className}
    {...props}
  >
    <path d="M14 2h4v16h-4zM10 8h4v4h-4zM18 8h4v4h-4zM10 12h2v4h-2zM20 12h2v4h-2zM14 18h4v12h-4z" />
    <path d="M8 12h2v4h-2zM22 12h2v4h-2z" fillOpacity="0.5"/> {/* Side arms */}
  </svg>
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

// Define interface for Black Fire projectile
interface BlackFireProjectile {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  speed: number; // This will now represent a factor, not a fixed pixel step
  damage: number; // Damage the projectile deals
  targetObstacleId: number | null; // ID of the obstacle being targeted
}

// Define interface for Obstacle with health
interface GameObstacle {
  id: number;
  position: number; // Horizontal position in %
  type: string;
  height: number; // Height in Tailwind units (e.g., 8 for h-8) - Keep for collision calc if needed, but not for rendering size
  width: number; // Width in Tailwind units (e.g., 8 for w-8) - Keep for collision calc if needed, but not for rendering size
  color: string; // Tailwind gradient class - Keep for health bar color if needed
  baseHealth: number; // Base health from obstacle type
  health: number; // Current health of the obstacle
  maxHealth: number; // Maximum health of the obstacle
  damage: number; // Damage the obstacle deals
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
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [particles, setParticles] = useState([]); // Array of active particles (dust)
  const [clouds, setClouds] = useState([]); // Array of active clouds
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect
  const [showCharacterDamageEffect, setShowCharacterDamageEffect] = useState(false); // State to trigger character damage effect

  // State for Health Bar visual display (integrated from original HealthBar)
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number

  // --- NEW: Black Fire Skill States ---
  const INITIAL_BLACK_FIRE_COUNT = 25;
  const [blackFireCount, setBlackFireCount] = useState(INITIAL_BLACK_FIRE_COUNT); // Number of Black Fire uses
  const [activeBlackFires, setActiveBlackFires] = useState<BlackFireProjectile[]>([]); // Array of active Black Fire projectiles
  const BLACK_FIRE_DAMAGE = 150; // Damage dealt by Black Fire

  // --- NEW: Coin States ---
  const [coins, setCoins] = useState(357); // Player's coin count
  const [displayedCoins, setDisplayedCoins] = useState(357); // Coins displayed with animation
  const [activeCoins, setActiveCoins] = useState<GameCoin[]>([]); // Array of active coins
  const coinScheduleTimerRef = useRef(null); // Timer for scheduling new coins
  const coinCountAnimationTimerRef = useRef(null); // Timer for coin count animation


  // --- NEW: Coin Effect States ---
  const [isCoinEffectActive, setIsCoinEffectActive] = useState(false); // State to show coin effect
  const [coinEffectPosition, setCoinEffectPosition] = useState({ top: 0, left: 0 }); // Position for the coin effect Lottie
  const coinEffectTimerRef = useRef(null); // Timer to hide the coin effect


  // UI States
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [showCard, setShowCard] = useState(null); // Changed to null to store card object directly
  const [currentCard, setCurrentCard] = useState(null);
  const [gems, setGems] = useState(42);
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  const [chestsRemaining, setChestsRemaining] = useState(3);
  const [pendingCoinReward, setPendingCoinReward] = useState(0);
  // REMOVED: showStatsModal state
  // const [showStatsModal, setShowStatsModal] = useState(false); // State for stats modal visibility

  // NEW: State for full-screen stats visibility
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);


  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers to manage intervals and timeouts
  const gameRef = useRef(null); // Ref for the main game container div
  const obstacleTimerRef = useRef(null); // Timer for scheduling new obstacles
  const runAnimationRef = useRef(null); // Timer for character run animation
  const particleTimerRef = useRef(null); // Timer for generating particles
  const blackFireTimerRef = useRef(null); // Timer for moving Black Fire projectiles


  // Character animation frames (simple representation of leg movement) - No longer needed for Lottie
  // const runFrames = [0, 1, 2, 1]; // Different leg positions for animation

  // Obstacle types with properties (added base health)
  const obstacleTypes = [
    // Added baseHealth and damage
    { type: 'rock', height: 8, width: 8, color: 'from-gray-700 to-gray-500', baseHealth: 200, damage: 50 }, // Added damage
    // Added baseHealth and damage
    { type: 'cactus', height: 14, width: 6, color: 'from-green-800 to-green-600', baseHealth: 300, damage: 75 }, // Added damage
  ];

    // Updated cards array to use SVG components
  const cards = [
    { id: 1, name: "Kiếm Sắt", rarity: "common", icon: <SwordIcon size={36} />, color: "#d4d4d8", background: "bg-gradient-to-br from-gray-200 to-gray-400" },
    { id: 2, name: "Khiên Ma Thuật", rarity: "rare", icon: <ShieldIcon size={36} />, color: "#4287f5", background: "bg-gradient-to-br from-blue-300 to-blue-500" },
    { id: 3, name: "Vương Miện", rarity: "epic", icon: <CrownIcon size={36} />, color: "#9932CC", background: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { id: 4, name: "Ngọc Rồng", rarity: "legendary", icon: <GemIcon size={36} />, color: "#FFD700", background: "bg-gradient-to-br from-yellow-300 to-amber-500" }
  ];

  // Helper function to get rarity color
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case "common": return "text-gray-200";
      case "rare": return "text-blue-400";
      case "epic": return "text-purple-400";
      case "legendary": return "text-amber-400";
      default: return "text-white";
    }
  };

  // Coin count animation function
  const startCoinCountAnimation = (reward) => {
      const oldCoins = coins;
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
              setCoins(newCoins); // Ensure the actual coin count is updated at the end
              clearInterval(countInterval);
              setPendingCoinReward(0); // Reset pending reward after animation
              coinCountAnimationTimerRef.current = null; // Clear the ref after animation
          } else {
              setDisplayedCoins(current);
              // Optionally update actual coins state during animation for responsiveness
              // setCoins(current); // This might make the number jump slightly, depending on step size
          }
      }, 50);

      // Store the interval ID in the dedicated ref
      coinCountAnimationTimerRef.current = countInterval;
  };


  // Function to start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH); // Start with max health
    setCharacterPos(0); // Character starts on the ground (relative to ground level)
    // Reset obstacles, adding initial health
    setObstacles([]);
    setParticles([]);
    setActiveBlackFires([]); // Reset active Black Fires
    setBlackFireCount(INITIAL_BLACK_FIRE_COUNT); // Reset Black Fire count
    setActiveCoins([]); // NEW: Reset active coins
    setIsRunning(true); // Keep isRunning for potential Lottie state control if needed
    setShowHealthDamageEffect(false); // Reset health damage effect state
    setShowCharacterDamageEffect(false); // Reset character damage effect state
    setDamageAmount(0); // Reset damage amount display
    setShowDamageNumber(false); // Hide damage number
    // REMOVED: setShowStatsModal(false); // Ensure stats modal is closed on game start/restart
    setIsStatsFullscreen(false); // NEW: Ensure full-screen stats is closed
    setIsCoinEffectActive(false); // NEW: Reset coin effect state
    setCoins(357); // Reset coin count to initial value
    setDisplayedCoins(357); // Reset displayed coin count

    // Generate initial obstacles to populate the screen at the start
    const initialObstacles = [];
    // First obstacle placed a bit further to give the player time to react
    const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    initialObstacles.push({
      id: Date.now(), // Unique ID for React key
      position: 120, // Position off-screen to the right
      ...firstObstacleType, // Include obstacle properties
      health: firstObstacleType.baseHealth, // Initialize health
      maxHealth: firstObstacleType.baseHealth // Set max health
    });

    // Add a few more obstacles with increasing distance
    for (let i = 1; i < 5; i++) {
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      initialObstacles.push({
        id: Date.now() + i,
        position: 150 + (i * 50),
        ...obstacleType, // Include obstacle properties
        health: obstacleType.baseHealth, // Initialize health
        maxHealth: obstacleType.baseHealth // Set max health
      });
    }

    setObstacles(initialObstacles);

    // Generate initial clouds (a fixed, small number)
    generateInitialClouds(5); // Generate 5 clouds initially

    // Start the character run animation - No longer needed for Lottie autoplay
    // startRunAnimation();

    // Generate dust particles periodically
    particleTimerRef.current = setInterval(generateParticles, 300);

    // Schedule the first obstacle after the initial ones
    scheduleNextObstacle();

    // NEW: Start coin generation
    scheduleNextCoin();
  };

  // Auto-start the game as soon as component mounts
  useEffect(() => {
    startGame();
  }, []);

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) { // Game over when health is 0 or less
      setGameOver(true);
      setIsRunning(false); // Set running to false
      // Clear all active timers
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current); // Clear run animation timer (if still active)
      clearInterval(particleTimerRef.current);
      clearInterval(blackFireTimerRef.current); // Clear Black Fire timer
      clearInterval(coinScheduleTimerRef.current); // Clear coin scheduling timer
      clearInterval(coinCountAnimationTimerRef.current); // Clear coin count animation timer
      clearTimeout(coinEffectTimerRef.current); // Clear coin effect timer
    }
  }, [health, gameStarted]);

  // Generate initial cloud elements (called only once at game start)
  const generateInitialClouds = (count) => {
    const newClouds = [];
    for (let i = 0; i < count; i++) {
      newClouds.push({
        id: Date.now() + i, // Unique ID
        x: Math.random() * 120 + 100, // Start off-screen to the right
        y: Math.random() * 40 + 10, // Vertical position
        size: Math.random() * 20 + 30, // Size of the cloud
        speed: Math.random() * 0.2 + 0.1 // Speed of the cloud
      });
    }
    setClouds(newClouds);
  };

  // Generate dust particles for visual effect
  const generateParticles = () => {
    // Only generate if game is active, not over, and stats are NOT in fullscreen
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    const newParticles = [];
    for (let i = 0; i < 2; i++) { // Generate 2 particles at a time
      newParticles.push({
        id: Date.now() + i, // Unique ID
        x: 10 + Math.random() * 5, // Starting X position (near character)
        y: 0, // Starting Y position (relative to ground level)
        size: Math.random() * 4 + 2, // Size of the particle
        xVelocity: -Math.random() * 1 - 0.5, // Horizontal velocity (moving left)
        yVelocity: Math.random() * 2 - 1, // Vertical velocity (random up/down)
        opacity: 1, // Initial opacity
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700' // Random color
      });
    }
    // Add new particles to the existing array
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Start the character run animation loop - No longer needed for Lottie autoplay
  // const startRunAnimation = () => {
  //   if (runAnimationRef.current) clearInterval(runAnimationRef.current); // Clear any existing animation timer

  //   runAnimationRef.current = setInterval(() => {
  //     setRunFrame(prev => (prev + 1) % runFrames.length); // Cycle through run frames
  //   }, 150); // Update frame every 150ms
  // };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    // Don't schedule if game is over or stats are in fullscreen
    if (gameOver || isStatsFullscreen) return;

    // Random time delay before the next obstacle appears (between 5 and 20 seconds)
    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    obstacleTimerRef.current = setTimeout(() => {
      // Create a group of 1 to 3 obstacles
      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = []; // Specify type

      for (let i = 0; i < obstacleCount; i++) {
        // Ensure we only pick from the remaining obstacle types
        const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        // Add spacing between grouped obstacles
        const spacing = i * (Math.random() * 10 + 10);

        newObstacles.push({
          id: Date.now() + i, // Unique ID
          position: 100 + spacing, // Position off-screen to the right with spacing
          ...randomObstacleType, // Include obstacle properties
          health: randomObstacleType.baseHealth, // Initialize health
          maxHealth: randomObstacleType.baseHealth, // Set max health
          damage: randomObstacleType.damage // Set damage
        });
      }

      // Add new obstacles to the existing array
      setObstacles(prev => [...prev, ...newObstacles]);

      scheduleNextObstacle(); // Schedule the next obstacle recursively
    }, randomTime);
  };

  // --- NEW: Schedule the next coin to appear ---
  const scheduleNextCoin = () => {
    // Don't schedule if game is over or stats are in fullscreen
    if (gameOver || isStatsFullscreen) return;

    // Random time delay before the next coin appears (between 1 and 5 seconds)
    const randomTime = Math.floor(Math.random() * 4000) + 1000;
    // Clear the coin scheduling timer before setting a new one
    if (coinScheduleTimerRef.current) {
        clearTimeout(coinScheduleTimerRef.current);
    }
    coinScheduleTimerRef.current = setTimeout(() => {
      // Generate a new coin
      const newCoin: GameCoin = {
        id: Date.now(), // Unique ID
        x: 110, // Start off-screen to the right (%)
        y: Math.random() * 60, // Random vertical position from top (0%) to middle (60%)
        initialSpeedX: Math.random() * 0.5 + 0.5, // Speed for initial horizontal movement (move left)
        initialSpeedY: Math.random() * 0.3, // Speed for initial vertical movement (move downwards)
        attractSpeed: Math.random() * 0.05 + 0.03, // Speed factor for moving towards character
        isAttracted: false // Initially not attracted
      };

      // Add the new coin to the active list
      setActiveCoins(prev => [...prev, newCoin]);

      scheduleNextCoin(); // Schedule the next coin recursively
    }, randomTime);
  };


  // Handle character jump action
  const jump = () => {
    // Check if not already jumping, game is started, not over, AND card popup/stats fullscreen is not shown
    if (!jumping && !gameOver && gameStarted && !showCard && !isStatsFullscreen) { // Check isStatsFullscreen
      setJumping(true); // Set jumping state to true
      setCharacterPos(80); // Move character up (jump height relative to ground)
      // Schedule landing after a delay
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen) { // Ensure game is still active and stats NOT fullscreen
          setCharacterPos(0); // Move character back to ground
          // Schedule setting jumping state to false after a short delay
          setTimeout(() => {
            setJumping(false);
          }, 100);
        }
      }, 600); // Jump duration
    }
  };

  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    // Ignore taps if stats are in fullscreen or card is shown
    if (isStatsFullscreen || showCard) return;

    if (!gameStarted) {
      startGame(); // Start the game if not started
    } else if (!gameOver) { // isStatsFullscreen and showCard checked at the start
      jump(); // Jump if game is active and not paused
    } else if (gameOver) {
      startGame(); // Restart the game if game is over
    }
    // If showCard is true, taps on the game area are ignored
  };


  // Trigger health bar damage effect
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300); // Effect duration
  };

  // Trigger character damage effect and floating number
  const triggerCharacterDamageEffect = (amount) => {
      setShowCharacterDamageEffect(true);
      setDamageAmount(amount); // Set the damage amount for display
      setShowDamageNumber(true); // Show the damage number

      setTimeout(() => {
          setShowCharacterDamageEffect(false);
      }, 500); // Effect duration (slightly longer for visibility)
      setTimeout(() => {
          setShowDamageNumber(false); // Hide damage number
      }, 800); // Hide damage number after animation
  };

  // --- Function to activate Black Fire skill ---
  const activateBlackFire = () => {
    // Check if game is active, not over, has uses remaining, and not showing card/stats
    if (!gameStarted || gameOver || blackFireCount <= 0 || showCard || isStatsFullscreen) {
      console.log("Cannot activate Black Fire:", { gameStarted, gameOver, blackFireCount, showCard, isStatsFullscreen });
      return;
    }

    // Find the closest obstacle to target
    const targetObstacle = obstacles.reduce((closest, current) => {
        // Calculate distance based on horizontal position (simple approach)
        const currentDistance = current.position - 10; // Distance from character's x (10%)
        // Only consider obstacles that are to the right of the character and have health
        if (currentDistance > 0 && current.health > 0 && (closest === null || currentDistance < closest.position - 10)) {
            return current;
        }
        return closest;
    }, null as GameObstacle | null); // Specify initial value type

    if (targetObstacle) {
      console.log("Targeting obstacle:", targetObstacle); // Log target obstacle

      // Decrement Black Fire count
      setBlackFireCount(prev => prev - 1);

      // Get target obstacle's screen position (approximate)
      // Obstacle position is in %, convert to px relative to game container
      const gameContainer = gameRef.current;
      if (!gameContainer) {
        console.error("Game container ref is not available."); // Log error
        return;
      }

      const gameWidth = gameContainer.offsetWidth;
      const gameHeight = gameContainer.offsetHeight;

      // Approximate obstacle center position in pixels
      // Obstacle is positioned at 'bottom: GROUND_LEVEL_PERCENT%', 'left: obstacle.position%'
      // Need to calculate its center relative to the top-left of the game container
      const obstacleLeftPx = (targetObstacle.position / 100) * gameWidth;
      const obstacleBottomPct = GROUND_LEVEL_PERCENT;
      const obstacleBottomPx = (obstacleBottomPct / 100) * gameHeight;
      // Approximate obstacle dimensions in pixels (rough conversion from Tailwind units)
      // Use a fixed size for icon rendering, let's say 40px for calculation purposes
      const obstacleRenderSizePx = 40;


      // Approximate center of the obstacle (using render size for centering)
      const targetX = obstacleLeftPx + obstacleRenderSizePx / 2;
      const targetY = gameHeight - obstacleBottomPx - obstacleRenderSizePx / 2; // Y from top

      // Starting position for Black Fire (above the screen)
      const startX = targetX; // Start directly above the target
      const startY = -50; // Start 50px above the top of the container

      // Create a new Black Fire projectile
      const newBlackFire: BlackFireProjectile = {
        id: Date.now(),
        startX: startX,
        startY: startY,
        targetX: targetX,
        targetY: targetY,
        currentX: startX,
        currentY: startY,
        speed: 0.08, // MODIFIED: Reduced speed, this is now a factor (e.g., move 8% of remaining distance per frame)
        damage: BLACK_FIRE_DAMAGE, // Damage it deals
        targetObstacleId: targetObstacle.id // Target the specific obstacle
      };

      console.log("Creating new Black Fire:", newBlackFire); // Log new projectile

      // Add the new projectile to the active list
      setActiveBlackFires(prev => [...prev, newBlackFire]);
    } else {
      console.log("No living obstacle found to target."); // Log if no target found
    }
  };

  // --- Effect to move Black Fire projectiles ---
  useEffect(() => {
    // Don't run if game is not started, over, or stats are in fullscreen
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    const moveProjectiles = () => {
        setActiveBlackFires(prevFires => {
            const gameContainer = gameRef.current;
            if (!gameContainer) {
                 console.error("Game container ref is not available during projectile movement."); // Log error
                 return prevFires;
            }

            const gameHeight = gameContainer.offsetHeight;

            return prevFires
                .map(fire => {
                    // Calculate direction vector
                    const dx = fire.targetX - fire.currentX;
                    const dy = fire.targetY - fire.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Calculate movement step based on a fraction of the remaining distance
                    // This creates a smoother deceleration effect as it approaches the target
                    const moveStep = distance * fire.speed;

                    // Avoid division by zero if distance is 0
                    const moveX = distance === 0 ? 0 : (dx / distance) * moveStep;
                    const moveY = distance === 0 ? 0 : (dy / distance) * moveStep;


                    // Update position
                    const newX = fire.currentX + moveX;
                    const newY = fire.currentY + moveY;

                    // Check for collision with target obstacle or if it passed the target
                    let hitTarget = false;
                    // Check if the projectile is close enough to the target
                    if (distance < 10) { // MODIFIED: Check if distance is less than a small threshold (e.g., 10 pixels)
                        hitTarget = true;
                    }

                    return {
                        ...fire,
                        currentX: newX,
                        currentY: newY,
                        hitTarget: hitTarget // Add a flag to mark for removal and damage application
                    };
                })
                .filter(fire => {
                    // Remove projectile if it hit the target or went off-screen (below ground)
                    const isOffScreen = fire.currentY > gameHeight + 50; // Check if below the bottom of the game container + buffer

                    if (fire.hitTarget) {
                        console.log("Black Fire hit target obstacle:", fire.targetObstacleId); // Log hit
                        // Find the targeted obstacle and apply damage
                        setObstacles(prevObstacles =>
                            prevObstacles.map(obstacle => {
                                if (obstacle.id === fire.targetObstacleId) {
                                    const newHealth = Math.max(0, obstacle.health - fire.damage);
                                    console.log(`Obstacle ${obstacle.id} health: ${obstacle.health} -> ${newHealth}`); // Log health change
                                    // Trigger damage effect on the obstacle? (More complex, maybe later)
                                    // For now, just update health and remove if dead
                                    return { ...obstacle, health: newHealth };
                                }
                                return obstacle;
                            }).filter(obstacle => obstacle.health > 0) // Remove obstacle if health is 0 or less
                        );
                        return false; // Remove the projectile
                    }

                    return !isOffScreen; // Keep projectile if not off-screen
                });
        });
    };

    // Set up the interval for moving projectiles
    blackFireTimerRef.current = setInterval(moveProjectiles, 30); // MODIFIED: Reduced interval to 30ms for smoother animation

    // Cleanup function to clear the interval
    return () => clearInterval(blackFireTimerRef.current);

  }, [gameStarted, gameOver, isStatsFullscreen, obstacles]); // Add obstacles to dependency array


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  useEffect(() => {
    // Don't run movement if game is not started, over, or stats are in fullscreen
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    // Game speed is now constant as score is removed
    const speed = 2; // Base speed for obstacles and particles
    // Removed damagePerCollision here, will use damage from obstacleTypes

    const moveInterval = setInterval(() => {
      // Move obstacles and handle endless loop effect
      setObstacles(prevObstacles => {
        const gameContainer = gameRef.current;
        if (!gameContainer) return prevObstacles; // Return early if ref is not available

        const gameWidth = gameContainer.offsetWidth;
        const gameHeight = gameContainer.offsetHeight;

        // Define character's bounding box in pixels (approximate)
        const characterWidth_px = (24 / 4) * 16; // Assuming w-24 is 96px
        const characterHeight_px = (24 / 4) * 16; // Assuming h-24 is 96px
        const characterXPercent = 10; // Character's fixed X position (in %)
        const characterX_px = (characterXPercent / 100) * gameWidth; // Character's fixed X position in pixels

        // Character's vertical position relative to the top of the game container
        // characterPos is pixels above the GROUND_LEVEL_PERCENT from bottom
        const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
        const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx); // Character bottom edge from top of container
        const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px; // Character top edge from top of container
        const characterLeft_px = characterX_px; // Character's left edge from left of game container
        const characterRight_px = characterX_px + characterWidth_px; // Character's right edge from left of game container

        // Obstacle's vertical position relative to the top of the game container
        // Obstacle is at GROUND_LEVEL_PERCENT from bottom
        const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;

        // Use a fixed size for icon rendering for collision calculation
        const obstacleRenderWidth_px = 40; // Approximate width of the icon
        const obstacleRenderHeight_px = 40; // Approximate height of the icon


        return prevObstacles
          .map(obstacle => {
            // Speed is now consistent for all ground obstacles
            let newPosition = obstacle.position - speed; // Move obstacle left

            let collisionDetected = false;
            // Obstacle position in pixels relative to the bottom-left of the game container
            // Use newPosition for collision check
            const obstacleX_px = (newPosition / 100) * gameWidth;

            // Obstacle Y relative to ground level is 0, so its bottom from top is obstacleBottomFromTop_px
            // Calculate obstacle top based on the *render* height
            const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleRenderHeight_px;


             // Check for collision using bounding boxes in pixels with tolerance
            const collisionTolerance = 10; // Increased tolerance for collision detection with icons
            if (
              characterRight_px > obstacleX_px - collisionTolerance &&
              characterLeft_px < obstacleX_px + obstacleRenderWidth_px + collisionTolerance &&
              characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance && // Character bottom is below obstacle top
              characterTopFromTop_px < obstacleBottomFromTop_px + obstacleRenderHeight_px + collisionTolerance // Character top is above obstacle bottom
            ) {
              collisionDetected = true;
              // Decrease health by the obstacle's damage amount on collision
              const damageTaken = obstacle.damage; // Use damage from obstacle type
              setHealth(prev => Math.max(0, prev - damageTaken));
              triggerHealthDamageEffect(); // Trigger health bar damage effect
              triggerCharacterDamageEffect(damageTaken); // Trigger character damage effect and show number
            }


            // Create infinite loop effect by resetting obstacles that move off-screen AND haven't collided
            if (newPosition < -20 && !collisionDetected) { // Only reuse if off-screen AND no collision
              // 70% chance to reuse the obstacle and loop it back
              if (Math.random() < 0.7) {
                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                const randomOffset = Math.floor(Math.random() * 20);

                return {
                  ...obstacle,
                  ...randomObstacleType,
                  id: Date.now(),
                  position: 120 + randomOffset,
                  health: randomObstacleType.baseHealth,
                  maxHealth: randomObstacleType.baseHealth,
                  damage: randomObstacleType.damage // Ensure damage is carried over
                };
              } else {
                // If not reusing, let it move off-screen to be filtered out
                return { ...obstacle, position: newPosition };
              }
            }

            // If collided, mark for removal
            if (collisionDetected) {
                return { ...obstacle, position: newPosition, collided: true }; // Add a collided flag
            }


            return { ...obstacle, position: newPosition }; // Return updated obstacle position if no collision and not off-screen
          })
          .filter(obstacle => {
            // Keep obstacles that haven't collided and are still visible or will loop back
            // Also filter out obstacles that have 0 or less health (killed by Black Fire)
            // Now also filter out obstacles that have the 'collided' flag set
            return !obstacle.collided && obstacle.position > -20 && obstacle.health > 0; // Filter out collided, far off-screen, or dead obstacles
          });
      });

      // Move clouds and handle infinite loop effect
      setClouds(prevClouds => {
        return prevClouds
          .map(cloud => {
            const newX = cloud.x - cloud.speed; // Move cloud left

            // Loop clouds back to the right side when they go off-screen
            if (newX < -50) {
              return {
                ...cloud,
                id: Date.now() + Math.random(), // New ID
                x: 120 + Math.random() * 30, // New position off-screen to the right
                y: Math.random() * 40 + 10, // New random height
                size: Math.random() * 20 + 30, // New random size
                speed: Math.random() * 0.2 + 0.1 // New random speed
              };
            }

            return { ...cloud, x: newX }; // Return updated cloud position
          });
          // No filtering needed for clouds, they are recycled
      });

      // Update particles (move and fade)
      setParticles(prevParticles =>
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.xVelocity, // Move particle horizontally
            y: particle.y + particle.yVelocity, // Move particle vertically
            opacity: particle.opacity - 0.03, // Decrease opacity (fade out)
            size: particle.size - 0.1 // Decrease size (shrink)
          }))
          .filter(particle => particle.opacity > 0 && particle.size > 0) // Remove particles that have faded or shrunk completely
      );

      // --- NEW: Move coins and detect collisions ---
      setActiveCoins(prevCoins => {
          const gameContainer = gameRef.current;
          if (!gameContainer) return prevCoins; // Return early if ref is not available

          const gameWidth = gameContainer.offsetWidth;
          const gameHeight = gameContainer.offsetHeight;

          // Define character's bounding box in pixels (approximate)
          const characterWidth_px = (24 / 4) * 16; // Assuming w-24 is 96px
          const characterHeight_px = (24 / 4) * 16; // Assuming h-24 is 96px
          const characterXPercent = 10; // Character's fixed X position (in %)
          const characterX_px = (characterXPercent / 100) * gameWidth; // Character's fixed X position in pixels

          // Character's vertical position relative to the top of the game container
          // characterPos is pixels above the GROUND_LEVEL_PERCENT from bottom
          const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
          const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx); // Character bottom edge from top of container
          const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px; // Character top edge from top of container
          const characterLeft_px = characterX_px; // Character's left edge from left of game container
          const characterRight_px = characterX_px + characterWidth_px; // Character's right edge from left of game container

          // Get character's approximate center position in pixels (relative to top-left of game container)
          const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
          const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


          return prevCoins
              .map(coin => {
                  // Approximate coin size in pixels (assuming a fixed size for the Lottie)
                  const coinSize_px = 40; // Assuming coin Lottie is roughly 40x40px

                  // Coin position in pixels relative to the top-left of the game container
                  const coinX_px = (coin.x / 100) * gameWidth;
                  const coinY_px = (coin.y / 100) * gameHeight;

                  let newX = coin.x;
                  let newY = coin.y;
                  let collisionDetected = false;
                  let shouldBeAttracted = coin.isAttracted; // Start with current attraction state


                  // Check for collision with character's bounding box *before* attraction
                  if (!shouldBeAttracted) { // Only check for initial collision if not already attracted
                      if (
                          characterRight_px > coinX_px &&
                          characterLeft_px < coinX_px + coinSize_px &&
                          characterBottomFromTop_px > coinY_px && // Character bottom edge is below coin top edge
                          characterTopFromTop_px < coinY_px + coinSize_px // Character top edge is above coin bottom edge
                      ) {
                          shouldBeAttracted = true; // Mark coin to be attracted
                      }
                  }


                  if (shouldBeAttracted) {
                      // If attracted, move towards character center
                      const dx = characterCenterX_px - coinX_px;
                      const dy = characterCenterY_px - coinY_px;
                      const distance = Math.sqrt(dx * dx + dy * dy);

                      // Calculate movement step towards the character
                      const moveStep = distance * coin.attractSpeed;

                      // Avoid division by zero if distance is 0
                      const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                      const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;

                      // Update coin position in pixels
                      const newCoinX_px = coinX_px + moveX_px;
                      const newCoinY_px = coinY_px + moveY_px;

                      // Convert updated pixel position back to percentage
                      newX = (newCoinX_px / gameWidth) * 100;
                      newY = (newCoinY_px / gameHeight) * 100;

                       // Check for collection (close proximity to character center)
                       if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.8) { // Collision when centers are close
                           collisionDetected = true;
                           // Grant random coins (1-5)
                           const awardedCoins = Math.floor(Math.random() * 5) + 1;
                           startCoinCountAnimation(awardedCoins);

                           console.log(`Coin collected! Awarded: ${awumedCoins}`);


                           // --- Trigger Coin Collection Effect ---
                           const characterContainer = gameRef.current?.querySelector('.character-container');
                           if (characterContainer) {
                               const charRect = characterContainer.getBoundingClientRect();
                               const gameRect = gameContainer.getBoundingClientRect();
                               setCoinEffectPosition({
                                   top: charRect.top - gameRect.top - 40,
                                   left: charRect.left - gameRect.left + charRect.width / 2
                               });
                               setIsCoinEffectActive(true);

                               if (coinEffectTimerRef.current) {
                                   clearTimeout(coinEffectTimerRef.current);
                               }
                               coinEffectTimerRef.current = setTimeout(() => {
                                   setIsCoinEffectActive(false);
                               }, 800);
                           }
                           // --- END Trigger Coin Collection Effect ---
                       }

                  } else {
                      // If not attracted, move based on initial random speeds
                      newX = coin.x - coin.initialSpeedX; // Move left
                      newY = coin.y + coin.initialSpeedY; // Move down
                  }


                  return {
                      ...coin,
                      x: newX,
                      y: newY,
                      isAttracted: shouldBeAttracted, // Update attraction state
                      collided: collisionDetected // Mark for removal if collected
                  };
              })
              .filter(coin => {
                  // Remove coin if it was collected or moved far off-screen (left or bottom)
                  // Keep coins that are moving towards the character, even if they go slightly off-screen initially
                  const isOffScreen = coin.x < -20 || coin.y > 120; // Use larger buffer for off-screen check
                  return !coin.collided && !isOffScreen; // Keep coin if not collected and not off-screen
              });
      });


    }, 30); // Interval for movement updates (30ms for smoother animation)

    // Cleanup function to clear the interval when the effect dependencies change or component unmounts
    return () => clearInterval(moveInterval);
    // Add isStatsFullscreen to dependency array
  }, [gameStarted, gameOver, jumping, characterPos, obstacleTypes, isStatsFullscreen, coins]); // Added coins to dependency array to ensure startCoinCountAnimation uses the latest value

  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current); // Clear run animation timer (if still active)
      clearInterval(particleTimerRef.current);
      clearInterval(blackFireTimerRef.current); // Clear Black Fire timer
      clearInterval(coinScheduleTimerRef.current); // Clear coin scheduling timer
      clearInterval(coinCountAnimationTimerRef.current); // Clear coin count animation timer
      clearTimeout(coinEffectTimerRef.current); // Clear coin effect timer
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

    // Effect for coin counter animation
  useEffect(() => {
    // This effect now primarily controls the visual 'number-changing' class
    // The startCoinCountAnimation function drives the actual displayedCoins state change
    if (displayedCoins === coins && pendingCoinReward === 0) return; // Only trigger if coins are different or pending reward exists

    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      // Add event listener for animation end to remove the class
      coinElement.addEventListener('animationend', animationEndHandler);

      // Cleanup function to remove the event listener if the component unmounts
      return () => {
        if (coinElement) { // Check if the element still exists
            coinElement.removeEventListener('animationend', animationEndHandler);
            // Ensure the class is removed on unmount or before adding again
             coinElement.classList.remove('number-changing');
        }
      };
    }
     // No cleanup needed if coinElement is not found
     return () => {}; // Return an empty cleanup function
  }, [displayedCoins, coins, pendingCoinReward]); // Dependencies remain the same


  // Calculate health percentage for the bar
  const healthPct = health / MAX_HEALTH;

  // Determine health bar color based on health percentage (from original HealthBar)
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500'; // Green for high health
    if (healthPct > 0.3) return 'bg-yellow-500'; // Yellow for medium health
    return 'bg-red-500'; // Red for low health
  };


  // Render the character with animation and damage effect
  const renderCharacter = () => {
    // Use a container div to position the Lottie animation
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out" // Added class for easier targeting
        style={{
          // Position based on characterPos state relative to new ground
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`,
          left: '10%', // Fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)' // Different transition for jumping
        }}
      >
        {/* DotLottieReact component for the character animation */}
        {/* The Lottie URL provided seems to be a running animation */}
        {/* We'll use loop and autoplay for the running animation */}
        {/* If a jumping animation Lottie was provided, we would conditionally render it */}
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
          loop
          autoplay
          className="w-full h-full" // Make Lottie fill its container
        />

        {/* Damage Effect on Character (Visual pulse/shake) */}
        {/* Apply damage effect as an overlay on the Lottie container */}
        {showCharacterDamageEffect && (
            <div className="absolute inset-0 bg-red-500 opacity-30 rounded-full animate-pulse-fast"></div>
        )}
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleIcon; // Element to render for the obstacle icon
    let iconColor = 'currentColor'; // Default color

    switch(obstacle.type) {
      case 'rock':
        // Use the new RockIcon component
        obstacleIcon = <RockIcon size={40} color="#a3a3a3" />; // Set size and color
        iconColor = '#a3a3a3'; // Gray color for rock
        break;
      case 'cactus':
        // Use the new CactusIcon component
        obstacleIcon = <CactusIcon size={40} color="#16a34a" />; // Set size and color
        iconColor = '#16a34a'; // Green color for cactus
        break;
      default:
        // Default rendering if obstacle type is unknown (maybe a question mark icon?)
        obstacleIcon = <GemIcon size={40} />; // Use GemIcon as a fallback
        iconColor = 'currentColor'; // Default color
    }

    // Calculate obstacle health percentage
    const obstacleHealthPct = obstacle.health / obstacle.maxHealth;

    return (
      <div
        key={obstacle.id} // Unique key for React list rendering
        className="absolute flex flex-col items-center" // Use flex to stack icon and health bar
        style={{
          // ObstacleY is always relative to the new ground level
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          left: `${obstacle.position}%`, // Horizontal position
          transform: 'translate(-50%, 0)' // Center the container horizontally
        }}
      >
        {/* --- NEW: Obstacle Health Bar --- */}
        {/* Position the health bar above the icon */}
        <div className="mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm"> {/* Adjusted size */}
            {/* Inner health bar */}
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
        </div>

        {/* Obstacle Icon Element */}
        {/* Wrap the icon in a div to control size and position */}
        <div className="w-10 h-10 flex items-center justify-center"> {/* Fixed size container for the icon */}
          {obstacleIcon} {/* Render the specific obstacle icon */}
        </div>
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <div
        key={cloud.id} // Unique key
        className="absolute bg-white rounded-full opacity-60" // Base cloud styles
        style={{
          width: `${cloud.size}px`, // Size based on cloud state
          height: `${cloud.size * 0.6}px`, // Aspect ratio
          top: `${cloud.y}%`, // Vertical position (relative to top of game container)
          left: `${cloud.x}%` // Horizontal position
        }}
      >
        {/* Additional cloud shapes for variation */}
        <div
          className="absolute bg-white rounded-full"
          style={{
            width: `${cloud.size * 0.7}px`,
            height: `${cloud.size * 0.7}px`,
            top: `-${cloud.size * 0.1}px`,
            left: `${cloud.size * 0.1}px`
          }}
        ></div>
        <div
          className="absolute bg-white rounded-full"
          style={{
            width: `${cloud.size * 0.8}px`,
            height: `${cloud.size * 0.8}px`,
            top: `-${cloud.size * 0.15}px`,
            left: `${cloud.size * 0.3}px`
          }}
        ></div>
      </div>
    ));
  };

  // Render dust particles
  const renderParticles = () => {
    return particles.map(particle => (
      <div
        key={particle.id} // Unique key
        className={`absolute rounded-full ${particle.color}`} // Base styles and color
        style={{
          width: `${particle.size}px`, // Size based on particle state
          height: `${particle.size}px`,
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, // Vertical position relative to new ground
          left: `calc(10% + ${particle.x}px)`, // Horizontal position relative to character
          opacity: particle.opacity // Opacity for fading effect
        }}
      ></div>
    ));
  };

  // --- Render Black Fire projectiles ---
  const renderBlackFires = () => {
    return activeBlackFires.map(fire => (
      <div
        key={fire.id} // Unique key
        className="absolute w-12 h-12" // Container size for Lottie
        style={{
          top: `${fire.currentY}px`, // Position based on current Y
          left: `${fire.currentX}px`, // Position based on current X
          transform: 'translate(-50%, -50%)', // Center the Lottie container
          pointerEvents: 'none' // Ensure clicks pass through
        }}
      >
        <DotLottieReact
          src="https://lottie.host/af898c1a-d385-4e8f-82c2-5fa9afd0a187/SKboS7lHdj.lottie" // Black Fire Lottie URL
          loop // Loop the animation (optional, depends on Lottie)
          autoplay // Autoplay the animation
          className="w-full h-full" // Make Lottie fill its container
        />
      </div>
    ));
  };

  // --- NEW: Render Coins ---
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id} // Unique key
        className="absolute w-10 h-10" // Container size for Lottie (adjust as needed)
        style={{
          top: `${coin.y}%`, // Position based on current Y (%)
          left: `${coin.x}%`, // Position based on current X (%)
          transform: 'translate(-50%, -50%)', // Center the Lottie container
          pointerEvents: 'none' // Ensure clicks pass through
        }}
      >
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie" // Coin Lottie URL
          loop // Loop the animation
          autoplay // Autoplay the animation
          className="w-full h-full" // Make Lottie fill its container
        />
      </div>
    ));
  };


  // Function to open the chest
  const openChest = () => {
    // Prevent opening chest if stats are in fullscreen, already open, or no chests left
    if (isChestOpen || chestsRemaining <= 0 || isStatsFullscreen) return;
    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      setIsChestOpen(true);
      setShowShine(true);
      setChestsRemaining(prev => prev - 1);
      setTimeout(() => {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        setCurrentCard(randomCard);
        setShowCard(randomCard); // Set showCard to the card object
        let coinReward = 0;
        switch(randomCard.rarity) {
          case "common": coinReward = 10; break;
          case "rare": coinReward = 25; break;
          case "epic": coinReward = 50; break;
          case "legendary": coinReward = 100; break;
        }
        setPendingCoinReward(coinReward);
        if (randomCard.rarity === "legendary" || randomCard.rarity === "epic") {
          setGems(prev => prev + (randomCard.rarity === "legendary" ? 5 : 2));
        }
      }, 1500);
    }, 600);
  };

  // Function to reset the chest state
  const resetChest = () => {
    setIsChestOpen(false);
    setShowCard(null); // Reset showCard to null
    setCurrentCard(null);
    setShowShine(false);
    if (pendingCoinReward > 0) {
        startCoinCountAnimation(pendingCoinReward);
    }
  };

  // REMOVED: Function to toggle stats modal
  // const toggleStatsModal = () => {
  //   // Prevent opening if game over or card is shown
  //   if (gameOver || showCard) return;
  //   setShowStatsModal(!showStatsModal);
  // };

  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    // Prevent opening if game over or card is shown
    if (gameOver || showCard) return;
    setIsStatsFullscreen(!isStatsFullscreen);
  };


  return (
    // Main container for the entire game and UI
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Add Tailwind CSS animations */}
      <style>{`
        @keyframes fadeOutUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -20px); /* Move up slightly */
          }
        }
        .animate-fadeOutUp {
          animation: fadeOutUp 0.5s ease-out forwards; /* Animation duration and easing */
        }
        @keyframes float-card { 0% { transform: translateY(0px) rotate(0deg); filter: brightness(1); } 25% { transform: translateY(-15px) rotate(2deg); filter: brightness(1.2); } 50% { transform: translateY(-20px) rotate(0deg); filter: brightness(1.3); } 75% { transform: translateY(-15px) rotate(-2deg); filter: brightness(1.2); } 100% { transform: translateY(0px) rotate(0deg); filter: brightness(1); } }
        @keyframes chest-shake { 0% { transform: translateX(0) rotate(0deg); } 10% { transform: translateX(-4px) rotate(-3deg); } 20% { transform: translateX(4px) rotate(3deg); } 30% { transform: translateX(-4px) rotate(-3deg); } 40% { transform: translateX(4px) rotate(3deg); } 50% { transform: translateX(-4px) rotate(-2deg); } 60% { transform: translateX(4px) rotate(2deg); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes pulse-fast { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.2); } }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes ray-rotate { 0% { opacity: 0.3; } 50% { opacity: 0.7; } 100% { opacity: 0.3; } }
        @keyframes shine { 0% { transform: translateX(-200px) rotate(45deg); } 100% { transform: translateX(400px) rotate(45deg); } }
        @keyframes gold-particle { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 50% { opacity: 0.7; } 100% { transform: translate( calc(-50% + var(--random-x)), calc(-50% + var(--random-y)) ) scale(0); opacity: 0; } }
        @keyframes lid-open { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-100%) rotate(60deg); } }
        .animate-float-card { animation: float-card 3s ease-in-out infinite; }
        .animate-chest-shake { animation: chest-shake 0.6s ease-in-out; }
        .animate-twinkle { animation: twinkle 5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 1s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 1.5s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-ray-rotate { animation: ray-rotate 2s ease-in-out infinite; }
        .animate-shine { animation: shine 2s linear infinite; }
        .animate-gold-particle { animation: gold-particle 1.5s ease-out forwards; }
        .animate-lid-open { animation: lid-open 0.5s ease-out forwards; }
        .inventory-icon-text { font-size: 0.65rem; margin-top: 0.125rem; }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: #fff; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }

        /* Animations from original HealthBar */
        @keyframes pulse {
          0% { opacity: 0; }
          50% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        @keyframes floatUp {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }
      `}</style>
       <style jsx global>{`
        body {
          overflow: hidden; /* Disable scrolling on the body */
        }
      `}</style>


      {/* Main Game Container */}
      {/* Removed border classes */}
      <div
        ref={gameRef} // Assign ref
        // Apply the passed className prop here
        className={`${className ?? ''} relative w-full h-screen rounded-lg overflow-hidden shadow-2xl`} // Adjusted width and height, removed cursor-pointer here
        onClick={handleTap} // Handle taps/clicks for jumping/starting
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div>

        {/* Sun */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div>

        {/* Clouds */}
        {renderClouds()}

        {/* Ground */}
        {/* Positioned relative to the new GROUND_LEVEL_PERCENT */}
        <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-green-700">
                {/* Ground details (small elements on the ground) */}
                <div className="w-full h-1 bg-green-800 absolute top-0"></div>
                <div className="w-3 h-3 bg-green-800 rounded-full absolute top-6 left-20"></div>
                <div className="w-4 h-2 bg-green-800 rounded-full absolute top-10 left-40"></div>
                <div className="w-6 h-3 bg-green-800 rounded-full absolute top-8 right-10"></div>
                <div className="w-3 h-1 bg-green-800 rounded-full absolute top-12 right-32"></div>
            </div>
        </div>

        {/* Character */}
        {renderCharacter()}

        {/* --- NEW: Coin Collection Effect Lottie --- */}
        {isCoinEffectActive && (
            <div
                className="absolute w-16 h-16 pointer-events-none" // Adjust size as needed
                style={{
                    top: `${coinEffectPosition.top}px`,
                    left: `${coinEffectPosition.left}px`,
                    transform: 'translate(-50%, -50%)', // Center the Lottie
                    zIndex: 50 // Ensure it's above other game elements
                }}
            >
                <DotLottieReact
                    src="https://lottie.host/7e241642-f1f1-459d-87fa-deac99b6ac36/W5RvbVAXk1.lottie" // Lottie URL for the effect
                    loop={false} // Play once
                    autoplay
                    className="w-full h-full"
                />
            </div>
        )}

        {/* Obstacles */}
        {obstacles.map(obstacle => renderObstacle(obstacle))}

        {/* --- NEW: Black Fire Projectiles --- */}
        {renderBlackFires()}

        {/* --- NEW: Coins --- */}
        {renderCoins()}

        {/* Particles */}
        {renderParticles()}

        {/* Header section - Positioned on top of the game */}
        {/* Moved inside the game container */}
        {/* Changed background to black with opacity */}
        <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30"> {/* Increased z-index, reduced padding, added opacity */}
          {/* Health Bar and Icon */}
          <div className="flex items-center">
              {/* ICON TRÒN - Round Icon */}
              {/* Added onClick handler and cursor-pointer */}
              <div
                className="relative mr-2 cursor-pointer"
                // MODIFIED: Call toggleStatsFullscreen instead of toggleStatsModal
                onClick={toggleStatsFullscreen}
                title="Xem chỉ số nhân vật" // Tooltip
              >
                  <div className="w-8 h-8 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full flex items-center justify-center border-2 border-gray-800 overflow-hidden shadow-lg hover:scale-110 transition-transform"> {/* Reduced size, added hover effect */}
                      {/* Overlay for subtle effect */}
                      <div className="absolute inset-0 bg-black bg-opacity-10 rounded-full" />
                      {/* Inner icon elements */}
                      <div className="relative z-10 flex items-center justify-center">
                          <div className="flex items-end">
                              <div className="w-1 h-2 bg-white rounded-sm mr-0.5" /> {/* Reduced size */}
                              <div className="w-1 h-3 bg-white rounded-sm mr-0.5" /> {/* Reduced size */}
                              <div className="w-1 h-1.5 bg-white rounded-sm" /> {/* Reduced size */}
                          </div>
                      </div>
                      {/* Highlight effect */}
                      <div className="absolute top-0 left-0 right-0 h-1/3 bg-white bg-opacity-30 rounded-t-full" />
                  </div>
              </div>

              {/* THANH MÁU - Health Bar */}
              <div className="w-32 relative"> {/* Reduced width */}
                  <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner"> {/* Reduced height */}
                      {/* Inner bar animated with scaleX */}
                      <div className="h-full overflow-hidden">
                          <div
                              className={`${getColor()} h-full transform origin-left`}
                              style={{
                                  transform: `scaleX(${healthPct})`, // Scale the bar based on health percentage
                                  transition: 'transform 0.5s ease-out', // Smooth transition for health changes
                              }}
                          >
                              {/* Inner highlight */}
                              <div className="w-full h-1/2 bg-white bg-opacity-20" />
                          </div>
                      </div>

                      {/* Fixed full-width light overlay (keeping this pulse effect for visual flair) */}
                      <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                          style={{ animation: 'pulse 3s infinite' }} // Apply pulse animation
                      />

                      {/* Health text display */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                              {Math.round(health)}/{MAX_HEALTH} {/* Display current/max health */}
                          </span>
                      </div>
                  </div>

                  {/* Floating damage number */}
                  <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none"> {/* Adjusted top and height */}
                      {showDamageNumber && ( // Only show if showDamageNumber is true
                          <div
                              className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs" // Reduced text size
                              style={{ animation: 'floatUp 0.8s ease-out forwards' }} // Apply float up animation
                          >
                              -{damageAmount} {/* Display the damage amount */}
                          </div>
                      )}
                  </div>
              </div>
          </div>
          {/* Currency display */}
          <div className="flex items-center space-x-1 currency-display-container relative"> {/* Reduced space-x */}
            {/* Gems Container */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-800 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"> {/* Reduced padding */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
              <div className="relative mr-0.5"> {/* Reduced margin-right */}
                <div className="w-3 h-3 bg-gradient-to-br from-purple-300 to-purple-600 transform rotate-45 border-2 border-purple-700 shadow-md relative z-10 flex items-center justify-center"> {/* Reduced size */}
                  <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white/50 rounded-sm"></div>
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-purple-800/50 rounded-br-lg"></div>
                </div>
                <div className="absolute top-1 left-0.5 w-0.5 h-0.5 bg-purple-200/80 rotate-45 animate-pulse-fast z-20"></div>
              </div>
              <div className="font-bold text-purple-100 text-xs tracking-wide">{gems}</div> {/* Text size remains xs */}
               {/* Plus button for Gems - Functionality can be added later */}
              <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"> {/* Reduced size and margin */}
                <span className="text-white font-bold text-xs">+</span> {/* Text size remains xs */}
              </div>
              <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
              <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
            </div>
            {/* Coins Container */}
            <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"> {/* Reduced padding */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
              <div className="relative mr-0.5 flex"> {/* Reduced margin-right */}
                <div className="w-3 h-3 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-2 border-amber-600 shadow-md relative z-20 flex items-center justify-center"> {/* Reduced size */}
                  <div className="absolute inset-0.5 bg-yellow-200 rounded-full opacity-60"></div>
                  <span className="text-amber-800 font-bold text-xs">$</span> {/* Text size remains xs */}
                </div>
                <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-2 border-amber-700 shadow-md absolute -left-0.5 top-0.5 z-10"></div> {/* Reduced size and adjusted position */}
              </div>
              <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter"> {/* Text size remains xs */}
                {displayedCoins.toLocaleString()}
              </div>
              {/* Plus button for Coins - Functionality can be added later */}
              <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"> {/* Reduced size and margin */}
                <span className="text-white font-bold text-xs">+</span> {/* Text size remains xs */}
              </div>
              <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
              <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
            </div>
          </div>
        </div>


        {/* Game over screen (shown when game is over) */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40"> {/* Increased z-index */}
            <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
              onClick={startGame} // Restart game on click
            >
              Chơi Lại
            </button>
          </div>
        )}

        {/* NEW: Full-screen Stats Display */}
        {isStatsFullscreen && (
            // Use absolute inset-0 to cover the whole game container
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 backdrop-blur-sm p-4">
                {/* Wrap CharacterCard in ErrorBoundary */}
                <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
                    {/* Pass a prop to CharacterCard to handle closing */}
                    <CharacterCard onClose={toggleStatsFullscreen} />
                </ErrorBoundary>
            </div>
        )}


      </div>

      {/* Left UI section - Positioned on top of the game */}
      {/* HIDE UI sections when stats are in fullscreen */}
      {!isStatsFullscreen && (
        <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30"> {/* Increased z-index */}
          {[
            // Shop Icon
            {
              icon: (
                <div className="relative">
                  <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                    <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                </div>
              ),
              label: "Shop",
              notification: true,
              special: true,
              centered: true
            },
            // Inventory icon
            {
              icon: (
                <div className="relative">
                  <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600">
                    <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                    <div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center">
                      <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                </div>
              ),
              label: "Inventory",
              notification: true,
              special: true,
              centered: true
            }
          ].map((item, index) => (
            <div key={index} className="group cursor-pointer"> {/* Added cursor-pointer */}
              {item.special && item.centered ? (
                <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                  {item.icon}
                  {item.label && (
                    <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                  )}
                </div>
              ) : (
                <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 relative shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 flex flex-col items-center justify-center`}>
                  {item.icon}
                  {item.label && (
                    <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Right UI section - Positioned on top of the game */}
       {/* HIDE UI sections when stats are in fullscreen */}
      {!isStatsFullscreen && (
        // MODIFIED: Added Black Fire skill element here, above the Mission icon
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30"> {/* Increased z-index */}

          {/* --- NEW: Black Fire Skill UI Element (Moved) --- */}
          {/* Positioned within the right-side flex column */}
          <div
            className={`w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-lg shadow-lg border-2 border-gray-600 flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 ${blackFireCount <= 0 || !gameStarted || gameOver || showCard ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
            onClick={activateBlackFire} // Call activateBlackFire on click
            title={blackFireCount > 0 ? `Quả cầu lửa đen (${blackFireCount} còn lại)` : "Hết Quả cầu lửa đen"}
            aria-label="Sử dụng Quả cầu lửa đen"
            role="button"
            tabIndex={blackFireCount > 0 && gameStarted && !gameOver && !showCard && !isStatsFullscreen ? 0 : -1} // Make focusable only when usable
          >
            {/* Black Fire Icon (Lottie) */}
            <div className="w-10 h-10">
               <DotLottieReact
                  src="https://lottie.host/af898c1a-d385-4e8f-82c2-5fa9afd0a187/SKboS7lHdj.lottie"
                  loop
                  autoplay
                  className="w-full h-full"
               />
            </div>
            {/* Count of remaining uses */}
            <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold border border-blue-400 shadow-sm">
              {blackFireCount}
            </div>
          </div>


          {[
            // Mission icon (Now below Black Fire skill)
            {
              icon: (
                <div className="relative">
                  <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600">
                    <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                    <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center">
                      <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div>
                      <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div>
                      <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                </div>
              ),
              label: "Mission",
              notification: true,
              special: true,
              centered: true
            },
            // Blacksmith icon
            {
              icon: (
                <div className="relative">
                  <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600">
                    <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                    <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center">
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div>
                      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div>
                      <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div>
                      <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div>
                      <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div>
                      <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                </div>
              ),
              label: "Blacksmith",
              notification: true,
              special: true,
              centered: true
            },
          ].map((item, index) => (
            <div key={index} className="group cursor-pointer"> {/* Added cursor-pointer */}
              {item.special && item.centered ? (
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                      {item.icon}
                      {item.label && (
                          <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                      )}
                  </div>
              ) : (
                <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                  {item.icon}
                  <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {/* Treasure chest and remaining chests count - Positioned on top of the game */}
      {/* HIDE chest when stats are in fullscreen */}
      {!isStatsFullscreen && (
        <div className="absolute bottom-32 flex flex-col items-center justify-center w-full z-20"> {/* Adjusted z-index */}
          <div
            className={`cursor-pointer transition-all duration-300 relative ${isChestOpen ? 'scale-110' : ''} ${chestShake ? 'animate-chest-shake' : ''}`}
            // Disable click if stats are in fullscreen, already open, or no chests left
            onClick={!isChestOpen && chestsRemaining > 0 && !isStatsFullscreen ? openChest : null}
            aria-label={chestsRemaining > 0 ? "Mở rương báu" : "Hết rương"}
            role="button"
            tabIndex={chestsRemaining > 0 ? 0 : -1}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Chest main body */}
              <div className="flex flex-col items-center">
                {/* Chest top part */}
                <div className="bg-gradient-to-b from-amber-700 to-amber-900 w-32 h-24 rounded-t-xl relative shadow-2xl shadow-amber-950/70 overflow-hidden z-10 border-2 border-amber-600">
                  {/* Decorations */}
                  <div className="absolute inset-x-0 top-0 h-full">
                    <div className="absolute left-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                    <div className="absolute right-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                  </div>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-br border-b border-r border-yellow-600"></div>
                  <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-bl from-yellow-300 to-yellow-500 rounded-bl border-b border-l border-yellow-600"></div>
                  <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-tr border-t border-r border-yellow-600"></div>
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>

                  {/* Chest closed view */}
                  <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-gradient-to-b from-amber-600 to-amber-800 h-7 w-full absolute top-0 rounded-t-xl flex justify-center items-center overflow-hidden border-b-2 border-amber-500/80">
                      <div className="relative">
                        <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/50">
                          <div className="w-2 h-2 bg-yellow-100 rounded-full animate-pulse-subtle"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center h-full pt-7 pb-4">
                      <div className="bg-gradient-to-b from-amber-600 to-amber-800 w-16 h-14 rounded-lg flex justify-center items-center border-2 border-amber-500/80 relative shadow-inner shadow-amber-950/50">
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 w-full bg-gradient-to-r from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 w-7 h-7 rounded-md shadow-inner shadow-yellow-100/50 relative overflow-hidden transform rotate-45">
                          <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/50 rounded-full"></div>
                          <div className="absolute bottom-0 right-0 bg-yellow-600/40 w-full h-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chest open state */}
                  <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-gradient-to-b from-amber-700 to-amber-900 h-10 w-full absolute top-0 rounded-t-xl transform origin-bottom animate-lid-open flex justify-center items-center overflow-hidden border-2 border-amber-600">
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-600/50 to-amber-800/50 flex justify-center items-center">
                        <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                      </div>
                      <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-tr border-t border-r border-yellow-600"></div>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>
                    </div>
                    {showShine && (
                      <div className="absolute inset-0 top-0 flex justify-center items-center overflow-hidden">
                        <div className="w-40 h-40 bg-gradient-to-b from-yellow-100 to-transparent rounded-full animate-pulse-fast opacity-60"></div>
                        {[...Array(16)].map((_, i) => (
                          <div key={`ray-${i}`} className="absolute w-1.5 h-32 bg-gradient-to-t from-yellow-100/0 via-yellow-100/80 to-yellow-100/0 opacity-80 animate-ray-rotate" style={{ transform: `rotate(${i * 22.5}deg)`, transformOrigin: 'center' }}></div>
                        ))}
                        {[...Array(20)].map((_, i) => (
                          <div key={`particle-${i}`} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-gold-particle" style={{ left: '50%', top: '50%', animationDelay: `${i * 0.05}s`, '--random-x': `${Math.random() * 200 - 100}px`, '--random-y': `${Math.random() * 200 - 100}px` }}></div>
                        ))}
                      </div>
                    )}
                    {showCard ? (
                      <div className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative z-10 ${currentCard?.background}`}>
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                          <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
                        </div>
                        <div className="text-6xl mb-2" style={{ color: currentCard.color }}>{currentCard?.icon}</div>
                        <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
                        <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>
                        <div className="flex mt-3">
                          {[...Array(currentCard.rarity === "legendary" ? 5 : currentCard.rarity === "epic" ? 4 : currentCard.rarity === "rare" ? 3 : 2)].map((_, i) => (
                            <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" color="currentColor"/>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="animate-bounce w-10 h-10 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 relative z-10">
                        <div className="absolute inset-1 bg-gradient-to-br from-white/80 to-transparent rounded-full"></div>
                      </div>
                    )}
                    </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-500 to-amber-700 border-t-2 border-amber-600/80 flex items-center justify-center">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  </div>
                </div>
                {/* Chest base */}
                <div className="flex flex-col items-center relative -mt-1 z-0"></div>
              </div>
            </div>

            {/* Display remaining chests count */}
            <div className="mt-4 flex flex-col items-center">
              <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
                {chestsRemaining > 0 && (<div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>)}
                <div className="flex items-center">
                  <span className="text-amber-200 font-bold text-xs">{chestsRemaining}</span>
                  <span className="text-amber-400/80 text-xs">/{3}</span>
                </div>
                {chestsRemaining > 0 && (<div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>)}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Card info popup - Positioned on top of everything */}
      {showCard && currentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"> {/* Increased z-index */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700 relative">
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>
            <div className="text-xl font-bold text-white mb-6">Bạn nhận được</div>
            <div className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative ${currentCard.background}`}>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
              </div>
              <div className="text-6xl mb-2" style={{ color: currentCard.color }}>{currentCard?.icon}</div>
              <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
              <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>
              <div className="flex mt-3">
                {[...Array(currentCard.rarity === "legendary" ? 5 : currentCard.rarity === "epic" ? 4 : currentCard.rarity === "rare" ? 3 : 2)].map((_, i) => (
                  <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" color="currentColor"/>
                ))}
              </div>
            </div>
            <button onClick={resetChest} className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-8 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105">
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* REMOVED: Stats Modal structure */}
      {/* {showStatsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="relative max-w-lg w-full">
                  <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
                      <CharacterCard />
                  </ErrorBoundary>
                  <button
                      onClick={toggleStatsModal}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-[51]"
                      aria-label="Đóng cửa sổ chỉ số"
                  >
                      <XIcon size={20} />
                  </button>
              </div>
          </div>
      )} */}

    </div>
  );
}


