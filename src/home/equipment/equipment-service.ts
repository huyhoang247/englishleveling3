// --- START OF FILE equipment-service.ts ---

import { db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { UserGameData } from '../../gameDataService.ts'; // Chỉ import type
// Import type từ file định nghĩa tập trung (equipment-ui.tsx) để tránh lặp lại
import type { OwnedItem, EquippedItems } from './equipment-ui.tsx'; 

// GHI CHÚ: Hàm fetchEquipmentScreenData đã bị xóa.
// Việc lấy dữ liệu ban đầu giờ đây được quản lý tập trung bởi GameContext.
// Service này chỉ còn chịu trách nhiệm cho các thao tác GHI (write) dữ liệu,
// chẳng hạn như các transaction phức tạp để đảm bảo tính toàn vẹn dữ liệu.


/**
 * Cập nhật túi đồ và trang bị của người dùng trong một transaction.
 * Hàm này đảm bảo rằng các thay đổi về vàng, mảnh vỡ và vật phẩm
 * được áp dụng một cách an toàn và nhất quán.
 * @param userId - ID của người dùng.
 * @param updates - Object chứa các thay đổi về túi đồ, trang bị, vàng và mảnh vỡ.
 * @returns {Promise<{ newCoins: number; newPieces: number; }>} Số vàng và mảnh trang bị mới.
 */
export const updateUserInventory = async (userId: string, updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        
        const data = userDoc.data() as UserGameData;
        const currentEquipment = data.equipment || { pieces: 0, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };
        
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;

        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");

        // --- THAY ĐỔI QUAN TRỌNG ---
        // Bỏ dòng "...currentEquipment," để đảm bảo chỉ ghi dữ liệu mới nhất,
        // tránh việc vô tình giữ lại các trường cũ hoặc dữ liệu không nhất quán.
        // Đây là nguyên nhân gốc rễ của lỗi.
        t.update(userDocRef, {
            coins: newCoins,
            equipment: { 
                pieces: newPieces, 
                owned: updates.newOwned, 
                equipped: updates.newEquipped 
            }
        });

        return { newCoins, newPieces };
    });
};

// --- END OF FILE equipment-service.ts ---
