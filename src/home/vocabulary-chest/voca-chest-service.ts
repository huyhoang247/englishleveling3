
import { db } from '../../firebase';
import { 
  doc, runTransaction, 
  collection, writeBatch
} from 'firebase/firestore';
import { fetchOrCreateUserGameData } from '../../gameDataService.ts'; // Import dependency

/**
 * Lấy dữ liệu cần thiết cho màn hình Lật Thẻ Từ Vựng.
 * @param userId - ID của người dùng.
 * @returns {Promise<{coins: number, gems: number, totalVocab: number, capacity: number}>} Dữ liệu cần thiết.
 */
export const fetchVocabularyScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    gems: gameData.gems,
    totalVocab: gameData.totalVocabCollected,
    capacity: gameData.cardCapacity,
  };
};

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
 * @param userId - ID người dùng.
 * @param details - Chi tiết giao dịch (loại tiền, chi phí, thưởng gem, dữ liệu từ mới).
 * @returns {Promise<{newCoins: number, newGems: number, newTotalVocab: number}>} Trạng thái tài nguyên mới của người dùng.
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

    const { newCoins, newGems, newTotalVocab } = await runTransaction(db, async (t) => {
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
        return { newCoins: finalCoins, newGems: finalGems, newTotalVocab: finalTotalVocab };
    });

    await recordNewVocabUnlocks(userId, newWordsData);

    return { newCoins, newGems, newTotalVocab };
};
