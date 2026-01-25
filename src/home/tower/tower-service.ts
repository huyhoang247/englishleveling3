// --- START OF FILE tower-service.ts ---

import { db } from '../../firebase'; // Đảm bảo đường dẫn import đúng với project của bạn
import { doc, runTransaction, increment } from 'firebase/firestore';

// --- Type Definitions ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth' | 'feather' | 'coal';

export interface ResourceReward {
    type: ResourceType;
    amount: number;
}

export interface BattleRewards {
    coins: number;
    resources: ResourceReward[];
}

// Danh sách các loại tài nguyên có thể rơi ra
const RESOURCE_TYPES: ResourceType[] = ['wood', 'leather', 'ore', 'cloth', 'feather', 'coal'];

/**
 * Tính toán TOÀN BỘ phần thưởng (Coins + Resources) dựa trên chỉ số tầng (floorIndex).
 * floorIndex bắt đầu từ 0 (Tầng 1 = 0).
 * 
 * Logic:
 * - Coins: Base 90, tăng 20% mỗi tầng.
 * - Resources: Base 20, tăng 15% mỗi tầng. Chọn ngẫu nhiên 3 loại.
 */
export const calculateBattleRewards = (floorIndex: number): BattleRewards => {
    // --- 1. TÍNH TOÁN COINS ---
    // Công thức: 90 * (1.2 ^ index)
    const baseCoins = 90;
    const coinGrowthRate = 1.20; // Tăng 20%
    const coinMultiplier = Math.pow(coinGrowthRate, floorIndex);
    const totalCoins = Math.floor(baseCoins * coinMultiplier);

    // --- 2. TÍNH TOÁN RESOURCES ---
    // Công thức: 20 * (1.15 ^ index)
    const baseResAmount = 20;
    const resGrowthRate = 1.15; // Tăng 15%
    const resMultiplier = Math.pow(resGrowthRate, floorIndex);
    const amountPerResType = Math.floor(baseResAmount * resMultiplier);

    // Trộn ngẫu nhiên danh sách loại nguyên liệu
    const shuffledRes = [...RESOURCE_TYPES].sort(() => 0.5 - Math.random());
    
    // Lấy 3 loại đầu tiên
    const selectedTypes = shuffledRes.slice(0, 3);
    
    const resources = selectedTypes.map(type => ({
        type,
        amount: amountPerResType
    }));

    return {
        coins: totalCoins,
        resources: resources
    };
};

/**
 * Cập nhật phần thưởng vào Firestore cho User.
 * Thực hiện Transaction để đảm bảo tính toàn vẹn dữ liệu (Coins + Resources).
 */
export const claimTowerRewards = async (userId: string, rewards: BattleRewards) => {
    if (!userId) return;
    
    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }

            // Tạo object chứa các trường cần update
            // Khởi tạo với coins
            const updates: any = {
                coins: increment(rewards.coins)
            };

            // Cộng dồn từng loại resource vào updates
            rewards.resources.forEach(res => {
                // Ví dụ: updates['wood'] = increment(100)
                updates[res.type] = increment(res.amount);
            });

            // Thực hiện update một lần duy nhất
            t.update(userRef, updates);
        });
        
        console.log(`Successfully claimed rewards for user ${userId}:`, rewards);

    } catch (error) {
        console.error("Failed to claim tower rewards:", error);
        throw error;
    }
};

// --- END OF FILE tower-service.ts ---
