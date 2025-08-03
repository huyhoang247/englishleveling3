// src/data-loader.ts
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

// Định nghĩa một interface cho dữ liệu cốt lõi của người dùng để dễ quản lý
export interface UserCoreData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: any[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  equipment: { pieces: number; owned: any[]; equipped: any };
}

// Định nghĩa interface cho từ vựng
export interface VocabularyItem {
  id: number;
  word: string;
  exp: number;
  level: number;
  maxExp: number;
}

// Hàm fetchUserData để lấy dữ liệu người dùng
export const fetchUserData = async (userId: string): Promise<UserCoreData> => {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();
    console.log("User data fetched from data-loader:", data);
    // Trả về dữ liệu với giá trị mặc định nếu một trường nào đó bị thiếu
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
    // Trường hợp này hiếm khi xảy ra vì ensureUserDocumentExists đã chạy trước đó,
    // nhưng đây là một biện pháp phòng ngừa.
    console.warn("User document not found in fetchUserData, this should not happen.");
    throw new Error("User document not found after ensuring its existence.");
  }
};

// Hàm fetchVocabularyData để lấy dữ liệu thành tựu từ vựng
export const fetchVocabularyData = async (userId: string): Promise<VocabularyItem[]> => {
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

        const existingAchievements: VocabularyItem[] = achievementDocSnap.exists() ? (achievementDocSnap.data().vocabulary || []) : [];
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

        console.log("Vocabulary achievements data synced and merged correctly from data-loader.");
        return finalVocabularyData;
    } catch (error) {
        console.error("Error fetching and syncing vocabulary achievements data:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
};

// Dữ liệu từ vựng khởi tạo (nếu cần)
export const initialVocabularyData: VocabularyItem[] = [
    { id: 1, word: 'apple', exp: 50, level: 1, maxExp: 100 },
    { id: 2, word: 'book', exp: 120, level: 2, maxExp: 200 },
    { id: 3, word: 'car', exp: 0, level: 1, maxExp: 100 },
];
