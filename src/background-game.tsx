import React, { useState, useEffect, useRef, Component } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './coin-display.tsx';
import { getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { GemIcon } from './library/icon.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import GoldMine from './gold-miner.tsx';
import Inventory from './inventory.tsx';
import DungeonCanvasBackground from './DungeonCanvasBackground.tsx';
import LuckyChestGame from './lucky-game.tsx';
import Blacksmith from './blacksmith.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import BossBattle from './boss.tsx'; // THAY THẾ: import TowerExplorerGame from './leo-thap.tsx';
import Shop from './shop.tsx';
import VocabularyChestScreen from './lat-the.tsx';
import MinerChallenge from './bomb.tsx';
import UpgradeStatsScreen from './upgrade-stats.tsx';
// Đảm bảo import VocabularyItem từ thanh-tuu
import AchievementsScreen, { VocabularyItem, initialVocabularyData } from './thanh-tuu.tsx';
import AdminPanel from './admin.tsx';

// --- LOGIC TÍNH TOÁN CHỈ SỐ (sao chép từ upgrade-stats.tsx để nhất quán) ---
const calculateTotalStatValue = (currentLevel: number, baseBonus: number) => {
  if (currentLevel === 0) return 0;
  let totalValue = 0;
  const fullTiers = Math.floor(currentLevel / 10);
  const remainingLevelsInCurrentTier = currentLevel % 10;
  for (let i = 0; i < fullTiers; i++) {
    const bonusInTier = baseBonus * Math.pow(2, i);
    totalValue += 10 * bonusInTier;
  }
  const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers);
  totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier;
  return totalValue;
};

// --- HẰNG SỐ CHỈ SỐ CHO NGƯỜI CHƠI ---
const BASE_PLAYER_STATS = {
    hp: 40000,
    atk: 1000,
    def: 5,
};
const STAT_BONUS_CONFIG = {
    hp: 50,  // Tương ứng baseUpgradeBonus cho HP trong upgrade-stats.tsx
    atk: 5,   // Tương ứng baseUpgradeBonus cho ATK trong upgrade-stats.tsx
    def: 5,   // Tương ứng baseUpgradeBonus cho DEF trong upgrade-stats.tsx
};


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
          <p>(Kiểm tra Console để biết thêm thêm thông tin)</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div
        className="h-12 w-12 animate-spin rounded-full border-[5px] border-slate-700 border-t-purple-400"
    ></div>
    <p className="mt-5 text-lg font-medium text-gray-300">
      Loading...
    </p>
  </div>
);

interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
  assetsLoaded: boolean;
}

