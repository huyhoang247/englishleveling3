// --- START OF FILE background-game.tsx ---

import React, { useState, useEffect, useRef, Component } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CoinDisplay from './coin-display.tsx';
import { getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { auth } from './firebase.js';
import { User } from 'firebase/auth';
import useSessionStorage from './bo-nho-tam.tsx';
import HeaderBackground from './header-background.tsx';
import { SidebarLayout } from './sidebar.tsx';
import EnhancedLeaderboard from './rank.tsx';
import Inventory from './inventory.tsx';
import DungeonCanvasBackground from './background-canvas.tsx';
import LuckyChestGame from './lucky-game.tsx';
import { uiAssets, lottieAssets } from './game-assets.ts';
import BossBattle from './boss.tsx';
import Shop from './shop.tsx';
import VocabularyChestScreen from './lat-the.tsx';
import MinerChallenge from './bomb.tsx';
import UpgradeStatsScreen, { calculateTotalStatValue, statConfig } from './upgrade-stats.tsx';
import AchievementsScreen, { initialVocabularyData } from './thanh-tuu.tsx';
import AdminPanel from './admin.tsx';
import BaseBuildingScreen from './building.tsx';
import SkillScreen from './skill.tsx';
import { OwnedSkill, ALL_SKILLS, SkillBlueprint } from './skill-data.tsx';
import EquipmentScreen, { OwnedItem, EquippedItems } from './equipment.tsx';
import RateLimitToast from './thong-bao.tsx';
// TÁI CẤU TRÚC: Import các hàm từ file service mới
import { 
  fetchOrCreateUserGameData, 
  updateUserCoins, 
  updateUserGems,
  fetchAndSyncVocabularyData,
  VocabularyItem
} from './gameDataService.ts';


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


// --- START of content from icon.tsx ---

// --- Component Icon Gem ---
// Định nghĩa props cho GemIcon
interface GemIconProps {
  size?: number; // Kích thước icon (mặc định 24)
  color?: string; // Màu sắc icon (mặc định 'currentColor') - Lưu ý: SVG này dùng ảnh, màu sắc có thể không áp dụng trực tiếp
  className?: string; // Các class CSS bổ sung
  [key: string]: any; // Cho phép các props khác như onClick, style, v.v.
}

// Component GemIcon: Hiển thị icon viên ngọc
const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  // Lưu ý: Icon này sử dụng ảnh, nên thuộc tính 'color' sẽ không thay đổi màu của ảnh.
  // Bạn có thể cần thay đổi ảnh hoặc sử dụng SVG gốc nếu muốn thay đổi màu sắc động.
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
      <img
        // Sử dụng ảnh từ tệp tài nguyên tập trung
        src={uiAssets.gemIcon}
        alt="Tourmaline Gem Icon" // Alt text cho khả năng tiếp cận
        className="w-full h-full object-contain" // Đảm bảo ảnh vừa với container
      />
    </div>
  );
};

// --- Component Stats Icon ---
// Định nghĩa props cho StatsIcon
interface StatsIconProps {
  onClick: () => void; // Hàm được gọi khi icon được click
  // Thêm các props khác nếu cần cho styling hoặc state
}

// Component StatsIcon: Hiển thị icon mở màn hình chỉ số
const StatsIcon: React.FC<StatsIconProps> = ({ onClick }) => {
  return (
    // Container div cho icon
    // Thêm relative và z-10 để đảm bảo nó nằm trên các lớp nền trong header
    <div className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10"
         onClick={onClick} // Gọi hàm onClick khi được click
         title="Xem chỉ số nhân vật" // Tooltip cho khả năng tiếp cận
    >
      {/* Thẻ img cho icon */}
      <img
        src={uiAssets.statsIcon} // Sử dụng biến từ tệp tài nguyên
        alt="Award Icon" // Alt text cho khả năng tiếp cận
        className="w-full h-full object-contain" // Đảm bảo ảnh vừa với container
        // Xử lý lỗi tải ảnh
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Ép kiểu sang HTMLImageElement
          target.onerror = null; // Ngăn chặn vòng lặp vô hạn nếu placeholder cũng lỗi
          // Cập nhật placeholder hoặc xử lý lỗi tải ảnh từ đường dẫn local nếu cần
          target.src = "https://placehold.co/32x32/ffffff/000000?text=Icon"; // Hiển thị ảnh placeholder khi lỗi
        }}
      />
    </div>
  );
};

