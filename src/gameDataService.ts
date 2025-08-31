--- START OF FILE gameDataService.tgfdes.txt ---

// --- START OF FILE gameDataService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch
} from 'firebase/firestore';

// Các interface này nên được định nghĩa ở một nơi tập trung (ví dụ: types.ts) và import vào
// Tuy nhiên, để file này tự chứa, tôi sẽ định nghĩa chúng ở đây.
export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';
export interface OwnedSkill { id: string; skillId: string; level: number; rarity: Rarity; }

// Sửa lại interface OwnedItem và EquippedItems để khớp với equipment.tsx
export interface OwnedItem {
    id: string;
    itemId: number;
    level: number;
    stats: { [key: string]: any };
}
export type EquipmentSlotType = 'weapon' | 'armor' | 'Helmet';
export type EquippedItems = {
    [key in EquipmentSlotType]: string | null;
};

export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number; };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: OwnedSkill[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  equipment: { pieces: number; owned: OwnedItem[]; equipped: EquippedItems };
}

export interface VocabularyItem { 
  id: number; 
  word: string; 
  exp: number; 
  level: number; 
  maxExp: number; 
}


/**
 * Lấy dữ liệu game của người dùng. Nếu chưa có, tạo mới với giá trị mặc định.
 * @param userId - ID của người dùng.
 * @returns {Promise<UserGameData>} Dữ liệu game của người dùng.
 */
export const fetchOrCreateUserGameData = async (userId: string): Promise<UserGameData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Đảm bảo dữ liệu skills có cấu trúc đúng
    const skillsData = data.skills || { owned: [], equipped: [null, null, null] };
    if (!Array.isArray(skillsData.equipped) || skillsData.equipped.length !== 3) {
      skillsData.equipped = [null, null, null];
    }
    const equipmentData = data.equipment || { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };

    return {
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats: data.stats || { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: skillsData,
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 100,
      equipment: equipmentData,
    };
  } else {
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      coins: 0, gems: 0, masteryCards: 0, pickaxes: 50,
      minerChallengeHighestFloor: 0, stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0, ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0, cardCapacity: 100,
      equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } },
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUserData);
    return newUserData;
  }
};

// +++ START: HÀM MỚI ĐƯỢC THÊM VÀO +++
/**
 * Lấy dữ liệu cần thiết cho màn hình Trang Bị.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình trang bị.
 */
export const fetchEquipmentScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    gold: gameData.coins,
    equipmentPieces: gameData.equipment.pieces,
    ownedItems: gameData.equipment.owned,
    equippedItems: gameData.equipment.equipped,
  };
};

/**
 * Lấy dữ liệu cần thiết cho màn hình Kỹ năng.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình kỹ năng.
 */
export const fetchSkillScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    ancientBooks: gameData.ancientBooks,
    skills: gameData.skills, // Gồm { owned, equipped }
  };
};

/**
 * Lấy dữ liệu cần thiết cho màn hình Lật Thẻ Từ Vựng.
 * @param userId - ID của người dùng.
 * @returns {Promise<{coins: number, gems: number, totalVocab: number, capacity: number}>} Dữ liệu cần thiết.
 */
export const fetchVocabularyScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    gems: gameData.gems,
    totalVocab: gameData.totalVocabCollected,
    capacity: gameData.cardCapacity,
  };
};

/**
 * Lấy dữ liệu thô cần thiết cho màn hình Đấu Trùm.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu thô cần thiết cho màn hình Đấu Trùm.
 */
export const fetchBossBattlePrerequisites = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    baseStats: gameData.stats,
    equipment: gameData.equipment, // Gồm owned và equipped
    skills: gameData.skills, // Gồm owned và equipped
    bossBattleHighestFloor: gameData.bossBattleHighestFloor,
    coins: gameData.coins,
  };
};
// +++ END: HÀM MỚI ĐƯỢC THÊM VÀO +++

export const updateUserCoins = async (userId: string, amount: number): Promise<number> => {
  if (!userId) throw new Error("User ID is required.");
  if (amount === 0) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().coins || 0 : 0;
  }
  const userDocRef = doc(db, 'users', userId);
  return runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    if (!userDoc.exists()) throw new Error("User document does not exist!");
    const newCoins = Math.max(0, (userDoc.data().coins || 0) + amount);
    t.update(userDocRef, { coins: newCoins });
    return newCoins;
  });
};

export const updateUserGems = async (userId: string, amount: number): Promise<number> => {
    if (!userId) throw new Error("User ID is required.");
    if (amount === 0) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data().gems || 0 : 0;
    }
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const newGems = Math.max(0, (userDoc.data().gems || 0) + amount);
        t.update(userDocRef, { gems: newGems });
        return newGems;
    });
};

