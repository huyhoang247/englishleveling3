// --- START OF FILE gameDataService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch,
  query, where, orderBy, onSnapshot, Timestamp, serverTimestamp, addDoc,
  updateDoc, increment, Unsubscribe 
} from 'firebase/firestore';

// Các interface này nên được định nghĩa ở một nơi tập trung (ví dụ: types.ts) và import vào
// Tuy nhiên, để file này tự chứa, tôi sẽ định nghĩa chúng ở đây.
export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';
export interface OwnedSkill { id: string; skillId: string; level: number; rarity: Rarity; }

export interface OwnedItem {
    id: string;
    itemId: number;
    level: number;
    stats: { [key: string]: any };
}
export type EquipmentSlotType = 'weapon' | 'armor' | 'Helmet';
export type EquippedItems = {
    [key in EquipmentSlotType]: string | null;
};

export interface UserGameData {
  name: string;
  title: string;
  accountType: 'Normal' | 'Premium';
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
  lastCheckIn?: Timestamp;
  loginStreak?: number;
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
    // Đảm bảo dữ liệu skills có cấu trúc đúng
    const skillsData = data.skills || { owned: [], equipped: [null, null, null] };
    if (!Array.isArray(skillsData.equipped) || skillsData.equipped.length !== 3) {
      skillsData.equipped = [null, null, null];
    }

    const defaultEquipment = { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };
    const equipmentData = { ...defaultEquipment, ...(data.equipment || {}) };

    return {
      name: data.name || 'CyberWarrior',
      title: data.title || 'Lv. 42 - Elite Vanguard',
      accountType: data.accountType || 'Normal',
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats: data.stats || { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: skillsData,
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 1000, // Tăng giá trị mặc định cho hợp lý
      equipment: equipmentData,
      lastCheckIn: data.lastCheckIn || null,
      loginStreak: data.loginStreak || 0,
    };
  } else {
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      name: 'CyberWarrior',
      title: 'Lv. 42 - Elite Vanguard',
      accountType: 'Normal',
      coins: 0, gems: 250, masteryCards: 420, pickaxes: 50,
      minerChallengeHighestFloor: 0, stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0, ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0, cardCapacity: 1000,
      equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } },
      lastCheckIn: null,
      loginStreak: 0,
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUserData);
    return newUserData as UserGameData;
  }
};

/**
 * Cập nhật thông tin hồ sơ cơ bản của người dùng.
 * @param userId - ID của người dùng.
 * @param profileData - Dữ liệu cần cập nhật (name, title).
 */
export const updateUserProfileInfo = async (userId: string, profileData: { name?: string; title?: string; }): Promise<void> => {
    if (!userId) throw new Error("User ID is required.");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, profileData);
};

/**
 * Nâng cấp tài khoản người dùng lên Premium bằng cách sử dụng transaction.
 * @param userId - ID của người dùng.
 * @param cost - Chi phí nâng cấp (gems).
 * @returns {Promise<UserGameData>} Dữ liệu người dùng đã được cập nhật.
 */
export const upgradeUserToPremium = async (userId: string, cost: number): Promise<UserGameData> => {
    if (!userId) throw new Error("User ID is required.");
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const data = userDoc.data() as UserGameData;
        const currentGems = data.gems || 0;

        if (currentGems < cost) {
            throw new Error("Not enough gems to upgrade.");
        }

        const updatedData = {
            ...data,
            gems: currentGems - cost,
            accountType: 'Premium' as const,
        };
        
        t.update(userDocRef, {
            gems: updatedData.gems,
            accountType: updatedData.accountType,
        });

        return updatedData;
    });
};


/**
 * Lấy dữ liệu cần thiết cho màn hình Kỹ năng.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình kỹ năng.
 */
export const fetchSkillScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    ancientBooks: gameData.ancientBooks,
    skills: gameData.skills, // Gồm { owned, equipped }
  };
};


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

export const fetchJackpotPool = async (): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    const docSnap = await getDoc(jackpotDocRef);
    if (docSnap.exists()) return docSnap.data().poolAmount || 200;
    await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
    return 200;
};

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

