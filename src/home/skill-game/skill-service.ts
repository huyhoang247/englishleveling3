// --- START OF FILE src/home/skill-game/skill-service.ts ---

import { db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { OwnedSkill } from '../../gameDataService.ts'; // Giả sử OwnedSkill được export từ đây hoặc từ một file types chung

/**
 * Cập nhật dữ liệu kỹ năng của người dùng trong một transaction.
 * Hàm này xử lý việc thay đổi danh sách kỹ năng, vàng, và sách cổ trên Firestore.
 * @param userId - ID của người dùng.
 * @param updates - Một object chứa các thay đổi cần áp dụng.
 * @returns Promise chứa số vàng và sách mới sau khi cập nhật thành công.
 */
export const updateUserSkills = async (
  userId: string,
  updates: {
    newOwned: OwnedSkill[];
    newEquippedIds: (string | null)[];
    goldChange: number;
    booksChange: number;
  }
): Promise<{ newCoins: number; newBooks: number; }> => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
        }

        const data = userDoc.data();
        
        // Tính toán giá trị mới của tiền tệ
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newBooks = (data.ancientBooks || 0) + updates.booksChange;

        // Kiểm tra điều kiện (server-side validation)
        if (newCoins < 0) {
            throw new Error("Không đủ vàng.");
        }
        if (newBooks < 0) {
            throw new Error("Không đủ Sách Cổ.");
        }
        
        // Thực hiện cập nhật trong transaction
        transaction.update(userDocRef, {
            coins: newCoins,
            ancientBooks: newBooks,
            skills: { 
                owned: updates.newOwned, 
                equipped: updates.newEquippedIds 
            }
        });

        // Trả về dữ liệu mới để cập nhật state ở client
        return { newCoins, newBooks };
    });
};

// --- END OF FILE src/home/skill-game/skill-service.ts ---
