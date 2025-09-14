// --- START OF FILE skill-service.ts ---

import { db } from '../../firebase';
import {
  doc,
  runTransaction
} from 'firebase/firestore';

// Import các hàm và kiểu dữ liệu cần thiết từ service chính
// Lưu ý: Trong một dự án lớn, các kiểu dữ liệu như OwnedSkill nên được đặt ở file types.ts chung
import { fetchOrCreateUserGameData, OwnedSkill, UserGameData } from './gameDataService';

/**
 * Lấy dữ liệu cần thiết cho màn hình Kỹ năng.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình kỹ năng.
 */
export const fetchSkillScreenData = async (userId: string): Promise<{
  coins: number;
  ancientBooks: number;
  skills: UserGameData['skills'];
}> => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    ancientBooks: gameData.ancientBooks,
    skills: gameData.skills, // Gồm { owned, equipped }
  };
};

/**
 * Cập nhật dữ liệu kỹ năng của người dùng trong một transaction.
 * Bao gồm cập nhật danh sách kỹ năng sở hữu, kỹ năng trang bị, vàng và sách cổ.
 * @param userId - ID của người dùng.
 * @param updates - Object chứa các thay đổi cần áp dụng.
 * @returns Promise chứa số vàng và sách mới sau khi cập nhật.
 */
export const updateUserSkills = async (
  userId: string,
  updates: {
    newOwned: OwnedSkill[];
    newEquippedIds: (string | null)[];
    goldChange: number;
    booksChange: number;
  }
): Promise<{ newCoins: number; newBooks: number; }> => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newBooks = (data.ancientBooks || 0) + updates.booksChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newBooks < 0) throw new Error("Không đủ Sách Cổ.");
        t.update(userDocRef, {
            coins: newCoins,
            ancientBooks: newBooks,
            skills: { owned: updates.newOwned, equipped: updates.newEquippedIds }
        });
        return { newCoins, newBooks };
    });
};

// --- END OF FILE skill-service.ts ---
