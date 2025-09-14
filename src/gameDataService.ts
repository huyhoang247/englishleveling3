// --- START OF FILE gameDataService.ts (FULL & COMPLETE) ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch,
  query, where, orderBy, onSnapshot, Timestamp, serverTimestamp, addDoc
} from 'firebase/firestore';
import { sendWelcomeMail } from './mailService.ts'; // Import để gửi mail chào mừng

// --- INTERFACES & TYPE DEFINITIONS ---
// Các interface này nên được định nghĩa ở một nơi tập trung (ví dụ: types.ts) và import vào
// Tuy nhiên, để file này tự chứa, chúng sẽ được định nghĩa ở đây.

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
  // Cho phép truy cập động bằng key string, hữu ích cho các hàm cập nhật chung
  [key: string]: any; 
  coins: number;
  gems: number;
  masteryCards: number;
  pickaxes: number;
  minerChallengeHighestFloor: number;
  stats_level: { hp: number; atk: number; def: number; }; // Khớp với GameContext
  stats_value: { hp: number; atk: number; def: number; }; // Khớp với GameContext
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
    // Đảm bảo dữ liệu skills và equipment có cấu trúc đúng
    const skillsData = data.skills || { owned: [], equipped: [null, null, null] };
    if (!Array.isArray(skillsData.equipped) || skillsData.equipped.length !== 3) {
      skillsData.equipped = [null, null, null];
    }
    const defaultEquipment = { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };
    const equipmentData = { ...defaultEquipment, ...(data.equipment || {}) };

    return {
      coins: data.coins || 0,
      gems: data.gems || 0,
      masteryCards: data.masteryCards || 0,
      pickaxes: typeof data.pickaxes === 'number' ? data.pickaxes : 50,
      minerChallengeHighestFloor: data.minerChallengeHighestFloor || 0,
      stats_level: data.stats_level || { hp: 0, atk: 0, def: 0 },
      stats_value: data.stats_value || { hp: 100, atk: 10, def: 5 }, // Thêm giá trị cơ bản nếu chưa có
      bossBattleHighestFloor: data.bossBattleHighestFloor || 0,
      ancientBooks: data.ancientBooks || 0,
      skills: skillsData,
      totalVocabCollected: data.totalVocabCollected || 0,
      cardCapacity: data.cardCapacity || 100,
      equipment: equipmentData,
      lastCheckIn: data.lastCheckIn || null,
      loginStreak: data.loginStreak || 0,
    };
  } else {
    console.log(`Creating new user document for ${userId}...`);
    const newUserData: UserGameData & { createdAt: Date; claimedDailyGoals: object; claimedVocabMilestones: any[], claimedQuizRewards: object; } = {
      coins: 0, gems: 0, masteryCards: 0, pickaxes: 50,
      minerChallengeHighestFloor: 0, 
      stats_level: { hp: 0, atk: 0, def: 0 },
      stats_value: { hp: 100, atk: 10, def: 5 }, // Chỉ số khởi đầu
      bossBattleHighestFloor: 0, ancientBooks: 0,
      skills: { owned: [], equipped: [null, null, null] },
      totalVocabCollected: 0, cardCapacity: 100, // Sức chứa thẻ ban đầu
      equipment: { pieces: 100, owned: [], equipped: { weapon: null, armor: null, Helmet: null } },
      lastCheckIn: null,
      loginStreak: 0,
      createdAt: new Date(),
      claimedDailyGoals: {},
      claimedVocabMilestones: [],
      claimedQuizRewards: {}
    };
    await setDoc(userDocRef, newUserData);
    
    // Gửi mail chào mừng sau khi tạo tài liệu người dùng
    try {
        await sendWelcomeMail(userId);
        console.log(`Welcome mail sent to ${userId}.`);
    } catch (error) {
        console.error("Failed to send welcome mail:", error);
    }
    
    return newUserData;
  }
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

/**
 * Cập nhật số Vàng của người dùng.
 * @param userId - ID của người dùng.
 * @param amount - Số lượng cần thay đổi (có thể âm).
 * @returns Số Vàng mới.
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
 * Cập nhật số Gems của người dùng.
 * @param userId - ID của người dùng.
 * @param amount - Số lượng cần thay đổi (có thể âm).
 * @returns Số Gems mới.
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
 * Lấy giá trị Jackpot Pool hiện tại.
 * @returns Giá trị pool.
 */
