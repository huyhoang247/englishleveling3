// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from 'firebase/auth';

// Import các types cần thiết từ các file khác của bạn
import { OwnedSkill, SkillBlueprint, ALL_SKILLS } from '../skill-data';
import { OwnedItem, EquippedItems } from '../equipment';
import { VocabularyItem, initialVocabularyData } from '../thanh-tuu';
import { calculateTotalStatValue, statConfig } from '../upgrade-stats';

// --- Định nghĩa Type đầy đủ cho Context ---
interface UserDataContextType {
  // Trạng thái
  isLoading: boolean;
  isSyncing: boolean;
  user: User | null;

  // Dữ liệu người dùng
  coins: number;
  displayedCoins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  userStats: { hp: number; atk: number; def: number };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  ownedSkills: OwnedSkill[];
  equippedSkillIds: (string | null)[];
  totalVocabCollected: number;
  cardCapacity: number;
  equipmentPieces: number;
  ownedItems: OwnedItem[];
  equippedItems: EquippedItems;
  vocabularyData: VocabularyItem[] | null;
  
  // Dữ liệu chung
  jackpotPool: number;

  // Dữ liệu đã tính toán
  playerBattleStats: any;
  equippedSkillsDetails: (OwnedSkill & SkillBlueprint)[];

  // Hàm cập nhật
  refreshUserData: () => void;
  updateCoins: (amount: number) => Promise<void>;
  updateGems: (amount: number) => Promise<void>;
  updateMasteryCards: (amount: number) => Promise<void>;
  updatePickaxes: (newTotalAmount: number) => Promise<void>;
  updateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
  handleBossFloorUpdate: (newFloor: number) => Promise<void>;
  handleMinerChallengeEnd: (result: any) => Promise<void>;
  handleConfirmStatUpgrade: (cost: number, newStats: any) => Promise<void>;
  handleSkillsUpdate: (updates: any) => Promise<void>;
  handleInventoryUpdate: (updates: any) => Promise<void>;
  handleShopPurchase: (item: any, quantity: number) => Promise<void>;
  handleRewardClaim: (reward: any, updatedVocabulary: any) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // States for User Data (di chuyển từ background-game)
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [masteryCards, setMasteryCards] = useState(0);
  const [pickaxes, setPickaxes] = useState(50);
  const [minerChallengeHighestFloor, setMinerChallengeHighestFloor] = useState(0);
  const [userStats, setUserStats] = useState({ hp: 0, atk: 0, def: 0 });
  const [bossBattleHighestFloor, setBossBattleHighestFloor] = useState(0);
  const [ancientBooks, setAncientBooks] = useState(0);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([null, null, null]);
  const [totalVocabCollected, setTotalVocabCollected] = useState(0);
  const [cardCapacity, setCardCapacity] = useState(100);
  const [equipmentPieces, setEquipmentPieces] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[] | null>(null);
  const [jackpotPool, setJackpotPool] = useState(200);

  // --- Tất cả các hàm fetch và update được chuyển vào đây ---

