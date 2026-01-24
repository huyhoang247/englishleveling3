// --- START OF FILE gameDataService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch,
  query, where, orderBy, onSnapshot, Timestamp, serverTimestamp, addDoc,
  updateDoc, increment, Unsubscribe 
} from 'firebase/firestore';

// --- ĐỊNH NGHĨA TYPES ---

export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';

export interface OwnedSkill { 
    id: string; 
    skillId: string; 
    level: number; 
    rarity: Rarity; 
}

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

// Định nghĩa Stones (Đá cường hoá)
export interface EnhancementStones {
    low: number;
    medium: number;
    high: number;
}

export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  
  // --- ENERGY FIELDS (UPDATED) ---
  energy?: number; 
  lastEnergyUpdate?: Timestamp; // Thời điểm cuối cùng năng lượng thay đổi hoặc được tính toán
  
  minerChallengeHighestFloor: number;
  stats: { hp: number; atk: number; def: number; };
  bossBattleHighestFloor: number;
  ancientBooks: number;
  skills: { owned: OwnedSkill[]; equipped: (string | null)[] };
  totalVocabCollected: number;
  cardCapacity: number;
  
  // --- RESOURCES ---
  wood?: number;
  leather?: number;
  ore?: number;
  cloth?: number;
  feather?: number;
  coal?: number;

  // Equipment including Stones
  equipment: { 
      pieces: number; 
      owned: OwnedItem[]; 
      equipped: EquippedItems; 
      stones: EnhancementStones; 
  };
  lastCheckIn?: Timestamp;
  loginStreak?: number;
  
  // Các trường cho VIP
  accountType?: string; 
  vipExpiresAt?: Timestamp | null;
  vipLuckySpinClaims?: number;
}


/**
 * Lấy dữ liệu game của người dùng. Nếu chưa có, tạo mới với giá trị mặc định.
 * Cập nhật logic khởi tạo Energy timestamp.
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

    // Cấu trúc mặc định cho Equipment và Stones
    const defaultEquipment = { 
        pieces: 100, 
        owned: [], 
        equipped: { weapon: null, armor: null, Helmet: null },
        stones: { low: 0, medium: 0, high: 0 } 
    };
    
    // Merge dữ liệu cũ với default
    const equipmentData = { 
        ...defaultEquipment, 
        ...(data.equipment || {}),
        stones: { ...defaultEquipment.stones, ...(data.equipment?.stones || {}) }
    };

    return {
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      
      // --- ENERGY LOGIC ---
      energy: typeof data.energy === 'number' ? data.energy : 50,
      // Nếu user cũ chưa có field này, gán tạm là hiện tại để bắt đầu tính từ bây giờ
      lastEnergyUpdate: data.lastEnergyUpdate || Timestamp.now(),

      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats: data.stats || { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: skillsData,
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 100,
      
      // Load Resources (Default 0 if undefined)
      wood: data.wood || 0,
      leather: data.leather || 0,
      ore: data.ore || 0,
      cloth: data.cloth || 0,
      feather: data.feather || 0, 
      coal: data.coal || 0,      

      equipment: equipmentData, 
      lastCheckIn: data.lastCheckIn || null,
      loginStreak: data.loginStreak || 0,
      accountType: data.accountType || 'Normal',
      vipExpiresAt: data.vipExpiresAt || null,
      vipLuckySpinClaims: data.vipLuckySpinClaims || 0,
    } as UserGameData;
  } else {
    // Tạo user mới hoàn toàn
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      coins: 0, gems: 0, masteryCards: 0, pickaxes: 50,
      
      // --- INIT ENERGY & TIMESTAMP ---
      energy: 50,
      lastEnergyUpdate: Timestamp.now(), // Đánh dấu thời điểm tạo

      minerChallengeHighestFloor: 0, stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0, ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0, cardCapacity: 100,
      
      // Initialize Resources
      wood: 0,
      leather: 0,
      ore: 0,
      cloth: 0,
      feather: 0, 
      coal: 0,    

      equipment: { 
          pieces: 100, 
          owned: [], 
          equipped: { weapon: null, armor: null, Helmet: null },
          stones: { low: 0, medium: 0, high: 0 } 
      },
      lastCheckIn: null,
      loginStreak: 0,
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {},
      accountType: 'Normal',
      vipExpiresAt: null,
      vipLuckySpinClaims: 0
    };
    await setDoc(userDocRef, newUserData);
    return newUserData;
  }
};


/**
 * Lấy dữ liệu cần thiết cho màn hình Kỹ năng.
 */
export const fetchSkillScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    coins: gameData.coins,
    ancientBooks: gameData.ancientBooks,
    skills: gameData.skills, 
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

