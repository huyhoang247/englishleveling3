--- START OF FILE course-data-service (1)hhh.ts.txt ---
// --- START OF FILE: course-data-service.ts ---

import { db } from '../firebase';
import { 
  doc, getDoc, setDoc, updateDoc, increment, collection, 
  getDocs, writeBatch, Unsubscribe, onSnapshot, runTransaction
} from 'firebase/firestore';
import { localDB } from '../local-data/local-vocab-db.ts'; 

// Import dữ liệu local khác
import quizData from './multiple-choice/multiple-data.ts'; 
import { exampleData } from '../voca-data/example-data.ts';
import { allWordPairs } from './voca-match/voca-match-data.ts';

// Interface cho Item thành tích
export interface VocabularyItem { 
  id: number; 
  word: string; 
  exp: number; 
  level: number; 
  maxExp: number; 
}

/**
 * Lấy dữ liệu người dùng. Nếu người dùng chưa tồn tại trong Firestore, tạo mới với giá trị mặc định.
 * @param userId - ID của người dùng.
 * @returns {Promise<any>} Dữ liệu của người dùng.
 */
export const fetchOrCreateUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Người dùng không tồn tại, tạo mới document
    const newUser = {
      coins: 0,
      masteryCards: 0,
      createdAt: new Date(),
      // Khởi tạo các trường milestone và rewards để tránh lỗi khi truy cập
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }
};

/**
 * Cập nhật số coin của người dùng trên Firestore.
 * @param userId - ID của người dùng.
 * @param amount - Số coin cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<void>}
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount === 0) {
    return;
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coins: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update coins for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Cập nhật số mastery card của người dùng trên Firestore.
 * @param userId - ID của người dùng.
 * @param amount - Số lượng mastery card cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<void>}
 */
