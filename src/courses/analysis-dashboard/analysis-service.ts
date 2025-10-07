// --- START OF FILE: src/services/analysis-service.ts ---

import { db } from '../firebase';
import { 
    doc, 
    getDocs, 
    collection, 
    updateDoc, 
    increment, 
    arrayUnion,
    Timestamp
} from 'firebase/firestore';
// <<< BỎ: Không cần import fetchOrCreateUser nữa

// --- TYPE DEFINITIONS ---
interface WordMastery { word: string; mastery: number; lastPracticed: Date; }
// <<< THAY ĐỔI: Tên và nội dung của payload
interface AnalysisServiceDataPayload {
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
 * @returns {Promise<AnalysisServiceDataPayload>} Dữ liệu đã được xử lý cho dashboard.
 */
export const fetchAnalysisDashboardData = async (userId: string, totalWordsAvailable: number): Promise<AnalysisServiceDataPayload> => {
  if (!userId) throw new Error("User ID is required.");

  // <<< THAY ĐỔI: Không gọi fetchOrCreateUser ở đây nữa
  const [completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
    getDocs(collection(db, 'users', userId, 'completedWords')),
    getDocs(collection(db, 'users', userId, 'completedMultiWord'))
  ]);

  // Xử lý dữ liệu
  const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
  const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
  const dailyActivityMap: { [date: string]: { new: number; review: number } } = {};
  const allCompletionsForRecent: { word: string; date: Date }[] = [];

  completedWordsSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const lastCompletedAt = (data.lastCompletedAt as Timestamp)?.toDate();
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
    const lastCompletedAt = (data.lastCompletedAt as Timestamp)?.toDate();
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
    // <<< BỎ: Không trả về userData
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
