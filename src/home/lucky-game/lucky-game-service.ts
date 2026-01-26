// --- START OF FILE lucky-game-service.ts ---

import { db } from '../../firebase'; // Đảm bảo đường dẫn đúng tới firebase config của bạn
import { doc, runTransaction, increment } from 'firebase/firestore';
import { Item } from './lucky-game-data.tsx'; // Đường dẫn tới file data bên dưới

// ID của document chứa Jackpot global
const JACKPOT_DOC_REF = doc(db, 'appData', 'jackpotPoolData');

export interface SpinResult {
    success: boolean;
    newCoins: number;
    newJackpot: number;
    rewardGranted: boolean;
    error?: string;
}

/**
 * Xử lý giao dịch quay thưởng:
 * 1. Trừ vàng (cost).
 * 2. Cộng vật phẩm trúng thưởng vào user profile.
 * 3. Cộng % vào quỹ Jackpot (nếu không trúng Jackpot).
 * 4. Reset quỹ Jackpot (nếu trúng Jackpot).
 */
export const processLuckySpinTransaction = async (
    userId: string,
    cost: number,
    item: Item,
    multiplier: number
): Promise<SpinResult> => {
    const userRef = doc(db, 'users', userId);

    try {
        return await runTransaction(db, async (t) => {
            // 1. Lấy dữ liệu User và Jackpot hiện tại
            const userDoc = await t.get(userRef);
            const jackpotDoc = await t.get(JACKPOT_DOC_REF);

            if (!userDoc.exists()) throw new Error("User not found");
            
            const userData = userDoc.data();
            const currentCoins = userData.coins || 0;
            const currentJackpot = jackpotDoc.exists() ? (jackpotDoc.data().poolAmount || 200) : 200;

            // 2. Kiểm tra đủ tiền không
            if (currentCoins < cost) {
                throw new Error("Not enough coins");
            }

            // 3. Tính toán update
            const newCoins = currentCoins - cost;
            const updates: any = { coins: newCoins };
            
            // Xử lý phần thưởng
            const rewardAmount = (item.rewardAmount || 1) * multiplier;
            // const rewardType = item.rewardType; // Biến này có thể dùng nếu cần log type

            if (item.rarity === 'jackpot') {
                // TRÚNG JACKPOT
                updates.coins = newCoins + currentJackpot; // Cộng toàn bộ quỹ vào ví
                t.update(JACKPOT_DOC_REF, { poolAmount: 200 }); // Reset về 200
            } else {
                // KHÔNG TRÚNG JACKPOT -> Cộng quà bình thường
                
                // Logic Mapping dựa trên ID hoặc Type của item
                switch (item.id) {
                    // Resources (Common)
                    case 'wood': updates.wood = (userData.wood || 0) + rewardAmount; break;
                    case 'cloth': updates.cloth = (userData.cloth || 0) + rewardAmount; break;
                    case 'ore': updates.ore = (userData.ore || 0) + rewardAmount; break;
                    case 'leather': updates.leather = (userData.leather || 0) + rewardAmount; break;
                    case 'feather': updates.feather = (userData.feather || 0) + rewardAmount; break;
                    case 'coal': updates.coal = (userData.coal || 0) + rewardAmount; break;

                    // Stones (Uncommon)
                    case 'stone_low': 
                        updates['equipment.stones.low'] = (userData.equipment?.stones?.low || 0) + rewardAmount; 
                        break;
                    case 'stone_medium': 
                        updates['equipment.stones.medium'] = (userData.equipment?.stones?.medium || 0) + rewardAmount; 
                        break;
                    case 'stone_high': 
                        updates['equipment.stones.high'] = (userData.equipment?.stones?.high || 0) + rewardAmount; 
                        break;

                    // Rare
                    case 'pickaxe': 
                        updates.pickaxes = (userData.pickaxes || 0) + rewardAmount; 
                        break;
                    
                    // Lưu ý: Case 'coins_pack' đã bị loại bỏ ở đây

                    // Epic
                    case 'equipment_piece': 
                        updates['equipment.pieces'] = (userData.equipment?.pieces || 0) + rewardAmount; 
                        break;
                    case 'ancient_book': 
                        updates.ancientBooks = (userData.ancientBooks || 0) + rewardAmount; 
                        break;
                }

                // Đóng góp vào quỹ Jackpot (ví dụ: 10% chi phí spin)
                const contribution = Math.floor(cost * 0.1); 
                t.update(JACKPOT_DOC_REF, { poolAmount: increment(contribution) });
            }

            // 4. Thực hiện Update User
            t.update(userRef, updates);

            return {
                success: true,
                newCoins: updates.coins, // Trả về số coin mới để UI update
                newJackpot: item.rarity === 'jackpot' ? 200 : currentJackpot + Math.floor(cost * 0.1),
                rewardGranted: true
            };
        });
    } catch (e: any) {
        console.error("Spin Transaction Error:", e);
        return { success: false, newCoins: 0, newJackpot: 0, rewardGranted: false, error: e.message };
    }
};