// --- NEW FUNCTION: ĐỒNG BỘ NĂNG LƯỢNG (OFFLINE CALCULATION) ---
// Hàm này tính toán số năng lượng đã hồi phục dựa trên thời gian offline
// Gọi hàm này khi khởi động App hoặc khi cần đồng bộ chính xác
export const syncEnergyWithServer = async (userId: string): Promise<{ currentEnergy: number, nextRefillIn: number }> => {
    const userDocRef = doc(db, 'users', userId);
    
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        let currentEnergy = typeof data.energy === 'number' ? data.energy : 50;
        const maxEnergy = 50;
        
        // Lấy thời điểm update cuối, nếu không có thì lấy hiện tại
        const lastUpdate = data.lastEnergyUpdate ? data.lastEnergyUpdate.toDate() : new Date();
        const now = new Date();

        // 1. Nếu năng lượng đã đầy, không cần tính toán, reset timer về 0
        if (currentEnergy >= maxEnergy) {
            // Nếu DB chưa chuẩn (ví dụ > 50), ta cap lại về 50 cho sạch
            if (currentEnergy > maxEnergy) {
                 t.update(userDocRef, { energy: maxEnergy });
                 return { currentEnergy: maxEnergy, nextRefillIn: 0 };
            }
            return { currentEnergy: maxEnergy, nextRefillIn: 0 };
        }

        // 2. Tính số giây trôi qua
        const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
        const REGEN_INTERVAL = 300; // 5 phút = 300 giây

        // 3. Nếu chưa đủ 5 phút
        if (elapsedSeconds < REGEN_INTERVAL) {
             return { 
                 currentEnergy, 
                 nextRefillIn: REGEN_INTERVAL - elapsedSeconds 
             };
        }

        // 4. Nếu đủ thời gian hồi ít nhất 1 điểm
        const energyGained = Math.floor(elapsedSeconds / REGEN_INTERVAL);
        let newEnergy = Math.min(maxEnergy, currentEnergy + energyGained);
        
        // Tính toán lại timestamp để giữ lại phần dư thời gian (progress cho điểm tiếp theo)
        // Ví dụ: Trôi qua 350s -> Hồi 1 điểm (300s), dư 50s.
        // Timestamp mới phải lùi lại 50s so với hiện tại để điểm tiếp theo chỉ cần chờ 250s nữa.
        const remainingSecondsForNextPoint = elapsedSeconds % REGEN_INTERVAL;
        const newLastUpdateDate = new Date(now.getTime() - (remainingSecondsForNextPoint * 1000));
        
        // Cập nhật DB
        t.update(userDocRef, {
            energy: newEnergy,
            lastEnergyUpdate: Timestamp.fromDate(newLastUpdateDate)
        });

        // Nếu sau khi hồi mà đầy bình, thời gian chờ là 0
        if (newEnergy >= maxEnergy) {
            return { currentEnergy: newEnergy, nextRefillIn: 0 };
        }

        return { 
            currentEnergy: newEnergy, 
            nextRefillIn: REGEN_INTERVAL - remainingSecondsForNextPoint 
        };
    });
};

// --- UPDATED FUNCTION: CẬP NHẬT NĂNG LƯỢNG & RESET TIMER ---
// Hàm này được gọi khi tiêu hao năng lượng (đánh boss, sweep...)
export const updateUserEnergy = async (userId: string, newEnergy: number): Promise<void> => {
    if (!userId) return;
    // Giới hạn max energy là 50, min là 0
    const finalAmount = Math.max(0, Math.min(50, newEnergy));
    
    const userDocRef = doc(db, 'users', userId);
    
    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if(!userDoc.exists()) return;

        const currentDbEnergy = userDoc.data().energy ?? 50;
        
        const updates: any = { energy: finalAmount };

        // QUAN TRỌNG: Logic Reset Timer
        // Chỉ reset timestamp bắt đầu đếm giờ hồi phục KHI:
        // Năng lượng hiện tại đang Đầy (>=50) VÀ Năng lượng mới < 50.
        // Nếu năng lượng đang là 40, đánh boss còn 30 -> KHÔNG reset timestamp, để nó tiếp tục hồi điểm đang dở.
        if (currentDbEnergy >= 50 && finalAmount < 50) {
            updates.lastEnergyUpdate = serverTimestamp();
        }
        
        // Nếu trường hợp mua năng lượng hoặc hồi đầy (newEnergy >= 50), cũng update timestamp cho gọn
        if (finalAmount >= 50) {
            updates.lastEnergyUpdate = serverTimestamp();
        }

        t.update(userDocRef, updates);
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

// Tham chiếu đến document lưu trữ tất cả jackpot pools của game 777
const slotJackpotDocRef = doc(db, 'miniGames', 'slotMachineJackpots');

// Hàm để khởi tạo jackpot nếu document chưa tồn tại
const initializeSlotJackpots = async (initialPools: { [key: number]: number }) => {
    try {
        await setDoc(slotJackpotDocRef, initialPools);
        console.log("Slot machine jackpot pools initialized successfully.");
    } catch (error) {
        console.error("Error initializing slot machine jackpot pools: ", error);
    }
};

/**
 * Lắng nghe sự thay đổi của jackpot pools trong real-time.
 */
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

/**
 * Đóng góp vào jackpot pool của một phòng cụ thể trong game Slot Machine.
 */
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

/**
 * Reset jackpot của một phòng về giá trị ban đầu sau khi có người thắng.
 */
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

/**
 * Lấy danh sách ID, email và username của tất cả người dùng.
 */
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

/**
 * Cập nhật nhiều trường dữ liệu của người dùng cùng lúc cho mục đích quản trị.
 */
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
    
    // Tạo object trả về đã được cập nhật (để UI phản hồi ngay lập tức)
    const updatedData = JSON.parse(JSON.stringify(data));
    for(const key in updatePayload){
        if (key.includes('.')) {
            const keys = key.split('.');
            let temp = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                // Tạo object nếu chưa tồn tại trong cấu trúc local
                if (!temp[keys[i]]) temp[keys[i]] = {}; 
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
