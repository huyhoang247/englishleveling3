// --- START OF FILE upgrade-service.ts ---

import { db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Nâng cấp một chỉ số cụ thể của người dùng, cập nhật level, giá trị và trừ chi phí.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param userId - ID của người dùng.
 * @param cost - Chi phí nâng cấp.
 * @param statId - ID của chỉ số cần nâng cấp ('hp', 'atk', 'def').
 * @param newLevel - Level mới của chỉ số.
 * @param newValue - Giá trị tổng mới của chỉ số sau khi nâng cấp.
 * @returns {Promise<{ newCoins: number }>}
 */
// SỬA LỖI: Đảm bảo hàm được export với tên chính xác là 'upgradeUserStat' (số ít)
export const upgradeUserStat = async (
    userId: string, 
    cost: number, 
    statId: 'hp' | 'atk' | 'def', 
    newLevel: number, 
    newValue: number
) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < cost) throw new Error("Không đủ vàng trên server.");
        
        const newCoins = currentCoins - cost;

        // Sử dụng dot notation để cập nhật các trường lồng nhau một cách hiệu quả
        t.update(userDocRef, {
            coins: newCoins,
            [`stats_level.${statId}`]: newLevel,
            [`stats_value.${statId}`]: newValue,
        });

        // Chỉ cần trả về số coin mới, vì GameContext sẽ tự động cập nhật stats qua onSnapshot
        return { newCoins };
    });
};

// --- END OF FILE upgrade-service.ts ---
