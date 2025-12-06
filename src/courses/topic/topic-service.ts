// --- START OF FILE: topic-service.ts ---

import { db } from '../../firebase'; // Đảm bảo đường dẫn import đúng với dự án của bạn
import { 
  doc, 
  runTransaction, 
  onSnapshot, 
  Unsubscribe
} from 'firebase/firestore';

export interface TopicProgressData {
  maxUnlockedPage: number;
  dailyReward: {
    date: string;
    count: number;
  };
  favorites: string; // NEW: Chuỗi lưu trữ ID, vd: "1,5,10"
}

const DEFAULT_FREE_PAGES = 5;

/**
 * Lắng nghe dữ liệu Topic của user realtime.
 */
export const listenToTopicData = (userId: string, callback: (data: TopicProgressData) => void): Unsubscribe => {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const topicProgress = data.topicProgress || {};
      
      callback({
        maxUnlockedPage: topicProgress.maxUnlockedPage || DEFAULT_FREE_PAGES,
        dailyReward: {
          date: topicProgress.dailyReward?.date || '',
          count: topicProgress.dailyReward?.count || 0
        },
        favorites: topicProgress.favorites || "" // NEW: Mặc định là chuỗi rỗng
      });
    } else {
      callback({
        maxUnlockedPage: DEFAULT_FREE_PAGES,
        dailyReward: { date: '', count: 0 },
        favorites: ""
      });
    }
  });
};

/**
 * Transaction mở khóa page
 */
export const unlockTopicPageTransaction = async (userId: string, targetPage: number, cost: number) => {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User does not exist!");

      const userData = userDoc.data();
      const currentCoins = userData.coins || 0;
      const currentMaxPage = userData.topicProgress?.maxUnlockedPage || DEFAULT_FREE_PAGES;

      if (targetPage <= currentMaxPage) return;
      if (currentCoins < cost) throw new Error("Not enough coins!");

      transaction.update(userRef, {
        coins: currentCoins - cost,
        'topicProgress.maxUnlockedPage': targetPage
      });
    });
  } catch (e) {
    console.error("Unlock Transaction failed: ", e);
    throw e;
  }
};

/**
 * Transaction nhận thưởng
 */
export const claimTopicRewardTransaction = async (userId: string, rewardAmount: number, maxDailyRewards: number) => {
  const userRef = doc(db, 'users', userId);
  const today = new Date().toISOString().split('T')[0];

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const currentCoins = userData.coins || 0;
      const topicProgress = userData.topicProgress || {};
      const lastDate = topicProgress.dailyReward?.date || '';
      let currentCount = topicProgress.dailyReward?.count || 0;

      if (lastDate !== today) currentCount = 0;
      if (currentCount >= maxDailyRewards) throw new Error("Daily limit reached");

      transaction.update(userRef, {
        coins: currentCoins + rewardAmount,
        'topicProgress.dailyReward': {
          date: today,
          count: currentCount + 1
        }
      });
    });
  } catch (e) {
    console.error("Reward transaction failed: ", e);
    throw e;
  }
};

/**
 * NEW: Transaction Toggle Favorite (Thêm/Xóa ID khỏi chuỗi)
 */
export const toggleTopicFavoriteTransaction = async (userId: string, imageId: number) => {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const currentFavString: string = userData.topicProgress?.favorites || "";
      
      // Chuyển chuỗi "1,2,3" thành mảng [1, 2, 3]
      let favArray = currentFavString ? currentFavString.split(',').map(Number) : [];
      
      if (favArray.includes(imageId)) {
        // Nếu có rồi thì xóa
        favArray = favArray.filter(id => id !== imageId);
      } else {
        // Chưa có thì thêm
        favArray.push(imageId);
        // Sắp xếp lại cho đẹp (tuỳ chọn)
        favArray.sort((a, b) => a - b);
      }

      // Chuyển lại thành chuỗi "1,2,5"
      const newFavString = favArray.join(',');

      transaction.update(userRef, {
        'topicProgress.favorites': newFavString
      });
    });
  } catch (e) {
    console.error("Toggle favorite failed: ", e);
    throw e; // Ném lỗi để UI có thể xử lý nếu cần
  }
};