// --- END of content from icon.tsx ---


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
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  const [userStats, setUserStats] = useState({ hp: 0, atk: 0, def: 0 });
  const [jackpotPool, setJackpotPool] = useState(0);
  const [bossBattleHighestFloor, setBossBattleHighestFloor] = useState(0);
  const [ancientBooks, setAncientBooks] = useState(0);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });



  // States for managing overlay visibility
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLuckyGameOpen, setIsLuckyGameOpen] = useState(false);
  const [isMinerChallengeOpen, setIsMinerChallengeOpen] = useState(false);
  const [isBossBattleOpen, setIsBossBattleOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVocabularyChestOpen, setIsVocabularyChestOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUpgradeScreenOpen, setIsUpgradeScreenOpen] = useState(false);
  const [isBaseBuildingOpen, setIsBaseBuildingOpen] = useState(false);
  const [isSkillScreenOpen, setIsSkillScreenOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

  // States for data syncing and rate limiting UI
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);

  const sidebarToggleRef = useRef<(() => void) | null>(null);
  const db = getFirestore();

  // Set body overflow and app height
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const setAppHeight = () => { document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`); };
    window.addEventListener('resize', setAppHeight); setAppHeight();
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  // Effect to hide the "too fast" toast after a delay
  useEffect(() => {
    if (showRateLimitToast) {
      const timer = setTimeout(() => {
        setShowRateLimitToast(false);
      }, 2500); // Hide after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showRateLimitToast]);

  const fetchVocabularyData = async (userId: string) => {
    try {
      // TÁI CẤU TRÚC: Gọi hàm từ service để lấy dữ liệu thành tựu
      const syncedData = await fetchAndSyncVocabularyData(userId);
      setVocabularyData(syncedData);
      console.log("Vocabulary achievements data synced via service.");
    } catch (error) {
      console.error("Error fetching vocabulary data via service:", error);
      // Giữ lại fallback để UI không bị crash
      setVocabularyData(initialVocabularyData); 
    }
  };

  const fetchJackpotPool = async () => {
    try {
        const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
        const jackpotDocSnap = await getDoc(jackpotDocRef);
        if (jackpotDocSnap.exists()) {
            const data = jackpotDocSnap.data(); setJackpotPool(data.poolAmount || 200);
            console.log("Jackpot Pool fetched:", data.poolAmount);
        } else {
            console.log("No global jackpot pool document found, creating default.");
            await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() }); setJackpotPool(200);
        }
    } catch (error) { console.error("Error fetching jackpot pool:", error); }
  };
    
  const handleBossFloorUpdate = async (newFloor: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Cannot update boss floor: User not authenticated.");
      return;
    }
    if (newFloor <= bossBattleHighestFloor) {
      console.log(`New floor ${newFloor} is not higher than current ${bossBattleHighestFloor}. No update needed.`);
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
      await setDoc(userDocRef, { bossBattleHighestFloor: newFloor }, { merge: true });
      setBossBattleHighestFloor(newFloor); 
      console.log(`Updated boss floor to ${newFloor} for user ${userId}.`);
    } catch (error) {
      console.error("Firestore update failed for boss floor: ", error);
    }
  };
  
  const updateMasteryCardsInFirestore = async (userId: string, amount: number) => {
    if (!userId) { console.error("Cannot update mastery cards: User not authenticated."); return; }
    const userDocRef = doc(db, 'users', userId);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) { transaction.set(userDocRef, { masteryCards: amount }); } 
        else {
          const currentCards = userDoc.data().masteryCards || 0;
          const newCards = currentCards + amount; transaction.update(userDocRef, { masteryCards: newCards });
          setMasteryCards(newCards);
        }
      });
      console.log(`Mastery Cards updated in Firestore for user ${userId}.`);
    } catch (error) { console.error("Firestore Transaction failed for mastery cards: ", error); }
  };
    
  const handleMinerChallengeEnd = async (result: {
    finalPickaxes: number;
    coinsEarned: number;
    highestFloorCompleted: number;
  }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Cannot update game data: User not authenticated.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);
    console.log("Ending Miner Challenge session. Updating Firestore with:", result);

    if (result.finalPickaxes === pickaxes && result.coinsEarned === 0 && result.highestFloorCompleted <= minerChallengeHighestFloor) {
        console.log("No changes to update from Miner Challenge.");
        return;
    }

    setIsSyncingData(true);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          transaction.set(userDocRef, {
            coins: result.coinsEarned,
            pickaxes: result.finalPickaxes,
            minerChallengeHighestFloor: result.highestFloorCompleted,
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + result.coinsEarned;

          transaction.update(userDocRef, {
            coins: newCoins,
            pickaxes: result.finalPickaxes,
            minerChallengeHighestFloor: Math.max(
              userDoc.data().minerChallengeHighestFloor || 0,
              result.highestFloorCompleted
            ),
          });
        }
      });
      
      setPickaxes(result.finalPickaxes);
      setCoins(prevCoins => prevCoins + result.coinsEarned);
      if (result.highestFloorCompleted > minerChallengeHighestFloor) {
        setMinerChallengeHighestFloor(result.highestFloorCompleted);
      }
      
      console.log("Firestore updated successfully after Miner Challenge.");

    } catch (error) {
      console.error("Firestore Transaction failed for Miner Challenge end: ", error);
    } finally {
      setIsSyncingData(false);
    }
  };

  const updatePickaxesInFirestore = async (userId: string, newTotalAmount: number) => {
      if (!userId) { console.error("Cannot update pickaxes: User not authenticated."); return; }
      const userDocRef = doc(db, 'users', userId);
      try {
          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              const finalAmount = Math.max(0, newTotalAmount);
              if (!userDoc.exists()) { transaction.set(userDocRef, { pickaxes: finalAmount }); } 
              else { transaction.update(userDocRef, { pickaxes: finalAmount }); }
              setPickaxes(finalAmount);
          });
      } catch (error) { console.error("Firestore Transaction failed for pickaxes: ", error); }
  };

  const handleUpdatePickaxes = async (amountToAdd: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error("Cannot update pickaxes: User not authenticated."); return; }
    const newTotal = pickaxes + amountToAdd;
    await updatePickaxesInFirestore(userId, newTotal);
  };
  
  const updateJackpotPoolInFirestore = async (amount: number, resetToDefault: boolean = false) => {
      const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
      try {
          await runTransaction(db, async (transaction) => {
              const jackpotDoc = await transaction.get(jackpotDocRef); let newJackpotPool;
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
      } catch (error) { console.error("Firestore Transaction failed for jackpot pool: ", error); }
  };

  const handleGemReward = async (amount: number) => {
    if (auth.currentUser) {
      const newGems = await updateUserGems(auth.currentUser.uid, amount);
      setGems(newGems);
    }
  };
    
  const handleConfirmStatUpgrade = async (
    userId: string,
    upgradeCost: number,
    newStats: { hp: number; atk: number; def: number; }
  ) => {
    if (!userId) {
      console.error("Không thể nâng cấp: Người dùng chưa xác thực.");
      throw new Error("Người dùng chưa xác thực"); 
    }
    const userDocRef = doc(db, 'users', userId);
    setIsSyncingData(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw "Tài liệu người dùng không tồn tại!";
        }
        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < upgradeCost) {
          throw new Error("Không đủ vàng trên server."); 
        }
        const newCoins = currentCoins - upgradeCost;
        transaction.update(userDocRef, {
          coins: newCoins,
          stats: newStats,
        });
      });
      console.log(`Nâng cấp chỉ số thành công cho user ${userId}. Dữ liệu đã nhất quán.`);
      setCoins(prevCoins => prevCoins - upgradeCost);
      setUserStats(newStats);
    } catch (error) {
      console.error("Giao dịch Firestore cho việc nâng cấp chỉ số thất bại: ", error);
      throw error;
    } finally {
      setIsSyncingData(false);
    }
  };

  const handleSkillsUpdate = async (updates: {
      newOwned: OwnedSkill[];
      newEquippedIds: (string | null)[];
      goldChange: number;
      booksChange: number;
  }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) { throw new Error("User not authenticated for skill update."); }

      const userDocRef = doc(db, 'users', userId);
      setIsSyncingData(true);

      try {
          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) { throw new Error("User document does not exist!"); }

              const currentCoins = userDoc.data().coins || 0;
              const currentBooks = userDoc.data().ancientBooks || 0;

              const newCoins = currentCoins + updates.goldChange;
              const newBooks = currentBooks + updates.booksChange;

              if (newCoins < 0) { throw new Error("Không đủ vàng."); }
              if (newBooks < 0) { throw new Error("Không đủ Sách Cổ."); }

              transaction.update(userDocRef, {
                  coins: newCoins,
                  ancientBooks: newBooks,
                  skills: {
                      owned: updates.newOwned,
                      equipped: updates.newEquippedIds
                  }
              });
          });

          // Update local state upon successful transaction
          setCoins(prev => prev + updates.goldChange);
          setAncientBooks(prev => prev + updates.booksChange);
          setOwnedSkills(updates.newOwned);
          setEquippedSkillIds(updates.newEquippedIds);
          
          console.log("Skill data and resources updated successfully in Firestore.");

      } catch (error) {
          console.error("Firestore transaction for skill update failed:", error);
          // Re-throw the error so the calling component (SkillScreen) can handle it
          throw error;
      } finally {
          setIsSyncingData(false);
      }
  };
    
  const handleInventoryUpdate = async (updates: {
      newOwned: OwnedItem[];
      newEquipped: EquippedItems;
      goldChange: number;
      piecesChange: number; 
  }) => {
      const userId = auth.currentUser?.uid;
      if (!userId) { throw new Error("User not authenticated for inventory update."); }
  
      const userDocRef = doc(db, 'users', userId);
      setIsSyncingData(true);
  
      try {
          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) { throw new Error("User document does not exist!"); }
  
              const currentCoins = userDoc.data().coins || 0;
              const currentEquipment = userDoc.data().equipment || { pieces: 0, owned: [], equipped: { weapon: null, armor: null, accessory: null } };
              const currentPieces = currentEquipment.pieces || 0;
  
              const newCoins = currentCoins + updates.goldChange;
              const newPieces = currentPieces + updates.piecesChange;
  
              if (newCoins < 0) { throw new Error("Không đủ vàng."); }
              if (newPieces < 0) { throw new Error("Không đủ Mảnh trang bị."); }
  
              transaction.update(userDocRef, {
                  coins: newCoins,
                  equipment: { 
                      ...currentEquipment,
                      pieces: newPieces, 
                      owned: updates.newOwned, 
                      equipped: updates.newEquipped 
                  }
              });
          });
  
          setCoins(prev => prev + updates.goldChange);
          setEquipmentPieces(prev => prev + updates.piecesChange);
          setOwnedItems(updates.newOwned);
          setEquippedItems(updates.newEquipped);
          
          console.log("Equipment data and resources updated successfully in Firestore.");
  
      } catch (error) {
          console.error("Firestore transaction for equipment update failed:", error);
          throw error;
      } finally {
          setIsSyncingData(false);
      }
  };    

  const handleShopPurchase = async (item: any, quantity: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Cannot purchase item: User not authenticated.");
      throw new Error("Người dùng chưa được xác thực.");
    }
    if (!item || typeof item.price !== 'number' || !item.id || typeof quantity !== 'number' || quantity <= 0) {
      console.error("Invalid item data for purchase:", item);
      throw new Error("Dữ liệu vật phẩm hoặc số lượng không hợp lệ.");
    }

    const userDocRef = doc(db, 'users', userId);
    const totalCost = item.price * quantity;
    setIsSyncingData(true);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) { throw new Error("Tài liệu người dùng không tồn tại!"); }

        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < totalCost) { throw new Error("Không đủ vàng."); }

        const updates: { [key: string]: any } = { coins: currentCoins - totalCost, };

        if (item.id === 1009) { // Sách Cổ
          const currentBooks = userDoc.data().ancientBooks || 0;
          updates.ancientBooks = currentBooks + quantity;
        } else if (item.id === 2001) { // Nâng Cấp Sức Chứa Thẻ
          const currentCapacity = userDoc.data().cardCapacity || 100;
          updates.cardCapacity = currentCapacity + quantity;
        } else {
           console.warn(`Purchase logic might not be fully implemented for item ID: ${item.id}`);
        }

        transaction.update(userDocRef, updates);
      });

      // Update local state after successful transaction
      setCoins(prev => prev - totalCost);
      if (item.id === 1009) {
        setAncientBooks(prev => prev + quantity);
      } else if (item.id === 2001) {
        setCardCapacity(prev => prev + quantity);
      }

      console.log(`Purchase successful for ${quantity}x ${item.name}.`);
      alert(`Mua thành công x${quantity} ${item.name}!`);

    } catch (error) {
      console.error("Shop purchase transaction failed:", error);
      alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsSyncingData(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => { // Make async
      if (user) {
        setIsLoadingUserData(true);
        try {
          // TÁI CẤU TRÚC: Gọi hàm từ gameDataService.ts
          const gameData = await fetchOrCreateUserGameData(user.uid);
          
          // Cập nhật tất cả state từ dữ liệu nhận được
          setCoins(gameData.coins);
          setDisplayedCoins(gameData.coins);
          setGems(gameData.gems);
          setMasteryCards(gameData.masteryCards);
          setPickaxes(gameData.pickaxes);
          setMinerChallengeHighestFloor(gameData.minerChallengeHighestFloor);
          setUserStats(gameData.stats);
          setBossBattleHighestFloor(gameData.bossBattleHighestFloor);
          setAncientBooks(gameData.ancientBooks);
          setOwnedSkills(gameData.skills.owned);
          setEquippedSkillIds(gameData.skills.equipped);
          setTotalVocabCollected(gameData.totalVocabCollected);
          setCardCapacity(gameData.cardCapacity);
          setEquipmentPieces(gameData.equipment.pieces);
          setOwnedItems(gameData.equipment.owned);
          setEquippedItems(gameData.equipment.equipped);
          
          // Các hàm fetch khác
          fetchVocabularyData(user.uid);
          fetchJackpotPool();
        } catch (error) {
          console.error("Error fetching user game data:", error);
        } finally {
          setIsLoadingUserData(false);
        }
      } else {
        setIsRankOpen(false); setIsInventoryOpen(false); setIsLuckyGameOpen(false);
        setIsBossBattleOpen(false); setIsShopOpen(false); setIsVocabularyChestOpen(false);
        setIsAchievementsOpen(false); setIsAdminPanelOpen(false); setIsUpgradeScreenOpen(false);
        setIsBackgroundPaused(false); setCoins(0); setDisplayedCoins(0); setGems(0); setMasteryCards(0);
        setPickaxes(0); setMinerChallengeHighestFloor(0); setUserStats({ hp: 0, atk: 0, def: 0 });
        setBossBattleHighestFloor(0);
        setAncientBooks(0);
        setOwnedSkills([]);
        setEquippedSkillIds([null, null, null]);
        setTotalVocabCollected(0);
        setEquipmentPieces(0);
        setOwnedItems([]);
        setEquippedItems({ weapon: null, armor: null, accessory: null });
        setCardCapacity(100);
        setJackpotPool(0); setIsLoadingUserData(true); setVocabularyData(null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) { setIsBackgroundPaused(true); } 
          else { setIsBackgroundPaused(false); }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTap = () => { };
  const isLoading = isLoadingUserData || !assetsLoaded || vocabularyData === null;
  useEffect(() => {
    if (displayedCoins === coins) return;
    const timeoutId = setTimeout(() => { setDisplayedCoins(coins); }, 100);
    return () => clearTimeout(timeoutId);
  }, [coins]);

  const renderCharacter = () => {
    const isAnyOverlayOpen = isRankOpen || isInventoryOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen;
    const isPaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
    return (
      <div className="character-container absolute w-28 h-28 left-1/2 -translate-x-1/2 bottom-40 z-20">
        <DotLottieReact src={lottieAssets.characterRun} loop autoplay={!isPaused} className="w-full h-full" />
      </div>
    );
  };

  // TÁI CẤU TRÚC: Logic xử lý nhận thưởng đã được chuyển vào `thanh-tuu.tsx`.
  // Hàm này giờ chỉ dùng để cập nhật state của component cha.
  const handleAchievementsUpdate = (updates: { coins: number; masteryCards: number; vocabulary: VocabularyItem[] }) => {
    console.log("Syncing state from AchievementsScreen. New coin count:", updates.coins);
    setCoins(updates.coins);
    setMasteryCards(updates.masteryCards);
    setVocabularyData(updates.vocabulary);
  };

  const createToggleFunction = (setter: React.Dispatch<React.SetStateAction<boolean>>, ...otherSetters: React.Dispatch<React.SetStateAction<boolean>>[]) => {
    return () => {
        if (isLoading) return;
        if (isSyncingData) {
            setShowRateLimitToast(true);
            return;
        }
        setter(prev => {
            const newState = !prev;
            if (newState) {
                hideNavBar();
                [ setIsRankOpen, setIsInventoryOpen, setIsLuckyGameOpen, 
                  setIsMinerChallengeOpen, setIsBossBattleOpen, setIsShopOpen, setIsVocabularyChestOpen, setIsSkillScreenOpen, setIsEquipmentOpen,
                  setIsAchievementsOpen, setIsAdminPanelOpen, setIsUpgradeScreenOpen, setIsBaseBuildingOpen
                ].forEach(s => { if (s !== setter) s(false); });
            } else { showNavBar(); }
            return newState;
        });
    };
  };

  const toggleRank = createToggleFunction(setIsRankOpen);
  const toggleInventory = createToggleFunction(setIsInventoryOpen);
  const toggleLuckyGame = createToggleFunction(setIsLuckyGameOpen);
  const toggleMinerChallenge = createToggleFunction(setIsMinerChallengeOpen);
  const toggleBossBattle = createToggleFunction(setIsBossBattleOpen);
  const toggleShop = createToggleFunction(setIsShopOpen);
  const toggleVocabularyChest = createToggleFunction(setIsVocabularyChestOpen);
  const toggleAchievements = createToggleFunction(setIsAchievementsOpen);
  const toggleAdminPanel = createToggleFunction(setIsAdminPanelOpen);
  const toggleUpgradeScreen = createToggleFunction(setIsUpgradeScreenOpen);
  const toggleSkillScreen = createToggleFunction(setIsSkillScreenOpen);
  const toggleEquipmentScreen = createToggleFunction(setIsEquipmentOpen);
  const toggleBaseBuilding = createToggleFunction(setIsBaseBuildingOpen);
  const handleSetToggleSidebar = (toggleFn: () => void) => { sidebarToggleRef.current = toggleFn; };

  const isAnyOverlayOpen = isRankOpen || isInventoryOpen || isLuckyGameOpen || isBossBattleOpen || isShopOpen || isVocabularyChestOpen || isAchievementsOpen || isAdminPanelOpen || isMinerChallengeOpen || isUpgradeScreenOpen || isBaseBuildingOpen || isSkillScreenOpen || isEquipmentOpen;
  const isGamePaused = isAnyOverlayOpen || isLoading || isBackgroundPaused;
  const isAdmin = auth.currentUser?.email === 'vanlongt309@gmail.com';

  const getPlayerBattleStats = () => {
      const BASE_HP = 0; const BASE_ATK = 0; const BASE_DEF = 0;
      const bonusHp = calculateTotalStatValue(userStats.hp, statConfig.hp.baseUpgradeBonus);
      const bonusAtk = calculateTotalStatValue(userStats.atk, statConfig.atk.baseUpgradeBonus);
      const bonusDef = calculateTotalStatValue(userStats.def, statConfig.def.baseUpgradeBonus);
      return {
          maxHp: BASE_HP + bonusHp, hp: BASE_HP + bonusHp, atk: BASE_ATK + bonusAtk,
          def: BASE_DEF + bonusDef, maxEnergy: 50, energy: 50,
      };
  };

  const getEquippedSkillsDetails = () => {
      if (!ownedSkills || !equippedSkillIds) return [];
      
      const equippedDetails = equippedSkillIds
          .map(ownedId => {
              if (!ownedId) return null;
              const owned = ownedSkills.find(s => s.id === ownedId);
              if (!owned) return null;
              
              const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId);
              if (!blueprint) return null;

              return { ...owned, ...blueprint };
          })
          .filter(Boolean);

      return equippedDetails as (OwnedSkill & SkillBlueprint)[];
  };

  return (
    <div className="w-screen h-[var(--app-height)] overflow-hidden bg-gray-950 relative">
      <SidebarLayout setToggleSidebar={handleSetToggleSidebar} onShowRank={toggleRank}
          onShowLuckyGame={toggleLuckyGame} onShowMinerChallenge={toggleMinerChallenge}
          onShowAchievements={toggleAchievements} onShowUpgrade={toggleUpgradeScreen}
          onShowBaseBuilding={toggleBaseBuilding} onShowAdmin={isAdmin ? toggleAdminPanel : undefined}
      >
        <DungeonCanvasBackground isPaused={isGamePaused} />
        <div style={{ display: isAnyOverlayOpen ? 'none' : 'block', visibility: isLoading ? 'hidden' : 'visible' }} className="w-full h-full">
          <div className={`${className ?? ''} relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-transparent`} onClick={handleTap}>
            {renderCharacter()}
            <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center z-30 relative px-3 overflow-hidden
                        rounded-b-lg shadow-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950
                        border-b border-l border-r border-slate-700/50">
                <HeaderBackground />
                <button onClick={() => sidebarToggleRef.current?.()} className="p-1 rounded-full hover:bg-slate-700 transition-colors z-20" aria-label="Mở sidebar" title="Mở sidebar">
                     <img src={uiAssets.menuIcon} alt="Menu Icon" className="w-5 h-5 object-contain" />
                </button>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-1 currency-display-container relative z-10">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center"><GemIcon size={16} color="#a78bfa" className="relative z-20" /></div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">{gems.toLocaleString()}</div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                </div>
            </div>

            <RateLimitToast show={showRateLimitToast} />

            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.towerIcon} alt="Boss Battle Icon" className="w-full h-full object-contain" />, onClick: toggleBossBattle },
                 { icon: <img src={uiAssets.shopIcon} alt="Shop Icon" className="w-full h-full object-contain" />, onClick: toggleShop },
                 { icon: <img src={uiAssets.inventoryIcon} alt="Inventory Icon" className="w-full h-full object-contain" />, onClick: toggleInventory }
              ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
            </div>
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ { icon: <img src={uiAssets.vocabularyChestIcon} alt="Vocabulary Chest Icon" className="w-full h-full object-contain" />, onClick: toggleVocabularyChest },
                 { icon: <img src={uiAssets.missionIcon} alt="Mission Icon" className="w-full h-full object-contain" />, onClick: toggleEquipmentScreen },
                 { icon: <img src={uiAssets.skillIcon} alt="Skill Icon" className="w-full h-full object-contain" />, onClick: toggleSkillScreen },
              ].map((item, index) => ( <div key={index} className="group cursor-pointer"> <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center w-14 h-14 flex-shrink-0 bg-black bg-opacity-20 p-1.5 rounded-lg" onClick={item.onClick}> {item.icon} </div> </div> ))}
            </div>
          </div>
        </div>

        {/* --- Overlays / Modals --- */}
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isRankOpen ? 'block' : 'none' }}> <ErrorBoundary><EnhancedLeaderboard onClose={toggleRank} /></ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isInventoryOpen ? 'block' : 'none' }}> <ErrorBoundary><Inventory onClose={toggleInventory} /></ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isLuckyGameOpen ? 'block' : 'none' }}> <ErrorBoundary>{auth.currentUser && (<LuckyChestGame onClose={toggleLuckyGame} currentCoins={coins} onUpdateCoins={async (amount) => setCoins(await updateUserCoins(auth.currentUser!.uid, amount))} onUpdatePickaxes={handleUpdatePickaxes} currentJackpotPool={jackpotPool} onUpdateJackpotPool={(amount, reset) => updateJackpotPoolInFirestore(amount, reset)} />)}</ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isMinerChallengeOpen ? 'block' : 'none' }}>
            <ErrorBoundary>{isMinerChallengeOpen && auth.currentUser && (
                <MinerChallenge
                    onClose={toggleMinerChallenge}
                    initialDisplayedCoins={displayedCoins}
                    masteryCards={masteryCards}
                    initialPickaxes={pickaxes}
                    initialHighestFloor={minerChallengeHighestFloor}
                    onGameEnd={handleMinerChallengeEnd}
                />)}</ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBossBattleOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isBossBattleOpen && auth.currentUser && (
                    <BossBattle
                        onClose={toggleBossBattle}
                        playerInitialStats={getPlayerBattleStats()}
                        onBattleEnd={async (result, rewards) => {
                            console.log(`Battle ended: ${result}, Rewards: ${rewards.coins} coins`);
                            if (result === 'win' && auth.currentUser) {
                                const newCoins = await updateUserCoins(auth.currentUser.uid, rewards.coins);
                                setCoins(newCoins);
                            }
                        }}
                        initialFloor={bossBattleHighestFloor}
                        onFloorComplete={handleBossFloorUpdate}
                        equippedSkills={getEquippedSkillsDetails()}
                        displayedCoins={displayedCoins}
                    />
                )}
            </ErrorBoundary>
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isShopOpen ? 'block' : 'none' }}> <ErrorBoundary>{isShopOpen && <Shop onClose={toggleShop} onPurchase={handleShopPurchase} currentUser={auth.currentUser} />}</ErrorBoundary> </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isVocabularyChestOpen ? 'block' : 'none' }}> 
            <ErrorBoundary>
                {isVocabularyChestOpen && currentUser && ( 
                    <VocabularyChestScreen 
                        onClose={toggleVocabularyChest} 
                        currentUserId={currentUser.uid} 
                        onUpdateCoins={async (amount) => setCoins(await updateUserCoins(currentUser.uid, amount))} 
                        onUpdateGems={async (amount) => setGems(await updateUserGems(currentUser.uid, amount))}
                        onGemReward={handleGemReward} 
                        displayedCoins={displayedCoins} 
                        gems={gems}
                        totalVocabCollected={totalVocabCollected} 
                        cardCapacity={cardCapacity} 
                        onVocabUpdate={(count) => setTotalVocabCollected(prev => prev + count)} 
                    /> 
                )}
            </ErrorBoundary> 
        </div>
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isAchievementsOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isAchievementsOpen && auth.currentUser && Array.isArray(vocabularyData) && (
                    <AchievementsScreen
                        onClose={toggleAchievements}
                        userId={auth.currentUser.uid}
                        initialData={vocabularyData}
                        onDataUpdated={handleAchievementsUpdate}
                        masteryCardsCount={masteryCards}
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
                        initialStats={userStats}
                        onConfirmUpgrade={(cost, newStats) =>
                          handleConfirmStatUpgrade(auth.currentUser!.uid, cost, newStats)
                        }
                    />
                )}
            </ErrorBoundary>
        </div>
        
        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isBaseBuildingOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isBaseBuildingOpen && auth.currentUser && (
                    <BaseBuildingScreen
                        onClose={toggleBaseBuilding}
                        coins={coins}
                        gems={gems}
                        onUpdateCoins={async (amount) => setCoins(await updateUserCoins(auth.currentUser!.uid, amount))}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isSkillScreenOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isSkillScreenOpen && auth.currentUser && (
                    <SkillScreen 
                        onClose={toggleSkillScreen} 
                        gold={coins}
                        ancientBooks={ancientBooks}
                        ownedSkills={ownedSkills}
                        equippedSkillIds={equippedSkillIds}
                        onSkillsUpdate={handleSkillsUpdate}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[60]" style={{ display: isEquipmentOpen ? 'block' : 'none' }}>
            <ErrorBoundary>
                {isEquipmentOpen && auth.currentUser && (
                    <EquipmentScreen 
                        onClose={toggleEquipmentScreen} 
                        gold={coins}
                        equipmentPieces={equipmentPieces}
                        ownedItems={ownedItems}
                        equippedItems={equippedItems}
                        onInventoryUpdate={handleInventoryUpdate}
                    />
                )}
            </ErrorBoundary>
        </div>

        <div className="absolute inset-0 w-full h-full z-[70]" style={{ display: isAdminPanelOpen ? 'block' : 'none' }}> <ErrorBoundary>{isAdminPanelOpen && <AdminPanel onClose={toggleAdminPanel} />}</ErrorBoundary> </div>
      </SidebarLayout>

      {isLoading && ( <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"> <LoadingSpinner /> </div> )}
    </div>
  );
}
// --- END OF FILE background-game.tsx ---
