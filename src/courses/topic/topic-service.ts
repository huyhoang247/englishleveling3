// --- START OF FILE: src/services/topic-service.ts ---

import { db } from '../../firebase';
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
  favorites: number[]; // Mảng chứa các ID hình ảnh yêu thích (UI dùng mảng, DB lưu chuỗi)
}

const DEFAULT_FREE_PAGES = 5;

/**
 * Lắng nghe dữ liệu Topic của user realtime.
 * Tự động chuyển đổi chuỗi "1,2,3" từ Firestore thành mảng [1, 2, 3] cho UI.
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
          .filter((n: number) => !isNaN(n)); // Lọc bỏ NaN để đảm bảo dữ liệu sạch
      }
      
      callback({
        maxUnlockedPage: topicProgress.maxUnlockedPage || DEFAULT_FREE_PAGES,
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
        dailyReward: { date: '', count: 0 },
        favorites: []
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
 * - Đọc chuỗi hiện tại (VD: "1,2,5").
 * - Chuyển thành Set để thêm/xóa ID.
 * - Sắp xếp lại và join thành chuỗi (VD: "1,2,3,5") để lưu vào Firestore.
 * - Giúp tiết kiệm chi phí lưu trữ so với lưu mảng object.
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
      
      // Parse string thành Set<number> để xử lý unique và tìm kiếm nhanh
      let favIds: Set<number> = new Set();
      if (favString.length > 0) {
        favString.split(',').forEach((s: string) => {
            const num = parseInt(s, 10);
            if (!isNaN(num)) favIds.add(num);
        });
      }

      // Logic Toggle: Có rồi thì xóa, chưa có thì thêm
      if (favIds.has(imageId)) {
        favIds.delete(imageId);
      } else {
        favIds.add(imageId);
      }

      // Convert lại thành mảng, sort tăng dần (1, 2, 3...) cho đẹp string trong DB
      const sortedArray = Array.from(favIds).sort((a, b) => a - b);
      
      // Join thành chuỗi
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
