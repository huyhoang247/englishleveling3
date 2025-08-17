// --- START OF FILE gameDataService.ts (FULL CODE - REFACTORED) ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch
} from 'firebase/firestore';

// Các interface này nên được định nghĩa ở một nơi tập trung (ví dụ: types.ts) và import vào
// Tuy nhiên, để file này tự chứa, tôi sẽ định nghĩa chúng ở đây.
export interface OwnedSkill { id: string; skillId: string; level: number; }
export interface OwnedItem { id: string; itemId: string; stats: { hp: number; atk: number; def: number; }; }
export interface EquippedItems { weapon: OwnedItem | null; armor: OwnedItem | null; accessory: OwnedItem | null; }

export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number; };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: OwnedSkill[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  equipment: { pieces: number; owned: OwnedItem[]; equipped: EquippedItems };
}

export interface VocabularyItem { 
  id: number; 
  word: string; 
  exp: number; 
  level: number; 
  maxExp: number; 
}


/**
 * Lấy dữ liệu game của người dùng. Nếu chưa có, tạo mới với giá trị mặc định.
 * @param userId - ID của người dùng.
 * @returns {Promise<UserGameData>} Dữ liệu game của người dùng.
 */
export const fetchOrCreateUserGameData = async (userId: string): Promise<UserGameData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Trả về dữ liệu, đảm bảo có giá trị mặc định cho các trường có thể thiếu
    return {
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats: data.stats || { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: data.skills || { owned: [], equipped: [null, null, null] },
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 100,
      equipment: data.equipment || { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
    };
  } else {
    // Người dùng không tồn tại, tạo mới document với dữ liệu game mặc định
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      coins: 0,
      gems: 0,
      masteryCards: 0,
      pickaxes: 50,
      minerChallengeHighestFloor: 0,
      stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0,
      ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0,
      cardCapacity: 100,
      equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, accessory: null } },
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUserData);
    return newUserData;
  }
};

/**
 * Cập nhật số coin của người dùng an toàn bằng transaction.
 * @param userId - ID của người dùng.
 * @param amount - Số coin cần thay đổi (dương để cộng, âm để trừ).
 * @returns {Promise<number>} Số coin mới.
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<number> => {
  if (!userId) throw new Error("User ID is required.");
  if (amount === 0) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().coins || 0 : 0;
  }
  const userDocRef = doc(db, 'users', userId);
  return runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    if (!userDoc.exists()) throw new Error("User document does not exist!");
    const newCoins = Math.max(0, (userDoc.data().coins || 0) + amount);
    t.update(userDocRef, { coins: newCoins });
    return newCoins;
  });
};

/**
 * Cập nhật số gem của người dùng an toàn bằng transaction.
 * @param userId - ID của người dùng.
 * @param amount - Số gem cần thay đổi.
 * @returns {Promise<number>} Số gem mới.
 */
export const updateUserGems = async (userId: string, amount: number): Promise<number> => {
    if (!userId) throw new Error("User ID is required.");
    if (amount === 0) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data().gems || 0 : 0;
    }
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const newGems = Math.max(0, (userDoc.data().gems || 0) + amount);
        t.update(userDocRef, { gems: newGems });
        return newGems;
    });
};

/**
 * Lấy hoặc tạo dữ liệu Jackpot Pool chung của ứng dụng.
 * @returns {Promise<number>} Số tiền trong hũ Jackpot.
 */
export const fetchJackpotPool = async (): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    const docSnap = await getDoc(jackpotDocRef);
    if (docSnap.exists()) return docSnap.data().poolAmount || 200;
    await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
    return 200;
};

/**
 * Cập nhật Jackpot Pool bằng transaction.
 * @param amount - Số tiền cần thêm vào (dương) hoặc bớt đi (âm).
 * @param reset - Nếu true, đặt lại hũ về 200.
 * @returns {Promise<number>} Số tiền mới trong hũ.
 */
export const updateJackpotPool = async (amount: number, reset: boolean = false): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    return runTransaction(db, async (t) => {
        const docSnap = await t.get(jackpotDocRef);
        const currentPool = docSnap.exists() ? docSnap.data().poolAmount || 200 : 200;
        const newPool = reset ? 200 : currentPool + amount;
        t.set(jackpotDocRef, { poolAmount: newPool, lastUpdated: new Date() }, { merge: true });
        return newPool;
    });
};

/**
 * Cập nhật tầng boss cao nhất của người dùng.
 * @param userId - ID người dùng.
 * @param newFloor - Tầng mới đã hoàn thành.
 * @param currentHighest - Tầng cao nhất hiện tại của người chơi (để tránh ghi không cần thiết).
 */
export const updateUserBossFloor = async (userId: string, newFloor: number, currentHighest: number): Promise<void> => {
    if (newFloor <= currentHighest) return;
    await setDoc(doc(db, 'users', userId), { bossBattleHighestFloor: newFloor }, { merge: true });
};

