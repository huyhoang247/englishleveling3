import { db } from '../firebase';
import { 
  doc, getDoc, setDoc, updateDoc, increment, collection, 
  getDocs, writeBatch, arrayUnion, onSnapshot, Unsubscribe 
} from 'firebase/firestore';
// Import các dữ liệu local cần thiết cho hàm mới
import quizData from './multiple-choice/multiple-data.ts'; 
import { exampleData } from '../voca-data/example-data.ts';
import { allWordPairs } from './voca-match/voca-match-data.ts'; // ADDED

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
    return; // Không thực hiện nếu không có userId hoặc số lượng thay đổi là 0
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coins: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update coins for user ${userId}:`, error);
    throw error; // Ném lỗi ra để component gốc có thể xử lý
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
    return; // Không thực hiện nếu không có userId hoặc số lượng thay đổi là 0
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      masteryCards: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update mastery cards for user ${userId}:`, error);
    throw error; // Ném lỗi ra để component gốc có thể xử lý
  }
};

/**
 * Lấy danh sách từ vựng đã mở của người dùng.
 * @param userId - ID của người dùng.
 * @returns {Promise<string[]>} Mảng các từ vựng đã mở.
 */
export const getOpenedVocab = async (userId: string): Promise<string[]> => {
    const vocabSnapshot = await getDocs(collection(db, 'users', userId, 'openedVocab'));
    return vocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);
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

// --- CÁC HÀM MỚI ĐƯỢC THÊM VÀO ---

/**
 * Interface cho dữ liệu khởi tạo game.
 */
interface GameInitialData {
  coins: number;
  masteryCards: number;
  openedVocabWords: { id: string, word: string }[];
  completedWords: Set<string>;
}

/**
 * Lấy tất cả dữ liệu cần thiết để bắt đầu một màn chơi.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi (ví dụ: 'fill-word-1').
 * @param isMultiWordGame Cờ xác định đây là game điền 1 từ hay nhiều từ.
 * @returns {Promise<GameInitialData>} Dữ liệu khởi tạo game.
 */
export const fetchGameInitialData = async (userId: string, gameModeId: string, isMultiWordGame: boolean): Promise<GameInitialData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const openedVocabRef = collection(db, 'users', userId, 'openedVocab');
  const completedCollectionName = isMultiWordGame ? 'completedMultiWord' : 'completedWords';
  const completedWordsRef = collection(db, 'users', userId, completedCollectionName);

  const [userDocSnap, openedVocabSnap, completedWordsSnap] = await Promise.all([
    getDoc(userDocRef),
    getDocs(openedVocabRef),
    getDocs(completedWordsRef)
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0 };

  const openedVocabWords = openedVocabSnap.docs.map(d => ({ id: d.id, word: d.data().word })).filter(item => item.word);
  
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
    openedVocabWords,
    completedWords
  };
};

/**
 * Ghi lại kết quả khi người dùng trả lời đúng một từ/câu.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi.
 * @param completedWord Từ hoặc cụm từ đã hoàn thành.
 * @param isMultiWordGame Cờ xác định game điền 1 từ hay nhiều từ.
 * @param coinReward Số coin thưởng.
 */
export const recordGameSuccess = async (
  userId: string,
  gameModeId: string,
  completedWord: string,
  isMultiWordGame: boolean,
  coinReward: number
): Promise<void> => {
  if (!userId || !completedWord) return;

  const batch = writeBatch(db);
  const userDocRef = doc(db, 'users', userId);

  if (isMultiWordGame) {
    // Ghi lại việc hoàn thành câu hỏi nhiều từ
    const multiWordId = completedWord.toLowerCase();
    const completedMultiWordRef = doc(db, 'users', userId, 'completedMultiWord', multiWordId);
    batch.set(completedMultiWordRef, {
      completedIn: { [gameModeId]: true },
      lastCompletedAt: new Date()
    }, { merge: true });

    // Ghi lại việc hoàn thành từng từ đơn lẻ trong câu
    const individualWords = completedWord.split(' ');
    individualWords.forEach(word => {
      const individualWordRef = doc(db, 'users', userId, 'completedWords', word.toLowerCase());
      batch.set(individualWordRef, { 
        lastCompletedAt: new Date(), 
        gameModes: { [gameModeId]: { correctCount: increment(1) } } 
      }, { merge: true });
    });

  } else {
    // Ghi lại việc hoàn thành từ đơn
    const wordId = completedWord.toLowerCase();
    const completedWordRef = doc(db, 'users', userId, 'completedWords', wordId);
    batch.set(completedWordRef, { 
      lastCompletedAt: new Date(), 
      gameModes: { [gameModeId]: { correctCount: increment(1) } } 
    }, { merge: true });
  }

  // Cập nhật coin thưởng nếu có
  if (coinReward > 0) {
    batch.update(userDocRef, { coins: increment(coinReward) });
  }

  await batch.commit();
};


