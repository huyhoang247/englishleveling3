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

// --- THÊM INTERFACE CHO QUẢNG CÁO (NEW) ---
export interface AdData {
    watchedToday: number;       // Số lượt đã xem trong ngày
    lastWatchedAt: Timestamp | null; // Thời điểm xem gần nhất
    nextAvailableAt: Timestamp | null; // Thời điểm được xem tiếp theo (quan trọng nhất)
    streakCount: number;        // Đếm số lượt xem liên tiếp (để tính block 60p)
}

export interface UserGameData {
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  
  // --- ENERGY FIELDS ---
  energy?: number; 
  lastEnergyUpdate?: Timestamp; 
  
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

  // --- TRƯỜNG ADS (NEW) ---
  ads: AdData;
}


/**
 * Lấy dữ liệu game của người dùng. Nếu chưa có, tạo mới với giá trị mặc định.
 * Cập nhật logic khởi tạo Energy timestamp và Ads Data.
 * @param userId - ID của người dùng.
 * @returns {Promise<UserGameData>} Dữ liệu game của người dùng.
 */
export const fetchOrCreateUserGameData = async (userId: string): Promise<UserGameData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  // Cấu trúc mặc định cho Ads (NEW)
  const defaultAds: AdData = {
      watchedToday: 0,
      lastWatchedAt: null,
      nextAvailableAt: null,
      streakCount: 0
  };

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

      // --- ADS DATA (NEW) ---
      ads: data.ads || defaultAds,

    } as UserGameData;
  } else {
    // Tạo user mới hoàn toàn
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      coins: 0, gems: 0, masteryCards: 0, pickaxes: 50,
      
      // --- INIT ENERGY & TIMESTAMP ---
      energy: 50,
      lastEnergyUpdate: Timestamp.now(),

      minerChallengeHighestFloor: 0, stats: { hp: 0, atk: 0, def: 0 },
      bossBattleHighestFloor: 0, ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0, cardCapacity: 100,
      
      // Initialize Resources
      wood: 0, leather: 0, ore: 0, cloth: 0, feather: 0, coal: 0,    

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
      vipLuckySpinClaims: 0,
      
      // --- INIT ADS ---
      ads: defaultAds,
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

// --- FUNCTION: ĐỒNG BỘ NĂNG LƯỢNG (OFFLINE CALCULATION) ---
export const syncEnergyWithServer = async (userId: string): Promise<{ currentEnergy: number, nextRefillIn: number }> => {
    const userDocRef = doc(db, 'users', userId);
    
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        let currentEnergy = typeof data.energy === 'number' ? data.energy : 50;
        const maxEnergy = 50;
        
        const lastUpdate = data.lastEnergyUpdate ? data.lastEnergyUpdate.toDate() : new Date();
        const now = new Date();

        if (currentEnergy >= maxEnergy) {
            if (currentEnergy > maxEnergy) {
                 t.update(userDocRef, { energy: maxEnergy });
                 return { currentEnergy: maxEnergy, nextRefillIn: 0 };
            }
            return { currentEnergy: maxEnergy, nextRefillIn: 0 };
        }

        const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
        const REGEN_INTERVAL = 300; 

        if (elapsedSeconds < REGEN_INTERVAL) {
             return { 
                 currentEnergy, 
                 nextRefillIn: REGEN_INTERVAL - elapsedSeconds 
             };
        }

        const energyGained = Math.floor(elapsedSeconds / REGEN_INTERVAL);
        let newEnergy = Math.min(maxEnergy, currentEnergy + energyGained);
        
        const remainingSecondsForNextPoint = elapsedSeconds % REGEN_INTERVAL;
        const newLastUpdateDate = new Date(now.getTime() - (remainingSecondsForNextPoint * 1000));
        
        t.update(userDocRef, {
            energy: newEnergy,
            lastEnergyUpdate: Timestamp.fromDate(newLastUpdateDate)
        });

        if (newEnergy >= maxEnergy) {
            return { currentEnergy: newEnergy, nextRefillIn: 0 };
        }

        return { 
            currentEnergy: newEnergy, 
            nextRefillIn: REGEN_INTERVAL - remainingSecondsForNextPoint 
        };
    });
};

// --- FUNCTION: CẬP NHẬT NĂNG LƯỢNG & RESET TIMER ---
export const updateUserEnergy = async (userId: string, newEnergy: number): Promise<void> => {
    if (!userId) return;
    const finalAmount = Math.max(0, Math.min(50, newEnergy));
    
    const userDocRef = doc(db, 'users', userId);
    
    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if(!userDoc.exists()) return;

        const currentDbEnergy = userDoc.data().energy ?? 50;
        const updates: any = { energy: finalAmount };

        if (currentDbEnergy >= 50 && finalAmount < 50) {
            updates.lastEnergyUpdate = serverTimestamp();
        }
        
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

// --- NEW FUNCTION: XỬ LÝ LOGIC XEM QUẢNG CÁO (COOLDOWN & LIMIT) ---
// Hàm này được gọi khi người dùng xem xong quảng cáo
export const registerAdWatch = async (userId: string): Promise<AdData> => {
    const userRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        const currentAds: AdData = data.ads || { 
            watchedToday: 0, 
            lastWatchedAt: null, 
            nextAvailableAt: null, 
            streakCount: 0 
        };

        const now = new Date();
        const nowTs = Timestamp.fromDate(now);

        // 1. KIỂM TRA QUA NGÀY: Reset nếu ngày hiện tại khác ngày lastWatchedAt
        let watchedToday = currentAds.watchedToday;
        let streakCount = currentAds.streakCount;
        
        if (currentAds.lastWatchedAt) {
            const lastDate = currentAds.lastWatchedAt.toDate();
            // So sánh ngày/tháng/năm để chắc chắn là ngày mới
            if (lastDate.toDateString() !== now.toDateString()) {
                watchedToday = 0;
                streakCount = 0;
            }
        }

        // 2. KIỂM TRA LIMIT NGÀY (Max 30)
        if (watchedToday >= 30) {
            throw new Error("Daily ad limit reached (30/30). Come back tomorrow!");
        }

        // 3. KIỂM TRA THỜI GIAN CHỜ (COOLDOWN)
        if (currentAds.nextAvailableAt && nowTs.toMillis() < currentAds.nextAvailableAt.toMillis()) {
            throw new Error("Please wait before watching another ad.");
        }

        // 4. TÍNH TOÁN LOGIC MỚI
        watchedToday += 1;
        streakCount += 1;
        
        let cooldownSeconds = 0;

        // RULE: Sau 5 lượt xem -> Block 60 phút
        if (streakCount >= 5) {
            cooldownSeconds = 60 * 60; // 3600s = 60 phút
            streakCount = 0; // Reset streak sau khi bị phạt
        } else {
            // RULE: Giữa các lượt thường -> Random 2-5 phút (120s - 300s)
            const min = 120;
            const max = 300;
            cooldownSeconds = Math.floor(Math.random() * (max - min + 1) + min);
        }

        const nextAvailableDate = new Date(now.getTime() + cooldownSeconds * 1000);

        const newAdsData: AdData = {
            watchedToday,
            streakCount,
            lastWatchedAt: nowTs,
            nextAvailableAt: Timestamp.fromDate(nextAvailableDate)
        };

        t.update(userRef, { ads: newAdsData });

        return newAdsData;
    });
};


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
    
    const updatedData = JSON.parse(JSON.stringify(data));
    for(const key in updatePayload){
        if (key.includes('.')) {
            const keys = key.split('.');
            let temp = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
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
