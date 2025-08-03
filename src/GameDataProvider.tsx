// src/contexts/GameDataProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { auth } from './firebase.js'; // Đảm bảo đường dẫn này đúng
import { User } from 'firebase/auth';

// --- Sao chép các kiểu dữ liệu cần thiết từ các file khác ---
import { VocabularyItem, initialVocabularyData } from './thanh-tuu.tsx';
import { OwnedSkill } from './skill-data.tsx';
import { OwnedItem, EquippedItems } from './equipment.tsx';

// --- Định nghĩa "hình dạng" của toàn bộ dữ liệu game ---
interface GameDataContextType {
    // Trạng thái
    isLoading: boolean;
    currentUser: User | null;
    isSyncingData: boolean;

    // Dữ liệu người dùng & game
    coins: number;
    gems: number;
    masteryCards: number;
    pickaxes: number;
    minerChallengeHighestFloor: number;
    userStats: { hp: number; atk: number; def: number; };
    jackpotPool: number;
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

    // Các hàm cập nhật dữ liệu
    fetchInitialData: () => void;
    updateCoinsInFirestore: (amount: number) => Promise<void>;
    updateGemsInFirestore: (amount: number) => Promise<void>;
    updateMasteryCardsInFirestore: (amount: number) => Promise<void>;
    updateJackpotPoolInFirestore: (amount: number, reset?: boolean) => Promise<void>;
    updatePickaxes: (amountToAdd: number) => Promise<void>;
    updateTotalVocabCollected: (count: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleConfirmStatUpgrade: (upgradeCost: number, newStats: { hp: number; atk: number; def: number; }) => Promise<void>;
    handleSkillsUpdate: (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => Promise<void>;
    handleInventoryUpdate: (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => Promise<void>;
    handleShopPurchase: (item: any, quantity: number) => Promise<void>;
    handleRewardClaim: (reward: { gold: number; masteryCards: number }, updatedVocabulary: VocabularyItem[]) => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export const useGameData = () => {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
};

export const GameDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const db = getFirestore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSyncingData, setIsSyncingData] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

    // States for User Data
    const [coins, setCoins] = useState(0);
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

    // States for Global Data
    const [jackpotPool, setJackpotPool] = useState(200);

    const fetchUserData = async (userId: string) => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("GameDataProvider: User data fetched:", userData);
            setCoins(userData.coins || 0);
            setGems(userData.gems || 0);
            setMasteryCards(userData.masteryCards || 0);
            setPickaxes(typeof userData.pickaxes === 'number' ? userData.pickaxes : 50);
            setMinerChallengeHighestFloor(userData.minerChallengeHighestFloor || 0);
            setUserStats(userData.stats || { hp: 0, atk: 0, def: 0 });
            setBossBattleHighestFloor(userData.bossBattleHighestFloor || 0);
            setAncientBooks(userData.ancientBooks || 0);
            const skillsData = userData.skills || { owned: [], equipped: [null, null, null] };
            setOwnedSkills(skillsData.owned);
            setEquippedSkillIds(skillsData.equipped);
            setTotalVocabCollected(userData.totalVocabCollected || 0);
            setCardCapacity(userData.cardCapacity || 100);
            const equipmentData = userData.equipment || { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } };
            setEquipmentPieces(equipmentData.pieces);
            setOwnedItems(equipmentData.owned);
            setEquippedItems(equipmentData.equipped);
        } else {
            console.log("GameDataProvider: No user document found, creating default.");
            const defaultData = {
                coins: 0, gems: 0, masteryCards: 0, stats: { hp: 0, atk: 0, def: 0 },
                pickaxes: 50, minerChallengeHighestFloor: 0, bossBattleHighestFloor: 0,
                ancientBooks: 0, skills: { owned: [], equipped: [null, null, null] },
                totalVocabCollected: 0, equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
                cardCapacity: 100, createdAt: new Date(),
            };
            await setDoc(userDocRef, defaultData);
            // Manually set state after creation
            setCoins(defaultData.coins); setGems(defaultData.gems); setMasteryCards(defaultData.masteryCards);
            setPickaxes(defaultData.pickaxes); setMinerChallengeHighestFloor(defaultData.minerChallengeHighestFloor);
            setUserStats(defaultData.stats); setBossBattleHighestFloor(defaultData.bossBattleHighestFloor);
            setAncientBooks(defaultData.ancientBooks); setOwnedSkills(defaultData.skills.owned);
            setEquippedSkillIds(defaultData.skills.equipped); setTotalVocabCollected(defaultData.totalVocabCollected);
            setEquipmentPieces(defaultData.equipment.pieces); setOwnedItems(defaultData.equipment.owned);
            setEquippedItems(defaultData.equipment.equipped); setCardCapacity(defaultData.cardCapacity);
        }
    };

    const fetchVocabularyData = async (userId: string) => {
        try {
            const completedWordsCol = collection(db, 'users', userId, 'completedWords');
            const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
            const [completedWordsSnap, achievementDocSnap] = await Promise.all([getDocs(completedWordsCol), getDoc(achievementDocRef)]);
            const wordToExpMap = new Map<string, number>();
            completedWordsSnap.forEach(wordDoc => {
                const word = wordDoc.id;
                const gameModes = wordDoc.data().gameModes || {};
                let totalCorrectCount = 0;
                Object.values(gameModes).forEach((mode: any) => { totalCorrectCount += mode.correctCount || 0; });
                wordToExpMap.set(word, totalCorrectCount * 100);
            });
            const existingAchievements: VocabularyItem[] = achievementDocSnap.exists() ? achievementDocSnap.data().vocabulary || [] : [];
            const finalVocabularyData: VocabularyItem[] = [];
            const processedWords = new Set<string>();
            let idCounter = (existingAchievements.length > 0 ? Math.max(...existingAchievements.map(i => i.id)) : 0) + 1;
            wordToExpMap.forEach((totalExp, word) => {
                const existingItem = existingAchievements.find(item => item.word === word);
                if (existingItem) {
                    let expSpentToReachCurrentLevel = 0;
                    for (let i = 1; i < existingItem.level; i++) { expSpentToReachCurrentLevel += i * 100; }
                    const currentProgressExp = totalExp - expSpentToReachCurrentLevel;
                    finalVocabularyData.push({ ...existingItem, exp: currentProgressExp, maxExp: existingItem.level * 100 });
                } else {
                    finalVocabularyData.push({ id: idCounter++, word: word, exp: totalExp, level: 1, maxExp: 100 });
                }
                processedWords.add(word);
            });
            existingAchievements.forEach(item => { if (!processedWords.has(item.word)) { finalVocabularyData.push(item); } });
            console.log("GameDataProvider: Vocabulary achievements synced.");
            setVocabularyData(finalVocabularyData);
        } catch (error) {
            console.error("GameDataProvider: Error fetching vocabulary data:", error);
            setVocabularyData(initialVocabularyData);
        }
    };

    const fetchJackpotPool = async () => {
        try {
            const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
            const jackpotDocSnap = await getDoc(jackpotDocRef);
            if (jackpotDocSnap.exists()) {
                const data = jackpotDocSnap.data();
                setJackpotPool(data.poolAmount || 200);
            } else {
                await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
                setJackpotPool(200);
            }
        } catch (error) { console.error("GameDataProvider: Error fetching jackpot pool:", error); }
    };

    const fetchInitialData = async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        console.log("GameDataProvider: Starting initial data fetch for user", currentUser.uid);
        try {
            await Promise.all([
                fetchUserData(currentUser.uid),
                fetchVocabularyData(currentUser.uid),
                fetchJackpotPool(),
            ]);
            console.log("GameDataProvider: Initial data fetch completed.");
        } catch (error) {
            console.error("GameDataProvider: Error during initial data fetch:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (user) {
                fetchInitialData();
            } else {
                // Reset all state on logout
                setIsLoading(false);
                setCoins(0); setGems(0); setMasteryCards(0); setPickaxes(50);
                setMinerChallengeHighestFloor(0); setUserStats({ hp: 0, atk: 0, def: 0 });
                setBossBattleHighestFloor(0); setAncientBooks(0); setOwnedSkills([]);
                setEquippedSkillIds([null, null, null]); setTotalVocabCollected(0);
                setCardCapacity(100); setEquipmentPieces(0); setOwnedItems([]);
                setEquippedItems({ weapon: null, armor: null, accessory: null });
                setVocabularyData(null); setJackpotPool(200);
                console.log("GameDataProvider: User logged out, state reset.");
            }
        });
        return () => unsubscribe();
    }, []); // This effect runs only once on mount

    // --- ALL UPDATE FUNCTIONS ---
    // Each function will now update Firestore AND then update the local state in this provider.
    
    const runUpdateTransaction = async (updateLogic: (transaction: any, userDoc: any) => void) => {
        if (!currentUser) throw new Error("User not authenticated.");
        setIsSyncingData(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist!");
                updateLogic(transaction, userDoc);
            });
        } catch (error) {
            console.error("GameDataProvider: Firestore transaction failed:", error);
            throw error; // Re-throw to be caught by the UI
        } finally {
            setIsSyncingData(false);
        }
    };

    const updateCoinsInFirestore = async (amount: number) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCoins = userDoc.data().coins || 0;
            const newCoins = currentCoins + amount;
            const finalCoins = Math.max(0, newCoins);
            transaction.update(doc(db, 'users', currentUser!.uid), { coins: finalCoins });
            setCoins(finalCoins);
        });
    };
    
    const updateGemsInFirestore = async (amount: number) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentGems = userDoc.data().gems || 0;
            const newGems = currentGems + amount;
            const finalGems = Math.max(0, newGems);
            transaction.update(doc(db, 'users', currentUser!.uid), { gems: finalGems });
            setGems(finalGems);
        });
    };

    const updateMasteryCardsInFirestore = async (amount: number) => {
         await runUpdateTransaction((transaction, userDoc) => {
            const currentCards = userDoc.data().masteryCards || 0;
            const newCards = currentCards + amount;
            transaction.update(doc(db, 'users', currentUser!.uid), { masteryCards: newCards });
            setMasteryCards(newCards);
        });
    };

    const updatePickaxes = async (amountToAdd: number) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentPickaxes = userDoc.data().pickaxes || 0;
            const newTotal = Math.max(0, currentPickaxes + amountToAdd);
            transaction.update(doc(db, 'users', currentUser!.uid), { pickaxes: newTotal });
            setPickaxes(newTotal);
        });
    };
    
    const updateTotalVocabCollected = async (count: number) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCount = userDoc.data().totalVocabCollected || 0;
            const newCount = currentCount + count;
            transaction.update(doc(db, 'users', currentUser!.uid), { totalVocabCollected: newCount });
            setTotalVocabCollected(newCount);
        });
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
    
    const handleMinerChallengeEnd = async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCoins = userDoc.data().coins || 0;
            const newCoins = currentCoins + result.coinsEarned;
            const newHighestFloor = Math.max(userDoc.data().minerChallengeHighestFloor || 0, result.highestFloorCompleted);
            
            transaction.update(doc(db, 'users', currentUser!.uid), {
                coins: newCoins,
                pickaxes: result.finalPickaxes,
                minerChallengeHighestFloor: newHighestFloor,
            });

            setCoins(newCoins);
            setPickaxes(result.finalPickaxes);
            setMinerChallengeHighestFloor(newHighestFloor);
        });
    };
    
    const handleBossFloorUpdate = async (newFloor: number) => {
        if (!currentUser || newFloor <= bossBattleHighestFloor) return;
        await runUpdateTransaction((transaction, userDoc) => {
             transaction.update(doc(db, 'users', currentUser!.uid), { bossBattleHighestFloor: newFloor });
             setBossBattleHighestFloor(newFloor);
        });
    };

    const handleConfirmStatUpgrade = async (upgradeCost: number, newStats: { hp: number; atk: number; def: number; }) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCoins = userDoc.data().coins || 0;
            if (currentCoins < upgradeCost) throw new Error("Không đủ vàng trên server.");
            
            const newCoins = currentCoins - upgradeCost;
            transaction.update(doc(db, 'users', currentUser!.uid), {
                coins: newCoins,
                stats: newStats,
            });
            
            setCoins(newCoins);
            setUserStats(newStats);
        });
    };

    const handleSkillsUpdate = async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCoins = userDoc.data().coins || 0;
            const currentBooks = userDoc.data().ancientBooks || 0;
            const newCoins = currentCoins + updates.goldChange;
            const newBooks = currentBooks + updates.booksChange;

            if (newCoins < 0) throw new Error("Không đủ vàng.");
            if (newBooks < 0) throw new Error("Không đủ Sách Cổ.");

            transaction.update(doc(db, 'users', currentUser!.uid), {
                coins: newCoins,
                ancientBooks: newBooks,
                skills: { owned: updates.newOwned, equipped: updates.newEquippedIds }
            });

            setCoins(newCoins);
            setAncientBooks(newBooks);
            setOwnedSkills(updates.newOwned);
            setEquippedSkillIds(updates.newEquippedIds);
        });
    };
    
    const handleInventoryUpdate = async (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
        await runUpdateTransaction((transaction, userDoc) => {
            const currentCoins = userDoc.data().coins || 0;
            const currentEquipment = userDoc.data().equipment || { pieces: 0 };
            const currentPieces = currentEquipment.pieces || 0;
            const newCoins = currentCoins + updates.goldChange;
            const newPieces = currentPieces + updates.piecesChange;

            if (newCoins < 0) throw new Error("Không đủ vàng.");
            if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");

            transaction.update(doc(db, 'users', currentUser!.uid), {
                coins: newCoins,
                equipment: { ...currentEquipment, pieces: newPieces, owned: updates.newOwned, equipped: updates.newEquipped }
            });
            
            setCoins(newCoins);
            setEquipmentPieces(newPieces);
            setOwnedItems(updates.newOwned);
            setEquippedItems(updates.newEquipped);
        });
    };

    const handleShopPurchase = async (item: any, quantity: number) => {
        if (!item || typeof item.price !== 'number' || !item.id || typeof quantity !== 'number' || quantity <= 0) {
            throw new Error("Dữ liệu vật phẩm hoặc số lượng không hợp lệ.");
        }
        
        await runUpdateTransaction((transaction, userDoc) => {
            const totalCost = item.price * quantity;
            const currentCoins = userDoc.data().coins || 0;
            if (currentCoins < totalCost) throw new Error("Không đủ vàng.");

            const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
            let newAncientBooks = ancientBooks;
            let newCardCapacity = cardCapacity;
            
            if (item.id === 1009) { // Sách Cổ
                const currentBooks = userDoc.data().ancientBooks || 0;
                newAncientBooks = currentBooks + quantity;
                updates.ancientBooks = newAncientBooks;
            } else if (item.id === 2001) { // Nâng Cấp Sức Chứa Thẻ
                const currentCapacity = userDoc.data().cardCapacity || 100;
                newCardCapacity = currentCapacity + quantity;
                updates.cardCapacity = newCardCapacity;
            }
            
            transaction.update(doc(db, 'users', currentUser!.uid), updates);

            setCoins(currentCoins - totalCost);
            if(item.id === 1009) setAncientBooks(newAncientBooks);
            if(item.id === 2001) setCardCapacity(newCardCapacity);
        });
    };

    const handleRewardClaim = async (reward: { gold: number; masteryCards: number }, updatedVocabulary: VocabularyItem[]) => {
        if (!currentUser) throw new Error("User not authenticated.");
        setIsSyncingData(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const achievementDocRef = doc(db, 'users', currentUser.uid, 'gamedata', 'achievements');
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist!");
                
                const currentCoins = userDoc.data().coins || 0;
                const currentCards = userDoc.data().masteryCards || 0;
                const newCoins = currentCoins + reward.gold;
                const newCards = currentCards + reward.masteryCards;

                transaction.update(userDocRef, { coins: newCoins, masteryCards: newCards });
                transaction.set(achievementDocRef, { vocabulary: updatedVocabulary }, { merge: true });
                
                setCoins(newCoins);
                setMasteryCards(newCards);
                setVocabularyData(updatedVocabulary);
            });
        } catch (error) {
            console.error("GameDataProvider: Reward claim transaction failed:", error);
            throw error;
        } finally {
            setIsSyncingData(false);
        }
    };

    const value: GameDataContextType = {
        isLoading, currentUser, isSyncingData,
        coins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, userStats, jackpotPool,
        bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected,
        cardCapacity, equipmentPieces, ownedItems, equippedItems, vocabularyData,
        // Functions
        fetchInitialData, updateCoinsInFirestore, updateGemsInFirestore, updateMasteryCardsInFirestore,
        updateJackpotPoolInFirestore, updatePickaxes, updateTotalVocabCollected, handleMinerChallengeEnd,
        handleBossFloorUpdate, handleConfirmStatUpgrade, handleSkillsUpdate, handleInventoryUpdate,
        handleShopPurchase, handleRewardClaim,
    };

    return (
        <GameDataContext.Provider value={value}>
            {children}
        </GameDataContext.Provider>
    );
};
