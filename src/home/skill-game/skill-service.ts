// --- START OF FILE src/skill-service.ts ---

import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { fetchOrCreateUserGameData } from './gameDataService';

// --- INTERFACES & TYPES ---
// Các kiểu dữ liệu này được sử dụng bởi cả client và server-side logic
// nên việc định nghĩa chúng ở đây là hợp lý.
export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';
export interface OwnedSkill {
    id: string;
    skillId: string;
    level: number;
    rarity: Rarity;
}

/**
 * Lấy dữ liệu cần thiết cho màn hình Kỹ năng.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình kỹ năng.
 */
export const fetchSkillScreenData = async (userId: string) => {
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
 * Bao gồm cập nhật danh sách kỹ năng, vàng và sách cổ.
 * @param userId - ID của người dùng.
 * @param updates - Object chứa các thay đổi cần áp dụng.
 * @returns {Promise<{ newCoins: number, newBooks: number }>} Số vàng và sách mới.
 */
export const updateUserSkills = async (
    userId: string,
    updates: {
        newOwned: OwnedSkill[];
        newEquippedIds: (string | null)[];
        goldChange: number;
        booksChange: number;
    }
) => {
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

// --- END OF FILE src/skill-service.ts ---
