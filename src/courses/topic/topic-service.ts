// --- START OF FILE: src/services/topic-service.ts ---

import { db } from '../../firebase';
import { 
  doc, 
  runTransaction, 
  onSnapshot, 
  updateDoc,
  Unsubscribe
} from 'firebase/firestore';

export interface TopicProgressData {
  maxUnlockedPage: number;
  currentPage: number; // <--- NEW: Lưu trang hiện tại
  dailyReward: {
    date: string; // Format YYYY-MM-DD
    count: number;
  };
  favorites: number[];
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
      
      // Xử lý chuỗi favorites từ DB thành mảng số
      const favString = topicProgress.favorites || "";
      let favArray: number[] = [];
      
      if (favString && typeof favString === 'string') {
        favArray = favString
          .split(',')
          .map((s: string) => parseInt(s, 10))
          .filter((n: number) => !isNaN(n));
      }
      
      callback({
        maxUnlockedPage: topicProgress.maxUnlockedPage || DEFAULT_FREE_PAGES,
        currentPage: topicProgress.currentPage || 1, // Mặc định là 1 nếu chưa lưu
        dailyReward: {
          date: topicProgress.dailyReward?.date || '',
          count: topicProgress.dailyReward?.count || 0
        },
        favorites: favArray
      });
    } else {
      // Mặc định nếu chưa có data
      callback({
        maxUnlockedPage: DEFAULT_FREE_PAGES,
        currentPage: 1,
        dailyReward: { date: '', count: 0 },
        favorites: []
      });
    }
  });
};

/**
 * Lưu trang hiện tại (chỉ dùng cho All Topics mode).
 * Sử dụng updateDoc thay vì Transaction để nhẹ nhàng hơn.
 */
export const saveTopicCurrentPage = async (userId: string, page: number) => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      'topicProgress.currentPage': page
    });
  } catch (e) {
    console.error("Error saving current page:", e);
  }
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
      
      if (!userDoc.exists()) return; 

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

/**
 * Transaction Toggle Favorite:
 */
export const toggleTopicFavoriteTransaction = async (userId: string, imageId: number) => {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const topicProgress = userData.topicProgress || {};
      const favString = topicProgress.favorites || "";
      
      let favIds: Set<number> = new Set();
      if (favString.length > 0) {
        favString.split(',').forEach((s: string) => {
            const num = parseInt(s, 10);
            if (!isNaN(num)) favIds.add(num);
        });
      }

      if (favIds.has(imageId)) {
        favIds.delete(imageId);
      } else {
        favIds.add(imageId);
      }

      const sortedArray = Array.from(favIds).sort((a, b) => a - b);
      const newFavString = sortedArray.join(',');

      transaction.update(userRef, {
        'topicProgress.favorites': newFavString
      });
    });
  } catch (e) {
    console.error("Favorite transaction failed: ", e);
    throw e;
  }
};
