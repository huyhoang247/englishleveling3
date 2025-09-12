// --- START OF FILE voca-chest-service.tsgff.txt ---

import { db } from '../../firebase';
import { 
  doc, runTransaction, 
  collection, writeBatch
} from 'firebase/firestore';
// <<< THAY ĐỔI: Xóa import không còn sử dụng
// import { fetchOrCreateUserGameData } from '../../gameDataService.ts';

/**
 * <<< THAY ĐỔI: Xóa hoàn toàn hàm `fetchVocabularyScreenData`.
 * GameContext sẽ là nguồn cung cấp dữ liệu này.
 */

/**
 * Ghi lại các từ vựng mới được mở khóa vào subcollection 'openedVocab'.
 * @param userId - ID người dùng.
 * @param newWordsData - Mảng các từ mới và thông tin liên quan.
 */
const recordNewVocabUnlocks = async (userId: string, newWordsData: { id: number; word: string; chestType: string }[]) => {
    if (newWordsData.length === 0) return;
    const userOpenedVocabColRef = collection(db, 'users', userId, 'openedVocab');
    const batch = writeBatch(db);
    newWordsData.forEach(item => {
        const newVocabDocRef = doc(userOpenedVocabColRef, String(item.id));
        batch.set(newVocabDocRef, {
            word: item.word,
            collectedAt: new Date(),
            chestType: item.chestType,
        });
    });
    await batch.commit();
};

/**
 * Xử lý logic nghiệp vụ khi người dùng mở rương từ vựng.
 * Bao gồm việc trừ tiền, cộng gem, tăng số lượng từ, và ghi lại các từ đã mở.
 * Hàm này không trả về state mới nữa, vì onSnapshot trong GameContext sẽ tự động cập nhật.
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

    // <<< THAY ĐỔI: Giao dịch không cần trả về dữ liệu mới nữa
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

    await recordNewVocabUnlocks(userId, newWordsData);

    // Không cần return gì cả. onSnapshot sẽ lo phần còn lại.
};
