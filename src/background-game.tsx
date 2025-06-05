import React, { useState, useEffect, useRef, Component, useCallback } from 'react'; // Added useCallback
import CharacterCard from './stats/stats-main.tsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import TreasureChest from './treasure.tsx';
import CoinDisplay from './coin-display.tsx';
import { getFirestore, doc, getDoc, setDoc, runTransaction, onSnapshot } from 'firebase/firestore'; // Added onSnapshot
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { GemIcon } from './library/icon.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import GoldMine from './gold-miner.tsx';
import Inventory from './inventory.tsx';
import DungeonBackground from './background-dungeon.tsx';
import LuckyChestGame from './lucky-game.tsx';

// --- SVG Icon Components (Replacement for lucide-react) ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
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
    src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png)"
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
interface GameSessionData {
    health: number;
    characterPos: number;
    // Add other temporary game state you want to save
}

// Update component signature to accept className, hideNavBar, showNavBar, and currentUser props
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
  }, []);

  // Game states - Now using useSessionStorage for states that should persist in session
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH); // Use hook for health
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0); // Use hook for char position

  // States that do NOT need session storage persistence (reset on refresh)
  const [gameStarted, setGameStarted] = useState(false); // Tracks if the game has started
  const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Array of active clouds with image source
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);

  // State for Health Bar visual display
  const [damageAmount, setDamageAmount] = useState(0); // State to store the amount of damage taken for display
  const [showDamageNumber, setShowDamageNumber] = useState(false); // State to control visibility of the damage number

  // --- Coin and Gem States (Persisted in Firestore) ---
  const [coins, setCoins] = useState(0); // Initialize with 0, will load from Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Coins displayed with animation

  const [gems, setGems] = useState(42); // Player's gem count, initialized

  // NEW: Key state and ref for key drop interval
  const [keyCount, setKeyCount] = useState(0); // Player's key count

  // NEW: Jackpot pool state
  const [jackpotPool, setJackpotPool] = useState(200);

  // UI States
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);

  const GROUND_LEVEL_PERCENT = 45;

  // Refs for timers that do NOT need session storage persistence
  const gameRef = useRef<HTMLDivElement | null>(null);
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null);

  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sidebarToggleRef = useRef<(() => void) | null>(null);

  // Firestore instance
  const db = getFirestore();

  // Ref for debounce timer to optimize Firestore writes
  const coinsUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jackpotUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- NEW: Array of Cloud Image URLs ---
  const cloudImageUrls = [
      "[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png)",
      "[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png)",
      "[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png)"
  ];

  // Helper function to generate random number between min and max (inclusive)
  function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // --- Debounce function for Firestore updates ---
  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // --- NEW: Function to update user's coin count in Firestore using a transaction (debounced) ---
  const updateCoinsInFirestore = useCallback(async (userId: string, newCoinAmount: number) => {
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
            coins: newCoinAmount,
            gems: gems,
            keys: keyCount,
            createdAt: new Date()
          });
        } else {
          transaction.update(userDocRef, { coins: newCoinAmount });
        }
      });
      console.log(`Coins updated in Firestore for user ${userId}: ${newCoinAmount}`);
    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error);
    }
  }, [db, gems, keyCount]); // Depend on db, gems, and keyCount

  const debouncedUpdateCoins = useCallback(
    debounce((userId: string, newCoinAmount: number) => updateCoinsInFirestore(userId, newCoinAmount), 500),
    [updateCoinsInFirestore]
  );

  // --- NEW: Function to update Jackpot Pool in Firestore (debounced) ---
  const updateJackpotPoolInFirestore = useCallback(async (newPoolAmount: number) => {
    const jackpotDocRef = doc(db, 'game', 'jackpot'); // A single document for the jackpot pool

    try {
      await runTransaction(db, async (transaction) => {
        const jackpotDoc = await transaction.get(jackpotDocRef);
        if (!jackpotDoc.exists()) {
          transaction.set(jackpotDocRef, { pool: newPoolAmount });
        } else {
          transaction.update(jackpotDocRef, { pool: newPoolAmount });
        }
      });
      console.log(`Jackpot pool updated in Firestore: ${newPoolAmount}`);
    } catch (error) {
      console.error("Firestore Transaction failed for jackpot pool: ", error);
    }
  }, [db]);

  const debouncedUpdateJackpotPool = useCallback(
    debounce((newPoolAmount: number) => updateJackpotPoolInFirestore(newPoolAmount), 500),
    [updateJackpotPoolInFirestore]
  );

  // Function to update local coins state and trigger debounced Firestore update
  const handleCoinUpdate = (amount: number) => {
    setCoins(prev => {
      const newAmount = prev + amount;
      if (auth.currentUser) {
        debouncedUpdateCoins(auth.currentUser.uid, newAmount);
      }
      return newAmount;
    });
  };

  // Function to update local jackpot pool state and trigger debounced Firestore update
  const handleJackpotPoolUpdate = (amount: number) => {
    setJackpotPool(prev => {
      const newPool = prev + amount;
      debouncedUpdateJackpotPool(newPool);
      return newPool;
    });
  };

  // Coin count animation function
  const startCoinCountAnimation = (reward: number) => {
      const oldCoins = coins;
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30);
      let current = oldCoins;

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              clearInterval(countInterval);
              handleCoinUpdate(reward); // Update coins via main handler
          } else {
              setDisplayedCoins(current);
          }
      }, 50);
  };

  // --- NEW: Function to update user's key count in Firestore using a transaction ---
  const updateKeysInFirestore = useCallback(async (userId: string, amount: number) => {
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
            keys: keyCount,
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
        }
      });
      console.log(`Keys updated in Firestore for user ${userId} by ${amount}`);
      setKeyCount(prev => Math.max(0, prev + amount)); // Update local state after successful Firestore update
    } catch (error) {
      console.error("Firestore Transaction failed for keys: ", error);
    }
  }, [db, coins, gems, keyCount]); // Dependencies include states used in set operation

  // Function to handle gem rewards received from TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Received ${amount} gems from chest.`);
      // TODO: Implement Firestore update for gems
  };

  // Function to handle key collection (called when obstacle with key is defeated)
  const handleKeyCollect = (amount: number) => {
      updateKeysInFirestore(auth.currentUser!.uid, amount);
  };

  // Function to start a NEW game (resets session storage states)
  const startNewGame = () => {
    setHealth(MAX_HEALTH);
    setCharacterPos(0);

    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsBackgroundPaused(false);
    setIsGoldMineOpen(false);
    setIsInventoryOpen(false);
    setIsLuckyGameOpen(false);

    generateInitialClouds(5);
  };

  // Effect to fetch user data and listen to real-time updates for coins and jackpot pool
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User authenticated:", user.uid);
        setIsLoadingUserData(true);
        const userDocRef = doc(db, 'users', user.uid);
        const jackpotDocRef = doc(db, 'game', 'jackpot');

        // Listen for user data changes (coins, gems, keys)
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCoins(userData.coins || 0);
            setDisplayedCoins(userData.coins || 0);
            setGems(userData.gems || 0);
            setKeyCount(userData.keys || 0);
            console.log("User data updated from Firestore:", userData);
          } else {
            console.log("User document not found, creating default.");
            setDoc(userDocRef, {
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
          setIsLoadingUserData(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setIsLoadingUserData(false);
        });

        // Listen for jackpot pool changes
        const unsubscribeJackpot = onSnapshot(jackpotDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const jackpotData = docSnap.data();
            setJackpotPool(jackpotData.pool || 200);
            console.log("Jackpot pool updated from Firestore:", jackpotData.pool);
          } else {
            console.log("Jackpot document not found, creating default.");
            setDoc(jackpotDocRef, { pool: 200 });
            setJackpotPool(200);
          }
        }, (error) => {
          console.error("Error listening to jackpot pool:", error);
        });

        setGameStarted(true);
        setIsRunning(true);

        return () => {
          unsubscribeUser();
          unsubscribeJackpot();
        };

      } else {
        console.log("User logged out.");
        // Reset all game states on logout
        setGameStarted(false);
        setGameOver(false);
        setHealth(MAX_HEALTH);
        setCharacterPos(0);
        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBackgroundPaused(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setJackpotPool(200); // Reset jackpot pool on logout
        setIsLoadingUserData(false);

        sessionStorage.removeItem('gameHealth');
        sessionStorage.removeItem('gameCharacterPos');

        if(runAnimationRef.current) clearInterval(runAnimationRef.current);
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (coinsUpdateTimerRef.current) clearTimeout(coinsUpdateTimerRef.current);
      if (jackpotUpdateTimerRef.current) clearTimeout(jackpotUpdateTimerRef.current);
    };
  }, [db, updateCoinsInFirestore, updateJackpotPoolInFirestore]);

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted]);

  // Effect to handle tab visibility changes (pause/resume game)
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              console.log("Tab is hidden. Pausing game.");
              setIsBackgroundPaused(true);
          } else {
              console.log("Tab is visible. Resuming game.");
              setIsBackgroundPaused(false);
          }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);

  // Generate initial cloud elements
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        x: Math.random() * 50 + 100,
        y: Math.random() * 40 + 10,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 0.3 + 0.15,
        imgSrc: randomImgSrc
      });
    }
    setClouds(newClouds);
  };

  // Handle character jump action
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) {
      setCharacterPos(80);
      setJumping(true);
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) {
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
    if (isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen) return;

    if (!gameStarted) {
      startNewGame();
    } else if (gameOver) {
      startNewGame();
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

  // Move obstacles, clouds, particles, and NEW: Coins, and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen) {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        return;
    }

    if (!gameLoopIntervalRef.current && !isBackgroundPaused) {
        gameLoopIntervalRef.current = setInterval(() => {
            setClouds(prevClouds => {
                return prevClouds
                    .map(cloud => {
                        const newX = cloud.x - cloud.speed;

                        if (newX < -50) {
                            const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                            return {
                                ...cloud,
                                id: Date.now() + Math.random(),
                                x: 100 + Math.random() * 30,
                                y: Math.random() * 40 + 10,
                                size: Math.random() * 40 + 30,
                                speed: Math.random() * 0.3 + 0.15,
                                imgSrc: randomImgSrc
                            };
                        }

                        return { ...cloud, x: Math.min(120, Math.max(-50, newX)) };
                    });
            });

        }, 30);
    }

    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
    };
  }, [gameStarted, gameOver, jumping, characterPos, isStatsFullscreen, isRankOpen, coins, isLoadingUserData, isBackgroundPaused, isGoldMineOpen, isInventoryOpen, isLuckyGameOpen]);

  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen) {
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) {
      }

      return () => {
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData, isRankOpen, isBackgroundPaused, isGoldMineOpen, isInventoryOpen, isLuckyGameOpen]);

  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
      if (coinsUpdateTimerRef.current) clearTimeout(coinsUpdateTimerRef.current);
      if (jackpotUpdateTimerRef.current) clearTimeout(jackpotUpdateTimerRef.current);
      console.log("All timers cleared on unmount.");
    };
  }, []);

  // Effect for coin counter animation
  useEffect(() => {
    if (displayedCoins === coins) return;

    if (Math.abs(coins - displayedCoins) > 10) {
        setDisplayedCoins(coins);
        return;
    }

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

  // Determine health bar color based on health percentage
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
          src="[https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie](https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie)"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen}
          className="w-full h-full"
        />
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
          left: `${Math.min(120, Math.max(-50, cloud.x))}%`,
          opacity: 0.8
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "[https://placehold.co/40x24/ffffff/000000?text=Cloud](https://placehold.co/40x24/ffffff/000000?text=Cloud)";
        }}
      />
    ));
  };

  // NEW: Function to toggle full-screen stats
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return;

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) {
            hideNavBar();
            setIsRankOpen(false);
            setIsGoldMineOpen(false);
            setIsInventoryOpen(false);
            setIsLuckyGameOpen(false);
        } else {
            showNavBar();
        }
        return newState;
    });
  };

  // NEW: Function to toggle Rank visibility
  const toggleRank = () => {
     if (gameOver || isLoadingUserData) return;

     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar();
             setIsStatsFullscreen(false);
             setIsGoldMineOpen(false);
             setIsInventoryOpen(false);
             setIsLuckyGameOpen(false);
         } else {
             showNavBar();
         }
         return newState;
         });
  };

  // NEW: Function to toggle Gold Mine visibility
  const toggleGoldMine = () => {
    if (gameOver || isLoadingUserData) return;

    setIsGoldMineOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // NEW: Function to toggle Inventory visibility
  const toggleInventory = () => {
    if (gameOver || isLoadingUserData) return;

    setIsInventoryOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsLuckyGameOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // NEW: Function to toggle Lucky Game visibility
  const toggleLuckyGame = () => {
    if (gameOver || isLoadingUserData) return;

    setIsLuckyGameOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsStatsFullscreen(false);
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // Handler to receive the sidebar toggle function from SidebarLayout
  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  // Show loading indicator if user data is being fetched
  if (isLoadingUserData) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  // Determine which content to render inside SidebarLayout based on state
  let mainContent;
  if (isStatsFullscreen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
              {auth.currentUser && (
                  <CharacterCard
                      onClose={toggleStatsFullscreen}
                      coins={coins}
                      onUpdateCoins={(amount) => handleCoinUpdate(amount)} // Updated to use handleCoinUpdate
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isRankOpen) {
       mainContent = (
           <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng xếp hạng!</div>}>
               <EnhancedLeaderboard onClose={toggleRank} />
           </ErrorBoundary>
       );
  } else if (isGoldMineOpen) {
      const isGoldMineGamePaused = gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen || isBackgroundPaused || isInventoryOpen || isLuckyGameOpen;

      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị mỏ vàng!</div>}>
              {auth.currentUser && (
                  <GoldMine
                      onClose={toggleGoldMine}
                      currentCoins={coins}
                      onUpdateCoins={(amount) => handleCoinUpdate(amount)} // Updated to use handleCoinUpdate
                      onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)}
                      currentUserId={auth.currentUser!.uid}
                      isGamePaused={isGoldMineGamePaused}
                  />
              )}
          </ErrorBoundary>
      );
  } else if (isInventoryOpen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị túi đồ!</div>}>
              <Inventory onClose={toggleInventory} />
          </ErrorBoundary>
      );
  } else if (isLuckyGameOpen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị Lucky Game!</div>}>
              {/* Pass coins and jackpotPool from background-game to LuckyChestGame */}
              <LuckyChestGame
                  onClose={toggleLuckyGame}
                  currentCoins={coins}
                  onUpdateCoins={handleCoinUpdate}
                  currentJackpotPool={jackpotPool}
                  onUpdateJackpotPool={handleJackpotPoolUpdate}
              />
          </ErrorBoundary>
      );
  } else {
      mainContent = (
          <div
            ref={gameRef}
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl cursor-pointer bg-neutral-800`}
            onClick={handleTap}
          >
            <DungeonBackground />

            {renderClouds()}

            {renderCharacter()}

            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden
                        rounded-b-lg shadow-2xl
                        bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                        border-b border-l border-r border-slate-700/50">

                <HeaderBackground />

                <button
                    onClick={() => sidebarToggleRef.current?.()}
                    className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20"
                    aria-label="Mở sidebar"
                    title="Mở sidebar"
                >
                     <img
                        src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png)"
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "[https://placehold.co/20x20/ffffff/000000?text=Menu](https://placehold.co/20x20/ffffff/000000?text=Menu)";
                        }}
                     />
                </button>

                <div className="flex items-center relative z-10">
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
               {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) && (
                  <div className="flex items-center space-x-1 currency-display-container relative z-10">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                          <div className="relative mr-0.5 flex items-center justify-center">
                              <GemIcon size={16} color="#a78bfa" className="relative z-20" />
                          </div>
                          <div className="font-bold text-purple-200 text-xs tracking-wide">
                              {gems.toLocaleString()}
                          </div>
                          <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
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
                  onClick={startNewGame}
                >
                  Chơi Lại
                </button>
              </div>
            )}

             {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) && (
              <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
                {[
                  {
                    icon: (
                      <img
                        src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png)"
                        alt="Shop Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "[https://placehold.co/20x20/ffffff/000000?text=Shop](https://placehold.co/20x20/ffffff/000000?text=Shop)";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <img
                        src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png)"
                        alt="Inventory Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "[https://placehold.co/20x20/ffffff/000000?text=Inv](https://placehold.co/20x20/ffffff/000000?text=Inv)";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true,
                    onClick: toggleInventory
                  }
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick}
                        >
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

             {(!isStatsFullscreen && !isRankOpen && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen) && (
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">

                {[
                  {
                    icon: (
                      <img
                        src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png)"
                        alt="Mission Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "[https://placehold.co/20x20/ffffff/000000?text=Mission](https://placehold.co/20x20/ffffff/000000?text=Mission)";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true
                  },
                  {
                    icon: (
                      <img
                        src="[https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png](https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png)"
                        alt="Blacksmith Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "[https://placehold.co/20x20/ffffff/000000?text=Blacksmith](https://placehold.co/20x20/ffffff/000000?text=Blacksmith)";
                        }}
                      />
                    ),
                    label: "",
                    notification: true,
                    special: true,
                    centered: true
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    {item.special && item.centered ? (
                        <div
                            className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg"
                            onClick={item.onClick}
                        >
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
                if (auth.currentUser) {
                  updateKeysInFirestore(auth.currentUser!.uid, -n);
                } else {
                  console.log("User not authenticated, skipping Firestore key update.");
                }
              }}
              onCoinReward={handleCoinUpdate} // Updated to use handleCoinUpdate
              onGemReward={handleGemReward}
              isGamePaused={gameOver || !gameStarted || isLoadingUserData || isStatsFullscreen || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen}
              isStatsFullscreen={isStatsFullscreen}
              currentUserId={currentUser ? currentUser.uid : null}
            />

          </div>
      );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950">
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowStats={toggleStatsFullscreen}
          onShowRank={toggleRank}
          onShowGoldMine={toggleGoldMine}
          onShowLuckyGame={toggleLuckyGame}
      >
        {mainContent}
      </SidebarLayout>
    </div>
  );
}
