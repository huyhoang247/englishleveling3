// --- START OF FILE gameDataService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction 
} from 'firebase/firestore';

/**
 * Interface cho dữ liệu game đầy đủ của người dùng.
 */
export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number; };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: any[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  equipment: { pieces: number; owned: any[]; equipped: { weapon: null; armor: null; accessory: null } };
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
    // Tạo thêm các trường từ userDataService để đảm bảo document hoàn chỉnh
    const newUserData = {
      // Dữ liệu game
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
      
      // Dữ liệu người dùng chung
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
 * Cập nhật số coin của người dùng trên Firestore một cách an toàn bằng transaction.
 * Đảm bảo số coin không bao giờ bị âm.
 * @param userId - ID của người dùng.
 * @param amount - Số coin cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<number>} Số coin mới sau khi cập nhật.
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<number> => {
  if (!userId) {
     throw new Error("User ID is required for updating coins.");
  }
  if (amount === 0) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().coins || 0 : 0;
  }
  
  const userDocRef = doc(db, 'users', userId);
  try {
    const newAmount = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }
      const currentCoins = userDoc.data().coins || 0;
      const newCoins = Math.max(0, currentCoins + amount); // Đảm bảo không âm
      transaction.update(userDocRef, { coins: newCoins });
      return newCoins;
    });
    return newAmount;
  } catch (error) {
    console.error(`Failed to run transaction to update coins for user ${userId}:`, error);
    throw error;
  }
};


/**
 * Cập nhật số gem của người dùng trên Firestore một cách an toàn bằng transaction.
 * Đảm bảo số gem không bao giờ bị âm.
 * @param userId - ID của người dùng.
 * @param amount - Số gem cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<number>} Số gem mới sau khi cập nhật.
 */
export const updateUserGems = async (userId: string, amount: number): Promise<number> => {
  if (!userId) {
     throw new Error("User ID is required for updating gems.");
  }
  if (amount === 0) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().gems || 0 : 0;
  }

  const userDocRef = doc(db, 'users', userId);
  try {
    const newAmount = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }
      const currentGems = userDoc.data().gems || 0;
      const newGems = Math.max(0, currentGems + amount); // Đảm bảo không âm
      transaction.update(userDocRef, { gems: newGems });
      return newGems;
    });
    return newAmount;
  } catch (error) {
    console.error(`Failed to run transaction to update gems for user ${userId}:`, error);
    throw error;
  }
};
// --- END OF FILE gameDataService.ts ---
