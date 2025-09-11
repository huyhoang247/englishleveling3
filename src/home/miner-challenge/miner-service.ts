// --- START OF FILE minerChallengeService.ts ---

import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Xử lý kết quả của một lượt chơi Thử Thách Đào Mỏ, cập nhật dữ liệu người dùng trong một giao dịch duy nhất.
 * @param userId - ID của người dùng.
 * @param result - Một object chứa số cúp cuối cùng, số vàng kiếm được và tầng cao nhất đã hoàn thành.
 * @returns Một object với tổng số vàng mới, tổng số cúp mới và tầng cao nhất mới.
 */
export const processMinerChallengeResult = async (userId: string, result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + result.coinsEarned;
        const newHighestFloor = Math.max(data.minerChallengeHighestFloor || 0, result.highestFloorCompleted);

        t.update(userDocRef, { 
            coins: newCoins, 
            pickaxes: result.finalPickaxes, 
            minerChallengeHighestFloor: newHighestFloor 
        });

        return { newCoins, newPickaxes: result.finalPickaxes, newHighestFloor };
    });
};

// --- END OF FILE minerChallengeService.ts ---
