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
        const target = e.target as HTMLImageElement;
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


// Update component signature to accept className, hideNavBar, and showNavBar props
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar }: ObstacleRunnerGameProps) {
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
  const [particles, setParticles] = useState([]); // Array of active particles (dust)
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect

  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number

  // --- NEW: Shield Skill States ---
  const SHIELD_MAX_HEALTH = 2000; // Base health for the shield
  const SHIELD_COOLDOWN_TIME = 200000; // Shield cooldown time in ms (200 seconds)
  const [isShieldActive, setIsShieldActive] = useState(false); // Tracks if the shield is active (có máu và đang hiển thị)
  const [shieldHealth, setShieldHealth] = useState(SHIELD_MAX_HEALTH); // Current shield health
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useState(false); // Tracks if the shield is on cooldown (timer 200s đang chạy)
  const [remainingCooldown, setRemainingCooldown, ] = useState(0); // Remaining cooldown time in seconds

  // --- Coin and Gem States ---
  // Initialize coins state, will be overwritten by Firestore data
  const [coins, setCoins] = useState(0); // Initialize with 0, will load from Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Coins displayed with animation
  const [activeCoins, setActiveCoins] = useState<GameCoin[]>([]); // Array of active coins
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new coins
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for coin count animation
  // REMOVED: State to show "OK" text after coin update
  // const [showCoinUpdateSuccess, setShowCoinUpdateSuccess] = useState(false);


  // NEW: Gems state (Moved from TreasureChest)
  const [gems, setGems] = useState(42); // Player's gem count, initialized

  // NEW: Key state and ref for key drop interval
  const [keyCount, setKeyCount] = useState(0); // Player's key count
  const nextKeyInRef = useRef<number>(randomBetween(5, 10)); // Number of enemies until the next key drops

  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // NEW: State to track user data loading

  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers to manage intervals and timeouts
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref for the main game container div - Specify type
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for scheduling new obstacles - Specify type
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Timer for character run animation - Specify type
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
      console.log("Attempting Firestore transaction..."); // Debug Log 5
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("User document does not exist for transaction.");
          // Optionally create the document here if it's missing, though fetchUserData should handle this
          // Ensure all necessary fields are set if creating
          transaction.set(userDocRef, {
            coins: amount,
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
      console.log("Firestore transaction successful."); // Debug Log 6
      // REMOVED: Set state to show "OK" text after successful transaction
      // setShowCoinUpdateSuccess(true);
      // console.log("setShowCoinUpdateSuccess(true) called."); // Debug Log 7

    } catch (error) {
      console.error("Firestore Transaction failed: ", error); // Debug Log 8
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
              // setCoins(newCoins); // REMOVED: Local state update is handled by Firestore transaction callback
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

  // NEW: Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Received ${amount} gems from chest.`);
      // TODO: Implement Firestore update for gems
  };

  // NEW: Function to handle key collection (called when obstacle with key is defeated)
  const handleKeyCollect = (amount: number) => {
      setKeyCount(prev => prev + amount);
      console.log(`Collected ${amount} key(s). Total keys: ${keyCount + amount}`);
      // TODO: Implement Firestore update for keys here
  };


  // Function to start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHealth(MAX_HEALTH); // Start with max health
    setCharacterPos(0); // Character starts on the ground (0 is on the ground relative to ground level)
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
    // REMOVED: Reset success text state
    // setShowCoinUpdateSuccess(false);


    // Coin, Gem, Key counts are now loaded from Firestore on user auth,
    // so we don't reset them here. They persist between games.
    // setCoins(0); // REMOVED: Don't reset coins here
    // setDisplayedCoins(0); // REMOVED: Don't reset displayed coins here
    // setGems(0); // REMOVED: Don't reset gems here
    // setKeyCount(0); // REMOVED: Don't reset key count here

    nextKeyInRef.current = randomBetween(5, 10); // Reset key drop interval


    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        const hasKeyFirst = (() => {
          nextKeyInRef.current -= 1;
          if (nextKeyInRef.current <= 0) {
            nextKeyInRef.current = randomBetween(5, 10);
            return true;
          }
          return false;
        })();

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
          const spacing = i * (Math.random() * 10 + 10);

          const hasKey = (() => {
            nextKeyInRef.current -= 1;
            if (nextKeyInRef.current <= 0) {
              nextKeyInRef.current = randomBetween(5, 10);
              return true;
            }
            return false;
          })();

          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50),
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKey,
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

  // --- NEW: Effect to fetch user data on authentication state change ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User authenticated:", user.uid);
        fetchUserData(user.uid); // Fetch user data when authenticated
      } else {
        console.log("User logged out.");
        // Reset game states if user logs out
        setGameStarted(false);
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
        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
        setCoins(0); // Reset local coin state
        setDisplayedCoins(0); // Reset local displayed coin state
        setGems(0); // Reset local gems state
        setKeyCount(0); // Reset local key state
        setIsLoadingUserData(false); // Stop loading if user logs out
        // REMOVED: Reset success text state
        // setShowCoinUpdateSuccess(false);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [auth]); // Depend on auth object

  // Auto-start the game as soon as component mounts AND user data is loaded
  useEffect(() => {
    // Only start game if user data is NOT loading and game is not already started
    if (!isLoadingUserData && !gameStarted && auth.currentUser) {
      startGame();
    }
  }, [isLoadingUserData, gameStarted, auth.currentUser]); // Depend on loading state, gameStarted, and auth user

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;

      clearInterval(coinScheduleTimerRef.current);
      clearInterval(coinCountAnimationTimerRef.current);

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

    const newParticles = [];
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 5 + Math.random() * 5,
        y: 0,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
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

    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = Math.floor(Math.random() * 3) + 1;
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const spacing = i * (Math.random() * 10 + 10);

            const hasKey = (() => {
              nextKeyInRef.current -= 1;
              if (nextKeyInRef.current <= 0) {
                nextKeyInRef.current = randomBetween(5, 10);
                return true;
              }
              return false;
            })();

            newObstacles.push({
              id: Date.now() + i,
              position: 100 + spacing,
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
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
        id: Date.now(),
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
    if (isStatsFullscreen || isLoadingUserData) return; // Ignore taps if loading data or stats are fullscreen

    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      startGame();
    }
    // Jump logic is triggered by key press or a dedicated jump button if you add one
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
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
      console.log("Cannot activate Shield:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData });
      return;
    }

    console.log("Activating Shield!");

    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH);

    setIsShieldOnCooldown(true);
    setRemainingCooldown(SHIELD_COOLDOWN_TIME / 1000);

    shieldCooldownStartTimeRef.current = Date.now();
    pausedShieldCooldownRemainingRef.current = null;

    if (shieldCooldownTimerRef.current) {
        clearTimeout(shieldCooldownTimerRef.current);
    }
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Shield cooldown ended.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        shieldCooldownStartTimeRef.current = null;
        pausedShieldCooldownRemainingRef.current = null;
    }, SHIELD_COOLDOWN_TIME);

  };


  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  // This useEffect is the main game loop for movement and collision detection
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
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

                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;


                return prevObstacles
                    .map(obstacle => {
                        let newPosition = obstacle.position - speed;

                        let collisionDetected = false;
                        const obstacleX_px = (newPosition / 100) * gameWidth;

                        let obstacleWidth_px, obstacleHeight_px;
                        obstacleWidth_px = (obstacle.width / 4) * 16;
                        obstacleHeight_px = (obstacle.height / 4) * 16;

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

                        if (newPosition < -20 && !collisionDetected) {
                            if (Math.random() < 0.7) {
                                if (obstacleTypes.length === 0) return obstacle;

                                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                                const randomOffset = Math.floor(Math.random() * 20);

                                const hasKey = (() => {
                                  nextKeyInRef.current -= 1;
                                  if (nextKeyInRef.current <= 0) {
                                    nextKeyInRef.current = randomBetween(5, 10);
                                    return true;
                                  }
                                  return false;
                                })();

                                return {
                                    ...obstacle,
                                    ...randomObstacleType,
                                    id: Date.now(),
                                    position: 120 + randomOffset,
                                    health: randomObstacleType.baseHealth,
                                    maxHealth: randomObstacleType.baseHealth,
                                    hasKey: hasKey,
                                };
                            } else {
                                return { ...obstacle, position: newPosition };
                            }
                        }

                        if (collisionDetected) {
                            if (obstacle.hasKey) {
                                handleKeyCollect(1);
                            }
                            return { ...obstacle, position: newPosition, collided: true };
                        }

                        return { ...obstacle, position: newPosition };
                    })
                    .filter(obstacle => {
                        return !obstacle.collided && obstacle.position > -20 && obstacle.health > 0;
                    });
            });

            setClouds(prevClouds => {
                return prevClouds
                    .map(cloud => {
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

            // --- NEW: Move coins and detect collisions ---
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
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


                return prevCoins
                    .map(coin => {
                        const coinSize_px = 40;

                        const coinX_px = (coin.x / 100) * gameWidth;
                        const coinY_px = (coin.y / 100) * gameHeight;

                        let newX = coin.x;
                        let newY = coin.y;
                        let collisionDetected = false;
                        let shouldBeAttracted = coin.isAttracted;


                        if (!shouldBeAttracted) {
                            if (
                                characterRight_px > coinX_px &&
                                characterLeft_px < coinX_px + coinSize_px &&
                                characterBottomFromTop_px > coinY_px &&
                                characterTopFromTop_px < coinY_px + coinSize_px
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

                            if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.8) {
                                collisionDetected = true;
                                const awardedCoins = Math.floor(Math.random() * 5) + 1;
                                console.log(`Coin collected! Awarded: ${awardedCoins}. Calling startCoinCountAnimation.`); // Debug Log 1
                                // startCoinCountAnimation(awardedCoins); // This now triggers Firestore update internally
                                // Call the animation first, then the Firestore update will happen after animation
                                startCoinCountAnimation(awardedCoins);

                                console.log(`Coin collected! Awarded: ${awardedCoins}`);
                            }

                        } else {
                            newX = coin.x - coin.initialSpeedX;
                            newY = coin.y + coin.initialSpeedY;
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
                        const isOffScreen = coin.x < -20 || coin.y > 120;
                        return !coin.collided && !isOffScreen;
                    });
            });


        }, 30);
    }

    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) {
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, jumping, characterPos, obstacleTypes, isStatsFullscreen, coins, isShieldActive, isLoadingUserData]); // Added isLoadingUserData to dependencies

  // Effect to manage obstacle and coin scheduling timers based on game state and fullscreen state
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
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
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData) { // Added isLoadingUserData check
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

      return () => {
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
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]); // Dependencies include loading state

  // *** MODIFIED Effect: Manage shield cooldown countdown display AND main cooldown timer pause/resume ***
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      if (isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
          if (shieldCooldownTimerRef.current && shieldCooldownStartTimeRef.current) {
              const elapsedTime = Date.now() - shieldCooldownStartTimeRef.current;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              pausedShieldCooldownRemainingRef.current = remainingTimeMs;
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log(`Main shield cooldown PAUSED with ${remainingTimeMs}ms remaining.`);
          }

          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Shield display countdown PAUSED.");
          }
      } else if (isShieldOnCooldown && !gameOver && !isLoadingUserData) { // Added isLoadingUserData check
          if (pausedShieldCooldownRemainingRef.current !== null) {
              const remainingTimeToResume = pausedShieldCooldownRemainingRef.current;
              console.log(`Resuming main shield cooldown with ${remainingTimeToResume}ms.`);
              shieldCooldownTimerRef.current = setTimeout(() => {
                  console.log("Shield cooldown ended (after pause).");
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
              const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000); // Use remainingTimeMs here

              if (initialRemainingSeconds > 0) {
                  setRemainingCooldown(initialRemainingSeconds);
                  console.log(`Resuming shield display countdown with ${initialRemainingSeconds}s.`);

                  countdownInterval = setInterval(() => {
                      if (isStatsFullscreen || isLoadingUserData) { // Added isLoadingUserData check
                          clearInterval(countdownInterval!);
                          cooldownCountdownTimerRef.current = null;
                          return;
                      }
                      setRemainingCooldown(prev => {
                          const newRemaining = Math.max(0, prev - 1);
                          if (newRemaining === 0) {
                              clearInterval(countdownInterval!);
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
          if (countdownInterval) {
              clearInterval(countdownInterval);
          }
      };

  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData]); // Added isLoadingUserData to dependencies

  // REMOVED: Effect to hide the "OK" text after a few seconds
  // useEffect(() => {
  //     let successTimer: NodeJS.Timeout | null = null;
  //     if (showCoinUpdateSuccess) {
  //         successTimer = setTimeout(() => {
  //             setShowCoinUpdateSuccess(false);
  //         }, 2000); // Hide after 2 seconds
  //     }
  //     return () => {
  //         if (successTimer) {
  //             clearTimeout(successTimer);
  //         }
  //     };
  // }, [showCoinUpdateSuccess]);


  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      pausedShieldCooldownRemainingRef.current = null;

      clearInterval(coinScheduleTimerRef.current);
      clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
    };
  }, []);

    // Effect for coin counter animation
  useEffect(() => {
    // Only trigger animation if the displayed coins need to catch up to the actual coins state
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
  }, [displayedCoins, coins]); // Depend on both displayedCoins and coins state


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
          autoplay={!isStatsFullscreen && !isLoadingUserData} // Autoplay only when game is not fullscreen and not loading
          className="w-full h-full"
        />
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl;

    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;


    switch(obstacle.type) {
      case 'rock':
        obstacleEl = (
          <div className={`w-${obstacle.width} h-${obstacle.height} bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            <div className="w-2 h-1 bg-gray-600 rounded-full absolute top-1 left-0.5"></div>
            <div className="w-1.5 h-0.5 bg-gray-600 rounded-full absolute top-3 right-1"></div>
          </div>
        );
        break;
      case 'lottie-obstacle-1':
        obstacleEl = (
          <div
            className="relative"
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData} // Autoplay only when game is not fullscreen and not loading
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
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
                autoplay={!isStatsFullscreen && !isLoadingUserData} // Autoplay only when game is not fullscreen and not loading
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

    const obstacleHealthPct = obstacle.health / obstacle.maxHealth;

    return (
      <div
        key={obstacle.id}
        className="absolute"
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          left: `${obstacle.position}%`
        }}
      >
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-visible border border-gray-600 shadow-sm relative">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }}
            ></div>

             {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
                alt="Key"
                className="absolute w-4 h-4"
                style={{
                    bottom: 'calc(100% + 4px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
              />
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
        alt="Cloud Icon"
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
          autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData} // Autoplay only when shield is active, not fullscreen, and not loading
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
          autoplay={!isStatsFullscreen && !isLoadingUserData} // Autoplay only when game is not fullscreen and not loading
          className="w-full h-full"
        />
      </div>
    ));
  };


  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return; // Prevent opening if game over or loading data

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
  if (isLoadingUserData) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      <style>{`
        @keyframes fadeOutUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
        }
        .animate-fadeOutUp {
          animation: fadeOutUp 0.5s ease-out forwards;
        }
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse-button { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { 0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); } 100% { color: #fff; text-shadow: none; transform: scale(1); } }
        .number-changing { animation: number-change 0.3s ease-out; }
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0; }
          50% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        @keyframes floatUp {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }
        /* REMOVED: Animation for OK text */
        /*
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        .animate-fadeInOut {
            animation: fadeInOut 2s ease-in-out forwards;
        }
        */
      `}</style>
       <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>


      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            {/* Pass coins and updateCoinsInFirestore to CharacterCard */}
            {auth.currentUser && (
                <CharacterCard
                    onClose={toggleStatsFullscreen}
                    coins={coins} // Pass the coin state
                    onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} // Pass the update function
                />
            )}
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

          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30">
            <div className="flex items-center">
                {/* Updated Stats Icon - Increased size to w-10 h-10 */}
                <div
                  className="relative mr-2 cursor-pointer w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" // Adjusted size
                  onClick={toggleStatsFullscreen}
                  title="Xem chỉ số nhân vật"
                >
                     <DotLottieReact
                        src="https://lottie.host/f557507e-4cfc-4269-b62c-cc6ea2485ec4/TFkVmVXP4K.lottie"
                        loop
                        autoplay={!isStatsFullscreen && !isLoadingUserData} // Autoplay only when game is not fullscreen and not loading
                        className="w-full h-full" // Ensure Lottie fills the container
                      />
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
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* REMOVED: Display "OK" text */}
                    {/*
                    {showCoinUpdateSuccess && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-lg animate-fadeInOut pointer-events-none z-50">
                            OK
                        </div>
                    )}
                    */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()}
                        </div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>

                    <CoinDisplay
                      displayedCoins={displayedCoins}
                      isStatsFullscreen={isStatsFullscreen}
                    />
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
                {
                  icon: (
                    <div className="relative">
                      <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                        <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                        <div className="absolute top-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>
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
                <div key={index} className="group cursor-pointer">
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

           {!isStatsFullscreen && (
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">

               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`} // Added isLoadingUserData check
                onClick={activateShield}
                title={
                  !gameStarted || gameOver || isLoadingUserData ? "Không khả dụng" : // Added isLoadingUserData check
                  isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                  isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                  isStatsFullscreen ? "Không khả dụng" :
                  "Kích hoạt Khiên chắn"
                }
                aria-label="Sử dụng Khiên chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? -1 : 0} // Added isLoadingUserData check
              >
                <div className="w-10 h-10">
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                      loop
                      autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData} // Autoplay only when shield is active, not fullscreen, and not loading
                      className="w-full h-full"
                   />
                </div>
                {isShieldOnCooldown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold">
                    {remainingCooldown}s
                  </div>
                )}
              </div>

              {[
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
                <div key={index} className="group cursor-pointer">
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

          <TreasureChest
            initialChests={3}
            keyCount={keyCount}
            onKeyCollect={(n) => {
              console.log(`Chest opened using ${n} key(s).`);
              setKeyCount(prev => Math.max(0, prev - n));
              // TODO: Implement Firestore update for keys here
            }}
            // Use startCoinCountAnimation to handle coin rewards from chests
            onCoinReward={startCoinCountAnimation}
            onGemReward={handleGemReward} // NEW: Pass the gem reward handler
            isGamePaused={gameOver || !gameStarted || isLoadingUserData} // Added isLoadingUserData check
            isStatsFullscreen={isStatsFullscreen}
          />

        </div>
      )}
    </div>
  );
}
