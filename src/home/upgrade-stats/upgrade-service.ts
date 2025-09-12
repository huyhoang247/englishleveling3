// --- START OF FILE statsService.ts ---

import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Nâng cấp chỉ số của người dùng và trừ đi chi phí.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu (kiểm tra tiền và cập nhật trong cùng một thao tác).
 * @param userId - ID của người dùng.
 * @param cost - Chi phí nâng cấp.
 * @param newStats - Object chứa level mới của các chỉ số.
 * @returns {Promise<{ newCoins: number; newStats: { hp: number; atk: number; def: number; } }>}
 */
export const upgradeUserStats = async (userId: string, cost: number, newStats: { hp: number; atk: number; def: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < cost) throw new Error("Không đủ vàng trên server.");
        const newCoins = currentCoins - cost;
        t.update(userDocRef, { coins: newCoins, stats: newStats });
        return { newCoins, newStats };
    });
};

// --- END OF FILE statsService.ts ---
