// --- START OF FILE: src/firebase/userDataService.ts ---

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';

 
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
    const multiWordId = completedWord.toLowerCase();
    const completedMultiWordRef = doc(db, 'users', userId, 'completedMultiWord', multiWordId);
    batch.set(completedMultiWordRef, {
      completedIn: { [gameModeId]: true },
      lastCompletedAt: new Date()
    }, { merge: true });

    const individualWords = completedWord.split(' ');
    individualWords.forEach(word => {
      const individualWordRef = doc(db, 'users', userId, 'completedWords', word.toLowerCase());
      batch.set(individualWordRef, { 
        lastCompletedAt: new Date(), 
        gameModes: { [gameModeId]: { correctCount: increment(1) } } 
      }, { merge: true });
    });

  } else {
    const wordId = completedWord.toLowerCase();
    const completedWordRef = doc(db, 'users', userId, 'completedWords', wordId);
    batch.set(completedWordRef, { 
      lastCompletedAt: new Date(), 
      gameModes: { [gameModeId]: { correctCount: increment(1) } } 
    }, { merge: true });
  }

  if (coinReward > 0) {
    batch.update(userDocRef, { coins: increment(coinReward) });
  }

  await batch.commit();
};


// =================================================================================
// --- SECTION 2: LOGIC MỚI CHO TRANG ANALYSIS DASHBOARD (ĐÃ SỬA LỖI) ---
// =================================================================================

/**
 * Hàm trợ giúp: Định dạng ngày theo giờ địa phương (YYYY-MM-DD)
 */
const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Định nghĩa kiểu dữ liệu cho phân tích ---
interface LearningActivity { date: string; new: number; review: number; }
export interface WordMastery { word: string; mastery: number; lastPracticed: Date; }
interface VocabularyGrowth { date: string; cumulative: number; }

export type DailyActivityMap = { [date: string]: { new: number; review: number } };

export interface AnalysisData {
  totalWordsLearned: number;
  totalWordsAvailable: number;
  learningActivity: LearningActivity[];
  vocabularyGrowth: VocabularyGrowth[];
  recentCompletions: { word: string; date: string }[];
  wordMastery: WordMastery[];
}

export interface DashboardData {
    analysisData: AnalysisData | null;
    dailyActivityMap: DailyActivityMap;
    userStats: {
        coins: number;
        masteryCount: number;
        claimedDailyGoals: number[];
        claimedVocabMilestones: number[];
    };
}

/**
 * Lấy toàn bộ dữ liệu cần thiết cho trang Dashboard Phân Tích.
 * @param userId - ID của người dùng.
 * @param vocabularyTotal - Tổng số từ vựng có trong hệ thống.
 * @returns {Promise<DashboardData>} Dữ liệu đã được xử lý cho dashboard.
 */
export const fetchDashboardData = async (userId: string, vocabularyTotal: number): Promise<DashboardData> => {
    const [userData, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
        fetchOrCreateUser(userId),
        getDocs(collection(db, 'users', userId, 'completedWords')),
        getDocs(collection(db, 'users', userId, 'completedMultiWord'))
    ]);

    const todayString = formatDateToLocalYYYYMMDD(new Date());
    const userStats = {
        coins: userData.coins || 0,
        masteryCount: userData.masteryCards || 0,
        claimedDailyGoals: userData.claimedDailyGoals?.[todayString] || [],
        claimedVocabMilestones: userData.claimedVocabMilestones || []
    };

    const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
    const dailyActivity: DailyActivityMap = {};
    const allCompletionsForRecent: { word: string; date: Date }[] = [];

    completedWordsSnapshot.forEach(doc => {
        const data = doc.data();
        const lastCompletedAt = data.lastCompletedAt?.toDate();
        if (!lastCompletedAt) return;

        allCompletionsForRecent.push({ word: doc.id, date: lastCompletedAt });
        const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
        if (!dailyActivity[dateString]) dailyActivity[dateString] = { new: 0, review: 0 };

        let totalCompletions = 0;
        let totalCorrectForWord = 0;
        if (data.gameModes) {
            Object.values(data.gameModes).forEach((modeData: any) => { totalCompletions += modeData.correctCount || 0; });
            Object.keys(data.gameModes).forEach(mode => {
                const correctCount = data.gameModes[mode].correctCount || 0;
                totalCorrectForWord += correctCount;
            });
        }
        if (totalCompletions > 1) dailyActivity[dateString].review++;
        else if (totalCompletions === 1) dailyActivity[dateString].new++;

        if (totalCorrectForWord > 0) wordMasteryMap[doc.id] = { mastery: totalCorrectForWord, lastPracticed: lastCompletedAt };
    });

    completedMultiWordSnapshot.forEach(doc => {
        const data = doc.data();
        const lastCompletedAt = data.lastCompletedAt?.toDate();
        if (!lastCompletedAt) return;
        allCompletionsForRecent.push({ word: doc.id, date: lastCompletedAt });
    });
    
    if (completedWordsSnapshot.empty && completedMultiWordSnapshot.empty) {
        return { analysisData: null, dailyActivityMap: {}, userStats };
    }

    const learningActivityData: LearningActivity[] = Object.entries(dailyActivity)
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    const vocabularyGrowthData = learningActivityData.map(item => {
        cumulative += item.new;
        return { 
            date: new Date(item.date).toLocaleDateString('vi-VN'),
            cumulative 
        };
    });

    const recentCompletions = [...allCompletionsForRecent]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
        .map(c => ({ word: c.word, date: c.date.toLocaleString('vi-VN') }));
        
    const totalWordsLearned = completedWordsSnapshot.size;
    const wordMasteryData: WordMastery[] = Object.entries(wordMasteryMap).map(([word, data]) => ({ word, ...data }));

    const analysisData: AnalysisData = {
      totalWordsLearned,
      totalWordsAvailable: vocabularyTotal,
      learningActivity: learningActivityData.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
      vocabularyGrowth: vocabularyGrowthData,
      recentCompletions,
      wordMastery: wordMasteryData,
    };
    
    return { analysisData, dailyActivityMap: dailyActivity, userStats };
};

/**
 * Ghi nhận việc người dùng nhận thưởng cho mục tiêu hàng ngày.
 * @param userId - ID người dùng.
 * @param milestone - Cột mốc đã đạt (ví dụ: 10, 20).
 * @param rewardAmount - Số coin thưởng.
 */
export const claimDailyGoalReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    const todayString = formatDateToLocalYYYYMMDD(new Date());
    const fieldKey = `claimedDailyGoals.${todayString}`;
    
    await updateDoc(userDocRef, {
        coins: increment(rewardAmount),
        [fieldKey]: arrayUnion(milestone)
    });
};

/**
 * Ghi nhận việc người dùng nhận thưởng cho cột mốc từ vựng.
 * @param userId - ID người dùng.
 * @param milestone - Cột mốc đã đạt (ví dụ: 100, 500).
 * @param rewardAmount - Số coin thưởng.
 */
export const claimVocabMilestoneReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
        coins: increment(rewardAmount),
        claimedVocabMilestones: arrayUnion(milestone)
    });
};