export const fetchJackpotPool = async (): Promise<number> => {
    const jackpotDocRef = doc(db, 'appData', 'jackpotPoolData');
    const docSnap = await getDoc(jackpotDocRef);
    if (docSnap.exists()) return docSnap.data().poolAmount || 200;
    await setDoc(jackpotDocRef, { poolAmount: 200, lastUpdated: new Date() });
    return 200;
};

/**
 * Cập nhật giá trị Jackpot Pool.
 * @param amount - Số tiền cần thêm vào pool.
 * @param reset - Nếu true, đặt lại pool về giá trị ban đầu.
 * @returns Giá trị pool mới.
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
 * Cập nhật tầng Boss cao nhất người dùng đã vượt qua.
 * @param userId - ID người dùng.
 * @param newFloor - Tầng mới đạt được.
 * @param currentHighest - Tầng cao nhất hiện tại.
 */
export const updateUserBossFloor = async (userId: string, newFloor: number, currentHighest: number): Promise<void> => {
    if (newFloor <= currentHighest) return;
    await setDoc(doc(db, 'users', userId), { bossBattleHighestFloor: newFloor }, { merge: true });
};

/**
 * Cập nhật số cuốc của người dùng.
 * @param userId - ID người dùng.
 * @param newTotal - Tổng số cuốc mới.
 * @returns Số cuốc cuối cùng.
 */
export const updateUserPickaxes = async (userId: string, newTotal: number): Promise<number> => {
    const finalAmount = Math.max(0, newTotal);
    await setDoc(doc(db, 'users', userId), { pickaxes: finalAmount }, { merge: true });
    return finalAmount;
};

/**
 * Cập nhật trạng thái kỹ năng của người dùng (kỹ năng sở hữu, trang bị, vàng và sách cổ).
 * @param userId - ID người dùng.
 * @param updates - Object chứa các thay đổi.
 * @returns Vàng và Sách cổ mới.
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


// --- AUCTION HOUSE SERVICE FUNCTIONS ---

export interface AuctionItem {
  id: string; // Document ID from Firestore
  item: OwnedItem;
  sellerId: string;
  sellerName: string;
  startingBid: number;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  buyoutPrice: number | null;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'active' | 'sold' | 'expired' | 'claimed';
}

/**
 * Lắng nghe các phiên đấu giá đang hoạt động theo thời gian thực.
 * @param callback - Hàm sẽ được gọi mỗi khi có dữ liệu mới.
 * @returns Unsubscribe function.
 */
export const listenToActiveAuctions = (callback: (auctions: AuctionItem[]) => void) => {
  const q = query(
    collection(db, 'auctions'), 
    where('status', '==', 'active'),
    orderBy('endTime', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const activeAuctions: AuctionItem[] = [];
    querySnapshot.forEach((doc) => {
      activeAuctions.push({ id: doc.id, ...doc.data() } as AuctionItem);
    });
    callback(activeAuctions);
  });
};

/**
 * Lắng nghe các phiên đấu giá của riêng người dùng (đăng bán và đang đấu giá).
 * @param userId - ID của người dùng.
 * @param callback - Hàm callback với danh sách các phiên đấu giá liên quan.
 * @returns Unsubscribe function.
 */
export const listenToUserAuctions = (userId: string, callback: (auctions: AuctionItem[]) => void) => {
    const sellerQuery = query(collection(db, 'auctions'), where('sellerId', '==', userId));
    const bidderQuery = query(collection(db, 'auctions'), where('highestBidderId', '==', userId));

    const allUserAuctions: Map<string, AuctionItem> = new Map();
    let initialSellerLoad = true;
    let initialBidderLoad = true;

    const updateAndCallback = () => {
        callback(Array.from(allUserAuctions.values()).sort((a,b) => b.endTime.toMillis() - a.endTime.toMillis()));
    };

    const sellerUnsub = onSnapshot(sellerQuery, (snapshot) => {
        snapshot.docs.forEach(doc => allUserAuctions.set(doc.id, { id: doc.id, ...doc.data() } as AuctionItem));
        if (initialSellerLoad && initialBidderLoad) {
          // Wait for both initial loads before the first callback
        } else {
          updateAndCallback();
        }
        initialSellerLoad = false;
    });
    
    const bidderUnsub = onSnapshot(bidderQuery, (snapshot) => {
        snapshot.docs.forEach(doc => allUserAuctions.set(doc.id, { id: doc.id, ...doc.data() } as AuctionItem));
        initialBidderLoad = false;
        // This will be called after seller's initial load, ensuring a complete first picture.
        updateAndCallback();
    });
    
    return () => {
        sellerUnsub();
        bidderUnsub();
    };
};


