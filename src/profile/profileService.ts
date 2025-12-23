// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; 
import { doc, runTransaction, updateDoc, Timestamp } from 'firebase/firestore';

export const updateProfileInfo = async (userId: string, updates: { name: string; title: string }): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { username: updates.name, title: updates.title });
};

export const updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { avatarUrl });
};

/**
 * Nâng cấp hoặc gia hạn gói VIP.
 * @param userId - ID người dùng.
 * @param cost - Số Gem bị trừ.
 * @param daysToAdd - Số ngày VIP được cộng thêm.
 */
export const performPremiumUpgrade = async (userId: string, cost: number, daysToAdd: number): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User document does not exist!");
    }

    const userData = userDoc.data();
    const currentGems = userData.gems || 0;
    
    if (currentGems < cost) {
      throw new Error("Not enough gems.");
    }

    // Tính toán thời gian hết hạn mới
    const now = new Date();
    let newExpirationDate: Date;
    
    // Kiểm tra xem user có đang là VIP và còn hạn không
    // Giả sử vipExpiration lưu dưới dạng Firestore Timestamp
    const currentExpiration = userData.vipExpiration ? userData.vipExpiration.toDate() : null;

    if (userData.accountType === 'VIP' && currentExpiration && currentExpiration > now) {
      // Nếu đang là VIP và còn hạn -> Cộng dồn thời gian vào ngày hết hạn hiện tại
      newExpirationDate = new Date(currentExpiration.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      // Nếu chưa là VIP hoặc đã hết hạn -> Tính từ thời điểm hiện tại
      newExpirationDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    const newGems = currentGems - cost;

    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'VIP', // Luôn set là VIP
      vipExpiration: Timestamp.fromDate(newExpirationDate), // Lưu timestamp Firestore
    });
  });
};