export const updateUserMastery = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount === 0) {
    return;
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      masteryCards: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update mastery cards for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách từ vựng đã mở của người dùng từ IndexedDB.
 * @param userId - ID của người dùng (giữ lại để nhất quán API, nhưng không dùng đến).
 * @returns {Promise<string[]>} Mảng các từ vựng đã mở.
 */
export const getOpenedVocab = async (userId: string): Promise<string[]> => {
    const openedVocabData = await localDB.getAllOpenedVocab();
    return openedVocabData.map(item => item.word).filter(Boolean);
};

/**
 * Lấy danh sách các từ đã hoàn thành trong một game mode cụ thể.
 * @param userId - ID của người dùng.
 * @param gameModeId - ID của chế độ chơi (ví dụ: 'quiz-1').
 * @returns {Promise<Set<string>>} Một Set chứa các từ đã hoàn thành (viết thường).
 */
export const getCompletedWordsForGameMode = async (userId: string, gameModeId: string): Promise<Set<string>> => {
    const completedSnapshot = await getDocs(collection(db, 'users', userId, 'completedWords'));
    const completedSet = new Set<string>();
    completedSnapshot.forEach((doc) => {
        if (doc.data()?.gameModes?.[gameModeId]) {
            completedSet.add(doc.id.toLowerCase());
        }
    });
    return completedSet;
};

/**
 * Interface cho dữ liệu khởi tạo game.
 */
interface GameInitialData {
  coins: number;
  masteryCards: number;
  // <<< THAY ĐỔI: Đổi tên và cấu trúc để rõ ràng hơn, chứa cả ID số
  openedVocabItems: { id: number, word: string }[]; 
  completedWords: Set<string>;
}

/**
 * Lấy tất cả dữ liệu cần thiết để bắt đầu một màn chơi.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi.
 * @param isMultiWordGame Cờ xác định đây là game điền 1 từ hay nhiều từ.
 * @returns {Promise<GameInitialData>} Dữ liệu khởi tạo game.
 */
export const fetchGameInitialData = async (userId: string, gameModeId: string, isMultiWordGame: boolean): Promise<GameInitialData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const completedCollectionName = isMultiWordGame ? 'completedMultiWord' : 'completedWords';
  const completedWordsRef = collection(db, 'users', userId, completedCollectionName);

  const [userDocSnap, localOpenedVocab, completedWordsSnap] = await Promise.all([
    getDoc(userDocRef),
    localDB.getAllOpenedVocab(),
    getDocs(completedWordsRef)
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0 };
  
  // <<< THAY ĐỔI QUAN TRỌNG: Gửi về ID số (item.id) và từ (item.word)
  // id này sẽ được dùng cho imageIndex trong Practice 1
  const openedVocabItems = localOpenedVocab
    .map(item => ({ id: item.id, word: item.word }))
    .filter(item => item.word && typeof item.id === 'number');
  
  const completedWords = new Set<string>();
  completedWordsSnap.forEach(docSnap => {
    const data = docSnap.data();
    const targetKey = isMultiWordGame ? 'completedIn' : 'gameModes';
    if (data?.[targetKey]?.[gameModeId]) {
      completedWords.add(docSnap.id.toLowerCase());
    }
  });

  return {
    coins: userData.coins || 0,
    masteryCards: userData.masteryCards || 0,
    openedVocabItems, // <<< THAY ĐỔI: Trả về dữ liệu đã được sửa
    completedWords
  };
};

/**
 * Interface cho dữ liệu cốt lõi của người dùng được lắng nghe.
 */
export interface UserCoreData {
  coins: number;
  masteryCards: number;
}

/**
 * Lắng nghe các thay đổi trên document của người dùng trong thời gian thực.
 * @param userId - ID của người dùng.
 * @param callback - Hàm sẽ được gọi với dữ liệu người dùng mỗi khi có thay đổi.
 * @returns {Unsubscribe} Một hàm để hủy lắng nghe.
 */
export const listenToUserData = (userId: string, callback: (data: UserCoreData | null) => void): Unsubscribe => {
  if (!userId) {
    callback(null);
    return () => {}; 
  }

  const userDocRef = doc(db, 'users', userId);
  
  const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        coins: data.coins || 0,
        masteryCards: data.masteryCards || 0,
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error listening to user data for ${userId}:`, error);
    callback(null);
  });

  return unsubscribe;
};

/**
 * Interface cho dữ liệu tiến trình trả về.
 */
export interface PracticeProgressPayload {
  progressData: { [key: number]: { completed: number; total: number } };
  claimedRewards: { [key: string]: boolean };
}

/**
 * Lấy và tính toán dữ liệu tiến trình cho danh sách bài luyện tập.
 * @param userId ID người dùng.
 * @param selectedType Loại hình luyện tập.
 * @returns {Promise<PracticeProgressPayload>} Dữ liệu tiến trình và các phần thưởng đã nhận.
 */
export const fetchPracticeListProgress = async (
  userId: string, 
  selectedType: 'tracNghiem' | 'dienTu' | 'vocaMatch'
): Promise<PracticeProgressPayload> => {
  if (!userId || !selectedType) {
    throw new Error("User ID and selected type are required.");
  }

  const [userDocSnap, openedVocabData, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    localDB.getAllOpenedVocab(),
    getDocs(collection(db, 'users', userId, 'completedWords')),
    getDocs(collection(db, 'users', userId, 'completedMultiWord'))
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : {};
  const claimedRewards = userData.claimedQuizRewards || {};
  const userVocabSet = new Set(openedVocabData.map(item => item.word?.toLowerCase()).filter(Boolean));
  
  const completedWordsByGameMode: { [mode: string]: Set<string> } = {};
  completedWordsSnapshot.forEach(doc => {
    const gameModes = doc.data().gameModes;
    if (gameModes) {
      for (const mode in gameModes) {
        if (!completedWordsByGameMode[mode]) completedWordsByGameMode[mode] = new Set();
        completedWordsByGameMode[mode].add(doc.id.toLowerCase());
      }
    }
  });

  const completedMultiWordByGameMode: { [mode: string]: Set<string> } = {};
  completedMultiWordSnapshot.forEach(docSnap => {
      const completedIn = docSnap.data().completedIn || {};
      for (const mode in completedIn) {
          if (!completedMultiWordByGameMode[mode]) completedMultiWordByGameMode[mode] = new Set();
          completedMultiWordByGameMode[mode].add(docSnap.id.toLowerCase());
      }
  });
  
  const newProgressData: { [key: number]: { completed: number; total: number } } = {};
  const MAX_PREVIEWS = 5;

  if (userVocabSet.size > 0) {
      const vocabRegex = new RegExp(`\\b(${Array.from(userVocabSet).join('|')})\\b`, 'ig');

      if (selectedType === 'tracNghiem') {
          const questionToUserVocab = new Map<any, string[]>();
          quizData.forEach(question => {
              const matches = question.question.match(vocabRegex);
              if (matches) questionToUserVocab.set(question, [...new Set(matches.map(w => w.toLowerCase()))]);
          });
          
          const wordToRelevantExampleSentences = new Map<string, any[]>();
          exampleData.forEach(sentence => {
              const matches = sentence.english.match(vocabRegex);
              if (matches) [...new Set(matches.map(w => w.toLowerCase()))].forEach(word => {
                  if (!wordToRelevantExampleSentences.has(word)) wordToRelevantExampleSentences.set(word, []);
                  wordToRelevantExampleSentences.get(word)!.push(sentence);
              });
          });

          const allModes = Array.from({ length: MAX_PREVIEWS + 1 }, (_, i) => i === 0 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5].map(n => i*100+n)).flat();
          const totalP1 = questionToUserVocab.size;
          const totalP2_P3_P5 = wordToRelevantExampleSentences.size;
          const totalP4 = userVocabSet.size;

          allModes.forEach(num => {
              const modeId = `quiz-${num}`;
              const baseNum = num % 100;
              const completedSet = completedWordsByGameMode[modeId] || new Set();
              if (baseNum === 1) {
                  let completedCount = 0;
                  questionToUserVocab.forEach(words => { if (words.some(w => completedSet.has(w))) completedCount++; });
                  newProgressData[num] = { completed: completedCount, total: totalP1 };
              } else if (baseNum === 2 || baseNum === 3 || baseNum === 5) {
                  let completedCount = 0;
                  for (const word of wordToRelevantExampleSentences.keys()) { if (completedSet.has(word)) completedCount++; }
                  newProgressData[num] = { completed: completedCount, total: totalP2_P3_P5 };
              } else if (baseNum === 4) {
                  newProgressData[num] = { completed: completedSet.size, total: totalP4 };
              }
          });
      } 
      else if (selectedType === 'vocaMatch') {
          const relevantPairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const totalWords = relevantPairs.length;
          
          [1, 2].forEach(num => {
              const practiceModeId = `match-${num}`;
              const completedSet = completedWordsByGameMode[practiceModeId] || new Set();
              newProgressData[num] = { completed: completedSet.size, total: totalWords };
          });
      }
      else if (selectedType === 'dienTu') {
          const sentenceToUserVocab = new Map<any, string[]>();
          exampleData.forEach(sentence => {
              const matches = sentence.english.match(vocabRegex);
              if (matches) sentenceToUserVocab.set(sentence, [...new Set(matches.map(w => w.toLowerCase()))]);
          });
          const wordToRelevantExampleSentences = new Map<string, any[]>();
          sentenceToUserVocab.forEach((words, sentence) => {
              words.forEach(word => {
                  if (!wordToRelevantExampleSentences.has(word)) wordToRelevantExampleSentences.set(word, []);
                  wordToRelevantExampleSentences.get(word)!.push(sentence);
              });
          });

          const allModes = Array.from({ length: MAX_PREVIEWS + 1 }, (_, i) => i === 0 ? [1,2,3,4,5,6,7,8] : [1,2,3,4,5,6,7,8].map(n => i*100+n)).flat();
          const totals = { p1: userVocabSet.size, p2: wordToRelevantExampleSentences.size, p3: 0, p4: 0, p5: 0, p6: 0, p7: sentenceToUserVocab.size };

          sentenceToUserVocab.forEach(words => {
              if (words.length >= 2) totals.p3++;
              if (words.length >= 3) totals.p4++;
              if (words.length >= 4) totals.p5++;
              if (words.length >= 5) totals.p6++;
          });

          allModes.forEach(num => {
              const modeId = `fill-word-${num}`;
              const baseNum = num % 100;
              if (baseNum === 1 || baseNum === 8) {
                  newProgressData[num] = { completed: (completedWordsByGameMode[modeId] || new Set()).size, total: totals.p1 };
              } 
              else if (baseNum === 2) {
                  let completedCount = 0;
                  const completedSet = completedWordsByGameMode[modeId] || new Set();
                  for (const word of wordToRelevantExampleSentences.keys()) { if (completedSet.has(word)) completedCount++; }
                  newProgressData[num] = { completed: completedCount, total: totals.p2 };
              } else if (baseNum >= 3 && baseNum <= 7) {
                  newProgressData[num] = { completed: (completedMultiWordByGameMode[modeId] || new Set()).size, total: totals[`p${baseNum}`] };
              }
          });
      }
  }

  return {
    progressData: newProgressData,
    claimedRewards: claimedRewards
  };
};

/**
 * Ghi nhận việc người dùng nhận thưởng từ một cột mốc trong quiz.
 * @param userId - ID của người dùng.
 * @param rewardId - ID của phần thưởng.
 * @param coinAmount - Số coin thưởng.
 * @param masteryCardAmount - Số thẻ mastery thưởng.
 * @returns {Promise<void>}
 */
export const claimQuizReward = async (
  userId: string,
  rewardId: string,
  coinAmount: number,
  masteryCardAmount: number
): Promise<void> => {
  if (!userId || !rewardId) return;

  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coins: increment(coinAmount),
      masteryCards: increment(masteryCardAmount),
      [`claimedQuizRewards.${rewardId}`]: true
    });
  } catch (error) {
    console.error(`Failed to claim quiz reward ${rewardId} for user ${userId}:`, error);
    throw error;
  }
};

// =====================================================================
// --- LOGIC THÀNH TÍCH (ACHIEVEMENT) - HOÀN TOÀN LOCAL ---
// =====================================================================

const EXP_PER_SUCCESS = 100; // Điểm kinh nghiệm cho mỗi lần trả lời đúng

/**
 * [ĐỌC TỪ CACHE] Lấy dữ liệu thành tích từ Local DB.
 * Nếu cache rỗng, nó sẽ cố gắng xây dựng lại từ Firestore một lần duy nhất.
 * @param userId - Cần thiết cho lần xây dựng cache đầu tiên.
 * @returns {Promise<VocabularyItem[]>} Dữ liệu thành tích từ cache.
 */
export const fetchAndSyncVocabularyData = async (userId: string): Promise<VocabularyItem[]> => {
  if (!userId) return [];
  console.log("Fetching vocabulary achievements from local DB cache.");
  let localAchievements = await localDB.getVocabAchievements();

  // Nếu local DB trống (lần đầu tiên chơi hoặc sau khi xóa cache), xây dựng lại từ server.
  if (localAchievements.length === 0) {
    console.log("Local achievement cache is empty. Rebuilding from Firestore...");
    const completedWordsSnap = await getDocs(collection(db, 'users', userId, 'completedWords'));
    if (completedWordsSnap.empty) {
      console.log("No completed words found on Firestore. Nothing to rebuild.");
      return []; // Không có gì để xây dựng
    }

    const rebuildPromises = completedWordsSnap.docs.map(async (wordDoc) => {
        const word = wordDoc.id;
        const gameModes = wordDoc.data().gameModes || {};
        let totalCorrectCount = 0;
        Object.values(gameModes).forEach((mode: any) => {
            totalCorrectCount += mode.correctCount || 0;
        });
        
        const totalExp = totalCorrectCount * EXP_PER_SUCCESS;
        let level = 1;
        let expRemaining = totalExp;
        let expForNextLevel = 100;

        while (expRemaining >= expForNextLevel) {
            expRemaining -= expForNextLevel;
            level++;
            expForNextLevel = level * 100;
        }

        return { id: 0, word, exp: expRemaining, level, maxExp: expForNextLevel };
    });

    localAchievements = await Promise.all(rebuildPromises);
    
    // Gán lại ID tuần tự và lưu vào localDB
    localAchievements.forEach((item, index) => item.id = index + 1);
    await localDB.saveVocabAchievements(localAchievements);
    console.log("Local achievement cache has been rebuilt and saved.");
  }
  
  return localAchievements;
};

/**
 * [HÀM NỘI BỘ] Chỉ cộng EXP cho một từ trên Local DB. Không xử lý level up.
 * @param word - Từ vừa trả lời đúng (viết thường).
 */
const addExpToLocalAchievementForWord = async (word: string): Promise<void> => {
    const lowerCaseWord = word.toLowerCase();
    let currentItem = await localDB.vocabAchievements.get(lowerCaseWord);

    if (!currentItem) {
        const allItems = await localDB.getVocabAchievements();
        currentItem = {
            id: allItems.length + 1,
            word: lowerCaseWord,
            level: 1,
            exp: 0,
            maxExp: 100
        };
    }

    currentItem.exp += EXP_PER_SUCCESS;
    await localDB.vocabAchievements.put(currentItem);
};

/**
 * Cập nhật dữ liệu thành tích khi người dùng "claim" phần thưởng.
 * Cập nhật coin/thẻ trên Firestore và ghi đè dữ liệu thành tích trên Local DB.
 * @param userId - ID của người dùng.
 * @param updates - Dữ liệu cần cập nhật.
 */
export const updateAchievementData = async (
  userId: string,
  updates: { coinsToAdd: number; cardsToAdd: number; newVocabularyData: VocabularyItem[] }
): Promise<void> => {
  if (!userId) throw new Error("User ID is required for updating achievements.");
  
  const { coinsToAdd, cardsToAdd, newVocabularyData } = updates;

  // 1. Cập nhật coin và thẻ trên Firestore
  if (coinsToAdd > 0 || cardsToAdd > 0) {
    const userDocRef = doc(db, 'users', userId);
    const payload: { [key: string]: any } = {};
    if (coinsToAdd > 0) payload.coins = increment(coinsToAdd);
    if (cardsToAdd > 0) payload.masteryCards = increment(cardsToAdd);
    await updateDoc(userDocRef, payload).catch(err => {
        console.error(`Failed to update user currency for ${userId}:`, err);
        throw err;
    });
  }

  // 2. Lưu lại toàn bộ danh sách từ vựng mới vào Local DB
  await localDB.saveVocabAchievements(newVocabularyData);
  console.log(`Local achievements updated and saved for user ${userId}.`);
};


/**
 * Ghi lại kết quả khi người dùng trả lời đúng VÀ chỉ cập nhật EXP local.
 * Việc lên cấp và nhận thưởng sẽ được xử lý riêng khi người dùng claim.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi.
 * @param completedWord Từ hoặc cụm từ đã hoàn thành.
 * @param isMultiWordGame Cờ xác định game điền 1 từ hay nhiều từ.
 * @param coinReward Số coin thưởng mặc định của game.
 * @returns {Promise<{coinsToAdd: number, cardsToAdd: number}>} Luôn trả về 0 vì không có thưởng level up ở đây.
 */
export const recordGameSuccess = async (
  userId: string,
  gameModeId: string,
  completedWord: string,
  isMultiWordGame: boolean,
  coinReward: number
): Promise<{ coinsToAdd: number; cardsToAdd: number }> => {
  if (!userId || !completedWord) return { coinsToAdd: 0, cardsToAdd: 0 };

  const batch = writeBatch(db);
  const userDocRef = doc(db, 'users', userId);

  // 1. Ghi nhận `completedWords` lên Firestore và cập nhật EXP local
  if (isMultiWordGame) {
    const multiWordId = completedWord.toLowerCase();
    const completedMultiWordRef = doc(db, 'users', userId, 'completedMultiWord', multiWordId);
    batch.set(completedMultiWordRef, { completedIn: { [gameModeId]: true }, lastCompletedAt: new Date() }, { merge: true });
    
    const individualWords = completedWord.split(' ');
    for (const word of individualWords) {
      const individualWordRef = doc(db, 'users', userId, 'completedWords', word.toLowerCase());
      batch.set(individualWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
      // Cập nhật EXP local cho từng từ
      await addExpToLocalAchievementForWord(word);
    }
  } else {
    const wordId = completedWord.toLowerCase();
    const completedWordRef = doc(db, 'users', userId, 'completedWords', wordId);
    batch.set(completedWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
     // Cập nhật EXP local
    await addExpToLocalAchievementForWord(completedWord);
  }

  // 2. Cập nhật tiền tệ trên Firestore (chỉ thưởng game cơ bản)
  if (coinReward > 0) {
    batch.update(userDocRef, { coins: increment(coinReward) });
  }
  
  // 3. Commit batch lên Firestore
  await batch.commit();

  // 4. Trả về không có phần thưởng level-up, vì nó sẽ được claim sau
  return { coinsToAdd: 0, cardsToAdd: 0 };
};