export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser, assetsLoaded }: ObstacleRunnerGameProps) {

  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[] | null>(null);

  // States for UI and User Data
  const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [pickaxes, setPickaxes] = useState(0);
  // State để lưu tầng cao nhất của Miner Challenge
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  // State để lưu chỉ số nâng cấp của người dùng
  const [userStats, setUserStats] = useState({ hp: 0, atk: 0, def: 0 });
  const [jackpotPool, setJackpotPool] = useState(0);

  // States for managing overlay visibility
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isGoldMineOpen, setIsGoldMineOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isBlacksmithOpen, setIsBlacksmithOpen] = useState(false);
  const [isMinerChallengeOpen, setIsMinerChallengeOpen] = useState(false);
  const [isBossBattleOpen, setIsBossBattleOpen] = useState(false); // THAY THẾ: isTowerGameOpen
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVocabularyChestOpen, setIsVocabularyChestOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUpgradeScreenOpen, setIsUpgradeScreenOpen] = useState(false);

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const db = getFirestore();

  // Set body overflow and app height
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  const fetchVocabularyData = async (userId: string) => {
    try {
        const completedWordsCol = collection(db, 'users', userId, 'completedWords');
        const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');

        const [completedWordsSnap, achievementDocSnap] = await Promise.all([
            getDocs(completedWordsCol),
            getDoc(achievementDocRef),
        ]);

        const wordToExpMap = new Map<string, number>();
        completedWordsSnap.forEach(wordDoc => {
            const word = wordDoc.id;
            const gameModes = wordDoc.data().gameModes || {};
            let totalCorrectCount = 0;
            Object.values(gameModes).forEach((mode: any) => {
                totalCorrectCount += mode.correctCount || 0;
            });
            wordToExpMap.set(word, totalCorrectCount * 100);
        });

        const existingAchievements: VocabularyItem[] = achievementDocSnap.exists()
            ? achievementDocSnap.data().vocabulary || []
            : [];

        const finalVocabularyData: VocabularyItem[] = [];
        const processedWords = new Set<string>();
        let idCounter = (existingAchievements.length > 0 ? Math.max(...existingAchievements.map((i: VocabularyItem) => i.id)) : 0) + 1;

        wordToExpMap.forEach((totalExp, word) => {
            const existingItem = existingAchievements.find(item => item.word === word);

            if (existingItem) {
                let expSpentToReachCurrentLevel = 0;
                for (let i = 1; i < existingItem.level; i++) {
                    expSpentToReachCurrentLevel += i * 100;
                }
                const currentProgressExp = totalExp - expSpentToReachCurrentLevel;

                finalVocabularyData.push({
                    ...existingItem,
                    exp: currentProgressExp,
                    maxExp: existingItem.level * 100,
                });
            } else {
                finalVocabularyData.push({
                    id: idCounter++,
                    word: word,
                    exp: totalExp,
                    level: 1,
                    maxExp: 100,
                });
            }
            processedWords.add(word);
        });

        existingAchievements.forEach(item => {
            if (!processedWords.has(item.word)) {
                finalVocabularyData.push(item);
            }
        });

        console.log("Vocabulary achievements data synced and merged correctly.");
        setVocabularyData(finalVocabularyData);

    } catch (error) {
        console.error("Error fetching and syncing vocabulary achievements data:", error);
        setVocabularyData(initialVocabularyData);
    }
  };

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
        setMasteryCards(userData.masteryCards || 0);
        setPickaxes(typeof userData.pickaxes === 'number' ? userData.pickaxes : 50);
        setMinerChallengeHighestFloor(userData.minerChallengeHighestFloor || 0); // Lấy dữ liệu tầng cao nhất
        setUserStats(userData.stats || { hp: 0, atk: 0, def: 0 }); // Lấy dữ liệu chỉ số
      } else {
        console.log("No user document found, creating default.");
        await setDoc(userDocRef, {
          coins: 0,
          gems: 0,
          masteryCards: 0,
          stats: { hp: 0, atk: 0, def: 0 }, // Khởi tạo chỉ số cho người dùng mới
          pickaxes: 50,
          minerChallengeHighestFloor: 0, // Khởi tạo cho người dùng mới
          createdAt: new Date(),
        });
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setMasteryCards(0);
        setPickaxes(50);
        setMinerChallengeHighestFloor(0);
        setUserStats({ hp: 0, atk: 0, def: 0 });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const fetchJackpotPool = async () => {
    try {
        const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
        const jackpotDocSnap = await getDoc(jackpotDocRef);
        if (jackpotDocSnap.exists()) {
            const data = jackpotDocSnap.data();
            setJackpotPool(data.poolAmount || 200);
            console.log("Jackpot Pool fetched:", data.poolAmount);
        } else {
            console.log("No global jackpot pool document found, creating default.");
            await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
            setJackpotPool(200);
        }
    } catch (error) {
        console.error("Error fetching jackpot pool:", error);
    }
  };

  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    if (!userId) {
      console.error("Cannot update coins: User not authenticated.");
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, {
            coins: coins, gems: gems, createdAt: new Date()
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + amount;
          const finalCoins = Math.max(0, newCoins);
          transaction.update(userDocRef, { coins: finalCoins });
          console.log(`Coins updated in Firestore for user ${userId}: ${currentCoins} -> ${finalCoins}`);
          setCoins(finalCoins);
        }
      });
    } catch (error) {
      console.error("Firestore Transaction failed for coins: ", error);
    }
  };

  const updateMasteryCardsInFirestore = async (userId: string, amount: number) => {
    if (!userId) {
      console.error("Cannot update mastery cards: User not authenticated.");
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { masteryCards: amount });
        } else {
          const currentCards = userDoc.data().masteryCards || 0;
          const newCards = currentCards + amount;
          transaction.update(userDocRef, { masteryCards: newCards });
          setMasteryCards(newCards);
        }
      });
      console.log(`Mastery Cards updated in Firestore for user ${userId}.`);
    } catch (error) {
      console.error("Firestore Transaction failed for mastery cards: ", error);
    }
  };

  const updatePickaxesInFirestore = async (userId: string, newTotalAmount: number) => {
      if (!userId) {
          console.error("Cannot update pickaxes: User not authenticated.");
          return;
      }
      const userDocRef = doc(db, 'users', userId);
      try {
          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              const finalAmount = Math.max(0, newTotalAmount);
              if (!userDoc.exists()) {
                  transaction.set(userDocRef, { pickaxes: finalAmount });
              } else {
                  transaction.update(userDocRef, { pickaxes: finalAmount });
              }
              setPickaxes(finalAmount);
          });
      } catch (error) {
          console.error("Firestore Transaction failed for pickaxes: ", error);
      }
  };

  // Hàm cập nhật tầng cao nhất đã hoàn thành lên Firestore
  const updateHighestFloorInFirestore = async (userId: string, completedFloor: number) => {
      if (!userId) {
          console.error("Cannot update highest floor: User not authenticated.");
          return;
      }
      // Chỉ cập nhật nếu tầng hoàn thành mới lớn hơn tầng cao nhất đã lưu
      if (completedFloor <= minerChallengeHighestFloor) {
          return;
      }

      const userDocRef = doc(db, 'users', userId);
      try {
          await runTransaction(db, async (transaction) => {
              transaction.update(userDocRef, { minerChallengeHighestFloor: completedFloor });
          });
          setMinerChallengeHighestFloor(completedFloor); // Cập nhật state ở local
          console.log(`Highest floor updated in Firestore for user ${userId} to: ${completedFloor}`);
      } catch (error) {
          console.error("Firestore Transaction failed for highest floor: ", error);
      }
  };

  // Hàm cập nhật chỉ số (HP, ATK, DEF) lên Firestore
  const updateStatsInFirestore = async (userId: string, newStats: { hp: number; atk: number; def: number; }) => {
      if (!userId) {
          console.error("Cannot update stats: User not authenticated.");
          return;
      }
      const userDocRef = doc(db, 'users', userId);
      try {
          await runTransaction(db, async (transaction) => {
              // Chỉ cần cập nhật trường 'stats' trong document của người dùng
              transaction.update(userDocRef, { stats: newStats });
          });
          setUserStats(newStats); // Cập nhật state ở local
          console.log(`User stats updated in Firestore for user ${userId}.`);
      } catch (error) {
          console.error("Firestore Transaction failed for stats: ", error);
      }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("Cannot update pickaxes: User not authenticated.");
        return;
    }
    const newTotal = pickaxes + amountToAdd;
    await updatePickaxesInFirestore(userId, newTotal);
  };

  const updateJackpotPoolInFirestore = async (amount: number, resetToDefault: boolean = false) => {
      const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
      try {
          await runTransaction(db, async (transaction) => {
              const jackpotDoc = await transaction.get(jackpotDocRef);
              let newJackpotPool;
              if (!jackpotDoc.exists()) {
                  newJackpotPool = resetToDefault ? 200 : 200 + amount;
                  transaction.set(jackpotDocRef, { poolAmount: newJackpotPool, lastUpdated: new Date() });
              } else {
                  let currentPool = jackpotDoc.data().poolAmount || 200;
                  newJackpotPool = resetToDefault ? 200 : currentPool + amount;
                  transaction.update(jackpotDocRef, { poolAmount: newJackpotPool, lastUpdated: new Date() });
              }
              setJackpotPool(newJackpotPool);
          });
      } catch (error) {
          console.error("Firestore Transaction failed for jackpot pool: ", error);
      }
  };

  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
        fetchVocabularyData(user.uid);
        fetchJackpotPool();
      } else {
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
        setIsBackgroundPaused(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setMasteryCards(0);
        setPickaxes(0);
        setMinerChallengeHighestFloor(0);
        setUserStats({ hp: 0, atk: 0, def: 0 });
        setJackpotPool(0);
        setIsLoadingUserData(true);
        setVocabularyData(null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              setIsBackgroundPaused(true);
          } else {
              setIsBackgroundPaused(false);
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTap = () => { };

  const isLoading = isLoadingUserData || !assetsLoaded || vocabularyData === null;

  useEffect(() => {
    if (displayedCoins === coins) return;
    const timeoutId = setTimeout(() => {
      setDisplayedCoins(coins);
    }, 100);
    return () => clearTimeout(timeoutId);

  }, [coins]);

  const renderCharacter = () => {
    const isAnyOverlayOpen = isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;

    return (
      <div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20">
        <DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isPaused} className="w-full h-full" />
      </div>
    );
  };

  // HÀM NHẬN THƯỞNG ĐÃ ĐƯỢC NÂNG CẤP
  const handleRewardClaim = async (
    reward: { gold: number; masteryCards: number },
    updatedVocabulary: VocabularyItem[]
  ) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Cannot claim reward: User not authenticated.");
      // Ném lỗi để component con có thể bắt và xử lý
      throw new Error("User not authenticated");
    }

    const userDocRef = doc(db, 'users', userId);
    const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');

    // Bọc tất cả các thao tác ghi trong một giao dịch
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists()) {
        throw "User document does not exist!";
      }

      // 1. Cập nhật Vàng và Thẻ Thông Thạo
      const currentCoins = userDoc.data().coins || 0;
      const currentCards = userDoc.data().masteryCards || 0;
      const newCoins = currentCoins + reward.gold;
      const newCards = currentCards + reward.masteryCards;

      transaction.update(userDocRef, {
        coins: newCoins,
        masteryCards: newCards
      });

      // 2. Cập nhật danh sách thành tựu
      transaction.set(achievementDocRef, { vocabulary: updatedVocabulary }, { merge: true });
    });

    console.log("Reward claimed and achievements updated successfully in a single transaction.");

    // 3. Cập nhật state của React SAU KHI transaction thành công
    // Điều này đảm bảo UI luôn đồng bộ với dữ liệu đã được lưu thành công
    setCoins(prev => prev + reward.gold);
    setMasteryCards(prev => prev + reward.masteryCards);
    setVocabularyData(updatedVocabulary);
  };

    const toggleRank = () => {
     if (isLoading) return;
     setIsRankOpen(prev => {
         const newState = !prev;
         if (newState) {
             hideNavBar();
             setIsGoldMineOpen(false);
             setIsInventoryOpen(false);
             setIsMinerChallengeOpen(false);
             setIsLuckyGameOpen(false);
             setIsBlacksmithOpen(false);
             setIsBossBattleOpen(false); // THAY THẾ
             setIsShopOpen(false);
             setIsVocabularyChestOpen(false);
             setIsAchievementsOpen(false);
             setIsAdminPanelOpen(false);
             setIsUpgradeScreenOpen(false);
         } else {
             showNavBar();
         }
         return newState;
         });
  };

  const toggleGoldMine = () => {
    if (isLoading) return;
    setIsGoldMineOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleInventory = () => {
    if (isLoading) return;
    setIsInventoryOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleLuckyGame = () => {
    if (isLoading) return;
    setIsLuckyGameOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleMinerChallenge = () => {
    if (isLoading) return;
    setIsMinerChallengeOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };
  const toggleBlacksmith = () => {
    if (isLoading) return;
    setIsBlacksmithOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  // THAY THẾ: toggleTowerGame -> toggleBossBattle
  const toggleBossBattle = () => {
    if (isLoading) return;
    setIsBossBattleOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleShop = () => {
    if (isLoading) return;
    setIsShopOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleVocabularyChest = () => {
    if (isLoading) return;
    setIsVocabularyChestOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleAchievements = () => {
    if (isLoading) return;
    setIsAchievementsOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAdminPanelOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleAdminPanel = () => {
    if (isLoading) return;

    setIsAdminPanelOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsMinerChallengeOpen(false);
        setIsLuckyGameOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsUpgradeScreenOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const toggleUpgradeScreen = () => {
    if (isLoading) return;
    setIsUpgradeScreenOpen(prev => {
      const newState = !prev;
      if (newState) {
        hideNavBar();
        setIsRankOpen(false);
        setIsGoldMineOpen(false);
        setIsInventoryOpen(false);
        setIsLuckyGameOpen(false);
        setIsMinerChallengeOpen(false);
        setIsBlacksmithOpen(false);
        setIsBossBattleOpen(false); // THAY THẾ
        setIsShopOpen(false);
        setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false);
        setIsAdminPanelOpen(false);
      } else {
        showNavBar();
      }
      return newState;
    });
  };

  const handleSetToggleSidebar = (toggleFn: () => void) => {
      sidebarToggleRef.current = toggleFn;
  };

  const isAnyOverlayOpen = isRankOpen || isGoldMineOpen || isInventoryOpen || isLuckyGameOpen || isBlacksmithOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
  const isAdmin = auth.currentUser?.email === 'vanlongt309@gmail.com';

  // Tính toán chỉ số cuối cùng của người chơi để truyền vào BossBattle
  const finalPlayerStatsForBoss = {
      maxHp: BASE_PLAYER_STATS.hp + calculateTotalStatValue(userStats.hp, STAT_BONUS_CONFIG.hp),
      hp: BASE_PLAYER_STATS.hp + calculateTotalStatValue(userStats.hp, STAT_BONUS_CONFIG.hp),
      atk: BASE_PLAYER_STATS.atk + calculateTotalStatValue(userStats.atk, STAT_BONUS_CONFIG.atk),
      def: BASE_PLAYER_STATS.def + calculateTotalStatValue(userStats.def, STAT_BONUS_CONFIG.def),
      maxEnergy: 50,
      energy: 50,
  };

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout
          setToggleSidebar={handleSetToggleSidebar}
          onShowRank={toggleRank}
          onShowGoldMine={toggleGoldMine}
          onShowLuckyGame={toggleLuckyGame}
          onShowMinerChallenge={toggleMinerChallenge}
          onShowAchievements={toggleAchievements}
          onShowUpgrade={toggleUpgradeScreen}
          onShowAdmin={isAdmin ? toggleAdminPanel : undefined}
      >
        <DungeonCanvasBackground isPaused={isGamePaused} />

        <div
          style={{
            display: isAnyOverlayOpen ? 'none' : 'block',
            visibility: isLoading ? 'hidden' : 'visible'
          }}
          className="w-full h-full"
        >
          <div
            className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`}
            onClick={handleTap}
          >
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
                        src={uiAssets.menuIcon}
                        alt="Menu Icon"
                        className="w-5 h-5 object-contain"
                     />
                </button>

                <div className="flex-1"></div>

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
                    <CoinDisplay displayedCoins={displayedCoins} />
                </div>
            </div>

            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                // THAY THẾ: onClick: toggleTowerGame -> toggleBossBattle
                { icon: <img src={uiAssets.towerIcon} alt="Boss Battle Icon" className="w-full h-full object-contain" />, onClick: toggleBossBattle },
                { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop },
                { icon: <img src={uiAssets.inventoryIcon} alt="Inventory Icon" className="w-full h-full object-contain" />, onClick: toggleInventory }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}>
                      {item.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[
                { icon: <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000fe00622fb8cc4792a683dcb3.png" alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest },
                { icon: <img src={uiAssets.missionIcon} alt="Mission Icon" className="w-full h-full object-contain" /> },
                { icon: <img src={uiAssets.blacksmithIcon} alt="Blacksmith Icon" className="w-full h-full object-contain" />, onClick: toggleBlacksmith },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                    <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}>
                        {item.icon}
                    </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}>
             <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isGoldMineOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{auth.currentUser && (<GoldMine onClose={toggleGoldMine} currentCoins={coins} onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} onUpdateDisplayedCoins={(amount) => setDisplayedCoins(amount)} currentUserId={auth.currentUser!.uid} isGamePaused={isAnyOverlayOpen}/>)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isInventoryOpen ? 'block' : 'none' }}>
            <ErrorBoundary><Inventory onClose={toggleInventory} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{auth.currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={(amount, reset) => updateJackpotPoolInFirestore(amount, reset)} />)}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBlacksmithOpen ? 'block' : 'none' }}>
            <ErrorBoundary><Blacksmith onClose={toggleBlacksmith} /></ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isMinerChallengeOpen && auth.currentUser && (
                <MinerChallenge
                    onClose={toggleMinerChallenge} displayedCoins={displayedCoins} masteryCards={masteryCards}
                    onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)}
                    initialPickaxes={pickaxes}
                    onUpdatePickaxes={(newCount) => updatePickaxesInFirestore(auth.currentUser!.uid, newCount)}
                    initialHighestFloor={minerChallengeHighestFloor}
                    onUpdateHighestFloor={(floor) => updateHighestFloorInFirestore(auth.currentUser!.uid, floor)}
                />)}</ErrorBoundary>
        </div>
        {/* THAY THẾ: TowerExplorerGame -> BossBattle */}
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isBossBattleOpen && auth.currentUser && (
                    <BossBattle
                        onClose={toggleBossBattle}
                        playerInitialStats={finalPlayerStatsForBoss}
                        onBattleEnd={(result, rewards) => {
                            console.log(`Battle ended: ${result}, Rewards: ${rewards.coins} coins`);
                            if (result === 'win' && auth.currentUser) {
                                updateCoinsInFirestore(auth.currentUser.uid, rewards.coins);
                            }
                        }}
                    />
                )}
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} />}</ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isVocabularyChestOpen && currentUser && (
                <VocabularyChestScreen
                    onClose={toggleVocabularyChest}
                    currentUserId={currentUser.uid}
                    onUpdateCoins={(amount) => updateCoinsInFirestore(currentUser.uid, amount)}
                    onGemReward={handleGemReward}
                    displayedCoins={displayedCoins}
                />
            )}</ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isAchievementsOpen && auth.currentUser && Array.isArray(vocabularyData) && (
                    <AchievementsScreen
                        onClose={toggleAchievements}
                        userId={auth.currentUser.uid}
                        initialData={vocabularyData}
                        onClaimReward={handleRewardClaim} // SỬ DỤNG HÀM MỚI
                        masteryCardsCount={masteryCards}
                        displayedCoins={displayedCoins}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isUpgradeScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isUpgradeScreenOpen && auth.currentUser && (
                    <UpgradeStatsScreen
                        onClose={toggleUpgradeScreen}
                        initialGold={coins}
                        onUpdateGold={(amount) => updateCoinsInFirestore(auth.currentUser.uid, amount)}
                        initialStats={userStats}
                        onUpdateStats={(newStats) => updateStatsInFirestore(auth.currentUser.uid, newStats)}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary>
        </div>
      </SidebarLayout>

      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
            <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