/**
 * Đăng bán một vật phẩm lên Sàn Đấu Giá.
 * @param userId - ID người bán.
 * @param userName - Tên người bán.
 * @param itemToList - Vật phẩm `OwnedItem` cần bán.
 * @param startingBid - Giá khởi điểm.
 * @param buyoutPrice - Giá mua ngay (có thể null).
 * @param durationHours - Thời gian đấu giá (giờ).
 */
export const listAuctionItem = async (
  userId: string, 
  userName: string,
  itemToList: OwnedItem, 
  startingBid: number, 
  buyoutPrice: number | null, 
  durationHours: number
) => {
  const LISTING_FEE_GEMS = 1;
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found.");

    const userData = userDoc.data();
    if ((userData.gems || 0) < LISTING_FEE_GEMS) throw new Error("Không đủ Gems để đăng bán.");
    
    const currentEquipment = userData.equipment || { owned: [] };
    const itemIndex = currentEquipment.owned.findIndex((i: OwnedItem) => i.id === itemToList.id);
    if (itemIndex === -1) throw new Error("Vật phẩm không còn trong túi đồ.");

    const newOwnedItems = [...currentEquipment.owned];
    newOwnedItems.splice(itemIndex, 1);
    
    t.update(userDocRef, {
      gems: (userData.gems || 0) - LISTING_FEE_GEMS,
      'equipment.owned': newOwnedItems,
    });
    
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + durationHours);

    const newAuctionRef = doc(collection(db, 'auctions'));
    t.set(newAuctionRef, {
      item: itemToList,
      sellerId: userId,
      sellerName: userName,
      startingBid: startingBid,
      currentBid: startingBid,
      highestBidderId: null,
      highestBidderName: null,
      buyoutPrice,
      startTime: serverTimestamp(),
      endTime: Timestamp.fromDate(endTime),
      status: 'active',
    });
  });
};

/**
 * Đặt giá cho một vật phẩm.
 * @param userId - ID người đấu giá.
 * @param userName - Tên người đấu giá.
 * @param auctionId - ID của phiên đấu giá.
 * @param bidAmount - Số vàng muốn đặt.
 */
export const placeBidOnAuction = async (
  userId: string, 
  userName: string, 
  auctionId: string, 
  bidAmount: number
) => {
  const userDocRef = doc(db, 'users', userId);
  const auctionDocRef = doc(db, 'auctions', auctionId);

  await runTransaction(db, async (t) => {
    const [userDoc, auctionDoc] = await Promise.all([t.get(userDocRef), t.get(auctionDocRef)]);
    
    if (!userDoc.exists()) throw new Error("User not found.");
    if (!auctionDoc.exists()) throw new Error("Phiên đấu giá không tồn tại.");

    const userData = userDoc.data();
    const auctionData = auctionDoc.data() as Omit<AuctionItem, 'id'>;

    if (auctionData.sellerId === userId) throw new Error("Bạn không thể đấu giá vật phẩm của chính mình.");
    if (auctionData.status !== 'active') throw new Error("Phiên đấu giá đã kết thúc.");
    if (Timestamp.now().toMillis() > auctionData.endTime.toMillis()) throw new Error("Phiên đấu giá đã hết hạn.");
    if (bidAmount <= auctionData.currentBid) throw new Error("Giá đặt phải cao hơn giá hiện tại.");
    if ((userData.coins || 0) < bidAmount) throw new Error("Không đủ vàng để đặt giá.");

    if (auctionData.highestBidderId) {
      const previousBidderDocRef = doc(db, 'users', auctionData.highestBidderId);
      const prevBidderDoc = await t.get(previousBidderDocRef);
      if(prevBidderDoc.exists()) {
          const prevBidderData = prevBidderDoc.data();
          t.update(previousBidderDocRef, { coins: (prevBidderData.coins || 0) + auctionData.currentBid });
      }
    }

    t.update(userDocRef, { coins: (userData.coins || 0) - bidAmount });

    t.update(auctionDocRef, {
      currentBid: bidAmount,
      highestBidderId: userId,
      highestBidderName: userName,
    });
  });
};