export const fetchJackpotPool = async (): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    const docSnap = await getDoc(jackpotDocRef);
    if (docSnap.exists()) return docSnap.data().poolAmount || 200;
    await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
    return 200;
};

export const updateJackpotPool = async (amount: number, reset: boolean = false): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    return runTransaction(db, async (t) => {
        const docSnap = await t.get(jackpotDocRef);
        const currentPool = docSnap.exists() ? docSnap.data().poolAmount || 200 : 200;
        const newPool = reset ? 200 : currentPool + amount;
        t.set(jackpotDocRef, { poolAmount: newPool, lastUpdated: new Date() }, { merge: true });
        return newPool;
    });
};

export const updateUserBossFloor = async (userId: string, newFloor: number, currentHighest: number): Promise<void> => {
    if (newFloor <= currentHighest) return;
    await setDoc(doc(db, 'users', userId), { bossBattleHighestFloor: newFloor }, { merge: true });
};

export const updateUserPickaxes = async (userId: string, newTotal: number): Promise<number> => {
    const finalAmount = Math.max(0, newTotal);
    await setDoc(doc(db, 'users', userId), { pickaxes: finalAmount }, { merge: true });
    return finalAmount;
};

export const processMinerChallengeResult = async (userId: string, result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + result.coinsEarned;
        const newHighestFloor = Math.max(data.minerChallengeHighestFloor || 0, result.highestFloorCompleted);
        t.update(userDocRef, { coins: newCoins, pickaxes: result.finalPickaxes, minerChallengeHighestFloor: newHighestFloor });
        return { newCoins, newPickaxes: result.finalPickaxes, newHighestFloor };
    });
};

export const upgradeUserStats = async (userId: string, cost: number, newStats: { hp: number; atk: number; def: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < cost) throw new Error("Không đủ vàng trên server.");
        const newCoins = currentCoins - cost;
        t.update(userDocRef, { coins: newCoins, stats: newStats });
        return { newCoins, newStats };
    });
};

export const updateUserSkills = async (userId: string, updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newBooks = (data.ancientBooks || 0) + updates.booksChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newBooks < 0) throw new Error("Không đủ Sách Cổ.");
        t.update(userDocRef, {
            coins: newCoins,
            ancientBooks: newBooks,
            skills: { owned: updates.newOwned, equipped: updates.newEquippedIds }
        });
        return { newCoins, newBooks };
    });
};

export const updateUserInventory = async (userId: string, updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const currentEquipment = data.equipment || { pieces: 0, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");
        t.update(userDocRef, {
            coins: newCoins,
            equipment: { ...currentEquipment, pieces: newPieces, owned: updates.newOwned, equipped: updates.newEquipped }
        });
        return { newCoins, newPieces };
    });
};

export const processGemToCoinExchange = async (userId: string, gemCost: number) => {
    if (!userId) throw new Error("User ID is required.");
    if (gemCost <= 0) throw new Error("Gem cost must be positive.");

    const userDocRef = doc(db, 'users', userId);
    const coinReward = gemCost * 1000; // Tỷ lệ 1 Gem = 1000 Coins

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const data = userDoc.data();
        const currentGems = data.gems || 0;
        const currentCoins = data.coins || 0;

        if (currentGems < gemCost) {
            throw new Error("Không đủ Gems để thực hiện giao dịch.");
        }

        const newGems = currentGems - gemCost;
        const newCoins = currentCoins + coinReward;

        t.update(userDocRef, { gems: newGems, coins: newCoins });

        return { newGems, newCoins };
    });
};

export const processShopPurchase = async (userId: string, item: any, quantity: number) => {
    const userDocRef = doc(db, 'users', userId);
    const totalCost = item.price * quantity;
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const currentCoins = data.coins || 0;
        if (currentCoins < totalCost) throw new Error("Không đủ vàng.");
        
        const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
        let newBooks = data.ancientBooks || 0;
        let newCapacity = data.cardCapacity || 100;

        if (item.id === 1009) {
            newBooks += quantity;
            updates.ancientBooks = newBooks;
        } else if (item.id === 2001) {
            newCapacity += quantity;
            updates.cardCapacity = newCapacity;
        }
        
        t.update(userDocRef, updates);
        return { newCoins: updates.coins, newBooks, newCapacity };
    });
};

