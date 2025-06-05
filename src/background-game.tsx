import React, { useState, useEffect, useRef, Component } from 'react';
import CharacterCard from './stats/stats-main.tsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import TreasureChest from './treasure.tsx';
import CoinDisplay from './coin-display.tsx'; // Unchanged, as requested
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore'; // `increment` is not used here directly, but in lucky-game
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
// Keeping these here for now, but ideally should be in library/icon.tsx
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
  currentUser: User | null; 
}

interface GameCloud {
  id: number;
  x: number; 
  y: number; 
  size: number; 
  speed: number; 
  imgSrc: string; 
}

interface GameSessionData {
    health: number;
    characterPos: number;
}


export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []); 


  const MAX_HEALTH = 3000; 
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH); 
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0); 

  const [gameStarted, setGameStarted] = useState(false); 
  const [gameOver, setGameOver] = useState(false); 
  const [jumping, setJumping] = useState(false); 
  const [isRunning, setIsRunning] = useState(false); 
  const [runFrame, setRunFrame] = useState(0); 
  const [clouds, setClouds] = useState<GameCloud[]>([]); 
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); 
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);


  const [damageAmount, setDamageAmount] = useState(0); 
  const [showDamageNumber, setShowDamageNumber] = useState(false); 


  const [coins, setCoins] = useState(0); 
  const [displayedCoins, setDisplayedCoins] = useState(0); 

  const [gems, setGems] = useState(42); 

  const [keyCount, setKeyCount] = useState(0); 


  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false); 
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); 
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false); 
  const [isInventoryOpen, setIsInventoryOpen] = useState(false); 
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false); 


  const GROUND_LEVEL_PERCENT = 45;

  const gameRef = useRef<HTMLDivElement | null>(null); 
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); 

  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); 

  const sidebarToggleRef = useRef<(() => void) | null>(null);

  const db = getFirestore();

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
        console.log("User data fetched:", userData);
        setCoins(userData.coins || 0); 
        setDisplayedCoins(userData.coins || 0); 
        setGems(userData.gems || 0); 
        setKeyCount(userData.keys || 0); 
      } else {
        console.log("No user document found, creating default.");
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

  // Central function for ALL coin updates, including those from LuckyChestGame
  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    console.log("BG_GAME: updateCoinsInFirestore called with userId:", userId, "amount:", amount);
    if (!userId) {
      console.error("BG_GAME: Cannot update coins: User not authenticated.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        let currentCoins = 0;
        if (!userDoc.exists()) {
          console.warn("BG_GAME: User document does not exist for coin transaction. Creating with defaults.");
          // Create the document with the new coin amount directly if it's an addition,
          // or 0 if it's a deduction that would result in negative on a new doc.
           const initialCoinsForNewDoc = Math.max(0, amount);
           transaction.set(userDocRef, {
            coins: initialCoinsForNewDoc, 
            gems: gems, // Use current local gems state for new doc
            keys: keyCount, // Use current local keys state for new doc
            createdAt: new Date()
          });
          currentCoins = 0; // Set currentCoins to 0 for calculation below
        } else {
          currentCoins = userDoc.data().coins || 0;
        }
        
        const newCoins = currentCoins + amount;
        const finalCoins = Math.max(0, newCoins); // Ensure coins don't go below zero
        transaction.update(userDocRef, { coins: finalCoins });
        
        // Update local state AFTER successful Firestore update
        // This will also reflect in LuckyChestGame as currentCoins prop updates
        setCoins(finalCoins); 
        // Let displayedCoins catch up via its own useEffect or startCoinCountAnimation if it's a reward
      });
      console.log(`BG_GAME: Coins updated in Firestore for user ${userId}. New balance: ${coins + amount}`); // Log based on old coins state before setCoins finishes
    } catch (error) {
      console.error("BG_GAME: Firestore Transaction failed for coins: ", error);
    }
  };


   // Coin count animation function (for rewards within background-game itself, e.g. TreasureChest)
  const startCoinCountAnimation = (reward: number) => {
      console.log("BG_GAME: startCoinCountAnimation called with reward:", reward); 
      if (!auth.currentUser) {
          console.log("BG_GAME: User not authenticated, skipping coin animation and Firestore update.");
          return;
      }
      // The actual Firestore update for the reward amount will be handled by updateCoinsInFirestore
      // This function is now primarily for the visual animation for rewards originating here.
      
      const oldCoins = coins; // Current coins state before adding reward
      const targetCoinsAfterReward = oldCoins + reward; // What the coin total will be

      // Optimistically update Firestore first
      updateCoinsInFirestore(auth.currentUser.uid, reward).then(() => {
        // After Firestore is (hopefully) updated, animate displayedCoins
        // from the old value to the new value (which is now set in 'coins' state by updateCoinsInFirestore)
        let step = Math.ceil(reward / 30);
        if (reward <= 0) step = Math.floor(reward / 30); // Handle negative rewards if ever needed for animation
        let currentDisplay = oldCoins; // Start animation from pre-reward amount

        const countInterval = setInterval(() => {
            currentDisplay += step;
            if ((step > 0 && currentDisplay >= targetCoinsAfterReward) || (step < 0 && currentDisplay <= targetCoinsAfterReward) || step === 0) {
                setDisplayedCoins(targetCoinsAfterReward); // Ensure it lands exactly on target
                clearInterval(countInterval);
                console.log("BG_GAME: Coin count animation finished.");
            } else {
                setDisplayedCoins(currentDisplay);
            }
        }, 50);
      }).catch(error => {
          console.error("BG_GAME: Failed to update coins in Firestore during startCoinCountAnimation:", error);
          // Handle error: maybe don't animate or show an error message.
      });
  };

  const updateKeysInFirestore = async (userId: string, amount: number) => {
    console.log("updateKeysInFirestore called with amount:", amount);
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
            keys: Math.max(0, amount), // Ensure keys is non-negative if new doc
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          setKeyCount(finalKeys); // Update local state
        }
      });
      console.log("Firestore transaction for keys successful.");
    } catch (error)
 {
      console.error("Firestore Transaction failed for keys: ", error);
    }
  };


  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Received ${amount} gems from chest.`);
      // TODO: Implement Firestore update for gems if they need to be persistent
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                transaction.set(userDocRef, { gems: Math.max(0, gems + amount) }); // gems is pre-update here
            } else {
                const currentGems = userDoc.data().gems || 0;
                transaction.update(userDocRef, { gems: currentGems + amount });
            }
        }).catch(err => console.error("Error updating gems in Firestore:", err));
      }
  };

  const handleKeyCollect = (amount: number) => {
      console.log(`Collected ${amount} key(s).`);
      // This amount is typically negative from TreasureChest when a key is used.
      if (auth.currentUser) {
        updateKeysInFirestore(auth.currentUser.uid, amount); // Amount can be negative
      } else {
        console.log("User not authenticated, skipping Firestore key update.");
      }
  };


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

    if (!isBackgroundPaused) {
    }
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User authenticated:", user.uid);
        fetchUserData(user.uid); 
        setGameStarted(true); 
        setIsRunning(true); 
      } else {
        console.log("User logged out.");
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

    return () => unsubscribe();
  }, [db]); // auth removed as it's stable, db is stable. fetchUserData has db in its deps.

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

  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData || isRankOpen || isBackgroundPaused || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen) return; 

    if (!gameStarted) {
      startNewGame(); 
    } else if (gameOver) {
      startNewGame(); 
    }
  };


  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300);
  };

  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);

      setTimeout(() => {
          setShowDamageNumber(false);
      }, 800);
  };


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


  useEffect(() => {
    return () => {
      console.log("Component unmounting. Clearing all timers.");
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
      console.log("All timers cleared on unmount.");
    };
  }, []);

  // Effect for coin counter animation OR direct update if change is large
  useEffect(() => {
    // If displayedCoins already matches coins, or if coins is 0 (e.g. initial load or reset)
    if (displayedCoins === coins) {
      // If coins is 0 and displayedCoins is not, set displayedCoins to 0 directly
      if (coins === 0 && displayedCoins !== 0) {
        setDisplayedCoins(0);
      }
      return;
    }

    // If the change is large or not from a reward (e.g., direct update from GoldMine or LuckyGame cost/non-animated win)
    // just set displayedCoins directly to match coins.
    // The startCoinCountAnimation handles animation for explicit rewards within background-game.
    // LuckyGame handles its own coin updates through onUpdateCoins, which updates `coins` state.
    // This useEffect ensures `displayedCoins` eventually matches `coins`.
    // A simple way to distinguish: if it's not a small increment from a chest in this component, update directly.
    // The threshold helps decide. For very small changes, an animation might still be okay.
    const difference = coins - displayedCoins;

    // Threshold to decide if we animate or jump.
    // If GoldMine or LuckyGame causes a large jump, or a deduction, update directly.
    // Positive small differences might be animated by startCoinCountAnimation if they originate here.
    // For changes coming from `onUpdateCoins` (like from LuckyGame), `coins` updates, then this runs.
    if (Math.abs(difference) > 50 || difference < 0) { // If large jump or any deduction
        setDisplayedCoins(coins);
        return;
    }

    // For small positive increases that weren't handled by startCoinCountAnimation
    // (e.g. if startCoinCountAnimation was bypassed or for other small coin gains)
    // we can still do a quick animation here.
    let current = displayedCoins;
    const step = Math.max(1, Math.ceil(difference / 15)); // Animate over ~15 frames

    const quickSyncInterval = setInterval(() => {
        current += step;
        if (current >= coins) {
            setDisplayedCoins(coins);
            clearInterval(quickSyncInterval);
        } else {
            setDisplayedCoins(current);
        }
    }, 30); // Faster interval for quick sync

    return () => clearInterval(quickSyncInterval);

  }, [coins, displayedCoins]); // Depend on coins and displayedCoins


  const healthPct = health / MAX_HEALTH;

  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };


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
          autoplay={!isStatsFullscreen && !isLoadingUserData && !isRankOpen && !isBackgroundPaused && !isGoldMineOpen && !isInventoryOpen && !isLuckyGameOpen} 
          className="w-full h-full"
        />
      </div>
    );
  };

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
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud";
        }}
      />
    ));
  };


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


  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };


  if (isLoadingUserData && !auth.currentUser) { // Show loading only if no user yet, allow game if user data still loading but auth exists
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  let mainContent;
  if (isStatsFullscreen) {
      mainContent = (
          <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
              {auth.currentUser && (
                  <CharacterCard
                      onClose={toggleStatsFullscreen} 
                      coins={coins} 
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} 
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
                      onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                      onUpdateDisplayedCoins={setDisplayedCoins} 
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
              {auth.currentUser && (
                <LuckyChestGame 
                    onClose={toggleLuckyGame} 
                    currentCoins={coins} // Pass current coins state
                    onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} // Pass centralized coin update function
                    currentUserId={auth.currentUser.uid} // Pass user ID
                />
              )}
              {!auth.currentUser && <div className="text-center p-4 text-white">Vui lòng đăng nhập để chơi Lucky Game.</div>}
          </ErrorBoundary>
      );
  }
  else {
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
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png"
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; 
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Menu"; 
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
                        isStatsFullscreen={isStatsFullscreen || isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen} // Hide if any overlay is open
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
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png"
                        alt="Shop Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; 
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Shop";
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
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png"
                        alt="Inventory Icon"
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; 
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Inv"; 
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
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png"
                        alt="Mission Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; 
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Mission";
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
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png"
                        alt="Blacksmith Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement; 
                            target.onerror = null;
                            target.src = "https://placehold.co/20x20/ffffff/000000?text=Blacksmith";
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
              onKeyCollect={handleKeyCollect} // Use handleKeyCollect which calls updateKeysInFirestore
              onCoinReward={startCoinCountAnimation} // This will use the updated startCoinCountAnimation
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
