import React, { useState, useEffect, useRef, Component } from 'react';
import CharacterCard from './stats/stats-main.tsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import TreasureChest from './treasure.tsx'; // Ensure this path is correct

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

const GemIcon = ({ size = 24, className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/tourmaline.png"
      alt="Tourmaline Gem Icon"
      className="w-full h-full object-contain"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = `https://placehold.co/${size}x${size}/8a2be2/ffffff?text=Gem`;
      }}
    />
  </div>
);

// NEW: Key Icon for displaying on enemies
const KeyIconDisplay = ({ size = 16, className = '' }) => (
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
      alt="Key Icon"
      className={className}
      style={{ width: size, height: size }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = `https://placehold.co/${size}x${size}/FBBF24/000000?text=K`; // Placeholder
      }}
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
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          <p>Có lỗi xảy ra.</p>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Helper Function ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;


// Define interface for component props
interface ObstacleRunnerGameProps {
  className?: string;
}

// Define interface for Obstacle with health and key
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
  hasKey?: boolean; // NEW: Indicates if the obstacle carries a key
  keyAwarded?: boolean; // NEW: To prevent awarding the same key multiple times
  collided?: boolean; // To mark if collision occurred, for filtering
}

interface GameCoin {
  id: number;
  x: number;
  y: number;
  initialSpeedX: number;
  initialSpeedY: number;
  attractSpeed: number;
  isAttracted: boolean;
  collided?: boolean; // To mark if collected
}

interface GameCloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  imgSrc: string;
}


