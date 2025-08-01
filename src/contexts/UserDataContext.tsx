// src/contexts/UserDataContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
    isLoading: boolean;
    isSyncing: boolean;
    user: User | null;
    coins: number;
    displayedCoins: number;
    gems: number;
    masteryCards: number;
    pickaxes: number;
    minerChallengeHighestFloor: number;
    userStats: { hp: number; atk: number; def: number; };
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
    jackpotPool: number;
    playerBattleStats: { maxHp: number; hp: number; atk: number; def: number; maxEnergy: number; energy: number; };
    equippedSkillsDetails: (OwnedSkill & SkillBlueprint)[];
    refreshUserData: () => void;
    updateCoins: (amount: number) => Promise<void>;
    updateGems: (amount: number) => Promise<void>;
    updateMasteryCards: (amount: number) => Promise<void>;
    updatePickaxes: (newTotalAmount: number) => Promise<void>;
    updateJackpotPool: (amount: number, reset?: boolean) => Promise<void>;
    handleBossFloorUpdate: (newFloor: number) => Promise<void>;
    handleMinerChallengeEnd: (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => Promise<void>;
    handleConfirmStatUpgrade: (cost: number, newStats: { hp: number; atk: number; def: number; }) => Promise<void>;
    handleSkillsUpdate: (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => Promise<void>;
    handleInventoryUpdate: (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => Promise<void>;
    handleShopPurchase: (item: any, quantity: number) => Promise<void>;
    handleRewardClaim: (reward: { gold: number; masteryCards: number; }, updatedVocabulary: VocabularyItem[]) => Promise<void>;
    // Thêm các hàm còn thiếu nếu có
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [user, setUser] = useState<User | null>(auth.currentUser);

    // States for User Data
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
    const [equipmentPieces, setEquipmentPieces] = useState(100);
    const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
    const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, accessory: null });
    const [vocabularyData, setVocabularyData] = useState<VocabularyItem[] | null>(null);
    const [jackpotPool, setJackpotPool] = useState(200);

    // --- CÁC HÀM LOGIC ĐẦY ĐỦ ---

    const fetchFullUserData = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            const userDocRef = doc(db, 'users', userId);
            const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
            const [userDocSnap, jackpotDocSnap] = await Promise.all([getDoc(userDocRef), getDoc(jackpotDocRef)]);

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
                console.log("No user document, setting defaults.");
                // Reset to default values if no document exists
            }

            if (jackpotDocSnap.exists()) {
                setJackpotPool(jackpotDocSnap.data().poolAmount || 200);
            } else {
                await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
                setJackpotPool(200);
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUserData = useCallback(() => {
        if(user) fetchFullUserData(user.uid);
    }, [user, fetchFullUserData]);

    const updateCoins = useCallback(async (amount: number) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const newCoins = Math.max(0, (userDoc.data().coins || 0) + amount);
                transaction.update(userDocRef, { coins: newCoins });
                setCoins(newCoins);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);
    
    // ... Thêm đầy đủ các hàm khác vào đây
    const updateGems = useCallback(async (amount: number) => { /* ... logic ... */ }, [user]);
    const updateMasteryCards = useCallback(async (amount: number) => { /* ... logic ... */ }, [user]);
    const updatePickaxes = useCallback(async (newTotalAmount: number) => { /* ... logic ... */ }, [user]);
    const updateJackpotPool = useCallback(async (amount: number, reset: boolean = false) => { /* ... logic ... */ }, []);
    const handleBossFloorUpdate = useCallback(async (newFloor: number) => { /* ... logic ... */ }, [user, bossBattleHighestFloor]);

    const handleMinerChallengeEnd = useCallback(async (result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const currentData = userDoc.data();
                const newCoins = (currentData.coins || 0) + result.coinsEarned;
                const newHighestFloor = Math.max(currentData.minerChallengeHighestFloor || 0, result.highestFloorCompleted);
                transaction.update(userDocRef, {
                    coins: newCoins,
                    pickaxes: result.finalPickaxes,
                    minerChallengeHighestFloor: newHighestFloor,
                });
                setCoins(newCoins);
                setPickaxes(result.finalPickaxes);
                setMinerChallengeHighestFloor(newHighestFloor);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);

    const handleConfirmStatUpgrade = useCallback(async (cost: number, newStats: { hp: number; atk: number; def: number; }) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const currentCoins = userDoc.data().coins || 0;
                if (currentCoins < cost) throw new Error("Not enough gold on server");
                const newCoins = currentCoins - cost;
                transaction.update(userDocRef, { coins: newCoins, stats: newStats });
                setCoins(newCoins);
                setUserStats(newStats);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);

    const handleSkillsUpdate = useCallback(async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
         if (!user) throw new Error("User not authenticated");
         setIsSyncing(true);
         const userDocRef = doc(db, 'users', user.uid);
         try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const data = userDoc.data();
                const newCoins = (data.coins || 0) + updates.goldChange;
                const newBooks = (data.ancientBooks || 0) + updates.booksChange;
                if (newCoins < 0 || newBooks < 0) throw new Error("Insufficient resources");
                transaction.update(userDocRef, {
                    coins: newCoins,
                    ancientBooks: newBooks,
                    skills: { owned: updates.newOwned, equipped: updates.newEquippedIds }
                });
                setCoins(newCoins);
                setAncientBooks(newBooks);
                setOwnedSkills(updates.newOwned);
                setEquippedSkillIds(updates.newEquippedIds);
            });
         } finally {
            setIsSyncing(false);
         }
    }, [user]);
    
    const handleInventoryUpdate = useCallback(async (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const data = userDoc.data();
                const newCoins = (data.coins || 0) + updates.goldChange;
                const newPieces = (data.equipment?.pieces || 0) + updates.piecesChange;
                if (newCoins < 0 || newPieces < 0) throw new Error("Insufficient resources");
                transaction.update(userDocRef, {
                    coins: newCoins,
                    equipment: { 
                        pieces: newPieces, 
                        owned: updates.newOwned, 
                        equipped: updates.newEquipped 
                    }
                });
                setCoins(newCoins);
                setEquipmentPieces(newPieces);
                setOwnedItems(updates.newOwned);
                setEquippedItems(updates.newEquipped);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);

    const handleShopPurchase = useCallback(async (item: any, quantity: number) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        const totalCost = item.price * quantity;
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const data = userDoc.data();
                const currentCoins = data.coins || 0;
                if (currentCoins < totalCost) throw new Error("Not enough gold");
                
                const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
                if (item.id === 1009) {
                    updates.ancientBooks = (data.ancientBooks || 0) + quantity;
                } else if (item.id === 2001) {
                    updates.cardCapacity = (data.cardCapacity || 100) + quantity;
                }
                transaction.update(userDocRef, updates);

                setCoins(updates.coins);
                if (updates.ancientBooks) setAncientBooks(updates.ancientBooks);
                if (updates.cardCapacity) setCardCapacity(updates.cardCapacity);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);

    const handleRewardClaim = useCallback(async (reward: { gold: number; masteryCards: number; }, updatedVocabulary: VocabularyItem[]) => {
        if (!user) throw new Error("User not authenticated");
        setIsSyncing(true);
        const userDocRef = doc(db, 'users', user.uid);
        const achievementDocRef = doc(db, 'users', user.uid, 'gamedata', 'achievements');
        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("User document does not exist");
                const data = userDoc.data();
                const newCoins = (data.coins || 0) + reward.gold;
                const newCards = (data.masteryCards || 0) + reward.masteryCards;
                transaction.update(userDocRef, { coins: newCoins, masteryCards: newCards });
                transaction.set(achievementDocRef, { vocabulary: updatedVocabulary }, { merge: true });
                
                setCoins(newCoins);
                setMasteryCards(newCards);
                setVocabularyData(updatedVocabulary);
            });
        } finally {
            setIsSyncing(false);
        }
    }, [user]);

    // Main useEffect
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((newUser) => {
            setUser(newUser);
            if (newUser) {
                fetchFullUserData(newUser.uid);
            } else {
                setIsLoading(false);
                // Reset states
            }
        });
        return () => unsubscribe();
    }, [fetchFullUserData]);

    useEffect(() => {
        if (displayedCoins === coins) return;
        const timeoutId = setTimeout(() => setDisplayedCoins(coins), 100);
        return () => clearTimeout(timeoutId);
    }, [coins, displayedCoins]);

    const playerBattleStats = useMemo(() => ({
        // ... logic getPlayerBattleStats
    }), [userStats]);

    const equippedSkillsDetails = useMemo(() => {
        // ... logic getEquippedSkillsDetails
    }, [ownedSkills, equippedSkillIds]);

    const value = {
        isLoading, isSyncing, user, coins, displayedCoins, gems, masteryCards, pickaxes, minerChallengeHighestFloor, userStats, bossBattleHighestFloor, ancientBooks, ownedSkills, equippedSkillIds, totalVocabCollected, cardCapacity, equipmentPieces, ownedItems, equippedItems, vocabularyData, jackpotPool,
        playerBattleStats, equippedSkillsDetails,
        refreshUserData, updateCoins, updateGems, updateMasteryCards, updatePickaxes, updateJackpotPool, handleBossFloorUpdate, handleMinerChallengeEnd, handleConfirmStatUpgrade, handleSkillsUpdate, handleInventoryUpdate, handleShopPurchase, handleRewardClaim,
    };

    return <UserDataContext.Provider value={value as UserDataContextType}>{children}</UserDataContext.Provider>;
};

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (!context) throw new Error('useUserData must be used within a UserDataProvider');
    return context;
};
