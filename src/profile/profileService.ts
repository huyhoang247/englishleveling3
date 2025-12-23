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

    // Xử lý ngày hết hạn
    const now = new Date();
    let newExpirationDate: Date;
    
    // Kiểm tra hạn VIP hiện tại
    let currentExpiration: Date | null = null;
    if (userData.vipExpiration) {
        // Chuyển đổi Firestore Timestamp sang Date
        currentExpiration = userData.vipExpiration.toDate();
    }

    // Logic cộng dồn ngày
    if (userData.accountType === 'VIP' && currentExpiration && currentExpiration > now) {
      // Còn hạn -> Cộng tiếp vào ngày hết hạn cũ
      newExpirationDate = new Date(currentExpiration.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      // Hết hạn hoặc chưa mua -> Tính từ bây giờ
      newExpirationDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    const newGems = currentGems - cost;

    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'VIP',
      vipExpiration: Timestamp.fromDate(newExpirationDate), // Lưu dạng Timestamp
    });
  });
};
