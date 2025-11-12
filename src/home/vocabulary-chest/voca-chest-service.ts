// --- START OF FILE voca-chest-service.ts ---

import { db } from '../../firebase';
import { 
  doc, runTransaction
  // <<< THAY ĐỔI: Xóa writeBatch và collection vì không ghi vào subcollection nữa
} from 'firebase/firestore';
// <<< THAY ĐỔI: Import localDB service của chúng ta
import { localDB } from '../../local-data/local-vocab-db.ts'; // <= CHỈNH LẠI ĐƯỜNG DẪN NẾU CẦN

/**
 * <<< GHI CHÚ: Hàm `fetchVocabularyScreenData` đã được xóa chính xác.
 */

/**
 * <<< THAY ĐỔI: Hàm này bây giờ sẽ ghi dữ liệu vào IndexedDB (thông qua Dexie)
 * Ghi lại các từ vựng mới được mở khóa vào local database.
 * @param userId - ID người dùng (vẫn giữ để có thể mở rộng sau này).
 * @param newWordsData - Mảng các từ mới và thông tin liên quan.
 */
const recordNewVocabUnlocks = async (userId: string, newWordsData: { id: number; word: string; chestType: string }[]) => {
    if (newWordsData.length === 0) return;
    
    // Chuẩn bị dữ liệu để ghi vào Dexie
    const wordsToSave = newWordsData.map(item => ({
        ...item,
        collectedAt: new Date(),
    }));

    // Gọi hàm từ service localDB để lưu
    await localDB.addBulkWords(wordsToSave);
};

/**
 * Xử lý logic nghiệp vụ khi người dùng mở rương từ vựng.
 * Bao gồm việc trừ tiền, cộng gem, tăng số lượng từ (trên Firestore), 
 * và ghi lại các từ đã mở (vào Local DB).
 * Hàm này không trả về state mới, vì onSnapshot trong GameContext sẽ tự động cập nhật.
 * @param userId - ID người dùng.
 * @param details - Chi tiết giao dịch (loại tiền, chi phí, thưởng gem, dữ liệu từ mới).
 * @returns {Promise<void>} Hoàn thành khi giao dịch thành công.
 */
export const processVocabularyChestOpening = async (
  userId: string, 
  details: {
    currency: 'gold' | 'gem'; 
    cost: number; 
    gemReward: number;
    newWordsData: { id: number; word: string; chestType: string }[];
  }
) => {
    const userDocRef = doc(db, 'users', userId);
    const { currency, cost, gemReward, newWordsData } = details;

    // Giao dịch trên Firestore để cập nhật tiền tệ và số lượng thẻ
    // <<< THAY ĐỔI: Logic này không thay đổi, nó vẫn cần thiết
    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();

        if (currency === 'gold' && (data.coins || 0) < cost) throw new Error("Không đủ vàng.");
        if (currency === 'gem' && (data.gems || 0) < cost) throw new Error("Không đủ gem.");
        if ((data.totalVocabCollected || 0) + newWordsData.length > (data.cardCapacity || 100)) {
            throw new Error("Kho thẻ đã đầy.");
        }
        
        const finalCoins = (data.coins || 0) - (currency === 'gold' ? cost : 0);
        const finalGems = (data.gems || 0) - (currency === 'gem' ? cost : 0) + gemReward;
        const finalTotalVocab = (data.totalVocabCollected || 0) + newWordsData.length;

        t.update(userDocRef, {
            coins: finalCoins,
            gems: finalGems,
            totalVocabCollected: finalTotalVocab,
        });
    });

    // Ghi các từ vừa mở vào Local DB thay vì Firestore
    await recordNewVocabUnlocks(userId, newWordsData);

    // Không cần return gì cả. onSnapshot sẽ lo phần còn lại.
};
