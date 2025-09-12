// --- START OF FILE achievementService.ts (NEW FILE) ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs
} from 'firebase/firestore';

// Định nghĩa kiểu dữ liệu được chuyển sang đây từ gameDataService.ts
export interface VocabularyItem { 
  id: number; 
  word: string; 
  exp: number; 
  level: number; 
  maxExp: number; 
}

/**
 * Lấy dữ liệu từ sub-collection 'completedWords' và đồng bộ hóa nó với dữ liệu thành tích
 * trong 'gamedata/achievements' để tính toán EXP và Level cho mỗi từ.
 * @param userId - ID của người dùng.
 * @returns {Promise<VocabularyItem[]>} Một mảng dữ liệu thành tích từ vựng đã được đồng bộ.
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

/**
 * Cập nhật dữ liệu thành tích của người dùng trong một transaction.
 * Bao gồm cộng vàng, thẻ master và lưu lại danh sách từ vựng mới.
 * @param userId - ID của người dùng.
 * @param updates - Dữ liệu cần cập nhật.
 * @returns {Promise<{ newCoins: number; newMasteryCards: number }>} Số dư vàng và thẻ master mới.
 */
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

// --- END OF FILE achievementService.ts ---