export default function ObstacleRunnerGame({ className }: ObstacleRunnerGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const MAX_HEALTH = 3000;
  const [health, setHealth] = useState(MAX_HEALTH);
  const [jumping, setJumping] = useState(false);
  const [characterPos, setCharacterPos] = useState(0);
  const [obstacles, setObstacles] = useState<GameObstacle[]>([]);
  const [isRunning, setIsRunning] = useState(false); // Not directly used for Lottie, but kept for state
  const [particles, setParticles] = useState<any[]>([]);
  const [clouds, setClouds] = useState<GameCloud[]>([]);
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  const SHIELD_MAX_HEALTH = 2000;
  const SHIELD_COOLDOWN_TIME = 200000; // 200 seconds
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldHealth, setShieldHealth] = useState(SHIELD_MAX_HEALTH);
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  const [coins, setCoins] = useState(357);
  const [displayedCoins, setDisplayedCoins] = useState(357);
  const [activeCoins, setActiveCoins] = useState<GameCoin[]>([]);
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gems, setGems] = useState(42);
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);

  // NEW: Key System States
  const [keysCollected, setKeysCollected] = useState<number>(0); // Player's key count
  const [enemySpawnCountSinceLastKey, setEnemySpawnCountSinceLastKey] = useState<number>(0);
  // Determine when the next key-bearing enemy will spawn (between 5 and 10 enemies)
  const [nextKeySpawnThreshold, setNextKeySpawnThreshold] = useState<number>(getRandomInt(5, 10));


  const GROUND_LEVEL_PERCENT = 45;

  const gameRef = useRef<HTMLDivElement | null>(null);
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Kept for consistency, though Lottie handles its own animation
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shieldCooldownStartTimeRef = useRef<number | null>(null);
  const pausedShieldCooldownRemainingRef = useRef<number | null>(null);


  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey' | 'keyAwarded' | 'collided'>[] = [
    {
      type: 'lottie-obstacle-1',
      height: 16, width: 16, color: 'transparent',
      baseHealth: 500, damage: 100,
      lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie"
    },
    {
      type: 'lottie-obstacle-2',
      height: 20, width: 20, color: 'transparent',
      baseHealth: 700, damage: 150,
      lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie"
    },
  ];

  const cloudImageUrls = [
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];

  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins; // Use the 'coins' state directly
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30); // Animation speed
      if (step === 0 && reward > 0) step = 1; // Ensure step is at least 1 if reward is positive
      let current = oldCoins;

      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              setCoins(newCoins); // Final update to actual coins
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null;
          } else {
              setDisplayedCoins(current);
          }
      }, 50); // Interval duration
      coinCountAnimationTimerRef.current = countInterval;
  };

  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      // console.log(`Received ${amount} gems from chest.`);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setObstacles([]);
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
    setCoins(357); // Reset coins
    setDisplayedCoins(357); // Reset displayed coins
    setGems(42); // Reset gems

    // NEW: Reset Key System States
    setKeysCollected(0);
    setEnemySpawnCountSinceLastKey(0);
    setNextKeySpawnThreshold(getRandomInt(5, 10));


    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        initialObstacles.push({
          id: Date.now(), position: 120,
          ...firstObstacleType,
          health: firstObstacleType.baseHealth, maxHealth: firstObstacleType.baseHealth,
          hasKey: false, keyAwarded: false // Explicitly set key properties
        });
        for (let i = 1; i < 3; i++) { // Fewer initial obstacles
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          initialObstacles.push({
            id: Date.now() + i, position: 150 + (i * 60), // Increased spacing
            ...obstacleType,
            health: obstacleType.baseHealth, maxHealth: obstacleType.baseHealth,
            hasKey: false, keyAwarded: false
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
    startGame(); // Auto-start game on mount
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
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
    const newParticlesArray: any[] = []; // Explicitly type if possible, using any for brevity
    for (let i = 0; i < 2; i++) {
      newParticlesArray.push({
        id: Date.now() + Math.random(), // More unique ID
        x: 5 + Math.random() * 5, y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1, size: Math.random() * 3 + 2, // Particle size
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticlesArray]);
  };

  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen) {
        if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        obstacleTimerRef.current = null;
        return;
    }

    const randomTime = getRandomInt(3000, 7000); // Adjusted spawn time
    if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current); // Clear previous before setting new
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = getRandomInt(1, 2); // Fewer obstacles per group
      const newObstaclesGroup: GameObstacle[] = [];
      let keyAssignedInGroup = false; // Ensure only one key per group if multiple obstacles spawn

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (getRandomInt(20, 40)); // Spacing between grouped obstacles
            let currentEnemyHasKey = false;

            // NEW: Key spawning logic
            const currentTotalSpawns = enemySpawnCountSinceLastKey + i + 1;
            if (!keyAssignedInGroup && currentTotalSpawns >= nextKeySpawnThreshold) {
                currentEnemyHasKey = true;
                keyAssignedInGroup = true; // Mark that a key has been assigned in this spawn group
                setEnemySpawnCountSinceLastKey(0); // Reset counter for this group
                setNextKeySpawnThreshold(getRandomInt(5, 10)); // Set threshold for the next key
            }

            newObstaclesGroup.push({
              id: Date.now() + i + Math.random(), // More unique ID
              position: 100 + spacing,
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: currentEnemyHasKey, // Assign key status
              keyAwarded: false
            });
          }
          // Update the spawn count after processing the group
          setEnemySpawnCountSinceLastKey(prev => prev + obstacleCount);
          // If a key was assigned in this group, the main counter was reset above.
          // If no key was assigned, the counter just increments.
          // This logic might need slight adjustment if a key is not assigned in a group
          // when the threshold is met due to multiple obstacles in a group.
          // Simpler: increment global spawn counter, then check.

          // Revised key assignment logic for clarity:
          // Increment global spawn counter first
          let tempSpawnCount = enemySpawnCountSinceLastKey;
          let tempNextKeyThreshold = nextKeySpawnThreshold;
          const finalNewObstacles: GameObstacle[] = [];

          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (getRandomInt(20, 40));
            let currentEnemyHasKey = false;
            tempSpawnCount++;

            if (!keyAssignedInGroup && tempSpawnCount >= tempNextKeyThreshold) {
                currentEnemyHasKey = true;
                keyAssignedInGroup = true;
                tempSpawnCount = 0; // Reset counter for next threshold
                tempNextKeyThreshold = getRandomInt(5,10);
            }
            finalNewObstacles.push({
                id: Date.now() + i + Math.random(),
                position: 100 + spacing,
                ...randomObstacleType,
                health: randomObstacleType.baseHealth,
                maxHealth: randomObstacleType.baseHealth,
                hasKey: currentEnemyHasKey,
                keyAwarded: false
            });
          }
          setEnemySpawnCountSinceLastKey(tempSpawnCount);
          setNextKeySpawnThreshold(tempNextKeyThreshold);
          setObstacles(prev => [...prev, ...finalNewObstacles]);
      }
      scheduleNextObstacle();
    }, randomTime);
  };


  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen) {
        if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
        coinScheduleTimerRef.current = null;
        return;
    }
    const randomTime = getRandomInt(1000, 5000);
    if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
    coinScheduleTimerRef.current = setTimeout(() => {
      const newCoin: GameCoin = {
        id: Date.now() + Math.random(),
        x: 110, y: Math.random() * 60,
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
      setCharacterPos(80);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen) {
          setCharacterPos(0);
          setTimeout(() => setJumping(false), 100);
        } else {
             setCharacterPos(0); setJumping(false);
        }
      }, 600);
    }
  };

  const handleTap = () => {
    if (isStatsFullscreen) return;
    if (!gameStarted || gameOver) {
      startGame();
    } else {
      jump(); // Allow jump if game is running
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
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen) return;
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


  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen) {
        if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
        gameLoopIntervalRef.current = null;
        if (particleTimerRef.current) clearInterval(particleTimerRef.current);
        particleTimerRef.current = null;
        return;
    }

    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5;
            const gameContainer = gameRef.current;
            if (!gameContainer) return;

            const gameWidth = gameContainer.offsetWidth;
            const gameHeight = gameContainer.offsetHeight;
            const characterWidth_px = 60; // Approx w-24 (96px / 1.6 for scaling)
            const characterHeight_px = 60; // Approx h-24
            const characterXPercent = 5;
            const characterX_px = (characterXPercent / 100) * gameWidth;
            const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
            const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
            const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
            const characterLeft_px = characterX_px;
            const characterRight_px = characterX_px + characterWidth_px;
            const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
            const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;

            // Move obstacles and handle collisions
            setObstacles(prevObstacles => {
                let newKeysAwardedThisTick = 0;
                const updatedObstaclesList = prevObstacles.map(obstacle => {
                    let newPosition = obstacle.position - speed;
                    let collisionDetectedThisObstacle = false;
                    const obstacleWidth_px = (obstacle.width / 4) * 16;
                    const obstacleHeight_px = (obstacle.height / 4) * 16;
                    const obstacleX_px = (newPosition / 100) * gameWidth;
                    const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                    const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;

                    if (
                        characterRight_px > obstacleX_px &&
                        characterLeft_px < obstacleX_px + obstacleWidth_px &&
                        characterBottomFromTop_px > obstacleTopFromTop_px &&
                        characterTopFromTop_px < obstacleBottomFromTop_px
                    ) {
                        collisionDetectedThisObstacle = true;
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

                        // NEW: Award key if enemy defeated by collision
                        if (obstacle.hasKey && !obstacle.keyAwarded) {
                            newKeysAwardedThisTick++;
                            return { ...obstacle, position: newPosition, health: 0, collided: true, keyAwarded: true }; // Mark as awarded
                        }
                         return { ...obstacle, position: newPosition, health: 0, collided: true }; // Mark as collided, effectively "defeated"
                    }
                     // If obstacle health is reduced by other means (not implemented here, but for future)
                    // if (obstacle.health <= 0 && obstacle.hasKey && !obstacle.keyAwarded) {
                    // newKeysAwardedThisTick++;
                    // return { ...obstacle, position: newPosition, collided: obstacle.collided, keyAwarded: true };
                    // }


                    if (newPosition < -20 && !collisionDetectedThisObstacle) {
                        if (obstacleTypes.length > 0 && Math.random() < 0.7) { // Reuse
                            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                            return {
                                ...obstacle, ...randomObstacleType,
                                id: Date.now() + Math.random(), position: 120 + getRandomInt(0,20),
                                health: randomObstacleType.baseHealth, maxHealth: randomObstacleType.baseHealth,
                                hasKey: false, keyAwarded: false, collided: false // Reset for reuse
                            };
                        }
                        return { ...obstacle, position: newPosition, collided: collisionDetectedThisObstacle }; // Let it go off-screen
                    }
                    return { ...obstacle, position: newPosition, collided: collisionDetectedThisObstacle };
                });

                if (newKeysAwardedThisTick > 0) {
                    setKeysCollected(prevKeys => prevKeys + newKeysAwardedThisTick);
                }

                return updatedObstaclesList.filter(
                    obs => (!obs.collided || (obs.hasKey && obs.keyAwarded)) && obs.position > -20 && obs.health > 0
                );
            });

            // Move clouds
            setClouds(prevClouds => prevClouds.map(cloud => {
                const newX = cloud.x - cloud.speed;
                if (newX < -50) {
                    const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                    return {
                        ...cloud, id: Date.now() + Math.random(),
                        x: 120 + Math.random() * 30, y: Math.random() * 40 + 10,
                        size: Math.random() * 40 + 30, speed: Math.random() * 0.3 + 0.15,
                        imgSrc: randomImgSrc
                    };
                }
                return { ...cloud, x: newX };
            }));

            // Update particles
            setParticles(prevParticles => prevParticles.map(p => ({
                ...p, x: p.x + p.xVelocity, y: p.y + p.yVelocity,
                opacity: p.opacity - 0.03, size: p.size - 0.1
            })).filter(p => p.opacity > 0 && p.size > 0));

            // Move coins
            setActiveCoins(prevCoins => {
                let coinsCollectedThisTick = 0;
                const updatedCoins = prevCoins.map(coin => {
                    const coinSize_px = 30; // Approx
                    const coinX_px = (coin.x / 100) * gameWidth;
                    const coinY_px = (coin.y / 100) * gameHeight;
                    let newX = coin.x, newY = coin.y;
                    let collectedThisCoin = false;
                    let shouldBeAttracted = coin.isAttracted;

                    if (!shouldBeAttracted) {
                        if (
                            characterRight_px > coinX_px && characterLeft_px < coinX_px + coinSize_px &&
                            characterBottomFromTop_px > coinY_px && characterTopFromTop_px < coinY_px + coinSize_px
                        ) shouldBeAttracted = true;
                    }

                    if (shouldBeAttracted) {
                        const dx = characterCenterX_px - coinX_px;
                        const dy = characterCenterY_px - coinY_px;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        const moveStep = distance * coin.attractSpeed;
                        const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                        const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;
                        newX = ((coinX_px + moveX_px) / gameWidth) * 100;
                        newY = ((coinY_px + moveY_px) / gameHeight) * 100;

                        if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.7) {
                            collectedThisCoin = true;
                            coinsCollectedThisTick += getRandomInt(1, 5);
                        }
                    } else {
                        newX = coin.x - coin.initialSpeedX;
                        newY = coin.y + coin.initialSpeedY;
                    }
                    return { ...coin, x: newX, y: newY, isAttracted: shouldBeAttracted, collided: collectedThisCoin };
                }).filter(c => !c.collided && c.x > -20 && c.y < 120);

                if (coinsCollectedThisTick > 0) startCoinCountAnimation(coinsCollectedThisTick);
                return updatedCoins;
            });

        }, 30); // Game loop interval
    }

    return () => { // Cleanup
        if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
        gameLoopIntervalRef.current = null;
        if (particleTimerRef.current) clearInterval(particleTimerRef.current);
        particleTimerRef.current = null;
    };
  }, [gameStarted, gameOver, jumping, characterPos, isStatsFullscreen, coins, isShieldActive, health, shieldHealth, obstacleTypes, nextKeySpawnThreshold, enemySpawnCountSinceLastKey]); // Added key states to dependencies


  useEffect(() => { // Timer management based on game state
      if (gameOver || isStatsFullscreen) {
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          obstacleTimerRef.current = null;
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          coinScheduleTimerRef.current = null;
      } else if (gameStarted && !gameOver && !isStatsFullscreen) {
          if (!obstacleTimerRef.current) scheduleNextObstacle();
          if (!coinScheduleTimerRef.current) scheduleNextCoin();
          if (!particleTimerRef.current) particleTimerRef.current = setInterval(generateParticles, 300);
      }
      return () => { // Cleanup timers
          if (obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
          if (coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
          if (particleTimerRef.current) clearInterval(particleTimerRef.current);
      };
  }, [gameStarted, gameOver, isStatsFullscreen]);


  useEffect(() => { // Shield cooldown display and pause/resume logic
    let countdownInterval: NodeJS.Timeout | null = null;
    if (isStatsFullscreen) { // Pause
        if (shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
            const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
            const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
            pausedShieldCooldownRemainingRef.current = remainingTimeMs;
            clearTimeout(shieldCooldownTimerRef.current);
            shieldCooldownTimerRef.current = null;
        }
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        cooldownCountdownTimerRef.current = null;

    } else if (isShieldOnCooldown && !gameOver) { // Resume
        if (pausedShieldCooldownRemainingRef.current !== null) {
            const remainingTimeToResume = pausedShieldCooldownRemainingRef.current;
            shieldCooldownTimerRef.current = setTimeout(() => {
                setIsShieldOnCooldown(false); setRemainingCooldown(0);
                shieldCooldownStartTimeRef.current = null;
                pausedShieldCooldownRemainingRef.current = null;
            }, remainingTimeToResume);
            shieldCooldownStartTimeRef.current = Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume);
            pausedShieldCooldownRemainingRef.current = null;
        } else if (!shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
            // Cooldown might have finished while paused or needs restart
            const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
            const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
            if (remainingTimeMs > 0) {
                 shieldCooldownTimerRef.current = setTimeout(() => {
                    setIsShieldOnCooldown(false); setRemainingCooldown(0);
                    shieldCooldownStartTimeRef.current = null;
                 }, remainingTimeMs);
            } else {
                setIsShieldOnCooldown(false); setRemainingCooldown(0);
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
                        cooldownCountdownTimerRef.current = null; return;
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
    return () => { if (countdownInterval) clearInterval(countdownInterval); };
  }, [isShieldOnCooldown, gameOver, isStatsFullscreen]);


  useEffect(() => { // Component unmount cleanup
    return () => {
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;
      if(coinScheduleTimerRef.current) clearTimeout(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    };
  }, []);

  useEffect(() => { // Coin counter visual animation
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


  const healthPct = health / MAX_HEALTH;
  const shieldHealthPct = isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;
  const getHealthBarColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderCharacter = () => (
    <div
      className="character-container absolute w-24 h-24"
      style={{
        bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`, left: '5%',
        transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
      }}
    >
      <DotLottieReact
        src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie"
        loop autoplay={!isStatsFullscreen && gameStarted && !gameOver} className="w-full h-full"
      />
    </div>
  );

  const renderObstacle = (obstacle: GameObstacle) => {
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;
    const obstacleHealthPct = obstacle.maxHealth > 0 ? obstacle.health / obstacle.maxHealth : 0;
    const healthBarHeight = 8; // h-2 in px
    const healthBarMargin = 2; // mb-0.5 in px approx

    let obstacleEl;
    if (obstacle.lottieSrc) {
        obstacleEl = (
            <div style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}>
            <DotLottieReact src={obstacle.lottieSrc} loop autoplay={!isStatsFullscreen && gameStarted && !gameOver} className="w-full h-full" />
            </div>
        );
    } else { // Fallback for non-Lottie if any
        obstacleEl = <div className={`w-${obstacle.width} h-${obstacle.height} ${obstacle.color} rounded-lg`}></div>;
    }

    return (
      <div key={obstacle.id} className="absolute" style={{ bottom: `${GROUND_LEVEL_PERCENT}%`, left: `${obstacle.position}%` }}>
        {obstacleEl}
        {/* Health Bar */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-0.5 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>
        </div>
        {/* NEW: Key Icon above health bar if obstacle has key */}
        {obstacle.hasKey && !obstacle.keyAwarded && (
            <div
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{ bottom: `calc(100% + ${healthBarHeight + healthBarMargin}px + 2px)` }} // Position above health bar + a little more margin
            >
                <KeyIconDisplay size={12} />
            </div>
        )}
      </div>
    );
  };

  const renderClouds = () => clouds.map(cloud => (
    <img key={cloud.id} src={cloud.imgSrc} alt="Cloud" className="absolute object-contain"
      style={{ width: `${cloud.size}px`, height: `${cloud.size * 0.6}px`, top: `${cloud.y}%`, left: `${cloud.x}%`, opacity: 0.8 }}
      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x24/ffffff/000000?text=Cloud"; }}
    />
  ));

  const renderParticles = () => particles.map(p => (
    <div key={p.id} className={`absolute rounded-full ${p.color}`}
      style={{ width: `${p.size}px`, height: `${p.size}px`, bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${p.y}px)`, left: `calc(5% + ${p.x}px)`, opacity: p.opacity }}
    ></div>
  ));

  const renderShield = () => {
    if (!isShieldActive) return null;
    const shieldSizePx = 80;
    return (
      <div key="character-shield" className="absolute w-20 h-20 flex flex-col items-center justify-center pointer-events-none z-20"
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 96px)`, left: '13%',
          transform: 'translate(-50%, -50%)', transition: 'bottom 0.3s ease-out, left 0.3s ease-out',
          width: `${shieldSizePx}px`, height: `${shieldSizePx}px`,
        }}
      >
        {shieldHealth > 0 && (
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transition-transform duration-200 ease-linear`}
                    style={{ width: `${shieldHealthPct * 100}%` }}
                ></div>
            </div>
        )}
        <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive && !isStatsFullscreen} className="w-full h-full" />
      </div>
    );
  };

  const renderCoins = () => activeCoins.map(coin => (
    <div key={coin.id} className="absolute w-10 h-10"
      style={{ top: `${coin.y}%`, left: `${coin.x}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
    >
      <DotLottieReact src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie" loop autoplay={!isStatsFullscreen && gameStarted && !gameOver} className="w-full h-full" />
    </div>
  ));

  const toggleStatsFullscreen = () => {
    if (gameOver && !isStatsFullscreen) return; // Prevent opening if game over, but allow closing
    setIsStatsFullscreen(!isStatsFullscreen);
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative select-none">
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
        <div ref={gameRef} className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer`} onClick={handleTap} >
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

          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30">
            <div className="flex items-center">
                <div className="relative mr-2 cursor-pointer" onClick={toggleStatsFullscreen} title="Xem chỉ số nhân vật" >
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
                                className={`${getHealthBarColor()} h-full transform origin-left`}
                                style={{ transform: `scaleX(${healthPct})`, transition: 'transform 0.5s ease-out' }}
                            ><div className="w-full h-1/2 bg-white bg-opacity-20" /></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none" style={{ animation: 'pulse 3s infinite' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs" style={{ animation: 'floatUp 0.8s ease-out forwards' }} >
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
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
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                      <div className="relative mr-0.5 flex items-center justify-center">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Dollar Coin Icon" className="w-4 h-4"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/16x16/ffd700/000000?text=$"; }}
                        />
                      </div>
                      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
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
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg" onClick={startGame} >
                Chơi Lại
              </button>
            </div>
          )}

          {!isStatsFullscreen && (
            <>
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: <div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute top-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div><div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>, label: "Shop", special: true, centered: true },
                { icon: <div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center"><div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>, label: "Inventory", special: true, centered: true }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                      {item.icon}
                      {item.label && <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                onClick={activateShield}
                title={!gameStarted || gameOver ? "Không khả dụng" : isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` : isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` : isStatsFullscreen ? "Không khả dụng" : "Kích hoạt Khiên chắn"}
                aria-label="Sử dụng Khiên chắn" role="button" tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen ? -1 : 0}
              >
                <div className="w-10 h-10"> <DotLottieReact src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie" loop autoplay={isShieldActive && !isStatsFullscreen} className="w-full h-full" /> </div>
                {isShieldOnCooldown && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold"> {remainingCooldown}s </div>}
              </div>
              {[
                { icon: <div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center"><div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div><div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div><div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>, label: "Mission", special: true, centered: true },
                { icon: <div className="relative"><div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600"><div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div><div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center"><div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div><div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div><div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div><div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div><div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div><div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div></div></div><div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div></div>, label: "Blacksmith", special: true, centered: true },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                    {item.icon}
                    {item.label && <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}

          <TreasureChest
            initialChests={3}
            onCoinReward={startCoinCountAnimation}
            onGemReward={handleGemReward}
            isGamePaused={gameOver || !gameStarted || isStatsFullscreen} // Game is also paused if stats are fullscreen
            isStatsFullscreen={isStatsFullscreen}
            keysCollected={keysCollected} // NEW: Pass keysCollected to TreasureChest
          />
        </div>
      )}
    </div>
  );
}
