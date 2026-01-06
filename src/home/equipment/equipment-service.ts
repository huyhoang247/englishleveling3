// --- START OF FILE: equipment-service.ts ---

import { db } from '../../firebase';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import type { OwnedItem, EquippedItems } from './equipment-ui.tsx';

/**
 * Interface cho dữ liệu Stones trong Firestore
 */
interface EnhancementStones {
    basic: number;
    intermediate: number;
    advanced: number;
}

/**
 * Cập nhật túi đồ và trang bị của người dùng trong một transaction chung.
 * Sử dụng cho các thao tác: Mặc đồ, Tháo đồ, Chế tạo (Craft), Phân rã (Dismantle).
 */
export const updateUserInventory = async (
    userId: string, 
    updates: { 
        newOwned: OwnedItem[]; 
        newEquipped: EquippedItems; 
        goldChange: number; 
        piecesChange: number; 
    }
) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("Tài liệu người dùng không tồn tại!");
        
        const data = userDoc.data();
        const currentEquipment = data.equipment || { 
            pieces: 0, 
            owned: [], 
            equipped: { weapon: null, armor: null, Helmet: null } 
        };
        
        // Tính toán các giá trị tài nguyên mới
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;

        // Ràng buộc bảo vệ: Không cho phép giá trị âm
        if (newCoins < 0) throw new Error("Bạn không có đủ Vàng để thực hiện thao tác này.");
        if (newPieces < 0) throw new Error("Bạn không có đủ Mảnh trang bị.");

        // Ghi dữ liệu mới vào Firestore
        transaction.update(userDocRef, {
            coins: newCoins,
            equipment: { 
                ...currentEquipment, 
                pieces: newPieces, 
                owned: updates.newOwned, 
                equipped: updates.newEquipped 
            }
        });

        return { newCoins, newPieces };
    });
};

/**
 * TRANSACTION: Cường hoá trang bị bằng Đá Cường Hoá.
 * Thao tác này sẽ trừ đá của người dùng và tính toán thành công/thất bại tại server.
 * 
 * @param userId - ID của người dùng
 * @param ownedItemId - ID duy nhất của trang bị (id trong mảng owned, không phải itemId)
 * @param stoneType - Loại đá sử dụng ('basic', 'intermediate', 'advanced')
 * @param successRate - Tỉ lệ thành công tính bằng % (0 - 100)
 */
export const upgradeWithStoneTransaction = async (
    userId: string, 
    ownedItemId: string, 
    stoneType: 'basic' | 'intermediate' | 'advanced',
    successRate: number
) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("Người dùng không tồn tại!");

        const userData = userDoc.data();
        
        // 1. Kiểm tra tài nguyên đá trong inventory
        // Cấu trúc mặc định nếu chưa có: inventory: { stones: { basic: 0, intermediate: 0, advanced: 0 } }
        const stones = userData.inventory?.stones as EnhancementStones || { basic: 0, intermediate: 0, advanced: 0 };

        if (stones[stoneType] <= 0) {
            throw new Error(`Bạn đã hết Đá Cường Hoá loại ${stoneType.toUpperCase()}.`);
        }

        // 2. Thực hiện "Roll" tỉ lệ thành công
        const roll = Math.random() * 100;
        const isSuccess = roll <= successRate;

        // 3. Xử lý danh sách trang bị hiện có
        const equipment = userData.equipment || { owned: [] };
        const ownedItems = (equipment.owned as OwnedItem[]) || [];
        
        let itemFound = false;
        const updatedOwnedItems = ownedItems.map((item) => {
            if (item.id === ownedItemId) {
                itemFound = true;
                
                // Nếu thành công thì tăng Level và Stats
                if (isSuccess) {
                    const newLevel = item.level + 1;
                    const newStats = { ...item.stats };

                    // Tự động tăng các chỉ số hiện có (hp, atk, def...) thêm 3% đến 6% ngẫu nhiên
                    Object.keys(newStats).forEach(statKey => {
                        if (typeof newStats[statKey] === 'number') {
                            const multiplier = 1 + (0.03 + Math.random() * 0.03); // Tăng 3% - 6%
                            newStats[statKey] = Math.round(newStats[statKey] * multiplier);
                        }
                    });

                    return {
                        ...item,
                        level: newLevel,
                        stats: newStats
                    };
                }
                // Nếu thất bại thì giữ nguyên item (nhưng vẫn mất đá bên dưới)
            }
            return item;
        });

        if (!itemFound) {
            throw new Error("Không tìm thấy trang bị này trong kho đồ.");
        }

        // 4. Trừ 1 viên đá cường hoá (Bất kể thành công hay thất bại)
        const updatedStones = {
            ...stones,
            [stoneType]: stones[stoneType] - 1
        };

        // 5. Cập nhật đồng bộ dữ liệu vào Firestore
        transaction.update(userDocRef, {
            'inventory.stones': updatedStones,
            'equipment.owned': updatedOwnedItems
        });

        // Trả về kết quả để UI hiển thị hiệu ứng tương ứng
        return { 
            success: isSuccess, 
            newLevel: isSuccess ? (updatedOwnedItems.find(i => i.id === ownedItemId)?.level || 0) : ownedItems.find(i => i.id === ownedItemId)?.level
        };
    });
};

// --- END OF FILE: equipment-service.ts ---
