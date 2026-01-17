// --- START OF FILE: course-data-service.ts ---

import { db } from '../firebase';
import { 
  doc, getDoc, setDoc, updateDoc, increment, collection, 
  getDocs, Unsubscribe, onSnapshot
} from 'firebase/firestore';
// Import DB và các interface mới từ local-vocab-db
import { localDB, ICompletedWord, ICompletedMultiWord, VocabularyItem } from '../local-data/local-vocab-db.ts'; 

// Import dữ liệu local khác
import quizData from './multiple-choice/multiple-data.ts'; 
import { exampleData } from '../voca-data/example-data.ts';
import { allWordPairs } from './voca-match/voca-match-data.ts';

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
 * [Lưu ý: Hàm này đọc từ Firestore, hiện đã lỗi thời]
 * Lấy danh sách các từ đã hoàn thành trong một game mode cụ thể.
 * @param userId - ID của người dùng.
 * @param gameModeId - ID của chế độ chơi (ví dụ: 'quiz-1').
 * @returns {Promise<Set<string>>} Một Set chứa các từ đã hoàn thành (viết thường).
 */
export const getCompletedWordsForGameMode = async (userId: string, gameModeId: string): Promise<Set<string>> => {
    console.warn("getCompletedWordsForGameMode is reading from Firestore, which may be stale. Use local data instead.");
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
  
  // Đọc từ localDB thay vì Firestore
  const [userDocSnap, localOpenedVocab, completedWordsData, completedMultiWordData] = await Promise.all([
    getDoc(userDocRef),
    localDB.getAllOpenedVocab(),
    localDB.getCompletedWords(),
    localDB.getCompletedMultiWords()
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0 };
  
  const openedVocabItems = localOpenedVocab
    .map(item => ({ id: item.id, word: item.word }))
    .filter(item => item.word && typeof item.id === 'number');
  
  // Xử lý dữ liệu từ localDB để lấy danh sách đã hoàn thành
  const completedWords = new Set<string>();
  if (isMultiWordGame) {
      completedMultiWordData.forEach(item => {
          if (item.completedIn?.[gameModeId]) {
              completedWords.add(item.phrase.toLowerCase());
          }
      });
  } else {
      completedWordsData.forEach(item => {
          if (item.gameModes?.[gameModeId]) {
              completedWords.add(item.word.toLowerCase());
          }
      });
  }

  return {
    coins: userData.coins || 0,
    masteryCards: userData.masteryCards || 0,
    openedVocabItems,
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

  // Thay thế getDocs từ Firestore bằng các lệnh gọi tới localDB
  const [userDocSnap, openedVocabData, completedWordsData, completedMultiWordData] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    localDB.getAllOpenedVocab(),
    localDB.getCompletedWords(),
    localDB.getCompletedMultiWords()
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : {};
  const claimedRewards = userData.claimedQuizRewards || {};
  const userVocabSet = new Set(openedVocabData.map(item => item.word?.toLowerCase()).filter(Boolean));
  
  // Xử lý dữ liệu đọc từ localDB
  const completedWordsByGameMode: { [mode: string]: Set<string> } = {};
  completedWordsData.forEach(item => {
    const gameModes = item.gameModes;
    if (gameModes) {
      for (const mode in gameModes) {
        if (!completedWordsByGameMode[mode]) completedWordsByGameMode[mode] = new Set();
        completedWordsByGameMode[mode].add(item.word.toLowerCase());
      }
    }
  });

  const completedMultiWordByGameMode: { [mode: string]: Set<string> } = {};
  completedMultiWordData.forEach(item => {
      const completedIn = item.completedIn || {};
      for (const mode in completedIn) {
          if (!completedMultiWordByGameMode[mode]) completedMultiWordByGameMode[mode] = new Set();
          completedMultiWordByGameMode[mode].add(item.phrase.toLowerCase());
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
 * Cache sẽ được xây dựng dần dần khi người dùng chơi, không cần đồng bộ từ Firestore nữa.
 * @param userId - Không còn cần thiết, nhưng giữ lại để API nhất quán.
 * @returns {Promise<VocabularyItem[]>} Dữ liệu thành tích từ cache.
 */
export const fetchAndSyncVocabularyData = async (userId: string): Promise<VocabularyItem[]> => {
  // Logic "Rebuild from Firestore" đã bị xóa vì Firestore không còn là nguồn tin cậy
  // cho `completedWords` nữa. Dữ liệu thành tích giờ được xây dựng hoàn toàn ở local.
  console.log("Fetching vocabulary achievements from local DB cache.");
  return await localDB.getVocabAchievements();
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
 * [HÀM NỘI BỘ] Cập nhật tiến trình cho một từ đơn trong Local DB.
 * @param wordId - Từ (đã lowercase).
 * @param gameModeId - ID của game mode.
 */
async function updateSingleWordProgressInLocalDB(wordId: string, gameModeId: string) {
    const existingWord = await localDB.completedWords.get(wordId);
    if (existingWord) {
        existingWord.lastCompletedAt = new Date();
        const correctCount = existingWord.gameModes[gameModeId]?.correctCount || 0;
        existingWord.gameModes[gameModeId] = { correctCount: correctCount + 1 };
        await localDB.completedWords.put(existingWord);
    } else {
        const newWord: ICompletedWord = {
            word: wordId,
            lastCompletedAt: new Date(),
            gameModes: { [gameModeId]: { correctCount: 1 } }
        };
        await localDB.completedWords.add(newWord);
    }
}

/**
 * Ghi lại kết quả khi người dùng trả lời đúng.
 * Cập nhật tiến trình & EXP vào LocalDB, chỉ cập nhật coin lên Firestore.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi.
 * @param completedWord Từ hoặc cụm từ đã hoàn thành.
 * @param isMultiWordGame Cờ xác định game điền 1 từ hay nhiều từ.
 * @param coinReward Số coin thưởng mặc định của game.
 * @returns {Promise<{coinsToAdd: number, cardsToAdd: number}>} Luôn trả về 0.
 */
export const recordGameSuccess = async (
  userId: string,
  gameModeId: string,
  completedWord: string,
  isMultiWordGame: boolean,
  coinReward: number
): Promise<{ coinsToAdd: number; cardsToAdd: number }> => {
  if (!userId || !completedWord) return { coinsToAdd: 0, cardsToAdd: 0 };

  // 1. Ghi nhận tiến trình vào LocalDB
  if (isMultiWordGame) {
    const multiWordId = completedWord.toLowerCase();
    const existingEntry = await localDB.completedMultiWord.get(multiWordId);
    
    if (existingEntry) {
        existingEntry.completedIn[gameModeId] = true;
        existingEntry.lastCompletedAt = new Date();
        await localDB.completedMultiWord.put(existingEntry);
    } else {
        const newEntry: ICompletedMultiWord = {
            phrase: multiWordId,
            lastCompletedAt: new Date(),
            completedIn: { [gameModeId]: true }
        };
        await localDB.completedMultiWord.add(newEntry);
    }
    
    // Cập nhật EXP và correctCount cho từng từ riêng lẻ
    const individualWords = completedWord.split(' ');
    for (const word of individualWords) {
      await updateSingleWordProgressInLocalDB(word.toLowerCase(), gameModeId);
      await addExpToLocalAchievementForWord(word);
    }
  } else {
    const wordId = completedWord.toLowerCase();
    // Cập nhật tiến trình và EXP vào local
    await updateSingleWordProgressInLocalDB(wordId, gameModeId);
    await addExpToLocalAchievementForWord(completedWord);
  }

  // 2. Chỉ cập nhật tiền tệ lên Firestore
  if (coinReward > 0) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { coins: increment(coinReward) });
  }
  
  // 3. Trả về không có phần thưởng level-up, vì nó sẽ được claim sau
  return { coinsToAdd: 0, cardsToAdd: 0 };
};

/**
 * [ĐỌC TỪ LOCAL] Lấy tất cả dữ liệu tiến trình game từ Local DB.
 * @returns {Promise<{completedWordsData: ICompletedWord[], completedMultiWordData: ICompletedMultiWord[]}>}
 */
export const fetchAllLocalProgress = async () => {
  const [completedWordsData, completedMultiWordData] = await Promise.all([
    localDB.getCompletedWords(),
    localDB.getCompletedMultiWords()
  ]);
  return { completedWordsData, completedMultiWordData };
};
