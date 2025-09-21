// --- START OF FILE auction-service.ts ---

import { db } from '../../firebase';
import {
    doc, getDoc, setDoc, runTransaction,
    collection, query, where, orderBy, onSnapshot,
    Timestamp, serverTimestamp
} from 'firebase/firestore';
import type { OwnedItem } from '../../gameDataService.ts'; // Import types from the main service

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
 * @returns Promise<void>
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

    // Xóa vật phẩm khỏi túi đồ của người dùng
    const newOwnedItems = [...currentEquipment.owned];
    newOwnedItems.splice(itemIndex, 1);

    // Cập nhật dữ liệu người dùng
    t.update(userDocRef, {
      gems: (userData.gems || 0) - LISTING_FEE_GEMS,
      'equipment.owned': newOwnedItems,
    });

    // Tạo document đấu giá mới
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
 * @returns Promise<void>
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

    // Logic hoàn trả tiền cho người giữ giá trước (nếu có)
    if (auctionData.highestBidderId) {
      const previousBidderDocRef = doc(db, 'users', auctionData.highestBidderId);
      const prevBidderDoc = await t.get(previousBidderDocRef);
      if(prevBidderDoc.exists()) {
          const prevBidderData = prevBidderDoc.data();
          t.update(previousBidderDocRef, { coins: (prevBidderData.coins || 0) + auctionData.currentBid });
      }
    }

    // Trừ tiền người đấu giá mới
    t.update(userDocRef, { coins: (userData.coins || 0) - bidAmount });

    // Cập nhật phiên đấu giá
    t.update(auctionDocRef, {
      currentBid: bidAmount,
      highestBidderId: userId,
      highestBidderName: userName,
    });
  });
};

/**
 * Người thắng nhận vật phẩm sau khi đấu giá kết thúc.
 * @param userId - ID người nhận (phải là người thắng).
 * @param auctionId - ID phiên đấu giá.
 * @returns Promise<OwnedItem> Vật phẩm đã nhận.
 */
export const claimAuctionWin = async (userId: string, auctionId: string): Promise<OwnedItem> => {
  const auctionDocRef = doc(db, 'auctions', auctionId);
  let claimedItem: OwnedItem;

  await runTransaction(db, async (t) => {
    // --- PHASE 1: READ ALL NECESSARY DOCUMENTS FIRST ---
    const auctionDoc = await t.get(auctionDocRef);
    if (!auctionDoc.exists()) throw new Error("Phiên đấu giá không tồn tại.");

    const auctionData = auctionDoc.data() as Omit<AuctionItem, 'id'>;

    // We need both the seller and the winner (who is the current user)
    if (!auctionData.highestBidderId) throw new Error("Phiên đấu giá này không có người thắng.");
    
    const winnerDocRef = doc(db, 'users', auctionData.highestBidderId);
    const sellerDocRef = doc(db, 'users', auctionData.sellerId);

    const [winnerDoc, sellerDoc] = await Promise.all([
      t.get(winnerDocRef),
      t.get(sellerDocRef)
    ]);

    // --- PHASE 2: VALIDATE ALL DATA ---
    if (!winnerDoc.exists()) throw new Error("Winner user not found.");
    // sellerDoc existence is not critical to fail the transaction, but we should check it before updating.

    if (auctionData.highestBidderId !== userId) throw new Error("Bạn không phải người thắng phiên đấu giá này.");
    if (auctionData.status !== 'active') throw new Error("Vật phẩm đã được nhận hoặc đã hết hạn.");
    if (Timestamp.now().toMillis() < auctionData.endTime.toMillis()) throw new Error("Phiên đấu giá chưa kết thúc.");

    claimedItem = auctionData.item;
    const winnerData = winnerDoc.data();
    
    // --- PHASE 3: PERFORM ALL WRITES ---

    // 1. Add item to the winner's inventory
    const currentEquipment = winnerData.equipment || { owned: [] };
    const newOwnedItems = [...currentEquipment.owned, auctionData.item];
    t.update(winnerDocRef, { 'equipment.owned': newOwnedItems });

    // 2. Send coins to the seller (if the seller exists)
    if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data();
        t.update(sellerDocRef, { coins: (sellerData.coins || 0) + auctionData.currentBid });
    }

    // 3. Update the auction's status
    t.update(auctionDocRef, { status: 'claimed' });
  });

  if (!claimedItem) {
    throw new Error("Failed to claim item inside transaction.");
  }
  return claimedItem;
};


/**
 * Người bán nhận lại vật phẩm nếu không có ai đấu giá.
 * @param userId - ID người bán.
 * @param auctionId - ID phiên đấu giá.
 * @returns Promise<OwnedItem> Vật phẩm đã nhận lại.
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

        // Thêm vật phẩm lại vào túi người bán
        const currentEquipment = userData.equipment || { owned: [] };
        const newOwnedItems = [...currentEquipment.owned, auctionData.item];
        reclaimedItem = auctionData.item;

        t.update(userDocRef, { 'equipment.owned': newOwnedItems });

        // Cập nhật trạng thái phiên đấu giá
        t.update(auctionDocRef, { status: 'expired' });
    });

    if (!reclaimedItem) {
      throw new Error("Failed to reclaim item inside transaction.");
    }
    return reclaimedItem;
};
// --- END OF FILE auction-service.ts ---