export const updateUserBossFloor = async (userId: string, newFloor: number, currentHighest: number): Promise<void> => {
    if (newFloor <= currentHighest) return;
    await setDoc(doc(db, 'users', userId), { bossBattleHighestFloor: newFloor }, { merge: true });
};

export const updateUserPickaxes = async (userId: string, newTotal: number): Promise<number> => {
    const finalAmount = Math.max(0, newTotal);
    await setDoc(doc(db, 'users', userId), { pickaxes: finalAmount }, { merge: true });
    return finalAmount;
};


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

// --- ADDITIONS START: SLOT MACHINE (777) GAME SERVICES ---

const slotJackpotDocRef = doc(db, 'miniGames', 'slotMachineJackpots');

const initializeSlotJackpots = async (initialPools: { [key: number]: number }) => {
    try {
        await setDoc(slotJackpotDocRef, initialPools);
        console.log("Slot machine jackpot pools initialized successfully.");
    } catch (error) {
        console.error("Error initializing slot machine jackpot pools: ", error);
    }
};

export const listenToJackpotPools = (
    callback: (pools: { [key: number]: number }) => void,
    initialPools: { [key: number]: number }
): Unsubscribe => {
    const unsubscribe = onSnapshot(slotJackpotDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as { [key: number]: number });
        } else {
            console.log("Slot machine jackpot document not found, initializing...");
            await initializeSlotJackpots(initialPools);
            callback(initialPools);
        }
    }, (error) => {
        console.error("Error listening to slot machine jackpot pools: ", error);
    });

    return unsubscribe;
};

export const contributeToJackpot = async (roomId: number, contribution: number) => {
    if (contribution <= 0) return;
    try {
        await updateDoc(slotJackpotDocRef, {
            [`${roomId}`]: increment(contribution)
        });
    } catch (error) {
        console.error(`Error contributing to slot machine jackpot for room ${roomId}: `, error);
    }
};

export const resetJackpot = async (roomId: number, initialValue: number) => {
     try {
        await updateDoc(slotJackpotDocRef, {
            [`${roomId}`]: initialValue
        });
    } catch (error)
 {
        console.error(`Error resetting slot machine jackpot for room ${roomId}: `, error);
    }
};
// --- ADDITIONS END ---


// --- START: ADMIN PANEL SERVICE FUNCTIONS ---
export interface SimpleUser {
  uid: string;
  email?: string;
  username?: string;
}

export const fetchAllUsers = async (): Promise<SimpleUser[]> => {
  const usersCollectionRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersCollectionRef);
  const users: SimpleUser[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({ 
        uid: doc.id,
        email: data.email,
        username: data.username
    });
  });
  return users;
};

export const adminUpdateUserData = async (userId: string, updates: { [key: string]: number }): Promise<UserGameData> => {
  if (!userId) throw new Error("User ID is required.");
  if (Object.keys(updates).length === 0) throw new Error("No updates provided.");

  const userDocRef = doc(db, 'users', userId);

  return runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    if (!userDoc.exists()) throw new Error("User document does not exist!");
    
    const data = userDoc.data() as UserGameData;
    const updatePayload: { [key: string]: any } = {};

    for (const key in updates) {
      const valueToAdd = updates[key];
      if (key.includes('.')) {
        const keys = key.split('.');
        let currentLevel = data as any;
        for (let i = 0; i < keys.length - 1; i++) {
          currentLevel = currentLevel[keys[i]] || {};
        }
        const finalKey = keys[keys.length - 1];
        const currentValue = currentLevel[finalKey] || 0;
        updatePayload[key] = Math.max(0, currentValue + valueToAdd);
      } else {
        const currentValue = (data as any)[key] || 0;
        updatePayload[key] = Math.max(0, currentValue + valueToAdd);
      }
    }
    
    t.update(userDocRef, updatePayload);
    
    const updatedData = JSON.parse(JSON.stringify(data));
    for(const key in updatePayload){
        if (key.includes('.')) {
            const keys = key.split('.');
            let temp = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = updatePayload[key];
        } else {
            (updatedData as any)[key] = updatePayload[key];
        }
    }
    return updatedData as UserGameData;
  });
};
// --- END: ADMIN PANEL SERVICE FUNCTIONS ---

// --- END OF FILE gameDataService.ts ---
