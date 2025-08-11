// --- START OF FILE gameDataService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs 
} from 'firebase/firestore';

/**
 * Interface cho dữ liệu game đầy đủ của người dùng.
 */
export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number; };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: any[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  equipment: { pieces: number; owned: any[]; equipped: { weapon: null; armor: null; accessory: null } };
}

/**
 * Interface cho một mục từ vựng trong dữ liệu thành tựu.
 */
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
    // Trả về dữ liệu, đảm bảo có giá trị mặc định cho các trường có thể thiếu
    return {
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats: data.stats || { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: data.skills || { owned: [], equipped: [null, null, null] },
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 100,
      equipment: data.equipment || { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
    };
  } else {
    // Người dùng không tồn tại, tạo mới document với dữ liệu game mặc định
    // Tạo thêm các trường từ userDataService để đảm bảo document hoàn chỉnh
    const newUserData = {
      // Dữ liệu game
      coins: 0,
      gems: 0,
      masteryCards: 0,
      pickaxes: 50,
      minerChallengeHighestFloor: 0,
      stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0,
      ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0,
      cardCapacity: 100,
      equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
      
      // Dữ liệu người dùng chung
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUserData);
    return newUserData;
  }
};

/**
 * Cập nhật số coin của người dùng trên Firestore một cách an toàn bằng transaction.
 * Đảm bảo số coin không bao giờ bị âm.
 * @param userId - ID của người dùng.
 * @param amount - Số coin cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<number>} Số coin mới sau khi cập nhật.
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<number> => {
  if (!userId) {
     throw new Error("User ID is required for updating coins.");
  }
  if (amount === 0) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().coins || 0 : 0;
  }
  
  const userDocRef = doc(db, 'users', userId);
  try {
    const newAmount = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }
      const currentCoins = userDoc.data().coins || 0;
      const newCoins = Math.max(0, currentCoins + amount); // Đảm bảo không âm
      transaction.update(userDocRef, { coins: newCoins });
      return newCoins;
    });
    return newAmount;
  } catch (error) {
    console.error(`Failed to run transaction to update coins for user ${userId}:`, error);
    throw error;
  }
};


/**
 * Cập nhật số gem của người dùng trên Firestore một cách an toàn bằng transaction.
 * Đảm bảo số gem không bao giờ bị âm.
 * @param userId - ID của người dùng.
 * @param amount - Số gem cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<number>} Số gem mới sau khi cập nhật.
 */
export const updateUserGems = async (userId: string, amount: number): Promise<number> => {
  if (!userId) {
     throw new Error("User ID is required for updating gems.");
  }
  if (amount === 0) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().gems || 0 : 0;
  }

  const userDocRef = doc(db, 'users', userId);
  try {
    const newAmount = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }
      const currentGems = userDoc.data().gems || 0;
      const newGems = Math.max(0, currentGems + amount); // Đảm bảo không âm
      transaction.update(userDocRef, { gems: newGems });
      return newGems;
    });
    return newAmount;
  } catch (error) {
    console.error(`Failed to run transaction to update gems for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Lấy và đồng bộ hóa dữ liệu thành tựu từ vựng của người dùng.
 * Hàm này hợp nhất dữ liệu từ `completedWords` (nguồn chính cho EXP)
 * và `gamedata/achievements` (nơi lưu trữ cấp độ và trạng thái).
 * @param userId - ID của người dùng.
 * @returns {Promise<VocabularyItem[]>} Một mảng dữ liệu thành tựu từ vựng đã được đồng bộ.
 */
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
      ? achievementDocSnap.data().vocabulary || []
      : [];

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
    
    return finalVocabularyData;
  } catch (error) {
    console.error("Error fetching and syncing vocabulary achievements data in service:", error);
    throw error;
  }
};


/**
 * Cập nhật dữ liệu thành tựu và phần thưởng cho người dùng một cách an toàn.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param userId - ID của người dùng.
 * @param updates - Một object chứa các thay đổi cần áp dụng.
 * @param updates.coinsToAdd - Số coin cần cộng thêm.
 * @param updates.cardsToAdd - Số thẻ mastery cần cộng thêm.
 * @param updates.newVocabularyData - Mảng dữ liệu thành tựu từ vựng mới để ghi đè.
 * @returns {Promise<{newCoins: number; newMasteryCards: number}>} Số dư coin và thẻ mới.
 */
export const updateAchievementData = async (
  userId: string,
  updates: {
    coinsToAdd: number;
    cardsToAdd: number;
    newVocabularyData: VocabularyItem[];
  }
): Promise<{ newCoins: number; newMasteryCards: number }> => {
  if (!userId) throw new Error("User ID is required for updating achievements.");

  const userDocRef = doc(db, 'users', userId);
  const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
  const { coinsToAdd, cardsToAdd, newVocabularyData } = updates;

  try {
    const { newCoins, newMasteryCards } = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }

      const currentCoins = userDoc.data().coins || 0;
      const currentCards = userDoc.data().masteryCards || 0;

      const finalCoins = currentCoins + coinsToAdd;
      const finalCards = currentCards + cardsToAdd;

      transaction.update(userDocRef, {
        coins: finalCoins,
        masteryCards: finalCards,
      });

      transaction.set(achievementDocRef, {
        vocabulary: newVocabularyData,
        lastUpdated: new Date(),
      });

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