// --- CÁC HÀM MỚI TÍCH HỢP TỪ ANALYSISDASHBOARD ---

/**
 * Interface cho dữ liệu được trả về cho trang Analysis Dashboard.
 */
interface AnalysisDashboardDataPayload {
  userData: {
    coins: number;
    masteryCards: number;
    claimedDailyGoals: number[];
    claimedVocabMilestones: number[];
  };
  analysisData: {
    totalWordsLearned: number;
    totalWordsAvailable: number;
    learningActivity: { date: string; new: number; review: number; }[];
    masteryByGame: { game: string; completed: number; }[];
    vocabularyGrowth: { date: string; cumulative: number; }[];
    recentCompletions: { word: string; date: string }[];
    wordMastery: { word: string; mastery: number; lastPracticed: Date; }[];
  };
  dailyActivityMap: { [date: string]: { new: number; review: number } };
}

/**
 * Hàm trợ giúp để định dạng ngày theo giờ địa phương (YYYY-MM-DD).
 * @param date - Đối tượng Date cần định dạng.
 * @returns {string} Chuỗi ngày tháng theo định dạng YYYY-MM-DD.
 */
const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Lấy và xử lý tất cả dữ liệu cần thiết cho trang Analysis Dashboard.
 * @param userId - ID của người dùng.
 * @param totalWordsAvailable - Tổng số từ vựng có trong hệ thống (từ defaultVocabulary.length).
 * @returns {Promise<AnalysisDashboardDataPayload>} Dữ liệu đã được xử lý cho dashboard.
 */
export const fetchAnalysisDashboardData = async (userId: string, totalWordsAvailable: number): Promise<AnalysisDashboardDataPayload> => {
  if (!userId) throw new Error("User ID is required.");

  const [userData, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
    fetchOrCreateUser(userId),
    getDocs(collection(db, 'users', userId, 'completedWords')),
    getDocs(collection(db, 'users', userId, 'completedMultiWord'))
  ]);

  const todayString = formatDateToLocalYYYYMMDD(new Date());

  // Xử lý dữ liệu
  const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
  const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
  const dailyActivityMap: { [date: string]: { new: number; review: number } } = {};
  const allCompletionsForRecent: { word: string; date: Date }[] = [];

  completedWordsSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const lastCompletedAt = data.lastCompletedAt?.toDate();
    if (!lastCompletedAt) return;
    
    allCompletionsForRecent.push({ word: docSnap.id, date: lastCompletedAt });
    const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
    if (!dailyActivityMap[dateString]) dailyActivityMap[dateString] = { new: 0, review: 0 };

    let totalCompletions = 0, totalCorrectForWord = 0;
    if (data.gameModes) {
      Object.values(data.gameModes).forEach((modeData: any) => { totalCompletions += modeData.correctCount || 0; });
      Object.keys(data.gameModes).forEach(mode => {
        const correctCount = data.gameModes[mode].correctCount || 0;
        totalCorrectForWord += correctCount;
        if (mode.startsWith('quiz-')) masteryByGame['Trắc nghiệm'] += correctCount;
        else if (mode.startsWith('fill-word-')) masteryByGame['Điền từ'] += correctCount;
      });
    }

    if (totalCompletions > 1) dailyActivityMap[dateString].review++;
    else if (totalCompletions === 1) dailyActivityMap[dateString].new++;
    
    if (totalCorrectForWord > 0) wordMasteryMap[docSnap.id] = { mastery: totalCorrectForWord, lastPracticed: lastCompletedAt };
  });

  completedMultiWordSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const lastCompletedAt = data.lastCompletedAt?.toDate();
    if (!lastCompletedAt) return;
    allCompletionsForRecent.push({ word: docSnap.id, date: lastCompletedAt });
    if (data.completedIn) Object.keys(data.completedIn).forEach(mode => { if (mode.startsWith('fill-word-')) masteryByGame['Điền từ']++; });
  });

  const learningActivityData = Object.entries(dailyActivityMap).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let cumulative = 0;
  const vocabularyGrowthData = learningActivityData.map(item => {
    cumulative += item.new;
    return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative };
  });

  const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed })).filter(item => item.completed > 0);
  const recentCompletions = [...allCompletionsForRecent].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map(c => ({ word: c.word, date: c.date.toLocaleString('vi-VN') }));
  const wordMasteryData = Object.entries(wordMasteryMap).map(([word, data]) => ({ word, ...data }));

  return {
    userData: {
      coins: userData.coins || 0,
      masteryCards: userData.masteryCards || 0,
      claimedDailyGoals: userData.claimedDailyGoals?.[todayString] || [],
      claimedVocabMilestones: userData.claimedVocabMilestones || [],
    },
    analysisData: {
      totalWordsLearned: completedWordsSnapshot.size,
      totalWordsAvailable,
      learningActivity: learningActivityData.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
      masteryByGame: masteryData,
      vocabularyGrowth: vocabularyGrowthData,
      recentCompletions,
      wordMastery: wordMasteryData,
    },
    dailyActivityMap,
  };
};

