// --- START OF FILE: analysis-service.ts ---

import { db } from '../../firebase';
import { 
    doc, 
    updateDoc, 
    increment, 
    arrayUnion
} from 'firebase/firestore';
import { fetchOrCreateUser } from '../course-data-service.ts'; 
import { localDB } from '../../local-data/local-vocab-db.ts';

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
 */
export const fetchAnalysisDashboardData = async (userId: string, totalWordsAvailable: number): Promise<AnalysisDashboardDataPayload> => {
  if (!userId) throw new Error("User ID is required.");

  const [userData, completedWordsData, completedMultiWordData] = await Promise.all([
    fetchOrCreateUser(userId),
    localDB.getCompletedWords(),
    localDB.getCompletedMultiWords()
  ]);

  const todayString = formatDateToLocalYYYYMMDD(new Date());

  // --- Xử lý dữ liệu thô ---
  const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0, 'Nối từ': 0 };
  const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
  const dailyActivityMap: { [date: string]: { new: number; review: number } } = {};
  const allCompletionsForRecent: { word: string; date: Date }[] = [];

  // 1. Duyệt qua từ đơn đã học
  completedWordsData.forEach(item => {
    const lastCompletedAt = item.lastCompletedAt;
    if (!lastCompletedAt) return;
    
    allCompletionsForRecent.push({ word: item.word, date: lastCompletedAt });
    const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
    if (!dailyActivityMap[dateString]) dailyActivityMap[dateString] = { new: 0, review: 0 };

    let totalCorrectForWord = 0;
    if (item.gameModes) {
      Object.keys(item.gameModes).forEach(mode => {
        const correctCount = item.gameModes[mode].correctCount || 0;
        totalCorrectForWord += correctCount;
        if (mode.startsWith('quiz-')) masteryByGame['Trắc nghiệm'] += correctCount;
        else if (mode.startsWith('fill-word-')) masteryByGame['Điền từ'] += correctCount;
        else if (mode.startsWith('match-')) masteryByGame['Nối từ'] += correctCount;
      });
    }
    
    // Logic xác định học mới hay ôn tập
    const isNewWordForDay = !wordMasteryMap[item.word]; 
    if (isNewWordForDay) {
        dailyActivityMap[dateString].new++;
    } else {
        dailyActivityMap[dateString].review++;
    }
    
    if (totalCorrectForWord > 0) wordMasteryMap[item.word] = { mastery: totalCorrectForWord, lastPracticed: lastCompletedAt };
  });

  // 2. Duyệt qua cụm từ đã học
  completedMultiWordData.forEach(item => {
    const lastCompletedAt = item.lastCompletedAt;
    if (!lastCompletedAt) return;
    allCompletionsForRecent.push({ word: item.phrase, date: lastCompletedAt });
    if (item.completedIn) Object.keys(item.completedIn).forEach(mode => { if (mode.startsWith('fill-word-')) masteryByGame['Điền từ']++; });
  });

  // --- [LOGIC MỚI] TẠO DỮ LIỆU CHO CHART (Luôn fill đủ 30 ngày) ---
  
  // 1. Tạo mảng chứa chuỗi ngày của 30 ngày gần nhất (tính cả hôm nay)
  const last30Days: string[] = [];
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0); // Reset giờ để tính toán chính xác

  for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      last30Days.push(formatDateToLocalYYYYMMDD(d));
  }

  const startDateString = last30Days[0];

  // 2. Tính tổng số từ đã học TRƯỚC khoảng thời gian 30 ngày này 
  // (để biểu đồ Growth không bị bắt đầu từ 0 nếu người dùng đã học từ lâu)
  let cumulativeCounter = 0;
  
  // Duyệt qua map activity để cộng dồn quá khứ
  Object.entries(dailyActivityMap).forEach(([dateStr, data]) => {
      // So sánh chuỗi ngày dạng YYYY-MM-DD hoạt động tốt
      if (dateStr < startDateString) {
          cumulativeCounter += data.new;
      }
  });

  // 3. Map dữ liệu vào 30 ngày đã tạo
  const filledLearningActivity = [];
  const filledVocabularyGrowth = [];

  last30Days.forEach(dateStr => {
      // Lấy data từ map, nếu không có thì trả về 0
      const activity = dailyActivityMap[dateStr] || { new: 0, review: 0 };
      
      // Cộng dồn cho biểu đồ tăng trưởng
      cumulativeCounter += activity.new;

      // Format ngày để hiển thị đẹp trên Chart (VD: 20/10)
      const displayDate = new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

      filledLearningActivity.push({
          date: displayDate, 
          new: activity.new,
          review: activity.review
      });

      filledVocabularyGrowth.push({
          date: displayDate,
          cumulative: cumulativeCounter
      });
  });

  // --- Kết thúc Logic Mới ---

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
      totalWordsLearned: completedWordsData.length,
      totalWordsAvailable,
      // Sử dụng mảng đã fill đủ 30 ngày thay vì slice dữ liệu thô
      learningActivity: filledLearningActivity,
      masteryByGame: masteryData,
      vocabularyGrowth: filledVocabularyGrowth,
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