/**
 * Người thắng nhận vật phẩm sau khi đấu giá kết thúc.
 * @param userId - ID người nhận.
 * @param auctionId - ID phiên đấu giá.
 * @returns Vật phẩm đã nhận.
 */
export const claimAuctionWin = async (userId: string, auctionId: string): Promise<OwnedItem> => {
  const userDocRef = doc(db, 'users', userId);
  const auctionDocRef = doc(db, 'auctions', auctionId);
  let claimedItem: OwnedItem;

  await runTransaction(db, async (t) => {
    const [userDoc, auctionDoc] = await Promise.all([t.get(userDocRef), t.get(auctionDocRef)]);

    if (!userDoc.exists()) throw new Error("User not found.");
    if (!auctionDoc.exists()) throw new Error("Phiên đấu giá không tồn tại.");
    
    const userData = userDoc.data();
    const auctionData = auctionDoc.data() as Omit<AuctionItem, 'id'>;

    if (auctionData.highestBidderId !== userId) throw new Error("Bạn không phải người thắng phiên đấu giá này.");
    if (auctionData.status !== 'sold') throw new Error("Vật phẩm đã được nhận hoặc trạng thái không hợp lệ.");
    if (Timestamp.now().toMillis() < auctionData.endTime.toMillis()) throw new Error("Phiên đấu giá chưa kết thúc.");

    const currentEquipment = userData.equipment || { owned: [] };
    const newOwnedItems = [...currentEquipment.owned, auctionData.item];
    claimedItem = auctionData.item;

    t.update(userDocRef, { 'equipment.owned': newOwnedItems });
    
    const sellerDocRef = doc(db, 'users', auctionData.sellerId);
    const sellerDoc = await t.get(sellerDocRef);
    if(sellerDoc.exists()){
        const sellerData = sellerDoc.data();
        t.update(sellerDocRef, { coins: (sellerData.coins || 0) + auctionData.currentBid });
    }

    t.update(auctionDocRef, { status: 'claimed' });
  });

  return claimedItem!;
};

/**
 * Người bán nhận lại vật phẩm nếu không có ai đấu giá.
 * @param userId - ID người bán.
 * @param auctionId - ID phiên đấu giá.
 * @returns Vật phẩm đã nhận lại.
 */
export const reclaimExpiredAuction = async (userId: string, auctionId: string): Promise<OwnedItem> => {
    const userDocRef = doc(db, 'users', userId);
    const auctionDocRef = doc(db, 'auctions', auctionId);
    let reclaimedItem: OwnedItem;

    await runTransaction(db, async (t) => {
        const [userDoc, auctionDoc] = await Promise.all([t.get(userDocRef), t.get(auctionDocRef)]);

        if (!userDoc.exists()) throw new Error("User not found.");
        if (!auctionDoc.exists()) throw new Error("Phiên đấu giá không tồn tại.");
        
        const userData = userDoc.data();
        const auctionData = auctionDoc.data() as Omit<AuctionItem, 'id'>;

        if (auctionData.sellerId !== userId) throw new Error("Bạn không phải người bán vật phẩm này.");
        if (auctionData.highestBidderId !== null) throw new Error("Vật phẩm đã có người đấu giá.");
        if (auctionData.status !== 'active') throw new Error("Vật phẩm không thể nhận lại.");
        if (Timestamp.now().toMillis() < auctionData.endTime.toMillis()) throw new Error("Phiên đấu giá chưa kết thúc.");

        const currentEquipment = userData.equipment || { owned: [] };
        const newOwnedItems = [...currentEquipment.owned, auctionData.item];
        reclaimedItem = auctionData.item;
        
        t.update(userDocRef, { 'equipment.owned': newOwnedItems });
        
        t.update(auctionDocRef, { status: 'expired' });
    });

    return reclaimedItem!;
};


// --- ADMIN PANEL SERVICE FUNCTIONS ---
export interface SimpleUser {
  uid: string;
  email?: string;
  username?: string;
}

/**
 * Lấy danh sách ID, email và username của tất cả người dùng.
 * @returns Một mảng các object người dùng.
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
 * @param userId - ID của người dùng cần cập nhật.
 * @param updates - Object chứa các trường và giá trị cần thay đổi (giá trị là số lượng cộng thêm/trừ đi).
 * @returns Dữ liệu mới nhất của người dùng sau khi cập nhật.
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
    
    const updatedData = JSON.parse(JSON.stringify(data)); // Deep copy
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
// --- END OF FILE gameDataService.ts ---
