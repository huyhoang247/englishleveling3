// --- START OF FILE shop-service.ts ---

import { db } from './firebase';
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

export const processShopPurchase = async (userId: string, item: any, quantity: number) => {
    const userDocRef = doc(db, 'users', userId);
    
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
        }
        
        const data = userDoc.data();
        const currentCoins = data.coins || 0;
        const totalCost = item.price * quantity;

        if (currentCoins < totalCost) {
            throw new Error("Không đủ vàng.");
        }

        const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
        
        // Khởi tạo các giá trị trả về với dữ liệu hiện tại
        let newBooks = data.ancientBooks || 0;
        let newCapacity = data.cardCapacity || 100;
        let newPieces = data.equipment?.pieces || 0;
        let newPickaxes = data.pickaxes || 0;

        // Xử lý logic mua vật phẩm
        switch (item.id) {
            case 1009: // Ancient Book
                newBooks += quantity;
                updates.ancientBooks = newBooks;
                break;
            case 2001: // Card Capacity
                newCapacity += quantity;
                updates.cardCapacity = newCapacity;
                break;
            case 2002: // Equipment Piece
                newPieces += quantity;
                updates['equipment.pieces'] = newPieces; // Sử dụng dot notation cho trường lồng nhau
                break;
            case 2003: // Pickaxe
                newPickaxes += quantity;
                updates.pickaxes = newPickaxes;
                break;
            // Thêm các vật phẩm có thể cộng dồn khác tại đây
            default:
                // Đối với vũ khí, trang bị (không stackable), bạn sẽ cần logic khác
                // để thêm chúng vào mảng `equipment.owned`.
                // Hiện tại, mặc định chỉ trừ tiền.
                break;
        }
        
        t.update(userDocRef, updates);
        
        // Trả về tất cả các giá trị có thể đã được cập nhật
        return { 
            newCoins: updates.coins, 
            newBooks, 
            newCapacity,
            newPieces,
            newPickaxes
        };
    });
};

// --- END OF FILE shop-service.ts ---