/**
 * Ghi nhận việc người dùng nhận thưởng cột mốc hàng ngày.
 * @param userId - ID của người dùng.
 * @param milestone - Cột mốc đã đạt (ví dụ: 5, 10, 20).
 * @param rewardAmount - Số coin thưởng.
 * @returns {Promise<void>}
 */
export const claimDailyMilestoneReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  const todayString = formatDateToLocalYYYYMMDD(new Date());
  const fieldKey = `claimedDailyGoals.${todayString}`;

  try {
    await updateDoc(userDocRef, {
      coins: increment(rewardAmount),
      [fieldKey]: arrayUnion(milestone)
    });
  } catch (error) {
    console.error(`Failed to claim daily milestone for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Ghi nhận việc người dùng nhận thưởng cột mốc từ vựng trọn đời.
 * @param userId - ID của người dùng.
 * @param milestone - Cột mốc đã đạt (ví dụ: 100, 200, 500).
 * @param rewardAmount - Số coin thưởng.
 * @returns {Promise<void>}
 */
export const claimVocabMilestoneReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      coins: increment(rewardAmount),
      claimedVocabMilestones: arrayUnion(milestone)
    });
  } catch (error) {
    console.error(`Failed to claim vocabulary milestone for user ${userId}:`, error);
    throw error;
  }
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
 * @returns {Unsubscribe} Một hàm để hủy lắng nghe, cho phép component dọn dẹp.
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


// --- CÁC HÀM MỚI TÁI CẤU TRÚC TỪ QUIZ-APP-HOME ---

/**
 * Interface cho dữ liệu tiến trình trả về.
 */
export interface PracticeProgressPayload {
  progressData: { [key: number]: { completed: number; total: number } };
  claimedRewards: { [key: string]: boolean };
}

/**
 * Lấy và tính toán dữ liệu tiến trình cho danh sách bài luyện tập (Quiz và Fill Word).
 * Tái cấu trúc từ hàm calculateProgress trong component PracticeList.
 * @param userId ID người dùng.
 * @param selectedType Loại hình luyện tập ('tracNghiem', 'dienTu', hoặc 'vocaMatch').
 * @returns {Promise<PracticeProgressPayload>} Dữ liệu tiến trình và các phần thưởng đã nhận.
 */
export const fetchPracticeListProgress = async (
  userId: string, 
  selectedType: 'tracNghiem' | 'dienTu' | 'vocaMatch'
): Promise<PracticeProgressPayload> => {
  if (!userId || !selectedType) {
    throw new Error("User ID and selected type are required.");
  }

  const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(collection(db, 'users', userId, 'openedVocab')),
    getDocs(collection(db, 'users', userId, 'completedWords')),
    getDocs(collection(db, 'users', userId, 'completedMultiWord'))
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : {};
  const claimedRewards = userData.claimedQuizRewards || {};
  const userVocabSet = new Set(openedVocabSnapshot.docs.map(doc => doc.data().word?.toLowerCase()).filter(Boolean));
  
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
      else if (selectedType === 'vocaMatch') { // <<< MODIFIED
          const relevantPairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const totalWords = relevantPairs.length;
          
          // Calculate progress for both Practice 1 and 2
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

          const allModes = Array.from({ length: MAX_PREVIEWS + 1 }, (_, i) => i === 0 ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6,7].map(n => i*100+n)).flat();
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
              if (baseNum === 1) {
                  newProgressData[num] = { completed: (completedWordsByGameMode[modeId] || new Set()).size, total: totals.p1 };
              } else if (baseNum === 2) {
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
 * Tái cấu trúc từ hàm handleClaim trong component RewardsPopup.
 * @param userId - ID của người dùng.
 * @param rewardId - ID của phần thưởng (ví dụ: 'tracNghiem-1-100').
 * @param coinAmount - Số coin thưởng.
 * @param masteryCardAmount - Số thẻ mastery thưởng (đã sửa từ cardCapacity).
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
      masteryCards: increment(masteryCardAmount), // Sử dụng masteryCards cho nhất quán
      [`claimedQuizRewards.${rewardId}`]: true
    });
  } catch (error) {
    console.error(`Failed to claim quiz reward ${rewardId} for user ${userId}:`, error);
    throw error;
  }
};
