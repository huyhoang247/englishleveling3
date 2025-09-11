// --- START OF FILE gemExchangeService.ts ---

import { db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Xử lý giao dịch đổi Gem lấy Vàng cho người dùng.
 * @param userId - ID của người dùng.
 * @param gemCost - Số lượng Gem người dùng muốn đổi.
 * @returns {Promise<{ newGems: number; newCoins: number }>} Số Gem và Vàng mới của người dùng.
 * @throws {Error} Nếu người dùng không tồn tại hoặc không đủ Gem.
 */
export const processGemToCoinExchange = async (userId: string, gemCost: number): Promise<{ newGems: number; newCoins: number }> => {
    if (!userId) throw new Error("User ID is required.");
    if (gemCost <= 0) throw new Error("Gem cost must be positive.");

    const userDocRef = doc(db, 'users', userId);
    const coinReward = gemCost * 1000; // Tỷ lệ 1 Gem = 1000 Coins

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const data = userDoc.data();
        const currentGems = data.gems || 0;
        const currentCoins = data.coins || 0;

        if (currentGems < gemCost) {
            throw new Error("Không đủ Gems để thực hiện giao dịch.");
        }

        const newGems = currentGems - gemCost;
        const newCoins = currentCoins + coinReward;

        t.update(userDocRef, { gems: newGems, coins: newCoins });

        return { newGems, newCoins };
    });
};

// --- END OF FILE gemExchangeService.ts ---
