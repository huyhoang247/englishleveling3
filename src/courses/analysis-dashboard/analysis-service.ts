// --- START OF FILE: src/services/analysis-service.ts ---

import { db } from '../../firebase';
import { 
    doc, 
    collection, 
    updateDoc, 
    increment, 
    arrayUnion,
    Timestamp
} from 'firebase/firestore';
import { fetchOrCreateUser } from '../course-data-service.ts'; 
// --- START THAY ĐỔI ---
// Import localDB và các interface cần thiết
import { localDB, ICompletedWord, ICompletedMultiWord } from '../local-data/local-vocab-db.ts';
// --- END THAY ĐỔI ---

// --- TYPE DEFINITIONS ---
interface WordMastery { word: string; mastery: number; lastPracticed: Date; }
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
    wordMastery: WordMastery[];
  };
  dailyActivityMap: { [date: string]: { new: number; review: number } };
}

/**
 * Hàm trợ giúp để định dạng ngày theo giờ địa phương (YYYY-MM-DD).
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
 * @param totalWordsAvailable - Tổng số từ vựng có trong hệ thống.
 * @returns {Promise<AnalysisDashboardDataPayload>} Dữ liệu đã được xử lý cho dashboard.
 */
export const fetchAnalysisDashboardData = async (userId: string, totalWordsAvailable: number): Promise<AnalysisDashboardDataPayload> => {
  if (!userId) throw new Error("User ID is required.");

  // --- START THAY ĐỔI LỚN ---
  // Thay thế getDocs từ Firestore bằng cách đọc từ Local DB
  const [userData, completedWordsData, completedMultiWordData] = await Promise.all([
    fetchOrCreateUser(userId),
    localDB.getCompletedWords(),
    localDB.getCompletedMultiWords()
  ]);
  // --- END THAY ĐỔI LỚN ---

  const todayString = formatDateToLocalYYYYMMDD(new Date());

  // Xử lý dữ liệu
  const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0, 'Nối từ': 0 };
  const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
  const dailyActivityMap: { [date: string]: { new: number; review: number } } = {};
  const allCompletionsForRecent: { word: string; date: Date }[] = [];

  // --- START THAY ĐỔI LỚN ---
  // Vòng lặp mới, xử lý dữ liệu từ mảng localDB
  completedWordsData.forEach(item => {
    const lastCompletedAt = item.lastCompletedAt;
    if (!lastCompletedAt) return;
    
    allCompletionsForRecent.push({ word: item.word, date: lastCompletedAt });
    const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
    if (!dailyActivityMap[dateString]) dailyActivityMap[dateString] = { new: 0, review: 0 };

    let totalCompletions = 0, totalCorrectForWord = 0;
    if (item.gameModes) {
      Object.values(item.gameModes).forEach((modeData: any) => { totalCompletions += modeData.correctCount || 0; });
      Object.keys(item.gameModes).forEach(mode => {
        const correctCount = item.gameModes[mode].correctCount || 0;
        totalCorrectForWord += correctCount;
        if (mode.startsWith('quiz-')) masteryByGame['Trắc nghiệm'] += correctCount;
        else if (mode.startsWith('fill-word-')) masteryByGame['Điền từ'] += correctCount;
        else if (mode.startsWith('match-')) masteryByGame['Nối từ'] += correctCount;
      });
    }
    
    // Logic này có thể cần điều chỉnh: totalCompletions sẽ luôn tăng.
    // Để đơn giản, ta dựa vào việc từ này đã tồn tại trong map hay chưa
    const isNewWordForDay = !wordMasteryMap[item.word]; 
    if (isNewWordForDay) {
        dailyActivityMap[dateString].new++;
    } else {
        dailyActivityMap[dateString].review++;
    }
    
    if (totalCorrectForWord > 0) wordMasteryMap[item.word] = { mastery: totalCorrectForWord, lastPracticed: lastCompletedAt };
  });

  completedMultiWordData.forEach(item => {
    const lastCompletedAt = item.lastCompletedAt;
    if (!lastCompletedAt) return;
    allCompletionsForRecent.push({ word: item.phrase, date: lastCompletedAt });
    if (item.completedIn) Object.keys(item.completedIn).forEach(mode => { if (mode.startsWith('fill-word-')) masteryByGame['Điền từ']++; });
  });
  // --- END THAY ĐỔI LỚN ---

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
      // --- START THAY ĐỔI ---
      totalWordsLearned: completedWordsData.length, // Thay đổi từ snapshot.size
      // --- END THAY ĐỔI ---
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
 */
export const claimDailyMilestoneReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
  // (Hàm này giữ nguyên, không thay đổi)
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
 */
export const claimVocabMilestoneReward = async (userId: string, milestone: number, rewardAmount: number): Promise<void> => {
  // (Hàm này giữ nguyên, không thay đổi)
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      coins: increment(rewardAmount),
      claimedVocabMilestones: arrayUnion(milestone)
    });
  } catch (error)
    {
    console.error(`Failed to claim vocabulary milestone for user ${userId}:`, error);
    throw error;
  }
};
