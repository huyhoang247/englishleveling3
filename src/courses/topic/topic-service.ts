// --- START OF FILE: src/services/topic-service.ts ---

import { db } from '../firebase';
import { 
  doc, 
  runTransaction, 
  onSnapshot, 
  Unsubscribe
} from 'firebase/firestore';

export interface TopicProgressData {
  maxUnlockedPage: number;
  dailyReward: {
    date: string; // Format YYYY-MM-DD
    count: number;
  };
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
        }
      });
    } else {
      // Mặc định nếu chưa có data
      callback({
        maxUnlockedPage: DEFAULT_FREE_PAGES,
        dailyReward: { date: '', count: 0 }
      });
    }
  });
};

/**
 * Transaction mở khóa page: Trừ tiền và cập nhật maxPage cùng lúc.
 */
export const unlockTopicPageTransaction = async (userId: string, targetPage: number, cost: number) => {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("User does not exist!");
      }

      const userData = userDoc.data();
      const currentCoins = userData.coins || 0;
      const currentMaxPage = userData.topicProgress?.maxUnlockedPage || DEFAULT_FREE_PAGES;

      if (targetPage <= currentMaxPage) return; // Đã mở rồi thì thôi
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
 * Transaction nhận thưởng: Kiểm tra ngày, số lần nhận và cộng tiền.
 */
export const claimTopicRewardTransaction = async (userId: string, rewardAmount: number, maxDailyRewards: number) => {
  const userRef = doc(db, 'users', userId);
  const today = new Date().toISOString().split('T')[0];

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) return; // Should handle create logic if needed, but user usually exists here

      const userData = userDoc.data();
      const currentCoins = userData.coins || 0;
      const topicProgress = userData.topicProgress || {};
      const lastDate = topicProgress.dailyReward?.date || '';
      let currentCount = topicProgress.dailyReward?.count || 0;

      // Reset nếu sang ngày mới
      if (lastDate !== today) {
        currentCount = 0;
      }

      if (currentCount >= maxDailyRewards) {
        throw new Error("Daily limit reached");
      }

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
