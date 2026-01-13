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
 * Hàm này đảm bảo rằng các thay đổi về vàng, mảnh vỡ, vật phẩm và đá cường hoá
 * được áp dụng một cách an toàn và nhất quán.
 * 
 * @param userId - ID của người dùng.
 * @param updates - Object chứa các thay đổi cần áp dụng.
 * @returns {Promise<{ newCoins: number; newPieces: number; newStones: any }>} Trả về các giá trị mới sau khi cập nhật.
 */
export const updateUserInventory = async (
    userId: string, 
    updates: { 
        newOwned: OwnedItem[]; 
        newEquipped: EquippedItems; 
        goldChange: number; 
        piecesChange: number;
        // Các thay đổi về tài nguyên (nếu có, ví dụ Gỗ/Đá từ Thương hội)
        resourceChanges?: Record<string, number>; 
        // CẬP NHẬT: Thay đổi số lượng đá cường hoá (nếu có)
        stoneChanges?: { low?: number; medium?: number; high?: number }; 
    }
) => {
    const userDocRef = doc(db, 'users', userId);
    
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        
        const data = userDoc.data() as UserGameData;
        
        // Lấy dữ liệu Equipment hiện tại, xử lý trường hợp chưa có field stones
        const currentEquipment = data.equipment || { 
            pieces: 0, 
            owned: [], 
            equipped: { weapon: null, armor: null, Helmet: null },
            stones: { low: 0, medium: 0, high: 0 }
        };
        
        // Tính toán Vàng và Mảnh trang bị mới
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;

        // --- XỬ LÝ ĐÁ CƯỜNG HOÁ (STONES) ---
        // Lấy stones hiện tại, mặc định là 0 nếu không tồn tại
        const currentStones = currentEquipment.stones || { low: 0, medium: 0, high: 0 };
        
        // Tạo object stones mới để cập nhật
        const newStones = { 
            low: currentStones.low || 0,
            medium: currentStones.medium || 0,
            high: currentStones.high || 0
        };

        // Áp dụng thay đổi nếu có (stoneChanges)
        if (updates.stoneChanges) {
            if (updates.stoneChanges.low) newStones.low += updates.stoneChanges.low;
            if (updates.stoneChanges.medium) newStones.medium += updates.stoneChanges.medium;
            if (updates.stoneChanges.high) newStones.high += updates.stoneChanges.high;
        }

        // --- KIỂM TRA ĐIỀU KIỆN HỢP LỆ (VALIDATION) ---
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");
        if (newStones.low < 0 || newStones.medium < 0 || newStones.high < 0) {
            throw new Error("Không đủ Đá cường hoá.");
        }

        // --- CẬP NHẬT DỮ LIỆU ---
        
        // Cấu trúc update object cơ bản
        const updatePayload: any = {
            coins: newCoins,
            equipment: { 
                ...currentEquipment, 
                pieces: newPieces, 
                owned: updates.newOwned, 
                equipped: updates.newEquipped,
                stones: newStones // Lưu object stones mới
            }
        };

        // Nếu có thay đổi tài nguyên khác (cho tính năng Thương Hội cũ nếu còn dùng logic này tại đây)
        // Lưu ý: Nếu Thương Hội dùng logic khác thì phần này có thể bỏ qua hoặc giữ để tương thích.
        if (updates.resourceChanges) {
             // Logic xử lý resourceChanges (Gỗ, Da, v.v.) sẽ cần cập nhật vào các field tương ứng của user
             // Ví dụ: updatePayload['resources.wood'] = ...
             // Hiện tại code mẫu không có cấu trúc resources trong UserGameData nên ta bỏ qua hoặc 
             // bạn cần tự thêm logic map resourceChanges vào updatePayload nếu cấu trúc DB có.
        }

        t.update(userDocRef, updatePayload);

        return { newCoins, newPieces, newStones };
    });
};

// --- END OF FILE equipment-service.ts ---