const recordNewVocabUnlocks = async (userId: string, newWordsData: { id: number; word: string; chestType: string }[]) => {
    if (newWordsData.length === 0) return;
    const userOpenedVocabColRef = collection(db, 'users', userId, 'openedVocab');
    const batch = writeBatch(db);
    newWordsData.forEach(item => {
        const newVocabDocRef = doc(userOpenedVocabColRef, String(item.id));
        batch.set(newVocabDocRef, {
            word: item.word,
            collectedAt: new Date(),
            chestType: item.chestType,
        });
    });
    await batch.commit();
};

export const processVocabularyChestOpening = async (
  userId: string, 
  details: {
    currency: 'gold' | 'gem'; 
    cost: number; 
    gemReward: number;
    newWordsData: { id: number; word: string; chestType: string }[];
  }
) => {
    const userDocRef = doc(db, 'users', userId);
    const { currency, cost, gemReward, newWordsData } = details;

    const { newCoins, newGems, newTotalVocab } = await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();

        if (currency === 'gold' && (data.coins || 0) < cost) throw new Error("Không đủ vàng.");
        if (currency === 'gem' && (data.gems || 0) < cost) throw new Error("Không đủ gem.");
        if ((data.totalVocabCollected || 0) + newWordsData.length > (data.cardCapacity || 100)) {
            throw new Error("Kho thẻ đã đầy.");
        }
        
        const finalCoins = (data.coins || 0) - (currency === 'gold' ? cost : 0);
        const finalGems = (data.gems || 0) - (currency === 'gem' ? cost : 0) + gemReward;
        const finalTotalVocab = (data.totalVocabCollected || 0) + newWordsData.length;

        t.update(userDocRef, {
            coins: finalCoins,
            gems: finalGems,
            totalVocabCollected: finalTotalVocab,
        });
        return { newCoins: finalCoins, newGems: finalGems, newTotalVocab: finalTotalVocab };
    });

    await recordNewVocabUnlocks(userId, newWordsData);

    return { newCoins, newGems, newTotalVocab };
};

export const fetchAndSyncVocabularyData = async (userId: string): Promise<VocabularyItem[]> => {
  if (!userId) throw new Error("User ID is required.");
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
      ? achievementDocSnap.data().vocabulary || [] : [];
    const finalVocabularyData: VocabularyItem[] = [];
    const processedWords = new Set<string>();
    let idCounter = (existingAchievements.length > 0 ? Math.max(...existingAchievements.map(i => i.id)) : 0) + 1;
    wordToExpMap.forEach((totalExp, word) => {
      const existingItem = existingAchievements.find(item => item.word === word);
      if (existingItem) {
        let expSpentToReachCurrentLevel = 0;
        for (let i = 1; i < existingItem.level; i++) {
          expSpentToReachCurrentLevel += i * 100;
        }
        const currentProgressExp = totalExp - expSpentToReachCurrentLevel;
        finalVocabularyData.push({ ...existingItem, exp: currentProgressExp, maxExp: existingItem.level * 100 });
      } else {
        finalVocabularyData.push({ id: idCounter++, word: word, exp: totalExp, level: 1, maxExp: 100 });
      }
      processedWords.add(word);
    });
    existingAchievements.forEach(item => {
      if (!processedWords.has(item.word)) {
        finalVocabularyData.push(item);
      }
    });
    return finalVocabularyData;
  } catch (error) {
    console.error("Error fetching and syncing vocabulary achievements data in service:", error);
    throw error;
  }
};

export const updateAchievementData = async (
  userId: string,
  updates: { coinsToAdd: number; cardsToAdd: number; newVocabularyData: VocabularyItem[]; }
): Promise<{ newCoins: number; newMasteryCards: number }> => {
  if (!userId) throw new Error("User ID is required for updating achievements.");
  const userDocRef = doc(db, 'users', userId);
  const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
  const { coinsToAdd, cardsToAdd, newVocabularyData } = updates;
  try {
    const { newCoins, newMasteryCards } = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) throw new Error("User document does not exist!");
      const currentCoins = userDoc.data().coins || 0;
      const currentCards = userDoc.data().masteryCards || 0;
      const finalCoins = currentCoins + coinsToAdd;
      const finalCards = currentCards + cardsToAdd;
      transaction.update(userDocRef, { coins: finalCoins, masteryCards: finalCards });
      transaction.set(achievementDocRef, { vocabulary: newVocabularyData, lastUpdated: new Date() });
      return { newCoins: finalCoins, newMasteryCards: finalCards };
    });
    console.log(`Achievements updated for user ${userId}.`);
    return { newCoins, newMasteryCards };
  } catch (error) {
    console.error(`Failed to run transaction to update achievements for user ${userId}:`, error);
    throw error;
  }
};
// --- END OF FILE gameDataService.ts ---
