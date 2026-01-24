// --- START OF FILE tower-service.ts ---

import { db } from './firebase'; // Đảm bảo đường dẫn import đúng với project của bạn
import { doc, runTransaction, increment } from 'firebase/firestore';

export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth' | 'feather' | 'coal';

export interface ResourceReward {
    type: ResourceType;
    amount: number;
}

export interface BattleRewards {
    coins: number;
    resources: ResourceReward[];
}

const RESOURCE_TYPES: ResourceType[] = ['wood', 'leather', 'ore', 'cloth', 'feather', 'coal'];

/**
 * Tính toán phần thưởng nguyên liệu dựa trên tầng hiện tại.
 * Công thức: Tầng 1 (index 0) = 20. Mỗi tầng tăng 15%.
 * Random 3 loại trong 6 loại.
 */
export const calculateResourceRewards = (floorIndex: number): ResourceReward[] => {
    // 1. Tính số lượng (Base 20, tăng 15% mỗi tầng)
    const baseAmount = 20;
    const multiplier = Math.pow(1.15, floorIndex);
    const amountPerType = Math.floor(baseAmount * multiplier);

    // 2. Trộn ngẫu nhiên danh sách loại nguyên liệu
    const shuffled = [...RESOURCE_TYPES].sort(() => 0.5 - Math.random());

    // 3. Lấy 3 loại đầu tiên
    const selectedTypes = shuffled.slice(0, 3);

    return selectedTypes.map(type => ({
        type,
        amount: amountPerType
    }));
};

/**
 * Cập nhật phần thưởng vào Firestore cho User.
 * Thay thế việc update Energy bằng update Resources.
 */
export const claimTowerRewards = async (userId: string, rewards: BattleRewards) => {
    if (!userId) return;
    
    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists()) throw new Error("User does not exist!");

            // Tạo object update
            const updates: any = {
                coins: increment(rewards.coins)
            };

            // Cộng dồn từng loại resource
            rewards.resources.forEach(res => {
                updates[res.type] = increment(res.amount);
            });

            t.update(userRef, updates);
        });
    } catch (error) {
        console.error("Failed to claim tower rewards:", error);
        throw error;
    }
};

// --- END OF FILE tower-service.ts ---