  const fetchFullUserData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
        const userDocRef = doc(db, 'users', userId);
        const [userDocSnap, jackpotDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(doc(db, 'appData', 'jackpotPoolData'))
        ]);

        // User Data
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setCoins(data.coins || 0);
            setGems(data.gems || 0);
            setMasteryCards(data.masteryCards || 0);
            setPickaxes(typeof data.pickaxes === 'number' ? data.pickaxes : 50);
            setMinerChallengeHighestFloor(data.minerChallengeHighestFloor || 0);
            setUserStats(data.stats || { hp: 0, atk: 0, def: 0 });
            setBossBattleHighestFloor(data.bossBattleHighestFloor || 0);
            setAncientBooks(data.ancientBooks || 0);
            const skillsData = data.skills || { owned: [], equipped: [null, null, null] };
            setOwnedSkills(skillsData.owned);
            setEquippedSkillIds(skillsData.equipped);
            setTotalVocabCollected(data.totalVocabCollected || 0);
            setCardCapacity(data.cardCapacity || 100);
            const equipmentData = data.equipment || { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } };
            setEquipmentPieces(equipmentData.pieces);
            setOwnedItems(equipmentData.owned);
            setEquippedItems(equipmentData.equipped);
        } else {
            // Logic tạo user mới nếu cần
        }

        // Jackpot Data
        if (jackpotDocSnap.exists()) {
            setJackpotPool(jackpotDocSnap.data().poolAmount || 200);
        } else {
            await setDoc(doc(db, 'appData', 'jackpotPoolData'), { poolAmount: 200 });
            setJackpotPool(200);
        }
        
        // Fetch Vocabulary Data (nếu cần)
        // await fetchVocabularyData(userId);

    } catch (error) {
        console.error("Error fetching user and app data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const refreshUserData = useCallback(() => {
    if(user?.uid) fetchFullUserData(user.uid);
  }, [user, fetchFullUserData]);


  const updateGems = useCallback(async (amount: number) => {
      // ... logic updateGemsInFirestore ...
  }, [user]);

  // CHUYỂN TOÀN BỘ CÁC HÀM CẬP NHẬT KHÁC VÀO ĐÂY...
  // Ví dụ: handleShopPurchase, handleSkillsUpdate, etc.
  // Hãy chắc chắn bạn đã sao chép và điều chỉnh tất cả chúng.
  // Dưới đây là ví dụ cho một vài hàm quan trọng:
  
  const updateCoins = useCallback(async (amount: number) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, 'users', user.uid);
    setIsSyncing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist");
        const currentCoins = userDoc.data().coins || 0;
        const newCoins = Math.max(0, currentCoins + amount);
        transaction.update(userDocRef, { coins: newCoins });
        setCoins(newCoins); // Cập nhật state local ngay lập tức
      });
    } catch (error) {
        console.error("Failed to update coins transaction:", error);
        throw error; // Ném lỗi ra để component gọi có thể xử lý
    } finally {
        setIsSyncing(false);
    }
  }, [user]);
  
  const handleShopPurchase = useCallback(async (item: any, quantity: number) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, 'users', user.uid);
    const totalCost = item.price * quantity;
    setIsSyncing(true);
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw new Error("User document does not exist");
            const currentCoins = userDoc.data().coins || 0;
            if (currentCoins < totalCost) throw new Error("Not enough gold");

            const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
            if (item.id === 1009) {
                updates.ancientBooks = (userDoc.data().ancientBooks || 0) + quantity;
            } // ... other items
            transaction.update(userDocRef, updates);
        });
        // Update local state on success
        setCoins(prev => prev - totalCost);
        if (item.id === 1009) setAncientBooks(prev => prev + quantity);
    } catch (error) {
        console.error("Shop purchase failed:", error);
        throw error;
    } finally {
        setIsSyncing(false);
    }
  }, [user]);
  
  const handleSkillsUpdate = useCallback(async (updates: any) => {
     // ... logic của hàm handleSkillsUpdate từ file cũ ...
     // Nhớ set isSyncing(true/false) và cập nhật state local sau khi thành công
  }, [user]);

  // Main useEffect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
      if (newUser) {
        fetchFullUserData(newUser.uid);
      } else {
        setIsLoading(false);
        // Reset all states on logout
        setCoins(0); setGems(0); setMasteryCards(0); setPickaxes(50);
        // ... reset tất cả các state khác
      }
    });
    return () => unsubscribe();
  }, [fetchFullUserData]);

  // Displayed Coins useEffect
  useEffect(() => {
    if (displayedCoins === coins) return;
    const timeoutId = setTimeout(() => setDisplayedCoins(coins), 100);
    return () => clearTimeout(timeoutId);
  }, [coins, displayedCoins]);

  // Derived Data (memoized for performance)
  const playerBattleStats = useMemo(() => ({
    //... logic getPlayerBattleStats
  }), [userStats]);

  const equippedSkillsDetails = useMemo(() => {
    if (!ownedSkills || !equippedSkillIds) return [];
    return equippedSkillIds
        .map(id => {
            if (!id) return null;
            const owned = ownedSkills.find(s => s.id === id);
            if (!owned) return null;
            const blueprint = ALL_SKILLS.find(b => b.id === owned.skillId);
            if (!blueprint) return null;
            return { ...owned, ...blueprint };
        })
        .filter((s): s is (OwnedSkill & SkillBlueprint) => s !== null);
  }, [ownedSkills, equippedSkillIds]);


  const value = {
    isLoading, isSyncing, user, coins, displayedCoins, gems, masteryCards, pickaxes,
    minerChallengeHighestFloor, userStats, bossBattleHighestFloor, ancientBooks,
    ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces,
    ownedItems, equippedItems, vocabularyData, jackpotPool,
    playerBattleStats, equippedSkillsDetails,
    // Hàm
    refreshUserData, updateCoins, updateGems, handleShopPurchase, handleSkillsUpdate,
    // ... Thêm TẤT CẢ các hàm còn lại của bạn vào đây
  };

  return (
    <UserDataContext.Provider value={value as UserDataContextType}>
      {children}
    </UserData-Context.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