/**
 * Cập nhật Cuốc (Pickaxes).
 * @param userId - ID người dùng.
 * @param newTotal - Tổng số cuốc mới.
 * @returns {Promise<number>} Số cuốc mới.
 */
export const updateUserPickaxes = async (userId: string, newTotal: number): Promise<number> => {
    const finalAmount = Math.max(0, newTotal);
    await setDoc(doc(db, 'users', userId), { pickaxes: finalAmount }, { merge: true });
    return finalAmount;
};

/**
 * Xử lý kết quả sau khi kết thúc Miner Challenge.
 * @param userId - ID người dùng.
 * @param result - Dữ liệu kết quả từ game.
 * @returns Dữ liệu mới sau khi cập nhật.
 */
export const processMinerChallengeResult = async (userId: string, result: { finalPickaxes: number; coinsEarned: number; highestFloorCompleted: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + result.coinsEarned;
        const newHighestFloor = Math.max(data.minerChallengeHighestFloor || 0, result.highestFloorCompleted);
        t.update(userDocRef, { coins: newCoins, pickaxes: result.finalPickaxes, minerChallengeHighestFloor: newHighestFloor });
        return { newCoins, newPickaxes: result.finalPickaxes, newHighestFloor };
    });
};

/**
 * Xử lý việc nâng cấp chỉ số cho người dùng.
 * @param userId - ID người dùng.
 * @param cost - Chi phí nâng cấp.
 * @param newStats - Các chỉ số mới.
 * @returns Dữ liệu mới sau khi nâng cấp.
 */
export const upgradeUserStats = async (userId: string, cost: number, newStats: { hp: number; atk: number; def: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < cost) throw new Error("Không đủ vàng trên server.");
        const newCoins = currentCoins - cost;
        t.update(userDocRef, { coins: newCoins, stats: newStats });
        return { newCoins, newStats };
    });
};

/**
 * Xử lý cập nhật kỹ năng cho người dùng.
 * @param userId - ID người dùng.
 * @param updates - Các thay đổi về kỹ năng và tài nguyên.
 * @returns Dữ liệu tài nguyên mới.
 */
export const updateUserSkills = async (userId: string, updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newBooks = (data.ancientBooks || 0) + updates.booksChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newBooks < 0) throw new Error("Không đủ Sách Cổ.");
        t.update(userDocRef, {
            coins: newCoins,
            ancientBooks: newBooks,
            skills: { owned: updates.newOwned, equipped: updates.newEquippedIds }
        });
        return { newCoins, newBooks };
    });
};

/**
 * Xử lý cập nhật trang bị cho người dùng.
 * @param userId - ID người dùng.
 * @param updates - Các thay đổi về trang bị và tài nguyên.
 * @returns Dữ liệu tài nguyên mới.
 */
export const updateUserInventory = async (userId: string, updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const currentEquipment = data.equipment || { pieces: 0, owned: [], equipped: { weapon: null, armor: null, accessory: null } };
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");
        t.update(userDocRef, {
            coins: newCoins,
            equipment: { ...currentEquipment, pieces: newPieces, owned: updates.newOwned, equipped: updates.newEquipped }
        });
        return { newCoins, newPieces };
    });
};

/**
 * Xử lý logic mua sắm.
 * @param userId - ID người dùng.
 * @param item - Vật phẩm cần mua.
 * @param quantity - Số lượng.
 * @returns Dữ liệu tài nguyên mới sau khi mua.
 */
export const processShopPurchase = async (userId: string, item: any, quantity: number) => {
    const userDocRef = doc(db, 'users', userId);
    const totalCost = item.price * quantity;
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data();
        const currentCoins = data.coins || 0;
        if (currentCoins < totalCost) throw new Error("Không đủ vàng.");
        
        const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
        let newBooks = data.ancientBooks || 0;
        let newCapacity = data.cardCapacity || 100;

        if (item.id === 1009) { // Sách Cổ
            newBooks += quantity;
            updates.ancientBooks = newBooks;
        } else if (item.id === 2001) { // Nâng Cấp Sức Chứa Thẻ
            newCapacity += quantity;
            updates.cardCapacity = newCapacity;
        }
        
        t.update(userDocRef, updates);
        return { newCoins: updates.coins, newBooks, newCapacity };
    });
};

/**
 * Ghi nhận các từ vựng mới người dùng đã mở vào sub-collection bằng Batch Write.
 * @param userId - ID người dùng.
 * @param newWordsData - Mảng các từ mới.
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
 * Xử lý toàn bộ logic mở rương từ vựng trong một transaction duy nhất.
 * @param userId - ID người dùng.
 * @param details - Chi tiết về việc mở rương.
 * @returns Dữ liệu tài nguyên mới sau khi giao dịch thành công.
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

        // Kiểm tra điều kiện trên server một lần nữa
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

    // Sau khi transaction thành công, ghi log các thẻ đã mở
    await recordNewVocabUnlocks(userId, newWordsData);

    return { newCoins, newGems, newTotalVocab };
};
